/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _, { uniqBy } from 'lodash';
import { i18n } from '@kbn/i18n';
import { EUI_MODAL_CANCEL_BUTTON, EuiCheckboxGroup } from '@elastic/eui';
import { EuiCheckboxGroupIdToSelectedMap } from '@elastic/eui/src/components/form/checkbox/checkbox_group';
import React, { useState, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import angular from 'angular';
import deepEqual from 'fast-deep-equal';

import { Observable, pipe, Subscription, merge, EMPTY } from 'rxjs';
import {
  filter,
  map,
  debounceTime,
  mapTo,
  startWith,
  switchMap,
  distinctUntilChanged,
  catchError,
} from 'rxjs/operators';
import { History } from 'history';
import { SavedObjectSaveOpts } from 'src/plugins/saved_objects/public';
import { NavigationPublicPluginStart as NavigationStart } from 'src/plugins/navigation/public';
import { DashboardEmptyScreen, DashboardEmptyScreenProps } from './dashboard_empty_screen';

import {
  connectToQueryState,
  esFilters,
  IndexPattern,
  IndexPatternsContract,
  QueryState,
  SavedQuery,
  syncQueryStateWithUrl,
} from '../../../data/public';
import { getSavedObjectFinder, SaveResult, showSaveModal } from '../../../saved_objects/public';

import {
  DASHBOARD_CONTAINER_TYPE,
  DashboardContainer,
  DashboardContainerInput,
  DashboardPanelState,
} from './embeddable';
import {
  EmbeddableFactoryNotFoundError,
  ErrorEmbeddable,
  isErrorEmbeddable,
  openAddPanelFlyout,
  ViewMode,
  ContainerOutput,
  EmbeddableInput,
} from '../../../embeddable/public';
import { NavAction, SavedDashboardPanel } from '../types';

import { showOptionsPopover } from './top_nav/show_options_popover';
import { DashboardSaveModal } from './top_nav/save_modal';
import { showCloneModal } from './top_nav/show_clone_modal';
import { saveDashboard } from './lib';
import { DashboardStateManager } from './dashboard_state_manager';
import { createDashboardEditUrl, DashboardConstants } from '../dashboard_constants';
import { getTopNavConfig } from './top_nav/get_top_nav_config';
import { TopNavIds } from './top_nav/top_nav_ids';
import { getDashboardTitle } from './dashboard_strings';
import { DashboardAppScope } from './dashboard_app';
import { convertSavedDashboardPanelToPanelState } from './lib/embeddable_saved_object_converters';
import { RenderDeps } from './application';
import { IKbnUrlStateStorage, unhashUrl } from '../../../kibana_utils/public';
import {
  addFatalError,
  AngularHttpError,
  KibanaLegacyStart,
  subscribeWithScope,
} from '../../../kibana_legacy/public';
import { migrateLegacyQuery } from './lib/migrate_legacy_query';

export interface DashboardAppControllerDependencies extends RenderDeps {
  $scope: DashboardAppScope;
  $route: any;
  $routeParams: any;
  indexPatterns: IndexPatternsContract;
  dashboardConfig: KibanaLegacyStart['dashboardConfig'];
  history: History;
  kbnUrlStateStorage: IKbnUrlStateStorage;
  navigation: NavigationStart;
}

enum UrlParams {
  SHOW_TOP_MENU = 'show-top-menu',
  SHOW_QUERY_INPUT = 'show-query-input',
  SHOW_TIME_FILTER = 'show-time-filter',
  SHOW_FILTER_BAR = 'show-filter-bar',
  HIDE_FILTER_BAR = 'hide-filter-bar',
}

interface UrlParamsSelectedMap {
  [UrlParams.SHOW_TOP_MENU]: boolean;
  [UrlParams.SHOW_QUERY_INPUT]: boolean;
  [UrlParams.SHOW_TIME_FILTER]: boolean;
  [UrlParams.SHOW_FILTER_BAR]: boolean;
}

interface UrlParamValues extends Omit<UrlParamsSelectedMap, UrlParams.SHOW_FILTER_BAR> {
  [UrlParams.HIDE_FILTER_BAR]: boolean;
}

export class DashboardAppController {
  // Part of the exposed plugin API - do not remove without careful consideration.
  appStatus: {
    dirty: boolean;
  };

  constructor({
    pluginInitializerContext,
    $scope,
    $route,
    $routeParams,
    dashboardConfig,
    indexPatterns,
    savedQueryService,
    embeddable,
    share,
    dashboardCapabilities,
    scopedHistory,
    embeddableCapabilities: { visualizeCapabilities, mapsCapabilities },
    data: { query: queryService },
    core: {
      notifications,
      overlays,
      chrome,
      injectedMetadata,
      fatalErrors,
      uiSettings,
      savedObjects,
      http,
      i18n: i18nStart,
    },
    history,
    setHeaderActionMenu,
    kbnUrlStateStorage,
    usageCollection,
    navigation,
  }: DashboardAppControllerDependencies) {
    const filterManager = queryService.filterManager;
    const timefilter = queryService.timefilter.timefilter;
    const queryStringManager = queryService.queryString;
    const isEmbeddedExternally = Boolean($routeParams.embed);

    // url param rules should only apply when embedded (e.g. url?embed=true)
    const shouldForceDisplay = (param: string): boolean =>
      isEmbeddedExternally && Boolean($routeParams[param]);

    const forceShowTopNavMenu = shouldForceDisplay(UrlParams.SHOW_TOP_MENU);
    const forceShowQueryInput = shouldForceDisplay(UrlParams.SHOW_QUERY_INPUT);
    const forceShowDatePicker = shouldForceDisplay(UrlParams.SHOW_TIME_FILTER);
    const forceHideFilterBar = shouldForceDisplay(UrlParams.HIDE_FILTER_BAR);

    let lastReloadRequestTime = 0;
    const dash = ($scope.dash = $route.current.locals.dash);
    if (dash.id) {
      chrome.docTitle.change(dash.title);
    }

    let incomingEmbeddable = embeddable
      .getStateTransfer(scopedHistory())
      .getIncomingEmbeddablePackage();

    const dashboardStateManager = new DashboardStateManager({
      savedDashboard: dash,
      hideWriteControls: dashboardConfig.getHideWriteControls(),
      kibanaVersion: pluginInitializerContext.env.packageInfo.version,
      kbnUrlStateStorage,
      history,
      usageCollection,
    });

    // sync initial app filters from state to filterManager
    // if there is an existing similar global filter, then leave it as global
    filterManager.setAppFilters(_.cloneDeep(dashboardStateManager.appState.filters));
    queryStringManager.setQuery(migrateLegacyQuery(dashboardStateManager.appState.query));

    // setup syncing of app filters between appState and filterManager
    const stopSyncingAppFilters = connectToQueryState(
      queryService,
      {
        set: ({ filters, query }) => {
          dashboardStateManager.setFilters(filters || []);
          dashboardStateManager.setQuery(query || queryStringManager.getDefaultQuery());
        },
        get: () => ({
          filters: dashboardStateManager.appState.filters,
          query: dashboardStateManager.getQuery(),
        }),
        state$: dashboardStateManager.appState$.pipe(
          map((state) => ({
            filters: state.filters,
            query: queryStringManager.formatQuery(state.query),
          }))
        ),
      },
      {
        filters: esFilters.FilterStateStore.APP_STATE,
        query: true,
      }
    );

    // The hash check is so we only update the time filter on dashboard open, not during
    // normal cross app navigation.
    if (dashboardStateManager.getIsTimeSavedWithDashboard()) {
      const initialGlobalStateInUrl = kbnUrlStateStorage.get<QueryState>('_g');
      if (!initialGlobalStateInUrl?.time) {
        dashboardStateManager.syncTimefilterWithDashboardTime(timefilter);
      }
      if (!initialGlobalStateInUrl?.refreshInterval) {
        dashboardStateManager.syncTimefilterWithDashboardRefreshInterval(timefilter);
      }
    }

    // starts syncing `_g` portion of url with query services
    // it is important to start this syncing after `dashboardStateManager.syncTimefilterWithDashboard(timefilter);` above is run,
    // otherwise it will case redundant browser history records
    const { stop: stopSyncingQueryServiceStateWithUrl } = syncQueryStateWithUrl(
      queryService,
      kbnUrlStateStorage
    );

    // starts syncing `_a` portion of url
    dashboardStateManager.startStateSyncing();

    $scope.showSaveQuery = dashboardCapabilities.saveQuery as boolean;

    const getShouldShowEditHelp = () =>
      !dashboardStateManager.getPanels().length &&
      dashboardStateManager.getIsEditMode() &&
      !dashboardConfig.getHideWriteControls();

    const getShouldShowViewHelp = () =>
      !dashboardStateManager.getPanels().length &&
      dashboardStateManager.getIsViewMode() &&
      !dashboardConfig.getHideWriteControls();

    const shouldShowUnauthorizedEmptyState = () => {
      const readonlyMode =
        !dashboardStateManager.getPanels().length &&
        !getShouldShowEditHelp() &&
        !getShouldShowViewHelp() &&
        dashboardConfig.getHideWriteControls();
      const userHasNoPermissions =
        !dashboardStateManager.getPanels().length &&
        !visualizeCapabilities.save &&
        !mapsCapabilities.save;
      return readonlyMode || userHasNoPermissions;
    };

    const addVisualization = () => {
      navActions[TopNavIds.VISUALIZE]();
    };

    function getDashboardIndexPatterns(container: DashboardContainer): IndexPattern[] {
      let panelIndexPatterns: IndexPattern[] = [];
      Object.values(container.getChildIds()).forEach((id) => {
        const embeddableInstance = container.getChild(id);
        if (isErrorEmbeddable(embeddableInstance)) return;
        const embeddableIndexPatterns = (embeddableInstance.getOutput() as any).indexPatterns;
        if (!embeddableIndexPatterns) return;
        panelIndexPatterns.push(...embeddableIndexPatterns);
      });
      panelIndexPatterns = uniqBy(panelIndexPatterns, 'id');
      return panelIndexPatterns;
    }

    const updateIndexPatternsOperator = pipe(
      filter((container: DashboardContainer) => !!container && !isErrorEmbeddable(container)),
      map(getDashboardIndexPatterns),
      distinctUntilChanged((a, b) =>
        deepEqual(
          a.map((ip) => ip.id),
          b.map((ip) => ip.id)
        )
      ),
      // using switchMap for previous task cancellation
      switchMap((panelIndexPatterns: IndexPattern[]) => {
        return new Observable((observer) => {
          if (panelIndexPatterns && panelIndexPatterns.length > 0) {
            $scope.$evalAsync(() => {
              if (observer.closed) return;
              $scope.indexPatterns = panelIndexPatterns;
              observer.complete();
            });
          } else {
            indexPatterns.getDefault().then((defaultIndexPattern) => {
              if (observer.closed) return;
              $scope.$evalAsync(() => {
                if (observer.closed) return;
                $scope.indexPatterns = [defaultIndexPattern as IndexPattern];
                observer.complete();
              });
            });
          }
        });
      })
    );

    const getEmptyScreenProps = (
      shouldShowEditHelp: boolean,
      isEmptyInReadOnlyMode: boolean
    ): DashboardEmptyScreenProps => {
      const emptyScreenProps: DashboardEmptyScreenProps = {
        onLinkClick: shouldShowEditHelp ? $scope.showAddPanel : $scope.enterEditMode,
        showLinkToVisualize: shouldShowEditHelp,
        uiSettings,
        http,
      };
      if (shouldShowEditHelp) {
        emptyScreenProps.onVisualizeClick = addVisualization;
      }
      if (isEmptyInReadOnlyMode) {
        emptyScreenProps.isReadonlyMode = true;
      }
      return emptyScreenProps;
    };

    const getDashboardInput = (): DashboardContainerInput => {
      const embeddablesMap: {
        [key: string]: DashboardPanelState;
      } = {};
      dashboardStateManager.getPanels().forEach((panel: SavedDashboardPanel) => {
        embeddablesMap[panel.panelIndex] = convertSavedDashboardPanelToPanelState(panel);
      });

      // If the incoming embeddable state's id already exists in the embeddables map, replace the input, retaining the existing gridData for that panel.
      if (incomingEmbeddable?.embeddableId && embeddablesMap[incomingEmbeddable.embeddableId]) {
        const originalPanelState = embeddablesMap[incomingEmbeddable.embeddableId];
        embeddablesMap[incomingEmbeddable.embeddableId] = {
          gridData: originalPanelState.gridData,
          type: incomingEmbeddable.type,
          explicitInput: {
            ...originalPanelState.explicitInput,
            ...incomingEmbeddable.input,
            id: incomingEmbeddable.embeddableId,
          },
        };
        incomingEmbeddable = undefined;
      }

      const shouldShowEditHelp = getShouldShowEditHelp();
      const shouldShowViewHelp = getShouldShowViewHelp();
      const isEmptyInReadonlyMode = shouldShowUnauthorizedEmptyState();
      return {
        id: dashboardStateManager.savedDashboard.id || '',
        filters: filterManager.getFilters(),
        hidePanelTitles: dashboardStateManager.getHidePanelTitles(),
        query: $scope.model.query,
        timeRange: {
          ..._.cloneDeep(timefilter.getTime()),
        },
        refreshConfig: timefilter.getRefreshInterval(),
        viewMode: dashboardStateManager.getViewMode(),
        panels: embeddablesMap,
        isFullScreenMode: dashboardStateManager.getFullScreenMode(),
        isEmbeddedExternally,
        isEmptyState: shouldShowEditHelp || shouldShowViewHelp || isEmptyInReadonlyMode,
        useMargins: dashboardStateManager.getUseMargins(),
        lastReloadRequestTime,
        title: dashboardStateManager.getTitle(),
        description: dashboardStateManager.getDescription(),
        expandedPanelId: dashboardStateManager.getExpandedPanelId(),
      };
    };

    const updateState = () => {
      // Following the "best practice" of always have a '.' in your ng-models –
      // https://github.com/angular/angular.js/wiki/Understanding-Scopes
      $scope.model = {
        query: dashboardStateManager.getQuery(),
        filters: filterManager.getFilters(),
        timeRestore: dashboardStateManager.getTimeRestore(),
        title: dashboardStateManager.getTitle(),
        description: dashboardStateManager.getDescription(),
        timeRange: timefilter.getTime(),
        refreshInterval: timefilter.getRefreshInterval(),
      };
      $scope.panels = dashboardStateManager.getPanels();
    };

    updateState();

    let dashboardContainer: DashboardContainer | undefined;
    let inputSubscription: Subscription | undefined;
    let outputSubscription: Subscription | undefined;

    const dashboardDom = document.getElementById('dashboardViewport');
    const dashboardFactory = embeddable.getEmbeddableFactory<
      DashboardContainerInput,
      ContainerOutput,
      DashboardContainer
    >(DASHBOARD_CONTAINER_TYPE);

    if (dashboardFactory) {
      dashboardFactory
        .create(getDashboardInput())
        .then((container: DashboardContainer | ErrorEmbeddable | undefined) => {
          if (container && !isErrorEmbeddable(container)) {
            dashboardContainer = container;

            dashboardContainer.renderEmpty = () => {
              const shouldShowEditHelp = getShouldShowEditHelp();
              const shouldShowViewHelp = getShouldShowViewHelp();
              const isEmptyInReadOnlyMode = shouldShowUnauthorizedEmptyState();
              const isEmptyState =
                shouldShowEditHelp || shouldShowViewHelp || isEmptyInReadOnlyMode;
              return isEmptyState ? (
                <DashboardEmptyScreen
                  {...getEmptyScreenProps(shouldShowEditHelp, isEmptyInReadOnlyMode)}
                />
              ) : null;
            };

            outputSubscription = merge(
              // output of dashboard container itself
              dashboardContainer.getOutput$(),
              // plus output of dashboard container children,
              // children may change, so make sure we subscribe/unsubscribe with switchMap
              dashboardContainer.getOutput$().pipe(
                map(() => dashboardContainer!.getChildIds()),
                distinctUntilChanged(deepEqual),
                switchMap((newChildIds: string[]) =>
                  merge(
                    ...newChildIds.map((childId) =>
                      dashboardContainer!
                        .getChild(childId)
                        .getOutput$()
                        .pipe(catchError(() => EMPTY))
                    )
                  )
                )
              )
            )
              .pipe(
                mapTo(dashboardContainer),
                startWith(dashboardContainer), // to trigger initial index pattern update
                updateIndexPatternsOperator
              )
              .subscribe();

            inputSubscription = dashboardContainer.getInput$().subscribe(() => {
              let dirty = false;

              // This has to be first because handleDashboardContainerChanges causes
              // appState.save which will cause refreshDashboardContainer to be called.

              if (
                !esFilters.compareFilters(
                  container.getInput().filters,
                  filterManager.getFilters(),
                  esFilters.COMPARE_ALL_OPTIONS
                )
              ) {
                // Add filters modifies the object passed to it, hence the clone deep.
                filterManager.addFilters(_.cloneDeep(container.getInput().filters));

                dashboardStateManager.applyFilters(
                  $scope.model.query,
                  container.getInput().filters
                );
                dirty = true;
              }

              dashboardStateManager.handleDashboardContainerChanges(container);
              $scope.$evalAsync(() => {
                if (dirty) {
                  updateState();
                }
              });
            });

            dashboardStateManager.registerChangeListener(() => {
              // we aren't checking dirty state because there are changes the container needs to know about
              // that won't make the dashboard "dirty" - like a view mode change.
              refreshDashboardContainer();
            });

            // If the incomingEmbeddable does not yet exist in the panels listing, create a new panel using the container's addEmbeddable method.
            if (
              incomingEmbeddable &&
              (!incomingEmbeddable.embeddableId ||
                !container.getInput().panels[incomingEmbeddable.embeddableId])
            ) {
              container.addNewEmbeddable<EmbeddableInput>(
                incomingEmbeddable.type,
                incomingEmbeddable.input
              );
            }
          }

          if (dashboardDom && container) {
            container.render(dashboardDom);
          }
        });
    }

    // Part of the exposed plugin API - do not remove without careful consideration.
    this.appStatus = {
      dirty: !dash.id,
    };

    dashboardStateManager.registerChangeListener((status) => {
      this.appStatus.dirty = status.dirty || !dash.id;
      updateState();
    });

    dashboardStateManager.applyFilters(
      dashboardStateManager.getQuery() || queryStringManager.getDefaultQuery(),
      filterManager.getFilters()
    );

    timefilter.disableTimeRangeSelector();
    timefilter.disableAutoRefreshSelector();

    const landingPageUrl = () => `#${DashboardConstants.LANDING_PAGE_PATH}`;

    const getDashTitle = () =>
      getDashboardTitle(
        dashboardStateManager.getTitle(),
        dashboardStateManager.getViewMode(),
        dashboardStateManager.getIsDirty(timefilter),
        dashboardStateManager.isNew()
      );

    // Push breadcrumbs to new header navigation
    const updateBreadcrumbs = () => {
      chrome.setBreadcrumbs([
        {
          text: i18n.translate('dashboard.dashboardAppBreadcrumbsTitle', {
            defaultMessage: '仪表板',
          }),
          href: landingPageUrl(),
        },
        { text: '首页' },
        { text: '工作台' },
        { text: getDashTitle() },
      ]);
    };

    updateBreadcrumbs();
    dashboardStateManager.registerChangeListener(updateBreadcrumbs);

    const getChangesFromAppStateForContainerState = () => {
      const appStateDashboardInput = getDashboardInput();
      if (!dashboardContainer || isErrorEmbeddable(dashboardContainer)) {
        return appStateDashboardInput;
      }

      const containerInput = dashboardContainer.getInput();
      const differences: Partial<DashboardContainerInput> = {};

      // Filters shouldn't  be compared using regular isEqual
      if (
        !esFilters.compareFilters(
          containerInput.filters,
          appStateDashboardInput.filters,
          esFilters.COMPARE_ALL_OPTIONS
        )
      ) {
        differences.filters = appStateDashboardInput.filters;
      }

      Object.keys(_.omit(containerInput, ['filters'])).forEach((key) => {
        const containerValue = (containerInput as { [key: string]: unknown })[key];
        const appStateValue = ((appStateDashboardInput as unknown) as { [key: string]: unknown })[
          key
        ];
        if (!_.isEqual(containerValue, appStateValue)) {
          (differences as { [key: string]: unknown })[key] = appStateValue;
        }
      });

      // cloneDeep hack is needed, as there are multiple place, where container's input mutated,
      // but values from appStateValue are deeply frozen, as they can't be mutated directly
      return Object.values(differences).length === 0 ? undefined : _.cloneDeep(differences);
    };

    const refreshDashboardContainer = () => {
      const changes = getChangesFromAppStateForContainerState();
      if (changes && dashboardContainer) {
        dashboardContainer.updateInput(changes);
      }
    };

    $scope.handleRefresh = function (_payload, isUpdate) {
      if (isUpdate === false) {
        // The user can still request a reload in the query bar, even if the
        // query is the same, and in that case, we have to explicitly ask for
        // a reload, since no state changes will cause it.
        lastReloadRequestTime = new Date().getTime();
        refreshDashboardContainer();
      }
    };

    const updateStateFromSavedQuery = (savedQuery: SavedQuery) => {
      const allFilters = filterManager.getFilters();
      dashboardStateManager.applyFilters(savedQuery.attributes.query, allFilters);
      if (savedQuery.attributes.timefilter) {
        timefilter.setTime({
          from: savedQuery.attributes.timefilter.from,
          to: savedQuery.attributes.timefilter.to,
        });
        if (savedQuery.attributes.timefilter.refreshInterval) {
          timefilter.setRefreshInterval(savedQuery.attributes.timefilter.refreshInterval);
        }
      }
      // Making this method sync broke the updates.
      // Temporary fix, until we fix the complex state in this file.
      setTimeout(() => {
        filterManager.setFilters(allFilters);
      }, 0);
    };

    $scope.$watch('savedQuery', (newSavedQuery: SavedQuery) => {
      if (!newSavedQuery) return;
      dashboardStateManager.setSavedQueryId(newSavedQuery.id);

      updateStateFromSavedQuery(newSavedQuery);
    });

    $scope.$watch(
      () => {
        return dashboardStateManager.getSavedQueryId();
      },
      (newSavedQueryId) => {
        if (!newSavedQueryId) {
          $scope.savedQuery = undefined;
          return;
        }
        if (!$scope.savedQuery || newSavedQueryId !== $scope.savedQuery.id) {
          savedQueryService.getSavedQuery(newSavedQueryId).then((savedQuery: SavedQuery) => {
            $scope.$evalAsync(() => {
              $scope.savedQuery = savedQuery;
              updateStateFromSavedQuery(savedQuery);
            });
          });
        }
      }
    );

    $scope.indexPatterns = [];

    $scope.$watch(
      () => dashboardCapabilities.saveQuery,
      (newCapability) => {
        $scope.showSaveQuery = newCapability as boolean;
      }
    );

    const onSavedQueryIdChange = (savedQueryId?: string) => {
      dashboardStateManager.setSavedQueryId(savedQueryId);
    };

    const shouldShowFilterBar = (forceHide: boolean): boolean =>
      !forceHide && ($scope.model.filters.length > 0 || !dashboardStateManager.getFullScreenMode());

    const shouldShowNavBarComponent = (forceShow: boolean): boolean =>
      (forceShow || $scope.isVisible) && !dashboardStateManager.getFullScreenMode();

    const getNavBarProps = () => {
      const isFullScreenMode = dashboardStateManager.getFullScreenMode();
      const screenTitle = dashboardStateManager.getTitle();
      const showTopNavMenu = shouldShowNavBarComponent(forceShowTopNavMenu);
      const showQueryInput = shouldShowNavBarComponent(forceShowQueryInput);
      const showDatePicker = shouldShowNavBarComponent(forceShowDatePicker);
      const showQueryBar = showQueryInput || showDatePicker;
      const showFilterBar = shouldShowFilterBar(forceHideFilterBar);
      const showSearchBar = showQueryBar || showFilterBar;

      return {
        appName: 'dashboard',
        config: showTopNavMenu ? $scope.topNavMenu : undefined,
        className: isFullScreenMode ? 'kbnTopNavMenu-isFullScreen' : undefined,
        screenTitle,
        showTopNavMenu,
        showSearchBar,
        showQueryBar,
        showQueryInput,
        showDatePicker,
        showFilterBar,
        indexPatterns: $scope.indexPatterns,
        showSaveQuery: $scope.showSaveQuery,
        savedQuery: $scope.savedQuery,
        onSavedQueryIdChange,
        savedQueryId: dashboardStateManager.getSavedQueryId(),
        useDefaultBehaviors: true,
        onQuerySubmit: $scope.handleRefresh,
      };
    };
    const dashboardNavBar = document.getElementById('dashboardChrome');
    const updateNavBar = () => {
      ReactDOM.render(
        <navigation.ui.TopNavMenu
          {...getNavBarProps()}
          {...(isEmbeddedExternally ? {} : { setMenuMountPoint: setHeaderActionMenu })}
        />,
        dashboardNavBar
      );
    };

    const unmountNavBar = () => {
      if (dashboardNavBar) {
        ReactDOM.unmountComponentAtNode(dashboardNavBar);
      }
    };

    $scope.timefilterSubscriptions$ = new Subscription();
    const timeChanges$ = merge(timefilter.getRefreshIntervalUpdate$(), timefilter.getTimeUpdate$());
    $scope.timefilterSubscriptions$.add(
      subscribeWithScope(
        $scope,
        timeChanges$,
        {
          next: () => {
            updateState();
            refreshDashboardContainer();
          },
        },
        (error: AngularHttpError | Error | string) => addFatalError(fatalErrors, error)
      )
    );

    function updateViewMode(newMode: ViewMode) {
      dashboardStateManager.switchViewMode(newMode);
    }

    const onChangeViewMode = (newMode: ViewMode) => {
      const isPageRefresh = newMode === dashboardStateManager.getViewMode();
      const isLeavingEditMode = !isPageRefresh && newMode === ViewMode.VIEW;
      const willLoseChanges = isLeavingEditMode && dashboardStateManager.getIsDirty(timefilter);

      if (!willLoseChanges) {
        updateViewMode(newMode);
        return;
      }

      function revertChangesAndExitEditMode() {
        dashboardStateManager.resetState();
        // This is only necessary for new dashboards, which will default to Edit mode.
        updateViewMode(ViewMode.VIEW);

        // We need to do a hard reset of the timepicker. appState will not reload like
        // it does on 'open' because it's been saved to the url and the getAppState.previouslyStored() check on
        // reload will cause it not to sync.
        if (dashboardStateManager.getIsTimeSavedWithDashboard()) {
          dashboardStateManager.syncTimefilterWithDashboardTime(timefilter);
          dashboardStateManager.syncTimefilterWithDashboardRefreshInterval(timefilter);
        }

        // Angular's $location skips this update because of history updates from syncState which happen simultaneously
        // when calling kbnUrl.change() angular schedules url update and when angular finally starts to process it,
        // the update is considered outdated and angular skips it
        // so have to use implementation of dashboardStateManager.changeDashboardUrl, which workarounds those issues
        dashboardStateManager.changeDashboardUrl(
          dash.id ? createDashboardEditUrl(dash.id) : DashboardConstants.CREATE_NEW_DASHBOARD_URL
        );
      }

      overlays
        .openConfirm(
          i18n.translate('dashboard.changeViewModeConfirmModal.discardChangesDescription', {
            defaultMessage: `放弃更改后，它们将无法恢复.`,
          }),
          {
            confirmButtonText: i18n.translate(
              'dashboard.changeViewModeConfirmModal.confirmButtonLabel',
              { defaultMessage: '放弃更改' }
            ),
            cancelButtonText: i18n.translate(
              'dashboard.changeViewModeConfirmModal.cancelButtonLabel',
              { defaultMessage: '继续编辑' }
            ),
            defaultFocusedButton: EUI_MODAL_CANCEL_BUTTON,
            title: i18n.translate('dashboard.changeViewModeConfirmModal.discardChangesTitle', {
              defaultMessage: '放弃对仪表板的更改?',
            }),
          }
        )
        .then((isConfirmed) => {
          if (isConfirmed) {
            revertChangesAndExitEditMode();
          }
        });

      updateNavBar();
    };

    /**
     * Saves the dashboard.
     *
     * @param {object} [saveOptions={}]
     * @property {boolean} [saveOptions.confirmOverwrite=false] - If true, attempts to create the source so it
     * can confirm an overwrite if a document with the id already exists.
     * @property {boolean} [saveOptions.isTitleDuplicateConfirmed=false] - If true, save allowed with duplicate title
     * @property {func} [saveOptions.onTitleDuplicate] - function called if duplicate title exists.
     * When not provided, confirm modal will be displayed asking user to confirm or cancel save.
     * @return {Promise}
     * @resolved {String} - The id of the doc
     */
    function save(saveOptions: SavedObjectSaveOpts): Promise<SaveResult> {
      return saveDashboard(angular.toJson, timefilter, dashboardStateManager, saveOptions)
        .then(function (id) {
          if (id) {
            notifications.toasts.addSuccess({
              title: i18n.translate('dashboard.dashboardWasSavedSuccessMessage', {
                defaultMessage: `仪表板“{dashTitle}”已保存`,
                values: { dashTitle: dash.title },
              }),
              'data-test-subj': 'saveDashboardSuccess',
            });

            if (dash.id !== $routeParams.id) {
              // Angular's $location skips this update because of history updates from syncState which happen simultaneously
              // when calling kbnUrl.change() angular schedules url update and when angular finally starts to process it,
              // the update is considered outdated and angular skips it
              // so have to use implementation of dashboardStateManager.changeDashboardUrl, which workarounds those issues
              dashboardStateManager.changeDashboardUrl(createDashboardEditUrl(dash.id));
            } else {
              chrome.docTitle.change(dash.lastSavedTitle);
              updateViewMode(ViewMode.VIEW);
            }
          }
          return { id };
        })
        .catch((error) => {
          notifications.toasts.addDanger({
            title: i18n.translate('dashboard.dashboardWasNotSavedDangerMessage', {
              defaultMessage: `仪表板“{dashTitle}”未保存。错误：{errorMessage}`,
              values: {
                dashTitle: dash.title,
                errorMessage: error.message,
              },
            }),
            'data-test-subj': 'saveDashboardFailure',
          });
          return { error };
        });
    }

    $scope.showAddPanel = () => {
      dashboardStateManager.setFullScreenMode(false);
      /*
       * Temp solution for triggering menu click.
       * When de-angularizing this code, please call the underlaying action function
       * directly and not via the top nav object.
       **/
      navActions[TopNavIds.ADD_EXISTING]();
    };
    $scope.enterEditMode = () => {
      dashboardStateManager.setFullScreenMode(false);
      /*
       * Temp solution for triggering menu click.
       * When de-angularizing this code, please call the underlaying action function
       * directly and not via the top nav object.
       **/
      navActions[TopNavIds.ENTER_EDIT_MODE]();
    };
    const navActions: {
      [key: string]: NavAction;
    } = {};
    navActions[TopNavIds.FULL_SCREEN] = () => {
      dashboardStateManager.setFullScreenMode(true);
      updateNavBar();
    };
    navActions[TopNavIds.EXIT_EDIT_MODE] = () => onChangeViewMode(ViewMode.VIEW);
    navActions[TopNavIds.ENTER_EDIT_MODE] = () => onChangeViewMode(ViewMode.EDIT);
    navActions[TopNavIds.SAVE] = () => {
      const currentTitle = dashboardStateManager.getTitle();
      const currentDescription = dashboardStateManager.getDescription();
      const currentTimeRestore = dashboardStateManager.getTimeRestore();
      const onSave = ({
        newTitle,
        newDescription,
        newCopyOnSave,
        newTimeRestore,
        isTitleDuplicateConfirmed,
        onTitleDuplicate,
      }: {
        newTitle: string;
        newDescription: string;
        newCopyOnSave: boolean;
        newTimeRestore: boolean;
        isTitleDuplicateConfirmed: boolean;
        onTitleDuplicate: () => void;
      }) => {
        dashboardStateManager.setTitle(newTitle);
        dashboardStateManager.setDescription(newDescription);
        dashboardStateManager.savedDashboard.copyOnSave = newCopyOnSave;
        dashboardStateManager.setTimeRestore(newTimeRestore);
        const saveOptions = {
          confirmOverwrite: false,
          isTitleDuplicateConfirmed,
          onTitleDuplicate,
        };
        return save(saveOptions).then((response: SaveResult) => {
          // If the save wasn't successful, put the original values back.
          if (!(response as { id: string }).id) {
            dashboardStateManager.setTitle(currentTitle);
            dashboardStateManager.setDescription(currentDescription);
            dashboardStateManager.setTimeRestore(currentTimeRestore);
          }
          return response;
        });
      };

      const dashboardSaveModal = (
        <DashboardSaveModal
          onSave={onSave}
          onClose={() => {}}
          title={currentTitle}
          description={currentDescription}
          timeRestore={currentTimeRestore}
          showCopyOnSave={dash.id ? true : false}
        />
      );
      showSaveModal(dashboardSaveModal, i18nStart.Context);
    };
    navActions[TopNavIds.CLONE] = () => {
      const currentTitle = dashboardStateManager.getTitle();
      const onClone = (
        newTitle: string,
        isTitleDuplicateConfirmed: boolean,
        onTitleDuplicate: () => void
      ) => {
        dashboardStateManager.savedDashboard.copyOnSave = true;
        dashboardStateManager.setTitle(newTitle);
        const saveOptions = {
          confirmOverwrite: false,
          isTitleDuplicateConfirmed,
          onTitleDuplicate,
        };
        return save(saveOptions).then((response: { id?: string } | { error: Error }) => {
          // If the save wasn't successful, put the original title back.
          if ((response as { error: Error }).error) {
            dashboardStateManager.setTitle(currentTitle);
          }
          updateNavBar();
          return response;
        });
      };

      showCloneModal(onClone, currentTitle);
    };

    navActions[TopNavIds.ADD_EXISTING] = () => {
      if (dashboardContainer && !isErrorEmbeddable(dashboardContainer)) {
        openAddPanelFlyout({
          embeddable: dashboardContainer,
          getAllFactories: embeddable.getEmbeddableFactories,
          getFactory: embeddable.getEmbeddableFactory,
          notifications,
          overlays,
          SavedObjectFinder: getSavedObjectFinder(savedObjects, uiSettings),
        });
      }
    };

    navActions[TopNavIds.VISUALIZE] = async () => {
      const type = 'visualization';
      const factory = embeddable.getEmbeddableFactory(type);
      if (!factory) {
        throw new EmbeddableFactoryNotFoundError(type);
      }
      await factory.create({} as EmbeddableInput, dashboardContainer);
    };

    navActions[TopNavIds.OPTIONS] = (anchorElement) => {
      showOptionsPopover({
        anchorElement,
        useMargins: dashboardStateManager.getUseMargins(),
        onUseMarginsChange: (isChecked: boolean) => {
          dashboardStateManager.setUseMargins(isChecked);
        },
        hidePanelTitles: dashboardStateManager.getHidePanelTitles(),
        onHidePanelTitlesChange: (isChecked: boolean) => {
          dashboardStateManager.setHidePanelTitles(isChecked);
        },
      });
    };

    if (share) {
      // the share button is only availabale if "share" plugin contract enabled
      navActions[TopNavIds.SHARE] = (anchorElement) => {
        const EmbedUrlParamExtension = ({
          setParamValue,
        }: {
          setParamValue: (paramUpdate: UrlParamValues) => void;
        }): ReactElement => {
          const [urlParamsSelectedMap, setUrlParamsSelectedMap] = useState<UrlParamsSelectedMap>({
            [UrlParams.SHOW_TOP_MENU]: false,
            [UrlParams.SHOW_QUERY_INPUT]: false,
            [UrlParams.SHOW_TIME_FILTER]: false,
            [UrlParams.SHOW_FILTER_BAR]: true,
          });

          const checkboxes = [
            {
              id: UrlParams.SHOW_TOP_MENU,
              label: i18n.translate('dashboard.embedUrlParamExtension.topMenu', {
                defaultMessage: '顶部菜单',
              }),
            },
            {
              id: UrlParams.SHOW_QUERY_INPUT,
              label: i18n.translate('dashboard.embedUrlParamExtension.query', {
                defaultMessage: '查询',
              }),
            },
            {
              id: UrlParams.SHOW_TIME_FILTER,
              label: i18n.translate('dashboard.embedUrlParamExtension.timeFilter', {
                defaultMessage: '时间筛选',
              }),
            },
            {
              id: UrlParams.SHOW_FILTER_BAR,
              label: i18n.translate('dashboard.embedUrlParamExtension.filterBar', {
                defaultMessage: '筛选栏',
              }),
            },
          ];

          const handleChange = (param: string): void => {
            const urlParamsSelectedMapUpdate = {
              ...urlParamsSelectedMap,
              [param]: !urlParamsSelectedMap[param as keyof UrlParamsSelectedMap],
            };
            setUrlParamsSelectedMap(urlParamsSelectedMapUpdate);

            const urlParamValues = {
              [UrlParams.SHOW_TOP_MENU]: urlParamsSelectedMap[UrlParams.SHOW_TOP_MENU],
              [UrlParams.SHOW_QUERY_INPUT]: urlParamsSelectedMap[UrlParams.SHOW_QUERY_INPUT],
              [UrlParams.SHOW_TIME_FILTER]: urlParamsSelectedMap[UrlParams.SHOW_TIME_FILTER],
              [UrlParams.HIDE_FILTER_BAR]: !urlParamsSelectedMap[UrlParams.SHOW_FILTER_BAR],
              [param === UrlParams.SHOW_FILTER_BAR ? UrlParams.HIDE_FILTER_BAR : param]:
                param === UrlParams.SHOW_FILTER_BAR
                  ? urlParamsSelectedMap[UrlParams.SHOW_FILTER_BAR]
                  : !urlParamsSelectedMap[param as keyof UrlParamsSelectedMap],
            };
            setParamValue(urlParamValues);
          };

          return (
            <EuiCheckboxGroup
              options={checkboxes}
              idToSelectedMap={(urlParamsSelectedMap as unknown) as EuiCheckboxGroupIdToSelectedMap}
              onChange={handleChange}
              legend={{
                children: i18n.translate('dashboard.embedUrlParamExtension.include', {
                  defaultMessage: '包括',
                }),
              }}
              data-test-subj="embedUrlParamExtension"
            />
          );
        };

        share.toggleShareContextMenu({
          anchorElement,
          allowEmbed: true,
          allowShortUrl:
            !dashboardConfig.getHideWriteControls() || dashboardCapabilities.createShortUrl,
          shareableUrl: unhashUrl(window.location.href),
          objectId: dash.id,
          objectType: 'dashboard',
          sharingData: {
            title: dash.title,
          },
          isDirty: dashboardStateManager.getIsDirty(),
          embedUrlParamExtensions: [
            {
              paramName: 'embed',
              component: EmbedUrlParamExtension,
            },
          ],
        });
      };
    }

    updateViewMode(dashboardStateManager.getViewMode());

    const filterChanges = merge(filterManager.getUpdates$(), queryStringManager.getUpdates$()).pipe(
      debounceTime(100)
    );

    // update root source when filters update
    const updateSubscription = filterChanges.subscribe({
      next: () => {
        $scope.model.filters = filterManager.getFilters();
        $scope.model.query = queryStringManager.getQuery();
        dashboardStateManager.applyFilters($scope.model.query, $scope.model.filters);
        if (dashboardContainer) {
          dashboardContainer.updateInput({
            filters: $scope.model.filters,
            query: $scope.model.query,
          });
        }
      },
    });

    const visibleSubscription = chrome.getIsVisible$().subscribe((isVisible) => {
      $scope.$evalAsync(() => {
        $scope.isVisible = isVisible;
        updateNavBar();
      });
    });

    dashboardStateManager.registerChangeListener(() => {
      // view mode could have changed, so trigger top nav update
      $scope.topNavMenu = getTopNavConfig(
        dashboardStateManager.getViewMode(),
        navActions,
        dashboardConfig.getHideWriteControls()
      );
      updateNavBar();
    });

    $scope.$watch('indexPatterns', () => {
      updateNavBar();
    });

    $scope.$on('$destroy', () => {
      // we have to unmount nav bar manually to make sure all internal subscriptions are unsubscribed
      unmountNavBar();

      updateSubscription.unsubscribe();
      stopSyncingQueryServiceStateWithUrl();
      stopSyncingAppFilters();
      visibleSubscription.unsubscribe();
      $scope.timefilterSubscriptions$.unsubscribe();

      dashboardStateManager.destroy();
      if (inputSubscription) {
        inputSubscription.unsubscribe();
      }
      if (outputSubscription) {
        outputSubscription.unsubscribe();
      }
      if (dashboardContainer) {
        dashboardContainer.destroy();
      }
    });
  }
}
