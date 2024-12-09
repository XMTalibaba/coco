import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiTabs,
  EuiTab,
  EuiInMemoryTable,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiSpacer,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { formatUIDate } from '../../../react-services/time-service';
import { AppState } from '../../../react-services/app-state';
import { ResultCheck } from './result-check';
import '../../hostProtection/blackWhiteList/blackWhiteList.scss';

export class PolicyResult extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.offset = 240;
		this.state = {
      tabs: [
        { id: 'agent', name: '主机' },
        { id: 'checkItem', name: '检查项' },
      ],
      selectView: 'agent',
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      currentUserInfo: {},
      departmentGroups: [],
      listType: 'list',
      selectPolicy: {},
    }
  }

  async componentDidMount() {
		this.height = window.innerHeight - this.offset;
		this.forceUpdate();
    window.addEventListener('resize', this.updateHeight);

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

	componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

  async getItems() {
    try {
      this.setState({ isLoading: true });
      const { selectView, currentUserInfo, departmentGroups } = this.state;
      const { detailsItem } = this.props;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isLoading: false });
        return
      }

      const rawItems = await WzRequest.apiReq(
        'GET',
        `/agents/summary/sca?pretty=true${currentUserInfo.department ? `&groups_list=${departmentGroups.map(k => `${k.name}`).join(',')}` : ''}${selectView === 'checkItem' ? `&name=all` : ''}${detailsItem.agents === 'all' ? '' : `&agents_list=${detailsItem.agents.split('|').join(',')}`}&sca_policies=${detailsItem.sca_policies.split('|').join(',')}`,
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

  renderTabs() {
		const { selectView } = this.state;
		return (
			<EuiTabs className="columnTabs" >
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
    );
	}

  onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
			this.setState({ selectView: id }, this.getItems);
    }
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
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
              this.setState({ listType: 'check', selectPolicy: item })
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

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  renderTable() {
    const {
      totalItems,
      pageIndex,
      pageSize,
      listItems,
      isLoading,
      selectView,
    } = this.state;
    const agentColumns = [
      { field: 'agent_id', name: '主机ID' },
      { field: 'agent_name', name: '主机名' },
      { field: 'agent_ip', name: '主机IP' },
      { field: 'count', name: '数量' },
      { field: 'last_time', name: '上次检查时间', render: last_time => last_time ? formatUIDate(last_time) : '-' },
      { field: 'total', name: '总量' },
      { field: 'exception', name: '异常量' },
    ]
    const checkItemColumns = [
      { field: 'policy_name', name: '检查项' },
      { field: 'policy_id', name: '检查项ID' },
      { field: 'agent_id', name: '主机ID' },
      { field: 'last_time', name: '上次检查时间', render: last_time => last_time ? formatUIDate(last_time) : '-' },
      { field: 'count', name: '数量' },
      { field: 'pass_rate', name: '通过率' },
      { name: '操作', render: item => this.actionButtonsRender(item) },
    ]
    const columns = selectView === 'agent' ? agentColumns : checkItemColumns;
    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
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
    this.setState({ listType: 'list', selectPolicy: {} })
    this.getItems();
  }

  render() {
    const { listType, selectPolicy } = this.state;
    const { detailsItem } = this.props;
		const tabs = this.renderTabs();
    const table = this.renderTable();
		return (
			<div>
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgb(211, 218, 230)'}}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiTitle size="s">
                    <h3>{`${detailsItem.name}检查结果`}</h3>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    size="s"
                    onClick={() => this.props.toList()}
                    iconType="cross"
                  >
                    关闭
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        { listType === 'list' && (
          <EuiFlexGroup style={{ height: this.height }}>
            <EuiFlexItem grow={false} style={{ borderRight: '1px solid #D3DAE6', overflowY: 'auto' }}>
              {tabs}
            </EuiFlexItem>
            <EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
              <EuiSpacer size="m" />
              {table}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        { listType !== 'list' && (
          <EuiFlexGroup style={{ height: this.height }}>
            <EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
              <ResultCheck selectPolicy={selectPolicy} toList={() => this.toList()} />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </div>
		);
	}
}