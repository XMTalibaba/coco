import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiLink,
	EuiPanel,
	EuiSpacer,
	EuiText,
	EuiImage,
	EuiPopover,
	EuiPopoverTitle,
	EuiButtonIcon,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { compose } from 'redux';
import { AppState } from '../../react-services/app-state';

export const ManageTool = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '首页' }, { text: '安装工具' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ManageTool extends Component {
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
		}
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
                    <span>&nbsp;{WAZUH_MODULES['manageTool'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['manageTool'].description}
                  </div>
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
								<EuiFlexGroup direction="column">
									<EuiFlexItem grow={false}>
										<EuiPanel>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiImage
														size="64px"
														alt=""
														url={require('./images/manage-tool-icon1.png')}
													/>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTitle size="s">
														<h3>安装工具</h3>
													</EuiTitle>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiSpacer size="xxl" />
											<EuiFlexGroup>
												<EuiFlexItem style={{ minWidth: 300 }}>
													<p><EuiLink onClick={() => this.props.manageToolProps.addingNewAgent()}>代理下载</EuiLink></p>
													<EuiSpacer size="m" />
													<EuiText grow={false}>
														<EuiTitle size="xs">
															<h4>方式一 安装包直接安装</h4>
														</EuiTitle>
														<p>
															网管员直接共享下载链接或安装包所在目录，提供安装包给公司内员工。员工对安装包进行下载拷贝安装
														</p>
													</EuiText>
												</EuiFlexItem>
												<EuiFlexItem style={{ minWidth: 300 }}>
													{/* <p><EuiLink onClick={() => {}}>批量部署</EuiLink></p> */}
													<p><EuiLink onClick={() => this.props.manageToolProps.toBatchDeployment()}>批量部署</EuiLink></p>
													{/* <p><EuiLink href={`http://${document.location.hostname}:8000`} external={true} target="_blank">批量部署</EuiLink></p> */}
													<EuiSpacer size="m" />
													<EuiText grow={false}>
														<EuiTitle size="xs">
															<h4>方式二 部署工具安装</h4>
														</EuiTitle>
														<p>
															域控制用户或者已知密码的主机，可使用部署工具远程安装
														</p>
													</EuiText>
												</EuiFlexItem>
											</EuiFlexGroup>
										</EuiPanel>
									</EuiFlexItem>
									<EuiFlexItem grow={false}>
										<EuiPanel>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiImage
														size="64px"
														alt=""
														url={require('./images/manage-tool-icon2.png')}
													/>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTitle size="s">
														<h3>客户端所需安装包</h3>
													</EuiTitle>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiSpacer size="m" />
											{/* <p><EuiLink  href={`https://www.elastic.co/cn/downloads/beats/winlogbeat`} external={true} target="_blank">采集windows系统的事件日志</EuiLink></p> */}
											<EuiImage
												size="fullWidth"
												alt=""
												url={require('./images/manage-tool-img1.png')}
											/>
										</EuiPanel>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});