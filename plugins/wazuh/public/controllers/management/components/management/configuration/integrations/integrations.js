/*
 * Wazuh app - React component for show configuration of integrations.
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

import { WzConfigurationSettingsHeaderViewer } from '../util-components/configuration-settings-header';
import WzNoConfig from '../util-components/no-config';
import { WzSettingsViewer } from '../util-components/code-viewer';
import WzViewSelector, {
  WzViewSelectorSwitch
} from '../util-components/view-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import withWzConfig from '../util-hocs/wz-config';
import { capitalize, isString } from '../utils/utils';

const helpLinks = [
  {
    text: '如何将应用程序与外部api集成',
    href:
      'https://documentation.wazuh.com/current/user-manual/manager/manual-integration.html'
  },
  {
    text: 'VirusTotal集成文档',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/virustotal-scan/index.html'
  },
  {
    text: '集成参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/integration.html'
  }
];

const defaultIntegrations = [
  { title: 'Slack', description: '在Slack上直接获得警报' },
  {
    title: 'VirusTotal',
    description: '当发现恶意软件时得到通知'
  },
  {
    title: 'PagerDuty',
    description: '在这个精简的事件解决软件上获取警报'
  }
];

const integrationsSettings = [
  { field: 'hook_url', label: 'Hook URL' },
  { field: 'level', label: '按此级别或更高级别筛选警报' },
  { field: 'rule_id', label: '根据这些规则id过滤警报' },
  { field: 'group', label: '根据这些规则组过滤警报' },
  {
    field: 'event_location',
    label: '按位置(代理、IP或文件)筛选警报'
  },
  { field: 'alert_format', label: '用于写入警告的格式' }
];

class WzConfigurationIntegrations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: ''
    };
  }
  changeView(view) {
    this.setState({ view });
  }
  buildIntegration(integration) {
    return (
      defaultIntegrations.find(
        i => i.title && i.title.toLocaleLowerCase() === integration
      ) || { title: capitalize(integration), description: 'Custom integration' }
    );
  }
  render() {
    const { view } = this.state;
    const { currentConfig } = this.props;
    const integrations =
      currentConfig['integrator-integration'] &&
      currentConfig['integrator-integration'].integration
        ? currentConfig['integrator-integration'].integration
        : false;
    return (
      <Fragment>
        {currentConfig['integrator-integration'] &&
          isString(currentConfig['integrator-integration']) && (
            <WzNoConfig
              error={currentConfig['integrator-integration']}
              help={helpLinks}
            />
          )}
        {currentConfig['integrator-integration'] &&
          !isString(currentConfig['integrator-integration']) && (
            //   <WzConfigurationSettingsTabSelector
            //     title='Main settings'
            //     description='Basic alerts and logging settings'
            //     currentConfig={currentConfig}
            //     helpLinks={helpLinks}>
            // </WzConfigurationSettingsTabSelector>
            <WzViewSelector view={view}>
              <WzViewSelectorSwitch default>
                {integrations &&
                  integrations.map((integrationInfo, key) => {
                    const integration = Object.assign(
                      this.buildIntegration(integrationInfo.name),
                      integrationInfo
                    );
                    return (
                      <Fragment key={`integration-${integration.title}`}>
                        <WzConfigurationSettingsGroup
                          title={integration.title}
                          description={integration.description}
                          items={integrationsSettings}
                          config={integration}
                          viewSelected={view}
                          settings={
                            key === 0 ? () => this.changeView('') : undefined
                          }
                          json={
                            key === 0
                              ? () => this.changeView('json')
                              : undefined
                          }
                          xml={
                            key === 0 ? () => this.changeView('xml') : undefined
                          }
                          help={key === 0 ? helpLinks : undefined}
                        />
                      </Fragment>
                    );
                  })}
              </WzViewSelectorSwitch>
              <WzViewSelectorSwitch view="json">
                <WzConfigurationSettingsHeaderViewer
                  mode="json"
                  viewSelected={view}
                  settings={() => this.changeView('')}
                  json={() => this.changeView('json')}
                  xml={() => this.changeView('xml')}
                  help={helpLinks}
                />
                <WzSettingsViewer
                  mode="json"
                  value={currentConfig}
                  minusHeight={260}
                />
              </WzViewSelectorSwitch>
              <WzViewSelectorSwitch view="xml">
                <WzConfigurationSettingsHeaderViewer
                  mode="xml"
                  viewSelected={view}
                  settings={() => this.changeView('')}
                  json={() => this.changeView('json')}
                  xml={() => this.changeView('xml')}
                  help={helpLinks}
                />
                <WzSettingsViewer
                  mode="xml"
                  value={currentConfig}
                  minusHeight={260}
                />
              </WzViewSelectorSwitch>
            </WzViewSelector>
          )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'integrator', configuration: 'integration' }];

// WzConfigurationIntegrations.propTypes = {
//   currentConfig: PropTypes.object.isRequired
// };

export default withWzConfig(sections)(WzConfigurationIntegrations);
