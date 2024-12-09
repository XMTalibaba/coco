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

export const AdminOperationlog = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '操作日志' }, { text: '操作日志' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class AdminOperationlog extends Component {
	constructor(props) {
		super(props);
    this.offset = 315;
		this.state = {
      isDescPopoverOpen: false,
      isCluster: false,
      logMethodSelect: '',
      descendingSort: false,
      appliedSearch: '',
      appliedUserSearch: '',
      appliedIpSearch: '',
      appliedResultSearch: '',
      appliedUrlSearch: '',
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

    const { logsPath } = { logsPath: '/manager/logs/api' };

    this.setState({
      logMethodSelect: 'all',
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
    if (this.state.logMethodSelect !== 'all')
      result['method'] = this.state.logMethodSelect;
    if (this.state.appliedSearch) result['search'] = this.state.appliedSearch;
    if (this.state.appliedUserSearch) result['login_user'] = this.state.appliedUserSearch;
    if (this.state.appliedIpSearch) result['login_ip'] = this.state.appliedIpSearch;
    if (this.state.appliedResultSearch) result['result'] = this.state.appliedResultSearch;
    if (this.state.appliedUrlSearch) result['url'] = this.state.appliedUrlSearch;
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
    let result=''
    try{
    result = await this.getFullLogs();
      this.setState({ logsList: result, offset: 0 });
    }catch(error){
  
      this.setState({ logsList: result, offset: 0 });
      
    }
  }

  getLogMethodOptions() {
    return [
      { value: 'all', text: 'ALL' },
      { value: 'GET', text: 'GET' },
      { value: 'PUT', text: 'PUT' },
      { value: 'POST', text: 'POST' },
      { value: 'DELETE', text: 'DELETE' }
    ];
  }

  onLogMethodChange = e => {
    this.setState(
      {
        logMethodSelect: e.target.value
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
  getoperate(val){
    // `用户${operate}输入源`
    if(val){
      const opt=val.split(',')[0];
      const name=val.split(',')[1].split(':')[1];

  switch (opt) {
      case "":
        return '';
      case "add":
        return `添加输入源${name}`;
      case "delete":
        return `删除输入源${name}`;
        case "stop":
          return `暂停输入源${name}`;
          case "delete":
            return `重新运行输入源${name}`;
            case "run":
            return `重新运行输入源${name}`;
            case "update":
            return `编辑输入源${name}`;
      default:
        return ''
    }
    }else{
      return
    }
  
  }
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
  
  onSearchResultSearch = e => {
    this.setState(
      {
        appliedResultSearch: e
      },
      this.setFullLogs
    );
  };

  onSearchUrlSearch = e => {
    this.setState(
      {
        appliedUrlSearch: e
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
        '/manager/logs/api',
        Object.keys(filters).map(filter => ({name: filter, value: filters[filter]})),
        `管理员操作日志`
        );
        return;
    } catch (error) {
      this.showToast('danger', error, 3000);
    }
  }

  header() {
    const logMethodOptions = this.getLogMethodOptions();

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
                    <EuiText textAlign="right">{'IP'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <WzFieldSearch
                      searchDelay={500}
                      onSearch={this.onSearchIpSearch}
                      placeholder="请输入ip"
                      aria-label="IP"
                      fullWidth
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'请求结果'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <WzFieldSearch
                      searchDelay={500}
                      onSearch={this.onSearchResultSearch}
                      placeholder="请输入执行结果"
                      aria-label="请求结果"
                      fullWidth
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'请求地址'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <WzFieldSearch
                      searchDelay={500}
                      onSearch={this.onSearchUrlSearch}
                      placeholder="请输入请求地址"
                      aria-label="请求地址"
                      fullWidth
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'请求方式'}:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 150 }}>
                    <EuiSelect
                      id="filterLogMethod"
                      options={logMethodOptions}
                      value={this.state.logMethodSelect}
                      onChange={this.onLogMethodChange}
                      aria-label="请求方式"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">{'降序排列'}:</EuiText>
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
  getRowProps(){

  }
  logsTable() {
    const {
      logsList
    } = this.state;

    logsList&&logsList.forEach((ele)=>{
      console.log(ele)
      if(ele.operate){
        ele.operate=`${ele.operate},${ele.body}`
      }else{
    
      }
      return 
    });

    const columns = [
      {
        field: 'timestamp',
        name: '时间',
        render: timestamp => (<span>{formatUIDate(timestamp)}</span>),
      },
      {
        field: 'user',
        name: '用户',
      },
      {
        field: 'ip',
        name: '用户IP',
      },
      {
        field: 'method',
        name: '请求方式',
      },
      {
        field: 'result',
        name: '执行结果'
      },
      {
        field: 'url',
        name: 'URL',
      },
      {
        field: 'operate',
        name: '事件',
        render: operate=> (<span>{this.getoperate(operate)}</span>),
      }
    
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
                    <span>&nbsp;{WAZUH_MODULES['adminOperationlog'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['adminOperationlog'].description}
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