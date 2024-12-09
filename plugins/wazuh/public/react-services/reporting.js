/*
 * Wazuh app - Reporting service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import $ from 'jquery';
import moment from 'moment';
import { WazuhConfig } from '../react-services/wazuh-config';
import { GenericRequest } from '../react-services/generic-request';
import { Vis2PNG } from '../factories/vis2png';
import { RawVisualizations } from '../factories/raw-visualizations';
import { VisHandlers } from '../factories/vis-handlers';
import { getToasts }  from '../kibana-services';
import { getAngularModule } from '../kibana-services';
const app = getAngularModule();

export class ReportingService {
  constructor() {
    this.$rootScope = app.$injector.get('$rootScope');
    this.vis2png = new Vis2PNG();
    this.rawVisualizations = new RawVisualizations();
    this.visHandlers = new VisHandlers();
    this.wazuhConfig = new WazuhConfig();
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  removeTableVis(visList) {
    const attributes = JSON.parse(visList.attributes.visState);
    return attributes.type !== 'table';
  }

  removeAgentStatusVis(idArray) {
    const monitoringEnabled = this.wazuhConfig.getConfig()[
      'wazuh.monitoring.enabled'
    ];
    if (!monitoringEnabled) {
      const visArray = idArray.filter(vis => {
        return vis !== 'Wazuh-App-Overview-General-Agents-status';
      });
      return visArray;
    }
    return idArray;
  }

  getQueryString(variable) {
    let query = window.location.href.split('?')[1];
    let vars = query.split("&");
    for (let i=0;i<vars.length;i++) {
      let pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return(false);
  }

  async startVis2Png(tab, agents = false, syscollectorFilters = null) {
    try {
      if (this.vis2png.isWorking()) {
        this.showToast('danger', '警告', 'Report in progress', 4000);
        return;
      }
      this.$rootScope.reportBusy = true;
      this.$rootScope.reportStatus = '生成报告...0%';
      this.$rootScope.$applyAsync();

      this.vis2png.clear();

      const rawVisualizations = this.rawVisualizations
        .getList()
        .filter(this.removeTableVis);

      let idArray = [];
      if (tab === 'general') {
        idArray = this.removeAgentStatusVis(
          rawVisualizations.map(item => item.id)
        );
      } else {
        idArray = rawVisualizations.map(item => item.id);
      }

      for (const item of idArray) {
        const tmpHTMLElement = $(`#${item}`);
        this.vis2png.assignHTMLItem(item, tmpHTMLElement);
      }

      const appliedFilters = await this.visHandlers.getAppliedFilters(
        syscollectorFilters
      );

      const array = await this.vis2png.checkArray(idArray);
      const tabNew = this.getQueryString('tab');
      const tabText = {
        syscollector: '详细信息',
        systemCommands: '高危指令',
        pm: 'rootkit',
        webAttack: 'web攻击',
        bruteForce: '暴力破解',
        reboundShell: '反弹shell',
        localAskRight: '本地提权',
        dataTheft: '数据窃取',
        blackmailVirus: '勒索病毒',
        riskPort: '高危端口',
        accountChange: '账户检测-账户变更',
        accountUnusual: '账户检测-账户异常',
        accountLogin: '账户检测-账户登录',
        zombies: '恶意进程-僵尸进程',
        hiddenProcess: '恶意进程-隐藏进程',
        riskService: '主机检测-高危系统服务',
        virusFound: '病毒发现',
        systemCommandVerify: '系统命令校验',
      }
      // const name = `wazuh-${
      const name = `${
        agents ?  `代理-${agents}` : '告警'
      }-${tabNew && tabText[tabNew] ? tabText[tabNew] : tab}-${(Date.now() / 1000) | 0}.pdf`;

      const browserTimezone = moment.tz.guess(true);

      const data = {
        array,
        name,
        title: agents ? `Agents ${tab}` : `Overview ${tab}`,
        filters: appliedFilters.filters,
        time: appliedFilters.time,
        searchBar: appliedFilters.searchBar,
        tables: appliedFilters.tables,
        tab,
        section: agents ? 'agents' : 'overview',
        agents,
        browserTimezone
      };

      const apiEndpoint = tab === 'syscollector' ? `/reports/agents/${agents}/inventory` : `/reports/modules/${tab}`;
      await GenericRequest.request('POST', apiEndpoint, data);

      this.$rootScope.reportBusy = false;
      this.$rootScope.reportStatus = false;
      this.$rootScope.$applyAsync();
      this.showToast(
        'success',
        '创建报告',
        '成功。进入 日志报表 > 报表管理 查看报告',
        // '成功。进入Wazuh > 策略管理 > 报告',
        4000
      );
      return;
    } catch (error) {
      this.$rootScope.reportBusy = false;
      this.$rootScope.reportStatus = false;
      this.showToast('danger', '警告', error.message || error, 4000);
    }
  }

  async startConfigReport(obj, type, components) {
    try {
      this.$rootScope.reportBusy = true;
      this.$rootScope.reportStatus = '生成PDF文件...';
      this.$rootScope.$applyAsync();

      const docType =
        type === 'agentConfig'
          ? `代理-${obj.id}`
          : `分组-${obj.name}`;

      const name = `${docType}-配置-${(Date.now() / 1000) | 0}.pdf`;
      const browserTimezone = moment.tz.guess(true);

      const data = {
        name,
        filters: [
          type === 'agentConfig' ? { agent: obj.id } : { group: obj.name }
        ],
        tab: type,
        browserTimezone,
        components
      };
      const apiEndpoint = type === 'agentConfig' ? `/reports/agents/${obj.id}` : `/reports/groups/${obj.name}`;

      await GenericRequest.request('POST', apiEndpoint, data);

      this.$rootScope.reportBusy = false;
      this.$rootScope.reportStatus = false;
      this.$rootScope.$applyAsync();
      this.showToast(
        'success',
        '创建报告',
        '成功。进入 日志报表 > 报表管理 查看报告',
        // '成功。进入Wazuh > 策略管理 > 报告',
        4000
      );
      return;
    } catch (error) {
      this.$rootScope.reportBusy = false;
      this.$rootScope.reportStatus = false;
      this.showToast('danger', '配置报告时出错', error.message || error, 4000);
      this.$rootScope.$applyAsync();
    }
  }
}
