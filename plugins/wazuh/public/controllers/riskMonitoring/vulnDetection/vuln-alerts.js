import React, { Component } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiIcon,
  EuiButtonEmpty,
} from '@elastic/eui';
import { AppState } from '../../../react-services/app-state';
import { getDataPlugin, getUiSettings, getToasts } from '../../../kibana-services';
import { WazuhConfig } from '../../../react-services/wazuh-config';
import { GenericRequest } from '../../../react-services/generic-request';
import DateMatch from '@elastic/datemath';
import {
  getEsQueryConfig,
  buildEsQuery,
  buildPhraseFilter,
  buildPhrasesFilter,
} from '../../../../../../src/plugins/data/common';
import { formatUIDate } from '../../../react-services/time-service';
import { RowDetails } from '../../../components/common/modules/discover/row-details';
import { WzRequest } from '../../../react-services/wz-request';

export class VulnAlerts extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.wazuhConfig = new WazuhConfig();
    this.clusterFilter = {};

    this.state = {
      isLoading: false,
      columns: [],
      alerts: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      sortField: 'timestamp',
      sortDirection: 'desc',
      requestFilters: {},
      query: props.query || { language: "kuery", query: "" },
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
      "syscheck.event": "文件行为3",
      'data.audit.command': '命令',
      'data.srcip': '源IP',
      'data.srcuser': '用户',
      'data.uid': '用户ID',
      'data.gid': '用户组ID',
      'data.dstuser': '文件路径',
      'data.vulnerability.cnnvd': 'CNNVD',
      'data.vulnerability.solution': '解决方案',
    }
  }

  async componentDidMount() {
    this._isMount = true;
    const isCluster = (AppState.getClusterInfo() || {}).status === "enabled";
      const clusterFilter = isCluster
        ? { "cluster.name": AppState.getClusterInfo().cluster }
        : { "manager.name": AppState.getClusterInfo().manager };
    this.clusterFilter = clusterFilter;

    
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentAgents = await AppState.getDepartmentAgents();
      this.setState({ departmentAgents })
    }

    try {
      this.setState({columns: this.getColumns(), currentUserInfo}) //initial columns
      await this.getIndexPattern();
      await this.getAlerts();
    } catch (err) {
      console.log(err);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!this._isMount) { return; }

    if((!prevProps.isAgent.id && this.props.isAgent.id) || (prevProps.isAgent.id && !this.props.isAgent.id) || prevProps.isAgent.id !== this.props.isAgent.id){
      this.setState({ columns: this.getColumns() }); // Updates the columns to be rendered if you change the selected agent to none or vice versa
      // return;
    }

    if(!_.isEqual(this.props.query,prevProps.query)){
      this.setState({ query: {...this.props.query}});
      return;
    };

    if((this.props.isAgent.id !== prevProps.isAgent.id)
      || (!_.isEqual(this.state.query, prevState.query))
      || (!_.isEqual(this.props.dateRange, prevProps.dateRange))
      || (this.props.refreshAngularDiscover !== prevProps.refreshAngularDiscover)
    ){
      this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
      return;
    };

    if (['pageIndex', 'pageSize', 'sortField', 'sortDirection'].some(field => this.state[field] !== prevState[field] || (this.state.tsUpdated !== prevState.tsUpdated))) {
      try {
        await this.getAlerts();
      } catch (err) {
        console.log(err);
      };
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
            _id: alert._id,
            actions: alert
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

  buildFilter() {
    // const dateParse = ds => /\d+-\d+-\d+T\d+:\d+:\d+.\d+Z/.test(ds) ? DateMatch.parse(ds).toDate().getTime() : ds;
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
    const { query, phaseSelect, currentUserInfo, departmentAgents } = this.state;
    const { hideManagerAlerts } = this.wazuhConfig.getConfig();
    const extraFilters = [];
    if (hideManagerAlerts) extraFilters.push({
      meta: {
        alias: null,
        disabled: false,
        key: 'agent.id',
        negate: true,
        params: { query: '000' },
        type: 'phrase',
        index: this.indexPattern.title
      },
      query: { match_phrase: { 'agent.id': '000' } },
      $state: { store: 'appState' }
    });

    const filters = this.props.shareFilterManager ? this.props.shareFilterManager.filters : [];
    const previousFilters = this.KibanaServices && this.KibanaServices.query.filterManager.filters ? this.KibanaServices.query.filterManager.filters : [];

    const elasticQuery =
      buildEsQuery(
        undefined,
        query,
        [...previousFilters, ...filters, ...extraFilters],
        getEsQueryConfig(getUiSettings())
      );
    
    const { sortField, sortDirection } = this.state;

    const range = {
      range: {
        timestamp: {
          gte: dateParse(this.timefilter.getTime().from),
          lte: dateParse(this.timefilter.getTime().to),
          format: 'epoch_millis'
        }
      }
    }
    elasticQuery.bool.must.push(range);

    if(this.props.isAgent.id){
      elasticQuery.bool.must.push({
        match: {"agent.id": this.props.isAgent.id}
      });
    };

    elasticQuery.bool.filter.push({ match_phrase: this.clusterFilter});

    // 默认搜索条件
    let formattedFilter = buildPhraseFilter({ name: 'rule.groups', type: "string" }, 'vulnerability-detector', this.indexPattern);
    elasticQuery.bool.filter.push(formattedFilter.query);

    if (currentUserInfo.department) {
      const agentFilter = buildPhrasesFilter({ name: 'agent.id', type: "string" }, departmentAgents.length > 0 ? departmentAgents.map(k => k.id) : [''], this.indexPattern);
      elasticQuery.bool.filter.push(agentFilter.query);
    }

    // 过滤 000 主机告警
    elasticQuery.bool.must_not.push({match_phrase: {['agent.id']: "000"}});

    return {
      query: elasticQuery,
      size: this.state.pageSize,
      from: this.state.pageIndex*this.state.pageSize,
      ...(sortField ? {sort: { [sortField]: { "order": sortDirection } }}: {})
    };
  }

  getColumns () {
    let columns = ["icon", "timestamp", 'rule.description', 'data.vulnerability.cnnvd', 'data.vulnerability.solution'];

    if(this.props.isAgent.id){
      return columns.filter(column => !['agent.id', 'agent.name'].includes(column));
    }else{
      columns.splice(2, 0, 'agent.id');
      columns.splice(3, 0, 'agent.name');
      return columns;
    }
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
          width: '10%',
          sortable: true,
          render: time => {
            return <span>{formatUIDate(time)}</span>
          },
        }
      }

      let width = false;
      if(item === 'agent.id' || item === 'agent.name') {
        width = '100';
      }
      else if (item === 'rule.level') {
        width = '200';
      }
      else if (item === 'data.vulnerability.solution') {
        width = '600';
      }

      let column = {
        field: item,
        name: this.nameEquivalences[item] || item
      }

      if (width) {
        column.width = width;
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
      pageSize,
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
  
  headRender() {
    const { isAgent } = this.props;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>{isAgent.name ? isAgent.name : ''}漏洞检测</h2>
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
        <EuiSpacer size="xs" />
      </div>
    );
  }

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

  render() {
    const head = this.headRender();
    const table = this.tableRender();
    return (
      <div className='wz-inventory'>
        {head}
        {table}
      </div>
    )
  }
}