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

import { EuiModalBody, EuiModalHeader, EuiModalHeaderTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import React from 'react';
import { IUiSettingsClient, SavedObjectsStart } from '../../../../../core/public';

import { SavedObjectFinderUi } from '../../../../../plugins/saved_objects/public';
import { VisType } from '../../vis_types';

interface SearchSelectionProps {
  onSearchSelected: (searchId: string, searchType: string) => void;
  visType: VisType;
  uiSettings: IUiSettingsClient;
  savedObjects: SavedObjectsStart;
}

export class SearchSelection extends React.Component<SearchSelectionProps> {
  private fixedPageSize: number = 8;

  public render() {
    return (
      <React.Fragment>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <FormattedMessage
              id="visualizations.newVisWizard.newVisTypeTitle"
              defaultMessage="新建{visTypeName}"
              values={{ visTypeName: this.props.visType.title }}
            />{' '}
            /{' '}
            <FormattedMessage
              id="visualizations.newVisWizard.chooseSourceTitle"
              defaultMessage="选择源"
            />
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <SavedObjectFinderUi
            key="searchSavedObjectFinder"
            onChoose={this.props.onSearchSelected}
            showFilter
            noItemsMessage={i18n.translate(
              'visualizations.newVisWizard.searchSelection.notFoundLabel',
              {
                defaultMessage: '未找到匹配的索引或已保存搜索.',
              }
            )}
            savedObjectMetaData={[
              {
                type: 'search',
                getIconForSavedObject: () => 'search',
                name: i18n.translate(
                  'visualizations.newVisWizard.searchSelection.savedObjectType.search',
                  {
                    defaultMessage: '已保存搜索',
                  }
                ),
              },
              {
                type: 'index-pattern',
                getIconForSavedObject: () => 'indexPatternApp',
                name: i18n.translate(
                  'visualizations.newVisWizard.searchSelection.savedObjectType.indexPattern',
                  {
                    defaultMessage: '索引模式',
                  }
                ),
              },
            ]}
            fixedPageSize={this.fixedPageSize}
            uiSettings={this.props.uiSettings}
            savedObjects={this.props.savedObjects}
          />
        </EuiModalBody>
      </React.Fragment>
    );
  }
}
