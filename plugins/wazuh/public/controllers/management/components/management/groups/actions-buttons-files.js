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
import { EuiFlexItem, EuiButtonEmpty, EuiButton } from '@elastic/eui';

import { connect } from 'react-redux';

import {
  updateLoadingStatus,
  updateIsProcessing,
  updateFileContent
} from '../../../../../redux/actions/groupsActions';

import exportCsv from '../../../../../react-services/wz-csv';
import GroupsHandler from './utils/groups-handler';
import { getToasts }  from '../../../../../kibana-services';
import { ExportConfiguration } from '../../../../agent/components/export-configuration';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button';
import { ReportingService } from '../../../../../react-services/reporting';

class WzGroupsActionButtonsFiles extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.reportingService = new ReportingService();

    this.state = {
      generatingCsv: false,
      isPopoverOpen: false,
      newGroupName: ''
    };
    this.exportCsv = exportCsv;

    this.groupsHandler = GroupsHandler;
    this.refreshTimeoutId = null;
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) this.bindEnterToInput();
  }

  componentDidUpdate() {
    this.bindEnterToInput();
  }

  componentWillUnmount() {
    this._isMounted = false;
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

  autoFormat = xml => {
    var reg = /(>)\s*(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml
      .replace(reg, '$1\n$2$3')
      .replace(wsexp, '$1\n')
      .replace(contexp, '$1\n$2');
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    var transitions = {
      'single->single': 0,
      'single->closing': -1,
      'single->opening': 0,
      'single->other': 0,
      'closing->single': 0,
      'closing->closing': -1,
      'closing->opening': 0,
      'closing->other': 0,
      'opening->single': 1,
      'opening->closing': 0,
      'opening->opening': 1,
      'opening->other': 1,
      'other->single': 0,
      'other->closing': -1,
      'other->opening': 0,
      'other->other': 0
    };

    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (ln.match(/\s*<\?xml/)) {
        formatted += ln + '\n';
        continue;
      }
      var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
      var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
      var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
      var type = single
        ? 'single'
        : closing
        ? 'closing'
        : opening
        ? 'opening'
        : 'other';
      var fromTo = lastType + '->' + type;
      lastType = type;
      var padding = '';

      indent += transitions[fromTo];
      for (var j = 0; j < indent; j++) {
        padding += '\t';
      }
      if (fromTo == 'opening->closing')
        formatted = formatted.substr(0, formatted.length - 1) + ln + '\n';
      // substr removes line break (\n) from prev loop
      else formatted += padding + ln + '\n';
    }
    return formatted.trim();
  };

  async showGroupConfiguration() {
    const { itemDetail } = this.props.state;
    let result = await this.groupsHandler.getFileContent(
      `/groups/${itemDetail.name}/files/agent.conf/xml`
    );

    if(Object.keys(result).length == 0){
      result = '';
    }

    const data = this.autoFormat(result);

    const file = {
      name: 'agent.conf',
      content: data,
      isEditable: true,
      groupName: itemDetail.name
    };
    this.props.updateFileContent(file);
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
      newGroupName: e.target.value
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
      await this.exportCsv(`/groups/${this.props.state.itemDetail.name}/files`, filters, `${this.props.state.itemDetail.name}分组文件`);
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

  render() {
    // Add new group button
    const groupConfigurationButton = (
      // <WzButtonPermissions
      //   buttonType='empty'
      //   permissions={[{action: 'group:read', resource: `group:id:${this.props.state.itemDetail.name}`}]}
      //   iconSide="left"
      //   iconType="documentEdit"
      //   onClick={() => this.showGroupConfiguration()}
      // >
      //   编辑组配置
      // </WzButtonPermissions>
      <EuiButton
        size="s"
        onClick={() => this.showGroupConfiguration()}
      >
        编辑组配置
      </EuiButton>
    );

    // Export PDF button
    const exportPDFButton = (
      <ExportConfiguration
        exportConfiguration={enabledComponents =>
          this.reportingService.startConfigReport(
            this.props.state.itemDetail,
            'groupConfig',
            enabledComponents
          )
        }
        type='group'
      />
    );
    // Export button
    const exportCSVButton = (
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
        导出CSV
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
        <EuiFlexItem grow={false}>{groupConfigurationButton}</EuiFlexItem>
        <EuiFlexItem grow={false}>{exportPDFButton}</EuiFlexItem>
        <EuiFlexItem grow={false}>{exportCSVButton}</EuiFlexItem>
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
      dispatch(updateIsProcessing(isProcessing)),
    updateFileContent: content => dispatch(updateFileContent(content))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzGroupsActionButtonsFiles);
