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

export const BruteForce = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '安全推演' }, { text: '暴力破解' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BruteForce extends Component {
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
                    <span>&nbsp;{WAZUH_MODULES['bruteForce'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['bruteForce'].description}
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
      { id: '1', label: '方案一: 记录攻击事件；拦截攻击源，30分钟内禁止该IP访问；可手动配置黑名单'},
      { id: '2', label: '方案二: 记录攻击事件；拦截攻击源，10分钟内禁止该IP访问'},
      { id: '3', label: '方案三: 仅记录攻击事件'},
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
                <Deduction ref={deductionRef} deductionUtl="/manager/analysisd/brute_force" planSaveUrl={isCluster ? '/cluster/brute_force/' : '/manager/brute_force/'} type="brute_force" planOptions={planOptions} configPlan={['1']} noConfigMess={'该方案不需要配置，且会清除已配置的黑名单，确认保存吗？'} />
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});