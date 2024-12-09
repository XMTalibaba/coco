import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiText,
  EuiCheckboxGroup,
  EuiTitle,
  EuiButton,
  EuiButtonEmpty,
  EuiSpacer,
  EuiInMemoryTable,
  EuiToolTip,
  EuiButtonIcon,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiBasicTable,
  EuiHealth,
} from '@elastic/eui';
import { AppState } from '../../../react-services/app-state';
import { WzRequest } from '../../../react-services/wz-request';
import { GenericRequest } from '../../../react-services/generic-request';
import { formatUIDate } from '../../../react-services/time-service';
import { exportPDF } from '../../../react-services/export-pdf';
import { getDataPlugin, getUiSettings } from '../../../kibana-services';
import {
  getEsQueryConfig,
  buildEsQuery,
  buildPhrasesFilter,
} from '../../../../../../src/plugins/data/common';
import * as echarts from 'echarts';

export class CheckupResult extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.myBarChart = null;
    this.myBarChartPie = null;
    this.pdfRef = React.createRef();
    this.KibanaServices = getDataPlugin();
    this.clusterFilter = {};
    this.state = {
      isLoading: false,
      checkboxOptions: [
        {
					id: 'risk_password',
					label: '高危账号',
          isDay: false,
          ruleId: ['100012'],
				},
        {
					id: 'sca',
					label: '缺陷配置',
          isDay: false,
          ruleId: [],
				},
        {
					id: 'virus',
					label: '木马病毒',
          isDay: true,
          ruleId: ['52502'],
				},
        {
					id: 'webshell',
					label: '网页后门',
          isDay: true,
          ruleId: ['31103', '31107', '31151', '31152', '31153', '31154', '31161', '31162', '31163', '31168', '31169'],
				},
        {
					id: 'shell_process',
					label: '反弹shell',
          isDay: true,
          ruleId: ['100207', '100209'],
				},
        {
					id: 'abnormal_account',
					label: '异常账号',
          isDay: true,
          ruleId: ['5904', '2502', '40112', '5631', '5719', '5551', '17101', '17102', '100330'],
				},
        {
					id: 'log_delete',
					label: '日志删除',
          isDay: false,
          ruleId: ['100215'],
				},
        {
					id: 'abnormal_process',
					label: '异常进程',
          isDay: false,
          ruleId: ['100033', '100026'],
				},
        {
					id: 'system_cmd',
					label: '系统命令校验',
          isDay: false,
          ruleId: ['100218', '100219'],
				}
      ],
      checkboxSelected: {},
      result: {},
      listItems: [],
      isModalVisible: false,
      selected: {},
      modalList: [],
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      columnsAlerts: [
        { field: 'rule.description', name: '描述' },
        { field: 'rule.level', name: '等级', width: '100', render: level => {
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
        } },
      ],
      columnsPolicies: [
        {
        field: 'id',
        name: 'ID',
        sortable: true,
        width: "100px"
      },
      {
        field: 'title',
        name: '标题',
        sortable: true,
      },
      {
        name: '目标',
        render: item => (
          <div>
            {item.file ? (
              <span>
                <b>文件:</b> {item.file}
              </span>
            ) : item.directory ? (
              <span>
                <b>目录:</b> {item.directory}
              </span>
            ) : item.process ? (
              <span>
                <b>过程: </b> {item.process}
              </span>
            ) : item.command ? (
              <span>
                <b>命令: </b> {item.command}
              </span>
            ) : item.registry ? (
              <span>
                <b>注册表: </b> {item.registry}
              </span>
            ) : (
                        '-'
                      )}
          </div>
        )
      },
      {
        field: 'result',
        name: '结果',
        sortable: true,
        width: "150px",
        render: this.addHealthResultRender,
      }
      ]
    }
  }

  async componentDidMount() {
    this._isMount && this.setState({ isLoading: true });

    await this.getIndexPattern();

    const isCluster = (AppState.getClusterInfo() || {}).status === "enabled";
    const clusterFilter = isCluster
      ? { "cluster.name": AppState.getClusterInfo().cluster }
      : { "manager.name": AppState.getClusterInfo().manager };
    this.clusterFilter = clusterFilter;

    const { checkboxOptions } = this.state;
    const { detailsItem } = this.props;
    const statusOptions = {
      'doing': '正在执行',
      'waiting': '等待执行',
      'done': '执行完成',
    }
    const typeOptions = {
      'immediate': '及时体检',
      'period': '定时体检'
    }
    const resultItem = await WzRequest.apiReq('GET', `/manager/health_check_status/${detailsItem.id}?pretty=true`, {});
    const result = (resultItem || {}).data;
    let checkboxSelected = {}
    let seriesDataLine = []
    let seriesDataPie = []
    let listItems = []
    checkboxOptions.forEach(k => {
      let key = k.id
      if (result[key] === 'empty' || !result[key]) {
        checkboxSelected[key] = false
      }
      else {
        checkboxSelected[key] = true
      }

      if (result[key] && result[key] !== 'empty') {
        seriesDataLine.push({ name: k.label, value: result[key].split('-')[0] })
        seriesDataPie.push({ name: k.label, value: result[key].split('-')[1] })
        
        let dataRange = {}
        if (k.isDay) {
          dataRange = {
            from: new Date(new Date(result.finish_time).getTime() - 24 * 60 * 60 * 1000).toISOString(),
            to: new Date(result.finish_time).toISOString(),
          }
        }
        else {
          dataRange = {
            from: new Date(result.last_time).toISOString(),
            to: new Date(result.finish_time).toISOString(),
          }
        }
        listItems.push({
          name: k.label,
          count: result[key].split('-')[1],
          score: result[key].split('-')[0],
          id: k.id,
          dataRange,
          ruleId: k.ruleId,
        })
      }
    })
    result.health_check_status = statusOptions[result.health_check_status] ? statusOptions[result.health_check_status] : '-'
    result.health_check_type = typeOptions[result.health_check_type] ? typeOptions[result.health_check_type] : '-'

    this.setState({ checkboxSelected, result, listItems, isLoading: false })

    if (result.health_check_score) {
      this.buildLine(seriesDataLine)
      this.buildPie(seriesDataPie)
    }

    window.addEventListener('resize', this.updateHeight);
  }

  componentWillUnmount() {
    this._isMount = false;
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.myBarChart && this.myBarChart.resize();
    this.myBarChartPie && this.myBarChartPie.resize();
  };

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.isModalVisible && (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize)) {
        await this.getAlerts();
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

  buildLine(seriesData) {
    let option = {
      title: {
        left: 'center',
        text: '体检项目得分',
        textStyle: {
          fontSize: 14
        }
      },
      grid: {
        right: 100
      },
      visualMap: {
        top: 50,
        right: 10,
        pieces: [
          {
            gt: 0,
            lte: 60,
            color: '#EE6666'
          },
          {
            gt: 60,
            lte: 80,
            color: '#73C0DE'
          },
          {
            gt: 80,
            color: '#91CC75'
          },
        ],
        outOfRange: {
          color: '#999'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        name: '体检项目',
        type: 'category',
        axisTick: {
          alignWithLabel: true
        },
        data: seriesData.map(item => item.name)
      },
      yAxis: {
        name: '分数',
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}分'
        }
      },
      series: [
        {
          name: '体检项目得分',
          type: 'bar',
          data: seriesData,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}分'
          },
          tooltip: {
            valueFormatter: value => `${value}分`
          }
        }
      ]
    };

    let timer = setInterval(() => {
      let chartDom = document.getElementById('barChartsBox');
      if (chartDom) {
        clearInterval(timer);
        this.myBarChart = echarts.init(document.getElementById('barChartsBox'));
        this.myBarChart.setOption(option);
      }
    }, 200);
  }

  buildPie(seriesData) {
    let option = {
      title: {
        left: 'center',
        text: '体检问题数量',
        textStyle: {
          fontSize: 14
        }
      },
      grid: {
        right: 100
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        top: 20,
        right: 20,
        bottom: 20
      },
      series: [
        {
          name: '体检问题数量',
          type: 'pie',
          radius: ['40%', '70%'],
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          tooltip: {
            valueFormatter: value => `${value}个`
          },
          data: seriesData,
        }
      ]
    };

    let timer = setInterval(() => {
      let chartDom = document.getElementById('barChartsBoxPie');
      if (chartDom) {
        clearInterval(timer);
        this.myBarChartPie = echarts.init(document.getElementById('barChartsBoxPie'));
        this.myBarChartPie.setOption(option);
      }
    }, 200);
  }

  toExportPDF() {
    const { detailsItem } = this.props;
    exportPDF(`${detailsItem.name}体检报告`, this.pdfRef.current)
  }

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="查看问题详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.toShowModal(item);
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查看问题详情"
          />
        </EuiToolTip>
      </div>
    )
  }

  toShowModal(item) {
    this.setState({ selected: item, isLoading: true }, async () => {
      await this.getAlerts()
      this.setModal(true);
    })
  }

  setModal(flag) {
    this.setState({isModalVisible: flag});
    if (!flag) this.setState({ modalList: [] });
  }

  addHealthResultRender(result) {
    const color = result => {
      if (result.toLowerCase() === 'passed') {
        return 'success';
      } else if (result.toLowerCase() === 'failed') {
        return 'danger';
      } else {
        return 'subdued';
      }
    };
    const statusText = {
      passed: '通过',
      failed: '失败',
      'not applicable': '不适用'
    }

    return (
      <EuiHealth color={color(result)} style={{ textTransform: 'capitalize' }}>
        {statusText[result] || result || '不适用'}
      </EuiHealth>
    );
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize,
    });
  };

  async getAlerts() {
    const { selected } = this.state;
    const { detailsItem } = this.props;
    let modalList = [], totalItems = 0
    try {
      if (selected.id !== 'sca') {
        const newFilters = this.buildFilter();
        const alerts = await GenericRequest.request(
          'POST',
          `/elastic/alerts`,
          {
            index: this.indexPattern.title,
            body: newFilters
          }
        );
        modalList = alerts.data.hits.hits.map(alert => {
          return {
            ...alert._source,
            _id: alert._id,
            actions: alert
          }
        });
        totalItems = alerts.data.hits.total.value
      }
      else { // 缺陷配置
        const rawItems = await WzRequest.apiReq(
          'GET',
          `/sca/${detailsItem.id}/checks/all?result=failed&limit=${selected.count}&pretty=true`,
          {}
        );
        modalList = (((rawItems || {}).data || {}).data || {}).affected_items;
        totalItems = modalList.length
      }
      
    } catch (err) {
      console.log(err)
    }
    this.setState({ modalList, totalItems, isLoading: false });
  }

  buildFilter() {
    const { selected } = this.state;
    const elasticQuery =
      buildEsQuery(
        undefined,
        { language: "kuery", query: "" },
        [],
        getEsQueryConfig(getUiSettings())
      );

    const range = {
      range: {
        timestamp: {
          gte: selected.dataRange.from,
          lte: selected.dataRange.to,
          format: "strict_date_optional_time",
        }
      }
    }
    elasticQuery.bool.must.push(range);

    elasticQuery.bool.filter.push({ match_phrase: this.clusterFilter});

    // 默认搜索条件
    const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, selected.ruleId, this.indexPattern)
    elasticQuery.bool.filter.push(formattedFilter.query);

    // 过滤 000 主机告警
    elasticQuery.bool.must_not.push({match_phrase: {['agent.id']: "000"}});

    return {
      query: elasticQuery,
      size: this.state.pageSize,
      from: this.state.pageIndex * this.state.pageSize,
      sort: { timestamp: { "order": 'desc' } }
    };
  }

  tableModalRender() {
    const {
      selected,
      modalList,
      totalItems,
      pageIndex,
      pageSize,
      columnsAlerts,
      columnsPolicies,
    } = this.state;
    const columns = selected.id !== 'sca' ? columnsAlerts : columnsPolicies
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItems > 10000 ? 10000 : totalItems,
      pageSizeOptions: [10, 25, 50],
    };
    const res = selected.id !== 'sca' ? (
      <EuiBasicTable
        itemId="id"
        items={modalList}
        className="module-discover-table"
        columns={columns}
        pagination={pagination}
        onChange={this.onTableChange}
        noItemsMessage="无数据"
      />
    ) : (
      <EuiInMemoryTable
        itemId="id"
        items={modalList}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        message={'无数据'}
      />
    )
    return res
  }

  tableRender() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const columns = [
      {
        field: 'name',
        name: '体检项目',
      },
      {
        name: '体检问题',
        render: item => `检测到${item.count}个`
      },
      {
        field: 'score',
        name: '得分',
      },
      {
        align: 'right',
        width: '100',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ];
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        pagination={false}
        sorting={true}
        message={message}
      />
    )
  }

  render() {
    const { checkboxOptions, checkboxSelected, result, isModalVisible } = this.state;
    const { detailsItem } = this.props;
    const table = this.tableRender();
    const tableModal = this.tableModalRender();
    let modal;
    if (isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>问题详情</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                {tableModal}
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButton onClick={() => this.setModal(false)} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )
    }
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{'体检详情'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.toExportPDF()}
            >
              导出报告
            </EuiButton>
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
        <div ref={this.pdfRef} style={{ padding: '16px' }}>
          <h3 style={{ fontWeight: 'bolder', fontSize: '24px', textAlign: 'center', marginBottom: '10px' }}>体检报告</h3>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">监控主机:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {detailsItem.name}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">体检任务ID:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {result.health_check_id}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">体检状态:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {result.health_check_status}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">体检类型:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {result.health_check_type}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">体检分数:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {result.health_check_score ? result.health_check_score : '-'}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">上次体检时间:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {result.last_time ? formatUIDate(result.last_time) : '-'}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="stretch">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">体检项目:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCheckboxGroup
                options={checkboxOptions}
                idToSelectedMap={checkboxSelected}
                onChange={() => {}}
                disabled={true}
                className="wz-checkup-toggle"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          { result.health_check_score && (
            <div>
              <EuiSpacer size="m" />
              <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
              <EuiSpacer size="m" />
              <EuiTitle size="xs">
                <h3>{'体检概况'}</h3>
              </EuiTitle>
              <div style={{ display: 'flex' }}>
                <div id="barChartsBox" style={{ height: '300px', width: '50%' }}></div>
                <div id="barChartsBoxPie" style={{ height: '300px', width: '50%' }}></div>
              </div>
              {table}
            </div>
          )}
        </div>
        {modal}
      </div>
    )
  }

}