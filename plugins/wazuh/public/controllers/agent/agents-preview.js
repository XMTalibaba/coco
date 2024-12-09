/*
 * Wazuh app - Agents preview controller
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import * as FileSaver from '../../services/file-saver';
import { DataFactory } from '../../services/data-factory';
import { version } from '../../../package.json';
import { clickAction } from '../../services/click-action';
import { AppState } from '../../react-services/app-state';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { GenericRequest } from '../../react-services/generic-request';
import { WzRequest } from '../../react-services/wz-request';
import { ShareAgent } from '../../factories/share-agent';
import { formatUIDate } from '../../react-services/time-service';
import { ErrorHandler } from '../../react-services/error-handler';
import { getDataPlugin, getUiSettings } from '../../kibana-services';

export class AgentsPreviewController {
  /**
   * Class constructor
   * @param {Object} $scope
   * @param {Object} $location
   * @param {Object} errorHandler
   * @param {Object} csvReq
   */
  constructor(
    $scope,
    $location,
    $route,
    errorHandler,
    csvReq,
    commonData,
    $window
  ) {
    this.$scope = $scope;
    this.genericReq = GenericRequest;
    this.$location = $location;
    this.$route = $route;
    this.errorHandler = errorHandler;
    this.csvReq = csvReq;
    this.shareAgent = new ShareAgent();
    this.commonData = commonData;
    this.wazuhConfig = new WazuhConfig();
    this.errorInit = false;
    this.$window = $window;
    this.hostFound = false;
    this.agentDetail = false;
    this.selectAgent = {};
  }

  /**
   * On controller loads
   */
  async $onInit() {
    this.init = true;
    this.api = JSON.parse(AppState.getCurrentAPI()).id;
    const loc = this.$location.search();
    if ((loc || {}).agent && (loc || {}).agent !== '000') {
      this.commonData.setTimefilter( getDataPlugin().timefilter.timefilter.getTime());
      return this.showAgent({ id: loc.agent });
    }

    this.isClusterEnabled =
      AppState.getClusterInfo() &&
      AppState.getClusterInfo().status === 'enabled';

    this.loading = true;
    this.osPlatforms = [];
    this.versions = [];
    this.groups = [];
    this.nodes = [];
    this.mostActiveAgent = {
      name: '',
      id: ''
    };
    this.prevSearch = false;

    // Load URL params
    if (loc && loc.tab) {
      this.submenuNavItem = loc.tab;
    }
    const summaryData = await WzRequest.apiReq('GET', '/agents/summary/status', {});
    this.summary = summaryData.data.data;
    if (this.summary.total === 0) {
      // if (this.addingNewAgent === undefined) {
      //   this.addNewAgent(true);
      // }
      this.hasAgents = false;
    } else {
      this.hasAgents = true;
    }

    // Watcher for URL params
    this.$scope.$watch('submenuNavItem', () => {
      this.$location.search('tab', this.submenuNavItem);
    });

    this.$scope.$on('wazuhFetched', evt => {
      evt.stopPropagation();
    });

    this.registerAgentsProps = {
      addNewAgent: flag => this.addNewAgent(flag),
      hasAgents: this.hasAgents,
      reload: () => this.$route.reload(),
      getWazuhVersion: () => this.getWazuhVersion(),
      getCurrentApiAddress: () => this.getCurrentApiAddress()
    };
    this.hasAgents = true;
    this.init = false;
    const instance = new DataFactory(WzRequest.apiReq, '/agents', false, false);
    //Props
    this.tableAgentsProps = {
      wzReq: (method, path, body) => WzRequest.apiReq(method, path, body),
      addingNewAgent: () => {
        this.addNewAgent(true);
        this.$scope.$applyAsync();
      },
      downloadCsv: (filters = []) => {
        this.downloadCsv(filters);
        this.$scope.$applyAsync();
      },
      showAgent: agent => {
        this.showAgent(agent);
        this.$scope.$applyAsync();
      },
      getMostActive: async () => {
        return await this.getMostActive();
      },
      clickAction: (item, openAction = false) => {
        clickAction(
          item,
          openAction,
          instance,
          this.shareAgent,
          this.$location,
          this.$scope
        );
        this.$scope.$applyAsync();
      },
      formatUIDate: date => formatUIDate(date),
      summary: this.summary,
      toHostFound: () => {
        this.toHostFound(true);
        this.$scope.$applyAsync();
      },
      toAgentDetails: (item) => {
        this.toAgentDetails(true, item);
        this.$scope.$applyAsync();
      },
    };
    this.hostFoundProps = {
      toHostFound: flag => this.toHostFound(flag),
    }
    this.agentDetailProps = {
      goBack: () => this.toAgentDetails(false, {}),
      selectAgent: this.selectAgent
    }
    //Load
    this.load();
  }

  /**
   * Searches by a query and term
   * @param {String} query
   * @param {String} search
   */
  query(query, search) {
    this.$scope.$broadcast('wazuhQuery', { query, search });
    this.prevSearch = search || false;
  }

  /**
   * Selects an agent
   * @param {String} agent
   */
  showAgent(agent) {
    this.shareAgent.setAgent(agent);
    this.$location.path('/agents');
  }

  /**
   * Exports the table in CSV format
   */
  async downloadCsv(filters) {
    try {
      ErrorHandler.info(
        '您的下载已自动开始...',
        'CSV'
      );
      let csvTextContrast = {
        'status': [
          { value: 'never_connected', text: '从未连接' },
          { value: 'disconnected', text: '未连接' },
          { value: 'active', text: '已连接' },
          { value: 'pending', text: '挂起' },
        ]
      }
      const output = await this.csvReq.fetch('/agents', this.api, filters, [], {}, csvTextContrast);
      const blob = new Blob([output.csv], { type: 'text/csv; charset=utf-8' }); // eslint-disable-line

      FileSaver.saveAs(blob, '代理列表.csv');

      return;
    } catch (error) {
      ErrorHandler.handle(error, 'Download CSV');
    }
    return;
  }

  async getMostActive() {
    try {
      const data = await this.genericReq.request(
        'GET',
        `/elastic/top/${this.firstUrlParam}/${this.secondUrlParam}/agent.name/${this.pattern}`
      );
      let agentName = data.data.data;
      const info = await WzRequest.apiReq(
        'GET',
        `/agents`,
        { params: {
          limit: 15,
          offset: 0,
          q: `id!=000;(name=${agentName})`
        } }
      );
      const { affected_items, total_affected_items } = ((info || {}).data || {}).data || {};
      if (total_affected_items === 1) {
        this.mostActiveAgent = affected_items[0];
      }
      return this.mostActiveAgent;
      // const data = await this.genericReq.request(
      //   'GET',
      //   `/elastic/top/${this.firstUrlParam}/${this.secondUrlParam}/agent.name/${this.pattern}`
      // );
      // this.mostActiveAgent.name = data.data.data;
      // const info = await this.genericReq.request(
      //   'GET',
      //   `/elastic/top/${this.firstUrlParam}/${this.secondUrlParam}/agent.id/${this.pattern}`
      // );
      // if (info.data.data === '' && this.mostActiveAgent.name !== '') {
      //   this.mostActiveAgent.id = '000';
      // } else {
      //   this.mostActiveAgent.id = info.data.data;
      // }

      // return this.mostActiveAgent;
    } catch (error) {
      return this.mostActiveAgent;
    }
  }

  /**
   * On controller loads
   */
  async load() {
    try {
      this.errorInit = false;

      const clusterInfo = AppState.getClusterInfo();
      this.firstUrlParam =
        clusterInfo.status === 'enabled' ? 'cluster' : 'manager';
      this.secondUrlParam = clusterInfo[this.firstUrlParam];
      this.pattern = (await getDataPlugin().indexPatterns.get(AppState.getCurrentPattern())).title;
    } catch (error) {
      this.errorInit = ErrorHandler.handle(error, '', { silent: true });
    }
    this.loading = false;
    this.$scope.$applyAsync();
  }

  addNewAgent(flag) {
    this.addingNewAgent = flag;
  }

  openRegistrationDocs() {
    this.$window.open(
      'https://documentation.wazuh.com/current/user-manual/registering/index.html',
      '_blank'
    );
  }

  /**
   * Returns the current API address
   */
  async getCurrentApiAddress() {
    try {
      const result = await this.genericReq.request('GET', '/hosts/apis');
      const entries = result.data || [];
      const host = entries.filter(e => {
        return e.id == this.api;
      });
      const url = host[0].url;
      const numToClean = url.startsWith('https://') ? 8 : 7;
      return url.substr(numToClean);
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns the Wazuh version as x.y.z
   */
  async getWazuhVersion() {
    try {
      const data = await WzRequest.apiReq('GET', '//', {});
      const result = ((data || {}).data || {}).data || {};
      return result.api_version
    } catch (error) {
      return version;
    }
  }

  toHostFound(flag) {
    this.hostFound = flag;
  }

  toAgentDetails(flag, agent) {
    this.agentDetail = flag;
    this.selectAgent = agent;
    this.agentDetailProps.selectAgent = agent;
  }
}
