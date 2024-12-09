"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhElasticCtrl = void 0;

var _errorResponse = require("../lib/error-response");

var _logger = require("../lib/logger");

var _getConfiguration = require("../lib/get-configuration");

var _visualizations = require("../integration-files/visualizations");

var _generateAlertsScript = require("../lib/generate-alerts/generate-alerts-script");

var _constants = require("../../common/constants");

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

var _manageHosts = require("../lib/manage-hosts");

var _cookie = require("../lib/cookie");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class WazuhElasticCtrl {
  constructor() {
    _defineProperty(this, "wzSampleAlertsIndexPrefix", void 0);

    _defineProperty(this, "manageHosts", void 0);

    this.wzSampleAlertsIndexPrefix = this.getSampleAlertPrefix();
    this.manageHosts = new _manageHosts.ManageHosts();
  }
  /**
   * This returns the index according the category
   * @param {string} category
   */


  buildSampleIndexByCategory(category) {
    return `${this.wzSampleAlertsIndexPrefix}sample-${category}`;
  }
  /**
   * This returns the defined config for sample alerts prefix or the default value.
   */


  getSampleAlertPrefix() {
    const config = (0, _getConfiguration.getConfiguration)();
    return config['alerts.sample.prefix'] || _constants.WAZUH_SAMPLE_ALERT_PREFIX;
  }
  /**
   * This retrieves a template from Elasticsearch
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} template or ErrorResponse
   */


  async getTemplate(context, request, response) {
    try {
      const data = await context.core.elasticsearch.client.asInternalUser.cat.templates();
      const templates = data.body;

      if (!templates || typeof templates !== 'string') {
        throw new Error('An unknown error occurred when fetching templates from Elasticseach');
      }

      const lastChar = request.params.pattern[request.params.pattern.length - 1]; // Split into separate patterns

      const tmpdata = templates.match(/\[.*\]/g);
      const tmparray = [];

      for (let item of tmpdata) {
        // A template might use more than one pattern
        if (item.includes(',')) {
          item = item.substr(1).slice(0, -1);
          const subItems = item.split(',');

          for (const subitem of subItems) {
            tmparray.push(`[${subitem.trim()}]`);
          }
        } else {
          tmparray.push(item);
        }
      } // Ensure we are handling just patterns


      const array = tmparray.filter(item => item.includes('[') && item.includes(']'));
      const pattern = lastChar === '*' ? request.params.pattern.slice(0, -1) : request.params.pattern;
      const isIncluded = array.filter(item => {
        item = item.slice(1, -1);
        const lastChar = item[item.length - 1];
        item = lastChar === '*' ? item.slice(0, -1) : item;
        return item.includes(pattern) || pattern.includes(item);
      });
      (0, _logger.log)('wazuh-elastic:getTemplate', `Template is valid: ${isIncluded && Array.isArray(isIncluded) && isIncluded.length ? 'yes' : 'no'}`, 'debug');
      return isIncluded && Array.isArray(isIncluded) && isIncluded.length ? response.ok({
        body: {
          statusCode: 200,
          status: true,
          data: `Template found for ${request.params.pattern}`
        }
      }) : response.ok({
        body: {
          statusCode: 200,
          status: false,
          data: `No template found for ${request.params.pattern}`
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:getTemplate', error.message || error);
      return (0, _errorResponse.ErrorResponse)(`Could not retrieve templates from Elasticsearch due to ${error.message || error}`, 4002, 500, response);
    }
  }
  /**
   * This check index-pattern
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */


  async checkPattern(context, request, response) {
    try {
      const data = await context.core.savedObjects.client.find({
        type: 'index-pattern'
      });
      const existsIndexPattern = data.saved_objects.find(item => item.attributes.title === request.params.pattern);
      (0, _logger.log)('wazuh-elastic:checkPattern', `Index pattern found: ${existsIndexPattern ? existsIndexPattern.attributes.title : 'no'}`, 'debug');
      return existsIndexPattern ? response.ok({
        body: {
          statusCode: 200,
          status: true,
          data: 'Index pattern found'
        }
      }) : response.ok({
        body: {
          statusCode: 500,
          status: false,
          error: 10020,
          message: 'Index pattern not found'
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:checkPattern', error.message || error);
      return (0, _errorResponse.ErrorResponse)(`Something went wrong retrieving index-patterns from Elasticsearch due to ${error.message || error}`, 4003, 500, response);
    }
  }
  /**
   * This get the fields keys
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<Object>} fields or ErrorResponse
   */


  async getFieldTop(context, request, response) {
    try {
      // Top field payload
      let payload = {
        size: 1,
        query: {
          bool: {
            must: [],
            must_not: {
              term: {
                'agent.id': '000'
              }
            },
            filter: {
              range: {
                timestamp: {}
              }
            }
          }
        },
        aggs: {
          '2': {
            terms: {
              field: '',
              size: 1,
              order: {
                _count: 'desc'
              }
            }
          }
        }
      }; // Set up time interval, default to Last 24h

      const timeGTE = 'now-1d';
      const timeLT = 'now';
      payload.query.bool.filter.range['timestamp']['gte'] = timeGTE;
      payload.query.bool.filter.range['timestamp']['lt'] = timeLT; // Set up match for default cluster name

      payload.query.bool.must.push(request.params.mode === 'cluster' ? {
        match: {
          'cluster.name': request.params.cluster
        }
      } : {
        match: {
          'manager.name': request.params.cluster
        }
      });
      payload.aggs['2'].terms.field = request.params.field;
      const data = await context.core.elasticsearch.client.asCurrentUser.search({
        size: 1,
        index: request.params.pattern,
        body: payload
      });
      return data.body.hits.total.value === 0 || typeof data.body.aggregations['2'].buckets[0] === 'undefined' ? response.ok({
        body: {
          statusCode: 200,
          data: ''
        }
      }) : response.ok({
        body: {
          statusCode: 200,
          data: data.body.aggregations['2'].buckets[0].key
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:getFieldTop', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4004, 500, response);
    }
  }
  /**
   * Checks one by one if the requesting user has enough privileges to use
   * an index pattern from the list.
   * @param {Array<Object>} list List of index patterns
   * @param {Object} req
   * @returns {Array<Object>} List of allowed index
   */


  async filterAllowedIndexPatternList(context, list, req) {
    //TODO: review if necesary to delete
    let finalList = [];

    for (let item of list) {
      let results = false,
          forbidden = false;

      try {
        results = await context.core.elasticsearch.client.asCurrentUser.search({
          index: item.title
        });
      } catch (error) {
        forbidden = true;
      }

      if ((((results || {}).body || {}).hits || {}).total.value >= 1 || !forbidden && (((results || {}).body || {}).hits || {}).total === 0) {
        finalList.push(item);
      }
    }

    return finalList;
  }
  /**
   * Checks for minimum index pattern fields in a list of index patterns.
   * @param {Array<Object>} indexPatternList List of index patterns
   */


  validateIndexPattern(indexPatternList) {
    const minimum = ['timestamp', 'rule.groups', 'manager.name', 'agent.id'];
    let list = [];

    for (const index of indexPatternList) {
      let valid, parsed;

      try {
        parsed = JSON.parse(index.attributes.fields);
      } catch (error) {
        continue;
      }

      valid = parsed.filter(item => minimum.includes(item.name));

      if (valid.length === 4) {
        list.push({
          id: index.id,
          title: index.attributes.title
        });
      }
    }

    return list;
  }
  /**
   * Returns current security platform
   * @param {Object} req
   * @param {Object} reply
   * @returns {String}
   */


  async getCurrentPlatform(context, request, response) {
    try {
      return response.ok({
        body: {
          platform: context.wazuh.security.platform
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:getCurrentPlatform', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4011, 500, response);
    }
  }
  /**
   * Replaces visualizations main fields to fit a certain pattern.
   * @param {Array<Object>} app_objects Object containing raw visualizations.
   * @param {String} id Index-pattern id to use in the visualizations. Eg: 'wazuh-alerts'
   */


  async buildVisualizationsRaw(app_objects, id, namespace = false) {
    try {
      const config = (0, _getConfiguration.getConfiguration)();
      let monitoringPattern = (config || {})['wazuh.monitoring.pattern'] || _constants.WAZUH_MONITORING_PATTERN;
      (0, _logger.log)('wazuh-elastic:buildVisualizationsRaw', `Building ${app_objects.length} visualizations`, 'debug');
      (0, _logger.log)('wazuh-elastic:buildVisualizationsRaw', `Index pattern ID: ${id}`, 'debug');
      const visArray = [];
      let aux_source, bulk_content;

      for (let element of app_objects) {
        aux_source = JSON.parse(JSON.stringify(element._source)); // Replace index-pattern for visualizations

        if (aux_source && aux_source.kibanaSavedObjectMeta && aux_source.kibanaSavedObjectMeta.searchSourceJSON && typeof aux_source.kibanaSavedObjectMeta.searchSourceJSON === 'string') {
          const defaultStr = aux_source.kibanaSavedObjectMeta.searchSourceJSON;
          const isMonitoring = defaultStr.includes('wazuh-monitoring');

          if (isMonitoring) {
            if (namespace && namespace !== 'default') {
              if (monitoringPattern.includes(namespace) && monitoringPattern.includes('index-pattern:')) {
                monitoringPattern = monitoringPattern.split('index-pattern:')[1];
              }
            }

            aux_source.kibanaSavedObjectMeta.searchSourceJSON = defaultStr.replace(/wazuh-monitoring/g, monitoringPattern[monitoringPattern.length - 1] === '*' || namespace && namespace !== 'default' ? monitoringPattern : monitoringPattern + '*');
          } else {
            aux_source.kibanaSavedObjectMeta.searchSourceJSON = defaultStr.replace(/wazuh-alerts/g, id);
          }
        } // Replace index-pattern for selector visualizations


        if (typeof (aux_source || {}).visState === 'string') {
          aux_source.visState = aux_source.visState.replace(/wazuh-alerts/g, id);
        } // Bulk source


        bulk_content = {};
        bulk_content[element._type] = aux_source;
        visArray.push({
          attributes: bulk_content.visualization,
          type: element._type,
          id: element._id,
          _version: bulk_content.visualization.version
        });
      }

      return visArray;
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:buildVisualizationsRaw', error.message || error);
      return Promise.reject(error);
    }
  }
  /**
   * Replaces cluster visualizations main fields.
   * @param {Array<Object>} app_objects Object containing raw visualizations.
   * @param {String} id Index-pattern id to use in the visualizations. Eg: 'wazuh-alerts'
   * @param {Array<String>} nodes Array of node names. Eg: ['node01', 'node02']
   * @param {String} name Cluster name. Eg: 'wazuh'
   * @param {String} master_node Master node name. Eg: 'node01'
   */


  buildClusterVisualizationsRaw(app_objects, id, nodes = [], name, master_node, pattern_name = '*') {
    try {
      const visArray = [];
      let aux_source, bulk_content;

      for (const element of app_objects) {
        // Stringify and replace index-pattern for visualizations
        aux_source = JSON.stringify(element._source);
        aux_source = aux_source.replace(/wazuh-alerts/g, id);
        aux_source = JSON.parse(aux_source); // Bulk source

        bulk_content = {};
        bulk_content[element._type] = aux_source;
        const visState = JSON.parse(bulk_content.visualization.visState);
        const title = visState.title;

        if (visState.type && visState.type === 'timelion') {
          let query = '';

          if (title === 'Wazuh App Cluster Overview') {
            for (const node of nodes) {
              query += `.es(index=${pattern_name},q="cluster.name: ${name} AND cluster.node: ${node.name}").label("${node.name}"),`;
            }

            query = query.substring(0, query.length - 1);
          } else if (title === 'Wazuh App Cluster Overview Manager') {
            query += `.es(index=${pattern_name},q="cluster.name: ${name}").label("${name} cluster")`;
          } else {
            if (title.startsWith('Wazuh App Statistics')) {
              const {
                searchSourceJSON
              } = bulk_content.visualization.kibanaSavedObjectMeta;
              bulk_content.visualization.kibanaSavedObjectMeta.searchSourceJSON = searchSourceJSON.replace('wazuh-statistics-*', pattern_name);
            }

            if (title.startsWith('Wazuh App Statistics') && name !== '-' && name !== 'all' && visState.params.expression.includes('q=')) {
              const expressionRegex = /q='\*'/gi;
              query += visState.params.expression.replace(expressionRegex, `q="nodeName:${name} AND apiName=${master_node}"`);
            } else if (title.startsWith('Wazuh App Statistics')) {
              const expressionRegex = /q='\*'/gi;
              query += visState.params.expression.replace(expressionRegex, `q="apiName=${master_node}"`);
            } else {
              query = visState.params.expression;
            }
          }

          visState.params.expression = query.replace(/'/g, "\"");
          bulk_content.visualization.visState = JSON.stringify(visState);
        }

        visArray.push({
          attributes: bulk_content.visualization,
          type: element._type,
          id: element._id,
          _version: bulk_content.visualization.version
        });
      }

      return visArray;
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:buildClusterVisualizationsRaw', error.message || error);
      return Promise.reject(error);
    }
  }
  /**
   * This creates a visualization of data in req
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} vis obj or ErrorResponse
   */


  async createVis(context, request, response) {
    try {
      if (!request.params.tab.includes('overview-') && !request.params.tab.includes('agents-')) {
        throw new Error('Missing parameters creating visualizations');
      }

      const tabPrefix = request.params.tab.includes('overview') ? 'overview' : 'agents';
      const tabSplit = request.params.tab.split('-');
      const tabSufix = tabSplit[1];
      const file = tabPrefix === 'overview' ? _visualizations.OverviewVisualizations[tabSufix] : _visualizations.AgentsVisualizations[tabSufix];
      (0, _logger.log)('wazuh-elastic:createVis', `${tabPrefix}[${tabSufix}] with index pattern ${request.params.pattern}`, 'debug');
      const namespace = context.wazuh.plugins.spaces && context.wazuh.plugins.spaces.spacesService && context.wazuh.plugins.spaces.spacesService.getSpaceId(request);
      const raw = await this.buildVisualizationsRaw(file, request.params.pattern, namespace);
      return response.ok({
        body: {
          acknowledge: true,
          raw: raw
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:createVis', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4007, 500, response);
    }
  }
  /**
   * This creates a visualization of cluster
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} vis obj or ErrorResponse
   */


  async createClusterVis(context, request, response) {
    try {
      if (!request.params.pattern || !request.params.tab || !request.body || !request.body.nodes || !request.body.nodes.affected_items || !request.body.nodes.name || request.params.tab && !request.params.tab.includes('cluster-')) {
        throw new Error('Missing parameters creating visualizations');
      }

      const type = request.params.tab.split('-')[1];
      const file = _visualizations.ClusterVisualizations[type];
      const nodes = request.body.nodes.affected_items;
      const name = request.body.nodes.name;
      const masterNode = request.body.nodes.master_node;
      const {
        id: patternID,
        title: patternName
      } = request.body.pattern;
      const raw = await this.buildClusterVisualizationsRaw(file, patternID, nodes, name, masterNode, patternName);
      return response.ok({
        body: {
          acknowledge: true,
          raw: raw
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:createClusterVis', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4009, 500, response);
    }
  }
  /**
   * This checks if there is sample alerts
   * GET /elastic/samplealerts
   * @param {*} context
   * @param {*} request
   * @param {*} response
   * {alerts: [...]} or ErrorResponse
   */


  async haveSampleAlerts(context, request, response) {
    try {
      // Check if wazuh sample alerts index exists
      const results = await Promise.all(Object.keys(_constants.WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS).map(category => context.core.elasticsearch.client.asCurrentUser.indices.exists({
        index: this.buildSampleIndexByCategory(category)
      })));
      return response.ok({
        body: {
          sampleAlertsInstalled: results.some(result => result.body)
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)('Sample Alerts category not valid', 1000, 500, response);
    }
  }
  /**
   * This creates sample alerts in wazuh-sample-alerts
   * GET /elastic/samplealerts/{category}
   * @param {*} context
   * @param {*} request
   * @param {*} response
   * {alerts: [...]} or ErrorResponse
   */


  async haveSampleAlertsOfCategory(context, request, response) {
    try {
      const sampleAlertsIndex = this.buildSampleIndexByCategory(request.params.category); // Check if wazuh sample alerts index exists

      const existsSampleIndex = await context.core.elasticsearch.client.asCurrentUser.indices.exists({
        index: sampleAlertsIndex
      });
      return response.ok({
        body: {
          index: sampleAlertsIndex,
          exists: existsSampleIndex.body
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:haveSampleAlertsOfCategory', `Error checking if there are sample alerts indices: ${error.message || error}`);
      return (0, _errorResponse.ErrorResponse)(`Error checking if there are sample alerts indices: ${error.message || error}`, 1000, 500, response);
    }
  }
  /**
   * This creates sample alerts in wazuh-sample-alerts
   * POST /elastic/samplealerts/{category}
   * {
   *   "manager": {
   *      "name": "manager_name"
   *    },
   *    cluster: {
   *      name: "mycluster",
   *      node: "mynode"
   *    }
   * }
   * @param {*} context
   * @param {*} request
   * @param {*} response
   * {index: string, alerts: [...], count: number} or ErrorResponse
   */


  async createSampleAlerts(context, request, response) {
    const sampleAlertsIndex = this.buildSampleIndexByCategory(request.params.category);

    try {
      // Check if user has administrator role in token
      const token = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-token');

      if (!token) {
        return (0, _errorResponse.ErrorResponse)('No token provided', 401, 401, response);
      }

      ;
      const decodedToken = (0, _jwtDecode.default)(token);

      if (!decodedToken) {
        return (0, _errorResponse.ErrorResponse)('No permissions in token', 401, 401, response);
      }

      ;

      if (!decodedToken.rbac_roles || !decodedToken.rbac_roles.includes(_constants.WAZUH_ROLE_ADMINISTRATOR_ID)) {
        return (0, _errorResponse.ErrorResponse)('No administrator role', 401, 401, response);
      }

      ; // Check the provided token is valid

      const apiHostID = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api');

      if (!apiHostID) {
        return (0, _errorResponse.ErrorResponse)('No API id provided', 401, 401, response);
      }

      ;
      const responseTokenIsWorking = await context.wazuh.api.client.asCurrentUser.request('GET', `//`, {}, {
        apiHostID
      });

      if (responseTokenIsWorking.status !== 200) {
        return (0, _errorResponse.ErrorResponse)('Token is not valid', 500, 500, response);
      }

      ;
      const bulkPrefix = JSON.stringify({
        index: {
          _index: sampleAlertsIndex
        }
      });
      const alertGenerateParams = request.body && request.body.params || {};

      const sampleAlerts = _constants.WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS[request.params.category].map(typeAlert => (0, _generateAlertsScript.generateAlerts)({ ...typeAlert,
        ...alertGenerateParams
      }, request.body.alerts || typeAlert.alerts || _constants.WAZUH_SAMPLE_ALERTS_DEFAULT_NUMBER_ALERTS)).flat();

      const bulk = sampleAlerts.map(sampleAlert => `${bulkPrefix}\n${JSON.stringify(sampleAlert)}\n`).join(''); // Index alerts
      // Check if wazuh sample alerts index exists

      const existsSampleIndex = await context.core.elasticsearch.client.asInternalUser.indices.exists({
        index: sampleAlertsIndex
      });

      if (!existsSampleIndex.body) {
        // Create wazuh sample alerts index
        const configuration = {
          settings: {
            index: {
              number_of_shards: _constants.WAZUH_SAMPLE_ALERTS_INDEX_SHARDS,
              number_of_replicas: _constants.WAZUH_SAMPLE_ALERTS_INDEX_REPLICAS
            }
          }
        };
        await context.core.elasticsearch.client.asInternalUser.indices.create({
          index: sampleAlertsIndex,
          body: configuration
        });
        (0, _logger.log)('wazuh-elastic:createSampleAlerts', `Created ${sampleAlertsIndex} index`, 'debug');
      }

      await context.core.elasticsearch.client.asInternalUser.bulk({
        index: sampleAlertsIndex,
        body: bulk
      });
      (0, _logger.log)('wazuh-elastic:createSampleAlerts', `Added sample alerts to ${sampleAlertsIndex} index`, 'debug');
      return response.ok({
        body: {
          index: sampleAlertsIndex,
          alertCount: sampleAlerts.length
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:createSampleAlerts', `Error adding sample alerts to ${sampleAlertsIndex} index: ${error.message || error}`);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 1000, 500, response);
    }
  }
  /**
   * This deletes sample alerts
   * @param {*} context
   * @param {*} request
   * @param {*} response
   * {result: "deleted", index: string} or ErrorResponse
   */


  async deleteSampleAlerts(context, request, response) {
    // Delete Wazuh sample alert index
    const sampleAlertsIndex = this.buildSampleIndexByCategory(request.params.category);

    try {
      // Check if user has administrator role in token
      const token = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-token');

      if (!token) {
        return (0, _errorResponse.ErrorResponse)('No token provided', 401, 401, response);
      }

      ;
      const decodedToken = (0, _jwtDecode.default)(token);

      if (!decodedToken) {
        return (0, _errorResponse.ErrorResponse)('No permissions in token', 401, 401, response);
      }

      ;

      if (!decodedToken.rbac_roles || !decodedToken.rbac_roles.includes(_constants.WAZUH_ROLE_ADMINISTRATOR_ID)) {
        return (0, _errorResponse.ErrorResponse)('No administrator role', 401, 401, response);
      }

      ; // Check the provided token is valid

      const apiHostID = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api');

      if (!apiHostID) {
        return (0, _errorResponse.ErrorResponse)('No API id provided', 401, 401, response);
      }

      ;
      const responseTokenIsWorking = await context.wazuh.api.client.asCurrentUser.request('GET', `//`, {}, {
        apiHostID
      });

      if (responseTokenIsWorking.status !== 200) {
        return (0, _errorResponse.ErrorResponse)('Token is not valid', 500, 500, response);
      }

      ; // Check if Wazuh sample alerts index exists

      const existsSampleIndex = await context.core.elasticsearch.client.asCurrentUser.indices.exists({
        index: sampleAlertsIndex
      });

      if (existsSampleIndex.body) {
        // Delete Wazuh sample alerts index
        await context.core.elasticsearch.client.asCurrentUser.indices.delete({
          index: sampleAlertsIndex
        });
        (0, _logger.log)('wazuh-elastic:deleteSampleAlerts', `Deleted ${sampleAlertsIndex} index`, 'debug');
        return response.ok({
          body: {
            result: 'deleted',
            index: sampleAlertsIndex
          }
        });
      } else {
        return (0, _errorResponse.ErrorResponse)(`${sampleAlertsIndex} index doesn't exist`, 1000, 500, response);
      }
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:deleteSampleAlerts', `Error deleting sample alerts of ${sampleAlertsIndex} index: ${error.message || error}`);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 1000, 500, response);
    }
  }

  async alerts(context, request, response) {
    try {
      const data = await context.core.elasticsearch.client.asCurrentUser.search(request.body);
      return response.ok({
        body: data.body
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:alerts', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4010, 500, response);
    }
  } // Check if there are indices for Statistics
  
  async delAlerts(context, request, response) {
    try {
      const data = await context.core.elasticsearch.client.asCurrentUser.deleteByQuery({
        index: request.body.pattern,
        body: {
          query: {
            match: {
              "agent.id": request.body.agent,
            },
          },
        },
      });
      return response.ok({
        body: data.body
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:alerts', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 4010, 500, response);
    }
  }

  async existStatisticsIndices(context, request, response) {
    try {
      const config = (0, _getConfiguration.getConfiguration)();
      const statisticsPattern = `${config['cron.prefix'] || 'wazuh'}-${config['cron.statistics.index.name'] || 'statistics'}*`; //TODO: replace by default as constants instead hardcoded ('wazuh' and 'statistics')

      const existIndex = await context.core.elasticsearch.client.asCurrentUser.indices.exists({
        index: statisticsPattern,
        allow_no_indices: false
      });
      return response.ok({
        body: existIndex.body
      });
    } catch (error) {
      (0, _logger.log)('wazuh-elastic:existsStatisticsIndices', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 1000, 500, response);
    }
  }

  async usingCredentials(context) {
    try {
      const data = await context.core.elasticsearch.client.asInternalUser.cluster.getSettings({
        include_defaults: true
      });
      return (((((data || {}).body || {}).defaults || {}).xpack || {}).security || {}).user !== null;
    } catch (error) {
      return Promise.reject(error);
    }
  }

}

exports.WazuhElasticCtrl = WazuhElasticCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLWVsYXN0aWMudHMiXSwibmFtZXMiOlsiV2F6dWhFbGFzdGljQ3RybCIsImNvbnN0cnVjdG9yIiwid3pTYW1wbGVBbGVydHNJbmRleFByZWZpeCIsImdldFNhbXBsZUFsZXJ0UHJlZml4IiwibWFuYWdlSG9zdHMiLCJNYW5hZ2VIb3N0cyIsImJ1aWxkU2FtcGxlSW5kZXhCeUNhdGVnb3J5IiwiY2F0ZWdvcnkiLCJjb25maWciLCJXQVpVSF9TQU1QTEVfQUxFUlRfUFJFRklYIiwiZ2V0VGVtcGxhdGUiLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiZGF0YSIsImNvcmUiLCJlbGFzdGljc2VhcmNoIiwiY2xpZW50IiwiYXNJbnRlcm5hbFVzZXIiLCJjYXQiLCJ0ZW1wbGF0ZXMiLCJib2R5IiwiRXJyb3IiLCJsYXN0Q2hhciIsInBhcmFtcyIsInBhdHRlcm4iLCJsZW5ndGgiLCJ0bXBkYXRhIiwibWF0Y2giLCJ0bXBhcnJheSIsIml0ZW0iLCJpbmNsdWRlcyIsInN1YnN0ciIsInNsaWNlIiwic3ViSXRlbXMiLCJzcGxpdCIsInN1Yml0ZW0iLCJwdXNoIiwidHJpbSIsImFycmF5IiwiZmlsdGVyIiwiaXNJbmNsdWRlZCIsIkFycmF5IiwiaXNBcnJheSIsIm9rIiwic3RhdHVzQ29kZSIsInN0YXR1cyIsImVycm9yIiwibWVzc2FnZSIsImNoZWNrUGF0dGVybiIsInNhdmVkT2JqZWN0cyIsImZpbmQiLCJ0eXBlIiwiZXhpc3RzSW5kZXhQYXR0ZXJuIiwic2F2ZWRfb2JqZWN0cyIsImF0dHJpYnV0ZXMiLCJ0aXRsZSIsImdldEZpZWxkVG9wIiwicGF5bG9hZCIsInNpemUiLCJxdWVyeSIsImJvb2wiLCJtdXN0IiwibXVzdF9ub3QiLCJ0ZXJtIiwicmFuZ2UiLCJ0aW1lc3RhbXAiLCJhZ2dzIiwidGVybXMiLCJmaWVsZCIsIm9yZGVyIiwiX2NvdW50IiwidGltZUdURSIsInRpbWVMVCIsIm1vZGUiLCJjbHVzdGVyIiwiYXNDdXJyZW50VXNlciIsInNlYXJjaCIsImluZGV4IiwiaGl0cyIsInRvdGFsIiwidmFsdWUiLCJhZ2dyZWdhdGlvbnMiLCJidWNrZXRzIiwia2V5IiwiZmlsdGVyQWxsb3dlZEluZGV4UGF0dGVybkxpc3QiLCJsaXN0IiwicmVxIiwiZmluYWxMaXN0IiwicmVzdWx0cyIsImZvcmJpZGRlbiIsInZhbGlkYXRlSW5kZXhQYXR0ZXJuIiwiaW5kZXhQYXR0ZXJuTGlzdCIsIm1pbmltdW0iLCJ2YWxpZCIsInBhcnNlZCIsIkpTT04iLCJwYXJzZSIsImZpZWxkcyIsIm5hbWUiLCJpZCIsImdldEN1cnJlbnRQbGF0Zm9ybSIsInBsYXRmb3JtIiwid2F6dWgiLCJzZWN1cml0eSIsImJ1aWxkVmlzdWFsaXphdGlvbnNSYXciLCJhcHBfb2JqZWN0cyIsIm5hbWVzcGFjZSIsIm1vbml0b3JpbmdQYXR0ZXJuIiwiV0FaVUhfTU9OSVRPUklOR19QQVRURVJOIiwidmlzQXJyYXkiLCJhdXhfc291cmNlIiwiYnVsa19jb250ZW50IiwiZWxlbWVudCIsInN0cmluZ2lmeSIsIl9zb3VyY2UiLCJraWJhbmFTYXZlZE9iamVjdE1ldGEiLCJzZWFyY2hTb3VyY2VKU09OIiwiZGVmYXVsdFN0ciIsImlzTW9uaXRvcmluZyIsInJlcGxhY2UiLCJ2aXNTdGF0ZSIsIl90eXBlIiwidmlzdWFsaXphdGlvbiIsIl9pZCIsIl92ZXJzaW9uIiwidmVyc2lvbiIsIlByb21pc2UiLCJyZWplY3QiLCJidWlsZENsdXN0ZXJWaXN1YWxpemF0aW9uc1JhdyIsIm5vZGVzIiwibWFzdGVyX25vZGUiLCJwYXR0ZXJuX25hbWUiLCJub2RlIiwic3Vic3RyaW5nIiwic3RhcnRzV2l0aCIsImV4cHJlc3Npb24iLCJleHByZXNzaW9uUmVnZXgiLCJjcmVhdGVWaXMiLCJ0YWIiLCJ0YWJQcmVmaXgiLCJ0YWJTcGxpdCIsInRhYlN1Zml4IiwiZmlsZSIsIk92ZXJ2aWV3VmlzdWFsaXphdGlvbnMiLCJBZ2VudHNWaXN1YWxpemF0aW9ucyIsInBsdWdpbnMiLCJzcGFjZXMiLCJzcGFjZXNTZXJ2aWNlIiwiZ2V0U3BhY2VJZCIsInJhdyIsImFja25vd2xlZGdlIiwiY3JlYXRlQ2x1c3RlclZpcyIsImFmZmVjdGVkX2l0ZW1zIiwiQ2x1c3RlclZpc3VhbGl6YXRpb25zIiwibWFzdGVyTm9kZSIsInBhdHRlcm5JRCIsInBhdHRlcm5OYW1lIiwiaGF2ZVNhbXBsZUFsZXJ0cyIsImFsbCIsIk9iamVjdCIsImtleXMiLCJXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JJRVNfVFlQRV9BTEVSVFMiLCJtYXAiLCJpbmRpY2VzIiwiZXhpc3RzIiwic2FtcGxlQWxlcnRzSW5zdGFsbGVkIiwic29tZSIsInJlc3VsdCIsImhhdmVTYW1wbGVBbGVydHNPZkNhdGVnb3J5Iiwic2FtcGxlQWxlcnRzSW5kZXgiLCJleGlzdHNTYW1wbGVJbmRleCIsImNyZWF0ZVNhbXBsZUFsZXJ0cyIsInRva2VuIiwiaGVhZGVycyIsImNvb2tpZSIsImRlY29kZWRUb2tlbiIsInJiYWNfcm9sZXMiLCJXQVpVSF9ST0xFX0FETUlOSVNUUkFUT1JfSUQiLCJhcGlIb3N0SUQiLCJyZXNwb25zZVRva2VuSXNXb3JraW5nIiwiYXBpIiwiYnVsa1ByZWZpeCIsIl9pbmRleCIsImFsZXJ0R2VuZXJhdGVQYXJhbXMiLCJzYW1wbGVBbGVydHMiLCJ0eXBlQWxlcnQiLCJhbGVydHMiLCJXQVpVSF9TQU1QTEVfQUxFUlRTX0RFRkFVTFRfTlVNQkVSX0FMRVJUUyIsImZsYXQiLCJidWxrIiwic2FtcGxlQWxlcnQiLCJqb2luIiwiY29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwibnVtYmVyX29mX3NoYXJkcyIsIldBWlVIX1NBTVBMRV9BTEVSVFNfSU5ERVhfU0hBUkRTIiwibnVtYmVyX29mX3JlcGxpY2FzIiwiV0FaVUhfU0FNUExFX0FMRVJUU19JTkRFWF9SRVBMSUNBUyIsImNyZWF0ZSIsImFsZXJ0Q291bnQiLCJkZWxldGVTYW1wbGVBbGVydHMiLCJkZWxldGUiLCJleGlzdFN0YXRpc3RpY3NJbmRpY2VzIiwic3RhdGlzdGljc1BhdHRlcm4iLCJleGlzdEluZGV4IiwiYWxsb3dfbm9faW5kaWNlcyIsInVzaW5nQ3JlZGVudGlhbHMiLCJnZXRTZXR0aW5ncyIsImluY2x1ZGVfZGVmYXVsdHMiLCJkZWZhdWx0cyIsInhwYWNrIiwidXNlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVdBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7QUFHTyxNQUFNQSxnQkFBTixDQUF1QjtBQUc1QkMsRUFBQUEsV0FBVyxHQUFHO0FBQUE7O0FBQUE7O0FBQ1osU0FBS0MseUJBQUwsR0FBa0MsS0FBS0Msb0JBQUwsRUFBbEM7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLElBQUlDLHdCQUFKLEVBQW5CO0FBQ0Q7QUFFRDs7Ozs7O0FBSUFDLEVBQUFBLDBCQUEwQixDQUFFQyxRQUFGLEVBQTRCO0FBQ3BELFdBQVEsR0FBRSxLQUFLTCx5QkFBMEIsVUFBU0ssUUFBUyxFQUEzRDtBQUNEO0FBRUQ7Ozs7O0FBR0FKLEVBQUFBLG9CQUFvQixHQUFXO0FBQzdCLFVBQU1LLE1BQU0sR0FBRyx5Q0FBZjtBQUNBLFdBQVFBLE1BQU0sQ0FBQyxzQkFBRCxDQUFOLElBQWtDQyxvQ0FBMUM7QUFDRDtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNQyxXQUFOLENBQWtCQyxPQUFsQixFQUFrREMsT0FBbEQsRUFBNkZDLFFBQTdGLEVBQThIO0FBQzVILFFBQUk7QUFDRixZQUFNQyxJQUFJLEdBQUcsTUFBTUgsT0FBTyxDQUFDSSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDQyxjQUFsQyxDQUFpREMsR0FBakQsQ0FBcURDLFNBQXJELEVBQW5CO0FBRUEsWUFBTUEsU0FBUyxHQUFHTixJQUFJLENBQUNPLElBQXZCOztBQUNBLFVBQUksQ0FBQ0QsU0FBRCxJQUFjLE9BQU9BLFNBQVAsS0FBcUIsUUFBdkMsRUFBaUQ7QUFDL0MsY0FBTSxJQUFJRSxLQUFKLENBQ0oscUVBREksQ0FBTjtBQUdEOztBQUVELFlBQU1DLFFBQVEsR0FBR1gsT0FBTyxDQUFDWSxNQUFSLENBQWVDLE9BQWYsQ0FBdUJiLE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUFmLENBQXVCQyxNQUF2QixHQUFnQyxDQUF2RCxDQUFqQixDQVZFLENBWUY7O0FBQ0EsWUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQUNRLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBaEI7QUFDQSxZQUFNQyxRQUFRLEdBQUcsRUFBakI7O0FBQ0EsV0FBSyxJQUFJQyxJQUFULElBQWlCSCxPQUFqQixFQUEwQjtBQUN4QjtBQUNBLFlBQUlHLElBQUksQ0FBQ0MsUUFBTCxDQUFjLEdBQWQsQ0FBSixFQUF3QjtBQUN0QkQsVUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNFLE1BQUwsQ0FBWSxDQUFaLEVBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBQyxDQUF6QixDQUFQO0FBQ0EsZ0JBQU1DLFFBQVEsR0FBR0osSUFBSSxDQUFDSyxLQUFMLENBQVcsR0FBWCxDQUFqQjs7QUFDQSxlQUFLLE1BQU1DLE9BQVgsSUFBc0JGLFFBQXRCLEVBQWdDO0FBQzlCTCxZQUFBQSxRQUFRLENBQUNRLElBQVQsQ0FBZSxJQUFHRCxPQUFPLENBQUNFLElBQVIsRUFBZSxHQUFqQztBQUNEO0FBQ0YsU0FORCxNQU1PO0FBQ0xULFVBQUFBLFFBQVEsQ0FBQ1EsSUFBVCxDQUFjUCxJQUFkO0FBQ0Q7QUFDRixPQTFCQyxDQTRCRjs7O0FBQ0EsWUFBTVMsS0FBSyxHQUFHVixRQUFRLENBQUNXLE1BQVQsQ0FDWlYsSUFBSSxJQUFJQSxJQUFJLENBQUNDLFFBQUwsQ0FBYyxHQUFkLEtBQXNCRCxJQUFJLENBQUNDLFFBQUwsQ0FBYyxHQUFkLENBRGxCLENBQWQ7QUFJQSxZQUFNTixPQUFPLEdBQ1hGLFFBQVEsS0FBSyxHQUFiLEdBQW1CWCxPQUFPLENBQUNZLE1BQVIsQ0FBZUMsT0FBZixDQUF1QlEsS0FBdkIsQ0FBNkIsQ0FBN0IsRUFBZ0MsQ0FBQyxDQUFqQyxDQUFuQixHQUF5RHJCLE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUQxRTtBQUVBLFlBQU1nQixVQUFVLEdBQUdGLEtBQUssQ0FBQ0MsTUFBTixDQUFhVixJQUFJLElBQUk7QUFDdENBLFFBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDRyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQUMsQ0FBZixDQUFQO0FBQ0EsY0FBTVYsUUFBUSxHQUFHTyxJQUFJLENBQUNBLElBQUksQ0FBQ0osTUFBTCxHQUFjLENBQWYsQ0FBckI7QUFDQUksUUFBQUEsSUFBSSxHQUFHUCxRQUFRLEtBQUssR0FBYixHQUFtQk8sSUFBSSxDQUFDRyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQUMsQ0FBZixDQUFuQixHQUF1Q0gsSUFBOUM7QUFDQSxlQUFPQSxJQUFJLENBQUNDLFFBQUwsQ0FBY04sT0FBZCxLQUEwQkEsT0FBTyxDQUFDTSxRQUFSLENBQWlCRCxJQUFqQixDQUFqQztBQUNELE9BTGtCLENBQW5CO0FBTUEsdUJBQ0UsMkJBREYsRUFFRyxzQkFDRFcsVUFBVSxJQUFJQyxLQUFLLENBQUNDLE9BQU4sQ0FBY0YsVUFBZCxDQUFkLElBQTJDQSxVQUFVLENBQUNmLE1BQXRELEdBQ0ksS0FESixHQUVJLElBQ0gsRUFOSCxFQU9FLE9BUEY7QUFTQSxhQUFPZSxVQUFVLElBQUlDLEtBQUssQ0FBQ0MsT0FBTixDQUFjRixVQUFkLENBQWQsSUFBMkNBLFVBQVUsQ0FBQ2YsTUFBdEQsR0FDSGIsUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ1Z2QixRQUFBQSxJQUFJLEVBQUU7QUFDSndCLFVBQUFBLFVBQVUsRUFBRSxHQURSO0FBRUpDLFVBQUFBLE1BQU0sRUFBRSxJQUZKO0FBR0poQyxVQUFBQSxJQUFJLEVBQUcsc0JBQXFCRixPQUFPLENBQUNZLE1BQVIsQ0FBZUMsT0FBUTtBQUgvQztBQURJLE9BQVosQ0FERyxHQVFIWixRQUFRLENBQUMrQixFQUFULENBQVk7QUFDVnZCLFFBQUFBLElBQUksRUFBRTtBQUNKd0IsVUFBQUEsVUFBVSxFQUFFLEdBRFI7QUFFSkMsVUFBQUEsTUFBTSxFQUFFLEtBRko7QUFHSmhDLFVBQUFBLElBQUksRUFBRyx5QkFBd0JGLE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUFRO0FBSGxEO0FBREksT0FBWixDQVJKO0FBZUQsS0FqRUQsQ0FpRUUsT0FBT3NCLEtBQVAsRUFBYztBQUNkLHVCQUFJLDJCQUFKLEVBQWlDQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQWxEO0FBQ0EsYUFBTyxrQ0FDSiwwREFBeURBLEtBQUssQ0FBQ0MsT0FBTixJQUMxREQsS0FBTSxFQUZELEVBR0wsSUFISyxFQUlMLEdBSkssRUFLTGxDLFFBTEssQ0FBUDtBQU9EO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0EsUUFBTW9DLFlBQU4sQ0FBbUJ0QyxPQUFuQixFQUFtREMsT0FBbkQsRUFBOEZDLFFBQTlGLEVBQStIO0FBQzdILFFBQUk7QUFDRixZQUFNQyxJQUFJLEdBQUcsTUFBTUgsT0FBTyxDQUFDSSxJQUFSLENBQWFtQyxZQUFiLENBQTBCakMsTUFBMUIsQ0FBaUNrQyxJQUFqQyxDQUE2RTtBQUFDQyxRQUFBQSxJQUFJLEVBQUU7QUFBUCxPQUE3RSxDQUFuQjtBQUVBLFlBQU1DLGtCQUFrQixHQUFHdkMsSUFBSSxDQUFDd0MsYUFBTCxDQUFtQkgsSUFBbkIsQ0FDekJyQixJQUFJLElBQUlBLElBQUksQ0FBQ3lCLFVBQUwsQ0FBZ0JDLEtBQWhCLEtBQTBCNUMsT0FBTyxDQUFDWSxNQUFSLENBQWVDLE9BRHhCLENBQTNCO0FBR0EsdUJBQ0UsNEJBREYsRUFFRyx3QkFBdUI0QixrQkFBa0IsR0FBR0Esa0JBQWtCLENBQUNFLFVBQW5CLENBQThCQyxLQUFqQyxHQUF5QyxJQUFLLEVBRjFGLEVBR0UsT0FIRjtBQUtBLGFBQU9ILGtCQUFrQixHQUNyQnhDLFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNadkIsUUFBQUEsSUFBSSxFQUFFO0FBQUV3QixVQUFBQSxVQUFVLEVBQUUsR0FBZDtBQUFtQkMsVUFBQUEsTUFBTSxFQUFFLElBQTNCO0FBQWlDaEMsVUFBQUEsSUFBSSxFQUFFO0FBQXZDO0FBRE0sT0FBWixDQURxQixHQUlyQkQsUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ1p2QixRQUFBQSxJQUFJLEVBQUU7QUFDSndCLFVBQUFBLFVBQVUsRUFBRSxHQURSO0FBRUpDLFVBQUFBLE1BQU0sRUFBRSxLQUZKO0FBR0pDLFVBQUFBLEtBQUssRUFBRSxLQUhIO0FBSUpDLFVBQUFBLE9BQU8sRUFBRTtBQUpMO0FBRE0sT0FBWixDQUpKO0FBWUQsS0F2QkQsQ0F1QkUsT0FBT0QsS0FBUCxFQUFjO0FBQ2QsdUJBQUksNEJBQUosRUFBa0NBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBbkQ7QUFDQSxhQUFPLGtDQUNKLDRFQUEyRUEsS0FBSyxDQUFDQyxPQUFOLElBQzVFRCxLQUFNLEVBRkQsRUFHTCxJQUhLLEVBSUwsR0FKSyxFQUtMbEMsUUFMSyxDQUFQO0FBT0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNNEMsV0FBTixDQUFrQjlDLE9BQWxCLEVBQWtEQyxPQUFsRCxFQUEySUMsUUFBM0ksRUFBNEs7QUFDMUssUUFBSTtBQUNGO0FBQ0EsVUFBSTZDLE9BQU8sR0FBRztBQUNaQyxRQUFBQSxJQUFJLEVBQUUsQ0FETTtBQUVaQyxRQUFBQSxLQUFLLEVBQUU7QUFDTEMsVUFBQUEsSUFBSSxFQUFFO0FBQ0pDLFlBQUFBLElBQUksRUFBRSxFQURGO0FBRUpDLFlBQUFBLFFBQVEsRUFBRTtBQUNSQyxjQUFBQSxJQUFJLEVBQUU7QUFDSiw0QkFBWTtBQURSO0FBREUsYUFGTjtBQU9KeEIsWUFBQUEsTUFBTSxFQUFFO0FBQUV5QixjQUFBQSxLQUFLLEVBQUU7QUFBRUMsZ0JBQUFBLFNBQVMsRUFBRTtBQUFiO0FBQVQ7QUFQSjtBQURELFNBRks7QUFhWkMsUUFBQUEsSUFBSSxFQUFFO0FBQ0osZUFBSztBQUNIQyxZQUFBQSxLQUFLLEVBQUU7QUFDTEMsY0FBQUEsS0FBSyxFQUFFLEVBREY7QUFFTFYsY0FBQUEsSUFBSSxFQUFFLENBRkQ7QUFHTFcsY0FBQUEsS0FBSyxFQUFFO0FBQUVDLGdCQUFBQSxNQUFNLEVBQUU7QUFBVjtBQUhGO0FBREo7QUFERDtBQWJNLE9BQWQsQ0FGRSxDQTBCRjs7QUFDQSxZQUFNQyxPQUFPLEdBQUcsUUFBaEI7QUFDQSxZQUFNQyxNQUFNLEdBQUcsS0FBZjtBQUNBZixNQUFBQSxPQUFPLENBQUNFLEtBQVIsQ0FBY0MsSUFBZCxDQUFtQnJCLE1BQW5CLENBQTBCeUIsS0FBMUIsQ0FBZ0MsV0FBaEMsRUFBNkMsS0FBN0MsSUFBc0RPLE9BQXREO0FBQ0FkLE1BQUFBLE9BQU8sQ0FBQ0UsS0FBUixDQUFjQyxJQUFkLENBQW1CckIsTUFBbkIsQ0FBMEJ5QixLQUExQixDQUFnQyxXQUFoQyxFQUE2QyxJQUE3QyxJQUFxRFEsTUFBckQsQ0E5QkUsQ0FnQ0Y7O0FBQ0FmLE1BQUFBLE9BQU8sQ0FBQ0UsS0FBUixDQUFjQyxJQUFkLENBQW1CQyxJQUFuQixDQUF3QnpCLElBQXhCLENBQ0V6QixPQUFPLENBQUNZLE1BQVIsQ0FBZWtELElBQWYsS0FBd0IsU0FBeEIsR0FDSTtBQUFFOUMsUUFBQUEsS0FBSyxFQUFFO0FBQUUsMEJBQWdCaEIsT0FBTyxDQUFDWSxNQUFSLENBQWVtRDtBQUFqQztBQUFULE9BREosR0FFSTtBQUFFL0MsUUFBQUEsS0FBSyxFQUFFO0FBQUUsMEJBQWdCaEIsT0FBTyxDQUFDWSxNQUFSLENBQWVtRDtBQUFqQztBQUFULE9BSE47QUFNQWpCLE1BQUFBLE9BQU8sQ0FBQ1MsSUFBUixDQUFhLEdBQWIsRUFBa0JDLEtBQWxCLENBQXdCQyxLQUF4QixHQUFnQ3pELE9BQU8sQ0FBQ1ksTUFBUixDQUFlNkMsS0FBL0M7QUFFQSxZQUFNdkQsSUFBSSxHQUFHLE1BQU1ILE9BQU8sQ0FBQ0ksSUFBUixDQUFhQyxhQUFiLENBQTJCQyxNQUEzQixDQUFrQzJELGFBQWxDLENBQWdEQyxNQUFoRCxDQUF1RDtBQUN4RWxCLFFBQUFBLElBQUksRUFBRSxDQURrRTtBQUV4RW1CLFFBQUFBLEtBQUssRUFBRWxFLE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUZrRDtBQUd4RUosUUFBQUEsSUFBSSxFQUFFcUM7QUFIa0UsT0FBdkQsQ0FBbkI7QUFNQSxhQUFPNUMsSUFBSSxDQUFDTyxJQUFMLENBQVUwRCxJQUFWLENBQWVDLEtBQWYsQ0FBcUJDLEtBQXJCLEtBQStCLENBQS9CLElBQ0wsT0FBT25FLElBQUksQ0FBQ08sSUFBTCxDQUFVNkQsWUFBVixDQUF1QixHQUF2QixFQUE0QkMsT0FBNUIsQ0FBb0MsQ0FBcEMsQ0FBUCxLQUFrRCxXQUQ3QyxHQUVEdEUsUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ1Z2QixRQUFBQSxJQUFJLEVBQUU7QUFBRXdCLFVBQUFBLFVBQVUsRUFBRSxHQUFkO0FBQW1CL0IsVUFBQUEsSUFBSSxFQUFFO0FBQXpCO0FBREksT0FBWixDQUZDLEdBS0RELFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNWdkIsUUFBQUEsSUFBSSxFQUFFO0FBQ0p3QixVQUFBQSxVQUFVLEVBQUUsR0FEUjtBQUVKL0IsVUFBQUEsSUFBSSxFQUFFQSxJQUFJLENBQUNPLElBQUwsQ0FBVTZELFlBQVYsQ0FBdUIsR0FBdkIsRUFBNEJDLE9BQTVCLENBQW9DLENBQXBDLEVBQXVDQztBQUZ6QztBQURJLE9BQVosQ0FMTjtBQVdELEtBMURELENBMERFLE9BQU9yQyxLQUFQLEVBQWM7QUFDZCx1QkFBSSwyQkFBSixFQUFpQ0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUFsRDtBQUNBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURsQyxRQUFqRCxDQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNd0UsNkJBQU4sQ0FBb0MxRSxPQUFwQyxFQUE2QzJFLElBQTdDLEVBQW1EQyxHQUFuRCxFQUF3RDtBQUN0RDtBQUNBLFFBQUlDLFNBQVMsR0FBRyxFQUFoQjs7QUFDQSxTQUFLLElBQUkxRCxJQUFULElBQWlCd0QsSUFBakIsRUFBdUI7QUFDckIsVUFBSUcsT0FBTyxHQUFHLEtBQWQ7QUFBQSxVQUNFQyxTQUFTLEdBQUcsS0FEZDs7QUFFQSxVQUFJO0FBQ0ZELFFBQUFBLE9BQU8sR0FBRyxNQUFNOUUsT0FBTyxDQUFDSSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDMkQsYUFBbEMsQ0FBZ0RDLE1BQWhELENBQXVEO0FBQ3JFQyxVQUFBQSxLQUFLLEVBQUVoRCxJQUFJLENBQUMwQjtBQUR5RCxTQUF2RCxDQUFoQjtBQUdELE9BSkQsQ0FJRSxPQUFPVCxLQUFQLEVBQWM7QUFDZDJDLFFBQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0Q7O0FBQ0QsVUFDRSxDQUFDLENBQUMsQ0FBQ0QsT0FBTyxJQUFJLEVBQVosRUFBZ0JwRSxJQUFoQixJQUF3QixFQUF6QixFQUE2QjBELElBQTdCLElBQXFDLEVBQXRDLEVBQTBDQyxLQUExQyxDQUFnREMsS0FBaEQsSUFBeUQsQ0FBekQsSUFDQyxDQUFDUyxTQUFELElBQWMsQ0FBQyxDQUFDLENBQUNELE9BQU8sSUFBSSxFQUFaLEVBQWdCcEUsSUFBaEIsSUFBd0IsRUFBekIsRUFBNkIwRCxJQUE3QixJQUFxQyxFQUF0QyxFQUEwQ0MsS0FBMUMsS0FBb0QsQ0FGckUsRUFHRTtBQUNBUSxRQUFBQSxTQUFTLENBQUNuRCxJQUFWLENBQWVQLElBQWY7QUFDRDtBQUNGOztBQUNELFdBQU8wRCxTQUFQO0FBQ0Q7QUFFRDs7Ozs7O0FBSUFHLEVBQUFBLG9CQUFvQixDQUFDQyxnQkFBRCxFQUFtQjtBQUNyQyxVQUFNQyxPQUFPLEdBQUcsQ0FBQyxXQUFELEVBQWMsYUFBZCxFQUE2QixjQUE3QixFQUE2QyxVQUE3QyxDQUFoQjtBQUNBLFFBQUlQLElBQUksR0FBRyxFQUFYOztBQUNBLFNBQUssTUFBTVIsS0FBWCxJQUFvQmMsZ0JBQXBCLEVBQXNDO0FBQ3BDLFVBQUlFLEtBQUosRUFBV0MsTUFBWDs7QUFDQSxVQUFJO0FBQ0ZBLFFBQUFBLE1BQU0sR0FBR0MsSUFBSSxDQUFDQyxLQUFMLENBQVduQixLQUFLLENBQUN2QixVQUFOLENBQWlCMkMsTUFBNUIsQ0FBVDtBQUNELE9BRkQsQ0FFRSxPQUFPbkQsS0FBUCxFQUFjO0FBQ2Q7QUFDRDs7QUFFRCtDLE1BQUFBLEtBQUssR0FBR0MsTUFBTSxDQUFDdkQsTUFBUCxDQUFjVixJQUFJLElBQUkrRCxPQUFPLENBQUM5RCxRQUFSLENBQWlCRCxJQUFJLENBQUNxRSxJQUF0QixDQUF0QixDQUFSOztBQUNBLFVBQUlMLEtBQUssQ0FBQ3BFLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEI0RCxRQUFBQSxJQUFJLENBQUNqRCxJQUFMLENBQVU7QUFDUitELFVBQUFBLEVBQUUsRUFBRXRCLEtBQUssQ0FBQ3NCLEVBREY7QUFFUjVDLFVBQUFBLEtBQUssRUFBRXNCLEtBQUssQ0FBQ3ZCLFVBQU4sQ0FBaUJDO0FBRmhCLFNBQVY7QUFJRDtBQUNGOztBQUNELFdBQU84QixJQUFQO0FBQ0Q7QUFFRDs7Ozs7Ozs7QUFNQSxRQUFNZSxrQkFBTixDQUF5QjFGLE9BQXpCLEVBQXlEQyxPQUF6RCxFQUFpR0MsUUFBakcsRUFBa0k7QUFDaEksUUFBSTtBQUNGLGFBQU9BLFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNqQnZCLFFBQUFBLElBQUksRUFBRTtBQUNKaUYsVUFBQUEsUUFBUSxFQUFFM0YsT0FBTyxDQUFDNEYsS0FBUixDQUFjQyxRQUFkLENBQXVCRjtBQUQ3QjtBQURXLE9BQVosQ0FBUDtBQUtELEtBTkQsQ0FNRSxPQUFPdkQsS0FBUCxFQUFjO0FBQ2QsdUJBQUksa0NBQUosRUFBd0NBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBekQ7QUFDQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEbEMsUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7OztBQUtBLFFBQU00RixzQkFBTixDQUE2QkMsV0FBN0IsRUFBMENOLEVBQTFDLEVBQThDTyxTQUFTLEdBQUcsS0FBMUQsRUFBaUU7QUFDL0QsUUFBSTtBQUNGLFlBQU1uRyxNQUFNLEdBQUcseUNBQWY7QUFDQSxVQUFJb0csaUJBQWlCLEdBQ25CLENBQUNwRyxNQUFNLElBQUksRUFBWCxFQUFlLDBCQUFmLEtBQThDcUcsbUNBRGhEO0FBRUEsdUJBQ0Usc0NBREYsRUFFRyxZQUFXSCxXQUFXLENBQUNoRixNQUFPLGlCQUZqQyxFQUdFLE9BSEY7QUFLQSx1QkFDRSxzQ0FERixFQUVHLHFCQUFvQjBFLEVBQUcsRUFGMUIsRUFHRSxPQUhGO0FBS0EsWUFBTVUsUUFBUSxHQUFHLEVBQWpCO0FBQ0EsVUFBSUMsVUFBSixFQUFnQkMsWUFBaEI7O0FBQ0EsV0FBSyxJQUFJQyxPQUFULElBQW9CUCxXQUFwQixFQUFpQztBQUMvQkssUUFBQUEsVUFBVSxHQUFHZixJQUFJLENBQUNDLEtBQUwsQ0FBV0QsSUFBSSxDQUFDa0IsU0FBTCxDQUFlRCxPQUFPLENBQUNFLE9BQXZCLENBQVgsQ0FBYixDQUQrQixDQUcvQjs7QUFDQSxZQUNFSixVQUFVLElBQ1ZBLFVBQVUsQ0FBQ0sscUJBRFgsSUFFQUwsVUFBVSxDQUFDSyxxQkFBWCxDQUFpQ0MsZ0JBRmpDLElBR0EsT0FBT04sVUFBVSxDQUFDSyxxQkFBWCxDQUFpQ0MsZ0JBQXhDLEtBQTZELFFBSi9ELEVBS0U7QUFDQSxnQkFBTUMsVUFBVSxHQUFHUCxVQUFVLENBQUNLLHFCQUFYLENBQWlDQyxnQkFBcEQ7QUFFQSxnQkFBTUUsWUFBWSxHQUFHRCxVQUFVLENBQUN2RixRQUFYLENBQW9CLGtCQUFwQixDQUFyQjs7QUFDQSxjQUFJd0YsWUFBSixFQUFrQjtBQUNoQixnQkFBSVosU0FBUyxJQUFJQSxTQUFTLEtBQUssU0FBL0IsRUFBMEM7QUFDeEMsa0JBQ0VDLGlCQUFpQixDQUFDN0UsUUFBbEIsQ0FBMkI0RSxTQUEzQixLQUNBQyxpQkFBaUIsQ0FBQzdFLFFBQWxCLENBQTJCLGdCQUEzQixDQUZGLEVBR0U7QUFDQTZFLGdCQUFBQSxpQkFBaUIsR0FBR0EsaUJBQWlCLENBQUN6RSxLQUFsQixDQUNsQixnQkFEa0IsRUFFbEIsQ0FGa0IsQ0FBcEI7QUFHRDtBQUNGOztBQUNENEUsWUFBQUEsVUFBVSxDQUFDSyxxQkFBWCxDQUFpQ0MsZ0JBQWpDLEdBQW9EQyxVQUFVLENBQUNFLE9BQVgsQ0FDbEQsbUJBRGtELEVBRWxEWixpQkFBaUIsQ0FBQ0EsaUJBQWlCLENBQUNsRixNQUFsQixHQUEyQixDQUE1QixDQUFqQixLQUFvRCxHQUFwRCxJQUNHaUYsU0FBUyxJQUFJQSxTQUFTLEtBQUssU0FEOUIsR0FFSUMsaUJBRkosR0FHSUEsaUJBQWlCLEdBQUcsR0FMMEIsQ0FBcEQ7QUFPRCxXQWxCRCxNQWtCTztBQUNMRyxZQUFBQSxVQUFVLENBQUNLLHFCQUFYLENBQWlDQyxnQkFBakMsR0FBb0RDLFVBQVUsQ0FBQ0UsT0FBWCxDQUNsRCxlQURrRCxFQUVsRHBCLEVBRmtELENBQXBEO0FBSUQ7QUFDRixTQXJDOEIsQ0F1Qy9COzs7QUFDQSxZQUFJLE9BQU8sQ0FBQ1csVUFBVSxJQUFJLEVBQWYsRUFBbUJVLFFBQTFCLEtBQXVDLFFBQTNDLEVBQXFEO0FBQ25EVixVQUFBQSxVQUFVLENBQUNVLFFBQVgsR0FBc0JWLFVBQVUsQ0FBQ1UsUUFBWCxDQUFvQkQsT0FBcEIsQ0FDcEIsZUFEb0IsRUFFcEJwQixFQUZvQixDQUF0QjtBQUlELFNBN0M4QixDQStDL0I7OztBQUNBWSxRQUFBQSxZQUFZLEdBQUcsRUFBZjtBQUNBQSxRQUFBQSxZQUFZLENBQUNDLE9BQU8sQ0FBQ1MsS0FBVCxDQUFaLEdBQThCWCxVQUE5QjtBQUVBRCxRQUFBQSxRQUFRLENBQUN6RSxJQUFULENBQWM7QUFDWmtCLFVBQUFBLFVBQVUsRUFBRXlELFlBQVksQ0FBQ1csYUFEYjtBQUVadkUsVUFBQUEsSUFBSSxFQUFFNkQsT0FBTyxDQUFDUyxLQUZGO0FBR1p0QixVQUFBQSxFQUFFLEVBQUVhLE9BQU8sQ0FBQ1csR0FIQTtBQUlaQyxVQUFBQSxRQUFRLEVBQUViLFlBQVksQ0FBQ1csYUFBYixDQUEyQkc7QUFKekIsU0FBZDtBQU1EOztBQUNELGFBQU9oQixRQUFQO0FBQ0QsS0EzRUQsQ0EyRUUsT0FBTy9ELEtBQVAsRUFBYztBQUNkLHVCQUFJLHNDQUFKLEVBQTRDQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQTdEO0FBQ0EsYUFBT2dGLE9BQU8sQ0FBQ0MsTUFBUixDQUFlakYsS0FBZixDQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7O0FBUUFrRixFQUFBQSw2QkFBNkIsQ0FDM0J2QixXQUQyQixFQUUzQk4sRUFGMkIsRUFHM0I4QixLQUFLLEdBQUcsRUFIbUIsRUFJM0IvQixJQUoyQixFQUszQmdDLFdBTDJCLEVBTTNCQyxZQUFZLEdBQUcsR0FOWSxFQU8zQjtBQUNBLFFBQUk7QUFDRixZQUFNdEIsUUFBUSxHQUFHLEVBQWpCO0FBQ0EsVUFBSUMsVUFBSixFQUFnQkMsWUFBaEI7O0FBRUEsV0FBSyxNQUFNQyxPQUFYLElBQXNCUCxXQUF0QixFQUFtQztBQUNqQztBQUNBSyxRQUFBQSxVQUFVLEdBQUdmLElBQUksQ0FBQ2tCLFNBQUwsQ0FBZUQsT0FBTyxDQUFDRSxPQUF2QixDQUFiO0FBQ0FKLFFBQUFBLFVBQVUsR0FBR0EsVUFBVSxDQUFDUyxPQUFYLENBQW1CLGVBQW5CLEVBQW9DcEIsRUFBcEMsQ0FBYjtBQUNBVyxRQUFBQSxVQUFVLEdBQUdmLElBQUksQ0FBQ0MsS0FBTCxDQUFXYyxVQUFYLENBQWIsQ0FKaUMsQ0FNakM7O0FBQ0FDLFFBQUFBLFlBQVksR0FBRyxFQUFmO0FBQ0FBLFFBQUFBLFlBQVksQ0FBQ0MsT0FBTyxDQUFDUyxLQUFULENBQVosR0FBOEJYLFVBQTlCO0FBRUEsY0FBTVUsUUFBUSxHQUFHekIsSUFBSSxDQUFDQyxLQUFMLENBQVdlLFlBQVksQ0FBQ1csYUFBYixDQUEyQkYsUUFBdEMsQ0FBakI7QUFDQSxjQUFNakUsS0FBSyxHQUFHaUUsUUFBUSxDQUFDakUsS0FBdkI7O0FBRUEsWUFBSWlFLFFBQVEsQ0FBQ3JFLElBQVQsSUFBaUJxRSxRQUFRLENBQUNyRSxJQUFULEtBQWtCLFVBQXZDLEVBQW1EO0FBQ2pELGNBQUlRLEtBQUssR0FBRyxFQUFaOztBQUNBLGNBQUlKLEtBQUssS0FBSyw0QkFBZCxFQUE0QztBQUMxQyxpQkFBSyxNQUFNNkUsSUFBWCxJQUFtQkgsS0FBbkIsRUFBMEI7QUFDeEJ0RSxjQUFBQSxLQUFLLElBQUssYUFBWXdFLFlBQWEscUJBQW9CakMsSUFBSyxzQkFBcUJrQyxJQUFJLENBQUNsQyxJQUFLLGFBQVlrQyxJQUFJLENBQUNsQyxJQUFLLEtBQWpIO0FBQ0Q7O0FBQ0R2QyxZQUFBQSxLQUFLLEdBQUdBLEtBQUssQ0FBQzBFLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIxRSxLQUFLLENBQUNsQyxNQUFOLEdBQWUsQ0FBbEMsQ0FBUjtBQUNELFdBTEQsTUFLTyxJQUFJOEIsS0FBSyxLQUFLLG9DQUFkLEVBQW9EO0FBQ3pESSxZQUFBQSxLQUFLLElBQUssYUFBWXdFLFlBQWEscUJBQW9CakMsSUFBSyxhQUFZQSxJQUFLLFlBQTdFO0FBQ0QsV0FGTSxNQUVBO0FBQ0wsZ0JBQUkzQyxLQUFLLENBQUMrRSxVQUFOLENBQWlCLHNCQUFqQixDQUFKLEVBQThDO0FBQzVDLG9CQUFNO0FBQUVsQixnQkFBQUE7QUFBRixrQkFBdUJMLFlBQVksQ0FBQ1csYUFBYixDQUEyQlAscUJBQXhEO0FBQ0FKLGNBQUFBLFlBQVksQ0FBQ1csYUFBYixDQUEyQlAscUJBQTNCLENBQWlEQyxnQkFBakQsR0FBb0VBLGdCQUFnQixDQUFDRyxPQUFqQixDQUF5QixvQkFBekIsRUFBK0NZLFlBQS9DLENBQXBFO0FBQ0Q7O0FBQ0QsZ0JBQUk1RSxLQUFLLENBQUMrRSxVQUFOLENBQWlCLHNCQUFqQixLQUE0Q3BDLElBQUksS0FBSyxHQUFyRCxJQUE0REEsSUFBSSxLQUFLLEtBQXJFLElBQThFc0IsUUFBUSxDQUFDakcsTUFBVCxDQUFnQmdILFVBQWhCLENBQTJCekcsUUFBM0IsQ0FBb0MsSUFBcEMsQ0FBbEYsRUFBNkg7QUFDM0gsb0JBQU0wRyxlQUFlLEdBQUcsVUFBeEI7QUFDQTdFLGNBQUFBLEtBQUssSUFBSTZELFFBQVEsQ0FBQ2pHLE1BQVQsQ0FBZ0JnSCxVQUFoQixDQUEyQmhCLE9BQTNCLENBQW1DaUIsZUFBbkMsRUFBcUQsZUFBY3RDLElBQUssZ0JBQWVnQyxXQUFZLEdBQW5HLENBQVQ7QUFFRCxhQUpELE1BSU8sSUFBSTNFLEtBQUssQ0FBQytFLFVBQU4sQ0FBaUIsc0JBQWpCLENBQUosRUFBOEM7QUFDbkQsb0JBQU1FLGVBQWUsR0FBRyxVQUF4QjtBQUNBN0UsY0FBQUEsS0FBSyxJQUFJNkQsUUFBUSxDQUFDakcsTUFBVCxDQUFnQmdILFVBQWhCLENBQTJCaEIsT0FBM0IsQ0FBbUNpQixlQUFuQyxFQUFxRCxjQUFhTixXQUFZLEdBQTlFLENBQVQ7QUFDRCxhQUhNLE1BR0E7QUFDTHZFLGNBQUFBLEtBQUssR0FBRzZELFFBQVEsQ0FBQ2pHLE1BQVQsQ0FBZ0JnSCxVQUF4QjtBQUNEO0FBQ0Y7O0FBRURmLFVBQUFBLFFBQVEsQ0FBQ2pHLE1BQVQsQ0FBZ0JnSCxVQUFoQixHQUE2QjVFLEtBQUssQ0FBQzRELE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQXBCLENBQTdCO0FBQ0FSLFVBQUFBLFlBQVksQ0FBQ1csYUFBYixDQUEyQkYsUUFBM0IsR0FBc0N6QixJQUFJLENBQUNrQixTQUFMLENBQWVPLFFBQWYsQ0FBdEM7QUFDRDs7QUFFRFgsUUFBQUEsUUFBUSxDQUFDekUsSUFBVCxDQUFjO0FBQ1prQixVQUFBQSxVQUFVLEVBQUV5RCxZQUFZLENBQUNXLGFBRGI7QUFFWnZFLFVBQUFBLElBQUksRUFBRTZELE9BQU8sQ0FBQ1MsS0FGRjtBQUdadEIsVUFBQUEsRUFBRSxFQUFFYSxPQUFPLENBQUNXLEdBSEE7QUFJWkMsVUFBQUEsUUFBUSxFQUFFYixZQUFZLENBQUNXLGFBQWIsQ0FBMkJHO0FBSnpCLFNBQWQ7QUFNRDs7QUFFRCxhQUFPaEIsUUFBUDtBQUNELEtBeERELENBd0RFLE9BQU8vRCxLQUFQLEVBQWM7QUFDZCx1QkFDRSw2Q0FERixFQUVFQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBRm5CO0FBSUEsYUFBT2dGLE9BQU8sQ0FBQ0MsTUFBUixDQUFlakYsS0FBZixDQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNMkYsU0FBTixDQUFnQi9ILE9BQWhCLEVBQWdEQyxPQUFoRCxFQUF5R0MsUUFBekcsRUFBMEk7QUFDeEksUUFBSTtBQUNGLFVBQ0csQ0FBQ0QsT0FBTyxDQUFDWSxNQUFSLENBQWVtSCxHQUFmLENBQW1CNUcsUUFBbkIsQ0FBNEIsV0FBNUIsQ0FBRCxJQUNDLENBQUNuQixPQUFPLENBQUNZLE1BQVIsQ0FBZW1ILEdBQWYsQ0FBbUI1RyxRQUFuQixDQUE0QixTQUE1QixDQUZMLEVBR0U7QUFDQSxjQUFNLElBQUlULEtBQUosQ0FBVSw0Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsWUFBTXNILFNBQVMsR0FBR2hJLE9BQU8sQ0FBQ1ksTUFBUixDQUFlbUgsR0FBZixDQUFtQjVHLFFBQW5CLENBQTRCLFVBQTVCLElBQ2QsVUFEYyxHQUVkLFFBRko7QUFJQSxZQUFNOEcsUUFBUSxHQUFHakksT0FBTyxDQUFDWSxNQUFSLENBQWVtSCxHQUFmLENBQW1CeEcsS0FBbkIsQ0FBeUIsR0FBekIsQ0FBakI7QUFDQSxZQUFNMkcsUUFBUSxHQUFHRCxRQUFRLENBQUMsQ0FBRCxDQUF6QjtBQUVBLFlBQU1FLElBQUksR0FDUkgsU0FBUyxLQUFLLFVBQWQsR0FDSUksdUNBQXVCRixRQUF2QixDQURKLEdBRUlHLHFDQUFxQkgsUUFBckIsQ0FITjtBQUlBLHVCQUFJLHlCQUFKLEVBQWdDLEdBQUVGLFNBQVUsSUFBR0UsUUFBUyx3QkFBdUJsSSxPQUFPLENBQUNZLE1BQVIsQ0FBZUMsT0FBUSxFQUF0RyxFQUF5RyxPQUF6RztBQUNBLFlBQU1rRixTQUFTLEdBQUdoRyxPQUFPLENBQUM0RixLQUFSLENBQWMyQyxPQUFkLENBQXNCQyxNQUF0QixJQUFnQ3hJLE9BQU8sQ0FBQzRGLEtBQVIsQ0FBYzJDLE9BQWQsQ0FBc0JDLE1BQXRCLENBQTZCQyxhQUE3RCxJQUE4RXpJLE9BQU8sQ0FBQzRGLEtBQVIsQ0FBYzJDLE9BQWQsQ0FBc0JDLE1BQXRCLENBQTZCQyxhQUE3QixDQUEyQ0MsVUFBM0MsQ0FBc0R6SSxPQUF0RCxDQUFoRztBQUNBLFlBQU0wSSxHQUFHLEdBQUcsTUFBTSxLQUFLN0Msc0JBQUwsQ0FDaEJzQyxJQURnQixFQUVoQm5JLE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUZDLEVBR2hCa0YsU0FIZ0IsQ0FBbEI7QUFLQSxhQUFPOUYsUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ2pCdkIsUUFBQUEsSUFBSSxFQUFFO0FBQUVrSSxVQUFBQSxXQUFXLEVBQUUsSUFBZjtBQUFxQkQsVUFBQUEsR0FBRyxFQUFFQTtBQUExQjtBQURXLE9BQVosQ0FBUDtBQUdELEtBN0JELENBNkJFLE9BQU92RyxLQUFQLEVBQWM7QUFDZCx1QkFBSSx5QkFBSixFQUErQkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUFoRDtBQUNBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURsQyxRQUFqRCxDQUFQO0FBQ0Q7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNMkksZ0JBQU4sQ0FBdUI3SSxPQUF2QixFQUF1REMsT0FBdkQsRUFBOEhDLFFBQTlILEVBQStKO0FBQzdKLFFBQUk7QUFDRixVQUNFLENBQUNELE9BQU8sQ0FBQ1ksTUFBUixDQUFlQyxPQUFoQixJQUNBLENBQUNiLE9BQU8sQ0FBQ1ksTUFBUixDQUFlbUgsR0FEaEIsSUFFQSxDQUFDL0gsT0FBTyxDQUFDUyxJQUZULElBR0EsQ0FBQ1QsT0FBTyxDQUFDUyxJQUFSLENBQWE2RyxLQUhkLElBSUEsQ0FBQ3RILE9BQU8sQ0FBQ1MsSUFBUixDQUFhNkcsS0FBYixDQUFtQnVCLGNBSnBCLElBS0EsQ0FBQzdJLE9BQU8sQ0FBQ1MsSUFBUixDQUFhNkcsS0FBYixDQUFtQi9CLElBTHBCLElBTUN2RixPQUFPLENBQUNZLE1BQVIsQ0FBZW1ILEdBQWYsSUFBc0IsQ0FBQy9ILE9BQU8sQ0FBQ1ksTUFBUixDQUFlbUgsR0FBZixDQUFtQjVHLFFBQW5CLENBQTRCLFVBQTVCLENBUDFCLEVBUUU7QUFDQSxjQUFNLElBQUlULEtBQUosQ0FBVSw0Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsWUFBTThCLElBQUksR0FBR3hDLE9BQU8sQ0FBQ1ksTUFBUixDQUFlbUgsR0FBZixDQUFtQnhHLEtBQW5CLENBQXlCLEdBQXpCLEVBQThCLENBQTlCLENBQWI7QUFFQSxZQUFNNEcsSUFBSSxHQUFHVyxzQ0FBc0J0RyxJQUF0QixDQUFiO0FBQ0EsWUFBTThFLEtBQUssR0FBR3RILE9BQU8sQ0FBQ1MsSUFBUixDQUFhNkcsS0FBYixDQUFtQnVCLGNBQWpDO0FBQ0EsWUFBTXRELElBQUksR0FBR3ZGLE9BQU8sQ0FBQ1MsSUFBUixDQUFhNkcsS0FBYixDQUFtQi9CLElBQWhDO0FBQ0EsWUFBTXdELFVBQVUsR0FBRy9JLE9BQU8sQ0FBQ1MsSUFBUixDQUFhNkcsS0FBYixDQUFtQkMsV0FBdEM7QUFFQSxZQUFNO0FBQUMvQixRQUFBQSxFQUFFLEVBQUV3RCxTQUFMO0FBQWdCcEcsUUFBQUEsS0FBSyxFQUFFcUc7QUFBdkIsVUFBc0NqSixPQUFPLENBQUNTLElBQVIsQ0FBYUksT0FBekQ7QUFFQSxZQUFNNkgsR0FBRyxHQUFHLE1BQU0sS0FBS3JCLDZCQUFMLENBQ2hCYyxJQURnQixFQUVoQmEsU0FGZ0IsRUFHaEIxQixLQUhnQixFQUloQi9CLElBSmdCLEVBS2hCd0QsVUFMZ0IsRUFNaEJFLFdBTmdCLENBQWxCO0FBU0EsYUFBT2hKLFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNqQnZCLFFBQUFBLElBQUksRUFBRTtBQUFFa0ksVUFBQUEsV0FBVyxFQUFFLElBQWY7QUFBcUJELFVBQUFBLEdBQUcsRUFBRUE7QUFBMUI7QUFEVyxPQUFaLENBQVA7QUFHRCxLQWxDRCxDQWtDRSxPQUFPdkcsS0FBUCxFQUFjO0FBQ2QsdUJBQUksZ0NBQUosRUFBc0NBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBdkQ7QUFDQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEbEMsUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7QUFFRDs7Ozs7Ozs7OztBQVFBLFFBQU1pSixnQkFBTixDQUF1Qm5KLE9BQXZCLEVBQXVEQyxPQUF2RCxFQUErRUMsUUFBL0UsRUFBZ0g7QUFDOUcsUUFBSTtBQUNGO0FBQ0EsWUFBTTRFLE9BQU8sR0FBRyxNQUFNc0MsT0FBTyxDQUFDZ0MsR0FBUixDQUFZQyxNQUFNLENBQUNDLElBQVAsQ0FBWUMscURBQVosRUFDL0JDLEdBRCtCLENBQzFCNUosUUFBRCxJQUFjSSxPQUFPLENBQUNJLElBQVIsQ0FBYUMsYUFBYixDQUEyQkMsTUFBM0IsQ0FBa0MyRCxhQUFsQyxDQUFnRHdGLE9BQWhELENBQXdEQyxNQUF4RCxDQUErRDtBQUNoRnZGLFFBQUFBLEtBQUssRUFBRSxLQUFLeEUsMEJBQUwsQ0FBZ0NDLFFBQWhDO0FBRHlFLE9BQS9ELENBRGEsQ0FBWixDQUF0QjtBQUlBLGFBQU9NLFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNqQnZCLFFBQUFBLElBQUksRUFBRTtBQUFFaUosVUFBQUEscUJBQXFCLEVBQUU3RSxPQUFPLENBQUM4RSxJQUFSLENBQWFDLE1BQU0sSUFBSUEsTUFBTSxDQUFDbkosSUFBOUI7QUFBekI7QUFEVyxPQUFaLENBQVA7QUFHRCxLQVRELENBU0UsT0FBTzBCLEtBQVAsRUFBYztBQUNkLGFBQU8sa0NBQWMsa0NBQWQsRUFBa0QsSUFBbEQsRUFBd0QsR0FBeEQsRUFBNkRsQyxRQUE3RCxDQUFQO0FBQ0Q7QUFDRjtBQUNEOzs7Ozs7Ozs7O0FBUUEsUUFBTTRKLDBCQUFOLENBQWlDOUosT0FBakMsRUFBaUVDLE9BQWpFLEVBQThHQyxRQUE5RyxFQUErSTtBQUM3SSxRQUFJO0FBQ0YsWUFBTTZKLGlCQUFpQixHQUFHLEtBQUtwSywwQkFBTCxDQUFnQ00sT0FBTyxDQUFDWSxNQUFSLENBQWVqQixRQUEvQyxDQUExQixDQURFLENBRUY7O0FBQ0EsWUFBTW9LLGlCQUFpQixHQUFHLE1BQU1oSyxPQUFPLENBQUNJLElBQVIsQ0FBYUMsYUFBYixDQUEyQkMsTUFBM0IsQ0FBa0MyRCxhQUFsQyxDQUFnRHdGLE9BQWhELENBQXdEQyxNQUF4RCxDQUErRDtBQUM3RnZGLFFBQUFBLEtBQUssRUFBRTRGO0FBRHNGLE9BQS9ELENBQWhDO0FBR0EsYUFBTzdKLFFBQVEsQ0FBQytCLEVBQVQsQ0FBWTtBQUNqQnZCLFFBQUFBLElBQUksRUFBRTtBQUFFeUQsVUFBQUEsS0FBSyxFQUFFNEYsaUJBQVQ7QUFBNEJMLFVBQUFBLE1BQU0sRUFBRU0saUJBQWlCLENBQUN0SjtBQUF0RDtBQURXLE9BQVosQ0FBUDtBQUdELEtBVEQsQ0FTRSxPQUFPMEIsS0FBUCxFQUFjO0FBQ2QsdUJBQ0UsMENBREYsRUFFRyxzREFBcURBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBTSxFQUYvRTtBQUlBLGFBQU8sa0NBQWUsc0RBQXFEQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFBM0YsRUFBOEYsSUFBOUYsRUFBb0csR0FBcEcsRUFBeUdsQyxRQUF6RyxDQUFQO0FBQ0Q7QUFDRjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLFFBQU0rSixrQkFBTixDQUF5QmpLLE9BQXpCLEVBQXlEQyxPQUF6RCxFQUFzR0MsUUFBdEcsRUFBdUk7QUFDckksVUFBTTZKLGlCQUFpQixHQUFHLEtBQUtwSywwQkFBTCxDQUFnQ00sT0FBTyxDQUFDWSxNQUFSLENBQWVqQixRQUEvQyxDQUExQjs7QUFFQSxRQUFJO0FBQ0Y7QUFDQSxZQUFNc0ssS0FBSyxHQUFHLGtDQUFxQmpLLE9BQU8sQ0FBQ2tLLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFVBQTdDLENBQWQ7O0FBQ0EsVUFBRyxDQUFDRixLQUFKLEVBQVU7QUFDUixlQUFPLGtDQUFjLG1CQUFkLEVBQW1DLEdBQW5DLEVBQXdDLEdBQXhDLEVBQTZDaEssUUFBN0MsQ0FBUDtBQUNEOztBQUFBO0FBQ0QsWUFBTW1LLFlBQVksR0FBRyx3QkFBVUgsS0FBVixDQUFyQjs7QUFDQSxVQUFHLENBQUNHLFlBQUosRUFBaUI7QUFDZixlQUFPLGtDQUFjLHlCQUFkLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1EbkssUUFBbkQsQ0FBUDtBQUNEOztBQUFBOztBQUNELFVBQUcsQ0FBQ21LLFlBQVksQ0FBQ0MsVUFBZCxJQUE0QixDQUFDRCxZQUFZLENBQUNDLFVBQWIsQ0FBd0JsSixRQUF4QixDQUFpQ21KLHNDQUFqQyxDQUFoQyxFQUE4RjtBQUM1RixlQUFPLGtDQUFjLHVCQUFkLEVBQXVDLEdBQXZDLEVBQTRDLEdBQTVDLEVBQWlEckssUUFBakQsQ0FBUDtBQUNEOztBQUFBLE9BWkMsQ0FhRjs7QUFDQSxZQUFNc0ssU0FBUyxHQUFHLGtDQUFxQnZLLE9BQU8sQ0FBQ2tLLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFFBQTdDLENBQWxCOztBQUNBLFVBQUksQ0FBQ0ksU0FBTCxFQUFnQjtBQUNkLGVBQU8sa0NBQWMsb0JBQWQsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEN0SyxRQUE5QyxDQUFQO0FBQ0Q7O0FBQUE7QUFDRCxZQUFNdUssc0JBQXNCLEdBQUcsTUFBTXpLLE9BQU8sQ0FBQzRGLEtBQVIsQ0FBYzhFLEdBQWQsQ0FBa0JwSyxNQUFsQixDQUF5QjJELGFBQXpCLENBQXVDaEUsT0FBdkMsQ0FBK0MsS0FBL0MsRUFBdUQsSUFBdkQsRUFBNEQsRUFBNUQsRUFBZ0U7QUFBQ3VLLFFBQUFBO0FBQUQsT0FBaEUsQ0FBckM7O0FBQ0EsVUFBR0Msc0JBQXNCLENBQUN0SSxNQUF2QixLQUFrQyxHQUFyQyxFQUF5QztBQUN2QyxlQUFPLGtDQUFjLG9CQUFkLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDakMsUUFBOUMsQ0FBUDtBQUNEOztBQUFBO0FBRUQsWUFBTXlLLFVBQVUsR0FBR3RGLElBQUksQ0FBQ2tCLFNBQUwsQ0FBZTtBQUNoQ3BDLFFBQUFBLEtBQUssRUFBRTtBQUNMeUcsVUFBQUEsTUFBTSxFQUFFYjtBQURIO0FBRHlCLE9BQWYsQ0FBbkI7QUFLQSxZQUFNYyxtQkFBbUIsR0FBRzVLLE9BQU8sQ0FBQ1MsSUFBUixJQUFnQlQsT0FBTyxDQUFDUyxJQUFSLENBQWFHLE1BQTdCLElBQXVDLEVBQW5FOztBQUVBLFlBQU1pSyxZQUFZLEdBQUd2QixzREFBMkN0SixPQUFPLENBQUNZLE1BQVIsQ0FBZWpCLFFBQTFELEVBQW9FNEosR0FBcEUsQ0FBeUV1QixTQUFELElBQWUsMENBQWUsRUFBRSxHQUFHQSxTQUFMO0FBQWdCLFdBQUdGO0FBQW5CLE9BQWYsRUFBeUQ1SyxPQUFPLENBQUNTLElBQVIsQ0FBYXNLLE1BQWIsSUFBdUJELFNBQVMsQ0FBQ0MsTUFBakMsSUFBMkNDLG9EQUFwRyxDQUF2RixFQUF1T0MsSUFBdk8sRUFBckI7O0FBQ0EsWUFBTUMsSUFBSSxHQUFHTCxZQUFZLENBQUN0QixHQUFiLENBQWlCNEIsV0FBVyxJQUFLLEdBQUVULFVBQVcsS0FBSXRGLElBQUksQ0FBQ2tCLFNBQUwsQ0FBZTZFLFdBQWYsQ0FBNEIsSUFBOUUsRUFBbUZDLElBQW5GLENBQXdGLEVBQXhGLENBQWIsQ0EvQkUsQ0FpQ0Y7QUFFQTs7QUFDQSxZQUFNckIsaUJBQWlCLEdBQUcsTUFBTWhLLE9BQU8sQ0FBQ0ksSUFBUixDQUFhQyxhQUFiLENBQTJCQyxNQUEzQixDQUFrQ0MsY0FBbEMsQ0FBaURrSixPQUFqRCxDQUF5REMsTUFBekQsQ0FBZ0U7QUFDOUZ2RixRQUFBQSxLQUFLLEVBQUU0RjtBQUR1RixPQUFoRSxDQUFoQzs7QUFHQSxVQUFJLENBQUNDLGlCQUFpQixDQUFDdEosSUFBdkIsRUFBNkI7QUFDM0I7QUFFQSxjQUFNNEssYUFBYSxHQUFHO0FBQ3BCQyxVQUFBQSxRQUFRLEVBQUU7QUFDUnBILFlBQUFBLEtBQUssRUFBRTtBQUNMcUgsY0FBQUEsZ0JBQWdCLEVBQUVDLDJDQURiO0FBRUxDLGNBQUFBLGtCQUFrQixFQUFFQztBQUZmO0FBREM7QUFEVSxTQUF0QjtBQVNBLGNBQU0zTCxPQUFPLENBQUNJLElBQVIsQ0FBYUMsYUFBYixDQUEyQkMsTUFBM0IsQ0FBa0NDLGNBQWxDLENBQWlEa0osT0FBakQsQ0FBeURtQyxNQUF6RCxDQUFnRTtBQUNwRXpILFVBQUFBLEtBQUssRUFBRTRGLGlCQUQ2RDtBQUVwRXJKLFVBQUFBLElBQUksRUFBRTRLO0FBRjhELFNBQWhFLENBQU47QUFJQSx5QkFDRSxrQ0FERixFQUVHLFdBQVV2QixpQkFBa0IsUUFGL0IsRUFHRSxPQUhGO0FBS0Q7O0FBRUQsWUFBTS9KLE9BQU8sQ0FBQ0ksSUFBUixDQUFhQyxhQUFiLENBQTJCQyxNQUEzQixDQUFrQ0MsY0FBbEMsQ0FBaUQ0SyxJQUFqRCxDQUFzRDtBQUMxRGhILFFBQUFBLEtBQUssRUFBRTRGLGlCQURtRDtBQUUxRHJKLFFBQUFBLElBQUksRUFBRXlLO0FBRm9ELE9BQXRELENBQU47QUFJQSx1QkFDRSxrQ0FERixFQUVHLDBCQUF5QnBCLGlCQUFrQixRQUY5QyxFQUdFLE9BSEY7QUFLQSxhQUFPN0osUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ2pCdkIsUUFBQUEsSUFBSSxFQUFFO0FBQUV5RCxVQUFBQSxLQUFLLEVBQUU0RixpQkFBVDtBQUE0QjhCLFVBQUFBLFVBQVUsRUFBRWYsWUFBWSxDQUFDL0o7QUFBckQ7QUFEVyxPQUFaLENBQVA7QUFHRCxLQTFFRCxDQTBFRSxPQUFPcUIsS0FBUCxFQUFjO0FBQ2QsdUJBQ0Usa0NBREYsRUFFRyxpQ0FBZ0MySCxpQkFBa0IsV0FBVTNILEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBTSxFQUZ0RjtBQUlBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURsQyxRQUFqRCxDQUFQO0FBQ0Q7QUFDRjtBQUNEOzs7Ozs7Ozs7QUFPQSxRQUFNNEwsa0JBQU4sQ0FBeUI5TCxPQUF6QixFQUF5REMsT0FBekQsRUFBc0dDLFFBQXRHLEVBQXVJO0FBQ3JJO0FBRUEsVUFBTTZKLGlCQUFpQixHQUFHLEtBQUtwSywwQkFBTCxDQUFnQ00sT0FBTyxDQUFDWSxNQUFSLENBQWVqQixRQUEvQyxDQUExQjs7QUFFQSxRQUFJO0FBQ0Y7QUFDQSxZQUFNc0ssS0FBSyxHQUFHLGtDQUFxQmpLLE9BQU8sQ0FBQ2tLLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFVBQTdDLENBQWQ7O0FBQ0EsVUFBRyxDQUFDRixLQUFKLEVBQVU7QUFDUixlQUFPLGtDQUFjLG1CQUFkLEVBQW1DLEdBQW5DLEVBQXdDLEdBQXhDLEVBQTZDaEssUUFBN0MsQ0FBUDtBQUNEOztBQUFBO0FBQ0QsWUFBTW1LLFlBQVksR0FBRyx3QkFBVUgsS0FBVixDQUFyQjs7QUFDQSxVQUFHLENBQUNHLFlBQUosRUFBaUI7QUFDZixlQUFPLGtDQUFjLHlCQUFkLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1EbkssUUFBbkQsQ0FBUDtBQUNEOztBQUFBOztBQUNELFVBQUcsQ0FBQ21LLFlBQVksQ0FBQ0MsVUFBZCxJQUE0QixDQUFDRCxZQUFZLENBQUNDLFVBQWIsQ0FBd0JsSixRQUF4QixDQUFpQ21KLHNDQUFqQyxDQUFoQyxFQUE4RjtBQUM1RixlQUFPLGtDQUFjLHVCQUFkLEVBQXVDLEdBQXZDLEVBQTRDLEdBQTVDLEVBQWlEckssUUFBakQsQ0FBUDtBQUNEOztBQUFBLE9BWkMsQ0FhRjs7QUFDQSxZQUFNc0ssU0FBUyxHQUFHLGtDQUFxQnZLLE9BQU8sQ0FBQ2tLLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFFBQTdDLENBQWxCOztBQUNBLFVBQUksQ0FBQ0ksU0FBTCxFQUFnQjtBQUNkLGVBQU8sa0NBQWMsb0JBQWQsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEN0SyxRQUE5QyxDQUFQO0FBQ0Q7O0FBQUE7QUFDRCxZQUFNdUssc0JBQXNCLEdBQUcsTUFBTXpLLE9BQU8sQ0FBQzRGLEtBQVIsQ0FBYzhFLEdBQWQsQ0FBa0JwSyxNQUFsQixDQUF5QjJELGFBQXpCLENBQXVDaEUsT0FBdkMsQ0FBK0MsS0FBL0MsRUFBdUQsSUFBdkQsRUFBNEQsRUFBNUQsRUFBZ0U7QUFBQ3VLLFFBQUFBO0FBQUQsT0FBaEUsQ0FBckM7O0FBQ0EsVUFBR0Msc0JBQXNCLENBQUN0SSxNQUF2QixLQUFrQyxHQUFyQyxFQUF5QztBQUN2QyxlQUFPLGtDQUFjLG9CQUFkLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDakMsUUFBOUMsQ0FBUDtBQUNEOztBQUFBLE9BckJDLENBdUJGOztBQUNBLFlBQU04SixpQkFBaUIsR0FBRyxNQUFNaEssT0FBTyxDQUFDSSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDMkQsYUFBbEMsQ0FBZ0R3RixPQUFoRCxDQUF3REMsTUFBeEQsQ0FBK0Q7QUFDN0Z2RixRQUFBQSxLQUFLLEVBQUU0RjtBQURzRixPQUEvRCxDQUFoQzs7QUFHQSxVQUFJQyxpQkFBaUIsQ0FBQ3RKLElBQXRCLEVBQTRCO0FBQzFCO0FBQ0EsY0FBTVYsT0FBTyxDQUFDSSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDMkQsYUFBbEMsQ0FBZ0R3RixPQUFoRCxDQUF3RHNDLE1BQXhELENBQStEO0FBQUU1SCxVQUFBQSxLQUFLLEVBQUU0RjtBQUFULFNBQS9ELENBQU47QUFDQSx5QkFDRSxrQ0FERixFQUVHLFdBQVVBLGlCQUFrQixRQUYvQixFQUdFLE9BSEY7QUFLQSxlQUFPN0osUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ2pCdkIsVUFBQUEsSUFBSSxFQUFFO0FBQUVtSixZQUFBQSxNQUFNLEVBQUUsU0FBVjtBQUFxQjFGLFlBQUFBLEtBQUssRUFBRTRGO0FBQTVCO0FBRFcsU0FBWixDQUFQO0FBR0QsT0FYRCxNQVdPO0FBQ0wsZUFBTyxrQ0FBZSxHQUFFQSxpQkFBa0Isc0JBQW5DLEVBQTBELElBQTFELEVBQWdFLEdBQWhFLEVBQXFFN0osUUFBckUsQ0FBUDtBQUNEO0FBQ0YsS0F6Q0QsQ0F5Q0UsT0FBT2tDLEtBQVAsRUFBYztBQUNkLHVCQUNFLGtDQURGLEVBRUcsbUNBQWtDMkgsaUJBQWtCLFdBQVUzSCxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFGeEY7QUFJQSxhQUFPLGtDQUFjQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9CLEVBQXNDLElBQXRDLEVBQTRDLEdBQTVDLEVBQWlEbEMsUUFBakQsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsUUFBTThLLE1BQU4sQ0FBYWhMLE9BQWIsRUFBNkNDLE9BQTdDLEVBQXFFQyxRQUFyRSxFQUFzRztBQUNwRyxRQUFJO0FBQ0YsWUFBTUMsSUFBSSxHQUFHLE1BQU1ILE9BQU8sQ0FBQ0ksSUFBUixDQUFhQyxhQUFiLENBQTJCQyxNQUEzQixDQUFrQzJELGFBQWxDLENBQWdEQyxNQUFoRCxDQUF1RGpFLE9BQU8sQ0FBQ1MsSUFBL0QsQ0FBbkI7QUFDQSxhQUFPUixRQUFRLENBQUMrQixFQUFULENBQVk7QUFDakJ2QixRQUFBQSxJQUFJLEVBQUVQLElBQUksQ0FBQ087QUFETSxPQUFaLENBQVA7QUFHRCxLQUxELENBS0UsT0FBTzBCLEtBQVAsRUFBYztBQUNkLHVCQUFJLHNCQUFKLEVBQTRCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQTdDO0FBQ0EsYUFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRGxDLFFBQWpELENBQVA7QUFDRDtBQUNGLEdBNXdCMkIsQ0E4d0I1Qjs7O0FBQ0EsUUFBTThMLHNCQUFOLENBQTZCaE0sT0FBN0IsRUFBNkRDLE9BQTdELEVBQXFGQyxRQUFyRixFQUFzSDtBQUNwSCxRQUFHO0FBQ0QsWUFBTUwsTUFBTSxHQUFHLHlDQUFmO0FBQ0EsWUFBTW9NLGlCQUFpQixHQUFJLEdBQUVwTSxNQUFNLENBQUMsYUFBRCxDQUFOLElBQXlCLE9BQVEsSUFBR0EsTUFBTSxDQUFDLDRCQUFELENBQU4sSUFBd0MsWUFBYSxHQUF0SCxDQUZDLENBRXlIOztBQUMxSCxZQUFNcU0sVUFBVSxHQUFHLE1BQU1sTSxPQUFPLENBQUNJLElBQVIsQ0FBYUMsYUFBYixDQUEyQkMsTUFBM0IsQ0FBa0MyRCxhQUFsQyxDQUFnRHdGLE9BQWhELENBQXdEQyxNQUF4RCxDQUErRDtBQUN0RnZGLFFBQUFBLEtBQUssRUFBRThILGlCQUQrRTtBQUV0RkUsUUFBQUEsZ0JBQWdCLEVBQUU7QUFGb0UsT0FBL0QsQ0FBekI7QUFJQSxhQUFPak0sUUFBUSxDQUFDK0IsRUFBVCxDQUFZO0FBQ2pCdkIsUUFBQUEsSUFBSSxFQUFFd0wsVUFBVSxDQUFDeEw7QUFEQSxPQUFaLENBQVA7QUFHRCxLQVZELENBVUMsT0FBTTBCLEtBQU4sRUFBWTtBQUNYLHVCQUFJLHVDQUFKLEVBQTZDQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQTlEO0FBQ0EsYUFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRGxDLFFBQWpELENBQVA7QUFDRDtBQUNGOztBQUVELFFBQU1rTSxnQkFBTixDQUF1QnBNLE9BQXZCLEVBQStCO0FBQzdCLFFBQUk7QUFDRixZQUFNRyxJQUFJLEdBQUcsTUFBTUgsT0FBTyxDQUFDSSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDQyxjQUFsQyxDQUFpRHlELE9BQWpELENBQXlEcUksV0FBekQsQ0FDakI7QUFBQ0MsUUFBQUEsZ0JBQWdCLEVBQUU7QUFBbkIsT0FEaUIsQ0FBbkI7QUFHQSxhQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ25NLElBQUksSUFBSSxFQUFULEVBQWFPLElBQWIsSUFBcUIsRUFBdEIsRUFBMEI2TCxRQUExQixJQUFzQyxFQUF2QyxFQUEyQ0MsS0FBM0MsSUFBb0QsRUFBckQsRUFBeUQzRyxRQUF6RCxJQUFxRSxFQUF0RSxFQUEwRTRHLElBQTFFLEtBQW1GLElBQTFGO0FBQ0QsS0FMRCxDQUtFLE9BQU9ySyxLQUFQLEVBQWM7QUFDZCxhQUFPZ0YsT0FBTyxDQUFDQyxNQUFSLENBQWVqRixLQUFmLENBQVA7QUFDRDtBQUNGOztBQXp5QjJCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIENsYXNzIGZvciBXYXp1aC1FbGFzdGljIGZ1bmN0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmltcG9ydCB7IEVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi9saWIvZXJyb3ItcmVzcG9uc2UnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vbGliL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vbGliL2dldC1jb25maWd1cmF0aW9uJztcbmltcG9ydCB7XG4gIEFnZW50c1Zpc3VhbGl6YXRpb25zLFxuICBPdmVydmlld1Zpc3VhbGl6YXRpb25zLFxuICBDbHVzdGVyVmlzdWFsaXphdGlvbnNcbn0gZnJvbSAnLi4vaW50ZWdyYXRpb24tZmlsZXMvdmlzdWFsaXphdGlvbnMnO1xuXG5pbXBvcnQgeyBnZW5lcmF0ZUFsZXJ0cyB9IGZyb20gJy4uL2xpYi9nZW5lcmF0ZS1hbGVydHMvZ2VuZXJhdGUtYWxlcnRzLXNjcmlwdCc7XG5pbXBvcnQgeyBXQVpVSF9NT05JVE9SSU5HX1BBVFRFUk4sIFdBWlVIX1NBTVBMRV9BTEVSVF9QUkVGSVgsIFdBWlVIX1JPTEVfQURNSU5JU1RSQVRPUl9JRCwgV0FaVUhfU0FNUExFX0FMRVJUU19JTkRFWF9TSEFSRFMsIFdBWlVIX1NBTVBMRV9BTEVSVFNfSU5ERVhfUkVQTElDQVMgfSBmcm9tICcuLi8uLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCBqd3REZWNvZGUgZnJvbSAnand0LWRlY29kZSc7XG5pbXBvcnQgeyBNYW5hZ2VIb3N0cyB9IGZyb20gJy4uL2xpYi9tYW5hZ2UtaG9zdHMnO1xuaW1wb3J0IHsgS2liYW5hUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXJDb250ZXh0LCBLaWJhbmFSZXNwb25zZUZhY3RvcnksIFNhdmVkT2JqZWN0LCBTYXZlZE9iamVjdHNGaW5kUmVzcG9uc2UgfSBmcm9tICdzcmMvY29yZS9zZXJ2ZXInO1xuaW1wb3J0IHsgZ2V0Q29va2llVmFsdWVCeU5hbWUgfSBmcm9tICcuLi9saWIvY29va2llJztcbmltcG9ydCB7IFdBWlVIX1NBTVBMRV9BTEVSVFNfQ0FURUdPUklFU19UWVBFX0FMRVJUUywgV0FaVUhfU0FNUExFX0FMRVJUU19ERUZBVUxUX05VTUJFUl9BTEVSVFMgfSBmcm9tICcuLi8uLi9jb21tb24vY29uc3RhbnRzJ1xuXG5leHBvcnQgY2xhc3MgV2F6dWhFbGFzdGljQ3RybCB7XG4gIHd6U2FtcGxlQWxlcnRzSW5kZXhQcmVmaXg6IHN0cmluZ1xuICBtYW5hZ2VIb3N0czogTWFuYWdlSG9zdHNcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy53elNhbXBsZUFsZXJ0c0luZGV4UHJlZml4ICA9IHRoaXMuZ2V0U2FtcGxlQWxlcnRQcmVmaXgoKTtcbiAgICB0aGlzLm1hbmFnZUhvc3RzID0gbmV3IE1hbmFnZUhvc3RzKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyByZXR1cm5zIHRoZSBpbmRleCBhY2NvcmRpbmcgdGhlIGNhdGVnb3J5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjYXRlZ29yeVxuICAgKi9cbiAgYnVpbGRTYW1wbGVJbmRleEJ5Q2F0ZWdvcnkgKGNhdGVnb3J5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnd6U2FtcGxlQWxlcnRzSW5kZXhQcmVmaXh9c2FtcGxlLSR7Y2F0ZWdvcnl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHJldHVybnMgdGhlIGRlZmluZWQgY29uZmlnIGZvciBzYW1wbGUgYWxlcnRzIHByZWZpeCBvciB0aGUgZGVmYXVsdCB2YWx1ZS5cbiAgICovXG4gIGdldFNhbXBsZUFsZXJ0UHJlZml4KCk6IHN0cmluZyB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgIHJldHVybiAgY29uZmlnWydhbGVydHMuc2FtcGxlLnByZWZpeCddIHx8IFdBWlVIX1NBTVBMRV9BTEVSVF9QUkVGSVg7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyByZXRyaWV2ZXMgYSB0ZW1wbGF0ZSBmcm9tIEVsYXN0aWNzZWFyY2hcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHRlbXBsYXRlIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGdldFRlbXBsYXRlKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdDx7cGF0dGVybjogc3RyaW5nfT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5jYXQudGVtcGxhdGVzKCk7XG5cbiAgICAgIGNvbnN0IHRlbXBsYXRlcyA9IGRhdGEuYm9keTtcbiAgICAgIGlmICghdGVtcGxhdGVzIHx8IHR5cGVvZiB0ZW1wbGF0ZXMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGVuIGZldGNoaW5nIHRlbXBsYXRlcyBmcm9tIEVsYXN0aWNzZWFjaCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGFzdENoYXIgPSByZXF1ZXN0LnBhcmFtcy5wYXR0ZXJuW3JlcXVlc3QucGFyYW1zLnBhdHRlcm4ubGVuZ3RoIC0gMV07XG5cbiAgICAgIC8vIFNwbGl0IGludG8gc2VwYXJhdGUgcGF0dGVybnNcbiAgICAgIGNvbnN0IHRtcGRhdGEgPSB0ZW1wbGF0ZXMubWF0Y2goL1xcWy4qXFxdL2cpO1xuICAgICAgY29uc3QgdG1wYXJyYXkgPSBbXTtcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgdG1wZGF0YSkge1xuICAgICAgICAvLyBBIHRlbXBsYXRlIG1pZ2h0IHVzZSBtb3JlIHRoYW4gb25lIHBhdHRlcm5cbiAgICAgICAgaWYgKGl0ZW0uaW5jbHVkZXMoJywnKSkge1xuICAgICAgICAgIGl0ZW0gPSBpdGVtLnN1YnN0cigxKS5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgY29uc3Qgc3ViSXRlbXMgPSBpdGVtLnNwbGl0KCcsJyk7XG4gICAgICAgICAgZm9yIChjb25zdCBzdWJpdGVtIG9mIHN1Ykl0ZW1zKSB7XG4gICAgICAgICAgICB0bXBhcnJheS5wdXNoKGBbJHtzdWJpdGVtLnRyaW0oKX1dYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRtcGFycmF5LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRW5zdXJlIHdlIGFyZSBoYW5kbGluZyBqdXN0IHBhdHRlcm5zXG4gICAgICBjb25zdCBhcnJheSA9IHRtcGFycmF5LmZpbHRlcihcbiAgICAgICAgaXRlbSA9PiBpdGVtLmluY2x1ZGVzKCdbJykgJiYgaXRlbS5pbmNsdWRlcygnXScpXG4gICAgICApO1xuXG4gICAgICBjb25zdCBwYXR0ZXJuID1cbiAgICAgICAgbGFzdENoYXIgPT09ICcqJyA/IHJlcXVlc3QucGFyYW1zLnBhdHRlcm4uc2xpY2UoMCwgLTEpIDogcmVxdWVzdC5wYXJhbXMucGF0dGVybjtcbiAgICAgIGNvbnN0IGlzSW5jbHVkZWQgPSBhcnJheS5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnNsaWNlKDEsIC0xKTtcbiAgICAgICAgY29uc3QgbGFzdENoYXIgPSBpdGVtW2l0ZW0ubGVuZ3RoIC0gMV07XG4gICAgICAgIGl0ZW0gPSBsYXN0Q2hhciA9PT0gJyonID8gaXRlbS5zbGljZSgwLCAtMSkgOiBpdGVtO1xuICAgICAgICByZXR1cm4gaXRlbS5pbmNsdWRlcyhwYXR0ZXJuKSB8fCBwYXR0ZXJuLmluY2x1ZGVzKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgICBsb2coXG4gICAgICAgICd3YXp1aC1lbGFzdGljOmdldFRlbXBsYXRlJyxcbiAgICAgICAgYFRlbXBsYXRlIGlzIHZhbGlkOiAke1xuICAgICAgICBpc0luY2x1ZGVkICYmIEFycmF5LmlzQXJyYXkoaXNJbmNsdWRlZCkgJiYgaXNJbmNsdWRlZC5sZW5ndGhcbiAgICAgICAgICA/ICd5ZXMnXG4gICAgICAgICAgOiAnbm8nXG4gICAgICAgIH1gLFxuICAgICAgICAnZGVidWcnXG4gICAgICApO1xuICAgICAgcmV0dXJuIGlzSW5jbHVkZWQgJiYgQXJyYXkuaXNBcnJheShpc0luY2x1ZGVkKSAmJiBpc0luY2x1ZGVkLmxlbmd0aFxuICAgICAgICA/IHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgICAgICBzdGF0dXM6IHRydWUsXG4gICAgICAgICAgICAgIGRhdGE6IGBUZW1wbGF0ZSBmb3VuZCBmb3IgJHtyZXF1ZXN0LnBhcmFtcy5wYXR0ZXJufWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICA6IHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgICAgICBzdGF0dXM6IGZhbHNlLFxuICAgICAgICAgICAgICBkYXRhOiBgTm8gdGVtcGxhdGUgZm91bmQgZm9yICR7cmVxdWVzdC5wYXJhbXMucGF0dGVybn1gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtZWxhc3RpYzpnZXRUZW1wbGF0ZScsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgIGBDb3VsZCBub3QgcmV0cmlldmUgdGVtcGxhdGVzIGZyb20gRWxhc3RpY3NlYXJjaCBkdWUgdG8gJHtlcnJvci5tZXNzYWdlIHx8XG4gICAgICAgIGVycm9yfWAsXG4gICAgICAgIDQwMDIsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2hlY2sgaW5kZXgtcGF0dGVyblxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gc3RhdHVzIG9iaiBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjaGVja1BhdHRlcm4oY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0PHtwYXR0ZXJuOiBzdHJpbmd9PiwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgY29udGV4dC5jb3JlLnNhdmVkT2JqZWN0cy5jbGllbnQuZmluZDxTYXZlZE9iamVjdHNGaW5kUmVzcG9uc2U8U2F2ZWRPYmplY3Q+Pih7dHlwZTogJ2luZGV4LXBhdHRlcm4nfSk7XG5cbiAgICAgIGNvbnN0IGV4aXN0c0luZGV4UGF0dGVybiA9IGRhdGEuc2F2ZWRfb2JqZWN0cy5maW5kKFxuICAgICAgICBpdGVtID0+IGl0ZW0uYXR0cmlidXRlcy50aXRsZSA9PT0gcmVxdWVzdC5wYXJhbXMucGF0dGVyblxuICAgICAgKTtcbiAgICAgIGxvZyhcbiAgICAgICAgJ3dhenVoLWVsYXN0aWM6Y2hlY2tQYXR0ZXJuJyxcbiAgICAgICAgYEluZGV4IHBhdHRlcm4gZm91bmQ6ICR7ZXhpc3RzSW5kZXhQYXR0ZXJuID8gZXhpc3RzSW5kZXhQYXR0ZXJuLmF0dHJpYnV0ZXMudGl0bGUgOiAnbm8nfWAsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICByZXR1cm4gZXhpc3RzSW5kZXhQYXR0ZXJuXG4gICAgICAgID8gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHsgc3RhdHVzQ29kZTogMjAwLCBzdGF0dXM6IHRydWUsIGRhdGE6ICdJbmRleCBwYXR0ZXJuIGZvdW5kJyB9XG4gICAgICAgIH0pXG4gICAgICAgIDogcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgIHN0YXR1czogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogMTAwMjAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5kZXggcGF0dGVybiBub3QgZm91bmQnXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1lbGFzdGljOmNoZWNrUGF0dGVybicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgIGBTb21ldGhpbmcgd2VudCB3cm9uZyByZXRyaWV2aW5nIGluZGV4LXBhdHRlcm5zIGZyb20gRWxhc3RpY3NlYXJjaCBkdWUgdG8gJHtlcnJvci5tZXNzYWdlIHx8XG4gICAgICAgIGVycm9yfWAsXG4gICAgICAgIDQwMDMsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZ2V0IHRoZSBmaWVsZHMga2V5c1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge0FycmF5PE9iamVjdD59IGZpZWxkcyBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBnZXRGaWVsZFRvcChjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3Q8e21vZGU6IHN0cmluZywgY2x1c3Rlcjogc3RyaW5nLCBmaWVsZDogc3RyaW5nLCBwYXR0ZXJuOiBzdHJpbmd9PiwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICAvLyBUb3AgZmllbGQgcGF5bG9hZFxuICAgICAgbGV0IHBheWxvYWQgPSB7XG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgYm9vbDoge1xuICAgICAgICAgICAgbXVzdDogW10sXG4gICAgICAgICAgICBtdXN0X25vdDoge1xuICAgICAgICAgICAgICB0ZXJtOiB7XG4gICAgICAgICAgICAgICAgJ2FnZW50LmlkJzogJzAwMCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogeyByYW5nZTogeyB0aW1lc3RhbXA6IHt9IH0gfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYWdnczoge1xuICAgICAgICAgICcyJzoge1xuICAgICAgICAgICAgdGVybXM6IHtcbiAgICAgICAgICAgICAgZmllbGQ6ICcnLFxuICAgICAgICAgICAgICBzaXplOiAxLFxuICAgICAgICAgICAgICBvcmRlcjogeyBfY291bnQ6ICdkZXNjJyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXQgdXAgdGltZSBpbnRlcnZhbCwgZGVmYXVsdCB0byBMYXN0IDI0aFxuICAgICAgY29uc3QgdGltZUdURSA9ICdub3ctMWQnO1xuICAgICAgY29uc3QgdGltZUxUID0gJ25vdyc7XG4gICAgICBwYXlsb2FkLnF1ZXJ5LmJvb2wuZmlsdGVyLnJhbmdlWyd0aW1lc3RhbXAnXVsnZ3RlJ10gPSB0aW1lR1RFO1xuICAgICAgcGF5bG9hZC5xdWVyeS5ib29sLmZpbHRlci5yYW5nZVsndGltZXN0YW1wJ11bJ2x0J10gPSB0aW1lTFQ7XG5cbiAgICAgIC8vIFNldCB1cCBtYXRjaCBmb3IgZGVmYXVsdCBjbHVzdGVyIG5hbWVcbiAgICAgIHBheWxvYWQucXVlcnkuYm9vbC5tdXN0LnB1c2goXG4gICAgICAgIHJlcXVlc3QucGFyYW1zLm1vZGUgPT09ICdjbHVzdGVyJ1xuICAgICAgICAgID8geyBtYXRjaDogeyAnY2x1c3Rlci5uYW1lJzogcmVxdWVzdC5wYXJhbXMuY2x1c3RlciB9IH1cbiAgICAgICAgICA6IHsgbWF0Y2g6IHsgJ21hbmFnZXIubmFtZSc6IHJlcXVlc3QucGFyYW1zLmNsdXN0ZXIgfSB9XG4gICAgICApO1xuXG4gICAgICBwYXlsb2FkLmFnZ3NbJzInXS50ZXJtcy5maWVsZCA9IHJlcXVlc3QucGFyYW1zLmZpZWxkO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzQ3VycmVudFVzZXIuc2VhcmNoKHtcbiAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgaW5kZXg6IHJlcXVlc3QucGFyYW1zLnBhdHRlcm4sXG4gICAgICAgIGJvZHk6IHBheWxvYWRcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGF0YS5ib2R5LmhpdHMudG90YWwudmFsdWUgPT09IDAgfHxcbiAgICAgICAgdHlwZW9mIGRhdGEuYm9keS5hZ2dyZWdhdGlvbnNbJzInXS5idWNrZXRzWzBdID09PSAndW5kZWZpbmVkJ1xuICAgICAgICAgID8gcmVzcG9uc2Uub2soe1xuICAgICAgICAgICAgICBib2R5OiB7IHN0YXR1c0NvZGU6IDIwMCwgZGF0YTogJycgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLmJvZHkuYWdncmVnYXRpb25zWycyJ10uYnVja2V0c1swXS5rZXlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtZWxhc3RpYzpnZXRGaWVsZFRvcCcsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgNDAwNCwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvbmUgYnkgb25lIGlmIHRoZSByZXF1ZXN0aW5nIHVzZXIgaGFzIGVub3VnaCBwcml2aWxlZ2VzIHRvIHVzZVxuICAgKiBhbiBpbmRleCBwYXR0ZXJuIGZyb20gdGhlIGxpc3QuXG4gICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gbGlzdCBMaXN0IG9mIGluZGV4IHBhdHRlcm5zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXFcbiAgICogQHJldHVybnMge0FycmF5PE9iamVjdD59IExpc3Qgb2YgYWxsb3dlZCBpbmRleFxuICAgKi9cbiAgYXN5bmMgZmlsdGVyQWxsb3dlZEluZGV4UGF0dGVybkxpc3QoY29udGV4dCwgbGlzdCwgcmVxKSB7XG4gICAgLy9UT0RPOiByZXZpZXcgaWYgbmVjZXNhcnkgdG8gZGVsZXRlXG4gICAgbGV0IGZpbmFsTGlzdCA9IFtdO1xuICAgIGZvciAobGV0IGl0ZW0gb2YgbGlzdCkge1xuICAgICAgbGV0IHJlc3VsdHMgPSBmYWxzZSxcbiAgICAgICAgZm9yYmlkZGVuID0gZmFsc2U7XG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHRzID0gYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzQ3VycmVudFVzZXIuc2VhcmNoKHtcbiAgICAgICAgICBpbmRleDogaXRlbS50aXRsZVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGZvcmJpZGRlbiA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgICgoKHJlc3VsdHMgfHwge30pLmJvZHkgfHwge30pLmhpdHMgfHwge30pLnRvdGFsLnZhbHVlID49IDEgfHxcbiAgICAgICAgKCFmb3JiaWRkZW4gJiYgKCgocmVzdWx0cyB8fCB7fSkuYm9keSB8fCB7fSkuaGl0cyB8fCB7fSkudG90YWwgPT09IDApXG4gICAgICApIHtcbiAgICAgICAgZmluYWxMaXN0LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaW5hbExpc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGZvciBtaW5pbXVtIGluZGV4IHBhdHRlcm4gZmllbGRzIGluIGEgbGlzdCBvZiBpbmRleCBwYXR0ZXJucy5cbiAgICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBpbmRleFBhdHRlcm5MaXN0IExpc3Qgb2YgaW5kZXggcGF0dGVybnNcbiAgICovXG4gIHZhbGlkYXRlSW5kZXhQYXR0ZXJuKGluZGV4UGF0dGVybkxpc3QpIHtcbiAgICBjb25zdCBtaW5pbXVtID0gWyd0aW1lc3RhbXAnLCAncnVsZS5ncm91cHMnLCAnbWFuYWdlci5uYW1lJywgJ2FnZW50LmlkJ107XG4gICAgbGV0IGxpc3QgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4UGF0dGVybkxpc3QpIHtcbiAgICAgIGxldCB2YWxpZCwgcGFyc2VkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShpbmRleC5hdHRyaWJ1dGVzLmZpZWxkcyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFsaWQgPSBwYXJzZWQuZmlsdGVyKGl0ZW0gPT4gbWluaW11bS5pbmNsdWRlcyhpdGVtLm5hbWUpKTtcbiAgICAgIGlmICh2YWxpZC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgbGlzdC5wdXNoKHtcbiAgICAgICAgICBpZDogaW5kZXguaWQsXG4gICAgICAgICAgdGl0bGU6IGluZGV4LmF0dHJpYnV0ZXMudGl0bGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgY3VycmVudCBzZWN1cml0eSBwbGF0Zm9ybVxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXBseVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgKi9cbiAgYXN5bmMgZ2V0Q3VycmVudFBsYXRmb3JtKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdDx7dXNlcjogc3RyaW5nfT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHBsYXRmb3JtOiBjb250ZXh0LndhenVoLnNlY3VyaXR5LnBsYXRmb3JtXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3dhenVoLWVsYXN0aWM6Z2V0Q3VycmVudFBsYXRmb3JtJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA0MDExLCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdmlzdWFsaXphdGlvbnMgbWFpbiBmaWVsZHMgdG8gZml0IGEgY2VydGFpbiBwYXR0ZXJuLlxuICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGFwcF9vYmplY3RzIE9iamVjdCBjb250YWluaW5nIHJhdyB2aXN1YWxpemF0aW9ucy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIEluZGV4LXBhdHRlcm4gaWQgdG8gdXNlIGluIHRoZSB2aXN1YWxpemF0aW9ucy4gRWc6ICd3YXp1aC1hbGVydHMnXG4gICAqL1xuICBhc3luYyBidWlsZFZpc3VhbGl6YXRpb25zUmF3KGFwcF9vYmplY3RzLCBpZCwgbmFtZXNwYWNlID0gZmFsc2UpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgICAgbGV0IG1vbml0b3JpbmdQYXR0ZXJuID1cbiAgICAgICAgKGNvbmZpZyB8fCB7fSlbJ3dhenVoLm1vbml0b3JpbmcucGF0dGVybiddIHx8IFdBWlVIX01PTklUT1JJTkdfUEFUVEVSTjtcbiAgICAgIGxvZyhcbiAgICAgICAgJ3dhenVoLWVsYXN0aWM6YnVpbGRWaXN1YWxpemF0aW9uc1JhdycsXG4gICAgICAgIGBCdWlsZGluZyAke2FwcF9vYmplY3RzLmxlbmd0aH0gdmlzdWFsaXphdGlvbnNgLFxuICAgICAgICAnZGVidWcnXG4gICAgICApO1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpidWlsZFZpc3VhbGl6YXRpb25zUmF3JyxcbiAgICAgICAgYEluZGV4IHBhdHRlcm4gSUQ6ICR7aWR9YCxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICAgIGNvbnN0IHZpc0FycmF5ID0gW107XG4gICAgICBsZXQgYXV4X3NvdXJjZSwgYnVsa19jb250ZW50O1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBhcHBfb2JqZWN0cykge1xuICAgICAgICBhdXhfc291cmNlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlbGVtZW50Ll9zb3VyY2UpKTtcblxuICAgICAgICAvLyBSZXBsYWNlIGluZGV4LXBhdHRlcm4gZm9yIHZpc3VhbGl6YXRpb25zXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhdXhfc291cmNlICYmXG4gICAgICAgICAgYXV4X3NvdXJjZS5raWJhbmFTYXZlZE9iamVjdE1ldGEgJiZcbiAgICAgICAgICBhdXhfc291cmNlLmtpYmFuYVNhdmVkT2JqZWN0TWV0YS5zZWFyY2hTb3VyY2VKU09OICYmXG4gICAgICAgICAgdHlwZW9mIGF1eF9zb3VyY2Uua2liYW5hU2F2ZWRPYmplY3RNZXRhLnNlYXJjaFNvdXJjZUpTT04gPT09ICdzdHJpbmcnXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRTdHIgPSBhdXhfc291cmNlLmtpYmFuYVNhdmVkT2JqZWN0TWV0YS5zZWFyY2hTb3VyY2VKU09OO1xuXG4gICAgICAgICAgY29uc3QgaXNNb25pdG9yaW5nID0gZGVmYXVsdFN0ci5pbmNsdWRlcygnd2F6dWgtbW9uaXRvcmluZycpO1xuICAgICAgICAgIGlmIChpc01vbml0b3JpbmcpIHtcbiAgICAgICAgICAgIGlmIChuYW1lc3BhY2UgJiYgbmFtZXNwYWNlICE9PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIG1vbml0b3JpbmdQYXR0ZXJuLmluY2x1ZGVzKG5hbWVzcGFjZSkgJiZcbiAgICAgICAgICAgICAgICBtb25pdG9yaW5nUGF0dGVybi5pbmNsdWRlcygnaW5kZXgtcGF0dGVybjonKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBtb25pdG9yaW5nUGF0dGVybiA9IG1vbml0b3JpbmdQYXR0ZXJuLnNwbGl0KFxuICAgICAgICAgICAgICAgICAgJ2luZGV4LXBhdHRlcm46J1xuICAgICAgICAgICAgICAgIClbMV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF1eF9zb3VyY2Uua2liYW5hU2F2ZWRPYmplY3RNZXRhLnNlYXJjaFNvdXJjZUpTT04gPSBkZWZhdWx0U3RyLnJlcGxhY2UoXG4gICAgICAgICAgICAgIC93YXp1aC1tb25pdG9yaW5nL2csXG4gICAgICAgICAgICAgIG1vbml0b3JpbmdQYXR0ZXJuW21vbml0b3JpbmdQYXR0ZXJuLmxlbmd0aCAtIDFdID09PSAnKicgfHxcbiAgICAgICAgICAgICAgICAobmFtZXNwYWNlICYmIG5hbWVzcGFjZSAhPT0gJ2RlZmF1bHQnKVxuICAgICAgICAgICAgICAgID8gbW9uaXRvcmluZ1BhdHRlcm5cbiAgICAgICAgICAgICAgICA6IG1vbml0b3JpbmdQYXR0ZXJuICsgJyonXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdXhfc291cmNlLmtpYmFuYVNhdmVkT2JqZWN0TWV0YS5zZWFyY2hTb3VyY2VKU09OID0gZGVmYXVsdFN0ci5yZXBsYWNlKFxuICAgICAgICAgICAgICAvd2F6dWgtYWxlcnRzL2csXG4gICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlcGxhY2UgaW5kZXgtcGF0dGVybiBmb3Igc2VsZWN0b3IgdmlzdWFsaXphdGlvbnNcbiAgICAgICAgaWYgKHR5cGVvZiAoYXV4X3NvdXJjZSB8fCB7fSkudmlzU3RhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYXV4X3NvdXJjZS52aXNTdGF0ZSA9IGF1eF9zb3VyY2UudmlzU3RhdGUucmVwbGFjZShcbiAgICAgICAgICAgIC93YXp1aC1hbGVydHMvZyxcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1bGsgc291cmNlXG4gICAgICAgIGJ1bGtfY29udGVudCA9IHt9O1xuICAgICAgICBidWxrX2NvbnRlbnRbZWxlbWVudC5fdHlwZV0gPSBhdXhfc291cmNlO1xuXG4gICAgICAgIHZpc0FycmF5LnB1c2goe1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IGJ1bGtfY29udGVudC52aXN1YWxpemF0aW9uLFxuICAgICAgICAgIHR5cGU6IGVsZW1lbnQuX3R5cGUsXG4gICAgICAgICAgaWQ6IGVsZW1lbnQuX2lkLFxuICAgICAgICAgIF92ZXJzaW9uOiBidWxrX2NvbnRlbnQudmlzdWFsaXphdGlvbi52ZXJzaW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZpc0FycmF5O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3dhenVoLWVsYXN0aWM6YnVpbGRWaXN1YWxpemF0aW9uc1JhdycsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgY2x1c3RlciB2aXN1YWxpemF0aW9ucyBtYWluIGZpZWxkcy5cbiAgICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBhcHBfb2JqZWN0cyBPYmplY3QgY29udGFpbmluZyByYXcgdmlzdWFsaXphdGlvbnMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBJbmRleC1wYXR0ZXJuIGlkIHRvIHVzZSBpbiB0aGUgdmlzdWFsaXphdGlvbnMuIEVnOiAnd2F6dWgtYWxlcnRzJ1xuICAgKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IG5vZGVzIEFycmF5IG9mIG5vZGUgbmFtZXMuIEVnOiBbJ25vZGUwMScsICdub2RlMDInXVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBDbHVzdGVyIG5hbWUuIEVnOiAnd2F6dWgnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtYXN0ZXJfbm9kZSBNYXN0ZXIgbm9kZSBuYW1lLiBFZzogJ25vZGUwMSdcbiAgICovXG4gIGJ1aWxkQ2x1c3RlclZpc3VhbGl6YXRpb25zUmF3KFxuICAgIGFwcF9vYmplY3RzLFxuICAgIGlkLFxuICAgIG5vZGVzID0gW10sXG4gICAgbmFtZSxcbiAgICBtYXN0ZXJfbm9kZSxcbiAgICBwYXR0ZXJuX25hbWUgPSAnKidcbiAgKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZpc0FycmF5ID0gW107XG4gICAgICBsZXQgYXV4X3NvdXJjZSwgYnVsa19jb250ZW50O1xuXG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgYXBwX29iamVjdHMpIHtcbiAgICAgICAgLy8gU3RyaW5naWZ5IGFuZCByZXBsYWNlIGluZGV4LXBhdHRlcm4gZm9yIHZpc3VhbGl6YXRpb25zXG4gICAgICAgIGF1eF9zb3VyY2UgPSBKU09OLnN0cmluZ2lmeShlbGVtZW50Ll9zb3VyY2UpO1xuICAgICAgICBhdXhfc291cmNlID0gYXV4X3NvdXJjZS5yZXBsYWNlKC93YXp1aC1hbGVydHMvZywgaWQpO1xuICAgICAgICBhdXhfc291cmNlID0gSlNPTi5wYXJzZShhdXhfc291cmNlKTtcblxuICAgICAgICAvLyBCdWxrIHNvdXJjZVxuICAgICAgICBidWxrX2NvbnRlbnQgPSB7fTtcbiAgICAgICAgYnVsa19jb250ZW50W2VsZW1lbnQuX3R5cGVdID0gYXV4X3NvdXJjZTtcblxuICAgICAgICBjb25zdCB2aXNTdGF0ZSA9IEpTT04ucGFyc2UoYnVsa19jb250ZW50LnZpc3VhbGl6YXRpb24udmlzU3RhdGUpO1xuICAgICAgICBjb25zdCB0aXRsZSA9IHZpc1N0YXRlLnRpdGxlO1xuXG4gICAgICAgIGlmICh2aXNTdGF0ZS50eXBlICYmIHZpc1N0YXRlLnR5cGUgPT09ICd0aW1lbGlvbicpIHtcbiAgICAgICAgICBsZXQgcXVlcnkgPSAnJztcbiAgICAgICAgICBpZiAodGl0bGUgPT09ICdXYXp1aCBBcHAgQ2x1c3RlciBPdmVydmlldycpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICAgICAgICBxdWVyeSArPSBgLmVzKGluZGV4PSR7cGF0dGVybl9uYW1lfSxxPVwiY2x1c3Rlci5uYW1lOiAke25hbWV9IEFORCBjbHVzdGVyLm5vZGU6ICR7bm9kZS5uYW1lfVwiKS5sYWJlbChcIiR7bm9kZS5uYW1lfVwiKSxgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVlcnkgPSBxdWVyeS5zdWJzdHJpbmcoMCwgcXVlcnkubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aXRsZSA9PT0gJ1dhenVoIEFwcCBDbHVzdGVyIE92ZXJ2aWV3IE1hbmFnZXInKSB7XG4gICAgICAgICAgICBxdWVyeSArPSBgLmVzKGluZGV4PSR7cGF0dGVybl9uYW1lfSxxPVwiY2x1c3Rlci5uYW1lOiAke25hbWV9XCIpLmxhYmVsKFwiJHtuYW1lfSBjbHVzdGVyXCIpYDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRpdGxlLnN0YXJ0c1dpdGgoJ1dhenVoIEFwcCBTdGF0aXN0aWNzJykpIHtcbiAgICAgICAgICAgICAgY29uc3QgeyBzZWFyY2hTb3VyY2VKU09OIH0gPSBidWxrX2NvbnRlbnQudmlzdWFsaXphdGlvbi5raWJhbmFTYXZlZE9iamVjdE1ldGE7XG4gICAgICAgICAgICAgIGJ1bGtfY29udGVudC52aXN1YWxpemF0aW9uLmtpYmFuYVNhdmVkT2JqZWN0TWV0YS5zZWFyY2hTb3VyY2VKU09OID0gc2VhcmNoU291cmNlSlNPTi5yZXBsYWNlKCd3YXp1aC1zdGF0aXN0aWNzLSonLCBwYXR0ZXJuX25hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRpdGxlLnN0YXJ0c1dpdGgoJ1dhenVoIEFwcCBTdGF0aXN0aWNzJykgJiYgbmFtZSAhPT0gJy0nICYmIG5hbWUgIT09ICdhbGwnICYmIHZpc1N0YXRlLnBhcmFtcy5leHByZXNzaW9uLmluY2x1ZGVzKCdxPScpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25SZWdleCA9IC9xPSdcXConL2dpXG4gICAgICAgICAgICAgIHF1ZXJ5ICs9IHZpc1N0YXRlLnBhcmFtcy5leHByZXNzaW9uLnJlcGxhY2UoZXhwcmVzc2lvblJlZ2V4LCBgcT1cIm5vZGVOYW1lOiR7bmFtZX0gQU5EIGFwaU5hbWU9JHttYXN0ZXJfbm9kZX1cImApXG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGl0bGUuc3RhcnRzV2l0aCgnV2F6dWggQXBwIFN0YXRpc3RpY3MnKSkge1xuICAgICAgICAgICAgICBjb25zdCBleHByZXNzaW9uUmVnZXggPSAvcT0nXFwqJy9naVxuICAgICAgICAgICAgICBxdWVyeSArPSB2aXNTdGF0ZS5wYXJhbXMuZXhwcmVzc2lvbi5yZXBsYWNlKGV4cHJlc3Npb25SZWdleCwgYHE9XCJhcGlOYW1lPSR7bWFzdGVyX25vZGV9XCJgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcXVlcnkgPSB2aXNTdGF0ZS5wYXJhbXMuZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2aXNTdGF0ZS5wYXJhbXMuZXhwcmVzc2lvbiA9IHF1ZXJ5LnJlcGxhY2UoLycvZywgXCJcXFwiXCIpO1xuICAgICAgICAgIGJ1bGtfY29udGVudC52aXN1YWxpemF0aW9uLnZpc1N0YXRlID0gSlNPTi5zdHJpbmdpZnkodmlzU3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmlzQXJyYXkucHVzaCh7XG4gICAgICAgICAgYXR0cmlidXRlczogYnVsa19jb250ZW50LnZpc3VhbGl6YXRpb24sXG4gICAgICAgICAgdHlwZTogZWxlbWVudC5fdHlwZSxcbiAgICAgICAgICBpZDogZWxlbWVudC5faWQsXG4gICAgICAgICAgX3ZlcnNpb246IGJ1bGtfY29udGVudC52aXN1YWxpemF0aW9uLnZlcnNpb25cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2aXNBcnJheTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpidWlsZENsdXN0ZXJWaXN1YWxpemF0aW9uc1JhdycsXG4gICAgICAgIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3JcbiAgICAgICk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNyZWF0ZXMgYSB2aXN1YWxpemF0aW9uIG9mIGRhdGEgaW4gcmVxXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSB2aXMgb2JqIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGNyZWF0ZVZpcyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3Q8e3BhdHRlcm46IHN0cmluZywgdGFiOiBzdHJpbmcgfT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKFxuICAgICAgICAoIXJlcXVlc3QucGFyYW1zLnRhYi5pbmNsdWRlcygnb3ZlcnZpZXctJykgJiZcbiAgICAgICAgICAhcmVxdWVzdC5wYXJhbXMudGFiLmluY2x1ZGVzKCdhZ2VudHMtJykpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHBhcmFtZXRlcnMgY3JlYXRpbmcgdmlzdWFsaXphdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFiUHJlZml4ID0gcmVxdWVzdC5wYXJhbXMudGFiLmluY2x1ZGVzKCdvdmVydmlldycpXG4gICAgICAgID8gJ292ZXJ2aWV3J1xuICAgICAgICA6ICdhZ2VudHMnO1xuXG4gICAgICBjb25zdCB0YWJTcGxpdCA9IHJlcXVlc3QucGFyYW1zLnRhYi5zcGxpdCgnLScpO1xuICAgICAgY29uc3QgdGFiU3VmaXggPSB0YWJTcGxpdFsxXTtcblxuICAgICAgY29uc3QgZmlsZSA9XG4gICAgICAgIHRhYlByZWZpeCA9PT0gJ292ZXJ2aWV3J1xuICAgICAgICAgID8gT3ZlcnZpZXdWaXN1YWxpemF0aW9uc1t0YWJTdWZpeF1cbiAgICAgICAgICA6IEFnZW50c1Zpc3VhbGl6YXRpb25zW3RhYlN1Zml4XTtcbiAgICAgIGxvZygnd2F6dWgtZWxhc3RpYzpjcmVhdGVWaXMnLCBgJHt0YWJQcmVmaXh9WyR7dGFiU3VmaXh9XSB3aXRoIGluZGV4IHBhdHRlcm4gJHtyZXF1ZXN0LnBhcmFtcy5wYXR0ZXJufWAsICdkZWJ1ZycpO1xuICAgICAgY29uc3QgbmFtZXNwYWNlID0gY29udGV4dC53YXp1aC5wbHVnaW5zLnNwYWNlcyAmJiBjb250ZXh0LndhenVoLnBsdWdpbnMuc3BhY2VzLnNwYWNlc1NlcnZpY2UgJiYgY29udGV4dC53YXp1aC5wbHVnaW5zLnNwYWNlcy5zcGFjZXNTZXJ2aWNlLmdldFNwYWNlSWQocmVxdWVzdCk7XG4gICAgICBjb25zdCByYXcgPSBhd2FpdCB0aGlzLmJ1aWxkVmlzdWFsaXphdGlvbnNSYXcoXG4gICAgICAgIGZpbGUsXG4gICAgICAgIHJlcXVlc3QucGFyYW1zLnBhdHRlcm4sXG4gICAgICAgIG5hbWVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHsgYWNrbm93bGVkZ2U6IHRydWUsIHJhdzogcmF3IH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3dhenVoLWVsYXN0aWM6Y3JlYXRlVmlzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA0MDA3LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjcmVhdGVzIGEgdmlzdWFsaXphdGlvbiBvZiBjbHVzdGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSB2aXMgb2JqIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUNsdXN0ZXJWaXMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0PHtwYXR0ZXJuOiBzdHJpbmcsIHRhYjogc3RyaW5nIH0sIHVua25vd24sIGFueT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKFxuICAgICAgICAhcmVxdWVzdC5wYXJhbXMucGF0dGVybiB8fFxuICAgICAgICAhcmVxdWVzdC5wYXJhbXMudGFiIHx8XG4gICAgICAgICFyZXF1ZXN0LmJvZHkgfHxcbiAgICAgICAgIXJlcXVlc3QuYm9keS5ub2RlcyB8fFxuICAgICAgICAhcmVxdWVzdC5ib2R5Lm5vZGVzLmFmZmVjdGVkX2l0ZW1zIHx8XG4gICAgICAgICFyZXF1ZXN0LmJvZHkubm9kZXMubmFtZSB8fFxuICAgICAgICAocmVxdWVzdC5wYXJhbXMudGFiICYmICFyZXF1ZXN0LnBhcmFtcy50YWIuaW5jbHVkZXMoJ2NsdXN0ZXItJykpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHBhcmFtZXRlcnMgY3JlYXRpbmcgdmlzdWFsaXphdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdHlwZSA9IHJlcXVlc3QucGFyYW1zLnRhYi5zcGxpdCgnLScpWzFdO1xuXG4gICAgICBjb25zdCBmaWxlID0gQ2x1c3RlclZpc3VhbGl6YXRpb25zW3R5cGVdO1xuICAgICAgY29uc3Qgbm9kZXMgPSByZXF1ZXN0LmJvZHkubm9kZXMuYWZmZWN0ZWRfaXRlbXM7XG4gICAgICBjb25zdCBuYW1lID0gcmVxdWVzdC5ib2R5Lm5vZGVzLm5hbWU7XG4gICAgICBjb25zdCBtYXN0ZXJOb2RlID0gcmVxdWVzdC5ib2R5Lm5vZGVzLm1hc3Rlcl9ub2RlO1xuXG4gICAgICBjb25zdCB7aWQ6IHBhdHRlcm5JRCwgdGl0bGU6IHBhdHRlcm5OYW1lfSA9IHJlcXVlc3QuYm9keS5wYXR0ZXJuO1xuICAgICAgXG4gICAgICBjb25zdCByYXcgPSBhd2FpdCB0aGlzLmJ1aWxkQ2x1c3RlclZpc3VhbGl6YXRpb25zUmF3KFxuICAgICAgICBmaWxlLFxuICAgICAgICBwYXR0ZXJuSUQsXG4gICAgICAgIG5vZGVzLFxuICAgICAgICBuYW1lLFxuICAgICAgICBtYXN0ZXJOb2RlLFxuICAgICAgICBwYXR0ZXJuTmFtZVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keTogeyBhY2tub3dsZWRnZTogdHJ1ZSwgcmF3OiByYXcgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtZWxhc3RpYzpjcmVhdGVDbHVzdGVyVmlzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCA0MDA5LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjaGVja3MgaWYgdGhlcmUgaXMgc2FtcGxlIGFsZXJ0c1xuICAgKiBHRVQgL2VsYXN0aWMvc2FtcGxlYWxlcnRzXG4gICAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICAgKiBAcGFyYW0geyp9IHJlcXVlc3RcbiAgICogQHBhcmFtIHsqfSByZXNwb25zZVxuICAgKiB7YWxlcnRzOiBbLi4uXX0gb3IgRXJyb3JSZXNwb25zZVxuICAgKi9cbiAgYXN5bmMgaGF2ZVNhbXBsZUFsZXJ0cyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgaWYgd2F6dWggc2FtcGxlIGFsZXJ0cyBpbmRleCBleGlzdHNcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChPYmplY3Qua2V5cyhXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JJRVNfVFlQRV9BTEVSVFMpXG4gICAgICAgIC5tYXAoKGNhdGVnb3J5KSA9PiBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgICAgaW5kZXg6IHRoaXMuYnVpbGRTYW1wbGVJbmRleEJ5Q2F0ZWdvcnkoY2F0ZWdvcnkpXG4gICAgICAgIH0pKSk7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBib2R5OiB7IHNhbXBsZUFsZXJ0c0luc3RhbGxlZDogcmVzdWx0cy5zb21lKHJlc3VsdCA9PiByZXN1bHQuYm9keSkgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKCdTYW1wbGUgQWxlcnRzIGNhdGVnb3J5IG5vdCB2YWxpZCcsIDEwMDAsIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogVGhpcyBjcmVhdGVzIHNhbXBsZSBhbGVydHMgaW4gd2F6dWgtc2FtcGxlLWFsZXJ0c1xuICAgKiBHRVQgL2VsYXN0aWMvc2FtcGxlYWxlcnRzL3tjYXRlZ29yeX1cbiAgICogQHBhcmFtIHsqfSBjb250ZXh0XG4gICAqIEBwYXJhbSB7Kn0gcmVxdWVzdFxuICAgKiBAcGFyYW0geyp9IHJlc3BvbnNlXG4gICAqIHthbGVydHM6IFsuLi5dfSBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBoYXZlU2FtcGxlQWxlcnRzT2ZDYXRlZ29yeShjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3Q8e2NhdGVnb3J5OiBzdHJpbmcgfT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2FtcGxlQWxlcnRzSW5kZXggPSB0aGlzLmJ1aWxkU2FtcGxlSW5kZXhCeUNhdGVnb3J5KHJlcXVlc3QucGFyYW1zLmNhdGVnb3J5KTtcbiAgICAgIC8vIENoZWNrIGlmIHdhenVoIHNhbXBsZSBhbGVydHMgaW5kZXggZXhpc3RzXG4gICAgICBjb25zdCBleGlzdHNTYW1wbGVJbmRleCA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0N1cnJlbnRVc2VyLmluZGljZXMuZXhpc3RzKHtcbiAgICAgICAgaW5kZXg6IHNhbXBsZUFsZXJ0c0luZGV4XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHsgaW5kZXg6IHNhbXBsZUFsZXJ0c0luZGV4LCBleGlzdHM6IGV4aXN0c1NhbXBsZUluZGV4LmJvZHkgfVxuICAgICAgfSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpoYXZlU2FtcGxlQWxlcnRzT2ZDYXRlZ29yeScsXG4gICAgICAgIGBFcnJvciBjaGVja2luZyBpZiB0aGVyZSBhcmUgc2FtcGxlIGFsZXJ0cyBpbmRpY2VzOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGBFcnJvciBjaGVja2luZyBpZiB0aGVyZSBhcmUgc2FtcGxlIGFsZXJ0cyBpbmRpY2VzOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCwgMTAwMCwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIGNyZWF0ZXMgc2FtcGxlIGFsZXJ0cyBpbiB3YXp1aC1zYW1wbGUtYWxlcnRzXG4gICAqIFBPU1QgL2VsYXN0aWMvc2FtcGxlYWxlcnRzL3tjYXRlZ29yeX1cbiAgICoge1xuICAgKiAgIFwibWFuYWdlclwiOiB7XG4gICAqICAgICAgXCJuYW1lXCI6IFwibWFuYWdlcl9uYW1lXCJcbiAgICogICAgfSxcbiAgICogICAgY2x1c3Rlcjoge1xuICAgKiAgICAgIG5hbWU6IFwibXljbHVzdGVyXCIsXG4gICAqICAgICAgbm9kZTogXCJteW5vZGVcIlxuICAgKiAgICB9XG4gICAqIH1cbiAgICogQHBhcmFtIHsqfSBjb250ZXh0XG4gICAqIEBwYXJhbSB7Kn0gcmVxdWVzdFxuICAgKiBAcGFyYW0geyp9IHJlc3BvbnNlXG4gICAqIHtpbmRleDogc3RyaW5nLCBhbGVydHM6IFsuLi5dLCBjb3VudDogbnVtYmVyfSBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjcmVhdGVTYW1wbGVBbGVydHMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0PHtjYXRlZ29yeTogc3RyaW5nIH0+LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgY29uc3Qgc2FtcGxlQWxlcnRzSW5kZXggPSB0aGlzLmJ1aWxkU2FtcGxlSW5kZXhCeUNhdGVnb3J5KHJlcXVlc3QucGFyYW1zLmNhdGVnb3J5KTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiB1c2VyIGhhcyBhZG1pbmlzdHJhdG9yIHJvbGUgaW4gdG9rZW5cbiAgICAgIGNvbnN0IHRva2VuID0gZ2V0Q29va2llVmFsdWVCeU5hbWUocmVxdWVzdC5oZWFkZXJzLmNvb2tpZSwgJ3d6LXRva2VuJyk7XG4gICAgICBpZighdG9rZW4pe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gdG9rZW4gcHJvdmlkZWQnLCA0MDEsIDQwMSwgcmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGRlY29kZWRUb2tlbiA9IGp3dERlY29kZSh0b2tlbik7XG4gICAgICBpZighZGVjb2RlZFRva2VuKXtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoJ05vIHBlcm1pc3Npb25zIGluIHRva2VuJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICBpZighZGVjb2RlZFRva2VuLnJiYWNfcm9sZXMgfHwgIWRlY29kZWRUb2tlbi5yYmFjX3JvbGVzLmluY2x1ZGVzKFdBWlVIX1JPTEVfQURNSU5JU1RSQVRPUl9JRCkpe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gYWRtaW5pc3RyYXRvciByb2xlJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICAvLyBDaGVjayB0aGUgcHJvdmlkZWQgdG9rZW4gaXMgdmFsaWRcbiAgICAgIGNvbnN0IGFwaUhvc3RJRCA9IGdldENvb2tpZVZhbHVlQnlOYW1lKHJlcXVlc3QuaGVhZGVycy5jb29raWUsICd3ei1hcGknKTtcbiAgICAgIGlmKCAhYXBpSG9zdElEICl7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKCdObyBBUEkgaWQgcHJvdmlkZWQnLCA0MDEsIDQwMSwgcmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlVG9rZW5Jc1dvcmtpbmcgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KCdHRVQnLCBgLy9gLCB7fSwge2FwaUhvc3RJRH0pO1xuICAgICAgaWYocmVzcG9uc2VUb2tlbklzV29ya2luZy5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKCdUb2tlbiBpcyBub3QgdmFsaWQnLCA1MDAsIDUwMCwgcmVzcG9uc2UpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgYnVsa1ByZWZpeCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaW5kZXg6IHtcbiAgICAgICAgICBfaW5kZXg6IHNhbXBsZUFsZXJ0c0luZGV4XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgYWxlcnRHZW5lcmF0ZVBhcmFtcyA9IHJlcXVlc3QuYm9keSAmJiByZXF1ZXN0LmJvZHkucGFyYW1zIHx8IHt9O1xuXG4gICAgICBjb25zdCBzYW1wbGVBbGVydHMgPSBXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JJRVNfVFlQRV9BTEVSVFNbcmVxdWVzdC5wYXJhbXMuY2F0ZWdvcnldLm1hcCgodHlwZUFsZXJ0KSA9PiBnZW5lcmF0ZUFsZXJ0cyh7IC4uLnR5cGVBbGVydCwgLi4uYWxlcnRHZW5lcmF0ZVBhcmFtcyB9LCByZXF1ZXN0LmJvZHkuYWxlcnRzIHx8IHR5cGVBbGVydC5hbGVydHMgfHwgV0FaVUhfU0FNUExFX0FMRVJUU19ERUZBVUxUX05VTUJFUl9BTEVSVFMpKS5mbGF0KCk7XG4gICAgICBjb25zdCBidWxrID0gc2FtcGxlQWxlcnRzLm1hcChzYW1wbGVBbGVydCA9PiBgJHtidWxrUHJlZml4fVxcbiR7SlNPTi5zdHJpbmdpZnkoc2FtcGxlQWxlcnQpfVxcbmApLmpvaW4oJycpO1xuXG4gICAgICAvLyBJbmRleCBhbGVydHNcblxuICAgICAgLy8gQ2hlY2sgaWYgd2F6dWggc2FtcGxlIGFsZXJ0cyBpbmRleCBleGlzdHNcbiAgICAgIGNvbnN0IGV4aXN0c1NhbXBsZUluZGV4ID0gYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmluZGljZXMuZXhpc3RzKHtcbiAgICAgICAgaW5kZXg6IHNhbXBsZUFsZXJ0c0luZGV4XG4gICAgICB9KTtcbiAgICAgIGlmICghZXhpc3RzU2FtcGxlSW5kZXguYm9keSkge1xuICAgICAgICAvLyBDcmVhdGUgd2F6dWggc2FtcGxlIGFsZXJ0cyBpbmRleFxuXG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7XG4gICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgIGluZGV4OiB7XG4gICAgICAgICAgICAgIG51bWJlcl9vZl9zaGFyZHM6IFdBWlVIX1NBTVBMRV9BTEVSVFNfSU5ERVhfU0hBUkRTLFxuICAgICAgICAgICAgICBudW1iZXJfb2ZfcmVwbGljYXM6IFdBWlVIX1NBTVBMRV9BTEVSVFNfSU5ERVhfUkVQTElDQVNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmluZGljZXMuY3JlYXRlKHtcbiAgICAgICAgICBpbmRleDogc2FtcGxlQWxlcnRzSW5kZXgsXG4gICAgICAgICAgYm9keTogY29uZmlndXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICd3YXp1aC1lbGFzdGljOmNyZWF0ZVNhbXBsZUFsZXJ0cycsXG4gICAgICAgICAgYENyZWF0ZWQgJHtzYW1wbGVBbGVydHNJbmRleH0gaW5kZXhgLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmJ1bGsoe1xuICAgICAgICBpbmRleDogc2FtcGxlQWxlcnRzSW5kZXgsXG4gICAgICAgIGJvZHk6IGJ1bGtcbiAgICAgIH0pO1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpjcmVhdGVTYW1wbGVBbGVydHMnLFxuICAgICAgICBgQWRkZWQgc2FtcGxlIGFsZXJ0cyB0byAke3NhbXBsZUFsZXJ0c0luZGV4fSBpbmRleGAsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBib2R5OiB7IGluZGV4OiBzYW1wbGVBbGVydHNJbmRleCwgYWxlcnRDb3VudDogc2FtcGxlQWxlcnRzLmxlbmd0aCB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpjcmVhdGVTYW1wbGVBbGVydHMnLFxuICAgICAgICBgRXJyb3IgYWRkaW5nIHNhbXBsZSBhbGVydHMgdG8gJHtzYW1wbGVBbGVydHNJbmRleH0gaW5kZXg6ICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgMTAwMCwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBUaGlzIGRlbGV0ZXMgc2FtcGxlIGFsZXJ0c1xuICAgKiBAcGFyYW0geyp9IGNvbnRleHRcbiAgICogQHBhcmFtIHsqfSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7Kn0gcmVzcG9uc2VcbiAgICoge3Jlc3VsdDogXCJkZWxldGVkXCIsIGluZGV4OiBzdHJpbmd9IG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGRlbGV0ZVNhbXBsZUFsZXJ0cyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3Q8e2NhdGVnb3J5OiBzdHJpbmcgfT4sIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICAvLyBEZWxldGUgV2F6dWggc2FtcGxlIGFsZXJ0IGluZGV4XG5cbiAgICBjb25zdCBzYW1wbGVBbGVydHNJbmRleCA9IHRoaXMuYnVpbGRTYW1wbGVJbmRleEJ5Q2F0ZWdvcnkocmVxdWVzdC5wYXJhbXMuY2F0ZWdvcnkpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIENoZWNrIGlmIHVzZXIgaGFzIGFkbWluaXN0cmF0b3Igcm9sZSBpbiB0b2tlblxuICAgICAgY29uc3QgdG9rZW4gPSBnZXRDb29raWVWYWx1ZUJ5TmFtZShyZXF1ZXN0LmhlYWRlcnMuY29va2llLCAnd3otdG9rZW4nKTtcbiAgICAgIGlmKCF0b2tlbil7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKCdObyB0b2tlbiBwcm92aWRlZCcsIDQwMSwgNDAxLCByZXNwb25zZSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgZGVjb2RlZFRva2VuID0gand0RGVjb2RlKHRva2VuKTtcbiAgICAgIGlmKCFkZWNvZGVkVG9rZW4pe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gcGVybWlzc2lvbnMgaW4gdG9rZW4nLCA0MDEsIDQwMSwgcmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIGlmKCFkZWNvZGVkVG9rZW4ucmJhY19yb2xlcyB8fCAhZGVjb2RlZFRva2VuLnJiYWNfcm9sZXMuaW5jbHVkZXMoV0FaVUhfUk9MRV9BRE1JTklTVFJBVE9SX0lEKSl7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKCdObyBhZG1pbmlzdHJhdG9yIHJvbGUnLCA0MDEsIDQwMSwgcmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIC8vIENoZWNrIHRoZSBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZFxuICAgICAgY29uc3QgYXBpSG9zdElEID0gZ2V0Q29va2llVmFsdWVCeU5hbWUocmVxdWVzdC5oZWFkZXJzLmNvb2tpZSwgJ3d6LWFwaScpO1xuICAgICAgaWYoICFhcGlIb3N0SUQgKXtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoJ05vIEFQSSBpZCBwcm92aWRlZCcsIDQwMSwgNDAxLCByZXNwb25zZSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzcG9uc2VUb2tlbklzV29ya2luZyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLnJlcXVlc3QoJ0dFVCcsIGAvL2AsIHt9LCB7YXBpSG9zdElEfSk7XG4gICAgICBpZihyZXNwb25zZVRva2VuSXNXb3JraW5nLnN0YXR1cyAhPT0gMjAwKXtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoJ1Rva2VuIGlzIG5vdCB2YWxpZCcsIDUwMCwgNTAwLCByZXNwb25zZSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBDaGVjayBpZiBXYXp1aCBzYW1wbGUgYWxlcnRzIGluZGV4IGV4aXN0c1xuICAgICAgY29uc3QgZXhpc3RzU2FtcGxlSW5kZXggPSBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgIGluZGV4OiBzYW1wbGVBbGVydHNJbmRleFxuICAgICAgfSk7XG4gICAgICBpZiAoZXhpc3RzU2FtcGxlSW5kZXguYm9keSkge1xuICAgICAgICAvLyBEZWxldGUgV2F6dWggc2FtcGxlIGFsZXJ0cyBpbmRleFxuICAgICAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci5pbmRpY2VzLmRlbGV0ZSh7IGluZGV4OiBzYW1wbGVBbGVydHNJbmRleCB9KTtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICd3YXp1aC1lbGFzdGljOmRlbGV0ZVNhbXBsZUFsZXJ0cycsXG4gICAgICAgICAgYERlbGV0ZWQgJHtzYW1wbGVBbGVydHNJbmRleH0gaW5kZXhgLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiB7IHJlc3VsdDogJ2RlbGV0ZWQnLCBpbmRleDogc2FtcGxlQWxlcnRzSW5kZXggfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGAke3NhbXBsZUFsZXJ0c0luZGV4fSBpbmRleCBkb2Vzbid0IGV4aXN0YCwgMTAwMCwgNTAwLCByZXNwb25zZSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKFxuICAgICAgICAnd2F6dWgtZWxhc3RpYzpkZWxldGVTYW1wbGVBbGVydHMnLFxuICAgICAgICBgRXJyb3IgZGVsZXRpbmcgc2FtcGxlIGFsZXJ0cyBvZiAke3NhbXBsZUFsZXJ0c0luZGV4fSBpbmRleDogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAxMDAwLCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhbGVydHMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci5zZWFyY2gocmVxdWVzdC5ib2R5KTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IGRhdGEuYm9keVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtZWxhc3RpYzphbGVydHMnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsIDQwMTAsIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIGlmIHRoZXJlIGFyZSBpbmRpY2VzIGZvciBTdGF0aXN0aWNzXG4gIGFzeW5jIGV4aXN0U3RhdGlzdGljc0luZGljZXMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5e1xuICAgICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgICAgY29uc3Qgc3RhdGlzdGljc1BhdHRlcm4gPSBgJHtjb25maWdbJ2Nyb24ucHJlZml4J10gfHwgJ3dhenVoJ30tJHtjb25maWdbJ2Nyb24uc3RhdGlzdGljcy5pbmRleC5uYW1lJ10gfHwgJ3N0YXRpc3RpY3MnfSpgOyAvL1RPRE86IHJlcGxhY2UgYnkgZGVmYXVsdCBhcyBjb25zdGFudHMgaW5zdGVhZCBoYXJkY29kZWQgKCd3YXp1aCcgYW5kICdzdGF0aXN0aWNzJylcbiAgICAgIGNvbnN0IGV4aXN0SW5kZXggPSBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgIGluZGV4OiBzdGF0aXN0aWNzUGF0dGVybixcbiAgICAgICAgYWxsb3dfbm9faW5kaWNlczogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keTogZXhpc3RJbmRleC5ib2R5XG4gICAgICB9KTtcbiAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgbG9nKCd3YXp1aC1lbGFzdGljOmV4aXN0c1N0YXRpc3RpY3NJbmRpY2VzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAxMDAwLCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB1c2luZ0NyZWRlbnRpYWxzKGNvbnRleHQpe1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmNsdXN0ZXIuZ2V0U2V0dGluZ3MoXG4gICAgICAgIHtpbmNsdWRlX2RlZmF1bHRzOiB0cnVlfVxuICAgICAgKTtcbiAgICAgIHJldHVybiAoKCgoKGRhdGEgfHwge30pLmJvZHkgfHwge30pLmRlZmF1bHRzIHx8IHt9KS54cGFjayB8fCB7fSkuc2VjdXJpdHkgfHwge30pLnVzZXIgIT09IG51bGw7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfVxuICB9O1xufVxuIl19