import React, { Component } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiToolTip,
  EuiButtonIcon,
  EuiIcon,
  EuiText,
  EuiSelect,
  EuiPopover,
  EuiPopoverTitle,
  EuiPage,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { AppState } from '../../react-services/app-state';
import { getDataPlugin, getToasts } from '../../kibana-services';
import { GenericRequest } from '../../react-services/generic-request';
import { formatUIDate } from '../../react-services/time-service';
import { KbnSearchBar } from '../../components/kbn-search-bar';
import { RowDetails } from '../../components/common/modules/discover/row-details';
import { buildPhrasesFilter } from '../../../../../src/plugins/data/common';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { WzRequest } from '../../react-services/wz-request';

export const ConnectionRecord = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '连接记录' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ConnectionRecord extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
 
    this.state = {
      isLoading: false,
      columns: ['icon', 'timestamp', 'rule.description'],
      alerts: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      requestFilters: {},
      dateRange: this.timefilter.getTime(),
      itemIdToExpandedRowMap: {},
      currentUserInfo: {},
      departmentAgents: [],
    }
 
    this.nameEquivalences = {
      "agent.id": "代理",
      "agent.name": "代理名称",
      "agent.ip": "代理IP",
      "rule.id": "规则ID",
      "rule.description": "描述",
      "rule.level": "等级",
      "rule.mitre.id": "技术",
      "rule.mitre.tactic": "策略",
      "rule.pci_dss": "PCI DSS",
      "rule.gdpr": "GDPR",
      "rule.nist_800_53": "NIST 800-53",
      "rule.tsc": "TSC",
      "rule.hipaa": "HIPAA",
      "data.connection.id": "网络名称",
      "data.connection.uuid": "网络UUID",
      "data.connection.type": "网络类型",
      "data.connection.mac": "MAC地址",
      "syscheck.path": "文件路径",
      "syscheck.event": "文件行为5",
      'data.audit.command': '命令',
      'data.srcip': '源IP',
      'data.srcuser': '用户',
      'data.uid': '用户ID',
      'data.gid': '用户组ID',
      'data.dstuser': '文件路径',
      'source.ip': '来源IP',
      'source.port': '来源端口',
      'destination.ip': '目的IP',
      'destination.port': '目的端口',
    }
 
    this.onQuerySubmit.bind(this);
    this.onFiltersUpdated.bind(this);
  }
 
  async componentDidMount() {
    this._isMount = true;
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo })
    if (currentUserInfo.department) {
      let departmentAgents = await AppState.getDepartmentAgents();
      this.setState({ departmentAgents })
    }
 
    try {
      this.setState({columns: this.getColumns()}) //initial columns
      await this.getIndexPattern();
      await this.getAlerts();
    } catch (err) {
      console.log(err);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!this._isMount) { return; }

    if((!prevProps.isAgent && this.props.isAgent) || (prevProps.isAgent && !this.props.isAgent) || prevProps.isAgent !== this.props.isAgent){
      this.setState({ columns: this.getColumns() }); // Updates the columns to be rendered if you change the selected agent to none or vice versa
      // return;
    }
 
    if(!_.isEqual(this.state.dateRange, prevState.dateRange)){
      this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
      return;
    };
 
    if (['pageIndex', 'pageSize'].some(field => this.state[field] !== prevState[field] || (this.state.tsUpdated !== prevState.tsUpdated))) {
      try {
        await this.getAlerts();
      } catch (err) {
        console.log(err);
      };
    }
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
                    <span>&nbsp;{WAZUH_MODULES['connectionRecord'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['connectionRecord'].description}
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

  async getIndexPattern () {
    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};
    const fields = [];
    Object.keys(this.indexPattern.fields).forEach(item => {
      fields.push(this.indexPattern.fields[item]);
    })
    this.indexPattern.fields = fields;
  }

  async getAlerts() {
    if (!this.indexPattern || this.state.isLoading) return;
    //compare filters so we only make a request into Elasticsearch if needed
    const newFilters = this.buildFilter();
    try {
        this.setState({ isLoading: true});
        const alerts = await GenericRequest.request(
          'POST',
          `/elastic/alerts`,
          {
            index: this.indexPattern.title,
            body: newFilters
          }
        );
        const formatedAlerts = alerts.data.hits.hits.map(alert => {
          return {
            ...alert._source,
            _id: alert._id
          }
        });
        if (this._isMount) {
          this.setState({ alerts: formatedAlerts, total: alerts.data.hits.total.value, isLoading: false, requestFilters: newFilters});
        }
        
    } catch (err) {
      if (this._isMount) {
        this.setState({ alerts: [], total: 0, isLoading: false, requestFilters: newFilters});
      }
    }
  }

  getColumns () {
    let columns = ['icon', 'timestamp', 'rule.description'];

    if(this.props.isAgent){
      return columns.filter(column => !['agent.id', 'agent.name'].includes(column));
    }else{
      columns.splice(2, 0, 'agent.id');
      columns.splice(3, 0, 'agent.name');
      return columns;
    }
  }
 
  buildFilter() {
    const { currentUserInfo, departmentAgents } = this.state;
    const dateParse = ds => {
      let reg = /\d+-\d+-\d+T\d+:\d+:\d+.\d+Z/;
      if (reg.test(ds)) {
        return DateMatch.parse(ds).toDate().getTime()
      }
      else if (!isNaN(new Date(ds).getTime())) {
        return new Date(ds).getTime()
      }
      else {
        return ds
      }
    }

    const elasticQuery = {
      bool: {
        filter: [
          {match_all: {}},
        ],
        must: [],
        must_not: [{match_phrase: {['agent.id']: "000"}}],
        should: [],
      }
    }
 
    const range = {
      range: {
        timestamp: {
          gte: dateParse(this.timefilter.getTime().from),
          lte: dateParse(this.timefilter.getTime().to),
          format: 'epoch_millis'
        }
      }
    }
    elasticQuery.bool.filter.push(range);

    let formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: "string" }, ['501', '503', '504', '505'], this.indexPattern);
    elasticQuery.bool.filter.push(formattedFilter.query)

    if (currentUserInfo.department) {
      const agentFilter = buildPhrasesFilter({ name: 'agent.id', type: "string" }, departmentAgents.length > 0 ? departmentAgents.map(k => k.id) : [''], this.indexPattern);
      elasticQuery.bool.filter.push(agentFilter.query);
    }
 
    return {
      query: elasticQuery,
      size: this.state.pageSize,
      from: this.state.pageIndex*this.state.pageSize,
      sort: {
        'timestamp': {
          order: 'desc'
        }
      },
      track_total_hits: true // 返回 total 为总量
    };
  }

  columns = () => {
    let columnsList = [...this.state.columns];
    const columns = columnsList.map((item) => {
      if (item === "icon") {
        return {
          width: "25px",
          isExpander: true,
          render: item => {
            return (
              <EuiIcon size="s" type={this.state.itemIdToExpandedRowMap[item._id] ? "arrowDown" : "arrowRight"} />
            )
          },
        }
      }
      if (item === "timestamp") {
        return {
          field: 'timestamp',
          name: '时间',
          width: '240',
          sortable: true,
          render: time => {
            return <span>{formatUIDate(time)}</span>
          },
        }
      }

      let column = {
        field: item,
        name: this.nameEquivalences[item] || item
      }

      return column
    });

    return columns;
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;

    this.setState({
      pageIndex,
      pageSize
    });
  };

  toggleDetails = item => {
    const itemIdToExpandedRowMap = { ...this.state.itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMap[item._id]) {
      delete itemIdToExpandedRowMap[item._id];
      this.setState({ itemIdToExpandedRowMap });
    } else {
      const newItemIdToExpandedRowMap = {};
      newItemIdToExpandedRowMap[item._id] = (
        (<div style={{ width: "100%" }}> <RowDetails item={item} addFilter={(filter) => this.addFilter(filter)} addFilterOut={(filter) => this.addFilterOut(filter)} toggleColumn={(id) => this.addColumn(id)} /></div>)
      );
      this.setState({ itemIdToExpandedRowMap: newItemIdToExpandedRowMap });
    }
  };

  tableRender() {
    const { alerts, pageIndex, pageSize, total, itemIdToExpandedRowMap } = this.state;
    const columns = this.columns();

    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: total > 10000 ? 10000 : total,
      pageSizeOptions: [10, 25, 50],
    };

    const getCellProps = (item, column) => {
      if(column.field=="actions"){
        return
      }
      return {
        onMouseDown: (ev) => {
          this.toggleDetails(item);
          ev.stopPropagation()
        }
      }
    };

    const getRowProps = item => {
      const { _id } = item;
      return {
        'data-test-subj': `row-${_id}`,
        className: 'customRowClass',
        onClick: () => {},
      };
    };

    return (
      <EuiBasicTable
        items={alerts}
        className="module-discover-table"
        itemId="_id"
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        isExpandable={true}
        columns={columns}
        cellProps={getCellProps}
        rowProps={getRowProps}
        pagination={pagination}
        onChange={this.onTableChange}
        noItemsMessage="无数据"
      />
    )
  }

  onQuerySubmit = (payload) => {
    this.setState({...payload, tsUpdated: Date.now()});
  }

  onFiltersUpdated = (filters) => {
    this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
  }

  render() {
    const title = this.renderTitle();
    let table = this.tableRender();
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
                <div className='wz-inventory'>
                  <KbnSearchBar
                    indexPattern={this.indexPattern}
                    onQuerySubmit={this.onQuerySubmit}
                    onFiltersUpdated={this.onFiltersUpdated}
                  />
                  <EuiPanel>
                    {table}
                  </EuiPanel>
                </div>
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});