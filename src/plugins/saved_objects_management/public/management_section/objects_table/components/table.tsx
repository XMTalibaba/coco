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

import { IBasePath } from 'src/core/public';
import React, { PureComponent, Fragment } from 'react';
import {
  EuiSearchBar,
  EuiBasicTable,
  EuiButton,
  EuiIcon,
  EuiLink,
  EuiSpacer,
  EuiToolTip,
  EuiFormErrorText,
  EuiPopover,
  EuiSwitch,
  EuiFormRow,
  EuiText,
  EuiTableFieldDataColumnType,
  EuiTableActionsColumnType,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { getDefaultTitle, getSavedObjectLabel } from '../../../lib';
import { SavedObjectWithMetadata } from '../../../types';
import {
  SavedObjectsManagementActionServiceStart,
  SavedObjectsManagementAction,
  SavedObjectsManagementColumnServiceStart,
} from '../../../services';

export interface TableProps {
  basePath: IBasePath;
  actionRegistry: SavedObjectsManagementActionServiceStart;
  columnRegistry: SavedObjectsManagementColumnServiceStart;
  selectedSavedObjects: SavedObjectWithMetadata[];
  selectionConfig: {
    onSelectionChange: (selection: SavedObjectWithMetadata[]) => void;
  };
  filterOptions: any[];
  canDelete: boolean;
  onDelete: () => void;
  onActionRefresh: (object: SavedObjectWithMetadata) => void;
  onExport: (includeReferencesDeep: boolean) => void;
  goInspectObject: (obj: SavedObjectWithMetadata) => void;
  pageIndex: number;
  pageSize: number;
  items: SavedObjectWithMetadata[];
  itemId: string | (() => string);
  totalItemCount: number;
  onQueryChange: (query: any) => void;
  onTableChange: (table: any) => void;
  isSearching: boolean;
  onShowRelationships: (object: SavedObjectWithMetadata) => void;
  canGoInApp: (obj: SavedObjectWithMetadata) => boolean;
}

interface TableState {
  isSearchTextValid: boolean;
  parseErrorMessage: any;
  isExportPopoverOpen: boolean;
  isIncludeReferencesDeepChecked: boolean;
  activeAction?: SavedObjectsManagementAction;
  isColumnDataLoaded: boolean;
}

export class Table extends PureComponent<TableProps, TableState> {
  state: TableState = {
    isSearchTextValid: true,
    parseErrorMessage: null,
    isExportPopoverOpen: false,
    isIncludeReferencesDeepChecked: true,
    activeAction: undefined,
    isColumnDataLoaded: false,
  };

  constructor(props: TableProps) {
    super(props);
  }

  componentDidMount() {
    this.loadColumnData();
  }

  loadColumnData = async () => {
    await Promise.all(this.props.columnRegistry.getAll().map((column) => column.loadData()));
    this.setState({ isColumnDataLoaded: true });
  };

  onChange = ({ query, error }: any) => {
    if (error) {
      this.setState({
        isSearchTextValid: false,
        parseErrorMessage: error.message,
      });
      return;
    }

    this.setState({
      isSearchTextValid: true,
      parseErrorMessage: null,
    });
    this.props.onQueryChange({ query });
  };

  closeExportPopover = () => {
    this.setState({ isExportPopoverOpen: false });
  };

  toggleExportPopoverVisibility = () => {
    this.setState((state) => ({
      isExportPopoverOpen: !state.isExportPopoverOpen,
    }));
  };

  toggleIsIncludeReferencesDeepChecked = () => {
    this.setState((state) => ({
      isIncludeReferencesDeepChecked: !state.isIncludeReferencesDeepChecked,
    }));
  };

  onExportClick = () => {
    const { onExport } = this.props;
    const { isIncludeReferencesDeepChecked } = this.state;
    onExport(isIncludeReferencesDeepChecked);
    this.setState({ isExportPopoverOpen: false });
  };

  render() {
    const {
      pageIndex,
      pageSize,
      itemId,
      items,
      totalItemCount,
      isSearching,
      filterOptions,
      selectionConfig: selection,
      onDelete,
      onActionRefresh,
      selectedSavedObjects,
      onTableChange,
      goInspectObject,
      onShowRelationships,
      basePath,
      actionRegistry,
      columnRegistry,
    } = this.props;

    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [5, 10, 20, 50],
    };

    const filters = [
      {
        type: 'field_value_selection',
        field: 'type',
        name: i18n.translate('savedObjectsManagement.objectsTable.table.typeFilterName', {
          defaultMessage: '类型',
        }),
        multiSelect: 'or',
        options: filterOptions,
      },
      // Add this back in once we have tag support
      // {
      //   type: 'field_value_selection',
      //   field: 'tag',
      //   name: 'Tags',
      //   multiSelect: 'or',
      //   options: [],
      // },
    ];

    const columns = [
      {
        field: 'type',
        name: i18n.translate('savedObjectsManagement.objectsTable.table.columnTypeName', {
          defaultMessage: '类型',
        }),
        width: '50px',
        align: 'center',
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.table.columnTypeDescription',
          { defaultMessage: '已保存对象的类型' }
        ),
        sortable: false,
        'data-test-subj': 'savedObjectsTableRowType',
        render: (type: string, object: SavedObjectWithMetadata) => {
          return (
            <EuiToolTip position="top" content={getSavedObjectLabel(type)}>
              <EuiIcon
                aria-label={getSavedObjectLabel(type)}
                type={object.meta.icon || 'apps'}
                size="s"
                data-test-subj="objectType"
              />
            </EuiToolTip>
          );
        },
      } as EuiTableFieldDataColumnType<SavedObjectWithMetadata<any>>,
      {
        field: 'meta.title',
        name: i18n.translate('savedObjectsManagement.objectsTable.table.columnTitleName', {
          defaultMessage: '标题',
        }),
        description: i18n.translate(
          'savedObjectsManagement.objectsTable.table.columnTitleDescription',
          { defaultMessage: '已保存对象的标题' }
        ),
        dataType: 'string',
        sortable: false,
        'data-test-subj': 'savedObjectsTableRowTitle',
        render: (title: string, object: SavedObjectWithMetadata) => {
          const { path = '' } = object.meta.inAppUrl || {};
          const canGoInApp = this.props.canGoInApp(object);
          if (!canGoInApp) {
            return <EuiText size="s">{title || getDefaultTitle(object)}</EuiText>;
          }
          return (
            <EuiLink href={basePath.prepend(path)}>{title || getDefaultTitle(object)}</EuiLink>
          );
        },
      } as EuiTableFieldDataColumnType<SavedObjectWithMetadata<any>>,
      ...columnRegistry.getAll().map((column) => {
        return {
          ...column.euiColumn,
          sortable: false,
          'data-test-subj': `savedObjectsTableColumn-${column.id}`,
        };
      }),
      {
        name: i18n.translate('savedObjectsManagement.objectsTable.table.columnActionsName', {
          defaultMessage: '操作',
        }),
        width: '80px',
        actions: [
          // {
          //   name: i18n.translate(
          //     'savedObjectsManagement.objectsTable.table.columnActions.inspectActionName',
          //     { defaultMessage: 'Inspect' }
          //   ),
          //   description: i18n.translate(
          //     'savedObjectsManagement.objectsTable.table.columnActions.inspectActionDescription',
          //     { defaultMessage: 'Inspect this saved object' }
          //   ),
          //   type: 'icon',
          //   icon: 'inspect',
          //   onClick: (object) => goInspectObject(object),
          //   available: (object) => !!object.meta.editUrl,
          //   'data-test-subj': 'savedObjectsTableAction-inspect',
          // },
          // {
          //   name: i18n.translate(
          //     'savedObjectsManagement.objectsTable.table.columnActions.viewRelationshipsActionName',
          //     { defaultMessage: 'Relationships' }
          //   ),
          //   description: i18n.translate(
          //     'savedObjectsManagement.objectsTable.table.columnActions.viewRelationshipsActionDescription',
          //     {
          //       defaultMessage:
          //         'View the relationships this saved object has to other saved objects',
          //     }
          //   ),
          //   type: 'icon',
          //   icon: 'kqlSelector',
          //   onClick: (object) => onShowRelationships(object),
          //   'data-test-subj': 'savedObjectsTableAction-relationships',
          // },
          // ...actionRegistry.getAll().map((action) => {
          //   return {
          //     ...action.euiAction,
          //     'data-test-subj': `savedObjectsTableAction-${action.id}`,
          //     onClick: (object: SavedObjectWithMetadata) => {
          //       this.setState({
          //         activeAction: action,
          //       });

          //       action.registerOnFinishCallback(() => {
          //         this.setState({
          //           activeAction: undefined,
          //         });
          //         const { refreshOnFinish = () => false } = action;
          //         if (refreshOnFinish()) {
          //           onActionRefresh(object);
          //         }
          //       });

          //       if (action.euiAction.onClick) {
          //         action.euiAction.onClick(object as any);
          //       }
          //     },
          //   };
          // }),
        ],
      } as EuiTableActionsColumnType<SavedObjectWithMetadata>,
    ];

    let queryParseError;
    if (!this.state.isSearchTextValid) {
      const parseErrorMsg = i18n.translate(
        'savedObjectsManagement.objectsTable.searchBar.unableToParseQueryErrorMessage',
        { defaultMessage: '无法解析查询' }
      );
      queryParseError = (
        <EuiFormErrorText>{`${parseErrorMsg}. ${this.state.parseErrorMessage}`}</EuiFormErrorText>
      );
    }

    const button = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        onClick={this.toggleExportPopoverVisibility}
        isDisabled={selectedSavedObjects.length === 0}
      >
        <FormattedMessage
          id="savedObjectsManagement.objectsTable.table.exportPopoverButtonLabel"
          defaultMessage="导入"
        />
      </EuiButton>
    );

    const activeActionContents = this.state.activeAction?.render() ?? null;

    return (
      <Fragment>
        {activeActionContents}
        <EuiSearchBar
          box={{ 'data-test-subj': 'savedObjectSearchBar' }}
          filters={filters as any}
          onChange={this.onChange}
          toolsRight={[
            <EuiButton
              key="deleteSO"
              iconType="trash"
              color="danger"
              onClick={onDelete}
              isDisabled={selectedSavedObjects.length === 0 || !this.props.canDelete}
              title={
                this.props.canDelete
                  ? undefined
                  : i18n.translate('savedObjectsManagement.objectsTable.table.deleteButtonTitle', {
                      defaultMessage: '无法删除已保存的对象',
                    })
              }
              data-test-subj="savedObjectsManagementDelete"
            >
              <FormattedMessage
                id="savedObjectsManagement.objectsTable.table.deleteButtonLabel"
                defaultMessage="删除"
              />
            </EuiButton>,
            <EuiPopover
              key="exportSOOptions"
              button={button}
              isOpen={this.state.isExportPopoverOpen}
              closePopover={this.closeExportPopover}
            >
              <EuiFormRow
                label={
                  <FormattedMessage
                    id="savedObjectsManagement.objectsTable.exportObjectsConfirmModal.exportOptionsLabel"
                    defaultMessage="选项"
                  />
                }
              >
                <EuiSwitch
                  name="includeReferencesDeep"
                  label={
                    <FormattedMessage
                      id="savedObjectsManagement.objectsTable.exportObjectsConfirmModal.includeReferencesDeepLabel"
                      defaultMessage="包括相关对象"
                    />
                  }
                  checked={this.state.isIncludeReferencesDeepChecked}
                  onChange={this.toggleIsIncludeReferencesDeepChecked}
                />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton key="exportSO" iconType="exportAction" onClick={this.onExportClick} fill>
                  <FormattedMessage
                    id="savedObjectsManagement.objectsTable.table.exportButtonLabel"
                    defaultMessage="导出"
                  />
                </EuiButton>
              </EuiFormRow>
            </EuiPopover>,
          ]}
        />
        {queryParseError}
        <EuiSpacer size="s" />
        <div data-test-subj="savedObjectsTable">
          <EuiBasicTable
            loading={isSearching}
            itemId={itemId}
            items={items}
            columns={columns as any}
            pagination={pagination}
            selection={selection}
            onChange={onTableChange}
            rowProps={(item) => ({
              'data-test-subj': `savedObjectsTableRow row-${item.id}`,
            })}
            noItemsMessage="无数据"
          />
        </div>
      </Fragment>
    );
  }
}
