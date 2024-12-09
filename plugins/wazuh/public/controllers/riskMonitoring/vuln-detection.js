import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiToolTip,
  EuiHealth,
  EuiButton,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { filtersToObject } from '../../components/wz-search-bar';
import { GroupTruncate } from '../../components/common/util';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getDataPlugin, getToasts }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { AppState } from '../../react-services/app-state';
import { KbnSearchBar } from '../../components/kbn-search-bar';
import { VulnVis } from './vulnDetection/vuln-vis';
import { VulnAlertsWarp } from './vulnDetection/vuln-alerts-warp';

export const VulnDetection = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '风险检测' }, { text: '漏洞检测' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class VulnDetection extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
		this.state = {
      isDescPopoverOpen: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      sortField: 'name',
      sortDirection: 'asc',
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      isLoading: false,
      isPopoverOpen: false,
      currentUserInfo: {},
      departmentGroups: [],
      listType: 'list',
      selectItem: {},
      dateRange: this.timefilter.getTime(),
    };

    this.onQuerySubmit.bind(this);
    this.onFiltersUpdated.bind(this);
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

		try {
      await this.getIndexPattern();
    } catch (err) {
      console.log(err);
    }
  }
  componentWillUnmount() {
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
	
	async getIndexPattern () {
    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};
    const fields = [];
    Object.keys(this.indexPattern.fields).forEach(item => {
      fields.push(this.indexPattern.fields[item]);
    })
    this.indexPattern.fields = fields;
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
          content="查看漏洞"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation()
              this.toVuln(item);
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查看漏洞"
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

  toVuln(item) {
    this.setState({ selectItem: item, listType: 'vuln' });
  };

	onQuerySubmit = (payload) => {
    console.log(payload)
    this.setState({...payload, tsUpdated: Date.now()});
  }

  onFiltersUpdated = (filters) => {
    this.setState({ tsUpdated: Date.now()});
  }

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['vulnDetection'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['vulnDetection'].description}
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
                  <h2>代理列表({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={() => this.toVuln({})}
                >
                 所有
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  toList() {
    this.setState({ listType: 'list', selectItem: {}, tsUpdated: Date.now() });
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
		const { listType, selectItem, tsUpdated, dateRange } = this.state;
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
							<EuiPage style={{'display': 'block'}}>
                <KbnSearchBar
									indexPattern={this.indexPattern}
									onQuerySubmit={this.onQuerySubmit}
									onFiltersUpdated={this.onFiltersUpdated}
								/>
                { listType === 'list' && (
                  <VulnVis tsUpdated={tsUpdated} />
                )}
                <EuiPanel>
                { listType === 'list' && (
                  <div>
                    {head}
                    {table}
                  </div>
                )}
                { listType === 'vuln' && (
                  <VulnAlertsWarp isAgent={selectItem} toList={() => this.toList()} dateRange={dateRange} />
                )}
                </EuiPanel>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});