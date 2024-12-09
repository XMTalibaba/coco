"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenIdAuthentication = void 0;

var fs = _interopRequireWildcard(require("fs"));

var _wreck = _interopRequireDefault(require("@hapi/wreck"));

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _routes = require("./routes");

var _authentication_type = require("../authentication_type");

var _helper = require("./helper");

var _next_url = require("../../../utils/next_url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class OpenIdAuthentication extends _authentication_type.AuthenticationType {
  constructor(config, sessionStorageFactory, router, esClient, core, logger) {
    var _this$config$openid, _this$config$openid2;

    super(config, sessionStorageFactory, router, esClient, core, logger);

    _defineProperty(this, "type", 'openid');

    _defineProperty(this, "openIdAuthConfig", void 0);

    _defineProperty(this, "authHeaderName", void 0);

    _defineProperty(this, "openIdConnectUrl", void 0);

    _defineProperty(this, "wreckClient", void 0);

    this.wreckClient = this.createWreckClient();
    this.openIdAuthConfig = {};
    this.authHeaderName = ((_this$config$openid = this.config.openid) === null || _this$config$openid === void 0 ? void 0 : _this$config$openid.header) || '';
    this.openIdAuthConfig.authHeaderName = this.authHeaderName;
    this.openIdConnectUrl = ((_this$config$openid2 = this.config.openid) === null || _this$config$openid2 === void 0 ? void 0 : _this$config$openid2.connect_url) || '';
    let scope = this.config.openid.scope;

    if (scope.indexOf('openid') < 0) {
      scope = `openid ${scope}`;
    }

    this.openIdAuthConfig.scope = scope;
    this.init();
  }

  async init() {
    try {
      const response = await this.wreckClient.get(this.openIdConnectUrl);
      const payload = JSON.parse(response.payload);
      this.openIdAuthConfig.authorizationEndpoint = payload.authorization_endpoint;
      this.openIdAuthConfig.tokenEndpoint = payload.token_endpoint;
      this.openIdAuthConfig.endSessionEndpoint = payload.end_session_endpoint || undefined;
      const routes = new _routes.OpenIdAuthRoutes(this.router, this.config, this.sessionStorageFactory, this.openIdAuthConfig, this.securityClient, this.coreSetup, this.wreckClient);
      routes.setupRoutes();
    } catch (error) {
      this.logger.error(error); // TODO: log more info

      throw new Error('Failed when trying to obtain the endpoints from your IdP');
    }
  }

  createWreckClient() {
    var _this$config$openid3, _this$config$openid4;

    const wreckHttpsOption = {};

    if ((_this$config$openid3 = this.config.openid) === null || _this$config$openid3 === void 0 ? void 0 : _this$config$openid3.root_ca) {
      wreckHttpsOption.ca = [fs.readFileSync(this.config.openid.root_ca)];
    }

    if (((_this$config$openid4 = this.config.openid) === null || _this$config$openid4 === void 0 ? void 0 : _this$config$openid4.verify_hostnames) === false) {
      this.logger.debug(`openId auth 'verify_hostnames' option is off.`);

      wreckHttpsOption.checkServerIdentity = (host, cert) => {
        return undefined;
      };
    }

    if (Object.keys(wreckHttpsOption).length > 0) {
      return _wreck.default.defaults({
        agents: {
          http: new _http.default.Agent(),
          https: new _https.default.Agent(wreckHttpsOption),
          httpsAllowUnauthorized: new _https.default.Agent({
            rejectUnauthorized: false
          })
        }
      });
    } else {
      return _wreck.default;
    }
  }

  requestIncludesAuthInfo(request) {
    return request.headers.authorization ? true : false;
  }

  getAdditionalAuthHeader(request) {
    return {};
  }

  getCookie(request, authInfo) {
    return {
      username: authInfo.user_name,
      credentials: {
        authHeaderValue: request.headers.authorization
      },
      authType: this.type,
      expiryTime: Date.now() + this.config.session.ttl
    };
  } // TODO: Add token expiration check here


  async isValidCookie(cookie) {
    var _cookie$credentials, _cookie$credentials2, _cookie$credentials3;

    if (cookie.authType !== this.type || !cookie.username || !cookie.expiryTime || !((_cookie$credentials = cookie.credentials) === null || _cookie$credentials === void 0 ? void 0 : _cookie$credentials.authHeaderValue) || !((_cookie$credentials2 = cookie.credentials) === null || _cookie$credentials2 === void 0 ? void 0 : _cookie$credentials2.expires_at)) {
      return false;
    }

    if (((_cookie$credentials3 = cookie.credentials) === null || _cookie$credentials3 === void 0 ? void 0 : _cookie$credentials3.expires_at) > Date.now()) {
      return true;
    } // need to renew id token


    if (cookie.credentials.refresh_token) {
      try {
        var _this$config$openid5, _this$config$openid6;

        const query = {
          grant_type: 'refresh_token',
          client_id: (_this$config$openid5 = this.config.openid) === null || _this$config$openid5 === void 0 ? void 0 : _this$config$openid5.client_id,
          client_secret: (_this$config$openid6 = this.config.openid) === null || _this$config$openid6 === void 0 ? void 0 : _this$config$openid6.client_secret,
          refresh_token: cookie.credentials.refresh_token
        };
        const refreshTokenResponse = await (0, _helper.callTokenEndpoint)(this.openIdAuthConfig.tokenEndpoint, query, this.wreckClient); // if no id_token from refresh token call, maybe the Idp doesn't allow refresh id_token

        if (refreshTokenResponse.idToken) {
          cookie.credentials = {
            authHeaderValue: `Bearer ${refreshTokenResponse.idToken}`,
            refresh_token: refreshTokenResponse.refreshToken,
            expires_at: Date.now() + refreshTokenResponse.expiresIn * 1000 // expiresIn is in second

          };
          return true;
        } else {
          return false;
        }
      } catch (error) {
        this.logger.error(error);
        return false;
      }
    } else {
      // no refresh token, and current token is expired
      return false;
    }
  }

  handleUnauthedRequest(request, response, toolkit) {
    if (this.isPageRequest(request)) {
      // nextUrl is a key value pair
      const nextUrl = (0, _next_url.composeNextUrlQeuryParam)(request, this.coreSetup.http.basePath.serverBasePath);
      return response.redirected({
        headers: {
          location: `${this.coreSetup.http.basePath.serverBasePath}/auth/openid/login?${nextUrl}`
        }
      });
    } else {
      return response.unauthorized();
    }
  }

  buildAuthHeaderFromCookie(cookie) {
    var _cookie$credentials4;

    const header = {};
    const authHeaderValue = (_cookie$credentials4 = cookie.credentials) === null || _cookie$credentials4 === void 0 ? void 0 : _cookie$credentials4.authHeaderValue;

    if (authHeaderValue) {
      header.authorization = authHeaderValue;
    }

    return header;
  }

}

exports.OpenIdAuthentication = OpenIdAuthentication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wZW5pZF9hdXRoLnRzIl0sIm5hbWVzIjpbIk9wZW5JZEF1dGhlbnRpY2F0aW9uIiwiQXV0aGVudGljYXRpb25UeXBlIiwiY29uc3RydWN0b3IiLCJjb25maWciLCJzZXNzaW9uU3RvcmFnZUZhY3RvcnkiLCJyb3V0ZXIiLCJlc0NsaWVudCIsImNvcmUiLCJsb2dnZXIiLCJ3cmVja0NsaWVudCIsImNyZWF0ZVdyZWNrQ2xpZW50Iiwib3BlbklkQXV0aENvbmZpZyIsImF1dGhIZWFkZXJOYW1lIiwib3BlbmlkIiwiaGVhZGVyIiwib3BlbklkQ29ubmVjdFVybCIsImNvbm5lY3RfdXJsIiwic2NvcGUiLCJpbmRleE9mIiwiaW5pdCIsInJlc3BvbnNlIiwiZ2V0IiwicGF5bG9hZCIsIkpTT04iLCJwYXJzZSIsImF1dGhvcml6YXRpb25FbmRwb2ludCIsImF1dGhvcml6YXRpb25fZW5kcG9pbnQiLCJ0b2tlbkVuZHBvaW50IiwidG9rZW5fZW5kcG9pbnQiLCJlbmRTZXNzaW9uRW5kcG9pbnQiLCJlbmRfc2Vzc2lvbl9lbmRwb2ludCIsInVuZGVmaW5lZCIsInJvdXRlcyIsIk9wZW5JZEF1dGhSb3V0ZXMiLCJzZWN1cml0eUNsaWVudCIsImNvcmVTZXR1cCIsInNldHVwUm91dGVzIiwiZXJyb3IiLCJFcnJvciIsIndyZWNrSHR0cHNPcHRpb24iLCJyb290X2NhIiwiY2EiLCJmcyIsInJlYWRGaWxlU3luYyIsInZlcmlmeV9ob3N0bmFtZXMiLCJkZWJ1ZyIsImNoZWNrU2VydmVySWRlbnRpdHkiLCJob3N0IiwiY2VydCIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJ3cmVjayIsImRlZmF1bHRzIiwiYWdlbnRzIiwiaHR0cCIsIkhUVFAiLCJBZ2VudCIsImh0dHBzIiwiSFRUUFMiLCJodHRwc0FsbG93VW5hdXRob3JpemVkIiwicmVqZWN0VW5hdXRob3JpemVkIiwicmVxdWVzdEluY2x1ZGVzQXV0aEluZm8iLCJyZXF1ZXN0IiwiaGVhZGVycyIsImF1dGhvcml6YXRpb24iLCJnZXRBZGRpdGlvbmFsQXV0aEhlYWRlciIsImdldENvb2tpZSIsImF1dGhJbmZvIiwidXNlcm5hbWUiLCJ1c2VyX25hbWUiLCJjcmVkZW50aWFscyIsImF1dGhIZWFkZXJWYWx1ZSIsImF1dGhUeXBlIiwidHlwZSIsImV4cGlyeVRpbWUiLCJEYXRlIiwibm93Iiwic2Vzc2lvbiIsInR0bCIsImlzVmFsaWRDb29raWUiLCJjb29raWUiLCJleHBpcmVzX2F0IiwicmVmcmVzaF90b2tlbiIsInF1ZXJ5IiwiZ3JhbnRfdHlwZSIsImNsaWVudF9pZCIsImNsaWVudF9zZWNyZXQiLCJyZWZyZXNoVG9rZW5SZXNwb25zZSIsImlkVG9rZW4iLCJyZWZyZXNoVG9rZW4iLCJleHBpcmVzSW4iLCJoYW5kbGVVbmF1dGhlZFJlcXVlc3QiLCJ0b29sa2l0IiwiaXNQYWdlUmVxdWVzdCIsIm5leHRVcmwiLCJiYXNlUGF0aCIsInNlcnZlckJhc2VQYXRoIiwicmVkaXJlY3RlZCIsImxvY2F0aW9uIiwidW5hdXRob3JpemVkIiwiYnVpbGRBdXRoSGVhZGVyRnJvbUNvb2tpZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWVBOztBQUNBOztBQVlBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBZ0JPLE1BQU1BLG9CQUFOLFNBQW1DQyx1Q0FBbkMsQ0FBc0Q7QUFRM0RDLEVBQUFBLFdBQVcsQ0FDVEMsTUFEUyxFQUVUQyxxQkFGUyxFQUdUQyxNQUhTLEVBSVRDLFFBSlMsRUFLVEMsSUFMUyxFQU1UQyxNQU5TLEVBT1Q7QUFBQTs7QUFDQSxVQUFNTCxNQUFOLEVBQWNDLHFCQUFkLEVBQXFDQyxNQUFyQyxFQUE2Q0MsUUFBN0MsRUFBdURDLElBQXZELEVBQTZEQyxNQUE3RDs7QUFEQSxrQ0FkNkIsUUFjN0I7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBR0EsU0FBS0MsV0FBTCxHQUFtQixLQUFLQyxpQkFBTCxFQUFuQjtBQUVBLFNBQUtDLGdCQUFMLEdBQXdCLEVBQXhCO0FBQ0EsU0FB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TyxLQUFQO0FBQ0Q7QUFDRixLQTdCRCxNQTZCTztBQUNMO0FBQ0EsYUFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFFRHVELEVBQUFBLHFCQUFxQixDQUNuQjdCLE9BRG1CLEVBRW5CM0MsUUFGbUIsRUFHbkJ5RSxPQUhtQixFQUlGO0FBQ2pCLFFBQUksS0FBS0MsYUFBTCxDQUFtQi9CLE9BQW5CLENBQUosRUFBaUM7QUFDL0I7QUFDQSxZQUFNZ0MsT0FBTyxHQUFHLHdDQUNkaEMsT0FEYyxFQUVkLEtBQUs1QixTQUFMLENBQWVvQixJQUFmLENBQW9CeUMsUUFBcEIsQ0FBNkJDLGNBRmYsQ0FBaEI7QUFJQSxhQUFPN0UsUUFBUSxDQUFDOEUsVUFBVCxDQUFvQjtBQUN6QmxDLFFBQUFBLE9BQU8sRUFBRTtBQUNQbUMsVUFBQUEsUUFBUSxFQUFHLEdBQUUsS0FBS2hFLFNBQUwsQ0FBZW9CLElBQWYsQ0FBb0J5QyxRQUFwQixDQUE2QkMsY0FBZSxzQkFBcUJGLE9BQVE7QUFEL0U7QUFEZ0IsT0FBcEIsQ0FBUDtBQUtELEtBWEQsTUFXTztBQUNMLGFBQU8zRSxRQUFRLENBQUNnRixZQUFULEVBQVA7QUFDRDtBQUNGOztBQUVEQyxFQUFBQSx5QkFBeUIsQ0FBQ3BCLE1BQUQsRUFBcUM7QUFBQTs7QUFDNUQsVUFBTW5FLE1BQVcsR0FBRyxFQUFwQjtBQUNBLFVBQU0wRCxlQUFlLDJCQUFHUyxNQUFNLENBQUNWLFdBQVYseURBQUcscUJBQW9CQyxlQUE1Qzs7QUFDQSxRQUFJQSxlQUFKLEVBQXFCO0FBQ25CMUQsTUFBQUEsTUFBTSxDQUFDbUQsYUFBUCxHQUF1Qk8sZUFBdkI7QUFDRDs7QUFDRCxXQUFPMUQsTUFBUDtBQUNEOztBQXZMMEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHdyZWNrIGZyb20gJ0BoYXBpL3dyZWNrJztcbmltcG9ydCB7XG4gIExvZ2dlcixcbiAgU2Vzc2lvblN0b3JhZ2VGYWN0b3J5LFxuICBDb3JlU2V0dXAsXG4gIElSb3V0ZXIsXG4gIElMZWdhY3lDbHVzdGVyQ2xpZW50LFxuICBLaWJhbmFSZXF1ZXN0LFxuICBMaWZlY3ljbGVSZXNwb25zZUZhY3RvcnksXG4gIEF1dGhUb29sa2l0LFxuICBJS2liYW5hUmVzcG9uc2UsXG59IGZyb20gJ2tpYmFuYS9zZXJ2ZXInO1xuaW1wb3J0IEhUVFAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgSFRUUFMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgUGVlckNlcnRpZmljYXRlIH0gZnJvbSAndGxzJztcbmltcG9ydCB7IFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZSB9IGZyb20gJy4uLy4uLy4uJztcbmltcG9ydCB7IFNlY3VyaXR5U2Vzc2lvbkNvb2tpZSB9IGZyb20gJy4uLy4uLy4uL3Nlc3Npb24vc2VjdXJpdHlfY29va2llJztcbmltcG9ydCB7IE9wZW5JZEF1dGhSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgeyBBdXRoZW50aWNhdGlvblR5cGUgfSBmcm9tICcuLi9hdXRoZW50aWNhdGlvbl90eXBlJztcbmltcG9ydCB7IGNhbGxUb2tlbkVuZHBvaW50IH0gZnJvbSAnLi9oZWxwZXInO1xuaW1wb3J0IHsgY29tcG9zZU5leHRVcmxRZXVyeVBhcmFtIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbmV4dF91cmwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5JZEF1dGhDb25maWcge1xuICBhdXRob3JpemF0aW9uRW5kcG9pbnQ/OiBzdHJpbmc7XG4gIHRva2VuRW5kcG9pbnQ/OiBzdHJpbmc7XG4gIGVuZFNlc3Npb25FbmRwb2ludD86IHN0cmluZztcbiAgc2NvcGU/OiBzdHJpbmc7XG5cbiAgYXV0aEhlYWRlck5hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV3JlY2tIdHRwc09wdGlvbnMge1xuICBjYT86IHN0cmluZyB8IEJ1ZmZlciB8IEFycmF5PHN0cmluZyB8IEJ1ZmZlcj47XG4gIGNoZWNrU2VydmVySWRlbnRpdHk/OiAoaG9zdDogc3RyaW5nLCBjZXJ0OiBQZWVyQ2VydGlmaWNhdGUpID0+IEVycm9yIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY2xhc3MgT3BlbklkQXV0aGVudGljYXRpb24gZXh0ZW5kcyBBdXRoZW50aWNhdGlvblR5cGUge1xuICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogc3RyaW5nID0gJ29wZW5pZCc7XG5cbiAgcHJpdmF0ZSBvcGVuSWRBdXRoQ29uZmlnOiBPcGVuSWRBdXRoQ29uZmlnO1xuICBwcml2YXRlIGF1dGhIZWFkZXJOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgb3BlbklkQ29ubmVjdFVybDogc3RyaW5nO1xuICBwcml2YXRlIHdyZWNrQ2xpZW50OiB0eXBlb2Ygd3JlY2s7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY29uZmlnOiBTZWN1cml0eVBsdWdpbkNvbmZpZ1R5cGUsXG4gICAgc2Vzc2lvblN0b3JhZ2VGYWN0b3J5OiBTZXNzaW9uU3RvcmFnZUZhY3Rvcnk8U2VjdXJpdHlTZXNzaW9uQ29va2llPixcbiAgICByb3V0ZXI6IElSb3V0ZXIsXG4gICAgZXNDbGllbnQ6IElMZWdhY3lDbHVzdGVyQ2xpZW50LFxuICAgIGNvcmU6IENvcmVTZXR1cCxcbiAgICBsb2dnZXI6IExvZ2dlclxuICApIHtcbiAgICBzdXBlcihjb25maWcsIHNlc3Npb25TdG9yYWdlRmFjdG9yeSwgcm91dGVyLCBlc0NsaWVudCwgY29yZSwgbG9nZ2VyKTtcblxuICAgIHRoaXMud3JlY2tDbGllbnQgPSB0aGlzLmNyZWF0ZVdyZWNrQ2xpZW50KCk7XG5cbiAgICB0aGlzLm9wZW5JZEF1dGhDb25maWcgPSB7fTtcbiAgICB0aGlzLmF1dGhIZWFkZXJOYW1lID0gdGhpcy5jb25maWcub3BlbmlkPy5oZWFkZXIgfHwgJyc7XG4gICAgdGhpcy5vcGVuSWRBdXRoQ29uZmlnLmF1dGhIZWFkZXJOYW1lID0gdGhpcy5hdXRoSGVhZGVyTmFtZTtcblxuICAgIHRoaXMub3BlbklkQ29ubmVjdFVybCA9IHRoaXMuY29uZmlnLm9wZW5pZD8uY29ubmVjdF91cmwgfHwgJyc7XG4gICAgbGV0IHNjb3BlID0gdGhpcy5jb25maWcub3BlbmlkIS5zY29wZTtcbiAgICBpZiAoc2NvcGUuaW5kZXhPZignb3BlbmlkJykgPCAwKSB7XG4gICAgICBzY29wZSA9IGBvcGVuaWQgJHtzY29wZX1gO1xuICAgIH1cbiAgICB0aGlzLm9wZW5JZEF1dGhDb25maWcuc2NvcGUgPSBzY29wZTtcblxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0KCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMud3JlY2tDbGllbnQuZ2V0KHRoaXMub3BlbklkQ29ubmVjdFVybCk7XG4gICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5wYXJzZShyZXNwb25zZS5wYXlsb2FkIGFzIHN0cmluZyk7XG5cbiAgICAgIHRoaXMub3BlbklkQXV0aENvbmZpZy5hdXRob3JpemF0aW9uRW5kcG9pbnQgPSBwYXlsb2FkLmF1dGhvcml6YXRpb25fZW5kcG9pbnQ7XG4gICAgICB0aGlzLm9wZW5JZEF1dGhDb25maWcudG9rZW5FbmRwb2ludCA9IHBheWxvYWQudG9rZW5fZW5kcG9pbnQ7XG4gICAgICB0aGlzLm9wZW5JZEF1dGhDb25maWcuZW5kU2Vzc2lvbkVuZHBvaW50ID0gcGF5bG9hZC5lbmRfc2Vzc2lvbl9lbmRwb2ludCB8fCB1bmRlZmluZWQ7XG5cbiAgICAgIGNvbnN0IHJvdXRlcyA9IG5ldyBPcGVuSWRBdXRoUm91dGVzKFxuICAgICAgICB0aGlzLnJvdXRlcixcbiAgICAgICAgdGhpcy5jb25maWcsXG4gICAgICAgIHRoaXMuc2Vzc2lvblN0b3JhZ2VGYWN0b3J5LFxuICAgICAgICB0aGlzLm9wZW5JZEF1dGhDb25maWcsXG4gICAgICAgIHRoaXMuc2VjdXJpdHlDbGllbnQsXG4gICAgICAgIHRoaXMuY29yZVNldHVwLFxuICAgICAgICB0aGlzLndyZWNrQ2xpZW50XG4gICAgICApO1xuICAgICAgcm91dGVzLnNldHVwUm91dGVzKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yKTsgLy8gVE9ETzogbG9nIG1vcmUgaW5mb1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgd2hlbiB0cnlpbmcgdG8gb2J0YWluIHRoZSBlbmRwb2ludHMgZnJvbSB5b3VyIElkUCcpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlV3JlY2tDbGllbnQoKTogdHlwZW9mIHdyZWNrIHtcbiAgICBjb25zdCB3cmVja0h0dHBzT3B0aW9uOiBXcmVja0h0dHBzT3B0aW9ucyA9IHt9O1xuICAgIGlmICh0aGlzLmNvbmZpZy5vcGVuaWQ/LnJvb3RfY2EpIHtcbiAgICAgIHdyZWNrSHR0cHNPcHRpb24uY2EgPSBbZnMucmVhZEZpbGVTeW5jKHRoaXMuY29uZmlnLm9wZW5pZC5yb290X2NhKV07XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbmZpZy5vcGVuaWQ/LnZlcmlmeV9ob3N0bmFtZXMgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1Zyhgb3BlbklkIGF1dGggJ3ZlcmlmeV9ob3N0bmFtZXMnIG9wdGlvbiBpcyBvZmYuYCk7XG4gICAgICB3cmVja0h0dHBzT3B0aW9uLmNoZWNrU2VydmVySWRlbnRpdHkgPSAoaG9zdDogc3RyaW5nLCBjZXJ0OiBQZWVyQ2VydGlmaWNhdGUpID0+IHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyh3cmVja0h0dHBzT3B0aW9uKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gd3JlY2suZGVmYXVsdHMoe1xuICAgICAgICBhZ2VudHM6IHtcbiAgICAgICAgICBodHRwOiBuZXcgSFRUUC5BZ2VudCgpLFxuICAgICAgICAgIGh0dHBzOiBuZXcgSFRUUFMuQWdlbnQod3JlY2tIdHRwc09wdGlvbiksXG4gICAgICAgICAgaHR0cHNBbGxvd1VuYXV0aG9yaXplZDogbmV3IEhUVFBTLkFnZW50KHtcbiAgICAgICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHdyZWNrO1xuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RJbmNsdWRlc0F1dGhJbmZvKHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmVxdWVzdC5oZWFkZXJzLmF1dGhvcml6YXRpb24gPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICBnZXRBZGRpdGlvbmFsQXV0aEhlYWRlcihyZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0KTogYW55IHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBnZXRDb29raWUocmVxdWVzdDogS2liYW5hUmVxdWVzdCwgYXV0aEluZm86IGFueSk6IFNlY3VyaXR5U2Vzc2lvbkNvb2tpZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJuYW1lOiBhdXRoSW5mby51c2VyX25hbWUsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBhdXRoSGVhZGVyVmFsdWU6IHJlcXVlc3QuaGVhZGVycy5hdXRob3JpemF0aW9uLFxuICAgICAgfSxcbiAgICAgIGF1dGhUeXBlOiB0aGlzLnR5cGUsXG4gICAgICBleHBpcnlUaW1lOiBEYXRlLm5vdygpICsgdGhpcy5jb25maWcuc2Vzc2lvbi50dGwsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE86IEFkZCB0b2tlbiBleHBpcmF0aW9uIGNoZWNrIGhlcmVcbiAgYXN5bmMgaXNWYWxpZENvb2tpZShjb29raWU6IFNlY3VyaXR5U2Vzc2lvbkNvb2tpZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChcbiAgICAgIGNvb2tpZS5hdXRoVHlwZSAhPT0gdGhpcy50eXBlIHx8XG4gICAgICAhY29va2llLnVzZXJuYW1lIHx8XG4gICAgICAhY29va2llLmV4cGlyeVRpbWUgfHxcbiAgICAgICFjb29raWUuY3JlZGVudGlhbHM/LmF1dGhIZWFkZXJWYWx1ZSB8fFxuICAgICAgIWNvb2tpZS5jcmVkZW50aWFscz8uZXhwaXJlc19hdFxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoY29va2llLmNyZWRlbnRpYWxzPy5leHBpcmVzX2F0ID4gRGF0ZS5ub3coKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gbmVlZCB0byByZW5ldyBpZCB0b2tlblxuICAgIGlmIChjb29raWUuY3JlZGVudGlhbHMucmVmcmVzaF90b2tlbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcXVlcnk6IGFueSA9IHtcbiAgICAgICAgICBncmFudF90eXBlOiAncmVmcmVzaF90b2tlbicsXG4gICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNvbmZpZy5vcGVuaWQ/LmNsaWVudF9pZCxcbiAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNvbmZpZy5vcGVuaWQ/LmNsaWVudF9zZWNyZXQsXG4gICAgICAgICAgcmVmcmVzaF90b2tlbjogY29va2llLmNyZWRlbnRpYWxzLnJlZnJlc2hfdG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2tlblJlc3BvbnNlID0gYXdhaXQgY2FsbFRva2VuRW5kcG9pbnQoXG4gICAgICAgICAgdGhpcy5vcGVuSWRBdXRoQ29uZmlnLnRva2VuRW5kcG9pbnQhLFxuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIHRoaXMud3JlY2tDbGllbnRcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBpZiBubyBpZF90b2tlbiBmcm9tIHJlZnJlc2ggdG9rZW4gY2FsbCwgbWF5YmUgdGhlIElkcCBkb2Vzbid0IGFsbG93IHJlZnJlc2ggaWRfdG9rZW5cbiAgICAgICAgaWYgKHJlZnJlc2hUb2tlblJlc3BvbnNlLmlkVG9rZW4pIHtcbiAgICAgICAgICBjb29raWUuY3JlZGVudGlhbHMgPSB7XG4gICAgICAgICAgICBhdXRoSGVhZGVyVmFsdWU6IGBCZWFyZXIgJHtyZWZyZXNoVG9rZW5SZXNwb25zZS5pZFRva2VufWAsXG4gICAgICAgICAgICByZWZyZXNoX3Rva2VuOiByZWZyZXNoVG9rZW5SZXNwb25zZS5yZWZyZXNoVG9rZW4sXG4gICAgICAgICAgICBleHBpcmVzX2F0OiBEYXRlLm5vdygpICsgcmVmcmVzaFRva2VuUmVzcG9uc2UuZXhwaXJlc0luISAqIDEwMDAsIC8vIGV4cGlyZXNJbiBpcyBpbiBzZWNvbmRcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vIHJlZnJlc2ggdG9rZW4sIGFuZCBjdXJyZW50IHRva2VuIGlzIGV4cGlyZWRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVVbmF1dGhlZFJlcXVlc3QoXG4gICAgcmVxdWVzdDogS2liYW5hUmVxdWVzdCxcbiAgICByZXNwb25zZTogTGlmZWN5Y2xlUmVzcG9uc2VGYWN0b3J5LFxuICAgIHRvb2xraXQ6IEF1dGhUb29sa2l0XG4gICk6IElLaWJhbmFSZXNwb25zZSB7XG4gICAgaWYgKHRoaXMuaXNQYWdlUmVxdWVzdChyZXF1ZXN0KSkge1xuICAgICAgLy8gbmV4dFVybCBpcyBhIGtleSB2YWx1ZSBwYWlyXG4gICAgICBjb25zdCBuZXh0VXJsID0gY29tcG9zZU5leHRVcmxRZXVyeVBhcmFtKFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICB0aGlzLmNvcmVTZXR1cC5odHRwLmJhc2VQYXRoLnNlcnZlckJhc2VQYXRoXG4gICAgICApO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlZGlyZWN0ZWQoe1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgbG9jYXRpb246IGAke3RoaXMuY29yZVNldHVwLmh0dHAuYmFzZVBhdGguc2VydmVyQmFzZVBhdGh9L2F1dGgvb3BlbmlkL2xvZ2luPyR7bmV4dFVybH1gLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNwb25zZS51bmF1dGhvcml6ZWQoKTtcbiAgICB9XG4gIH1cblxuICBidWlsZEF1dGhIZWFkZXJGcm9tQ29va2llKGNvb2tpZTogU2VjdXJpdHlTZXNzaW9uQ29va2llKTogYW55IHtcbiAgICBjb25zdCBoZWFkZXI6IGFueSA9IHt9O1xuICAgIGNvbnN0IGF1dGhIZWFkZXJWYWx1ZSA9IGNvb2tpZS5jcmVkZW50aWFscz8uYXV0aEhlYWRlclZhbHVlO1xuICAgIGlmIChhdXRoSGVhZGVyVmFsdWUpIHtcbiAgICAgIGhlYWRlci5hdXRob3JpemF0aW9uID0gYXV0aEhlYWRlclZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gaGVhZGVyO1xuICB9XG59XG4iXX0=