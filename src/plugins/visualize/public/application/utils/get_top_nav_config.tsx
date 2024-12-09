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

import React from 'react';
import { i18n } from '@kbn/i18n';

import { TopNavMenuData } from 'src/plugins/navigation/public';
import { AppMountParameters } from 'kibana/public';
import { VISUALIZE_EMBEDDABLE_TYPE, VisualizeInput } from '../../../../visualizations/public';
import {
  showSaveModal,
  SavedObjectSaveModalOrigin,
  SavedObjectSaveOpts,
  OnSaveProps,
} from '../../../../saved_objects/public';
import { unhashUrl } from '../../../../kibana_utils/public';

import {
  VisualizeServices,
  VisualizeAppStateContainer,
  VisualizeEditorVisInstance,
} from '../types';
import { VisualizeConstants } from '../visualize_constants';
import { getEditBreadcrumbs } from './breadcrumbs';
import { EmbeddableStateTransfer } from '../../../../embeddable/public';

interface TopNavConfigParams {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  openInspector: () => void;
  originatingApp?: string;
  setOriginatingApp?: (originatingApp: string | undefined) => void;
  hasUnappliedChanges: boolean;
  visInstance: VisualizeEditorVisInstance;
  stateContainer: VisualizeAppStateContainer;
  visualizationIdFromUrl?: string;
  stateTransfer: EmbeddableStateTransfer;
  embeddableId?: string;
  onAppLeave: AppMountParameters['onAppLeave'];
}

export const getTopNavConfig = (
  {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    openInspector,
    originatingApp,
    setOriginatingApp,
    hasUnappliedChanges,
    visInstance,
    stateContainer,
    visualizationIdFromUrl,
    stateTransfer,
    embeddableId,
    onAppLeave,
  }: TopNavConfigParams,
  {
    application,
    chrome,
    history,
    share,
    setActiveUrl,
    toastNotifications,
    visualizeCapabilities,
    i18n: { Context: I18nContext },
    dashboard,
  }: VisualizeServices
) => {
  const { vis, embeddableHandler } = visInstance;
  const savedVis = 'savedVis' in visInstance ? visInstance.savedVis : undefined;
  /**
   * Called when the user clicks "Save" button.
   */
  async function doSave(saveOptions: SavedObjectSaveOpts) {
    if (!savedVis) {
      return {};
    }
    const newlyCreated = !Boolean(savedVis.id) || savedVis.copyOnSave;
    // vis.title was not bound and it's needed to reflect title into visState
    stateContainer.transitions.setVis({
      title: savedVis.title,
    });
    savedVis.searchSourceFields = vis.data.searchSource?.getSerializedFields();
    savedVis.visState = stateContainer.getState().vis;
    savedVis.uiStateJSON = vis.uiState.toString();
    setHasUnsavedChanges(false);

    try {
      const id = await savedVis.save(saveOptions);

      if (id) {
        toastNotifications.addSuccess({
          title: i18n.translate('visualize.topNavMenu.saveVisualization.successNotificationText', {
            defaultMessage: `已保存“{visTitle}”`,
            values: {
              visTitle: savedVis.title,
            },
          }),
          'data-test-subj': 'saveVisualizationSuccess',
        });

        if (originatingApp && saveOptions.returnToOrigin) {
          const appPath = `${VisualizeConstants.EDIT_PATH}/${encodeURIComponent(id)}`;

          // Manually insert a new url so the back button will open the saved visualization.
          history.replace(appPath);
          setActiveUrl(appPath);

          if (newlyCreated && stateTransfer) {
            stateTransfer.navigateToWithEmbeddablePackage(originatingApp, {
              state: { type: VISUALIZE_EMBEDDABLE_TYPE, input: { savedObjectId: id } },
            });
          } else {
            application.navigateToApp(originatingApp);
          }
        } else {
          if (setOriginatingApp && originatingApp && newlyCreated) {
            setOriginatingApp(undefined);
          }
          chrome.docTitle.change(savedVis.lastSavedTitle);
          chrome.setBreadcrumbs(getEditBreadcrumbs(savedVis.lastSavedTitle));

          if (id !== visualizationIdFromUrl) {
            history.replace({
              ...history.location,
              pathname: `${VisualizeConstants.EDIT_PATH}/${id}`,
            });
          }
        }
      }

      return { id };
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
      toastNotifications.addDanger({
        title: i18n.translate('visualize.topNavMenu.saveVisualization.failureNotificationText', {
          defaultMessage: `保存“{visTitle}”时出错`,
          values: {
            visTitle: savedVis.title,
          },
        }),
        text: error.message,
        'data-test-subj': 'saveVisualizationError',
      });
      return { error };
    }
  }

  const createVisReference = () => {
    if (!originatingApp) {
      return;
    }
    const state = {
      input: {
        savedVis: vis.serialize(),
      } as VisualizeInput,
      embeddableId,
      type: VISUALIZE_EMBEDDABLE_TYPE,
    };
    stateTransfer.navigateToWithEmbeddablePackage(originatingApp, { state });
  };

  const navigateToOriginatingApp = () => {
    if (originatingApp) {
      application.navigateToApp(originatingApp);
    }
  };

  const topNavMenu: TopNavMenuData[] = [
    {
      id: 'inspector',
      label: i18n.translate('visualize.topNavMenu.openInspectorButtonLabel', {
        defaultMessage: '检查',
      }),
      description: i18n.translate('visualize.topNavMenu.openInspectorButtonAriaLabel', {
        defaultMessage: '打开检查器查看可视化',
      }),
      testId: 'openInspectorButton',
      disableButton() {
        return !embeddableHandler.hasInspector || !embeddableHandler.hasInspector();
      },
      run: openInspector,
      tooltip() {
        if (!embeddableHandler.hasInspector || !embeddableHandler.hasInspector()) {
          return i18n.translate('visualize.topNavMenu.openInspectorDisabledButtonTooltip', {
            defaultMessage: `此可视化不支持任何检查器。`,
          });
        }
      },
    },
    {
      id: 'share',
      label: i18n.translate('visualize.topNavMenu.shareVisualizationButtonLabel', {
        defaultMessage: '共享',
      }),
      description: i18n.translate('visualize.topNavMenu.shareVisualizationButtonAriaLabel', {
        defaultMessage: '共享可视化',
      }),
      testId: 'shareTopNavButton',
      run: (anchorElement) => {
        if (share && !embeddableId) {
          // TODO: support sharing in by-value mode
          share.toggleShareContextMenu({
            anchorElement,
            allowEmbed: true,
            allowShortUrl: visualizeCapabilities.createShortUrl,
            shareableUrl: unhashUrl(window.location.href),
            objectId: savedVis?.id,
            objectType: 'visualization',
            sharingData: {
              title: savedVis?.title,
            },
            isDirty: hasUnappliedChanges || hasUnsavedChanges,
          });
        }
      },
      // disable the Share button if no action specified
      disableButton: !share || !!embeddableId,
    },
    ...(originatingApp === 'dashboards' || originatingApp === 'canvas'
      ? [
          {
            id: 'cancel',
            label: i18n.translate('visualize.topNavMenu.cancelButtonLabel', {
              defaultMessage: '取消',
            }),
            emphasize: false,
            description: i18n.translate('visualize.topNavMenu.cancelButtonAriaLabel', {
              defaultMessage: '返回到上一个应用而不保存更改',
            }),
            testId: 'visualizeCancelAndReturnButton',
            tooltip() {
              if (hasUnappliedChanges || hasUnsavedChanges) {
                return i18n.translate('visualize.topNavMenu.cancelAndReturnButtonTooltip', {
                  defaultMessage: '完成前放弃所做的更改',
                });
              }
            },
            run: async () => {
              return navigateToOriginatingApp();
            },
          },
        ]
      : []),
    ...(visualizeCapabilities.save && !embeddableId
      ? [
          {
            id: 'save',
            iconType: savedVis?.id && originatingApp ? undefined : 'save',
            label:
              savedVis?.id && originatingApp
                ? i18n.translate('visualize.topNavMenu.saveVisualizationAsButtonLabel', {
                    defaultMessage: '另存为',
                  })
                : i18n.translate('visualize.topNavMenu.saveVisualizationButtonLabel', {
                    defaultMessage: '保存',
                  }),
            emphasize: (savedVis && !savedVis.id) || !originatingApp,
            description: i18n.translate('visualize.topNavMenu.saveVisualizationButtonAriaLabel', {
              defaultMessage: '保存可视化',
            }),
            className: savedVis?.id && originatingApp ? 'saveAsButton' : '',
            testId: 'visualizeSaveButton',
            disableButton: hasUnappliedChanges,
            tooltip() {
              if (hasUnappliedChanges) {
                return i18n.translate(
                  'visualize.topNavMenu.saveVisualizationDisabledButtonTooltip',
                  {
                    defaultMessage: '保存前应用或放弃所做更改',
                  }
                );
              }
            },
            run: (anchorElement: HTMLElement) => {
              const onSave = async ({
                newTitle,
                newCopyOnSave,
                isTitleDuplicateConfirmed,
                onTitleDuplicate,
                newDescription,
                returnToOrigin,
              }: OnSaveProps & { returnToOrigin: boolean }) => {
                if (!savedVis) {
                  return;
                }
                const currentTitle = savedVis.title;
                savedVis.title = newTitle;
                embeddableHandler.updateInput({ title: newTitle });
                savedVis.copyOnSave = newCopyOnSave;
                savedVis.description = newDescription;
                const saveOptions = {
                  confirmOverwrite: false,
                  isTitleDuplicateConfirmed,
                  onTitleDuplicate,
                  returnToOrigin,
                };
                const response = await doSave(saveOptions);
                // If the save wasn't successful, put the original values back.
                if (!response.id || response.error) {
                  savedVis.title = currentTitle;
                }
                return response;
              };

              const saveModal = (
                <SavedObjectSaveModalOrigin
                  documentInfo={savedVis || { title: '' }}
                  onSave={onSave}
                  getAppNameFromId={stateTransfer.getAppNameFromId}
                  objectType={'visualization'}
                  onClose={() => {}}
                  originatingApp={originatingApp}
                />
              );
              const isSaveAsButton = anchorElement.classList.contains('saveAsButton');
              onAppLeave((actions) => {
                return actions.default();
              });
              if (
                originatingApp === 'dashboards' &&
                dashboard.dashboardFeatureFlagConfig.allowByValueEmbeddables &&
                !isSaveAsButton
              ) {
                createVisReference();
              } else if (savedVis) {
                showSaveModal(saveModal, I18nContext);
              }
            },
          },
        ]
      : []),
    ...(originatingApp && ((savedVis && savedVis.id) || embeddableId)
      ? [
          {
            id: 'saveAndReturn',
            label: i18n.translate('visualize.topNavMenu.saveAndReturnVisualizationButtonLabel', {
              defaultMessage: '保存并返回',
            }),
            emphasize: true,
            iconType: 'checkInCircleFilled',
            description: i18n.translate(
              'visualize.topNavMenu.saveAndReturnVisualizationButtonAriaLabel',
              {
                defaultMessage: '完成编辑可视化并返回到最后一个应用',
              }
            ),
            testId: 'visualizesaveAndReturnButton',
            disableButton: hasUnappliedChanges,
            tooltip() {
              if (hasUnappliedChanges) {
                return i18n.translate(
                  'visualize.topNavMenu.saveAndReturnVisualizationDisabledButtonTooltip',
                  {
                    defaultMessage: '完成前应用或放弃所做更改',
                  }
                );
              }
            },
            run: async () => {
              const saveOptions = {
                confirmOverwrite: false,
                returnToOrigin: true,
              };
              onAppLeave((actions) => {
                return actions.default();
              });
              if (
                originatingApp === 'dashboards' &&
                dashboard.dashboardFeatureFlagConfig.allowByValueEmbeddables &&
                !savedVis
              ) {
                return createVisReference();
              }
              return doSave(saveOptions);
            },
          },
        ]
      : []),
  ];

  return topNavMenu;
};
