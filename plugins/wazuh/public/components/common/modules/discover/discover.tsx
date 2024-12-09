/*
 * Wazuh app - Integrity monitoring table component
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, } from 'react';
import './discover.scss';
import { FilterManager, Filter } from '../../../../../../../src/plugins/data/public/'
import { GenericRequest } from '../../../../react-services/generic-request';
import { AppState } from '../../../../react-services/app-state';
import { AppNavigate } from '../../../../react-services/app-navigate';
import { RowDetails } from './row-details';
import DateMatch from '@elastic/datemath';
import { WazuhConfig } from '../../../../react-services/wazuh-config';
import { formatUIDate } from '../../../../react-services/time-service';
import { KbnSearchBar } from '../../../kbn-search-bar';
import { FlyoutTechnique } from '../../../../components/overview/mitre/components/techniques/components/flyout-technique';
import { withReduxProvider } from '../../../common/hocs';
import { WAZUH_MODULES_SEARCH_INIT } from '../../../../../common/wazuh-modules-search-init';
import exportAlertCsv from '../../../../react-services/wz-alert-csv';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _ from 'lodash';
import { WzRequest } from '../../../../react-services/wz-request';

import {
  EuiBasicTable,
  EuiLoadingContent,
  EuiTableSortingType,
  EuiFlexItem,
  EuiFlexGroup,
  Direction,
  EuiOverlayMask,
  EuiSpacer,
  EuiCallOut,
  EuiIcon,
  EuiButtonIcon,
  EuiButtonEmpty,
  EuiToolTip,
  EuiPopover,
  EuiButton,
  EuiPopoverTitle,
  EuiPopoverFooter,
  EuiCheckboxGroup
} from '@elastic/eui';
import {
  IIndexPattern,
  TimeRange,
  Query,
  buildPhraseFilter,
  buildPhrasesFilter,
  buildCustomFilter,
  getEsQueryConfig,
  buildEsQuery,
  IFieldType
} from '../../../../../../../src/plugins/data/common';
import { getDataPlugin, getToasts, getUiSettings } from '../../../../kibana-services';

const mapStateToProps = state => ({
  currentAgentData: state.appStateReducers.currentAgentData
});

export const Discover = compose(
  withReduxProvider,
  connect(mapStateToProps)
)(class Discover extends Component {
  _isMount!: boolean;
  timefilter: {
    getTime(): TimeRange
    setTime(time: TimeRange): void
    _history: { history: { items: { from: string, to: string }[] } }
  };

  KibanaServices: { [key: string]: any };
  state: {
    sort: object
    selectedTechnique: string,
    showMitreFlyout: boolean,
    alerts: { _source: {}, _id: string }[]
    total: number
    pageIndex: number
    pageSize: number
    sortField: string
    sortDirection: Direction
    isLoading: boolean
    requestFilters: object
    requestSize: number
    requestOffset: number
    query: { language: "kuery" | "lucene", query: string }
    itemIdToExpandedRowMap: any
    dateRange: TimeRange
    elasticQuery: object
    columns: string[]
    hover: string,
    generatingCsv: boolean,
    isPopoverOpen: boolean,
    columnsPopover: { id: string, label: string }[],
    columnsSelect: any,
    searchInitArr: any,
  };
  indexPattern!: IIndexPattern
  props!: {
    implicitFilters: object[],
    initialFilters: object[],
    query?: { language: "kuery" | "lucene", query: string }
    type?: any,
    updateTotalHits: Function,
    includeFilters?: string,
    tab?: string,
    initialColumns: string[],
    shareFilterManager: FilterManager,
    refreshAngularDiscover?: number
  }
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.state = {
      sort: {},
      selectedTechnique: "",
      showMitreFlyout: false,
      alerts: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      sortField: 'timestamp',
      sortDirection: 'desc',
      isLoading: false,
      requestFilters: {},
      requestSize: 500,
      requestOffset: 0,
      itemIdToExpandedRowMap: {},
      dateRange: this.timefilter.getTime(),
      query: props.query || { language: "kuery", query: "" },
      elasticQuery: {},
      columns: [],
      hover: "",
      generatingCsv: false,
      isPopoverOpen: false,
      columnsPopover: [],
      columnsSelect: [],
      searchInitArr: [],
    }

    this.wazuhConfig = new WazuhConfig();
    this.exportAlertCsv = exportAlertCsv;
    this.nameEquivalences = {
      'timestamp': '时间',
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
      "syscheck.event": "文件行为",
      'data.audit.command': '命令',
      'data.srcip': '源IP',
      'data.srcuser': '用户',
      'data.uid': '用户ID',
      'data.gid': '用户组ID',
      'data.vulnerability.cnnvd': 'CNNVD',
      'data.vulnerability.severity': '严重程度',
      'data.vulnerability.package.condition': '安装包描述',
      'data.vulnerability.package.name': '安装包名称',
      'data.vulnerability.package.source': '安装包源',
      'data.vulnerability.package.version': '版本信息',
      'data.vulnerability.references': '参考信息',
      'data.vulnerability.assigner': '报告团队',
      'data.vulnerability.published': '漏洞公布日期',
      'data.vulnerability.cwe_reference': 'CWE',
      'data.vulnerability.title': '漏洞标题',
      'data.vulnerability.rationale': '漏洞描述',
      'data.vulnerability.cve': 'CVE',
      'data.vulnerability.solution': '漏洞建议',
      'data.vulnerability.updated': '漏洞更新日期',
    }

    this.hideCreateCustomLabel.bind(this);
    this.onQuerySubmit.bind(this);
    this.onFiltersUpdated.bind(this);
    this.hideCreateCustomLabel()
  }

  showToast = (color, title, time) => {
    getToasts().add({
      color: color,
      title: title,
      toastLifeTimeMs: time,
    });
  };

  async componentDidMount() {
    this._isMount = true;
    try {
      this.setState({columns: this.getColumns()}) //initial columns
      await this.getIndexPattern();
      await this.getAlerts();
    } catch (err) {
      console.log(err);
    }
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!this._isMount) { return; }
    if((!prevProps.currentAgentData.id && this.props.currentAgentData.id) || (prevProps.currentAgentData.id && !this.props.currentAgentData.id) || prevProps.currentAgentData.id !== this.props.currentAgentData.id){
      this.setState({ columns: this.getColumns() }); // Updates the columns to be rendered if you change the selected agent to none or vice versa
      return;
    }
    if(!_.isEqual(this.props.query,prevProps.query)){
      this.setState({ query: {...this.props.query}});
      return;
    };
    if((this.props.currentAgentData.id !== prevProps.currentAgentData.id)
      || (!_.isEqual(this.state.query, prevState.query))
      || (!_.isEqual(this.state.dateRange, prevState.dateRange))
      || (this.props.refreshAngularDiscover !== prevProps.refreshAngularDiscover)
    ){
      this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
      return;
    };
    if(['pageIndex', 'pageSize', 'sortField', 'sortDirection'].some(field => this.state[field] !== prevState[field]) || (this.state.tsUpdated !== prevState.tsUpdated)){
      try {
        await this.getAlerts();
      } catch (err) {
        console.log(err);
      };
    };
  }

  getColumns () {
    let columns = []
    if (WAZUH_MODULES_SEARCH_INIT[this.props.tab]) {
      const searchInitArr = WAZUH_MODULES_SEARCH_INIT[this.props.tab];
      this.setState({ searchInitArr });
      searchInitArr.length > 0 && searchInitArr.forEach(searchInit => {
        if (searchInit.acton === 'dis' && searchInit.columns.length > 0) { // 表格列
          columns = [...searchInit.columns];
        }
      })
    }

    if (columns.length === 0) columns = [...this.props.initialColumns];

    if(this.props.currentAgentData.id){
      columns =  columns.filter(column => !['agent.id', 'agent.name'].includes(column));
    }else{
      columns.splice(2, 0, 'agent.id');
      columns.splice(3, 0, 'agent.name');
    }
    let columnsSelect = {};
    columns.forEach(k => {
      columnsSelect[k] = true;
    })
    this.setState({ columnsSelect })
    return columns;
  }

  async getIndexPattern () {
    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};
    const fields:IFieldType[] = [];
    Object.keys(this.indexPattern.fields).forEach(item => {
      if (isNaN(item)) {
        fields.push(this.indexPattern.fields[item]);
      } else if (this.props.includeFilters && this.indexPattern.fields[item].name.includes(this.props.includeFilters)) {
        fields.unshift(this.indexPattern.fields[item]);
      } else {
        fields.push(this.indexPattern.fields[item]);
      }
    })
    this.indexPattern.fields = fields;
  }

  hideCreateCustomLabel = () => {
    try {
      const button = document.querySelector(".wz-discover #addFilterPopover > div > button > span > span");
      if (!button) return setTimeout(this.hideCreateCustomLabel, 100);
      const findAndHide = () => {
        const switcher = document.querySelector("#filterEditorCustomLabelSwitch")
        if (!switcher) return setTimeout(findAndHide, 100);
        switcher.parentElement.style.display = "none"
      }
      button.onclick = findAndHide;
    } catch (error) { }
  }

  filtersAsArray(filters) {
    const keys = Object.keys(filters);
    const result: {}[] = [];
    for (var i = 0; i < keys.length; i++) {
      const item = {};
      item[keys[i]] = filters[keys[i]];
      result.push(item);
    }
    return result;
  }

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

  buildFilter() {
    const dateParse = ds => /\d+-\d+-\d+T\d+:\d+:\d+.\d+Z/.test(ds) ? DateMatch.parse(ds).toDate().getTime() : ds;
    const { query } = this.state;
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

    if(this.props.implicitFilters){
      this.props.implicitFilters.map(impicitFilter => elasticQuery.bool.must.push({
        match: impicitFilter
      }));
    };
    if(this.props.currentAgentData.id){
      elasticQuery.bool.must.push({
        match: {"agent.id": this.props.currentAgentData.id}
      });
    };
    return {
      query: elasticQuery,
      size: this.state.pageSize,
      from: this.state.pageIndex*this.state.pageSize,
      ...(sortField ? {sort: { [sortField]: { "order": sortDirection } }}: {})
    };
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
        if (this._isMount) {
        this.setState({ alerts: alerts.data.hits.hits, total: alerts.data.hits.total.value, isLoading: false, requestFilters: newFilters});
          this.props.updateTotalHits(alerts.data.hits.total.value);
        }
        if (alerts.data.hits.hits[0]) this.getColumnsPopover(alerts.data.hits.hits[0]['_source']);
    } catch (err) {
      if (this._isMount) {
        this.setState({ alerts: [], total: 0, isLoading: false, requestFilters: newFilters});
        this.props.updateTotalHits(0);
      }
    }
  }

  removeColumn(id) {
    if (this.state.columns.length < 2) {
      this.showToast('warning', "至少选择一列", 3000);
      return;
    }
    const columns = this.state.columns;
    columns.splice(columns.findIndex(v => v === id), 1);

    let columnsSelect = {};
    columns.forEach(k => {
      columnsSelect[k] = true;
    })

    this.setState({ columns, columnsSelect })
  }

  addColumn(id) {
    if (this.state.columns.length > 11) {
      this.showToast('warning', '最大列数为10', 3000);
      return;
    }
    if (this.state.columns.find(element => element === id)) {
      this.removeColumn(id);
      return;
    }
    const columns = this.state.columns;
    columns.push(id);

    let columnsSelect = {};
    columns.forEach(k => {
      columnsSelect[k] = true;
    })

    this.setState({ columns, columnsSelect })
  }


  columns = () => {
    var columnsList = [...this.state.columns];
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
      if (item === 'rule.level') {
        return {
          field: 'rule.level',
          name: '等级',
          width: '100',
          sortable: true,
          render: level => {
            const options = [
              {
                text: '特别严重告警',
                range: [12, 13, 14, 15],
                color: '#BD271E'
              },
              {
                text: '高严重度告警',
                range: [9, 10, 11],
                color: '#006BB4'
              },
              {
                text: '中严重度告警',
                range: [6, 7, 8],
                color: '#017D73'
              },
              {
                text: '低严重度告警',
                range: [3, 4, 5],
                color: '#6a717d'
              }
            ]
            let obj = options.find(k => k.range.indexOf(level) !== -1)
            return <span>
              {obj ? (<span style={{ color: `${obj.color ? obj.color : '#000'}` }}>{obj.text}</span>) : `${level}级`}
            </span>
          },
        }
      }
      if (item === 'rule.id.text') {
        return {
          field: 'rule.id',
          name: '状态',
          width: '10%',
          sortable: true,
          render: itemValue => {
            return <span>
              {itemValue === '503' && 
                <span>上线</span>
              }
              {itemValue === '504' && 
                <span>下线</span>
              }
            </span>
          },
        }
      }
      if (item === 'software.name') {
        return {
          name: '软件名称',
          render: item => {
            return <span>
              {item.data.package && 
                <span>{`${item.data.package}-${item.data.version}`}</span>
              }
              {!item.data.package &&
                <span>{item.data.pkgname}</span>
              }
            </span>
          },
        }
      }
      if (item === 'account.user') { // 账户变更/账户异常/账户登录页，匹配‘用户/组’字段
        return {
          name: '用户/组',
          render: item => {
            return <span>{item.data && item.data.dstuser ? item.data.dstuser : item.data && item.data.srcuser ? item.data.srcuser : ''}</span>
          },
        }
      }

      let width = false;
      let link = false;
      const arrayCompilance = ["rule.pci_dss", "rule.gdpr", "rule.nist_800_53", "rule.tsc", "rule.hipaa"];
      
      if(item === 'agent.id') {
        // link = (ev,x) => {AppNavigate.navigateToModule(ev,'agents', {"tab": "welcome", "agent": x } )};
        width = '8%';
      }
      if(item === 'agent.name') {
        width = '12%';
      }
      if(item === 'rule.level') {
        width = '7%';
      }
      if(item === 'rule.id') {
        // link = (ev,x) => AppNavigate.navigateToModule(ev,'manager', {tab:'rules', redirectRule: x});
        width = '9%';
      }
      // if (item === 'rule.description' && columnsList.indexOf('syscheck.event') === -1) {
      //   width = '50%';
      // }
      if(item === 'syscheck.event') {
        width = '15%';
      }
      if (item === 'rule.mitre.id') {
        link = (ev, x) => { this.setState({ showMitreFlyout: true, selectedTechnique: x }) };
      }
      if(arrayCompilance.indexOf(item) !== -1) {
        width = '30%';
      }

      let column = {
        field: item,
        name: (<span
          onMouseEnter={() => { this.setState({ hover: item }) }}
          onMouseLeave={() => { this.setState({ hover: "" }) }}
          style={{ display: "inline-flex" }}>{this.nameEquivalences[item] || item} {this.state.hover === item &&
            <EuiToolTip position="top" content={`删除列`}>
              <EuiButtonIcon
                style={{ paddingBottom: 12, marginBottom: "-10px", paddingTop: 0 }}
                onClick={(e) => { this.removeColumn(item); e.stopPropagation(); }}
                iconType="cross"
                aria-label="过滤"
                iconSize="s"
              />
            </EuiToolTip>}
        </span>),
        sortable: true
      }

      if (width) {
        column.width = width;
      }
      if (link && item !== 'rule.mitre.id' || (item === 'rule.mitre.id' && this.props.shareFilterManager)) {
        column.render = itemValue => {
          return <span>
            {(item === 'agent.id' && itemValue === '000') &&
              <span style={{ fontSize: 14, marginLeft: 8 }}>{itemValue}</span>
              || item === 'rule.mitre.id' && Array.isArray(itemValue) &&
              itemValue.map((currentItem, index) => <EuiButtonEmpty
                key={'rule.mitre.id' + index}
                onClick={(ev) => { ev.stopPropagation(); }}
                onMouseDown={(ev) => { ev.stopPropagation(); link(ev, currentItem) }}>
                {currentItem}
              </EuiButtonEmpty>)
              ||
              <EuiButtonEmpty
                onClick={(ev) => { ev.stopPropagation(); }}
                onMouseDown={(ev) => { ev.stopPropagation(); link(ev, itemValue) }}>
                {itemValue}
              </EuiButtonEmpty>
            }
          </span>
        }
      }

      return column;
    })
    return columns;
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;

    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    });
  };

  getFiltersAsObject(filters) {
    var result = {};
    for (var i = 0; i < filters.length; i++) {
      result = { ...result, ...filters[i] }
    }
    return result;
  }

  /**
  * Adds a new negated filter with format { "filter_key" : "filter_value" }, e.g. {"agent.id": "001"}
  * @param filter 
  */
  addFilterOut(filter) {
    const filterManager = this.props.shareFilterManager;
    const key = Object.keys(filter)[0];
    const value = filter[key];
    const valuesArray = Array.isArray(value) ? [...value] : [value];
    valuesArray.map((item) => {
      const formattedFilter = buildPhraseFilter({ name: key, type: "string" }, item, this.indexPattern);
      formattedFilter.meta.negate = true;

      filterManager.addFilters(formattedFilter);
    })
    this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
  }

  /**
   * Adds a new filter with format { "filter_key" : "filter_value" }, e.g. {"agent.id": "001"}
   * @param filter 
   */
  addFilter(filter) {
    const filterManager = this.props.shareFilterManager;
    const key = Object.keys(filter)[0];
    const value = filter[key];
    const valuesArray = Array.isArray(value) ? [...value] : [value];
    valuesArray.map((item) => {
      const formattedFilter = buildPhraseFilter({ name: key, type: "string" }, item, this.indexPattern);
      if (formattedFilter.meta.key === 'manager.name' || formattedFilter.meta.key === 'cluster.name') {
        formattedFilter.meta["removable"] = false;
      }
      filterManager.addFilters(formattedFilter);
    })
    this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
  }

  onQuerySubmit = (payload: { dateRange: TimeRange, query: Query | undefined }) => {
    this.setState({...payload, tsUpdated: Date.now()});
  }

  onFiltersUpdated = (filters: Filter[]) => {
    this.setState({ pageIndex: 0 , tsUpdated: Date.now()});
  }

  closeMitreFlyout = () => {
    this.setState({showMitreFlyout: false});
  }
  
  onMitreChangeFlyout = (showMitreFlyout: boolean) => {
    this.setState({ showMitreFlyout });
  }

  openDiscover(e, techniqueID) {
    AppNavigate.navigateToModule(e, 'overview', { "tab": 'mitre', "tabView": "discover", filters: { 'rule.mitre.id': techniqueID } })
  }

  openDashboard(e, techniqueID) {
    AppNavigate.navigateToModule(e, 'overview', { "tab": 'mitre', "tabView": "dashboard", filters: { 'rule.mitre.id': techniqueID } })
  }

  async generateCsv() {
    try {
      this.setState({ generatingCsv: true });
      this.showToast('warning', '您的下载已自动开始...', 2000);

      let { total, requestFilters } = this.state;
      requestFilters.size = total;
      // let fields = ['timestamp', 'agent.id', 'agent.name', 'rule.description', 'rule.level'];
      // const searchInitArr = WAZUH_MODULES_SEARCH_INIT[this.props.tab];
      // searchInitArr && searchInitArr.length > 0 && searchInitArr.forEach(searchInit => {
      //   if (searchInit.acton === 'dis' && searchInit.csvColumns && searchInit.csvColumns.length > 0) { // 表格列
      //     fields = [...searchInit.csvColumns];
      //   }
      //   else if (searchInit.acton === 'dis' && searchInit.columns && searchInit.columns.length > 0) {
      //     fields = [...searchInit.columns].filter(k => k !== 'icon');
      //     fields.splice(1, 0, 'agent.id');
      //     fields.splice(2, 0, 'agent.name');
      //   }
      // })
      // await this.exportAlertCsv(this.indexPattern, requestFilters, fields, '安全警报');

      const { columnsSelect } = this.state;
      let columns = Object.keys(columnsSelect).filter(k => columnsSelect[k] && k !== 'icon')
      if (columns.indexOf('agent.id') === -1) {
        columns.splice(1, 0, 'agent.id');
      }
      if (columns.indexOf('agent.name') === -1) {
        columns.splice(2, 0, 'agent.name');
      }
      await this.exportAlertCsv(this.indexPattern, requestFilters, columns, '安全警报');
    } catch (error) {
      this.showToast('danger', `导出CSV文件时出错: ${error}`, 2000);
    }
    this.setState({ generatingCsv: false });
  }

  propertiesToArray(obj) {
    const isObject = val =>
      typeof val === 'object' && !Array.isArray(val);

    const addDelimiter = (a, b) =>
      a ? `${a}.${b}` : b;

    const paths = (obj = {}, head = '') => {
      return Object.entries(obj)
        .reduce((product, [key, value]) => {
          let fullPath = addDelimiter(head, key)
          return isObject(value) ?
            product.concat(paths(value, fullPath))
            : product.concat(fullPath)
        }, []);
    }

    return paths(obj);
  }

  getColumnsPopover(alert) {
    const { searchInitArr } = this.state;
    let res = []
    searchInitArr.length > 0 && searchInitArr.forEach(searchInit => {
      if (searchInit.acton === 'dis' && searchInit.customColumns) { // 表格自定义列
        res = searchInit.customColumns.map(k => ({ id: k, label: this.nameEquivalences[k] ? this.nameEquivalences[k] : k }))
      }
    })
    if (res.length > 0) {
      this.setState({ columnsPopover: res })
      return
    }
    const fieldsToShow = ['agent', 'cluster', 'manager', 'rule', 'data', 'syscheck', 'full_log'];
    const isString = val => typeof val === 'string';
    res.push({id: 'timestamp', label: '时间'});
    for (var i = 0; i < fieldsToShow.length; i++) {
      const field = alert[fieldsToShow[i]];
      if (field) {
        const itemPaths = isString(field) ? [fieldsToShow[i]] : this.propertiesToArray(field);
        itemPaths.forEach((item) => {
          const id = isString(field) ? item : fieldsToShow[i] + "." + item; // = agent + . + id = agent.id
          const label = this.nameEquivalences[id] ? this.nameEquivalences[id] : id;
          res.push({ id, label })
        })
      }
    }
    this.setState({ columnsPopover: res })
  }

  setPopover(flag) {
    const { isPopoverOpen } = this.state;
    if (flag === 'close') {
      this.setState({isPopoverOpen: false});
    }
    else {
      this.setState({isPopoverOpen: !isPopoverOpen});
    }
  }

  onColumnsChange(id) {
    const { columnsSelect } = this.state;
    const newColumnsSelect = {
      ...columnsSelect,
      ...{ [id]: !columnsSelect[id] }
    }
    this.setState({ columnsSelect: newColumnsSelect })
  }

  setColumns() {
    this.setPopover('close');
    const { columnsSelect } = this.state;
    const columns = Object.keys(columnsSelect).filter(k => columnsSelect[k])
    this.setState({ columns })
  }

  render() {
    const { total, itemIdToExpandedRowMap, showMitreFlyout, selectedTechnique, isLoading, alerts, isPopoverOpen, columnsPopover, columnsSelect } = this.state;
    const { query = this.state.query, kbnSearchBar, shareFilterManager } = this.props;
    const getRowProps = item => {
      const { _id } = item;
      return {
        'data-test-subj': `row-${_id}`,
        className: 'customRowClass',
        onClick: () => this.toggleDetails(item),
      };
    };

    const columns = this.columns();
    const { sortField, sortDirection, pageIndex, pageSize } = this.state;

    const sorting: EuiTableSortingType<{}> = {
      sort: {
        //@ts-ignore
        field: sortField,
        direction: sortDirection,
      }
    };
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: total > 10000 ? 10000 : total,
      pageSizeOptions: [10, 25, 50],
    };
    const noResultsText = `没有符合此搜索条件的结果`;
    let flyout = showMitreFlyout ? <EuiOverlayMask
      headerZindexLocation="below"
      onClick={this.closeMitreFlyout} >
      <FlyoutTechnique
        openDashboard={(e, itemId) => this.openDashboard(e, itemId)}
        openDiscover={(e, itemId) => this.openDiscover(e, itemId)}
        onChangeFlyout={this.onMitreChangeFlyout}
        currentTechnique={selectedTechnique} />
    </EuiOverlayMask> : <></>;
    return (
      <div
        className='wz-discover hide-filter-control wz-inventory' >
        {kbnSearchBar && <KbnSearchBar
          indexPattern={this.indexPattern}
          filterManager={shareFilterManager}
          onQuerySubmit={this.onQuerySubmit}
          onFiltersUpdated={this.onFiltersUpdated}
          query={query} />
        }
        {/* {isLoading && 
          <div style={{ alignSelf: "center", minHeight: 400 }}><EuiLoadingContent lines={3} /> </div>
        } */}
        
        
        {total
          ? <div>
            <EuiFlexGroup direction="rowReverse" style={{ paddingRight: '16px'}}>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  button={
                    <EuiButtonEmpty
                      iconType="arrowDown"
                      iconSide="right"
                      onClick={() => this.setPopover('switch')}
                    >
                      自定义列
                    </EuiButtonEmpty>
                  }
                  isOpen={isPopoverOpen}
                  closePopover={() => this.setPopover('close')}
                  anchorPosition="upCenter"
                >
                  <EuiPopoverTitle>选择要展示的列</EuiPopoverTitle>
                  <div style={{ width: '300px', maxHeight: '200px', overflowY: 'auto', padding: '0px 5px' }}>
                    <EuiCheckboxGroup
                      options={columnsPopover}
                      idToSelectedMap={columnsSelect}
                      onChange={(id) => this.onColumnsChange(id)}
                      className="wz-discover-columns-popover"
                    />
                  </div>
                  <EuiPopoverFooter>
                    <EuiButton fullWidth size="s" onClick={() => this.setColumns()}>
                      确定
                    </EuiButton>
                  </EuiPopoverFooter>
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  iconType="importAction"
                  onClick={async () => await this.generateCsv()}
                  isLoading={this.state.generatingCsv}
                >
                  导出
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup direction="column" alignItems="flexEnd">
              <EuiFlexItem>
                {alerts.length && (
                  <EuiBasicTable
                    items={alerts.map(alert => ({...alert._source, _id: alert._id, 'data.win.system.message': (((alert._source.data || {}).win || {}).system || {}).message }))}
                    className="module-discover-table"
                    itemId="_id"
                    loading={isLoading}
                    itemIdToExpandedRowMap={itemIdToExpandedRowMap}
                    isExpandable={true}
                    columns={columns}
                    rowProps={getRowProps}
                    pagination={pagination}
                    sorting={sorting}
                    onChange={this.onTableChange}
                    noItemsMessage="无数据"
                  />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
          : <EuiFlexGroup>
            <EuiFlexItem>
              <EuiSpacer size="s" />
              <EuiCallOut title={noResultsText} color="warning" iconType="alert" />
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        {flyout}
      </div>);
  }
})
