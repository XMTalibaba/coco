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
  EuiPanel,
  EuiSelect,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';

import { connect } from 'react-redux';
import store from '../../../redux/store';

import {
  cleanInfo,
  updateListContent
} from '../../../redux/actions/rulesetActions';

import { resourceDictionary, RulesetHandler, RulesetResources } from '../../management/components/management/ruleset/utils/ruleset-handler';

import { getToasts }  from '../../../kibana-services';

import exportCsv from '../../../react-services/wz-csv';

import { updateWazuhNotReadyYet } from '../../../redux/actions/appStateActions';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { WzRequest } from '../../../react-services/wz-request';

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
      showWarningRestart: false,
      fileType: {
        'suspicious-programs': {
          title: '高危指令黑名单',
          prompt: '配置如 key: value(监控命令: 风险等级)，风险等级red为高危系统命令告警，yellow为一般系统命令告警。不可输入中文。',
          isValueColumn: true,
          keyColumnLabel: '监控命令',
          valueColumnLabel: '风险等级',
          csvKey: ['key', 'value'], // 导出csv的列
          csvKeyContrast: { // 导出csv的列的另外对应
            key: 'monitor_command',
            value: 'risk_level'
          },
          isSelect: true,
          selectOptions: [
            { value: '', text: '请选择' },
            { value: 'yellow', text: 'yellow' },
            { value: 'red', text: 'red' }
          ]
        },
        'allowed_network_connections': {
          title: '非法外联白名单',
          prompt: '配置网络UUID。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '网络UUID',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'network_UUID'
          }
        },
        'reverse-shell': {
          title: '反弹shell白名单',
          prompt: '配置主机ID。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '主机ID',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'host_name'
          }
        },
        'suid-change': {
          title: '本地提权白名单',
          prompt: '配置主机ID。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '主机ID',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'host_name'
          }
        },
        'SSH_IPList': {
          title: '暴力破解白名单',
          prompt: '请输入源IP。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '源IP',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'source_IP'
          }
        },
        'dangerous_port_list': {
          title: '高危端口黑名单',
          prompt: '配置端口号。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '端口号',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'port'
          }
        },
        'valid_accounts': {
          title: '合法账号列表',
          prompt: '配置合法账号。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '合法账号',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'valid_accounts'
          }
        },
        'valid_IP': {
          title: '合法IP列表',
          prompt: '配置合法IP。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '合法IP',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'valid_IP'
          }
        },
        'allowed_cves': {
          title: '漏洞白名单列表',
          prompt: '配置忽略漏洞。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: '忽略漏洞',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'allowed_cves'
          }
        },
        'valid_wifi': {
          title: '合法无线网络列表',
          prompt: '配置wifi名称。',
          isValueColumn: false,
          valueColumnLabel: 'wifi名称',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'valid_wifi'
          }
        },
        'valid_lan': {
          title: '合法有线网络列表',
          prompt: '配置MAC地址。不可输入中文。',
          isValueColumn: false,
          valueColumnLabel: 'MAC地址',
          csvKey: ['key'],
          csvKeyContrast: {
            key: 'valid_lan'
          }
        },
      },
      deleteKey: '',
      isDeleteModalVisible: false
    };
    this.items = {};

    this.rulesetHandler = new RulesetHandler(RulesetResources.LISTS);
  }

  componentDidMount() {
    const { listInfo } = this.props;
    const { content } = listInfo;
    let contentNew = '';
    const { fileType } = this.state;
    const fileMsee = fileType[listInfo.name]
    if (!fileMsee.isValueColumn) { // 如果是非法外联，反弹shell，本地提权，暴力破解。需要把key，value暂时转换。保存时再转换回来
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        const split = line.split(':');
        const key = split[0];
        const value = split[1] || '';
        contentNew = contentNew
          ? `${contentNew}\n${value}:${key}`
          : `${value}:${key}`;
      });
    }
    else {
      contentNew = content;
    }

    const obj = this.contentToObject(contentNew);
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
    const { fileType } = this.state;
    const { listInfo } = this.props;
    const fileMsee = fileType[listInfo.name]
    const items = {};
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      const split = line.split(':');
      const key = split[0];
      const value = split[1] || '';
      if (!fileMsee.isValueColumn && value) {
        items[i] = value;
      }
      else if (key) {
        items[key] = value;
      }
      // if (key) items[key] = value; // Prevent add empty keys
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
   */
  async saveList(name) {
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
      let raw = this.itemsToRaw();

      const { fileType } = this.state;
      const { listInfo } = this.props;
      const fileMsee = fileType[listInfo.name]
      if (!fileMsee.isValueColumn) { // 如果是非法外联，反弹shell，本地提权，暴力破解。查询时需要把key，value暂时转换。保存时再转换回来
        const items = {};
        const lines = raw ? raw.split('\n') : [];
        lines.forEach((line, i) => {
          const split = line.split(':');
          const key = split[0];
          const value = split[1] || '';
          items[value] = key;
        });
    
        let rawNew = '';
        Object.keys(items).forEach(key => {
          rawNew = rawNew
            ? `${rawNew}\n${key}:${items[key]}`
            : `${key}:${items[key]}`;
        });
        raw = rawNew;
      }

      this.setState({ isSaving: true });
      if (!raw) {
        await this.rulesetHandler.deleteFile(name);
      }
      else {
        await this.rulesetHandler.updateFile(name, raw, true);
      }
      this.setState({ showWarningRestart: true });
      this.showToast('success', '成功', 'CBD列表更新', 3000);
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
      addingKey: '',
      addingValue: ''
    });
  };

  onChangeKey = e => {
    this.setState({
      addingKey: e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  onChangeValue = e => {
    const { listInfo } = this.props;
    const chineseAllow = ['valid_wifi'];
    this.setState({
      addingValue: chineseAllow.indexOf(listInfo.name) !== -1 ? e.target.value : e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  onSelectChange = e => {
    this.setState({
      addingValue: e.target.value
    });
  }

  onChangeEditingValue = e => {
    const { listInfo } = this.props;
    const chineseAllow = ['valid_wifi'];
    this.setState({
      editingValue: chineseAllow.indexOf(listInfo.name) !== -1 ? e.target.value : e.target.value.replace(/[^\x00-\xff]/g, '')
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
    const { addingKey, addingValue, items, fileType } = this.state;
    const { listInfo } = this.props;
    const { name, path } = listInfo;
    const fileMsee = fileType[listInfo.name]
    if (!fileMsee.isValueColumn) {
      if (Object.values(this.items).includes(addingValue)) {
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
      const obj = this.contentToObject(this.itemsToRaw());
      this.items = { ...obj };
      this.items[items.length] = addingValue;
    }
    else {
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
    }
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      addingKey: '',
      addingValue: ''
    });

    this.saveList(name)
  }

  /**
   * Set the new value in the input field when editing a item value (this.props.editingValue)
   */
  setEditedValue() {
    const key = this.state.editing;
    const value = this.state.editingValue;
    if (this.items[key] === value) {
      this.setState({
        editing: false,
        editingValue: '',
        generatingCsv: false
      });
    }
    else {
      this.items[key] = value;
      const itemsArr = this.contentToArray(this.items);
      this.setState({
        items: itemsArr,
        editing: false,
        editingValue: '',
        generatingCsv: false
      });

      const { listInfo } = this.props;
      const { name } = listInfo;
      this.saveList(name)
    }
  }

  setEditedValueNoValue() {
    const key = this.state.editing;
    const value = this.state.editingValue;
    if (Object.keys(this.items).find(k => k !== key && this.items[k] === value)) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{value}</strong> 已经存在
        </Fragment>,
        3000
      );
      return;
    }

    if (this.items[key] === value) {
      this.setState({
        editing: false,
        editingValue: '',
        generatingCsv: false
      });
    }
    else {
      this.items[key] = value;
      const itemsArr = this.contentToArray(this.items);
      this.setState({
        items: itemsArr,
        editing: false,
        editingValue: '',
        generatingCsv: false
      });

      const { listInfo } = this.props;
      const { name } = listInfo;
      this.saveList(name)
    }
  }
  

  /**
   * Delete a item from the list
   * @param {String} key
   */
  deleteItem() {
    const { deleteKey } = this.state;
    delete this.items[deleteKey];
    const items = this.contentToArray(this.items);
    this.setState({ items });

    const { listInfo } = this.props;
    const { name } = listInfo;
    this.saveList(name)
    this.setDeleteModal(false);
  }

  toShowDeleteModal(item) {
    this.setState({ deleteKey: item });
    this.setDeleteModal(true);
  }
  setDeleteModal(type) {
    this.setState({isDeleteModalVisible: type});
    if (!type) this.setState({ deleteKey: '' });
  };

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
  renderAddAndSave(name) {

    const saveButton = (
      <EuiButton
        size="s"
        onClick={async () => this.saveList(name)}
      >
        保存
      </EuiButton>
    );

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
        {/* Save button */}
        {/* <EuiFlexItem grow={false}>{saveButton}</EuiFlexItem> */}
      </Fragment>
    );
  }

  renderAdd() {
    const { addingKey, addingValue, fileType } = this.state;
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
                  placeholder={fileMsee.keyColumnLabel}
                  value={addingKey}
                  onChange={this.onChangeKey}
                  aria-label="当没有实际使用标签时，使用aria-label"
                />
              </EuiFlexItem>

              <EuiFlexItem>
                { fileMsee.isSelect && (
                  <EuiSelect
                    fullWidth={true}
                    options={fileMsee.selectOptions}
                    value={addingValue}
                    onChange={this.onSelectChange}
                  />
                )}
                { !fileMsee.isSelect && (
                  <EuiFieldText
                    fullWidth={true}
                    placeholder={fileMsee.valueColumnLabel}
                    value={addingValue}
                    onChange={this.onChangeValue}
                    aria-label="当没有实际使用标签时，使用aria-label"
                  />
                )}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="plusInCircle"
                      isDisabled={!addingKey || !addingValue}
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
  renderAddNoValue() {
    const { addingKey, addingValue, fileType } = this.state;
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
                  placeholder={fileMsee.valueColumnLabel}
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

  buildTableColumns(fileName){
    const { fileType } = this.state;
    const { listInfo } = this.props;
    const fileMsee = fileType[listInfo.name]
    return [
      {
        field: 'key',
        name: fileMsee.keyColumnLabel,
        align: 'left',
        sortable: true
      },
      {
        field: 'value',
        name: fileMsee.valueColumnLabel,
        align: 'left',
        sortable: true,
        render: (value, item) => {
          if (this.state.editing === item.key && fileMsee.isSelect) {
            return (
              <EuiSelect
                options={fileMsee.selectOptions}
                value={this.state.editingValue}
                onChange={this.onChangeEditingValue}
              />
            )
          }
          else if (this.state.editing === item.key) {
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
                  // onClick={() => this.deleteItem(item.key)}
                  onClick={() => this.toShowDeleteModal(item.key)}
                  color="danger"
                />
              </Fragment>
            );
          }
        }
      }
    ];
  }
  buildTableColumnsNoValue(fileName){
    const { fileType } = this.state;
    const { listInfo } = this.props;
    const fileMsee = fileType[listInfo.name]
    return [
      {
        field: 'value',
        name: fileMsee.valueColumnLabel,
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
                <EuiToolTip position="top" content={'确认值'}>
                  <EuiButtonIcon
                    aria-label="确认值"
                    disabled={!this.state.editingValue}
                    iconType="check"
                    onClick={() => {
                      this.setEditedValueNoValue();
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
                  permissions={this.getUpdatePermissions(fileName)}
                  tooltip={{position: 'top', content: `编辑`}}
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
                  tooltip={{position: 'top', content: `删除`}}
                  // onClick={() => this.deleteItem(item.key)}
                  onClick={() => this.toShowDeleteModal(item.key)}
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
    const { name, path } = listInfo;
    const { fileType, isDeleteModalVisible } = this.state;
    const fileMsee = fileType[name]

    const message = isLoading ? false : '没有结果...';
    const columns = this.columns;

    const addingNew = name === false || !name;
    const listName = this.state.newListName || name;

    let deleteModal;
    if (isDeleteModalVisible) {
      deleteModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该数据吗？"
            onCancel={() => this.setDeleteModal(false)}
            onConfirm={() => this.deleteItem()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

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
            {/* This flex item is for separating between title and save button */}
            {/* Pop over to add new key and value */}
            {!addingNew && (
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
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
                        fileMsee.title ? fileMsee.title : name,
                        fileMsee.csvKey,
                        fileMsee.csvKeyContrast
                      );
                      this.setState({ generatingCsv: false });
                    } catch (error) {
                      this.setState({ generatingCsv: false });
                    }
                  }}
                >
                  download
                </EuiButton>
              </EuiFlexItem>
            )}
            {!this.state.editing &&
              this.renderAddAndSave(
                listName
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
          {fileMsee.isValueColumn && this.renderAdd()}
          {!fileMsee.isValueColumn && this.renderAddNoValue()}
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem style={{ marginTop: '30px' }}>
                  <EuiInMemoryTable
                    itemId="id"
                    items={this.state.items}
                    columns={fileMsee.isValueColumn ? this.buildTableColumns(name) : this.buildTableColumnsNoValue(name)}
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
        {deleteModal}
      </EuiFlexGroup>
    );
  }
}

