import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiPanel,
  EuiTitle,
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

export const AdminLoginlog = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '操作日志' }, { text: '管理员登录日志' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class AdminLoginlog extends Component {
	constructor(props) {
		super(props);
    this.offset = 315;
		this.state = {
      isDescPopoverOpen: false,
      isCluster: false,
      logResultSelect: '',
      descendingSort: false,
      appliedSearch: '',
      appliedUserSearch: '',
      appliedIpSearch: '',
      logsList: '',
      isLoading: false,
      offset: 0,
      logsPath: '',
      totalItems: 0,
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

    const { logsPath } = { logsPath: '/manager/logs/login' };

    this.setState({
      logResultSelect: 'all',
      realTime: false,
      descendingSort: false,
      offset: 0,
      totalItems: 0,
      logsPath,
      loadingLogs: false,
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
    if (this.state.logResultSelect !== 'all')
      result['result'] = this.state.logResultSelect;
    if (this.state.appliedSearch) result['search'] = this.state.appliedSearch;
    if (this.state.appliedUserSearch) result['login_user'] = this.state.appliedUserSearch;
    if (this.state.appliedIpSearch) result['login_ip'] = this.state.appliedIpSearch;
    if (this.state.descendingSort) result['sort'] = '+timestamp';
    else result['sort'] = '-timestamp';

    return result;
  }

  async getFullLogs(customOffset = 0) {
    const { logsPath } = this.state;
    let result = '';
    let totalItems = 0;
    try {
      const tmpResult = await WzRequest.apiReq(
        'GET',
        logsPath,
        { params: this.buildFilters(customOffset) }
      );
      const resultItems = ((tmpResult || {}).data.data || {}).affected_items;
      totalItems = ((tmpResult || {}).data.data || {}).total_affected_items;
      result = resultItems;
    } catch (err) {
      result = '';
      return Promise.reject('获取日志时出错');
    }
    this.setState({ totalItems });
    return result;
  }

  async setFullLogs() {
    let result = '';
 
    try{
     result = await this.getFullLogs();
      this.setState({ logsList: result, offset: 0 });
    }catch(error){
  
    }
  }

  getLogResultOptions() {
    return [
      { value: 'all', text: '所有登录结果' },
      { value: 'success', text: '成功' },
      { value: 'failed', text: '失败' },
      { value: 'logout', text: '登出' }
    ];
  }

  onLogResultChange = e => {
    this.setState(
      {
        logResultSelect: e.target.value
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

  onSearchBarSearch = e => {
    this.setState(
      {
        appliedSearch: e
      },
      this.setFullLogs
    );
  };
  
  onSearchUserSearch = e => {
    this.setState(
      {
        appliedUserSearch: e
      },
      this.setFullLogs
    );
  };

  onSearchIpSearch = e => {
    this.setState(
      {
        appliedIpSearch: e
      },
      this.setFullLogs
    );
  };

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
        '/manager/logs/login',
        Object.keys(filters).map(filter => ({name: filter, value: filters[filter]})),
        `管理员登录日志`
        );
        return;
    } catch (error) {
      this.showToast('danger', error, 3000);
    }
  }

  header() {
    const logResultOptions = this.getLogResultOptions();

    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup wrap={true}>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'用户名'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <WzFieldSearch
                      searchDelay={500}
                      onSearch={this.onSearchUserSearch}
                      placeholder="请输入用户名"
                      aria-label="用户名"
                      fullWidth
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'登录IP'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <WzFieldSearch
                      searchDelay={500}
                      onSearch={this.onSearchIpSearch}
                      placeholder="请输入登录IP"
                      aria-label="过滤登录IP"
                      fullWidth
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'登录结果'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <EuiSelect
                      id="filterLogMethod"
                      options={logResultOptions}
                      value={this.state.logResultSelect}
                      onChange={this.onLogResultChange}
                      aria-label="请输入执行登录结果"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
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
      },
      {
        field: 'user',
        name: '用户名',
      },
      {
        field: 'ip',
        name: '登录IP',
      },
      {
        field: 'result',
        name: '登录结果',
        render: result => (<span>{result === 'failed'?'失败' :result === 'logout'?'登出' :  '成功'}</span>),
      },
    ];
    return (
      <div>
        {(this.state.logsList && (
          <Fragment>
            <div className='code-block-log-viewer-container' style={{ height: this.height, overflowY: 'auto' }}>
              <EuiBasicTable
                items={logsList}
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
                    <span>&nbsp;{WAZUH_MODULES['adminLoginlog'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['adminLoginlog'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              { logsList.length > 0 && 
                <EuiButton
                  size="s"
                  // iconType="importAction"
                  onClick={this.exportFormatted}
                >
                  导出
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