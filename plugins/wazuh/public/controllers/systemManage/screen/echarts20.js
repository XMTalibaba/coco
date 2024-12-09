import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
// import * as echarts from 'echarts';
import * as datav from '@jiaminghi/data-view-react'
export class Echarts20 extends Component {
  constructor(props) {
    super(props);

    this.interval = null;
    this.state = {
      isvis:false,
      formParams: {
        cpu: 0,
        disk: 0,
        mem: 0
      },
      circular1:{
        data:[
          {
            name: '成功',
            value: 20
          },
          {
            name: '信息',
            value: 10
          },
          {
            name: '失败',
            value: 40
          },
        
        ]
      },
      config1 : {
        number: [0],
        content: '{nt}k'
      },
      config2 : {
        number: [0],
        content: '{nt}k'
      },
      config3 : {
        number: [0],
        content: '{nt}k'
      },
      bconfig1:{
        number: [10],
        content: '{nt}↑',
        style:{
          fill:'red',
          fontSize: 20,
        }
      },
      bconfig2:{
        number: [30],
        content: '{nt}↓',
        style:{
          fill:'green',
          fontSize: 20,
        }
      }
    }
  }

  async componentDidMount() {
    await this.toSearch();
    this.interval = setInterval(() => this.toSearch(), 60 * 1000* 5);
  }
  componentDidUpdate(prevProps, prevState) {
 
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  updateHeight = () => {
    // this.myCharts && this.myCharts.resize();
  };
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toSearch() {

    let alerts = []
    try {	
      const res = await WzRequest.apiReq('GET',`/manager/eventlog_analyze?name=logs_stats`, {});

			const params = (
        ((res || {}).data || {}).data || {}
      ).affected_items[0];

      this.setState({ config1: {
        number: [Number(params.all_events_size.match(/^[^ ]+/)[0])],
        toFixed:2,
        content: '{nt}k',
       
      },
      config2: {
        number: [Number(params.windows_events_size.match(/^[^ ]+/)[0])],
        toFixed:2,
        content: '{nt}k',
       
      },
      config3: {
        number: [Number(params.syslog_events_size.match(/^[^ ]+/)[0])],
        toFixed:2,
        content: '{nt}k',
       
      },
 
    
    
    
    }
      
      
      
      );
     
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表5数据查询失败: ' + error,
        3000
      );
    }
    // this.setState({ alerts })
    
 



    
this.buildChart()
  }

  buildChart() {
    let timer1 = setInterval(() => {
      this.setState({ isvis: true });
         let chartDom = document.getElementById('echartsBox20_1');
  
      if (chartDom) {
        clearInterval(timer1);
       
        
      }
    }, 200);
  
    
 
  }

  render() {
    return (
      this.state.isvis&&<div style={{ display: 'flex',height:'96%',justifyContent: 'center',
      alignItems: 'center'}}> 
     

  <div style={{ display: 'flex', height: '100%',flexDirection: 'column', justifyContent: 'space-around' }}>

        <div style={{ position: 'relative', width: '30%' }}>
          <div id='echartsBox20_1'>
          <datav.Decoration11  style={{ width: '300px', height: '60px' }} >所有事件
          <datav.DigitalFlop config={this.state.config1} style={{width: '100px', height: '50px'}} />
          {/* <datav.DigitalFlop config={this.state.bconfig1} style={this.state.config1.number >0 ?{ color: "red",width: '100px', height: '50px'}:{color: "green",width: '100px', height: '50px'}} /> */}
           <datav.DigitalFlop config={this.state.bconfig1} style={{width: '50px', height: '30px'}} /> 
          </datav.Decoration11>
        

          </div>
        
       
        </div>
        <div style={{ position: 'relative', width: '30%' }}>
        <div id='echartsBox20_2'>
          <datav.Decoration11  style={{ width: '300px', height: '60px' }} >Windows事件
          <datav.DigitalFlop config={this.state.config2} style={{width: '100px', height: '50px'}} />
          <datav.DigitalFlop config={this.state.bconfig2} style={{width: '50px', height: '30px'}} />
          </datav.Decoration11>
        

          </div>
        
     
        </div>
        <div style={{ position: 'relative', width: '30%' }}>
        <div id='echartsBox20_3'>
          <datav.Decoration11  style={{ width: '300px', height: '60px' }} >Syslog事件
          <datav.DigitalFlop config={this.state.config3} style={{width: '100px', height: '50px'}} />
          <datav.DigitalFlop config={this.state.bconfig2} style={{width: '50px', height: '30px'}} />
          </datav.Decoration11>
        

          </div>
        
        </div>
      </div>

      <div>
      <datav.ActiveRingChart id='echartsBox20_t' config={this.state.circular1} style={{ width: '200px', height: '200px'}} />

      </div>
      </div>
    
    )
    
  }
}