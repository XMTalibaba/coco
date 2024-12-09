"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BasicAuthRoutes = void 0;

var _configSchema = require("@kbn/config-schema");

var _security_cookie = require("../../../session/security_cookie");

var _common = require("../../../../common");

var _tenant_resolver = require("../../../multitenancy/tenant_resolver");

/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

var _axios2 = _interopRequireDefault(require("axios"));

var _https = _interopRequireDefault(require("https"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const httpsAgent = new _https.default.Agent({
  rejectUnauthorized: false
});

const _axios = _axios2.default.create({
  httpsAgent
});

var _manageHosts = require("../../../../../wazuh/server/lib/manage-hosts");
const manageHosts = new _manageHosts.ManageHosts(); // Cache to save the token for the internal user by API host ID

var codePending = {};
const code = require("svg-captcha");
const createCode = () => {
  return code.create({
      size: 4,
      ignoreChars: "0o1iIl",
      noise: 3,
      color: true,
      background: "#fff",
      fontSize: 60
  });
}

const getCookieValueByName = (cookie, name) => {
  if (!cookie) return;
  const cookieRegExp = new RegExp(`.*${name}=([^;]+)`);
  const [_, cookieNameValue] = cookie.match(cookieRegExp) || [];
  return cookieNameValue;
};

const buildRequestOptions = async (method, path, data) => {
  const api = await manageHosts.getHostById('default');
  const {
    body,
    params,
    headers,
    ...rest
  } = data;
  return {
    method: method,
    headers: {
      'content-type': 'application/json',
      'kbn-xsrf': 'kibana',
      ...(headers ? headers : {})
    },
    data: body || rest || {},
    params: params || {},
    url: `${api.url}:${api.port}${path}`
  };
};

const wzRequest = async (method, path, cookie, data) => {
  try {
    if (!data.headers) {
      data.headers = {};
    }
    let loginIp = getCookieValueByName(cookie, 'login-ip');
    let username = getCookieValueByName(cookie, 'wz-user');
    if (loginIp) data.headers['login-ip'] = loginIp;
    if (username) data.headers['user-name'] = username;

    const optionsRequest = await buildRequestOptions(method, path, data);
    const response = await _axios(optionsRequest);
    return response;
  } catch (error) {
    throw error;
  }
};

const noCertWzRequest = async (method, path, cookie, data) => {
  return await wzRequest(method, path, cookie, data);
};

class BasicAuthRoutes {
  constructor(router, config, sessionStorageFactory, securityClient, coreSetup) {
    this.router = router;
    this.config = config;
    this.sessionStorageFactory = sessionStorageFactory;
    this.securityClient = securityClient;
    this.coreSetup = coreSetup;
  }

  setupRoutes() {
    // bootstrap an empty page so that browser app can render the login page
    // using client side routing.
    this.coreSetup.http.resources.register({
      path: _common.LOGIN_PAGE_URI,
      validate: false,
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      this.sessionStorageFactory.asScoped(request).clear();
      const clearOldVersionCookie = (0, _security_cookie.clearOldVersionCookieValue)(this.config);
      return response.renderAnonymousCoreApp({
        headers: {
          'set-cookie': clearOldVersionCookie
        }
      });
    }); // login using username and password
    
    this.router.post({ // 登陆前调用wazuh接口，跳过认证
      path: '/api/wz-request',
      validate: {
        body: _configSchema.schema.object({
          id: _configSchema.schema.string(),
          method: _configSchema.schema.string(),
          path: _configSchema.schema.string(),
          body: _configSchema.schema.any()
        })
      },
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      // const api = await manageHosts.getHostById('default'); // 打印wazuh连接信息
      let res = await noCertWzRequest(request.body.method, request.body.path, request.headers.cookie, request.body.body);
      return response.ok({
        body: res.data
      });
    });

    this.router.get({ // 获取IP
      path: '/api/getIp',
      validate: false,
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      let remoteAddress = request.remoteAddress;
      return response.ok({
        body: {
          remoteAddress
        }
      });
    });

    this.router.post({ // IP和用户名添加cookie
      path: '/api/setCookie',
      validate: {
        body: _configSchema.schema.object({
          username: _configSchema.schema.string(),
          ip: _configSchema.schema.string()
        })
      },
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      return response.ok({
        headers: {
          'set-cookie': [`login-ip=${request.body.ip};Path=/;HttpOnly`, `wz-user=${request.body.username};Path=/;HttpOnly`]
        },
        body: {
          msg: 'success'
        }
      });
    });

    this.router.get({ // 获取图片验证码
      path: '/api/getCode',
      validate: false,
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      let code = createCode();
      codePending[getCookieValueByName(request.headers.cookie, 'wz-token')] = code.text;
      return response.ok({
        body: {
          svg: code.data
        }
      });
    });

    this.router.post({ // 验证图片验证码
      path: '/api/validateCode',
      validate: {
        body: _configSchema.schema.object({
          code: _configSchema.schema.string()
        })
      },
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      console.log('获取', codePending[getCookieValueByName(request.headers.cookie, 'wz-token')]);
      let realCode = codePending[getCookieValueByName(request.headers.cookie, 'wz-token')];
      let msg = realCode.toLowerCase() === request.body.code.toLowerCase() ? 'success' : 'failed';
      delete codePending[getCookieValueByName(request.headers.cookie, 'wz-token')];
      return response.ok({
        body: {
          msg
        }
      });
    });

    this.router.post({
      path: _common.API_AUTH_LOGIN,
      validate: {
        body: _configSchema.schema.object({
          username: _configSchema.schema.string(),
          password: _configSchema.schema.string()
        })
      },
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      var _this$config$multiten, _this$config$multiten2;

      const forbiddenUsernames = this.config.auth.forbidden_usernames;

      if (forbiddenUsernames.indexOf(request.body.username) > -1) {
        context.security_plugin.logger.error(`Denied login for forbidden username ${request.body.username}`);
        return response.badRequest({
          // Cannot login using forbidden user name.
          body: 'Invalid username or password'
        });
      }

      let user;

      const { password } = request.body;
      request.body.password = Buffer.from(`${password}`, 'base64').toString('utf-8');

      try {
        user = await this.securityClient.authenticate(request, {
          username: request.body.username,
          password: request.body.password
        });
      } catch (error) {
        context.security_plugin.logger.error(`Failed authentication: ${error}`);
        return response.unauthorized({
          headers: {
            'www-authenticate': error.message
          }
        });
      }

      this.sessionStorageFactory.asScoped(request).clear();
      const encodedCredentials = Buffer.from(`${request.body.username}:${request.body.password}`).toString('base64');
      const sessionStorage = {
        username: user.username,
        credentials: {
          authHeaderValue: `Basic ${encodedCredentials}`
        },
        authType: 'basicauth',
        isAnonymousAuth: false,
        expiryTime: Date.now() + this.config.session.ttl
      };

      if ((_this$config$multiten = this.config.multitenancy) === null || _this$config$multiten === void 0 ? void 0 : _this$config$multiten.enabled) {
        const selectTenant = (0, _tenant_resolver.resolveTenant)(request, user.username, user.tenants, this.config, sessionStorage);
        sessionStorage.tenant = selectTenant;
      }

      this.sessionStorageFactory.asScoped(request).set(sessionStorage);
      return response.ok({
        body: {
          username: user.username,
          tenants: user.tenants,
          roles: user.roles,
          backendroles: user.backendRoles,
          selectedTenants: ((_this$config$multiten2 = this.config.multitenancy) === null || _this$config$multiten2 === void 0 ? void 0 : _this$config$multiten2.enabled) ? sessionStorage.tenant : undefined
        }
      });
    }); // logout

    this.router.post({
      path: _common.API_AUTH_LOGOUT,
      validate: false,
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      this.sessionStorageFactory.asScoped(request).clear();
      return response.ok({
        body: {}
      });
    }); // anonymous auth

    this.router.get({
      path: `/auth/anonymous`,
      validate: false,
      options: {
        authRequired: false
      }
    }, async (context, request, response) => {
      if (this.config.auth.anonymous_auth_enabled) {
        var _this$config$multiten3, _this$config$multiten4;

        let user;

        try {
          user = await this.securityClient.authenticateWithHeaders(request, {});
        } catch (error) {
          context.security_plugin.logger.error(`Failed authentication: ${error}`);
          return response.unauthorized({
            headers: {
              'www-authenticate': error.message
            }
          });
        }

        this.sessionStorageFactory.asScoped(request).clear();
        const sessionStorage = {
          username: user.username,
          authType: 'basicauth',
          isAnonymousAuth: true,
          expiryTime: Date.now() + this.config.session.ttl
        };

        if ((_this$config$multiten3 = this.config.multitenancy) === null || _this$config$multiten3 === void 0 ? void 0 : _this$config$multiten3.enabled) {
          const selectTenant = (0, _tenant_resolver.resolveTenant)(request, user.username, user.tenants, this.config, sessionStorage);
          sessionStorage.tenant = selectTenant;
        }

        this.sessionStorageFactory.asScoped(request).set(sessionStorage);
        return response.ok({
          body: {
            username: user.username,
            tenants: user.tenants,
            roles: user.roles,
            backendroles: user.backendRoles,
            selectedTenants: ((_this$config$multiten4 = this.config.multitenancy) === null || _this$config$multiten4 === void 0 ? void 0 : _this$config$multiten4.enabled) ? sessionStorage.tenant : undefined
          }
        });
      } else {
        return response.badRequest({
          body: 'Anonymous auth is disabled.'
        });
      }
    });
  }

}

exports.BasicAuthRoutes = BasicAuthRoutes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlcy50cyJdLCJuYW1lcyI6WyJCYXNpY0F1dGhSb3V0ZXMiLCJjb25zdHJ1Y3RvciIsInJvdXRlciIsImNvbmZpZyIsInNlc3Npb25TdG9yYWdlRmFjdG9yeSIsInNlY3VyaXR5Q2xpZW50IiwiY29yZVNldHVwIiwic2V0dXBSb3V0ZXMiLCJodHRwIiwicmVzb3VyY2VzIiwicmVnaXN0ZXIiLCJwYXRoIiwiTE9HSU5fUEFHRV9VUkkiLCJ2YWxpZGF0ZSIsIm9wdGlvbnMiLCJhdXRoUmVxdWlyZWQiLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiYXNTY29wZWQiLCJjbGVhciIsImNsZWFyT2xkVmVyc2lvbkNvb2tpZSIsInJlbmRlckFub255bW91c0NvcmVBcHAiLCJoZWFkZXJzIiwicG9zdCIsIkFQSV9BVVRIX0xPR0lOIiwiYm9keSIsInNjaGVtYSIsIm9iamVjdCIsInVzZXJuYW1lIiwic3RyaW5nIiwicGFzc3dvcmQiLCJmb3JiaWRkZW5Vc2VybmFtZXMiLCJhdXRoIiwiZm9yYmlkZGVuX3VzZXJuYW1lcyIsImluZGV4T2YiLCJzZWN1cml0eV9wbHVnaW4iLCJsb2dnZXIiLCJlcnJvciIsImJhZFJlcXVlc3QiLCJ1c2VyIiwiYXV0aGVudGljYXRlIiwidW5hdXRob3JpemVkIiwibWVzc2FnZSIsImVuY29kZWRDcmVkZW50aWFscyIsIkJ1ZmZlciIsImZyb20iLCJ0b1N0cmluZyIsInNlc3Npb25TdG9yYWdlIiwiY3JlZGVudGlhbHMiLCJhdXRoSGVhZGVyVmFsdWUiLCJhdXRoVHlwZSIsImlzQW5vbnltb3VzQXV0aCIsImV4cGlyeVRpbWUiLCJEYXRlIiwibm93Iiwic2Vzc2lvbiIsInR0bCIsIm11bHRpdGVuYW5jeSIsImVuYWJsZWQiLCJzZWxlY3RUZW5hbnQiLCJ0ZW5hbnRzIiwidGVuYW50Iiwic2V0Iiwib2siLCJyb2xlcyIsImJhY2tlbmRyb2xlcyIsImJhY2tlbmRSb2xlcyIsInNlbGVjdGVkVGVuYW50cyIsInVuZGVmaW5lZCIsIkFQSV9BVVRIX0xPR09VVCIsImdldCIsImFub255bW91c19hdXRoX2VuYWJsZWQiLCJhdXRoZW50aWNhdGVXaXRoSGVhZGVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWVBOztBQUVBOztBQU9BOztBQUNBOztBQXpCQTs7Ozs7Ozs7Ozs7Ozs7QUEyQk8sTUFBTUEsZUFBTixDQUFzQjtBQUMzQkMsRUFBQUEsV0FBVyxDQUNRQyxNQURSLEVBRVFDLE1BRlIsRUFHUUMscUJBSFIsRUFJUUMsY0FKUixFQUtRQyxTQUxSLEVBTVQ7QUFBQSxTQUxpQkosTUFLakIsR0FMaUJBLE1BS2pCO0FBQUEsU0FKaUJDLE1BSWpCLEdBSmlCQSxNQUlqQjtBQUFBLFNBSGlCQyxxQkFHakIsR0FIaUJBLHFCQUdqQjtBQUFBLFNBRmlCQyxjQUVqQixHQUZpQkEsY0FFakI7QUFBQSxTQURpQkMsU0FDakIsR0FEaUJBLFNBQ2pCO0FBQUU7O0FBRUdDLEVBQUFBLFdBQVAsR0FBcUI7QUFDbkI7QUFDQTtBQUNBLFNBQUtELFNBQUwsQ0FBZUUsSUFBZixDQUFvQkMsU0FBcEIsQ0FBOEJDLFFBQTlCLENBQ0U7QUFDRUMsTUFBQUEsSUFBSSxFQUFFQyxzQkFEUjtBQUVFQyxNQUFBQSxRQUFRLEVBQUUsS0FGWjtBQUdFQyxNQUFBQSxPQUFPLEVBQUU7QUFDUEMsUUFBQUEsWUFBWSxFQUFFO0FBRFA7QUFIWCxLQURGLEVBUUUsT0FBT0MsT0FBUCxFQUFnQkMsT0FBaEIsRUFBeUJDLFFBQXpCLEtBQXNDO0FBQ3BDLFdBQUtkLHFCQUFMLENBQTJCZSxRQUEzQixDQUFvQ0YsT0FBcEMsRUFBNkNHLEtBQTdDO0FBQ0EsWUFBTUMscUJBQXFCLEdBQUcsaURBQTJCLEtBQUtsQixNQUFoQyxDQUE5QjtBQUNBLGFBQU9lLFFBQVEsQ0FBQ0ksc0JBQVQsQ0FBZ0M7QUFDckNDLFFBQUFBLE9BQU8sRUFBRTtBQUNQLHdCQUFjRjtBQURQO0FBRDRCLE9BQWhDLENBQVA7QUFLRCxLQWhCSCxFQUhtQixDQXNCbkI7O0FBQ0EsU0FBS25CLE1BQUws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VyxJQUFJLENBQUNxQixPQUhjLEVBSW5CLEtBQUsxRCxNQUpjLEVBS25CNkMsY0FMbUIsQ0FBckI7QUFPQUEsVUFBQUEsY0FBYyxDQUFDYyxNQUFmLEdBQXdCRixZQUF4QjtBQUNEOztBQUNELGFBQUt4RCxxQkFBTCxDQUEyQmUsUUFBM0IsQ0FBb0NGLE9BQXBDLEVBQTZDOEMsR0FBN0MsQ0FBaURmLGNBQWpEO0FBRUEsZUFBTzlCLFFBQVEsQ0FBQzhDLEVBQVQsQ0FBWTtBQUNqQnRDLFVBQUFBLElBQUksRUFBRTtBQUNKRyxZQUFBQSxRQUFRLEVBQUVXLElBQUksQ0FBQ1gsUUFEWDtBQUVKZ0MsWUFBQUEsT0FBTyxFQUFFckIsSUFBSSxDQUFDcUIsT0FGVjtBQUdKSSxZQUFBQSxLQUFLLEVBQUV6QixJQUFJLENBQUN5QixLQUhSO0FBSUpDLFlBQUFBLFlBQVksRUFBRTFCLElBQUksQ0FBQzJCLFlBSmY7QUFLSkMsWUFBQUEsZUFBZSxFQUFFLGdDQUFLakUsTUFBTCxDQUFZdUQsWUFBWixrRkFBMEJDLE9BQTFCLElBQ2JYLGNBQWMsQ0FBQ2MsTUFERixHQUViTztBQVBBO0FBRFcsU0FBWixDQUFQO0FBV0QsT0E1Q0QsTUE0Q087QUFDTCxlQUFPbkQsUUFBUSxDQUFDcUIsVUFBVCxDQUFvQjtBQUN6QmIsVUFBQUEsSUFBSSxFQUFFO0FBRG1CLFNBQXBCLENBQVA7QUFHRDtBQUNGLEtBMURIO0FBNEREOztBQTVMMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgc2NoZW1hIH0gZnJvbSAnQGtibi9jb25maWctc2NoZW1hJztcbmltcG9ydCB7IElSb3V0ZXIsIFNlc3Npb25TdG9yYWdlRmFjdG9yeSwgQ29yZVNldHVwIH0gZnJvbSAna2liYW5hL3NlcnZlcic7XG5pbXBvcnQge1xuICBTZWN1cml0eVNlc3Npb25Db29raWUsXG4gIGNsZWFyT2xkVmVyc2lvbkNvb2tpZVZhbHVlLFxufSBmcm9tICcuLi8uLi8uLi9zZXNzaW9uL3NlY3VyaXR5X2Nvb2tpZSc7XG5pbXBvcnQgeyBTZWN1cml0eVBsdWdpbkNvbmZpZ1R5cGUgfSBmcm9tICcuLi8uLi8uLic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vdXNlcic7XG5pbXBvcnQgeyBTZWN1cml0eUNsaWVudCB9IGZyb20gJy4uLy4uLy4uL2JhY2tlbmQvb3BlbmRpc3Ryb19zZWN1cml0eV9jbGllbnQnO1xuaW1wb3J0IHsgQVBJX0FVVEhfTE9HSU4sIEFQSV9BVVRIX0xPR09VVCwgTE9HSU5fUEFHRV9VUkkgfSBmcm9tICcuLi8uLi8uLi8uLi9jb21tb24nO1xuaW1wb3J0IHsgcmVzb2x2ZVRlbmFudCB9IGZyb20gJy4uLy4uLy4uL211bHRpdGVuYW5jeS90ZW5hbnRfcmVzb2x2ZXInO1xuXG5leHBvcnQgY2xhc3MgQmFzaWNBdXRoUm91dGVzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByb3V0ZXI6IElSb3V0ZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWc6IFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlc3Npb25TdG9yYWdlRmFjdG9yeTogU2Vzc2lvblN0b3JhZ2VGYWN0b3J5PFNlY3VyaXR5U2Vzc2lvbkNvb2tpZT4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBzZWN1cml0eUNsaWVudDogU2VjdXJpdHlDbGllbnQsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb3JlU2V0dXA6IENvcmVTZXR1cFxuICApIHt9XG5cbiAgcHVibGljIHNldHVwUm91dGVzKCkge1xuICAgIC8vIGJvb3RzdHJhcCBhbiBlbXB0eSBwYWdlIHNvIHRoYXQgYnJvd3NlciBhcHAgY2FuIHJlbmRlciB0aGUgbG9naW4gcGFnZVxuICAgIC8vIHVzaW5nIGNsaWVudCBzaWRlIHJvdXRpbmcuXG4gICAgdGhpcy5jb3JlU2V0dXAuaHR0cC5yZXNvdXJjZXMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIHBhdGg6IExPR0lOX1BBR0VfVVJJLFxuICAgICAgICB2YWxpZGF0ZTogZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBhdXRoUmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgICB0aGlzLnNlc3Npb25TdG9yYWdlRmFjdG9yeS5hc1Njb3BlZChyZXF1ZXN0KS5jbGVhcigpO1xuICAgICAgICBjb25zdCBjbGVhck9sZFZlcnNpb25Db29raWUgPSBjbGVhck9sZFZlcnNpb25Db29raWVWYWx1ZSh0aGlzLmNvbmZpZyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5yZW5kZXJBbm9ueW1vdXNDb3JlQXBwKHtcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnc2V0LWNvb2tpZSc6IGNsZWFyT2xkVmVyc2lvbkNvb2tpZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gbG9naW4gdXNpbmcgdXNlcm5hbWUgYW5kIHBhc3N3b3JkXG4gICAgdGhpcy5yb3V0ZXIucG9zdChcbiAgICAgIHtcbiAgICAgICAgcGF0aDogQVBJX0FVVEhfTE9HSU4sXG4gICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgYm9keTogc2NoZW1hLm9iamVjdCh7XG4gICAgICAgICAgICB1c2VybmFtZTogc2NoZW1hLnN0cmluZygpLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHNjaGVtYS5zdHJpbmcoKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGF1dGhSZXF1aXJlZDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZvcmJpZGRlblVzZXJuYW1lczogc3RyaW5nW10gPSB0aGlzLmNvbmZpZy5hdXRoLmZvcmJpZGRlbl91c2VybmFtZXM7XG4gICAgICAgIGlmIChmb3JiaWRkZW5Vc2VybmFtZXMuaW5kZXhPZihyZXF1ZXN0LmJvZHkudXNlcm5hbWUpID4gLTEpIHtcbiAgICAgICAgICBjb250ZXh0LnNlY3VyaXR5X3BsdWdpbi5sb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICBgRGVuaWVkIGxvZ2luIGZvciBmb3JiaWRkZW4gdXNlcm5hbWUgJHtyZXF1ZXN0LmJvZHkudXNlcm5hbWV9YFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJhZFJlcXVlc3Qoe1xuICAgICAgICAgICAgLy8gQ2Fubm90IGxvZ2luIHVzaW5nIGZvcmJpZGRlbiB1c2VyIG5hbWUuXG4gICAgICAgICAgICBib2R5OiAnSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXNlcjogVXNlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB1c2VyID0gYXdhaXQgdGhpcy5zZWN1cml0eUNsaWVudC5hdXRoZW50aWNhdGUocmVxdWVzdCwge1xuICAgICAgICAgICAgdXNlcm5hbWU6IHJlcXVlc3QuYm9keS51c2VybmFtZSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiByZXF1ZXN0LmJvZHkucGFzc3dvcmQsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29udGV4dC5zZWN1cml0eV9wbHVnaW4ubG9nZ2VyLmVycm9yKGBGYWlsZWQgYXV0aGVudGljYXRpb246ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnVuYXV0aG9yaXplZCh7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICd3d3ctYXV0aGVudGljYXRlJzogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlc3Npb25TdG9yYWdlRmFjdG9yeS5hc1Njb3BlZChyZXF1ZXN0KS5jbGVhcigpO1xuICAgICAgICBjb25zdCBlbmNvZGVkQ3JlZGVudGlhbHMgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgICBgJHtyZXF1ZXN0LmJvZHkudXNlcm5hbWV9OiR7cmVxdWVzdC5ib2R5LnBhc3N3b3JkfWBcbiAgICAgICAgKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgIGNvbnN0IHNlc3Npb25TdG9yYWdlOiBTZWN1cml0eVNlc3Npb25Db29raWUgPSB7XG4gICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgIGF1dGhIZWFkZXJWYWx1ZTogYEJhc2ljICR7ZW5jb2RlZENyZWRlbnRpYWxzfWAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhdXRoVHlwZTogJ2Jhc2ljYXV0aCcsXG4gICAgICAgICAgaXNBbm9ueW1vdXNBdXRoOiBmYWxzZSxcbiAgICAgICAgICBleHBpcnlUaW1lOiBEYXRlLm5vdygpICsgdGhpcy5jb25maWcuc2Vzc2lvbi50dGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm11bHRpdGVuYW5jeT8uZW5hYmxlZCkge1xuICAgICAgICAgIGNvbnN0IHNlbGVjdFRlbmFudCA9IHJlc29sdmVUZW5hbnQoXG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgdXNlci51c2VybmFtZSxcbiAgICAgICAgICAgIHVzZXIudGVuYW50cyxcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2VcbiAgICAgICAgICApO1xuICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnRlbmFudCA9IHNlbGVjdFRlbmFudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlc3Npb25TdG9yYWdlRmFjdG9yeS5hc1Njb3BlZChyZXF1ZXN0KS5zZXQoc2Vzc2lvblN0b3JhZ2UpO1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgICB0ZW5hbnRzOiB1c2VyLnRlbmFudHMsXG4gICAgICAgICAgICByb2xlczogdXNlci5yb2xlcyxcbiAgICAgICAgICAgIGJhY2tlbmRyb2xlczogdXNlci5iYWNrZW5kUm9sZXMsXG4gICAgICAgICAgICBzZWxlY3RlZFRlbmFudHM6IHRoaXMuY29uZmlnLm11bHRpdGVuYW5jeT8uZW5hYmxlZCA/IHNlc3Npb25TdG9yYWdlLnRlbmFudCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gbG9nb3V0XG4gICAgdGhpcy5yb3V0ZXIucG9zdChcbiAgICAgIHtcbiAgICAgICAgcGF0aDogQVBJX0FVVEhfTE9HT1VULFxuICAgICAgICB2YWxpZGF0ZTogZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBhdXRoUmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgICB0aGlzLnNlc3Npb25TdG9yYWdlRmFjdG9yeS5hc1Njb3BlZChyZXF1ZXN0KS5jbGVhcigpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHt9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gYW5vbnltb3VzIGF1dGhcbiAgICB0aGlzLnJvdXRlci5nZXQoXG4gICAgICB7XG4gICAgICAgIHBhdGg6IGAvYXV0aC9hbm9ueW1vdXNgLFxuICAgICAgICB2YWxpZGF0ZTogZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBhdXRoUmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maWcuYXV0aC5hbm9ueW1vdXNfYXV0aF9lbmFibGVkKSB7XG4gICAgICAgICAgbGV0IHVzZXI6IFVzZXI7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHVzZXIgPSBhd2FpdCB0aGlzLnNlY3VyaXR5Q2xpZW50LmF1dGhlbnRpY2F0ZVdpdGhIZWFkZXJzKHJlcXVlc3QsIHt9KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29udGV4dC5zZWN1cml0eV9wbHVnaW4ubG9nZ2VyLmVycm9yKGBGYWlsZWQgYXV0aGVudGljYXRpb246ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudW5hdXRob3JpemVkKHtcbiAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICd3d3ctYXV0aGVudGljYXRlJzogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc2Vzc2lvblN0b3JhZ2VGYWN0b3J5LmFzU2NvcGVkKHJlcXVlc3QpLmNsZWFyKCk7XG4gICAgICAgICAgY29uc3Qgc2Vzc2lvblN0b3JhZ2U6IFNlY3VyaXR5U2Vzc2lvbkNvb2tpZSA9IHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lLFxuICAgICAgICAgICAgYXV0aFR5cGU6ICdiYXNpY2F1dGgnLFxuICAgICAgICAgICAgaXNBbm9ueW1vdXNBdXRoOiB0cnVlLFxuICAgICAgICAgICAgZXhwaXJ5VGltZTogRGF0ZS5ub3coKSArIHRoaXMuY29uZmlnLnNlc3Npb24udHRsLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAodGhpcy5jb25maWcubXVsdGl0ZW5hbmN5Py5lbmFibGVkKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RUZW5hbnQgPSByZXNvbHZlVGVuYW50KFxuICAgICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lLFxuICAgICAgICAgICAgICB1c2VyLnRlbmFudHMsXG4gICAgICAgICAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnRlbmFudCA9IHNlbGVjdFRlbmFudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXNzaW9uU3RvcmFnZUZhY3RvcnkuYXNTY29wZWQocmVxdWVzdCkuc2V0KHNlc3Npb25TdG9yYWdlKTtcblxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lLFxuICAgICAgICAgICAgICB0ZW5hbnRzOiB1c2VyLnRlbmFudHMsXG4gICAgICAgICAgICAgIHJvbGVzOiB1c2VyLnJvbGVzLFxuICAgICAgICAgICAgICBiYWNrZW5kcm9sZXM6IHVzZXIuYmFja2VuZFJvbGVzLFxuICAgICAgICAgICAgICBzZWxlY3RlZFRlbmFudHM6IHRoaXMuY29uZmlnLm11bHRpdGVuYW5jeT8uZW5hYmxlZFxuICAgICAgICAgICAgICAgID8gc2Vzc2lvblN0b3JhZ2UudGVuYW50XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXNwb25zZS5iYWRSZXF1ZXN0KHtcbiAgICAgICAgICAgIGJvZHk6ICdBbm9ueW1vdXMgYXV0aCBpcyBkaXNhYmxlZC4nLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxufVxuIl19