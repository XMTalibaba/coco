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

import React, { Component } from 'react';
import {
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiIcon,
  EuiCallOut,
  EuiLoadingElastic,
  EuiInMemoryTable,
  EuiToolTip,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';
import { SearchFilterConfig } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { IBasePath } from 'src/core/public';
import { getDefaultTitle, getSavedObjectLabel } from '../../../lib';
import { SavedObjectWithMetadata, SavedObjectRelation } from '../../../types';

export interface RelationshipsProps {
  basePath: IBasePath;
  getRelationships: (type: string, id: string) => Promise<SavedObjectRelation[]>;
  savedObject: SavedObjectWithMetadata;
  close: () => void;
  goInspectObject: (obj: SavedObjectWithMetadata) => void;
  canGoInApp: (obj: SavedObjectWithMetadata) => boolean;
}

export interface RelationshipsState {
  relationships: SavedObjectRelation[];
  isLoading: boolean;
  error?: string;
}

export class Relationships extends Component<RelationshipsProps, RelationshipsState> {
  constructor(props: RelationshipsProps) {
    super(props);

    this.state = {
      relationships: [],
      isLoading: false,
      error: undefined,
    };
  }

  UNSAFE_componentWillMount() {
    this.getRelationshipData();
  }

  UNSAFE_componentWillReceiveProps(nextProps: RelationshipsProps) {
    if (nextProps.savedObject.id !== this.props.savedObject.id) {
      this.getRelationshipData();
    }
  }

  async getRelationshipData() {
    const { savedObject, getRelationships } = this.props;

    this.setState({ isLoading: true });

    try {
      const relationships = await getRelationships(savedObject.type, savedObject.id);
      this.setState({ relationships, isLoading: false, error: undefined });
    } catch (err) {
      this.setState({ error: err.message, isLoading: false });
    }
  }

  renderError() {
    const { error } = this.state;

    if (!error) {
      return null;
    }

    return (
      <EuiCallOut
        title={
          <FormattedMessage
            id="savedObjectsManagement.objectsTable.relationships.renderErrorMessage"
            defaultMessage="错误"
          />
        }
        color="danger"
      >
        {error}
      </EuiCallOut>
    );
  }

  renderRelationships() {
    const { goInspectObject, savedObject, basePath } = this.props;
    const { relationships, isLoading, error } = this.state;

    if (error) {
      return this.renderError();
    }

    if (isLoading) {
      return <EuiLoadingElastic size="xl" />;
    }

    const columns = [
      {
        field: 'type',
        name: i18n.translate('savedObjectsManagement.objectsTable.relationships.columnTypeName', {
          defaultMessage: '类型',
        }),
        width: '50px',
        align: 'center',
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.relationships.columnTypeDescription',
          { defaultMessage: '已保存对象的类型' }
        ),
        sortable: false,
        render: (type: string, object: SavedObjectWithMetadata) => {
          return (
            <EuiToolTip position="top" content={getSavedObjectLabel(type)}>
              <EuiIcon
                aria-label={getSavedObjectLabel(type)}
                type={object.meta.icon || 'apps'}
                size="s"
                data-test-subj="relationshipsObjectType"
              />
            </EuiToolTip>
          );
        },
      },
      {
        field: 'relationship',
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.relationships.columnRelationshipName',
          { defaultMessage: '直接关系' }
        ),
        dataType: 'string',
        sortable: false,
        width: '125px',
        'data-test-subj': 'directRelationship',
        render: (relationship: string) => {
          if (relationship === 'parent') {
            return (
              <EuiText size="s">
                <FormattedMessage
                  id="savedObjectsManagement.objectsTable.relationships.columnRelationship.parentAsValue"
                  defaultMessage="父对象"
                />
              </EuiText>
            );
          }
          if (relationship === 'child') {
            return (
              <EuiText size="s">
                <FormattedMessage
                  id="savedObjectsManagement.objectsTable.relationships.columnRelationship.childAsValue"
                  defaultMessage="子对象"
                />
              </EuiText>
            );
          }
        },
      },
      {
        field: 'meta.title',
        name: i18n.translate('savedObjectsManagement.objectsTable.relationships.columnTitleName', {
          defaultMessage: '标题',
        }),
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.relationships.columnTitleDescription',
          { defaultMessage: '已保存对象的标题' }
        ),
        dataType: 'string',
        sortable: false,
        render: (title: string, object: SavedObjectWithMetadata) => {
          const { path = '' } = object.meta.inAppUrl || {};
          const canGoInApp = this.props.canGoInApp(object);
          if (!canGoInApp) {
            return (
              <EuiText size="s" data-test-subj="relationshipsTitle">
                {title || getDefaultTitle(object)}
              </EuiText>
            );
          }
          return (
            <EuiLink href={basePath.prepend(path)} data-test-subj="relationshipsTitle">
              {title || getDefaultTitle(object)}
            </EuiLink>
          );
        },
      },
      {
        name: i18n.translate(
          'savedObjectsManagement.objectsTable.relationships.columnActionsName',
          { defaultMessage: '操作' }
        ),
        actions: [
          {
            name: i18n.translate(
              'savedObjectsManagement.objectsTable.relationships.columnActions.inspectActionName',
              { defaultMessage: '检查' }
            ),
            description: i18n.translate(
              'savedObjectsManagement.objectsTable.relationships.columnActions.inspectActionDescription',
              { defaultMessage: '检查已保存的对象' }
            ),
            type: 'icon',
            icon: 'inspect',
            'data-test-subj': 'relationshipsTableAction-inspect',
            onClick: (object: SavedObjectWithMetadata) => goInspectObject(object),
            available: (object: SavedObjectWithMetadata) => !!object.meta.editUrl,
          },
        ],
      },
    ];

    const filterTypesMap = new Map(
      relationships.map((relationship) => [
        relationship.type,
        {
          value: relationship.type,
          name: relationship.type,
          view: relationship.type,
        },
      ])
    );

    const search = {
      filters: [
        {
          type: 'field_value_selection',
          field: 'relationship',
          name: i18n.translate(
            'savedObjectsManagement.objectsTable.relationships.search.filters.relationship.name',
            { defaultMessage: '直接关系' }
          ),
          multiSelect: 'or',
          options: [
            {
              value: 'parent',
              name: 'parent',
              view: i18n.translate(
                'savedObjectsManagement.objectsTable.relationships.search.filters.relationship.parentAsValue.view',
                { defaultMessage: '父对象' }
              ),
            },
            {
              value: 'child',
              name: 'child',
              view: i18n.translate(
                'savedObjectsManagement.objectsTable.relationships.search.filters.relationship.childAsValue.view',
                { defaultMessage: '子对象' }
              ),
            },
          ],
        },
        {
          type: 'field_value_selection',
          field: 'type',
          name: i18n.translate(
            'savedObjectsManagement.objectsTable.relationships.search.filters.type.name',
            { defaultMessage: '类型' }
          ),
          multiSelect: 'or',
          options: [...filterTypesMap.values()],
        },
      ] as SearchFilterConfig[],
    };

    return (
      <div>
        <EuiCallOut>
          <p>
            {i18n.translate(
              'savedObjectsManagement.objectsTable.relationships.relationshipsTitle',
              {
                defaultMessage:
                  '以下是与 {title} 相关的已保存对象。删除此 {type} 将影响其父对象，但不会影响其子对象.',
                values: {
                  type: savedObject.type,
                  title: savedObject.meta.title || getDefaultTitle(savedObject),
                },
              }
            )}
          </p>
        </EuiCallOut>
        <EuiSpacer />
        <EuiInMemoryTable
          items={relationships}
          columns={columns as any}
          pagination={true}
          search={search}
          rowProps={() => ({
            'data-test-subj': `relationshipsTableRow`,
          })}
        />
      </div>
    );
  }

  render() {
    const { close, savedObject } = this.props;

    return (
      <EuiFlyout onClose={close}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2>
              <EuiToolTip position="top" content={getSavedObjectLabel(savedObject.type)}>
                <EuiIcon
                  aria-label={getSavedObjectLabel(savedObject.type)}
                  size="m"
                  type={savedObject.meta.icon || 'apps'}
                />
              </EuiToolTip>
              &nbsp;&nbsp;
              {savedObject.meta.title || getDefaultTitle(savedObject)}
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>{this.renderRelationships()}</EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
