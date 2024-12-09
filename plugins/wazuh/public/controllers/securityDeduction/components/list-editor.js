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
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiButton,
  EuiText,
  EuiButtonEmpty,
  EuiFieldText,
  EuiSpacer,
  EuiSelect
} from '@elastic/eui';

import { resourceDictionary, RulesetHandler, RulesetResources } from '../../management/components/management/ruleset/utils/ruleset-handler';

import { getToasts }  from '../../../kibana-services';
import { WzButtonPermissions } from '../../../components/common/permissions/button';

export class WzListEditor extends Component {
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
      fileType: {
        'brute_force': {
          title: '暴力破解黑名单',
          prompt: '请输入源IP。不可输入中文。',
          addPlaceholder: '源IP',
          columns: '源IP',
        },
        'sql_attack': {
          title: 'SQL注入黑名单',
          prompt: '请输入源IP。不可输入中文。',
          addPlaceholder: '源IP',
          columns: '源IP',
        },
        'shellshock': {
          title: 'Shellshock黑名单',
          prompt: '请输入源IP。不可输入中文。',
          addPlaceholder: '源IP',
          columns: '源IP',
        }
      }
    };
    this.items = {};

    this.rulesetHandler = new RulesetHandler(RulesetResources.LISTS);
  }

  componentDidMount() {
    const { listInfo } = this.props;
    const { content } = listInfo;
    this.items = content;
    const items = this.contentToArray(content);
    this.setState({ items});
  }

  /**
   * When getting a CDB list is returned a raw text, this function parses it to an array
   * @param {Object} obj
   */
  contentToArray(obj) {
    const items = [];
    obj.length > 0 && obj.forEach((k, i) => {
      items.push({ index: i, id: k });
    })
    return items;
  }

  /**
   * Transform this.items (an object) into a raw string
   */
  itemsToRaw() {
    let raw = this.items.join('\n');
    if (raw) {
      raw += '\n';
    }
    return raw;
  }

  /**
   * Save the list
   * @param {String} name
   * @param {String} path
   */
  async saveList() {
    try {
      let raw = this.itemsToRaw();
      this.props.toSavePlan(raw);
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
      isPopoverOpen: false,
      addingValue: ''
    });
  };

  onChangeValue = e => {
    this.setState({
      addingValue: e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  onChangeEditingValue = e => {
    this.setState({
      editingValue: e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  /**
   * Append a key value to this.items and after that if everything works ok re-create the array for the table
   */
  addItem() {
    const { addingValue } = this.state;
    if (this.items.indexOf(addingValue) !== -1) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{addingValue}</strong> 已经存在
        </Fragment>,
        3000
      );
      return;
    }
    this.items.push(addingValue)
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      addingValue: ''
    });
  }

  /**
   * Set the new value in the input field when editing a item value (this.props.editingValue)
   */
  setEditedValue() {
    const { editingValue, editing } = this.state;
    if (this.items.indexOf(editingValue) !== -1 && this.items.indexOf(editingValue) !== editing) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{editingValue}</strong> 已经存在
        </Fragment>,
        3000
      );
      return;
    }

    this.items[editing] = editingValue;
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
  deleteItem(index) {
    this.items.splice(index, 1)
    const items = this.contentToArray(this.items);
    this.setState({ items });
  }

  renderAddAndSave() {
    return (
      <Fragment>
        {!this.state.isPopoverOpen && (
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.openAddEntry()}
            >
              新增
            </EuiButton>
          </EuiFlexItem>
        )}
      </Fragment>
    );
  }

  renderAdd() {
    const { addingValue, fileType } = this.state;
    const { listInfo } = this.props;
    const fileMsee = fileType[listInfo.name]

    return (
      <Fragment>
        {this.state.isPopoverOpen && (
          <div>
            <EuiText color="subdued">
              {fileMsee.prompt}
            </EuiText>
            <EuiSpacer size="l" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFieldText
                  fullWidth={true}
                  placeholder={fileMsee.addPlaceholder}
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
                      isDisabled={!addingValue}
                      fill="true"
                      onClick={() => this.addItem()}
                    >
                      新增
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty iconType="cross" onClick={() => this.closeAddEntry()}>
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
              {/* <EuiToolTip position="right" content={'返回列表'}>
                <EuiButtonIcon
                  aria-label="返回"
                  color="primary"
                  iconSize="l"
                  iconType="arrowLeft"
                  onClick={() => this.props.cleanInfo()}
                />
              </EuiToolTip> */}
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

  buildTableColumns(){
    const { fileType } = this.state;
    const { listInfo } = this.props;
    const fileMsee = fileType[listInfo.name]
    return [
      {
        field: 'id',
        name: fileMsee.columns,
        align: 'left',
        render: (value, item) => {
          if (this.state.editing === item.index) {
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
          if (this.state.editing === item.index) {
            return (
              <Fragment>
                <EuiToolTip position="top" content={'确认值'}>
                  <EuiButtonIcon
                    aria-label="确认值"
                    disabled={!this.state.editingValue}
                    iconType="check"
                    onClick={() => {
                      this.setEditedValue();
                    }}
                    color="primary"
                  />
                </EuiToolTip>
                <EuiToolTip position="top" content={'取消编辑'}>
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
                  // permissions={this.getUpdatePermissions(fileName)}
                  tooltip={{position: 'top', content: `编辑该ID`}}
                  onClick={() => {
                    this.setState({
                      editing: item.index,
                      editingValue: item.id
                    });
                  }}
                  color="primary"
                />
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="删除内容"
                  iconType="trash"
                  // permissions={this.getDeletePermissions(fileName)}
                  tooltip={{position: 'top', content: `删除该ID`}}
                  onClick={() => this.deleteItem(item.index)}
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
    const { listInfo, isLoading, error } = this.props;
    const { name } = listInfo;
    const { fileType } = this.state;
    const fileMsee = fileType[name]

    const message = isLoading ? false : '没有结果...';

    return (
      <EuiFlexGroup style={{ flexGrow: 0 }}>
        <EuiFlexItem grow={false} style={{ marginTop: '13px' }} >
          {/* File name and back button when watching or editing a CDB list */}
          <EuiFlexGroup alignItems="center">
            {/* {(!addingNew && this.renderTitle(name, path)) ||
              this.renderInputNameForNewCdbList()} */}
            <EuiFlexItem>
              <EuiTitle size="xs">
                <h4>{fileMsee.title}</h4>
              </EuiTitle>
            </EuiFlexItem>
            {!this.state.editing &&
              this.renderAddAndSave()}
          </EuiFlexGroup>
          {/* CDB list table */}
          {this.renderAdd()}
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem style={{ marginTop: '30px' }}>
                  <EuiInMemoryTable
                    itemId="id"
                    items={this.state.items}
                    columns={this.buildTableColumns()}
                    pagination={{ pageSizeOptions: [10, 15] }}
                    sorting={true}
                    message={message}
                    search={{ box: { incremental: true, placeholder: '过滤' } }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

