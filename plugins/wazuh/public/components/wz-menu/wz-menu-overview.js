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
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { EuiFlexGroup, EuiFlexItem, EuiFlexGrid, EuiButtonEmpty, EuiSideNav, EuiIcon, EuiCollapsibleNavGroup } from '@elastic/eui';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { updateCurrentTab, updateCurrentAgentData } from '../../redux/actions/appStateActions';
import { AppState } from '../../react-services/app-state';
import { AppNavigate } from '../../react-services/app-navigate';
import { getAngularModule } from '../../kibana-services';
import { hasAgentSupportModule } from '../../react-services/wz-agents';
import { WAZUH_MODULES_ID } from '../../../common/constants';
import { getDataPlugin } from '../../kibana-services';

class WzMenuOverview extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      securityInformation: {
        id: 'securityInformation',
        text: '安全信息管理'
      },
      auditing: { id: 'auditing', text: '审计与策略监控' },
      threatDetection: {
        id: 'threatDetection',
        text: '威胁检测与响应'
      },
      regulatoryCompliance: {
        id: 'regulatoryCompliance',
        text: '合规性'
      },
      clamav: { id: WAZUH_MODULES_ID.CLAMAV, text: '防病毒' },
      general: { id: WAZUH_MODULES_ID.SECURITY_EVENTS, text: '安全事件' },
      fim: { id: WAZUH_MODULES_ID.INTEGRITY_MONITORING, text: '完整性监控' },
      aws: { id: WAZUH_MODULES_ID.AMAZON_WEB_SERVICES, text: 'Amazon AWS' },
      gcp: { id: WAZUH_MODULES_ID.GOOGLE_CLOUD_PLATFORM, text: '谷歌云平台' },
      pm: { id: WAZUH_MODULES_ID.POLICY_MONITORING, text: '策略监控' },
      sca: { id:  WAZUH_MODULES_ID.SECURITY_CONFIGURATION_ASSESSMENT, text: '安全配置评估' },
      audit: { id:  WAZUH_MODULES_ID.AUDITING, text: '系统审计' },
      oscap: { id:  WAZUH_MODULES_ID.OPEN_SCAP, text: 'OpenSCAP' },
      ciscat: { id:  WAZUH_MODULES_ID.CIS_CAT, text: 'CIS-CAT' },
      vuls: { id:  WAZUH_MODULES_ID.VULNERABILITIES, text: '漏洞' },
      virustotal: { id:  WAZUH_MODULES_ID.VIRUSTOTAL, text: 'VirusTotal' },
      osquery: { id:  WAZUH_MODULES_ID.OSQUERY, text: 'Osquery' },
      docker: { id:  WAZUH_MODULES_ID.DOCKER, text: 'Docker监听器' },
      mitre: { id:  WAZUH_MODULES_ID.MITRE_ATTACK, text: 'MITRE ATT&CK' },
      pci: { id:  WAZUH_MODULES_ID.PCI_DSS, text: 'PCI DSS' },
      gdpr: { id:  WAZUH_MODULES_ID.GDPR, text: 'GDPR' },
      hipaa: { id:  WAZUH_MODULES_ID.HIPAA, text: 'HIPAA' },
      nist: { id:  WAZUH_MODULES_ID.NIST_800_53, text: 'NIST 800-53' },
      tsc: { id:  WAZUH_MODULES_ID.TSC, text: 'TSC' }
    };

    this.securityInformationItems = [
      this.overviewSections.clamav,
      this.overviewSections.general,
      this.overviewSections.fim,
      this.overviewSections.aws,
      this.overviewSections.gcp
    ];
    this.auditingItems = [
      this.overviewSections.pm,
      this.overviewSections.audit,
      this.overviewSections.oscap,
      this.overviewSections.ciscat,
      this.overviewSections.sca
    ];
    this.threatDetectionItems = [
      this.overviewSections.vuls,
      this.overviewSections.virustotal,
      this.overviewSections.osquery,
      this.overviewSections.docker,
      this.overviewSections.mitre
    ];
    this.regulatoryComplianceItems = [
      this.overviewSections.pci,
      this.overviewSections.gdpr,
      this.overviewSections.hipaa,
      this.overviewSections.nist,
      this.overviewSections.tsc
    ];
  }

  async componentDidMount() {
    const extensions = await AppState.getExtensions(this.currentApi);
    this.setState({ extensions });
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
  }

  clickMenuItem = (ev, section) => {
    console.log(window.location.href)
    this.removeSelectedAgent();
    const params = { tab: section };
    if (this.props.currentAgentData.id)
      // params["agentId"] = this.props.currentAgentData.id;
    if (section === "sca") { // SCA initial tab is inventory
      params["tabView"] = "inventory"
    }

    if (this.props.currentTab !== section) {
      // do not redirect if we already are in that tab
      if (!this.props.isAgent) {
        AppNavigate.navigateToModule(ev, 'overview', params)
      } else {
        if (!this.props.switchTab) {
          this.props.updateCurrentAgentData(this.props.isAgent);
          AppNavigate.navigateToModule(ev, 'overview', params)
        } else {
          this.props.switchTab(section);
        }
      }
    }
  };

  createItems = items => {
    const keyExists = key => Object.keys(this.state.extensions).includes(key);
    const keyIsTrue = key => (this.state.extensions || [])[key];
    return items.filter(item => 
      (Object.keys(this.props.currentAgentData).length ? hasAgentSupportModule(this.props.currentAgentData, item.id) : true) && Object.keys(this.state.extensions).length && (!keyExists(item.id) || keyIsTrue(item.id))
    ).map(item => this.createItem(item));
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: this.props.currentTab === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id)
    };
  };

  removeSelectedAgent() {
    this.props.updateCurrentAgentData({});
    // this.router.reload();
    const { filterManager } = getDataPlugin().query;
    const currentAppliedFilters = filterManager.getFilters();
    const agentFilters = currentAppliedFilters.filter(x => {
      return x.meta.key === 'agent.id';
    });
    agentFilters.map(x => {
      filterManager.removeFilter(x);
    });
  }

  render() {
    const container = document.getElementsByTagName('body');
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      <EuiCollapsibleNavGroup
        title="安全信息管理"
        titleSize="xs"
        iconType="managementApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={this.createItems(this.securityInformationItems)}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
      <EuiCollapsibleNavGroup
        title="审计与策略监控"
        titleSize="xs"
        iconType="managementApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={this.createItems(this.auditingItems)}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
      <EuiCollapsibleNavGroup
        title="威胁检测与响应"
        titleSize="xs"
        iconType="reportingApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={this.createItems(this.threatDetectionItems)}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
      <EuiCollapsibleNavGroup
        title="合规性"
        titleSize="xs"
        iconType="reportingApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={this.createItems(this.regulatoryComplianceItems)}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
    </div>, container[0])

    // const securityInformation = [
    //   {
    //     name: this.overviewSections.securityInformation.text,
    //     id: this.overviewSections.securityInformation.id,
    //     icon: <EuiIcon type="managementApp" color="primary" />,
    //     items: this.createItems(this.securityInformationItems)
    //   }
    // ];

    // const auditing = [
    //   {
    //     name: this.overviewSections.auditing.text,
    //     id: this.overviewSections.auditing.id,
    //     icon: <EuiIcon type="managementApp" color="primary" />,
    //     items: this.createItems(this.auditingItems)
    //   }
    // ];

    // const threatDetection = [
    //   {
    //     name: this.overviewSections.threatDetection.text,
    //     id: this.overviewSections.threatDetection.id,
    //     icon: <EuiIcon type="reportingApp" color="primary" />,
    //     items: this.createItems(this.threatDetectionItems)
    //   }
    // ];

    // const regulatoryCompliance = [
    //   {
    //     name: this.overviewSections.regulatoryCompliance.text,
    //     id: this.overviewSections.regulatoryCompliance.id,
    //     icon: <EuiIcon type="reportingApp" color="primary" />,
    //     items: this.createItems(this.regulatoryComplianceItems)
    //   }
    // ];

    // const agentData = store.getState().appStateReducers.currentAgentData

    // return (
    //   <div className="WzManagementSideMenu wz-menu-overview">
    //     {Object.keys(this.state.extensions).length && (
    //       <div>
    //         {!agentData.id && (
    //           <EuiFlexGroup>
    //             <EuiFlexItem grow={false} style={{ marginLeft: 14 }}>
    //               <EuiButtonEmpty iconType="apps"
    //                 onClick={() => {
    //                   this.props.closePopover();
    //                   window.location.href = '#/overview';
    //                 }}>
    //                 安全管理目录
    //               </EuiButtonEmpty>
    //             </EuiFlexItem>
    //           </EuiFlexGroup>
    //         )}
    //         <EuiFlexGrid columns={2}>
    //           <EuiFlexItem>
    //             <EuiSideNav
    //               items={securityInformation}
    //               style={{ padding: '4px 12px' }}
    //             />
    //           </EuiFlexItem>
    //           <EuiFlexItem>
    //             <EuiSideNav
    //               items={auditing}
    //               style={{ padding: '4px 12px' }}
    //             />
    //           </EuiFlexItem>
    //           <EuiFlexItem>
    //             <EuiSideNav
    //               items={threatDetection}
    //               style={{ padding: '4px 12px' }}
    //             />
    //           </EuiFlexItem>
    //           <EuiFlexItem>
    //             <EuiSideNav
    //               items={regulatoryCompliance}
    //               style={{ padding: '4px 12px' }}
    //             />
    //           </EuiFlexItem>
    //         </EuiFlexGrid>
    //       </div>
    //     ) || (<div style={{ width: 300 }}></div>
    //       )}
    //   </div>
    // );
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers,
    currentAgentData: state.appStateReducers.currentAgentData,
    currentTab: state.appStateReducers.currentTab
  };
};

const mapDispatchToProps = dispatch => ({
  updateCurrentAgentData: (agentData) => dispatch(updateCurrentAgentData(agentData))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzMenuOverview);
