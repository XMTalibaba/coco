import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiCodeBlock,
  EuiPanel,
  EuiTitle,
  EuiTextColor,
  EuiProgress,
  EuiCallOut,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiPopover,
  EuiButtonIcon,
  EuiPopoverTitle,
  EuiButton,
  EuiText
} from '@elastic/eui';
import 'brace/mode/less';	
import 'brace/theme/github';	
import exportCsv from '../../react-services/wz-csv';
import { getToasts }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { compose } from 'redux';
import { WzFieldSearch } from '../../components/wz-field-search-bar/wz-field-search-bar';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { AppState } from '../../react-services/app-state';

export const SystemRunLog = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '操作日志' }, { text: '系统运行日志' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class SystemRunLog extends Component {
	constructor(props) {
		super(props);
    // this.offset = 350;
    this.offset = 330;
		this.state = {
      isDescPopoverOpen: false,
      isCluster: false,
      selectedDaemon: '',
      logLevelSelect: '',
      descendingSort: false,
      searchBarValue: '',
      appliedSearch: '',
      logsList: '',
      isLoading: false,
      offset: 0,
      selectedNode: '',
      logsPath: '',
      nodeList: [],
      totalItems: 0,
      daemonsList: [],
      loadingLogs: false,
      realTime: false
    };
    this.ITEM_STYLE = { width: '300px' };
	}

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

  async componentDidMount() {
    this.height = window.innerHeight - this.offset;
    window.addEventListener('resize', this.updateHeight);
    this.setState({ isLoading: true });

    const { nodeList, logsPath, selectedNode } = await this.getLogsPath();
    await this.initDaemonsList(logsPath);

    this.setState({
      selectedNode,
      selectedDaemon: 'all',
      logLevelSelect: 'all',
      realTime: false,
      descendingSort: false,
      offset: 0,
      totalItems: 0,
      logsPath,
      loadingLogs: false,
      nodeList
    }, async () => {
      await this.setFullLogs();
      this.setState({
        isLoading: false
      });
    });


  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
    clearInterval(this.realTimeInterval);
  }

  async initDaemonsList(logsPath) {
    try {
      const path = logsPath + '/summary';
      const data = await WzRequest.apiReq('GET', path, {});
      const formattedData = (((data || {}).data || {}).data || {}).affected_items;
      const daemonsList = [...['all']];
      for (const daemon of formattedData) {
        daemonsList.push(Object.keys(daemon)[0]);
      }
      this.setState({ daemonsList });
    } catch (err) {
      return Promise.reject('获取守护程序列表时出错。');
    } // eslint-disable-line
  }

  parseLogsToText(logs) {
    let result = '';
    logs.forEach(item => {
      result +=
        formatUIDate(item.timestamp) +
        ' ' +
        item.tag +
        ' ' +
        item.level.toUpperCase() +
        ' ' +
        item.description +
        '\n';
    });
    return result;
  }

  buildFilters(customOffset = 0) {
    let result = { limit: 100 };
    if (customOffset) {
      result['offset'] = customOffset;
    }
    if (this.state.logLevelSelect !== 'all')
      result['level'] = this.state.logLevelSelect;
    if (this.state.selectedDaemon !== 'all')
      result['tag'] = this.state.selectedDaemon;
    if (this.state.appliedSearch) result['search'] = this.state.appliedSearch;
    if (this.state.descendingSort) result['sort'] = '+timestamp';
    else result['sort'] = '-timestamp';

    return result;
  }

  async getFullLogs(customOffset = 0) {
    const { logsPath } = this.state;
    let result = '';
    let totalItems = 0;
    if (this.state.selectedNode) {
      try {
        const tmpResult = await WzRequest.apiReq(
          'GET',
          logsPath,
          { params: this.buildFilters(customOffset) }
        );
        const resultItems = ((tmpResult || {}).data.data || {}).affected_items;
        totalItems = ((tmpResult || {}).data.data || {}).total_affected_items;
        // result = this.parseLogsToText(resultItems) || '';
        result = resultItems;
      } catch (err) {
        result = '';
        return Promise.reject('获取日志时出错。');
      }
    } else {
      try {
        const tmpResult = await WzRequest.apiReq(
          'GET',
          logsPath,
          { params: this.buildFilters(customOffset) }
        );
        const resultItems = ((tmpResult || {}).data.data || {}).affected_items;
        totalItems = ((tmpResult || {}).data.data || {}).total_affected_items;
        // result = this.parseLogsToText(resultItems) || '';
        result = resultItems;
      } catch (err) {
        result = '';
        return Promise.reject('获取日志时出错');
      }
    }
    this.setState({ totalItems });
    return result;
  }

  async setFullLogs() {
    try{
      const result = await this.getFullLogs();
      this.setState({ logsList: result, offset: 0 });
    }catch(error){
      
    }
  }

  /**
   * Returns an object with the path to request Wazuh logs, the list of nodes and the current selected node.
   */
  async getLogsPath() {
    try {
      const clusterStatus = await WzRequest.apiReq(
        'GET',
        '/cluster/status',
        {}
      );
      const clusterEnabled =
        (((clusterStatus || {}).data || {}).data || {}).running === 'yes' &&
        (((clusterStatus || {}).data || {}).data || {}).enabled === 'yes';

      if (clusterEnabled) {
        let nodeList = '';
        let selectedNode = '';
        const nodeListTmp = await WzRequest.apiReq(
          'GET',
          '/cluster/nodes',
          {}
        );
        if (
          Array.isArray((((nodeListTmp || {}).data || {}).data || {}).affected_items)
        ) {
          nodeList = nodeListTmp.data.data.affected_items;
          selectedNode = nodeListTmp.data.data.affected_items.filter(
            item => item.type === 'master'
          )[0].name;
        }
        return {
          nodeList,
          logsPath: `/cluster/${selectedNode}/logs`,
          selectedNode: selectedNode
        };
      }
    } catch (error) {
      return Promise.reject('获取日志路径时出错。');
    }

    return { nodeList: '', logsPath: '/manager/logs', selectedNode: '' };
  }

  getDaemonsOptions() {
    const daemonsList =
      this.state.daemonsList.length > 0
        ? this.state.daemonsList.map(item => {
            return { value: item, text: item === 'all' ? '所有守护程序' : item };
          })
        : [{ value: 'all', text: '所有守护程序' }];

    return daemonsList;
  }

  getLogLevelOptions() {
    return [
      { value: 'all', text: '所有日志级别' },
      { value: 'info', text: '信息' },
      { value: 'error', text: '错误' },
      { value: 'warning', text: '警告' },
      { value: 'critical', text: '关键' },
      // { value: 'debug', text: 'Debug' },
      // { value: 'debug2', text: 'Debug2'}
    ];
  }

  getnodeList() {
    try {
      if (this.state.nodeList && Array.isArray(this.state.nodeList)) {
        const nodeList = this.state.nodeList.map(item => {
          return { value: item.name, text: `${item.name} (${item.type})` };
        });
        return nodeList;
      } else {
        return false;
      }
    } catch (err) {
      return Promise.reject('获取节点列表时出错。');
    }
  }

  onDaemonChange = e => {
    this.setState(
      {
        selectedDaemon: e.target.value
      },
      this.setFullLogs
    );
  };

  onLogLevelChange = e => {
    this.setState(
      {
        logLevelSelect: e.target.value
      },
      this.setFullLogs
    );
  };

  onSortSwitchChange = e => {
    this.setState(
      {
        descendingSort: e.target.checked
      },
      this.setFullLogs
    );
  };

  onSelectNode = e => {
    this.setState(
      {
        selectedNode: e.target.value,
        logsPath: `/cluster/${e.target.value}/logs`
      },
      this.setFullLogs
    );
  };

  onSearchBarChange = e => {
    this.setState({
      searchBarValue: e
    });
  };

  onSearchBarSearch = e => {
    this.setState(
      {
        appliedSearch: e
      },
      this.setFullLogs
    );
  };

  makeSearch() {
    this.setState(
      { appliedSearch: this.state.searchBarValue },
      this.setFullLogs
    );
  }

  setRealTimeInterval() {
    if (this.state.realTime)
      this.realTimeInterval = setInterval(() => this.setFullLogs(), 5000);
    else clearInterval(this.realTimeInterval);
  }

  switchRealTime() {
    this.setState({ realTime: !this.state.realTime }, this.setRealTimeInterval);
  }

  showToast = (color, title, time) => {
    getToasts().add({
      color: color,
      title: title,
      toastLifeTimeMs: time,
    });
  }

  exportFormatted = async () => {
    try {
      this.showToast('success', '您的下载已自动开始...', 3000);
      const filters = this.buildFilters();
      await exportCsv(
        this.state.selectedNode ? `/cluster/${this.state.selectedNode}/logs` : '/manager/logs',
        Object.keys(filters).map(filter => ({name: filter, value: filters[filter]})),
        `${this.state.selectedNode ? `${this.state.selectedNode}-` : ''}系统运行日志`
        );
        return;
    } catch (error) {
      this.showToast('danger', error, 3000);
    }
  }

  header() {
    const daemonsOptions = this.getDaemonsOptions();
    const logLevelOptions = this.getLogLevelOptions();
    const nodeList = this.getnodeList();

    return (
      <div>
        {/* <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size={'m'}>
              <h2>系统运行日志</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty iconType="importAction" onClick={this.exportFormatted}>
                  导出
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTextColor color="subdued">
              <p>列出并过滤Wazuh日志。</p>
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup> */}
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup wrap={true}>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'守护程序'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <EuiSelect
                      id="filterDaemon"
                      options={daemonsOptions}
                      value={this.state.selectedDaemon}
                      onChange={this.onDaemonChange}
                      aria-label="按守护程序过滤"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'日志级别'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <EuiSelect
                      id="filterLogLevel"
                      options={logLevelOptions}
                      value={this.state.logLevelSelect}
                      onChange={this.onLogLevelChange}
                      aria-label="按日志级别过滤"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              {this.state.selectedNode && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiText textAlign="right">{'node节点'}:</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ width: 150 }}>
                      <EuiSelect
                        id="selectNode"
                        options={nodeList}
                        value={this.state.selectedNode}
                        onChange={this.onSelectNode}
                        aria-label="选择节点"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'升序排列'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSwitch
                      label=""
                      checked={this.state.descendingSort}
                      onChange={this.onSortSwitchChange}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'实时'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSwitch
                      label=""
                      checked={this.state.realTime}
                      onChange={() => this.switchRealTime()}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'s'}></EuiSpacer>
        {/* <EuiFlexGroup>
          <EuiFlexItem>
            <WzFieldSearch
              searchDelay={500}
              onChange={this.onSearchBarChange}
              onSearch={this.onSearchBarSearch}
              placeholder="过滤日志"
              aria-label="过滤日志"
              fullWidth
            />
          </EuiFlexItem>
        </EuiFlexGroup> */}
      </div>
    );
  }

  async loadExtraLogs() {
    this.setState({ loadingLogs: true });
    const customOffset = this.state.offset + 100;
    const result = await this.getFullLogs(customOffset);
    this.setState({
      offset: customOffset,
      logsList: this.state.logsList.concat(result),
      loadingLogs: false
    });
  }

  logsTable() {
    const {
      logsList
    } = this.state;
    const columns = [
      {
        field: 'timestamp',
        name: '时间',
        render: timestamp => (<span>{formatUIDate(timestamp)}</span>),
        width: '20%'
      },
      {
        field: 'tag',
        name: '守护程序',
        width: '10%'
      },
      {
        field: 'level',
        name: '日志级别',
        render: level => (<span>{this.getLogLevelOptions().find(k => k.value === level) ? this.getLogLevelOptions().find(k => k.value === level).text : level.toUpperCase()}</span>),
        width: '10%'
      },
      {
        field: 'description',
        name: '描述',
        width: '60%'
      },
    ];
    return (
      <div>
        {(this.state.logsList && (
          <Fragment>
            <div className='code-block-log-viewer-container' style={{ height: this.height, overflowY: 'auto' }}>
              {/* <EuiCodeBlock
                fontSize="s"
                paddingSize="m"
                color="dark"
                overflowHeight={this.height}
              >
                {this.state.logsList}
              </EuiCodeBlock> */}
              <EuiBasicTable
                items={logsList}
                // itemId="id"
                columns={columns}
                noItemsMessage="未找到数据"
              />
            </div>
            <EuiSpacer size="m" />
            {(this.state.offset + 100 < this.state.totalItems && (
              <EuiFlexGroup justifyContent='center'>
                <EuiFlexItem grow={false} style={{marginTop: 0, marginBottom: 0}}>
                  <EuiButtonEmpty
                    iconType='refresh'
                    isLoading={this.state.loadingLogs}
                    isDisabled={this.state.loadingLogs}
                    onClick={!this.state.loadingLogs ? () => this.loadExtraLogs() : undefined}
                  >
                    加载更多日志
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            ))}
          </Fragment>
        )) || (
          <EuiCallOut
            color="warning"
            title="没有符合您的搜索标准的结果。"
            iconType="alert"
          ></EuiCallOut>
        )}
      </div>
    );
  }

	renderTitle() {
    const { logsList } = this.state;
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['systemRunLogs'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['systemRunLogs'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {/* <EuiButtonEmpty iconType="importAction" onClick={this.exportFormatted}>
                导出
              </EuiButtonEmpty> */}
              { logsList.length > 0 && 
                <EuiButton
                  size="s"
                  // iconType="importAction"
                  onClick={this.exportFormatted}
                >
                  下载
                </EuiButton>
              }
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

	render() {
		const title = this.renderTitle();
		return (
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
              <EuiPage>
                <EuiPageBody>
                  <EuiPanel paddingSize="l">
                    {this.header()}
                    <EuiSpacer size={'m'}></EuiSpacer>
                    {(!this.state.isLoading && this.logsTable()) || (
                      <EuiFlexGroup alignItems="center" justifyContent="center">
                        <EuiFlexItem>
                          <EuiSpacer></EuiSpacer>
                          <EuiProgress size="xs" color="primary" />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    )}
                  </EuiPanel>
                </EuiPageBody>
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});