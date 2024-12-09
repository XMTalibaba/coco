/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment } from 'react';
import { version } from '../../../../package.json';
import { WazuhConfig } from '../../../react-services/wazuh-config';
import {
  EuiSteps,
  EuiTabs,
  EuiTabbedContent,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiButtonToggle,
  EuiButtonGroup,
  EuiFormRow,
  EuiComboBox,
  EuiFieldText,
  EuiText,
  EuiCodeBlock,
  EuiTitle,
  EuiButton,
  EuiButtonEmpty,
  EuiCopy,
  EuiPage,
  EuiPageBody,
  EuiCallOut,
  EuiSpacer,
  EuiProgress,
  EuiCode,
  EuiLink,
  EuiRadioGroup,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { AppState } from '../../../react-services/app-state';


const architectureButtons = [
  {
    id: 'i386',
    label: 'i386'
  },
  {
    id: 'x86_64',
    label: 'x86_64'
  },
  {
    id: 'armhf',
    label: 'armhf'
  },
  {
    id: 'aarch64',
    label: 'aarch64'
  }
];
const architectureCentos5 = [
  {
    id: 'i386',
    label: 'i386'
  },
  {
    id: 'x86_64',
    label: 'x86_64'
  }
];

const versionButtonsCentos = [
  {
    id: 'centos5',
    label: 'CentOS5'
  },
  {
    id: 'centos6',
    label: 'CentOS6 or higher'
  }
];

const osButtons = [
  {
    id: 'rpm',
    label: 'Red Hat / CentOS / 中标麒麟 / BC-Linux / SUSE'
  },
  {
    id: 'deb',
    label: 'Debian / Ubuntu / 银河麒麟'
  },
  {
    id: 'win',
    label: 'Windows'
  },
  // {
  //   id: 'macos',
  //   label: 'MacOS'
  // }
];

const sysButtons = [
  {
    id: 'systemd',
    label: 'Systemd'
  },
  {
    id: 'sysV',
    label: 'SysV Init'
  }
];

export class RegisterAgent extends Component {
  constructor(props) {
    super(props);
    this.wazuhConfig = new WazuhConfig();
    this.configuration = this.wazuhConfig.getConfig();
    this.state = {
      status: 'incomplete',
      selectedOS: '',
      selectedSYS: '',
      neededSYS: false,
      selectedArchitecture: 'x86_64',
      selectedVersion: 'centos6',
      version: '',
      serverAddress: '',
      wazuhPassword: '',
      groups: [],
      selectedGroup: [],
      udpProtocol: false,
      isCluster: false
    };
    this.restartAgentCommand = {
      rpm: this.systemSelector(),
      deb: this.systemSelector(),
      macos: 'sudo /Library/Ossec/bin/ossec-control start',
    }
  }

  async componentDidMount() {
    try {
      this.setState({ loading: true });
      const wazuhVersion = await this.props.getWazuhVersion();
      let serverAddress = false;
      let wazuhPassword = '';
      let hidePasswordInput = false;
      serverAddress = this.configuration["enrollment.dns"] || false;
      if (!serverAddress) {
        serverAddress = await this.props.getCurrentApiAddress();
      }
      let authInfo = await this.getAuthInfo();
      const needsPassword = (authInfo.auth || {}).use_password === 'yes';
      if (needsPassword) {
        wazuhPassword = this.configuration["enrollment.password"] || authInfo['authd.pass'] || '';
        if (wazuhPassword) {
          hidePasswordInput = true;
        }
      }


      const udpProtocol = await this.getRemoteInfo();
      const groups = await this.getGroups();
      
      const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
      const clusterData = ((clusterStatus || {}).data || {}).data || {};
      const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
      this.setState({
        serverAddress,
        needsPassword,
        hidePasswordInput,
        versionButtonsCentos,
        architectureButtons,
        architectureCentos5,
        wazuhPassword,
        udpProtocol,
        wazuhVersion,
        groups,
        isCluster,
        loading: false
      });
    } catch (error) {
      this.setState({
        wazuhVersion: version,
        loading: false
      });
    }
  }

  async getAuthInfo() {
    try {
      const result = await WzRequest.apiReq(
        'GET',
        '/agents/000/config/auth/auth',
        {}
      );
      return (result.data || {}).data || {};
    } catch (error) {
      return false;
    }
  }

  async getRemoteInfo() {
    try {
      const result = await WzRequest.apiReq(
        'GET',
        '/agents/000/config/request/remote',
        {}
      );
      const remote = ((result.data || {}).data || {}).remote || {};
      return (remote[0] || {}).protocol !== 'tcp';
    } catch (error) {
      return false;
    }
  }

  selectOS(os) {
    // this.setState({ selectedOS: os, selectedVersion: '', selectedArchitecture: '', selectedSYS: 'systemd' });
    this.setState({ selectedOS: os, selectedVersion: 'centos6', selectedArchitecture: 'x86_64', selectedSYS: 'systemd' });
  }

  systemSelector(){
    if(this.state.selectedOS === 'rpm'){
      if(this.state.selectedSYS === 'systemd'){
        return 'sudo systemctl daemon-reload\nsudo systemctl enable wazuh-agent\nsudo systemctl start wazuh-agent';
      }
      else
        return 'sudo chkconfig --add wazuh-agent\nsudo service wazuh-agent start';
    }
    else if(this.state.selectedOS === 'deb'){
      if(this.state.selectedSYS === 'systemd'){
        return 'sudo systemctl daemon-reload\nsudo systemctl enable wazuh-agent\nsudo systemctl start wazuh-agent';
      }
      else
        return 'sudo update-rc.d wazuh-agent defaults 95 10\nsudo service wazuh-agent start';
    }
    else
      return '';

  }

  selectSYS(sys){
    this.setState({ selectedSYS: sys });
  }

  setServerAddress(event) {
    this.setState({ serverAddress: event.target.value });
  }

  setGroupName(selectedGroup) {
    this.setState({ selectedGroup });
  }

  setArchitecture(selectedArchitecture) {
    this.setState({ selectedArchitecture });
  }

  setVersion(selectedVersion) {
    // this.setState({ selectedVersion, selectedArchitecture: '' });
    this.setState({ selectedVersion: 'centos6', selectedArchitecture: 'x86_64' });
  }

  setWazuhPassword(event) {
    this.setState({ wazuhPassword: event.target.value });
  }

  obfuscatePassword(text) {
    let obfuscate = '';
    const regex = /WAZUH_REGISTRATION_PASSWORD=?\040?\'(.*?)\'/gm;
    const match = regex.exec(text);
    const password = match[1];
    if (password) {
      [...password].forEach(() => obfuscate += '*')
      text = text.replace(password, obfuscate);
    }
    return text;
  }

  async getGroups() {
    try {
      let departmentGroups = await AppState.getDepartmentGroups();
      return departmentGroups.map(item =>
        ({ label: item.name, id: item.name })
      )
    } catch (error) {
      return [];
    }
  }

  optionalDeploymentVariables() {
    // let deployment = `WAZUH_MANAGER='${this.state.serverAddress}' `;
    let deployment = `MANAGER_ADDRESS='${document.location.hostname}' `;
  
    if (this.state.selectedOS == 'win') {
      // deployment += `WAZUH_REGISTRATION_SERVER='${this.state.serverAddress}' `;
      deployment += `REGISTRATION_SERVER='${document.location.hostname}' `;
    }

    if (this.state.wazuhPassword) {
      deployment += `WAZUH_REGISTRATION_PASSWORD='${this.state.wazuhPassword}' `;
    }

    if (this.state.udpProtocol) {
      deployment += `WAZUH_PROTOCOL='UDP' `;
    }

    if (this.state.selectedGroup.length) {
      // deployment += `WAZUH_AGENT_GROUP='${this.state.selectedGroup.map((item) => item.label).join(',')}' `;
      deployment += `AGENT_GROUP='${this.state.selectedGroup.map((item) => item.label).join(',')}' `;
    }

    if (this.state.selectedOS == 'win') {
      deployment += `; Invoke-WebRequest -Uri http://${document.location.hostname}/download/clamav.cmd -OutFile clamav.cmd; ./clamav.cmd ${document.location.hostname}`
    }

    // macos doesnt need = param
    if (this.state.selectedOS === 'macos') {
      return deployment.replaceAll('=', ' ');
    }

    return deployment;
  }

  startAgent() {
    return `&& curl -so startagent.sh http://${document.location.hostname}/download/startagent.sh && sudo bash startagent.sh && curl -so clamav.sh http://${document.location.hostname}/download/clamav.sh && sudo bash clamav.sh ${document.location.hostname}`
  }

  resolveRPMPackage() {
    switch (`${this.state.selectedVersion}-${this.state.selectedArchitecture}`) {
      case 'centos5-i386':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.el5.i386.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.el5.i386.rpm`
        // return `https://packages.wazuh.com/4.x/yum5/i386/wazuh-agent-${this.state.wazuhVersion}-1.el5.i386.rpm`
      case 'centos5-x86_64':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.el5.x86_64.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.el5.x86_64.rpm`
        // return `https://packages.wazuh.com/4.x/yum5/x86_64/wazuh-agent-${this.state.wazuhVersion}-1.el5.x86_64.rpm`
      case 'centos6-i386':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.i386.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.i386.rpm`
        // return `https://packages.wazuh.com/4.x/yum/wazuh-agent-${this.state.wazuhVersion}-1.i386.rpm`
      case 'centos6-aarch64':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.aarch64.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.aarch64.rpm`
        // return `https://packages.wazuh.com/4.x/yum/wazuh-agent-${this.state.wazuhVersion}-1.aarch64.rpm`
      case 'centos6-x86_64':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.x86_64.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`
        // return `https://packages.wazuh.com/4.x/yum/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`
      case 'centos6-armhf':
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.armv7hl.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.armv7hl.rpm`
        // return `https://packages.wazuh.com/4.x/yum/wazuh-agent-${this.state.wazuhVersion}-1.armv7hl.rpm`
      default:
        return `http://${document.location.hostname}/download/agent-${this.state.wazuhVersion}-1.x86_64.rpm`
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`
        // return `https://packages.wazuh.com/4.x/yum/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`
    }
  }

  resolveDEBPackage() {
    switch (`${this.state.selectedArchitecture}`) {
      case 'i386':
        return `http://${document.location.hostname}/download/agent_${this.state.wazuhVersion}-1_i386.deb`
        // return `http://${this.state.serverAddress}/wazuh-agent_${this.state.wazuhVersion}-1_i386.deb`
        // return `https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${this.state.wazuhVersion}-1_i386.deb`
      case 'aarch64':
        return `http://${document.location.hostname}/download/agent_${this.state.wazuhVersion}-1_arm64.deb`
        // return `http://${this.state.serverAddress}/wazuh-agent_${this.state.wazuhVersion}-1_arm64.deb`
        // return `https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${this.state.wazuhVersion}-1_arm64.deb`
      case 'armhf':
        return `http://${document.location.hostname}/download/agent_${this.state.wazuhVersion}-1_armhf.deb`
        // return `http://${this.state.serverAddress}/wazuh-agent_${this.state.wazuhVersion}-1_armhf.deb`
        // return `https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${this.state.wazuhVersion}-1_armhf.deb`
      case 'x86_64':
        return `http://${document.location.hostname}/download/agent_${this.state.wazuhVersion}-1_amd64.deb`
        // return `http://${this.state.serverAddress}/wazuh-agent_${this.state.wazuhVersion}-1_amd64.deb`
        // return `https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${this.state.wazuhVersion}-1_amd64.deb`
      default:
        return `http://${document.location.hostname}/download/agent_${this.state.wazuhVersion}-1_amd64.deb`
        // return `http://${this.state.serverAddress}/wazuh-agent_${this.state.wazuhVersion}-1_amd64.deb`
        // return `https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${this.state.wazuhVersion}-1_amd64.deb`
    }
  }

  optionalPackages() {
    switch (this.state.selectedOS) {
      case 'rpm':
        return this.resolveRPMPackage();
      case 'deb':
        return this.resolveDEBPackage();
      default:
        return `http://${document.location.hostname}/agent-${this.state.wazuhVersion}-1.x86_64.rpm`;
        // return `http://${this.state.serverAddress}/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`;
        // return `https://packages.wazuh.com/4.x/yum5/x86_64/wazuh-agent-${this.state.wazuhVersion}-1.x86_64.rpm`;
    }
  }

  checkMissingOSSelection(){
    if(!this.state.selectedOS){
      return ['操作系统'];
    };
    if (this.state.selectedGroup.length === 0) {
      return ['代理分组'];
    }
    switch (this.state.selectedOS) {
      case 'rpm':
        return [
          ...(!this.state.selectedVersion ? ['操作系统版本'] : []),
          ...(this.state.selectedVersion && !this.state.selectedArchitecture ? ['操作系统架构'] : []),
        ];
      case 'deb':
        return [
          ...(!this.state.selectedArchitecture ? ['操作系统架构'] : []),
        ];
      default:
        return [];
    }
  };

  toDownload(name) {
    const aLink = document.createElement('a')
    // aLink.href = `http://${document.location.hostname}/download/${name}`;
    aLink.href = `https://${document.location.hostname}:8443/download/${name}`;
    aLink.target = '_blank';
    document.body.appendChild(aLink)
    aLink.click()
    document.body.removeChild(aLink)
  }

  render() {
    const missingOSSelection = this.checkMissingOSSelection();
    const ipInput = (
      <EuiText>
        <p>
          你可以通过设置 <EuiCode>enrollment.dns</EuiCode> 来预定义服务器地址。
        </p>
        <EuiFieldText
          placeholder="服务器地址"
          value={this.state.serverAddress}
          onChange={event => this.setServerAddress(event)}
        />
      </EuiText>
    );

    const groupInput = (
      <EuiText>
        <p>
          选择一个或多个现有组。
        </p>
        <EuiComboBox
          placeholder="选择组"
          options={this.state.groups}
          selectedOptions={this.state.selectedGroup}
          onChange={group => {
            this.setGroupName(group);
          }}
          noSuggestions={this.state.groups.length === this.state.selectedGroup.length}
          isDisabled={!this.state.groups.length}
          isClearable={true}
          data-test-subj="demoComboBox"
        />
      </EuiText>
    );

    const passwordInput = (
      <EuiFieldText
        placeholder="Wazuh密码"
        value={this.state.wazuhPassword}
        onChange={event => this.setWazuhPassword(event)}
      />
    );

    const codeBlock = {
      zIndex: '100'
    };
    // const customTexts = {
    //   rpmText: `sudo ${this.optionalDeploymentVariables()}yum install ${this.optionalPackages()}`,
    //   debText: `curl -so wazuh-agent.deb ${this.optionalPackages()} && sudo ${this.optionalDeploymentVariables()}dpkg -i ./wazuh-agent.deb`,
    //   macosText: `curl -so wazuh-agent.pkg https://packages.wazuh.com/4.x/macos/wazuh-agent-${this.state.wazuhVersion
    //     }-1.pkg && sudo launchctl setenv ${this.optionalDeploymentVariables()}&& sudo installer -pkg ./wazuh-agent.pkg -target /`,
    //   winText: `Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-${this.state.wazuhVersion
    //     }-1.msi -OutFile wazuh-agent.msi; ./wazuh-agent.msi /q ${this.optionalDeploymentVariables()}`
    // };
		const customTexts = {
      // rpmText: `sudo ${this.optionalDeploymentVariables()}yum install ${this.optionalPackages()}`,
      rpmText: `curl -so agent.rpm ${this.optionalPackages()} && sudo ${this.optionalDeploymentVariables()}rpm -ivh agent.rpm ${this.startAgent()}`,
      debText: `curl -so agent.deb ${this.optionalPackages()} && sudo ${this.optionalDeploymentVariables()}dpkg -i ./agent.deb ${this.startAgent()}`,
      winText: `Invoke-WebRequest -Uri http://${document.location.hostname}/download/agent-security-${this.state.wazuhVersion
      }-1.msi -OutFile agent-security.msi; ./agent-security.msi /q ${this.optionalDeploymentVariables()}`
    };

    const field = `${this.state.selectedOS}Text`;
    const text = customTexts[field];
    const language = this.state.selectedOS === 'win' ? 'ps' : 'bash';
    const windowsAdvice = this.state.selectedOS === 'win' && (
      <>
        <EuiCallOut
          title="您将需要管理员权限才能执行此安装。"
          iconType="iInCircle"
        />
        <EuiSpacer></EuiSpacer>
      </>
    );
    const restartAgentCommand = this.restartAgentCommand[this.state.selectedOS];

    const onTabClick = (selectedTab) => {
      this.selectSYS(selectedTab.id);
    };

    const dowmloadWinMsi = `http://${document.location.hostname}/download/agent-security-4.1.5-1.msi`;
    const dowmloadWinClamav = `http://${document.location.hostname}/download/clamav/clamav.zip`;

    const guide = (
      <div>
        {missingOSSelection.length !== 0 && (
          <>
            <EuiCallOut
              color="warning"
              title={`请选择${missingOSSelection.join(', ')}。`}
              iconType="iInCircle"
            />
            <EuiSpacer></EuiSpacer>
          </>
        )}
        <div>
        {missingOSSelection.length === 0 && (
          <EuiText>
            <p>您可以使用此命令在一个或多个主机上安装和注册代理。</p>
            {/* <EuiCallOut
              color="warning"
              // title={<>在已经安装了代理的主机上运行此命令将升级代理包，而不需要登记代理。要注册它，请参阅 <EuiLink href="https://documentation.wazuh.com/current/user-manual/registering/index.html">文档</EuiLink>。</>}
              title={<>在已经安装了代理的主机上运行此命令将自动升级该代理。</>}
              iconType="iInCircle"
            />
            <EuiSpacer /> */}
            {this.state.isCluster && (
              <div>
                <EuiCallOut
                  color="warning"
                  title={<>分布式部署时，WAZUH_MANAGER请以实际的nginx所在节点ip为准。</>}
                  iconType="iInCircle"
                />
                <EuiSpacer />
              </div>
            )}
            <EuiCodeBlock style={codeBlock} language={language}>
              {this.state.wazuhPassword ? this.obfuscatePassword(text) : text}
            </EuiCodeBlock>
            {windowsAdvice}
            </EuiText>
        )}
        {missingOSSelection.length === 0 && (
          <EuiCopy textToCopy={text} afterMessage="已复制">
            {copy => (
              <EuiButton
                fill
                iconType="copy"
                style={{ marginRight: '16px' }}
                onClick={copy}>
                复制命令
              </EuiButton>
            )}
          </EuiCopy>
        )}
        {this.state.selectedOS === 'win' && (
          <>
            <EuiButton
              fill
              iconType="download"
              style={{ marginRight: '16px' }}
              onClick={() => this.toDownload('agent-security-4.1.5-1.msi')}
              // href={dowmloadWinMsi}
            >
              下载安装包
            </EuiButton>
            <EuiButton
              fill
              iconType="download"
              onClick={() => this.toDownload('clamav/clamav.zip')}
              // href={dowmloadWinClamav}
            >
              下载杀毒工具
            </EuiButton>
          </>
        )}
        </div>
      </div>
    );

    const tabs = [
      {
        id: 'systemd',
        name: 'Systemd',
        content: (
          <Fragment>
            <EuiSpacer />
            <EuiText>
              <EuiCodeBlock style={codeBlock} language={language}>
                  {this.systemSelector()}
              </EuiCodeBlock>
              <EuiCopy textToCopy={this.systemSelector()} afterMessage="已复制">
                {copy => (
                  <EuiButton
                    fill
                    iconType="copy"
                    onClick={copy}>
                    复制命令
                  </EuiButton>
                )}
              </EuiCopy>
            </EuiText>
          </Fragment>
        ),
      },
      {
        id: 'sysV',
        name: 'SysV Init',
        content: (
          <Fragment>
            <EuiSpacer />
            <EuiText>
              <EuiCodeBlock style={codeBlock} language={language}>
                  {this.systemSelector()}
              </EuiCodeBlock>
              <EuiCopy textToCopy={this.systemSelector()} afterMessage="已复制">
                {copy => (
                  <EuiButton
                    fill
                    iconType="copy"
                    onClick={copy}>
                    复制命令
                  </EuiButton>
                )}
              </EuiCopy>
            </EuiText>
          </Fragment>
        ),
      }
    ];

    const steps = [
      {
        title: '选择操作系统',
        // children: <EuiButtonGroup
        //   color='primary'
        //   options={osButtons}
        //   idSelected={this.state.selectedOS}
        //   onChange={os => this.selectOS(os)}
        // />
        children: <EuiRadioGroup
          options={osButtons}
          idSelected={this.state.selectedOS}
          onChange={os => this.selectOS(os)}
        />
      },
      // ...((this.state.selectedOS == 'rpm') ? [{
      //   title: '选择版本',
      //   children: <EuiButtonGroup
      //     color='primary'
      //     options={versionButtonsCentos}
      //     idSelected={this.state.selectedVersion}
      //     onChange={version => this.setVersion(version)}
      //   />
      // }] : []),
      // ...((this.state.selectedOS == 'rpm' && this.state.selectedVersion == 'centos5') ? [{
      //   title: '选择架构',
      //   children: <EuiButtonGroup
      //     color='primary'
      //     options={this.state.architectureCentos5}
      //     idSelected={this.state.selectedArchitecture}
      //     onChange={architecture => this.setArchitecture(architecture)}
      //   />
      // }] : []),
      // ...((this.state.selectedOS == 'deb' || (this.state.selectedOS == 'rpm' && this.state.selectedVersion == 'centos6')) ? [{
      //   title: '选择架构',
      //   children: <EuiButtonGroup
      //     color='primary'
      //     options={this.state.architectureButtons}
      //     idSelected={this.state.selectedArchitecture}
      //     onChange={architecture => this.setArchitecture(architecture)}
      //   />
      // }] : []),
      // {
      //   title: '服务地址',
      //   children: <Fragment>{ipInput}</Fragment>
      // },
      ...(!(!this.state.needsPassword || this.state.hidePasswordInput) ? [{
        title: 'Wazuh密码',
        children: <Fragment>{passwordInput}</Fragment>
      }] : []),
      {
        title: '为代理分组',
        children: <Fragment>{groupInput}</Fragment>
      },
      {
        title: '安装并注册代理',
        children: <div>{guide}</div>
      },
      // ...((this.state.selectedOS == 'rpm') || (this.state.selectedOS == 'deb') ? [{
      //   title: '启动代理',
      //   children: missingOSSelection.length
      //   ? <EuiCallOut
      //       color="warning"
      //       title={`请选择${missingOSSelection.join(', ')}。`}
      //       iconType="iInCircle"
      //     />
      //   :
      //   <EuiTabbedContent
      //     tabs={tabs}
      //     selectedTab={this.selectedSYS}
      //     onTabClick={onTabClick}
      //   />
      // }] : []),

      // ...(!missingOSSelection.length && (this.state.selectedOS !== 'rpm') && (this.state.selectedOS !== 'deb') && restartAgentCommand ? [
      //   {
      //     title: '启动代理',
      //     children: (
      //         <EuiFlexGroup direction="column">
      //             <EuiText>
      //               <EuiCodeBlock style={codeBlock} language={language}>
      //                 {restartAgentCommand}
      //               </EuiCodeBlock>
      //               <EuiCopy textToCopy={restartAgentCommand} afterMessage="已复制">
      //                 {copy => (
      //                   <EuiButton
      //                     fill
      //                     iconType="copy"
      //                     onClick={copy}>
      //                     复制命令
      //                   </EuiButton>
      //                 )}
      //               </EuiCopy>
      //             </EuiText>
      //         </EuiFlexGroup>
      //     )
      //   }
      // ] : [])

    ];

    return (
      <div>
        <EuiPage style={{ background: 'transparent' }}>
          <EuiPageBody>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiPanel>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiTitle>
                        <h2>部署新代理</h2>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      {this.props.hasAgents && (
                        <EuiButtonEmpty
                          size="s"
                          onClick={() => this.props.addNewAgent(false)}
                          iconType="cross"
                        >
                          关闭
                        </EuiButtonEmpty>
                      )}
                      {!this.props.hasAgents && (
                        <EuiButtonEmpty
                          size="s"
                          onClick={() => this.props.reload()}
                          iconType="refresh"
                        >
                          刷新
                        </EuiButtonEmpty>
                      )}
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer></EuiSpacer>
                  {this.state.loading && (
                    <>
                      <EuiFlexItem>
                        <EuiProgress size="xs" color="primary" />
                      </EuiFlexItem>
                      <EuiSpacer></EuiSpacer>
                    </>
                  )}
                  {!this.state.loading && (
                    <EuiFlexItem>
                      <EuiSteps steps={steps} />
                    </EuiFlexItem>
                  )}
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageBody>
        </EuiPage>
      </div>
    );
  }
}
