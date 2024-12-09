import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiPage,
  EuiButton,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { AppState } from '../../react-services/app-state';
import { getToasts }  from '../../kibana-services';
import { Deduction } from './components/deduction';

export const RiskService = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '安全推演' }, { text: '高危服务' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class RiskService extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
    this.myChart = null;
		this.state = {
      isDescPopoverOpen: false,
      deductionRef: React.createRef(),
      isCluster: false
    };
	}

  async componentDidMount() {
    this._isMount = true;
    const isCluster = (AppState.getClusterInfo() || {}).status === "enabled";
    this.setState({ isCluster })
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['riskService'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['riskService'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                onClick={() => this.toDeduction()}
              >
                推演
              </EuiButton>
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

  async toDeduction() {
    this.state.deductionRef.current.toDeduction();
  }

  render() {
    const { deductionRef, isCluster } = this.state;
    const title = this.renderTitle();

    const planOptions = [
      { id: '1', label: '方案一: 停用服务，禁止该服务自启动'},
      { id: '2', label: '方案二: 仅本次停用服务（若该服务为定时或自启动任务，届时仍会启动）'},
      { id: '3', label: '方案三: 仅记录安全事件'},
    ]
    
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
                <Deduction ref={deductionRef} deductionUtl="/manager/analysisd/danger_service" planSaveUrl={isCluster ? '/cluster/danger_service/' : '/manager/danger_service/'} type="danger_service" planOptions={planOptions} configPlan={[]} />
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});