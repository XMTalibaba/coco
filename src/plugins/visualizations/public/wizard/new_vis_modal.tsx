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

import { EuiModal, EuiOverlayMask } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import { METRIC_TYPE, UiStatsMetricType } from '@kbn/analytics';
import { ApplicationStart, IUiSettingsClient, SavedObjectsStart } from '../../../../core/public';
import { SearchSelection } from './search_selection';
import { TypeSelection } from './type_selection';
import { TypesStart, VisType, VisTypeAlias } from '../vis_types';
import { UsageCollectionSetup } from '../../../../plugins/usage_collection/public';
import { EmbeddableStateTransfer } from '../../../embeddable/public';
import { VISUALIZE_ENABLE_LABS_SETTING } from '../../common/constants';

interface TypeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  visTypesRegistry: TypesStart;
  editorParams?: string[];
  addBasePath: (path: string) => string;
  uiSettings: IUiSettingsClient;
  savedObjects: SavedObjectsStart;
  usageCollection?: UsageCollectionSetup;
  application: ApplicationStart;
  outsideVisualizeApp?: boolean;
  stateTransfer?: EmbeddableStateTransfer;
  originatingApp?: string;
}

interface TypeSelectionState {
  showSearchVisModal: boolean;
  visType?: VisType;
}

// TODO: redirect logic is specific to visualise & dashboard
// but it is likely should be decoupled. e.g. handled by the container instead
const basePath = `/create?`;
const baseUrl = `/app/visualize#${basePath}`;

class NewVisModal extends React.Component<TypeSelectionProps, TypeSelectionState> {
  public static defaultProps = {
    editorParams: [],
  };

  private readonly isLabsEnabled: boolean;
  private readonly trackUiMetric:
    | ((type: UiStatsMetricType, eventNames: string | string[], count?: number) => void)
    | undefined;

  constructor(props: TypeSelectionProps) {
    super(props);
    this.isLabsEnabled = props.uiSettings.get(VISUALIZE_ENABLE_LABS_SETTING);

    this.state = {
      showSearchVisModal: false,
    };

    this.trackUiMetric = this.props.usageCollection?.reportUiStats.bind(
      this.props.usageCollection,
      'visualize'
    );
  }

  public render() {
    if (!this.props.isOpen) {
      return null;
    }

    const visNewVisDialogAriaLabel = i18n.translate(
      'visualizations.newVisWizard.helpTextAriaLabel',
      {
        defaultMessage:
          '通过为该可视化选择类型，来开始创建您的可视化。按 Esc 键关闭此模式。按 Tab 键继续.',
      }
    );

    const selectionModal =
      this.state.showSearchVisModal && this.state.visType ? (
        <EuiModal onClose={this.onCloseModal} className="visNewVisSearchDialog">
          <SearchSelection
            onSearchSelected={this.onSearchSelected}
            visType={this.state.visType}
            uiSettings={this.props.uiSettings}
            savedObjects={this.props.savedObjects}
          />
        </EuiModal>
      ) : (
        <EuiModal
          onClose={this.onCloseModal}
          className="visNewVisDialog"
          aria-label={visNewVisDialogAriaLabel}
        >
          <TypeSelection
            showExperimental={this.isLabsEnabled}
            onVisTypeSelected={this.onVisTypeSelected}
            visTypesRegistry={this.props.visTypesRegistry}
            addBasePath={this.props.addBasePath}
          />
        </EuiModal>
      );

    return <EuiOverlayMask>{selectionModal}</EuiOverlayMask>;
  }

  private onCloseModal = () => {
    this.setState({ showSearchVisModal: false });
    this.props.onClose();
  };

  private onVisTypeSelected = (visType: VisType | VisTypeAlias) => {
    if (!('aliasPath' in visType) && visType.requiresSearch && visType.options.showIndexSelection) {
      this.setState({
        showSearchVisModal: true,
        visType,
      });
    } else {
      this.redirectToVis(visType);
    }
  };

  private onSearchSelected = (searchId: string, searchType: string) => {
    this.redirectToVis(this.state.visType!, searchType, searchId);
  };

  private redirectToVis(visType: VisType | VisTypeAlias, searchType?: string, searchId?: string) {
    if (this.trackUiMetric) {
      this.trackUiMetric(METRIC_TYPE.CLICK, visType.name);
    }

    let params;
    if ('aliasPath' in visType) {
      params = visType.aliasPath;
      this.props.onClose();
      this.navigate(visType.aliasApp, visType.aliasPath);
      return;
    }

    params = [`type=${encodeURIComponent(visType.name)}`];

    if (searchType) {
      params.push(`${searchType === 'search' ? 'savedSearchId' : 'indexPattern'}=${searchId}`);
    }
    params = params.concat(this.props.editorParams!);

    this.props.onClose();
    if (this.props.outsideVisualizeApp) {
      this.navigate('visualize', `#${basePath}${params.join('&')}`);
    } else {
      location.assign(this.props.addBasePath(`${baseUrl}${params.join('&')}`));
    }
  }

  private navigate(appId: string, params: string) {
    if (this.props.stateTransfer && this.props.originatingApp) {
      this.props.stateTransfer.navigateToEditor(appId, {
        path: params,
        state: {
          originatingApp: this.props.originatingApp,
        },
      });
    } else {
      this.props.application.navigateToApp(appId, {
        path: params,
      });
    }
  }
}

export { NewVisModal };
