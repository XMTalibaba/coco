"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhReportingCtrl = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _wazuhModules = require("../../common/wazuh-modules");

var TimSort = _interopRequireWildcard(require("timsort"));

var _errorResponse = require("../lib/error-response");

var VulnerabilityRequest = _interopRequireWildcard(require("../lib/reporting/vulnerability-request"));

var OverviewRequest = _interopRequireWildcard(require("../lib/reporting/overview-request"));

var RootcheckRequest = _interopRequireWildcard(require("../lib/reporting/rootcheck-request"));

var PCIRequest = _interopRequireWildcard(require("../lib/reporting/pci-request"));

var GDPRRequest = _interopRequireWildcard(require("../lib/reporting/gdpr-request"));

var TSCRequest = _interopRequireWildcard(require("../lib/reporting/tsc-request"));

var AuditRequest = _interopRequireWildcard(require("../lib/reporting/audit-request"));

var SyscheckRequest = _interopRequireWildcard(require("../lib/reporting/syscheck-request"));

var _pciRequirementsPdfmake = _interopRequireDefault(require("../integration-files/pci-requirements-pdfmake"));

var _gdprRequirementsPdfmake = _interopRequireDefault(require("../integration-files/gdpr-requirements-pdfmake"));

var _tscRequirementsPdfmake = _interopRequireDefault(require("../integration-files/tsc-requirements-pdfmake"));

var _processStateEquivalence = _interopRequireDefault(require("../lib/process-state-equivalence"));

var _csvKeyEquivalence = require("../../common/csv-key-equivalence");

var _agentConfiguration = require("../lib/reporting/agent-configuration");

var _printer = require("../lib/reporting/printer");

var _logger = require("../lib/logger");

var _constants = require("../../common/constants");

var _filesystem = require("../lib/filesystem");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Wazuh app - Class for Wazuh reporting controller
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
class WazuhReportingCtrl {
  constructor() {}
  /**
   * This do format to filters
   * @param {String} filters E.g: cluster.name: wazuh AND rule.groups: vulnerability
   * @param {String} searchBar search term
   */


  sanitizeKibanaFilters(filters, searchBar) {
    (0, _logger.log)('reporting:sanitizeKibanaFilters', `Started to sanitize filters`, 'info');
    (0, _logger.log)('reporting:sanitizeKibanaFilters', `filters: ${filters.length}, searchBar: ${searchBar}`, 'debug');
    let str = '';
    const len = filters.length;

    for (let i = 0; i < len; i++) {
      const {
        negate,
        key,
        value,
        params,
        type
      } = filters[i].meta;
      str += `${negate ? 'NOT ' : ''}`;
      str += `${key}: `;
      str += `${type === 'range' ? `${params.gte}-${params.lt}` : !!value ? value : (params || {}).query}`;
      str += `${i === len - 1 ? '' : ' AND '}`;
    }

    if (searchBar) {
      str += ' AND ' + searchBar;
    }

    (0, _logger.log)('reporting:sanitizeKibanaFilters', `str: ${str}`, 'debug');
    return str;
  }
  /**
   * This performs the rendering of given header
   * @param {String} printer section target
   * @param {String} section section target
   * @param {Object} tab tab target
   * @param {Boolean} isAgents is agents section
   * @param {String} apiId ID of API
   */


  async renderHeader(context, printer, section, tab, isAgents, apiId) {
    try {
      (0, _logger.log)('reporting:renderHeader', `section: ${section}, tab: ${tab}, isAgents: ${isAgents}, apiId: ${apiId}`, 'debug');

      if (section && typeof section === 'string') {
        if (!['agentConfig', 'groupConfig'].includes(section)) {
          printer.addContent({
            text: _wazuhModules.WAZUH_MODULES[tab].title + ' report',
            style: 'h1'
          });
        } else if (section === 'agentConfig') {
          printer.addContent({
            text: `代理 ${isAgents} 配置`,
            style: 'h1'
          });
        } else if (section === 'groupConfig') {
          printer.addContent({
            text: '分组内代理',
            style: {
              fontSize: 14,
              color: '#000'
            },
            margin: [0, 20, 0, 0]
          });

          if (section === 'groupConfig' && !Object.keys(isAgents).length) {
            printer.addContent({
              text: 'There are still no agents in this group.',
              style: {
                fontSize: 12,
                color: '#000'
              },
              margin: [0, 10, 0, 0]
            });
          }
        }

        printer.addNewLine();
      }

      if (isAgents && typeof isAgents === 'object') {
        await this.buildAgentsTable(context, printer, isAgents, apiId, section === 'groupConfig' ? tab : false);
      }

      if (isAgents && typeof isAgents === 'string') {
        const agentResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/agents`, {
          params: {
            agents_list: isAgents
          }
        }, {
          apiHostID: apiId
        });
        const agentData = agentResponse.data.data.affected_items[0];

        if (agentData && agentData.status !== 'active') {
          printer.addContentWithNewLine({
            text: `Warning. Agent is ${agentData.status.toLowerCase()}`,
            style: 'standard'
          });
        }

        await this.buildAgentsTable(context, printer, [isAgents], apiId);

        if (agentData && agentData.group) {
          const agentGroups = agentData.group.join(', ');
          printer.addContentWithNewLine({
            text: `分组${agentData.group.length > 1 ? 's' : ''}: ${agentGroups}`,
            style: 'standard'
          });
        }
      }

      if (_wazuhModules.WAZUH_MODULES[tab] && _wazuhModules.WAZUH_MODULES[tab].description) {
        printer.addContentWithNewLine({
          text: _wazuhModules.WAZUH_MODULES[tab].description,
          style: 'standard'
        });
      }

      return;
    } catch (error) {
      (0, _logger.log)('reporting:renderHeader', error.message || error);
      return Promise.reject(error);
    }
  }
  /**
   * This build the agents table
   * @param {Array<Strings>} ids ids of agents
   * @param {String} apiId API id
   */


  async buildAgentsTable(context, printer, agentIDs, apiId, multi = false) {
    if (!agentIDs || !agentIDs.length) return;
    (0, _logger.log)('reporting:buildAgentsTable', `${agentIDs.length} agents for API ${apiId}`, 'info');

    try {
      let agentRows = [];

      if (multi) {
        try {
          const agentsResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/groups/${multi}/agents`, {}, {
            apiHostID: apiId
          });
          const agentsData = agentsResponse && agentsResponse.data && agentsResponse.data.data && agentsResponse.data.data.affected_items;
          agentRows = (agentsData || []).map(agent => ({ ...agent,
            manager: agent.manager || agent.manager_host,
            os: agent.os && agent.os.name && agent.os.version ? `${agent.os.name} ${agent.os.version}` : ''
          }));
        } catch (error) {
          (0, _logger.log)('reporting:buildAgentsTable', `Skip agent due to: ${error.message || error}`, 'debug');
        }
      } else {
        for (const agentID of agentIDs) {
          try {
            const agentResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/agents`, {
              params: {
                q: `id=${agentID}`
              }
            }, {
              apiHostID: apiId
            });
            const [agent] = agentResponse.data.data.affected_items;
            agentRows.push({ ...agent,
              manager: agent.manager || agent.manager_host,
              os: agent.os && agent.os.name && agent.os.version ? `${agent.os.name} ${agent.os.version}` : ''
            });
          } catch (error) {
            (0, _logger.log)('reporting:buildAgentsTable', `Skip agent due to: ${error.message || error}`, 'debug');
          }
        }
      }

      printer.addSimpleTable({
        columns: [{
          id: 'id',
          label: 'ID'
        }, {
          id: 'name',
          label: '名称'
        }, {
          id: 'ip',
          label: 'IP'
        // }, {
        //   id: 'version',
        //   label: 'Version'
        }, {
          id: 'manager',
          label: '管理员'
        }, {
          id: 'os',
          label: '操作系统'
        }, {
          id: 'dateAdd',
          label: '注册日期'
        }, {
          id: 'lastKeepAlive',
          label: '上次连接时间'
        }],
        items: agentRows
      });
    } catch (error) {
      (0, _logger.log)('reporting:buildAgentsTable', error.message || error);
      return Promise.reject(error);
    }
  }
  /**
   * This load more information
   * @param {*} context Endpoint context
   * @param {*} printer printer instance
   * @param {String} section section target
   * @param {Object} tab tab target
   * @param {String} apiId ID of API
   * @param {Number} from Timestamp (ms) from
   * @param {Number} to Timestamp (ms) to
   * @param {String} filters E.g: cluster.name: wazuh AND rule.groups: vulnerability
   * @param {String} pattern
   * @param {Object} agent agent target
   * @returns {Object} Extended information
   */


  async extendedInformation(context, printer, section, tab, apiId, from, to, filters, pattern = _constants.WAZUH_ALERTS_PATTERN, agent = null) {
    try {
      (0, _logger.log)('reporting:extendedInformation', `Section ${section} and tab ${tab}, API is ${apiId}. From ${from} to ${to}. Filters ${filters}. Index pattern ${pattern}`, 'info');

      if (section === 'agents' && !agent) {
        throw new Error('Reporting for specific agent needs an agent ID in order to work properly');
      }

      const agents = await context.wazuh.api.client.asCurrentUser.request('GET', '/agents', {
        params: {
          limit: 1
        }
      }, {
        apiHostID: apiId
      });
      const totalAgents = agents.data.data.total_affected_items;

      if (section === 'overview' && tab === 'vuls') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching overview vulnerability detector metrics', 'debug');
        const vulnerabilitiesLevels = ['Low', 'Medium', 'High', 'Critical'];
        const vulnerabilitiesResponsesCount = (await Promise.all(vulnerabilitiesLevels.map(async vulnerabilitiesLevel => {
          try {
            const count = await VulnerabilityRequest.uniqueSeverityCount(context, from, to, vulnerabilitiesLevel, filters, pattern);
            return count ? `${count} of ${totalAgents} agents have ${vulnerabilitiesLevel.toLocaleLowerCase()} vulnerabilities.` : undefined;
          } catch (error) {}

          ;
        }))).filter(vulnerabilitiesResponse => vulnerabilitiesResponse);
        printer.addList({
          title: {
            text: 'Summary',
            style: 'h2'
          },
          list: vulnerabilitiesResponsesCount
        });
        (0, _logger.log)('reporting:extendedInformation', 'Fetching overview vulnerability detector top 3 agents by category', 'debug');
        const lowRank = await VulnerabilityRequest.topAgentCount(context, from, to, 'Low', filters, pattern);
        const mediumRank = await VulnerabilityRequest.topAgentCount(context, from, to, 'Medium', filters, pattern);
        const highRank = await VulnerabilityRequest.topAgentCount(context, from, to, 'High', filters, pattern);
        const criticalRank = await VulnerabilityRequest.topAgentCount(context, from, to, 'Critical', filters, pattern);
        (0, _logger.log)('reporting:extendedInformation', 'Adding overview vulnerability detector top 3 agents by category', 'debug');

        if (criticalRank && criticalRank.length) {
          printer.addContentWithNewLine({
            text: 'Top 3 agents with critical severity vulnerabilities',
            style: 'h3'
          });
          await this.buildAgentsTable(context, printer, criticalRank, apiId);
          printer.addNewLine();
        }

        if (highRank && highRank.length) {
          printer.addContentWithNewLine({
            text: 'Top 3 agents with high severity vulnerabilities',
            style: 'h3'
          });
          await this.buildAgentsTable(context, printer, highRank, apiId);
          printer.addNewLine();
        }

        if (mediumRank && mediumRank.length) {
          printer.addContentWithNewLine({
            text: 'Top 3 agents with medium severity vulnerabilities',
            style: 'h3'
          });
          await this.buildAgentsTable(context, printer, mediumRank, apiId);
          printer.addNewLine();
        }

        if (lowRank && lowRank.length) {
          printer.addContentWithNewLine({
            text: 'Top 3 agents with low severity vulnerabilities',
            style: 'h3'
          });
          await this.buildAgentsTable(context, printer, lowRank, apiId);
          printer.addNewLine();
        }

        (0, _logger.log)('reporting:extendedInformation', 'Fetching overview vulnerability detector top 3 CVEs', 'debug');
        const cveRank = await VulnerabilityRequest.topCVECount(context, from, to, filters, pattern);
        (0, _logger.log)('reporting:extendedInformation', 'Adding overview vulnerability detector top 3 CVEs', 'debug');

        if (cveRank && cveRank.length) {
          printer.addSimpleTable({
            title: {
              text: 'Top 3 CVE',
              style: 'h2'
            },
            columns: [{
              id: 'top',
              label: 'Top'
            }, {
              id: 'cve',
              label: 'CVE'
            }],
            items: cveRank.map(item => ({
              top: cveRank.indexOf(item) + 1,
              cve: item
            }))
          });
        }
      }

      if (section === 'overview' && tab === 'general') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching top 3 agents with level 15 alerts', 'debug');
        const level15Rank = await OverviewRequest.topLevel15(context, from, to, filters, pattern);
        (0, _logger.log)('reporting:extendedInformation', 'Adding top 3 agents with level 15 alerts', 'debug');

        if (level15Rank.length) {
          printer.addContent({
            text: 'Top 3 agents with level 15 alerts',
            style: 'h2'
          });
          await this.buildAgentsTable(context, printer, level15Rank, apiId);
        }
      }

      if (section === 'overview' && tab === 'pm') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching most common rootkits', 'debug');
        const top5RootkitsRank = await RootcheckRequest.top5RootkitsDetected(context, from, to, filters, pattern);
        (0, _logger.log)('reporting:extendedInformation', 'Adding most common rootkits', 'debug');

        if (top5RootkitsRank && top5RootkitsRank.length) {
          printer.addContentWithNewLine({
            text: 'Most common rootkits found among your agents',
            style: 'h2'
          }).addContentWithNewLine({
            text: 'Rootkits are a set of software tools that enable an unauthorized user to gain control of a computer system without being detected.',
            style: 'standard'
          }).addSimpleTable({
            items: top5RootkitsRank.map(item => {
              return {
                top: top5RootkitsRank.indexOf(item) + 1,
                name: item
              };
            }),
            columns: [{
              id: 'top',
              label: 'Top'
            }, {
              id: 'name',
              label: 'Rootkit'
            }]
          });
        }

        (0, _logger.log)('reporting:extendedInformation', 'Fetching hidden pids', 'debug');
        const hiddenPids = await RootcheckRequest.agentsWithHiddenPids(context, from, to, filters, pattern);
        hiddenPids && printer.addContent({
          text: `${hiddenPids} of ${totalAgents} agents have hidden processes`,
          style: 'h3'
        });
        !hiddenPids && printer.addContentWithNewLine({
          text: `没有代理具有隐藏进程`,
          style: 'h3'
        });
        const hiddenPorts = await RootcheckRequest.agentsWithHiddenPorts(context, from, to, filters, pattern);
        hiddenPorts && printer.addContent({
          text: `${hiddenPorts} of ${totalAgents} agents have hidden ports`,
          style: 'h3'
        });
        !hiddenPorts && printer.addContent({
          text: `没有代理具有隐藏端口`,
          style: 'h3'
        });
        printer.addNewLine();
      }

      if (['overview', 'agents'].includes(section) && tab === 'pci') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching top PCI DSS requirements', 'debug');
        const topPciRequirements = await PCIRequest.topPCIRequirements(context, from, to, filters, pattern);
        printer.addContentWithNewLine({
          text: 'Most common PCI DSS requirements alerts found',
          style: 'h2'
        });

        for (const item of topPciRequirements) {
          const rules = await PCIRequest.getRulesByRequirement(context, from, to, filters, item, pattern);
          printer.addContentWithNewLine({
            text: `Requirement ${item}`,
            style: 'h3'
          });

          if (_pciRequirementsPdfmake.default[item]) {
            const content = typeof _pciRequirementsPdfmake.default[item] === 'string' ? {
              text: _pciRequirementsPdfmake.default[item],
              style: 'standard'
            } : _pciRequirementsPdfmake.default[item];
            printer.addContentWithNewLine(content);
          }

          rules && rules.length && printer.addSimpleTable({
            columns: [{
              id: 'ruleId',
              label: 'Rule ID'
            }, {
              id: 'ruleDescription',
              label: 'Description'
            }],
            items: rules,
            title: `Top rules for ${item} requirement`
          });
        }
      }

      if (['overview', 'agents'].includes(section) && tab === 'tsc') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching top TSC requirements', 'debug');
        const topTSCRequirements = await TSCRequest.topTSCRequirements(context, from, to, filters, pattern);
        printer.addContentWithNewLine({
          text: 'Most common TSC requirements alerts found',
          style: 'h2'
        });

        for (const item of topTSCRequirements) {
          const rules = await TSCRequest.getRulesByRequirement(context, from, to, filters, item, pattern);
          printer.addContentWithNewLine({
            text: `Requirement ${item}`,
            style: 'h3'
          });

          if (_tscRequirementsPdfmake.default[item]) {
            const content = typeof _tscRequirementsPdfmake.default[item] === 'string' ? {
              text: _tscRequirementsPdfmake.default[item],
              style: 'standard'
            } : _tscRequirementsPdfmake.default[item];
            printer.addContentWithNewLine(content);
          }

          rules && rules.length && printer.addSimpleTable({
            columns: [{
              id: 'ruleId',
              label: 'Rule ID'
            }, {
              id: 'ruleDescription',
              label: 'Description'
            }],
            items: rules,
            title: `Top rules for ${item} requirement`
          });
        }
      }

      if (['overview', 'agents'].includes(section) && tab === 'gdpr') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching top GDPR requirements', 'debug');
        const topGdprRequirements = await GDPRRequest.topGDPRRequirements(context, from, to, filters, pattern);
        printer.addContentWithNewLine({
          text: 'Most common GDPR requirements alerts found',
          style: 'h2'
        });

        for (const item of topGdprRequirements) {
          const rules = await GDPRRequest.getRulesByRequirement(context, from, to, filters, item, pattern);
          printer.addContentWithNewLine({
            text: `Requirement ${item}`,
            style: 'h3'
          });

          if (_gdprRequirementsPdfmake.default && _gdprRequirementsPdfmake.default[item]) {
            const content = typeof _gdprRequirementsPdfmake.default[item] === 'string' ? {
              text: _gdprRequirementsPdfmake.default[item],
              style: 'standard'
            } : _gdprRequirementsPdfmake.default[item];
            printer.addContentWithNewLine(content);
          }

          rules && rules.length && printer.addSimpleTable({
            columns: [{
              id: 'ruleId',
              label: 'Rule ID'
            }, {
              id: 'ruleDescription',
              label: 'Description'
            }],
            items: rules,
            title: `Top rules for ${item} requirement`
          });
        }

        printer.addNewLine();
      }

      if (section === 'overview' && tab === 'audit') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching agents with high number of failed sudo commands', 'debug');
        const auditAgentsNonSuccess = await AuditRequest.getTop3AgentsSudoNonSuccessful(context, from, to, filters, pattern);

        if (auditAgentsNonSuccess && auditAgentsNonSuccess.length) {
          printer.addContent({
            text: 'Agents with high number of failed sudo commands',
            style: 'h2'
          });
          await this.buildAgentsTable(context, printer, auditAgentsNonSuccess, apiId);
        }

        const auditAgentsFailedSyscall = await AuditRequest.getTop3AgentsFailedSyscalls(context, from, to, filters, pattern);

        if (auditAgentsFailedSyscall && auditAgentsFailedSyscall.length) {
          printer.addSimpleTable({
            columns: [{
              id: 'agent',
              label: 'Agent ID'
            }, {
              id: 'syscall_id',
              label: 'Syscall ID'
            }, {
              id: 'syscall_syscall',
              label: 'Syscall'
            }],
            items: auditAgentsFailedSyscall.map(item => ({
              agent: item.agent,
              syscall_id: item.syscall.id,
              syscall_syscall: item.syscall.syscall
            })),
            title: {
              text: 'Most common failing syscalls',
              style: 'h2'
            }
          });
        }
      }

      if (section === 'overview' && tab === 'fim') {
        (0, _logger.log)('reporting:extendedInformation', 'Fetching top 3 rules for FIM', 'debug');
        const rules = await SyscheckRequest.top3Rules(context, from, to, filters, pattern);

        if (rules && rules.length) {
          printer.addContentWithNewLine({
            text: 'Top 3 FIM rules',
            style: 'h2'
          }).addSimpleTable({
            columns: [{
              id: 'ruleId',
              label: 'Rule ID'
            }, {
              id: 'ruleDescription',
              label: 'Description'
            }],
            items: rules,
            title: {
              text: 'Top 3 rules that are generating most alerts.',
              style: 'standard'
            }
          });
        }

        (0, _logger.log)('reporting:extendedInformation', 'Fetching top 3 agents for FIM', 'debug');
        const agents = await SyscheckRequest.top3agents(context, from, to, filters, pattern);

        if (agents && agents.length) {
          printer.addContentWithNewLine({
            text: 'Agents with suspicious FIM activity',
            style: 'h2'
          });
          printer.addContentWithNewLine({
            text: 'Top 3 agents that have most FIM alerts from level 7 to level 15. Take care about them.',
            style: 'standard'
          });
          await this.buildAgentsTable(context, printer, agents, apiId);
        }
      }

      if (section === 'agents' && tab === 'audit') {
        (0, _logger.log)('reporting:extendedInformation', `Fetching most common failed syscalls`, 'debug');
        const auditFailedSyscall = await AuditRequest.getTopFailedSyscalls(context, from, to, filters, pattern);
        auditFailedSyscall && auditFailedSyscall.length && printer.addSimpleTable({
          columns: [{
            id: 'id',
            label: 'id'
          }, {
            id: 'syscall',
            label: 'Syscall'
          }],
          items: auditFailedSyscall,
          title: 'Most common failing syscalls'
        });
      }

      if (section === 'agents' && tab === 'fim') {
        (0, _logger.log)('reporting:extendedInformation', `Fetching syscheck database for agent ${agent}`, 'debug');
        const lastScanResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/syscheck/${agent}/last_scan`, {}, {
          apiHostID: apiId
        });

        if (lastScanResponse && lastScanResponse.data) {
          const lastScanData = lastScanResponse.data.data.affected_items[0];

          if (lastScanData.start && lastScanData.end) {
            printer.addContent({
              text: `Last file integrity monitoring scan was executed from ${lastScanData.start} to ${lastScanData.end}.`
            });
          } else if (lastScanData.start) {
            printer.addContent({
              text: `File integrity monitoring scan is currently in progress for this agent (started on ${lastScanData.start}).`
            });
          } else {
            printer.addContent({
              text: `File integrity monitoring scan is currently in progress for this agent.`
            });
          }

          printer.addNewLine();
        }

        (0, _logger.log)('reporting:extendedInformation', `Fetching last 10 deleted files for FIM`, 'debug');
        const lastTenDeleted = await SyscheckRequest.lastTenDeletedFiles(context, from, to, filters, pattern);
        lastTenDeleted && lastTenDeleted.length && printer.addSimpleTable({
          columns: [{
            id: 'path',
            label: 'Path'
          }, {
            id: 'date',
            label: 'Date'
          }],
          items: lastTenDeleted,
          title: 'Last 10 deleted files'
        });
        (0, _logger.log)('reporting:extendedInformation', `Fetching last 10 modified files`, 'debug');
        const lastTenModified = await SyscheckRequest.lastTenModifiedFiles(context, from, to, filters, pattern);
        lastTenModified && lastTenModified.length && printer.addSimpleTable({
          columns: [{
            id: 'path',
            label: 'Path'
          }, {
            id: 'date',
            label: 'Date'
          }],
          items: lastTenModified,
          title: 'Last 10 modified files'
        });
      }

      if (section === 'agents' && tab === 'syscollector') {
        (0, _logger.log)('reporting:extendedInformation', `Fetching hardware information for agent ${agent}`, 'debug');
        const requestsSyscollectorLists = [{
          endpoint: `/syscollector/${agent}/hardware`,
          loggerMessage: `Fetching Hardware information for agent ${agent}`,
          list: {
            title: {
              text: '硬件信息',
              style: 'h2'
            }
          },
          mapResponse: hardware => [hardware.cpu && hardware.cpu.cores && `${hardware.cpu.cores} 核`, hardware.cpu && hardware.cpu.name, hardware.ram && hardware.ram.total && `${Number(hardware.ram.total / 1024 / 1024).toFixed(2)}GB 内存`]
        }, {
          endpoint: `/syscollector/${agent}/os`,
          loggerMessage: `Fetching OS information for agent ${agent}`,
          list: {
            title: {
              text: '操作系统信息',
              style: 'h2'
            }
          },
          mapResponse: osData => [osData.sysname, osData.version, osData.architecture, osData.release, osData.os && osData.os.name && osData.os.version && `${osData.os.name} ${osData.os.version}`]
        }];
        const syscollectorLists = await Promise.all(requestsSyscollectorLists.map(async requestSyscollector => {
          try {
            (0, _logger.log)('reporting:extendedInformation', requestSyscollector.loggerMessage, 'debug');
            const responseSyscollector = await context.wazuh.api.client.asCurrentUser.request('GET', requestSyscollector.endpoint, {}, {
              apiHostID: apiId
            });
            const [data] = responseSyscollector && responseSyscollector.data && responseSyscollector.data.data && responseSyscollector.data.data.affected_items || [];

            if (data) {
              return { ...requestSyscollector.list,
                list: requestSyscollector.mapResponse(data)
              };
            }

            ;
          } catch (error) {
            (0, _logger.log)('reporting:extendedInformation', error.message || error);
          }
        }));

        if (syscollectorLists) {
          syscollectorLists.filter(syscollectorList => syscollectorList).forEach(syscollectorList => printer.addList(syscollectorList));
        }

        ;
        const vulnerabilitiesRequests = ['Critical', 'High'];
        const vulnerabilitiesResponsesItems = (await Promise.all(vulnerabilitiesRequests.map(async vulnerabilitiesLevel => {
          try {
            (0, _logger.log)('reporting:extendedInformation', `Fetching top ${vulnerabilitiesLevel} packages`, 'debug');
            return await VulnerabilityRequest.topPackages(context, from, to, vulnerabilitiesLevel, filters, pattern);
          } catch (error) {
            (0, _logger.log)('reporting:extendedInformation', error.message || error);
          }
        }))).filter(vulnerabilitiesResponse => vulnerabilitiesResponse).flat();

        if (vulnerabilitiesResponsesItems && vulnerabilitiesResponsesItems.length) {
          printer.addSimpleTable({
            title: {
              text: 'Vulnerable packages found (last 24 hours)',
              style: 'h2'
            },
            columns: [{
              id: 'package',
              label: 'Package'
            }, {
              id: 'severity',
              label: 'Severity'
            }],
            items: vulnerabilitiesResponsesItems
          });
        }
      }

      if (section === 'agents' && tab === 'vuls') {
        const topCriticalPackages = await VulnerabilityRequest.topPackagesWithCVE(context, from, to, 'Critical', filters, pattern);

        if (topCriticalPackages && topCriticalPackages.length) {
          printer.addContentWithNewLine({
            text: 'Critical severity',
            style: 'h2'
          });
          printer.addContentWithNewLine({
            text: 'These vulnerabilties are critical, please review your agent. Click on each link to read more about each found vulnerability.',
            style: 'standard'
          });
          const customul = [];

          for (const critical of topCriticalPackages) {
            customul.push({
              text: critical.package,
              style: 'standard'
            });
            customul.push({
              ul: critical.references.map(item => ({
                text: item.substring(0, 80) + '...',
                link: item,
                color: '#1EA5C8'
              }))
            });
          }

          printer.addContentWithNewLine({
            ul: customul
          });
        }

        const topHighPackages = await VulnerabilityRequest.topPackagesWithCVE(context, from, to, 'High', filters, pattern);

        if (topHighPackages && topHighPackages.length) {
          printer.addContentWithNewLine({
            text: 'High severity',
            style: 'h2'
          });
          printer.addContentWithNewLine({
            text: 'Click on each link to read more about each found vulnerability.',
            style: 'standard'
          });
          const customul = [];

          for (const critical of topHighPackages) {
            customul.push({
              text: critical.package,
              style: 'standard'
            });
            customul.push({
              ul: critical.references.map(item => ({
                text: item,
                color: '#1EA5C8'
              }))
            });
          }

          customul && customul.length && printer.addContent({
            ul: customul
          });
          printer.addNewLine();
        }
      }

      return false;
    } catch (error) {
      (0, _logger.log)('reporting:extendedInformation', error.message || error);
      return Promise.reject(error);
    }
  }

  getConfigRows(data, labels) {
    (0, _logger.log)('reporting:getConfigRows', `Building configuration rows`, 'info');
    const result = [];

    for (let prop in data || []) {
      if (Array.isArray(data[prop])) {
        data[prop].forEach((x, idx) => {
          if (typeof x === 'object') data[prop][idx] = JSON.stringify(x);
        });
      }

      result.push([(labels || {})[prop] || _csvKeyEquivalence.KeyEquivalence[prop] || prop, data[prop] || '-']);
    }

    return result;
  }

  getConfigTables(data, section, tab, array = []) {
    (0, _logger.log)('reporting:getConfigTables', `Building configuration tables`, 'info');
    let plainData = {};
    const nestedData = [];
    const tableData = [];

    if (data.length === 1 && Array.isArray(data)) {
      tableData[section.config[tab].configuration] = data;
    } else {
      for (let key in data) {
        if (typeof data[key] !== 'object' && !Array.isArray(data[key]) || Array.isArray(data[key]) && typeof data[key][0] !== 'object') {
          plainData[key] = Array.isArray(data[key]) && typeof data[key][0] !== 'object' ? data[key].map(x => {
            return typeof x === 'object' ? JSON.stringify(x) : x + '\n';
          }) : data[key];
        } else if (Array.isArray(data[key]) && typeof data[key][0] === 'object') {
          tableData[key] = data[key];
        } else {
          if (section.isGroupConfig && ['pack', 'content'].includes(key)) {
            tableData[key] = [data[key]];
          } else {
            nestedData.push(data[key]);
          }
        }
      }
    }

    array.push({
      title: (section.options || {}).hideHeader ? '' : (section.tabs || [])[tab] || (section.isGroupConfig ? ((section.labels || [])[0] || [])[tab] : ''),
      columns: ['', ''],
      type: 'config',
      rows: this.getConfigRows(plainData, (section.labels || [])[0])
    });

    for (let key in tableData) {
      const columns = Object.keys(tableData[key][0]);
      columns.forEach((col, i) => {
        columns[i] = col[0].toUpperCase() + col.slice(1);
      });
      const rows = tableData[key].map(x => {
        let row = [];

        for (let key in x) {
          row.push(typeof x[key] !== 'object' ? x[key] : Array.isArray(x[key]) ? x[key].map(x => {
            return x + '\n';
          }) : JSON.stringify(x[key]));
        }

        while (row.length < columns.length) {
          row.push('-');
        }

        return row;
      });
      array.push({
        title: ((section.labels || [])[0] || [])[key] || '',
        type: 'table',
        columns,
        rows
      });
    }

    nestedData.forEach(nest => {
      this.getConfigTables(nest, section, tab + 1, array);
    });
    return array;
  }
  /**
   * Create a report for the modules
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {*} reports list or ErrorResponse
   */


  async createReportsModules(context, request, response) {
    try {
      (0, _logger.log)('reporting:createReportsModules', `Report started`, 'info');
      const {
        array,
        agents,
        browserTimezone,
        searchBar,
        filters,
        time,
        tables,
        name,
        section
      } = request.body;
      const {
        moduleID
      } = request.params;
      const {
        id: apiId,
        pattern: indexPattern
      } = request.headers;
      const {
        from,
        to
      } = time || {}; // Init

      const printer = new _printer.ReportPrinter();
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);
      (0, _filesystem.createDataDirectoryIfNotExists)();
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID));
      await this.renderHeader(context, printer, section, moduleID, agents, apiId);
      const sanitizedFilters = filters ? this.sanitizeKibanaFilters(filters, searchBar) : false;

      if (time && sanitizedFilters) {
        printer.addTimeRangeAndFilters(from, to, sanitizedFilters, browserTimezone);
      }

      ;

      if (time) {
        await this.extendedInformation(context, printer, section, moduleID, apiId, new Date(from).getTime(), new Date(to).getTime(), sanitizedFilters, indexPattern, agents);
      }

      ;
      printer.addVisualizations(array, agents, moduleID);

      if (tables) {
        printer.addTables(tables);
      }

      ;
      await printer.print(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, name));
      return response.ok({
        body: {
          success: true,
          message: `Report ${name} was created`
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5029, 500, response);
    }
  }

  /**
   * Create a report for the groups
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {*} reports list or ErrorResponse
   */
  async createReportsGroups(context, request, response) {
    try {
      (0, _logger.log)('reporting:createReportsGroups', `Report started`, 'info');
      const {
        browserTimezone,
        searchBar,
        filters,
        time,
        name,
        components
      } = request.body;
      const {
        groupID
      } = request.params;
      const {
        id: apiId,
        pattern: indexPattern
      } = request.headers;
      const {
        from,
        to
      } = time || {}; // Init

      const printer = new _printer.ReportPrinter();
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);
      (0, _filesystem.createDataDirectoryIfNotExists)();
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID));
      let tables = [];
      const equivalences = {
        localfile: 'Local files',
        osquery: 'Osquery',
        command: 'Command',
        syscheck: 'Syscheck',
        'open-scap': 'OpenSCAP',
        'cis-cat': 'CIS-CAT',
        syscollector: 'Syscollector',
        rootcheck: 'Rootcheck',
        labels: 'Labels',
        sca: 'Security configuration assessment'
      };
      printer.addContent({
        text: `${groupID}分组配置`,
        style: 'h1'
      });

      if (components['0']) {
        let configuration = {};

        try {
          const configurationResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/groups/${groupID}/configuration`, {}, {
            apiHostID: apiId
          });
          configuration = configurationResponse.data.data;
        } catch (error) {
          (0, _logger.log)('reporting:createReportsGroups', error.message || error, 'debug');
        }

        ;

        if (configuration.affected_items.length > 0 && Object.keys(configuration.affected_items[0].config).length) {
          printer.addContent({
            text: 'Configurations',
            style: {
              fontSize: 14,
              color: '#000'
            },
            margin: [0, 10, 0, 15]
          });
          const section = {
            labels: [],
            isGroupConfig: true
          };

          for (let config of configuration.affected_items) {
            let filterTitle = '';
            let index = 0;

            for (let filter of Object.keys(config.filters)) {
              filterTitle = filterTitle.concat(`${filter}: ${config.filters[filter]}`);

              if (index < Object.keys(config.filters).length - 1) {
                filterTitle = filterTitle.concat(' | ');
              }

              index++;
            }

            printer.addContent({
              text: filterTitle,
              style: 'h4',
              margin: [0, 0, 0, 10]
            });
            let idx = 0;
            section.tabs = [];

            for (let _d of Object.keys(config.config)) {
              for (let c of _agentConfiguration.AgentConfiguration.configurations) {
                for (let s of c.sections) {
                  section.opts = s.opts || {};

                  for (let cn of s.config || []) {
                    if (cn.configuration === _d) {
                      section.labels = s.labels || [[]];
                    }
                  }

                  for (let wo of s.wodle || []) {
                    if (wo.name === _d) {
                      section.labels = s.labels || [[]];
                    }
                  }
                }
              }

              section.labels[0]['pack'] = 'Packs';
              section.labels[0]['content'] = 'Evaluations';
              section.labels[0]['7'] = 'Scan listening netwotk ports';
              section.tabs.push(equivalences[_d]);

              if (Array.isArray(config.config[_d])) {
                /* LOG COLLECTOR */
                if (_d === 'localfile') {
                  let groups = [];

                  config.config[_d].forEach(obj => {
                    if (!groups[obj.logformat]) {
                      groups[obj.logformat] = [];
                    }

                    groups[obj.logformat].push(obj);
                  });

                  Object.keys(groups).forEach(group => {
                    let saveidx = 0;
                    groups[group].forEach((x, i) => {
                      if (Object.keys(x).length > Object.keys(groups[group][saveidx]).length) {
                        saveidx = i;
                      }
                    });
                    const columns = Object.keys(groups[group][saveidx]);
                    const rows = groups[group].map(x => {
                      let row = [];
                      columns.forEach(key => {
                        row.push(typeof x[key] !== 'object' ? x[key] : Array.isArray(x[key]) ? x[key].map(x => {
                          return x + '\n';
                        }) : JSON.stringify(x[key]));
                      });
                      return row;
                    });
                    columns.forEach((col, i) => {
                      columns[i] = col[0].toUpperCase() + col.slice(1);
                    });
                    tables.push({
                      title: 'Local files',
                      type: 'table',
                      columns,
                      rows
                    });
                  });
                } else if (_d === 'labels') {
                  const obj = config.config[_d][0].label;
                  const columns = Object.keys(obj[0]);

                  if (!columns.includes('hidden')) {
                    columns.push('hidden');
                  }

                  const rows = obj.map(x => {
                    let row = [];
                    columns.forEach(key => {
                      row.push(x[key]);
                    });
                    return row;
                  });
                  columns.forEach((col, i) => {
                    columns[i] = col[0].toUpperCase() + col.slice(1);
                  });
                  tables.push({
                    title: 'Labels',
                    type: 'table',
                    columns,
                    rows
                  });
                } else {
                  for (let _d2 of config.config[_d]) {
                    tables.push(...this.getConfigTables(_d2, section, idx));
                  }
                }
              } else {
                /*INTEGRITY MONITORING MONITORED DIRECTORIES */
                if (config.config[_d].directories) {
                  const directories = config.config[_d].directories;
                  delete config.config[_d].directories;
                  tables.push(...this.getConfigTables(config.config[_d], section, idx));
                  let diffOpts = [];
                  Object.keys(section.opts).forEach(x => {
                    diffOpts.push(x);
                  });
                  const columns = ['', ...diffOpts.filter(x => x !== 'check_all' && x !== 'check_sum')];
                  let rows = [];
                  directories.forEach(x => {
                    let row = [];
                    row.push(x.path);
                    columns.forEach(y => {
                      if (y !== '') {
                        y = y !== 'check_whodata' ? y : 'whodata';
                        row.push(x[y] ? x[y] : 'no');
                      }
                    });
                    row.push(x.recursion_level);
                    rows.push(row);
                  });
                  columns.forEach((x, idx) => {
                    columns[idx] = section.opts[x];
                  });
                  columns.push('RL');
                  tables.push({
                    title: '监控目录',
                    type: 'table',
                    columns,
                    rows
                  });
                } else {
                  tables.push(...this.getConfigTables(config.config[_d], section, idx));
                }
              }

              for (const table of tables) {
                printer.addConfigTables([table]);
              }

              idx++;
              tables = [];
            }

            tables = [];
          }
        } else {
          printer.addContent({
            text: '该分组的配置还没有建立。',
            style: {
              fontSize: 12,
              color: '#000'
            },
            margin: [0, 10, 0, 15]
          });
        }
      }

      if (components['1']) {
        let agentsInGroup = [];

        try {
          const agentsInGroupResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/groups/${groupID}/agents`, {}, {
            apiHostID: apiId
          });
          agentsInGroup = agentsInGroupResponse.data.data.affected_items;
        } catch (error) {
          (0, _logger.log)('reporting:report', error.message || error, 'debug');
        }

        await this.renderHeader(context, printer, 'groupConfig', groupID, (agentsInGroup || []).map(x => x.id), apiId);
      }

      await printer.print(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, name));
      return response.ok({
        body: {
          success: true,
          message: `Report ${name} was created`
        }
      });
    } catch (error) {
      (0, _logger.log)('reporting:createReportsGroups', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5029, 500, response);
    }
  }

  /**
   * Create a report for the agents
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {*} reports list or ErrorResponse
   */
  async createReportsAgents(context, request, response) {
    try {
      (0, _logger.log)('reporting:createReportsAgents', `Report started`, 'info');
      const {
        browserTimezone,
        searchBar,
        filters,
        time,
        name,
        components
      } = request.body;
      const {
        agentID
      } = request.params;
      const {
        id: apiId
      } = request.headers;
      const {
        from,
        to
      } = time || {};
      const printer = new _printer.ReportPrinter();
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);
      (0, _filesystem.createDataDirectoryIfNotExists)();
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID));
      let wmodulesResponse = {};
      let tables = [];

      try {
        wmodulesResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/agents/${agentID}/config/wmodules/wmodules`, {}, {
          apiHostID: apiId
        });
      } catch (error) {
        (0, _logger.log)('reporting:report', error.message || error, 'debug');
      }

      await this.renderHeader(context, printer, 'agentConfig', 'agentConfig', agentID, apiId);
      let idxComponent = 0;

      for (let config of _agentConfiguration.AgentConfiguration.configurations) {
        let titleOfSection = false;
        (0, _logger.log)('reporting:createReportsAgents', `Iterate over ${config.sections.length} configuration sections`, 'debug');

        for (let section of config.sections) {
          if (components[idxComponent] && (section.config || section.wodle)) {
            let idx = 0;
            const configs = (section.config || []).concat(section.wodle || []);
            (0, _logger.log)('reporting:createReportsAgents', `Iterate over ${configs.length} configuration blocks`, 'debug');

            for (let conf of configs) {
              let agentConfigResponse = {};

              try {
                if (!conf['name']) {
                  agentConfigResponse = await context.wazuh.api.client.asCurrentUser.request('GET', `/agents/${agentID}/config/${conf.component}/${conf.configuration}`, {}, {
                    apiHostID: apiId
                  });
                } else {
                  for (let wodle of wmodulesResponse.data.data['wmodules']) {
                    if (Object.keys(wodle)[0] === conf['name']) {
                      agentConfigResponse.data = {
                        data: wodle
                      };
                    }

                    ;
                  }
                }

                const agentConfig = agentConfigResponse && agentConfigResponse.data && agentConfigResponse.data.data;

                if (!titleOfSection) {
                  printer.addContent({
                    text: config.title,
                    style: 'h1',
                    margin: [0, 0, 0, 15]
                  });
                  titleOfSection = true;
                }

                ;
                printer.addContent({
                  text: section.subtitle,
                  style: 'h4'
                });
                printer.addContent({
                  text: section.desc,
                  style: {
                    fontSize: 12,
                    color: '#000'
                  },
                  margin: [0, 0, 0, 10]
                });

                if (agentConfig) {
                  for (let agentConfigKey of Object.keys(agentConfig)) {
                    if (Array.isArray(agentConfig[agentConfigKey])) {
                      /* LOG COLLECTOR */
                      if (conf.filterBy) {
                        let groups = [];
                        agentConfig[agentConfigKey].forEach(obj => {
                          if (!groups[obj.logformat]) {
                            groups[obj.logformat] = [];
                          }

                          groups[obj.logformat].push(obj);
                        });
                        Object.keys(groups).forEach(group => {
                          let saveidx = 0;
                          groups[group].forEach((x, i) => {
                            if (Object.keys(x).length > Object.keys(groups[group][saveidx]).length) {
                              saveidx = i;
                            }
                          });
                          const columns = Object.keys(groups[group][saveidx]);
                          const rows = groups[group].map(x => {
                            let row = [];
                            columns.forEach(key => {
                              row.push(typeof x[key] !== 'object' ? x[key] : Array.isArray(x[key]) ? x[key].map(x => {
                                return x + '\n';
                              }) : JSON.stringify(x[key]));
                            });
                            return row;
                          });
                          columns.forEach((col, i) => {
                            columns[i] = col[0].toUpperCase() + col.slice(1);
                          });
                          tables.push({
                            title: section.labels[0][group],
                            type: 'table',
                            columns,
                            rows
                          });
                        });
                      } else if (agentConfigKey.configuration !== 'socket') {
                        tables.push(...this.getConfigTables(agentConfig[agentConfigKey], section, idx));
                      } else {
                        for (let _d2 of agentConfig[agentConfigKey]) {
                          tables.push(...this.getConfigTables(_d2, section, idx));
                        }
                      }
                    } else {
                      /*INTEGRITY MONITORING MONITORED DIRECTORIES */
                      if (conf.matrix) {
                        const directories = agentConfig[agentConfigKey].directories;
                        delete agentConfig[agentConfigKey].directories;
                        tables.push(...this.getConfigTables(agentConfig[agentConfigKey], section, idx));
                        let diffOpts = [];
                        Object.keys(section.opts).forEach(x => {
                          diffOpts.push(x);
                        });
                        const columns = ['', ...diffOpts.filter(x => x !== 'check_all' && x !== 'check_sum')];
                        let rows = [];
                        directories.forEach(x => {
                          let row = [];
                          row.push(x.dir);
                          columns.forEach(y => {
                            if (y !== '') {
                              row.push(x.opts.indexOf(y) > -1 ? 'yes' : 'no');
                            }
                          });
                          row.push(x.recursion_level);
                          rows.push(row);
                        });
                        columns.forEach((x, idx) => {
                          columns[idx] = section.opts[x];
                        });
                        columns.push('RL');
                        tables.push({
                          title: '监控目录',
                          type: 'table',
                          columns,
                          rows
                        });
                      } else {
                        tables.push(...this.getConfigTables(agentConfig[agentConfigKey], section, idx));
                      }
                    }
                  }
                } else {
                  // Print no configured module and link to the documentation
                  printer.addContent({
                    text: ['这个模块没有被配置。请看一下如何在', {
                      text: `${section.subtitle.toLowerCase()}配置`,
                      link: section.docuLink,
                      style: {
                        fontSize: 12,
                        color: '#1a0dab'
                      }
                    }, '中配置它。'],
                    margin: [0, 0, 0, 20]
                  });
                }
              } catch (error) {
                (0, _logger.log)('reporting:report', error.message || error, 'debug');
              }

              idx++;
            }

            for (const table of tables) {
              printer.addConfigTables([table]);
            }
          }

          idxComponent++;
          tables = [];
        }
      }

      await printer.print(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, name));
      return response.ok({
        body: {
          success: true,
          message: `Report ${name} was created`
        }
      });
    } catch (error) {
      (0, _logger.log)('reporting:createReportsAgents', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5029, 500, response);
    }
  }

  /**
   * Create a report for the agents
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {*} reports list or ErrorResponse
   */
  async createReportsAgentsInventory(context, request, response) {
    try {
      (0, _logger.log)('reporting:createReportsAgentsInventory', `Report started`, 'info');
      const {
        browserTimezone,
        searchBar,
        filters,
        time,
        name
      } = request.body;
      const {
        agentID
      } = request.params;
      const {
        id: apiId,
        pattern: indexPattern
      } = request.headers;
      const {
        from,
        to
      } = time || {}; // Init

      const printer = new _printer.ReportPrinter();
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);
      (0, _filesystem.createDataDirectoryIfNotExists)();
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID));
      (0, _logger.log)('reporting:createReportsAgentsInventory', `Syscollector report`, 'debug');
      const sanitizedFilters = filters ? this.sanitizeKibanaFilters(filters, searchBar) : false; // Get the agent OS

      let agentOs = '';

      try {
        const agentResponse = await context.wazuh.api.client.asCurrentUser.request('GET', '/agents', {
          params: {
            q: `id=${agentID}`
          }
        }, {
          apiHostID: apiId
        });
        agentOs = agentResponse.data.data.affected_items[0].os.platform;
      } catch (error) {
        (0, _logger.log)('reporting:createReportsAgentsInventory', error.message || error, 'debug');
      } // Add title


      printer.addContentWithNewLine({
        text: '盘点数据报告',
        style: 'h1'
      }); // Add table with the agent info

      await this.buildAgentsTable(context, printer, [agentID], apiId); // Get syscollector packages and processes

      const agentRequestsInventory = [{
        endpoint: `/syscollector/${agentID}/packages`,
        loggerMessage: `Fetching packages for agent ${agentID}`,
        table: {
          title: '程序包',
          columns: agentOs === 'windows' ? [{
            id: 'name',
            label: '名称'
          }, {
            id: 'architecture',
            label: '体系结构'
          }, {
            id: 'version',
            label: '版本'
          }, {
            id: 'vendor',
            label: '供应商'
          }] : [{
            id: 'name',
            label: '名称'
          }, {
            id: 'architecture',
            label: '体系结构'
          }, {
            id: 'version',
            label: '版本'
          }, {
            id: 'vendor',
            label: '供应商'
          }, {
            id: 'description',
            label: '描述'
          }]
        }
      }, {
        endpoint: `/syscollector/${agentID}/processes`,
        loggerMessage: `Fetching processes for agent ${agentID}`,
        table: {
          title: '进程',
          columns: agentOs === 'windows' ? [{
            id: 'name',
            label: '名称'
          }, {
            id: 'cmd',
            label: 'CMD'
          }, {
            id: 'priority',
            label: '优先级'
          }, {
            id: 'nlwp',
            label: 'NLWP'
          }] : [{
            id: 'name',
            label: '名称'
          }, {
            id: 'euser',
            label: '有效用户'
          }, {
            id: 'nice',
            label: '优先级'
          }, {
            id: 'state',
            label: '状态'
          }]
        },
        mapResponseItems: item => agentOs === 'windows' ? item : { ...item,
          state: _processStateEquivalence.default[item.state]
        }
      }, {
        endpoint: `/syscollector/${agentID}/ports`,
        loggerMessage: `Fetching ports for agent ${agentID}`,
        table: {
          title: '端口',
          columns: agentOs === 'windows' ? [{
            id: 'local_ip',
            label: '本地IP'
          }, {
            id: 'local_port',
            label: '本地端口'
          }, {
            id: 'process',
            label: '程序'
          }, {
            id: 'state',
            label: '状态'
          }, {
            id: 'protocol',
            label: '协议'
          }] : [{
            id: 'local_ip',
            label: '本地IP'
          }, {
            id: 'local_port',
            label: '本地端口'
          }, {
            id: 'state',
            label: '状态'
          }, {
            id: 'protocol',
            label: '协议'
          }]
        },
        mapResponseItems: item => ({ ...item,
          local_ip: item.local.ip,
          local_port: item.local.port
        })
      }, {
        endpoint: `/syscollector/${agentID}/netiface`,
        loggerMessage: `Fetching netiface for agent ${agentID}`,
        table: {
          title: '网络接口',
          columns: [{
            id: 'name',
            label: '名称'
          }, {
            id: 'mac',
            label: 'MAC'
          }, {
            id: 'state',
            label: '状态'
          }, {
            id: 'mtu',
            label: 'MTU'
          }, {
            id: 'type',
            label: '类型'
          }]
        }
      }, {
        endpoint: `/syscollector/${agentID}/netaddr`,
        loggerMessage: `Fetching netaddr for agent ${agentID}`,
        table: {
          title: '网络设置',
          columns: [{
            id: 'iface',
            label: '网卡'
          }, {
            id: 'address',
            label: '地址'
          }, {
            id: 'netmask',
            label: '网络掩码'
          }, {
            id: 'proto',
            label: '协议'
          }, {
            id: 'broadcast',
            label: '广播地址'
          }]
        }
      }, {
        endpoint: `/syscollector/${agentID}/hotfixes`,
        loggerMessage: `Fetching hotfixes for agent ${agentID}`,
        table: {
          title: 'Windows更新',
          columns: [{
            id: 'hotfix',
            label: 'Update code'
          }]
        }
      }];

      const requestInventory = async agentRequestInventory => {
        try {
          (0, _logger.log)('reporting:createReportsAgentsInventory', agentRequestInventory.loggerMessage, 'debug');
          const inventoryResponse = await context.wazuh.api.client.asCurrentUser.request('GET', agentRequestInventory.endpoint, {}, {
            apiHostID: apiId
          });
          const inventory = inventoryResponse && inventoryResponse.data && inventoryResponse.data.data && inventoryResponse.data.data.affected_items;

          if (inventory) {
            return { ...agentRequestInventory.table,
              items: agentRequestInventory.mapResponseItems ? inventory.map(agentRequestInventory.mapResponseItems) : inventory
            };
          }

          ;
        } catch (error) {
          (0, _logger.log)('reporting:createReportsAgentsInventory', error.message || error, 'debug');
        }

        ;
      };

      if (time) {
        await this.extendedInformation(context, printer, 'agents', 'syscollector', apiId, from, to, sanitizedFilters + ' AND rule.groups: "vulnerability-detector"', indexPattern, agentID);
      }

      ; // Add inventory tables

      (await Promise.all(agentRequestsInventory.map(requestInventory))).filter(table => table).forEach(table => printer.addSimpleTable(table)); // Print the document

      await printer.print(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, name));
      return response.ok({
        body: {
          success: true,
          message: `Report ${name} was created`
        }
      });
    } catch (error) {
      (0, _logger.log)('reporting:createReportsAgents', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5029, 500, response);
    }
  }

  /**
   * Fetch the reports list
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} reports list or ErrorResponse
   */
  async getReports(context, request, response) {
    try {
      (0, _logger.log)('reporting:getReports', `Fetching created reports`, 'info');
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);
      (0, _filesystem.createDataDirectoryIfNotExists)();
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH);
      (0, _filesystem.createDirectoryIfNotExists)(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH);

      const userReportsDirectory = _path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID);

      (0, _filesystem.createDirectoryIfNotExists)(userReportsDirectory);
      (0, _logger.log)('reporting:getReports', `Directory: ${userReportsDirectory}`, 'debug');

      const sortReportsByDate = (a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0;

      const reports = _fs.default.readdirSync(userReportsDirectory).map(file => {
        const stats = _fs.default.statSync(userReportsDirectory + '/' + file); // Get the file creation time (bithtime). It returns the first value that is a truthy value of next file stats: birthtime, mtime, ctime and atime.
        // This solves some OSs can have the bithtimeMs equal to 0 and returns the date like 1970-01-01


        const birthTimeField = ['birthtime', 'mtime', 'ctime', 'atime'].find(time => stats[`${time}Ms`]);
        return {
          name: file,
          size: stats.size,
          date: stats[birthTimeField]
        };
      });

      (0, _logger.log)('reporting:getReports', `Using TimSort for sorting ${reports.length} items`, 'debug');
      TimSort.sort(reports, sortReportsByDate);
      (0, _logger.log)('reporting:getReports', `Total reports: ${reports.length}`, 'debug');
      return response.ok({
        body: {
          reports
        }
      });
    } catch (error) {
      (0, _logger.log)('reporting:getReports', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5031, 500, response);
    }
  }
  /**
   * Fetch specific report
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} report or ErrorResponse
   */


  async getReportByName(context, request, response) {
    try {
      (0, _logger.log)('reporting:getReportByName', `Getting ${request.params.name} report`, 'debug');
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);

      const reportFileBuffer = _fs.default.readFileSync(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, request.params.name));

      return response.ok({
        headers: {
          'Content-Type': 'application/pdf'
        },
        body: reportFileBuffer
      });
    } catch (error) {
      (0, _logger.log)('reporting:getReportByName', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5030, 500, response);
    }
  }
  /**
   * Delete specific report
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */


  async deleteReportByName(context, request, response) {
    try {
      (0, _logger.log)('reporting:deleteReportByName', `Deleting ${request.params.name} report`, 'debug');
      const {
        username: userID
      } = await context.wazuh.security.getCurrentUser(request, context);

      _fs.default.unlinkSync(_path.default.join(_constants.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH, userID, request.params.name));

      (0, _logger.log)('reporting:deleteReportByName', `${request.params.name} report was deleted`, 'info');
      return response.ok({
        body: {
          error: 0
        }
      });
    } catch (error) {
      (0, _logger.log)('reporting:deleteReportByName', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 5032, 500, response);
    }
  }

}

exports.WazuhReportingCtrl = WazuhReportingCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLXJlcG9ydGluZy50cyJdLCJuYW1lcyI6WyJXYXp1aFJlcG9ydGluZ0N0cmwiLCJjb25zdHJ1Y3RvciIsInNhbml0aXplS2liYW5hRmlsdGVycyIsImZpbHRlcnMiLCJzZWFyY2hCYXIiLCJsZW5ndGgiLCJzdHIiLCJsZW4iLCJpIiwibmVnYXRlIiwia2V5IiwidmFsdWUiLCJwYXJhbXMiLCJ0eXBlIiwibWV0YSIsImd0ZSIsImx0IiwicXVlcnkiLCJyZW5kZXJIZWFkZXIiLCJjb250ZXh0IiwicHJpbnRlciIsInNlY3Rpb24iLCJ0YWIiLCJpc0FnZW50cyIsImFwaUlkIiwiaW5jbHVkZXMiLCJhZGRDb250ZW50IiwidGV4dCIsIldBWlVIX01PRFVMRVMiLCJ0aXRsZSIsInN0eWxlIiwiZm9udFNpemUiLCJjb2xvciIsIm1hcmdpbiIsIk9iamVjdCIsImtleXMiLCJhZGROZXdMaW5lIiwiYnVpbGRBZ2VudHNUYWJsZSIsImFnZW50UmVzcG9uc2UiLCJ3YXp1aCIsImFwaSIsImNsaWVudCIsImFzQ3VycmVudFVzZXIiLCJyZXF1ZXN0IiwiYWdlbnRzX2xpc3QiLCJhcGlIb3N0SUQiLCJhZ2VudERhdGEiLCJkYXRhIiwiYWZmZWN0ZWRfaXRlbXMiLCJzdGF0dXMiLCJhZGRDb250ZW50V2l0aE5ld0xpbmUiLCJ0b0xvd2VyQ2FzZSIsImdyb3VwIiwiYWdlbnRHcm91cHMiLCJqb2luIiwiZGVzY3JpcHRpb24iLCJlcnJvciIsIm1lc3NhZ2UiLCJQcm9taXNlIiwicmVqZWN0IiwiYWdlbnRJRHMiLCJtdWx0aSIsImFnZW50Um93cyIsImFnZW50c1Jlc3BvbnNlIiwiYWdlbnRzRGF0YSIsIm1hcCIsImFnZW50IiwibWFuYWdlciIsIm1hbmFnZXJfaG9zdCIsIm9zIiwibmFtZSIsInZlcnNpb24iLCJhZ2VudElEIiwicSIsInB1c2giLCJhZGRTaW1wbGVUYWJsZSIsImNvbHVtbnMiLCJpZCIsImxhYmVsIiwiaXRlbXMiLCJleHRlbmRlZEluZm9ybWF0aW9uIiwiZnJvbSIsInRvIiwicGF0dGVybiIsIldBWlVIX0FMRVJUU19QQVRURVJOIiwiRXJyb3IiLCJhZ2VudHMiLCJsaW1pdCIsInRvdGFsQWdlbnRzIiwidG90YWxfYWZmZWN0ZWRfaXRlbXMiLCJ2dWxuZXJhYmlsaXRpZXNMZXZlbHMiLCJ2dWxuZXJhYmlsaXRpZXNSZXNwb25zZXNDb3VudCIsImFsbCIsInZ1bG5lcmFiaWxpdGllc0xldmVsIiwiY291bnQiLCJWdWxuZXJhYmlsaXR5UmVxdWVzdCIsInVuaXF1ZVNldmVyaXR5Q291bnQiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsInVuZGVmaW5lZCIsImZpbHRlciIsInZ1bG5lcmFiaWxpdGllc1Jlc3BvbnNlIiwiYWRkTGlzdCIsImxpc3QiLCJsb3dSYW5rIiwidG9wQWdlbnRDb3VudCIsIm1lZGl1bVJhbmsiLCJoaWdoUmFuayIsImNyaXRpY2FsUmFuayIsImN2ZVJhbmsiLCJ0b3BDVkVDb3VudCIsIml0ZW0iLCJ0b3AiLCJpbmRleE9mIiwiY3ZlIiwibGV2ZWwxNVJhbmsiLCJPdmVydmlld1JlcXVlc3QiLCJ0b3BMZXZlbDE1IiwidG9wNVJvb3RraXRzUmFuayIsIlJvb3RjaGVja1JlcXVlc3QiLCJ0b3A1Um9vdGtpdHNEZXRlY3RlZCIsImhpZGRlblBpZHMiLCJhZ2VudHNXaXRoSGlkZGVuUGlkcyIsImhpZGRlblBvcnRzIiwiYWdlbnRzV2l0aEhpZGRlblBvcnRzIiwidG9wUGNpUmVxdWlyZW1lbnRzIiwiUENJUmVxdWVzdCIsInRvcFBDSVJlcXVpcmVtZW50cyIsInJ1bGVzIiwiZ2V0UnVsZXNCeVJlcXVpcmVtZW50IiwiUENJIiwiY29udGVudCIsInRvcFRTQ1JlcXVpcmVtZW50cyIsIlRTQ1JlcXVlc3QiLCJUU0MiLCJ0b3BHZHByUmVxdWlyZW1lbnRzIiwiR0RQUlJlcXVlc3QiLCJ0b3BHRFBSUmVxdWlyZW1lbnRzIiwiR0RQUiIsImF1ZGl0QWdlbnRzTm9uU3VjY2VzcyIsIkF1ZGl0UmVxdWVzdCIsImdldFRvcDNBZ2VudHNTdWRvTm9uU3VjY2Vzc2Z1bCIsImF1ZGl0QWdlbnRzRmFpbGVkU3lzY2FsbCIsImdldFRvcDNBZ2VudHNGYWlsZWRTeXNjYWxscyIsInN5c2NhbGxfaWQiLCJzeXNjYWxsIiwic3lzY2FsbF9zeXNjYWxsIiwiU3lzY2hlY2tSZXF1ZXN0IiwidG9wM1J1bGVzIiwidG9wM2FnZW50cyIsImF1ZGl0RmFpbGVkU3lzY2FsbCIsImdldFRvcEZhaWxlZFN5c2NhbGxzIiwibGFzdFNjYW5SZXNwb25zZSIsImxhc3RTY2FuRGF0YSIsInN0YXJ0IiwiZW5kIiwibGFzdFRlbkRlbGV0ZWQiLCJsYXN0VGVuRGVsZXRlZEZpbGVzIiwibGFzdFRlbk1vZGlmaWVkIiwibGFzdFRlbk1vZGlmaWVkRmlsZXMiLCJyZXF1ZXN0c1N5c2NvbGxlY3Rvckxpc3RzIiwiZW5kcG9pbnQiLCJsb2dnZXJNZXNzYWdlIiwibWFwUmVzcG9uc2UiLCJoYXJkd2FyZSIsImNwdSIsImNvcmVzIiwicmFtIiwidG90YWwiLCJOdW1iZXIiLCJ0b0ZpeGVkIiwib3NEYXRhIiwic3lzbmFtZSIsImFyY2hpdGVjdHVyZSIsInJlbGVhc2UiLCJzeXNjb2xsZWN0b3JMaXN0cyIsInJlcXVlc3RTeXNjb2xsZWN0b3IiLCJyZXNwb25zZVN5c2NvbGxlY3RvciIsInN5c2NvbGxlY3Rvckxpc3QiLCJmb3JFYWNoIiwidnVsbmVyYWJpbGl0aWVzUmVxdWVzdHMiLCJ2dWxuZXJhYmlsaXRpZXNSZXNwb25zZXNJdGVtcyIsInRvcFBhY2thZ2VzIiwiZmxhdCIsInRvcENyaXRpY2FsUGFja2FnZXMiLCJ0b3BQYWNrYWdlc1dpdGhDVkUiLCJjdXN0b211bCIsImNyaXRpY2FsIiwicGFja2FnZSIsInVsIiwicmVmZXJlbmNlcyIsInN1YnN0cmluZyIsImxpbmsiLCJ0b3BIaWdoUGFja2FnZXMiLCJnZXRDb25maWdSb3dzIiwibGFiZWxzIiwicmVzdWx0IiwicHJvcCIsIkFycmF5IiwiaXNBcnJheSIsIngiLCJpZHgiLCJKU09OIiwic3RyaW5naWZ5IiwiS2V5RXF1aXZhbGVuY2UiLCJnZXRDb25maWdUYWJsZXMiLCJhcnJheSIsInBsYWluRGF0YSIsIm5lc3RlZERhdGEiLCJ0YWJsZURhdGEiLCJjb25maWciLCJjb25maWd1cmF0aW9uIiwiaXNHcm91cENvbmZpZyIsIm9wdGlvbnMiLCJoaWRlSGVhZGVyIiwidGFicyIsInJvd3MiLCJjb2wiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicm93IiwibmVzdCIsImNyZWF0ZVJlcG9ydHNNb2R1bGVzIiwicmVzcG9uc2UiLCJicm93c2VyVGltZXpvbmUiLCJ0aW1lIiwidGFibGVzIiwiYm9keSIsIm1vZHVsZUlEIiwiaW5kZXhQYXR0ZXJuIiwiaGVhZGVycyIsIlJlcG9ydFByaW50ZXIiLCJ1c2VybmFtZSIsInVzZXJJRCIsInNlY3VyaXR5IiwiZ2V0Q3VycmVudFVzZXIiLCJXQVpVSF9EQVRBX0RPV05MT0FEU19ESVJFQ1RPUllfUEFUSCIsIldBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEgiLCJwYXRoIiwic2FuaXRpemVkRmlsdGVycyIsImFkZFRpbWVSYW5nZUFuZEZpbHRlcnMiLCJEYXRlIiwiZ2V0VGltZSIsImFkZFZpc3VhbGl6YXRpb25zIiwiYWRkVGFibGVzIiwicHJpbnQiLCJvayIsInN1Y2Nlc3MiLCJjcmVhdGVSZXBvcnRzR3JvdXBzIiwiY29tcG9uZW50cyIsImdyb3VwSUQiLCJlcXVpdmFsZW5jZXMiLCJsb2NhbGZpbGUiLCJvc3F1ZXJ5IiwiY29tbWFuZCIsInN5c2NoZWNrIiwic3lzY29sbGVjdG9yIiwicm9vdGNoZWNrIiwic2NhIiwiY29uZmlndXJhdGlvblJlc3BvbnNlIiwiZmlsdGVyVGl0bGUiLCJpbmRleCIsImNvbmNhdCIsIl9kIiwiYyIsIkFnZW50Q29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwicyIsInNlY3Rpb25zIiwib3B0cyIsImNuIiwid28iLCJ3b2RsZSIsImdyb3VwcyIsIm9iaiIsImxvZ2Zvcm1hdCIsInNhdmVpZHgiLCJfZDIiLCJkaXJlY3RvcmllcyIsImRpZmZPcHRzIiwieSIsInJlY3Vyc2lvbl9sZXZlbCIsInRhYmxlIiwiYWRkQ29uZmlnVGFibGVzIiwiYWdlbnRzSW5Hcm91cCIsImFnZW50c0luR3JvdXBSZXNwb25zZSIsImNyZWF0ZVJlcG9ydHNBZ2VudHMiLCJ3bW9kdWxlc1Jlc3BvbnNlIiwiaWR4Q29tcG9uZW50IiwidGl0bGVPZlNlY3Rpb24iLCJjb25maWdzIiwiY29uZiIsImFnZW50Q29uZmlnUmVzcG9uc2UiLCJjb21wb25lbnQiLCJhZ2VudENvbmZpZyIsInN1YnRpdGxlIiwiZGVzYyIsImFnZW50Q29uZmlnS2V5IiwiZmlsdGVyQnkiLCJtYXRyaXgiLCJkaXIiLCJkb2N1TGluayIsImNyZWF0ZVJlcG9ydHNBZ2VudHNJbnZlbnRvcnkiLCJhZ2VudE9zIiwicGxhdGZvcm0iLCJhZ2VudFJlcXVlc3RzSW52ZW50b3J5IiwibWFwUmVzcG9uc2VJdGVtcyIsInN0YXRlIiwiUHJvY2Vzc0VxdWl2YWxlbmNlIiwibG9jYWxfaXAiLCJsb2NhbCIsImlwIiwibG9jYWxfcG9ydCIsInBvcnQiLCJyZXF1ZXN0SW52ZW50b3J5IiwiYWdlbnRSZXF1ZXN0SW52ZW50b3J5IiwiaW52ZW50b3J5UmVzcG9uc2UiLCJpbnZlbnRvcnkiLCJnZXRSZXBvcnRzIiwidXNlclJlcG9ydHNEaXJlY3RvcnkiLCJzb3J0UmVwb3J0c0J5RGF0ZSIsImEiLCJiIiwiZGF0ZSIsInJlcG9ydHMiLCJmcyIsInJlYWRkaXJTeW5jIiwiZmlsZSIsInN0YXRzIiwic3RhdFN5bmMiLCJiaXJ0aFRpbWVGaWVsZCIsImZpbmQiLCJzaXplIiwiVGltU29ydCIsInNvcnQiLCJnZXRSZXBvcnRCeU5hbWUiLCJyZXBvcnRGaWxlQnVmZmVyIiwicmVhZEZpbGVTeW5jIiwiZGVsZXRlUmVwb3J0QnlOYW1lIiwidW5saW5rU3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7OztBQW5DQTs7Ozs7Ozs7Ozs7QUFzQ08sTUFBTUEsa0JBQU4sQ0FBeUI7QUFDOUJDLEVBQUFBLFdBQVcsR0FBRyxDQUFFO0FBRWhCOzs7Ozs7O0FBS1FDLEVBQUFBLHFCQUFSLENBQThCQyxPQUE5QixFQUE0Q0MsU0FBNUMsRUFBd0U7QUFDdEUscUJBQUksaUNBQUosRUFBd0MsNkJBQXhDLEVBQXNFLE1BQXRFO0FBQ0EscUJBQ0UsaUNBREYsRUFFRyxZQUFXRCxPQUFPLENBQUNFLE1BQU8sZ0JBQWVELFNBQVUsRUFGdEQsRUFHRSxPQUhGO0FBS0EsUUFBSUUsR0FBRyxHQUFHLEVBQVY7QUFFQSxVQUFNQyxHQUFHLEdBQUdKLE9BQU8sQ0FBQ0UsTUFBcEI7O0FBQ0EsU0FBSyxJQUFJRyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHRCxHQUFwQixFQUF5QkMsQ0FBQyxFQUExQixFQUE4QjtBQUM1QixZQUFNO0FBQUVDLFFBQUFBLE1BQUY7QUFBVUMsUUFBQUEsR0FBVjtBQUFlQyxRQUFBQSxLQUFmO0FBQXNCQyxRQUFBQSxNQUF0QjtBQUE4QkMsUUFBQUE7QUFBOUIsVUFBdUNWLE9BQU8sQ0FBQ0ssQ0FBRCxDQUFQLENBQVdNLElBQXhEO0FBQ0FSLE1BQUFBLEdBQUcsSUFBSyxHQUFFRyxNQUFNLEdBQUcsTUFBSCxHQUFZLEVBQUcsRUFBL0I7QUFDQUgsTUFBQUEsR0FBRyxJQUFLLEdBQUVJLEdBQUksSUFBZDtBQUNBSixNQUFBQSxHQUFHLElBQUssR0FDTk8sSUFBSSxLQUFLLE9BQVQsR0FDSyxHQUFFRCxNQUFNLENBQUNHLEdBQUksSUFBR0gsTUFBTSxDQUFDSSxFQUFHLEVBRC9CLEdBRUksQ0FBQyxDQUFDTCxLQUFGLEdBQ0FBLEtBREEsR0FFQSxDQUFDQyxNQUFNLElBQUksRUFBWCxFQUFlSyxLQUNwQixFQU5EO0FBT0FYLE1BQUFBLEdBQUcsSUFBSyxHQUFFRSxDQUFDLEtBQUtELEdBQUcsR0FBRyxDQUFaLEdBQWdCLEVBQWhCLEdBQXFCLE9BQVEsRUFBdkM7QUFDRDs7QUFFRCxRQUFJSCxTQUFKLEVBQWU7QUFDYkUsTUFBQUEsR0FBRyxJQUFJLFVBQVVGLFNBQWpCO0FBQ0Q7O0FBQ0QscUJBQUksaUNBQUosRUFBd0MsUUFBT0UsR0FBSSxFQUFuRCxFQUFzRCxPQUF0RDtBQUNBLFdBQU9BLEdBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7O0FBUUEsUUFBY1ksWUFBZCxDQUEyQkMsT0FBM0IsRUFBb0NDLE9BQXBDLEVBQTZDQyxPQUE3QyxFQUFzREMsR0FBdEQsRUFBMkRDLFFBQTNELEVBQXFFQyxLQUFyRSxFQUE0RTtBQUMxRSxRQUFJO0FBQ0YsdUJBQ0Usd0JBREYsRUFFRyxZQUFXSCxPQUFRLFVBQVNDLEdBQUksZUFBY0MsUUFBUyxZQUFXQyxLQUFNLEVBRjNFLEVBR0UsT0FIRjs7QUFLQSxVQUFJSCxPQUFPLElBQUksT0FBT0EsT0FBUCxLQUFtQixRQUFsQyxFQUE0QztBQUMxQyxZQUFJLENBQUMsQ0FBQyxhQUFELEVBQWUsYUFBZixFQUE4QkksUUFBOUIsQ0FBdUNKLE9BQXZDLENBQUwsRUFBc0Q7QUFDcERELFVBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsWUFBQUEsSUFBSSxFQUFFQyw0QkFBY04sR0FBZCxFQUFtQk8sS0FBbkIsR0FBMkIsU0FEaEI7QUFFakJDLFlBQUFBLEtBQUssRUFBRTtBQUZVLFdBQW5CO0FBSUQsU0FMRCxNQUtPLElBQUlULE9BQU8sS0FBSyxhQUFoQixFQUErQjtBQUNwQ0QsVUFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxZQUFBQSxJQUFJLEVBQUcsU0FBUUosUUFBUyxnQkFEUDtBQUVqQk8sWUFBQUEsS0FBSyxFQUFFO0FBRlUsV0FBbkI7QUFJRCxTQUxNLE1BS0EsSUFBSVQsT0FBTyxLQUFLLGFBQWhCLEVBQStCO0FBQ3BDRCxVQUFBQSxPQUFPLENBQUNNLFVBQVIsQ0FBbUI7QUFDakJDLFlBQUFBLElBQUksRUFBRSxpQkFEVztBQUVqQkcsWUFBQUEsS0FBSyxFQUFFO0FBQUVDLGNBQUFBLFFBQVEsRUFBRSxFQUFaO0FBQWdCQyxjQUFBQSxLQUFLLEVBQUU7QUFBdkIsYUFGVTtBQUdqQkMsWUFBQUEsTUFBTSxFQUFFLENBQUMsQ0FBRCxFQUFJLEVBQUosRUFBUSxDQUFSLEVBQVcsQ0FBWDtBQUhTLFdBQW5COztBQUtBLGNBQUlaLE9BQU8sS0FBSyxhQUFaLElBQTZCLENBQUNhLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZWixRQUFaLEVBQXNCbEIsTUFBeEQsRUFBZ0U7QUFDOURlLFlBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsY0FBQUEsSUFBSSxFQUFFLDBDQURXO0FBRWpCRyxjQUFBQSxLQUFLLEVBQUU7QUFBRUMsZ0JBQUFBLFFBQVEsRUFBRSxFQUFaO0FBQWdCQyxnQkFBQUEsS0FBSyxFQUFFO0FBQXZCLGVBRlU7QUFHakJDLGNBQUFBLE1BQU0sRUFBRSxDQUFDLENBQUQsRUFBSSxFQUFKLEVBQVEsQ0FBUixFQUFXLENBQVg7QUFIUyxhQUFuQjtBQUtEO0FBQ0Y7O0FBQ0RiLFFBQUFBLE9BQU8sQ0FBQ2dCLFVBQVI7QUFDRDs7QUFFRCxVQUFJYixRQUFRLElBQUksT0FBT0EsUUFBUCxLQUFvQixRQUFwQyxFQUE4QztBQUM1QyxjQUFNLEtBQUtjLGdCQUFMLENBQ0psQixPQURJLEVBRUpDLE9BRkksRUFHSkcsUUFISSxFQUlKQyxLQUpJLEVBS0pILE9BQU8sS0FBSyxhQUFaLEdBQTRCQyxHQUE1QixHQUFrQyxLQUw5QixDQUFOO0FBT0Q7O0FBRUQsVUFBSUMsUUFBUSxJQUFJLE9BQU9BLFFBQVAsS0FBb0IsUUFBcEMsRUFBOEM7QUFDNUMsY0FBTWUsYUFBYSxHQUFHLE1BQU1uQixPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDMUIsS0FEMEIsRUFFekIsU0FGeUIsRUFHMUI7QUFBRS9CLFVBQUFBLE1BQU0sRUFBRTtBQUFFZ0MsWUFBQUEsV0FBVyxFQUFFckI7QUFBZjtBQUFWLFNBSDBCLEVBSTFCO0FBQUNzQixVQUFBQSxTQUFTLEVBQUVyQjtBQUFaLFNBSjBCLENBQTVCO0FBTUEsY0FBTXNCLFNBQVMsR0FBR1IsYUFBYSxDQUFDUyxJQUFkLENBQW1CQSxJQUFuQixDQUF3QkMsY0FBeEIsQ0FBdUMsQ0FBdkMsQ0FBbEI7O0FBQ0EsWUFBSUYsU0FBUyxJQUFJQSxTQUFTLENBQUNHLE1BQVYsS0FBcUIsUUFBdEMsRUFBZ0Q7QUFDOUM3QixVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFlBQUFBLElBQUksRUFBRyxxQkFBb0JtQixTQUFTLENBQUNHLE1BQVYsQ0FBaUJFLFdBQWpCLEVBQStCLEVBRDlCO0FBRTVCckIsWUFBQUEsS0FBSyxFQUFFO0FBRnFCLFdBQTlCO0FBSUQ7O0FBQ0QsY0FBTSxLQUFLTyxnQkFBTCxDQUFzQmxCLE9BQXRCLEVBQStCQyxPQUEvQixFQUF3QyxDQUFDRyxRQUFELENBQXhDLEVBQW9EQyxLQUFwRCxDQUFOOztBQUVBLFlBQUlzQixTQUFTLElBQUlBLFNBQVMsQ0FBQ00sS0FBM0IsRUFBa0M7QUFDaEMsZ0JBQU1DLFdBQVcsR0FBR1AsU0FBUyxDQUFDTSxLQUFWLENBQWdCRSxJQUFoQixDQUFxQixJQUFyQixDQUFwQjtBQUNBbEMsVUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixZQUFBQSxJQUFJLEVBQUcsUUFBT21CLFNBQVMsQ0FBQ00sS0FBVixDQUFnQi9DLE1BQWhCLEdBQXlCLENBQXpCLEdBQTZCLEdBQTdCLEdBQW1DLEVBQUcsS0FBSWdELFdBQVksRUFEeEM7QUFFNUJ2QixZQUFBQSxLQUFLLEVBQUU7QUFGcUIsV0FBOUI7QUFJRDtBQUNGOztBQUNELFVBQUlGLDRCQUFjTixHQUFkLEtBQXNCTSw0QkFBY04sR0FBZCxFQUFtQmlDLFdBQTdDLEVBQTBEO0FBQ3hEbkMsUUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixVQUFBQSxJQUFJLEVBQUVDLDRCQUFjTixHQUFkLEVBQW1CaUMsV0FERztBQUU1QnpCLFVBQUFBLEtBQUssRUFBRTtBQUZxQixTQUE5QjtBQUlEOztBQUVEO0FBQ0QsS0E1RUQsQ0E0RUUsT0FBTzBCLEtBQVAsRUFBYztBQUNkLHVCQUFJLHdCQUFKLEVBQThCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9DO0FBQ0EsYUFBT0UsT0FBTyxDQUFDQyxNQUFSLENBQWVILEtBQWYsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7OztBQUtBLFFBQWNuQixnQkFBZCxDQUErQmxCLE9BQS9CLEVBQXdDQyxPQUF4QyxFQUFnRXdDLFFBQWhFLEVBQW9GcEMsS0FBcEYsRUFBbUdxQyxLQUFLLEdBQUcsS0FBM0csRUFBa0g7QUFDaEgsUUFBSSxDQUFDRCxRQUFELElBQWEsQ0FBQ0EsUUFBUSxDQUFDdkQsTUFBM0IsRUFBbUM7QUFDbkMscUJBQ0UsNEJBREYsRUFFRyxHQUFFdUQsUUFBUSxDQUFDdkQsTUFBTyxtQkFBa0JtQixLQUFNLEVBRjdDLEVBR0UsTUFIRjs7QUFLQSxRQUFJO0FBQ0YsVUFBSXNDLFNBQVMsR0FBRyxFQUFoQjs7QUFDQSxVQUFJRCxLQUFKLEVBQVc7QUFDVCxZQUFHO0FBQ0QsZ0JBQU1FLGNBQWMsR0FBRyxNQUFNNUMsT0FBTyxDQUFDb0IsS0FBUixDQUFjQyxHQUFkLENBQWtCQyxNQUFsQixDQUF5QkMsYUFBekIsQ0FBdUNDLE9BQXZDLENBQzNCLEtBRDJCLEVBRTFCLFdBQVVrQixLQUFNLFNBRlUsRUFHM0IsRUFIMkIsRUFJM0I7QUFBQ2hCLFlBQUFBLFNBQVMsRUFBRXJCO0FBQVosV0FKMkIsQ0FBN0I7QUFNQSxnQkFBTXdDLFVBQVUsR0FBR0QsY0FBYyxJQUFJQSxjQUFjLENBQUNoQixJQUFqQyxJQUF5Q2dCLGNBQWMsQ0FBQ2hCLElBQWYsQ0FBb0JBLElBQTdELElBQXFFZ0IsY0FBYyxDQUFDaEIsSUFBZixDQUFvQkEsSUFBcEIsQ0FBeUJDLGNBQWpIO0FBQ0FjLFVBQUFBLFNBQVMsR0FBRyxDQUFDRSxVQUFVLElBQUksRUFBZixFQUFtQkMsR0FBbkIsQ0FBdUJDLEtBQUssS0FBSyxFQUMzQyxHQUFHQSxLQUR3QztBQUUzQ0MsWUFBQUEsT0FBTyxFQUFFRCxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQUssQ0FBQ0UsWUFGVztBQUczQ0MsWUFBQUEsRUFBRSxFQUFHSCxLQUFLLENBQUNHLEVBQU4sSUFBWUgsS0FBSyxDQUFDRyxFQUFOLENBQVNDLElBQXJCLElBQTZCSixLQUFLLENBQUNHLEVBQU4sQ0FBU0UsT0FBdkMsR0FBbUQsR0FBRUwsS0FBSyxDQUFDRyxFQUFOLENBQVNDLElBQUssSUFBR0osS0FBSyxDQUFDRyxFQUFOLENBQVNFLE9BQVEsRUFBdkYsR0FBMkY7QUFIcEQsV0FBTCxDQUE1QixDQUFaO0FBTUQsU0FkRCxDQWNDLE9BQU1mLEtBQU4sRUFBWTtBQUNYLDJCQUNFLDRCQURGLEVBRUcsc0JBQXFCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFGL0MsRUFHRSxPQUhGO0FBS0Q7QUFFRixPQXZCRCxNQXVCTztBQUNMLGFBQUssTUFBTWdCLE9BQVgsSUFBc0JaLFFBQXRCLEVBQWdDO0FBQzlCLGNBQUk7QUFDRixrQkFBTXRCLGFBQWEsR0FBRyxNQUFNbkIsT0FBTyxDQUFDb0IsS0FBUixDQUFjQyxHQUFkLENBQWtCQyxNQUFsQixDQUF5QkMsYUFBekIsQ0FBdUNDLE9BQXZDLENBQzFCLEtBRDBCLEVBRXpCLFNBRnlCLEVBRzFCO0FBQUMvQixjQUFBQSxNQUFNLEVBQUU7QUFBQzZELGdCQUFBQSxDQUFDLEVBQUUsTUFBS0QsT0FBUTtBQUFqQjtBQUFULGFBSDBCLEVBSTFCO0FBQUMzQixjQUFBQSxTQUFTLEVBQUVyQjtBQUFaLGFBSjBCLENBQTVCO0FBTUEsa0JBQU0sQ0FBQzBDLEtBQUQsSUFBVTVCLGFBQWEsQ0FBQ1MsSUFBZCxDQUFtQkEsSUFBbkIsQ0FBd0JDLGNBQXhDO0FBQ0FjLFlBQUFBLFNBQVMsQ0FBQ1ksSUFBVixDQUFlLEVBQ2IsR0FBR1IsS0FEVTtBQUViQyxjQUFBQSxPQUFPLEVBQUVELEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBSyxDQUFDRSxZQUZuQjtBQUdiQyxjQUFBQSxFQUFFLEVBQUdILEtBQUssQ0FBQ0csRUFBTixJQUFZSCxLQUFLLENBQUNHLEVBQU4sQ0FBU0MsSUFBckIsSUFBNkJKLEtBQUssQ0FBQ0csRUFBTixDQUFTRSxPQUF2QyxHQUFtRCxHQUFFTCxLQUFLLENBQUNHLEVBQU4sQ0FBU0MsSUFBSyxJQUFHSixLQUFLLENBQUNHLEVBQU4sQ0FBU0UsT0FBUSxFQUF2RixHQUEyRjtBQUhsRixhQUFmO0FBS0QsV0FiRCxDQWFFLE9BQU9mLEtBQVAsRUFBYztBQUNkLDZCQUNFLDRCQURGLEVBRUcsc0JBQXFCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFGL0MsRUFHRSxPQUhGO0FBS0Q7QUFDRjtBQUNGOztBQUNEcEMsTUFBQUEsT0FBTyxDQUFDdUQsY0FBUixDQUF1QjtBQUNyQkMsUUFBQUEsT0FBTyxFQUFFLENBQ1A7QUFBQ0MsVUFBQUEsRUFBRSxFQUFFLElBQUw7QUFBV0MsVUFBQUEsS0FBSyxFQUFFO0FBQWxCLFNBRE8sRUFFUDtBQUFDRCxVQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxVQUFBQSxLQUFLLEVBQUU7QUFBcEIsU0FGTyxFQUdQO0FBQUNELFVBQUFBLEVBQUUsRUFBRSxJQUFMO0FBQVdDLFVBQUFBLEtBQUssRUFBRTtBQUFsQixTQUhPLEVBSVA7QUFBQ0QsVUFBQUEsRUFBRSxFQUFFLFNBQUw7QUFBZ0JDLFVBQUFBLEtBQUssRUFBRTtBQUF2QixTQUpPLEVBS1A7QUFBQ0QsVUFBQUEsRUFBRSxFQUFFLFNBQUw7QUFBZ0JDLFVBQUFBLEtBQUssRUFBRTtBQUF2QixTQUxPLEVBTVA7QUFBQ0QsVUFBQUEsRUFBRSxFQUFFLElBQUw7QUFBV0MsVUFBQUEsS0FBSyxFQUFFO0FBQWxCLFNBTk8sRUFPUDtBQUFDRCxVQUFBQSxFQUFFLEVBQUUsU0FBTDtBQUFnQkMsVUFBQUEsS0FBSyxFQUFFO0FBQXZCLFNBUE8sRUFRUDtBQUFDRCxVQUFBQSxFQUFFLEVBQUUsZUFBTDtBQUFzQkMsVUFBQUEsS0FBSyxFQUFFO0FBQTdCLFNBUk8sQ0FEWTtBQVdyQkMsUUFBQUEsS0FBSyxFQUFFakI7QUFYYyxPQUF2QjtBQWFELEtBOURELENBOERFLE9BQU9OLEtBQVAsRUFBYztBQUNkLHVCQUFJLDRCQUFKLEVBQWtDQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQW5EO0FBQ0EsYUFBT0UsT0FBTyxDQUFDQyxNQUFSLENBQWVILEtBQWYsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztBQWNBLFFBQWN3QixtQkFBZCxDQUNFN0QsT0FERixFQUVFQyxPQUZGLEVBR0VDLE9BSEYsRUFJRUMsR0FKRixFQUtFRSxLQUxGLEVBTUV5RCxJQU5GLEVBT0VDLEVBUEYsRUFRRS9FLE9BUkYsRUFTRWdGLE9BQU8sR0FBR0MsK0JBVFosRUFVRWxCLEtBQUssR0FBRyxJQVZWLEVBV0U7QUFDQSxRQUFJO0FBQ0YsdUJBQ0UsK0JBREYsRUFFRyxXQUFVN0MsT0FBUSxZQUFXQyxHQUFJLFlBQVdFLEtBQU0sVUFBU3lELElBQUssT0FBTUMsRUFBRyxhQUFZL0UsT0FBUSxtQkFBa0JnRixPQUFRLEVBRjFILEVBR0UsTUFIRjs7QUFLQSxVQUFJOUQsT0FBTyxLQUFLLFFBQVosSUFBd0IsQ0FBQzZDLEtBQTdCLEVBQW9DO0FBQ2xDLGNBQU0sSUFBSW1CLEtBQUosQ0FDSiwwRUFESSxDQUFOO0FBR0Q7O0FBRUQsWUFBTUMsTUFBTSxHQUFHLE1BQU1uRSxPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDbkIsS0FEbUIsRUFFbkIsU0FGbUIsRUFHbkI7QUFBRS9CLFFBQUFBLE1BQU0sRUFBRTtBQUFDMkUsVUFBQUEsS0FBSyxFQUFFO0FBQVI7QUFBVixPQUhtQixFQUluQjtBQUFDMUMsUUFBQUEsU0FBUyxFQUFFckI7QUFBWixPQUptQixDQUFyQjtBQU9BLFlBQU1nRSxXQUFXLEdBQUdGLE1BQU0sQ0FBQ3ZDLElBQVAsQ0FBWUEsSUFBWixDQUFpQjBDLG9CQUFyQzs7QUFFQSxVQUFJcEUsT0FBTyxLQUFLLFVBQVosSUFBMEJDLEdBQUcsS0FBSyxNQUF0QyxFQUE4QztBQUM1Qyx5QkFDRSwrQkFERixFQUVFLGtEQUZGLEVBR0UsT0FIRjtBQUtBLGNBQU1vRSxxQkFBcUIsR0FBRyxDQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE1BQWxCLEVBQTBCLFVBQTFCLENBQTlCO0FBRUEsY0FBTUMsNkJBQTZCLEdBQUcsQ0FBQyxNQUFNakMsT0FBTyxDQUFDa0MsR0FBUixDQUFZRixxQkFBcUIsQ0FBQ3pCLEdBQXRCLENBQTBCLE1BQU00QixvQkFBTixJQUE4QjtBQUMvRyxjQUFHO0FBQ0Qsa0JBQU1DLEtBQUssR0FBRyxNQUFNQyxvQkFBb0IsQ0FBQ0MsbUJBQXJCLENBQ2xCN0UsT0FEa0IsRUFFbEI4RCxJQUZrQixFQUdsQkMsRUFIa0IsRUFJbEJXLG9CQUprQixFQUtsQjFGLE9BTGtCLEVBTWxCZ0YsT0FOa0IsQ0FBcEI7QUFRQSxtQkFBT1csS0FBSyxHQUNQLEdBQUVBLEtBQU0sT0FBTU4sV0FBWSxnQkFBZUssb0JBQW9CLENBQUNJLGlCQUFyQixFQUF5QyxtQkFEM0UsR0FFUkMsU0FGSjtBQUdELFdBWkQsQ0FZQyxPQUFNMUMsS0FBTixFQUFZLENBRVo7O0FBQUE7QUFDRixTQWhCd0QsQ0FBWixDQUFQLEVBZ0JqQzJDLE1BaEJpQyxDQWdCMUJDLHVCQUF1QixJQUFJQSx1QkFoQkQsQ0FBdEM7QUFrQkFoRixRQUFBQSxPQUFPLENBQUNpRixPQUFSLENBQWdCO0FBQ2R4RSxVQUFBQSxLQUFLLEVBQUU7QUFBRUYsWUFBQUEsSUFBSSxFQUFFLFNBQVI7QUFBbUJHLFlBQUFBLEtBQUssRUFBRTtBQUExQixXQURPO0FBRWR3RSxVQUFBQSxJQUFJLEVBQUVYO0FBRlEsU0FBaEI7QUFLQSx5QkFDRSwrQkFERixFQUVFLG1FQUZGLEVBR0UsT0FIRjtBQUtBLGNBQU1ZLE9BQU8sR0FBRyxNQUFNUixvQkFBb0IsQ0FBQ1MsYUFBckIsQ0FDcEJyRixPQURvQixFQUVwQjhELElBRm9CLEVBR3BCQyxFQUhvQixFQUlwQixLQUpvQixFQUtwQi9FLE9BTG9CLEVBTXBCZ0YsT0FOb0IsQ0FBdEI7QUFRQSxjQUFNc0IsVUFBVSxHQUFHLE1BQU1WLG9CQUFvQixDQUFDUyxhQUFyQixDQUN2QnJGLE9BRHVCLEVBRXZCOEQsSUFGdUIsRUFHdkJDLEVBSHVCLEVBSXZCLFFBSnVCLEVBS3ZCL0UsT0FMdUIsRUFNdkJnRixPQU51QixDQUF6QjtBQVFBLGNBQU11QixRQUFRLEdBQUcsTUFBTVgsb0JBQW9CLENBQUNTLGFBQXJCLENBQ3JCckYsT0FEcUIsRUFFckI4RCxJQUZxQixFQUdyQkMsRUFIcUIsRUFJckIsTUFKcUIsRUFLckIvRSxPQUxxQixFQU1yQmdGLE9BTnFCLENBQXZCO0FBUUEsY0FBTXdCLFlBQVksR0FBRyxNQUFNWixvQkFBb0IsQ0FBQ1MsYUFBckIsQ0FDekJyRixPQUR5QixFQUV6QjhELElBRnlCLEVBR3pCQyxFQUh5QixFQUl6QixVQUp5QixFQUt6Qi9FLE9BTHlCLEVBTXpCZ0YsT0FOeUIsQ0FBM0I7QUFRQSx5QkFDRSwrQkFERixFQUVFLGlFQUZGLEVBR0UsT0FIRjs7QUFLQSxZQUFJd0IsWUFBWSxJQUFJQSxZQUFZLENBQUN0RyxNQUFqQyxFQUF5QztBQUN2Q2UsVUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixZQUFBQSxJQUFJLEVBQUUscURBRHNCO0FBRTVCRyxZQUFBQSxLQUFLLEVBQUU7QUFGcUIsV0FBOUI7QUFJQSxnQkFBTSxLQUFLTyxnQkFBTCxDQUFzQmxCLE9BQXRCLEVBQStCQyxPQUEvQixFQUF3Q3VGLFlBQXhDLEVBQXNEbkYsS0FBdEQsQ0FBTjtBQUNBSixVQUFBQSxPQUFPLENBQUNnQixVQUFSO0FBQ0Q7O0FBRUQsWUFBSXNFLFFBQVEsSUFBSUEsUUFBUSxDQUFDckcsTUFBekIsRUFBaUM7QUFDL0JlLFVBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQzVCdkIsWUFBQUEsSUFBSSxFQUFFLGlEQURzQjtBQUU1QkcsWUFBQUEsS0FBSyxFQUFFO0FBRnFCLFdBQTlCO0FBSUEsZ0JBQU0sS0FBS08sZ0JBQUwsQ0FBc0JsQixPQUF0QixFQUErQkMsT0FBL0IsRUFBd0NzRixRQUF4QyxFQUFrRGxGLEtBQWxELENBQU47QUFDQUosVUFBQUEsT0FBTyxDQUFDZ0IsVUFBUjtBQUNEOztBQUVELFlBQUlxRSxVQUFVLElBQUlBLFVBQVUsQ0FBQ3BHLE1BQTdCLEVBQXFDO0FBQ25DZSxVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFlBQUFBLElBQUksRUFBRSxtREFEc0I7QUFFNUJHLFlBQUFBLEtBQUssRUFBRTtBQUZxQixXQUE5QjtBQUlBLGdCQUFNLEtBQUtPLGdCQUFMLENBQXNCbEIsT0FBdEIsRUFBK0JDLE9BQS9CLEVBQXdDcUYsVUFBeEMsRUFBb0RqRixLQUFwRCxDQUFOO0FBQ0FKLFVBQUFBLE9BQU8sQ0FBQ2dCLFVBQVI7QUFDRDs7QUFFRCxZQUFJbUUsT0FBTyxJQUFJQSxPQUFPLENBQUNsRyxNQUF2QixFQUErQjtBQUM3QmUsVUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixZQUFBQSxJQUFJLEVBQUUsZ0RBRHNCO0FBRTVCRyxZQUFBQSxLQUFLLEVBQUU7QUFGcUIsV0FBOUI7QUFJQSxnQkFBTSxLQUFLTyxnQkFBTCxDQUFzQmxCLE9BQXRCLEVBQStCQyxPQUEvQixFQUF3Q21GLE9BQXhDLEVBQWlEL0UsS0FBakQsQ0FBTjtBQUNBSixVQUFBQSxPQUFPLENBQUNnQixVQUFSO0FBQ0Q7O0FBRUQseUJBQ0UsK0JBREYsRUFFRSxxREFGRixFQUdFLE9BSEY7QUFLQSxjQUFNd0UsT0FBTyxHQUFHLE1BQU1iLG9CQUFvQixDQUFDYyxXQUFyQixDQUNwQjFGLE9BRG9CLEVBRXBCOEQsSUFGb0IsRUFHcEJDLEVBSG9CLEVBSXBCL0UsT0FKb0IsRUFLcEJnRixPQUxvQixDQUF0QjtBQU9BLHlCQUNFLCtCQURGLEVBRUUsbURBRkYsRUFHRSxPQUhGOztBQUtBLFlBQUl5QixPQUFPLElBQUlBLE9BQU8sQ0FBQ3ZHLE1BQXZCLEVBQStCO0FBQzdCZSxVQUFBQSxPQUFPLENBQUN1RCxjQUFSLENBQXVCO0FBQ3JCOUMsWUFBQUEsS0FBSyxFQUFFO0FBQUVGLGNBQUFBLElBQUksRUFBRSxXQUFSO0FBQXFCRyxjQUFBQSxLQUFLLEVBQUU7QUFBNUIsYUFEYztBQUVyQjhDLFlBQUFBLE9BQU8sRUFBRSxDQUFDO0FBQUNDLGNBQUFBLEVBQUUsRUFBRSxLQUFMO0FBQVlDLGNBQUFBLEtBQUssRUFBRTtBQUFuQixhQUFELEVBQTRCO0FBQUNELGNBQUFBLEVBQUUsRUFBRSxLQUFMO0FBQVlDLGNBQUFBLEtBQUssRUFBRTtBQUFuQixhQUE1QixDQUZZO0FBR3JCQyxZQUFBQSxLQUFLLEVBQUU2QixPQUFPLENBQUMzQyxHQUFSLENBQVk2QyxJQUFJLEtBQUs7QUFBRUMsY0FBQUEsR0FBRyxFQUFFSCxPQUFPLENBQUNJLE9BQVIsQ0FBZ0JGLElBQWhCLElBQXdCLENBQS9CO0FBQWtDRyxjQUFBQSxHQUFHLEVBQUVIO0FBQXZDLGFBQUwsQ0FBaEI7QUFIYyxXQUF2QjtBQUtEO0FBQ0Y7O0FBRUQsVUFBSXpGLE9BQU8sS0FBSyxVQUFaLElBQTBCQyxHQUFHLEtBQUssU0FBdEMsRUFBaUQ7QUFDL0MseUJBQ0UsK0JBREYsRUFFRSw0Q0FGRixFQUdFLE9BSEY7QUFNQSxjQUFNNEYsV0FBVyxHQUFHLE1BQU1DLGVBQWUsQ0FBQ0MsVUFBaEIsQ0FDeEJqRyxPQUR3QixFQUV4QjhELElBRndCLEVBR3hCQyxFQUh3QixFQUl4Qi9FLE9BSndCLEVBS3hCZ0YsT0FMd0IsQ0FBMUI7QUFRQSx5QkFDRSwrQkFERixFQUVFLDBDQUZGLEVBR0UsT0FIRjs7QUFLQSxZQUFJK0IsV0FBVyxDQUFDN0csTUFBaEIsRUFBd0I7QUFDdEJlLFVBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsWUFBQUEsSUFBSSxFQUFFLG1DQURXO0FBRWpCRyxZQUFBQSxLQUFLLEVBQUU7QUFGVSxXQUFuQjtBQUlBLGdCQUFNLEtBQUtPLGdCQUFMLENBQXNCbEIsT0FBdEIsRUFBK0JDLE9BQS9CLEVBQXdDOEYsV0FBeEMsRUFBcUQxRixLQUFyRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxVQUFJSCxPQUFPLEtBQUssVUFBWixJQUEwQkMsR0FBRyxLQUFLLElBQXRDLEVBQTRDO0FBQzFDLHlCQUNFLCtCQURGLEVBRUUsK0JBRkYsRUFHRSxPQUhGO0FBS0EsY0FBTStGLGdCQUFnQixHQUFHLE1BQU1DLGdCQUFnQixDQUFDQyxvQkFBakIsQ0FDN0JwRyxPQUQ2QixFQUU3QjhELElBRjZCLEVBRzdCQyxFQUg2QixFQUk3Qi9FLE9BSjZCLEVBSzdCZ0YsT0FMNkIsQ0FBL0I7QUFPQSx5QkFDRSwrQkFERixFQUVFLDZCQUZGLEVBR0UsT0FIRjs7QUFLQSxZQUFJa0MsZ0JBQWdCLElBQUlBLGdCQUFnQixDQUFDaEgsTUFBekMsRUFBaUQ7QUFDL0NlLFVBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQzVCdkIsWUFBQUEsSUFBSSxFQUFFLDhDQURzQjtBQUU1QkcsWUFBQUEsS0FBSyxFQUFFO0FBRnFCLFdBQTlCLEVBSUNvQixxQkFKRCxDQUl1QjtBQUNyQnZCLFlBQUFBLElBQUksRUFDRixvSUFGbUI7QUFHckJHLFlBQUFBLEtBQUssRUFBRTtBQUhjLFdBSnZCLEVBU0M2QyxjQVRELENBU2dCO0FBQ2RJLFlBQUFBLEtBQUssRUFBRXNDLGdCQUFnQixDQUFDcEQsR0FBakIsQ0FBcUI2QyxJQUFJLElBQUk7QUFDbEMscUJBQU87QUFBRUMsZ0JBQUFBLEdBQUcsRUFBRU0sZ0JBQWdCLENBQUNMLE9BQWpCLENBQXlCRixJQUF6QixJQUFpQyxDQUF4QztBQUEyQ3hDLGdCQUFBQSxJQUFJLEVBQUV3QztBQUFqRCxlQUFQO0FBQ0QsYUFGTSxDQURPO0FBSWRsQyxZQUFBQSxPQUFPLEVBQUUsQ0FBQztBQUFDQyxjQUFBQSxFQUFFLEVBQUUsS0FBTDtBQUFZQyxjQUFBQSxLQUFLLEVBQUU7QUFBbkIsYUFBRCxFQUE0QjtBQUFDRCxjQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxjQUFBQSxLQUFLLEVBQUU7QUFBcEIsYUFBNUI7QUFKSyxXQVRoQjtBQWVEOztBQUNELHlCQUFJLCtCQUFKLEVBQXFDLHNCQUFyQyxFQUE2RCxPQUE3RDtBQUNBLGNBQU0wQyxVQUFVLEdBQUcsTUFBTUYsZ0JBQWdCLENBQUNHLG9CQUFqQixDQUN2QnRHLE9BRHVCLEVBRXZCOEQsSUFGdUIsRUFHdkJDLEVBSHVCLEVBSXZCL0UsT0FKdUIsRUFLdkJnRixPQUx1QixDQUF6QjtBQU9BcUMsUUFBQUEsVUFBVSxJQUNScEcsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxVQUFBQSxJQUFJLEVBQUcsR0FBRTZGLFVBQVcsT0FBTWhDLFdBQVksK0JBRHJCO0FBRWpCMUQsVUFBQUEsS0FBSyxFQUFFO0FBRlUsU0FBbkIsQ0FERjtBQUtBLFNBQUMwRixVQUFELElBQ0VwRyxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFVBQUFBLElBQUksRUFBRyxpQ0FEcUI7QUFFNUJHLFVBQUFBLEtBQUssRUFBRTtBQUZxQixTQUE5QixDQURGO0FBTUEsY0FBTTRGLFdBQVcsR0FBRyxNQUFNSixnQkFBZ0IsQ0FBQ0sscUJBQWpCLENBQ3hCeEcsT0FEd0IsRUFFeEI4RCxJQUZ3QixFQUd4QkMsRUFId0IsRUFJeEIvRSxPQUp3QixFQUt4QmdGLE9BTHdCLENBQTFCO0FBT0F1QyxRQUFBQSxXQUFXLElBQ1R0RyxPQUFPLENBQUNNLFVBQVIsQ0FBbUI7QUFDakJDLFVBQUFBLElBQUksRUFBRyxHQUFFK0YsV0FBWSxPQUFNbEMsV0FBWSwyQkFEdEI7QUFFakIxRCxVQUFBQSxLQUFLLEVBQUU7QUFGVSxTQUFuQixDQURGO0FBS0EsU0FBQzRGLFdBQUQsSUFDRXRHLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsVUFBQUEsSUFBSSxFQUFHLDZCQURVO0FBRWpCRyxVQUFBQSxLQUFLLEVBQUU7QUFGVSxTQUFuQixDQURGO0FBS0VWLFFBQUFBLE9BQU8sQ0FBQ2dCLFVBQVI7QUFDSDs7QUFFRCxVQUFJLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUJYLFFBQXZCLENBQWdDSixPQUFoQyxLQUE0Q0MsR0FBRyxLQUFLLEtBQXhELEVBQStEO0FBQzdELHlCQUNFLCtCQURGLEVBRUUsbUNBRkYsRUFHRSxPQUhGO0FBS0EsY0FBTXNHLGtCQUFrQixHQUFHLE1BQU1DLFVBQVUsQ0FBQ0Msa0JBQVgsQ0FDL0IzRyxPQUQrQixFQUUvQjhELElBRitCLEVBRy9CQyxFQUgrQixFQUkvQi9FLE9BSitCLEVBSy9CZ0YsT0FMK0IsQ0FBakM7QUFPQS9ELFFBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQzVCdkIsVUFBQUEsSUFBSSxFQUFFLCtDQURzQjtBQUU1QkcsVUFBQUEsS0FBSyxFQUFFO0FBRnFCLFNBQTlCOztBQUlBLGFBQUssTUFBTWdGLElBQVgsSUFBbUJjLGtCQUFuQixFQUF1QztBQUNyQyxnQkFBTUcsS0FBSyxHQUFHLE1BQU1GLFVBQVUsQ0FBQ0cscUJBQVgsQ0FDbEI3RyxPQURrQixFQUVsQjhELElBRmtCLEVBR2xCQyxFQUhrQixFQUlsQi9FLE9BSmtCLEVBS2xCMkcsSUFMa0IsRUFNbEIzQixPQU5rQixDQUFwQjtBQVFBL0QsVUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFBRXZCLFlBQUFBLElBQUksRUFBRyxlQUFjbUYsSUFBSyxFQUE1QjtBQUErQmhGLFlBQUFBLEtBQUssRUFBRTtBQUF0QyxXQUE5Qjs7QUFFQSxjQUFJbUcsZ0NBQUluQixJQUFKLENBQUosRUFBZTtBQUNiLGtCQUFNb0IsT0FBTyxHQUNYLE9BQU9ELGdDQUFJbkIsSUFBSixDQUFQLEtBQXFCLFFBQXJCLEdBQ0k7QUFBRW5GLGNBQUFBLElBQUksRUFBRXNHLGdDQUFJbkIsSUFBSixDQUFSO0FBQW1CaEYsY0FBQUEsS0FBSyxFQUFFO0FBQTFCLGFBREosR0FFSW1HLGdDQUFJbkIsSUFBSixDQUhOO0FBSUkxRixZQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QmdGLE9BQTlCO0FBQ0w7O0FBRURILFVBQUFBLEtBQUssSUFDSEEsS0FBSyxDQUFDMUgsTUFEUixJQUVFZSxPQUFPLENBQUN1RCxjQUFSLENBQXVCO0FBQ3JCQyxZQUFBQSxPQUFPLEVBQUUsQ0FBQztBQUFDQyxjQUFBQSxFQUFFLEVBQUUsUUFBTDtBQUFlQyxjQUFBQSxLQUFLLEVBQUU7QUFBdEIsYUFBRCxFQUFtQztBQUFDRCxjQUFBQSxFQUFFLEVBQUUsaUJBQUw7QUFBd0JDLGNBQUFBLEtBQUssRUFBRTtBQUEvQixhQUFuQyxDQURZO0FBRXJCQyxZQUFBQSxLQUFLLEVBQUVnRCxLQUZjO0FBR3JCbEcsWUFBQUEsS0FBSyxFQUFHLGlCQUFnQmlGLElBQUs7QUFIUixXQUF2QixDQUZGO0FBT0Q7QUFDRjs7QUFFRCxVQUFJLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUJyRixRQUF2QixDQUFnQ0osT0FBaEMsS0FBNENDLEdBQUcsS0FBSyxLQUF4RCxFQUErRDtBQUM3RCx5QkFDRSwrQkFERixFQUVFLCtCQUZGLEVBR0UsT0FIRjtBQUtBLGNBQU02RyxrQkFBa0IsR0FBRyxNQUFNQyxVQUFVLENBQUNELGtCQUFYLENBQy9CaEgsT0FEK0IsRUFFL0I4RCxJQUYrQixFQUcvQkMsRUFIK0IsRUFJL0IvRSxPQUorQixFQUsvQmdGLE9BTCtCLENBQWpDO0FBT0EvRCxRQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFVBQUFBLElBQUksRUFBRSwyQ0FEc0I7QUFFNUJHLFVBQUFBLEtBQUssRUFBRTtBQUZxQixTQUE5Qjs7QUFJQSxhQUFLLE1BQU1nRixJQUFYLElBQW1CcUIsa0JBQW5CLEVBQXVDO0FBQ3JDLGdCQUFNSixLQUFLLEdBQUcsTUFBTUssVUFBVSxDQUFDSixxQkFBWCxDQUNsQjdHLE9BRGtCLEVBRWxCOEQsSUFGa0IsRUFHbEJDLEVBSGtCLEVBSWxCL0UsT0FKa0IsRUFLbEIyRyxJQUxrQixFQU1sQjNCLE9BTmtCLENBQXBCO0FBUUEvRCxVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUFFdkIsWUFBQUEsSUFBSSxFQUFHLGVBQWNtRixJQUFLLEVBQTVCO0FBQStCaEYsWUFBQUEsS0FBSyxFQUFFO0FBQXRDLFdBQTlCOztBQUVBLGNBQUl1RyxnQ0FBSXZCLElBQUosQ0FBSixFQUFlO0FBQ2Isa0JBQU1vQixPQUFPLEdBQ1gsT0FBT0csZ0NBQUl2QixJQUFKLENBQVAsS0FBcUIsUUFBckIsR0FDSTtBQUFFbkYsY0FBQUEsSUFBSSxFQUFFMEcsZ0NBQUl2QixJQUFKLENBQVI7QUFBbUJoRixjQUFBQSxLQUFLLEVBQUU7QUFBMUIsYUFESixHQUVJdUcsZ0NBQUl2QixJQUFKLENBSE47QUFJRTFGLFlBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCZ0YsT0FBOUI7QUFDSDs7QUFFREgsVUFBQUEsS0FBSyxJQUNIQSxLQUFLLENBQUMxSCxNQURSLElBRUVlLE9BQU8sQ0FBQ3VELGNBQVIsQ0FBdUI7QUFDckJDLFlBQUFBLE9BQU8sRUFBRSxDQUFDO0FBQUNDLGNBQUFBLEVBQUUsRUFBRSxRQUFMO0FBQWVDLGNBQUFBLEtBQUssRUFBRTtBQUF0QixhQUFELEVBQW1DO0FBQUNELGNBQUFBLEVBQUUsRUFBRSxpQkFBTDtBQUF3QkMsY0FBQUEsS0FBSyxFQUFFO0FBQS9CLGFBQW5DLENBRFk7QUFFckJDLFlBQUFBLEtBQUssRUFBRWdELEtBRmM7QUFHckJsRyxZQUFBQSxLQUFLLEVBQUcsaUJBQWdCaUYsSUFBSztBQUhSLFdBQXZCLENBRkY7QUFPRDtBQUNGOztBQUVELFVBQUksQ0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QnJGLFFBQXZCLENBQWdDSixPQUFoQyxLQUE0Q0MsR0FBRyxLQUFLLE1BQXhELEVBQWdFO0FBQzlELHlCQUNFLCtCQURGLEVBRUUsZ0NBRkYsRUFHRSxPQUhGO0FBS0EsY0FBTWdILG1CQUFtQixHQUFHLE1BQU1DLFdBQVcsQ0FBQ0MsbUJBQVosQ0FDaENySCxPQURnQyxFQUVoQzhELElBRmdDLEVBR2hDQyxFQUhnQyxFQUloQy9FLE9BSmdDLEVBS2hDZ0YsT0FMZ0MsQ0FBbEM7QUFPQS9ELFFBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQzVCdkIsVUFBQUEsSUFBSSxFQUFFLDRDQURzQjtBQUU1QkcsVUFBQUEsS0FBSyxFQUFFO0FBRnFCLFNBQTlCOztBQUlBLGFBQUssTUFBTWdGLElBQVgsSUFBbUJ3QixtQkFBbkIsRUFBd0M7QUFDdEMsZ0JBQU1QLEtBQUssR0FBRyxNQUFNUSxXQUFXLENBQUNQLHFCQUFaLENBQ2xCN0csT0FEa0IsRUFFbEI4RCxJQUZrQixFQUdsQkMsRUFIa0IsRUFJbEIvRSxPQUprQixFQUtsQjJHLElBTGtCLEVBTWxCM0IsT0FOa0IsQ0FBcEI7QUFRQS9ELFVBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQUV2QixZQUFBQSxJQUFJLEVBQUcsZUFBY21GLElBQUssRUFBNUI7QUFBK0JoRixZQUFBQSxLQUFLLEVBQUU7QUFBdEMsV0FBOUI7O0FBRUEsY0FBSTJHLG9DQUFRQSxpQ0FBSzNCLElBQUwsQ0FBWixFQUF3QjtBQUN0QixrQkFBTW9CLE9BQU8sR0FDWCxPQUFPTyxpQ0FBSzNCLElBQUwsQ0FBUCxLQUFzQixRQUF0QixHQUNJO0FBQUVuRixjQUFBQSxJQUFJLEVBQUU4RyxpQ0FBSzNCLElBQUwsQ0FBUjtBQUFvQmhGLGNBQUFBLEtBQUssRUFBRTtBQUEzQixhQURKLEdBRUkyRyxpQ0FBSzNCLElBQUwsQ0FITjtBQUlBMUYsWUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEJnRixPQUE5QjtBQUNEOztBQUVESCxVQUFBQSxLQUFLLElBQ0hBLEtBQUssQ0FBQzFILE1BRFIsSUFFRWUsT0FBTyxDQUFDdUQsY0FBUixDQUF1QjtBQUNyQkMsWUFBQUEsT0FBTyxFQUFFLENBQUM7QUFBQ0MsY0FBQUEsRUFBRSxFQUFFLFFBQUw7QUFBZUMsY0FBQUEsS0FBSyxFQUFFO0FBQXRCLGFBQUQsRUFBbUM7QUFBQ0QsY0FBQUEsRUFBRSxFQUFFLGlCQUFMO0FBQXdCQyxjQUFBQSxLQUFLLEVBQUU7QUFBL0IsYUFBbkMsQ0FEWTtBQUVyQkMsWUFBQUEsS0FBSyxFQUFFZ0QsS0FGYztBQUdyQmxHLFlBQUFBLEtBQUssRUFBRyxpQkFBZ0JpRixJQUFLO0FBSFIsV0FBdkIsQ0FGRjtBQU9EOztBQUNEMUYsUUFBQUEsT0FBTyxDQUFDZ0IsVUFBUjtBQUNEOztBQUVELFVBQUlmLE9BQU8sS0FBSyxVQUFaLElBQTBCQyxHQUFHLEtBQUssT0FBdEMsRUFBK0M7QUFDN0MseUJBQ0UsK0JBREYsRUFFRSwwREFGRixFQUdFLE9BSEY7QUFLQSxjQUFNb0gscUJBQXFCLEdBQUcsTUFBTUMsWUFBWSxDQUFDQyw4QkFBYixDQUNsQ3pILE9BRGtDLEVBRWxDOEQsSUFGa0MsRUFHbENDLEVBSGtDLEVBSWxDL0UsT0FKa0MsRUFLbENnRixPQUxrQyxDQUFwQzs7QUFPQSxZQUFJdUQscUJBQXFCLElBQUlBLHFCQUFxQixDQUFDckksTUFBbkQsRUFBMkQ7QUFDekRlLFVBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsWUFBQUEsSUFBSSxFQUFFLGlEQURXO0FBRWpCRyxZQUFBQSxLQUFLLEVBQUU7QUFGVSxXQUFuQjtBQUlBLGdCQUFNLEtBQUtPLGdCQUFMLENBQXNCbEIsT0FBdEIsRUFBK0JDLE9BQS9CLEVBQXdDc0gscUJBQXhDLEVBQStEbEgsS0FBL0QsQ0FBTjtBQUNEOztBQUNELGNBQU1xSCx3QkFBd0IsR0FBRyxNQUFNRixZQUFZLENBQUNHLDJCQUFiLENBQ3JDM0gsT0FEcUMsRUFFckM4RCxJQUZxQyxFQUdyQ0MsRUFIcUMsRUFJckMvRSxPQUpxQyxFQUtyQ2dGLE9BTHFDLENBQXZDOztBQU9BLFlBQUkwRCx3QkFBd0IsSUFBSUEsd0JBQXdCLENBQUN4SSxNQUF6RCxFQUFpRTtBQUMvRGUsVUFBQUEsT0FBTyxDQUFDdUQsY0FBUixDQUF1QjtBQUNyQkMsWUFBQUEsT0FBTyxFQUFFLENBQUM7QUFBQ0MsY0FBQUEsRUFBRSxFQUFFLE9BQUw7QUFBY0MsY0FBQUEsS0FBSyxFQUFFO0FBQXJCLGFBQUQsRUFBbUM7QUFBQ0QsY0FBQUEsRUFBRSxFQUFFLFlBQUw7QUFBbUJDLGNBQUFBLEtBQUssRUFBRTtBQUExQixhQUFuQyxFQUE0RTtBQUFDRCxjQUFBQSxFQUFFLEVBQUUsaUJBQUw7QUFBd0JDLGNBQUFBLEtBQUssRUFBRTtBQUEvQixhQUE1RSxDQURZO0FBRXJCQyxZQUFBQSxLQUFLLEVBQUU4RCx3QkFBd0IsQ0FBQzVFLEdBQXpCLENBQTZCNkMsSUFBSSxLQUFLO0FBQUU1QyxjQUFBQSxLQUFLLEVBQUU0QyxJQUFJLENBQUM1QyxLQUFkO0FBQXFCNkUsY0FBQUEsVUFBVSxFQUFFakMsSUFBSSxDQUFDa0MsT0FBTCxDQUFhbkUsRUFBOUM7QUFBa0RvRSxjQUFBQSxlQUFlLEVBQUVuQyxJQUFJLENBQUNrQyxPQUFMLENBQWFBO0FBQWhGLGFBQUwsQ0FBakMsQ0FGYztBQUdyQm5ILFlBQUFBLEtBQUssRUFBRTtBQUNMRixjQUFBQSxJQUFJLEVBQUUsOEJBREQ7QUFFTEcsY0FBQUEsS0FBSyxFQUFFO0FBRkY7QUFIYyxXQUF2QjtBQVFEO0FBQ0Y7O0FBRUQsVUFBSVQsT0FBTyxLQUFLLFVBQVosSUFBMEJDLEdBQUcsS0FBSyxLQUF0QyxFQUE2QztBQUMzQyx5QkFDRSwrQkFERixFQUVFLDhCQUZGLEVBR0UsT0FIRjtBQUtBLGNBQU15RyxLQUFLLEdBQUcsTUFBTW1CLGVBQWUsQ0FBQ0MsU0FBaEIsQ0FDbEJoSSxPQURrQixFQUVsQjhELElBRmtCLEVBR2xCQyxFQUhrQixFQUlsQi9FLE9BSmtCLEVBS2xCZ0YsT0FMa0IsQ0FBcEI7O0FBUUEsWUFBSTRDLEtBQUssSUFBSUEsS0FBSyxDQUFDMUgsTUFBbkIsRUFBMkI7QUFDekJlLFVBQUFBLE9BQU8sQ0FDSjhCLHFCQURILENBQ3lCO0FBQUV2QixZQUFBQSxJQUFJLEVBQUUsaUJBQVI7QUFBMkJHLFlBQUFBLEtBQUssRUFBRTtBQUFsQyxXQUR6QixFQUVHNkMsY0FGSCxDQUVrQjtBQUNkQyxZQUFBQSxPQUFPLEVBQUUsQ0FBQztBQUFDQyxjQUFBQSxFQUFFLEVBQUUsUUFBTDtBQUFlQyxjQUFBQSxLQUFLLEVBQUU7QUFBdEIsYUFBRCxFQUFtQztBQUFDRCxjQUFBQSxFQUFFLEVBQUUsaUJBQUw7QUFBd0JDLGNBQUFBLEtBQUssRUFBRTtBQUEvQixhQUFuQyxDQURLO0FBRWRDLFlBQUFBLEtBQUssRUFBRWdELEtBRk87QUFHZGxHLFlBQUFBLEtBQUssRUFBRTtBQUNMRixjQUFBQSxJQUFJLEVBQUUsOENBREQ7QUFFTEcsY0FBQUEsS0FBSyxFQUFFO0FBRkY7QUFITyxXQUZsQjtBQVVEOztBQUVELHlCQUNFLCtCQURGLEVBRUUsK0JBRkYsRUFHRSxPQUhGO0FBS0EsY0FBTXdELE1BQU0sR0FBRyxNQUFNNEQsZUFBZSxDQUFDRSxVQUFoQixDQUNuQmpJLE9BRG1CLEVBRW5COEQsSUFGbUIsRUFHbkJDLEVBSG1CLEVBSW5CL0UsT0FKbUIsRUFLbkJnRixPQUxtQixDQUFyQjs7QUFRQSxZQUFJRyxNQUFNLElBQUlBLE1BQU0sQ0FBQ2pGLE1BQXJCLEVBQTZCO0FBQzNCZSxVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFlBQUFBLElBQUksRUFBRSxxQ0FEc0I7QUFFNUJHLFlBQUFBLEtBQUssRUFBRTtBQUZxQixXQUE5QjtBQUlBVixVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFlBQUFBLElBQUksRUFDRix3RkFGMEI7QUFHNUJHLFlBQUFBLEtBQUssRUFBRTtBQUhxQixXQUE5QjtBQUtBLGdCQUFNLEtBQUtPLGdCQUFMLENBQXNCbEIsT0FBdEIsRUFBK0JDLE9BQS9CLEVBQXdDa0UsTUFBeEMsRUFBZ0Q5RCxLQUFoRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxVQUFJSCxPQUFPLEtBQUssUUFBWixJQUF3QkMsR0FBRyxLQUFLLE9BQXBDLEVBQTZDO0FBQzNDLHlCQUNFLCtCQURGLEVBRUcsc0NBRkgsRUFHRSxPQUhGO0FBS0EsY0FBTStILGtCQUFrQixHQUFHLE1BQU1WLFlBQVksQ0FBQ1csb0JBQWIsQ0FDL0JuSSxPQUQrQixFQUUvQjhELElBRitCLEVBRy9CQyxFQUgrQixFQUkvQi9FLE9BSitCLEVBSy9CZ0YsT0FMK0IsQ0FBakM7QUFPQWtFLFFBQUFBLGtCQUFrQixJQUNoQkEsa0JBQWtCLENBQUNoSixNQURyQixJQUVFZSxPQUFPLENBQUN1RCxjQUFSLENBQXVCO0FBQ3JCQyxVQUFBQSxPQUFPLEVBQUUsQ0FBQztBQUFDQyxZQUFBQSxFQUFFLEVBQUUsSUFBTDtBQUFXQyxZQUFBQSxLQUFLLEVBQUU7QUFBbEIsV0FBRCxFQUEwQjtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsU0FBTDtBQUFnQkMsWUFBQUEsS0FBSyxFQUFFO0FBQXZCLFdBQTFCLENBRFk7QUFFckJDLFVBQUFBLEtBQUssRUFBRXNFLGtCQUZjO0FBR3JCeEgsVUFBQUEsS0FBSyxFQUFFO0FBSGMsU0FBdkIsQ0FGRjtBQU9EOztBQUVELFVBQUlSLE9BQU8sS0FBSyxRQUFaLElBQXdCQyxHQUFHLEtBQUssS0FBcEMsRUFBMkM7QUFDekMseUJBQ0UsK0JBREYsRUFFRyx3Q0FBdUM0QyxLQUFNLEVBRmhELEVBR0UsT0FIRjtBQU1BLGNBQU1xRixnQkFBZ0IsR0FBRyxNQUFNcEksT0FBTyxDQUFDb0IsS0FBUixDQUFjQyxHQUFkLENBQWtCQyxNQUFsQixDQUF5QkMsYUFBekIsQ0FBdUNDLE9BQXZDLENBQzdCLEtBRDZCLEVBRTVCLGFBQVl1QixLQUFNLFlBRlUsRUFHN0IsRUFINkIsRUFJN0I7QUFBQ3JCLFVBQUFBLFNBQVMsRUFBRXJCO0FBQVosU0FKNkIsQ0FBL0I7O0FBT0EsWUFBSStILGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQ3hHLElBQXpDLEVBQStDO0FBQzdDLGdCQUFNeUcsWUFBWSxHQUFHRCxnQkFBZ0IsQ0FBQ3hHLElBQWpCLENBQXNCQSxJQUF0QixDQUEyQkMsY0FBM0IsQ0FBMEMsQ0FBMUMsQ0FBckI7O0FBQ0EsY0FBSXdHLFlBQVksQ0FBQ0MsS0FBYixJQUFzQkQsWUFBWSxDQUFDRSxHQUF2QyxFQUE0QztBQUMxQ3RJLFlBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsY0FBQUEsSUFBSSxFQUFHLHlEQUF3RDZILFlBQVksQ0FBQ0MsS0FBTSxPQUFNRCxZQUFZLENBQUNFLEdBQUk7QUFEeEYsYUFBbkI7QUFHRCxXQUpELE1BSU8sSUFBSUYsWUFBWSxDQUFDQyxLQUFqQixFQUF3QjtBQUM3QnJJLFlBQUFBLE9BQU8sQ0FBQ00sVUFBUixDQUFtQjtBQUNqQkMsY0FBQUEsSUFBSSxFQUFHLHNGQUFxRjZILFlBQVksQ0FBQ0MsS0FBTTtBQUQ5RixhQUFuQjtBQUdELFdBSk0sTUFJQTtBQUNMckksWUFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxjQUFBQSxJQUFJLEVBQUc7QUFEVSxhQUFuQjtBQUdEOztBQUNEUCxVQUFBQSxPQUFPLENBQUNnQixVQUFSO0FBQ0Q7O0FBRUQseUJBQ0UsK0JBREYsRUFFRyx3Q0FGSCxFQUdFLE9BSEY7QUFLQSxjQUFNdUgsY0FBYyxHQUFHLE1BQU1ULGVBQWUsQ0FBQ1UsbUJBQWhCLENBQzNCekksT0FEMkIsRUFFM0I4RCxJQUYyQixFQUczQkMsRUFIMkIsRUFJM0IvRSxPQUoyQixFQUszQmdGLE9BTDJCLENBQTdCO0FBUUF3RSxRQUFBQSxjQUFjLElBQ1pBLGNBQWMsQ0FBQ3RKLE1BRGpCLElBRUVlLE9BQU8sQ0FBQ3VELGNBQVIsQ0FBdUI7QUFDckJDLFVBQUFBLE9BQU8sRUFBRSxDQUFDO0FBQUNDLFlBQUFBLEVBQUUsRUFBRSxNQUFMO0FBQWFDLFlBQUFBLEtBQUssRUFBRTtBQUFwQixXQUFELEVBQThCO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxNQUFMO0FBQWFDLFlBQUFBLEtBQUssRUFBRTtBQUFwQixXQUE5QixDQURZO0FBRXJCQyxVQUFBQSxLQUFLLEVBQUU0RSxjQUZjO0FBR3JCOUgsVUFBQUEsS0FBSyxFQUFFO0FBSGMsU0FBdkIsQ0FGRjtBQVFBLHlCQUNFLCtCQURGLEVBRUcsaUNBRkgsRUFHRSxPQUhGO0FBS0EsY0FBTWdJLGVBQWUsR0FBRyxNQUFNWCxlQUFlLENBQUNZLG9CQUFoQixDQUM1QjNJLE9BRDRCLEVBRTVCOEQsSUFGNEIsRUFHNUJDLEVBSDRCLEVBSTVCL0UsT0FKNEIsRUFLNUJnRixPQUw0QixDQUE5QjtBQVFBMEUsUUFBQUEsZUFBZSxJQUNiQSxlQUFlLENBQUN4SixNQURsQixJQUVFZSxPQUFPLENBQUN1RCxjQUFSLENBQXVCO0FBQ3JCQyxVQUFBQSxPQUFPLEVBQUUsQ0FBQztBQUFDQyxZQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxZQUFBQSxLQUFLLEVBQUU7QUFBcEIsV0FBRCxFQUE4QjtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxZQUFBQSxLQUFLLEVBQUU7QUFBcEIsV0FBOUIsQ0FEWTtBQUVyQkMsVUFBQUEsS0FBSyxFQUFFOEUsZUFGYztBQUdyQmhJLFVBQUFBLEtBQUssRUFBRTtBQUhjLFNBQXZCLENBRkY7QUFPRDs7QUFFRCxVQUFJUixPQUFPLEtBQUssUUFBWixJQUF3QkMsR0FBRyxLQUFLLGNBQXBDLEVBQW9EO0FBQ2xELHlCQUNFLCtCQURGLEVBRUcsMkNBQTBDNEMsS0FBTSxFQUZuRCxFQUdFLE9BSEY7QUFLQSxjQUFNNkYseUJBQXlCLEdBQUcsQ0FDaEM7QUFDRUMsVUFBQUEsUUFBUSxFQUFHLGlCQUFnQjlGLEtBQU0sV0FEbkM7QUFFRStGLFVBQUFBLGFBQWEsRUFBRywyQ0FBMEMvRixLQUFNLEVBRmxFO0FBR0VvQyxVQUFBQSxJQUFJLEVBQUU7QUFDSnpFLFlBQUFBLEtBQUssRUFBRTtBQUFFRixjQUFBQSxJQUFJLEVBQUUsc0JBQVI7QUFBZ0NHLGNBQUFBLEtBQUssRUFBRTtBQUF2QztBQURILFdBSFI7QUFNRW9JLFVBQUFBLFdBQVcsRUFBRUMsUUFBUSxJQUFLLENBQ3hCQSxRQUFRLENBQUNDLEdBQVQsSUFBZ0JELFFBQVEsQ0FBQ0MsR0FBVCxDQUFhQyxLQUE3QixJQUF1QyxHQUFFRixRQUFRLENBQUNDLEdBQVQsQ0FBYUMsS0FBTSxRQURwQyxFQUV4QkYsUUFBUSxDQUFDQyxHQUFULElBQWdCRCxRQUFRLENBQUNDLEdBQVQsQ0FBYTlGLElBRkwsRUFHeEI2RixRQUFRLENBQUNHLEdBQVQsSUFBZ0JILFFBQVEsQ0FBQ0csR0FBVCxDQUFhQyxLQUE3QixJQUF1QyxHQUFFQyxNQUFNLENBQUNMLFFBQVEsQ0FBQ0csR0FBVCxDQUFhQyxLQUFiLEdBQXFCLElBQXJCLEdBQTRCLElBQTdCLENBQU4sQ0FBeUNFLE9BQXpDLENBQWlELENBQWpELENBQW9ELFFBSHJFO0FBTjVCLFNBRGdDLEVBYWhDO0FBQ0VULFVBQUFBLFFBQVEsRUFBRyxpQkFBZ0I5RixLQUFNLEtBRG5DO0FBRUUrRixVQUFBQSxhQUFhLEVBQUcscUNBQW9DL0YsS0FBTSxFQUY1RDtBQUdFb0MsVUFBQUEsSUFBSSxFQUFFO0FBQ0p6RSxZQUFBQSxLQUFLLEVBQUU7QUFBRUYsY0FBQUEsSUFBSSxFQUFFLGdCQUFSO0FBQTBCRyxjQUFBQSxLQUFLLEVBQUU7QUFBakM7QUFESCxXQUhSO0FBTUVvSSxVQUFBQSxXQUFXLEVBQUVRLE1BQU0sSUFBSyxDQUN0QkEsTUFBTSxDQUFDQyxPQURlLEVBRXRCRCxNQUFNLENBQUNuRyxPQUZlLEVBR3RCbUcsTUFBTSxDQUFDRSxZQUhlLEVBSXRCRixNQUFNLENBQUNHLE9BSmUsRUFLdEJILE1BQU0sQ0FBQ3JHLEVBQVAsSUFBYXFHLE1BQU0sQ0FBQ3JHLEVBQVAsQ0FBVUMsSUFBdkIsSUFBK0JvRyxNQUFNLENBQUNyRyxFQUFQLENBQVVFLE9BQXpDLElBQXFELEdBQUVtRyxNQUFNLENBQUNyRyxFQUFQLENBQVVDLElBQUssSUFBR29HLE1BQU0sQ0FBQ3JHLEVBQVAsQ0FBVUUsT0FBUSxFQUxyRTtBQU4xQixTQWJnQyxDQUFsQztBQTZCQSxjQUFNdUcsaUJBQWlCLEdBQUcsTUFBTXBILE9BQU8sQ0FBQ2tDLEdBQVIsQ0FBWW1FLHlCQUF5QixDQUFDOUYsR0FBMUIsQ0FBOEIsTUFBTThHLG1CQUFOLElBQTZCO0FBQ3JHLGNBQUc7QUFDRCw2QkFDRSwrQkFERixFQUVFQSxtQkFBbUIsQ0FBQ2QsYUFGdEIsRUFHRSxPQUhGO0FBS0Esa0JBQU1lLG9CQUFvQixHQUFHLE1BQU03SixPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDakMsS0FEaUMsRUFFakNvSSxtQkFBbUIsQ0FBQ2YsUUFGYSxFQUdqQyxFQUhpQyxFQUlqQztBQUFDbkgsY0FBQUEsU0FBUyxFQUFFckI7QUFBWixhQUppQyxDQUFuQztBQU1BLGtCQUFNLENBQUN1QixJQUFELElBQVNpSSxvQkFBb0IsSUFBSUEsb0JBQW9CLENBQUNqSSxJQUE3QyxJQUFxRGlJLG9CQUFvQixDQUFDakksSUFBckIsQ0FBMEJBLElBQS9FLElBQXVGaUksb0JBQW9CLENBQUNqSSxJQUFyQixDQUEwQkEsSUFBMUIsQ0FBK0JDLGNBQXRILElBQXdJLEVBQXZKOztBQUNBLGdCQUFHRCxJQUFILEVBQVE7QUFDTixxQkFBTyxFQUNMLEdBQUdnSSxtQkFBbUIsQ0FBQ3pFLElBRGxCO0FBRUxBLGdCQUFBQSxJQUFJLEVBQUV5RSxtQkFBbUIsQ0FBQ2IsV0FBcEIsQ0FBZ0NuSCxJQUFoQztBQUZELGVBQVA7QUFJRDs7QUFBQTtBQUNGLFdBbkJELENBbUJDLE9BQU1TLEtBQU4sRUFBWTtBQUNYLDZCQUNFLCtCQURGLEVBRUVBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FGbkI7QUFJRDtBQUNGLFNBMUIyQyxDQUFaLENBQWhDOztBQTRCQSxZQUFHc0gsaUJBQUgsRUFBcUI7QUFDbkJBLFVBQUFBLGlCQUFpQixDQUFDM0UsTUFBbEIsQ0FBeUI4RSxnQkFBZ0IsSUFBSUEsZ0JBQTdDLEVBQStEQyxPQUEvRCxDQUF1RUQsZ0JBQWdCLElBQUk3SixPQUFPLENBQUNpRixPQUFSLENBQWdCNEUsZ0JBQWhCLENBQTNGO0FBQ0Q7O0FBQUE7QUFFRCxjQUFNRSx1QkFBdUIsR0FBRyxDQUFDLFVBQUQsRUFBYSxNQUFiLENBQWhDO0FBRUEsY0FBTUMsNkJBQTZCLEdBQUcsQ0FBQyxNQUFNMUgsT0FBTyxDQUFDa0MsR0FBUixDQUFZdUYsdUJBQXVCLENBQUNsSCxHQUF4QixDQUE0QixNQUFNNEIsb0JBQU4sSUFBOEI7QUFDakgsY0FBRztBQUNELDZCQUNFLCtCQURGLEVBRUcsZ0JBQWVBLG9CQUFxQixXQUZ2QyxFQUdFLE9BSEY7QUFNQSxtQkFBTyxNQUFNRSxvQkFBb0IsQ0FBQ3NGLFdBQXJCLENBQ1hsSyxPQURXLEVBRVg4RCxJQUZXLEVBR1hDLEVBSFcsRUFJWFcsb0JBSlcsRUFLWDFGLE9BTFcsRUFNWGdGLE9BTlcsQ0FBYjtBQVFELFdBZkQsQ0FlQyxPQUFNM0IsS0FBTixFQUFZO0FBQ1gsNkJBQ0UsK0JBREYsRUFFRUEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUZuQjtBQUlEO0FBQ0YsU0F0QndELENBQVosQ0FBUCxFQXNCakMyQyxNQXRCaUMsQ0FzQjFCQyx1QkFBdUIsSUFBSUEsdUJBdEJELEVBc0IwQmtGLElBdEIxQixFQUF0Qzs7QUF3QkEsWUFBSUYsNkJBQTZCLElBQUlBLDZCQUE2QixDQUFDL0ssTUFBbkUsRUFBMkU7QUFDekVlLFVBQUFBLE9BQU8sQ0FBQ3VELGNBQVIsQ0FBdUI7QUFDckI5QyxZQUFBQSxLQUFLLEVBQUU7QUFBQ0YsY0FBQUEsSUFBSSxFQUFFLDJDQUFQO0FBQW9ERyxjQUFBQSxLQUFLLEVBQUU7QUFBM0QsYUFEYztBQUVyQjhDLFlBQUFBLE9BQU8sRUFBRSxDQUFDO0FBQUNDLGNBQUFBLEVBQUUsRUFBRSxTQUFMO0FBQWdCQyxjQUFBQSxLQUFLLEVBQUU7QUFBdkIsYUFBRCxFQUFvQztBQUFDRCxjQUFBQSxFQUFFLEVBQUUsVUFBTDtBQUFpQkMsY0FBQUEsS0FBSyxFQUFFO0FBQXhCLGFBQXBDLENBRlk7QUFHckJDLFlBQUFBLEtBQUssRUFBRXFHO0FBSGMsV0FBdkI7QUFLRDtBQUNGOztBQUVELFVBQUkvSixPQUFPLEtBQUssUUFBWixJQUF3QkMsR0FBRyxLQUFLLE1BQXBDLEVBQTRDO0FBQzFDLGNBQU1pSyxtQkFBbUIsR0FBRyxNQUFNeEYsb0JBQW9CLENBQUN5RixrQkFBckIsQ0FDaENySyxPQURnQyxFQUVoQzhELElBRmdDLEVBR2hDQyxFQUhnQyxFQUloQyxVQUpnQyxFQUtoQy9FLE9BTGdDLEVBTWhDZ0YsT0FOZ0MsQ0FBbEM7O0FBUUEsWUFBSW9HLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQ2xMLE1BQS9DLEVBQXVEO0FBQ3JEZSxVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUFFdkIsWUFBQUEsSUFBSSxFQUFFLG1CQUFSO0FBQTZCRyxZQUFBQSxLQUFLLEVBQUU7QUFBcEMsV0FBOUI7QUFDQVYsVUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixZQUFBQSxJQUFJLEVBQ0YsOEhBRjBCO0FBRzVCRyxZQUFBQSxLQUFLLEVBQUU7QUFIcUIsV0FBOUI7QUFLQSxnQkFBTTJKLFFBQVEsR0FBRyxFQUFqQjs7QUFDQSxlQUFLLE1BQU1DLFFBQVgsSUFBdUJILG1CQUF2QixFQUE0QztBQUMxQ0UsWUFBQUEsUUFBUSxDQUFDL0csSUFBVCxDQUFjO0FBQUUvQyxjQUFBQSxJQUFJLEVBQUUrSixRQUFRLENBQUNDLE9BQWpCO0FBQTBCN0osY0FBQUEsS0FBSyxFQUFFO0FBQWpDLGFBQWQ7QUFDQTJKLFlBQUFBLFFBQVEsQ0FBQy9HLElBQVQsQ0FBYztBQUNaa0gsY0FBQUEsRUFBRSxFQUFFRixRQUFRLENBQUNHLFVBQVQsQ0FBb0I1SCxHQUFwQixDQUF3QjZDLElBQUksS0FBSztBQUNuQ25GLGdCQUFBQSxJQUFJLEVBQUVtRixJQUFJLENBQUNnRixTQUFMLENBQWUsQ0FBZixFQUFpQixFQUFqQixJQUF1QixLQURNO0FBRW5DQyxnQkFBQUEsSUFBSSxFQUFFakYsSUFGNkI7QUFHbkM5RSxnQkFBQUEsS0FBSyxFQUFFO0FBSDRCLGVBQUwsQ0FBNUI7QUFEUSxhQUFkO0FBT0Q7O0FBQ0RaLFVBQUFBLE9BQU8sQ0FBQzhCLHFCQUFSLENBQThCO0FBQUUwSSxZQUFBQSxFQUFFLEVBQUVIO0FBQU4sV0FBOUI7QUFDRDs7QUFFRCxjQUFNTyxlQUFlLEdBQUcsTUFBTWpHLG9CQUFvQixDQUFDeUYsa0JBQXJCLENBQzVCckssT0FENEIsRUFFNUI4RCxJQUY0QixFQUc1QkMsRUFINEIsRUFJNUIsTUFKNEIsRUFLNUIvRSxPQUw0QixFQU01QmdGLE9BTjRCLENBQTlCOztBQVFBLFlBQUk2RyxlQUFlLElBQUlBLGVBQWUsQ0FBQzNMLE1BQXZDLEVBQStDO0FBQzdDZSxVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUFFdkIsWUFBQUEsSUFBSSxFQUFFLGVBQVI7QUFBeUJHLFlBQUFBLEtBQUssRUFBRTtBQUFoQyxXQUE5QjtBQUNBVixVQUFBQSxPQUFPLENBQUM4QixxQkFBUixDQUE4QjtBQUM1QnZCLFlBQUFBLElBQUksRUFDRixpRUFGMEI7QUFHNUJHLFlBQUFBLEtBQUssRUFBRTtBQUhxQixXQUE5QjtBQUtBLGdCQUFNMkosUUFBUSxHQUFHLEVBQWpCOztBQUNBLGVBQUssTUFBTUMsUUFBWCxJQUF1Qk0sZUFBdkIsRUFBd0M7QUFDdENQLFlBQUFBLFFBQVEsQ0FBQy9HLElBQVQsQ0FBYztBQUFFL0MsY0FBQUEsSUFBSSxFQUFFK0osUUFBUSxDQUFDQyxPQUFqQjtBQUEwQjdKLGNBQUFBLEtBQUssRUFBRTtBQUFqQyxhQUFkO0FBQ0EySixZQUFBQSxRQUFRLENBQUMvRyxJQUFULENBQWM7QUFDWmtILGNBQUFBLEVBQUUsRUFBRUYsUUFBUSxDQUFDRyxVQUFULENBQW9CNUgsR0FBcEIsQ0FBd0I2QyxJQUFJLEtBQUs7QUFDbkNuRixnQkFBQUEsSUFBSSxFQUFFbUYsSUFENkI7QUFFbkM5RSxnQkFBQUEsS0FBSyxFQUFFO0FBRjRCLGVBQUwsQ0FBNUI7QUFEUSxhQUFkO0FBTUQ7O0FBQ0R5SixVQUFBQSxRQUFRLElBQUlBLFFBQVEsQ0FBQ3BMLE1BQXJCLElBQStCZSxPQUFPLENBQUNNLFVBQVIsQ0FBbUI7QUFBRWtLLFlBQUFBLEVBQUUsRUFBRUg7QUFBTixXQUFuQixDQUEvQjtBQUNBckssVUFBQUEsT0FBTyxDQUFDZ0IsVUFBUjtBQUNEO0FBQ0Y7O0FBRUQsYUFBTyxLQUFQO0FBQ0QsS0EvdUJELENBK3VCRSxPQUFPb0IsS0FBUCxFQUFjO0FBQ2QsdUJBQUksK0JBQUosRUFBcUNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBdEQ7QUFDQSxhQUFPRSxPQUFPLENBQUNDLE1BQVIsQ0FBZUgsS0FBZixDQUFQO0FBQ0Q7QUFDRjs7QUFFT3lJLEVBQUFBLGFBQVIsQ0FBc0JsSixJQUF0QixFQUE0Qm1KLE1BQTVCLEVBQW9DO0FBQ2xDLHFCQUFJLHlCQUFKLEVBQWdDLDZCQUFoQyxFQUE4RCxNQUE5RDtBQUNBLFVBQU1DLE1BQU0sR0FBRyxFQUFmOztBQUNBLFNBQUssSUFBSUMsSUFBVCxJQUFpQnJKLElBQUksSUFBSSxFQUF6QixFQUE2QjtBQUMzQixVQUFJc0osS0FBSyxDQUFDQyxPQUFOLENBQWN2SixJQUFJLENBQUNxSixJQUFELENBQWxCLENBQUosRUFBK0I7QUFDN0JySixRQUFBQSxJQUFJLENBQUNxSixJQUFELENBQUosQ0FBV2xCLE9BQVgsQ0FBbUIsQ0FBQ3FCLENBQUQsRUFBSUMsR0FBSixLQUFZO0FBQzdCLGNBQUksT0FBT0QsQ0FBUCxLQUFhLFFBQWpCLEVBQTJCeEosSUFBSSxDQUFDcUosSUFBRCxDQUFKLENBQVdJLEdBQVgsSUFBa0JDLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxDQUFmLENBQWxCO0FBQzVCLFNBRkQ7QUFHRDs7QUFDREosTUFBQUEsTUFBTSxDQUFDekgsSUFBUCxDQUFZLENBQ1YsQ0FBQ3dILE1BQU0sSUFBSSxFQUFYLEVBQWVFLElBQWYsS0FBd0JPLGtDQUFlUCxJQUFmLENBQXhCLElBQWdEQSxJQUR0QyxFQUVWckosSUFBSSxDQUFDcUosSUFBRCxDQUFKLElBQWMsR0FGSixDQUFaO0FBSUQ7O0FBQ0QsV0FBT0QsTUFBUDtBQUNEOztBQUVPUyxFQUFBQSxlQUFSLENBQXdCN0osSUFBeEIsRUFBOEIxQixPQUE5QixFQUF1Q0MsR0FBdkMsRUFBNEN1TCxLQUFLLEdBQUcsRUFBcEQsRUFBd0Q7QUFDdEQscUJBQUksMkJBQUosRUFBa0MsK0JBQWxDLEVBQWtFLE1BQWxFO0FBQ0EsUUFBSUMsU0FBUyxHQUFHLEVBQWhCO0FBQ0EsVUFBTUMsVUFBVSxHQUFHLEVBQW5CO0FBQ0EsVUFBTUMsU0FBUyxHQUFHLEVBQWxCOztBQUVBLFFBQUlqSyxJQUFJLENBQUMxQyxNQUFMLEtBQWdCLENBQWhCLElBQXFCZ00sS0FBSyxDQUFDQyxPQUFOLENBQWN2SixJQUFkLENBQXpCLEVBQThDO0FBQzVDaUssTUFBQUEsU0FBUyxDQUFDM0wsT0FBTyxDQUFDNEwsTUFBUixDQUFlM0wsR0FBZixFQUFvQjRMLGFBQXJCLENBQVQsR0FBK0NuSyxJQUEvQztBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssSUFBSXJDLEdBQVQsSUFBZ0JxQyxJQUFoQixFQUFzQjtBQUNwQixZQUNHLE9BQU9BLElBQUksQ0FBQ3JDLEdBQUQsQ0FBWCxLQUFxQixRQUFyQixJQUFpQyxDQUFDMkwsS0FBSyxDQUFDQyxPQUFOLENBQWN2SixJQUFJLENBQUNyQyxHQUFELENBQWxCLENBQW5DLElBQ0MyTCxLQUFLLENBQUNDLE9BQU4sQ0FBY3ZKLElBQUksQ0FBQ3JDLEdBQUQsQ0FBbEIsS0FBNEIsT0FBT3FDLElBQUksQ0FBQ3JDLEdBQUQsQ0FBSixDQUFVLENBQVYsQ0FBUCxLQUF3QixRQUZ2RCxFQUdFO0FBQ0FvTSxVQUFBQSxTQUFTLENBQUNwTSxHQUFELENBQVQsR0FDRTJMLEtBQUssQ0FBQ0MsT0FBTixDQUFjdkosSUFBSSxDQUFDckMsR0FBRCxDQUFsQixLQUE0QixPQUFPcUMsSUFBSSxDQUFDckMsR0FBRCxDQUFKLENBQVUsQ0FBVixDQUFQLEtBQXdCLFFBQXBELEdBQ0lxQyxJQUFJLENBQUNyQyxHQUFELENBQUosQ0FBVXVELEdBQVYsQ0FBY3NJLENBQUMsSUFBSTtBQUNqQixtQkFBTyxPQUFPQSxDQUFQLEtBQWEsUUFBYixHQUF3QkUsSUFBSSxDQUFDQyxTQUFMLENBQWVILENBQWYsQ0FBeEIsR0FBNENBLENBQUMsR0FBRyxJQUF2RDtBQUNELFdBRkQsQ0FESixHQUlJeEosSUFBSSxDQUFDckMsR0FBRCxDQUxWO0FBTUQsU0FWRCxNQVVPLElBQ0wyTCxLQUFLLENBQUNDLE9BQU4sQ0FBY3ZKLElBQUksQ0FBQ3JDLEdBQUQsQ0FBbEIsS0FDQSxPQUFPcUMsSUFBSSxDQUFDckMsR0FBRCxDQUFKLENBQVUsQ0FBVixDQUFQLEtBQXdCLFFBRm5CLEVBR0w7QUFDQXNNLFVBQUFBLFNBQVMsQ0FBQ3RNLEdBQUQsQ0FBVCxHQUFpQnFDLElBQUksQ0FBQ3JDLEdBQUQsQ0FBckI7QUFDRCxTQUxNLE1BS0E7QUFDTCxjQUFJVyxPQUFPLENBQUM4TCxhQUFSLElBQXlCLENBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IxTCxRQUFwQixDQUE2QmYsR0FBN0IsQ0FBN0IsRUFBZ0U7QUFDOURzTSxZQUFBQSxTQUFTLENBQUN0TSxHQUFELENBQVQsR0FBaUIsQ0FBQ3FDLElBQUksQ0FBQ3JDLEdBQUQsQ0FBTCxDQUFqQjtBQUNELFdBRkQsTUFFTztBQUNMcU0sWUFBQUEsVUFBVSxDQUFDckksSUFBWCxDQUFnQjNCLElBQUksQ0FBQ3JDLEdBQUQsQ0FBcEI7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFDRG1NLElBQUFBLEtBQUssQ0FBQ25JLElBQU4sQ0FBVztBQUNUN0MsTUFBQUEsS0FBSyxFQUFFLENBQUNSLE9BQU8sQ0FBQytMLE9BQVIsSUFBbUIsRUFBcEIsRUFBd0JDLFVBQXhCLEdBQ0gsRUFERyxHQUVILENBQUNoTSxPQUFPLENBQUNpTSxJQUFSLElBQWdCLEVBQWpCLEVBQXFCaE0sR0FBckIsTUFDQ0QsT0FBTyxDQUFDOEwsYUFBUixHQUF3QixDQUFDLENBQUM5TCxPQUFPLENBQUM2SyxNQUFSLElBQWtCLEVBQW5CLEVBQXVCLENBQXZCLEtBQTZCLEVBQTlCLEVBQWtDNUssR0FBbEMsQ0FBeEIsR0FBaUUsRUFEbEUsQ0FISztBQUtUc0QsTUFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FMQTtBQU1UL0QsTUFBQUEsSUFBSSxFQUFFLFFBTkc7QUFPVDBNLE1BQUFBLElBQUksRUFBRSxLQUFLdEIsYUFBTCxDQUFtQmEsU0FBbkIsRUFBOEIsQ0FBQ3pMLE9BQU8sQ0FBQzZLLE1BQVIsSUFBa0IsRUFBbkIsRUFBdUIsQ0FBdkIsQ0FBOUI7QUFQRyxLQUFYOztBQVNBLFNBQUssSUFBSXhMLEdBQVQsSUFBZ0JzTSxTQUFoQixFQUEyQjtBQUN6QixZQUFNcEksT0FBTyxHQUFHMUMsTUFBTSxDQUFDQyxJQUFQLENBQVk2SyxTQUFTLENBQUN0TSxHQUFELENBQVQsQ0FBZSxDQUFmLENBQVosQ0FBaEI7QUFDQWtFLE1BQUFBLE9BQU8sQ0FBQ3NHLE9BQVIsQ0FBZ0IsQ0FBQ3NDLEdBQUQsRUFBTWhOLENBQU4sS0FBWTtBQUMxQm9FLFFBQUFBLE9BQU8sQ0FBQ3BFLENBQUQsQ0FBUCxHQUFhZ04sR0FBRyxDQUFDLENBQUQsQ0FBSCxDQUFPQyxXQUFQLEtBQXVCRCxHQUFHLENBQUNFLEtBQUosQ0FBVSxDQUFWLENBQXBDO0FBQ0QsT0FGRDtBQUlBLFlBQU1ILElBQUksR0FBR1AsU0FBUyxDQUFDdE0sR0FBRCxDQUFULENBQWV1RCxHQUFmLENBQW1Cc0ksQ0FBQyxJQUFJO0FBQ25DLFlBQUlvQixHQUFHLEdBQUcsRUFBVjs7QUFDQSxhQUFLLElBQUlqTixHQUFULElBQWdCNkwsQ0FBaEIsRUFBbUI7QUFDakJvQixVQUFBQSxHQUFHLENBQUNqSixJQUFKLENBQ0UsT0FBTzZILENBQUMsQ0FBQzdMLEdBQUQsQ0FBUixLQUFrQixRQUFsQixHQUNJNkwsQ0FBQyxDQUFDN0wsR0FBRCxDQURMLEdBRUkyTCxLQUFLLENBQUNDLE9BQU4sQ0FBY0MsQ0FBQyxDQUFDN0wsR0FBRCxDQUFmLElBQ0E2TCxDQUFDLENBQUM3TCxHQUFELENBQUQsQ0FBT3VELEdBQVAsQ0FBV3NJLENBQUMsSUFBSTtBQUNkLG1CQUFPQSxDQUFDLEdBQUcsSUFBWDtBQUNELFdBRkQsQ0FEQSxHQUlBRSxJQUFJLENBQUNDLFNBQUwsQ0FBZUgsQ0FBQyxDQUFDN0wsR0FBRCxDQUFoQixDQVBOO0FBU0Q7O0FBQ0QsZUFBT2lOLEdBQUcsQ0FBQ3ROLE1BQUosR0FBYXVFLE9BQU8sQ0FBQ3ZFLE1BQTVCLEVBQW9DO0FBQ2xDc04sVUFBQUEsR0FBRyxDQUFDakosSUFBSixDQUFTLEdBQVQ7QUFDRDs7QUFDRCxlQUFPaUosR0FBUDtBQUNELE9BakJZLENBQWI7QUFrQkFkLE1BQUFBLEtBQUssQ0FBQ25JLElBQU4sQ0FBVztBQUNUN0MsUUFBQUEsS0FBSyxFQUFFLENBQUMsQ0FBQ1IsT0FBTyxDQUFDNkssTUFBUixJQUFrQixFQUFuQixFQUF1QixDQUF2QixLQUE2QixFQUE5QixFQUFrQ3hMLEdBQWxDLEtBQTBDLEVBRHhDO0FBRVRHLFFBQUFBLElBQUksRUFBRSxPQUZHO0FBR1QrRCxRQUFBQSxPQUhTO0FBSVQySSxRQUFBQTtBQUpTLE9BQVg7QUFNRDs7QUFFRFIsSUFBQUEsVUFBVSxDQUFDN0IsT0FBWCxDQUFtQjBDLElBQUksSUFBSTtBQUN6QixXQUFLaEIsZUFBTCxDQUFxQmdCLElBQXJCLEVBQTJCdk0sT0FBM0IsRUFBb0NDLEdBQUcsR0FBRyxDQUExQyxFQUE2Q3VMLEtBQTdDO0FBQ0QsS0FGRDtBQUlBLFdBQU9BLEtBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNZ0Isb0JBQU4sQ0FBMkIxTSxPQUEzQixFQUEyRHdCLE9BQTNELEVBQW1GbUwsUUFBbkYsRUFBbUg7QUFDakgsUUFBRztBQUNELHVCQUFJLGdDQUFKLEVBQXVDLGdCQUF2QyxFQUF3RCxNQUF4RDtBQUNBLFlBQU07QUFBRWpCLFFBQUFBLEtBQUY7QUFBU3ZILFFBQUFBLE1BQVQ7QUFBaUJ5SSxRQUFBQSxlQUFqQjtBQUFrQzNOLFFBQUFBLFNBQWxDO0FBQTZDRCxRQUFBQSxPQUE3QztBQUFzRDZOLFFBQUFBLElBQXREO0FBQTREQyxRQUFBQSxNQUE1RDtBQUFvRTNKLFFBQUFBLElBQXBFO0FBQTBFakQsUUFBQUE7QUFBMUUsVUFBc0ZzQixPQUFPLENBQUN1TCxJQUFwRztBQUNBLFlBQU07QUFBRUMsUUFBQUE7QUFBRixVQUFleEwsT0FBTyxDQUFDL0IsTUFBN0I7QUFDQSxZQUFNO0FBQUVpRSxRQUFBQSxFQUFFLEVBQUVyRCxLQUFOO0FBQWEyRCxRQUFBQSxPQUFPLEVBQUVpSjtBQUF0QixVQUF1Q3pMLE9BQU8sQ0FBQzBMLE9BQXJEO0FBQ0EsWUFBTTtBQUFFcEosUUFBQUEsSUFBRjtBQUFRQyxRQUFBQTtBQUFSLFVBQWdCOEksSUFBSSxJQUFJLEVBQTlCLENBTEMsQ0FNRDs7QUFDQSxZQUFNNU0sT0FBTyxHQUFHLElBQUlrTixzQkFBSixFQUFoQjtBQUNBLFlBQU07QUFBQ0MsUUFBQUEsUUFBUSxFQUFFQztBQUFYLFVBQXFCLE1BQU1yTixPQUFPLENBQUNvQixLQUFSLENBQWNrTSxRQUFkLENBQXVCQyxjQUF2QixDQUFzQy9MLE9BQXRDLEVBQStDeEIsT0FBL0MsQ0FBakM7QUFDQTtBQUNBLGtEQUEyQndOLDhDQUEzQjtBQUNBLGtEQUEyQkMsc0RBQTNCO0FBQ0Esa0RBQTJCQyxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELENBQTNCO0FBRUEsWUFBTSxLQUFLdE4sWUFBTCxDQUFrQkMsT0FBbEIsRUFBMkJDLE9BQTNCLEVBQW9DQyxPQUFwQyxFQUE2QzhNLFFBQTdDLEVBQXVEN0ksTUFBdkQsRUFBK0Q5RCxLQUEvRCxDQUFOO0FBR0EsWUFBTXNOLGdCQUFnQixHQUFHM08sT0FBTyxHQUFHLEtBQUtELHFCQUFMLENBQTJCQyxPQUEzQixFQUFvQ0MsU0FBcEMsQ0FBSCxHQUFvRCxLQUFwRjs7QUFFQSxVQUFJNE4sSUFBSSxJQUFJYyxnQkFBWixFQUE4QjtBQUM1QjFOLFFBQUFBLE9BQU8sQ0FBQzJOLHNCQUFSLENBQStCOUosSUFBL0IsRUFBcUNDLEVBQXJDLEVBQXlDNEosZ0JBQXpDLEVBQTJEZixlQUEzRDtBQUNEOztBQUFBOztBQUVELFVBQUdDLElBQUgsRUFBUTtBQUNOLGNBQU0sS0FBS2hKLG1CQUFMLENBQ0o3RCxPQURJLEVBRUpDLE9BRkksRUFHSkMsT0FISSxFQUlKOE0sUUFKSSxFQUtKM00sS0FMSSxFQU1KLElBQUl3TixJQUFKLENBQVMvSixJQUFULEVBQWVnSyxPQUFmLEVBTkksRUFPSixJQUFJRCxJQUFKLENBQVM5SixFQUFULEVBQWErSixPQUFiLEVBUEksRUFRSkgsZ0JBUkksRUFTSlYsWUFUSSxFQVVKOUksTUFWSSxDQUFOO0FBWUQ7O0FBQUE7QUFFRGxFLE1BQUFBLE9BQU8sQ0FBQzhOLGlCQUFSLENBQTBCckMsS0FBMUIsRUFBaUN2SCxNQUFqQyxFQUF5QzZJLFFBQXpDOztBQUVBLFVBQUdGLE1BQUgsRUFBVTtBQUNSN00sUUFBQUEsT0FBTyxDQUFDK04sU0FBUixDQUFrQmxCLE1BQWxCO0FBQ0Q7O0FBQUE7QUFFRCxZQUFNN00sT0FBTyxDQUFDZ08sS0FBUixDQUFjUCxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELEVBQStEbEssSUFBL0QsQ0FBZCxDQUFOO0FBRUEsYUFBT3dKLFFBQVEsQ0FBQ3VCLEVBQVQsQ0FBWTtBQUNqQm5CLFFBQUFBLElBQUksRUFBRTtBQUNKb0IsVUFBQUEsT0FBTyxFQUFFLElBREw7QUFFSjdMLFVBQUFBLE9BQU8sRUFBRyxVQUFTYSxJQUFLO0FBRnBCO0FBRFcsT0FBWixDQUFQO0FBTUQsS0FwREQsQ0FvREMsT0FBTWQsS0FBTixFQUFZO0FBQ1gsYUFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRHNLLFFBQWpELENBQVA7QUFDRDtBQUNGOztBQUVEOzs7Ozs7O0FBT0EsUUFBTXlCLG1CQUFOLENBQTBCcE8sT0FBMUIsRUFBMER3QixPQUExRCxFQUFrRm1MLFFBQWxGLEVBQWtIO0FBQ2hILFFBQUc7QUFDRCx1QkFBSSwrQkFBSixFQUFzQyxnQkFBdEMsRUFBdUQsTUFBdkQ7QUFDQSxZQUFNO0FBQUVDLFFBQUFBLGVBQUY7QUFBbUIzTixRQUFBQSxTQUFuQjtBQUE4QkQsUUFBQUEsT0FBOUI7QUFBdUM2TixRQUFBQSxJQUF2QztBQUE2QzFKLFFBQUFBLElBQTdDO0FBQW1Ea0wsUUFBQUE7QUFBbkQsVUFBa0U3TSxPQUFPLENBQUN1TCxJQUFoRjtBQUNBLFlBQU07QUFBRXVCLFFBQUFBO0FBQUYsVUFBYzlNLE9BQU8sQ0FBQy9CLE1BQTVCO0FBQ0EsWUFBTTtBQUFFaUUsUUFBQUEsRUFBRSxFQUFFckQsS0FBTjtBQUFhMkQsUUFBQUEsT0FBTyxFQUFFaUo7QUFBdEIsVUFBdUN6TCxPQUFPLENBQUMwTCxPQUFyRDtBQUNBLFlBQU07QUFBRXBKLFFBQUFBLElBQUY7QUFBUUMsUUFBQUE7QUFBUixVQUFnQjhJLElBQUksSUFBSSxFQUE5QixDQUxDLENBTUQ7O0FBQ0EsWUFBTTVNLE9BQU8sR0FBRyxJQUFJa04sc0JBQUosRUFBaEI7QUFFQSxZQUFNO0FBQUNDLFFBQUFBLFFBQVEsRUFBRUM7QUFBWCxVQUFxQixNQUFNck4sT0FBTyxDQUFDb0IsS0FBUixDQUFja00sUUFBZCxDQUF1QkMsY0FBdkIsQ0FBc0MvTCxPQUF0QyxFQUErQ3hCLE9BQS9DLENBQWpDO0FBQ0E7QUFDQSxrREFBMkJ3Tiw4Q0FBM0I7QUFDQSxrREFBMkJDLHNEQUEzQjtBQUNBLGtEQUEyQkMsY0FBS3ZMLElBQUwsQ0FBVXNMLHNEQUFWLEVBQXVESixNQUF2RCxDQUEzQjtBQUVBLFVBQUlQLE1BQU0sR0FBRyxFQUFiO0FBQ0EsWUFBTXlCLFlBQVksR0FBRztBQUNuQkMsUUFBQUEsU0FBUyxFQUFFLGFBRFE7QUFFbkJDLFFBQUFBLE9BQU8sRUFBRSxTQUZVO0FBR25CQyxRQUFBQSxPQUFPLEVBQUUsU0FIVTtBQUluQkMsUUFBQUEsUUFBUSxFQUFFLFVBSlM7QUFLbkIscUJBQWEsVUFMTTtBQU1uQixtQkFBVyxTQU5RO0FBT25CQyxRQUFBQSxZQUFZLEVBQUUsY0FQSztBQVFuQkMsUUFBQUEsU0FBUyxFQUFFLFdBUlE7QUFTbkI5RCxRQUFBQSxNQUFNLEVBQUUsUUFUVztBQVVuQitELFFBQUFBLEdBQUcsRUFBRTtBQVZjLE9BQXJCO0FBWUE3TyxNQUFBQSxPQUFPLENBQUNNLFVBQVIsQ0FBbUI7QUFDakJDLFFBQUFBLElBQUksRUFBRyxTQUFROE4sT0FBUSxnQkFETjtBQUVqQjNOLFFBQUFBLEtBQUssRUFBRTtBQUZVLE9BQW5COztBQUtBLFVBQUkwTixVQUFVLENBQUMsR0FBRCxDQUFkLEVBQXFCO0FBQ25CLFlBQUl0QyxhQUFhLEdBQUcsRUFBcEI7O0FBQ0EsWUFBSTtBQUNGLGdCQUFNZ0QscUJBQXFCLEdBQUcsTUFBTS9PLE9BQU8sQ0FBQ29CLEtBQVIsQ0FBY0MsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDQyxPQUF2QyxDQUNsQyxLQURrQyxFQUVqQyxXQUFVOE0sT0FBUSxnQkFGZSxFQUdsQyxFQUhrQyxFQUlsQztBQUFDNU0sWUFBQUEsU0FBUyxFQUFFckI7QUFBWixXQUprQyxDQUFwQztBQU1BMEwsVUFBQUEsYUFBYSxHQUFHZ0QscUJBQXFCLENBQUNuTixJQUF0QixDQUEyQkEsSUFBM0M7QUFDRCxTQVJELENBUUUsT0FBT1MsS0FBUCxFQUFjO0FBQ2QsMkJBQUksK0JBQUosRUFBcUNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBdEQsRUFBNkQsT0FBN0Q7QUFFRDs7QUFBQTs7QUFFRCxZQUFJMEosYUFBYSxDQUFDbEssY0FBZCxDQUE2QjNDLE1BQTdCLEdBQW9DLENBQXBDLElBQXlDNkIsTUFBTSxDQUFDQyxJQUFQLENBQVkrSyxhQUFhLENBQUNsSyxjQUFkLENBQTZCLENBQTdCLEVBQWdDaUssTUFBNUMsRUFBb0Q1TSxNQUFqRyxFQUF5RztBQUN2R2UsVUFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxZQUFBQSxJQUFJLEVBQUUsZ0JBRFc7QUFFakJHLFlBQUFBLEtBQUssRUFBRTtBQUFFQyxjQUFBQSxRQUFRLEVBQUUsRUFBWjtBQUFnQkMsY0FBQUEsS0FBSyxFQUFFO0FBQXZCLGFBRlU7QUFHakJDLFlBQUFBLE1BQU0sRUFBRSxDQUFDLENBQUQsRUFBSSxFQUFKLEVBQVEsQ0FBUixFQUFXLEVBQVg7QUFIUyxXQUFuQjtBQUtBLGdCQUFNWixPQUFPLEdBQUc7QUFDZDZLLFlBQUFBLE1BQU0sRUFBRSxFQURNO0FBRWRpQixZQUFBQSxhQUFhLEVBQUU7QUFGRCxXQUFoQjs7QUFJQSxlQUFLLElBQUlGLE1BQVQsSUFBbUJDLGFBQWEsQ0FBQ2xLLGNBQWpDLEVBQWlEO0FBQy9DLGdCQUFJbU4sV0FBVyxHQUFHLEVBQWxCO0FBQ0EsZ0JBQUlDLEtBQUssR0FBRyxDQUFaOztBQUNBLGlCQUFLLElBQUlqSyxNQUFULElBQW1CakUsTUFBTSxDQUFDQyxJQUFQLENBQVk4SyxNQUFNLENBQUM5TSxPQUFuQixDQUFuQixFQUFnRDtBQUM5Q2dRLGNBQUFBLFdBQVcsR0FBR0EsV0FBVyxDQUFDRSxNQUFaLENBQ1gsR0FBRWxLLE1BQU8sS0FBSThHLE1BQU0sQ0FBQzlNLE9BQVAsQ0FBZWdHLE1BQWYsQ0FBdUIsRUFEekIsQ0FBZDs7QUFHQSxrQkFBSWlLLEtBQUssR0FBR2xPLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZOEssTUFBTSxDQUFDOU0sT0FBbkIsRUFBNEJFLE1BQTVCLEdBQXFDLENBQWpELEVBQW9EO0FBQ2xEOFAsZ0JBQUFBLFdBQVcsR0FBR0EsV0FBVyxDQUFDRSxNQUFaLENBQW1CLEtBQW5CLENBQWQ7QUFDRDs7QUFDREQsY0FBQUEsS0FBSztBQUNOOztBQUNEaFAsWUFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxjQUFBQSxJQUFJLEVBQUV3TyxXQURXO0FBRWpCck8sY0FBQUEsS0FBSyxFQUFFLElBRlU7QUFHakJHLGNBQUFBLE1BQU0sRUFBRSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEVBQVY7QUFIUyxhQUFuQjtBQUtBLGdCQUFJdUssR0FBRyxHQUFHLENBQVY7QUFDQW5MLFlBQUFBLE9BQU8sQ0FBQ2lNLElBQVIsR0FBZSxFQUFmOztBQUNBLGlCQUFLLElBQUlnRCxFQUFULElBQWVwTyxNQUFNLENBQUNDLElBQVAsQ0FBWThLLE1BQU0sQ0FBQ0EsTUFBbkIsQ0FBZixFQUEyQztBQUN6QyxtQkFBSyxJQUFJc0QsQ0FBVCxJQUFjQyx1Q0FBbUJDLGNBQWpDLEVBQWlEO0FBQy9DLHFCQUFLLElBQUlDLENBQVQsSUFBY0gsQ0FBQyxDQUFDSSxRQUFoQixFQUEwQjtBQUN4QnRQLGtCQUFBQSxPQUFPLENBQUN1UCxJQUFSLEdBQWVGLENBQUMsQ0FBQ0UsSUFBRixJQUFVLEVBQXpCOztBQUNBLHVCQUFLLElBQUlDLEVBQVQsSUFBZUgsQ0FBQyxDQUFDekQsTUFBRixJQUFZLEVBQTNCLEVBQStCO0FBQzdCLHdCQUFJNEQsRUFBRSxDQUFDM0QsYUFBSCxLQUFxQm9ELEVBQXpCLEVBQTZCO0FBQzNCalAsc0JBQUFBLE9BQU8sQ0FBQzZLLE1BQVIsR0FBaUJ3RSxDQUFDLENBQUN4RSxNQUFGLElBQVksQ0FBQyxFQUFELENBQTdCO0FBQ0Q7QUFDRjs7QUFDRCx1QkFBSyxJQUFJNEUsRUFBVCxJQUFlSixDQUFDLENBQUNLLEtBQUYsSUFBVyxFQUExQixFQUE4QjtBQUM1Qix3QkFBSUQsRUFBRSxDQUFDeE0sSUFBSCxLQUFZZ00sRUFBaEIsRUFBb0I7QUFDbEJqUCxzQkFBQUEsT0FBTyxDQUFDNkssTUFBUixHQUFpQndFLENBQUMsQ0FBQ3hFLE1BQUYsSUFBWSxDQUFDLEVBQUQsQ0FBN0I7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFDRDdLLGNBQUFBLE9BQU8sQ0FBQzZLLE1BQVIsQ0FBZSxDQUFmLEVBQWtCLE1BQWxCLElBQTRCLE9BQTVCO0FBQ0E3SyxjQUFBQSxPQUFPLENBQUM2SyxNQUFSLENBQWUsQ0FBZixFQUFrQixTQUFsQixJQUErQixhQUEvQjtBQUNBN0ssY0FBQUEsT0FBTyxDQUFDNkssTUFBUixDQUFlLENBQWYsRUFBa0IsR0FBbEIsSUFBeUIsOEJBQXpCO0FBQ0E3SyxjQUFBQSxPQUFPLENBQUNpTSxJQUFSLENBQWE1SSxJQUFiLENBQWtCZ0wsWUFBWSxDQUFDWSxFQUFELENBQTlCOztBQUVBLGtCQUFJakUsS0FBSyxDQUFDQyxPQUFOLENBQWNXLE1BQU0sQ0FBQ0EsTUFBUCxDQUFjcUQsRUFBZCxDQUFkLENBQUosRUFBc0M7QUFDcEM7QUFDQSxvQkFBSUEsRUFBRSxLQUFLLFdBQVgsRUFBd0I7QUFDdEIsc0JBQUlVLE1BQU0sR0FBRyxFQUFiOztBQUNBL0Qsa0JBQUFBLE1BQU0sQ0FBQ0EsTUFBUCxDQUFjcUQsRUFBZCxFQUFrQnBGLE9BQWxCLENBQTBCK0YsR0FBRyxJQUFJO0FBQy9CLHdCQUFJLENBQUNELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDQyxTQUFMLENBQVgsRUFBNEI7QUFDMUJGLHNCQUFBQSxNQUFNLENBQUNDLEdBQUcsQ0FBQ0MsU0FBTCxDQUFOLEdBQXdCLEVBQXhCO0FBQ0Q7O0FBQ0RGLG9CQUFBQSxNQUFNLENBQUNDLEdBQUcsQ0FBQ0MsU0FBTCxDQUFOLENBQXNCeE0sSUFBdEIsQ0FBMkJ1TSxHQUEzQjtBQUNELG1CQUxEOztBQU1BL08sa0JBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZNk8sTUFBWixFQUFvQjlGLE9BQXBCLENBQTRCOUgsS0FBSyxJQUFJO0FBQ25DLHdCQUFJK04sT0FBTyxHQUFHLENBQWQ7QUFDQUgsb0JBQUFBLE1BQU0sQ0FBQzVOLEtBQUQsQ0FBTixDQUFjOEgsT0FBZCxDQUFzQixDQUFDcUIsQ0FBRCxFQUFJL0wsQ0FBSixLQUFVO0FBQzlCLDBCQUNFMEIsTUFBTSxDQUFDQyxJQUFQLENBQVlvSyxDQUFaLEVBQWVsTSxNQUFmLEdBQ0E2QixNQUFNLENBQUNDLElBQVAsQ0FBWTZPLE1BQU0sQ0FBQzVOLEtBQUQsQ0FBTixDQUFjK04sT0FBZCxDQUFaLEVBQW9DOVEsTUFGdEMsRUFHRTtBQUNBOFEsd0JBQUFBLE9BQU8sR0FBRzNRLENBQVY7QUFDRDtBQUNGLHFCQVBEO0FBUUEsMEJBQU1vRSxPQUFPLEdBQUcxQyxNQUFNLENBQUNDLElBQVAsQ0FBWTZPLE1BQU0sQ0FBQzVOLEtBQUQsQ0FBTixDQUFjK04sT0FBZCxDQUFaLENBQWhCO0FBQ0EsMEJBQU01RCxJQUFJLEdBQUd5RCxNQUFNLENBQUM1TixLQUFELENBQU4sQ0FBY2EsR0FBZCxDQUFrQnNJLENBQUMsSUFBSTtBQUNsQywwQkFBSW9CLEdBQUcsR0FBRyxFQUFWO0FBQ0EvSSxzQkFBQUEsT0FBTyxDQUFDc0csT0FBUixDQUFnQnhLLEdBQUcsSUFBSTtBQUNyQmlOLHdCQUFBQSxHQUFHLENBQUNqSixJQUFKLENBQ0UsT0FBTzZILENBQUMsQ0FBQzdMLEdBQUQsQ0FBUixLQUFrQixRQUFsQixHQUNJNkwsQ0FBQyxDQUFDN0wsR0FBRCxDQURMLEdBRUkyTCxLQUFLLENBQUNDLE9BQU4sQ0FBY0MsQ0FBQyxDQUFDN0wsR0FBRCxDQUFmLElBQ0E2TCxDQUFDLENBQUM3TCxHQUFELENBQUQsQ0FBT3VELEdBQVAsQ0FBV3NJLENBQUMsSUFBSTtBQUNkLGlDQUFPQSxDQUFDLEdBQUcsSUFBWDtBQUNELHlCQUZELENBREEsR0FJQUUsSUFBSSxDQUFDQyxTQUFMLENBQWVILENBQUMsQ0FBQzdMLEdBQUQsQ0FBaEIsQ0FQTjtBQVNELHVCQVZEO0FBV0EsNkJBQU9pTixHQUFQO0FBQ0QscUJBZFksQ0FBYjtBQWVBL0ksb0JBQUFBLE9BQU8sQ0FBQ3NHLE9BQVIsQ0FBZ0IsQ0FBQ3NDLEdBQUQsRUFBTWhOLENBQU4sS0FBWTtBQUMxQm9FLHNCQUFBQSxPQUFPLENBQUNwRSxDQUFELENBQVAsR0FBYWdOLEdBQUcsQ0FBQyxDQUFELENBQUgsQ0FBT0MsV0FBUCxLQUF1QkQsR0FBRyxDQUFDRSxLQUFKLENBQVUsQ0FBVixDQUFwQztBQUNELHFCQUZEO0FBR0FPLG9CQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQVk7QUFDVjdDLHNCQUFBQSxLQUFLLEVBQUUsYUFERztBQUVWaEIsc0JBQUFBLElBQUksRUFBRSxPQUZJO0FBR1YrRCxzQkFBQUEsT0FIVTtBQUlWMkksc0JBQUFBO0FBSlUscUJBQVo7QUFNRCxtQkFuQ0Q7QUFvQ0QsaUJBNUNELE1BNENPLElBQUkrQyxFQUFFLEtBQUssUUFBWCxFQUFxQjtBQUMxQix3QkFBTVcsR0FBRyxHQUFHaEUsTUFBTSxDQUFDQSxNQUFQLENBQWNxRCxFQUFkLEVBQWtCLENBQWxCLEVBQXFCeEwsS0FBakM7QUFDQSx3QkFBTUYsT0FBTyxHQUFHMUMsTUFBTSxDQUFDQyxJQUFQLENBQVk4TyxHQUFHLENBQUMsQ0FBRCxDQUFmLENBQWhCOztBQUNBLHNCQUFJLENBQUNyTSxPQUFPLENBQUNuRCxRQUFSLENBQWlCLFFBQWpCLENBQUwsRUFBaUM7QUFDL0JtRCxvQkFBQUEsT0FBTyxDQUFDRixJQUFSLENBQWEsUUFBYjtBQUNEOztBQUNELHdCQUFNNkksSUFBSSxHQUFHMEQsR0FBRyxDQUFDaE4sR0FBSixDQUFRc0ksQ0FBQyxJQUFJO0FBQ3hCLHdCQUFJb0IsR0FBRyxHQUFHLEVBQVY7QUFDQS9JLG9CQUFBQSxPQUFPLENBQUNzRyxPQUFSLENBQWdCeEssR0FBRyxJQUFJO0FBQ3JCaU4sc0JBQUFBLEdBQUcsQ0FBQ2pKLElBQUosQ0FBUzZILENBQUMsQ0FBQzdMLEdBQUQsQ0FBVjtBQUNELHFCQUZEO0FBR0EsMkJBQU9pTixHQUFQO0FBQ0QsbUJBTlksQ0FBYjtBQU9BL0ksa0JBQUFBLE9BQU8sQ0FBQ3NHLE9BQVIsQ0FBZ0IsQ0FBQ3NDLEdBQUQsRUFBTWhOLENBQU4sS0FBWTtBQUMxQm9FLG9CQUFBQSxPQUFPLENBQUNwRSxDQUFELENBQVAsR0FBYWdOLEdBQUcsQ0FBQyxDQUFELENBQUgsQ0FBT0MsV0FBUCxLQUF1QkQsR0FBRyxDQUFDRSxLQUFKLENBQVUsQ0FBVixDQUFwQztBQUNELG1CQUZEO0FBR0FPLGtCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQVk7QUFDVjdDLG9CQUFBQSxLQUFLLEVBQUUsUUFERztBQUVWaEIsb0JBQUFBLElBQUksRUFBRSxPQUZJO0FBR1YrRCxvQkFBQUEsT0FIVTtBQUlWMkksb0JBQUFBO0FBSlUsbUJBQVo7QUFNRCxpQkF0Qk0sTUFzQkE7QUFDTCx1QkFBSyxJQUFJNkQsR0FBVCxJQUFnQm5FLE1BQU0sQ0FBQ0EsTUFBUCxDQUFjcUQsRUFBZCxDQUFoQixFQUFtQztBQUNqQ3JDLG9CQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQVksR0FBRyxLQUFLa0ksZUFBTCxDQUFxQndFLEdBQXJCLEVBQTBCL1AsT0FBMUIsRUFBbUNtTCxHQUFuQyxDQUFmO0FBQ0Q7QUFDRjtBQUNGLGVBekVELE1BeUVPO0FBQ0w7QUFDQSxvQkFBSVMsTUFBTSxDQUFDQSxNQUFQLENBQWNxRCxFQUFkLEVBQWtCZSxXQUF0QixFQUFtQztBQUNqQyx3QkFBTUEsV0FBVyxHQUFHcEUsTUFBTSxDQUFDQSxNQUFQLENBQWNxRCxFQUFkLEVBQWtCZSxXQUF0QztBQUNBLHlCQUFPcEUsTUFBTSxDQUFDQSxNQUFQLENBQWNxRCxFQUFkLEVBQWtCZSxXQUF6QjtBQUNBcEQsa0JBQUFBLE1BQU0sQ0FBQ3ZKLElBQVAsQ0FDRSxHQUFHLEtBQUtrSSxlQUFMLENBQXFCSyxNQUFNLENBQUNBLE1BQVAsQ0FBY3FELEVBQWQsQ0FBckIsRUFBd0NqUCxPQUF4QyxFQUFpRG1MLEdBQWpELENBREw7QUFHQSxzQkFBSThFLFFBQVEsR0FBRyxFQUFmO0FBQ0FwUCxrQkFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlkLE9BQU8sQ0FBQ3VQLElBQXBCLEVBQTBCMUYsT0FBMUIsQ0FBa0NxQixDQUFDLElBQUk7QUFDckMrRSxvQkFBQUEsUUFBUSxDQUFDNU0sSUFBVCxDQUFjNkgsQ0FBZDtBQUNELG1CQUZEO0FBR0Esd0JBQU0zSCxPQUFPLEdBQUcsQ0FDZCxFQURjLEVBRWQsR0FBRzBNLFFBQVEsQ0FBQ25MLE1BQVQsQ0FDRG9HLENBQUMsSUFBSUEsQ0FBQyxLQUFLLFdBQU4sSUFBcUJBLENBQUMsS0FBSyxXQUQvQixDQUZXLENBQWhCO0FBTUEsc0JBQUlnQixJQUFJLEdBQUcsRUFBWDtBQUNBOEQsa0JBQUFBLFdBQVcsQ0FBQ25HLE9BQVosQ0FBb0JxQixDQUFDLElBQUk7QUFDdkIsd0JBQUlvQixHQUFHLEdBQUcsRUFBVjtBQUNBQSxvQkFBQUEsR0FBRyxDQUFDakosSUFBSixDQUFTNkgsQ0FBQyxDQUFDc0MsSUFBWDtBQUNBakssb0JBQUFBLE9BQU8sQ0FBQ3NHLE9BQVIsQ0FBZ0JxRyxDQUFDLElBQUk7QUFDbkIsMEJBQUlBLENBQUMsS0FBSyxFQUFWLEVBQWM7QUFDWkEsd0JBQUFBLENBQUMsR0FBR0EsQ0FBQyxLQUFLLGVBQU4sR0FBd0JBLENBQXhCLEdBQTRCLFNBQWhDO0FBQ0E1RCx3QkFBQUEsR0FBRyxDQUFDakosSUFBSixDQUFTNkgsQ0FBQyxDQUFDZ0YsQ0FBRCxDQUFELEdBQU9oRixDQUFDLENBQUNnRixDQUFELENBQVIsR0FBYyxJQUF2QjtBQUNEO0FBQ0YscUJBTEQ7QUFNQTVELG9CQUFBQSxHQUFHLENBQUNqSixJQUFKLENBQVM2SCxDQUFDLENBQUNpRixlQUFYO0FBQ0FqRSxvQkFBQUEsSUFBSSxDQUFDN0ksSUFBTCxDQUFVaUosR0FBVjtBQUNELG1CQVhEO0FBWUEvSSxrQkFBQUEsT0FBTyxDQUFDc0csT0FBUixDQUFnQixDQUFDcUIsQ0FBRCxFQUFJQyxHQUFKLEtBQVk7QUFDMUI1SCxvQkFBQUEsT0FBTyxDQUFDNEgsR0FBRCxDQUFQLEdBQWVuTCxPQUFPLENBQUN1UCxJQUFSLENBQWFyRSxDQUFiLENBQWY7QUFDRCxtQkFGRDtBQUdBM0gsa0JBQUFBLE9BQU8sQ0FBQ0YsSUFBUixDQUFhLElBQWI7QUFDQXVKLGtCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQVk7QUFDVjdDLG9CQUFBQSxLQUFLLEVBQUUsdUJBREc7QUFFVmhCLG9CQUFBQSxJQUFJLEVBQUUsT0FGSTtBQUdWK0Qsb0JBQUFBLE9BSFU7QUFJVjJJLG9CQUFBQTtBQUpVLG1CQUFaO0FBTUQsaUJBdkNELE1BdUNPO0FBQ0xVLGtCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQ0UsR0FBRyxLQUFLa0ksZUFBTCxDQUFxQkssTUFBTSxDQUFDQSxNQUFQLENBQWNxRCxFQUFkLENBQXJCLEVBQXdDalAsT0FBeEMsRUFBaURtTCxHQUFqRCxDQURMO0FBR0Q7QUFDRjs7QUFDRCxtQkFBSyxNQUFNaUYsS0FBWCxJQUFvQnhELE1BQXBCLEVBQTRCO0FBQzFCN00sZ0JBQUFBLE9BQU8sQ0FBQ3NRLGVBQVIsQ0FBd0IsQ0FBQ0QsS0FBRCxDQUF4QjtBQUNEOztBQUNEakYsY0FBQUEsR0FBRztBQUNIeUIsY0FBQUEsTUFBTSxHQUFHLEVBQVQ7QUFDRDs7QUFDREEsWUFBQUEsTUFBTSxHQUFHLEVBQVQ7QUFDRDtBQUNGLFNBbExELE1Ba0xPO0FBQ0w3TSxVQUFBQSxPQUFPLENBQUNNLFVBQVIsQ0FBbUI7QUFDakJDLFlBQUFBLElBQUksRUFBRSx5REFEVztBQUVqQkcsWUFBQUEsS0FBSyxFQUFFO0FBQUVDLGNBQUFBLFFBQVEsRUFBRSxFQUFaO0FBQWdCQyxjQUFBQSxLQUFLLEVBQUU7QUFBdkIsYUFGVTtBQUdqQkMsWUFBQUEsTUFBTSxFQUFFLENBQUMsQ0FBRCxFQUFJLEVBQUosRUFBUSxDQUFSLEVBQVcsRUFBWDtBQUhTLFdBQW5CO0FBS0Q7QUFDRjs7QUFDRCxVQUFJdU4sVUFBVSxDQUFDLEdBQUQsQ0FBZCxFQUFxQjtBQUNuQixZQUFJbUMsYUFBYSxHQUFHLEVBQXBCOztBQUNBLFlBQUk7QUFDRixnQkFBTUMscUJBQXFCLEdBQUcsTUFBTXpRLE9BQU8sQ0FBQ29CLEtBQVIsQ0FBY0MsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDQyxPQUF2QyxDQUNsQyxLQURrQyxFQUVqQyxXQUFVOE0sT0FBUSxTQUZlLEVBR2xDLEVBSGtDLEVBSWxDO0FBQUM1TSxZQUFBQSxTQUFTLEVBQUVyQjtBQUFaLFdBSmtDLENBQXBDO0FBTUFtUSxVQUFBQSxhQUFhLEdBQUdDLHFCQUFxQixDQUFDN08sSUFBdEIsQ0FBMkJBLElBQTNCLENBQWdDQyxjQUFoRDtBQUNELFNBUkQsQ0FRRSxPQUFPUSxLQUFQLEVBQWM7QUFDZCwyQkFBSSxrQkFBSixFQUF3QkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUF6QyxFQUFnRCxPQUFoRDtBQUNEOztBQUNELGNBQU0sS0FBS3RDLFlBQUwsQ0FDSkMsT0FESSxFQUVKQyxPQUZJLEVBR0osYUFISSxFQUlKcU8sT0FKSSxFQUtKLENBQUNrQyxhQUFhLElBQUksRUFBbEIsRUFBc0IxTixHQUF0QixDQUEwQnNJLENBQUMsSUFBSUEsQ0FBQyxDQUFDMUgsRUFBakMsQ0FMSSxFQU1KckQsS0FOSSxDQUFOO0FBUUQ7O0FBRUQsWUFBTUosT0FBTyxDQUFDZ08sS0FBUixDQUFjUCxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELEVBQStEbEssSUFBL0QsQ0FBZCxDQUFOO0FBRUEsYUFBT3dKLFFBQVEsQ0FBQ3VCLEVBQVQsQ0FBWTtBQUNqQm5CLFFBQUFBLElBQUksRUFBRTtBQUNKb0IsVUFBQUEsT0FBTyxFQUFFLElBREw7QUFFSjdMLFVBQUFBLE9BQU8sRUFBRyxVQUFTYSxJQUFLO0FBRnBCO0FBRFcsT0FBWixDQUFQO0FBTUQsS0F6UUQsQ0F5UUMsT0FBTWQsS0FBTixFQUFZO0FBQ1gsdUJBQUksK0JBQUosRUFBcUNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBdEQ7QUFDQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEc0ssUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7QUFPQSxRQUFNK0QsbUJBQU4sQ0FBMEIxUSxPQUExQixFQUEwRHdCLE9BQTFELEVBQWtGbUwsUUFBbEYsRUFBa0g7QUFDaEgsUUFBRztBQUNELHVCQUFJLCtCQUFKLEVBQXNDLGdCQUF0QyxFQUF1RCxNQUF2RDtBQUNBLFlBQU07QUFBRUMsUUFBQUEsZUFBRjtBQUFtQjNOLFFBQUFBLFNBQW5CO0FBQThCRCxRQUFBQSxPQUE5QjtBQUF1QzZOLFFBQUFBLElBQXZDO0FBQTZDMUosUUFBQUEsSUFBN0M7QUFBbURrTCxRQUFBQTtBQUFuRCxVQUFrRTdNLE9BQU8sQ0FBQ3VMLElBQWhGO0FBQ0EsWUFBTTtBQUFFMUosUUFBQUE7QUFBRixVQUFjN0IsT0FBTyxDQUFDL0IsTUFBNUI7QUFDQSxZQUFNO0FBQUVpRSxRQUFBQSxFQUFFLEVBQUVyRDtBQUFOLFVBQWdCbUIsT0FBTyxDQUFDMEwsT0FBOUI7QUFDQSxZQUFNO0FBQUVwSixRQUFBQSxJQUFGO0FBQVFDLFFBQUFBO0FBQVIsVUFBZ0I4SSxJQUFJLElBQUksRUFBOUI7QUFFQSxZQUFNNU0sT0FBTyxHQUFHLElBQUlrTixzQkFBSixFQUFoQjtBQUVBLFlBQU07QUFBQ0MsUUFBQUEsUUFBUSxFQUFFQztBQUFYLFVBQXFCLE1BQU1yTixPQUFPLENBQUNvQixLQUFSLENBQWNrTSxRQUFkLENBQXVCQyxjQUF2QixDQUFzQy9MLE9BQXRDLEVBQStDeEIsT0FBL0MsQ0FBakM7QUFDQTtBQUNBLGtEQUEyQndOLDhDQUEzQjtBQUNBLGtEQUEyQkMsc0RBQTNCO0FBQ0Esa0RBQTJCQyxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELENBQTNCO0FBRUEsVUFBSXNELGdCQUFnQixHQUFHLEVBQXZCO0FBQ0EsVUFBSTdELE1BQU0sR0FBRyxFQUFiOztBQUNBLFVBQUk7QUFDRjZELFFBQUFBLGdCQUFnQixHQUFHLE1BQU0zUSxPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDdkIsS0FEdUIsRUFFdEIsV0FBVTZCLE9BQVEsMkJBRkksRUFHdkIsRUFIdUIsRUFJdkI7QUFBQzNCLFVBQUFBLFNBQVMsRUFBRXJCO0FBQVosU0FKdUIsQ0FBekI7QUFNRCxPQVBELENBT0UsT0FBT2dDLEtBQVAsRUFBYztBQUNkLHlCQUFJLGtCQUFKLEVBQXdCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQXpDLEVBQWdELE9BQWhEO0FBQ0Q7O0FBRUQsWUFBTSxLQUFLdEMsWUFBTCxDQUFrQkMsT0FBbEIsRUFBMkJDLE9BQTNCLEVBQW9DLGFBQXBDLEVBQW1ELGFBQW5ELEVBQWtFb0QsT0FBbEUsRUFBMkVoRCxLQUEzRSxDQUFOO0FBRUEsVUFBSXVRLFlBQVksR0FBRyxDQUFuQjs7QUFDQSxXQUFLLElBQUk5RSxNQUFULElBQW1CdUQsdUNBQW1CQyxjQUF0QyxFQUFzRDtBQUNwRCxZQUFJdUIsY0FBYyxHQUFHLEtBQXJCO0FBQ0EseUJBQ0UsK0JBREYsRUFFRyxnQkFBZS9FLE1BQU0sQ0FBQzBELFFBQVAsQ0FBZ0J0USxNQUFPLHlCQUZ6QyxFQUdFLE9BSEY7O0FBS0EsYUFBSyxJQUFJZ0IsT0FBVCxJQUFvQjRMLE1BQU0sQ0FBQzBELFFBQTNCLEVBQXFDO0FBQ25DLGNBQ0VuQixVQUFVLENBQUN1QyxZQUFELENBQVYsS0FDQzFRLE9BQU8sQ0FBQzRMLE1BQVIsSUFBa0I1TCxPQUFPLENBQUMwUCxLQUQzQixDQURGLEVBR0U7QUFDQSxnQkFBSXZFLEdBQUcsR0FBRyxDQUFWO0FBQ0Esa0JBQU15RixPQUFPLEdBQUcsQ0FBQzVRLE9BQU8sQ0FBQzRMLE1BQVIsSUFBa0IsRUFBbkIsRUFBdUJvRCxNQUF2QixDQUNkaFAsT0FBTyxDQUFDMFAsS0FBUixJQUFpQixFQURILENBQWhCO0FBR0EsNkJBQ0UsK0JBREYsRUFFRyxnQkFBZWtCLE9BQU8sQ0FBQzVSLE1BQU8sdUJBRmpDLEVBR0UsT0FIRjs7QUFLQSxpQkFBSyxJQUFJNlIsSUFBVCxJQUFpQkQsT0FBakIsRUFBMEI7QUFDeEIsa0JBQUlFLG1CQUFtQixHQUFHLEVBQTFCOztBQUNBLGtCQUFJO0FBQ0Ysb0JBQUksQ0FBQ0QsSUFBSSxDQUFDLE1BQUQsQ0FBVCxFQUFtQjtBQUNqQkMsa0JBQUFBLG1CQUFtQixHQUFHLE1BQU1oUixPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDMUIsS0FEMEIsRUFFekIsV0FBVTZCLE9BQVEsV0FBVTBOLElBQUksQ0FBQ0UsU0FBVSxJQUFHRixJQUFJLENBQUNoRixhQUFjLEVBRnhDLEVBRzFCLEVBSDBCLEVBSTFCO0FBQUNySyxvQkFBQUEsU0FBUyxFQUFFckI7QUFBWixtQkFKMEIsQ0FBNUI7QUFNRCxpQkFQRCxNQU9PO0FBQ0wsdUJBQUssSUFBSXVQLEtBQVQsSUFBa0JlLGdCQUFnQixDQUFDL08sSUFBakIsQ0FBc0JBLElBQXRCLENBQTJCLFVBQTNCLENBQWxCLEVBQTBEO0FBQ3hELHdCQUFJYixNQUFNLENBQUNDLElBQVAsQ0FBWTRPLEtBQVosRUFBbUIsQ0FBbkIsTUFBMEJtQixJQUFJLENBQUMsTUFBRCxDQUFsQyxFQUE0QztBQUMxQ0Msc0JBQUFBLG1CQUFtQixDQUFDcFAsSUFBcEIsR0FBMkI7QUFDekJBLHdCQUFBQSxJQUFJLEVBQUVnTztBQURtQix1QkFBM0I7QUFHRDs7QUFBQTtBQUNGO0FBQ0Y7O0FBRUQsc0JBQU1zQixXQUFXLEdBQUdGLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQ3BQLElBQTNDLElBQW1Eb1AsbUJBQW1CLENBQUNwUCxJQUFwQixDQUF5QkEsSUFBaEc7O0FBQ0Esb0JBQUksQ0FBQ2lQLGNBQUwsRUFBcUI7QUFDbkI1USxrQkFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxvQkFBQUEsSUFBSSxFQUFFc0wsTUFBTSxDQUFDcEwsS0FESTtBQUVqQkMsb0JBQUFBLEtBQUssRUFBRSxJQUZVO0FBR2pCRyxvQkFBQUEsTUFBTSxFQUFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsRUFBVjtBQUhTLG1CQUFuQjtBQUtBK1Asa0JBQUFBLGNBQWMsR0FBRyxJQUFqQjtBQUNEOztBQUFBO0FBQ0Q1USxnQkFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxrQkFBQUEsSUFBSSxFQUFFTixPQUFPLENBQUNpUixRQURHO0FBRWpCeFEsa0JBQUFBLEtBQUssRUFBRTtBQUZVLGlCQUFuQjtBQUlBVixnQkFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxrQkFBQUEsSUFBSSxFQUFFTixPQUFPLENBQUNrUixJQURHO0FBRWpCelEsa0JBQUFBLEtBQUssRUFBRTtBQUFFQyxvQkFBQUEsUUFBUSxFQUFFLEVBQVo7QUFBZ0JDLG9CQUFBQSxLQUFLLEVBQUU7QUFBdkIsbUJBRlU7QUFHakJDLGtCQUFBQSxNQUFNLEVBQUUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxFQUFWO0FBSFMsaUJBQW5COztBQUtBLG9CQUNFb1EsV0FERixFQUVFO0FBQ0EsdUJBQUssSUFBSUcsY0FBVCxJQUEyQnRRLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZa1EsV0FBWixDQUEzQixFQUFxRDtBQUNuRCx3QkFBSWhHLEtBQUssQ0FBQ0MsT0FBTixDQUFjK0YsV0FBVyxDQUFDRyxjQUFELENBQXpCLENBQUosRUFBZ0Q7QUFDOUM7QUFDQSwwQkFBSU4sSUFBSSxDQUFDTyxRQUFULEVBQW1CO0FBQ2pCLDRCQUFJekIsTUFBTSxHQUFHLEVBQWI7QUFDQXFCLHdCQUFBQSxXQUFXLENBQUNHLGNBQUQsQ0FBWCxDQUE0QnRILE9BQTVCLENBQW9DK0YsR0FBRyxJQUFJO0FBQ3pDLDhCQUFJLENBQUNELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDQyxTQUFMLENBQVgsRUFBNEI7QUFDMUJGLDRCQUFBQSxNQUFNLENBQUNDLEdBQUcsQ0FBQ0MsU0FBTCxDQUFOLEdBQXdCLEVBQXhCO0FBQ0Q7O0FBQ0RGLDBCQUFBQSxNQUFNLENBQUNDLEdBQUcsQ0FBQ0MsU0FBTCxDQUFOLENBQXNCeE0sSUFBdEIsQ0FBMkJ1TSxHQUEzQjtBQUNELHlCQUxEO0FBTUEvTyx3QkFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVk2TyxNQUFaLEVBQW9COUYsT0FBcEIsQ0FBNEI5SCxLQUFLLElBQUk7QUFDbkMsOEJBQUkrTixPQUFPLEdBQUcsQ0FBZDtBQUNBSCwwQkFBQUEsTUFBTSxDQUFDNU4sS0FBRCxDQUFOLENBQWM4SCxPQUFkLENBQXNCLENBQUNxQixDQUFELEVBQUkvTCxDQUFKLEtBQVU7QUFDOUIsZ0NBQ0UwQixNQUFNLENBQUNDLElBQVAsQ0FBWW9LLENBQVosRUFBZWxNLE1BQWYsR0FDQTZCLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZNk8sTUFBTSxDQUFDNU4sS0FBRCxDQUFOLENBQWMrTixPQUFkLENBQVosRUFBb0M5USxNQUZ0QyxFQUdFO0FBQ0E4USw4QkFBQUEsT0FBTyxHQUFHM1EsQ0FBVjtBQUNEO0FBQ0YsMkJBUEQ7QUFRQSxnQ0FBTW9FLE9BQU8sR0FBRzFDLE1BQU0sQ0FBQ0MsSUFBUCxDQUNkNk8sTUFBTSxDQUFDNU4sS0FBRCxDQUFOLENBQWMrTixPQUFkLENBRGMsQ0FBaEI7QUFHQSxnQ0FBTTVELElBQUksR0FBR3lELE1BQU0sQ0FBQzVOLEtBQUQsQ0FBTixDQUFjYSxHQUFkLENBQWtCc0ksQ0FBQyxJQUFJO0FBQ2xDLGdDQUFJb0IsR0FBRyxHQUFHLEVBQVY7QUFDQS9JLDRCQUFBQSxPQUFPLENBQUNzRyxPQUFSLENBQWdCeEssR0FBRyxJQUFJO0FBQ3JCaU4sOEJBQUFBLEdBQUcsQ0FBQ2pKLElBQUosQ0FDRSxPQUFPNkgsQ0FBQyxDQUFDN0wsR0FBRCxDQUFSLEtBQWtCLFFBQWxCLEdBQ0k2TCxDQUFDLENBQUM3TCxHQUFELENBREwsR0FFSTJMLEtBQUssQ0FBQ0MsT0FBTixDQUFjQyxDQUFDLENBQUM3TCxHQUFELENBQWYsSUFDQTZMLENBQUMsQ0FBQzdMLEdBQUQsQ0FBRCxDQUFPdUQsR0FBUCxDQUFXc0ksQ0FBQyxJQUFJO0FBQ2QsdUNBQU9BLENBQUMsR0FBRyxJQUFYO0FBQ0QsK0JBRkQsQ0FEQSxHQUlBRSxJQUFJLENBQUNDLFNBQUwsQ0FBZUgsQ0FBQyxDQUFDN0wsR0FBRCxDQUFoQixDQVBOO0FBU0QsNkJBVkQ7QUFXQSxtQ0FBT2lOLEdBQVA7QUFDRCwyQkFkWSxDQUFiO0FBZUEvSSwwQkFBQUEsT0FBTyxDQUFDc0csT0FBUixDQUFnQixDQUFDc0MsR0FBRCxFQUFNaE4sQ0FBTixLQUFZO0FBQzFCb0UsNEJBQUFBLE9BQU8sQ0FBQ3BFLENBQUQsQ0FBUCxHQUNFZ04sR0FBRyxDQUFDLENBQUQsQ0FBSCxDQUFPQyxXQUFQLEtBQXVCRCxHQUFHLENBQUNFLEtBQUosQ0FBVSxDQUFWLENBRHpCO0FBRUQsMkJBSEQ7QUFJQU8sMEJBQUFBLE1BQU0sQ0FBQ3ZKLElBQVAsQ0FBWTtBQUNWN0MsNEJBQUFBLEtBQUssRUFBRVIsT0FBTyxDQUFDNkssTUFBUixDQUFlLENBQWYsRUFBa0I5SSxLQUFsQixDQURHO0FBRVZ2Qyw0QkFBQUEsSUFBSSxFQUFFLE9BRkk7QUFHVitELDRCQUFBQSxPQUhVO0FBSVYySSw0QkFBQUE7QUFKVSwyQkFBWjtBQU1ELHlCQXRDRDtBQXVDRCx1QkEvQ0QsTUErQ08sSUFBSWlGLGNBQWMsQ0FBQ3RGLGFBQWYsS0FBaUMsUUFBckMsRUFBK0M7QUFDcERlLHdCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQ0UsR0FBRyxLQUFLa0ksZUFBTCxDQUNEeUYsV0FBVyxDQUFDRyxjQUFELENBRFYsRUFFRG5SLE9BRkMsRUFHRG1MLEdBSEMsQ0FETDtBQU9ELHVCQVJNLE1BUUE7QUFDTCw2QkFBSyxJQUFJNEUsR0FBVCxJQUFnQmlCLFdBQVcsQ0FBQ0csY0FBRCxDQUEzQixFQUE2QztBQUMzQ3ZFLDBCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQ0UsR0FBRyxLQUFLa0ksZUFBTCxDQUFxQndFLEdBQXJCLEVBQTBCL1AsT0FBMUIsRUFBbUNtTCxHQUFuQyxDQURMO0FBR0Q7QUFDRjtBQUNGLHFCQWhFRCxNQWdFTztBQUNMO0FBQ0EsMEJBQUkwRixJQUFJLENBQUNRLE1BQVQsRUFBaUI7QUFDZiw4QkFBTXJCLFdBQVcsR0FBR2dCLFdBQVcsQ0FBQ0csY0FBRCxDQUFYLENBQTRCbkIsV0FBaEQ7QUFDQSwrQkFBT2dCLFdBQVcsQ0FBQ0csY0FBRCxDQUFYLENBQTRCbkIsV0FBbkM7QUFDQXBELHdCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQ0UsR0FBRyxLQUFLa0ksZUFBTCxDQUNEeUYsV0FBVyxDQUFDRyxjQUFELENBRFYsRUFFRG5SLE9BRkMsRUFHRG1MLEdBSEMsQ0FETDtBQU9BLDRCQUFJOEUsUUFBUSxHQUFHLEVBQWY7QUFDQXBQLHdCQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWWQsT0FBTyxDQUFDdVAsSUFBcEIsRUFBMEIxRixPQUExQixDQUFrQ3FCLENBQUMsSUFBSTtBQUNyQytFLDBCQUFBQSxRQUFRLENBQUM1TSxJQUFULENBQWM2SCxDQUFkO0FBQ0QseUJBRkQ7QUFHQSw4QkFBTTNILE9BQU8sR0FBRyxDQUNkLEVBRGMsRUFFZCxHQUFHME0sUUFBUSxDQUFDbkwsTUFBVCxDQUNEb0csQ0FBQyxJQUFJQSxDQUFDLEtBQUssV0FBTixJQUFxQkEsQ0FBQyxLQUFLLFdBRC9CLENBRlcsQ0FBaEI7QUFNQSw0QkFBSWdCLElBQUksR0FBRyxFQUFYO0FBQ0E4RCx3QkFBQUEsV0FBVyxDQUFDbkcsT0FBWixDQUFvQnFCLENBQUMsSUFBSTtBQUN2Qiw4QkFBSW9CLEdBQUcsR0FBRyxFQUFWO0FBQ0FBLDBCQUFBQSxHQUFHLENBQUNqSixJQUFKLENBQVM2SCxDQUFDLENBQUNvRyxHQUFYO0FBQ0EvTiwwQkFBQUEsT0FBTyxDQUFDc0csT0FBUixDQUFnQnFHLENBQUMsSUFBSTtBQUNuQixnQ0FBSUEsQ0FBQyxLQUFLLEVBQVYsRUFBYztBQUNaNUQsOEJBQUFBLEdBQUcsQ0FBQ2pKLElBQUosQ0FDRTZILENBQUMsQ0FBQ3FFLElBQUYsQ0FBTzVKLE9BQVAsQ0FBZXVLLENBQWYsSUFBb0IsQ0FBQyxDQUFyQixHQUF5QixLQUF6QixHQUFpQyxJQURuQztBQUdEO0FBQ0YsMkJBTkQ7QUFPQTVELDBCQUFBQSxHQUFHLENBQUNqSixJQUFKLENBQVM2SCxDQUFDLENBQUNpRixlQUFYO0FBQ0FqRSwwQkFBQUEsSUFBSSxDQUFDN0ksSUFBTCxDQUFVaUosR0FBVjtBQUNELHlCQVpEO0FBYUEvSSx3QkFBQUEsT0FBTyxDQUFDc0csT0FBUixDQUFnQixDQUFDcUIsQ0FBRCxFQUFJQyxHQUFKLEtBQVk7QUFDMUI1SCwwQkFBQUEsT0FBTyxDQUFDNEgsR0FBRCxDQUFQLEdBQWVuTCxPQUFPLENBQUN1UCxJQUFSLENBQWFyRSxDQUFiLENBQWY7QUFDRCx5QkFGRDtBQUdBM0gsd0JBQUFBLE9BQU8sQ0FBQ0YsSUFBUixDQUFhLElBQWI7QUFDQXVKLHdCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQVk7QUFDVjdDLDBCQUFBQSxLQUFLLEVBQUUsdUJBREc7QUFFVmhCLDBCQUFBQSxJQUFJLEVBQUUsT0FGSTtBQUdWK0QsMEJBQUFBLE9BSFU7QUFJVjJJLDBCQUFBQTtBQUpVLHlCQUFaO0FBTUQsdUJBNUNELE1BNENPO0FBQ0xVLHdCQUFBQSxNQUFNLENBQUN2SixJQUFQLENBQ0UsR0FBRyxLQUFLa0ksZUFBTCxDQUNEeUYsV0FBVyxDQUFDRyxjQUFELENBRFYsRUFFRG5SLE9BRkMsRUFHRG1MLEdBSEMsQ0FETDtBQU9EO0FBQ0Y7QUFDRjtBQUNGLGlCQTdIRCxNQTZITztBQUNMO0FBQ0FwTCxrQkFBQUEsT0FBTyxDQUFDTSxVQUFSLENBQW1CO0FBQ2pCQyxvQkFBQUEsSUFBSSxFQUFFLENBQ0osOEVBREksRUFFSjtBQUNFQSxzQkFBQUEsSUFBSSxFQUFHLEdBQUVOLE9BQU8sQ0FBQ2lSLFFBQVIsQ0FBaUJuUCxXQUFqQixFQUErQixpQkFEMUM7QUFFRTRJLHNCQUFBQSxJQUFJLEVBQUUxSyxPQUFPLENBQUN1UixRQUZoQjtBQUdFOVEsc0JBQUFBLEtBQUssRUFBRTtBQUFFQyx3QkFBQUEsUUFBUSxFQUFFLEVBQVo7QUFBZ0JDLHdCQUFBQSxLQUFLLEVBQUU7QUFBdkI7QUFIVCxxQkFGSSxDQURXO0FBU2pCQyxvQkFBQUEsTUFBTSxFQUFFLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsRUFBVjtBQVRTLG1CQUFuQjtBQVdEO0FBQ0YsZUEvS0QsQ0ErS0UsT0FBT3VCLEtBQVAsRUFBYztBQUNkLGlDQUFJLGtCQUFKLEVBQXdCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQXpDLEVBQWdELE9BQWhEO0FBQ0Q7O0FBQ0RnSixjQUFBQSxHQUFHO0FBQ0o7O0FBQ0QsaUJBQUssTUFBTWlGLEtBQVgsSUFBb0J4RCxNQUFwQixFQUE0QjtBQUMxQjdNLGNBQUFBLE9BQU8sQ0FBQ3NRLGVBQVIsQ0FBd0IsQ0FBQ0QsS0FBRCxDQUF4QjtBQUNEO0FBQ0Y7O0FBQ0RNLFVBQUFBLFlBQVk7QUFDWjlELFVBQUFBLE1BQU0sR0FBRyxFQUFUO0FBQ0Q7QUFDRjs7QUFFRCxZQUFNN00sT0FBTyxDQUFDZ08sS0FBUixDQUFjUCxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELEVBQStEbEssSUFBL0QsQ0FBZCxDQUFOO0FBRUEsYUFBT3dKLFFBQVEsQ0FBQ3VCLEVBQVQsQ0FBWTtBQUNqQm5CLFFBQUFBLElBQUksRUFBRTtBQUNKb0IsVUFBQUEsT0FBTyxFQUFFLElBREw7QUFFSjdMLFVBQUFBLE9BQU8sRUFBRyxVQUFTYSxJQUFLO0FBRnBCO0FBRFcsT0FBWixDQUFQO0FBTUQsS0EzUEQsQ0EyUEMsT0FBTWQsS0FBTixFQUFZO0FBQ1gsdUJBQUksK0JBQUosRUFBcUNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBdEQ7QUFDQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEc0ssUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7QUFPQSxRQUFNK0UsNEJBQU4sQ0FBbUMxUixPQUFuQyxFQUFtRXdCLE9BQW5FLEVBQTJGbUwsUUFBM0YsRUFBMkg7QUFDekgsUUFBRztBQUNELHVCQUFJLHdDQUFKLEVBQStDLGdCQUEvQyxFQUFnRSxNQUFoRTtBQUNBLFlBQU07QUFBRUMsUUFBQUEsZUFBRjtBQUFtQjNOLFFBQUFBLFNBQW5CO0FBQThCRCxRQUFBQSxPQUE5QjtBQUF1QzZOLFFBQUFBLElBQXZDO0FBQTZDMUosUUFBQUE7QUFBN0MsVUFBc0QzQixPQUFPLENBQUN1TCxJQUFwRTtBQUNBLFlBQU07QUFBRTFKLFFBQUFBO0FBQUYsVUFBYzdCLE9BQU8sQ0FBQy9CLE1BQTVCO0FBQ0EsWUFBTTtBQUFFaUUsUUFBQUEsRUFBRSxFQUFFckQsS0FBTjtBQUFhMkQsUUFBQUEsT0FBTyxFQUFFaUo7QUFBdEIsVUFBdUN6TCxPQUFPLENBQUMwTCxPQUFyRDtBQUNBLFlBQU07QUFBRXBKLFFBQUFBLElBQUY7QUFBUUMsUUFBQUE7QUFBUixVQUFnQjhJLElBQUksSUFBSSxFQUE5QixDQUxDLENBTUQ7O0FBQ0EsWUFBTTVNLE9BQU8sR0FBRyxJQUFJa04sc0JBQUosRUFBaEI7QUFFQSxZQUFNO0FBQUNDLFFBQUFBLFFBQVEsRUFBRUM7QUFBWCxVQUFxQixNQUFNck4sT0FBTyxDQUFDb0IsS0FBUixDQUFja00sUUFBZCxDQUF1QkMsY0FBdkIsQ0FBc0MvTCxPQUF0QyxFQUErQ3hCLE9BQS9DLENBQWpDO0FBQ0E7QUFDQSxrREFBMkJ3Tiw4Q0FBM0I7QUFDQSxrREFBMkJDLHNEQUEzQjtBQUNBLGtEQUEyQkMsY0FBS3ZMLElBQUwsQ0FBVXNMLHNEQUFWLEVBQXVESixNQUF2RCxDQUEzQjtBQUVBLHVCQUFJLHdDQUFKLEVBQStDLHFCQUEvQyxFQUFxRSxPQUFyRTtBQUNBLFlBQU1NLGdCQUFnQixHQUFHM08sT0FBTyxHQUFHLEtBQUtELHFCQUFMLENBQTJCQyxPQUEzQixFQUFvQ0MsU0FBcEMsQ0FBSCxHQUFvRCxLQUFwRixDQWhCQyxDQWtCRDs7QUFDQSxVQUFJMFMsT0FBTyxHQUFHLEVBQWQ7O0FBQ0EsVUFBSTtBQUNGLGNBQU14USxhQUFhLEdBQUcsTUFBTW5CLE9BQU8sQ0FBQ29CLEtBQVIsQ0FBY0MsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDQyxPQUF2QyxDQUMxQixLQUQwQixFQUUxQixTQUYwQixFQUcxQjtBQUFDL0IsVUFBQUEsTUFBTSxFQUFFO0FBQUM2RCxZQUFBQSxDQUFDLEVBQUcsTUFBS0QsT0FBUTtBQUFsQjtBQUFULFNBSDBCLEVBSTFCO0FBQUMzQixVQUFBQSxTQUFTLEVBQUVyQjtBQUFaLFNBSjBCLENBQTVCO0FBTUFzUixRQUFBQSxPQUFPLEdBQUd4USxhQUFhLENBQUNTLElBQWQsQ0FBbUJBLElBQW5CLENBQXdCQyxjQUF4QixDQUF1QyxDQUF2QyxFQUEwQ3FCLEVBQTFDLENBQTZDME8sUUFBdkQ7QUFDRCxPQVJELENBUUUsT0FBT3ZQLEtBQVAsRUFBYztBQUNkLHlCQUFJLHdDQUFKLEVBQThDQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9ELEVBQXNFLE9BQXRFO0FBQ0QsT0E5QkEsQ0FnQ0Q7OztBQUNBcEMsTUFBQUEsT0FBTyxDQUFDOEIscUJBQVIsQ0FBOEI7QUFDNUJ2QixRQUFBQSxJQUFJLEVBQUUsdUJBRHNCO0FBRTVCRyxRQUFBQSxLQUFLLEVBQUU7QUFGcUIsT0FBOUIsRUFqQ0MsQ0FzQ0Q7O0FBQ0EsWUFBTSxLQUFLTyxnQkFBTCxDQUFzQmxCLE9BQXRCLEVBQStCQyxPQUEvQixFQUF3QyxDQUFDb0QsT0FBRCxDQUF4QyxFQUFtRGhELEtBQW5ELENBQU4sQ0F2Q0MsQ0F5Q0Q7O0FBQ0EsWUFBTXdSLHNCQUFzQixHQUFHLENBQzdCO0FBQ0VoSixRQUFBQSxRQUFRLEVBQUcsaUJBQWdCeEYsT0FBUSxXQURyQztBQUVFeUYsUUFBQUEsYUFBYSxFQUFHLCtCQUE4QnpGLE9BQVEsRUFGeEQ7QUFHRWlOLFFBQUFBLEtBQUssRUFBRTtBQUNMNVAsVUFBQUEsS0FBSyxFQUFFLFVBREY7QUFFTCtDLFVBQUFBLE9BQU8sRUFBRWtPLE9BQU8sS0FBSyxTQUFaLEdBQ0wsQ0FDRTtBQUFDak8sWUFBQUEsRUFBRSxFQUFFLE1BQUw7QUFBYUMsWUFBQUEsS0FBSyxFQUFFO0FBQXBCLFdBREYsRUFFRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsY0FBTDtBQUFxQkMsWUFBQUEsS0FBSyxFQUFFO0FBQTVCLFdBRkYsRUFHRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsU0FBTDtBQUFnQkMsWUFBQUEsS0FBSyxFQUFFO0FBQXZCLFdBSEYsRUFJRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsUUFBTDtBQUFlQyxZQUFBQSxLQUFLLEVBQUU7QUFBdEIsV0FKRixDQURLLEdBT0wsQ0FDRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxZQUFBQSxLQUFLLEVBQUU7QUFBcEIsV0FERixFQUVFO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxjQUFMO0FBQXFCQyxZQUFBQSxLQUFLLEVBQUU7QUFBNUIsV0FGRixFQUdFO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxTQUFMO0FBQWdCQyxZQUFBQSxLQUFLLEVBQUU7QUFBdkIsV0FIRixFQUlFO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxRQUFMO0FBQWVDLFlBQUFBLEtBQUssRUFBRTtBQUF0QixXQUpGLEVBS0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLGFBQUw7QUFBb0JDLFlBQUFBLEtBQUssRUFBRTtBQUEzQixXQUxGO0FBVEM7QUFIVCxPQUQ2QixFQXNCN0I7QUFDRWtGLFFBQUFBLFFBQVEsRUFBRyxpQkFBZ0J4RixPQUFRLFlBRHJDO0FBRUV5RixRQUFBQSxhQUFhLEVBQUcsZ0NBQStCekYsT0FBUSxFQUZ6RDtBQUdFaU4sUUFBQUEsS0FBSyxFQUFFO0FBQ0w1UCxVQUFBQSxLQUFLLEVBQUUsV0FERjtBQUVMK0MsVUFBQUEsT0FBTyxFQUNMa08sT0FBTyxLQUFLLFNBQVosR0FDSSxDQUNFO0FBQUNqTyxZQUFBQSxFQUFFLEVBQUUsTUFBTDtBQUFhQyxZQUFBQSxLQUFLLEVBQUU7QUFBcEIsV0FERixFQUVFO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxLQUFMO0FBQVlDLFlBQUFBLEtBQUssRUFBRTtBQUFuQixXQUZGLEVBR0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFVBQUw7QUFBaUJDLFlBQUFBLEtBQUssRUFBRTtBQUF4QixXQUhGLEVBSUU7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE1BQUw7QUFBYUMsWUFBQUEsS0FBSyxFQUFFO0FBQXBCLFdBSkYsQ0FESixHQU9JLENBQ0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE1BQUw7QUFBYUMsWUFBQUEsS0FBSyxFQUFFO0FBQXBCLFdBREYsRUFFRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsT0FBTDtBQUFjQyxZQUFBQSxLQUFLLEVBQUU7QUFBckIsV0FGRixFQUdFO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxNQUFMO0FBQWFDLFlBQUFBLEtBQUssRUFBRTtBQUFwQixXQUhGLEVBSUU7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE9BQUw7QUFBY0MsWUFBQUEsS0FBSyxFQUFFO0FBQXJCLFdBSkY7QUFWRCxTQUhUO0FBb0JFbU8sUUFBQUEsZ0JBQWdCLEVBQUduTSxJQUFELElBQVVnTSxPQUFPLEtBQUssU0FBWixHQUN4QmhNLElBRHdCLEdBRXhCLEVBQUMsR0FBR0EsSUFBSjtBQUFVb00sVUFBQUEsS0FBSyxFQUFFQyxpQ0FBbUJyTSxJQUFJLENBQUNvTSxLQUF4QjtBQUFqQjtBQXRCTixPQXRCNkIsRUE4QzdCO0FBQ0VsSixRQUFBQSxRQUFRLEVBQUcsaUJBQWdCeEYsT0FBUSxRQURyQztBQUVFeUYsUUFBQUEsYUFBYSxFQUFHLDRCQUEyQnpGLE9BQVEsRUFGckQ7QUFHRWlOLFFBQUFBLEtBQUssRUFBRTtBQUNMNVAsVUFBQUEsS0FBSyxFQUFFLGVBREY7QUFFTCtDLFVBQUFBLE9BQU8sRUFDTGtPLE9BQU8sS0FBSyxTQUFaLEdBQ0ksQ0FDRTtBQUFDak8sWUFBQUEsRUFBRSxFQUFFLFVBQUw7QUFBaUJDLFlBQUFBLEtBQUssRUFBRTtBQUF4QixXQURGLEVBRUU7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFlBQUw7QUFBbUJDLFlBQUFBLEtBQUssRUFBRTtBQUExQixXQUZGLEVBR0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFNBQUw7QUFBZ0JDLFlBQUFBLEtBQUssRUFBRTtBQUF2QixXQUhGLEVBSUU7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE9BQUw7QUFBY0MsWUFBQUEsS0FBSyxFQUFFO0FBQXJCLFdBSkYsRUFLRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsVUFBTDtBQUFpQkMsWUFBQUEsS0FBSyxFQUFFO0FBQXhCLFdBTEYsQ0FESixHQVFJLENBQ0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFVBQUw7QUFBaUJDLFlBQUFBLEtBQUssRUFBRTtBQUF4QixXQURGLEVBRUU7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFlBQUw7QUFBbUJDLFlBQUFBLEtBQUssRUFBRTtBQUExQixXQUZGLEVBR0U7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE9BQUw7QUFBY0MsWUFBQUEsS0FBSyxFQUFFO0FBQXJCLFdBSEYsRUFJRTtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsVUFBTDtBQUFpQkMsWUFBQUEsS0FBSyxFQUFFO0FBQXhCLFdBSkY7QUFYRCxTQUhUO0FBcUJFbU8sUUFBQUEsZ0JBQWdCLEVBQUduTSxJQUFELEtBQVcsRUFBQyxHQUFHQSxJQUFKO0FBQVVzTSxVQUFBQSxRQUFRLEVBQUV0TSxJQUFJLENBQUN1TSxLQUFMLENBQVdDLEVBQS9CO0FBQW1DQyxVQUFBQSxVQUFVLEVBQUV6TSxJQUFJLENBQUN1TSxLQUFMLENBQVdHO0FBQTFELFNBQVg7QUFyQnBCLE9BOUM2QixFQXFFN0I7QUFDRXhKLFFBQUFBLFFBQVEsRUFBRyxpQkFBZ0J4RixPQUFRLFdBRHJDO0FBRUV5RixRQUFBQSxhQUFhLEVBQUcsK0JBQThCekYsT0FBUSxFQUZ4RDtBQUdFaU4sUUFBQUEsS0FBSyxFQUFFO0FBQ0w1UCxVQUFBQSxLQUFLLEVBQUUsb0JBREY7QUFFTCtDLFVBQUFBLE9BQU8sRUFBRSxDQUNQO0FBQUNDLFlBQUFBLEVBQUUsRUFBRSxNQUFMO0FBQWFDLFlBQUFBLEtBQUssRUFBRTtBQUFwQixXQURPLEVBRVA7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLEtBQUw7QUFBWUMsWUFBQUEsS0FBSyxFQUFFO0FBQW5CLFdBRk8sRUFHUDtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsT0FBTDtBQUFjQyxZQUFBQSxLQUFLLEVBQUU7QUFBckIsV0FITyxFQUlQO0FBQUNELFlBQUFBLEVBQUUsRUFBRSxLQUFMO0FBQVlDLFlBQUFBLEtBQUssRUFBRTtBQUFuQixXQUpPLEVBS1A7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE1BQUw7QUFBYUMsWUFBQUEsS0FBSyxFQUFFO0FBQXBCLFdBTE87QUFGSjtBQUhULE9BckU2QixFQW1GN0I7QUFDRWtGLFFBQUFBLFFBQVEsRUFBRyxpQkFBZ0J4RixPQUFRLFVBRHJDO0FBRUV5RixRQUFBQSxhQUFhLEVBQUcsOEJBQTZCekYsT0FBUSxFQUZ2RDtBQUdFaU4sUUFBQUEsS0FBSyxFQUFFO0FBQ0w1UCxVQUFBQSxLQUFLLEVBQUUsa0JBREY7QUFFTCtDLFVBQUFBLE9BQU8sRUFBRSxDQUNQO0FBQUNDLFlBQUFBLEVBQUUsRUFBRSxPQUFMO0FBQWNDLFlBQUFBLEtBQUssRUFBRTtBQUFyQixXQURPLEVBRVA7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFNBQUw7QUFBZ0JDLFlBQUFBLEtBQUssRUFBRTtBQUF2QixXQUZPLEVBR1A7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLFNBQUw7QUFBZ0JDLFlBQUFBLEtBQUssRUFBRTtBQUF2QixXQUhPLEVBSVA7QUFBQ0QsWUFBQUEsRUFBRSxFQUFFLE9BQUw7QUFBY0MsWUFBQUEsS0FBSyxFQUFFO0FBQXJCLFdBSk8sRUFLUDtBQUFDRCxZQUFBQSxFQUFFLEVBQUUsV0FBTDtBQUFrQkMsWUFBQUEsS0FBSyxFQUFFO0FBQXpCLFdBTE87QUFGSjtBQUhULE9BbkY2QixFQWlHN0I7QUFDRWtGLFFBQUFBLFFBQVEsRUFBRyxpQkFBZ0J4RixPQUFRLFdBRHJDO0FBRUV5RixRQUFBQSxhQUFhLEVBQUcsK0JBQThCekYsT0FBUSxFQUZ4RDtBQUdFaU4sUUFBQUEsS0FBSyxFQUFFO0FBQ0w1UCxVQUFBQSxLQUFLLEVBQUUsaUJBREY7QUFFTCtDLFVBQUFBLE9BQU8sRUFBRSxDQUFDO0FBQUNDLFlBQUFBLEVBQUUsRUFBRSxRQUFMO0FBQWVDLFlBQUFBLEtBQUssRUFBRTtBQUF0QixXQUFEO0FBRko7QUFIVCxPQWpHNkIsQ0FBL0I7O0FBMkdBLFlBQU0yTyxnQkFBZ0IsR0FBRyxNQUFPQyxxQkFBUCxJQUFpQztBQUN4RCxZQUFHO0FBQ0QsMkJBQ0Usd0NBREYsRUFFRUEscUJBQXFCLENBQUN6SixhQUZ4QixFQUdFLE9BSEY7QUFNQSxnQkFBTTBKLGlCQUFpQixHQUFHLE1BQU14UyxPQUFPLENBQUNvQixLQUFSLENBQWNDLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1Q0MsT0FBdkMsQ0FDOUIsS0FEOEIsRUFFOUIrUSxxQkFBcUIsQ0FBQzFKLFFBRlEsRUFHOUIsRUFIOEIsRUFJOUI7QUFBQ25ILFlBQUFBLFNBQVMsRUFBRXJCO0FBQVosV0FKOEIsQ0FBaEM7QUFPQSxnQkFBTW9TLFNBQVMsR0FBR0QsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDNVEsSUFBdkMsSUFBK0M0USxpQkFBaUIsQ0FBQzVRLElBQWxCLENBQXVCQSxJQUF0RSxJQUE4RTRRLGlCQUFpQixDQUFDNVEsSUFBbEIsQ0FBdUJBLElBQXZCLENBQTRCQyxjQUE1SDs7QUFDQSxjQUFHNFEsU0FBSCxFQUFhO0FBQ1gsbUJBQU8sRUFDTCxHQUFHRixxQkFBcUIsQ0FBQ2pDLEtBRHBCO0FBRUwxTSxjQUFBQSxLQUFLLEVBQUUyTyxxQkFBcUIsQ0FBQ1QsZ0JBQXRCLEdBQXlDVyxTQUFTLENBQUMzUCxHQUFWLENBQWN5UCxxQkFBcUIsQ0FBQ1QsZ0JBQXBDLENBQXpDLEdBQWlHVztBQUZuRyxhQUFQO0FBSUQ7O0FBQUE7QUFDRixTQXJCRCxDQXFCQyxPQUFNcFEsS0FBTixFQUFZO0FBQ1gsMkJBQUksd0NBQUosRUFBOENBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0QsRUFBc0UsT0FBdEU7QUFDRDs7QUFBQTtBQUNGLE9BekJEOztBQTJCQSxVQUFJd0ssSUFBSixFQUFVO0FBQ1IsY0FBTSxLQUFLaEosbUJBQUwsQ0FDSjdELE9BREksRUFFSkMsT0FGSSxFQUdKLFFBSEksRUFJSixjQUpJLEVBS0pJLEtBTEksRUFNSnlELElBTkksRUFPSkMsRUFQSSxFQVFKNEosZ0JBQWdCLEdBQUcsNENBUmYsRUFTSlYsWUFUSSxFQVVKNUosT0FWSSxDQUFOO0FBWUQ7O0FBQUEsT0E3TEEsQ0ErTEQ7O0FBQ0EsT0FBQyxNQUFNZCxPQUFPLENBQUNrQyxHQUFSLENBQVlvTixzQkFBc0IsQ0FBQy9PLEdBQXZCLENBQTJCd1AsZ0JBQTNCLENBQVosQ0FBUCxFQUNHdE4sTUFESCxDQUNVc0wsS0FBSyxJQUFJQSxLQURuQixFQUMwQnZHLE9BRDFCLENBQ2tDdUcsS0FBSyxJQUFJclEsT0FBTyxDQUFDdUQsY0FBUixDQUF1QjhNLEtBQXZCLENBRDNDLEVBaE1DLENBbU1EOztBQUNBLFlBQU1yUSxPQUFPLENBQUNnTyxLQUFSLENBQWNQLGNBQUt2TCxJQUFMLENBQVVzTCxzREFBVixFQUF1REosTUFBdkQsRUFBK0RsSyxJQUEvRCxDQUFkLENBQU47QUFFQSxhQUFPd0osUUFBUSxDQUFDdUIsRUFBVCxDQUFZO0FBQ2pCbkIsUUFBQUEsSUFBSSxFQUFFO0FBQ0pvQixVQUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKN0wsVUFBQUEsT0FBTyxFQUFHLFVBQVNhLElBQUs7QUFGcEI7QUFEVyxPQUFaLENBQVA7QUFNRCxLQTVNRCxDQTRNQyxPQUFNZCxLQUFOLEVBQVk7QUFDWCx1QkFBSSwrQkFBSixFQUFxQ0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUF0RDtBQUNBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURzSyxRQUFqRCxDQUFQO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7OztBQU9BLFFBQU0rRixVQUFOLENBQWlCMVMsT0FBakIsRUFBaUR3QixPQUFqRCxFQUF5RW1MLFFBQXpFLEVBQTBHO0FBQ3hHLFFBQUk7QUFDRix1QkFBSSxzQkFBSixFQUE2QiwwQkFBN0IsRUFBd0QsTUFBeEQ7QUFDQSxZQUFNO0FBQUNTLFFBQUFBLFFBQVEsRUFBRUM7QUFBWCxVQUFxQixNQUFNck4sT0FBTyxDQUFDb0IsS0FBUixDQUFja00sUUFBZCxDQUF1QkMsY0FBdkIsQ0FBc0MvTCxPQUF0QyxFQUErQ3hCLE9BQS9DLENBQWpDO0FBQ0E7QUFDQSxrREFBMkJ3Tiw4Q0FBM0I7QUFDQSxrREFBMkJDLHNEQUEzQjs7QUFDQSxZQUFNa0Ysb0JBQW9CLEdBQUdqRixjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELENBQTdCOztBQUNBLGtEQUEyQnNGLG9CQUEzQjtBQUNBLHVCQUFJLHNCQUFKLEVBQTZCLGNBQWFBLG9CQUFxQixFQUEvRCxFQUFrRSxPQUFsRTs7QUFFQSxZQUFNQyxpQkFBaUIsR0FBRyxDQUFDQyxDQUFELEVBQUlDLENBQUosS0FDeEJELENBQUMsQ0FBQ0UsSUFBRixHQUFTRCxDQUFDLENBQUNDLElBQVgsR0FBa0IsQ0FBbEIsR0FBc0JGLENBQUMsQ0FBQ0UsSUFBRixHQUFTRCxDQUFDLENBQUNDLElBQVgsR0FBa0IsQ0FBQyxDQUFuQixHQUF1QixDQUQvQzs7QUFHQSxZQUFNQyxPQUFPLEdBQUdDLFlBQUdDLFdBQUgsQ0FBZVAsb0JBQWYsRUFBcUM3UCxHQUFyQyxDQUF5Q3FRLElBQUksSUFBSTtBQUMvRCxjQUFNQyxLQUFLLEdBQUdILFlBQUdJLFFBQUgsQ0FBWVYsb0JBQW9CLEdBQUcsR0FBdkIsR0FBNkJRLElBQXpDLENBQWQsQ0FEK0QsQ0FFL0Q7QUFDQTs7O0FBQ0EsY0FBTUcsY0FBYyxHQUFHLENBQUMsV0FBRCxFQUFjLE9BQWQsRUFBdUIsT0FBdkIsRUFBZ0MsT0FBaEMsRUFBeUNDLElBQXpDLENBQThDMUcsSUFBSSxJQUFJdUcsS0FBSyxDQUFFLEdBQUV2RyxJQUFLLElBQVQsQ0FBM0QsQ0FBdkI7QUFDQSxlQUFPO0FBQ0wxSixVQUFBQSxJQUFJLEVBQUVnUSxJQUREO0FBRUxLLFVBQUFBLElBQUksRUFBRUosS0FBSyxDQUFDSSxJQUZQO0FBR0xULFVBQUFBLElBQUksRUFBRUssS0FBSyxDQUFDRSxjQUFEO0FBSE4sU0FBUDtBQUtELE9BVmUsQ0FBaEI7O0FBV0EsdUJBQ0Usc0JBREYsRUFFRyw2QkFBNEJOLE9BQU8sQ0FBQzlULE1BQU8sUUFGOUMsRUFHRSxPQUhGO0FBS0F1VSxNQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYVYsT0FBYixFQUFzQkosaUJBQXRCO0FBQ0EsdUJBQUksc0JBQUosRUFBNkIsa0JBQWlCSSxPQUFPLENBQUM5VCxNQUFPLEVBQTdELEVBQWdFLE9BQWhFO0FBQ0EsYUFBT3lOLFFBQVEsQ0FBQ3VCLEVBQVQsQ0FBWTtBQUNqQm5CLFFBQUFBLElBQUksRUFBRTtBQUFFaUcsVUFBQUE7QUFBRjtBQURXLE9BQVosQ0FBUDtBQUdELEtBbENELENBa0NFLE9BQU8zUSxLQUFQLEVBQWM7QUFDZCx1QkFBSSxzQkFBSixFQUE0QkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUE3QztBQUNBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURzSyxRQUFqRCxDQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNZ0gsZUFBTixDQUFzQjNULE9BQXRCLEVBQXNEd0IsT0FBdEQsRUFBOEVtTCxRQUE5RSxFQUErRztBQUM3RyxRQUFJO0FBQ0YsdUJBQUksMkJBQUosRUFBa0MsV0FBVW5MLE9BQU8sQ0FBQy9CLE1BQVIsQ0FBZTBELElBQUssU0FBaEUsRUFBMEUsT0FBMUU7QUFDQSxZQUFNO0FBQUNpSyxRQUFBQSxRQUFRLEVBQUVDO0FBQVgsVUFBcUIsTUFBTXJOLE9BQU8sQ0FBQ29CLEtBQVIsQ0FBY2tNLFFBQWQsQ0FBdUJDLGNBQXZCLENBQXNDL0wsT0FBdEMsRUFBK0N4QixPQUEvQyxDQUFqQzs7QUFDQSxZQUFNNFQsZ0JBQWdCLEdBQUdYLFlBQUdZLFlBQUgsQ0FBZ0JuRyxjQUFLdkwsSUFBTCxDQUFVc0wsc0RBQVYsRUFBdURKLE1BQXZELEVBQStEN0wsT0FBTyxDQUFDL0IsTUFBUixDQUFlMEQsSUFBOUUsQ0FBaEIsQ0FBekI7O0FBQ0EsYUFBT3dKLFFBQVEsQ0FBQ3VCLEVBQVQsQ0FBWTtBQUNqQmhCLFFBQUFBLE9BQU8sRUFBRTtBQUFFLDBCQUFnQjtBQUFsQixTQURRO0FBRWpCSCxRQUFBQSxJQUFJLEVBQUU2RztBQUZXLE9BQVosQ0FBUDtBQUlELEtBUkQsQ0FRRSxPQUFPdlIsS0FBUCxFQUFjO0FBQ2QsdUJBQUksMkJBQUosRUFBaUNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBbEQ7QUFDQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEc0ssUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0EsUUFBTW1ILGtCQUFOLENBQXlCOVQsT0FBekIsRUFBeUR3QixPQUF6RCxFQUFpRm1MLFFBQWpGLEVBQWtIO0FBQ2hILFFBQUk7QUFDRix1QkFBSSw4QkFBSixFQUFxQyxZQUFXbkwsT0FBTyxDQUFDL0IsTUFBUixDQUFlMEQsSUFBSyxTQUFwRSxFQUE4RSxPQUE5RTtBQUNBLFlBQU07QUFBQ2lLLFFBQUFBLFFBQVEsRUFBRUM7QUFBWCxVQUFxQixNQUFNck4sT0FBTyxDQUFDb0IsS0FBUixDQUFja00sUUFBZCxDQUF1QkMsY0FBdkIsQ0FBc0MvTCxPQUF0QyxFQUErQ3hCLE9BQS9DLENBQWpDOztBQUNBaVQsa0JBQUdjLFVBQUgsQ0FDRXJHLGNBQUt2TCxJQUFMLENBQVVzTCxzREFBVixFQUF1REosTUFBdkQsRUFBK0Q3TCxPQUFPLENBQUMvQixNQUFSLENBQWUwRCxJQUE5RSxDQURGOztBQUdBLHVCQUFJLDhCQUFKLEVBQXFDLEdBQUUzQixPQUFPLENBQUMvQixNQUFSLENBQWUwRCxJQUFLLHFCQUEzRCxFQUFpRixNQUFqRjtBQUNBLGFBQU93SixRQUFRLENBQUN1QixFQUFULENBQVk7QUFDakJuQixRQUFBQSxJQUFJLEVBQUU7QUFBRTFLLFVBQUFBLEtBQUssRUFBRTtBQUFUO0FBRFcsT0FBWixDQUFQO0FBR0QsS0FWRCxDQVVFLE9BQU9BLEtBQVAsRUFBYztBQUNkLHVCQUFJLDhCQUFKLEVBQW9DQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQXJEO0FBQ0EsYUFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRHNLLFFBQWpELENBQVA7QUFDRDtBQUNGOztBQTM5RDZCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIENsYXNzIGZvciBXYXp1aCByZXBvcnRpbmcgY29udHJvbGxlclxuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IFdBWlVIX01PRFVMRVMgfSBmcm9tICcuLi8uLi9jb21tb24vd2F6dWgtbW9kdWxlcyc7XG5pbXBvcnQgKiBhcyBUaW1Tb3J0IGZyb20gJ3RpbXNvcnQnO1xuaW1wb3J0IHsgRXJyb3JSZXNwb25zZSB9IGZyb20gJy4uL2xpYi9lcnJvci1yZXNwb25zZSc7XG5pbXBvcnQgKiBhcyBWdWxuZXJhYmlsaXR5UmVxdWVzdCBmcm9tICcuLi9saWIvcmVwb3J0aW5nL3Z1bG5lcmFiaWxpdHktcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBPdmVydmlld1JlcXVlc3QgZnJvbSAnLi4vbGliL3JlcG9ydGluZy9vdmVydmlldy1yZXF1ZXN0JztcbmltcG9ydCAqIGFzIFJvb3RjaGVja1JlcXVlc3QgZnJvbSAnLi4vbGliL3JlcG9ydGluZy9yb290Y2hlY2stcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBQQ0lSZXF1ZXN0IGZyb20gJy4uL2xpYi9yZXBvcnRpbmcvcGNpLXJlcXVlc3QnO1xuaW1wb3J0ICogYXMgR0RQUlJlcXVlc3QgZnJvbSAnLi4vbGliL3JlcG9ydGluZy9nZHByLXJlcXVlc3QnO1xuaW1wb3J0ICogYXMgVFNDUmVxdWVzdCBmcm9tICcuLi9saWIvcmVwb3J0aW5nL3RzYy1yZXF1ZXN0JztcbmltcG9ydCAqIGFzIEF1ZGl0UmVxdWVzdCBmcm9tICcuLi9saWIvcmVwb3J0aW5nL2F1ZGl0LXJlcXVlc3QnO1xuaW1wb3J0ICogYXMgU3lzY2hlY2tSZXF1ZXN0IGZyb20gJy4uL2xpYi9yZXBvcnRpbmcvc3lzY2hlY2stcmVxdWVzdCc7XG5pbXBvcnQgUENJIGZyb20gJy4uL2ludGVncmF0aW9uLWZpbGVzL3BjaS1yZXF1aXJlbWVudHMtcGRmbWFrZSc7XG5pbXBvcnQgR0RQUiBmcm9tICcuLi9pbnRlZ3JhdGlvbi1maWxlcy9nZHByLXJlcXVpcmVtZW50cy1wZGZtYWtlJztcbmltcG9ydCBUU0MgZnJvbSAnLi4vaW50ZWdyYXRpb24tZmlsZXMvdHNjLXJlcXVpcmVtZW50cy1wZGZtYWtlJztcbmltcG9ydCBQcm9jZXNzRXF1aXZhbGVuY2UgZnJvbSAnLi4vbGliL3Byb2Nlc3Mtc3RhdGUtZXF1aXZhbGVuY2UnO1xuaW1wb3J0IHsgS2V5RXF1aXZhbGVuY2UgfSBmcm9tICcuLi8uLi9jb21tb24vY3N2LWtleS1lcXVpdmFsZW5jZSc7XG5pbXBvcnQgeyBBZ2VudENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9saWIvcmVwb3J0aW5nL2FnZW50LWNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgS2liYW5hUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXJDb250ZXh0LCBLaWJhbmFSZXNwb25zZUZhY3RvcnkgfSBmcm9tICdzcmMvY29yZS9zZXJ2ZXInO1xuaW1wb3J0IHsgUmVwb3J0UHJpbnRlciB9IGZyb20gJy4uL2xpYi9yZXBvcnRpbmcvcHJpbnRlcic7XG5cbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL2xpYi9sb2dnZXInO1xuaW1wb3J0IHsgV0FaVUhfQUxFUlRTX1BBVFRFUk4sIFdBWlVIX0RBVEFfRE9XTkxPQURTX0RJUkVDVE9SWV9QQVRILCBXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRIIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBjcmVhdGVEaXJlY3RvcnlJZk5vdEV4aXN0cywgY3JlYXRlRGF0YURpcmVjdG9yeUlmTm90RXhpc3RzIH0gZnJvbSAnLi4vbGliL2ZpbGVzeXN0ZW0nO1xuXG5cbmV4cG9ydCBjbGFzcyBXYXp1aFJlcG9ydGluZ0N0cmwge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLyoqXG4gICAqIFRoaXMgZG8gZm9ybWF0IHRvIGZpbHRlcnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZpbHRlcnMgRS5nOiBjbHVzdGVyLm5hbWU6IHdhenVoIEFORCBydWxlLmdyb3VwczogdnVsbmVyYWJpbGl0eVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VhcmNoQmFyIHNlYXJjaCB0ZXJtXG4gICAqL1xuICBwcml2YXRlIHNhbml0aXplS2liYW5hRmlsdGVycyhmaWx0ZXJzOiBhbnksIHNlYXJjaEJhcj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbG9nKCdyZXBvcnRpbmc6c2FuaXRpemVLaWJhbmFGaWx0ZXJzJywgYFN0YXJ0ZWQgdG8gc2FuaXRpemUgZmlsdGVyc2AsICdpbmZvJyk7XG4gICAgbG9nKFxuICAgICAgJ3JlcG9ydGluZzpzYW5pdGl6ZUtpYmFuYUZpbHRlcnMnLFxuICAgICAgYGZpbHRlcnM6ICR7ZmlsdGVycy5sZW5ndGh9LCBzZWFyY2hCYXI6ICR7c2VhcmNoQmFyfWAsXG4gICAgICAnZGVidWcnXG4gICAgKTtcbiAgICBsZXQgc3RyID0gJyc7XG5cbiAgICBjb25zdCBsZW4gPSBmaWx0ZXJzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCB7IG5lZ2F0ZSwga2V5LCB2YWx1ZSwgcGFyYW1zLCB0eXBlIH0gPSBmaWx0ZXJzW2ldLm1ldGE7XG4gICAgICBzdHIgKz0gYCR7bmVnYXRlID8gJ05PVCAnIDogJyd9YDtcbiAgICAgIHN0ciArPSBgJHtrZXl9OiBgO1xuICAgICAgc3RyICs9IGAke1xuICAgICAgICB0eXBlID09PSAncmFuZ2UnXG4gICAgICAgICAgPyBgJHtwYXJhbXMuZ3RlfS0ke3BhcmFtcy5sdH1gXG4gICAgICAgICAgOiAhIXZhbHVlXG4gICAgICAgICAgPyB2YWx1ZVxuICAgICAgICAgIDogKHBhcmFtcyB8fCB7fSkucXVlcnlcbiAgICAgIH1gO1xuICAgICAgc3RyICs9IGAke2kgPT09IGxlbiAtIDEgPyAnJyA6ICcgQU5EICd9YDtcbiAgICB9XG5cbiAgICBpZiAoc2VhcmNoQmFyKSB7XG4gICAgICBzdHIgKz0gJyBBTkQgJyArIHNlYXJjaEJhcjtcbiAgICB9XG4gICAgbG9nKCdyZXBvcnRpbmc6c2FuaXRpemVLaWJhbmFGaWx0ZXJzJywgYHN0cjogJHtzdHJ9YCwgJ2RlYnVnJyk7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHBlcmZvcm1zIHRoZSByZW5kZXJpbmcgb2YgZ2l2ZW4gaGVhZGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcmludGVyIHNlY3Rpb24gdGFyZ2V0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWN0aW9uIHNlY3Rpb24gdGFyZ2V0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0YWIgdGFiIHRhcmdldFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzQWdlbnRzIGlzIGFnZW50cyBzZWN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhcGlJZCBJRCBvZiBBUElcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVySGVhZGVyKGNvbnRleHQsIHByaW50ZXIsIHNlY3Rpb24sIHRhYiwgaXNBZ2VudHMsIGFwaUlkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvZyhcbiAgICAgICAgJ3JlcG9ydGluZzpyZW5kZXJIZWFkZXInLFxuICAgICAgICBgc2VjdGlvbjogJHtzZWN0aW9ufSwgdGFiOiAke3RhYn0sIGlzQWdlbnRzOiAke2lzQWdlbnRzfSwgYXBpSWQ6ICR7YXBpSWR9YCxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICAgIGlmIChzZWN0aW9uICYmIHR5cGVvZiBzZWN0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoIVsnYWdlbnRDb25maWcnLCdncm91cENvbmZpZyddLmluY2x1ZGVzKHNlY3Rpb24pKSB7XG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50KHtcbiAgICAgICAgICAgIHRleHQ6IFdBWlVIX01PRFVMRVNbdGFiXS50aXRsZSArICcgcmVwb3J0JyxcbiAgICAgICAgICAgIHN0eWxlOiAnaDEnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VjdGlvbiA9PT0gJ2FnZW50Q29uZmlnJykge1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudCh7XG4gICAgICAgICAgICB0ZXh0OiBgQWdlbnQgJHtpc0FnZW50c30gY29uZmlndXJhdGlvbmAsXG4gICAgICAgICAgICBzdHlsZTogJ2gxJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNlY3Rpb24gPT09ICdncm91cENvbmZpZycpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogJ0FnZW50cyBpbiBncm91cCcsXG4gICAgICAgICAgICBzdHlsZTogeyBmb250U2l6ZTogMTQsIGNvbG9yOiAnIzAwMCcgfSxcbiAgICAgICAgICAgIG1hcmdpbjogWzAsIDIwLCAwLCAwXVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChzZWN0aW9uID09PSAnZ3JvdXBDb25maWcnICYmICFPYmplY3Qua2V5cyhpc0FnZW50cykubGVuZ3RoKSB7XG4gICAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgICB0ZXh0OiAnVGhlcmUgYXJlIHN0aWxsIG5vIGFnZW50cyBpbiB0aGlzIGdyb3VwLicsXG4gICAgICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgY29sb3I6ICcjMDAwJyB9LFxuICAgICAgICAgICAgICBtYXJnaW46IFswLCAxMCwgMCwgMF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcmludGVyLmFkZE5ld0xpbmUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQWdlbnRzICYmIHR5cGVvZiBpc0FnZW50cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5idWlsZEFnZW50c1RhYmxlKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgcHJpbnRlcixcbiAgICAgICAgICBpc0FnZW50cyxcbiAgICAgICAgICBhcGlJZCxcbiAgICAgICAgICBzZWN0aW9uID09PSAnZ3JvdXBDb25maWcnID8gdGFiIDogZmFsc2VcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQWdlbnRzICYmIHR5cGVvZiBpc0FnZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgYWdlbnRSZXNwb25zZSA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLnJlcXVlc3QoXG4gICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgYC9hZ2VudHNgLFxuICAgICAgICAgIHsgcGFyYW1zOiB7IGFnZW50c19saXN0OiBpc0FnZW50cyB9fSxcbiAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWdlbnREYXRhID0gYWdlbnRSZXNwb25zZS5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXNbMF07XG4gICAgICAgIGlmIChhZ2VudERhdGEgJiYgYWdlbnREYXRhLnN0YXR1cyAhPT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgICB0ZXh0OiBgV2FybmluZy4gQWdlbnQgaXMgJHthZ2VudERhdGEuc3RhdHVzLnRvTG93ZXJDYXNlKCl9YCxcbiAgICAgICAgICAgIHN0eWxlOiAnc3RhbmRhcmQnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5idWlsZEFnZW50c1RhYmxlKGNvbnRleHQsIHByaW50ZXIsIFtpc0FnZW50c10sIGFwaUlkKTtcblxuICAgICAgICBpZiAoYWdlbnREYXRhICYmIGFnZW50RGF0YS5ncm91cCkge1xuICAgICAgICAgIGNvbnN0IGFnZW50R3JvdXBzID0gYWdlbnREYXRhLmdyb3VwLmpvaW4oJywgJyk7XG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoe1xuICAgICAgICAgICAgdGV4dDogYEdyb3VwJHthZ2VudERhdGEuZ3JvdXAubGVuZ3RoID4gMSA/ICdzJyA6ICcnfTogJHthZ2VudEdyb3Vwc31gLFxuICAgICAgICAgICAgc3R5bGU6ICdzdGFuZGFyZCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKFdBWlVIX01PRFVMRVNbdGFiXSAmJiBXQVpVSF9NT0RVTEVTW3RhYl0uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoe1xuICAgICAgICAgIHRleHQ6IFdBWlVIX01PRFVMRVNbdGFiXS5kZXNjcmlwdGlvbixcbiAgICAgICAgICBzdHlsZTogJ3N0YW5kYXJkJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3JlcG9ydGluZzpyZW5kZXJIZWFkZXInLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgYnVpbGQgdGhlIGFnZW50cyB0YWJsZVxuICAgKiBAcGFyYW0ge0FycmF5PFN0cmluZ3M+fSBpZHMgaWRzIG9mIGFnZW50c1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYXBpSWQgQVBJIGlkXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGJ1aWxkQWdlbnRzVGFibGUoY29udGV4dCwgcHJpbnRlcjogUmVwb3J0UHJpbnRlciwgYWdlbnRJRHM6IHN0cmluZ1tdLCBhcGlJZDogc3RyaW5nLCBtdWx0aSA9IGZhbHNlKSB7XG4gICAgaWYgKCFhZ2VudElEcyB8fCAhYWdlbnRJRHMubGVuZ3RoKSByZXR1cm47XG4gICAgbG9nKFxuICAgICAgJ3JlcG9ydGluZzpidWlsZEFnZW50c1RhYmxlJyxcbiAgICAgIGAke2FnZW50SURzLmxlbmd0aH0gYWdlbnRzIGZvciBBUEkgJHthcGlJZH1gLFxuICAgICAgJ2luZm8nXG4gICAgKTtcbiAgICB0cnkge1xuICAgICAgbGV0IGFnZW50Um93cyA9IFtdO1xuICAgICAgaWYgKG11bHRpKSB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBjb25zdCBhZ2VudHNSZXNwb25zZSA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLnJlcXVlc3QoXG4gICAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICAgIGAvZ3JvdXBzLyR7bXVsdGl9L2FnZW50c2AsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHthcGlIb3N0SUQ6IGFwaUlkfVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgYWdlbnRzRGF0YSA9IGFnZW50c1Jlc3BvbnNlICYmIGFnZW50c1Jlc3BvbnNlLmRhdGEgJiYgYWdlbnRzUmVzcG9uc2UuZGF0YS5kYXRhICYmIGFnZW50c1Jlc3BvbnNlLmRhdGEuZGF0YS5hZmZlY3RlZF9pdGVtcztcbiAgICAgICAgICBhZ2VudFJvd3MgPSAoYWdlbnRzRGF0YSB8fCBbXSkubWFwKGFnZW50ID0+ICh7XG4gICAgICAgICAgICAuLi5hZ2VudCxcbiAgICAgICAgICAgIG1hbmFnZXI6IGFnZW50Lm1hbmFnZXIgfHwgYWdlbnQubWFuYWdlcl9ob3N0LFxuICAgICAgICAgICAgb3M6IChhZ2VudC5vcyAmJiBhZ2VudC5vcy5uYW1lICYmIGFnZW50Lm9zLnZlcnNpb24pID8gYCR7YWdlbnQub3MubmFtZX0gJHthZ2VudC5vcy52ZXJzaW9ufWAgOiAnJ1xuICAgICAgICAgIH0pKTtcblxuICAgICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICAgIGxvZyhcbiAgICAgICAgICAgICdyZXBvcnRpbmc6YnVpbGRBZ2VudHNUYWJsZScsXG4gICAgICAgICAgICBgU2tpcCBhZ2VudCBkdWUgdG86ICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gLFxuICAgICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjb25zdCBhZ2VudElEIG9mIGFnZW50SURzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzcG9uc2UgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KFxuICAgICAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICAgICAgYC9hZ2VudHNgLFxuICAgICAgICAgICAgICB7cGFyYW1zOiB7cTpgaWQ9JHthZ2VudElEfWB9fSxcbiAgICAgICAgICAgICAge2FwaUhvc3RJRDogYXBpSWR9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgW2FnZW50XSA9IGFnZW50UmVzcG9uc2UuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zO1xuICAgICAgICAgICAgYWdlbnRSb3dzLnB1c2goe1xuICAgICAgICAgICAgICAuLi5hZ2VudCxcbiAgICAgICAgICAgICAgbWFuYWdlcjogYWdlbnQubWFuYWdlciB8fCBhZ2VudC5tYW5hZ2VyX2hvc3QsXG4gICAgICAgICAgICAgIG9zOiAoYWdlbnQub3MgJiYgYWdlbnQub3MubmFtZSAmJiBhZ2VudC5vcy52ZXJzaW9uKSA/IGAke2FnZW50Lm9zLm5hbWV9ICR7YWdlbnQub3MudmVyc2lvbn1gIDogJydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2coXG4gICAgICAgICAgICAgICdyZXBvcnRpbmc6YnVpbGRBZ2VudHNUYWJsZScsXG4gICAgICAgICAgICAgIGBTa2lwIGFnZW50IGR1ZSB0bzogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWAsXG4gICAgICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcmludGVyLmFkZFNpbXBsZVRhYmxlKHtcbiAgICAgICAgY29sdW1uczogW1xuICAgICAgICAgIHtpZDogJ2lkJywgbGFiZWw6ICdJRCd9LFxuICAgICAgICAgIHtpZDogJ25hbWUnLCBsYWJlbDogJ05hbWUnfSxcbiAgICAgICAgICB7aWQ6ICdpcCcsIGxhYmVsOiAnSVAnfSxcbiAgICAgICAgICB7aWQ6ICd2ZXJzaW9uJywgbGFiZWw6ICdWZXJzaW9uJ30sXG4gICAgICAgICAge2lkOiAnbWFuYWdlcicsIGxhYmVsOiAnTWFuYWdlcid9LFxuICAgICAgICAgIHtpZDogJ29zJywgbGFiZWw6ICdPUyd9LFxuICAgICAgICAgIHtpZDogJ2RhdGVBZGQnLCBsYWJlbDogJ1JlZ2lzdHJhdGlvbiBkYXRlJ30sXG4gICAgICAgICAge2lkOiAnbGFzdEtlZXBBbGl2ZScsIGxhYmVsOiAnTGFzdCBrZWVwIGFsaXZlJ30sXG4gICAgICAgIF0sXG4gICAgICAgIGl0ZW1zOiBhZ2VudFJvd3NcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3JlcG9ydGluZzpidWlsZEFnZW50c1RhYmxlJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGxvYWQgbW9yZSBpbmZvcm1hdGlvblxuICAgKiBAcGFyYW0geyp9IGNvbnRleHQgRW5kcG9pbnQgY29udGV4dFxuICAgKiBAcGFyYW0geyp9IHByaW50ZXIgcHJpbnRlciBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VjdGlvbiBzZWN0aW9uIHRhcmdldFxuICAgKiBAcGFyYW0ge09iamVjdH0gdGFiIHRhYiB0YXJnZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFwaUlkIElEIG9mIEFQSVxuICAgKiBAcGFyYW0ge051bWJlcn0gZnJvbSBUaW1lc3RhbXAgKG1zKSBmcm9tXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0byBUaW1lc3RhbXAgKG1zKSB0b1xuICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsdGVycyBFLmc6IGNsdXN0ZXIubmFtZTogd2F6dWggQU5EIHJ1bGUuZ3JvdXBzOiB2dWxuZXJhYmlsaXR5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhZ2VudCBhZ2VudCB0YXJnZXRcbiAgICogQHJldHVybnMge09iamVjdH0gRXh0ZW5kZWQgaW5mb3JtYXRpb25cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZXh0ZW5kZWRJbmZvcm1hdGlvbihcbiAgICBjb250ZXh0LFxuICAgIHByaW50ZXIsXG4gICAgc2VjdGlvbixcbiAgICB0YWIsXG4gICAgYXBpSWQsXG4gICAgZnJvbSxcbiAgICB0byxcbiAgICBmaWx0ZXJzLFxuICAgIHBhdHRlcm4gPSBXQVpVSF9BTEVSVFNfUEFUVEVSTixcbiAgICBhZ2VudCA9IG51bGxcbiAgKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvZyhcbiAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgYFNlY3Rpb24gJHtzZWN0aW9ufSBhbmQgdGFiICR7dGFifSwgQVBJIGlzICR7YXBpSWR9LiBGcm9tICR7ZnJvbX0gdG8gJHt0b30uIEZpbHRlcnMgJHtmaWx0ZXJzfS4gSW5kZXggcGF0dGVybiAke3BhdHRlcm59YCxcbiAgICAgICAgJ2luZm8nXG4gICAgICApO1xuICAgICAgaWYgKHNlY3Rpb24gPT09ICdhZ2VudHMnICYmICFhZ2VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1JlcG9ydGluZyBmb3Igc3BlY2lmaWMgYWdlbnQgbmVlZHMgYW4gYWdlbnQgSUQgaW4gb3JkZXIgdG8gd29yayBwcm9wZXJseSdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYWdlbnRzID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgJ0dFVCcsXG4gICAgICAgICcvYWdlbnRzJyxcbiAgICAgICAgeyBwYXJhbXM6IHtsaW1pdDogMSB9fSxcbiAgICAgICAge2FwaUhvc3RJRDogYXBpSWR9XG4gICAgICApO1xuXG4gICAgICBjb25zdCB0b3RhbEFnZW50cyA9IGFnZW50cy5kYXRhLmRhdGEudG90YWxfYWZmZWN0ZWRfaXRlbXM7XG5cbiAgICAgIGlmIChzZWN0aW9uID09PSAnb3ZlcnZpZXcnICYmIHRhYiA9PT0gJ3Z1bHMnKSB7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgICdGZXRjaGluZyBvdmVydmlldyB2dWxuZXJhYmlsaXR5IGRldGVjdG9yIG1ldHJpY3MnLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdnVsbmVyYWJpbGl0aWVzTGV2ZWxzID0gWydMb3cnLCAnTWVkaXVtJywgJ0hpZ2gnLCAnQ3JpdGljYWwnXTtcblxuICAgICAgICBjb25zdCB2dWxuZXJhYmlsaXRpZXNSZXNwb25zZXNDb3VudCA9IChhd2FpdCBQcm9taXNlLmFsbCh2dWxuZXJhYmlsaXRpZXNMZXZlbHMubWFwKGFzeW5jIHZ1bG5lcmFiaWxpdGllc0xldmVsID0+IHtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnVuaXF1ZVNldmVyaXR5Q291bnQoXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgIGZyb20sXG4gICAgICAgICAgICAgIHRvLFxuICAgICAgICAgICAgICB2dWxuZXJhYmlsaXRpZXNMZXZlbCxcbiAgICAgICAgICAgICAgZmlsdGVycyxcbiAgICAgICAgICAgICAgcGF0dGVyblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICAgICAgICA/IGAke2NvdW50fSBvZiAke3RvdGFsQWdlbnRzfSBhZ2VudHMgaGF2ZSAke3Z1bG5lcmFiaWxpdGllc0xldmVsLnRvTG9jYWxlTG93ZXJDYXNlKCl9IHZ1bG5lcmFiaWxpdGllcy5gXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgIH1jYXRjaChlcnJvcil7XG5cbiAgICAgICAgICB9O1xuICAgICAgICB9KSkpLmZpbHRlcih2dWxuZXJhYmlsaXRpZXNSZXNwb25zZSA9PiB2dWxuZXJhYmlsaXRpZXNSZXNwb25zZSk7XG5cbiAgICAgICAgcHJpbnRlci5hZGRMaXN0KHtcbiAgICAgICAgICB0aXRsZTogeyB0ZXh0OiAnU3VtbWFyeScsIHN0eWxlOiAnaDInIH0sXG4gICAgICAgICAgbGlzdDogdnVsbmVyYWJpbGl0aWVzUmVzcG9uc2VzQ291bnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0ZldGNoaW5nIG92ZXJ2aWV3IHZ1bG5lcmFiaWxpdHkgZGV0ZWN0b3IgdG9wIDMgYWdlbnRzIGJ5IGNhdGVnb3J5JyxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxvd1JhbmsgPSBhd2FpdCBWdWxuZXJhYmlsaXR5UmVxdWVzdC50b3BBZ2VudENvdW50KFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICAnTG93JyxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbWVkaXVtUmFuayA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnRvcEFnZW50Q291bnQoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgICdNZWRpdW0nLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBjb25zdCBoaWdoUmFuayA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnRvcEFnZW50Q291bnQoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgICdIaWdoJyxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY3JpdGljYWxSYW5rID0gYXdhaXQgVnVsbmVyYWJpbGl0eVJlcXVlc3QudG9wQWdlbnRDb3VudChcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgJ0NyaXRpY2FsJyxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0FkZGluZyBvdmVydmlldyB2dWxuZXJhYmlsaXR5IGRldGVjdG9yIHRvcCAzIGFnZW50cyBieSBjYXRlZ29yeScsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICBpZiAoY3JpdGljYWxSYW5rICYmIGNyaXRpY2FsUmFuay5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgICB0ZXh0OiAnVG9wIDMgYWdlbnRzIHdpdGggY3JpdGljYWwgc2V2ZXJpdHkgdnVsbmVyYWJpbGl0aWVzJyxcbiAgICAgICAgICAgIHN0eWxlOiAnaDMnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5idWlsZEFnZW50c1RhYmxlKGNvbnRleHQsIHByaW50ZXIsIGNyaXRpY2FsUmFuaywgYXBpSWQpO1xuICAgICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhpZ2hSYW5rICYmIGhpZ2hSYW5rLmxlbmd0aCkge1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICAgIHRleHQ6ICdUb3AgMyBhZ2VudHMgd2l0aCBoaWdoIHNldmVyaXR5IHZ1bG5lcmFiaWxpdGllcycsXG4gICAgICAgICAgICBzdHlsZTogJ2gzJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRBZ2VudHNUYWJsZShjb250ZXh0LCBwcmludGVyLCBoaWdoUmFuaywgYXBpSWQpO1xuICAgICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lZGl1bVJhbmsgJiYgbWVkaXVtUmFuay5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgICB0ZXh0OiAnVG9wIDMgYWdlbnRzIHdpdGggbWVkaXVtIHNldmVyaXR5IHZ1bG5lcmFiaWxpdGllcycsXG4gICAgICAgICAgICBzdHlsZTogJ2gzJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRBZ2VudHNUYWJsZShjb250ZXh0LCBwcmludGVyLCBtZWRpdW1SYW5rLCBhcGlJZCk7XG4gICAgICAgICAgcHJpbnRlci5hZGROZXdMaW5lKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobG93UmFuayAmJiBsb3dSYW5rLmxlbmd0aCkge1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICAgIHRleHQ6ICdUb3AgMyBhZ2VudHMgd2l0aCBsb3cgc2V2ZXJpdHkgdnVsbmVyYWJpbGl0aWVzJyxcbiAgICAgICAgICAgIHN0eWxlOiAnaDMnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5idWlsZEFnZW50c1RhYmxlKGNvbnRleHQsIHByaW50ZXIsIGxvd1JhbmssIGFwaUlkKTtcbiAgICAgICAgICBwcmludGVyLmFkZE5ld0xpbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgICdGZXRjaGluZyBvdmVydmlldyB2dWxuZXJhYmlsaXR5IGRldGVjdG9yIHRvcCAzIENWRXMnLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY3ZlUmFuayA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnRvcENWRUNvdW50KFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0FkZGluZyBvdmVydmlldyB2dWxuZXJhYmlsaXR5IGRldGVjdG9yIHRvcCAzIENWRXMnLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGN2ZVJhbmsgJiYgY3ZlUmFuay5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZFNpbXBsZVRhYmxlKHtcbiAgICAgICAgICAgIHRpdGxlOiB7IHRleHQ6ICdUb3AgMyBDVkUnLCBzdHlsZTogJ2gyJyB9LFxuICAgICAgICAgICAgY29sdW1uczogW3tpZDogJ3RvcCcsIGxhYmVsOiAnVG9wJ30sIHtpZDogJ2N2ZScsIGxhYmVsOiAnQ1ZFJ31dLFxuICAgICAgICAgICAgaXRlbXM6IGN2ZVJhbmsubWFwKGl0ZW0gPT4gKHsgdG9wOiBjdmVSYW5rLmluZGV4T2YoaXRlbSkgKyAxLCBjdmU6IGl0ZW0gfSkpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNlY3Rpb24gPT09ICdvdmVydmlldycgJiYgdGFiID09PSAnZ2VuZXJhbCcpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0ZldGNoaW5nIHRvcCAzIGFnZW50cyB3aXRoIGxldmVsIDE1IGFsZXJ0cycsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGxldmVsMTVSYW5rID0gYXdhaXQgT3ZlcnZpZXdSZXF1ZXN0LnRvcExldmVsMTUoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuXG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgICdBZGRpbmcgdG9wIDMgYWdlbnRzIHdpdGggbGV2ZWwgMTUgYWxlcnRzJyxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGlmIChsZXZlbDE1UmFuay5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogJ1RvcCAzIGFnZW50cyB3aXRoIGxldmVsIDE1IGFsZXJ0cycsXG4gICAgICAgICAgICBzdHlsZTogJ2gyJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRBZ2VudHNUYWJsZShjb250ZXh0LCBwcmludGVyLCBsZXZlbDE1UmFuaywgYXBpSWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWN0aW9uID09PSAnb3ZlcnZpZXcnICYmIHRhYiA9PT0gJ3BtJykge1xuICAgICAgICBsb2coXG4gICAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAnRmV0Y2hpbmcgbW9zdCBjb21tb24gcm9vdGtpdHMnLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdG9wNVJvb3RraXRzUmFuayA9IGF3YWl0IFJvb3RjaGVja1JlcXVlc3QudG9wNVJvb3RraXRzRGV0ZWN0ZWQoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBsb2coXG4gICAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAnQWRkaW5nIG1vc3QgY29tbW9uIHJvb3RraXRzJyxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGlmICh0b3A1Um9vdGtpdHNSYW5rICYmIHRvcDVSb290a2l0c1JhbmsubGVuZ3RoKSB7XG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoe1xuICAgICAgICAgICAgdGV4dDogJ01vc3QgY29tbW9uIHJvb3RraXRzIGZvdW5kIGFtb25nIHlvdXIgYWdlbnRzJyxcbiAgICAgICAgICAgIHN0eWxlOiAnaDInXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICAgIHRleHQ6XG4gICAgICAgICAgICAgICdSb290a2l0cyBhcmUgYSBzZXQgb2Ygc29mdHdhcmUgdG9vbHMgdGhhdCBlbmFibGUgYW4gdW5hdXRob3JpemVkIHVzZXIgdG8gZ2FpbiBjb250cm9sIG9mIGEgY29tcHV0ZXIgc3lzdGVtIHdpdGhvdXQgYmVpbmcgZGV0ZWN0ZWQuJyxcbiAgICAgICAgICAgIHN0eWxlOiAnc3RhbmRhcmQnXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYWRkU2ltcGxlVGFibGUoe1xuICAgICAgICAgICAgaXRlbXM6IHRvcDVSb290a2l0c1JhbmsubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICByZXR1cm4geyB0b3A6IHRvcDVSb290a2l0c1JhbmsuaW5kZXhPZihpdGVtKSArIDEsIG5hbWU6IGl0ZW0gfTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29sdW1uczogW3tpZDogJ3RvcCcsIGxhYmVsOiAnVG9wJ30sIHtpZDogJ25hbWUnLCBsYWJlbDogJ1Jvb3RraXQnfV1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsb2coJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJywgJ0ZldGNoaW5nIGhpZGRlbiBwaWRzJywgJ2RlYnVnJyk7XG4gICAgICAgIGNvbnN0IGhpZGRlblBpZHMgPSBhd2FpdCBSb290Y2hlY2tSZXF1ZXN0LmFnZW50c1dpdGhIaWRkZW5QaWRzKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgaGlkZGVuUGlkcyAmJlxuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudCh7XG4gICAgICAgICAgICB0ZXh0OiBgJHtoaWRkZW5QaWRzfSBvZiAke3RvdGFsQWdlbnRzfSBhZ2VudHMgaGF2ZSBoaWRkZW4gcHJvY2Vzc2VzYCxcbiAgICAgICAgICAgIHN0eWxlOiAnaDMnXG4gICAgICAgICAgfSk7XG4gICAgICAgICFoaWRkZW5QaWRzICYmXG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoe1xuICAgICAgICAgICAgdGV4dDogYE5vIGFnZW50cyBoYXZlIGhpZGRlbiBwcm9jZXNzZXNgLFxuICAgICAgICAgICAgc3R5bGU6ICdoMydcbiAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBoaWRkZW5Qb3J0cyA9IGF3YWl0IFJvb3RjaGVja1JlcXVlc3QuYWdlbnRzV2l0aEhpZGRlblBvcnRzKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgaGlkZGVuUG9ydHMgJiZcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogYCR7aGlkZGVuUG9ydHN9IG9mICR7dG90YWxBZ2VudHN9IGFnZW50cyBoYXZlIGhpZGRlbiBwb3J0c2AsXG4gICAgICAgICAgICBzdHlsZTogJ2gzJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAhaGlkZGVuUG9ydHMgJiZcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogYE5vIGFnZW50cyBoYXZlIGhpZGRlbiBwb3J0c2AsXG4gICAgICAgICAgICBzdHlsZTogJ2gzJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoWydvdmVydmlldycsICdhZ2VudHMnXS5pbmNsdWRlcyhzZWN0aW9uKSAmJiB0YWIgPT09ICdwY2knKSB7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgICdGZXRjaGluZyB0b3AgUENJIERTUyByZXF1aXJlbWVudHMnLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdG9wUGNpUmVxdWlyZW1lbnRzID0gYXdhaXQgUENJUmVxdWVzdC50b3BQQ0lSZXF1aXJlbWVudHMoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgdGV4dDogJ01vc3QgY29tbW9uIFBDSSBEU1MgcmVxdWlyZW1lbnRzIGFsZXJ0cyBmb3VuZCcsXG4gICAgICAgICAgc3R5bGU6ICdoMidcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0b3BQY2lSZXF1aXJlbWVudHMpIHtcbiAgICAgICAgICBjb25zdCBydWxlcyA9IGF3YWl0IFBDSVJlcXVlc3QuZ2V0UnVsZXNCeVJlcXVpcmVtZW50KFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGZyb20sXG4gICAgICAgICAgICB0byxcbiAgICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgcGF0dGVyblxuICAgICAgICAgICk7XG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoeyB0ZXh0OiBgUmVxdWlyZW1lbnQgJHtpdGVtfWAsIHN0eWxlOiAnaDMnIH0pO1xuXG4gICAgICAgICAgaWYgKFBDSVtpdGVtXSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9XG4gICAgICAgICAgICAgIHR5cGVvZiBQQ0lbaXRlbV0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgPyB7IHRleHQ6IFBDSVtpdGVtXSwgc3R5bGU6ICdzdGFuZGFyZCcgfVxuICAgICAgICAgICAgICAgIDogUENJW2l0ZW1dO1xuICAgICAgICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKGNvbnRlbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJ1bGVzICYmXG4gICAgICAgICAgICBydWxlcy5sZW5ndGggJiZcbiAgICAgICAgICAgIHByaW50ZXIuYWRkU2ltcGxlVGFibGUoe1xuICAgICAgICAgICAgICBjb2x1bW5zOiBbe2lkOiAncnVsZUlkJywgbGFiZWw6ICdSdWxlIElEJ30sIHtpZDogJ3J1bGVEZXNjcmlwdGlvbicsIGxhYmVsOiAnRGVzY3JpcHRpb24nfV0sXG4gICAgICAgICAgICAgIGl0ZW1zOiBydWxlcyxcbiAgICAgICAgICAgICAgdGl0bGU6IGBUb3AgcnVsZXMgZm9yICR7aXRlbX0gcmVxdWlyZW1lbnRgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoWydvdmVydmlldycsICdhZ2VudHMnXS5pbmNsdWRlcyhzZWN0aW9uKSAmJiB0YWIgPT09ICd0c2MnKSB7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgICdGZXRjaGluZyB0b3AgVFNDIHJlcXVpcmVtZW50cycsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCB0b3BUU0NSZXF1aXJlbWVudHMgPSBhd2FpdCBUU0NSZXF1ZXN0LnRvcFRTQ1JlcXVpcmVtZW50cyhcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgZmlsdGVycyxcbiAgICAgICAgICBwYXR0ZXJuXG4gICAgICAgICk7XG4gICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICB0ZXh0OiAnTW9zdCBjb21tb24gVFNDIHJlcXVpcmVtZW50cyBhbGVydHMgZm91bmQnLFxuICAgICAgICAgIHN0eWxlOiAnaDInXG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9wVFNDUmVxdWlyZW1lbnRzKSB7XG4gICAgICAgICAgY29uc3QgcnVsZXMgPSBhd2FpdCBUU0NSZXF1ZXN0LmdldFJ1bGVzQnlSZXF1aXJlbWVudChcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBmcm9tLFxuICAgICAgICAgICAgdG8sXG4gICAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgICApO1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHsgdGV4dDogYFJlcXVpcmVtZW50ICR7aXRlbX1gLCBzdHlsZTogJ2gzJyB9KTtcblxuICAgICAgICAgIGlmIChUU0NbaXRlbV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPVxuICAgICAgICAgICAgICB0eXBlb2YgVFNDW2l0ZW1dID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgID8geyB0ZXh0OiBUU0NbaXRlbV0sIHN0eWxlOiAnc3RhbmRhcmQnIH1cbiAgICAgICAgICAgICAgICA6IFRTQ1tpdGVtXTtcbiAgICAgICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoY29udGVudClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBydWxlcyAmJlxuICAgICAgICAgICAgcnVsZXMubGVuZ3RoICYmXG4gICAgICAgICAgICBwcmludGVyLmFkZFNpbXBsZVRhYmxlKHtcbiAgICAgICAgICAgICAgY29sdW1uczogW3tpZDogJ3J1bGVJZCcsIGxhYmVsOiAnUnVsZSBJRCd9LCB7aWQ6ICdydWxlRGVzY3JpcHRpb24nLCBsYWJlbDogJ0Rlc2NyaXB0aW9uJ31dLFxuICAgICAgICAgICAgICBpdGVtczogcnVsZXMsXG4gICAgICAgICAgICAgIHRpdGxlOiBgVG9wIHJ1bGVzIGZvciAke2l0ZW19IHJlcXVpcmVtZW50YFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKFsnb3ZlcnZpZXcnLCAnYWdlbnRzJ10uaW5jbHVkZXMoc2VjdGlvbikgJiYgdGFiID09PSAnZ2RwcicpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0ZldGNoaW5nIHRvcCBHRFBSIHJlcXVpcmVtZW50cycsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCB0b3BHZHByUmVxdWlyZW1lbnRzID0gYXdhaXQgR0RQUlJlcXVlc3QudG9wR0RQUlJlcXVpcmVtZW50cyhcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgZmlsdGVycyxcbiAgICAgICAgICBwYXR0ZXJuXG4gICAgICAgICk7XG4gICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICB0ZXh0OiAnTW9zdCBjb21tb24gR0RQUiByZXF1aXJlbWVudHMgYWxlcnRzIGZvdW5kJyxcbiAgICAgICAgICBzdHlsZTogJ2gyJ1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRvcEdkcHJSZXF1aXJlbWVudHMpIHtcbiAgICAgICAgICBjb25zdCBydWxlcyA9IGF3YWl0IEdEUFJSZXF1ZXN0LmdldFJ1bGVzQnlSZXF1aXJlbWVudChcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBmcm9tLFxuICAgICAgICAgICAgdG8sXG4gICAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgICApO1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHsgdGV4dDogYFJlcXVpcmVtZW50ICR7aXRlbX1gLCBzdHlsZTogJ2gzJyB9KTtcblxuICAgICAgICAgIGlmIChHRFBSICYmIEdEUFJbaXRlbV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPVxuICAgICAgICAgICAgICB0eXBlb2YgR0RQUltpdGVtXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICA/IHsgdGV4dDogR0RQUltpdGVtXSwgc3R5bGU6ICdzdGFuZGFyZCcgfVxuICAgICAgICAgICAgICAgIDogR0RQUltpdGVtXTtcbiAgICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKGNvbnRlbnQpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcnVsZXMgJiZcbiAgICAgICAgICAgIHJ1bGVzLmxlbmd0aCAmJlxuICAgICAgICAgICAgcHJpbnRlci5hZGRTaW1wbGVUYWJsZSh7XG4gICAgICAgICAgICAgIGNvbHVtbnM6IFt7aWQ6ICdydWxlSWQnLCBsYWJlbDogJ1J1bGUgSUQnfSwge2lkOiAncnVsZURlc2NyaXB0aW9uJywgbGFiZWw6ICdEZXNjcmlwdGlvbid9XSxcbiAgICAgICAgICAgICAgaXRlbXM6IHJ1bGVzLFxuICAgICAgICAgICAgICB0aXRsZTogYFRvcCBydWxlcyBmb3IgJHtpdGVtfSByZXF1aXJlbWVudGBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VjdGlvbiA9PT0gJ292ZXJ2aWV3JyAmJiB0YWIgPT09ICdhdWRpdCcpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0ZldGNoaW5nIGFnZW50cyB3aXRoIGhpZ2ggbnVtYmVyIG9mIGZhaWxlZCBzdWRvIGNvbW1hbmRzJyxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGF1ZGl0QWdlbnRzTm9uU3VjY2VzcyA9IGF3YWl0IEF1ZGl0UmVxdWVzdC5nZXRUb3AzQWdlbnRzU3Vkb05vblN1Y2Nlc3NmdWwoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBpZiAoYXVkaXRBZ2VudHNOb25TdWNjZXNzICYmIGF1ZGl0QWdlbnRzTm9uU3VjY2Vzcy5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogJ0FnZW50cyB3aXRoIGhpZ2ggbnVtYmVyIG9mIGZhaWxlZCBzdWRvIGNvbW1hbmRzJyxcbiAgICAgICAgICAgIHN0eWxlOiAnaDInXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5idWlsZEFnZW50c1RhYmxlKGNvbnRleHQsIHByaW50ZXIsIGF1ZGl0QWdlbnRzTm9uU3VjY2VzcywgYXBpSWQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF1ZGl0QWdlbnRzRmFpbGVkU3lzY2FsbCA9IGF3YWl0IEF1ZGl0UmVxdWVzdC5nZXRUb3AzQWdlbnRzRmFpbGVkU3lzY2FsbHMoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBpZiAoYXVkaXRBZ2VudHNGYWlsZWRTeXNjYWxsICYmIGF1ZGl0QWdlbnRzRmFpbGVkU3lzY2FsbC5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZFNpbXBsZVRhYmxlKHtcbiAgICAgICAgICAgIGNvbHVtbnM6IFt7aWQ6ICdhZ2VudCcsIGxhYmVsOiAnQWdlbnQgSUQnfSwge2lkOiAnc3lzY2FsbF9pZCcsIGxhYmVsOiAnU3lzY2FsbCBJRCd9LCB7aWQ6ICdzeXNjYWxsX3N5c2NhbGwnLCBsYWJlbDogJ1N5c2NhbGwnfV0sXG4gICAgICAgICAgICBpdGVtczogYXVkaXRBZ2VudHNGYWlsZWRTeXNjYWxsLm1hcChpdGVtID0+ICh7IGFnZW50OiBpdGVtLmFnZW50LCBzeXNjYWxsX2lkOiBpdGVtLnN5c2NhbGwuaWQsIHN5c2NhbGxfc3lzY2FsbDogaXRlbS5zeXNjYWxsLnN5c2NhbGx9KSksXG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICB0ZXh0OiAnTW9zdCBjb21tb24gZmFpbGluZyBzeXNjYWxscycsXG4gICAgICAgICAgICAgIHN0eWxlOiAnaDInXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNlY3Rpb24gPT09ICdvdmVydmlldycgJiYgdGFiID09PSAnZmltJykge1xuICAgICAgICBsb2coXG4gICAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAnRmV0Y2hpbmcgdG9wIDMgcnVsZXMgZm9yIEZJTScsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBydWxlcyA9IGF3YWl0IFN5c2NoZWNrUmVxdWVzdC50b3AzUnVsZXMoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChydWxlcyAmJiBydWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyXG4gICAgICAgICAgICAuYWRkQ29udGVudFdpdGhOZXdMaW5lKHsgdGV4dDogJ1RvcCAzIEZJTSBydWxlcycsIHN0eWxlOiAnaDInIH0pXG4gICAgICAgICAgICAuYWRkU2ltcGxlVGFibGUoe1xuICAgICAgICAgICAgICBjb2x1bW5zOiBbe2lkOiAncnVsZUlkJywgbGFiZWw6ICdSdWxlIElEJ30sIHtpZDogJ3J1bGVEZXNjcmlwdGlvbicsIGxhYmVsOiAnRGVzY3JpcHRpb24nfV0sXG4gICAgICAgICAgICAgIGl0ZW1zOiBydWxlcyxcbiAgICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnVG9wIDMgcnVsZXMgdGhhdCBhcmUgZ2VuZXJhdGluZyBtb3N0IGFsZXJ0cy4nLFxuICAgICAgICAgICAgICAgIHN0eWxlOiAnc3RhbmRhcmQnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgJ0ZldGNoaW5nIHRvcCAzIGFnZW50cyBmb3IgRklNJyxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGFnZW50cyA9IGF3YWl0IFN5c2NoZWNrUmVxdWVzdC50b3AzYWdlbnRzKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoYWdlbnRzICYmIGFnZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgICB0ZXh0OiAnQWdlbnRzIHdpdGggc3VzcGljaW91cyBGSU0gYWN0aXZpdHknLFxuICAgICAgICAgICAgc3R5bGU6ICdoMidcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7XG4gICAgICAgICAgICB0ZXh0OlxuICAgICAgICAgICAgICAnVG9wIDMgYWdlbnRzIHRoYXQgaGF2ZSBtb3N0IEZJTSBhbGVydHMgZnJvbSBsZXZlbCA3IHRvIGxldmVsIDE1LiBUYWtlIGNhcmUgYWJvdXQgdGhlbS4nLFxuICAgICAgICAgICAgc3R5bGU6ICdzdGFuZGFyZCdcbiAgICAgICAgICB9KVxuICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRBZ2VudHNUYWJsZShjb250ZXh0LCBwcmludGVyLCBhZ2VudHMsIGFwaUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2VjdGlvbiA9PT0gJ2FnZW50cycgJiYgdGFiID09PSAnYXVkaXQnKSB7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmV4dGVuZGVkSW5mb3JtYXRpb24nLFxuICAgICAgICAgIGBGZXRjaGluZyBtb3N0IGNvbW1vbiBmYWlsZWQgc3lzY2FsbHNgLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYXVkaXRGYWlsZWRTeXNjYWxsID0gYXdhaXQgQXVkaXRSZXF1ZXN0LmdldFRvcEZhaWxlZFN5c2NhbGxzKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgYXVkaXRGYWlsZWRTeXNjYWxsICYmXG4gICAgICAgICAgYXVkaXRGYWlsZWRTeXNjYWxsLmxlbmd0aCAmJlxuICAgICAgICAgIHByaW50ZXIuYWRkU2ltcGxlVGFibGUoe1xuICAgICAgICAgICAgY29sdW1uczogW3tpZDogJ2lkJywgbGFiZWw6ICdpZCd9LCB7aWQ6ICdzeXNjYWxsJywgbGFiZWw6ICdTeXNjYWxsJ31dLFxuICAgICAgICAgICAgaXRlbXM6IGF1ZGl0RmFpbGVkU3lzY2FsbCxcbiAgICAgICAgICAgIHRpdGxlOiAnTW9zdCBjb21tb24gZmFpbGluZyBzeXNjYWxscydcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlY3Rpb24gPT09ICdhZ2VudHMnICYmIHRhYiA9PT0gJ2ZpbScpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgYEZldGNoaW5nIHN5c2NoZWNrIGRhdGFiYXNlIGZvciBhZ2VudCAke2FnZW50fWAsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGxhc3RTY2FuUmVzcG9uc2UgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KFxuICAgICAgICAgICdHRVQnLFxuICAgICAgICAgIGAvc3lzY2hlY2svJHthZ2VudH0vbGFzdF9zY2FuYCxcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobGFzdFNjYW5SZXNwb25zZSAmJiBsYXN0U2NhblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICBjb25zdCBsYXN0U2NhbkRhdGEgPSBsYXN0U2NhblJlc3BvbnNlLmRhdGEuZGF0YS5hZmZlY3RlZF9pdGVtc1swXTtcbiAgICAgICAgICBpZiAobGFzdFNjYW5EYXRhLnN0YXJ0ICYmIGxhc3RTY2FuRGF0YS5lbmQpIHtcbiAgICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudCh7XG4gICAgICAgICAgICAgIHRleHQ6IGBMYXN0IGZpbGUgaW50ZWdyaXR5IG1vbml0b3Jpbmcgc2NhbiB3YXMgZXhlY3V0ZWQgZnJvbSAke2xhc3RTY2FuRGF0YS5zdGFydH0gdG8gJHtsYXN0U2NhbkRhdGEuZW5kfS5gXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RTY2FuRGF0YS5zdGFydCkge1xuICAgICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50KHtcbiAgICAgICAgICAgICAgdGV4dDogYEZpbGUgaW50ZWdyaXR5IG1vbml0b3Jpbmcgc2NhbiBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MgZm9yIHRoaXMgYWdlbnQgKHN0YXJ0ZWQgb24gJHtsYXN0U2NhbkRhdGEuc3RhcnR9KS5gXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50KHtcbiAgICAgICAgICAgICAgdGV4dDogYEZpbGUgaW50ZWdyaXR5IG1vbml0b3Jpbmcgc2NhbiBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MgZm9yIHRoaXMgYWdlbnQuYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgYEZldGNoaW5nIGxhc3QgMTAgZGVsZXRlZCBmaWxlcyBmb3IgRklNYCxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxhc3RUZW5EZWxldGVkID0gYXdhaXQgU3lzY2hlY2tSZXF1ZXN0Lmxhc3RUZW5EZWxldGVkRmlsZXMoXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBmcm9tLFxuICAgICAgICAgIHRvLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuXG4gICAgICAgIGxhc3RUZW5EZWxldGVkICYmXG4gICAgICAgICAgbGFzdFRlbkRlbGV0ZWQubGVuZ3RoICYmXG4gICAgICAgICAgcHJpbnRlci5hZGRTaW1wbGVUYWJsZSh7XG4gICAgICAgICAgICBjb2x1bW5zOiBbe2lkOiAncGF0aCcsIGxhYmVsOiAnUGF0aCd9LCB7aWQ6ICdkYXRlJywgbGFiZWw6ICdEYXRlJ31dLFxuICAgICAgICAgICAgaXRlbXM6IGxhc3RUZW5EZWxldGVkLFxuICAgICAgICAgICAgdGl0bGU6ICdMYXN0IDEwIGRlbGV0ZWQgZmlsZXMnXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgYEZldGNoaW5nIGxhc3QgMTAgbW9kaWZpZWQgZmlsZXNgLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbGFzdFRlbk1vZGlmaWVkID0gYXdhaXQgU3lzY2hlY2tSZXF1ZXN0Lmxhc3RUZW5Nb2RpZmllZEZpbGVzKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcblxuICAgICAgICBsYXN0VGVuTW9kaWZpZWQgJiZcbiAgICAgICAgICBsYXN0VGVuTW9kaWZpZWQubGVuZ3RoICYmXG4gICAgICAgICAgcHJpbnRlci5hZGRTaW1wbGVUYWJsZSh7XG4gICAgICAgICAgICBjb2x1bW5zOiBbe2lkOiAncGF0aCcsIGxhYmVsOiAnUGF0aCd9LCB7aWQ6ICdkYXRlJywgbGFiZWw6ICdEYXRlJ31dLFxuICAgICAgICAgICAgaXRlbXM6IGxhc3RUZW5Nb2RpZmllZCxcbiAgICAgICAgICAgIHRpdGxlOiAnTGFzdCAxMCBtb2RpZmllZCBmaWxlcydcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlY3Rpb24gPT09ICdhZ2VudHMnICYmIHRhYiA9PT0gJ3N5c2NvbGxlY3RvcicpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgYEZldGNoaW5nIGhhcmR3YXJlIGluZm9ybWF0aW9uIGZvciBhZ2VudCAke2FnZW50fWAsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCByZXF1ZXN0c1N5c2NvbGxlY3Rvckxpc3RzID0gW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGVuZHBvaW50OiBgL3N5c2NvbGxlY3Rvci8ke2FnZW50fS9oYXJkd2FyZWAsXG4gICAgICAgICAgICBsb2dnZXJNZXNzYWdlOiBgRmV0Y2hpbmcgSGFyZHdhcmUgaW5mb3JtYXRpb24gZm9yIGFnZW50ICR7YWdlbnR9YCxcbiAgICAgICAgICAgIGxpc3Q6IHtcbiAgICAgICAgICAgICAgdGl0bGU6IHsgdGV4dDogJ0hhcmR3YXJlIGluZm9ybWF0aW9uJywgc3R5bGU6ICdoMicgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXBSZXNwb25zZTogaGFyZHdhcmUgPT4gKFtcbiAgICAgICAgICAgICAgaGFyZHdhcmUuY3B1ICYmIGhhcmR3YXJlLmNwdS5jb3JlcyAmJiBgJHtoYXJkd2FyZS5jcHUuY29yZXN9IGNvcmVzYCxcbiAgICAgICAgICAgICAgaGFyZHdhcmUuY3B1ICYmIGhhcmR3YXJlLmNwdS5uYW1lLFxuICAgICAgICAgICAgICBoYXJkd2FyZS5yYW0gJiYgaGFyZHdhcmUucmFtLnRvdGFsICYmIGAke051bWJlcihoYXJkd2FyZS5yYW0udG90YWwgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgyKX1HQiBSQU1gLFxuICAgICAgICAgICAgXSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGVuZHBvaW50OiBgL3N5c2NvbGxlY3Rvci8ke2FnZW50fS9vc2AsXG4gICAgICAgICAgICBsb2dnZXJNZXNzYWdlOiBgRmV0Y2hpbmcgT1MgaW5mb3JtYXRpb24gZm9yIGFnZW50ICR7YWdlbnR9YCxcbiAgICAgICAgICAgIGxpc3Q6IHtcbiAgICAgICAgICAgICAgdGl0bGU6IHsgdGV4dDogJ09TIGluZm9ybWF0aW9uJywgc3R5bGU6ICdoMicgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXBSZXNwb25zZTogb3NEYXRhID0+IChbXG4gICAgICAgICAgICAgIG9zRGF0YS5zeXNuYW1lLFxuICAgICAgICAgICAgICBvc0RhdGEudmVyc2lvbixcbiAgICAgICAgICAgICAgb3NEYXRhLmFyY2hpdGVjdHVyZSxcbiAgICAgICAgICAgICAgb3NEYXRhLnJlbGVhc2UsXG4gICAgICAgICAgICAgIG9zRGF0YS5vcyAmJiBvc0RhdGEub3MubmFtZSAmJiBvc0RhdGEub3MudmVyc2lvbiAmJiBgJHtvc0RhdGEub3MubmFtZX0gJHtvc0RhdGEub3MudmVyc2lvbn1gLFxuICAgICAgICAgICAgXSlcbiAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3Qgc3lzY29sbGVjdG9yTGlzdHMgPSBhd2FpdCBQcm9taXNlLmFsbChyZXF1ZXN0c1N5c2NvbGxlY3Rvckxpc3RzLm1hcChhc3luYyByZXF1ZXN0U3lzY29sbGVjdG9yID0+IHtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBsb2coXG4gICAgICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgICAgIHJlcXVlc3RTeXNjb2xsZWN0b3IubG9nZ2VyTWVzc2FnZSxcbiAgICAgICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlU3lzY29sbGVjdG9yID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgICAgIHJlcXVlc3RTeXNjb2xsZWN0b3IuZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBbZGF0YV0gPSByZXNwb25zZVN5c2NvbGxlY3RvciAmJiByZXNwb25zZVN5c2NvbGxlY3Rvci5kYXRhICYmIHJlc3BvbnNlU3lzY29sbGVjdG9yLmRhdGEuZGF0YSAmJiByZXNwb25zZVN5c2NvbGxlY3Rvci5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXMgfHwgW107XG4gICAgICAgICAgICBpZihkYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5yZXF1ZXN0U3lzY29sbGVjdG9yLmxpc3QsXG4gICAgICAgICAgICAgICAgbGlzdDogcmVxdWVzdFN5c2NvbGxlY3Rvci5tYXBSZXNwb25zZShkYXRhKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgICAgICBsb2coXG4gICAgICAgICAgICAgICdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsXG4gICAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3JcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgaWYoc3lzY29sbGVjdG9yTGlzdHMpe1xuICAgICAgICAgIHN5c2NvbGxlY3Rvckxpc3RzLmZpbHRlcihzeXNjb2xsZWN0b3JMaXN0ID0+IHN5c2NvbGxlY3Rvckxpc3QpLmZvckVhY2goc3lzY29sbGVjdG9yTGlzdCA9PiBwcmludGVyLmFkZExpc3Qoc3lzY29sbGVjdG9yTGlzdCkpXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdnVsbmVyYWJpbGl0aWVzUmVxdWVzdHMgPSBbJ0NyaXRpY2FsJywgJ0hpZ2gnXTtcblxuICAgICAgICBjb25zdCB2dWxuZXJhYmlsaXRpZXNSZXNwb25zZXNJdGVtcyA9IChhd2FpdCBQcm9taXNlLmFsbCh2dWxuZXJhYmlsaXRpZXNSZXF1ZXN0cy5tYXAoYXN5bmMgdnVsbmVyYWJpbGl0aWVzTGV2ZWwgPT4ge1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIGxvZyhcbiAgICAgICAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgYEZldGNoaW5nIHRvcCAke3Z1bG5lcmFiaWxpdGllc0xldmVsfSBwYWNrYWdlc2AsXG4gICAgICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBWdWxuZXJhYmlsaXR5UmVxdWVzdC50b3BQYWNrYWdlcyhcbiAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgZnJvbSxcbiAgICAgICAgICAgICAgdG8sXG4gICAgICAgICAgICAgIHZ1bG5lcmFiaWxpdGllc0xldmVsLFxuICAgICAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgICAgICBwYXR0ZXJuXG4gICAgICAgICAgICApXG4gICAgICAgICAgfWNhdGNoKGVycm9yKXtcbiAgICAgICAgICAgIGxvZyhcbiAgICAgICAgICAgICAgJ3JlcG9ydGluZzpleHRlbmRlZEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZSB8fCBlcnJvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKSkuZmlsdGVyKHZ1bG5lcmFiaWxpdGllc1Jlc3BvbnNlID0+IHZ1bG5lcmFiaWxpdGllc1Jlc3BvbnNlKS5mbGF0KCk7XG5cbiAgICAgICAgaWYgKHZ1bG5lcmFiaWxpdGllc1Jlc3BvbnNlc0l0ZW1zICYmIHZ1bG5lcmFiaWxpdGllc1Jlc3BvbnNlc0l0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgIHByaW50ZXIuYWRkU2ltcGxlVGFibGUoe1xuICAgICAgICAgICAgdGl0bGU6IHt0ZXh0OiAnVnVsbmVyYWJsZSBwYWNrYWdlcyBmb3VuZCAobGFzdCAyNCBob3VycyknLCBzdHlsZTogJ2gyJ30sXG4gICAgICAgICAgICBjb2x1bW5zOiBbe2lkOiAncGFja2FnZScsIGxhYmVsOiAnUGFja2FnZSd9LCB7aWQ6ICdzZXZlcml0eScsIGxhYmVsOiAnU2V2ZXJpdHknfV0sXG4gICAgICAgICAgICBpdGVtczogdnVsbmVyYWJpbGl0aWVzUmVzcG9uc2VzSXRlbXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2VjdGlvbiA9PT0gJ2FnZW50cycgJiYgdGFiID09PSAndnVscycpIHtcbiAgICAgICAgY29uc3QgdG9wQ3JpdGljYWxQYWNrYWdlcyA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnRvcFBhY2thZ2VzV2l0aENWRShcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgJ0NyaXRpY2FsJyxcbiAgICAgICAgICBmaWx0ZXJzLFxuICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRvcENyaXRpY2FsUGFja2FnZXMgJiYgdG9wQ3JpdGljYWxQYWNrYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7IHRleHQ6ICdDcml0aWNhbCBzZXZlcml0eScsIHN0eWxlOiAnaDInIH0pO1xuICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgICAgIHRleHQ6XG4gICAgICAgICAgICAgICdUaGVzZSB2dWxuZXJhYmlsdGllcyBhcmUgY3JpdGljYWwsIHBsZWFzZSByZXZpZXcgeW91ciBhZ2VudC4gQ2xpY2sgb24gZWFjaCBsaW5rIHRvIHJlYWQgbW9yZSBhYm91dCBlYWNoIGZvdW5kIHZ1bG5lcmFiaWxpdHkuJyxcbiAgICAgICAgICAgIHN0eWxlOiAnc3RhbmRhcmQnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgY3VzdG9tdWwgPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNyaXRpY2FsIG9mIHRvcENyaXRpY2FsUGFja2FnZXMpIHtcbiAgICAgICAgICAgIGN1c3RvbXVsLnB1c2goeyB0ZXh0OiBjcml0aWNhbC5wYWNrYWdlLCBzdHlsZTogJ3N0YW5kYXJkJyB9KTtcbiAgICAgICAgICAgIGN1c3RvbXVsLnB1c2goe1xuICAgICAgICAgICAgICB1bDogY3JpdGljYWwucmVmZXJlbmNlcy5tYXAoaXRlbSA9PiAoe1xuICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW0uc3Vic3RyaW5nKDAsODApICsgJy4uLicsXG4gICAgICAgICAgICAgICAgbGluazogaXRlbSxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMxRUE1QzgnLFxuICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7IHVsOiBjdXN0b211bCB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvcEhpZ2hQYWNrYWdlcyA9IGF3YWl0IFZ1bG5lcmFiaWxpdHlSZXF1ZXN0LnRvcFBhY2thZ2VzV2l0aENWRShcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgJ0hpZ2gnLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgICAgcGF0dGVyblxuICAgICAgICApO1xuICAgICAgICBpZiAodG9wSGlnaFBhY2thZ2VzICYmIHRvcEhpZ2hQYWNrYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnRXaXRoTmV3TGluZSh7IHRleHQ6ICdIaWdoIHNldmVyaXR5Jywgc3R5bGU6ICdoMicgfSk7XG4gICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50V2l0aE5ld0xpbmUoe1xuICAgICAgICAgICAgdGV4dDpcbiAgICAgICAgICAgICAgJ0NsaWNrIG9uIGVhY2ggbGluayB0byByZWFkIG1vcmUgYWJvdXQgZWFjaCBmb3VuZCB2dWxuZXJhYmlsaXR5LicsXG4gICAgICAgICAgICBzdHlsZTogJ3N0YW5kYXJkJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IGN1c3RvbXVsID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBjcml0aWNhbCBvZiB0b3BIaWdoUGFja2FnZXMpIHtcbiAgICAgICAgICAgIGN1c3RvbXVsLnB1c2goeyB0ZXh0OiBjcml0aWNhbC5wYWNrYWdlLCBzdHlsZTogJ3N0YW5kYXJkJyB9KTtcbiAgICAgICAgICAgIGN1c3RvbXVsLnB1c2goe1xuICAgICAgICAgICAgICB1bDogY3JpdGljYWwucmVmZXJlbmNlcy5tYXAoaXRlbSA9PiAoe1xuICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW0sXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjMUVBNUM4J1xuICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXN0b211bCAmJiBjdXN0b211bC5sZW5ndGggJiYgcHJpbnRlci5hZGRDb250ZW50KHsgdWw6IGN1c3RvbXVsIH0pO1xuICAgICAgICAgIHByaW50ZXIuYWRkTmV3TGluZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdyZXBvcnRpbmc6ZXh0ZW5kZWRJbmZvcm1hdGlvbicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldENvbmZpZ1Jvd3MoZGF0YSwgbGFiZWxzKSB7XG4gICAgbG9nKCdyZXBvcnRpbmc6Z2V0Q29uZmlnUm93cycsIGBCdWlsZGluZyBjb25maWd1cmF0aW9uIHJvd3NgLCAnaW5mbycpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IHByb3AgaW4gZGF0YSB8fCBbXSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YVtwcm9wXSkpIHtcbiAgICAgICAgZGF0YVtwcm9wXS5mb3JFYWNoKCh4LCBpZHgpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnKSBkYXRhW3Byb3BdW2lkeF0gPSBKU09OLnN0cmluZ2lmeSh4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChbXG4gICAgICAgIChsYWJlbHMgfHwge30pW3Byb3BdIHx8IEtleUVxdWl2YWxlbmNlW3Byb3BdIHx8IHByb3AsXG4gICAgICAgIGRhdGFbcHJvcF0gfHwgJy0nXG4gICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29uZmlnVGFibGVzKGRhdGEsIHNlY3Rpb24sIHRhYiwgYXJyYXkgPSBbXSkge1xuICAgIGxvZygncmVwb3J0aW5nOmdldENvbmZpZ1RhYmxlcycsIGBCdWlsZGluZyBjb25maWd1cmF0aW9uIHRhYmxlc2AsICdpbmZvJyk7XG4gICAgbGV0IHBsYWluRGF0YSA9IHt9O1xuICAgIGNvbnN0IG5lc3RlZERhdGEgPSBbXTtcbiAgICBjb25zdCB0YWJsZURhdGEgPSBbXTtcblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0YWJsZURhdGFbc2VjdGlvbi5jb25maWdbdGFiXS5jb25maWd1cmF0aW9uXSA9IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGtleSBpbiBkYXRhKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAodHlwZW9mIGRhdGFba2V5XSAhPT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoZGF0YVtrZXldKSkgfHxcbiAgICAgICAgICAoQXJyYXkuaXNBcnJheShkYXRhW2tleV0pICYmIHR5cGVvZiBkYXRhW2tleV1bMF0gIT09ICdvYmplY3QnKVxuICAgICAgICApIHtcbiAgICAgICAgICBwbGFpbkRhdGFba2V5XSA9XG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KGRhdGFba2V5XSkgJiYgdHlwZW9mIGRhdGFba2V5XVswXSAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgPyBkYXRhW2tleV0ubWFwKHggPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHgpIDogeCArICdcXG4nO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIDogZGF0YVtrZXldO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIEFycmF5LmlzQXJyYXkoZGF0YVtrZXldKSAmJlxuICAgICAgICAgIHR5cGVvZiBkYXRhW2tleV1bMF0gPT09ICdvYmplY3QnXG4gICAgICAgICkge1xuICAgICAgICAgIHRhYmxlRGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzZWN0aW9uLmlzR3JvdXBDb25maWcgJiYgWydwYWNrJywgJ2NvbnRlbnQnXS5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICB0YWJsZURhdGFba2V5XSA9IFtkYXRhW2tleV1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXN0ZWREYXRhLnB1c2goZGF0YVtrZXldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgYXJyYXkucHVzaCh7XG4gICAgICB0aXRsZTogKHNlY3Rpb24ub3B0aW9ucyB8fCB7fSkuaGlkZUhlYWRlclxuICAgICAgICA/ICcnXG4gICAgICAgIDogKHNlY3Rpb24udGFicyB8fCBbXSlbdGFiXSB8fFxuICAgICAgICAgIChzZWN0aW9uLmlzR3JvdXBDb25maWcgPyAoKHNlY3Rpb24ubGFiZWxzIHx8IFtdKVswXSB8fCBbXSlbdGFiXSA6ICcnKSxcbiAgICAgIGNvbHVtbnM6IFsnJywgJyddLFxuICAgICAgdHlwZTogJ2NvbmZpZycsXG4gICAgICByb3dzOiB0aGlzLmdldENvbmZpZ1Jvd3MocGxhaW5EYXRhLCAoc2VjdGlvbi5sYWJlbHMgfHwgW10pWzBdKVxuICAgIH0pO1xuICAgIGZvciAobGV0IGtleSBpbiB0YWJsZURhdGEpIHtcbiAgICAgIGNvbnN0IGNvbHVtbnMgPSBPYmplY3Qua2V5cyh0YWJsZURhdGFba2V5XVswXSk7XG4gICAgICBjb2x1bW5zLmZvckVhY2goKGNvbCwgaSkgPT4ge1xuICAgICAgICBjb2x1bW5zW2ldID0gY29sWzBdLnRvVXBwZXJDYXNlKCkgKyBjb2wuc2xpY2UoMSk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgcm93cyA9IHRhYmxlRGF0YVtrZXldLm1hcCh4ID0+IHtcbiAgICAgICAgbGV0IHJvdyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4geCkge1xuICAgICAgICAgIHJvdy5wdXNoKFxuICAgICAgICAgICAgdHlwZW9mIHhba2V5XSAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgPyB4W2tleV1cbiAgICAgICAgICAgICAgOiBBcnJheS5pc0FycmF5KHhba2V5XSlcbiAgICAgICAgICAgICAgPyB4W2tleV0ubWFwKHggPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHggKyAnXFxuJztcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHhba2V5XSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChyb3cubGVuZ3RoIDwgY29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICByb3cucHVzaCgnLScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb3c7XG4gICAgICB9KTtcbiAgICAgIGFycmF5LnB1c2goe1xuICAgICAgICB0aXRsZTogKChzZWN0aW9uLmxhYmVscyB8fCBbXSlbMF0gfHwgW10pW2tleV0gfHwgJycsXG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIHJvd3NcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG5lc3RlZERhdGEuZm9yRWFjaChuZXN0ID0+IHtcbiAgICAgIHRoaXMuZ2V0Q29uZmlnVGFibGVzKG5lc3QsIHNlY3Rpb24sIHRhYiArIDEsIGFycmF5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSByZXBvcnQgZm9yIHRoZSBtb2R1bGVzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7Kn0gcmVwb3J0cyBsaXN0IG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGNyZWF0ZVJlcG9ydHNNb2R1bGVzKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSl7XG4gICAgdHJ5e1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Y3JlYXRlUmVwb3J0c01vZHVsZXMnLCBgUmVwb3J0IHN0YXJ0ZWRgLCAnaW5mbycpO1xuICAgICAgY29uc3QgeyBhcnJheSwgYWdlbnRzLCBicm93c2VyVGltZXpvbmUsIHNlYXJjaEJhciwgZmlsdGVycywgdGltZSwgdGFibGVzLCBuYW1lLCBzZWN0aW9uIH0gPSByZXF1ZXN0LmJvZHk7XG4gICAgICBjb25zdCB7IG1vZHVsZUlEIH0gPSByZXF1ZXN0LnBhcmFtcztcbiAgICAgIGNvbnN0IHsgaWQ6IGFwaUlkLCBwYXR0ZXJuOiBpbmRleFBhdHRlcm4gfSA9IHJlcXVlc3QuaGVhZGVycztcbiAgICAgIGNvbnN0IHsgZnJvbSwgdG8gfSA9ICh0aW1lIHx8IHt9KTtcbiAgICAgIC8vIEluaXRcbiAgICAgIGNvbnN0IHByaW50ZXIgPSBuZXcgUmVwb3J0UHJpbnRlcigpO1xuICAgICAgY29uc3Qge3VzZXJuYW1lOiB1c2VySUR9ID0gYXdhaXQgY29udGV4dC53YXp1aC5zZWN1cml0eS5nZXRDdXJyZW50VXNlcihyZXF1ZXN0LCBjb250ZXh0KTtcbiAgICAgIGNyZWF0ZURhdGFEaXJlY3RvcnlJZk5vdEV4aXN0cygpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfRElSRUNUT1JZX1BBVEgpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfUkVQT1JUU19ESVJFQ1RPUllfUEFUSCk7XG4gICAgICBjcmVhdGVEaXJlY3RvcnlJZk5vdEV4aXN0cyhwYXRoLmpvaW4oV0FaVUhfREFUQV9ET1dOTE9BRFNfUkVQT1JUU19ESVJFQ1RPUllfUEFUSCwgdXNlcklEKSk7XG5cbiAgICAgIGF3YWl0IHRoaXMucmVuZGVySGVhZGVyKGNvbnRleHQsIHByaW50ZXIsIHNlY3Rpb24sIG1vZHVsZUlELCBhZ2VudHMsIGFwaUlkKTtcblxuICAgICAgXG4gICAgICBjb25zdCBzYW5pdGl6ZWRGaWx0ZXJzID0gZmlsdGVycyA/IHRoaXMuc2FuaXRpemVLaWJhbmFGaWx0ZXJzKGZpbHRlcnMsIHNlYXJjaEJhcikgOiBmYWxzZTtcbiAgICAgIFxuICAgICAgaWYgKHRpbWUgJiYgc2FuaXRpemVkRmlsdGVycykge1xuICAgICAgICBwcmludGVyLmFkZFRpbWVSYW5nZUFuZEZpbHRlcnMoZnJvbSwgdG8sIHNhbml0aXplZEZpbHRlcnMsIGJyb3dzZXJUaW1lem9uZSk7XG4gICAgICB9O1xuXG4gICAgICBpZih0aW1lKXtcbiAgICAgICAgYXdhaXQgdGhpcy5leHRlbmRlZEluZm9ybWF0aW9uKFxuICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgcHJpbnRlcixcbiAgICAgICAgICBzZWN0aW9uLFxuICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgIGFwaUlkLFxuICAgICAgICAgIG5ldyBEYXRlKGZyb20pLmdldFRpbWUoKSxcbiAgICAgICAgICBuZXcgRGF0ZSh0bykuZ2V0VGltZSgpLFxuICAgICAgICAgIHNhbml0aXplZEZpbHRlcnMsXG4gICAgICAgICAgaW5kZXhQYXR0ZXJuLFxuICAgICAgICAgIGFnZW50c1xuICAgICAgICApO1xuICAgICAgfTtcblxuICAgICAgcHJpbnRlci5hZGRWaXN1YWxpemF0aW9ucyhhcnJheSwgYWdlbnRzLCBtb2R1bGVJRCk7XG5cbiAgICAgIGlmKHRhYmxlcyl7XG4gICAgICAgIHByaW50ZXIuYWRkVGFibGVzKHRhYmxlcyk7XG4gICAgICB9O1xuXG4gICAgICBhd2FpdCBwcmludGVyLnByaW50KHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIG5hbWUpKTtcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZTogYFJlcG9ydCAke25hbWV9IHdhcyBjcmVhdGVkYFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA1MDI5LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHJlcG9ydCBmb3IgdGhlIGdyb3Vwc1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMgeyp9IHJlcG9ydHMgbGlzdCBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjcmVhdGVSZXBvcnRzR3JvdXBzKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSl7XG4gICAgdHJ5e1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Y3JlYXRlUmVwb3J0c0dyb3VwcycsIGBSZXBvcnQgc3RhcnRlZGAsICdpbmZvJyk7XG4gICAgICBjb25zdCB7IGJyb3dzZXJUaW1lem9uZSwgc2VhcmNoQmFyLCBmaWx0ZXJzLCB0aW1lLCBuYW1lLCBjb21wb25lbnRzIH0gPSByZXF1ZXN0LmJvZHk7XG4gICAgICBjb25zdCB7IGdyb3VwSUQgfSA9IHJlcXVlc3QucGFyYW1zO1xuICAgICAgY29uc3QgeyBpZDogYXBpSWQsIHBhdHRlcm46IGluZGV4UGF0dGVybiB9ID0gcmVxdWVzdC5oZWFkZXJzO1xuICAgICAgY29uc3QgeyBmcm9tLCB0byB9ID0gKHRpbWUgfHwge30pO1xuICAgICAgLy8gSW5pdFxuICAgICAgY29uc3QgcHJpbnRlciA9IG5ldyBSZXBvcnRQcmludGVyKCk7XG5cbiAgICAgIGNvbnN0IHt1c2VybmFtZTogdXNlcklEfSA9IGF3YWl0IGNvbnRleHQud2F6dWguc2VjdXJpdHkuZ2V0Q3VycmVudFVzZXIocmVxdWVzdCwgY29udGV4dCk7XG4gICAgICBjcmVhdGVEYXRhRGlyZWN0b3J5SWZOb3RFeGlzdHMoKTtcbiAgICAgIGNyZWF0ZURpcmVjdG9yeUlmTm90RXhpc3RzKFdBWlVIX0RBVEFfRE9XTkxPQURTX0RJUkVDVE9SWV9QQVRIKTtcbiAgICAgIGNyZWF0ZURpcmVjdG9yeUlmTm90RXhpc3RzKFdBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEgpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMocGF0aC5qb2luKFdBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEgsIHVzZXJJRCkpO1xuXG4gICAgICBsZXQgdGFibGVzID0gW107XG4gICAgICBjb25zdCBlcXVpdmFsZW5jZXMgPSB7XG4gICAgICAgIGxvY2FsZmlsZTogJ0xvY2FsIGZpbGVzJyxcbiAgICAgICAgb3NxdWVyeTogJ09zcXVlcnknLFxuICAgICAgICBjb21tYW5kOiAnQ29tbWFuZCcsXG4gICAgICAgIHN5c2NoZWNrOiAnU3lzY2hlY2snLFxuICAgICAgICAnb3Blbi1zY2FwJzogJ09wZW5TQ0FQJyxcbiAgICAgICAgJ2Npcy1jYXQnOiAnQ0lTLUNBVCcsXG4gICAgICAgIHN5c2NvbGxlY3RvcjogJ1N5c2NvbGxlY3RvcicsXG4gICAgICAgIHJvb3RjaGVjazogJ1Jvb3RjaGVjaycsXG4gICAgICAgIGxhYmVsczogJ0xhYmVscycsXG4gICAgICAgIHNjYTogJ1NlY3VyaXR5IGNvbmZpZ3VyYXRpb24gYXNzZXNzbWVudCdcbiAgICAgIH07XG4gICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICB0ZXh0OiBgR3JvdXAgJHtncm91cElEfSBjb25maWd1cmF0aW9uYCxcbiAgICAgICAgc3R5bGU6ICdoMSdcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBpZiAoY29tcG9uZW50c1snMCddKSB7XG4gICAgICAgIGxldCBjb25maWd1cmF0aW9uID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29uZmlndXJhdGlvblJlc3BvbnNlID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICdHRVQnLFxuICAgICAgICAgICAgYC9ncm91cHMvJHtncm91cElEfS9jb25maWd1cmF0aW9uYCxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge2FwaUhvc3RJRDogYXBpSWR9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvblJlc3BvbnNlLmRhdGEuZGF0YTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBsb2coJ3JlcG9ydGluZzpjcmVhdGVSZXBvcnRzR3JvdXBzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgJ2RlYnVnJyk7XG5cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmFmZmVjdGVkX2l0ZW1zLmxlbmd0aD4wICYmIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uYWZmZWN0ZWRfaXRlbXNbMF0uY29uZmlnKS5sZW5ndGgpIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogJ0NvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiAxNCwgY29sb3I6ICcjMDAwJyB9LFxuICAgICAgICAgICAgbWFyZ2luOiBbMCwgMTAsIDAsIDE1XVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSB7XG4gICAgICAgICAgICBsYWJlbHM6IFtdLFxuICAgICAgICAgICAgaXNHcm91cENvbmZpZzogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgZm9yIChsZXQgY29uZmlnIG9mIGNvbmZpZ3VyYXRpb24uYWZmZWN0ZWRfaXRlbXMpIHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJUaXRsZSA9ICcnO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGZpbHRlciBvZiBPYmplY3Qua2V5cyhjb25maWcuZmlsdGVycykpIHtcbiAgICAgICAgICAgICAgZmlsdGVyVGl0bGUgPSBmaWx0ZXJUaXRsZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgYCR7ZmlsdGVyfTogJHtjb25maWcuZmlsdGVyc1tmaWx0ZXJdfWBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKGluZGV4IDwgT2JqZWN0LmtleXMoY29uZmlnLmZpbHRlcnMpLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJUaXRsZSA9IGZpbHRlclRpdGxlLmNvbmNhdCgnIHwgJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudCh7XG4gICAgICAgICAgICAgIHRleHQ6IGZpbHRlclRpdGxlLFxuICAgICAgICAgICAgICBzdHlsZTogJ2g0JyxcbiAgICAgICAgICAgICAgbWFyZ2luOiBbMCwgMCwgMCwgMTBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICAgICAgc2VjdGlvbi50YWJzID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBfZCBvZiBPYmplY3Qua2V5cyhjb25maWcuY29uZmlnKSkge1xuICAgICAgICAgICAgICBmb3IgKGxldCBjIG9mIEFnZW50Q29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHMgb2YgYy5zZWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgc2VjdGlvbi5vcHRzID0gcy5vcHRzIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY24gb2Ygcy5jb25maWcgfHwgW10pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNuLmNvbmZpZ3VyYXRpb24gPT09IF9kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbi5sYWJlbHMgPSBzLmxhYmVscyB8fCBbW11dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBmb3IgKGxldCB3byBvZiBzLndvZGxlIHx8IFtdKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3by5uYW1lID09PSBfZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb24ubGFiZWxzID0gcy5sYWJlbHMgfHwgW1tdXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWN0aW9uLmxhYmVsc1swXVsncGFjayddID0gJ1BhY2tzJztcbiAgICAgICAgICAgICAgc2VjdGlvbi5sYWJlbHNbMF1bJ2NvbnRlbnQnXSA9ICdFdmFsdWF0aW9ucyc7XG4gICAgICAgICAgICAgIHNlY3Rpb24ubGFiZWxzWzBdWyc3J10gPSAnU2NhbiBsaXN0ZW5pbmcgbmV0d290ayBwb3J0cyc7XG4gICAgICAgICAgICAgIHNlY3Rpb24udGFicy5wdXNoKGVxdWl2YWxlbmNlc1tfZF0pO1xuXG4gICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZy5jb25maWdbX2RdKSkge1xuICAgICAgICAgICAgICAgIC8qIExPRyBDT0xMRUNUT1IgKi9cbiAgICAgICAgICAgICAgICBpZiAoX2QgPT09ICdsb2NhbGZpbGUnKSB7XG4gICAgICAgICAgICAgICAgICBsZXQgZ3JvdXBzID0gW107XG4gICAgICAgICAgICAgICAgICBjb25maWcuY29uZmlnW19kXS5mb3JFYWNoKG9iaiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZ3JvdXBzW29iai5sb2dmb3JtYXRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBzW29iai5sb2dmb3JtYXRdID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBzW29iai5sb2dmb3JtYXRdLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBzKS5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNhdmVpZHggPSAwO1xuICAgICAgICAgICAgICAgICAgICBncm91cHNbZ3JvdXBdLmZvckVhY2goKHgsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh4KS5sZW5ndGggPlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBzW2dyb3VwXVtzYXZlaWR4XSkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlaWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gT2JqZWN0LmtleXMoZ3JvdXBzW2dyb3VwXVtzYXZlaWR4XSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBncm91cHNbZ3JvdXBdLm1hcCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgcm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3cucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHhba2V5XSAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHhba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogQXJyYXkuaXNBcnJheSh4W2tleV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB4W2tleV0ubWFwKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geCArICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHhba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuZm9yRWFjaCgoY29sLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29sdW1uc1tpXSA9IGNvbFswXS50b1VwcGVyQ2FzZSgpICsgY29sLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9jYWwgZmlsZXMnLFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgICByb3dzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfZCA9PT0gJ2xhYmVscycpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IGNvbmZpZy5jb25maWdbX2RdWzBdLmxhYmVsO1xuICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IE9iamVjdC5rZXlzKG9ialswXSk7XG4gICAgICAgICAgICAgICAgICBpZiAoIWNvbHVtbnMuaW5jbHVkZXMoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaCgnaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjb25zdCByb3dzID0gb2JqLm1hcCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh4W2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2wsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uc1tpXSA9IGNvbFswXS50b1VwcGVyQ2FzZSgpICsgY29sLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB0YWJsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTGFiZWxzJyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgICAgICAgICAgcm93c1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IF9kMiBvZiBjb25maWcuY29uZmlnW19kXSkge1xuICAgICAgICAgICAgICAgICAgICB0YWJsZXMucHVzaCguLi50aGlzLmdldENvbmZpZ1RhYmxlcyhfZDIsIHNlY3Rpb24sIGlkeCkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKklOVEVHUklUWSBNT05JVE9SSU5HIE1PTklUT1JFRCBESVJFQ1RPUklFUyAqL1xuICAgICAgICAgICAgICAgIGlmIChjb25maWcuY29uZmlnW19kXS5kaXJlY3Rvcmllcykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3JpZXMgPSBjb25maWcuY29uZmlnW19kXS5kaXJlY3RvcmllcztcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWcuY29uZmlnW19kXS5kaXJlY3RvcmllcztcbiAgICAgICAgICAgICAgICAgIHRhYmxlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdldENvbmZpZ1RhYmxlcyhjb25maWcuY29uZmlnW19kXSwgc2VjdGlvbiwgaWR4KVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGxldCBkaWZmT3B0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2VjdGlvbi5vcHRzKS5mb3JFYWNoKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaWZmT3B0cy5wdXNoKHgpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW1xuICAgICAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICAgICAgLi4uZGlmZk9wdHMuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgIHggPT4geCAhPT0gJ2NoZWNrX2FsbCcgJiYgeCAhPT0gJ2NoZWNrX3N1bSdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgICAgICAgICAgICBkaXJlY3Rvcmllcy5mb3JFYWNoKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKHgucGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuZm9yRWFjaCh5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoeSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB5ICE9PSAnY2hlY2tfd2hvZGF0YScgPyB5IDogJ3dob2RhdGEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93LnB1c2goeFt5XSA/IHhbeV0gOiAnbm8nKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh4LnJlY3Vyc2lvbl9sZXZlbCk7XG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goKHgsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zW2lkeF0gPSBzZWN0aW9uLm9wdHNbeF07XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaCgnUkwnKTtcbiAgICAgICAgICAgICAgICAgIHRhYmxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdNb25pdG9yZWQgZGlyZWN0b3JpZXMnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLFxuICAgICAgICAgICAgICAgICAgICByb3dzXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGFibGVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuZ2V0Q29uZmlnVGFibGVzKGNvbmZpZy5jb25maWdbX2RdLCBzZWN0aW9uLCBpZHgpXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhYmxlIG9mIHRhYmxlcykge1xuICAgICAgICAgICAgICAgIHByaW50ZXIuYWRkQ29uZmlnVGFibGVzKFt0YWJsZV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlkeCsrO1xuICAgICAgICAgICAgICB0YWJsZXMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlcyA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDogJ0EgY29uZmlndXJhdGlvbiBmb3IgdGhpcyBncm91cCBoYXMgbm90IHlldCBiZWVuIHNldCB1cC4nLFxuICAgICAgICAgICAgc3R5bGU6IHsgZm9udFNpemU6IDEyLCBjb2xvcjogJyMwMDAnIH0sXG4gICAgICAgICAgICBtYXJnaW46IFswLCAxMCwgMCwgMTVdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjb21wb25lbnRzWycxJ10pIHtcbiAgICAgICAgbGV0IGFnZW50c0luR3JvdXAgPSBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBhZ2VudHNJbkdyb3VwUmVzcG9uc2UgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KFxuICAgICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgICBgL2dyb3Vwcy8ke2dyb3VwSUR9L2FnZW50c2AsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHthcGlIb3N0SUQ6IGFwaUlkfVxuICAgICAgICAgICk7XG4gICAgICAgICAgYWdlbnRzSW5Hcm91cCA9IGFnZW50c0luR3JvdXBSZXNwb25zZS5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXNcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBsb2coJ3JlcG9ydGluZzpyZXBvcnQnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAnZGVidWcnKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnJlbmRlckhlYWRlcihcbiAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgIHByaW50ZXIsXG4gICAgICAgICAgJ2dyb3VwQ29uZmlnJyxcbiAgICAgICAgICBncm91cElELFxuICAgICAgICAgIChhZ2VudHNJbkdyb3VwIHx8IFtdKS5tYXAoeCA9PiB4LmlkKSxcbiAgICAgICAgICBhcGlJZFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcmludGVyLnByaW50KHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIG5hbWUpKTtcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZTogYFJlcG9ydCAke25hbWV9IHdhcyBjcmVhdGVkYFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1jYXRjaChlcnJvcil7ICAgICBcbiAgICAgIGxvZygncmVwb3J0aW5nOmNyZWF0ZVJlcG9ydHNHcm91cHMnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsIDUwMjksIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVwb3J0IGZvciB0aGUgYWdlbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7Kn0gcmVwb3J0cyBsaXN0IG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGNyZWF0ZVJlcG9ydHNBZ2VudHMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KXtcbiAgICB0cnl7XG4gICAgICBsb2coJ3JlcG9ydGluZzpjcmVhdGVSZXBvcnRzQWdlbnRzJywgYFJlcG9ydCBzdGFydGVkYCwgJ2luZm8nKTtcbiAgICAgIGNvbnN0IHsgYnJvd3NlclRpbWV6b25lLCBzZWFyY2hCYXIsIGZpbHRlcnMsIHRpbWUsIG5hbWUsIGNvbXBvbmVudHMgfSA9IHJlcXVlc3QuYm9keTtcbiAgICAgIGNvbnN0IHsgYWdlbnRJRCB9ID0gcmVxdWVzdC5wYXJhbXM7XG4gICAgICBjb25zdCB7IGlkOiBhcGlJZCB9ID0gcmVxdWVzdC5oZWFkZXJzO1xuICAgICAgY29uc3QgeyBmcm9tLCB0byB9ID0gKHRpbWUgfHwge30pO1xuXG4gICAgICBjb25zdCBwcmludGVyID0gbmV3IFJlcG9ydFByaW50ZXIoKTtcblxuICAgICAgY29uc3Qge3VzZXJuYW1lOiB1c2VySUR9ID0gYXdhaXQgY29udGV4dC53YXp1aC5zZWN1cml0eS5nZXRDdXJyZW50VXNlcihyZXF1ZXN0LCBjb250ZXh0KTtcbiAgICAgIGNyZWF0ZURhdGFEaXJlY3RvcnlJZk5vdEV4aXN0cygpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfRElSRUNUT1JZX1BBVEgpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfUkVQT1JUU19ESVJFQ1RPUllfUEFUSCk7XG4gICAgICBjcmVhdGVEaXJlY3RvcnlJZk5vdEV4aXN0cyhwYXRoLmpvaW4oV0FaVUhfREFUQV9ET1dOTE9BRFNfUkVQT1JUU19ESVJFQ1RPUllfUEFUSCwgdXNlcklEKSk7XG5cbiAgICAgIGxldCB3bW9kdWxlc1Jlc3BvbnNlID0ge307XG4gICAgICBsZXQgdGFibGVzID0gW107XG4gICAgICB0cnkge1xuICAgICAgICB3bW9kdWxlc1Jlc3BvbnNlID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICBgL2FnZW50cy8ke2FnZW50SUR9L2NvbmZpZy93bW9kdWxlcy93bW9kdWxlc2AsXG4gICAgICAgICAge30sXG4gICAgICAgICAge2FwaUhvc3RJRDogYXBpSWR9XG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2coJ3JlcG9ydGluZzpyZXBvcnQnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAnZGVidWcnKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJIZWFkZXIoY29udGV4dCwgcHJpbnRlciwgJ2FnZW50Q29uZmlnJywgJ2FnZW50Q29uZmlnJywgYWdlbnRJRCwgYXBpSWQpO1xuXG4gICAgICBsZXQgaWR4Q29tcG9uZW50ID0gMDtcbiAgICAgIGZvciAobGV0IGNvbmZpZyBvZiBBZ2VudENvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgbGV0IHRpdGxlT2ZTZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAncmVwb3J0aW5nOmNyZWF0ZVJlcG9ydHNBZ2VudHMnLFxuICAgICAgICAgIGBJdGVyYXRlIG92ZXIgJHtjb25maWcuc2VjdGlvbnMubGVuZ3RofSBjb25maWd1cmF0aW9uIHNlY3Rpb25zYCxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICAgIGZvciAobGV0IHNlY3Rpb24gb2YgY29uZmlnLnNlY3Rpb25zKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgY29tcG9uZW50c1tpZHhDb21wb25lbnRdICYmXG4gICAgICAgICAgICAoc2VjdGlvbi5jb25maWcgfHwgc2VjdGlvbi53b2RsZSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICAgICAgY29uc3QgY29uZmlncyA9IChzZWN0aW9uLmNvbmZpZyB8fCBbXSkuY29uY2F0KFxuICAgICAgICAgICAgICBzZWN0aW9uLndvZGxlIHx8IFtdXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbG9nKFxuICAgICAgICAgICAgICAncmVwb3J0aW5nOmNyZWF0ZVJlcG9ydHNBZ2VudHMnLFxuICAgICAgICAgICAgICBgSXRlcmF0ZSBvdmVyICR7Y29uZmlncy5sZW5ndGh9IGNvbmZpZ3VyYXRpb24gYmxvY2tzYCxcbiAgICAgICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGZvciAobGV0IGNvbmYgb2YgY29uZmlncykge1xuICAgICAgICAgICAgICBsZXQgYWdlbnRDb25maWdSZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghY29uZlsnbmFtZSddKSB7XG4gICAgICAgICAgICAgICAgICBhZ2VudENvbmZpZ1Jlc3BvbnNlID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGAvYWdlbnRzLyR7YWdlbnRJRH0vY29uZmlnLyR7Y29uZi5jb21wb25lbnR9LyR7Y29uZi5jb25maWd1cmF0aW9ufWAsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IHdvZGxlIG9mIHdtb2R1bGVzUmVzcG9uc2UuZGF0YS5kYXRhWyd3bW9kdWxlcyddKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh3b2RsZSlbMF0gPT09IGNvbmZbJ25hbWUnXSkge1xuICAgICAgICAgICAgICAgICAgICAgIGFnZW50Q29uZmlnUmVzcG9uc2UuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHdvZGxlXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhZ2VudENvbmZpZyA9IGFnZW50Q29uZmlnUmVzcG9uc2UgJiYgYWdlbnRDb25maWdSZXNwb25zZS5kYXRhICYmIGFnZW50Q29uZmlnUmVzcG9uc2UuZGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIGlmICghdGl0bGVPZlNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgIHByaW50ZXIuYWRkQ29udGVudCh7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGNvbmZpZy50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdoMScsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogWzAsIDAsIDAsIDE1XVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB0aXRsZU9mU2VjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgICAgICAgdGV4dDogc2VjdGlvbi5zdWJ0aXRsZSxcbiAgICAgICAgICAgICAgICAgIHN0eWxlOiAnaDQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcHJpbnRlci5hZGRDb250ZW50KHtcbiAgICAgICAgICAgICAgICAgIHRleHQ6IHNlY3Rpb24uZGVzYyxcbiAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgY29sb3I6ICcjMDAwJyB9LFxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiBbMCwgMCwgMCwgMTBdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgYWdlbnRDb25maWdcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IGFnZW50Q29uZmlnS2V5IG9mIE9iamVjdC5rZXlzKGFnZW50Q29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhZ2VudENvbmZpZ1thZ2VudENvbmZpZ0tleV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLyogTE9HIENPTExFQ1RPUiAqL1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25mLmZpbHRlckJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZ3JvdXBzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudENvbmZpZ1thZ2VudENvbmZpZ0tleV0uZm9yRWFjaChvYmogPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWdyb3Vwc1tvYmoubG9nZm9ybWF0XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc1tvYmoubG9nZm9ybWF0XSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc1tvYmoubG9nZm9ybWF0XS5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGdyb3VwcykuZm9yRWFjaChncm91cCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzYXZlaWR4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBzW2dyb3VwXS5mb3JFYWNoKCh4LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoeCkubGVuZ3RoID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGdyb3Vwc1tncm91cF1bc2F2ZWlkeF0pLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZWlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cF1bc2F2ZWlkeF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93cyA9IGdyb3Vwc1tncm91cF0ubWFwKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3cgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgeFtrZXldICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8geFtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBBcnJheS5pc0FycmF5KHhba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHhba2V5XS5tYXAoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4ICsgJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkoeFtrZXldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKChjb2wsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zW2ldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbFswXS50b1VwcGVyQ2FzZSgpICsgY29sLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzZWN0aW9uLmxhYmVsc1swXVtncm91cF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFnZW50Q29uZmlnS2V5LmNvbmZpZ3VyYXRpb24gIT09ICdzb2NrZXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJsZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nZXRDb25maWdUYWJsZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRDb25maWdbYWdlbnRDb25maWdLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IF9kMiBvZiBhZ2VudENvbmZpZ1thZ2VudENvbmZpZ0tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nZXRDb25maWdUYWJsZXMoX2QyLCBzZWN0aW9uLCBpZHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8qSU5URUdSSVRZIE1PTklUT1JJTkcgTU9OSVRPUkVEIERJUkVDVE9SSUVTICovXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmYubWF0cml4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcmllcyA9IGFnZW50Q29uZmlnW2FnZW50Q29uZmlnS2V5XS5kaXJlY3RvcmllcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhZ2VudENvbmZpZ1thZ2VudENvbmZpZ0tleV0uZGlyZWN0b3JpZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJsZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nZXRDb25maWdUYWJsZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRDb25maWdbYWdlbnRDb25maWdLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZk9wdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHNlY3Rpb24ub3B0cykuZm9yRWFjaCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZk9wdHMucHVzaCh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmRpZmZPcHRzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0+IHggIT09ICdjaGVja19hbGwnICYmIHggIT09ICdjaGVja19zdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm93cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3JpZXMuZm9yRWFjaCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh4LmRpcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuZm9yRWFjaCh5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm9wdHMuaW5kZXhPZih5KSA+IC0xID8gJ3llcycgOiAnbm8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKHgucmVjdXJzaW9uX2xldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnMuZm9yRWFjaCgoeCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnNbaWR4XSA9IHNlY3Rpb24ub3B0c1t4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1ucy5wdXNoKCdSTCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ01vbml0b3JlZCBkaXJlY3RvcmllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJsZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nZXRDb25maWdUYWJsZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRDb25maWdbYWdlbnRDb25maWdLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4XG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIFByaW50IG5vIGNvbmZpZ3VyZWQgbW9kdWxlIGFuZCBsaW5rIHRvIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgICBwcmludGVyLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1RoaXMgbW9kdWxlIGlzIG5vdCBjb25maWd1cmVkLiBQbGVhc2UgdGFrZSBhIGxvb2sgb24gaG93IHRvIGNvbmZpZ3VyZSBpdCBpbiAnLFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGAke3NlY3Rpb24uc3VidGl0bGUudG9Mb3dlckNhc2UoKX0gY29uZmlndXJhdGlvbi5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluazogc2VjdGlvbi5kb2N1TGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiAxMiwgY29sb3I6ICcjMWEwZGFiJyB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IFswLCAwLCAwLCAyMF1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsb2coJ3JlcG9ydGluZzpyZXBvcnQnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAnZGVidWcnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFibGUgb2YgdGFibGVzKSB7XG4gICAgICAgICAgICAgIHByaW50ZXIuYWRkQ29uZmlnVGFibGVzKFt0YWJsZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZHhDb21wb25lbnQrKztcbiAgICAgICAgICB0YWJsZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcmludGVyLnByaW50KHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIG5hbWUpKTtcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZTogYFJlcG9ydCAke25hbWV9IHdhcyBjcmVhdGVkYFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBsb2coJ3JlcG9ydGluZzpjcmVhdGVSZXBvcnRzQWdlbnRzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA1MDI5LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHJlcG9ydCBmb3IgdGhlIGFnZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMgeyp9IHJlcG9ydHMgbGlzdCBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjcmVhdGVSZXBvcnRzQWdlbnRzSW52ZW50b3J5KGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSl7XG4gICAgdHJ5e1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Y3JlYXRlUmVwb3J0c0FnZW50c0ludmVudG9yeScsIGBSZXBvcnQgc3RhcnRlZGAsICdpbmZvJyk7XG4gICAgICBjb25zdCB7IGJyb3dzZXJUaW1lem9uZSwgc2VhcmNoQmFyLCBmaWx0ZXJzLCB0aW1lLCBuYW1lIH0gPSByZXF1ZXN0LmJvZHk7XG4gICAgICBjb25zdCB7IGFnZW50SUQgfSA9IHJlcXVlc3QucGFyYW1zO1xuICAgICAgY29uc3QgeyBpZDogYXBpSWQsIHBhdHRlcm46IGluZGV4UGF0dGVybiB9ID0gcmVxdWVzdC5oZWFkZXJzO1xuICAgICAgY29uc3QgeyBmcm9tLCB0byB9ID0gKHRpbWUgfHwge30pO1xuICAgICAgLy8gSW5pdFxuICAgICAgY29uc3QgcHJpbnRlciA9IG5ldyBSZXBvcnRQcmludGVyKCk7XG5cbiAgICAgIGNvbnN0IHt1c2VybmFtZTogdXNlcklEfSA9IGF3YWl0IGNvbnRleHQud2F6dWguc2VjdXJpdHkuZ2V0Q3VycmVudFVzZXIocmVxdWVzdCwgY29udGV4dCk7XG4gICAgICBjcmVhdGVEYXRhRGlyZWN0b3J5SWZOb3RFeGlzdHMoKTtcbiAgICAgIGNyZWF0ZURpcmVjdG9yeUlmTm90RXhpc3RzKFdBWlVIX0RBVEFfRE9XTkxPQURTX0RJUkVDVE9SWV9QQVRIKTtcbiAgICAgIGNyZWF0ZURpcmVjdG9yeUlmTm90RXhpc3RzKFdBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEgpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMocGF0aC5qb2luKFdBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEgsIHVzZXJJRCkpO1xuXG4gICAgICBsb2coJ3JlcG9ydGluZzpjcmVhdGVSZXBvcnRzQWdlbnRzSW52ZW50b3J5JywgYFN5c2NvbGxlY3RvciByZXBvcnRgLCAnZGVidWcnKTtcbiAgICAgIGNvbnN0IHNhbml0aXplZEZpbHRlcnMgPSBmaWx0ZXJzID8gdGhpcy5zYW5pdGl6ZUtpYmFuYUZpbHRlcnMoZmlsdGVycywgc2VhcmNoQmFyKSA6IGZhbHNlO1xuXG4gICAgICAvLyBHZXQgdGhlIGFnZW50IE9TXG4gICAgICBsZXQgYWdlbnRPcyA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYWdlbnRSZXNwb25zZSA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLnJlcXVlc3QoXG4gICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgJy9hZ2VudHMnLFxuICAgICAgICAgIHtwYXJhbXM6IHtxOiBgaWQ9JHthZ2VudElEfWB9fSxcbiAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgKTtcbiAgICAgICAgYWdlbnRPcyA9IGFnZW50UmVzcG9uc2UuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdLm9zLnBsYXRmb3JtO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbG9nKCdyZXBvcnRpbmc6Y3JlYXRlUmVwb3J0c0FnZW50c0ludmVudG9yeScsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsICdkZWJ1ZycpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGl0bGVcbiAgICAgIHByaW50ZXIuYWRkQ29udGVudFdpdGhOZXdMaW5lKHtcbiAgICAgICAgdGV4dDogJ0ludmVudG9yeSBkYXRhIHJlcG9ydCcsXG4gICAgICAgIHN0eWxlOiAnaDEnXG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIHRhYmxlIHdpdGggdGhlIGFnZW50IGluZm9cbiAgICAgIGF3YWl0IHRoaXMuYnVpbGRBZ2VudHNUYWJsZShjb250ZXh0LCBwcmludGVyLCBbYWdlbnRJRF0sIGFwaUlkKTtcblxuICAgICAgLy8gR2V0IHN5c2NvbGxlY3RvciBwYWNrYWdlcyBhbmQgcHJvY2Vzc2VzXG4gICAgICBjb25zdCBhZ2VudFJlcXVlc3RzSW52ZW50b3J5ID0gW1xuICAgICAgICB7XG4gICAgICAgICAgZW5kcG9pbnQ6IGAvc3lzY29sbGVjdG9yLyR7YWdlbnRJRH0vcGFja2FnZXNgLFxuICAgICAgICAgIGxvZ2dlck1lc3NhZ2U6IGBGZXRjaGluZyBwYWNrYWdlcyBmb3IgYWdlbnQgJHthZ2VudElEfWAsXG4gICAgICAgICAgdGFibGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUGFja2FnZXMnLFxuICAgICAgICAgICAgY29sdW1uczogYWdlbnRPcyA9PT0gJ3dpbmRvd3MnXG4gICAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgICAgICAge2lkOiAnbmFtZScsIGxhYmVsOiAnTmFtZSd9LFxuICAgICAgICAgICAgICAgICAge2lkOiAnYXJjaGl0ZWN0dXJlJywgbGFiZWw6ICdBcmNoaXRlY3R1cmUnfSxcbiAgICAgICAgICAgICAgICAgIHtpZDogJ3ZlcnNpb24nLCBsYWJlbDogJ1ZlcnNpb24nfSxcbiAgICAgICAgICAgICAgICAgIHtpZDogJ3ZlbmRvcicsIGxhYmVsOiAnVmVuZG9yJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAgICAge2lkOiAnbmFtZScsIGxhYmVsOiAnTmFtZSd9LFxuICAgICAgICAgICAgICAgICAge2lkOiAnYXJjaGl0ZWN0dXJlJywgbGFiZWw6ICdBcmNoaXRlY3R1cmUnfSxcbiAgICAgICAgICAgICAgICAgIHtpZDogJ3ZlcnNpb24nLCBsYWJlbDogJ1ZlcnNpb24nfSxcbiAgICAgICAgICAgICAgICAgIHtpZDogJ3ZlbmRvcicsIGxhYmVsOiAnVmVuZG9yJ30sXG4gICAgICAgICAgICAgICAgICB7aWQ6ICdkZXNjcmlwdGlvbicsIGxhYmVsOiAnRGVzY3JpcHRpb24nfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZW5kcG9pbnQ6IGAvc3lzY29sbGVjdG9yLyR7YWdlbnRJRH0vcHJvY2Vzc2VzYCxcbiAgICAgICAgICBsb2dnZXJNZXNzYWdlOiBgRmV0Y2hpbmcgcHJvY2Vzc2VzIGZvciBhZ2VudCAke2FnZW50SUR9YCxcbiAgICAgICAgICB0YWJsZToge1xuICAgICAgICAgICAgdGl0bGU6ICdQcm9jZXNzZXMnLFxuICAgICAgICAgICAgY29sdW1uczpcbiAgICAgICAgICAgICAgYWdlbnRPcyA9PT0gJ3dpbmRvd3MnXG4gICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ25hbWUnLCBsYWJlbDogJ05hbWUnfSxcbiAgICAgICAgICAgICAgICAgICAge2lkOiAnY21kJywgbGFiZWw6ICdDTUQnfSxcbiAgICAgICAgICAgICAgICAgICAge2lkOiAncHJpb3JpdHknLCBsYWJlbDogJ1ByaW9yaXR5J30sXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ25sd3AnLCBsYWJlbDogJ05MV1AnfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAgICAgICB7aWQ6ICduYW1lJywgbGFiZWw6ICdOYW1lJ30sXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ2V1c2VyJywgbGFiZWw6ICdFZmZlY3RpdmUgdXNlcid9LFxuICAgICAgICAgICAgICAgICAgICB7aWQ6ICduaWNlJywgbGFiZWw6ICdQcmlvcml0eSd9LFxuICAgICAgICAgICAgICAgICAgICB7aWQ6ICdzdGF0ZScsIGxhYmVsOiAnU3RhdGUnfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFwUmVzcG9uc2VJdGVtczogKGl0ZW0pID0+IGFnZW50T3MgPT09ICd3aW5kb3dzJ1xuICAgICAgICAgICAgPyBpdGVtXG4gICAgICAgICAgICA6IHsuLi5pdGVtLCBzdGF0ZTogUHJvY2Vzc0VxdWl2YWxlbmNlW2l0ZW0uc3RhdGVdfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZW5kcG9pbnQ6IGAvc3lzY29sbGVjdG9yLyR7YWdlbnRJRH0vcG9ydHNgLFxuICAgICAgICAgIGxvZ2dlck1lc3NhZ2U6IGBGZXRjaGluZyBwb3J0cyBmb3IgYWdlbnQgJHthZ2VudElEfWAsXG4gICAgICAgICAgdGFibGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTmV0d29yayBwb3J0cycsXG4gICAgICAgICAgICBjb2x1bW5zOlxuICAgICAgICAgICAgICBhZ2VudE9zID09PSAnd2luZG93cydcbiAgICAgICAgICAgICAgICA/IFtcbiAgICAgICAgICAgICAgICAgICAge2lkOiAnbG9jYWxfaXAnLCBsYWJlbDogJ0xvY2FsIElQJ30sXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ2xvY2FsX3BvcnQnLCBsYWJlbDogJ0xvY2FsIHBvcnQnfSxcbiAgICAgICAgICAgICAgICAgICAge2lkOiAncHJvY2VzcycsIGxhYmVsOiAnUHJvY2Vzcyd9LFxuICAgICAgICAgICAgICAgICAgICB7aWQ6ICdzdGF0ZScsIGxhYmVsOiAnU3RhdGUnfSxcbiAgICAgICAgICAgICAgICAgICAge2lkOiAncHJvdG9jb2wnLCBsYWJlbDogJ1Byb3RvY29sJ31cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICA6IFtcbiAgICAgICAgICAgICAgICAgICAge2lkOiAnbG9jYWxfaXAnLCBsYWJlbDogJ0xvY2FsIElQJ30sXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ2xvY2FsX3BvcnQnLCBsYWJlbDogJ0xvY2FsIHBvcnQnfSxcbiAgICAgICAgICAgICAgICAgICAge2lkOiAnc3RhdGUnLCBsYWJlbDogJ1N0YXRlJ30sXG4gICAgICAgICAgICAgICAgICAgIHtpZDogJ3Byb3RvY29sJywgbGFiZWw6ICdQcm90b2NvbCd9XG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYXBSZXNwb25zZUl0ZW1zOiAoaXRlbSkgPT4gKHsuLi5pdGVtLCBsb2NhbF9pcDogaXRlbS5sb2NhbC5pcCwgbG9jYWxfcG9ydDogaXRlbS5sb2NhbC5wb3J0fSlcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGVuZHBvaW50OiBgL3N5c2NvbGxlY3Rvci8ke2FnZW50SUR9L25ldGlmYWNlYCxcbiAgICAgICAgICBsb2dnZXJNZXNzYWdlOiBgRmV0Y2hpbmcgbmV0aWZhY2UgZm9yIGFnZW50ICR7YWdlbnRJRH1gLFxuICAgICAgICAgIHRhYmxlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ05ldHdvcmsgaW50ZXJmYWNlcycsXG4gICAgICAgICAgICBjb2x1bW5zOiBbXG4gICAgICAgICAgICAgIHtpZDogJ25hbWUnLCBsYWJlbDogJ05hbWUnfSxcbiAgICAgICAgICAgICAge2lkOiAnbWFjJywgbGFiZWw6ICdNYWMnfSxcbiAgICAgICAgICAgICAge2lkOiAnc3RhdGUnLCBsYWJlbDogJ1N0YXRlJ30sXG4gICAgICAgICAgICAgIHtpZDogJ210dScsIGxhYmVsOiAnTVRVJ30sXG4gICAgICAgICAgICAgIHtpZDogJ3R5cGUnLCBsYWJlbDogJ1R5cGUnfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGVuZHBvaW50OiBgL3N5c2NvbGxlY3Rvci8ke2FnZW50SUR9L25ldGFkZHJgLFxuICAgICAgICAgIGxvZ2dlck1lc3NhZ2U6IGBGZXRjaGluZyBuZXRhZGRyIGZvciBhZ2VudCAke2FnZW50SUR9YCxcbiAgICAgICAgICB0YWJsZToge1xuICAgICAgICAgICAgdGl0bGU6ICdOZXR3b3JrIHNldHRpbmdzJyxcbiAgICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgICAge2lkOiAnaWZhY2UnLCBsYWJlbDogJ0ludGVyZmFjZSd9LFxuICAgICAgICAgICAgICB7aWQ6ICdhZGRyZXNzJywgbGFiZWw6ICdhZGRyZXNzJ30sXG4gICAgICAgICAgICAgIHtpZDogJ25ldG1hc2snLCBsYWJlbDogJ05ldG1hc2snfSxcbiAgICAgICAgICAgICAge2lkOiAncHJvdG8nLCBsYWJlbDogJ1Byb3RvY29sJ30sXG4gICAgICAgICAgICAgIHtpZDogJ2Jyb2FkY2FzdCcsIGxhYmVsOiAnQnJvYWRjYXN0J31cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBlbmRwb2ludDogYC9zeXNjb2xsZWN0b3IvJHthZ2VudElEfS9ob3RmaXhlc2AsXG4gICAgICAgICAgbG9nZ2VyTWVzc2FnZTogYEZldGNoaW5nIGhvdGZpeGVzIGZvciBhZ2VudCAke2FnZW50SUR9YCxcbiAgICAgICAgICB0YWJsZToge1xuICAgICAgICAgICAgdGl0bGU6ICdXaW5kb3dzIHVwZGF0ZXMnLFxuICAgICAgICAgICAgY29sdW1uczogW3tpZDogJ2hvdGZpeCcsIGxhYmVsOiAnVXBkYXRlIGNvZGUnfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IHJlcXVlc3RJbnZlbnRvcnkgPSBhc3luYyAoYWdlbnRSZXF1ZXN0SW52ZW50b3J5KSA9PiB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBsb2coXG4gICAgICAgICAgICAncmVwb3J0aW5nOmNyZWF0ZVJlcG9ydHNBZ2VudHNJbnZlbnRvcnknLFxuICAgICAgICAgICAgYWdlbnRSZXF1ZXN0SW52ZW50b3J5LmxvZ2dlck1lc3NhZ2UsXG4gICAgICAgICAgICAnZGVidWcnXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNvbnN0IGludmVudG9yeVJlc3BvbnNlID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICdHRVQnLFxuICAgICAgICAgICAgYWdlbnRSZXF1ZXN0SW52ZW50b3J5LmVuZHBvaW50LFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7YXBpSG9zdElEOiBhcGlJZH1cbiAgICAgICAgICApO1xuXG4gICAgICAgICAgY29uc3QgaW52ZW50b3J5ID0gaW52ZW50b3J5UmVzcG9uc2UgJiYgaW52ZW50b3J5UmVzcG9uc2UuZGF0YSAmJiBpbnZlbnRvcnlSZXNwb25zZS5kYXRhLmRhdGEgJiYgaW52ZW50b3J5UmVzcG9uc2UuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zO1xuICAgICAgICAgIGlmKGludmVudG9yeSl7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAuLi5hZ2VudFJlcXVlc3RJbnZlbnRvcnkudGFibGUsXG4gICAgICAgICAgICAgIGl0ZW1zOiBhZ2VudFJlcXVlc3RJbnZlbnRvcnkubWFwUmVzcG9uc2VJdGVtcyA/IGludmVudG9yeS5tYXAoYWdlbnRSZXF1ZXN0SW52ZW50b3J5Lm1hcFJlc3BvbnNlSXRlbXMpIDogaW52ZW50b3J5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgICAgbG9nKCdyZXBvcnRpbmc6Y3JlYXRlUmVwb3J0c0FnZW50c0ludmVudG9yeScsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsICdkZWJ1ZycpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSkge1xuICAgICAgICBhd2FpdCB0aGlzLmV4dGVuZGVkSW5mb3JtYXRpb24oXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBwcmludGVyLFxuICAgICAgICAgICdhZ2VudHMnLFxuICAgICAgICAgICdzeXNjb2xsZWN0b3InLFxuICAgICAgICAgIGFwaUlkLFxuICAgICAgICAgIGZyb20sXG4gICAgICAgICAgdG8sXG4gICAgICAgICAgc2FuaXRpemVkRmlsdGVycyArICcgQU5EIHJ1bGUuZ3JvdXBzOiBcInZ1bG5lcmFiaWxpdHktZGV0ZWN0b3JcIicsXG4gICAgICAgICAgaW5kZXhQYXR0ZXJuLFxuICAgICAgICAgIGFnZW50SURcbiAgICAgICAgKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIEFkZCBpbnZlbnRvcnkgdGFibGVzXG4gICAgICAoYXdhaXQgUHJvbWlzZS5hbGwoYWdlbnRSZXF1ZXN0c0ludmVudG9yeS5tYXAocmVxdWVzdEludmVudG9yeSkpKVxuICAgICAgICAuZmlsdGVyKHRhYmxlID0+IHRhYmxlKS5mb3JFYWNoKHRhYmxlID0+IHByaW50ZXIuYWRkU2ltcGxlVGFibGUodGFibGUpKTtcblxuICAgICAgLy8gUHJpbnQgdGhlIGRvY3VtZW50XG4gICAgICBhd2FpdCBwcmludGVyLnByaW50KHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIG5hbWUpKTtcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZTogYFJlcG9ydCAke25hbWV9IHdhcyBjcmVhdGVkYFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBsb2coJ3JlcG9ydGluZzpjcmVhdGVSZXBvcnRzQWdlbnRzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA1MDI5LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZldGNoIHRoZSByZXBvcnRzIGxpc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtBcnJheTxPYmplY3Q+fSByZXBvcnRzIGxpc3Qgb3IgRXJyb3JSZXNwb25zZVxuICAgKi9cbiAgYXN5bmMgZ2V0UmVwb3J0cyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Z2V0UmVwb3J0cycsIGBGZXRjaGluZyBjcmVhdGVkIHJlcG9ydHNgLCAnaW5mbycpO1xuICAgICAgY29uc3Qge3VzZXJuYW1lOiB1c2VySUR9ID0gYXdhaXQgY29udGV4dC53YXp1aC5zZWN1cml0eS5nZXRDdXJyZW50VXNlcihyZXF1ZXN0LCBjb250ZXh0KTtcbiAgICAgIGNyZWF0ZURhdGFEaXJlY3RvcnlJZk5vdEV4aXN0cygpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfRElSRUNUT1JZX1BBVEgpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHMoV0FaVUhfREFUQV9ET1dOTE9BRFNfUkVQT1JUU19ESVJFQ1RPUllfUEFUSCk7XG4gICAgICBjb25zdCB1c2VyUmVwb3J0c0RpcmVjdG9yeSA9IHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQpO1xuICAgICAgY3JlYXRlRGlyZWN0b3J5SWZOb3RFeGlzdHModXNlclJlcG9ydHNEaXJlY3RvcnkpO1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Z2V0UmVwb3J0cycsIGBEaXJlY3Rvcnk6ICR7dXNlclJlcG9ydHNEaXJlY3Rvcnl9YCwgJ2RlYnVnJyk7XG5cbiAgICAgIGNvbnN0IHNvcnRSZXBvcnRzQnlEYXRlID0gKGEsIGIpID0+XG4gICAgICAgIGEuZGF0ZSA8IGIuZGF0ZSA/IDEgOiBhLmRhdGUgPiBiLmRhdGUgPyAtMSA6IDA7XG5cbiAgICAgIGNvbnN0IHJlcG9ydHMgPSBmcy5yZWFkZGlyU3luYyh1c2VyUmVwb3J0c0RpcmVjdG9yeSkubWFwKGZpbGUgPT4ge1xuICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHVzZXJSZXBvcnRzRGlyZWN0b3J5ICsgJy8nICsgZmlsZSk7XG4gICAgICAgIC8vIEdldCB0aGUgZmlsZSBjcmVhdGlvbiB0aW1lIChiaXRodGltZSkuIEl0IHJldHVybnMgdGhlIGZpcnN0IHZhbHVlIHRoYXQgaXMgYSB0cnV0aHkgdmFsdWUgb2YgbmV4dCBmaWxlIHN0YXRzOiBiaXJ0aHRpbWUsIG10aW1lLCBjdGltZSBhbmQgYXRpbWUuXG4gICAgICAgIC8vIFRoaXMgc29sdmVzIHNvbWUgT1NzIGNhbiBoYXZlIHRoZSBiaXRodGltZU1zIGVxdWFsIHRvIDAgYW5kIHJldHVybnMgdGhlIGRhdGUgbGlrZSAxOTcwLTAxLTAxXG4gICAgICAgIGNvbnN0IGJpcnRoVGltZUZpZWxkID0gWydiaXJ0aHRpbWUnLCAnbXRpbWUnLCAnY3RpbWUnLCAnYXRpbWUnXS5maW5kKHRpbWUgPT4gc3RhdHNbYCR7dGltZX1Nc2BdKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBmaWxlLFxuICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgZGF0ZTogc3RhdHNbYmlydGhUaW1lRmllbGRdXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGxvZyhcbiAgICAgICAgJ3JlcG9ydGluZzpnZXRSZXBvcnRzJyxcbiAgICAgICAgYFVzaW5nIFRpbVNvcnQgZm9yIHNvcnRpbmcgJHtyZXBvcnRzLmxlbmd0aH0gaXRlbXNgLFxuICAgICAgICAnZGVidWcnXG4gICAgICApO1xuICAgICAgVGltU29ydC5zb3J0KHJlcG9ydHMsIHNvcnRSZXBvcnRzQnlEYXRlKTtcbiAgICAgIGxvZygncmVwb3J0aW5nOmdldFJlcG9ydHMnLCBgVG90YWwgcmVwb3J0czogJHtyZXBvcnRzLmxlbmd0aH1gLCAnZGVidWcnKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHsgcmVwb3J0cyB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Z2V0UmVwb3J0cycsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgNTAzMSwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHNwZWNpZmljIHJlcG9ydFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gcmVwb3J0IG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGdldFJlcG9ydEJ5TmFtZShjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Z2V0UmVwb3J0QnlOYW1lJywgYEdldHRpbmcgJHtyZXF1ZXN0LnBhcmFtcy5uYW1lfSByZXBvcnRgLCAnZGVidWcnKTtcbiAgICAgIGNvbnN0IHt1c2VybmFtZTogdXNlcklEfSA9IGF3YWl0IGNvbnRleHQud2F6dWguc2VjdXJpdHkuZ2V0Q3VycmVudFVzZXIocmVxdWVzdCwgY29udGV4dCk7XG4gICAgICBjb25zdCByZXBvcnRGaWxlQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIHJlcXVlc3QucGFyYW1zLm5hbWUgKSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vcGRmJyB9LFxuICAgICAgICBib2R5OiByZXBvcnRGaWxlQnVmZmVyXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdyZXBvcnRpbmc6Z2V0UmVwb3J0QnlOYW1lJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA1MDMwLCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHNwZWNpZmljIHJlcG9ydFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gc3RhdHVzIG9iaiBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBkZWxldGVSZXBvcnRCeU5hbWUoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvZygncmVwb3J0aW5nOmRlbGV0ZVJlcG9ydEJ5TmFtZScsIGBEZWxldGluZyAke3JlcXVlc3QucGFyYW1zLm5hbWV9IHJlcG9ydGAsICdkZWJ1ZycpO1xuICAgICAgY29uc3Qge3VzZXJuYW1lOiB1c2VySUR9ID0gYXdhaXQgY29udGV4dC53YXp1aC5zZWN1cml0eS5nZXRDdXJyZW50VXNlcihyZXF1ZXN0LCBjb250ZXh0KTtcbiAgICAgIGZzLnVubGlua1N5bmMoXG4gICAgICAgIHBhdGguam9pbihXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRILCB1c2VySUQsIHJlcXVlc3QucGFyYW1zLm5hbWUpXG4gICAgICApO1xuICAgICAgbG9nKCdyZXBvcnRpbmc6ZGVsZXRlUmVwb3J0QnlOYW1lJywgYCR7cmVxdWVzdC5wYXJhbXMubmFtZX0gcmVwb3J0IHdhcyBkZWxldGVkYCwgJ2luZm8nKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHsgZXJyb3I6IDAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygncmVwb3J0aW5nOmRlbGV0ZVJlcG9ydEJ5TmFtZScsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgNTAzMiwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG4iXX0=