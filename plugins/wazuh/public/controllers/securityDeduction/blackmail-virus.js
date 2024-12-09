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

export const BlackmailVirus = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '安全推演' }, { text: '勒索病毒' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BlackmailVirus extends Component {
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
                    <span>&nbsp;{WAZUH_MODULES['blackmailVirus'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['blackmailVirus'].description}
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
      { id: '1', label: '方案一: 记录安全事件；删除病毒文件'},
      { id: '2', label: '方案二: 记录安全事件；隔离病毒文件'},
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
                <Deduction ref={deductionRef} deductionUtl="/manager/analysisd/virus" planSaveUrl={isCluster ? '/cluster/virus/' : '/manager/virus/'} type="virus" planOptions={planOptions} configPlan={[]} />
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});