"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhPlugin = void 0;

var _securityFactory = require("./lib/security-factory");

var _routes = require("./routes");

var _start = require("./start");

var _cookie = require("./lib/cookie");

var ApiInterceptor = _interopRequireWildcard(require("./lib/api-interceptor"));

var _operators = require("rxjs/operators");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class WazuhPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;

    _defineProperty(this, "logger", void 0);

    this.logger = initializerContext.logger.get();
  }

  async setup(core, plugins) {
    this.logger.debug('Wazuh-wui: Setup');
    const wazuhSecurity = (0, _securityFactory.SecurityObj)(plugins);
    const serverInfo = core.http.getServerInfo();
    core.http.registerRouteHandlerContext('wazuh', (context, request) => {
      return {
        logger: this.logger,
        server: {
          info: serverInfo
        },
        plugins,
        security: wazuhSecurity,
        api: {
          client: {
            asInternalUser: {
              authenticate: async (apiHostID, headers) => await ApiInterceptor.authenticate(apiHostID, headers),
              request: async (method, path, data, options) => await ApiInterceptor.requestAsInternalUser(method, path, data, options)
            },
            asCurrentUser: {
              authenticate: async (apiHostID, headers) => await ApiInterceptor.authenticate(apiHostID, headers, (await wazuhSecurity.getCurrentUser(request, context)).authContext),
              request: async (method, path, data, options) => await ApiInterceptor.requestAsCurrentUser(method, path, data, { ...options,
                token: (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-token')
              })
            }
          }
        }
      };
    }); // Add custom headers to the responses

    core.http.registerOnPreResponse((request, response, toolkit) => {
      const additionalHeaders = {
        'x-frame-options': 'sameorigin'
      };
      return toolkit.next({
        headers: additionalHeaders
      });
    }); // Routes

    const router = core.http.createRouter();
    (0, _routes.setupRoutes)(router);
    return {};
  }

  async start(core) {
    const globalConfiguration = await this.initializerContext.config.legacy.globalConfig$.pipe((0, _operators.first)()).toPromise();
    const wazuhApiClient = {
      client: {
        asInternalUser: {
          authenticate: async apiHostID => await ApiInterceptor.authenticate(apiHostID),
          request: async (method, path, data, options) => await ApiInterceptor.requestAsInternalUser(method, path, data, options)
        }
      }
    };
    const contextServer = {
      config: globalConfiguration
    }; // Initialize

    (0, _start.jobInitializeRun)({
      core,
      wazuh: {
        logger: this.logger.get('initialize'),
        api: wazuhApiClient
      },
      server: contextServer
    }); // Monitoring

    (0, _start.jobMonitoringRun)({
      core,
      wazuh: {
        logger: this.logger.get('monitoring'),
        api: wazuhApiClient
      },
      server: contextServer
    }); // Scheduler

    (0, _start.jobSchedulerRun)({
      core,
      wazuh: {
        logger: this.logger.get('cron-scheduler'),
        api: wazuhApiClient
      },
      server: contextServer
    }); // Queue

    (0, _start.jobQueueRun)({
      core,
      wazuh: {
        logger: this.logger.get('queue'),
        api: wazuhApiClient
      },
      server: contextServer
    });
    return {};
  }

  stop() {}

}

exports.WazuhPlugin = WazuhPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbi50cyJdLCJuYW1lcyI6WyJXYXp1aFBsdWdpbiIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbGl6ZXJDb250ZXh0IiwibG9nZ2VyIiwiZ2V0Iiwic2V0dXAiLCJjb3JlIiwicGx1Z2lucyIsImRlYnVnIiwid2F6dWhTZWN1cml0eSIsInNlcnZlckluZm8iLCJodHRwIiwiZ2V0U2VydmVySW5mbyIsInJlZ2lzdGVyUm91dGVIYW5kbGVyQ29udGV4dCIsImNvbnRleHQiLCJyZXF1ZXN0Iiwic2VydmVyIiwiaW5mbyIsInNlY3VyaXR5IiwiYXBpIiwiY2xpZW50IiwiYXNJbnRlcm5hbFVzZXIiLCJhdXRoZW50aWNhdGUiLCJhcGlIb3N0SUQiLCJBcGlJbnRlcmNlcHRvciIsIm1ldGhvZCIsInBhdGgiLCJkYXRhIiwib3B0aW9ucyIsInJlcXVlc3RBc0ludGVybmFsVXNlciIsImFzQ3VycmVudFVzZXIiLCJnZXRDdXJyZW50VXNlciIsImF1dGhDb250ZXh0IiwicmVxdWVzdEFzQ3VycmVudFVzZXIiLCJ0b2tlbiIsImhlYWRlcnMiLCJjb29raWUiLCJyZWdpc3Rlck9uUHJlUmVzcG9uc2UiLCJyZXNwb25zZSIsInRvb2xraXQiLCJhZGRpdGlvbmFsSGVhZGVycyIsIm5leHQiLCJyb3V0ZXIiLCJjcmVhdGVSb3V0ZXIiLCJzdGFydCIsImdsb2JhbENvbmZpZ3VyYXRpb24iLCJjb25maWciLCJsZWdhY3kiLCJnbG9iYWxDb25maWckIiwicGlwZSIsInRvUHJvbWlzZSIsIndhenVoQXBpQ2xpZW50IiwiY29udGV4dFNlcnZlciIsIndhenVoIiwic3RvcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQTZCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7QUF3Qk8sTUFBTUEsV0FBTixDQUF3RTtBQUc3RUMsRUFBQUEsV0FBVyxDQUFrQkMsa0JBQWxCLEVBQWdFO0FBQUEsU0FBOUNBLGtCQUE4QyxHQUE5Q0Esa0JBQThDOztBQUFBOztBQUN6RSxT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TUFBQUEsTUFBTSxFQUFFb0M7QUFOTSxLQUFoQixFQXBDa0MsQ0E2Q2xDOztBQUNBLDRCQUFZO0FBQ1Y5QyxNQUFBQSxJQURVO0FBRVYrQyxNQUFBQSxLQUFLLEVBQUU7QUFDTGxELFFBQUFBLE1BQU0sRUFBRSxLQUFLQSxNQUFMLENBQVlDLEdBQVosQ0FBZ0IsT0FBaEIsQ0FESDtBQUVMZSxRQUFBQSxHQUFHLEVBQUVnQztBQUZBLE9BRkc7QUFNVm5DLE1BQUFBLE1BQU0sRUFBRW9DO0FBTkUsS0FBWjtBQVFBLFdBQU8sRUFBUDtBQUNEOztBQUVNRSxFQUFBQSxJQUFQLEdBQWMsQ0FBRzs7QUE1RzREIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIExpY2Vuc2VkIHRvIEVsYXN0aWNzZWFyY2ggQi5WLiB1bmRlciBvbmUgb3IgbW9yZSBjb250cmlidXRvclxuICogbGljZW5zZSBhZ3JlZW1lbnRzLiBTZWUgdGhlIE5PVElDRSBmaWxlIGRpc3RyaWJ1dGVkIHdpdGhcbiAqIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgY29weXJpZ2h0XG4gKiBvd25lcnNoaXAuIEVsYXN0aWNzZWFyY2ggQi5WLiBsaWNlbnNlcyB0aGlzIGZpbGUgdG8geW91IHVuZGVyXG4gKiB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5XG4gKiBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLFxuICogc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW5cbiAqIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXG4gKiBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGVcbiAqIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnNcbiAqIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIENvcmVTZXR1cCxcbiAgQ29yZVN0YXJ0LFxuICBMb2dnZXIsXG4gIFBsdWdpbixcbiAgUGx1Z2luSW5pdGlhbGl6ZXJDb250ZXh0LFxuICBTaGFyZWRHbG9iYWxDb25maWdcbn0gZnJvbSAna2liYW5hL3NlcnZlcic7XG5cbmltcG9ydCB7IFdhenVoUGx1Z2luU2V0dXAsIFdhenVoUGx1Z2luU3RhcnQsIFBsdWdpblNldHVwIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBTZWN1cml0eU9iaiwgSVNlY3VyaXR5RmFjdG9yeSB9IGZyb20gJy4vbGliL3NlY3VyaXR5LWZhY3RvcnknO1xuaW1wb3J0IHsgc2V0dXBSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgeyBqb2JJbml0aWFsaXplUnVuLCBqb2JNb25pdG9yaW5nUnVuLCBqb2JTY2hlZHVsZXJSdW4sIGpvYlF1ZXVlUnVuIH0gZnJvbSAnLi9zdGFydCc7XG5pbXBvcnQgeyBnZXRDb29raWVWYWx1ZUJ5TmFtZSB9IGZyb20gJy4vbGliL2Nvb2tpZSc7XG5pbXBvcnQgKiBhcyBBcGlJbnRlcmNlcHRvciAgZnJvbSAnLi9saWIvYXBpLWludGVyY2VwdG9yJztcbmltcG9ydCB7IHNjaGVtYSwgVHlwZU9mIH0gZnJvbSAnQGtibi9jb25maWctc2NoZW1hJztcbmltcG9ydCB0eXBlIHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlyc3QgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmRlY2xhcmUgbW9kdWxlICdraWJhbmEvc2VydmVyJyB7XG4gIGludGVyZmFjZSBSZXF1ZXN0SGFuZGxlckNvbnRleHQge1xuICAgIHdhenVoOiB7XG4gICAgICBsb2dnZXI6IExvZ2dlcixcbiAgICAgIHBsdWdpbnM6IFBsdWdpblNldHVwLFxuICAgICAgc2VjdXJpdHk6IElTZWN1cml0eUZhY3RvcnlcbiAgICAgIGFwaToge1xuICAgICAgICBjbGllbnQ6IHtcbiAgICAgICAgICBhc0ludGVybmFsVXNlcjoge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiAoYXBpSG9zdElEOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPlxuICAgICAgICAgICAgcmVxdWVzdDogKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSwgb3B0aW9uczoge2FwaUhvc3RJRDogc3RyaW5nLCBmb3JjZVJlZnJlc2g/OmJvb2xlYW59KSA9PiBQcm9taXNlPGFueT5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzQ3VycmVudFVzZXI6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogKGFwaUhvc3RJRDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz5cbiAgICAgICAgICAgIHJlcXVlc3Q6IChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBkYXRhOiBhbnksIG9wdGlvbnM6IHthcGlIb3N0SUQ6IHN0cmluZywgZm9yY2VSZWZyZXNoPzpib29sZWFufSkgPT4gUHJvbWlzZTxhbnk+XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2F6dWhQbHVnaW4gaW1wbGVtZW50cyBQbHVnaW48V2F6dWhQbHVnaW5TZXR1cCwgV2F6dWhQbHVnaW5TdGFydD4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogTG9nZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgaW5pdGlhbGl6ZXJDb250ZXh0OiBQbHVnaW5Jbml0aWFsaXplckNvbnRleHQpIHtcbiAgICB0aGlzLmxvZ2dlciA9IGluaXRpYWxpemVyQ29udGV4dC5sb2dnZXIuZ2V0KCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2V0dXAoY29yZTogQ29yZVNldHVwLCBwbHVnaW5zOiBQbHVnaW5TZXR1cCkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdXYXp1aC13dWk6IFNldHVwJyk7XG5cbiAgICBjb25zdCB3YXp1aFNlY3VyaXR5ID0gU2VjdXJpdHlPYmoocGx1Z2lucyk7XG4gICAgY29uc3Qgc2VydmVySW5mbyA9IGNvcmUuaHR0cC5nZXRTZXJ2ZXJJbmZvKCk7XG5cbiAgICBjb3JlLmh0dHAucmVnaXN0ZXJSb3V0ZUhhbmRsZXJDb250ZXh0KCd3YXp1aCcsIChjb250ZXh0LCByZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLFxuICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICBpbmZvOiBzZXJ2ZXJJbmZvLCBcbiAgICAgICAgfSxcbiAgICAgICAgcGx1Z2lucyxcbiAgICAgICAgc2VjdXJpdHk6IHdhenVoU2VjdXJpdHksXG4gICAgICAgIGFwaToge1xuICAgICAgICAgIGNsaWVudDoge1xuICAgICAgICAgICAgYXNJbnRlcm5hbFVzZXI6IHtcbiAgICAgICAgICAgICAgYXV0aGVudGljYXRlOiBhc3luYyAoYXBpSG9zdElEKSA9PiBhd2FpdCBBcGlJbnRlcmNlcHRvci5hdXRoZW50aWNhdGUoYXBpSG9zdElEKSxcbiAgICAgICAgICAgICAgcmVxdWVzdDogYXN5bmMgKG1ldGhvZCwgcGF0aCwgZGF0YSwgb3B0aW9ucykgPT4gYXdhaXQgQXBpSW50ZXJjZXB0b3IucmVxdWVzdEFzSW50ZXJuYWxVc2VyKG1ldGhvZCwgcGF0aCwgZGF0YSwgb3B0aW9ucyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXNDdXJyZW50VXNlcjoge1xuICAgICAgICAgICAgICBhdXRoZW50aWNhdGU6IGFzeW5jIChhcGlIb3N0SUQpID0+IGF3YWl0IEFwaUludGVyY2VwdG9yLmF1dGhlbnRpY2F0ZShhcGlIb3N0SUQsIChhd2FpdCB3YXp1aFNlY3VyaXR5LmdldEN1cnJlbnRVc2VyKHJlcXVlc3QsIGNvbnRleHQpKS5hdXRoQ29udGV4dCksXG4gICAgICAgICAgICAgIHJlcXVlc3Q6IGFzeW5jIChtZXRob2QsIHBhdGgsIGRhdGEsIG9wdGlvbnMpID0+IGF3YWl0IEFwaUludGVyY2VwdG9yLnJlcXVlc3RBc0N1cnJlbnRVc2VyKG1ldGhvZCwgcGF0aCwgZGF0YSwgey4uLm9wdGlvbnMsIHRva2VuOiBnZXRDb29raWVWYWx1ZUJ5TmFtZShyZXF1ZXN0LmhlYWRlcnMuY29va2llLCAnd3otdG9rZW4nKX0pLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBjdXN0b20gaGVhZGVycyB0byB0aGUgcmVzcG9uc2VzXG4gICAgY29yZS5odHRwLnJlZ2lzdGVyT25QcmVSZXNwb25zZSgocmVxdWVzdCwgcmVzcG9uc2UsIHRvb2xraXQpID0+IHtcbiAgICAgIGNvbnN0IGFkZGl0aW9uYWxIZWFkZXJzID0ge1xuICAgICAgICAneC1mcmFtZS1vcHRpb25zJzogJ3NhbWVvcmlnaW4nLFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0b29sa2l0Lm5leHQoeyBoZWFkZXJzOiBhZGRpdGlvbmFsSGVhZGVycyB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJvdXRlc1xuICAgIGNvbnN0IHJvdXRlciA9IGNvcmUuaHR0cC5jcmVhdGVSb3V0ZXIoKTtcbiAgICBzZXR1cFJvdXRlcyhyb3V0ZXIpO1xuXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0YXJ0KGNvcmU6IENvcmVTdGFydCkge1xuICAgIGNvbnN0IGdsb2JhbENvbmZpZ3VyYXRpb246IFNoYXJlZEdsb2JhbENvbmZpZyA9IGF3YWl0IHRoaXMuaW5pdGlhbGl6ZXJDb250ZXh0LmNvbmZpZy5sZWdhY3kuZ2xvYmFsQ29uZmlnJC5waXBlKGZpcnN0KCkpLnRvUHJvbWlzZSgpO1xuICAgIGNvbnN0IHdhenVoQXBpQ2xpZW50ID0ge1xuICAgICAgY2xpZW50OiB7XG4gICAgICAgIGFzSW50ZXJuYWxVc2VyOiB7XG4gICAgICAgICAgYXV0aGVudGljYXRlOiBhc3luYyAoYXBpSG9zdElEKSA9PiBhd2FpdCBBcGlJbnRlcmNlcHRvci5hdXRoZW50aWNhdGUoYXBpSG9zdElEKSxcbiAgICAgICAgICByZXF1ZXN0OiBhc3luYyAobWV0aG9kLCBwYXRoLCBkYXRhLCBvcHRpb25zKSA9PiBhd2FpdCBBcGlJbnRlcmNlcHRvci5yZXF1ZXN0QXNJbnRlcm5hbFVzZXIobWV0aG9kLCBwYXRoLCBkYXRhLCBvcHRpb25zKSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjb250ZXh0U2VydmVyID0ge1xuICAgICAgY29uZmlnOiBnbG9iYWxDb25maWd1cmF0aW9uXG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemVcbiAgICBqb2JJbml0aWFsaXplUnVuKHtcbiAgICAgIGNvcmUsIFxuICAgICAgd2F6dWg6IHtcbiAgICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlci5nZXQoJ2luaXRpYWxpemUnKSxcbiAgICAgICAgYXBpOiB3YXp1aEFwaUNsaWVudFxuICAgICAgfSxcbiAgICAgIHNlcnZlcjogY29udGV4dFNlcnZlclxuICAgIH0pO1xuXG4gICAgLy8gTW9uaXRvcmluZ1xuICAgIGpvYk1vbml0b3JpbmdSdW4oe1xuICAgICAgY29yZSxcbiAgICAgIHdhenVoOiB7XG4gICAgICAgIGxvZ2dlcjogdGhpcy5sb2dnZXIuZ2V0KCdtb25pdG9yaW5nJyksXG4gICAgICAgIGFwaTogd2F6dWhBcGlDbGllbnRcbiAgICAgIH0sXG4gICAgICBzZXJ2ZXI6IGNvbnRleHRTZXJ2ZXJcbiAgICB9KTtcblxuICAgIC8vIFNjaGVkdWxlclxuICAgIGpvYlNjaGVkdWxlclJ1bih7XG4gICAgICBjb3JlLFxuICAgICAgd2F6dWg6IHtcbiAgICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlci5nZXQoJ2Nyb24tc2NoZWR1bGVyJyksXG4gICAgICAgIGFwaTogd2F6dWhBcGlDbGllbnRcbiAgICAgIH0sXG4gICAgICBzZXJ2ZXI6IGNvbnRleHRTZXJ2ZXJcbiAgICB9KTtcblxuICAgIC8vIFF1ZXVlXG4gICAgam9iUXVldWVSdW4oe1xuICAgICAgY29yZSwgXG4gICAgICB3YXp1aDoge1xuICAgICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLmdldCgncXVldWUnKSxcbiAgICAgICAgYXBpOiB3YXp1aEFwaUNsaWVudFxuICAgICAgfSxcbiAgICAgIHNlcnZlcjogY29udGV4dFNlcnZlclxuICAgIH0pO1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIHB1YmxpYyBzdG9wKCkgeyB9XG59XG4iXX0=