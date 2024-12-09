import React, { Component } from 'react';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiPopover,
  EuiButtonIcon,
  EuiPopoverTitle,
  EuiInMemoryTable,
  EuiBasicTable,
  EuiPage,
  EuiPanel,
  EuiToolTip,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { AppState } from '../../react-services/app-state';
import { formatUIDate } from '../../react-services/time-service';
import { CheckResult } from './baselineCheck/check-result';
 
export const BaselineCheck = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: '合规基线' }, { text: '基线检查' }]),
  withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BaselineCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDescPopoverOpen: false,
      tabs: [
        { id: 'agent', name: '主机' },
        { id: 'checkItem', name: '检查项' },
      ],
      selectView: 'agent', // 维度tab
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      currentUserInfo: {},
      departmentGroups: [],
      listType: 'list',
      selectAgent: {},
    }
  }

  async componentDidMount() {
    this._isMount = true;
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }
    this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      const { selectView, currentUserInfo, departmentGroups } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) return
      this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq(
        'GET',
        `/agents/summary/sca?pretty=true${currentUserInfo.department ? `&groups_list=${departmentGroups.map(k => `${k.name}`).join(',')}` : ''}${selectView === 'checkItem' ? `&name=all` : ''}`,
        { params: this.buildFilter() }
      );

      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {};

      this.setState({
        listItems: affected_items,
        totalItems: total_affected_items,
        isLoading: false
      });
        
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }
  buildFilter() {
    const { pageIndex, pageSize } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };

    return filter;
  }
 
  renderTitle() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['baselineCheck'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['baselineCheck'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
 
  renderTabs() {
    const { selectView } = this.state;
    return (
      <EuiFlexItem style={{ margin: '0 8px 0 8px' }}>
        <EuiTabs>
          {this.state.tabs.map((tab, index) => {
            return <EuiTab
                      onClick={() => this.onSelectedTabChanged(tab.id)}
                      isSelected={selectView === tab.id}
                      key={index}
                    >
                      {tab.name}
                    </EuiTab>
            }
          )}
        </EuiTabs>
      </EuiFlexItem>
    );
  }
  onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
      this.setState({ selectView: id }, this.getItems);
    }
  }
  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="检查结果"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.setState({ listType: 'check', selectAgent: item })
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="检查结果"
          />
        </EuiToolTip>
      </div>
    )
  }

  renderTable() {
    const {
      listItems,
      isLoading,
      selectView,
      totalItems,
      pageIndex,
      pageSize,
    } = this.state;
    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const agentColumns = [
      { field: 'agent_id', name: '主机ID' },
      { field: 'agent_name', name: '主机名' },
      { field: 'agent_ip', name: '主机IP' },
      { field: 'count', name: '基线数量' },
      { field: 'last_time', name: '上次检查时间', render: last_time => last_time ? formatUIDate(last_time) : '-' },
      { field: 'total', name: '检查项总量' },
      { field: 'exception', name: '检查项异常量' },
      { name: '操作', render: item => this.actionButtonsRender(item) },
    ]
    const checkItemColumns = [
      { field: 'policy_name', name: '基线模板' },
      { field: 'agent_id', name: '主机ID' },
      { field: 'last_time', name: '上次检查时间', render: last_time => last_time ? formatUIDate(last_time) : '-' },
      { field: 'count', name: '数量' },
      { field: 'pass_rate', name: '通过率' },
    ]
    const columns = selectView === 'agent' ? agentColumns : checkItemColumns;
    return (
      // <EuiInMemoryTable
      //   itemId="id"
      //   items={listItems}
      //   loading={isLoading}
      //   columns={columns}
      //   {...(pagination && { pagination })}
      //   onTableChange={(change) => this.onTableChange(change)}
      //   sorting={true}
      //   message={message}
      //   search={{ box: { incremental: true, placeholder: '过滤' } }}
      // />
      <EuiBasicTable
        items={listItems}
        itemId="id"
        loading={isLoading}
        columns={columns}
        onChange={this.onTableChange}
        noItemsMessage="暂无数据"
        {...(pagination && { pagination })}
      />
    )
  }

  toList() {
    this.setState({ listType: 'list', selectAgent: {} })
    this.getItems();
  }
 
  render() {
    const { listType, selectAgent } = this.state;
    const title = this.renderTitle();
    const tabs = this.renderTabs();
    const table = this.renderTable();
 
    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <div className="wz-module">
            <div className='wz-module-header-agent-wrapper'>
              <div className='wz-module-header-agent'>
                {title}
              </div>
            </div>
            { listType === 'list' && (
              <div>
                <div className='wz-module-header-nav-wrapper'>
                  <div className={this.state.tabs && this.state.tabs.length && 'wz-module-header-nav'}>
                    {(this.state.tabs && this.state.tabs.length) &&
                      <div className="wz-welcome-page-agent-tabs">
                        <EuiFlexGroup>
                          {tabs}
                        </EuiFlexGroup>
                      </div>
                    }
                  </div>
                </div>
                <div className='wz-module-body'>
                  <EuiPage>
                    <EuiPanel>
                      {table}
                    </EuiPanel>
                  </EuiPage>
                </div>
              </div>
            )}
            { listType !== 'list' && (
              <div>
                <div className='wz-module-body-notab'>
                  <CheckResult selectAgent={selectAgent} toList={() => this.toList()} />
                </div>
              </div>
            )}
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }
});