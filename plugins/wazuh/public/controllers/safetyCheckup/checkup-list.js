import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
  EuiButton,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiToolTip,
  EuiHealth,
  EuiProgress,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { filtersToObject } from '../../components/wz-search-bar';
import { formatUIDate } from '../../react-services/time-service';
import { GroupTruncate } from '../../components/common/util';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { AppState } from '../../react-services/app-state';
import { CheckupResult }  from './checkupList/checkup-result';

export const CheckupList = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '安全体检' }, { text: '体检列表' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class CheckupList extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      sortField: 'id',
      sortDirection: 'asc',
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      isLoading: false,
      isPopoverOpen: false,
      currentUserInfo: {},
      departmentGroups: [],
      listType: 'list',
      selectItem: {},
      checkRate: [],
    };
    this.timer = null;
	}

	async componentDidMount() {
    this._isMount = true;

    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }

    await this.getItems();
    this.timer = setInterval(() => {
      const { listItems } = this.state;
      const ids = listItems.map(k => k.id).join(',');
      if (listItems.length > 0) this.getCheckRate(ids)
    }, 10 * 1000)
  }
  componentWillUnmount() {
    clearInterval(this.timer)
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(prevState.filters, this.state.filters))
      || prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const { departmentGroups, currentUserInfo } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isLoading: false });
        return
      }
      const rawAgents = await WzRequest.apiReq(
        'GET',
        '/agents',
        { params: this.buildFilter() }
      );

      const formatedAgents = (
        ((rawAgents || {}).data || {}).data || {}
      ).affected_items.map(this.formatAgent.bind(this));

      const ids = formatedAgents.map(k => k.id).join(',');
      await this.getCheckRate(ids);

      this._isMount &&
        this.setState({
          listItems: formatedAgents,
          totalItems: (((rawAgents || {}).data || {}).data || {}).total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  async getCheckRate(ids) {
    try {
      const rawItems = await WzRequest.apiReq('GET', `/manager/health_check_rate?agents_list=${ids}&pretty=true`, {});
      const { affected_items } = ((rawItems || {}).data || {}).data || {};
      this.setState({ checkRate: affected_items })
    } catch (error) {
      console.log(error)
    }
  }

  buildFilter() {
    const { pageIndex, pageSize, filters, currentUserInfo, departmentGroups } = this.state;

    const filter = {
      ...filtersToObject(filters),
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      sort: this.buildSortFilter()
    };
    filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;
    if (currentUserInfo.department) {
      filter.q = `${filter.q};(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
    }

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField === 'os_name' ? 'os.name,os.version' : sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return direction + field;
  }

  formatAgent(agent) {       
    const checkField = field => {
      return field !== undefined ? field : '-';
    };
    
    return {
      id: agent.id,
      name: agent.name,
      ip: agent.ip,
      status: agent.status,
      group: checkField(agent.group),
      health_check_status: agent.health_check_status,
      health_check_type: agent.health_check_type,
      health_check_score: agent.health_check_score,
      last_time: agent.last_time ? agent.last_time === 'empty' ? '未检查' : formatUIDate(agent.last_time) : '-',
    };
  }

  filterGroupBadge = (group) => {
    const { filters } = this.state;
    let auxFilters = filters.map(filter => filter.value.match(/group=(.*S?)/)[1]);
    if (filters.length > 0) {
      !auxFilters.includes(group) ?
        this.setState({
          filters: [...filters, { field: "q", value: `group=${group}` }],
        }) : false;
    } else {
      this.setState({
        filters: [...filters, { field: "q", value: `group=${group}` }],
      })
    }
  }
  renderGroups(groups) {
    return (
      <GroupTruncate groups={groups} length={25} label={'more'} action={'filter'} filterAction={this.filterGroupBadge} {...this.props} />
    )
  }
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="体检详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation()
              this.toResult(item);
            }}
            iconType="eye"
            color={'primary'}
            aria-label="体检详情"
          />
        </EuiToolTip>
      </div>
    )
  }
  columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
        width: '50'
      },
      {
        field: 'ip',
        name: 'IP',
        sortable: true
      },
      {
        field: 'name',
        name: '主机名',
        sortable: true,
      },
      {
        field: 'group',
        name: '组',
        sortable: true,
        render: groups => groups !== '-' ? this.renderGroups(groups) : '-'
      },
      {
        field: 'status',
        name: '状态',
        sortable: true,
        render: this.addHealthStatusRender
      },
      {
        field: 'health_check_type',
        name: '体检模式',
        render: health_check_type => {
          const options = {
            'immediate': '及时体检',
            'period': '定时体检'
          }
          return (
            <span>{options[health_check_type] ? options[health_check_type] : '-'}</span>
          )
        },
      },
      {
        name: '体检状态',
        render: (agent) => {
          const { checkRate } = this.state;
          const obj = checkRate.find(k => k.agent_id === agent.id)
          const options = {
            'doing': '正在执行',
            'waiting': '等待执行',
            'done': '执行完成',
            'undo': '未体检',
          }
          return (
            <span>{options[obj?.status] ? options[obj?.status] : '-'}</span>
          )
        },
      },
      {
        name: '体检进度',
        width: '200',
        render: (agent) => {
          const { checkRate } = this.state;
          const options = {
            'waiting': 0,
            'done': 100,
          }
          const obj = checkRate.find(k => k.agent_id === agent.id)
          let preValue = 0
          if (Object.keys(options).indexOf(obj?.status) !== -1) {
            preValue = options[obj?.status]
          }
          else {
            preValue = obj?.rate
          }
          return (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '140px', marginRight: '6px' }}>{!obj || obj?.status === 'undo' ? '-' : (
                <EuiProgress
                  value={preValue}
                  color={'warning'}
                  max={100}
                  size="s"
                />
              )}</div>
              <div>{!obj || obj?.status === 'undo' ? '' : `${preValue}%`}</div>
            </div>
          )
        },
      },
      {
        field: 'last_time',
        name: '上次体检时间',
      },
      {
        field: 'health_check_score',
        name: '体检分数',
        render: health_check_score => health_check_score ? health_check_score : '-'
      },
      {
        align: 'right',
        width: '80',
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ];
  }
  addHealthStatusRender(status) {
    const color = status => {
      if (status.toLowerCase() === 'active') {
        return 'success';
      } else if (status.toLowerCase() === 'disconnected') {
        return 'danger';
      } else if (status.toLowerCase() === 'never_connected') {
        return 'subdued';
      }
    };
    const statusText = {
      never_connected: '从未连接',
      disconnected: '未连接',
      active: '已连接',
      pending: '挂起'
    }

    return <EuiHealth color={color(status)}><span className={'hide-agent-status'}>{statusText[status] ? statusText[status] : status}</span></EuiHealth>;
  }
  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this._isMount && this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection
    });
  };
  tableRender() {
    const {
      listItems,
      totalItems,
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      isLoading,
    } = this.state;
    const columns = this.columns();
    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection
      }
    };
    return (
      <EuiBasicTable
        itemId="id"
        items={listItems}
        columns={columns}
        {...(pagination && { pagination })}
        onChange={this.onTableChange}
        loading={isLoading}
        sorting={sorting}
        noItemsMessage="没有找到代理"
      />
    )
  }

  toResult(item) {
    this.setState({ selectItem: item, listType: 'result' });
  };

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['checkupList'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['checkupList'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>体检列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.getItems()}
            >
              刷新
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  toList() {
    this.setState({ listType: 'list', selectItem: {} });
    this.getItems();
  };
	
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

	render() {
		const { listType, selectItem } = this.state;
		const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();

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
								<EuiFlexGroup direction="column">
                  <EuiFlexItem grow={false}>
                    <EuiPanel>
                    { listType === 'list' && (
                      <div>
                        {head}
                        {table}
                      </div>
                    )}
                    { listType === 'result' && (
                      <CheckupResult detailsItem={selectItem} toList={() => this.toList()} />
                    )}
                    </EuiPanel>
                  </EuiFlexItem>
								</EuiFlexGroup>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});