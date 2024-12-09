"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhApiCtrl = void 0;

var _errorResponse = require("../lib/error-response");

var _json2csv = require("json2csv");

var _logger = require("../lib/logger");

var _csvKeyEquivalence = require("../../common/csv-key-equivalence");

var _apiErrorsEquivalence = require("../lib/api-errors-equivalence");

var _endpoints = _interopRequireDefault(require("../../common/api-info/endpoints"));

var _queue = require("../start/queue");

var _fs = _interopRequireDefault(require("fs"));

var _manageHosts = require("../lib/manage-hosts");

var _updateRegistry = require("../lib/update-registry");

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

var _cacheApiUserHasRunAs = require("../lib/cache-api-user-has-run-as");

var _cookie = require("../lib/cookie");

var _constants = require("../../common/constants");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _navPermission = require("../../common/nav-permission");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class WazuhApiCtrl {
  constructor() {
    _defineProperty(this, "manageHosts", void 0);

    _defineProperty(this, "updateRegistry", void 0);

    // this.monitoringInstance = new Monitoring(server, true);
    this.manageHosts = new _manageHosts.ManageHosts();
    this.updateRegistry = new _updateRegistry.UpdateRegistry();
    this.platformFile = _constants.PLATFORM_DATA_ABSOLUTE_PATH;
    this.navPermissionFile = _constants.NAV_PERMISSION_ABSOLUTE_PATH;
  }

  async getToken(context, request, response) {
    try {
      const {
        force,
        idHost
      } = request.body;
      const {
        username
      } = await context.wazuh.security.getCurrentUser(request, context);

      if (!force && request.headers.cookie && username === (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-user') && idHost === (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api')) {
        const wzToken = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-token');

        if (wzToken) {
          try {
            // if the current token is not a valid jwt token we ask for a new one
            const decodedToken = (0, _jwtDecode.default)(wzToken);
            const expirationTime = decodedToken.exp - Date.now() / 1000;

            if (wzToken && expirationTime > 0) {
              return response.ok({
                body: {
                  token: wzToken
                }
              });
            }
          } catch (error) {
            (0, _logger.log)('wazuh-api:getToken', error.message || error);
          }
        }
      }

      let headers = {};
      let loginIp = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'login-ip');
      if (loginIp) headers['login-ip'] = loginIp;
      if (username) headers['user-name'] = username;
      let token;

      if ((await _cacheApiUserHasRunAs.APIUserAllowRunAs.canUse(idHost)) == _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.ENABLED) {
        token = await context.wazuh.api.client.asCurrentUser.authenticate(idHost, headers);
      } else {
        token = await context.wazuh.api.client.asInternalUser.authenticate(idHost, headers);
      }

      ;
      let textSecure = '';

      if (context.wazuh.server.info.protocol === 'https') {
        textSecure = ';Secure';
      }

      return response.ok({
        headers: {
          'set-cookie': [`wz-token=${token};Path=/;HttpOnly${textSecure}`, `wz-user=${username};Path=/;HttpOnly${textSecure}`, `wz-api=${idHost};Path=/;HttpOnly`]
        },
        body: {
          token
        }
      });
    } catch (error) {
      const errorMessage = ((error.response || {}).data || {}).detail || error.message || error;
      (0, _logger.log)('wazuh-api:getToken', errorMessage);
      return (0, _errorResponse.ErrorResponse)(`Error getting the authorization token: ${errorMessage}`, 3000, 500, response);
    }
  }
  /**
   * Returns if the wazuh-api configuration is working
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */


  async checkStoredAPI(context, request, response) {
    let headers = {};
    let loginIp = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'login-ip');
    let username = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-user');
    if (loginIp) headers['login-ip'] = loginIp;
    if (username) headers['user-name'] = username;
    try {
      // Get config from wazuh.yml
      const id = request.body.id;
      const api = await this.manageHosts.getHostById(id); // Check Manage Hosts

      if (!Object.keys(api).length) {
        throw new Error('Could not find Wazuh API entry on wazuh.yml');
      }

      (0, _logger.log)('wazuh-api:checkStoredAPI', `${id} exists`, 'debug'); // Fetch needed information about the cluster and the manager itself

      const responseManagerInfo = await context.wazuh.api.client.asInternalUser.request('get', `/manager/info`, { headers }, {
        apiHostID: id,
        forceRefresh: true
      }); // Look for socket-related errors

      if (this.checkResponseIsDown(responseManagerInfo)) {
        return (0, _errorResponse.ErrorResponse)(`ERROR3099 - ${responseManagerInfo.data.detail || 'Wazuh not ready yet'}`, 3099, 500, response);
      } // If we have a valid response from the Wazuh API


      if (responseManagerInfo.status === 200 && responseManagerInfo.data) {
        // Clear and update cluster information before being sent back to frontend
        delete api.cluster_info;
        const responseAgents = await context.wazuh.api.client.asInternalUser.request('GET', `/agents`, {
          headers,
          params: {
            agents_list: '000'
          }
        }, {
          apiHostID: id
        });

        if (responseAgents.status === 200) {
          const managerName = responseAgents.data.data.affected_items[0].manager;
          const responseClusterStatus = await context.wazuh.api.client.asInternalUser.request('GET', `/cluster/status`, { headers }, {
            apiHostID: id
          });

          if (responseClusterStatus.status === 200) {
            if (responseClusterStatus.data.data.enabled === 'yes') {
              const responseClusterLocalInfo = await context.wazuh.api.client.asInternalUser.request('GET', `/cluster/local/info`, { headers }, {
                apiHostID: id
              });

              if (responseClusterLocalInfo.status === 200) {
                const clusterEnabled = responseClusterStatus.data.data.enabled === 'yes';
                api.cluster_info = {
                  status: clusterEnabled ? 'enabled' : 'disabled',
                  manager: managerName,
                  node: responseClusterLocalInfo.data.data.affected_items[0].node,
                  cluster: clusterEnabled ? responseClusterLocalInfo.data.data.affected_items[0].cluster : 'Disabled'
                };
              }
            } else {
              // Cluster mode is not active
              api.cluster_info = {
                status: 'disabled',
                manager: managerName,
                cluster: 'Disabled'
              };
            }
          } else {
            // Cluster mode is not active
            api.cluster_info = {
              status: 'disabled',
              manager: managerName,
              cluster: 'Disabled'
            };
          }

          if (api.cluster_info) {
            // Update cluster information in the wazuh-registry.json
            await this.updateRegistry.updateClusterInfo(id, api.cluster_info); // Hide Wazuh API secret, username, password

            const copied = { ...api
            };
            copied.secret = '****';
            copied.password = '****';
            return response.ok({
              body: {
                statusCode: 200,
                data: copied,
                idChanged: request.body.idChanged || null
              }
            });
          }
        }
      } // If we have an invalid response from the Wazuh API


      throw new Error(responseManagerInfo.data.detail || `${api.url}:${api.port} is unreachable`);
    } catch (error) {
      (0, _logger.log)('wazuh-api:checkStoredAPI', error.message || error);

      if (error.code === 'EPROTO') {
        return response.ok({
          body: {
            statusCode: 200,
            data: {
              password: '****',
              apiIsDown: true
            }
          }
        });
      } else if (error.code === 'ECONNREFUSED') {
        return response.ok({
          body: {
            statusCode: 200,
            data: {
              password: '****',
              apiIsDown: true
            }
          }
        });
      } else {
        try {
          const apis = await this.manageHosts.getHosts();

          for (const api of apis) {
            try {
              const id = Object.keys(api)[0];
              const responseManagerInfo = await context.wazuh.api.client.asInternalUser.request('GET', `/manager/info`, { headers }, {
                apiHostID: id
              });

              if (this.checkResponseIsDown(responseManagerInfo)) {
                return (0, _errorResponse.ErrorResponse)(`ERROR3099 - ${response.data.detail || 'Wazuh not ready yet'}`, 3099, 500, response);
              }

              if (responseManagerInfo.status === 200) {
                request.body.id = id;
                request.body.idChanged = id;
                return await this.checkStoredAPI(context, request, response);
              }
            } catch (error) {} // eslint-disable-line

          }
        } catch (error) {
          return (0, _errorResponse.ErrorResponse)(error.message || error, 3020, 500, response);
        }

        return (0, _errorResponse.ErrorResponse)(error.message || error, 3002, 500, response);
      }
    }
  }
  /**
   * This perfoms a validation of API params
   * @param {Object} body API params
   */


  validateCheckApiParams(body) {
    if (!('username' in body)) {
      return 'Missing param: API USERNAME';
    }

    if (!('password' in body) && !('id' in body)) {
      return 'Missing param: API PASSWORD';
    }

    if (!('url' in body)) {
      return 'Missing param: API URL';
    }

    if (!('port' in body)) {
      return 'Missing param: API PORT';
    }

    if (!body.url.includes('https://') && !body.url.includes('http://')) {
      return 'protocol_error';
    }

    return false;
  }
  /**
   * This check the wazuh-api configuration received in the POST body will work
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} status obj or ErrorResponse
   */


  async checkAPI(context, request, response) {
    let headers = {};
    let loginIp = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'login-ip');
    let username = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-user');
    if (loginIp) headers['login-ip'] = loginIp;
    if (username) headers['user-name'] = username;
    try {
      let apiAvailable = null; // const notValid = this.validateCheckApiParams(request.body);
      // if (notValid) return ErrorResponse(notValid, 3003, 500, response);

      (0, _logger.log)('wazuh-api:checkAPI', `${request.body.id} is valid`, 'debug'); // Check if a Wazuh API id is given (already stored API)

      const data = await this.manageHosts.getHostById(request.body.id);

      if (data) {
        apiAvailable = data;
      } else {
        (0, _logger.log)('wazuh-api:checkAPI', `API ${request.body.id} not found`);
        return (0, _errorResponse.ErrorResponse)(`The API ${request.body.id} was not found`, 3029, 500, response);
      }

      const options = {
        apiHostID: request.body.id
      };

      if (request.body.forceRefresh) {
        options["forceRefresh"] = request.body.forceRefresh;
      }

      let responseManagerInfo;

      try {
        responseManagerInfo = await context.wazuh.api.client.asInternalUser.request('GET', `/manager/info`, { headers }, options);
      } catch (error) {
        return (0, _errorResponse.ErrorResponse)(`ERROR3099 - ${error.response.data.detail || 'Wazuh not ready yet'}`, 3099, 500, response);
      }

      (0, _logger.log)('wazuh-api:checkAPI', `${request.body.id} credentials are valid`, 'debug');

      if (responseManagerInfo.status === 200 && responseManagerInfo.data) {
        let responseAgents = await context.wazuh.api.client.asInternalUser.request('GET', `/agents`, {
          headers,
          params: {
            agents_list: '000'
          }
        }, {
          apiHostID: request.body.id
        });

        if (responseAgents.status === 200) {
          const managerName = responseAgents.data.data.affected_items[0].manager;
          let responseCluster = await context.wazuh.api.client.asInternalUser.request('GET', `/cluster/status`, { headers }, {
            apiHostID: request.body.id
          }); // Check the run_as for the API user and update it

          let apiUserAllowRunAs = _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.ALL_DISABLED;
          const responseApiUserAllowRunAs = await context.wazuh.api.client.asInternalUser.request('GET', `/security/users/me`, { headers }, {
            apiHostID: request.body.id
          });

          if (responseApiUserAllowRunAs.status === 200) {
            const allow_run_as = responseApiUserAllowRunAs.data.data.affected_items[0].allow_run_as;
            if (allow_run_as && apiAvailable && apiAvailable.run_as) // HOST AND USER ENABLED
              apiUserAllowRunAs = _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.ENABLED;else if (!allow_run_as && apiAvailable && apiAvailable.run_as) // HOST ENABLED AND USER DISABLED
              apiUserAllowRunAs = _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.USER_NOT_ALLOWED;else if (allow_run_as && (!apiAvailable || !apiAvailable.run_as)) // USER ENABLED AND HOST DISABLED
              apiUserAllowRunAs = _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.HOST_DISABLED;else if (!allow_run_as && (!apiAvailable || !apiAvailable.run_as)) // HOST AND USER DISABLED
              apiUserAllowRunAs = _cacheApiUserHasRunAs.API_USER_STATUS_RUN_AS.ALL_DISABLED;
          }

          _cacheApiUserHasRunAs.CacheInMemoryAPIUserAllowRunAs.set(request.body.id, apiAvailable.username, apiUserAllowRunAs);

          if (responseCluster.status === 200) {
            (0, _logger.log)('wazuh-api:checkStoredAPI', `Wazuh API response is valid`, 'debug');

            if (responseCluster.data.data.enabled === 'yes') {
              // If cluster mode is active
              let responseClusterLocal = await context.wazuh.api.client.asInternalUser.request('GET', `/cluster/local/info`, { headers }, {
                apiHostID: request.body.id
              });

              if (responseClusterLocal.status === 200) {
                return response.ok({
                  body: {
                    manager: managerName,
                    node: responseClusterLocal.data.data.affected_items[0].node,
                    cluster: responseClusterLocal.data.data.affected_items[0].cluster,
                    status: 'enabled',
                    allow_run_as: apiUserAllowRunAs
                  }
                });
              }
            } else {
              // Cluster mode is not active
              return response.ok({
                body: {
                  manager: managerName,
                  cluster: 'Disabled',
                  status: 'disabled',
                  allow_run_as: apiUserAllowRunAs
                }
              });
            }
          }
        }
      }
    } catch (error) {
      (0, _logger.log)('wazuh-api:checkAPI', error.message || error);

      if (error && error.response && error.response.status === 401) {
        return (0, _errorResponse.ErrorResponse)(`Unathorized. Please check API credentials. ${error.response.data.message}`, 401, 401, response);
      }

      if (error && error.response && error.response.data && error.response.data.detail) {
        return (0, _errorResponse.ErrorResponse)(error.response.data.detail, error.response.status || 500, error.response.status || 500, response);
      }

      if (error.code === 'EPROTO') {
        return (0, _errorResponse.ErrorResponse)('Wrong protocol being used to connect to the Wazuh API', 3005, 500, response);
      }

      return (0, _errorResponse.ErrorResponse)(error.message || error, 3005, 500, response);
    }
  }

  checkResponseIsDown(response) {
    if (response.status !== 200) {
      // Avoid "Error communicating with socket" like errors
      const socketErrorCodes = [1013, 1014, 1017, 1018, 1019];
      const status = (response.data || {}).status || 1;
      const isDown = socketErrorCodes.includes(status);
      isDown && (0, _logger.log)('wazuh-api:makeRequest', 'Wazuh API is online but Wazuh is not ready yet');
      return isDown;
    }

    return false;
  }
  /**
   * Check main Wazuh daemons status
   * @param {*} context Endpoint context
   * @param {*} api API entry stored in .wazuh
   * @param {*} path Optional. Wazuh API target path.
   */


  async checkDaemons(context, api, path, headers) {
    try {
      const response = await context.wazuh.api.client.asInternalUser.request('GET', '/manager/status', { headers }, {
        apiHostID: api.id
      });
      const daemons = ((((response || {}).data || {}).data || {}).affected_items || [])[0] || {};
      const isCluster = ((api || {}).cluster_info || {}).status === 'enabled' && typeof daemons['wazuh-clusterd'] !== 'undefined';
      const wazuhdbExists = typeof daemons['wazuh-db'] !== 'undefined';
      const execd = daemons['ossec-execd'] === 'running';
      const modulesd = daemons['wazuh-modulesd'] === 'running';
      const wazuhdb = wazuhdbExists ? daemons['wazuh-db'] === 'running' : true;
      const clusterd = isCluster ? daemons['wazuh-clusterd'] === 'running' : true;
      const isValid = execd && modulesd && wazuhdb && clusterd;
      isValid && (0, _logger.log)('wazuh-api:checkDaemons', `Wazuh is ready`, 'debug');

      if (path === '/ping') {
        return {
          isValid
        };
      }

      if (!isValid) {
        throw new Error('Wazuh not ready yet');
      }
    } catch (error) {
      (0, _logger.log)('wazuh-api:checkDaemons', error.message || error);
      return Promise.reject(error);
    }
  }

  sleep(timeMs) {
    // eslint-disable-next-line
    return new Promise((resolve, reject) => {
      setTimeout(resolve, timeMs);
    });
  }
  /**
   * Helper method for Dev Tools.
   * https://documentation.wazuh.com/current/user-manual/api/reference.html
   * Depending on the method and the path some parameters should be an array or not.
   * Since we allow the user to write the request using both comma-separated and array as well,
   * we need to check if it should be transformed or not.
   * @param {*} method The request method
   * @param {*} path The Wazuh API path
   */


  shouldKeepArrayAsIt(method, path) {
    // Methods that we must respect a do not transform them
    const isAgentsRestart = method === 'POST' && path === '/agents/restart';
    const isActiveResponse = method === 'PUT' && path.startsWith('/active-response');
    const isAgentmanage =  method === 'POST' && path.startsWith('/manager/agentmanage');
    const isAddingAgentsToGroup = method === 'POST' && path.startsWith('/agents/group/'); // Returns true only if one of the above conditions is true

    return isAgentsRestart || isActiveResponse || isAgentmanage || isAddingAgentsToGroup;
  }
  /**
   * This performs a request over Wazuh API and returns its response
   * @param {String} method Method: GET, PUT, POST, DELETE
   * @param {String} path API route
   * @param {Object} data data and params to perform the request
   * @param {String} id API id
   * @param {Object} response
   * @returns {Object} API response or ErrorResponse
   */


  async makeRequest(context, method, path, data, id, cookie, response) {
    const devTools = !!(data || {}).devTools;

    try {
      const api = await this.manageHosts.getHostById(id);

      if (devTools) {
        delete data.devTools;
      }

      if (!Object.keys(api).length) {
        (0, _logger.log)('wazuh-api:makeRequest', 'Could not get host credentials'); //Can not get credentials from wazuh-hosts

        return (0, _errorResponse.ErrorResponse)('Could not get host credentials', 3011, 404, response);
      }

      if (!data) {
        data = {};
      }

      ;

      if (!data.headers) {
        data.headers = {};
      }

      ;

      let loginIp = (0, _cookie.getCookieValueByName)(cookie, 'login-ip');
      let username = (0, _cookie.getCookieValueByName)(cookie, 'wz-user');
      if (loginIp) data.headers['login-ip'] = loginIp;
      if (username) data.headers['user-name'] = username;

      const options = {
        apiHostID: id
      }; // Set content type application/xml if needed

      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'xmleditor') {
        data.headers['content-type'] = 'application/xml';
        delete data.origin;
      }

      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'json') {
        data.headers['content-type'] = 'application/json';
        delete data.origin;
      }

      if (typeof (data || {}).body === 'string' && (data || {}).origin === 'raw') {
        data.headers['content-type'] = 'application/octet-stream';
        delete data.origin;
      }

      const delay = (data || {}).delay || 0;

      if (delay) {
        (0, _queue.addJobToQueue)({
          startAt: new Date(Date.now() + delay),
          run: async () => {
            try {
              await context.wazuh.api.client.asCurrentUser.request(method, path, data, options);
            } catch (error) {
              (0, _logger.log)('queue:delayApiRequest', `An error ocurred in the delayed request: "${method} ${path}": ${error.message || error}`);
            }

            ;
          }
        });
        return response.ok({
          body: {
            error: 0,
            message: 'Success'
          }
        });
      }

      if (path === '/ping') {
        try {
          const check = await this.checkDaemons(context, api, path, data.headers);
          return check;
        } catch (error) {
          const isDown = (error || {}).code === 'ECONNREFUSED';

          if (!isDown) {
            (0, _logger.log)('wazuh-api:makeRequest', 'Wazuh API is online but Wazuh is not ready yet');
            return (0, _errorResponse.ErrorResponse)(`ERROR3099 - ${error.message || 'Wazuh not ready yet'}`, 3099, 500, response);
          }
        }
      }

      (0, _logger.log)('wazuh-api:makeRequest', `${method} ${path}`, 'debug'); // Extract keys from parameters

      const dataProperties = Object.keys(data); // Transform arrays into comma-separated string if applicable.
      // The reason is that we are accepting arrays for comma-separated
      // parameters in the Dev Tools

      if (!this.shouldKeepArrayAsIt(method, path)) {
        for (const key of dataProperties) {
          if (Array.isArray(data[key])) {
            data[key] = data[key].join();
          }
        }
      }

      const responseToken = await context.wazuh.api.client.asCurrentUser.request(method, path, data, options);
      const responseIsDown = this.checkResponseIsDown(responseToken);

      if (responseIsDown) {
        return (0, _errorResponse.ErrorResponse)(`ERROR3099 - ${response.body.message || 'Wazuh not ready yet'}`, 3099, 500, response);
      }

      let responseBody = (responseToken || {}).data || {};

      if (!responseBody) {
        responseBody = typeof responseBody === 'string' && path.includes('/files') && method === 'GET' ? ' ' : false;
        response.data = responseBody;
      }

      const responseError = response.status !== 200 ? response.status : false;

      if (!responseError && responseBody) {
        //cleanKeys(response);
        return response.ok({
          body: responseToken.data
        });
      }

      if (responseError && devTools) {
        return response.ok({
          body: response.data
        });
      }

      throw responseError && responseBody.detail ? {
        message: responseBody.detail,
        code: responseError
      } : new Error('Unexpected error fetching data from the Wazuh API');
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        return (0, _errorResponse.ErrorResponse)(error.message || error, error.code ? `Wazuh API error: ${error.code}` : 3013, 401, response);
      }

      const errorMsg = (error.response || {}).data || error.message;
      (0, _logger.log)('wazuh-api:makeRequest', errorMsg || error);

      if (devTools) {
        return response.ok({
          body: {
            error: '3013',
            message: errorMsg || error
          }
        });
      } else {
        if ((error || {}).code && _apiErrorsEquivalence.ApiErrorEquivalence[error.code]) {
          error.message = _apiErrorsEquivalence.ApiErrorEquivalence[error.code];
        }

        return (0, _errorResponse.ErrorResponse)(errorMsg.detail || error, error.code ? `Wazuh API error: ${error.code}` : 3013, 500, response);
      }
    }
  }
  /**
   * This make a request to API
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} api response or ErrorResponse
   */


  requestApi(context, request, response) {
    const idApi = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api');

    if (idApi !== request.body.id) {
      // if the current token belongs to a different API id, we relogin to obtain a new token
      return (0, _errorResponse.ErrorResponse)('status code 401', 401, 401, response);
    }

    if (!request.body.method) {
      return (0, _errorResponse.ErrorResponse)('Missing param: method', 3015, 400, response);
    } else if (!request.body.method.match(/^(?:GET|PUT|POST|DELETE)$/)) {
      (0, _logger.log)('wazuh-api:makeRequest', 'Request method is not valid.'); //Method is not a valid HTTP request method

      return (0, _errorResponse.ErrorResponse)('Request method is not valid.', 3015, 400, response);
    } else if (!request.body.path) {
      return (0, _errorResponse.ErrorResponse)('Missing param: path', 3016, 400, response);
    } else if (!request.body.path.match(/^\/.+/)) {
      (0, _logger.log)('wazuh-api:makeRequest', 'Request path is not valid.'); //Path doesn't start with '/'

      return (0, _errorResponse.ErrorResponse)('Request path is not valid.', 3015, 400, response);
    } else {
      return this.makeRequest(context, request.body.method, request.body.path, request.body.body, request.body.id, request.headers.cookie, response);
    }
  }
  /**
   * Get full data on CSV format from a list Wazuh API endpoint
   * @param {Object} ctx
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} csv or ErrorResponse
   */


  async csv(context, request, response) {
    let headers = {};
    let loginIp = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'login-ip');
    let username = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-user');
    if (loginIp) headers['login-ip'] = loginIp;
    if (username) headers['user-name'] = username;
    try {
      if (!request.body || !request.body.path) throw new Error('Field path is required');
      if (!request.body.id) throw new Error('Field id is required');
      const filters = Array.isArray(((request || {}).body || {}).filters) ? request.body.filters : [];
      let tmpPath = request.body.path;

      if (tmpPath && typeof tmpPath === 'string') {
        tmpPath = tmpPath[0] === '/' ? tmpPath.substr(1) : tmpPath;
      }

      if (!tmpPath) throw new Error('An error occurred parsing path field');
      (0, _logger.log)('wazuh-api:csv', `Report ${tmpPath}`, 'debug'); // Real limit, regardless the user query

      const params = {
        limit: 500
      };

      if (filters.length) {
        for (const filter of filters) {
          if (!filter.name || !filter.value) continue;
          params[filter.name] = filter.value;
        }
      }

      let itemsArray = [];
      const output = await context.wazuh.api.client.asCurrentUser.request('GET', `/${tmpPath}`, {
        headers,
        params: params
      }, {
        apiHostID: request.body.id
      });
      const isList = request.body.path.includes('/lists') && request.body.filters && request.body.filters.length && request.body.filters.find(filter => filter._isCDBList);
      const totalItems = (((output || {}).data || {}).data || {}).total_affected_items;

      if (totalItems && !isList) {
        params.offset = 0;
        itemsArray.push(...output.data.data.affected_items);

        while (itemsArray.length < totalItems && params.offset < totalItems) {
          params.offset += params.limit;
          const tmpData = await context.wazuh.api.client.asCurrentUser.request('GET', `/${tmpPath}`, {
            headers,
            params: params
          }, {
            apiHostID: request.body.id
          });
          itemsArray.push(...tmpData.data.data.affected_items);
        }
      }

      if (totalItems) {
        const {
          path,
          filters
        } = request.body;
        const isArrayOfLists = path.includes('/lists') && !isList;
        const isAgents = path.includes('/agents') && !path.includes('groups');
        const isAgentsOfGroup = path.startsWith('/agents/groups/');
        const isFiles = path.endsWith('/files');
        let fields = Object.keys(output.data.data.affected_items[0]);

        if (isAgents || isAgentsOfGroup) {
          if (isFiles) {
            fields = ['filename', 'hash'];
          } else {
            fields = ['id', 'status', 'name', 'ip', 'group', 'manager', 'node_name', 'dateAdd', 'version', 'lastKeepAlive', 'os.arch', 'os.build', 'os.codename', 'os.major', 'os.minor', 'os.name', 'os.platform', 'os.uname', 'os.version'];
          }
        }

        if (isArrayOfLists) {
          const flatLists = [];

          for (const list of itemsArray) {
            const {
              relative_dirname,
              items
            } = list;
            flatLists.push(...items.map(item => ({
              relative_dirname,
              key: item.key,
              value: item.value
            })));
          }

          fields = ['relative_dirname', 'key', 'value'];
          itemsArray = [...flatLists];
        }

        if (isList) {
          fields = ['key', 'value'];
          itemsArray = output.data.data.affected_items[0].items;
        }

        if (request.body.csvKey.length > 0) { // 自定义导出列
          fields = request.body.csvKey;
        }

        fields = fields.map(item => ({
          value: item,
          default: '-'
        }));

        let noDownloadKey = ['resident', 'start_time', 'stime', 'share'];
        fields = fields.filter(item => noDownloadKey.indexOf(item.value) === -1);

        const json2csvParser = new _json2csv.Parser({
          fields
        });
        let csv = json2csvParser.parse(itemsArray);

        for (const field of fields) {
          const {
            value
          } = field;

          if (csv.includes(value)) {
            let keyField = request.body.csvKeyContrast[value] ? request.body.csvKeyContrast[value] : value; // 列名对应字段
            csv = csv.replace(value, _csvKeyEquivalence.KeyEquivalence[keyField] || keyField);
          }
        }

        return response.ok({
          headers: {
            'Content-Type': 'text/csv'
          },
          body: {
            csv,
            itemsArray,
            fields
          }
        });
      } else if (output && output.data && output.data.data && !output.data.data.total_affected_items) {
        // throw new Error('No results');
        return response.ok({
          headers: {
            'Content-Type': 'text/csv'
          },
          body: {
            csv: '',
            itemsArray: [],
            fields: []
          }
        });
      } else {
        throw new Error(`An error occurred fetching data from the Wazuh API${output && output.data && output.data.detail ? `: ${output.body.detail}` : ''}`);
      }
    } catch (error) {
      (0, _logger.log)('wazuh-api:csv', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 3034, 500, response);
    }
  } // Get de list of available requests in the API


  getRequestList(context, request, response) {
    //Read a static JSON until the api call has implemented
    return response.ok({
      body: _endpoints.default
    });
  }
  /**
   * This get the timestamp field
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} timestamp field or ErrorResponse
   */


  getTimeStamp(context, request, response) {
    try {
      const source = JSON.parse(_fs.default.readFileSync(this.updateRegistry.file, 'utf8'));

      if (source.installationDate && source.lastRestart) {
        (0, _logger.log)('wazuh-api:getTimeStamp', `Installation date: ${source.installationDate}. Last restart: ${source.lastRestart}`, 'debug');
        return response.ok({
          body: {
            installationDate: source.installationDate,
            lastRestart: source.lastRestart
          }
        });
      } else {
        throw new Error('Could not fetch wazuh-version registry');
      }
    } catch (error) {
      (0, _logger.log)('wazuh-api:getTimeStamp', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || 'Could not fetch wazuh-version registry', 4001, 500, response);
    }
  }
  /**
   * This get the extensions
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} extensions object or ErrorResponse
   */


  async setExtensions(context, request, response) {
    try {
      const {
        id,
        extensions
      } = request.body; // Update cluster information in the wazuh-registry.json

      await this.updateRegistry.updateAPIExtensions(id, extensions);
      return response.ok({
        body: {
          statusCode: 200
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-api:setExtensions', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || 'Could not set extensions', 4001, 500, response);
    }
  }
  /**
   * This get the extensions
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} extensions object or ErrorResponse
   */


  getExtensions(context, request, response) {
    try {
      const source = JSON.parse(_fs.default.readFileSync(this.updateRegistry.file, 'utf8'));
      return response.ok({
        body: {
          extensions: (source.hosts[request.params.id] || {}).extensions || {}
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-api:getExtensions', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || 'Could not fetch wazuh-version registry', 4001, 500, response);
    }
  }
  /**
   * This get the wazuh setup settings
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} setup info or ErrorResponse
   */


  async getSetupInfo(context, request, response) {
    try {
      const source = JSON.parse(_fs.default.readFileSync(this.updateRegistry.file, 'utf8'));
      return response.ok({
        body: {
          statusCode: 200,
          data: !Object.values(source).length ? '' : source
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-api:getSetupInfo', error.message || error);
      return (0, _errorResponse.ErrorResponse)(`Could not get data from wazuh-version registry due to ${error.message || error}`, 4005, 500, response);
    }
  }
  /**
   * Get basic syscollector information for given agent.
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} Basic syscollector information
   */


  async getSyscollector(context, request, response) {
    let headers = {};
    let loginIp = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'login-ip');
    let username = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-user');
    if (loginIp) headers['login-ip'] = loginIp;
    if (username) headers['user-name'] = username;
    try {
      const apiHostID = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api');

      if (!request.params || !apiHostID || !request.params.agent) {
        throw new Error('Agent ID and API ID are required');
      }

      const {
        agent
      } = request.params;
      const data = await Promise.all([context.wazuh.api.client.asInternalUser.request('GET', `/syscollector/${agent}/hardware`, { headers }, {
        apiHostID
      }), context.wazuh.api.client.asInternalUser.request('GET', `/syscollector/${agent}/os`, { headers }, {
        apiHostID
      })]);
      const result = data.map(item => (item.data || {}).data || []);
      const [hardwareResponse, osResponse] = result; // Fill syscollector object

      const syscollector = {
        hardware: typeof hardwareResponse === 'object' && Object.keys(hardwareResponse).length ? { ...hardwareResponse.affected_items[0]
        } : false,
        os: typeof osResponse === 'object' && Object.keys(osResponse).length ? { ...osResponse.affected_items[0]
        } : false
      };
      return response.ok({
        body: syscollector
      });
    } catch (error) {
      (0, _logger.log)('wazuh-api:getSyscollector', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 3035, 500, response);
    }
  }

  async getPlatformInfo(context, request, response) {
    try {
      const source = _fs.default.readFileSync(this.platformFile, {
        encoding: 'utf-8'
      });
      const content = _jsYaml.default.load(source);
      const login_platform_name = (content || {})['login_platform_name'] || '';
      const login_footer_text = (content || {})['login_footer_text'] || '';
      const version_name = (content || {})['version_name'] || '';
      const version_type = (content || {})['version_type'] || '';
      const version_serial_number = (content || {})['version_serial_number'] || '';
      const version_number = (content || {})['version_number'] || '';
      let res = {
        login_platform_name,
        login_footer_text,
        version_name,
        version_type,
        version_serial_number,
        version_number
      }
      return response.ok({
        body: {
          statusCode: 200,
          data: res
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(`平台信息获取错误: ${error}`, 4005, 500, response);
    }
  }

  async getPagePermission(context, request, response) {
    try {
      const source = _navPermission;
      return response.ok({
        body: {
          statusCode: 200,
          data: source
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(`权限导航获取错误: ${error}`, 4005, 500, response);
    }
  }

}

exports.WazuhApiCtrl = WazuhApiCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLWFwaS50cyJdLCJuYW1lcyI6WyJXYXp1aEFwaUN0cmwiLCJjb25zdHJ1Y3RvciIsIm1hbmFnZUhvc3RzIiwiTWFuYWdlSG9zdHMiLCJ1cGRhdGVSZWdpc3RyeSIsIlVwZGF0ZVJlZ2lzdHJ5IiwiZ2V0VG9rZW4iLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiZm9yY2UiLCJpZEhvc3QiLCJib2R5IiwidXNlcm5hbWUiLCJ3YXp1aCIsInNlY3VyaXR5IiwiZ2V0Q3VycmVudFVzZXIiLCJoZWFkZXJzIiwiY29va2llIiwid3pUb2tlbiIsImRlY29kZWRUb2tlbiIsImV4cGlyYXRpb25UaW1lIiwiZXhwIiwiRGF0ZSIsIm5vdyIsIm9rIiwidG9rZW4iLCJlcnJvciIsIm1lc3NhZ2UiLCJBUElVc2VyQWxsb3dSdW5BcyIsImNhblVzZSIsIkFQSV9VU0VSX1NUQVRVU19SVU5fQVMiLCJFTkFCTEVEIiwiYXBpIiwiY2xpZW50IiwiYXNDdXJyZW50VXNlciIsImF1dGhlbnRpY2F0ZSIsImFzSW50ZXJuYWxVc2VyIiwidGV4dFNlY3VyZSIsInNlcnZlciIsImluZm8iLCJwcm90b2NvbCIsImVycm9yTWVzc2FnZSIsImRhdGEiLCJkZXRhaWwiLCJjaGVja1N0b3JlZEFQSSIsImlkIiwiZ2V0SG9zdEJ5SWQiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiRXJyb3IiLCJyZXNwb25zZU1hbmFnZXJJbmZvIiwiYXBpSG9zdElEIiwiZm9yY2VSZWZyZXNoIiwiY2hlY2tSZXNwb25zZUlzRG93biIsInN0YXR1cyIsImNsdXN0ZXJfaW5mbyIsInJlc3BvbnNlQWdlbnRzIiwicGFyYW1zIiwiYWdlbnRzX2xpc3QiLCJtYW5hZ2VyTmFtZSIsImFmZmVjdGVkX2l0ZW1zIiwibWFuYWdlciIsInJlc3BvbnNlQ2x1c3RlclN0YXR1cyIsImVuYWJsZWQiLCJyZXNwb25zZUNsdXN0ZXJMb2NhbEluZm8iLCJjbHVzdGVyRW5hYmxlZCIsIm5vZGUiLCJjbHVzdGVyIiwidXBkYXRlQ2x1c3RlckluZm8iLCJjb3BpZWQiLCJzZWNyZXQiLCJwYXNzd29yZCIsInN0YXR1c0NvZGUiLCJpZENoYW5nZWQiLCJ1cmwiLCJwb3J0IiwiY29kZSIsImFwaUlzRG93biIsImFwaXMiLCJnZXRIb3N0cyIsInZhbGlkYXRlQ2hlY2tBcGlQYXJhbXMiLCJpbmNsdWRlcyIsImNoZWNrQVBJIiwiYXBpQXZhaWxhYmxlIiwib3B0aW9ucyIsInJlc3BvbnNlQ2x1c3RlciIsImFwaVVzZXJBbGxvd1J1bkFzIiwiQUxMX0RJU0FCTEVEIiwicmVzcG9uc2VBcGlVc2VyQWxsb3dSdW5BcyIsImFsbG93X3J1bl9hcyIsInJ1bl9hcyIsIlVTRVJfTk9UX0FMTE9XRUQiLCJIT1NUX0RJU0FCTEVEIiwiQ2FjaGVJbk1lbW9yeUFQSVVzZXJBbGxvd1J1bkFzIiwic2V0IiwicmVzcG9uc2VDbHVzdGVyTG9jYWwiLCJzb2NrZXRFcnJvckNvZGVzIiwiaXNEb3duIiwiY2hlY2tEYWVtb25zIiwicGF0aCIsImRhZW1vbnMiLCJpc0NsdXN0ZXIiLCJ3YXp1aGRiRXhpc3RzIiwiZXhlY2QiLCJtb2R1bGVzZCIsIndhenVoZGIiLCJjbHVzdGVyZCIsImlzVmFsaWQiLCJQcm9taXNlIiwicmVqZWN0Iiwic2xlZXAiLCJ0aW1lTXMiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInNob3VsZEtlZXBBcnJheUFzSXQiLCJtZXRob2QiLCJpc0FnZW50c1Jlc3RhcnQiLCJpc0FjdGl2ZVJlc3BvbnNlIiwic3RhcnRzV2l0aCIsImlzQWRkaW5nQWdlbnRzVG9Hcm91cCIsIm1ha2VSZXF1ZXN0IiwiZGV2VG9vbHMiLCJvcmlnaW4iLCJkZWxheSIsInN0YXJ0QXQiLCJydW4iLCJjaGVjayIsImRhdGFQcm9wZXJ0aWVzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5Iiwiam9pbiIsInJlc3BvbnNlVG9rZW4iLCJyZXNwb25zZUlzRG93biIsInJlc3BvbnNlQm9keSIsInJlc3BvbnNlRXJyb3IiLCJlcnJvck1zZyIsIkFwaUVycm9yRXF1aXZhbGVuY2UiLCJyZXF1ZXN0QXBpIiwiaWRBcGkiLCJtYXRjaCIsImNzdiIsImZpbHRlcnMiLCJ0bXBQYXRoIiwic3Vic3RyIiwibGltaXQiLCJmaWx0ZXIiLCJuYW1lIiwidmFsdWUiLCJpdGVtc0FycmF5Iiwib3V0cHV0IiwiaXNMaXN0IiwiZmluZCIsIl9pc0NEQkxpc3QiLCJ0b3RhbEl0ZW1zIiwidG90YWxfYWZmZWN0ZWRfaXRlbXMiLCJvZmZzZXQiLCJwdXNoIiwidG1wRGF0YSIsImlzQXJyYXlPZkxpc3RzIiwiaXNBZ2VudHMiLCJpc0FnZW50c09mR3JvdXAiLCJpc0ZpbGVzIiwiZW5kc1dpdGgiLCJmaWVsZHMiLCJmbGF0TGlzdHMiLCJsaXN0IiwicmVsYXRpdmVfZGlybmFtZSIsIml0ZW1zIiwibWFwIiwiaXRlbSIsImRlZmF1bHQiLCJqc29uMmNzdlBhcnNlciIsIlBhcnNlciIsInBhcnNlIiwiZmllbGQiLCJyZXBsYWNlIiwiS2V5RXF1aXZhbGVuY2UiLCJnZXRSZXF1ZXN0TGlzdCIsImFwaVJlcXVlc3RMaXN0IiwiZ2V0VGltZVN0YW1wIiwic291cmNlIiwiSlNPTiIsImZzIiwicmVhZEZpbGVTeW5jIiwiZmlsZSIsImluc3RhbGxhdGlvbkRhdGUiLCJsYXN0UmVzdGFydCIsInNldEV4dGVuc2lvbnMiLCJleHRlbnNpb25zIiwidXBkYXRlQVBJRXh0ZW5zaW9ucyIsImdldEV4dGVuc2lvbnMiLCJob3N0cyIsImdldFNldHVwSW5mbyIsInZhbHVlcyIsImdldFN5c2NvbGxlY3RvciIsImFnZW50IiwiYWxsIiwicmVzdWx0IiwiaGFyZHdhcmVSZXNwb25zZSIsIm9zUmVzcG9uc2UiLCJzeXNjb2xsZWN0b3IiLCJoYXJkd2FyZSIsIm9zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBYUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQUVPLE1BQU1BLFlBQU4sQ0FBbUI7QUFJeEJDLEVBQUFBLFdBQVcsR0FBRztBQUFBOztBQUFBOztBQUNaO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixJQUFJQyx3QkFBSixFQUFuQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBSUMsOEJBQUosRUFBdEI7QUFDRDs7QUFFRCxRQUFNQyxRQUFOLENBQWVDLE9BQWYsRUFBK0NDLE9BQS9DLEVBQXVFQyxRQUF2RSxFQUF3RztBQUN0RyxRQUFJO0FBQ0YsWUFBTTtBQUFFQyxRQUFBQSxLQUFGO0FBQVNDLFFBQUFBO0FBQVQsVUFBb0JILE9BQU8sQ0FBQ0ksSUFBbEM7QUFDQSxZQUFNO0FBQUVDLFFBQUFBO0FBQUYsVUFBZSxNQUFNTixPQUFPLENBQUNPLEtBQVIsQ0FBY0MsUUFBZCxDQUF1QkMsY0FBdkIsQ0FBc0NSLE9BQXRDLEVBQStDRCxPQUEvQyxDQUEzQjs7QUFDQSxVQUFJLENBQUNHLEtBQUQsSUFBVUYsT0FBTyxDQUFDUyxPQUFSLENBQWdCQyxNQUExQixJQUFvQ0wsUUFBUSxLQUFLLGtDQUFxQkwsT0FBTyxDQUFDUyxPQUFSLENBQWdCQyxNQUFyQyxFQUE2QyxTQUE3QyxDQUFqRCxJQUE0R1AsTUFBTSxLQUFLLGtDQUFxQkgsT0FBTyxDQUFDUyxPQUFSLENBQWdCQyxNQUFyQyxFQUE0QyxRQUE1QyxDQUEzSCxFQUFrTDtBQUNoTCxjQUFNQyxPQUFPLEdBQUcsa0NBQXFCWCxPQUFPLENBQUNTLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFVBQTdDLENBQWhCOztBQUNBLFlBQUlDLE9BQUosRUFBYTtBQUNYLGNBQUk7QUFBRTtBQUNKLGtCQUFNQyxZQUFZLEdBQUcsd0JBQVVELE9BQVYsQ0FBckI7QUFDQSxrQkFBTUUsY0FBYyxHQUFJRCxZQUFZLENBQUNFLEdBQWIsR0FBb0JDLElBQUksQ0FBQ0MsR0FBTCxLQUFhLElBQXpEOztBQUNBLGdCQUFJTCxPQUFPLElBQUlFLGNBQWMsR0FBRyxDQUFoQyxFQUFtQztBQUNqQyxxQkFBT1osUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCYixnQkFBQUEsSUFBSSxFQUFFO0FBQUVjLGtCQUFBQSxLQUFLLEVBQUVQO0FBQVQ7QUFEVyxlQUFaLENBQVA7QUFHRDtBQUNGLFdBUkQsQ0FRRSxPQUFPUSxLQUFQLEVBQWM7QUFDZCw2QkFBSSxvQkFBSixFQUEwQkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEzQztBQUNEO0FBQ0Y7QUFDRjs7QUFDRCxVQUFJRCxLQUFKOztBQUNBLFVBQUksT0FBTUcsd0NBQWtCQyxNQUFsQixDQUF5Qm5CLE1BQXpCLENBQU4sS0FBMENvQiw2Q0FBdUJDLE9BQXJFLEVBQThFO0FBQzVFTixRQUFBQSxLQUFLLEdBQUcsTUFBTW5CLE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDQyxZQUF2QyxDQUFvRHpCLE1BQXBELENBQWQ7QUFDRCxPQUZELE1BRU87QUFDTGUsUUFBQUEsS0FBSyxHQUFHLE1BQU1uQixPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3Q0QsWUFBeEMsQ0FBcUR6QixNQUFyRCxDQUFkO0FBQ0Q7O0FBQUE7QUFFRCxVQUFJMkIsVUFBVSxHQUFDLEVBQWY7O0FBQ0EsVUFBRy9CLE9BQU8sQ0FBQ08sS0FBUixDQUFjeUIsTUFBZCxDQUFxQkMsSUFBckIsQ0FBMEJDLFFBQTFCLEtBQXVDLE9BQTFDLEVBQWtEO0FBQ2hESCxRQUFBQSxVQUFVLEdBQUcsU0FBYjtBQUNEOztBQUVELGFBQU83QixRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJSLFFBQUFBLE9BQU8sRUFBRTtBQUNQLHdCQUFjLENBQ1gsWUFBV1MsS0FBTSxtQkFBa0JZLFVBQVcsRUFEbkMsRUFFWCxXQUFVekIsUUFBUyxtQkFBa0J5QixVQUFXLEVBRnJDLEVBR1gsVUFBUzNCLE1BQU8sa0JBSEw7QUFEUCxTQURRO0FBUWpCQyxRQUFBQSxJQUFJLEVBQUU7QUFBRWMsVUFBQUE7QUFBRjtBQVJXLE9BQVosQ0FBUDtBQVVELEtBekNELENBeUNFLE9BQU9DLEtBQVAsRUFBYztBQUNkLFlBQU1lLFlBQVksR0FBRyxDQUFDLENBQUNmLEtBQUssQ0FBQ2xCLFFBQU4sSUFBa0IsRUFBbkIsRUFBdUJrQyxJQUF2QixJQUErQixFQUFoQyxFQUFvQ0MsTUFBcEMsSUFBOENqQixLQUFLLENBQUNDLE9BQXBELElBQStERCxLQUFwRjtBQUNBLHVCQUFJLG9CQUFKLEVBQTBCZSxZQUExQjtBQUNBLGFBQU8sa0NBQ0osMENBQXlDQSxZQUFhLEVBRGxELEVBRUwsSUFGSyxFQUdMLEdBSEssRUFJTGpDLFFBSkssQ0FBUDtBQU1EO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0EsUUFBTW9DLGNBQU4sQ0FBcUJ0QyxPQUFyQixFQUFxREMsT0FBckQsRUFBNkVDLFFBQTdFLEVBQThHO0FBQzVHLFFBQUk7QUFDRjtBQUNBLFlBQU1xQyxFQUFFLEdBQUd0QyxPQUFPLENBQUNJLElBQVIsQ0FBYWtDLEVBQXhCO0FBQ0EsWUFBTWIsR0FBRyxHQUFHLE1BQU0sS0FBSy9CLFdBQUwsQ0FBaUI2QyxXQUFqQixDQUE2QkQsRUFBN0IsQ0FBbEIsQ0FIRSxDQUlGOztBQUNBLFVBQUksQ0FBQ0UsTUFBTSxDQUFDQyxJQUFQLENBQVloQixHQUFaLEVBQWlCaUIsTUFBdEIsRUFBOEI7QUFDNUIsY0FBTSxJQUFJQyxLQUFKLENBQVUsNkNBQVYsQ0FBTjtBQUNEOztBQUVELHVCQUFJLDBCQUFKLEVBQWlDLEdBQUVMLEVBQUcsU0FBdEMsRUFBZ0QsT0FBaEQsRUFURSxDQVdGOztBQUNBLFlBQU1NLG1CQUFtQixHQUFHLE1BQU03QyxPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3QzdCLE9BQXhDLENBQ2hDLEtBRGdDLEVBRS9CLGVBRitCLEVBR2hDLEVBSGdDLEVBSWhDO0FBQUU2QyxRQUFBQSxTQUFTLEVBQUVQLEVBQWI7QUFBaUJRLFFBQUFBLFlBQVksRUFBRTtBQUEvQixPQUpnQyxDQUFsQyxDQVpFLENBbUJGOztBQUNBLFVBQUksS0FBS0MsbUJBQUwsQ0FBeUJILG1CQUF6QixDQUFKLEVBQW1EO0FBQ2pELGVBQU8sa0NBQ0osZUFBY0EsbUJBQW1CLENBQUNULElBQXBCLENBQXlCQyxNQUF6QixJQUFtQyxxQkFBc0IsRUFEbkUsRUFFTCxJQUZLLEVBR0wsR0FISyxFQUlMbkMsUUFKSyxDQUFQO0FBTUQsT0EzQkMsQ0E2QkY7OztBQUNBLFVBQUkyQyxtQkFBbUIsQ0FBQ0ksTUFBcEIsS0FBK0IsR0FBL0IsSUFBc0NKLG1CQUFtQixDQUFDVCxJQUE5RCxFQUFvRTtBQUNsRTtBQUNBLGVBQU9WLEdBQUcsQ0FBQ3dCLFlBQVg7QUFDQSxjQUFNQyxjQUFjLEdBQUcsTUFBTW5ELE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJHLGNBQXpCLENBQXdDN0IsT0FBeEMsQ0FDM0IsS0FEMkIsRUFFMUIsU0FGMEIsRUFHM0I7QUFBRW1ELFVBQUFBLE1BQU0sRUFBRTtBQUFFQyxZQUFBQSxXQUFXLEVBQUU7QUFBZjtBQUFWLFNBSDJCLEVBSTNCO0FBQUVQLFVBQUFBLFNBQVMsRUFBRVA7QUFBYixTQUoyQixDQUE3Qjs7QUFPQSxZQUFJWSxjQUFjLENBQUNGLE1BQWYsS0FBMEIsR0FBOUIsRUFBbUM7QUFDakMsZ0JBQU1LLFdBQVcsR0FBR0gsY0FBYyxDQUFDZixJQUFmLENBQW9CQSxJQUFwQixDQUF5Qm1CLGNBQXpCLENBQXdDLENBQXhDLEVBQTJDQyxPQUEvRDtBQUVBLGdCQUFNQyxxQkFBcUIsR0FBRyxNQUFNekQsT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkcsY0FBekIsQ0FBd0M3QixPQUF4QyxDQUNsQyxLQURrQyxFQUVqQyxpQkFGaUMsRUFHbEMsRUFIa0MsRUFJbEM7QUFBRTZDLFlBQUFBLFNBQVMsRUFBRVA7QUFBYixXQUprQyxDQUFwQzs7QUFNQSxjQUFJa0IscUJBQXFCLENBQUNSLE1BQXRCLEtBQWlDLEdBQXJDLEVBQTBDO0FBQ3hDLGdCQUFJUSxxQkFBcUIsQ0FBQ3JCLElBQXRCLENBQTJCQSxJQUEzQixDQUFnQ3NCLE9BQWhDLEtBQTRDLEtBQWhELEVBQXVEO0FBQ3JELG9CQUFNQyx3QkFBd0IsR0FBRyxNQUFNM0QsT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkcsY0FBekIsQ0FBd0M3QixPQUF4QyxDQUNyQyxLQURxQyxFQUVwQyxxQkFGb0MsRUFHckMsRUFIcUMsRUFJckM7QUFBRTZDLGdCQUFBQSxTQUFTLEVBQUVQO0FBQWIsZUFKcUMsQ0FBdkM7O0FBTUEsa0JBQUlvQix3QkFBd0IsQ0FBQ1YsTUFBekIsS0FBb0MsR0FBeEMsRUFBNkM7QUFDM0Msc0JBQU1XLGNBQWMsR0FBR0gscUJBQXFCLENBQUNyQixJQUF0QixDQUEyQkEsSUFBM0IsQ0FBZ0NzQixPQUFoQyxLQUE0QyxLQUFuRTtBQUNBaEMsZ0JBQUFBLEdBQUcsQ0FBQ3dCLFlBQUosR0FBbUI7QUFDakJELGtCQUFBQSxNQUFNLEVBQUVXLGNBQWMsR0FBRyxTQUFILEdBQWUsVUFEcEI7QUFFakJKLGtCQUFBQSxPQUFPLEVBQUVGLFdBRlE7QUFHakJPLGtCQUFBQSxJQUFJLEVBQUVGLHdCQUF3QixDQUFDdkIsSUFBekIsQ0FBOEJBLElBQTlCLENBQW1DbUIsY0FBbkMsQ0FBa0QsQ0FBbEQsRUFBcURNLElBSDFDO0FBSWpCQyxrQkFBQUEsT0FBTyxFQUFFRixjQUFjLEdBQ25CRCx3QkFBd0IsQ0FBQ3ZCLElBQXpCLENBQThCQSxJQUE5QixDQUFtQ21CLGNBQW5DLENBQWtELENBQWxELEVBQXFETyxPQURsQyxHQUVuQjtBQU5hLGlCQUFuQjtBQVFEO0FBQ0YsYUFsQkQsTUFrQk87QUFDTDtBQUNBcEMsY0FBQUEsR0FBRyxDQUFDd0IsWUFBSixHQUFtQjtBQUNqQkQsZ0JBQUFBLE1BQU0sRUFBRSxVQURTO0FBRWpCTyxnQkFBQUEsT0FBTyxFQUFFRixXQUZRO0FBR2pCUSxnQkFBQUEsT0FBTyxFQUFFO0FBSFEsZUFBbkI7QUFLRDtBQUNGLFdBM0JELE1BMkJPO0FBQ0w7QUFDQXBDLFlBQUFBLEdBQUcsQ0FBQ3dCLFlBQUosR0FBbUI7QUFDakJELGNBQUFBLE1BQU0sRUFBRSxVQURTO0FBRWpCTyxjQUFBQSxPQUFPLEVBQUVGLFdBRlE7QUFHakJRLGNBQUFBLE9BQU8sRUFBRTtBQUhRLGFBQW5CO0FBS0Q7O0FBRUQsY0FBSXBDLEdBQUcsQ0FBQ3dCLFlBQVIsRUFBc0I7QUFDcEI7QUFDQSxrQkFBTSxLQUFLckQsY0FBTCxDQUFvQmtFLGlCQUFwQixDQUFzQ3hCLEVBQXRDLEVBQTBDYixHQUFHLENBQUN3QixZQUE5QyxDQUFOLENBRm9CLENBSXBCOztBQUNBLGtCQUFNYyxNQUFNLEdBQUcsRUFBRSxHQUFHdEM7QUFBTCxhQUFmO0FBQ0FzQyxZQUFBQSxNQUFNLENBQUNDLE1BQVAsR0FBZ0IsTUFBaEI7QUFDQUQsWUFBQUEsTUFBTSxDQUFDRSxRQUFQLEdBQWtCLE1BQWxCO0FBRUEsbUJBQU9oRSxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLGNBQUFBLElBQUksRUFBRTtBQUNKOEQsZ0JBQUFBLFVBQVUsRUFBRSxHQURSO0FBRUovQixnQkFBQUEsSUFBSSxFQUFFNEIsTUFGRjtBQUdKSSxnQkFBQUEsU0FBUyxFQUFFbkUsT0FBTyxDQUFDSSxJQUFSLENBQWErRCxTQUFiLElBQTBCO0FBSGpDO0FBRFcsYUFBWixDQUFQO0FBT0Q7QUFDRjtBQUNGLE9BdkdDLENBeUdGOzs7QUFDQSxZQUFNLElBQUl4QixLQUFKLENBQVVDLG1CQUFtQixDQUFDVCxJQUFwQixDQUF5QkMsTUFBekIsSUFBb0MsR0FBRVgsR0FBRyxDQUFDMkMsR0FBSSxJQUFHM0MsR0FBRyxDQUFDNEMsSUFBSyxpQkFBcEUsQ0FBTjtBQUNELEtBM0dELENBMkdFLE9BQU9sRCxLQUFQLEVBQWM7QUFDZCx1QkFBSSwwQkFBSixFQUFnQ0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUFqRDs7QUFDQSxVQUFJQSxLQUFLLENBQUNtRCxJQUFOLEtBQWUsUUFBbkIsRUFBNkI7QUFDM0IsZUFBT3JFLFFBQVEsQ0FBQ2dCLEVBQVQsQ0FBWTtBQUNqQmIsVUFBQUEsSUFBSSxFQUFFO0FBQ0o4RCxZQUFBQSxVQUFVLEVBQUUsR0FEUjtBQUVKL0IsWUFBQUEsSUFBSSxFQUFFO0FBQUU4QixjQUFBQSxRQUFRLEVBQUUsTUFBWjtBQUFvQk0sY0FBQUEsU0FBUyxFQUFFO0FBQS9CO0FBRkY7QUFEVyxTQUFaLENBQVA7QUFNRCxPQVBELE1BT08sSUFBSXBELEtBQUssQ0FBQ21ELElBQU4sS0FBZSxjQUFuQixFQUFtQztBQUN4QyxlQUFPckUsUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCYixVQUFBQSxJQUFJLEVBQUU7QUFDSjhELFlBQUFBLFVBQVUsRUFBRSxHQURSO0FBRUovQixZQUFBQSxJQUFJLEVBQUU7QUFBRThCLGNBQUFBLFFBQVEsRUFBRSxNQUFaO0FBQW9CTSxjQUFBQSxTQUFTLEVBQUU7QUFBL0I7QUFGRjtBQURXLFNBQVosQ0FBUDtBQU1ELE9BUE0sTUFPQTtBQUNMLFlBQUk7QUFDRixnQkFBTUMsSUFBSSxHQUFHLE1BQU0sS0FBSzlFLFdBQUwsQ0FBaUIrRSxRQUFqQixFQUFuQjs7QUFDQSxlQUFLLE1BQU1oRCxHQUFYLElBQWtCK0MsSUFBbEIsRUFBd0I7QUFDdEIsZ0JBQUk7QUFDRixvQkFBTWxDLEVBQUUsR0FBR0UsTUFBTSxDQUFDQyxJQUFQLENBQVloQixHQUFaLEVBQWlCLENBQWpCLENBQVg7QUFFQSxvQkFBTW1CLG1CQUFtQixHQUFHLE1BQU03QyxPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3QzdCLE9BQXhDLENBQ2hDLEtBRGdDLEVBRS9CLGVBRitCLEVBR2hDLEVBSGdDLEVBSWhDO0FBQUU2QyxnQkFBQUEsU0FBUyxFQUFFUDtBQUFiLGVBSmdDLENBQWxDOztBQU9BLGtCQUFJLEtBQUtTLG1CQUFMLENBQXlCSCxtQkFBekIsQ0FBSixFQUFtRDtBQUNqRCx1QkFBTyxrQ0FDSixlQUFjM0MsUUFBUSxDQUFDa0MsSUFBVCxDQUFjQyxNQUFkLElBQXdCLHFCQUFzQixFQUR4RCxFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxuQyxRQUpLLENBQVA7QUFNRDs7QUFDRCxrQkFBSTJDLG1CQUFtQixDQUFDSSxNQUFwQixLQUErQixHQUFuQyxFQUF3QztBQUN0Q2hELGdCQUFBQSxPQUFPLENBQUNJLElBQVIsQ0FBYWtDLEVBQWIsR0FBa0JBLEVBQWxCO0FBQ0F0QyxnQkFBQUEsT0FBTyxDQUFDSSxJQUFSLENBQWErRCxTQUFiLEdBQXlCN0IsRUFBekI7QUFDQSx1QkFBTyxNQUFNLEtBQUtELGNBQUwsQ0FBb0J0QyxPQUFwQixFQUE2QkMsT0FBN0IsRUFBc0NDLFFBQXRDLENBQWI7QUFDRDtBQUNGLGFBdkJELENBdUJFLE9BQU9rQixLQUFQLEVBQWMsQ0FBRyxDQXhCRyxDQXdCRjs7QUFDckI7QUFDRixTQTVCRCxDQTRCRSxPQUFPQSxLQUFQLEVBQWM7QUFDZCxpQkFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRGxCLFFBQWpELENBQVA7QUFDRDs7QUFDRCxlQUFPLGtDQUFja0IsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRGxCLFFBQWpELENBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFFRDs7Ozs7O0FBSUF5RSxFQUFBQSxzQkFBc0IsQ0FBQ3RFLElBQUQsRUFBTztBQUMzQixRQUFJLEVBQUUsY0FBY0EsSUFBaEIsQ0FBSixFQUEyQjtBQUN6QixhQUFPLDZCQUFQO0FBQ0Q7O0FBRUQsUUFBSSxFQUFFLGNBQWNBLElBQWhCLEtBQXlCLEVBQUUsUUFBUUEsSUFBVixDQUE3QixFQUE4QztBQUM1QyxhQUFPLDZCQUFQO0FBQ0Q7O0FBRUQsUUFBSSxFQUFFLFNBQVNBLElBQVgsQ0FBSixFQUFzQjtBQUNwQixhQUFPLHdCQUFQO0FBQ0Q7O0FBRUQsUUFBSSxFQUFFLFVBQVVBLElBQVosQ0FBSixFQUF1QjtBQUNyQixhQUFPLHlCQUFQO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDQSxJQUFJLENBQUNnRSxHQUFMLENBQVNPLFFBQVQsQ0FBa0IsVUFBbEIsQ0FBRCxJQUFrQyxDQUFDdkUsSUFBSSxDQUFDZ0UsR0FBTCxDQUFTTyxRQUFULENBQWtCLFNBQWxCLENBQXZDLEVBQXFFO0FBQ25FLGFBQU8sZ0JBQVA7QUFDRDs7QUFFRCxXQUFPLEtBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNQyxRQUFOLENBQWU3RSxPQUFmLEVBQStDQyxPQUEvQyxFQUF1RUMsUUFBdkUsRUFBd0c7QUFDdEcsUUFBSTtBQUNGLFVBQUk0RSxZQUFZLEdBQUcsSUFBbkIsQ0FERSxDQUVGO0FBQ0E7O0FBQ0EsdUJBQUksb0JBQUosRUFBMkIsR0FBRTdFLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBRyxXQUE3QyxFQUF5RCxPQUF6RCxFQUpFLENBS0Y7O0FBQ0EsWUFBTUgsSUFBSSxHQUFHLE1BQU0sS0FBS3pDLFdBQUwsQ0FBaUI2QyxXQUFqQixDQUE2QnZDLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBMUMsQ0FBbkI7O0FBQ0EsVUFBSUgsSUFBSixFQUFVO0FBQ1IwQyxRQUFBQSxZQUFZLEdBQUcxQyxJQUFmO0FBQ0QsT0FGRCxNQUVPO0FBQ0wseUJBQUksb0JBQUosRUFBMkIsT0FBTW5DLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBRyxZQUFqRDtBQUNBLGVBQU8sa0NBQWUsV0FBVXRDLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBRyxnQkFBekMsRUFBMEQsSUFBMUQsRUFBZ0UsR0FBaEUsRUFBcUVyQyxRQUFyRSxDQUFQO0FBQ0Q7O0FBQ0QsWUFBTTZFLE9BQU8sR0FBRztBQUFFakMsUUFBQUEsU0FBUyxFQUFFN0MsT0FBTyxDQUFDSSxJQUFSLENBQWFrQztBQUExQixPQUFoQjs7QUFDQSxVQUFJdEMsT0FBTyxDQUFDSSxJQUFSLENBQWEwQyxZQUFqQixFQUErQjtBQUM3QmdDLFFBQUFBLE9BQU8sQ0FBQyxjQUFELENBQVAsR0FBMEI5RSxPQUFPLENBQUNJLElBQVIsQ0FBYTBDLFlBQXZDO0FBQ0Q7O0FBQ0QsVUFBSUYsbUJBQUo7O0FBQ0EsVUFBRztBQUNEQSxRQUFBQSxtQkFBbUIsR0FBRyxNQUFNN0MsT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkcsY0FBekIsQ0FBd0M3QixPQUF4QyxDQUMxQixLQUQwQixFQUV6QixlQUZ5QixFQUcxQixFQUgwQixFQUkxQjhFLE9BSjBCLENBQTVCO0FBTUQsT0FQRCxDQU9DLE9BQU0zRCxLQUFOLEVBQVk7QUFDWCxlQUFPLGtDQUNKLGVBQWNBLEtBQUssQ0FBQ2xCLFFBQU4sQ0FBZWtDLElBQWYsQ0FBb0JDLE1BQXBCLElBQThCLHFCQUFzQixFQUQ5RCxFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxuQyxRQUpLLENBQVA7QUFNRDs7QUFFRCx1QkFBSSxvQkFBSixFQUEyQixHQUFFRCxPQUFPLENBQUNJLElBQVIsQ0FBYWtDLEVBQUcsd0JBQTdDLEVBQXNFLE9BQXRFOztBQUNBLFVBQUlNLG1CQUFtQixDQUFDSSxNQUFwQixLQUErQixHQUEvQixJQUFzQ0osbUJBQW1CLENBQUNULElBQTlELEVBQW9FO0FBQ2xFLFlBQUllLGNBQWMsR0FBRyxNQUFNbkQsT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkcsY0FBekIsQ0FBd0M3QixPQUF4QyxDQUN6QixLQUR5QixFQUV4QixTQUZ3QixFQUd6QjtBQUFFbUQsVUFBQUEsTUFBTSxFQUFFO0FBQUVDLFlBQUFBLFdBQVcsRUFBRTtBQUFmO0FBQVYsU0FIeUIsRUFJekI7QUFBRVAsVUFBQUEsU0FBUyxFQUFFN0MsT0FBTyxDQUFDSSxJQUFSLENBQWFrQztBQUExQixTQUp5QixDQUEzQjs7QUFPQSxZQUFJWSxjQUFjLENBQUNGLE1BQWYsS0FBMEIsR0FBOUIsRUFBbUM7QUFDakMsZ0JBQU1LLFdBQVcsR0FBR0gsY0FBYyxDQUFDZixJQUFmLENBQW9CQSxJQUFwQixDQUF5Qm1CLGNBQXpCLENBQXdDLENBQXhDLEVBQTJDQyxPQUEvRDtBQUVBLGNBQUl3QixlQUFlLEdBQUcsTUFBTWhGLE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJHLGNBQXpCLENBQXdDN0IsT0FBeEMsQ0FDMUIsS0FEMEIsRUFFekIsaUJBRnlCLEVBRzFCLEVBSDBCLEVBSTFCO0FBQUU2QyxZQUFBQSxTQUFTLEVBQUU3QyxPQUFPLENBQUNJLElBQVIsQ0FBYWtDO0FBQTFCLFdBSjBCLENBQTVCLENBSGlDLENBVWpDOztBQUNBLGNBQUkwQyxpQkFBaUIsR0FBR3pELDZDQUF1QjBELFlBQS9DO0FBQ0EsZ0JBQU1DLHlCQUF5QixHQUFHLE1BQU1uRixPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3QzdCLE9BQXhDLENBQ3RDLEtBRHNDLEVBRXJDLG9CQUZxQyxFQUd0QyxFQUhzQyxFQUl0QztBQUFFNkMsWUFBQUEsU0FBUyxFQUFFN0MsT0FBTyxDQUFDSSxJQUFSLENBQWFrQztBQUExQixXQUpzQyxDQUF4Qzs7QUFNQSxjQUFJNEMseUJBQXlCLENBQUNsQyxNQUExQixLQUFxQyxHQUF6QyxFQUE4QztBQUM1QyxrQkFBTW1DLFlBQVksR0FBR0QseUJBQXlCLENBQUMvQyxJQUExQixDQUErQkEsSUFBL0IsQ0FBb0NtQixjQUFwQyxDQUFtRCxDQUFuRCxFQUFzRDZCLFlBQTNFO0FBRUEsZ0JBQUlBLFlBQVksSUFBSU4sWUFBaEIsSUFBZ0NBLFlBQVksQ0FBQ08sTUFBakQsRUFBeUQ7QUFDdkRKLGNBQUFBLGlCQUFpQixHQUFHekQsNkNBQXVCQyxPQUEzQyxDQURGLEtBR0ssSUFBSSxDQUFDMkQsWUFBRCxJQUFpQk4sWUFBakIsSUFBaUNBLFlBQVksQ0FBQ08sTUFBbEQsRUFBeUQ7QUFDNURKLGNBQUFBLGlCQUFpQixHQUFHekQsNkNBQXVCOEQsZ0JBQTNDLENBREcsS0FHQSxJQUFJRixZQUFZLEtBQU0sQ0FBQ04sWUFBRCxJQUFpQixDQUFDQSxZQUFZLENBQUNPLE1BQXJDLENBQWhCLEVBQStEO0FBQ2xFSixjQUFBQSxpQkFBaUIsR0FBR3pELDZDQUF1QitELGFBQTNDLENBREcsS0FHQSxJQUFJLENBQUNILFlBQUQsS0FBbUIsQ0FBQ04sWUFBRCxJQUFpQixDQUFDQSxZQUFZLENBQUNPLE1BQWxELENBQUosRUFBZ0U7QUFDbkVKLGNBQUFBLGlCQUFpQixHQUFHekQsNkNBQXVCMEQsWUFBM0M7QUFDSDs7QUFDRE0sK0RBQStCQyxHQUEvQixDQUNFeEYsT0FBTyxDQUFDSSxJQUFSLENBQWFrQyxFQURmLEVBRUV1QyxZQUFZLENBQUN4RSxRQUZmLEVBR0UyRSxpQkFIRjs7QUFNQSxjQUFJRCxlQUFlLENBQUMvQixNQUFoQixLQUEyQixHQUEvQixFQUFvQztBQUNsQyw2QkFBSSwwQkFBSixFQUFpQyw2QkFBakMsRUFBK0QsT0FBL0Q7O0FBQ0EsZ0JBQUkrQixlQUFlLENBQUM1QyxJQUFoQixDQUFxQkEsSUFBckIsQ0FBMEJzQixPQUExQixLQUFzQyxLQUExQyxFQUFpRDtBQUMvQztBQUNBLGtCQUFJZ0Msb0JBQW9CLEdBQUcsTUFBTTFGLE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJHLGNBQXpCLENBQXdDN0IsT0FBeEMsQ0FDL0IsS0FEK0IsRUFFOUIscUJBRjhCLEVBRy9CLEVBSCtCLEVBSS9CO0FBQUU2QyxnQkFBQUEsU0FBUyxFQUFFN0MsT0FBTyxDQUFDSSxJQUFSLENBQWFrQztBQUExQixlQUorQixDQUFqQzs7QUFPQSxrQkFBSW1ELG9CQUFvQixDQUFDekMsTUFBckIsS0FBZ0MsR0FBcEMsRUFBeUM7QUFDdkMsdUJBQU8vQyxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLGtCQUFBQSxJQUFJLEVBQUU7QUFDSm1ELG9CQUFBQSxPQUFPLEVBQUVGLFdBREw7QUFFSk8sb0JBQUFBLElBQUksRUFBRTZCLG9CQUFvQixDQUFDdEQsSUFBckIsQ0FBMEJBLElBQTFCLENBQStCbUIsY0FBL0IsQ0FBOEMsQ0FBOUMsRUFBaURNLElBRm5EO0FBR0pDLG9CQUFBQSxPQUFPLEVBQUU0QixvQkFBb0IsQ0FBQ3RELElBQXJCLENBQTBCQSxJQUExQixDQUErQm1CLGNBQS9CLENBQThDLENBQTlDLEVBQWlETyxPQUh0RDtBQUlKYixvQkFBQUEsTUFBTSxFQUFFLFNBSko7QUFLSm1DLG9CQUFBQSxZQUFZLEVBQUVIO0FBTFY7QUFEVyxpQkFBWixDQUFQO0FBU0Q7QUFDRixhQXBCRCxNQW9CTztBQUNMO0FBQ0EscUJBQU8vRSxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLGdCQUFBQSxJQUFJLEVBQUU7QUFDSm1ELGtCQUFBQSxPQUFPLEVBQUVGLFdBREw7QUFFSlEsa0JBQUFBLE9BQU8sRUFBRSxVQUZMO0FBR0piLGtCQUFBQSxNQUFNLEVBQUUsVUFISjtBQUlKbUMsa0JBQUFBLFlBQVksRUFBRUg7QUFKVjtBQURXLGVBQVosQ0FBUDtBQVFEO0FBQ0Y7QUFDRjtBQUNGO0FBQ0YsS0F0SEQsQ0FzSEUsT0FBTzdELEtBQVAsRUFBYztBQUNkLHVCQUFJLG9CQUFKLEVBQTBCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQTNDOztBQUVBLFVBQUlBLEtBQUssSUFBSUEsS0FBSyxDQUFDbEIsUUFBZixJQUEyQmtCLEtBQUssQ0FBQ2xCLFFBQU4sQ0FBZStDLE1BQWYsS0FBMEIsR0FBekQsRUFBOEQ7QUFDNUQsZUFBTyxrQ0FDSiw4Q0FBNkM3QixLQUFLLENBQUNsQixRQUFOLENBQWVrQyxJQUFmLENBQW9CZixPQUFRLEVBRHJFLEVBRUwsR0FGSyxFQUdMLEdBSEssRUFJTG5CLFFBSkssQ0FBUDtBQU1EOztBQUNELFVBQUlrQixLQUFLLElBQUlBLEtBQUssQ0FBQ2xCLFFBQWYsSUFBMkJrQixLQUFLLENBQUNsQixRQUFOLENBQWVrQyxJQUExQyxJQUFrRGhCLEtBQUssQ0FBQ2xCLFFBQU4sQ0FBZWtDLElBQWYsQ0FBb0JDLE1BQTFFLEVBQWtGO0FBQ2hGLGVBQU8sa0NBQ0xqQixLQUFLLENBQUNsQixRQUFOLENBQWVrQyxJQUFmLENBQW9CQyxNQURmLEVBRUxqQixLQUFLLENBQUNsQixRQUFOLENBQWUrQyxNQUFmLElBQXlCLEdBRnBCLEVBR0w3QixLQUFLLENBQUNsQixRQUFOLENBQWUrQyxNQUFmLElBQXlCLEdBSHBCLEVBSUwvQyxRQUpLLENBQVA7QUFNRDs7QUFDRCxVQUFJa0IsS0FBSyxDQUFDbUQsSUFBTixLQUFlLFFBQW5CLEVBQTZCO0FBQzNCLGVBQU8sa0NBQ0wsdURBREssRUFFTCxJQUZLLEVBR0wsR0FISyxFQUlMckUsUUFKSyxDQUFQO0FBTUQ7O0FBQ0QsYUFBTyxrQ0FBY2tCLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURsQixRQUFqRCxDQUFQO0FBQ0Q7QUFDRjs7QUFFRDhDLEVBQUFBLG1CQUFtQixDQUFDOUMsUUFBRCxFQUFXO0FBQzVCLFFBQUlBLFFBQVEsQ0FBQytDLE1BQVQsS0FBb0IsR0FBeEIsRUFBNkI7QUFDM0I7QUFDQSxZQUFNMEMsZ0JBQWdCLEdBQUcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFBbUIsSUFBbkIsRUFBeUIsSUFBekIsQ0FBekI7QUFDQSxZQUFNMUMsTUFBTSxHQUFHLENBQUMvQyxRQUFRLENBQUNrQyxJQUFULElBQWlCLEVBQWxCLEVBQXNCYSxNQUF0QixJQUFnQyxDQUEvQztBQUNBLFlBQU0yQyxNQUFNLEdBQUdELGdCQUFnQixDQUFDZixRQUFqQixDQUEwQjNCLE1BQTFCLENBQWY7QUFFQTJDLE1BQUFBLE1BQU0sSUFBSSxpQkFBSSx1QkFBSixFQUE2QixnREFBN0IsQ0FBVjtBQUVBLGFBQU9BLE1BQVA7QUFDRDs7QUFDRCxXQUFPLEtBQVA7QUFDRDtBQUVEOzs7Ozs7OztBQU1BLFFBQU1DLFlBQU4sQ0FBbUI3RixPQUFuQixFQUE0QjBCLEdBQTVCLEVBQWlDb0UsSUFBakMsRUFBdUM7QUFDckMsUUFBSTtBQUNGLFlBQU01RixRQUFRLEdBQUcsTUFBTUYsT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkcsY0FBekIsQ0FBd0M3QixPQUF4QyxDQUNyQixLQURxQixFQUVyQixpQkFGcUIsRUFHckIsRUFIcUIsRUFJckI7QUFBRTZDLFFBQUFBLFNBQVMsRUFBRXBCLEdBQUcsQ0FBQ2E7QUFBakIsT0FKcUIsQ0FBdkI7QUFPQSxZQUFNd0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM3RixRQUFRLElBQUksRUFBYixFQUFpQmtDLElBQWpCLElBQXlCLEVBQTFCLEVBQThCQSxJQUE5QixJQUFzQyxFQUF2QyxFQUEyQ21CLGNBQTNDLElBQTZELEVBQTlELEVBQWtFLENBQWxFLEtBQXdFLEVBQXhGO0FBRUEsWUFBTXlDLFNBQVMsR0FDYixDQUFDLENBQUN0RSxHQUFHLElBQUksRUFBUixFQUFZd0IsWUFBWixJQUE0QixFQUE3QixFQUFpQ0QsTUFBakMsS0FBNEMsU0FBNUMsSUFDQSxPQUFPOEMsT0FBTyxDQUFDLGdCQUFELENBQWQsS0FBcUMsV0FGdkM7QUFHQSxZQUFNRSxhQUFhLEdBQUcsT0FBT0YsT0FBTyxDQUFDLFVBQUQsQ0FBZCxLQUErQixXQUFyRDtBQUVBLFlBQU1HLEtBQUssR0FBR0gsT0FBTyxDQUFDLGFBQUQsQ0FBUCxLQUEyQixTQUF6QztBQUNBLFlBQU1JLFFBQVEsR0FBR0osT0FBTyxDQUFDLGdCQUFELENBQVAsS0FBOEIsU0FBL0M7QUFDQSxZQUFNSyxPQUFPLEdBQUdILGFBQWEsR0FBR0YsT0FBTyxDQUFDLFVBQUQsQ0FBUCxLQUF3QixTQUEzQixHQUF1QyxJQUFwRTtBQUNBLFlBQU1NLFFBQVEsR0FBR0wsU0FBUyxHQUFHRCxPQUFPLENBQUMsZ0JBQUQsQ0FBUCxLQUE4QixTQUFqQyxHQUE2QyxJQUF2RTtBQUVBLFlBQU1PLE9BQU8sR0FBR0osS0FBSyxJQUFJQyxRQUFULElBQXFCQyxPQUFyQixJQUFnQ0MsUUFBaEQ7QUFFQUMsTUFBQUEsT0FBTyxJQUFJLGlCQUFJLHdCQUFKLEVBQStCLGdCQUEvQixFQUFnRCxPQUFoRCxDQUFYOztBQUVBLFVBQUlSLElBQUksS0FBSyxPQUFiLEVBQXNCO0FBQ3BCLGVBQU87QUFBRVEsVUFBQUE7QUFBRixTQUFQO0FBQ0Q7O0FBRUQsVUFBSSxDQUFDQSxPQUFMLEVBQWM7QUFDWixjQUFNLElBQUkxRCxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNEO0FBQ0YsS0EvQkQsQ0ErQkUsT0FBT3hCLEtBQVAsRUFBYztBQUNkLHVCQUFJLHdCQUFKLEVBQThCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQS9DO0FBQ0EsYUFBT21GLE9BQU8sQ0FBQ0MsTUFBUixDQUFlcEYsS0FBZixDQUFQO0FBQ0Q7QUFDRjs7QUFFRHFGLEVBQUFBLEtBQUssQ0FBQ0MsTUFBRCxFQUFTO0FBQ1o7QUFDQSxXQUFPLElBQUlILE9BQUosQ0FBWSxDQUFDSSxPQUFELEVBQVVILE1BQVYsS0FBcUI7QUFDdENJLE1BQUFBLFVBQVUsQ0FBQ0QsT0FBRCxFQUFVRCxNQUFWLENBQVY7QUFDRCxLQUZNLENBQVA7QUFHRDtBQUVEOzs7Ozs7Ozs7OztBQVNBRyxFQUFBQSxtQkFBbUIsQ0FBQ0MsTUFBRCxFQUFTaEIsSUFBVCxFQUFlO0FBQ2hDO0FBQ0EsVUFBTWlCLGVBQWUsR0FBR0QsTUFBTSxLQUFLLE1BQVgsSUFBcUJoQixJQUFJLEtBQUssaUJBQXREO0FBQ0EsVUFBTWtCLGdCQUFnQixHQUFHRixNQUFNLEtBQUssS0FBWCxJQUFvQmhCLElBQUksQ0FBQ21CLFVBQUwsQ0FBZ0IsbUJBQWhCLENBQTdDO0FBQ0EsVUFBTUMscUJBQXFCLEdBQUdKLE1BQU0sS0FBSyxNQUFYLElBQXFCaEIsSUFBSSxDQUFDbUIsVUFBTCxDQUFnQixnQkFBaEIsQ0FBbkQsQ0FKZ0MsQ0FNaEM7O0FBQ0EsV0FBT0YsZUFBZSxJQUFJQyxnQkFBbkIsSUFBdUNFLHFCQUE5QztBQUNEO0FBRUQ7Ozs7Ozs7Ozs7O0FBU0EsUUFBTUMsV0FBTixDQUFrQm5ILE9BQWxCLEVBQTJCOEcsTUFBM0IsRUFBbUNoQixJQUFuQyxFQUF5QzFELElBQXpDLEVBQStDRyxFQUEvQyxFQUFtRHJDLFFBQW5ELEVBQTZEO0FBQzNELFVBQU1rSCxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUNoRixJQUFJLElBQUksRUFBVCxFQUFhZ0YsUUFBaEM7O0FBQ0EsUUFBSTtBQUNGLFlBQU0xRixHQUFHLEdBQUcsTUFBTSxLQUFLL0IsV0FBTCxDQUFpQjZDLFdBQWpCLENBQTZCRCxFQUE3QixDQUFsQjs7QUFDQSxVQUFJNkUsUUFBSixFQUFjO0FBQ1osZUFBT2hGLElBQUksQ0FBQ2dGLFFBQVo7QUFDRDs7QUFFRCxVQUFJLENBQUMzRSxNQUFNLENBQUNDLElBQVAsQ0FBWWhCLEdBQVosRUFBaUJpQixNQUF0QixFQUE4QjtBQUM1Qix5QkFBSSx1QkFBSixFQUE2QixnQ0FBN0IsRUFENEIsQ0FFNUI7O0FBQ0EsZUFBTyxrQ0FBYyxnQ0FBZCxFQUFnRCxJQUFoRCxFQUFzRCxHQUF0RCxFQUEyRHpDLFFBQTNELENBQVA7QUFDRDs7QUFFRCxVQUFJLENBQUNrQyxJQUFMLEVBQVc7QUFDVEEsUUFBQUEsSUFBSSxHQUFHLEVBQVA7QUFDRDs7QUFBQTs7QUFFRCxVQUFJLENBQUNBLElBQUksQ0FBQzFCLE9BQVYsRUFBbUI7QUFDakIwQixRQUFBQSxJQUFJLENBQUMxQixPQUFMLEdBQWUsRUFBZjtBQUNEOztBQUFBO0FBRUQsWUFBTXFFLE9BQU8sR0FBRztBQUNkakMsUUFBQUEsU0FBUyxFQUFFUDtBQURHLE9BQWhCLENBcEJFLENBd0JGOztBQUNBLFVBQUksT0FBTyxDQUFDSCxJQUFJLElBQUksRUFBVCxFQUFhL0IsSUFBcEIsS0FBNkIsUUFBN0IsSUFBeUMsQ0FBQytCLElBQUksSUFBSSxFQUFULEVBQWFpRixNQUFiLEtBQXdCLFdBQXJFLEVBQWtGO0FBQ2hGakYsUUFBQUEsSUFBSSxDQUFDMUIsT0FBTCxDQUFhLGNBQWIsSUFBK0IsaUJBQS9CO0FBQ0EsZUFBTzBCLElBQUksQ0FBQ2lGLE1BQVo7QUFDRDs7QUFFRCxVQUFJLE9BQU8sQ0FBQ2pGLElBQUksSUFBSSxFQUFULEVBQWEvQixJQUFwQixLQUE2QixRQUE3QixJQUF5QyxDQUFDK0IsSUFBSSxJQUFJLEVBQVQsRUFBYWlGLE1BQWIsS0FBd0IsTUFBckUsRUFBNkU7QUFDM0VqRixRQUFBQSxJQUFJLENBQUMxQixPQUFMLENBQWEsY0FBYixJQUErQixrQkFBL0I7QUFDQSxlQUFPMEIsSUFBSSxDQUFDaUYsTUFBWjtBQUNEOztBQUVELFVBQUksT0FBTyxDQUFDakYsSUFBSSxJQUFJLEVBQVQsRUFBYS9CLElBQXBCLEtBQTZCLFFBQTdCLElBQXlDLENBQUMrQixJQUFJLElBQUksRUFBVCxFQUFhaUYsTUFBYixLQUF3QixLQUFyRSxFQUE0RTtBQUMxRWpGLFFBQUFBLElBQUksQ0FBQzFCLE9BQUwsQ0FBYSxjQUFiLElBQStCLDBCQUEvQjtBQUNBLGVBQU8wQixJQUFJLENBQUNpRixNQUFaO0FBQ0Q7O0FBQ0QsWUFBTUMsS0FBSyxHQUFHLENBQUNsRixJQUFJLElBQUksRUFBVCxFQUFha0YsS0FBYixJQUFzQixDQUFwQzs7QUFDQSxVQUFJQSxLQUFKLEVBQVc7QUFDVCxrQ0FBYztBQUNaQyxVQUFBQSxPQUFPLEVBQUUsSUFBSXZHLElBQUosQ0FBU0EsSUFBSSxDQUFDQyxHQUFMLEtBQWFxRyxLQUF0QixDQURHO0FBRVpFLFVBQUFBLEdBQUcsRUFBRSxZQUFZO0FBQ2YsZ0JBQUc7QUFDRCxvQkFBTXhILE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDM0IsT0FBdkMsQ0FBK0M2RyxNQUEvQyxFQUF1RGhCLElBQXZELEVBQTZEMUQsSUFBN0QsRUFBbUUyQyxPQUFuRSxDQUFOO0FBQ0QsYUFGRCxDQUVDLE9BQU0zRCxLQUFOLEVBQVk7QUFDWCwrQkFBSSx1QkFBSixFQUE2Qiw2Q0FBNEMwRixNQUFPLElBQUdoQixJQUFLLE1BQUsxRSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFBcEg7QUFDRDs7QUFBQTtBQUNGO0FBUlcsU0FBZDtBQVVBLGVBQU9sQixRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLFVBQUFBLElBQUksRUFBRTtBQUFFZSxZQUFBQSxLQUFLLEVBQUUsQ0FBVDtBQUFZQyxZQUFBQSxPQUFPLEVBQUU7QUFBckI7QUFEVyxTQUFaLENBQVA7QUFHRDs7QUFFRCxVQUFJeUUsSUFBSSxLQUFLLE9BQWIsRUFBc0I7QUFDcEIsWUFBSTtBQUNGLGdCQUFNMkIsS0FBSyxHQUFHLE1BQU0sS0FBSzVCLFlBQUwsQ0FBa0I3RixPQUFsQixFQUEyQjBCLEdBQTNCLEVBQWdDb0UsSUFBaEMsQ0FBcEI7QUFDQSxpQkFBTzJCLEtBQVA7QUFDRCxTQUhELENBR0UsT0FBT3JHLEtBQVAsRUFBYztBQUNkLGdCQUFNd0UsTUFBTSxHQUFHLENBQUN4RSxLQUFLLElBQUksRUFBVixFQUFjbUQsSUFBZCxLQUF1QixjQUF0Qzs7QUFDQSxjQUFJLENBQUNxQixNQUFMLEVBQWE7QUFDWCw2QkFBSSx1QkFBSixFQUE2QixnREFBN0I7QUFDQSxtQkFBTyxrQ0FDSixlQUFjeEUsS0FBSyxDQUFDQyxPQUFOLElBQWlCLHFCQUFzQixFQURqRCxFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxuQixRQUpLLENBQVA7QUFNRDtBQUNGO0FBQ0Y7O0FBRUQsdUJBQUksdUJBQUosRUFBOEIsR0FBRTRHLE1BQU8sSUFBR2hCLElBQUssRUFBL0MsRUFBa0QsT0FBbEQsRUExRUUsQ0E0RUY7O0FBQ0EsWUFBTTRCLGNBQWMsR0FBR2pGLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTixJQUFaLENBQXZCLENBN0VFLENBK0VGO0FBQ0E7QUFDQTs7QUFDQSxVQUFJLENBQUMsS0FBS3lFLG1CQUFMLENBQXlCQyxNQUF6QixFQUFpQ2hCLElBQWpDLENBQUwsRUFBNkM7QUFDM0MsYUFBSyxNQUFNNkIsR0FBWCxJQUFrQkQsY0FBbEIsRUFBa0M7QUFDaEMsY0FBSUUsS0FBSyxDQUFDQyxPQUFOLENBQWN6RixJQUFJLENBQUN1RixHQUFELENBQWxCLENBQUosRUFBOEI7QUFDNUJ2RixZQUFBQSxJQUFJLENBQUN1RixHQUFELENBQUosR0FBWXZGLElBQUksQ0FBQ3VGLEdBQUQsQ0FBSixDQUFVRyxJQUFWLEVBQVo7QUFDRDtBQUNGO0FBQ0Y7O0FBQ0QsWUFBTUMsYUFBYSxHQUFHLE1BQU0vSCxPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCQyxhQUF6QixDQUF1QzNCLE9BQXZDLENBQStDNkcsTUFBL0MsRUFBdURoQixJQUF2RCxFQUE2RDFELElBQTdELEVBQW1FMkMsT0FBbkUsQ0FBNUI7QUFDQSxZQUFNaUQsY0FBYyxHQUFHLEtBQUtoRixtQkFBTCxDQUF5QitFLGFBQXpCLENBQXZCOztBQUNBLFVBQUlDLGNBQUosRUFBb0I7QUFDbEIsZUFBTyxrQ0FDSixlQUFjOUgsUUFBUSxDQUFDRyxJQUFULENBQWNnQixPQUFkLElBQXlCLHFCQUFzQixFQUR6RCxFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxuQixRQUpLLENBQVA7QUFNRDs7QUFDRCxVQUFJK0gsWUFBWSxHQUFHLENBQUNGLGFBQWEsSUFBSSxFQUFsQixFQUFzQjNGLElBQXRCLElBQThCLEVBQWpEOztBQUNBLFVBQUksQ0FBQzZGLFlBQUwsRUFBbUI7QUFDakJBLFFBQUFBLFlBQVksR0FDVixPQUFPQSxZQUFQLEtBQXdCLFFBQXhCLElBQW9DbkMsSUFBSSxDQUFDbEIsUUFBTCxDQUFjLFFBQWQsQ0FBcEMsSUFBK0RrQyxNQUFNLEtBQUssS0FBMUUsR0FDSSxHQURKLEdBRUksS0FITjtBQUlBNUcsUUFBQUEsUUFBUSxDQUFDa0MsSUFBVCxHQUFnQjZGLFlBQWhCO0FBQ0Q7O0FBQ0QsWUFBTUMsYUFBYSxHQUFHaEksUUFBUSxDQUFDK0MsTUFBVCxLQUFvQixHQUFwQixHQUEwQi9DLFFBQVEsQ0FBQytDLE1BQW5DLEdBQTRDLEtBQWxFOztBQUVBLFVBQUksQ0FBQ2lGLGFBQUQsSUFBa0JELFlBQXRCLEVBQW9DO0FBQ2xDO0FBQ0EsZUFBTy9ILFFBQVEsQ0FBQ2dCLEVBQVQsQ0FBWTtBQUNqQmIsVUFBQUEsSUFBSSxFQUFFMEgsYUFBYSxDQUFDM0Y7QUFESCxTQUFaLENBQVA7QUFHRDs7QUFFRCxVQUFJOEYsYUFBYSxJQUFJZCxRQUFyQixFQUErQjtBQUM3QixlQUFPbEgsUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCYixVQUFBQSxJQUFJLEVBQUVILFFBQVEsQ0FBQ2tDO0FBREUsU0FBWixDQUFQO0FBR0Q7O0FBQ0QsWUFBTThGLGFBQWEsSUFBSUQsWUFBWSxDQUFDNUYsTUFBOUIsR0FDRjtBQUFFaEIsUUFBQUEsT0FBTyxFQUFFNEcsWUFBWSxDQUFDNUYsTUFBeEI7QUFBZ0NrQyxRQUFBQSxJQUFJLEVBQUUyRDtBQUF0QyxPQURFLEdBRUYsSUFBSXRGLEtBQUosQ0FBVSxtREFBVixDQUZKO0FBR0QsS0E1SEQsQ0E0SEUsT0FBT3hCLEtBQVAsRUFBYztBQUNkLFVBQUlBLEtBQUssSUFBSUEsS0FBSyxDQUFDbEIsUUFBZixJQUEyQmtCLEtBQUssQ0FBQ2xCLFFBQU4sQ0FBZStDLE1BQWYsS0FBMEIsR0FBekQsRUFBOEQ7QUFDNUQsZUFBTyxrQ0FDTDdCLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FEWixFQUVMQSxLQUFLLENBQUNtRCxJQUFOLEdBQWMsb0JBQW1CbkQsS0FBSyxDQUFDbUQsSUFBSyxFQUE1QyxHQUFnRCxJQUYzQyxFQUdMLEdBSEssRUFJTHJFLFFBSkssQ0FBUDtBQU1EOztBQUNELFlBQU1pSSxRQUFRLEdBQUcsQ0FBQy9HLEtBQUssQ0FBQ2xCLFFBQU4sSUFBa0IsRUFBbkIsRUFBdUJrQyxJQUF2QixJQUErQmhCLEtBQUssQ0FBQ0MsT0FBdEQ7QUFDQSx1QkFBSSx1QkFBSixFQUE2QjhHLFFBQVEsSUFBSS9HLEtBQXpDOztBQUNBLFVBQUlnRyxRQUFKLEVBQWM7QUFDWixlQUFPbEgsUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCYixVQUFBQSxJQUFJLEVBQUU7QUFBRWUsWUFBQUEsS0FBSyxFQUFFLE1BQVQ7QUFBaUJDLFlBQUFBLE9BQU8sRUFBRThHLFFBQVEsSUFBSS9HO0FBQXRDO0FBRFcsU0FBWixDQUFQO0FBR0QsT0FKRCxNQUlPO0FBQ0wsWUFBSSxDQUFDQSxLQUFLLElBQUksRUFBVixFQUFjbUQsSUFBZCxJQUFzQjZELDBDQUFvQmhILEtBQUssQ0FBQ21ELElBQTFCLENBQTFCLEVBQTJEO0FBQ3pEbkQsVUFBQUEsS0FBSyxDQUFDQyxPQUFOLEdBQWdCK0csMENBQW9CaEgsS0FBSyxDQUFDbUQsSUFBMUIsQ0FBaEI7QUFDRDs7QUFDRCxlQUFPLGtDQUNMNEQsUUFBUSxDQUFDOUYsTUFBVCxJQUFtQmpCLEtBRGQsRUFFTEEsS0FBSyxDQUFDbUQsSUFBTixHQUFjLG9CQUFtQm5ELEtBQUssQ0FBQ21ELElBQUssRUFBNUMsR0FBZ0QsSUFGM0MsRUFHTCxHQUhLLEVBSUxyRSxRQUpLLENBQVA7QUFNRDtBQUNGO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0FtSSxFQUFBQSxVQUFVLENBQUNySSxPQUFELEVBQWlDQyxPQUFqQyxFQUF5REMsUUFBekQsRUFBMEY7QUFDbEcsVUFBTW9JLEtBQUssR0FBRyxrQ0FBcUJySSxPQUFPLENBQUNTLE9BQVIsQ0FBZ0JDLE1BQXJDLEVBQTZDLFFBQTdDLENBQWQ7O0FBQ0EsUUFBSTJILEtBQUssS0FBS3JJLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBM0IsRUFBK0I7QUFBRTtBQUMvQixhQUFPLGtDQUNMLGlCQURLLEVBRUwsR0FGSyxFQUdMLEdBSEssRUFJTHJDLFFBSkssQ0FBUDtBQU1EOztBQUNELFFBQUksQ0FBQ0QsT0FBTyxDQUFDSSxJQUFSLENBQWF5RyxNQUFsQixFQUEwQjtBQUN4QixhQUFPLGtDQUFjLHVCQUFkLEVBQXVDLElBQXZDLEVBQTZDLEdBQTdDLEVBQWtENUcsUUFBbEQsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLENBQUNELE9BQU8sQ0FBQ0ksSUFBUixDQUFheUcsTUFBYixDQUFvQnlCLEtBQXBCLENBQTBCLDJCQUExQixDQUFMLEVBQTZEO0FBQ2xFLHVCQUFJLHVCQUFKLEVBQTZCLDhCQUE3QixFQURrRSxDQUVsRTs7QUFDQSxhQUFPLGtDQUFjLDhCQUFkLEVBQThDLElBQTlDLEVBQW9ELEdBQXBELEVBQXlEckksUUFBekQsQ0FBUDtBQUNELEtBSk0sTUFJQSxJQUFJLENBQUNELE9BQU8sQ0FBQ0ksSUFBUixDQUFheUYsSUFBbEIsRUFBd0I7QUFDN0IsYUFBTyxrQ0FBYyxxQkFBZCxFQUFxQyxJQUFyQyxFQUEyQyxHQUEzQyxFQUFnRDVGLFFBQWhELENBQVA7QUFDRCxLQUZNLE1BRUEsSUFBSSxDQUFDRCxPQUFPLENBQUNJLElBQVIsQ0FBYXlGLElBQWIsQ0FBa0J5QyxLQUFsQixDQUF3QixPQUF4QixDQUFMLEVBQXVDO0FBQzVDLHVCQUFJLHVCQUFKLEVBQTZCLDRCQUE3QixFQUQ0QyxDQUU1Qzs7QUFDQSxhQUFPLGtDQUFjLDRCQUFkLEVBQTRDLElBQTVDLEVBQWtELEdBQWxELEVBQXVEckksUUFBdkQsQ0FBUDtBQUNELEtBSk0sTUFJQTtBQUVMLGFBQU8sS0FBS2lILFdBQUwsQ0FDTG5ILE9BREssRUFFTEMsT0FBTyxDQUFDSSxJQUFSLENBQWF5RyxNQUZSLEVBR0w3RyxPQUFPLENBQUNJLElBQVIsQ0FBYXlGLElBSFIsRUFJTDdGLE9BQU8sQ0FBQ0ksSUFBUixDQUFhQSxJQUpSLEVBS0xKLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFMUixFQU1MckMsUUFOSyxDQUFQO0FBUUQ7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNc0ksR0FBTixDQUFVeEksT0FBVixFQUEwQ0MsT0FBMUMsRUFBa0VDLFFBQWxFLEVBQW1HO0FBQ2pHLFFBQUk7QUFDRixVQUFJLENBQUNELE9BQU8sQ0FBQ0ksSUFBVCxJQUFpQixDQUFDSixPQUFPLENBQUNJLElBQVIsQ0FBYXlGLElBQW5DLEVBQXlDLE1BQU0sSUFBSWxELEtBQUosQ0FBVSx3QkFBVixDQUFOO0FBQ3pDLFVBQUksQ0FBQzNDLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0MsRUFBbEIsRUFBc0IsTUFBTSxJQUFJSyxLQUFKLENBQVUsc0JBQVYsQ0FBTjtBQUV0QixZQUFNNkYsT0FBTyxHQUFHYixLQUFLLENBQUNDLE9BQU4sQ0FBYyxDQUFDLENBQUM1SCxPQUFPLElBQUksRUFBWixFQUFnQkksSUFBaEIsSUFBd0IsRUFBekIsRUFBNkJvSSxPQUEzQyxJQUFzRHhJLE9BQU8sQ0FBQ0ksSUFBUixDQUFhb0ksT0FBbkUsR0FBNkUsRUFBN0Y7QUFFQSxVQUFJQyxPQUFPLEdBQUd6SSxPQUFPLENBQUNJLElBQVIsQ0FBYXlGLElBQTNCOztBQUVBLFVBQUk0QyxPQUFPLElBQUksT0FBT0EsT0FBUCxLQUFtQixRQUFsQyxFQUE0QztBQUMxQ0EsUUFBQUEsT0FBTyxHQUFHQSxPQUFPLENBQUMsQ0FBRCxDQUFQLEtBQWUsR0FBZixHQUFxQkEsT0FBTyxDQUFDQyxNQUFSLENBQWUsQ0FBZixDQUFyQixHQUF5Q0QsT0FBbkQ7QUFDRDs7QUFFRCxVQUFJLENBQUNBLE9BQUwsRUFBYyxNQUFNLElBQUk5RixLQUFKLENBQVUsc0NBQVYsQ0FBTjtBQUVkLHVCQUFJLGVBQUosRUFBc0IsVUFBUzhGLE9BQVEsRUFBdkMsRUFBMEMsT0FBMUMsRUFkRSxDQWVGOztBQUNBLFlBQU10RixNQUFNLEdBQUc7QUFBRXdGLFFBQUFBLEtBQUssRUFBRTtBQUFULE9BQWY7O0FBRUEsVUFBSUgsT0FBTyxDQUFDOUYsTUFBWixFQUFvQjtBQUNsQixhQUFLLE1BQU1rRyxNQUFYLElBQXFCSixPQUFyQixFQUE4QjtBQUM1QixjQUFJLENBQUNJLE1BQU0sQ0FBQ0MsSUFBUixJQUFnQixDQUFDRCxNQUFNLENBQUNFLEtBQTVCLEVBQW1DO0FBQ25DM0YsVUFBQUEsTUFBTSxDQUFDeUYsTUFBTSxDQUFDQyxJQUFSLENBQU4sR0FBc0JELE1BQU0sQ0FBQ0UsS0FBN0I7QUFDRDtBQUNGOztBQUVELFVBQUlDLFVBQVUsR0FBRyxFQUFqQjtBQUVBLFlBQU1DLE1BQU0sR0FBRyxNQUFNakosT0FBTyxDQUFDTyxLQUFSLENBQWNtQixHQUFkLENBQWtCQyxNQUFsQixDQUF5QkMsYUFBekIsQ0FBdUMzQixPQUF2QyxDQUNuQixLQURtQixFQUVsQixJQUFHeUksT0FBUSxFQUZPLEVBR25CO0FBQUV0RixRQUFBQSxNQUFNLEVBQUVBO0FBQVYsT0FIbUIsRUFJbkI7QUFBRU4sUUFBQUEsU0FBUyxFQUFFN0MsT0FBTyxDQUFDSSxJQUFSLENBQWFrQztBQUExQixPQUptQixDQUFyQjtBQU9BLFlBQU0yRyxNQUFNLEdBQUdqSixPQUFPLENBQUNJLElBQVIsQ0FBYXlGLElBQWIsQ0FBa0JsQixRQUFsQixDQUEyQixRQUEzQixLQUF3QzNFLE9BQU8sQ0FBQ0ksSUFBUixDQUFhb0ksT0FBckQsSUFBZ0V4SSxPQUFPLENBQUNJLElBQVIsQ0FBYW9JLE9BQWIsQ0FBcUI5RixNQUFyRixJQUErRjFDLE9BQU8sQ0FBQ0ksSUFBUixDQUFhb0ksT0FBYixDQUFxQlUsSUFBckIsQ0FBMEJOLE1BQU0sSUFBSUEsTUFBTSxDQUFDTyxVQUEzQyxDQUE5RztBQUVBLFlBQU1DLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQ0osTUFBTSxJQUFJLEVBQVgsRUFBZTdHLElBQWYsSUFBdUIsRUFBeEIsRUFBNEJBLElBQTVCLElBQW9DLEVBQXJDLEVBQXlDa0gsb0JBQTVEOztBQUVBLFVBQUlELFVBQVUsSUFBSSxDQUFDSCxNQUFuQixFQUEyQjtBQUN6QjlGLFFBQUFBLE1BQU0sQ0FBQ21HLE1BQVAsR0FBZ0IsQ0FBaEI7QUFDQVAsUUFBQUEsVUFBVSxDQUFDUSxJQUFYLENBQWdCLEdBQUdQLE1BQU0sQ0FBQzdHLElBQVAsQ0FBWUEsSUFBWixDQUFpQm1CLGNBQXBDOztBQUNBLGVBQU95RixVQUFVLENBQUNyRyxNQUFYLEdBQW9CMEcsVUFBcEIsSUFBa0NqRyxNQUFNLENBQUNtRyxNQUFQLEdBQWdCRixVQUF6RCxFQUFxRTtBQUNuRWpHLFVBQUFBLE1BQU0sQ0FBQ21HLE1BQVAsSUFBaUJuRyxNQUFNLENBQUN3RixLQUF4QjtBQUNBLGdCQUFNYSxPQUFPLEdBQUcsTUFBTXpKLE9BQU8sQ0FBQ08sS0FBUixDQUFjbUIsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDM0IsT0FBdkMsQ0FDcEIsS0FEb0IsRUFFbkIsSUFBR3lJLE9BQVEsRUFGUSxFQUdwQjtBQUFFdEYsWUFBQUEsTUFBTSxFQUFFQTtBQUFWLFdBSG9CLEVBSXBCO0FBQUVOLFlBQUFBLFNBQVMsRUFBRTdDLE9BQU8sQ0FBQ0ksSUFBUixDQUFha0M7QUFBMUIsV0FKb0IsQ0FBdEI7QUFNQXlHLFVBQUFBLFVBQVUsQ0FBQ1EsSUFBWCxDQUFnQixHQUFHQyxPQUFPLENBQUNySCxJQUFSLENBQWFBLElBQWIsQ0FBa0JtQixjQUFyQztBQUNEO0FBQ0Y7O0FBRUQsVUFBSThGLFVBQUosRUFBZ0I7QUFDZCxjQUFNO0FBQUV2RCxVQUFBQSxJQUFGO0FBQVEyQyxVQUFBQTtBQUFSLFlBQW9CeEksT0FBTyxDQUFDSSxJQUFsQztBQUNBLGNBQU1xSixjQUFjLEdBQ2xCNUQsSUFBSSxDQUFDbEIsUUFBTCxDQUFjLFFBQWQsS0FBMkIsQ0FBQ3NFLE1BRDlCO0FBRUEsY0FBTVMsUUFBUSxHQUFHN0QsSUFBSSxDQUFDbEIsUUFBTCxDQUFjLFNBQWQsS0FBNEIsQ0FBQ2tCLElBQUksQ0FBQ2xCLFFBQUwsQ0FBYyxRQUFkLENBQTlDO0FBQ0EsY0FBTWdGLGVBQWUsR0FBRzlELElBQUksQ0FBQ21CLFVBQUwsQ0FBZ0IsaUJBQWhCLENBQXhCO0FBQ0EsY0FBTTRDLE9BQU8sR0FBRy9ELElBQUksQ0FBQ2dFLFFBQUwsQ0FBYyxRQUFkLENBQWhCO0FBQ0EsWUFBSUMsTUFBTSxHQUFHdEgsTUFBTSxDQUFDQyxJQUFQLENBQVl1RyxNQUFNLENBQUM3RyxJQUFQLENBQVlBLElBQVosQ0FBaUJtQixjQUFqQixDQUFnQyxDQUFoQyxDQUFaLENBQWI7O0FBRUEsWUFBSW9HLFFBQVEsSUFBSUMsZUFBaEIsRUFBaUM7QUFDL0IsY0FBSUMsT0FBSixFQUFhO0FBQ1hFLFlBQUFBLE1BQU0sR0FBRyxDQUFDLFVBQUQsRUFBYSxNQUFiLENBQVQ7QUFDRCxXQUZELE1BRU87QUFDTEEsWUFBQUEsTUFBTSxHQUFHLENBQ1AsSUFETyxFQUVQLFFBRk8sRUFHUCxNQUhPLEVBSVAsSUFKTyxFQUtQLE9BTE8sRUFNUCxTQU5PLEVBT1AsV0FQTyxFQVFQLFNBUk8sRUFTUCxTQVRPLEVBVVAsZUFWTyxFQVdQLFNBWE8sRUFZUCxVQVpPLEVBYVAsYUFiTyxFQWNQLFVBZE8sRUFlUCxVQWZPLEVBZ0JQLFNBaEJPLEVBaUJQLGFBakJPLEVBa0JQLFVBbEJPLEVBbUJQLFlBbkJPLENBQVQ7QUFxQkQ7QUFDRjs7QUFFRCxZQUFJTCxjQUFKLEVBQW9CO0FBQ2xCLGdCQUFNTSxTQUFTLEdBQUcsRUFBbEI7O0FBQ0EsZUFBSyxNQUFNQyxJQUFYLElBQW1CakIsVUFBbkIsRUFBK0I7QUFDN0Isa0JBQU07QUFBRWtCLGNBQUFBLGdCQUFGO0FBQW9CQyxjQUFBQTtBQUFwQixnQkFBOEJGLElBQXBDO0FBQ0FELFlBQUFBLFNBQVMsQ0FBQ1IsSUFBVixDQUFlLEdBQUdXLEtBQUssQ0FBQ0MsR0FBTixDQUFVQyxJQUFJLEtBQUs7QUFBRUgsY0FBQUEsZ0JBQUY7QUFBb0J2QyxjQUFBQSxHQUFHLEVBQUUwQyxJQUFJLENBQUMxQyxHQUE5QjtBQUFtQ29CLGNBQUFBLEtBQUssRUFBRXNCLElBQUksQ0FBQ3RCO0FBQS9DLGFBQUwsQ0FBZCxDQUFsQjtBQUNEOztBQUNEZ0IsVUFBQUEsTUFBTSxHQUFHLENBQUMsa0JBQUQsRUFBcUIsS0FBckIsRUFBNEIsT0FBNUIsQ0FBVDtBQUNBZixVQUFBQSxVQUFVLEdBQUcsQ0FBQyxHQUFHZ0IsU0FBSixDQUFiO0FBQ0Q7O0FBRUQsWUFBSWQsTUFBSixFQUFZO0FBQ1ZhLFVBQUFBLE1BQU0sR0FBRyxDQUFDLEtBQUQsRUFBUSxPQUFSLENBQVQ7QUFDQWYsVUFBQUEsVUFBVSxHQUFHQyxNQUFNLENBQUM3RyxJQUFQLENBQVlBLElBQVosQ0FBaUJtQixjQUFqQixDQUFnQyxDQUFoQyxFQUFtQzRHLEtBQWhEO0FBQ0Q7O0FBQ0RKLFFBQUFBLE1BQU0sR0FBR0EsTUFBTSxDQUFDSyxHQUFQLENBQVdDLElBQUksS0FBSztBQUFFdEIsVUFBQUEsS0FBSyxFQUFFc0IsSUFBVDtBQUFlQyxVQUFBQSxPQUFPLEVBQUU7QUFBeEIsU0FBTCxDQUFmLENBQVQ7QUFFQSxjQUFNQyxjQUFjLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUFFVCxVQUFBQTtBQUFGLFNBQVgsQ0FBdkI7QUFFQSxZQUFJdkIsR0FBRyxHQUFHK0IsY0FBYyxDQUFDRSxLQUFmLENBQXFCekIsVUFBckIsQ0FBVjs7QUFDQSxhQUFLLE1BQU0wQixLQUFYLElBQW9CWCxNQUFwQixFQUE0QjtBQUMxQixnQkFBTTtBQUFFaEIsWUFBQUE7QUFBRixjQUFZMkIsS0FBbEI7O0FBQ0EsY0FBSWxDLEdBQUcsQ0FBQzVELFFBQUosQ0FBYW1FLEtBQWIsQ0FBSixFQUF5QjtBQUN2QlAsWUFBQUEsR0FBRyxHQUFHQSxHQUFHLENBQUNtQyxPQUFKLENBQVk1QixLQUFaLEVBQW1CNkIsa0NBQWU3QixLQUFmLEtBQXlCQSxLQUE1QyxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxlQUFPN0ksUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCUixVQUFBQSxPQUFPLEVBQUU7QUFBRSw0QkFBZ0I7QUFBbEIsV0FEUTtBQUVqQkwsVUFBQUEsSUFBSSxFQUFFbUk7QUFGVyxTQUFaLENBQVA7QUFJRCxPQW5FRCxNQW1FTyxJQUFJUyxNQUFNLElBQUlBLE1BQU0sQ0FBQzdHLElBQWpCLElBQXlCNkcsTUFBTSxDQUFDN0csSUFBUCxDQUFZQSxJQUFyQyxJQUE2QyxDQUFDNkcsTUFBTSxDQUFDN0csSUFBUCxDQUFZQSxJQUFaLENBQWlCa0gsb0JBQW5FLEVBQXlGO0FBQzlGLGNBQU0sSUFBSTFHLEtBQUosQ0FBVSxZQUFWLENBQU47QUFDRCxPQUZNLE1BRUE7QUFDTCxjQUFNLElBQUlBLEtBQUosQ0FBVyxxREFBb0RxRyxNQUFNLElBQUlBLE1BQU0sQ0FBQzdHLElBQWpCLElBQXlCNkcsTUFBTSxDQUFDN0csSUFBUCxDQUFZQyxNQUFyQyxHQUErQyxLQUFJNEcsTUFBTSxDQUFDNUksSUFBUCxDQUFZZ0MsTUFBTyxFQUF0RSxHQUEwRSxFQUFHLEVBQTVJLENBQU47QUFDRDtBQUNGLEtBN0hELENBNkhFLE9BQU9qQixLQUFQLEVBQWM7QUFDZCx1QkFBSSxlQUFKLEVBQXFCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQXRDO0FBQ0EsYUFBTyxrQ0FBY0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQixFQUFzQyxJQUF0QyxFQUE0QyxHQUE1QyxFQUFpRGxCLFFBQWpELENBQVA7QUFDRDtBQUNGLEdBNTBCdUIsQ0E4MEJ4Qjs7O0FBQ0EySyxFQUFBQSxjQUFjLENBQUM3SyxPQUFELEVBQWlDQyxPQUFqQyxFQUF5REMsUUFBekQsRUFBMEY7QUFDdEc7QUFDQSxXQUFPQSxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLE1BQUFBLElBQUksRUFBRXlLO0FBRFcsS0FBWixDQUFQO0FBR0Q7QUFFRDs7Ozs7Ozs7O0FBT0FDLEVBQUFBLFlBQVksQ0FBQy9LLE9BQUQsRUFBaUNDLE9BQWpDLEVBQXlEQyxRQUF6RCxFQUEwRjtBQUNwRyxRQUFJO0FBQ0YsWUFBTThLLE1BQU0sR0FBR0MsSUFBSSxDQUFDUixLQUFMLENBQVdTLFlBQUdDLFlBQUgsQ0FBZ0IsS0FBS3RMLGNBQUwsQ0FBb0J1TCxJQUFwQyxFQUEwQyxNQUExQyxDQUFYLENBQWY7O0FBQ0EsVUFBSUosTUFBTSxDQUFDSyxnQkFBUCxJQUEyQkwsTUFBTSxDQUFDTSxXQUF0QyxFQUFtRDtBQUNqRCx5QkFDRSx3QkFERixFQUVHLHNCQUFxQk4sTUFBTSxDQUFDSyxnQkFBaUIsbUJBQWtCTCxNQUFNLENBQUNNLFdBQVksRUFGckYsRUFHRSxPQUhGO0FBS0EsZUFBT3BMLFFBQVEsQ0FBQ2dCLEVBQVQsQ0FBWTtBQUNqQmIsVUFBQUEsSUFBSSxFQUFFO0FBQ0pnTCxZQUFBQSxnQkFBZ0IsRUFBRUwsTUFBTSxDQUFDSyxnQkFEckI7QUFFSkMsWUFBQUEsV0FBVyxFQUFFTixNQUFNLENBQUNNO0FBRmhCO0FBRFcsU0FBWixDQUFQO0FBTUQsT0FaRCxNQVlPO0FBQ0wsY0FBTSxJQUFJMUksS0FBSixDQUFVLHdDQUFWLENBQU47QUFDRDtBQUNGLEtBakJELENBaUJFLE9BQU94QixLQUFQLEVBQWM7QUFDZCx1QkFBSSx3QkFBSixFQUE4QkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQztBQUNBLGFBQU8sa0NBQ0xBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQix3Q0FEWixFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxuQixRQUpLLENBQVA7QUFNRDtBQUNGO0FBRUQ7Ozs7Ozs7OztBQU9BLFFBQU1xTCxhQUFOLENBQW9CdkwsT0FBcEIsRUFBb0RDLE9BQXBELEVBQTRFQyxRQUE1RSxFQUE2RztBQUMzRyxRQUFJO0FBQ0YsWUFBTTtBQUFFcUMsUUFBQUEsRUFBRjtBQUFNaUosUUFBQUE7QUFBTixVQUFxQnZMLE9BQU8sQ0FBQ0ksSUFBbkMsQ0FERSxDQUVGOztBQUNBLFlBQU0sS0FBS1IsY0FBTCxDQUFvQjRMLG1CQUFwQixDQUF3Q2xKLEVBQXhDLEVBQTRDaUosVUFBNUMsQ0FBTjtBQUNBLGFBQU90TCxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLFFBQUFBLElBQUksRUFBRTtBQUNKOEQsVUFBQUEsVUFBVSxFQUFFO0FBRFI7QUFEVyxPQUFaLENBQVA7QUFLRCxLQVRELENBU0UsT0FBTy9DLEtBQVAsRUFBYztBQUNkLHVCQUFJLHlCQUFKLEVBQStCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQWhEO0FBQ0EsYUFBTyxrQ0FDTEEsS0FBSyxDQUFDQyxPQUFOLElBQWlCLDBCQURaLEVBRUwsSUFGSyxFQUdMLEdBSEssRUFJTG5CLFFBSkssQ0FBUDtBQU1EO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0F3TCxFQUFBQSxhQUFhLENBQUMxTCxPQUFELEVBQWlDQyxPQUFqQyxFQUF5REMsUUFBekQsRUFBMEY7QUFDckcsUUFBSTtBQUNGLFlBQU04SyxNQUFNLEdBQUdDLElBQUksQ0FBQ1IsS0FBTCxDQUNiUyxZQUFHQyxZQUFILENBQWdCLEtBQUt0TCxjQUFMLENBQW9CdUwsSUFBcEMsRUFBMEMsTUFBMUMsQ0FEYSxDQUFmO0FBR0EsYUFBT2xMLFFBQVEsQ0FBQ2dCLEVBQVQsQ0FBWTtBQUNqQmIsUUFBQUEsSUFBSSxFQUFFO0FBQ0ptTCxVQUFBQSxVQUFVLEVBQUUsQ0FBQ1IsTUFBTSxDQUFDVyxLQUFQLENBQWExTCxPQUFPLENBQUNtRCxNQUFSLENBQWViLEVBQTVCLEtBQW1DLEVBQXBDLEVBQXdDaUosVUFBeEMsSUFBc0Q7QUFEOUQ7QUFEVyxPQUFaLENBQVA7QUFLRCxLQVRELENBU0UsT0FBT3BLLEtBQVAsRUFBYztBQUNkLHVCQUFJLHlCQUFKLEVBQStCQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQWhEO0FBQ0EsYUFBTyxrQ0FDTEEsS0FBSyxDQUFDQyxPQUFOLElBQWlCLHdDQURaLEVBRUwsSUFGSyxFQUdMLEdBSEssRUFJTG5CLFFBSkssQ0FBUDtBQU1EO0FBQ0Y7QUFFRDs7Ozs7Ozs7O0FBT0EsUUFBTTBMLFlBQU4sQ0FBbUI1TCxPQUFuQixFQUFtREMsT0FBbkQsRUFBMkVDLFFBQTNFLEVBQTRHO0FBQzFHLFFBQUk7QUFDRixZQUFNOEssTUFBTSxHQUFHQyxJQUFJLENBQUNSLEtBQUwsQ0FBV1MsWUFBR0MsWUFBSCxDQUFnQixLQUFLdEwsY0FBTCxDQUFvQnVMLElBQXBDLEVBQTBDLE1BQTFDLENBQVgsQ0FBZjtBQUNBLGFBQU9sTCxRQUFRLENBQUNnQixFQUFULENBQVk7QUFDakJiLFFBQUFBLElBQUksRUFBRTtBQUNKOEQsVUFBQUEsVUFBVSxFQUFFLEdBRFI7QUFFSi9CLFVBQUFBLElBQUksRUFBRSxDQUFDSyxNQUFNLENBQUNvSixNQUFQLENBQWNiLE1BQWQsRUFBc0JySSxNQUF2QixHQUFnQyxFQUFoQyxHQUFxQ3FJO0FBRnZDO0FBRFcsT0FBWixDQUFQO0FBTUQsS0FSRCxDQVFFLE9BQU81SixLQUFQLEVBQWM7QUFDZCx1QkFBSSx3QkFBSixFQUE4QkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUEvQztBQUNBLGFBQU8sa0NBQ0oseURBQXdEQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQU0sRUFEM0UsRUFFTCxJQUZLLEVBR0wsR0FISyxFQUlMbEIsUUFKSyxDQUFQO0FBTUQ7QUFDRjtBQUVEOzs7Ozs7Ozs7QUFPQSxRQUFNNEwsZUFBTixDQUFzQjlMLE9BQXRCLEVBQXNEQyxPQUF0RCxFQUE4RUMsUUFBOUUsRUFBK0c7QUFDN0csUUFBSTtBQUNGLFlBQU00QyxTQUFTLEdBQUcsa0NBQXFCN0MsT0FBTyxDQUFDUyxPQUFSLENBQWdCQyxNQUFyQyxFQUE0QyxRQUE1QyxDQUFsQjs7QUFDQSxVQUFJLENBQUNWLE9BQU8sQ0FBQ21ELE1BQVQsSUFBbUIsQ0FBQ04sU0FBcEIsSUFBaUMsQ0FBQzdDLE9BQU8sQ0FBQ21ELE1BQVIsQ0FBZTJJLEtBQXJELEVBQTREO0FBQzFELGNBQU0sSUFBSW5KLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsWUFBTTtBQUFFbUosUUFBQUE7QUFBRixVQUFZOUwsT0FBTyxDQUFDbUQsTUFBMUI7QUFFQSxZQUFNaEIsSUFBSSxHQUFHLE1BQU1tRSxPQUFPLENBQUN5RixHQUFSLENBQVksQ0FDN0JoTSxPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3QzdCLE9BQXhDLENBQWdELEtBQWhELEVBQXdELGlCQUFnQjhMLEtBQU0sV0FBOUUsRUFBMEYsRUFBMUYsRUFBOEY7QUFBRWpKLFFBQUFBO0FBQUYsT0FBOUYsQ0FENkIsRUFFN0I5QyxPQUFPLENBQUNPLEtBQVIsQ0FBY21CLEdBQWQsQ0FBa0JDLE1BQWxCLENBQXlCRyxjQUF6QixDQUF3QzdCLE9BQXhDLENBQWdELEtBQWhELEVBQXdELGlCQUFnQjhMLEtBQU0sS0FBOUUsRUFBb0YsRUFBcEYsRUFBd0Y7QUFBRWpKLFFBQUFBO0FBQUYsT0FBeEYsQ0FGNkIsQ0FBWixDQUFuQjtBQUtBLFlBQU1tSixNQUFNLEdBQUc3SixJQUFJLENBQUNnSSxHQUFMLENBQVNDLElBQUksSUFBSSxDQUFDQSxJQUFJLENBQUNqSSxJQUFMLElBQWEsRUFBZCxFQUFrQkEsSUFBbEIsSUFBMEIsRUFBM0MsQ0FBZjtBQUNBLFlBQU0sQ0FBQzhKLGdCQUFELEVBQW1CQyxVQUFuQixJQUFpQ0YsTUFBdkMsQ0FkRSxDQWdCRjs7QUFDQSxZQUFNRyxZQUFZLEdBQUc7QUFDbkJDLFFBQUFBLFFBQVEsRUFDTixPQUFPSCxnQkFBUCxLQUE0QixRQUE1QixJQUF3Q3pKLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZd0osZ0JBQVosRUFBOEJ2SixNQUF0RSxHQUNJLEVBQUUsR0FBR3VKLGdCQUFnQixDQUFDM0ksY0FBakIsQ0FBZ0MsQ0FBaEM7QUFBTCxTQURKLEdBRUksS0FKYTtBQUtuQitJLFFBQUFBLEVBQUUsRUFDQSxPQUFPSCxVQUFQLEtBQXNCLFFBQXRCLElBQWtDMUosTUFBTSxDQUFDQyxJQUFQLENBQVl5SixVQUFaLEVBQXdCeEosTUFBMUQsR0FDSSxFQUFFLEdBQUd3SixVQUFVLENBQUM1SSxjQUFYLENBQTBCLENBQTFCO0FBQUwsU0FESixHQUVJO0FBUmEsT0FBckI7QUFXQSxhQUFPckQsUUFBUSxDQUFDZ0IsRUFBVCxDQUFZO0FBQ2pCYixRQUFBQSxJQUFJLEVBQUUrTDtBQURXLE9BQVosQ0FBUDtBQUdELEtBL0JELENBK0JFLE9BQU9oTCxLQUFQLEVBQWM7QUFDZCx1QkFBSSwyQkFBSixFQUFpQ0EsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUFsRDtBQUNBLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURsQixRQUFqRCxDQUFQO0FBQ0Q7QUFDRjs7QUF4L0J1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBDbGFzcyBmb3IgV2F6dWgtQVBJIGZ1bmN0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cblxuLy8gUmVxdWlyZSBzb21lIGxpYnJhcmllc1xuaW1wb3J0IHsgRXJyb3JSZXNwb25zZSB9IGZyb20gJy4uL2xpYi9lcnJvci1yZXNwb25zZSc7XG5pbXBvcnQgeyBQYXJzZXIgfSBmcm9tICdqc29uMmNzdic7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi9saWIvbG9nZ2VyJztcbmltcG9ydCB7IEtleUVxdWl2YWxlbmNlIH0gZnJvbSAnLi4vLi4vY29tbW9uL2Nzdi1rZXktZXF1aXZhbGVuY2UnO1xuaW1wb3J0IHsgQXBpRXJyb3JFcXVpdmFsZW5jZSB9IGZyb20gJy4uL2xpYi9hcGktZXJyb3JzLWVxdWl2YWxlbmNlJztcbmltcG9ydCBhcGlSZXF1ZXN0TGlzdCBmcm9tICcuLi8uLi9jb21tb24vYXBpLWluZm8vZW5kcG9pbnRzJztcbmltcG9ydCB7IGFkZEpvYlRvUXVldWUgfSBmcm9tICcuLi9zdGFydC9xdWV1ZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgTWFuYWdlSG9zdHMgfSBmcm9tICcuLi9saWIvbWFuYWdlLWhvc3RzJztcbmltcG9ydCB7IFVwZGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnLi4vbGliL3VwZGF0ZS1yZWdpc3RyeSc7XG5pbXBvcnQgand0RGVjb2RlIGZyb20gJ2p3dC1kZWNvZGUnO1xuaW1wb3J0IHsgS2liYW5hUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXJDb250ZXh0LCBLaWJhbmFSZXNwb25zZUZhY3RvcnkgfSBmcm9tICdzcmMvY29yZS9zZXJ2ZXInO1xuaW1wb3J0IHsgQVBJVXNlckFsbG93UnVuQXMsIENhY2hlSW5NZW1vcnlBUElVc2VyQWxsb3dSdW5BcywgQVBJX1VTRVJfU1RBVFVTX1JVTl9BUyB9IGZyb20gJy4uL2xpYi9jYWNoZS1hcGktdXNlci1oYXMtcnVuLWFzJztcbmltcG9ydCB7IGdldENvb2tpZVZhbHVlQnlOYW1lIH0gZnJvbSAnLi4vbGliL2Nvb2tpZSc7XG5cbmV4cG9ydCBjbGFzcyBXYXp1aEFwaUN0cmwge1xuICBtYW5hZ2VIb3N0czogTWFuYWdlSG9zdHNcbiAgdXBkYXRlUmVnaXN0cnk6IFVwZGF0ZVJlZ2lzdHJ5XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gdGhpcy5tb25pdG9yaW5nSW5zdGFuY2UgPSBuZXcgTW9uaXRvcmluZyhzZXJ2ZXIsIHRydWUpO1xuICAgIHRoaXMubWFuYWdlSG9zdHMgPSBuZXcgTWFuYWdlSG9zdHMoKTtcbiAgICB0aGlzLnVwZGF0ZVJlZ2lzdHJ5ID0gbmV3IFVwZGF0ZVJlZ2lzdHJ5KCk7XG4gIH1cblxuICBhc3luYyBnZXRUb2tlbihjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBmb3JjZSwgaWRIb3N0IH0gPSByZXF1ZXN0LmJvZHk7XG4gICAgICBjb25zdCB7IHVzZXJuYW1lIH0gPSBhd2FpdCBjb250ZXh0LndhenVoLnNlY3VyaXR5LmdldEN1cnJlbnRVc2VyKHJlcXVlc3QsIGNvbnRleHQpO1xuICAgICAgaWYgKCFmb3JjZSAmJiByZXF1ZXN0LmhlYWRlcnMuY29va2llICYmIHVzZXJuYW1lID09PSBnZXRDb29raWVWYWx1ZUJ5TmFtZShyZXF1ZXN0LmhlYWRlcnMuY29va2llLCAnd3otdXNlcicpICYmIGlkSG9zdCA9PT0gZ2V0Q29va2llVmFsdWVCeU5hbWUocmVxdWVzdC5oZWFkZXJzLmNvb2tpZSwnd3otYXBpJykpIHtcbiAgICAgICAgY29uc3Qgd3pUb2tlbiA9IGdldENvb2tpZVZhbHVlQnlOYW1lKHJlcXVlc3QuaGVhZGVycy5jb29raWUsICd3ei10b2tlbicpO1xuICAgICAgICBpZiAod3pUb2tlbikge1xuICAgICAgICAgIHRyeSB7IC8vIGlmIHRoZSBjdXJyZW50IHRva2VuIGlzIG5vdCBhIHZhbGlkIGp3dCB0b2tlbiB3ZSBhc2sgZm9yIGEgbmV3IG9uZVxuICAgICAgICAgICAgY29uc3QgZGVjb2RlZFRva2VuID0gand0RGVjb2RlKHd6VG9rZW4pO1xuICAgICAgICAgICAgY29uc3QgZXhwaXJhdGlvblRpbWUgPSAoZGVjb2RlZFRva2VuLmV4cCAtIChEYXRlLm5vdygpIC8gMTAwMCkpO1xuICAgICAgICAgICAgaWYgKHd6VG9rZW4gJiYgZXhwaXJhdGlvblRpbWUgPiAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgICAgICAgYm9keTogeyB0b2tlbjogd3pUb2tlbiB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2coJ3dhenVoLWFwaTpnZXRUb2tlbicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IHRva2VuO1xuICAgICAgaWYgKGF3YWl0IEFQSVVzZXJBbGxvd1J1bkFzLmNhblVzZShpZEhvc3QpID09IEFQSV9VU0VSX1NUQVRVU19SVU5fQVMuRU5BQkxFRCkge1xuICAgICAgICB0b2tlbiA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLmF1dGhlbnRpY2F0ZShpZEhvc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIuYXV0aGVudGljYXRlKGlkSG9zdCk7XG4gICAgICB9O1xuXG4gICAgICBsZXQgdGV4dFNlY3VyZT0nJztcbiAgICAgIGlmKGNvbnRleHQud2F6dWguc2VydmVyLmluZm8ucHJvdG9jb2wgPT09ICdodHRwcycpe1xuICAgICAgICB0ZXh0U2VjdXJlID0gJztTZWN1cmUnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ3NldC1jb29raWUnOiBbXG4gICAgICAgICAgICBgd3otdG9rZW49JHt0b2tlbn07UGF0aD0vO0h0dHBPbmx5JHt0ZXh0U2VjdXJlfWAsXG4gICAgICAgICAgICBgd3otdXNlcj0ke3VzZXJuYW1lfTtQYXRoPS87SHR0cE9ubHkke3RleHRTZWN1cmV9YCxcbiAgICAgICAgICAgIGB3ei1hcGk9JHtpZEhvc3R9O1BhdGg9LztIdHRwT25seWAsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogeyB0b2tlbiB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKChlcnJvci5yZXNwb25zZSB8fCB7fSkuZGF0YSB8fCB7fSkuZGV0YWlsIHx8IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgICBsb2coJ3dhenVoLWFwaTpnZXRUb2tlbicsIGVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgYEVycm9yIGdldHRpbmcgdGhlIGF1dGhvcml6YXRpb24gdG9rZW46ICR7ZXJyb3JNZXNzYWdlfWAsXG4gICAgICAgIDMwMDAsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHdhenVoLWFwaSBjb25maWd1cmF0aW9uIGlzIHdvcmtpbmdcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHN0YXR1cyBvYmogb3IgRXJyb3JSZXNwb25zZVxuICAgKi9cbiAgYXN5bmMgY2hlY2tTdG9yZWRBUEkoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCBjb25maWcgZnJvbSB3YXp1aC55bWxcbiAgICAgIGNvbnN0IGlkID0gcmVxdWVzdC5ib2R5LmlkO1xuICAgICAgY29uc3QgYXBpID0gYXdhaXQgdGhpcy5tYW5hZ2VIb3N0cy5nZXRIb3N0QnlJZChpZCk7XG4gICAgICAvLyBDaGVjayBNYW5hZ2UgSG9zdHNcbiAgICAgIGlmICghT2JqZWN0LmtleXMoYXBpKS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBXYXp1aCBBUEkgZW50cnkgb24gd2F6dWgueW1sJyk7XG4gICAgICB9XG5cbiAgICAgIGxvZygnd2F6dWgtYXBpOmNoZWNrU3RvcmVkQVBJJywgYCR7aWR9IGV4aXN0c2AsICdkZWJ1ZycpO1xuXG4gICAgICAvLyBGZXRjaCBuZWVkZWQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNsdXN0ZXIgYW5kIHRoZSBtYW5hZ2VyIGl0c2VsZlxuICAgICAgY29uc3QgcmVzcG9uc2VNYW5hZ2VySW5mbyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgICAnZ2V0JyxcbiAgICAgICAgYC9tYW5hZ2VyL2luZm9gLFxuICAgICAgICB7fSxcbiAgICAgICAgeyBhcGlIb3N0SUQ6IGlkLCBmb3JjZVJlZnJlc2g6IHRydWUgfVxuICAgICAgKTtcblxuICAgICAgLy8gTG9vayBmb3Igc29ja2V0LXJlbGF0ZWQgZXJyb3JzXG4gICAgICBpZiAodGhpcy5jaGVja1Jlc3BvbnNlSXNEb3duKHJlc3BvbnNlTWFuYWdlckluZm8pKSB7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKFxuICAgICAgICAgIGBFUlJPUjMwOTkgLSAke3Jlc3BvbnNlTWFuYWdlckluZm8uZGF0YS5kZXRhaWwgfHwgJ1dhenVoIG5vdCByZWFkeSB5ZXQnfWAsXG4gICAgICAgICAgMzA5OSxcbiAgICAgICAgICA1MDAsXG4gICAgICAgICAgcmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgaGF2ZSBhIHZhbGlkIHJlc3BvbnNlIGZyb20gdGhlIFdhenVoIEFQSVxuICAgICAgaWYgKHJlc3BvbnNlTWFuYWdlckluZm8uc3RhdHVzID09PSAyMDAgJiYgcmVzcG9uc2VNYW5hZ2VySW5mby5kYXRhKSB7XG4gICAgICAgIC8vIENsZWFyIGFuZCB1cGRhdGUgY2x1c3RlciBpbmZvcm1hdGlvbiBiZWZvcmUgYmVpbmcgc2VudCBiYWNrIHRvIGZyb250ZW5kXG4gICAgICAgIGRlbGV0ZSBhcGkuY2x1c3Rlcl9pbmZvO1xuICAgICAgICBjb25zdCByZXNwb25zZUFnZW50cyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgICAgICdHRVQnLFxuICAgICAgICAgIGAvYWdlbnRzYCxcbiAgICAgICAgICB7IHBhcmFtczogeyBhZ2VudHNfbGlzdDogJzAwMCcgfSB9LFxuICAgICAgICAgIHsgYXBpSG9zdElEOiBpZCB9XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlQWdlbnRzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgY29uc3QgbWFuYWdlck5hbWUgPSByZXNwb25zZUFnZW50cy5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXNbMF0ubWFuYWdlcjtcblxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlQ2x1c3RlclN0YXR1cyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgICBgL2NsdXN0ZXIvc3RhdHVzYCxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgeyBhcGlIb3N0SUQ6IGlkIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChyZXNwb25zZUNsdXN0ZXJTdGF0dXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZUNsdXN0ZXJTdGF0dXMuZGF0YS5kYXRhLmVuYWJsZWQgPT09ICd5ZXMnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlQ2x1c3RlckxvY2FsSW5mbyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgICAgICAgICAgICdHRVQnLFxuICAgICAgICAgICAgICAgIGAvY2x1c3Rlci9sb2NhbC9pbmZvYCxcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICB7IGFwaUhvc3RJRDogaWQgfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAocmVzcG9uc2VDbHVzdGVyTG9jYWxJbmZvLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2x1c3RlckVuYWJsZWQgPSByZXNwb25zZUNsdXN0ZXJTdGF0dXMuZGF0YS5kYXRhLmVuYWJsZWQgPT09ICd5ZXMnO1xuICAgICAgICAgICAgICAgIGFwaS5jbHVzdGVyX2luZm8gPSB7XG4gICAgICAgICAgICAgICAgICBzdGF0dXM6IGNsdXN0ZXJFbmFibGVkID8gJ2VuYWJsZWQnIDogJ2Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICAgIG1hbmFnZXI6IG1hbmFnZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgbm9kZTogcmVzcG9uc2VDbHVzdGVyTG9jYWxJbmZvLmRhdGEuZGF0YS5hZmZlY3RlZF9pdGVtc1swXS5ub2RlLFxuICAgICAgICAgICAgICAgICAgY2x1c3RlcjogY2x1c3RlckVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgPyByZXNwb25zZUNsdXN0ZXJMb2NhbEluZm8uZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdLmNsdXN0ZXJcbiAgICAgICAgICAgICAgICAgICAgOiAnRGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIENsdXN0ZXIgbW9kZSBpcyBub3QgYWN0aXZlXG4gICAgICAgICAgICAgIGFwaS5jbHVzdGVyX2luZm8gPSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnZGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgIG1hbmFnZXI6IG1hbmFnZXJOYW1lLFxuICAgICAgICAgICAgICAgIGNsdXN0ZXI6ICdEaXNhYmxlZCcsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENsdXN0ZXIgbW9kZSBpcyBub3QgYWN0aXZlXG4gICAgICAgICAgICBhcGkuY2x1c3Rlcl9pbmZvID0ge1xuICAgICAgICAgICAgICBzdGF0dXM6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICAgIG1hbmFnZXI6IG1hbmFnZXJOYW1lLFxuICAgICAgICAgICAgICBjbHVzdGVyOiAnRGlzYWJsZWQnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYXBpLmNsdXN0ZXJfaW5mbykge1xuICAgICAgICAgICAgLy8gVXBkYXRlIGNsdXN0ZXIgaW5mb3JtYXRpb24gaW4gdGhlIHdhenVoLXJlZ2lzdHJ5Lmpzb25cbiAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlUmVnaXN0cnkudXBkYXRlQ2x1c3RlckluZm8oaWQsIGFwaS5jbHVzdGVyX2luZm8pO1xuXG4gICAgICAgICAgICAvLyBIaWRlIFdhenVoIEFQSSBzZWNyZXQsIHVzZXJuYW1lLCBwYXNzd29yZFxuICAgICAgICAgICAgY29uc3QgY29waWVkID0geyAuLi5hcGkgfTtcbiAgICAgICAgICAgIGNvcGllZC5zZWNyZXQgPSAnKioqKic7XG4gICAgICAgICAgICBjb3BpZWQucGFzc3dvcmQgPSAnKioqKic7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgZGF0YTogY29waWVkLFxuICAgICAgICAgICAgICAgIGlkQ2hhbmdlZDogcmVxdWVzdC5ib2R5LmlkQ2hhbmdlZCB8fCBudWxsLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBpbnZhbGlkIHJlc3BvbnNlIGZyb20gdGhlIFdhenVoIEFQSVxuICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlTWFuYWdlckluZm8uZGF0YS5kZXRhaWwgfHwgYCR7YXBpLnVybH06JHthcGkucG9ydH0gaXMgdW5yZWFjaGFibGVgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1hcGk6Y2hlY2tTdG9yZWRBUEknLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRVBST1RPJykge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGRhdGE6IHsgcGFzc3dvcmQ6ICcqKioqJywgYXBpSXNEb3duOiB0cnVlIH0sXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IuY29kZSA9PT0gJ0VDT05OUkVGVVNFRCcpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICBkYXRhOiB7IHBhc3N3b3JkOiAnKioqKicsIGFwaUlzRG93bjogdHJ1ZSB9LFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGFwaXMgPSBhd2FpdCB0aGlzLm1hbmFnZUhvc3RzLmdldEhvc3RzKCk7XG4gICAgICAgICAgZm9yIChjb25zdCBhcGkgb2YgYXBpcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgaWQgPSBPYmplY3Qua2V5cyhhcGkpWzBdO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlTWFuYWdlckluZm8gPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICAgICAgICBgL21hbmFnZXIvaW5mb2AsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgeyBhcGlIb3N0SUQ6IGlkIH1cbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja1Jlc3BvbnNlSXNEb3duKHJlc3BvbnNlTWFuYWdlckluZm8pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgICAgICAgICAgICBgRVJST1IzMDk5IC0gJHtyZXNwb25zZS5kYXRhLmRldGFpbCB8fCAnV2F6dWggbm90IHJlYWR5IHlldCd9YCxcbiAgICAgICAgICAgICAgICAgIDMwOTksXG4gICAgICAgICAgICAgICAgICA1MDAsXG4gICAgICAgICAgICAgICAgICByZXNwb25zZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlTWFuYWdlckluZm8uc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmJvZHkuaWQgPSBpZDtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmJvZHkuaWRDaGFuZ2VkID0gaWQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY2hlY2tTdG9yZWRBUEkoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgMzAyMCwgNTAwLCByZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgMzAwMiwgNTAwLCByZXNwb25zZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgcGVyZm9tcyBhIHZhbGlkYXRpb24gb2YgQVBJIHBhcmFtc1xuICAgKiBAcGFyYW0ge09iamVjdH0gYm9keSBBUEkgcGFyYW1zXG4gICAqL1xuICB2YWxpZGF0ZUNoZWNrQXBpUGFyYW1zKGJvZHkpIHtcbiAgICBpZiAoISgndXNlcm5hbWUnIGluIGJvZHkpKSB7XG4gICAgICByZXR1cm4gJ01pc3NpbmcgcGFyYW06IEFQSSBVU0VSTkFNRSc7XG4gICAgfVxuXG4gICAgaWYgKCEoJ3Bhc3N3b3JkJyBpbiBib2R5KSAmJiAhKCdpZCcgaW4gYm9keSkpIHtcbiAgICAgIHJldHVybiAnTWlzc2luZyBwYXJhbTogQVBJIFBBU1NXT1JEJztcbiAgICB9XG5cbiAgICBpZiAoISgndXJsJyBpbiBib2R5KSkge1xuICAgICAgcmV0dXJuICdNaXNzaW5nIHBhcmFtOiBBUEkgVVJMJztcbiAgICB9XG5cbiAgICBpZiAoISgncG9ydCcgaW4gYm9keSkpIHtcbiAgICAgIHJldHVybiAnTWlzc2luZyBwYXJhbTogQVBJIFBPUlQnO1xuICAgIH1cblxuICAgIGlmICghYm9keS51cmwuaW5jbHVkZXMoJ2h0dHBzOi8vJykgJiYgIWJvZHkudXJsLmluY2x1ZGVzKCdodHRwOi8vJykpIHtcbiAgICAgIHJldHVybiAncHJvdG9jb2xfZXJyb3InO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNoZWNrIHRoZSB3YXp1aC1hcGkgY29uZmlndXJhdGlvbiByZWNlaXZlZCBpbiB0aGUgUE9TVCBib2R5IHdpbGwgd29ya1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gc3RhdHVzIG9iaiBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjaGVja0FQSShjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGFwaUF2YWlsYWJsZSA9IG51bGw7XG4gICAgICAvLyBjb25zdCBub3RWYWxpZCA9IHRoaXMudmFsaWRhdGVDaGVja0FwaVBhcmFtcyhyZXF1ZXN0LmJvZHkpO1xuICAgICAgLy8gaWYgKG5vdFZhbGlkKSByZXR1cm4gRXJyb3JSZXNwb25zZShub3RWYWxpZCwgMzAwMywgNTAwLCByZXNwb25zZSk7XG4gICAgICBsb2coJ3dhenVoLWFwaTpjaGVja0FQSScsIGAke3JlcXVlc3QuYm9keS5pZH0gaXMgdmFsaWRgLCAnZGVidWcnKTtcbiAgICAgIC8vIENoZWNrIGlmIGEgV2F6dWggQVBJIGlkIGlzIGdpdmVuIChhbHJlYWR5IHN0b3JlZCBBUEkpXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5tYW5hZ2VIb3N0cy5nZXRIb3N0QnlJZChyZXF1ZXN0LmJvZHkuaWQpO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgYXBpQXZhaWxhYmxlID0gZGF0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZygnd2F6dWgtYXBpOmNoZWNrQVBJJywgYEFQSSAke3JlcXVlc3QuYm9keS5pZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGBUaGUgQVBJICR7cmVxdWVzdC5ib2R5LmlkfSB3YXMgbm90IGZvdW5kYCwgMzAyOSwgNTAwLCByZXNwb25zZSk7XG4gICAgICB9XG4gICAgICBjb25zdCBvcHRpb25zID0geyBhcGlIb3N0SUQ6IHJlcXVlc3QuYm9keS5pZCB9O1xuICAgICAgaWYgKHJlcXVlc3QuYm9keS5mb3JjZVJlZnJlc2gpIHtcbiAgICAgICAgb3B0aW9uc1tcImZvcmNlUmVmcmVzaFwiXSA9IHJlcXVlc3QuYm9keS5mb3JjZVJlZnJlc2g7XG4gICAgICB9XG4gICAgICBsZXQgcmVzcG9uc2VNYW5hZ2VySW5mbztcbiAgICAgIHRyeXtcbiAgICAgICAgcmVzcG9uc2VNYW5hZ2VySW5mbyA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0ludGVybmFsVXNlci5yZXF1ZXN0KFxuICAgICAgICAgICdHRVQnLFxuICAgICAgICAgIGAvbWFuYWdlci9pbmZvYCxcbiAgICAgICAgICB7fSxcbiAgICAgICAgICBvcHRpb25zXG4gICAgICAgICk7XG4gICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgICBgRVJST1IzMDk5IC0gJHtlcnJvci5yZXNwb25zZS5kYXRhLmRldGFpbCB8fCAnV2F6dWggbm90IHJlYWR5IHlldCd9YCxcbiAgICAgICAgICAzMDk5LFxuICAgICAgICAgIDUwMCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBsb2coJ3dhenVoLWFwaTpjaGVja0FQSScsIGAke3JlcXVlc3QuYm9keS5pZH0gY3JlZGVudGlhbHMgYXJlIHZhbGlkYCwgJ2RlYnVnJyk7XG4gICAgICBpZiAocmVzcG9uc2VNYW5hZ2VySW5mby5zdGF0dXMgPT09IDIwMCAmJiByZXNwb25zZU1hbmFnZXJJbmZvLmRhdGEpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlQWdlbnRzID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzSW50ZXJuYWxVc2VyLnJlcXVlc3QoXG4gICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgYC9hZ2VudHNgLFxuICAgICAgICAgIHsgcGFyYW1zOiB7IGFnZW50c19saXN0OiAnMDAwJyB9IH0sXG4gICAgICAgICAgeyBhcGlIb3N0SUQ6IHJlcXVlc3QuYm9keS5pZCB9XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlQWdlbnRzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgY29uc3QgbWFuYWdlck5hbWUgPSByZXNwb25zZUFnZW50cy5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXNbMF0ubWFuYWdlcjtcblxuICAgICAgICAgIGxldCByZXNwb25zZUNsdXN0ZXIgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICdHRVQnLFxuICAgICAgICAgICAgYC9jbHVzdGVyL3N0YXR1c2AsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHsgYXBpSG9zdElEOiByZXF1ZXN0LmJvZHkuaWQgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBDaGVjayB0aGUgcnVuX2FzIGZvciB0aGUgQVBJIHVzZXIgYW5kIHVwZGF0ZSBpdFxuICAgICAgICAgIGxldCBhcGlVc2VyQWxsb3dSdW5BcyA9IEFQSV9VU0VSX1NUQVRVU19SVU5fQVMuQUxMX0RJU0FCTEVEO1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlQXBpVXNlckFsbG93UnVuQXMgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICdHRVQnLFxuICAgICAgICAgICAgYC9zZWN1cml0eS91c2Vycy9tZWAsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHsgYXBpSG9zdElEOiByZXF1ZXN0LmJvZHkuaWQgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlQXBpVXNlckFsbG93UnVuQXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbG93X3J1bl9hcyA9IHJlc3BvbnNlQXBpVXNlckFsbG93UnVuQXMuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdLmFsbG93X3J1bl9hcztcblxuICAgICAgICAgICAgaWYgKGFsbG93X3J1bl9hcyAmJiBhcGlBdmFpbGFibGUgJiYgYXBpQXZhaWxhYmxlLnJ1bl9hcykgLy8gSE9TVCBBTkQgVVNFUiBFTkFCTEVEXG4gICAgICAgICAgICAgIGFwaVVzZXJBbGxvd1J1bkFzID0gQVBJX1VTRVJfU1RBVFVTX1JVTl9BUy5FTkFCTEVEO1xuXG4gICAgICAgICAgICBlbHNlIGlmICghYWxsb3dfcnVuX2FzICYmIGFwaUF2YWlsYWJsZSAmJiBhcGlBdmFpbGFibGUucnVuX2FzKS8vIEhPU1QgRU5BQkxFRCBBTkQgVVNFUiBESVNBQkxFRFxuICAgICAgICAgICAgICBhcGlVc2VyQWxsb3dSdW5BcyA9IEFQSV9VU0VSX1NUQVRVU19SVU5fQVMuVVNFUl9OT1RfQUxMT1dFRDtcblxuICAgICAgICAgICAgZWxzZSBpZiAoYWxsb3dfcnVuX2FzICYmICggIWFwaUF2YWlsYWJsZSB8fCAhYXBpQXZhaWxhYmxlLnJ1bl9hcyApKSAvLyBVU0VSIEVOQUJMRUQgQU5EIEhPU1QgRElTQUJMRURcbiAgICAgICAgICAgICAgYXBpVXNlckFsbG93UnVuQXMgPSBBUElfVVNFUl9TVEFUVVNfUlVOX0FTLkhPU1RfRElTQUJMRUQ7XG5cbiAgICAgICAgICAgIGVsc2UgaWYgKCFhbGxvd19ydW5fYXMgJiYgKCAhYXBpQXZhaWxhYmxlIHx8ICFhcGlBdmFpbGFibGUucnVuX2FzICkpIC8vIEhPU1QgQU5EIFVTRVIgRElTQUJMRURcbiAgICAgICAgICAgICAgYXBpVXNlckFsbG93UnVuQXMgPSBBUElfVVNFUl9TVEFUVVNfUlVOX0FTLkFMTF9ESVNBQkxFRDtcbiAgICAgICAgICB9XG4gICAgICAgICAgQ2FjaGVJbk1lbW9yeUFQSVVzZXJBbGxvd1J1bkFzLnNldChcbiAgICAgICAgICAgIHJlcXVlc3QuYm9keS5pZCxcbiAgICAgICAgICAgIGFwaUF2YWlsYWJsZS51c2VybmFtZSxcbiAgICAgICAgICAgIGFwaVVzZXJBbGxvd1J1bkFzXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChyZXNwb25zZUNsdXN0ZXIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGxvZygnd2F6dWgtYXBpOmNoZWNrU3RvcmVkQVBJJywgYFdhenVoIEFQSSByZXNwb25zZSBpcyB2YWxpZGAsICdkZWJ1ZycpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlQ2x1c3Rlci5kYXRhLmRhdGEuZW5hYmxlZCA9PT0gJ3llcycpIHtcbiAgICAgICAgICAgICAgLy8gSWYgY2x1c3RlciBtb2RlIGlzIGFjdGl2ZVxuICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VDbHVzdGVyTG9jYWwgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdChcbiAgICAgICAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICAgICAgICBgL2NsdXN0ZXIvbG9jYWwvaW5mb2AsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgeyBhcGlIb3N0SUQ6IHJlcXVlc3QuYm9keS5pZCB9XG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlQ2x1c3RlckxvY2FsLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlcjogbWFuYWdlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IHJlc3BvbnNlQ2x1c3RlckxvY2FsLmRhdGEuZGF0YS5hZmZlY3RlZF9pdGVtc1swXS5ub2RlLFxuICAgICAgICAgICAgICAgICAgICBjbHVzdGVyOiByZXNwb25zZUNsdXN0ZXJMb2NhbC5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXNbMF0uY2x1c3RlcixcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnZW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgIGFsbG93X3J1bl9hczogYXBpVXNlckFsbG93UnVuQXMsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBDbHVzdGVyIG1vZGUgaXMgbm90IGFjdGl2ZVxuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgIG1hbmFnZXI6IG1hbmFnZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgY2x1c3RlcjogJ0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICAgIGFsbG93X3J1bl9hczogYXBpVXNlckFsbG93UnVuQXMsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtYXBpOmNoZWNrQVBJJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG5cbiAgICAgIGlmIChlcnJvciAmJiBlcnJvci5yZXNwb25zZSAmJiBlcnJvci5yZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgICBgVW5hdGhvcml6ZWQuIFBsZWFzZSBjaGVjayBBUEkgY3JlZGVudGlhbHMuICR7ZXJyb3IucmVzcG9uc2UuZGF0YS5tZXNzYWdlfWAsXG4gICAgICAgICAgNDAxLFxuICAgICAgICAgIDQwMSxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGVycm9yICYmIGVycm9yLnJlc3BvbnNlICYmIGVycm9yLnJlc3BvbnNlLmRhdGEgJiYgZXJyb3IucmVzcG9uc2UuZGF0YS5kZXRhaWwpIHtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgICAgZXJyb3IucmVzcG9uc2UuZGF0YS5kZXRhaWwsXG4gICAgICAgICAgZXJyb3IucmVzcG9uc2Uuc3RhdHVzIHx8IDUwMCxcbiAgICAgICAgICBlcnJvci5yZXNwb25zZS5zdGF0dXMgfHwgNTAwLFxuICAgICAgICAgIHJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VQUk9UTycpIHtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgICAgJ1dyb25nIHByb3RvY29sIGJlaW5nIHVzZWQgdG8gY29ubmVjdCB0byB0aGUgV2F6dWggQVBJJyxcbiAgICAgICAgICAzMDA1LFxuICAgICAgICAgIDUwMCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgMzAwNSwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG5cbiAgY2hlY2tSZXNwb25zZUlzRG93bihyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgLy8gQXZvaWQgXCJFcnJvciBjb21tdW5pY2F0aW5nIHdpdGggc29ja2V0XCIgbGlrZSBlcnJvcnNcbiAgICAgIGNvbnN0IHNvY2tldEVycm9yQ29kZXMgPSBbMTAxMywgMTAxNCwgMTAxNywgMTAxOCwgMTAxOV07XG4gICAgICBjb25zdCBzdGF0dXMgPSAocmVzcG9uc2UuZGF0YSB8fCB7fSkuc3RhdHVzIHx8IDFcbiAgICAgIGNvbnN0IGlzRG93biA9IHNvY2tldEVycm9yQ29kZXMuaW5jbHVkZXMoc3RhdHVzKTtcblxuICAgICAgaXNEb3duICYmIGxvZygnd2F6dWgtYXBpOm1ha2VSZXF1ZXN0JywgJ1dhenVoIEFQSSBpcyBvbmxpbmUgYnV0IFdhenVoIGlzIG5vdCByZWFkeSB5ZXQnKTtcblxuICAgICAgcmV0dXJuIGlzRG93bjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIG1haW4gV2F6dWggZGFlbW9ucyBzdGF0dXNcbiAgICogQHBhcmFtIHsqfSBjb250ZXh0IEVuZHBvaW50IGNvbnRleHRcbiAgICogQHBhcmFtIHsqfSBhcGkgQVBJIGVudHJ5IHN0b3JlZCBpbiAud2F6dWhcbiAgICogQHBhcmFtIHsqfSBwYXRoIE9wdGlvbmFsLiBXYXp1aCBBUEkgdGFyZ2V0IHBhdGguXG4gICAqL1xuICBhc3luYyBjaGVja0RhZW1vbnMoY29udGV4dCwgYXBpLCBwYXRoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzSW50ZXJuYWxVc2VyLnJlcXVlc3QoXG4gICAgICAgICdHRVQnLFxuICAgICAgICAnL21hbmFnZXIvc3RhdHVzJyxcbiAgICAgICAge30sXG4gICAgICAgIHsgYXBpSG9zdElEOiBhcGkuaWQgfVxuICAgICAgKTtcblxuICAgICAgY29uc3QgZGFlbW9ucyA9ICgoKChyZXNwb25zZSB8fCB7fSkuZGF0YSB8fCB7fSkuZGF0YSB8fCB7fSkuYWZmZWN0ZWRfaXRlbXMgfHwgW10pWzBdIHx8IHt9O1xuXG4gICAgICBjb25zdCBpc0NsdXN0ZXIgPVxuICAgICAgICAoKGFwaSB8fCB7fSkuY2x1c3Rlcl9pbmZvIHx8IHt9KS5zdGF0dXMgPT09ICdlbmFibGVkJyAmJlxuICAgICAgICB0eXBlb2YgZGFlbW9uc1snd2F6dWgtY2x1c3RlcmQnXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICBjb25zdCB3YXp1aGRiRXhpc3RzID0gdHlwZW9mIGRhZW1vbnNbJ3dhenVoLWRiJ10gIT09ICd1bmRlZmluZWQnO1xuXG4gICAgICBjb25zdCBleGVjZCA9IGRhZW1vbnNbJ29zc2VjLWV4ZWNkJ10gPT09ICdydW5uaW5nJztcbiAgICAgIGNvbnN0IG1vZHVsZXNkID0gZGFlbW9uc1snd2F6dWgtbW9kdWxlc2QnXSA9PT0gJ3J1bm5pbmcnO1xuICAgICAgY29uc3Qgd2F6dWhkYiA9IHdhenVoZGJFeGlzdHMgPyBkYWVtb25zWyd3YXp1aC1kYiddID09PSAncnVubmluZycgOiB0cnVlO1xuICAgICAgY29uc3QgY2x1c3RlcmQgPSBpc0NsdXN0ZXIgPyBkYWVtb25zWyd3YXp1aC1jbHVzdGVyZCddID09PSAncnVubmluZycgOiB0cnVlO1xuXG4gICAgICBjb25zdCBpc1ZhbGlkID0gZXhlY2QgJiYgbW9kdWxlc2QgJiYgd2F6dWhkYiAmJiBjbHVzdGVyZDtcblxuICAgICAgaXNWYWxpZCAmJiBsb2coJ3dhenVoLWFwaTpjaGVja0RhZW1vbnMnLCBgV2F6dWggaXMgcmVhZHlgLCAnZGVidWcnKTtcblxuICAgICAgaWYgKHBhdGggPT09ICcvcGluZycpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZCB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXp1aCBub3QgcmVhZHkgeWV0Jyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtYXBpOmNoZWNrRGFlbW9ucycsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBzbGVlcCh0aW1lTXMpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2V0VGltZW91dChyZXNvbHZlLCB0aW1lTXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgZm9yIERldiBUb29scy5cbiAgICogaHR0cHM6Ly9kb2N1bWVudGF0aW9uLndhenVoLmNvbS9jdXJyZW50L3VzZXItbWFudWFsL2FwaS9yZWZlcmVuY2UuaHRtbFxuICAgKiBEZXBlbmRpbmcgb24gdGhlIG1ldGhvZCBhbmQgdGhlIHBhdGggc29tZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhbiBhcnJheSBvciBub3QuXG4gICAqIFNpbmNlIHdlIGFsbG93IHRoZSB1c2VyIHRvIHdyaXRlIHRoZSByZXF1ZXN0IHVzaW5nIGJvdGggY29tbWEtc2VwYXJhdGVkIGFuZCBhcnJheSBhcyB3ZWxsLFxuICAgKiB3ZSBuZWVkIHRvIGNoZWNrIGlmIGl0IHNob3VsZCBiZSB0cmFuc2Zvcm1lZCBvciBub3QuXG4gICAqIEBwYXJhbSB7Kn0gbWV0aG9kIFRoZSByZXF1ZXN0IG1ldGhvZFxuICAgKiBAcGFyYW0geyp9IHBhdGggVGhlIFdhenVoIEFQSSBwYXRoXG4gICAqL1xuICBzaG91bGRLZWVwQXJyYXlBc0l0KG1ldGhvZCwgcGF0aCkge1xuICAgIC8vIE1ldGhvZHMgdGhhdCB3ZSBtdXN0IHJlc3BlY3QgYSBkbyBub3QgdHJhbnNmb3JtIHRoZW1cbiAgICBjb25zdCBpc0FnZW50c1Jlc3RhcnQgPSBtZXRob2QgPT09ICdQT1NUJyAmJiBwYXRoID09PSAnL2FnZW50cy9yZXN0YXJ0JztcbiAgICBjb25zdCBpc0FjdGl2ZVJlc3BvbnNlID0gbWV0aG9kID09PSAnUFVUJyAmJiBwYXRoLnN0YXJ0c1dpdGgoJy9hY3RpdmUtcmVzcG9uc2UvJyk7XG4gICAgY29uc3QgaXNBZGRpbmdBZ2VudHNUb0dyb3VwID0gbWV0aG9kID09PSAnUE9TVCcgJiYgcGF0aC5zdGFydHNXaXRoKCcvYWdlbnRzL2dyb3VwLycpO1xuXG4gICAgLy8gUmV0dXJucyB0cnVlIG9ubHkgaWYgb25lIG9mIHRoZSBhYm92ZSBjb25kaXRpb25zIGlzIHRydWVcbiAgICByZXR1cm4gaXNBZ2VudHNSZXN0YXJ0IHx8IGlzQWN0aXZlUmVzcG9uc2UgfHwgaXNBZGRpbmdBZ2VudHNUb0dyb3VwO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgcGVyZm9ybXMgYSByZXF1ZXN0IG92ZXIgV2F6dWggQVBJIGFuZCByZXR1cm5zIGl0cyByZXNwb25zZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kIE1ldGhvZDogR0VULCBQVVQsIFBPU1QsIERFTEVURVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBBUEkgcm91dGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgZGF0YSBhbmQgcGFyYW1zIHRvIHBlcmZvcm0gdGhlIHJlcXVlc3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIEFQSSBpZFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gQVBJIHJlc3BvbnNlIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIG1ha2VSZXF1ZXN0KGNvbnRleHQsIG1ldGhvZCwgcGF0aCwgZGF0YSwgaWQsIHJlc3BvbnNlKSB7XG4gICAgY29uc3QgZGV2VG9vbHMgPSAhIShkYXRhIHx8IHt9KS5kZXZUb29scztcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXBpID0gYXdhaXQgdGhpcy5tYW5hZ2VIb3N0cy5nZXRIb3N0QnlJZChpZCk7XG4gICAgICBpZiAoZGV2VG9vbHMpIHtcbiAgICAgICAgZGVsZXRlIGRhdGEuZGV2VG9vbHM7XG4gICAgICB9XG5cbiAgICAgIGlmICghT2JqZWN0LmtleXMoYXBpKS5sZW5ndGgpIHtcbiAgICAgICAgbG9nKCd3YXp1aC1hcGk6bWFrZVJlcXVlc3QnLCAnQ291bGQgbm90IGdldCBob3N0IGNyZWRlbnRpYWxzJyk7XG4gICAgICAgIC8vQ2FuIG5vdCBnZXQgY3JlZGVudGlhbHMgZnJvbSB3YXp1aC1ob3N0c1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnQ291bGQgbm90IGdldCBob3N0IGNyZWRlbnRpYWxzJywgMzAxMSwgNDA0LCByZXNwb25zZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBkYXRhID0ge307XG4gICAgICB9O1xuXG4gICAgICBpZiAoIWRhdGEuaGVhZGVycykge1xuICAgICAgICBkYXRhLmhlYWRlcnMgPSB7fTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGFwaUhvc3RJRDogaWRcbiAgICAgIH07XG5cbiAgICAgIC8vIFNldCBjb250ZW50IHR5cGUgYXBwbGljYXRpb24veG1sIGlmIG5lZWRlZFxuICAgICAgaWYgKHR5cGVvZiAoZGF0YSB8fCB7fSkuYm9keSA9PT0gJ3N0cmluZycgJiYgKGRhdGEgfHwge30pLm9yaWdpbiA9PT0gJ3htbGVkaXRvcicpIHtcbiAgICAgICAgZGF0YS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICAgICAgICBkZWxldGUgZGF0YS5vcmlnaW47XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgKGRhdGEgfHwge30pLmJvZHkgPT09ICdzdHJpbmcnICYmIChkYXRhIHx8IHt9KS5vcmlnaW4gPT09ICdqc29uJykge1xuICAgICAgICBkYXRhLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICBkZWxldGUgZGF0YS5vcmlnaW47XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgKGRhdGEgfHwge30pLmJvZHkgPT09ICdzdHJpbmcnICYmIChkYXRhIHx8IHt9KS5vcmlnaW4gPT09ICdyYXcnKSB7XG4gICAgICAgIGRhdGEuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgICAgZGVsZXRlIGRhdGEub3JpZ2luO1xuICAgICAgfVxuICAgICAgY29uc3QgZGVsYXkgPSAoZGF0YSB8fCB7fSkuZGVsYXkgfHwgMDtcbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICBhZGRKb2JUb1F1ZXVlKHtcbiAgICAgICAgICBzdGFydEF0OiBuZXcgRGF0ZShEYXRlLm5vdygpICsgZGVsYXkpLFxuICAgICAgICAgIHJ1bjogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KG1ldGhvZCwgcGF0aCwgZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyb3Ipe1xuICAgICAgICAgICAgICBsb2coJ3F1ZXVlOmRlbGF5QXBpUmVxdWVzdCcsYEFuIGVycm9yIG9jdXJyZWQgaW4gdGhlIGRlbGF5ZWQgcmVxdWVzdDogXCIke21ldGhvZH0gJHtwYXRofVwiOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgYm9keTogeyBlcnJvcjogMCwgbWVzc2FnZTogJ1N1Y2Nlc3MnIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoID09PSAnL3BpbmcnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY2hlY2sgPSBhd2FpdCB0aGlzLmNoZWNrRGFlbW9ucyhjb250ZXh0LCBhcGksIHBhdGgpO1xuICAgICAgICAgIHJldHVybiBjaGVjaztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zdCBpc0Rvd24gPSAoZXJyb3IgfHwge30pLmNvZGUgPT09ICdFQ09OTlJFRlVTRUQnO1xuICAgICAgICAgIGlmICghaXNEb3duKSB7XG4gICAgICAgICAgICBsb2coJ3dhenVoLWFwaTptYWtlUmVxdWVzdCcsICdXYXp1aCBBUEkgaXMgb25saW5lIGJ1dCBXYXp1aCBpcyBub3QgcmVhZHkgeWV0Jyk7XG4gICAgICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgICAgICAgYEVSUk9SMzA5OSAtICR7ZXJyb3IubWVzc2FnZSB8fCAnV2F6dWggbm90IHJlYWR5IHlldCd9YCxcbiAgICAgICAgICAgICAgMzA5OSxcbiAgICAgICAgICAgICAgNTAwLFxuICAgICAgICAgICAgICByZXNwb25zZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbG9nKCd3YXp1aC1hcGk6bWFrZVJlcXVlc3QnLCBgJHttZXRob2R9ICR7cGF0aH1gLCAnZGVidWcnKTtcblxuICAgICAgLy8gRXh0cmFjdCBrZXlzIGZyb20gcGFyYW1ldGVyc1xuICAgICAgY29uc3QgZGF0YVByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIGFycmF5cyBpbnRvIGNvbW1hLXNlcGFyYXRlZCBzdHJpbmcgaWYgYXBwbGljYWJsZS5cbiAgICAgIC8vIFRoZSByZWFzb24gaXMgdGhhdCB3ZSBhcmUgYWNjZXB0aW5nIGFycmF5cyBmb3IgY29tbWEtc2VwYXJhdGVkXG4gICAgICAvLyBwYXJhbWV0ZXJzIGluIHRoZSBEZXYgVG9vbHNcbiAgICAgIGlmICghdGhpcy5zaG91bGRLZWVwQXJyYXlBc0l0KG1ldGhvZCwgcGF0aCkpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YVByb3BlcnRpZXMpIHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhW2tleV0pKSB7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSBkYXRhW2tleV0uam9pbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VUb2tlbiA9IGF3YWl0IGNvbnRleHQud2F6dWguYXBpLmNsaWVudC5hc0N1cnJlbnRVc2VyLnJlcXVlc3QobWV0aG9kLCBwYXRoLCBkYXRhLCBvcHRpb25zKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlSXNEb3duID0gdGhpcy5jaGVja1Jlc3BvbnNlSXNEb3duKHJlc3BvbnNlVG9rZW4pO1xuICAgICAgaWYgKHJlc3BvbnNlSXNEb3duKSB7XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKFxuICAgICAgICAgIGBFUlJPUjMwOTkgLSAke3Jlc3BvbnNlLmJvZHkubWVzc2FnZSB8fCAnV2F6dWggbm90IHJlYWR5IHlldCd9YCxcbiAgICAgICAgICAzMDk5LFxuICAgICAgICAgIDUwMCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgbGV0IHJlc3BvbnNlQm9keSA9IChyZXNwb25zZVRva2VuIHx8IHt9KS5kYXRhIHx8IHt9O1xuICAgICAgaWYgKCFyZXNwb25zZUJvZHkpIHtcbiAgICAgICAgcmVzcG9uc2VCb2R5ID1cbiAgICAgICAgICB0eXBlb2YgcmVzcG9uc2VCb2R5ID09PSAnc3RyaW5nJyAmJiBwYXRoLmluY2x1ZGVzKCcvZmlsZXMnKSAmJiBtZXRob2QgPT09ICdHRVQnXG4gICAgICAgICAgICA/ICcgJ1xuICAgICAgICAgICAgOiBmYWxzZTtcbiAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHJlc3BvbnNlQm9keTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlRXJyb3IgPSByZXNwb25zZS5zdGF0dXMgIT09IDIwMCA/IHJlc3BvbnNlLnN0YXR1cyA6IGZhbHNlO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlRXJyb3IgJiYgcmVzcG9uc2VCb2R5KSB7XG4gICAgICAgIC8vY2xlYW5LZXlzKHJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiByZXNwb25zZVRva2VuLmRhdGFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXNwb25zZUVycm9yICYmIGRldlRvb2xzKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgYm9keTogcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRocm93IHJlc3BvbnNlRXJyb3IgJiYgcmVzcG9uc2VCb2R5LmRldGFpbFxuICAgICAgICA/IHsgbWVzc2FnZTogcmVzcG9uc2VCb2R5LmRldGFpbCwgY29kZTogcmVzcG9uc2VFcnJvciB9XG4gICAgICAgIDogbmV3IEVycm9yKCdVbmV4cGVjdGVkIGVycm9yIGZldGNoaW5nIGRhdGEgZnJvbSB0aGUgV2F6dWggQVBJJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciAmJiBlcnJvci5yZXNwb25zZSAmJiBlcnJvci5yZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgICBlcnJvci5tZXNzYWdlIHx8IGVycm9yLFxuICAgICAgICAgIGVycm9yLmNvZGUgPyBgV2F6dWggQVBJIGVycm9yOiAke2Vycm9yLmNvZGV9YCA6IDMwMTMsXG4gICAgICAgICAgNDAxLFxuICAgICAgICAgIHJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBlcnJvck1zZyA9IChlcnJvci5yZXNwb25zZSB8fCB7fSkuZGF0YSB8fCBlcnJvci5tZXNzYWdlXG4gICAgICBsb2coJ3dhenVoLWFwaTptYWtlUmVxdWVzdCcsIGVycm9yTXNnIHx8IGVycm9yKTtcbiAgICAgIGlmIChkZXZUb29scykge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHsgZXJyb3I6ICczMDEzJywgbWVzc2FnZTogZXJyb3JNc2cgfHwgZXJyb3IgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgoZXJyb3IgfHwge30pLmNvZGUgJiYgQXBpRXJyb3JFcXVpdmFsZW5jZVtlcnJvci5jb2RlXSkge1xuICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBBcGlFcnJvckVxdWl2YWxlbmNlW2Vycm9yLmNvZGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKFxuICAgICAgICAgIGVycm9yTXNnLmRldGFpbCB8fCBlcnJvcixcbiAgICAgICAgICBlcnJvci5jb2RlID8gYFdhenVoIEFQSSBlcnJvcjogJHtlcnJvci5jb2RlfWAgOiAzMDEzLFxuICAgICAgICAgIDUwMCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ha2UgYSByZXF1ZXN0IHRvIEFQSVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gYXBpIHJlc3BvbnNlIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIHJlcXVlc3RBcGkoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgY29uc3QgaWRBcGkgPSBnZXRDb29raWVWYWx1ZUJ5TmFtZShyZXF1ZXN0LmhlYWRlcnMuY29va2llLCAnd3otYXBpJyk7XG4gICAgaWYgKGlkQXBpICE9PSByZXF1ZXN0LmJvZHkuaWQpIHsgLy8gaWYgdGhlIGN1cnJlbnQgdG9rZW4gYmVsb25ncyB0byBhIGRpZmZlcmVudCBBUEkgaWQsIHdlIHJlbG9naW4gdG8gb2J0YWluIGEgbmV3IHRva2VuXG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgJ3N0YXR1cyBjb2RlIDQwMScsXG4gICAgICAgIDQwMSxcbiAgICAgICAgNDAxLFxuICAgICAgICByZXNwb25zZVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFyZXF1ZXN0LmJvZHkubWV0aG9kKSB7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTWlzc2luZyBwYXJhbTogbWV0aG9kJywgMzAxNSwgNDAwLCByZXNwb25zZSk7XG4gICAgfSBlbHNlIGlmICghcmVxdWVzdC5ib2R5Lm1ldGhvZC5tYXRjaCgvXig/OkdFVHxQVVR8UE9TVHxERUxFVEUpJC8pKSB7XG4gICAgICBsb2coJ3dhenVoLWFwaTptYWtlUmVxdWVzdCcsICdSZXF1ZXN0IG1ldGhvZCBpcyBub3QgdmFsaWQuJyk7XG4gICAgICAvL01ldGhvZCBpcyBub3QgYSB2YWxpZCBIVFRQIHJlcXVlc3QgbWV0aG9kXG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnUmVxdWVzdCBtZXRob2QgaXMgbm90IHZhbGlkLicsIDMwMTUsIDQwMCwgcmVzcG9uc2UpO1xuICAgIH0gZWxzZSBpZiAoIXJlcXVlc3QuYm9keS5wYXRoKSB7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTWlzc2luZyBwYXJhbTogcGF0aCcsIDMwMTYsIDQwMCwgcmVzcG9uc2UpO1xuICAgIH0gZWxzZSBpZiAoIXJlcXVlc3QuYm9keS5wYXRoLm1hdGNoKC9eXFwvLisvKSkge1xuICAgICAgbG9nKCd3YXp1aC1hcGk6bWFrZVJlcXVlc3QnLCAnUmVxdWVzdCBwYXRoIGlzIG5vdCB2YWxpZC4nKTtcbiAgICAgIC8vUGF0aCBkb2Vzbid0IHN0YXJ0IHdpdGggJy8nXG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnUmVxdWVzdCBwYXRoIGlzIG5vdCB2YWxpZC4nLCAzMDE1LCA0MDAsIHJlc3BvbnNlKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICByZXR1cm4gdGhpcy5tYWtlUmVxdWVzdChcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgcmVxdWVzdC5ib2R5Lm1ldGhvZCxcbiAgICAgICAgcmVxdWVzdC5ib2R5LnBhdGgsXG4gICAgICAgIHJlcXVlc3QuYm9keS5ib2R5LFxuICAgICAgICByZXF1ZXN0LmJvZHkuaWQsXG4gICAgICAgIHJlc3BvbnNlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZnVsbCBkYXRhIG9uIENTViBmb3JtYXQgZnJvbSBhIGxpc3QgV2F6dWggQVBJIGVuZHBvaW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGNzdiBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBjc3YoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghcmVxdWVzdC5ib2R5IHx8ICFyZXF1ZXN0LmJvZHkucGF0aCkgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCBwYXRoIGlzIHJlcXVpcmVkJyk7XG4gICAgICBpZiAoIXJlcXVlc3QuYm9keS5pZCkgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCBpZCBpcyByZXF1aXJlZCcpO1xuXG4gICAgICBjb25zdCBmaWx0ZXJzID0gQXJyYXkuaXNBcnJheSgoKHJlcXVlc3QgfHwge30pLmJvZHkgfHwge30pLmZpbHRlcnMpID8gcmVxdWVzdC5ib2R5LmZpbHRlcnMgOiBbXTtcblxuICAgICAgbGV0IHRtcFBhdGggPSByZXF1ZXN0LmJvZHkucGF0aDtcblxuICAgICAgaWYgKHRtcFBhdGggJiYgdHlwZW9mIHRtcFBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRtcFBhdGggPSB0bXBQYXRoWzBdID09PSAnLycgPyB0bXBQYXRoLnN1YnN0cigxKSA6IHRtcFBhdGg7XG4gICAgICB9XG5cbiAgICAgIGlmICghdG1wUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCBwYXJzaW5nIHBhdGggZmllbGQnKTtcblxuICAgICAgbG9nKCd3YXp1aC1hcGk6Y3N2JywgYFJlcG9ydCAke3RtcFBhdGh9YCwgJ2RlYnVnJyk7XG4gICAgICAvLyBSZWFsIGxpbWl0LCByZWdhcmRsZXNzIHRoZSB1c2VyIHF1ZXJ5XG4gICAgICBjb25zdCBwYXJhbXMgPSB7IGxpbWl0OiA1MDAgfTtcblxuICAgICAgaWYgKGZpbHRlcnMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgICBpZiAoIWZpbHRlci5uYW1lIHx8ICFmaWx0ZXIudmFsdWUpIGNvbnRpbnVlO1xuICAgICAgICAgIHBhcmFtc1tmaWx0ZXIubmFtZV0gPSBmaWx0ZXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGl0ZW1zQXJyYXkgPSBbXTtcblxuICAgICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdChcbiAgICAgICAgJ0dFVCcsXG4gICAgICAgIGAvJHt0bXBQYXRofWAsXG4gICAgICAgIHsgcGFyYW1zOiBwYXJhbXMgfSxcbiAgICAgICAgeyBhcGlIb3N0SUQ6IHJlcXVlc3QuYm9keS5pZCB9XG4gICAgICApO1xuXG4gICAgICBjb25zdCBpc0xpc3QgPSByZXF1ZXN0LmJvZHkucGF0aC5pbmNsdWRlcygnL2xpc3RzJykgJiYgcmVxdWVzdC5ib2R5LmZpbHRlcnMgJiYgcmVxdWVzdC5ib2R5LmZpbHRlcnMubGVuZ3RoICYmIHJlcXVlc3QuYm9keS5maWx0ZXJzLmZpbmQoZmlsdGVyID0+IGZpbHRlci5faXNDREJMaXN0KTtcblxuICAgICAgY29uc3QgdG90YWxJdGVtcyA9ICgoKG91dHB1dCB8fCB7fSkuZGF0YSB8fCB7fSkuZGF0YSB8fCB7fSkudG90YWxfYWZmZWN0ZWRfaXRlbXM7XG5cbiAgICAgIGlmICh0b3RhbEl0ZW1zICYmICFpc0xpc3QpIHtcbiAgICAgICAgcGFyYW1zLm9mZnNldCA9IDA7XG4gICAgICAgIGl0ZW1zQXJyYXkucHVzaCguLi5vdXRwdXQuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zKTtcbiAgICAgICAgd2hpbGUgKGl0ZW1zQXJyYXkubGVuZ3RoIDwgdG90YWxJdGVtcyAmJiBwYXJhbXMub2Zmc2V0IDwgdG90YWxJdGVtcykge1xuICAgICAgICAgIHBhcmFtcy5vZmZzZXQgKz0gcGFyYW1zLmxpbWl0O1xuICAgICAgICAgIGNvbnN0IHRtcERhdGEgPSBhd2FpdCBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNDdXJyZW50VXNlci5yZXF1ZXN0KFxuICAgICAgICAgICAgJ0dFVCcsXG4gICAgICAgICAgICBgLyR7dG1wUGF0aH1gLFxuICAgICAgICAgICAgeyBwYXJhbXM6IHBhcmFtcyB9LFxuICAgICAgICAgICAgeyBhcGlIb3N0SUQ6IHJlcXVlc3QuYm9keS5pZCB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpdGVtc0FycmF5LnB1c2goLi4udG1wRGF0YS5kYXRhLmRhdGEuYWZmZWN0ZWRfaXRlbXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3RhbEl0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aCwgZmlsdGVycyB9ID0gcmVxdWVzdC5ib2R5O1xuICAgICAgICBjb25zdCBpc0FycmF5T2ZMaXN0cyA9XG4gICAgICAgICAgcGF0aC5pbmNsdWRlcygnL2xpc3RzJykgJiYgIWlzTGlzdDtcbiAgICAgICAgY29uc3QgaXNBZ2VudHMgPSBwYXRoLmluY2x1ZGVzKCcvYWdlbnRzJykgJiYgIXBhdGguaW5jbHVkZXMoJ2dyb3VwcycpO1xuICAgICAgICBjb25zdCBpc0FnZW50c09mR3JvdXAgPSBwYXRoLnN0YXJ0c1dpdGgoJy9hZ2VudHMvZ3JvdXBzLycpO1xuICAgICAgICBjb25zdCBpc0ZpbGVzID0gcGF0aC5lbmRzV2l0aCgnL2ZpbGVzJyk7XG4gICAgICAgIGxldCBmaWVsZHMgPSBPYmplY3Qua2V5cyhvdXRwdXQuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdKTtcblxuICAgICAgICBpZiAoaXNBZ2VudHMgfHwgaXNBZ2VudHNPZkdyb3VwKSB7XG4gICAgICAgICAgaWYgKGlzRmlsZXMpIHtcbiAgICAgICAgICAgIGZpZWxkcyA9IFsnZmlsZW5hbWUnLCAnaGFzaCddO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZHMgPSBbXG4gICAgICAgICAgICAgICdpZCcsXG4gICAgICAgICAgICAgICdzdGF0dXMnLFxuICAgICAgICAgICAgICAnbmFtZScsXG4gICAgICAgICAgICAgICdpcCcsXG4gICAgICAgICAgICAgICdncm91cCcsXG4gICAgICAgICAgICAgICdtYW5hZ2VyJyxcbiAgICAgICAgICAgICAgJ25vZGVfbmFtZScsXG4gICAgICAgICAgICAgICdkYXRlQWRkJyxcbiAgICAgICAgICAgICAgJ3ZlcnNpb24nLFxuICAgICAgICAgICAgICAnbGFzdEtlZXBBbGl2ZScsXG4gICAgICAgICAgICAgICdvcy5hcmNoJyxcbiAgICAgICAgICAgICAgJ29zLmJ1aWxkJyxcbiAgICAgICAgICAgICAgJ29zLmNvZGVuYW1lJyxcbiAgICAgICAgICAgICAgJ29zLm1ham9yJyxcbiAgICAgICAgICAgICAgJ29zLm1pbm9yJyxcbiAgICAgICAgICAgICAgJ29zLm5hbWUnLFxuICAgICAgICAgICAgICAnb3MucGxhdGZvcm0nLFxuICAgICAgICAgICAgICAnb3MudW5hbWUnLFxuICAgICAgICAgICAgICAnb3MudmVyc2lvbicsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FycmF5T2ZMaXN0cykge1xuICAgICAgICAgIGNvbnN0IGZsYXRMaXN0cyA9IFtdO1xuICAgICAgICAgIGZvciAoY29uc3QgbGlzdCBvZiBpdGVtc0FycmF5KSB7XG4gICAgICAgICAgICBjb25zdCB7IHJlbGF0aXZlX2Rpcm5hbWUsIGl0ZW1zIH0gPSBsaXN0O1xuICAgICAgICAgICAgZmxhdExpc3RzLnB1c2goLi4uaXRlbXMubWFwKGl0ZW0gPT4gKHsgcmVsYXRpdmVfZGlybmFtZSwga2V5OiBpdGVtLmtleSwgdmFsdWU6IGl0ZW0udmFsdWUgfSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmllbGRzID0gWydyZWxhdGl2ZV9kaXJuYW1lJywgJ2tleScsICd2YWx1ZSddO1xuICAgICAgICAgIGl0ZW1zQXJyYXkgPSBbLi4uZmxhdExpc3RzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0xpc3QpIHtcbiAgICAgICAgICBmaWVsZHMgPSBbJ2tleScsICd2YWx1ZSddO1xuICAgICAgICAgIGl0ZW1zQXJyYXkgPSBvdXRwdXQuZGF0YS5kYXRhLmFmZmVjdGVkX2l0ZW1zWzBdLml0ZW1zO1xuICAgICAgICB9XG4gICAgICAgIGZpZWxkcyA9IGZpZWxkcy5tYXAoaXRlbSA9PiAoeyB2YWx1ZTogaXRlbSwgZGVmYXVsdDogJy0nIH0pKTtcblxuICAgICAgICBjb25zdCBqc29uMmNzdlBhcnNlciA9IG5ldyBQYXJzZXIoeyBmaWVsZHMgfSk7XG5cbiAgICAgICAgbGV0IGNzdiA9IGpzb24yY3N2UGFyc2VyLnBhcnNlKGl0ZW1zQXJyYXkpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGZpZWxkO1xuICAgICAgICAgIGlmIChjc3YuaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICAgICAgICBjc3YgPSBjc3YucmVwbGFjZSh2YWx1ZSwgS2V5RXF1aXZhbGVuY2VbdmFsdWVdIHx8IHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2NzdicgfSxcbiAgICAgICAgICBib2R5OiBjc3ZcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKG91dHB1dCAmJiBvdXRwdXQuZGF0YSAmJiBvdXRwdXQuZGF0YS5kYXRhICYmICFvdXRwdXQuZGF0YS5kYXRhLnRvdGFsX2FmZmVjdGVkX2l0ZW1zKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcmVzdWx0cycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCBmZXRjaGluZyBkYXRhIGZyb20gdGhlIFdhenVoIEFQSSR7b3V0cHV0ICYmIG91dHB1dC5kYXRhICYmIG91dHB1dC5kYXRhLmRldGFpbCA/IGA6ICR7b3V0cHV0LmJvZHkuZGV0YWlsfWAgOiAnJ31gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1hcGk6Y3N2JywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAzMDM0LCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvLyBHZXQgZGUgbGlzdCBvZiBhdmFpbGFibGUgcmVxdWVzdHMgaW4gdGhlIEFQSVxuICBnZXRSZXF1ZXN0TGlzdChjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICAvL1JlYWQgYSBzdGF0aWMgSlNPTiB1bnRpbCB0aGUgYXBpIGNhbGwgaGFzIGltcGxlbWVudGVkXG4gICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgIGJvZHk6IGFwaVJlcXVlc3RMaXN0XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBnZXQgdGhlIHRpbWVzdGFtcCBmaWVsZFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gdGltZXN0YW1wIGZpZWxkIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGdldFRpbWVTdGFtcChjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc291cmNlID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModGhpcy51cGRhdGVSZWdpc3RyeS5maWxlLCAndXRmOCcpKTtcbiAgICAgIGlmIChzb3VyY2UuaW5zdGFsbGF0aW9uRGF0ZSAmJiBzb3VyY2UubGFzdFJlc3RhcnQpIHtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICd3YXp1aC1hcGk6Z2V0VGltZVN0YW1wJyxcbiAgICAgICAgICBgSW5zdGFsbGF0aW9uIGRhdGU6ICR7c291cmNlLmluc3RhbGxhdGlvbkRhdGV9LiBMYXN0IHJlc3RhcnQ6ICR7c291cmNlLmxhc3RSZXN0YXJ0fWAsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIGluc3RhbGxhdGlvbkRhdGU6IHNvdXJjZS5pbnN0YWxsYXRpb25EYXRlLFxuICAgICAgICAgICAgbGFzdFJlc3RhcnQ6IHNvdXJjZS5sYXN0UmVzdGFydCxcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmV0Y2ggd2F6dWgtdmVyc2lvbiByZWdpc3RyeScpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ3dhenVoLWFwaTpnZXRUaW1lU3RhbXAnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKFxuICAgICAgICBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3QgZmV0Y2ggd2F6dWgtdmVyc2lvbiByZWdpc3RyeScsXG4gICAgICAgIDQwMDEsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZ2V0IHRoZSBleHRlbnNpb25zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBleHRlbnNpb25zIG9iamVjdCBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBzZXRFeHRlbnNpb25zKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGlkLCBleHRlbnNpb25zIH0gPSByZXF1ZXN0LmJvZHk7XG4gICAgICAvLyBVcGRhdGUgY2x1c3RlciBpbmZvcm1hdGlvbiBpbiB0aGUgd2F6dWgtcmVnaXN0cnkuanNvblxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVSZWdpc3RyeS51cGRhdGVBUElFeHRlbnNpb25zKGlkLCBleHRlbnNpb25zKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiAyMDBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtYXBpOnNldEV4dGVuc2lvbnMnLCBlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKFxuICAgICAgICBlcnJvci5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc2V0IGV4dGVuc2lvbnMnLFxuICAgICAgICA0MDAxLFxuICAgICAgICA1MDAsXG4gICAgICAgIHJlc3BvbnNlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGdldCB0aGUgZXh0ZW5zaW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gZXh0ZW5zaW9ucyBvYmplY3Qgb3IgRXJyb3JSZXNwb25zZVxuICAgKi9cbiAgZ2V0RXh0ZW5zaW9ucyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc291cmNlID0gSlNPTi5wYXJzZShcbiAgICAgICAgZnMucmVhZEZpbGVTeW5jKHRoaXMudXBkYXRlUmVnaXN0cnkuZmlsZSwgJ3V0ZjgnKVxuICAgICAgKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBleHRlbnNpb25zOiAoc291cmNlLmhvc3RzW3JlcXVlc3QucGFyYW1zLmlkXSB8fCB7fSkuZXh0ZW5zaW9ucyB8fCB7fVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1hcGk6Z2V0RXh0ZW5zaW9ucycsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgIGVycm9yLm1lc3NhZ2UgfHwgJ0NvdWxkIG5vdCBmZXRjaCB3YXp1aC12ZXJzaW9uIHJlZ2lzdHJ5JyxcbiAgICAgICAgNDAwMSxcbiAgICAgICAgNTAwLFxuICAgICAgICByZXNwb25zZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBnZXQgdGhlIHdhenVoIHNldHVwIHNldHRpbmdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBzZXR1cCBpbmZvIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGdldFNldHVwSW5mbyhjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc291cmNlID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmModGhpcy51cGRhdGVSZWdpc3RyeS5maWxlLCAndXRmOCcpKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgZGF0YTogIU9iamVjdC52YWx1ZXMoc291cmNlKS5sZW5ndGggPyAnJyA6IHNvdXJjZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1hcGk6Z2V0U2V0dXBJbmZvJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShcbiAgICAgICAgYENvdWxkIG5vdCBnZXQgZGF0YSBmcm9tIHdhenVoLXZlcnNpb24gcmVnaXN0cnkgZHVlIHRvICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gLFxuICAgICAgICA0MDA1LFxuICAgICAgICA1MDAsXG4gICAgICAgIHJlc3BvbnNlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYmFzaWMgc3lzY29sbGVjdG9yIGluZm9ybWF0aW9uIGZvciBnaXZlbiBhZ2VudC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEJhc2ljIHN5c2NvbGxlY3RvciBpbmZvcm1hdGlvblxuICAgKi9cbiAgYXN5bmMgZ2V0U3lzY29sbGVjdG9yKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhcGlIb3N0SUQgPSBnZXRDb29raWVWYWx1ZUJ5TmFtZShyZXF1ZXN0LmhlYWRlcnMuY29va2llLCd3ei1hcGknKTtcbiAgICAgIGlmICghcmVxdWVzdC5wYXJhbXMgfHwgIWFwaUhvc3RJRCB8fCAhcmVxdWVzdC5wYXJhbXMuYWdlbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBZ2VudCBJRCBhbmQgQVBJIElEIGFyZSByZXF1aXJlZCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IGFnZW50IH0gPSByZXF1ZXN0LnBhcmFtcztcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzSW50ZXJuYWxVc2VyLnJlcXVlc3QoJ0dFVCcsIGAvc3lzY29sbGVjdG9yLyR7YWdlbnR9L2hhcmR3YXJlYCwge30sIHsgYXBpSG9zdElEIH0pLFxuICAgICAgICBjb250ZXh0LndhenVoLmFwaS5jbGllbnQuYXNJbnRlcm5hbFVzZXIucmVxdWVzdCgnR0VUJywgYC9zeXNjb2xsZWN0b3IvJHthZ2VudH0vb3NgLCB7fSwgeyBhcGlIb3N0SUQgfSlcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBkYXRhLm1hcChpdGVtID0+IChpdGVtLmRhdGEgfHwge30pLmRhdGEgfHwgW10pO1xuICAgICAgY29uc3QgW2hhcmR3YXJlUmVzcG9uc2UsIG9zUmVzcG9uc2VdID0gcmVzdWx0O1xuXG4gICAgICAvLyBGaWxsIHN5c2NvbGxlY3RvciBvYmplY3RcbiAgICAgIGNvbnN0IHN5c2NvbGxlY3RvciA9IHtcbiAgICAgICAgaGFyZHdhcmU6XG4gICAgICAgICAgdHlwZW9mIGhhcmR3YXJlUmVzcG9uc2UgPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKGhhcmR3YXJlUmVzcG9uc2UpLmxlbmd0aFxuICAgICAgICAgICAgPyB7IC4uLmhhcmR3YXJlUmVzcG9uc2UuYWZmZWN0ZWRfaXRlbXNbMF0gfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgb3M6XG4gICAgICAgICAgdHlwZW9mIG9zUmVzcG9uc2UgPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKG9zUmVzcG9uc2UpLmxlbmd0aFxuICAgICAgICAgICAgPyB7IC4uLm9zUmVzcG9uc2UuYWZmZWN0ZWRfaXRlbXNbMF0gfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHN5c2NvbGxlY3RvclxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtYXBpOmdldFN5c2NvbGxlY3RvcicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSB8fCBlcnJvciwgMzAzNSwgNTAwLCByZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG4iXX0=