import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiPage,
  EuiPanel,
  EuiFormRow,
  EuiTitle,
  EuiButton,
  EuiForm,
  EuiFieldText,
  EuiButtonIcon,
  EuiPopover,
  EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { createBrowserHistory } from "history";
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { AppState } from '../../react-services/app-state';
import './systemMsl.scss';
import { GenericRequest } from '../../react-services/generic-request';
import { Spin, Alert, Modal, notification, } from 'antd';
import { cons } from 'fp-ts/lib/Array';
export const ManagerMsl = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: '输入数据源' }, { text: '输入数据源' }]),
  withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ManagerMsl extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      visible2: false,
      logResultSelect: {
        text: 'Syslog TCP',
        value: 'tcp'

      },
      totalItems: 0,
      ssos: false,
      listItems: [],
      inputItems: [],
      resultItems: [],
      stopItems: [],
      waring: false,
      servername: '',
      serverport: "",
      edit: false,
      inputLoading: false,
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

  async componentDidMount() {
    this._isMount = true;
    this.componentWillUnmount()

  }
  async componentWillUnmount() {
    this._isMount = false;
    this._isMount && this.setState({ isLoading: true });
    const response = await WzRequest.apiReq('GET', '/security/authcode', {});
    const { total_affected_items } = ((response || {}).data || {}).data;
    if (!!total_affected_items && total_affected_items > 0) {
      this.setState({
        ssos: true,
      });
      this.getindex()
      await this.getItems();





    } else {
      this.setState({
        ssos: false,
      });

      this.setState({
        visible2: true,
      });
    }

  }


  showedit(val1, val2, val3) {

    const servername = val1

    const serverport = String(val2)
    const logResultSelect={}
    logResultSelect.text = this.agreement(val3)
    logResultSelect.value =val3
    const edit = true
  
    this.setState({ logResultSelect, servername, serverport, edit })

    this.showModal()
  }
  async inputItems() {

    let _this = this;
    if (!_this.state.edit) {
      const listItems = _this.state.listItems

      listItems.push({
        count: '???',
        name: 'inputsource-???',
        port: '???',
        protocol: "???",
        status: '0'
      })
     
      const totalItems = listItems.length
      _this.setState({ listItems, totalItems })
    } else {
      const listItems = this.state.listItems.map((ele) => {
        ele.name == _this.state.servername ? ele.status = '0' : ''
        return ele
      })

      this.setState({ listItems })
    }

    try {

      // this.setState({ isLoading: true });
      await WzRequest.apiReq('POST', `/manager/log_collect`, {

        name: `${_this.state.servername}`,
        proto: _this.state.logResultSelect.value,
        port: Number(_this.state.serverport),
        action: _this.state.edit ? 0 : 1

      });
      _this.setState({ edit: false })
      _this.getItems()
    } catch (error) {

      _this.setState({ edit: false })
      _this.getItems()




    }
  }
  agreement(val) {

    switch (val) {

      case 'tcp':
        return 'Syslog TCP'

      case 'udp':
        return 'Syslog UDP'
      case 'beat':
        return 'Winlog Beat'

      default:

    }
  }
  async stop(val1, val2) {

    let _this = this
    const listItems = this.state.listItems.map((ele) => {
      ele.name == val2 ? ele.status = '0' : ''
      return ele
    })

    this.setState({ listItems })
    try {
      // this.setState({ isLoading: true });
      await WzRequest.apiReq('DELETE', `/manager/log_collect`, {
        name: val2,
        action: val1
      });

      setTimeout(() => {
        _this.getItems()
      }, 30000)



    } catch (error) {
      setTimeout(() => {
        _this.getItems()
      }, 35000)
      console.log(error);
    }
  }
  async getItems() {

    try {

      const rawItems = await WzRequest.apiReq('GET', `/manager/log_collect`, {

      });
      let listItems = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;
      let totalItems = listItems.length

      this.setState({ listItems, totalItems, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
    }
  }

  async getindex() {

    try {
      const result = await GenericRequest.request(
        'GET',
        `/api/saved_objects/_find?type=index-pattern&fields=title&fields=fields&per_page=9999`
      );
      let resultItems = ((result || {}).data || {}).saved_objects || [];

      this.setState({ resultItems })
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }

  }
  async saveindex(val) {

    try {

      await GenericRequest.request(
        'POST',
        `/api/saved_objects/index-pattern`,
        {
          'attributes': {
            'timeFieldName': 'timestamp',
            'title': `${val}-*`,
          },
        }
      );
      return;
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  showModal2(val) {
 
    // this.saveindex(val)

    // const history = createBrowserHistory()
    // history.replace({
    //   pathname: `/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-24h,to:now))&_a=(columns:!(_source),filters:!(),index:'55b4e550-e053-11ee-ab70-39d924afd421',interval:auto,query:(language:kuery,query:''),sort:!())`,
    // });
    // history.go()

let str=`inputsource-${val}`

    let bol = false
    let indexid = ''
    if (this.state.resultItems.length !== '') {
      this.state.resultItems.forEach(ele => {

        if (ele.attributes.title.includes('-*')?ele.attributes.title.match(/^(.*?)-\*$/)[1]==str:ele.attributes.title==val) {
        
          bol = true
          indexid = ele.id
        }
      })
    }

   

    if (bol) {
      window.open(`/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-24h,to:now))&_a=(columns:!(_source),filters:!(),index:'${indexid}',interval:auto,query:(language:kuery,query:''),sort:!())`, '', 'noopener')
      return false
      // history.replace({
      //   pathname: `/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-24h,to:now))&_a=(columns:!(_source),filters:!(),index:'${indexid}',interval:auto,query:(language:kuery,query:''),sort:!())`,
      // });
    } else {
      window.open(`/app/management/kibana/indexPatterns/create`, '', 'noopener')
      return false
      // history.replace({
      //   pathname: `/app/management/kibana/indexPatterns/create`,
      // });
    }


  };
  showModal = () => {
    if (this.state.ssos) {
      this.setState({
        visible: true,
      });
    } else {
      this.setState({
        visible2: true,
      });
    }


  };
  setName(event) {
    this.setState({ servername: event.target.value.replace(/[^a-zA-Z\d]/g, '') });
  }
  setPort(event) {
    this.setState({ serverport: event.target.value.replace(/[^\d]/g, '') });
  }
  handleOk = e => {
    this.state.waring = false
    const protocol = this.state.logResultSelect.value
    const port = this.state.serverport;
  
    if (port == '' || this.state.servername == ''|| Number(port)>=65535|| Number(port)==0) {
      this.showToast(
        'danger',
        '警告',
        '输入源格式错误' ,
        3000
      );
      return 
    }
    const bol = this.state.listItems.some((ele) => {

      return ele.protocol == protocol && ele.port == port

    })
    if (bol) {
      this.setState({ waring: true });
      this.showToast(
        'danger',
        '警告',
        '输入源格式错误' ,
        3000
      );
      return
    }
    this.inputItems()
    this.setState({
      visible: false,
    });
    this.state.serverport = ''
    this.state.servername = ''
    this.state.edit = false
  };
  handleOk2 = e => {
    this.setState({
      visible2: false,
    });
  };
  handleCancel = e => {
    this.state.waring = false
    this.state.serverport = ''
    this.state.servername = ''
    this.state.edit = false
    this.setState({
      visible: false,
    });
  };
  getLogResultOptions() {
    return [
      { value: 'tcp', text: 'Syslog TCP' },
      { value: 'udp', text: 'Syslog UDP' },
      { value: 'beat', text: 'Winlog Beat' },
    ];

  }
  getOptions() {
    return [
      { value: 'del', text: '删除输入源' },
      { value: 'edit', text: '更改端口号' },

    ];

  }
  onLogResultChange = e => {
  let logResultSelect={}
  logResultSelect.value=e.target.value;
  logResultSelect.text=this.agreement(logResultSelect.value)
this.setState({logResultSelect})

  };
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };


  onChangeForm(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
  }
  boxRender() {

    const boxItem = this.state.listItems.map((ele) => {
      return <Spin tip="等待最多35秒..." spinning={ele.status == '0'} key={ele.name}>
        <div className='box' >

          <div className='boxItem' >
            <div className='left'>
              
              <div className='hang'>
                输入源名称：{`inputsource-${ele.name}`}
              </div>
              <div className='hang'>
                协议: {ele.protocol}
                <div className='hang'>
                  端口号: {ele.port}
                </div>

              </div>
            </div>
            <div className='right'>
              {
                ele.status == '0' ?
                  <div className='hang' style={{ color: "blue" }}>
                    状态：正在执行
                  </div>
                  :
                  <div className='hang' style={ele.status == 'running' ? { color: "green" } : { color: "red" }}>
                    状态：{ele.status == 'running' ? '运行中' : '已暂停'}
                  </div>
              }
            </div>

          </div>
          <div className='boxRight'>
            <div className='top'>
              <EuiButton

                fill
                onClick={() => this.showModal2(ele.name)}
              >
                显示信息
              </EuiButton>

              {
                ele.status == 'running' ?
                  <EuiButton
                    style={{ margin: 10 }}
                    fill
                    onClick={() => this.stop(0, ele.name)}
                  >
                    暂停输入源
                  </EuiButton>
                  :
                  <EuiButton

                    style={{ margin: 10 }}
                    fill
                    onClick={() => this.stop(2, ele.name)}

                  >
                    运行输入源
                  </EuiButton>
              }
              <EuiButton
                style={{ margin: 10 }}
                fill
                onClick={() => this.showedit(ele.name, ele.port, ele.protocol)}
              >
                编辑端口号
              </EuiButton>
              <EuiButton
                style={{ margin: 10 }}
                fill
                onClick={() => this.stop(1, ele.name)}
              >
                删除输入源
              </EuiButton>

            </div>
            <div className='bot' >
              信息数量：{ele.count}
            </div>


          </div>

        </div>
      </Spin>
    })
    return boxItem
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
                    <span>&nbsp;{WAZUH_MODULES['managerMsl'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['managerMsl'].description}
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



  toList() {
    this.setState({ listType: 'list', formParams: { iface: '', ip: '', gateway: '' } });
    this.getItems();
  }

  testIpList(ips) {
    if (ips === '') return true;
    // 把 ips 按逗号拆成 IP 数组，分别进行验证
    // every 表示每个 ip 验证通过才算通过
    return ips.split(",")
      .every(ip => {
        // 把每个 IP 拆成几段
        const segments = ip.split(".");
        // 如果是精确的 4 段而且每段转换成数字都在 1~255 就对了
        return segments.length === 4
          && segments
            .map(segment => parseInt(segment, 10) || 0)
            .every(n => n >= 0 && n <= 255);
      });
  }

  async toSave() {
    try {
      this.setState({ isModalVisible: false })
      const { formParams } = this.state;

      if (!formParams.ip || !formParams.gateway) {
        this.showToast(
          'danger',
          '警告',
          '管理器地址配置失败: IP地址、网关地址为必填',
          3000
        );
      }
      else if (!this.testIpList(formParams.ip) || !this.testIpList(formParams.gateway)) {
        this.showToast(
          'danger',
          '警告',
          '管理器地址配置失败: 请检验IP格式',
          3000
        );
      }
      // await WzRequest.apiReq('POST', `/groups`, {
      //   params: {
      //     group_id: name
      //   }
      // });
      else {
        await WzRequest.apiReq('PUT', `/manager/host_ipaddr?iface=${formParams.iface}&ip=${formParams.ip}&gateway=${formParams.gateway}`, {});

        this.showToast(
          'success',
          '成功',
          '管理器地址配置成功',
          3000
        );
        this.toList()
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '管理器地址配置失败: ' + error,
        3000
      );
    }
  }

  render() {
    const { totalItems, ssos } = this.state;

    const logResultOptions = this.getLogResultOptions();
    const title = this.renderTitle();
    const table = this.boxRender();
    let modal;
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
                    <EuiPanel paddingSize="m" >
                      <div style={{ display: 'flex' }}>


                        <EuiFlexItem grow={false} style={{ width: 150 }}>
                          <EuiSelect
                            id="filterLogMethod"
                            options={logResultOptions}
                            value={this.state.logResultSelect.value}
                            onChange={this.onLogResultChange}
                            aria-label="请选择输入源"
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ marginLeft: 10, width: 150 }}>
                          <EuiButton
                            data-test-subj="reset"
                            fill
                            onClick={this.showModal}
                            readOnly
                          >
                            启动新输入源
                          </EuiButton>

                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ marginLeft: 10, width: 150 }}>
                          <EuiButton
                            data-test-subj="reset"
                            fill
                            onClick={this.showModal}
                            readOnly
                          >
                            刷新
                          </EuiButton>

                        </EuiFlexItem>


                        <div>

                        </div>
                      </div>
                    </EuiPanel>
                  </EuiFlexItem>
                  <Modal
                    title={`${this.state.edit ? '编辑' : '新增'}${this.state.logResultSelect.text}输入源`}
                    visible={this.state.visible}

                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                  >

                    <EuiFlexItem grow={false}>
                      <EuiForm component="form">
                        <EuiFormRow label="输入源名称" helpText="仅能输入英文和数字">
                          <EuiFieldText placeholder="输入源名称(编辑不可更改)"
                            // value={this.state.servername}
                            value={this.state.servername}
                            readOnly={this.state.edit}
                            onChange={event => this.setName(event)} />
                        </EuiFormRow>
                        <EuiFormRow label="输入源类型" helpText="已选择输入源类型">
                          <EuiFieldText
                            value={this.state.logResultSelect.text}
                            readOnly
                          />
                        </EuiFormRow>
                        <EuiFormRow label="输入源端口号"

                          helpText="仅能输入数字">
                          <EuiFieldText
                            placeholder="端口号"
                            value={this.state.serverport}
                            onChange={event => this.setPort(event)}
                          />
                        </EuiFormRow>
                        {
                          this.state.waring ? <Alert
                            style={{ marginTop: 20, marginBottom: 20 }}
                            message="注意"
                            description="输入源的协议和端口号组合不能重复"
                            type="warning"
                            showIcon
                          />
                            :
                            <div></div>
                        }


                      </EuiForm>
                    </EuiFlexItem>

                  </Modal>
                  <Modal
                    title={`检测到未授权`}
                    visible={this.state.visible2}

                    onOk={this.handleOk2}
                    onCancel={this.handleOk2}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Alert
                      style={{ marginTop: 20, marginBottom: 20 }}
                      message="注意"
                      description="请去系统管理中授权管理模块导入授权码"
                      type="warning"
                      showIcon
                    />


                  </Modal>
                    
                  <EuiPanel paddingSize="m"  style={{ height: 1000, overflowY: scroll }}>
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h3>本地输入源</h3>
                      </EuiTitle>
                    </EuiFlexItem>

                    <div >
                      {totalItems > 0 && (
                        <div>
                          {table}
                        </div>
                      )}

                    </div>

                  </EuiPanel>
                </EuiFlexGroup>
              </EuiPage>
            </div>
          </div>
        </EuiFlexItem>
        {modal}
      </EuiFlexGroup>
    );
  }
})