/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment } from 'react';
import {
  EuiInMemoryTable,
  EuiPage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiButton,
  EuiText,
  EuiButtonEmpty,
  EuiPopover,
  EuiFieldText,
  EuiSpacer,
  EuiPanel
} from '@elastic/eui';

import { connect } from 'react-redux';

import {
  cleanInfo,
  updateListContent
} from '../../../../../redux/actions/rulesetActions';

import { resourceDictionary, RulesetHandler, RulesetResources } from './utils/ruleset-handler';

import { getToasts }  from '../../../../../kibana-services';

import exportCsv from '../../../../../react-services/wz-csv';

import { updateWazuhNotReadyYet } from '../../../../../redux/actions/appStateActions';
import WzRestartClusterManagerCallout from '../../../../../components/common/restart-cluster-manager-callout';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button';

class WzListEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isSaving: false,
      editing: false,
      isPopoverOpen: false,
      addingKey: '',
      addingValue: '',
      editingValue: '',
      newListName: '',
      showWarningRestart: false
    };
    this.items = {};

    this.rulesetHandler = new RulesetHandler(RulesetResources.LISTS);
  }

  componentDidMount() {
    const { listInfo } = this.props.state;
    const { content } = listInfo;
    const obj = this.contentToObject(content);
    this.items = { ...obj };
    const items = this.contentToArray(obj);
    this.setState({ items });
  }

  /**
   * When getting a CDB list is returned a raw text, this function parses it to an array
   * @param {Object} obj
   */
  contentToArray(obj) {
    const items = [];
    for (const key in obj) {
      const value = obj[key];
      items.push(Object.assign({ key, value }));
    }
    return items;
  }

  /**
   * Save in the state as object the items for an easy modification by key-value
   * @param {String} content
   */
  contentToObject(content) {
    const items = {};
    const lines = content.split('\n');
    lines.forEach(line => {
      const split = line.split(':');
      const key = split[0];
      const value = split[1] || '';
      if (key) items[key] = value; // Prevent add empty keys
    });
    return items;
  }

  /**
   * Transform this.items (an object) into a raw string
   */
  itemsToRaw() {
    let raw = '';
    Object.keys(this.items).forEach(key => {
      raw = raw
        ? `${raw}\n${key}:${this.items[key]}`
        : `${key}:${this.items[key]}`;
    });
    return raw;
  }

  /**
   * Save the list
   * @param {String} name
   * @param {String} path
   */
  async saveList(name, path, addingNew = false) {
    try {
      if (!name) {
        this.showToast(
          'warning',
          '无效名称',
          'CDB列表名称不能为空',
          3000
        );
        return;
      }
      name = name.endsWith('.cdb')
      ? name.replace('.cdb', '')
      : name;
      const overwrite = addingNew; // If adding new disable the overwrite
      const raw = this.itemsToRaw();
      if (!raw) {
        this.showToast(
          'warning',
          '请插入至少一项',
          '请插入至少一项，CDB列表不能为空',
          3000
        );
        return;
      }
      this.setState({ isSaving: true });
      await this.rulesetHandler.updateFile(name, raw, overwrite);
      if (!addingNew) {
        const file = { name: name, content: raw, path: path };
        this.props.updateListContent(file);
        this.setState({ showWarningRestart: true });
        this.showToast(
          'success',
          '成功',
          'CBD列表创建成功',
          3000
        );
      } else {
        this.setState({ showWarningRestart: true });
        this.showToast('success', '成功', 'CBD列表更新', 3000);
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        'CBD列表保存失败: ' + error,
        3000
      );
    }
    this.setState({ isSaving: false });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  openAddEntry = () => {
    this.setState({
      isPopoverOpen: true
    });
  };

  closeAddEntry = () => {
    this.setState({
      isPopoverOpen: false
    });
  };

  onChangeKey = e => {
    this.setState({
      addingKey: e.target.value
    });
  };

  onChangeValue = e => {
    this.setState({
      addingValue: e.target.value
    });
  };

  onChangeEditingValue = e => {
    this.setState({
      editingValue: e.target.value
    });
  };

  onNewListNameChange = e => {
    this.setState({
      newListName: e.target.value
    });
  };

  getUpdatePermissions = (name) => {
    return [{
      action: `${RulesetResources.LISTS}:update`,
      resource: resourceDictionary[RulesetResources.LISTS].permissionResource(name),
    }];
  }

  getDeletePermissions = (name) => {
    return [{
      action: `${RulesetResources.LISTS}:delete`,
      resource: resourceDictionary[RulesetResources.LISTS].permissionResource(name),
    }];
  }

  /**
   * Append a key value to this.items and after that if everything works ok re-create the array for the table
   */
  addItem() {
    const { addingKey, addingValue } = this.state;
    if (!addingKey || Object.keys(this.items).includes(addingKey)) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{addingKey}</strong> key已经存在
        </Fragment>,
        3000
      );
      return;
    }
    this.items[addingKey] = addingValue;
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      addingKey: '',
      addingValue: ''
    });
  }

  /**
   * Set the new value in the input field when editing a item value (this.props.editingValue)
   */
  setEditedValue() {
    const key = this.state.editing;
    const value = this.state.editingValue;
    this.items[key] = value;
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      editing: false,
      editingValue: '',
      generatingCsv: false
    });
  }
  

  /**
   * Delete a item from the list
   * @param {String} key
   */
  deleteItem(key) {
    delete this.items[key];
    const items = this.contentToArray(this.items);
    this.setState({ items });
  }

  /**
   * Render an input in order to set a cdb list name
   */
  renderInputNameForNewCdbList() {
    return (
      <Fragment>
        <EuiFlexItem grow={false}>
          <EuiTitle>
            <h2>
              <EuiToolTip position="right" content={'返回列表'}>
                <EuiButtonIcon
                  aria-label="返回"
                  color="primary"
                  iconSize="l"
                  iconType="arrowLeft"
                  onClick={() => this.props.cleanInfo()}
                />
              </EuiToolTip>
              {name}
            </h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: '-5px !important' }}>
          <EuiFieldText
            fullWidth={true}
            style={{ marginLeft: '-18px', width: 'calc(100% - 28px)' }}
            placeholder="新的CDB列表名称"
            value={this.state.newListName}
            onChange={this.onNewListNameChange}
            aria-label="当没有实际使用标签时，使用aria-label"
          />
        </EuiFlexItem>
      </Fragment>
    );
  }

  /**
   * Render an add buton with a popover to add new key and values and the save button for saving the list changes
   * @param {String} name
   * @param {String} path
   */
  renderAddAndSave(name, path, newList = false, items = []) {

    const saveButton = (
      <WzButtonPermissions
        permissions={this.getUpdatePermissions(name)}
        fill
        isDisabled={items.length === 0}
        iconType="save"
        isLoading={this.state.isSaving}
        onClick={async () => this.saveList(name, path, newList)}
      >
        保存
      </WzButtonPermissions>
    );

    return (
      <Fragment>
        {!this.state.isPopoverOpen && (
          <EuiFlexItem grow={false}>
            <WzButtonPermissions
              permissions={this.getUpdatePermissions(name)}
              iconType="plusInCircle"
              onClick={() => this.openAddEntry()}
            >
              添加新条目
            </WzButtonPermissions>
          </EuiFlexItem>
        )}
        {/* Save button */}
        <EuiFlexItem grow={false}>{saveButton}</EuiFlexItem>
      </Fragment>
    );
  }

  renderAdd() {
    const { addingKey, addingValue } = this.state;

    return (
      <Fragment>
        {this.state.isPopoverOpen && (
          <div>
            <EuiSpacer size="l" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFieldText
                  fullWidth={true}
                  placeholder="Key"
                  value={addingKey}
                  onChange={this.onChangeKey}
                  aria-label="当没有实际使用标签时，使用aria-label"
                />
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFieldText
                  fullWidth={true}
                  placeholder="Value"
                  value={addingValue}
                  onChange={this.onChangeValue}
                  aria-label="当没有实际使用标签时，使用aria-label"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="plusInCircle"
                      isDisabled={!addingKey}
                      fill
                      onClick={() => this.addItem()}
                    >
                      新增
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty onClick={() => this.closeAddEntry()}>
                      关闭
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * Render the list name, path, and back button
   * @param {String} name
   * @param {String} path
   */
  renderTitle(name, path) {
    return (
      <Fragment>
        <EuiFlexItem grow={false}>
          <EuiTitle>
            <span style={{ fontSize: '22px' }}>
              <EuiToolTip position="right" content={'返回列表'}>
                <EuiButtonIcon
                  aria-label="返回"
                  color="primary"
                  iconSize="l"
                  iconType="arrowLeft"
                  onClick={() => this.props.cleanInfo()}
                />
              </EuiToolTip>
              {name}
            </span>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginLeft: '-5px !important' }}>
          <EuiText color="subdued" style={{ marginTop: '10px' }}>
            {path}
          </EuiText>
        </EuiFlexItem>
      </Fragment>
    );
  }

  buildTableColumns(fileName, path){
    return [
      {
        field: 'key',
        name: 'Key',
        align: 'left',
        sortable: true
      },
      {
        field: 'value',
        name: 'Value',
        align: 'left',
        sortable: true,
        render: (value, item) => {
          if (this.state.editing === item.key) {
            return (
              <EuiFieldText
                placeholder="新的值"
                value={this.state.editingValue}
                onChange={this.onChangeEditingValue}
                aria-label="当没有实际使用标签时，使用aria-label"
              />
            );
          } else {
            return <span>{value}</span>;
          }
        }
      },
      {
        name: '操作',
        align: 'left',
        render: item => {
          if (this.state.editing === item.key) {
            return (
              <Fragment>
                <EuiToolTip position="top" content={'Save'}>
                  <EuiButtonIcon
                    aria-label="确认值"
                    iconType="check"
                    onClick={() => {
                      this.setEditedValue();
                    }}
                    color="primary"
                  />
                </EuiToolTip>
                <EuiToolTip position="top" content={'Discard'}>
                  <EuiButtonIcon
                    aria-label="取消编辑"
                    iconType="cross"
                    onClick={() => this.setState({ editing: false })}
                    color="danger"
                  />
                </EuiToolTip>
              </Fragment>
            );
          } else {
            return (
              <Fragment>
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="编辑内容"
                  iconType="pencil"
                  permissions={this.getUpdatePermissions(fileName)}
                  tooltip={{position: 'top', content: `编辑${item.key}`}}
                  onClick={() => {
                    this.setState({
                      editing: item.key,
                      editingValue: item.value
                    });
                  }}
                  color="primary"
                />
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="删除内容"
                  iconType="trash"
                  permissions={this.getDeletePermissions(fileName)}
                  tooltip={{position: 'top', content: `删除${item.key}`}}
                  onClick={() => this.deleteItem(item.key)}
                  color="danger"
                />
              </Fragment>
            );
          }
        }
      }
    ];
  }

  //isDisabled={nameForSaving.length <= 4}
  render() {
    const { listInfo, isLoading, error } = this.props.state;
    const { name, path } = listInfo;

    const message = isLoading ? false : '没有结果...';
    const columns = this.columns;

    const addingNew = name === false || !name;
    const listName = this.state.newListName || name;

    return (
      <EuiPage style={{ background: 'transparent' }}>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem>
              {/* File name and back button when watching or editing a CDB list */}
              <EuiFlexGroup>
                {(!addingNew && this.renderTitle(name, path)) ||
                  this.renderInputNameForNewCdbList()}
                <EuiFlexItem />
                {/* This flex item is for separating between title and save button */}
                {/* Pop over to add new key and value */}
                {!addingNew && (
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="exportAction"
                      isDisabled={this.state.generatingCsv}
                      isLoading={this.state.generatingCsv}
                      onClick={async () => {
                        try {
                          this.setState({ generatingCsv: true });
                          await exportCsv(
                            `/lists`,
                            [
                              {
                                _isCDBList: true,
                                name: 'relative_dirname',
                                value: path
                              },
                              {
                                _isCDBList: true,
                                name: 'filename',
                                value: name
                              }
                            ],
                            name
                          );
                          this.setState({ generatingCsv: false });
                        } catch (error) {
                          this.setState({ generatingCsv: false });
                        }
                      }}
                    >
                      导出
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                )}
                {!this.state.editing &&
                  this.renderAddAndSave(
                    listName,
                    path,
                    !addingNew,
                    this.state.items
                  )}
              </EuiFlexGroup>
              {this.state.showWarningRestart && (
                <Fragment>
                  <EuiSpacer size='s'/>
                  <WzRestartClusterManagerCallout
                    onRestart={() => this.setState({showWarningRestart: true})}
                    onRestarted={() => this.setState({showWarningRestart: false})}
                    onRestartedError={() => this.setState({showWarningRestart: true})}
                  />
                </Fragment>
              )}
              {/* CDB list table */}
              {this.renderAdd()}
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFlexGroup>
                    <EuiFlexItem style={{ marginTop: '30px' }}>
                      <EuiInMemoryTable
                        itemId="id"
                        items={this.state.items}
                        columns={this.buildTableColumns(name, path)}
                        pagination={{ pageSizeOptions: [10, 15] }}
                        sorting={true}
                        message={message}
                        search={{ box: { incremental: true } }}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiPage>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    cleanInfo: () => dispatch(cleanInfo()),
    updateListContent: content => dispatch(updateListContent(content)),
    updateWazuhNotReadyYet: wazuhNotReadyYet => dispatch(updateWazuhNotReadyYet(wazuhNotReadyYet))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzListEditor);
