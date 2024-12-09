"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jobMonitoringRun = jobMonitoringRun;

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _logger = require("../../lib/logger");

var _monitoringTemplate = require("../../integration-files/monitoring-template");

var _getConfiguration = require("../../lib/get-configuration");

var _parseCron = require("../../lib/parse-cron");

var _indexDate = require("../../lib/index-date");

var _buildIndexSettings = require("../../lib/build-index-settings");

var _wazuhHosts = require("../../controllers/wazuh-hosts");

var _constants = require("../../../common/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Wazuh app - Module for agent info fetching functions
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
const blueWazuh = '\u001b[34mwazuh\u001b[39m';
const monitoringErrorLogColors = [blueWazuh, 'monitoring', 'error'];
const wazuhHostController = new _wazuhHosts.WazuhHostsCtrl();
let MONITORING_ENABLED, MONITORING_FREQUENCY, MONITORING_CRON_FREQ, MONITORING_CREATION, MONITORING_INDEX_PATTERN, MONITORING_INDEX_PREFIX; // Utils functions

/**
 * Delay as promise
 * @param timeMs
 */

function delay(timeMs) {
  return new Promise(resolve => {
    setTimeout(resolve, timeMs);
  });
}
/**
 * Get the setting value from the configuration
 * @param setting
 * @param configuration
 * @param defaultValue
 */


function getAppConfigurationSetting(setting, configuration, defaultValue) {
  return typeof configuration[setting] !== 'undefined' ? configuration[setting] : defaultValue;
}

;
/**
 * Set the monitoring variables
 * @param context
 */

function initMonitoringConfiguration(context) {
  try {
    const appConfig = (0, _getConfiguration.getConfiguration)();
    MONITORING_ENABLED = appConfig && typeof appConfig['wazuh.monitoring.enabled'] !== 'undefined' ? appConfig['wazuh.monitoring.enabled'] && appConfig['wazuh.monitoring.enabled'] !== 'worker' : _constants.WAZUH_MONITORING_DEFAULT_ENABLED;
    MONITORING_FREQUENCY = getAppConfigurationSetting('wazuh.monitoring.frequency', appConfig, _constants.WAZUH_MONITORING_DEFAULT_FREQUENCY);
    MONITORING_CRON_FREQ = (0, _parseCron.parseCron)(MONITORING_FREQUENCY);
    MONITORING_CREATION = getAppConfigurationSetting('wazuh.monitoring.creation', appConfig, _constants.WAZUH_MONITORING_DEFAULT_CREATION);
    MONITORING_INDEX_PATTERN = getAppConfigurationSetting('wazuh.monitoring.pattern', appConfig, _constants.WAZUH_MONITORING_PATTERN);
    const lastCharIndexPattern = MONITORING_INDEX_PATTERN[MONITORING_INDEX_PATTERN.length - 1];

    if (lastCharIndexPattern !== '*') {
      MONITORING_INDEX_PATTERN += '*';
    }

    ;
    MONITORING_INDEX_PREFIX = MONITORING_INDEX_PATTERN.slice(0, MONITORING_INDEX_PATTERN.length - 1);
    (0, _logger.log)('monitoring:initMonitoringConfiguration', `wazuh.monitoring.enabled: ${MONITORING_ENABLED}`, 'debug');
    (0, _logger.log)('monitoring:initMonitoringConfiguration', `wazuh.monitoring.frequency: ${MONITORING_FREQUENCY} (${MONITORING_CRON_FREQ})`, 'debug');
    (0, _logger.log)('monitoring:initMonitoringConfiguration', `wazuh.monitoring.pattern: ${MONITORING_INDEX_PATTERN} (index prefix: ${MONITORING_INDEX_PREFIX})`, 'debug');
  } catch (error) {
    const errorMessage = error.message || error;
    (0, _logger.log)('monitoring:initMonitoringConfiguration', errorMessage);
    context.wazuh.logger.error(errorMessage);
  }
}

;
/**
 * Main. First execution when installing / loading App.
 * @param context
 */

async function init(context) {
  try {
    if (MONITORING_ENABLED) {
      await checkTemplate(context);
    }

    ;
  } catch (error) {
    const errorMessage = error.message || error;
    (0, _logger.log)('monitoring:init', error.message || error);
    context.wazuh.logger.error(errorMessage);
  }
}
/**
 * Verify wazuh-agent template
 */


async function checkTemplate(context) {
  try {
    (0, _logger.log)('monitoring:checkTemplate', 'Updating the monitoring template', 'debug');

    try {
      // Check if the template already exists
      const currentTemplate = await context.core.elasticsearch.client.asInternalUser.indices.getTemplate({
        name: _constants.WAZUH_MONITORING_TEMPLATE_NAME
      }); // Copy already created index patterns

      _monitoringTemplate.monitoringTemplate.index_patterns = currentTemplate.body[_constants.WAZUH_MONITORING_TEMPLATE_NAME].index_patterns;
    } catch (error) {
      // Init with the default index pattern
      _monitoringTemplate.monitoringTemplate.index_patterns = [_constants.WAZUH_MONITORING_PATTERN];
    } // Check if the user is using a custom pattern and add it to the template if it does


    if (!_monitoringTemplate.monitoringTemplate.index_patterns.includes(MONITORING_INDEX_PATTERN)) {
      _monitoringTemplate.monitoringTemplate.index_patterns.push(MONITORING_INDEX_PATTERN);
    }

    ; // Update the monitoring template

    await context.core.elasticsearch.client.asInternalUser.indices.putTemplate({
      name: _constants.WAZUH_MONITORING_TEMPLATE_NAME,
      body: _monitoringTemplate.monitoringTemplate
    });
    (0, _logger.log)('monitoring:checkTemplate', 'Updated the monitoring template', 'debug');
  } catch (error) {
    const errorMessage = `Something went wrong updating the monitoring template ${error.message || error}`;
    (0, _logger.log)('monitoring:checkTemplate', errorMessage);
    context.wazuh.logger.error(monitoringErrorLogColors, errorMessage);
    throw error;
  }
}
/**
 * Save agent status into elasticsearch, create index and/or insert document
 * @param {*} context
 * @param {*} data
 */


async function insertMonitoringDataElasticsearch(context, data) {
  const monitoringIndexName = MONITORING_INDEX_PREFIX + (0, _indexDate.indexDate)(MONITORING_CREATION);

  try {
    if (!MONITORING_ENABLED) {
      return;
    }

    ;

    try {
      const exists = await context.core.elasticsearch.client.asInternalUser.indices.exists({
        index: monitoringIndexName
      });

      if (!exists.body) {
        await createIndex(context, monitoringIndexName);
      }
    } catch (error) {
      (0, _logger.log)('monitoring:insertMonitoringDataElasticsearch', error.message || error);
    }

    try {
      // Update the index configuration
      const appConfig = (0, _getConfiguration.getConfiguration)();
      const indexConfiguration = (0, _buildIndexSettings.buildIndexSettings)(appConfig, 'wazuh.monitoring', _constants.WAZUH_MONITORING_DEFAULT_INDICES_SHARDS); // To update the index settings with this client is required close the index, update the settings and open it
      // Number of shards is not dynamic so delete that setting if it's given

      delete indexConfiguration.settings.index.number_of_shards;
      await context.core.elasticsearch.client.asInternalUser.indices.putSettings({
        index: monitoringIndexName,
        body: indexConfiguration
      });
    } catch (error) {
      (0, _logger.log)('monitoring:insertMonitoringDataElasticsearch', error.message || error);
    } // Insert data to the monitoring index


    await insertDataToIndex(context, monitoringIndexName, data);
  } catch (error) {
    const errorMessage = `Could not check if the index ${monitoringIndexName} exists due to ${error.message || error}`;
    (0, _logger.log)('monitoring:insertMonitoringDataElasticsearch', errorMessage);
    context.wazuh.logger.error(errorMessage);
  }
}
/**
 * Inserting one document per agent into Elastic. Bulk.
 * @param {*} context Endpoint
 * @param {String} indexName The name for the index (e.g. daily: wazuh-monitoring-YYYY.MM.DD)
 * @param {*} data
 */


async function insertDataToIndex(context, indexName, data) {
  const {
    agents,
    apiHost
  } = data;

  try {
    if (agents.length > 0) {
      (0, _logger.log)('monitoring:insertDataToIndex', `Bulk data to index ${indexName} for ${agents.length} agents`, 'debug');
      const bodyBulk = agents.map(agent => {
        const agentInfo = { ...agent
        };
        agentInfo['timestamp'] = new Date(Date.now()).toISOString();
        agentInfo.host = agent.manager;
        agentInfo.cluster = {
          name: apiHost.clusterName ? apiHost.clusterName : 'disabled'
        };
        return `{ "index":  { "_index": "${indexName}" } }\n${JSON.stringify(agentInfo)}\n`;
      }).join('');
      await context.core.elasticsearch.client.asInternalUser.bulk({
        index: indexName,
        body: bodyBulk
      });
      (0, _logger.log)('monitoring:insertDataToIndex', `Bulk data to index ${indexName} for ${agents.length} agents completed`, 'debug');
    }
  } catch (error) {
    (0, _logger.log)('monitoring:insertDataToIndex', `Error inserting agent data into elasticsearch. Bulk request failed due to ${error.message || error}`);
  }
}
/**
 * Create the wazuh-monitoring index
 * @param {*} context context
 * @param {String} indexName The name for the index (e.g. daily: wazuh-monitoring-YYYY.MM.DD)
 */


async function createIndex(context, indexName) {
  try {
    if (!MONITORING_ENABLED) return;
    const appConfig = (0, _getConfiguration.getConfiguration)();
    const IndexConfiguration = {
      settings: {
        index: {
          number_of_shards: getAppConfigurationSetting('wazuh.monitoring.shards', appConfig, _constants.WAZUH_INDEX_SHARDS),
          number_of_replicas: getAppConfigurationSetting('wazuh.monitoring.replicas', appConfig, _constants.WAZUH_INDEX_REPLICAS)
        }
      }
    };
    await context.core.elasticsearch.client.asInternalUser.indices.create({
      index: indexName,
      body: IndexConfiguration
    });
    (0, _logger.log)('monitoring:createIndex', `Successfully created new index: ${indexName}`, 'debug');
  } catch (error) {
    const errorMessage = `Could not create ${indexName} index on elasticsearch due to ${error.message || error}`;
    (0, _logger.log)('monitoring:createIndex', errorMessage);
    context.wazuh.logger.error(errorMessage);
  }
}
/**
* Wait until Kibana server is ready
*/


async function checkKibanaStatus(context) {
  try {
    (0, _logger.log)('monitoring:checkKibanaStatus', 'Waiting for Kibana and Elasticsearch servers to be ready...', 'debug');
    await checkElasticsearchServer(context);
    await init(context);
    return;
  } catch (error) {
    (0, _logger.log)('monitoring:checkKibanaStatus', error.mesage || error);

    try {
      await delay(3000);
      await checkKibanaStatus(context);
    } catch (error) {}

    ;
  }
}
/**
 * Check Elasticsearch Server status and Kibana index presence
 */


async function checkElasticsearchServer(context) {
  try {
    const data = await context.core.elasticsearch.client.asInternalUser.indices.exists({
      index: context.server.config.kibana.index
    });
    return data.body; // TODO: check if Elasticsearch can receive requests
    // if (data) {
    //   const pluginsData = await this.server.plugins.elasticsearch.waitUntilReady();
    //   return pluginsData;
    // }

    return Promise.reject(data);
  } catch (error) {
    (0, _logger.log)('monitoring:checkElasticsearchServer', error.message || error);
    return Promise.reject(error);
  }
}

const fakeResponseEndpoint = {
  ok: body => body,
  custom: body => body
};
/**
 * Get API configuration from elastic and callback to loadCredentials
 */

async function getHostsConfiguration() {
  try {
    const hosts = await wazuhHostController.getHostsEntries(false, false, fakeResponseEndpoint);

    if (hosts.body.length) {
      return hosts.body;
    }

    ;
    (0, _logger.log)('monitoring:getConfig', 'There are no Wazuh API entries yet', 'debug');
    return Promise.reject({
      error: 'no credentials',
      error_code: 1
    });
  } catch (error) {
    (0, _logger.log)('monitoring:getHostsConfiguration', error.message || error);
    return Promise.reject({
      error: 'no wazuh hosts',
      error_code: 2
    });
  }
}
/**
   * Task used by the cron job.
   */


async function cronTask(context) {
  try {
    const templateMonitoring = await context.core.elasticsearch.client.asInternalUser.indices.getTemplate({
      name: _constants.WAZUH_MONITORING_TEMPLATE_NAME
    });
    const apiHosts = await getHostsConfiguration();
    const apiHostsUnique = (apiHosts || []).filter((apiHost, index, self) => index === self.findIndex(t => t.user === apiHost.user && t.password === apiHost.password && t.url === apiHost.url && t.port === apiHost.port));

    for (let apiHost of apiHostsUnique) {
      try {
        const {
          agents,
          apiHost: host
        } = await getApiInfo(context, apiHost);
        await insertMonitoringDataElasticsearch(context, {
          agents,
          apiHost: host
        });
      } catch (error) {}

      ;
    }
  } catch (error) {
    // Retry to call itself again if Kibana index is not ready yet
    // try {
    //   if (
    //     this.wzWrapper.buildingKibanaIndex ||
    //     ((error || {}).status === 404 &&
    //       (error || {}).displayName === 'NotFound')
    //   ) {
    //     await delay(1000);
    //     return cronTask(context);
    //   }
    // } catch (error) {} //eslint-disable-line
    (0, _logger.log)('monitoring:cronTask', error.message || error);
    context.wazuh.logger.error(error.message || error);
  }
}
/**
 * Get API and agents info
 * @param context
 * @param apiHost
 */


async function getApiInfo(context, apiHost) {
  try {
    (0, _logger.log)('monitoring:getApiInfo', `Getting API info for ${apiHost.id}`, 'debug');
    const responseIsCluster = await context.wazuh.api.client.asInternalUser.request('GET', '/cluster/status', {}, {
      apiHostID: apiHost.id
    });
    const isCluster = (((responseIsCluster || {}).data || {}).data || {}).enabled === 'yes';

    if (isCluster) {
      const responseClusterInfo = await context.wazuh.api.client.asInternalUser.request('GET', `/cluster/local/info`, {}, {
        apiHostID: apiHost.id
      });
      apiHost.clusterName = responseClusterInfo.data.data.affected_items[0].cluster;
    }

    ;
    const agents = await fetchAllAgentsFromApiHost(context, apiHost);
    return {
      agents,
      apiHost
    };
  } catch (error) {
    (0, _logger.log)('monitoring:getApiInfo', error.message || error);
    throw error;
  }
}

;
/**
 * Fetch all agents for the API provided
 * @param context
 * @param apiHost
 */

async function fetchAllAgentsFromApiHost(context, apiHost) {
  let agents = [];

  try {
    (0, _logger.log)('monitoring:fetchAllAgentsFromApiHost', `Getting all agents from ApiID: ${apiHost.id}`, 'debug');
    const responseAgentsCount = await context.wazuh.api.client.asInternalUser.request('GET', '/agents', {
      params: {
        offset: 0,
        limit: 1,
        q: 'id!=000'
      }
    }, {
      apiHostID: apiHost.id
    });
    const agentsCount = responseAgentsCount.data.data.total_affected_items;
    (0, _logger.log)('monitoring:fetchAllAgentsFromApiHost', `ApiID: ${apiHost.id}, Agent count: ${agentsCount}`, 'debug');
    let payload = {
      offset: 0,
      limit: 500,
      q: 'id!=000'
    };

    while (agents.length < agentsCount && payload.offset < agentsCount) {
      try {
        const responseAgents = await context.wazuh.api.client.asInternalUser.request('GET', `/agents`, {
          params: payload
        }, {
          apiHostID: apiHost.id
        });
        agents = [...agents, ...responseAgents.data.data.affected_items];
        payload.offset += payload.limit;
      } catch (error) {
        (0, _logger.log)('monitoring:fetchAllAgentsFromApiHost', `ApiID: ${apiHost.id}, Error request with offset/limit ${payload.offset}/${payload.limit}: ${error.message || error}`);
      }
    }

    return agents;
  } catch (error) {
    (0, _logger.log)('monitoring:fetchAllAgentsFromApiHost', `ApiID: ${apiHost.id}. Error: ${error.message || error}`);
    throw error;
  }
}

;
/**
 * Start the cron job
 */

async function jobMonitoringRun(context) {
  // Init the monitoring variables
  initMonitoringConfiguration(context); // Check Kibana index and if it is prepared, start the initialization of Wazuh App.

  await checkKibanaStatus(context); // // Run the cron job only it it's enabled

  if (MONITORING_ENABLED) {
    cronTask(context);

    _nodeCron.default.schedule(MONITORING_CRON_FREQ, () => cronTask(context));
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImJsdWVXYXp1aCIsIm1vbml0b3JpbmdFcnJvckxvZ0NvbG9ycyIsIndhenVoSG9zdENvbnRyb2xsZXIiLCJXYXp1aEhvc3RzQ3RybCIsIk1PTklUT1JJTkdfRU5BQkxFRCIsIk1PTklUT1JJTkdfRlJFUVVFTkNZIiwiTU9OSVRPUklOR19DUk9OX0ZSRVEiLCJNT05JVE9SSU5HX0NSRUFUSU9OIiwiTU9OSVRPUklOR19JTkRFWF9QQVRURVJOIiwiTU9OSVRPUklOR19JTkRFWF9QUkVGSVgiLCJkZWxheSIsInRpbWVNcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsImdldEFwcENvbmZpZ3VyYXRpb25TZXR0aW5nIiwic2V0dGluZyIsImNvbmZpZ3VyYXRpb24iLCJkZWZhdWx0VmFsdWUiLCJpbml0TW9uaXRvcmluZ0NvbmZpZ3VyYXRpb24iLCJjb250ZXh0IiwiYXBwQ29uZmlnIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0VOQUJMRUQiLCJXQVpVSF9NT05JVE9SSU5HX0RFRkFVTFRfRlJFUVVFTkNZIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NSRUFUSU9OIiwiV0FaVUhfTU9OSVRPUklOR19QQVRURVJOIiwibGFzdENoYXJJbmRleFBhdHRlcm4iLCJsZW5ndGgiLCJzbGljZSIsImVycm9yIiwiZXJyb3JNZXNzYWdlIiwibWVzc2FnZSIsIndhenVoIiwibG9nZ2VyIiwiaW5pdCIsImNoZWNrVGVtcGxhdGUiLCJjdXJyZW50VGVtcGxhdGUiLCJjb3JlIiwiZWxhc3RpY3NlYXJjaCIsImNsaWVudCIsImFzSW50ZXJuYWxVc2VyIiwiaW5kaWNlcyIsImdldFRlbXBsYXRlIiwibmFtZSIsIldBWlVIX01PTklUT1JJTkdfVEVNUExBVEVfTkFNRSIsIm1vbml0b3JpbmdUZW1wbGF0ZSIsImluZGV4X3BhdHRlcm5zIiwiYm9keSIsImluY2x1ZGVzIiwicHVzaCIsInB1dFRlbXBsYXRlIiwiaW5zZXJ0TW9uaXRvcmluZ0RhdGFFbGFzdGljc2VhcmNoIiwiZGF0YSIsIm1vbml0b3JpbmdJbmRleE5hbWUiLCJleGlzdHMiLCJpbmRleCIsImNyZWF0ZUluZGV4IiwiaW5kZXhDb25maWd1cmF0aW9uIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0lORElDRVNfU0hBUkRTIiwic2V0dGluZ3MiLCJudW1iZXJfb2Zfc2hhcmRzIiwicHV0U2V0dGluZ3MiLCJpbnNlcnREYXRhVG9JbmRleCIsImluZGV4TmFtZSIsImFnZW50cyIsImFwaUhvc3QiLCJib2R5QnVsayIsIm1hcCIsImFnZW50IiwiYWdlbnRJbmZvIiwiRGF0ZSIsIm5vdyIsInRvSVNPU3RyaW5nIiwiaG9zdCIsIm1hbmFnZXIiLCJjbHVzdGVyIiwiY2x1c3Rlck5hbWUiLCJKU09OIiwic3RyaW5naWZ5Iiwiam9pbiIsImJ1bGsiLCJJbmRleENvbmZpZ3VyYXRpb24iLCJXQVpVSF9JTkRFWF9TSEFSRFMiLCJudW1iZXJfb2ZfcmVwbGljYXMiLCJXQVpVSF9JTkRFWF9SRVBMSUNBUyIsImNyZWF0ZSIsImNoZWNrS2liYW5hU3RhdHVzIiwiY2hlY2tFbGFzdGljc2VhcmNoU2VydmVyIiwibWVzYWdlIiwic2VydmVyIiwiY29uZmlnIiwia2liYW5hIiwicmVqZWN0IiwiZmFrZVJlc3BvbnNlRW5kcG9pbnQiLCJvayIsImN1c3RvbSIsImdldEhvc3RzQ29uZmlndXJhdGlvbiIsImhvc3RzIiwiZ2V0SG9zdHNFbnRyaWVzIiwiZXJyb3JfY29kZSIsImNyb25UYXNrIiwidGVtcGxhdGVNb25pdG9yaW5nIiwiYXBpSG9zdHMiLCJhcGlIb3N0c1VuaXF1ZSIsImZpbHRlciIsInNlbGYiLCJmaW5kSW5kZXgiLCJ0IiwidXNlciIsInBhc3N3b3JkIiwidXJsIiwicG9ydCIsImdldEFwaUluZm8iLCJpZCIsInJlc3BvbnNlSXNDbHVzdGVyIiwiYXBpIiwicmVxdWVzdCIsImFwaUhvc3RJRCIsImlzQ2x1c3RlciIsImVuYWJsZWQiLCJyZXNwb25zZUNsdXN0ZXJJbmZvIiwiYWZmZWN0ZWRfaXRlbXMiLCJmZXRjaEFsbEFnZW50c0Zyb21BcGlIb3N0IiwicmVzcG9uc2VBZ2VudHNDb3VudCIsInBhcmFtcyIsIm9mZnNldCIsImxpbWl0IiwicSIsImFnZW50c0NvdW50IiwidG90YWxfYWZmZWN0ZWRfaXRlbXMiLCJwYXlsb2FkIiwicmVzcG9uc2VBZ2VudHMiLCJqb2JNb25pdG9yaW5nUnVuIiwiY3JvbiIsInNjaGVkdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBV0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFuQkE7Ozs7Ozs7Ozs7O0FBOEJBLE1BQU1BLFNBQVMsR0FBRywyQkFBbEI7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxDQUFDRCxTQUFELEVBQVksWUFBWixFQUEwQixPQUExQixDQUFqQztBQUNBLE1BQU1FLG1CQUFtQixHQUFHLElBQUlDLDBCQUFKLEVBQTVCO0FBRUEsSUFBSUMsa0JBQUosRUFBd0JDLG9CQUF4QixFQUE4Q0Msb0JBQTlDLEVBQW9FQyxtQkFBcEUsRUFBeUZDLHdCQUF6RixFQUFtSEMsdUJBQW5ILEMsQ0FFQTs7QUFFQTs7Ozs7QUFJQSxTQUFTQyxLQUFULENBQWVDLE1BQWYsRUFBK0I7QUFDN0IsU0FBTyxJQUFJQyxPQUFKLENBQWFDLE9BQUQsSUFBYTtBQUM5QkMsSUFBQUEsVUFBVSxDQUFDRCxPQUFELEVBQVVGLE1BQVYsQ0FBVjtBQUNELEdBRk0sQ0FBUDtBQUdEO0FBRUQ7Ozs7Ozs7O0FBTUEsU0FBU0ksMEJBQVQsQ0FBb0NDLE9BQXBDLEVBQXFEQyxhQUFyRCxFQUF5RUMsWUFBekUsRUFBMkY7QUFDekYsU0FBTyxPQUFPRCxhQUFhLENBQUNELE9BQUQsQ0FBcEIsS0FBa0MsV0FBbEMsR0FBZ0RDLGFBQWEsQ0FBQ0QsT0FBRCxDQUE3RCxHQUF5RUUsWUFBaEY7QUFDRDs7QUFBQTtBQUVEOzs7OztBQUlBLFNBQVNDLDJCQUFULENBQXFDQyxPQUFyQyxFQUE2QztBQUMzQyxNQUFH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QUFZO0FBQ1gscUJBQUksc0NBQUosRUFBNkMsVUFBU29DLE9BQU8sQ0FBQ2dELEVBQUcsWUFBV3BGLEtBQUssQ0FBQ0UsT0FBTixJQUFpQkYsS0FBTSxFQUFuRztBQUNBLFVBQU1BLEtBQU47QUFDRDtBQUNGOztBQUFBO0FBRUQ7Ozs7QUFHTyxlQUFldUcsZ0JBQWYsQ0FBZ0NoSCxPQUFoQyxFQUF5QztBQUM5QztBQUNBRCxFQUFBQSwyQkFBMkIsQ0FBQ0MsT0FBRCxDQUEzQixDQUY4QyxDQUc5Qzs7QUFDQSxRQUFNa0UsaUJBQWlCLENBQUNsRSxPQUFELENBQXZCLENBSjhDLENBSzlDOztBQUNBLE1BQUloQixrQkFBSixFQUF3QjtBQUN0QmdHLElBQUFBLFFBQVEsQ0FBQ2hGLE9BQUQsQ0FBUjs7QUFDQWlILHNCQUFLQyxRQUFMLENBQWNoSSxvQkFBZCxFQUFvQyxNQUFNOEYsUUFBUSxDQUFDaEYsT0FBRCxDQUFsRDtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBhZ2VudCBpbmZvIGZldGNoaW5nIGZ1bmN0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmltcG9ydCBjcm9uIGZyb20gJ25vZGUtY3Jvbic7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi8uLi9saWIvbG9nZ2VyJztcbmltcG9ydCB7IG1vbml0b3JpbmdUZW1wbGF0ZSB9IGZyb20gJy4uLy4uL2ludGVncmF0aW9uLWZpbGVzL21vbml0b3JpbmctdGVtcGxhdGUnO1xuaW1wb3J0IHsgZ2V0Q29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2xpYi9nZXQtY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBwYXJzZUNyb24gfSBmcm9tICcuLi8uLi9saWIvcGFyc2UtY3Jvbic7XG5pbXBvcnQgeyBpbmRleERhdGUgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgtZGF0ZSc7XG5pbXBvcnQgeyBidWlsZEluZGV4U2V0dGluZ3MgfSBmcm9tICcuLi8uLi9saWIvYnVpbGQtaW5kZXgtc2V0dGluZ3MnO1xuaW1wb3J0IHsgV2F6dWhIb3N0c0N0cmwgfSBmcm9tICcuLi8uLi9jb250cm9sbGVycy93YXp1aC1ob3N0cyc7XG5pbXBvcnQgeyBcbiAgV0FaVUhfTU9OSVRPUklOR19QQVRURVJOLFxuICBXQVpVSF9JTkRFWF9TSEFSRFMsXG4gIFdBWlVIX0lOREVYX1JFUExJQ0FTLFxuICBXQVpVSF9NT05JVE9SSU5HX1RFTVBMQVRFX05BTUUsXG4gIFdBWlVIX01PTklUT1JJTkdfREVGQVVMVF9JTkRJQ0VTX1NIQVJEUyxcbiAgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NSRUFUSU9OLFxuICBXQVpVSF9NT05JVE9SSU5HX0RFRkFVTFRfRU5BQkxFRCxcbiAgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0ZSRVFVRU5DWSxcbn0gZnJvbSAnLi4vLi4vLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbmNvbnN0IGJsdWVXYXp1aCA9ICdcXHUwMDFiWzM0bXdhenVoXFx1MDAxYlszOW0nO1xuY29uc3QgbW9uaXRvcmluZ0Vycm9yTG9nQ29sb3JzID0gW2JsdWVXYXp1aCwgJ21vbml0b3JpbmcnLCAnZXJyb3InXTtcbmNvbnN0IHdhenVoSG9zdENvbnRyb2xsZXIgPSBuZXcgV2F6dWhIb3N0c0N0cmwoKTtcblxubGV0IE1PTklUT1JJTkdfRU5BQkxFRCwgTU9OSVRPUklOR19GUkVRVUVOQ1ksIE1PTklUT1JJTkdfQ1JPTl9GUkVRLCBNT05JVE9SSU5HX0NSRUFUSU9OLCBNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4sIE1PTklUT1JJTkdfSU5ERVhfUFJFRklYO1xuXG4vLyBVdGlscyBmdW5jdGlvbnNcblxuLyoqXG4gKiBEZWxheSBhcyBwcm9taXNlXG4gKiBAcGFyYW0gdGltZU1zXG4gKi9cbmZ1bmN0aW9uIGRlbGF5KHRpbWVNczogbnVtYmVyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZU1zKTtcbiAgfSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBzZXR0aW5nIHZhbHVlIGZyb20gdGhlIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBzZXR0aW5nXG4gKiBAcGFyYW0gY29uZmlndXJhdGlvblxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZVxuICovXG5mdW5jdGlvbiBnZXRBcHBDb25maWd1cmF0aW9uU2V0dGluZyhzZXR0aW5nOiBzdHJpbmcsIGNvbmZpZ3VyYXRpb246IGFueSwgZGVmYXVsdFZhbHVlOiBhbnkpe1xuICByZXR1cm4gdHlwZW9mIGNvbmZpZ3VyYXRpb25bc2V0dGluZ10gIT09ICd1bmRlZmluZWQnID8gY29uZmlndXJhdGlvbltzZXR0aW5nXSA6IGRlZmF1bHRWYWx1ZTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBtb25pdG9yaW5nIHZhcmlhYmxlc1xuICogQHBhcmFtIGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gaW5pdE1vbml0b3JpbmdDb25maWd1cmF0aW9uKGNvbnRleHQpe1xuICB0cnl7XG4gICAgY29uc3QgYXBwQ29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgIE1PTklUT1JJTkdfRU5BQkxFRCA9IGFwcENvbmZpZyAmJiB0eXBlb2YgYXBwQ29uZmlnWyd3YXp1aC5tb25pdG9yaW5nLmVuYWJsZWQnXSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gYXBwQ29uZmlnWyd3YXp1aC5tb25pdG9yaW5nLmVuYWJsZWQnXSAmJlxuICAgICAgICBhcHBDb25maWdbJ3dhenVoLm1vbml0b3JpbmcuZW5hYmxlZCddICE9PSAnd29ya2VyJ1xuICAgICAgOiBXQVpVSF9NT05JVE9SSU5HX0RFRkFVTFRfRU5BQkxFRDtcbiAgICBNT05JVE9SSU5HX0ZSRVFVRU5DWSA9IGdldEFwcENvbmZpZ3VyYXRpb25TZXR0aW5nKCd3YXp1aC5tb25pdG9yaW5nLmZyZXF1ZW5jeScsIGFwcENvbmZpZywgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0ZSRVFVRU5DWSk7XG4gICAgTU9OSVRPUklOR19DUk9OX0ZSRVEgPSBwYXJzZUNyb24oTU9OSVRPUklOR19GUkVRVUVOQ1kpO1xuICAgIE1PTklUT1JJTkdfQ1JFQVRJT04gPSBnZXRBcHBDb25maWd1cmF0aW9uU2V0dGluZygnd2F6dWgubW9uaXRvcmluZy5jcmVhdGlvbicsIGFwcENvbmZpZywgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NSRUFUSU9OKTtcblxuICAgIE1PTklUT1JJTkdfSU5ERVhfUEFUVEVSTiA9IGdldEFwcENvbmZpZ3VyYXRpb25TZXR0aW5nKCd3YXp1aC5tb25pdG9yaW5nLnBhdHRlcm4nLCBhcHBDb25maWcsIFdBWlVIX01PTklUT1JJTkdfUEFUVEVSTik7XG4gICAgY29uc3QgbGFzdENoYXJJbmRleFBhdHRlcm4gPSBNT05JVE9SSU5HX0lOREVYX1BBVFRFUk5bTU9OSVRPUklOR19JTkRFWF9QQVRURVJOLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsYXN0Q2hhckluZGV4UGF0dGVybiAhPT0gJyonKSB7XG4gICAgICBNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4gKz0gJyonO1xuICAgIH07XG4gICAgTU9OSVRPUklOR19JTkRFWF9QUkVGSVggPSBNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4uc2xpY2UoMCxNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4ubGVuZ3RoIC0gMSk7XG5cbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzppbml0TW9uaXRvcmluZ0NvbmZpZ3VyYXRpb24nLFxuICAgICAgYHdhenVoLm1vbml0b3JpbmcuZW5hYmxlZDogJHtNT05JVE9SSU5HX0VOQUJMRUR9YCxcbiAgICAgICdkZWJ1ZydcbiAgICApO1xuXG4gICAgbG9nKFxuICAgICAgJ21vbml0b3Jpbmc6aW5pdE1vbml0b3JpbmdDb25maWd1cmF0aW9uJyxcbiAgICAgIGB3YXp1aC5tb25pdG9yaW5nLmZyZXF1ZW5jeTogJHtNT05JVE9SSU5HX0ZSRVFVRU5DWX0gKCR7TU9OSVRPUklOR19DUk9OX0ZSRVF9KWAsXG4gICAgICAnZGVidWcnXG4gICAgKTtcblxuICAgIGxvZyhcbiAgICAgICdtb25pdG9yaW5nOmluaXRNb25pdG9yaW5nQ29uZmlndXJhdGlvbicsXG4gICAgICBgd2F6dWgubW9uaXRvcmluZy5wYXR0ZXJuOiAke01PTklUT1JJTkdfSU5ERVhfUEFUVEVSTn0gKGluZGV4IHByZWZpeDogJHtNT05JVE9SSU5HX0lOREVYX1BSRUZJWH0pYCxcbiAgICAgICdkZWJ1ZydcbiAgICApO1xuICB9Y2F0Y2goZXJyb3Ipe1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgbG9nKFxuICAgICAgJ21vbml0b3Jpbmc6aW5pdE1vbml0b3JpbmdDb25maWd1cmF0aW9uJyxcbiAgICAgIGVycm9yTWVzc2FnZVxuICAgICk7XG4gICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKVxuICB9XG59O1xuXG4vKipcbiAqIE1haW4uIEZpcnN0IGV4ZWN1dGlvbiB3aGVuIGluc3RhbGxpbmcgLyBsb2FkaW5nIEFwcC5cbiAqIEBwYXJhbSBjb250ZXh0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluaXQoY29udGV4dCkge1xuICB0cnkge1xuICAgIGlmIChNT05JVE9SSU5HX0VOQUJMRUQpIHtcbiAgICAgIGF3YWl0IGNoZWNrVGVtcGxhdGUoY29udGV4dCk7XG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yO1xuICAgIGxvZygnbW9uaXRvcmluZzppbml0JywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmeSB3YXp1aC1hZ2VudCB0ZW1wbGF0ZVxuICovXG5hc3luYyBmdW5jdGlvbiBjaGVja1RlbXBsYXRlKGNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzpjaGVja1RlbXBsYXRlJyxcbiAgICAgICdVcGRhdGluZyB0aGUgbW9uaXRvcmluZyB0ZW1wbGF0ZScsXG4gICAgICAnZGVidWcnXG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgdGVtcGxhdGUgYWxyZWFkeSBleGlzdHNcbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmdldFRlbXBsYXRlKHtcbiAgICAgICAgbmFtZTogV0FaVUhfTU9OSVRPUklOR19URU1QTEFURV9OQU1FXG4gICAgICB9KTtcbiAgICAgIC8vIENvcHkgYWxyZWFkeSBjcmVhdGVkIGluZGV4IHBhdHRlcm5zXG4gICAgICBtb25pdG9yaW5nVGVtcGxhdGUuaW5kZXhfcGF0dGVybnMgPSBjdXJyZW50VGVtcGxhdGUuYm9keVtXQVpVSF9NT05JVE9SSU5HX1RFTVBMQVRFX05BTUVdLmluZGV4X3BhdHRlcm5zO1xuICAgIH1jYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIEluaXQgd2l0aCB0aGUgZGVmYXVsdCBpbmRleCBwYXR0ZXJuXG4gICAgICBtb25pdG9yaW5nVGVtcGxhdGUuaW5kZXhfcGF0dGVybnMgPSBbV0FaVUhfTU9OSVRPUklOR19QQVRURVJOXTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBpcyB1c2luZyBhIGN1c3RvbSBwYXR0ZXJuIGFuZCBhZGQgaXQgdG8gdGhlIHRlbXBsYXRlIGlmIGl0IGRvZXNcbiAgICBpZiAoIW1vbml0b3JpbmdUZW1wbGF0ZS5pbmRleF9wYXR0ZXJucy5pbmNsdWRlcyhNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4pKSB7XG4gICAgICBtb25pdG9yaW5nVGVtcGxhdGUuaW5kZXhfcGF0dGVybnMucHVzaChNT05JVE9SSU5HX0lOREVYX1BBVFRFUk4pO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1vbml0b3JpbmcgdGVtcGxhdGVcbiAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuaW5kaWNlcy5wdXRUZW1wbGF0ZSh7XG4gICAgICBuYW1lOiBXQVpVSF9NT05JVE9SSU5HX1RFTVBMQVRFX05BTUUsXG4gICAgICBib2R5OiBtb25pdG9yaW5nVGVtcGxhdGVcbiAgICB9KTtcbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzpjaGVja1RlbXBsYXRlJyxcbiAgICAgICdVcGRhdGVkIHRoZSBtb25pdG9yaW5nIHRlbXBsYXRlJyxcbiAgICAgICdkZWJ1ZydcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBTb21ldGhpbmcgd2VudCB3cm9uZyB1cGRhdGluZyB0aGUgbW9uaXRvcmluZyB0ZW1wbGF0ZSAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YDtcbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzpjaGVja1RlbXBsYXRlJyxcbiAgICAgIGVycm9yTWVzc2FnZVxuICAgICk7XG4gICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IobW9uaXRvcmluZ0Vycm9yTG9nQ29sb3JzLCBlcnJvck1lc3NhZ2UpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogU2F2ZSBhZ2VudCBzdGF0dXMgaW50byBlbGFzdGljc2VhcmNoLCBjcmVhdGUgaW5kZXggYW5kL29yIGluc2VydCBkb2N1bWVudFxuICogQHBhcmFtIHsqfSBjb250ZXh0XG4gKiBAcGFyYW0geyp9IGRhdGFcbiAqL1xuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0TW9uaXRvcmluZ0RhdGFFbGFzdGljc2VhcmNoKGNvbnRleHQsIGRhdGEpIHtcbiAgY29uc3QgbW9uaXRvcmluZ0luZGV4TmFtZSA9IE1PTklUT1JJTkdfSU5ERVhfUFJFRklYICsgaW5kZXhEYXRlKE1PTklUT1JJTkdfQ1JFQVRJT04pO1xuICB0cnkge1xuICAgIGlmICghTU9OSVRPUklOR19FTkFCTEVEKXtcbiAgICAgIHJldHVybjtcbiAgICB9O1xuICAgIHRyeXtcbiAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmV4aXN0cyh7aW5kZXg6IG1vbml0b3JpbmdJbmRleE5hbWV9KTtcbiAgICAgIGlmKCFleGlzdHMuYm9keSl7XG4gICAgICAgIGF3YWl0IGNyZWF0ZUluZGV4KGNvbnRleHQsIG1vbml0b3JpbmdJbmRleE5hbWUpO1xuICAgICAgfVxuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBsb2coJ21vbml0b3Jpbmc6aW5zZXJ0TW9uaXRvcmluZ0RhdGFFbGFzdGljc2VhcmNoJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgfVxuICAgIHRyeXtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXggY29uZmlndXJhdGlvblxuICAgICAgY29uc3QgYXBwQ29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgICAgY29uc3QgaW5kZXhDb25maWd1cmF0aW9uID0gYnVpbGRJbmRleFNldHRpbmdzKFxuICAgICAgICBhcHBDb25maWcsXG4gICAgICAgICd3YXp1aC5tb25pdG9yaW5nJyxcbiAgICAgICAgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0lORElDRVNfU0hBUkRTXG4gICAgICApO1xuXG4gICAgICAvLyBUbyB1cGRhdGUgdGhlIGluZGV4IHNldHRpbmdzIHdpdGggdGhpcyBjbGllbnQgaXMgcmVxdWlyZWQgY2xvc2UgdGhlIGluZGV4LCB1cGRhdGUgdGhlIHNldHRpbmdzIGFuZCBvcGVuIGl0XG4gICAgICAvLyBOdW1iZXIgb2Ygc2hhcmRzIGlzIG5vdCBkeW5hbWljIHNvIGRlbGV0ZSB0aGF0IHNldHRpbmcgaWYgaXQncyBnaXZlblxuICAgICAgZGVsZXRlIGluZGV4Q29uZmlndXJhdGlvbi5zZXR0aW5ncy5pbmRleC5udW1iZXJfb2Zfc2hhcmRzO1xuICAgICAgYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmluZGljZXMucHV0U2V0dGluZ3Moe1xuICAgICAgICBpbmRleDogbW9uaXRvcmluZ0luZGV4TmFtZSxcbiAgICAgICAgYm9keTogaW5kZXhDb25maWd1cmF0aW9uXG4gICAgICB9KTtcblxuICAgIH1jYXRjaChlcnJvcil7XG4gICAgICBsb2coJ21vbml0b3Jpbmc6aW5zZXJ0TW9uaXRvcmluZ0RhdGFFbGFzdGljc2VhcmNoJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgfVxuXG4gICAgLy8gSW5zZXJ0IGRhdGEgdG8gdGhlIG1vbml0b3JpbmcgaW5kZXhcbiAgICBhd2FpdCBpbnNlcnREYXRhVG9JbmRleChjb250ZXh0LCBtb25pdG9yaW5nSW5kZXhOYW1lLCBkYXRhKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ291bGQgbm90IGNoZWNrIGlmIHRoZSBpbmRleCAke1xuICAgICAgbW9uaXRvcmluZ0luZGV4TmFtZVxuICAgIH0gZXhpc3RzIGR1ZSB0byAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YDtcbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzppbnNlcnRNb25pdG9yaW5nRGF0YUVsYXN0aWNzZWFyY2gnLFxuICAgICAgZXJyb3JNZXNzYWdlXG4gICAgKTtcbiAgICBjb250ZXh0LndhenVoLmxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0aW5nIG9uZSBkb2N1bWVudCBwZXIgYWdlbnQgaW50byBFbGFzdGljLiBCdWxrLlxuICogQHBhcmFtIHsqfSBjb250ZXh0IEVuZHBvaW50XG4gKiBAcGFyYW0ge1N0cmluZ30gaW5kZXhOYW1lIFRoZSBuYW1lIGZvciB0aGUgaW5kZXggKGUuZy4gZGFpbHk6IHdhenVoLW1vbml0b3JpbmctWVlZWS5NTS5ERClcbiAqIEBwYXJhbSB7Kn0gZGF0YVxuICovXG5hc3luYyBmdW5jdGlvbiBpbnNlcnREYXRhVG9JbmRleChjb250ZXh0LCBpbmRleE5hbWU6IHN0cmluZywgZGF0YToge2FnZW50czogYW55W10sIGFwaUhvc3R9KSB7XG4gIGNvbnN0IHsgYWdlbnRzLCBhcGlIb3N0IH0gPSBkYXRhO1xuICB0cnkge1xuICAgIGlmIChhZ2VudHMubGVuZ3RoID4gMCkge1xuICAgICAgbG9nKFxuICAgICAgICAnbW9uaXRvcmluZzppbnNlcnREYXRhVG9JbmRleCcsXG4gICAgICAgIGBCdWxrIGRhdGEgdG8gaW5kZXggJHtpbmRleE5hbWV9IGZvciAke2FnZW50cy5sZW5ndGh9IGFnZW50c2AsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGJvZHlCdWxrID0gYWdlbnRzLm1hcChhZ2VudCA9PiB7XG4gICAgICAgIGNvbnN0IGFnZW50SW5mbyA9IHsuLi5hZ2VudH07XG4gICAgICAgIGFnZW50SW5mb1sndGltZXN0YW1wJ10gPSBuZXcgRGF0ZShEYXRlLm5vdygpKS50b0lTT1N0cmluZygpO1xuICAgICAgICBhZ2VudEluZm8uaG9zdCA9IGFnZW50Lm1hbmFnZXI7XG4gICAgICAgIGFnZW50SW5mby5jbHVzdGVyID0geyBuYW1lOiBhcGlIb3N0LmNsdXN0ZXJOYW1lID8gYXBpSG9zdC5jbHVzdGVyTmFtZSA6ICdkaXNhYmxlZCcgfTtcbiAgICAgICAgcmV0dXJuIGB7IFwiaW5kZXhcIjogIHsgXCJfaW5kZXhcIjogXCIke2luZGV4TmFtZX1cIiB9IH1cXG4ke0pTT04uc3RyaW5naWZ5KGFnZW50SW5mbyl9XFxuYDtcbiAgICAgIH0pLmpvaW4oJycpO1xuXG4gICAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuYnVsayh7XG4gICAgICAgIGluZGV4OiBpbmRleE5hbWUsXG4gICAgICAgIGJvZHk6IGJvZHlCdWxrXG4gICAgICB9KTtcbiAgICAgIGxvZyhcbiAgICAgICAgJ21vbml0b3Jpbmc6aW5zZXJ0RGF0YVRvSW5kZXgnLFxuICAgICAgICBgQnVsayBkYXRhIHRvIGluZGV4ICR7aW5kZXhOYW1lfSBmb3IgJHthZ2VudHMubGVuZ3RofSBhZ2VudHMgY29tcGxldGVkYCxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nKFxuICAgICAgJ21vbml0b3Jpbmc6aW5zZXJ0RGF0YVRvSW5kZXgnLFxuICAgICAgYEVycm9yIGluc2VydGluZyBhZ2VudCBkYXRhIGludG8gZWxhc3RpY3NlYXJjaC4gQnVsayByZXF1ZXN0IGZhaWxlZCBkdWUgdG8gJHtlcnJvci5tZXNzYWdlIHx8XG4gICAgICAgIGVycm9yfWBcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIHRoZSB3YXp1aC1tb25pdG9yaW5nIGluZGV4XG4gKiBAcGFyYW0geyp9IGNvbnRleHQgY29udGV4dFxuICogQHBhcmFtIHtTdHJpbmd9IGluZGV4TmFtZSBUaGUgbmFtZSBmb3IgdGhlIGluZGV4IChlLmcuIGRhaWx5OiB3YXp1aC1tb25pdG9yaW5nLVlZWVkuTU0uREQpXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUluZGV4KGNvbnRleHQsIGluZGV4TmFtZTogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgaWYgKCFNT05JVE9SSU5HX0VOQUJMRUQpIHJldHVybjtcbiAgICBjb25zdCBhcHBDb25maWcgPSBnZXRDb25maWd1cmF0aW9uKCk7XG5cbiAgICBjb25zdCBJbmRleENvbmZpZ3VyYXRpb24gPSB7XG4gICAgICBzZXR0aW5nczoge1xuICAgICAgICBpbmRleDoge1xuICAgICAgICAgIG51bWJlcl9vZl9zaGFyZHM6IGdldEFwcENvbmZpZ3VyYXRpb25TZXR0aW5nKCd3YXp1aC5tb25pdG9yaW5nLnNoYXJkcycsIGFwcENvbmZpZywgV0FaVUhfSU5ERVhfU0hBUkRTKSxcbiAgICAgICAgICBudW1iZXJfb2ZfcmVwbGljYXM6IGdldEFwcENvbmZpZ3VyYXRpb25TZXR0aW5nKCd3YXp1aC5tb25pdG9yaW5nLnJlcGxpY2FzJywgYXBwQ29uZmlnLCBXQVpVSF9JTkRFWF9SRVBMSUNBUylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuaW5kaWNlcy5jcmVhdGUoe1xuICAgICAgaW5kZXg6IGluZGV4TmFtZSxcbiAgICAgIGJvZHk6IEluZGV4Q29uZmlndXJhdGlvblxuICAgIH0pO1xuXG4gICAgbG9nKFxuICAgICAgJ21vbml0b3Jpbmc6Y3JlYXRlSW5kZXgnLFxuICAgICAgYFN1Y2Nlc3NmdWxseSBjcmVhdGVkIG5ldyBpbmRleDogJHtpbmRleE5hbWV9YCxcbiAgICAgICdkZWJ1ZydcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDb3VsZCBub3QgY3JlYXRlICR7aW5kZXhOYW1lfSBpbmRleCBvbiBlbGFzdGljc2VhcmNoIGR1ZSB0byAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YDtcbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzpjcmVhdGVJbmRleCcsXG4gICAgICBlcnJvck1lc3NhZ2VcbiAgICApO1xuICAgIGNvbnRleHQud2F6dWgubG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4qIFdhaXQgdW50aWwgS2liYW5hIHNlcnZlciBpcyByZWFkeVxuKi9cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrS2liYW5hU3RhdHVzKGNvbnRleHQpIHtcbiB0cnkge1xuICAgIGxvZyhcbiAgICAgICdtb25pdG9yaW5nOmNoZWNrS2liYW5hU3RhdHVzJyxcbiAgICAgICdXYWl0aW5nIGZvciBLaWJhbmEgYW5kIEVsYXN0aWNzZWFyY2ggc2VydmVycyB0byBiZSByZWFkeS4uLicsXG4gICAgICAnZGVidWcnXG4gICAgKTtcblxuICAgYXdhaXQgY2hlY2tFbGFzdGljc2VhcmNoU2VydmVyKGNvbnRleHQpO1xuICAgYXdhaXQgaW5pdChjb250ZXh0KTtcbiAgIHJldHVybjtcbiB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZyhcbiAgICAgICdtb25pdG9yaW5nOmNoZWNrS2liYW5hU3RhdHVzJyxcbiAgICAgIGVycm9yLm1lc2FnZSB8fGVycm9yXG4gICAgKTtcbiAgICB0cnl7XG4gICAgICBhd2FpdCBkZWxheSgzMDAwKTtcbiAgICAgIGF3YWl0IGNoZWNrS2liYW5hU3RhdHVzKGNvbnRleHQpO1xuICAgIH1jYXRjaChlcnJvcil7fTtcbiB9XG59XG5cblxuLyoqXG4gKiBDaGVjayBFbGFzdGljc2VhcmNoIFNlcnZlciBzdGF0dXMgYW5kIEtpYmFuYSBpbmRleCBwcmVzZW5jZVxuICovXG5hc3luYyBmdW5jdGlvbiBjaGVja0VsYXN0aWNzZWFyY2hTZXJ2ZXIoY29udGV4dCkge1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuaW5kaWNlcy5leGlzdHMoe1xuICAgICAgaW5kZXg6IGNvbnRleHQuc2VydmVyLmNvbmZpZy5raWJhbmEuaW5kZXhcbiAgICB9KTtcblxuICAgIHJldHVybiBkYXRhLmJvZHk7XG4gICAgLy8gVE9ETzogY2hlY2sgaWYgRWxhc3RpY3NlYXJjaCBjYW4gcmVjZWl2ZSByZXF1ZXN0c1xuICAgIC8vIGlmIChkYXRhKSB7XG4gICAgLy8gICBjb25zdCBwbHVnaW5zRGF0YSA9IGF3YWl0IHRoaXMuc2VydmVyLnBsdWdpbnMuZWxhc3RpY3NlYXJjaC53YWl0VW50aWxSZWFkeSgpO1xuICAgIC8vICAgcmV0dXJuIHBsdWdpbnNEYXRhO1xuICAgIC8vIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZGF0YSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nKCdtb25pdG9yaW5nOmNoZWNrRWxhc3RpY3NlYXJjaFNlcnZlcicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cbn1cblxuY29uc3QgZmFrZVJlc3BvbnNlRW5kcG9pbnQgPSB7XG4gIG9rOiAoYm9keTogYW55KSA9PiBib2R5LFxuICBjdXN0b206IChib2R5OiBhbnkpID0+IGJvZHksXG59XG4vKipcbiAqIEdldCBBUEkgY29uZmlndXJhdGlvbiBmcm9tIGVsYXN0aWMgYW5kIGNhbGxiYWNrIHRvIGxvYWRDcmVkZW50aWFsc1xuICovXG5hc3luYyBmdW5jdGlvbiBnZXRIb3N0c0NvbmZpZ3VyYXRpb24oKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaG9zdHMgPSBhd2FpdCB3YXp1aEhvc3RDb250cm9sbGVyLmdldEhvc3RzRW50cmllcyhmYWxzZSwgZmFsc2UsIGZha2VSZXNwb25zZUVuZHBvaW50KTtcbiAgICBpZiAoaG9zdHMuYm9keS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBob3N0cy5ib2R5O1xuICAgIH07XG5cbiAgICBsb2coXG4gICAgICAnbW9uaXRvcmluZzpnZXRDb25maWcnLFxuICAgICAgJ1RoZXJlIGFyZSBubyBXYXp1aCBBUEkgZW50cmllcyB5ZXQnLFxuICAgICAgJ2RlYnVnJ1xuICAgICk7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHtcbiAgICAgIGVycm9yOiAnbm8gY3JlZGVudGlhbHMnLFxuICAgICAgZXJyb3JfY29kZTogMVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZygnbW9uaXRvcmluZzpnZXRIb3N0c0NvbmZpZ3VyYXRpb24nLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoe1xuICAgICAgZXJyb3I6ICdubyB3YXp1aCBob3N0cycsXG4gICAgICBlcnJvcl9jb2RlOiAyXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gICAqIFRhc2sgdXNlZCBieSB0aGUgY3JvbiBqb2IuXG4gICAqL1xuYXN5bmMgZnVuY3Rpb24gY3JvblRhc2soY29udGV4dCkge1xuICB0cnkge1xuICAgIGNvbnN0IHRlbXBsYXRlTW9uaXRvcmluZyA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmdldFRlbXBsYXRlKHtuYW1lOiBXQVpVSF9NT05JVE9SSU5HX1RFTVBMQVRFX05BTUV9KTtcblxuICAgIGNvbnN0IGFwaUhvc3RzID0gYXdhaXQgZ2V0SG9zdHNDb25maWd1cmF0aW9uKCk7XG4gICAgY29uc3QgYXBpSG9zdHNVbmlxdWUgPSAoYXBpSG9zdHMgfHwgW10pLmZpbHRlcihcbiAgICAgIChhcGlIb3N0LCBpbmRleCwgc2VsZikgPT5cbiAgICAgICAgaW5kZXggPT09XG4gICAgICAgIHNlbGYuZmluZEluZGV4KFxuICAgICAgICAgIHQgPT5cbiAgICAgICAgICAgIHQudXNlciA9PT0gYXBpSG9zdC51c2VyICYmXG4gICAgICAgICAgICB0LnBhc3N3b3JkID09PSBhcGlIb3N0LnBhc3N3b3JkICYmXG4gICAgICAgICAgICB0LnVybCA9PT0gYXBpSG9zdC51cmwgJiZcbiAgICAgICAgICAgIHQucG9ydCA9PT0gYXBpSG9zdC5wb3J0XG4gICAgICAgIClcbiAgICApO1xuICAgIGZvcihsZXQgYXBpSG9zdCBvZiBhcGlIb3N0c1VuaXF1ZSl7XG4gICAgICB0cnl7XG4gICAgICAgIGNvbnN0IHsgYWdlbnRzLCBhcGlIb3N0OiBob3N0fSA9IGF3YWl0IGdldEFwaUluZm8oY29udGV4dCwgYXBpSG9zdCk7XG4gICAgICAgIGF3YWl0IGluc2VydE1vbml0b3JpbmdEYXRhRWxhc3RpY3NlYXJjaChjb250ZXh0LCB7YWdlbnRzLCBhcGlIb3N0OiBob3N0fSk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuXG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBSZXRyeSB0byBjYWxsIGl0c2VsZiBhZ2FpbiBpZiBLaWJhbmEgaW5kZXggaXMgbm90IHJlYWR5IHlldFxuICAgIC8vIHRyeSB7XG4gICAgLy8gICBpZiAoXG4gICAgLy8gICAgIHRoaXMud3pXcmFwcGVyLmJ1aWxkaW5nS2liYW5hSW5kZXggfHxcbiAgICAvLyAgICAgKChlcnJvciB8fCB7fSkuc3RhdHVzID09PSA0MDQgJiZcbiAgICAvLyAgICAgICAoZXJyb3IgfHwge30pLmRpc3BsYXlOYW1lID09PSAnTm90Rm91bmQnKVxuICAgIC8vICAgKSB7XG4gICAgLy8gICAgIGF3YWl0IGRlbGF5KDEwMDApO1xuICAgIC8vICAgICByZXR1cm4gY3JvblRhc2soY29udGV4dCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSBjYXRjaCAoZXJyb3IpIHt9IC8vZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgbG9nKCdtb25pdG9yaW5nOmNyb25UYXNrJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgQVBJIGFuZCBhZ2VudHMgaW5mb1xuICogQHBhcmFtIGNvbnRleHRcbiAqIEBwYXJhbSBhcGlIb3N0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEFwaUluZm8oY29udGV4dCwgYXBpSG9zdCl7XG4gIHRyeXtcbiAgICBsb2coJ21vbml0b3Jpbmc6Z2V0QXBpSW5mbycsIGBHZXR0aW5nIEFQSSBpbmZvIGZvciAke2FwaUhvc3QuaWR9YCwgJ2RlYnVnJyk7XG4gICAgY29uc3QgcmVzcG9uc2VJc0NsdXN0ZXIgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdCgnR0VUJywgJy9jbHVzdGVyL3N0YXR1cycsIHt9LCB7IGFwaUhvc3RJRDogYXBpSG9zdC5pZCB9KTtcbiAgICBjb25zdCBpc0NsdXN0ZXIgPSAoKChyZXNwb25zZUlzQ2x1c3RlciB8fCB7fSkuZGF0YSB8fCB7fSkuZGF0YSB8fCB7fSkuZW5hYmxlZCA9PT0gJ3llcyc7XG4gICAgaWYoaXNDbHVzdGVyKXtcbiAgICAgIGNvbnN0IHJlc3BvbnNlQ2x1c3RlckluZm8gPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdCgnR0VUJywgYC9jbHVzdGVyL2xvY2FsL2luZm9gLCB7fSwgIHsgYXBpSG9zdElEOiBhcGlIb3N0LmlkIH0pO1xuICAgICAgYXBpSG9zdC5jbHVzdGVyTmFtZSA9IHJlc3BvbnNlQ2x1c3RlckluZm8uZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdLmNsdXN0ZXI7XG4gICAgfTtcbiAgICBjb25zdCBhZ2VudHMgPSBhd2FpdCBmZXRjaEFsbEFnZW50c0Zyb21BcGlIb3N0KGNvbnRleHQsIGFwaUhvc3QpO1xuICAgIHJldHVybiB7IGFnZW50cywgYXBpSG9zdCB9O1xuICB9Y2F0Y2goZXJyb3Ipe1xuICAgIGxvZygnbW9uaXRvcmluZzpnZXRBcGlJbmZvJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8qKlxuICogRmV0Y2ggYWxsIGFnZW50cyBmb3IgdGhlIEFQSSBwcm92aWRlZFxuICogQHBhcmFtIGNvbnRleHRcbiAqIEBwYXJhbSBhcGlIb3N0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoQWxsQWdlbnRzRnJvbUFwaUhvc3QoY29udGV4dCwgYXBpSG9zdCl7XG4gIGxldCBhZ2VudHMgPSBbXTtcbiAgdHJ5e1xuICAgIGxvZygnbW9uaXRvcmluZzpmZXRjaEFsbEFnZW50c0Zyb21BcGlIb3N0JywgYEdldHRpbmcgYWxsIGFnZW50cyBmcm9tIEFwaUlEOiAke2FwaUhvc3QuaWR9YCwgJ2RlYnVnJyk7XG4gICAgY29uc3QgcmVzcG9uc2VBZ2VudHNDb3VudCA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgJ0dFVCcsXG4gICAgICAnL2FnZW50cycsXG4gICAgICB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICBsaW1pdDogMSxcbiAgICAgICAgICBxOiAnaWQhPTAwMCdcbiAgICAgICAgfVxuICAgICAgfSwge2FwaUhvc3RJRDogYXBpSG9zdC5pZH0pO1xuXG4gICAgY29uc3QgYWdlbnRzQ291bnQgPSByZXNwb25zZUFnZW50c0NvdW50LmRhdGEuZGF0YS50b3RhbF9hZmZlY3RlZF9pdGVtcztcbiAgICBsb2coJ21vbml0b3Jpbmc6ZmV0Y2hBbGxBZ2VudHNGcm9tQXBpSG9zdCcsIGBBcGlJRDogJHthcGlIb3N0LmlkfSwgQWdlbnQgY291bnQ6ICR7YWdlbnRzQ291bnR9YCwgJ2RlYnVnJyk7XG5cbiAgICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgIG9mZnNldDogMCxcbiAgICAgIGxpbWl0OiA1MDAsXG4gICAgICBxOiAnaWQhPTAwMCdcbiAgICB9O1xuXG4gICAgd2hpbGUgKGFnZW50cy5sZW5ndGggPCBhZ2VudHNDb3VudCAmJiBwYXlsb2FkLm9mZnNldCA8IGFnZW50c0NvdW50KSB7XG4gICAgICB0cnl7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlQWdlbnRzID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzSW50ZXJuYWxVc2VyLnJlcXVlc3QoXG4gICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgYC9hZ2VudHNgLFxuICAgICAgICAgIHtwYXJhbXM6IHBheWxvYWR9LFxuICAgICAgICAgIHthcGlIb3N0SUQ6IGFwaUhvc3QuaWR9XG4gICAgICAgICk7XG4gICAgICAgIGFnZW50cyA9IFsuLi5hZ2VudHMsIC4uLnJlc3BvbnNlQWdlbnRzLmRhdGEuZGF0YS5hZmZlY3RlZF9pdGVtc107XG4gICAgICAgIHBheWxvYWQub2Zmc2V0ICs9IHBheWxvYWQubGltaXQ7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICBsb2coJ21vbml0b3Jpbmc6ZmV0Y2hBbGxBZ2VudHNGcm9tQXBpSG9zdCcsIGBBcGlJRDogJHthcGlIb3N0LmlkfSwgRXJyb3IgcmVxdWVzdCB3aXRoIG9mZnNldC9saW1pdCAke3BheWxvYWQub2Zmc2V0fS8ke3BheWxvYWQubGltaXR9OiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhZ2VudHM7XG4gIH1jYXRjaChlcnJvcil7XG4gICAgbG9nKCdtb25pdG9yaW5nOmZldGNoQWxsQWdlbnRzRnJvbUFwaUhvc3QnLCBgQXBpSUQ6ICR7YXBpSG9zdC5pZH0uIEVycm9yOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIGNyb24gam9iXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBqb2JNb25pdG9yaW5nUnVuKGNvbnRleHQpIHtcbiAgLy8gSW5pdCB0aGUgbW9uaXRvcmluZyB2YXJpYWJsZXNcbiAgaW5pdE1vbml0b3JpbmdDb25maWd1cmF0aW9uKGNvbnRleHQpO1xuICAvLyBDaGVjayBLaWJhbmEgaW5kZXggYW5kIGlmIGl0IGlzIHByZXBhcmVkLCBzdGFydCB0aGUgaW5pdGlhbGl6YXRpb24gb2YgV2F6dWggQXBwLlxuICBhd2FpdCBjaGVja0tpYmFuYVN0YXR1cyhjb250ZXh0KTtcbiAgLy8gLy8gUnVuIHRoZSBjcm9uIGpvYiBvbmx5IGl0IGl0J3MgZW5hYmxlZFxuICBpZiAoTU9OSVRPUklOR19FTkFCTEVEKSB7XG4gICAgY3JvblRhc2soY29udGV4dCk7XG4gICAgY3Jvbi5zY2hlZHVsZShNT05JVE9SSU5HX0NST05fRlJFUSwgKCkgPT4gY3JvblRhc2soY29udGV4dCkpO1xuICB9XG59XG5cbiJdfQ==