import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPage,
  EuiTitle,
  EuiButton,
  EuiCard,
  EuiIcon,
  EuiText,
  EuiFormRow,
  EuiFieldText,
  EuiSelect
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { AppState } from '../../react-services/app-state';
import './systemMsl.scss';
import * as echarts from 'echarts';
import { Table, Divider, Tag } from 'antd';

// key: '1003',
// time: '2023-5-20 6:35',
// IP: '100.299.345',
// port:'443',
// describe: 'ZhangXX Login system failed',
// tags: ['login', 'erro'],

const columns = [
  {
    title: 'key',
    dataIndex: 'key',
    key: 'key',
    render: text => <a>{text}</a>,
  },
  
  {
    title: 'time',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: 'IP',
    dataIndex: 'IP',
    key: 'IP',
  },
  {
    title: 'port',
    dataIndex: 'port',
    key: 'port',
  },
  {
    title: 'describe',
    dataIndex: 'describe',
    key: 'describe',
  },

  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
         
        })}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a>Invite {record.name}</a>
      
        <a>Delete</a>
      </span>
    ),
  },
];

const data = [
  {
    key: '1009',
    time: '2023-11-6 13:40 ',
    IP: '100.299.345',
    port:'443',
    describe: 'ZhangXX Login system failed',
    tags: ['login'],
  },
  {
    key: '1002',
    time: '2023-11-6 09:10',
    IP: '100.299.345',
    port:'443',
    describe: 'ZhangXX Login system failed',
    tags: ['login', 'erro'],
  },
  {
    key: '1003',
    time: '2023-5-20 06:35',
    IP: '100.299.345',
    port:'443',
    describe: 'ZhangXX Login system failed',
    tags: ['login', 'erro'],
  },
];
export const ManagerSearch = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: 'machine Learning' }, { text: 'machine Learning' }]),
  withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ManagerSearch extends Component {
  _isMount = false;
 
  constructor(props) {
    super(props);
    this.myScoreChart = null;
    this.myLineChart = null;
    this.state = {
      score: '',
      deductionTime: '',
      advice: '',
      planSelect: '',
      configModalVisible: false,
      editList: React.createRef(),
      showWarningRestart: false,
      showWarningRestartBackup: false,
      totalItems: 0,
      listItems: [],
      showValue:false,
      isDescPopoverOpen:false,
      isLoading: false,
      listType: 'list',
      formParams: {
        iface: '',
        ip: '',
        gateway: '',
      },
      isModalVisible: false
    }
  }


  buildLine() {
    let _this=this;
 let data=[{
  value: 50.00,
  date: "2023-10-23",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-24",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-25",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-26",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-27",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-28",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-29",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-30",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-10-31",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-11-01",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-11-02",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-11-03",
  l: 40.2,
  u: 70.2
},{
  value: 50.00,
  date: "2023-11-04",
  l: 40.2,
  u: 70.2
},
{
  value: 50.00,
  date: "2023-11-05",
  l: 40.2,
  u: 70.2
},
{
  value: 100,
  date: "2023-11-06",
  l: 70,
  u: 80
},
{
  value: 80,
  date: "2023-11-07",
  l: 70.3,
  u: 90.5
},
{
  value: 70,
  date: "2023-11-08",
  l: 60.3,
  u: 70.8
},
{
  value: 60,
  date: "2023-11-09",
  l: 50.7,
  u: 60.9
},
{
  value: 50,
  date: "2023-11-10",
  l: 40,
  u: 60,
},
{
  value: 60,
  date: "2023-11-11",
  l: 50.44,
  u: 70.77
},
{
  value: 70,
  date: "2023-11-12",
  l: 60.79,
  u: 80.02
},
]

var base = -data.reduce(function (min, val) {
return Math.floor(Math.min(min, val.l));
}, Infinity);
    let option = {
      title: {
        text: 'System Login logs',
        subtext: 'Human Resource System',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#ccc',
            borderColor: '#aaa',
            borderWidth: 1,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            color: '#222'
          }
        },
        formatter: function (params) {
          return (
            params[2].name +
            '<br />' +
            (params[2].value - base).toFixed(3)
          );
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        interval: 8, 
        type: 'category',
        data: data.map(function (item) {
          return item.date;
        }),
        axisLabel: {
          formatter: function (value, idx) {
            var date = new Date(value);
            return idx === 0
              ? value
              : [date.getMonth() + 1, date.getDate()].join('-');
          }
        },
        boundaryGap: false
      },
      yAxis: {
        
        axisLabel: {
          formatter: function (val) {
            return (val - base);
          }
        },
        axisPointer: {
          label: {
            formatter: function (params) {
              return ((params.value - base)).toFixed(3) + '';
            }
          }
        },
        splitNumber: 3
      },
      dataZoom: [
        {
          type: 'inside',
          start: 60,
          end: 80
        },
        {
          start: 0,
          end: 20
        }
      ],
      series: [
        {
          name: 'L',
          type: 'line',
          data: data.map(function (item) {
            return item.l + base;
          }),
          lineStyle: {
            opacity: 0
          },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: 'U',
          type: 'line',
          data: data.map(function (item) {
            return item.u - item.l;
          }),
          lineStyle: {
            opacity: 0
          },
          areaStyle: {
            color: '#ccc'
          },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          type: 'line',
          data: data.map(function (item) {
            
            return item.value + base;
          }),
          itemStyle: {
            color:function(param){ //拐点颜色
                 
              if(param.value>40){
                  return 'red'
              }else{
                   return '#fff'
              }
            }
          },
          
        }
      ]
    };
    let timer = setInterval(() => {
      let chartDom = document.getElementById('lineChartsBox');
      if (chartDom) {
        clearInterval(timer);
        this.myLineChart = echarts.init(document.getElementById('lineChartsBox'));
        this.myLineChart.setOption(option);
        this.myLineChart.on('click', function (params) {//用于做每个点的监听，只用点击点才能够获取想要的监听效果；
                  let data = {
                    x: params.name,
                    y: params.value
                  }
                  console.log(_this.state.showValue,'this._showValue')
          // _this.state.showValue=true
          _this.setState({ showValue: true}) 
          //      this.setState({ showValue: !this.state.showValue }) 
          
                });
       
      }
    }, 200);

    // echarts.init(document.getElementById('lineChartsBox')).getZr().on('click', function(params) {
    //   // 获取像素坐标点
    //   const pointInPixel = [params.offsetX, params.offsetY]
    //   const { target, topTarget } = params
    //   // 判断点击的点在  点击在折线的拐点 || 折线上
    //   if (target?.z === 2 || topTarget?.z === 2) {
    //   // 获取这条折线的 信息 也就是 index
    //   // 如果是拐点，直接读取 target.seriesIndex
    //   // 如果是折线上的点，读取 topTarget 对象下的继续寻找parent的信息的index
    //     const axs = target
    //       ? target.seriesIndex
    //       : topTarget.parent?.parent?.__ecComponentInfo?.index
    //     console.log(axs,'axs')
    //     // this.setState({ showValue: !this.state.showValue }) 
      
    //   }
    // })
    // // 将可以响应点击事件的范围内，鼠标样式设为pointer--------------------
    // echarts.init(document.getElementById('lineChartsBox')).getZr().on('mousemove', function(params) {
    //   const { topTarget } = params
    //   // 给折线的鼠标悬浮 变为 小手
    //   if (topTarget?.z === 2) {
    //     myChart.getZr().setCursorStyle('pointer')
    //   }
    // })

  }

  formatTime(timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    let resDate = year + "-" + month + "-" + day;
    return resDate
  }
  async componentDidMount() {
    // this.setState({ isModalVisible: true })
    this._isMount = true;
    // this.buildLine();

    // await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq('GET', `/manager/host_ipaddr`, {});
      let listItems = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;
      let totalItems = listItems.length;
      this.setState({ listItems, totalItems, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
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

  columns() {
    return [
     
    ]
  }



  onChangeForm(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
  }



  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>数据库查询</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
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
                    <span>&nbsp;{"machine Learning"}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                {/* <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{ marginTop: 3 }}
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
                    {WAZUH_MODULES['managerMsl'].description}
                  </div>
                </EuiPopover> */}
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  

  render() {
    const { isModalVisible } = this.state;
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
              <EuiFlexGroup gutterSize="l">
    <EuiFlexItem>
      <EuiCard
        icon={<EuiIcon size="xxl" type="devToolsApp" />}
        title="System Login Logs"
        description="Human Resource System"
        footer={
          <div>
             <EuiFlexItem style={{marginLeft: '20%',marginBottom: '3%'}}>
      <EuiFormRow label="System Login Logs" >
      <EuiSelect
      
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'Human Resource System' },
            { value: 'option_two', text: 'MachineLearning Resource System' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Duration" >
      <EuiSelect
    
          onChange={() => {}}
          options={[
            { value: 'option_one', text: '15minutes' },
            { value: 'option_two', text: '30minutes' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Metrics for anomaly analysis" >
      <EuiSelect
    
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'average frequency' },
         
          ]}
        />
      </EuiFormRow>
    </EuiFlexItem>
            <EuiButton aria-label="Go to Developers Tools"  onClick={() => this.buildLine()}>Go for it</EuiButton>
            <EuiSpacer size="xs" />
            <EuiText size="s">
            
            </EuiText>
          </div>
        }
      />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiCard
        icon={<EuiIcon size="xxl" type="dashboardApp" />}
        title="Virus Scanning Logs"
        description="DNS DDoS Attack" 
        footer={
          <div>
                <EuiFlexItem style={{marginLeft: '20%',marginBottom: '3%'}}>
      <EuiFormRow label="System Login Logs" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'Human Resource System' },
            { value: 'option_two', text: 'MachineLearning Resource System' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Duration" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: '15minutes' },
            { value: 'option_two', text: '30minutes' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Metrics for anomaly analysis" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'average frequency' },
         
          ]}
        />
      </EuiFormRow>
    </EuiFlexItem>
            <EuiButton aria-label="Go to Dashboards">Go for it</EuiButton>
            <EuiSpacer size="xs" />
            <EuiText size="s">
              
            </EuiText>
          </div>
        }
      />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiCard
        icon={<EuiIcon size="xxl" type="savedObjectsApp" />}
        title="Traffic analysis Logs"
        description="Traffic analysis"
        footer={
          <div>
                <EuiFlexItem style={{marginLeft: '20%',marginBottom: '3%'}}>
      <EuiFormRow label="System Login Logs" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'Human Resource System' },
            { value: 'option_two', text: 'MachineLearning Resource System' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Duration" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: '15minutes' },
            { value: 'option_two', text: '30minutes' },
         
          ]}
        />
      </EuiFormRow>
      <EuiFormRow label="Metrics for anomaly analysis" >
      <EuiSelect
          hasNoInitialSelection
          onChange={() => {}}
          options={[
            { value: 'option_one', text: 'average frequency' },
         
          ]}
        />
      </EuiFormRow>
    </EuiFlexItem>
            <EuiButton aria-label="Go to Save Objects">Go for it</EuiButton>
            <EuiSpacer size="xs" />
            <EuiText size="s">
              
            </EuiText>
          </div>
        }
      />
    </EuiFlexItem>
  </EuiFlexGroup>
  </EuiPage>
  <EuiPage>
              <EuiFlexItem >
              <div id="lineChartsBox" onClick={this.onChartClick} style={{ height: '300px', width: '100%' }}></div>
            </EuiFlexItem>
            </EuiPage>
            <EuiPage style={{display:this.state.showValue?'block':'none'}}>
            {/* <Search
      placeholder="input search text"
 value='mack'
      onSearch={value=> { this.setState({ showValue: !this.state.showValue }) }}
      style={{ width: 200 }}
    /> */}
            <Table  columns={columns} dataSource={data} style={{width: '90%',marginLeft: '4%'}} />
              </EuiPage>
            </div>
          </div>
        </EuiFlexItem>
      
      </EuiFlexGroup>
    );
  }
})