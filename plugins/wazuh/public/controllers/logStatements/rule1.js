import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../kibana-services';
export class rule1 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
      seriesData1: [],
      seriesData2: [],
    }
  }

  async componentDidMount() {
    
  }
  componentDidUpdate(prevProps, prevState) {
    // if (this.props.isChangeSize !== prevProps.isChangeSize) {
    //   this.updateHeight()
    // }
  }
  componentWillUnmount() {
   
  }
  updateHeight = () => {
    
  };
  showToast = (color, title, text, time) => {
   
  };

  async toSearch() {
      let params = {
        params: {
          body: {
            query: {
              
              bool: {
                filter: [
                  { match_all: {} }
                ],
                must: [
                  // { match: { "日志类型": "员工离职" } },
                  // { match: { "发生人": "员工本人" } }
                 ],
                
              }
            },
          },
          index: "txt-*"
        }
      }
      const res = await getHttp().post(`/internal/search/es`, { body: JSON.stringify(params)});
  }

 
  render() {
   
  }
}