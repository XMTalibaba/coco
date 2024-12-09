import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiBasicTable,
	EuiPopover,
	EuiSpacer,
	EuiButtonIcon,
  EuiButtonEmpty,
  EuiOverlayMask,
  EuiConfirmModal
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { formatUIDate } from '../../react-services/time-service';
import { compose } from 'redux';
import { AppState } from '../../react-services/app-state';
// import { Input,Button ,Card ,Empty,Modal,Icon,Watermark    } from 'antd';
// const { Search } = Input;
import './components/toolti.scss'
export const ManageTool = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: 'virus' }, { text: 'virusfound' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ManageTool extends Component {
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      isnots:false,
  actb:'0',
    actext:false,
showValue: true,
visible: false,
affected_items: [
  {
    timestamp: "2023-11-29T10:18:48+00:00",
    Agent: "002",
    AgentModal: "LAPTOP-9JE83I8E",
    Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
    SourceName: "scheduled.tsx ",
    Leave:'center'
  },
  {
    timestamp: "2023-11-29T10:18:48+00:00",
    Agent: "002",
    AgentModal: "LAPTOP-9JE83I8E",
    Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
    SourceName: "scheduled.tsx ",
    Leave:'center'
  },
  {
    timestamp: "2023-11-29T10:18:48+00:00",
    Agent: "002",
    AgentModal: "LAPTOP-9JE83I8E",
    Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
    SourceName: "scheduled.tsx ",
    Leave:'center'
  }],
   
   
		}
   
	}
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  logsTable() {
    const {
      affected_items
    } = this.state;
    const columns = [
      {
        field: 'timestamp',
        name: 'timestamp',
        render: timestamp => (<span>{formatUIDate(timestamp)}</span>),
      },
      {
        field: 'Agent',
        name: 'Agent',
      },
      {
        field: 'AgentModal',
        name: 'AgentModal',
      },
      {
        field: 'Virus',
        name: 'Virus',
      },
      {
        field: 'SourceName',
        name: 'SourceName',
      },
      {
        field: 'Leave',
        name: 'Leave',
      }
    ,
    {
      name: 'notes',
      actions: [
        {
          name: 'questionInCircle',
          description: 'questionInCircle',
          icon: 'questionInCircle',
          type: 'icon',
          onClick: () => {
            this.setState({ isnots: !this.state.isnots }) 
          },
        },
      ]
      },
     
    ];
    return (
      <div>
        {(this.state.affected_items && (
          <Fragment>
            <div className='code-block-log-viewer-container' style={{ height: this.height, overflowY: 'auto' }}>
              <EuiBasicTable
                items={this.state.affected_items}
                columns={columns}
                noItemsMessage="未找到数据"
              />
            </div>
            <EuiSpacer size="m" />
            <EuiFlexGroup justifyContent='center'>
                <EuiFlexItem grow={false} style={{ marginTop: 0, marginBottom: 0 }}>
                  <EuiButtonEmpty
                    iconType='refresh'
                    isLoading={this.state.loadingLogs}
                    isDisabled={this.state.loadingLogs}
                    onClick={!this.state.loadingLogs ? () => undefined: undefined}
                  >
                    more log
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
          </Fragment>
        )) || (
            <EuiCallOut
              color="warning"
              title="没有符合您的搜索标准的结果。"
              iconType="alert"
            ></EuiCallOut>
          )}
      </div>
    );
  }

  handleOk = e => {
    console.log(e);
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
  setModal(flag) {
    this.setState({isnots: flag});
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
                    <span>&nbsp;{'VirusFound'}&nbsp;&nbsp;</span>
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
                  {/* <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['manageTool'].description}
                  </div> */}
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

	render() {
    const { isnots} = this.state;
		const title = this.renderTitle();
    let vuldetModal;
    if (isnots) {
			vuldetModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="Virus Intelligent Analysis Report"
            onCancel={() => this.setModal(false)}
            onConfirm={() => this.setModal(false)}
            cancelButtonText="cancel"
            confirmButtonText="confirm"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
<p>
一、Vulnerability Introduction<br/>

Apache ActiveMQ is Apache foundation's open-source messaging middleware supports Java messaging services, clustering, Spring Framework, and more. Apache ActiveMQ has a code issue vulnerability that allows authenticated attackers to manipulate the MBean interface through the/API/jolokia/interface, enabling arbitrary code execution and ultimately controlling the target server.


<br/>二、Harmful impact<br/>

An attacker who successfully exploits the vulnerability can execute arbitrary code on the target server and gain control of the server. Apache ActiveMQ versions before 5.16.6, before 5.17.4, and after 5.17.0 are all affected by this vulnerability.
<br/>三、Repair suggestions<br/>

At present, Apache has officially released a new version to fix this vulnerability. It is recommended that users confirm the product version in a timely manner and take remedial measures as soon as possible. Official reference link:
https://activemq.apache.org/<br/>

<br/>his notice is issued by CNNVD technical support units - Qi'anxin Network God Information Technology (Beijing) Co., Ltd., Beijing Qihu Technology Co., Ltd., Huawei Technology Co., Ltd., Beijing Tianrongxin Network Security Technology Co., Ltd., Beijing Shenzhou Green Alliance Technology Co., Ltd., Xinhua San Technology Co., Ltd., Shanghai Douxiang Information Technology Co., Ltd., Beijing Shanshi Network Science and Technology Co., Ltd., and Wangsu Technology Co., Ltd Shandong Zelu Security Technology Co., Ltd., Bozhi Security Technology Co., Ltd., Inner Mongolia Jingyun Technology Co., Ltd., Shenzhen Angkai Technology Co., Ltd., Xi'an Jiaotong University Jiepu Network Technology Co., Ltd., Hubei Sian Technology Co., Ltd., Beijing Zhongrui Tianxia Information Technology Co., Ltd., Renzixing Network Technology Co., Ltd. and other technical support units provide support.



CNNVD will continue to track the relevant situation of the above-mentioned vulnerabilities and release relevant information in a timely manner. If necessary, please contact CNNVD. Contact information: cnnvdvul@itsec.gov.cn
        </p>

          </EuiConfirmModal>
        </EuiOverlayMask>
      );
		}
		return (
			<EuiFlexGroup direction="column">
			<EuiFlexItem grow={false}>
				<div className="wz-module">
					<div className='wz-module-header-agent-wrapper'>
						<div className='wz-module-header-agent'>
							{title}
						</div>
            <div className='Workspace' >
              
            {(this.logsTable()) || (
                      <EuiFlexGroup alignItems="center" justifyContent="center">
                        <EuiFlexItem>
                          <EuiSpacer></EuiSpacer>
                          <EuiProgress size="xs" color="primary" />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    )}
             </div>
             {vuldetModal}
					</div>
					</div>
			</EuiFlexItem>
		</EuiFlexGroup>
		);
	}
});