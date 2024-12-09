import React, { Fragment, Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPanel,
	EuiSpacer,
	EuiButton,
  EuiText,
  EuiFieldText,
  EuiSwitch,
  EuiSelect,
  EuiRadioGroup,
  EuiDatePicker,
  EuiFieldNumber,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import moment from 'moment';
import { AppState } from '../../../react-services/app-state';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import { VirusWhiteList } from './virus-whiteList';

export class IsolationStrategy extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
      isolateFile: false,
			groupsOptions: [],
			groupSelect: '',
      isCluster: false,
			showWarningRestartIsolateFile: false,
    };
  }
  async componentDidMount() {
    this._isMount = true;
    const isCluster = (AppState.getClusterInfo() || {}).status === 'enabled';
    this.setState({ isCluster });
		await this.getOptions()
    await this.getIsolateFile()
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
  }

  async getOptions() {
		try {
			let departmentGroups = await AppState.getDepartmentGroups();
			let groupsOptions = departmentGroups.map(k => {
				let item = {
					value: k.name,
					text: k.name
				}
				return item;
			})
			let groupSelect = groupsOptions.length > 0 ? groupsOptions[0].value : '';

      this.setState({
				groupsOptions,
				groupSelect
			});
    } catch (error) {
      console.log(error)
    }
	}

  async getIsolateFile() {
    const isolateFileItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=active-response`, {});
    const isolateFileItem = (
      ((isolateFileItems || {}).data || {}).data || {}
    ).affected_items[0]['active-response'].find(k => k.command === 'isolate-file');
    const isolateFile = isolateFileItem && (!isolateFileItem.disabled || isolateFileItem.disabled === 'no') ? true : false;

    const isolateFileWinItem = (
      ((isolateFileItems || {}).data || {}).data || {}
    ).affected_items[0]['active-response'].find(k => k.command === 'isolate-file-win');
    const isolateFileWin = isolateFileWinItem && (!isolateFileWinItem.disabled || isolateFileWinItem.disabled === 'no') ? true : false;
    this.setState({ isolateFile: isolateFile && isolateFileWin })
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async setUpdateIsolateFile(e) {
    const { isCluster } = this.state;
		let isolateFile = e.target.checked;
    try {
      await WzRequest.apiReq('PUT', `/${isCluster ? 'cluster' : 'manager'}/switch_command?pretty=true&ar_command=isolate-file`, {});
      await WzRequest.apiReq('PUT', `/${isCluster ? 'cluster' : 'manager'}/switch_command?pretty=true&ar_command=isolate-file-win`, {});
        
      this.showToast(
        'success',
        '成功',
        '病毒自动隔离操作切换成功',
        3000
      );
      
      this.setState({
        isolateFile,
        showWarningRestartIsolateFile: true
      });
    } catch(error) {
      this.showToast(
        'danger',
        '警告',
        '病毒自动隔离操作切换失败',
        3000
      );
    }
  }

  onSelectGroupChanged(value) {
		this.setState({ groupSelect: value })
	}

  render() {
    const { isolateFile, groupsOptions, groupSelect, showWarningRestartIsolateFile } = this.state;
    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'隔离策略'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">{'隔离策略对实时、定时、立即三种查杀模式均生效'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        {showWarningRestartIsolateFile && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzRestartClusterManagerCallout
              onRestart={() => this.setState({showWarningRestartIsolateFile: true})}
              onRestarted={() => this.setState({showWarningRestartIsolateFile: false})}
              onRestartedError={() => this.setState({showWarningRestartIsolateFile: true})}
            />
          </Fragment>
        )}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">是否开启自动隔离:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label=""
              checked={isolateFile}
              onChange={(e) => this.setUpdateIsolateFile(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'病毒白名单分组'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiSelect
              options={groupsOptions}
              value={groupSelect}
              onChange={(e) => this.onSelectGroupChanged(e.target.value)}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">配置分组下病毒白名单</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <VirusWhiteList groupSelect={groupSelect}/>
      </EuiPanel>
    )
  }
}