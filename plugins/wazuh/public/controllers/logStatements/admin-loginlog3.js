import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiPanel,
  EuiTitle,
  EuiProgress,
  EuiCallOut,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiPopover,
  EuiButtonIcon,
  EuiPopoverTitle,
  EuiButton,
  EuiText
} from '@elastic/eui';
import 'brace/mode/less';
import 'brace/theme/github';
import exportCsv from '../../react-services/wz-csv';
import { getDataPlugin, getToasts, getHttp }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { compose } from 'redux';
import $ from 'jquery';
import { WzFieldSearch } from '../../components/wz-field-search-bar/wz-field-search-bar';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { AppState } from '../../react-services/app-state';
import './rule.scss';
import { Select,Form ,Modal, Button,} from 'antd';
export const AdminLoginlog = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: 'login-log' }, { text: 'login-log' }]),
  withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class AdminLoginlog extends Component {
  constructor(props) {
    super(props);
    this.offset = 315;
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.state = {
      isDescPopoverOpen: false,
      appliedIpSearch: '',
      visible: false


    };
    this.ITEM_STYLE = { width: '300px' };
  }



  async componentDidMount() {
   
  }

  componentWillUnmount() {
  
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    console.log($(".ruleGrop"))
    $(".ruleGrop").each(function(ele,index) {
      console.log(ele)
    });
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  onSearchIpSearch = e => {
    this.setState(
      {
        appliedIpSearch: e
      },
      this.onSearchdemo
    );
  };
  addrow(){
console.log('222')
  }
  delrow(){
    $(document).on("click", "button", function () {
      const id = this.getAttribute('id');

       document.getElementById(`${id}`).parentNode.parentNode.remove();  // 假设当前行的元素节点有一个特定的 id
    
      });
  }
  addGroup(){
    let list =$('.ruleBox')
    let num=Math.random().toString(36).substring(2)
    let newbox=`
  <div class='ruleGrop'>
  <select >
  <option value="china">和</option>
  <option value="usa">或</option>

</select> 
    <div class='rule'>
    <select >
  <option value="china">事件</option>
  <option value="usa" >严重性</option>
  <option value="japan">职位</option>
</select>

<select >
<option value="china">等于</option>
<option value="usa" >不等于</option>
<option value="japan">包含</option>
<option value="japan">不包含</option>
<option value="japan">开始于</option>
<option value="japan">结束于</option>
</select>
<select>
<input type="text" name="" id="" />
</select>
        <button  id=${num}  class='delete'>
      delete row
        </button >
      </div>
    </div>`

    list.append(newbox)
 
  
  
  }
  onSearchdemo(){
    const params = {
      index: this.state.appliedIpSearch,
    };
    const arr = this.toSearch(params)
     

  }
  async toSearch(val) {
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
        index: `${val.index}-*`
      }
    }
    const res = await getHttp().post(`/internal/search/es`, { body: JSON.stringify(params)});
}

  exportFormatted = async () => {
    
  }

  getLogResultOptions() {
    return [
      { value: 'all', text: 'all' },
      { value: 'police', text: 'policeData' },
      { value: 'vik', text: 'vik' },
      
    ];
  }

  renderTitle() {
    const { logsList } = this.state;
    return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['adminLoginlog'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
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
                    {WAZUH_MODULES['adminLoginlog'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {/* {logsList.length > 0 &&
                <EuiButton
                  size="s"
                  // iconType="importAction"
                  onClick={this.exportFormatted}
                >
                  download
                </EuiButton>
              } */}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  render() {
    const title = this.renderTitle();
    const logResultOptions = this.getLogResultOptions();
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
   
            <EuiFlexItem grow={false} style={{ width: 300 }}>
            <Form.Item label="选择日志">
              
            <Select
    mode="multiple"
    style={{ width: '100%' }}
    placeholder="select one log"
 
    onChange={this.onSearchIpSearch}
    optionLabelProp="label"
    size={'large'}
  >
    <Option value="*" label="所有日志类型">
    *
    </Option>
    <Option value="txt" label="txt日志">
     txt
    </Option>
    
  </Select>
  </Form.Item >
             </EuiFlexItem>
             <div>
        <Button type="primary" onClick={this.showModal}>
          Open Modal
        </Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
         
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          
      <div className='ruleBox'>
      <div className='ruleGrop'>
      <div className='rule'>
      <select >
      <option value="china">事件</option>
  <option value="usa" >严重性</option>
  <option value="japan">职位</option>
</select>

<select >
<option value="china">等于</option>
<option value="usa" >不等于</option>
<option value="japan">包含</option>
<option value="japan">不包含</option>
<option value="japan">开始于</option>
<option value="japan">结束于</option>
</select>
<input type="text" name="" id="" />
        <button id='num0' onClick={this.delrow()} className='delete' >
      delete row
        </button>
      </div>
      </div>
      
  
      </div>
      <Button type="primary" onClick={this.addGroup}>
      addGroup
        </Button>
        </Modal>
      </div>

            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
});