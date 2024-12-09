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
// Eui components
import {
  EuiFlexItem,
  EuiButtonEmpty,
  EuiPopover,
  EuiFormRow,
  EuiFieldText,
  EuiSpacer,
  EuiFlexGroup,
  EuiButton
} from '@elastic/eui';

import { connect } from 'react-redux';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button'

import {
  updateLoadingStatus,
  updateIsProcessing
} from '../../../../../redux/actions/groupsActions';

import exportCsv from '../../../../../react-services/wz-csv';
import GroupsHandler from './utils/groups-handler';
import { getToasts }  from '../../../../../kibana-services';
import { AppState } from '../../../../../react-services/app-state';
import { WzRequest } from '../../../../../react-services/wz-request';

class WzGroupsActionButtons extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      generatingCsv: false,
      isPopoverOpen: false,
      newGroupName: '',
      currentUserInfo: {},
      totalItems: 0,
      labelList: [],
    };
    this.exportCsv = exportCsv;

    this.groupsHandler = GroupsHandler;
    this.refreshTimeoutId = null;
  }

  async componentDidMount() {
    this._isMounted = true;
    let res = await AppState.getCurrentUserInfo();
    
    const rawItems = await this.groupsHandler.listGroups({ }, res.department);
    const { total_affected_items } = ((rawItems || {}).data || {}).data;

    this.setState({ currentUserInfo: res, totalItems: total_affected_items })

    if (this._isMounted) this.bindEnterToInput();

    await this.getLabelList();
  }

  componentDidUpdate() {
    this.bindEnterToInput();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async getLabelList() {
    try {
      const tag1Items = await WzRequest.apiReq('GET', `/sys_labels?pretty=true`, {});
      let labelList = (
        ((tag1Items || {}).data || {}).data || {}
      ).affected_items.map(k => ({ value: k.id, text: k.show_name }))
 
      this.setState({ labelList })
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Refresh the items
   */
  async refresh() {
    try {
      this.props.updateIsProcessing(true);
      this.onRefreshLoading();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  onRefreshLoading() {
    clearInterval(this.refreshTimeoutId);

    this.props.updateLoadingStatus(true);
    this.refreshTimeoutId = setInterval(() => {
      if (!this.props.state.isProcessing) {
        this.props.updateLoadingStatus(false);
        clearInterval(this.refreshTimeoutId);
      }
    }, 100);
  }

  togglePopover() {
    if (this.state.isPopoverOpen) {
      this.closePopover();
    } else {
      this.setState({ isPopoverOpen: true });
    }
  }

  closePopover() {
    this.setState({
      isPopoverOpen: false,
      msg: false,
      newGroupName: ''
    });
  }

  clearGroupName() {
    this.setState({
      newGroupName: ''
    });
  }

  onChangeNewGroupName = e => {
    this.setState({
      // newGroupName: e.target.value.split(" ").join("")
      newGroupName: e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("")
    });
  };

  /**
   * Looking for the input element to bind the keypress event, once the input is found the interval is clear
   */
  bindEnterToInput() {
    try {
      const interval = setInterval(async () => {
        const input = document.getElementsByClassName('groupNameInput');
        if (input.length) {
          const i = input[0];
          if (!i.onkeypress) {
            i.onkeypress = async e => {
              if (e.which === 13) {
                await this.createGroup();
              }
            };
          }
          clearInterval(interval);
        }
      }, 150);
    } catch (error) {}
  }

  async createGroup() {
    try {
      if (this.isOkNameGroup(this.state.newGroupName)) {
        this.props.updateLoadingStatus(true);
        await this.groupsHandler.saveGroup(this.state.newGroupName);
        this.showToast(
          'success',
          '成功',
          '组创建成功',
          2000
        );
        this.clearGroupName();

        this.props.updateIsProcessing(true);
        this.props.updateLoadingStatus(false);
        this.closePopover();
      }
    } catch (error) {
      this.props.updateLoadingStatus(false);
      this.showToast(
        'danger',
        '警告',
        `创建组时出错: ${error}`,
        2000
      );
    }
  }

  /**
   * Generates a CSV
   */
  async generateCsv() {
    try {
      this.setState({ generatingCsv: true });
      const { section, filters } = this.props.state; //TODO get filters from the search bar from the REDUX store
      let csvKey = ['name', 'count', 'label'];
      const { currentUserInfo, labelList } = this.state;
      let csvKeyContrast = {
        'label': 'department',
        'count': 'agent_count',
      }
      let csvTextContrast = {
        'label': labelList
      }
      await this.exportCsv(`/groups${currentUserInfo.department ? `?labels_list=${currentUserInfo.department}` : ''}`, filters, '主机分组', csvKey, csvKeyContrast, csvTextContrast);
      this.showToast(
        'success',
        '成功',
        'CSV。您的下载已自动开始...',
        2000
      );
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        `导出CSV文件时出错: ${error}`,
        2000
      );
    }
    this.setState({ generatingCsv: false });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  isOkNameGroup = (name) => {
    return (name !== '' && name.trim().length > 0); 
  }

  render() {
    const { totalItems } = this.state;
    // Add new group button
    const newGroupButton = (
      // <WzButtonPermissions
      //   buttonType='empty'
      //   iconSide="left"
      //   iconType="plusInCircle"
      //   permissions={[{action: 'group:create', resource: '*:*:*'}]}
      //   onClick={() => this.togglePopover()}
      // >
      //   添加新组
      // </WzButtonPermissions>
      <EuiButton
        size="s"
        onClick={() => this.togglePopover()}
      >
        添加新组
      </EuiButton>
    );

    // Export button
    const exportButton = (
      // <EuiButtonEmpty
      //   iconType="importAction"
      //   onClick={async () => await this.generateCsv()}
      //   isLoading={this.state.generatingCsv}
      // >
      //   导出
      // </EuiButtonEmpty>
      <EuiButton
        size="s"
        onClick={async () => await this.generateCsv()}
        isLoading={this.state.generatingCsv}
      >
        下载
      </EuiButton>
    );

    // Refresh
    const refreshButton = (
      // <EuiButtonEmpty
      //   iconType="refresh"
      //   onClick={async () => await this.refresh()}
      // >
      //   刷新
      // </EuiButtonEmpty>
      <EuiButton
        size="s"
        onClick={async () => await this.refresh()}
      >
        刷新
      </EuiButton>
    );

    return (
      <Fragment>
        {/* <EuiFlexItem grow={false}>
          <EuiPopover
            id="popover"
            button={newGroupButton}
            isOpen={this.state.isPopoverOpen}
            closePopover={() => this.closePopover()}
          >
          <EuiFlexGroup direction={'column'}>
            <EuiFlexItem>
              <EuiFormRow label="介绍组名" id="">
                <EuiFieldText
                  className="groupNameInput"
                  value={this.state.newGroupName}
                  onChange={this.onChangeNewGroupName}
                  aria-label=""
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <WzButtonPermissions
                permissions={[{action: 'group:create', resource: '*:*:*'}]}
                iconType="save"
                isDisabled={!this.isOkNameGroup(this.state.newGroupName)}
                fill
                onClick={async () => {
                  await this.createGroup();
                }}
              >
                保存新组
              </WzButtonPermissions>
            </EuiFlexItem>
          </EuiFlexGroup>
          </EuiPopover>
        </EuiFlexItem> */}
        { totalItems > 0 && (
          <EuiFlexItem grow={false}>{exportButton}</EuiFlexItem>
        )}
        <EuiFlexItem grow={false}>{refreshButton}</EuiFlexItem>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.groupsReducers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateIsProcessing: isProcessing =>
      dispatch(updateIsProcessing(isProcessing))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzGroupsActionButtons);