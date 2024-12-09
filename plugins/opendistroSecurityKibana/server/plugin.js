"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpendistroSecurityPlugin = void 0;

var _operators = require("rxjs/operators");

var _routes = require("./routes");

var _opendistro_security_configuration_plugin = _interopRequireDefault(require("./backend/opendistro_security_configuration_plugin"));

var _opendistro_security_plugin = _interopRequireDefault(require("./backend/opendistro_security_plugin"));

var _security_cookie = require("./session/security_cookie");

var _opendistro_security_client = require("./backend/opendistro_security_client");

var _tenant_index = require("./multitenancy/tenant_index");

var _auth_handler_factory = require("./auth/auth_handler_factory");

var _routes2 = require("./multitenancy/routes");

var _auth_type_routes = require("./routes/auth_type_routes");

var _core = require("../../../src/core/server/saved_objects/migrations/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class OpendistroSecurityPlugin {
  // FIXME: keep an reference of admin client so that it can be used in start(), better to figureout a
  //        decent way to get adminClient in start. (maybe using getStartServices() from setup?)
  // @ts-ignore: property not initialzied in constructor
  constructor(initializerContext) {
    this.initializerContext = initializerContext;

    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "securityClient", void 0);

    this.logger = initializerContext.logger.get();
  }

  async setup(core) {
    var _config$multitenancy;

    this.logger.debug('opendistro_security: Setup');
    const config$ = this.initializerContext.config.create();
    const config = await config$.pipe((0, _operators.first)()).toPromise();
    const router = core.http.createRouter();
    const esClient = core.elasticsearch.legacy.createClient('opendistro_security', {
      plugins: [_opendistro_security_configuration_plugin.default, _opendistro_security_plugin.default]
    });
    this.securityClient = new _opendistro_security_client.SecurityClient(esClient);
    const securitySessionStorageFactory = await core.http.createCookieSessionStorageFactory((0, _security_cookie.getSecurityCookieOptions)(config)); // put logger into route handler context, so that we don't need to pass througth parameters

    core.http.registerRouteHandlerContext('security_plugin', (context, request) => {
      return {
        logger: this.logger,
        esClient
      };
    }); // setup auth

    const auth = (0, _auth_handler_factory.getAuthenticationHandler)(config.auth.type, router, config, core, esClient, securitySessionStorageFactory, this.logger);
    core.http.registerAuth(auth.authHandler); // Register server side APIs

    (0, _routes.defineRoutes)(router);
    (0, _auth_type_routes.defineAuthTypeRoutes)(router, config); // set up multi-tenent routes

    if ((_config$multitenancy = config.multitenancy) === null || _config$multitenancy === void 0 ? void 0 : _config$multitenancy.enabled) {
      (0, _routes2.setupMultitenantRoutes)(router, securitySessionStorageFactory, this.securityClient);
    }

    return {
      config$,
      securityConfigClient: esClient
    };
  } // TODO: add more logs


  async start(core) {
    var _config$multitenancy2;

    this.logger.debug('opendistro_security: Started');
    const config$ = this.initializerContext.config.create();
    const config = await config$.pipe((0, _operators.first)()).toPromise();

    if ((_config$multitenancy2 = config.multitenancy) === null || _config$multitenancy2 === void 0 ? void 0 : _config$multitenancy2.enabled) {
      const globalConfig$ = this.initializerContext.config.legacy.globalConfig$;
      const globalConfig = await globalConfig$.pipe((0, _operators.first)()).toPromise();
      const kibanaIndex = globalConfig.kibana.index;
      const typeRegistry = core.savedObjects.getTypeRegistry();
      const esClient = core.elasticsearch.client.asInternalUser;
      const migrationClient = (0, _core.createMigrationEsClient)(esClient, this.logger);
      (0, _tenant_index.setupIndexTemplate)(esClient, kibanaIndex, typeRegistry, this.logger);
      const serializer = core.savedObjects.createSerializer();
      const kibanaVersion = this.initializerContext.env.packageInfo.version;
      (0, _tenant_index.migrateTenantIndices)(kibanaVersion, migrationClient, this.securityClient, typeRegistry, serializer, this.logger);
    }

    return {
      es: core.elasticsearch.legacy
    };
  }

  stop() {}

}

exports.OpendistroSecurityPlugin = OpendistroSecurityPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbi50cyJdLCJuYW1lcyI6WyJPcGVuZGlzdHJvU2VjdXJpdHlQbHVnaW4iLCJjb25zdHJ1Y3RvciIsImluaXRpYWxpemVyQ29udGV4dCIsImxvZ2dlciIsImdldCIsInNldHVwIiwiY29yZSIsImRlYnVnIiwiY29uZmlnJCIsImNvbmZpZyIsImNyZWF0ZSIsInBpcGUiLCJ0b1Byb21pc2UiLCJyb3V0ZXIiLCJodHRwIiwiY3JlYXRlUm91dGVyIiwiZXNDbGllbnQiLCJlbGFzdGljc2VhcmNoIiwibGVnYWN5IiwiY3JlYXRlQ2xpZW50IiwicGx1Z2lucyIsIm9wZW5kaXN0cm9TZWN1cml0eUNvbmZpZ3VyYXRvaW5QbHVnaW4iLCJvcGVuZGlzdHJvU2VjdXJpdHlQbHVnaW4iLCJzZWN1cml0eUNsaWVudCIsIlNlY3VyaXR5Q2xpZW50Iiwic2VjdXJpdHlTZXNzaW9uU3RvcmFnZUZhY3RvcnkiLCJjcmVhdGVDb29raWVTZXNzaW9uU3RvcmFnZUZhY3RvcnkiLCJyZWdpc3RlclJvdXRlSGFuZGxlckNvbnRleHQiLCJjb250ZXh0IiwicmVxdWVzdCIsImF1dGgiLCJ0eXBlIiwicmVnaXN0ZXJBdXRoIiwiYXV0aEhhbmRsZXIiLCJtdWx0aXRlbmFuY3kiLCJlbmFibGVkIiwic2VjdXJpdHlDb25maWdDbGllbnQiLCJzdGFydCIsImdsb2JhbENvbmZpZyQiLCJnbG9iYWxDb25maWciLCJraWJhbmFJbmRleCIsImtpYmFuYSIsImluZGV4IiwidHlwZVJlZ2lzdHJ5Iiwic2F2ZWRPYmplY3RzIiwiZ2V0VHlwZVJlZ2lzdHJ5IiwiY2xpZW50IiwiYXNJbnRlcm5hbFVzZXIiLCJtaWdyYXRpb25DbGllbnQiLCJzZXJpYWxpemVyIiwiY3JlYXRlU2VyaWFsaXplciIsImtpYmFuYVZlcnNpb24iLCJlbnYiLCJwYWNrYWdlSW5mbyIsInZlcnNpb24iLCJlcyIsInN0b3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFlQTs7QUFjQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFD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QXdCTyxNQUF4QixDQUErQlMsTUFBL0IsQ0FDbkRvQixhQURIO0FBRUEsWUFBTUMsWUFBZ0MsR0FBRyxNQUFNRCxhQUFhLENBQUMzQixJQUFkLENBQW1CLHVCQUFuQixFQUE0QkMsU0FBNUIsRUFBL0M7QUFDQSxZQUFNNEIsV0FBVyxHQUFHRCxZQUFZLENBQUNFLE1BQWIsQ0FBb0JDLEtBQXhDO0FBQ0EsWUFBTUMsWUFBc0MsR0FBR3JDLElBQUksQ0FBQ3NDLFlBQUwsQ0FBa0JDLGVBQWxCLEVBQS9DO0FBQ0EsWUFBTTdCLFFBQVEsR0FBR1YsSUFBSSxDQUFDVyxhQUFMLENBQW1CNkIsTUFBbkIsQ0FBMEJDLGNBQTNDO0FBQ0EsWUFBTUMsZUFBZSxHQUFHLG1DQUF3QmhDLFFBQXhCLEVBQWtDLEtBQUtiLE1BQXZDLENBQXhCO0FBRUEsNENBQW1CYSxRQUFuQixFQUE2QndCLFdBQTdCLEVBQTBDRyxZQUExQyxFQUF3RCxLQUFLeEMsTUFBN0Q7QUFFQSxZQUFNOEMsVUFBa0MsR0FBRzNDLElBQUksQ0FBQ3NDLFlBQUwsQ0FBa0JNLGdCQUFsQixFQUEzQztBQUNBLFlBQU1DLGFBQWEsR0FBRyxLQUFLakQsa0JBQUwsQ0FBd0JrRCxHQUF4QixDQUE0QkMsV0FBNUIsQ0FBd0NDLE9BQTlEO0FBQ0EsOENBQ0VILGFBREYsRUFFRUgsZUFGRixFQUdFLEtBQUt6QixjQUhQLEVBSUVvQixZQUpGLEVBS0VNLFVBTEYsRUFNRSxLQUFLOUMsTUFOUDtBQVFEOztBQUVELFdBQU87QUFDTG9ELE1BQUFBLEVBQUUsRUFBRWpELElBQUksQ0FBQ1csYUFBTCxDQUFtQkM7QUFEbEIsS0FBUDtBQUdEOztBQUVNc0MsRUFBQUEsSUFBUCxHQUFjLENBQUU7O0FBcEdnRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgIENvcHlyaWdodCAyMDIwIEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuICogICBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogICBvciBpbiB0aGUgXCJsaWNlbnNlXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWRcbiAqICAgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiAgIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nXG4gKiAgIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBmaXJzdCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIFBsdWdpbkluaXRpYWxpemVyQ29udGV4dCxcbiAgQ29yZVNldHVwLFxuICBDb3JlU3RhcnQsXG4gIFBsdWdpbixcbiAgTG9nZ2VyLFxuICBJTGVnYWN5Q2x1c3RlckNsaWVudCxcbiAgU2Vzc2lvblN0b3JhZ2VGYWN0b3J5LFxuICBTaGFyZWRHbG9iYWxDb25maWcsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9jb3JlL3NlcnZlcic7XG5cbmltcG9ydCB7IE9wZW5kaXN0cm9TZWN1cml0eVBsdWdpblNldHVwLCBPcGVuZGlzdHJvU2VjdXJpdHlQbHVnaW5TdGFydCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgZGVmaW5lUm91dGVzIH0gZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IHsgU2VjdXJpdHlQbHVnaW5Db25maWdUeXBlIH0gZnJvbSAnLic7XG5pbXBvcnQgb3BlbmRpc3Ryb1NlY3VyaXR5Q29uZmlndXJhdG9pblBsdWdpbiBmcm9tICcuL2JhY2tlbmQvb3BlbmRpc3Ryb19zZWN1cml0eV9jb25maWd1cmF0aW9uX3BsdWdpbic7XG5pbXBvcnQgb3BlbmRpc3Ryb1NlY3VyaXR5UGx1Z2luIGZyb20gJy4vYmFja2VuZC9vcGVuZGlzdHJvX3NlY3VyaXR5X3BsdWdpbic7XG5pbXBvcnQgeyBTZWN1cml0eVNlc3Npb25Db29raWUsIGdldFNlY3VyaXR5Q29va2llT3B0aW9ucyB9IGZyb20gJy4vc2Vzc2lvbi9zZWN1cml0eV9jb29raWUnO1xuaW1wb3J0IHsgU2VjdXJpdHlDbGllbnQgfSBmcm9tICcuL2JhY2tlbmQvb3BlbmRpc3Ryb19zZWN1cml0eV9jbGllbnQnO1xuaW1wb3J0IHtcbiAgU2F2ZWRPYmplY3RzU2VyaWFsaXplcixcbiAgSVNhdmVkT2JqZWN0VHlwZVJlZ2lzdHJ5LFxufSBmcm9tICcuLi8uLi8uLi9zcmMvY29yZS9zZXJ2ZXIvc2F2ZWRfb2JqZWN0cyc7XG5pbXBvcnQgeyBzZXR1cEluZGV4VGVtcGxhdGUsIG1pZ3JhdGVUZW5hbnRJbmRpY2VzIH0gZnJvbSAnLi9tdWx0aXRlbmFuY3kvdGVuYW50X2luZGV4JztcbmltcG9ydCB7IElBdXRoZW50aWNhdGlvblR5cGUgfSBmcm9tICcuL2F1dGgvdHlwZXMvYXV0aGVudGljYXRpb25fdHlwZSc7XG5pbXBvcnQgeyBnZXRBdXRoZW50aWNhdGlvbkhhbmRsZXIgfSBmcm9tICcuL2F1dGgvYXV0aF9oYW5kbGVyX2ZhY3RvcnknO1xuaW1wb3J0IHsgc2V0dXBNdWx0aXRlbmFudFJvdXRlcyB9IGZyb20gJy4vbXVsdGl0ZW5hbmN5L3JvdXRlcyc7XG5pbXBvcnQgeyBkZWZpbmVBdXRoVHlwZVJvdXRlcyB9IGZyb20gJy4vcm91dGVzL2F1dGhfdHlwZV9yb3V0ZXMnO1xuaW1wb3J0IHsgY3JlYXRlTWlncmF0aW9uRXNDbGllbnQgfSBmcm9tICcuLi8uLi8uLi9zcmMvY29yZS9zZXJ2ZXIvc2F2ZWRfb2JqZWN0cy9taWdyYXRpb25zL2NvcmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlY3VyaXR5UGx1Z2luUmVxdWVzdENvbnRleHQge1xuICBsb2dnZXI6IExvZ2dlcjtcbiAgZXNDbGllbnQ6IElMZWdhY3lDbHVzdGVyQ2xpZW50O1xufVxuXG5kZWNsYXJlIG1vZHVsZSAna2liYW5hL3NlcnZlcicge1xuICBpbnRlcmZhY2UgUmVxdWVzdEhhbmRsZXJDb250ZXh0IHtcbiAgICBzZWN1cml0eV9wbHVnaW46IFNlY3VyaXR5UGx1Z2luUmVxdWVzdENvbnRleHQ7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZWN1cml0eVBsdWdpblJlcXVlc3RDb250ZXh0IHtcbiAgbG9nZ2VyOiBMb2dnZXI7XG59XG5cbmRlY2xhcmUgbW9kdWxlICdraWJhbmEvc2VydmVyJyB7XG4gIGludGVyZmFjZSBSZXF1ZXN0SGFuZGxlckNvbnRleHQge1xuICAgIHNlY3VyaXR5X3BsdWdpbjogU2VjdXJpdHlQbHVnaW5SZXF1ZXN0Q29udGV4dDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT3BlbmRpc3Ryb1NlY3VyaXR5UGx1Z2luXG4gIGltcGxlbWVudHMgUGx1Z2luPE9wZW5kaXN0cm9TZWN1cml0eVBsdWdpblNldHVwLCBPcGVuZGlzdHJvU2VjdXJpdHlQbHVnaW5TdGFydD4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogTG9nZ2VyO1xuICAvLyBGSVhNRToga2VlcCBhbiByZWZlcmVuY2Ugb2YgYWRtaW4gY2xpZW50IHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gc3RhcnQoKSwgYmV0dGVyIHRvIGZpZ3VyZW91dCBhXG4gIC8vICAgICAgICBkZWNlbnQgd2F5IHRvIGdldCBhZG1pbkNsaWVudCBpbiBzdGFydC4gKG1heWJlIHVzaW5nIGdldFN0YXJ0U2VydmljZXMoKSBmcm9tIHNldHVwPylcblxuICAvLyBAdHMtaWdub3JlOiBwcm9wZXJ0eSBub3QgaW5pdGlhbHppZWQgaW4gY29uc3RydWN0b3JcbiAgcHJpdmF0ZSBzZWN1cml0eUNsaWVudDogU2VjdXJpdHlDbGllbnQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBpbml0aWFsaXplckNvbnRleHQ6IFBsdWdpbkluaXRpYWxpemVyQ29udGV4dCkge1xuICAgIHRoaXMubG9nZ2VyID0gaW5pdGlhbGl6ZXJDb250ZXh0LmxvZ2dlci5nZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzZXR1cChjb3JlOiBDb3JlU2V0dXApIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1Zygnb3BlbmRpc3Ryb19zZWN1cml0eTogU2V0dXAnKTtcblxuICAgIGNvbnN0IGNvbmZpZyQgPSB0aGlzLmluaXRpYWxpemVyQ29udGV4dC5jb25maWcuY3JlYXRlPFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZT4oKTtcbiAgICBjb25zdCBjb25maWc6IFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZSA9IGF3YWl0IGNvbmZpZyQucGlwZShmaXJzdCgpKS50b1Byb21pc2UoKTtcblxuICAgIGNvbnN0IHJvdXRlciA9IGNvcmUuaHR0cC5jcmVhdGVSb3V0ZXIoKTtcblxuICAgIGNvbnN0IGVzQ2xpZW50OiBJTGVnYWN5Q2x1c3RlckNsaWVudCA9IGNvcmUuZWxhc3RpY3NlYXJjaC5sZWdhY3kuY3JlYXRlQ2xpZW50KFxuICAgICAgJ29wZW5kaXN0cm9fc2VjdXJpdHknLFxuICAgICAge1xuICAgICAgICBwbHVnaW5zOiBbb3BlbmRpc3Ryb1NlY3VyaXR5Q29uZmlndXJhdG9pblBsdWdpbiwgb3BlbmRpc3Ryb1NlY3VyaXR5UGx1Z2luXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zZWN1cml0eUNsaWVudCA9IG5ldyBTZWN1cml0eUNsaWVudChlc0NsaWVudCk7XG5cbiAgICBjb25zdCBzZWN1cml0eVNlc3Npb25TdG9yYWdlRmFjdG9yeTogU2Vzc2lvblN0b3JhZ2VGYWN0b3J5PFNlY3VyaXR5U2Vzc2lvbkNvb2tpZT4gPSBhd2FpdCBjb3JlLmh0dHAuY3JlYXRlQ29va2llU2Vzc2lvblN0b3JhZ2VGYWN0b3J5PFxuICAgICAgU2VjdXJpdHlTZXNzaW9uQ29va2llXG4gICAgPihnZXRTZWN1cml0eUNvb2tpZU9wdGlvbnMoY29uZmlnKSk7XG5cbiAgICAvLyBwdXQgbG9nZ2VyIGludG8gcm91dGUgaGFuZGxlciBjb250ZXh0LCBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gcGFzcyB0aHJvdWd0aCBwYXJhbWV0ZXJzXG4gICAgY29yZS5odHRwLnJlZ2lzdGVyUm91dGVIYW5kbGVyQ29udGV4dCgnc2VjdXJpdHlfcGx1Z2luJywgKGNvbnRleHQsIHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxvZ2dlcjogdGhpcy5sb2dnZXIsXG4gICAgICAgIGVzQ2xpZW50LFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIGF1dGhcbiAgICBjb25zdCBhdXRoOiBJQXV0aGVudGljYXRpb25UeXBlID0gZ2V0QXV0aGVudGljYXRpb25IYW5kbGVyKFxuICAgICAgY29uZmlnLmF1dGgudHlwZSxcbiAgICAgIHJvdXRlcixcbiAgICAgIGNvbmZpZyxcbiAgICAgIGNvcmUsXG4gICAgICBlc0NsaWVudCxcbiAgICAgIHNlY3VyaXR5U2Vzc2lvblN0b3JhZ2VGYWN0b3J5LFxuICAgICAgdGhpcy5sb2dnZXJcbiAgICApO1xuICAgIGNvcmUuaHR0cC5yZWdpc3RlckF1dGgoYXV0aC5hdXRoSGFuZGxlcik7XG5cbiAgICAvLyBSZWdpc3RlciBzZXJ2ZXIgc2lkZSBBUElzXG4gICAgZGVmaW5lUm91dGVzKHJvdXRlcik7XG4gICAgZGVmaW5lQXV0aFR5cGVSb3V0ZXMocm91dGVyLCBjb25maWcpO1xuICAgIC8vIHNldCB1cCBtdWx0aS10ZW5lbnQgcm91dGVzXG4gICAgaWYgKGNvbmZpZy5tdWx0aXRlbmFuY3k/LmVuYWJsZWQpIHtcbiAgICAgIHNldHVwTXVsdGl0ZW5hbnRSb3V0ZXMocm91dGVyLCBzZWN1cml0eVNlc3Npb25TdG9yYWdlRmFjdG9yeSwgdGhpcy5zZWN1cml0eUNsaWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZyQsXG4gICAgICBzZWN1cml0eUNvbmZpZ0NsaWVudDogZXNDbGllbnQsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE86IGFkZCBtb3JlIGxvZ3NcbiAgcHVibGljIGFzeW5jIHN0YXJ0KGNvcmU6IENvcmVTdGFydCkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdvcGVuZGlzdHJvX3NlY3VyaXR5OiBTdGFydGVkJyk7XG4gICAgY29uc3QgY29uZmlnJCA9IHRoaXMuaW5pdGlhbGl6ZXJDb250ZXh0LmNvbmZpZy5jcmVhdGU8U2VjdXJpdHlQbHVnaW5Db25maWdUeXBlPigpO1xuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGNvbmZpZyQucGlwZShmaXJzdCgpKS50b1Byb21pc2UoKTtcbiAgICBpZiAoY29uZmlnLm11bHRpdGVuYW5jeT8uZW5hYmxlZCkge1xuICAgICAgY29uc3QgZ2xvYmFsQ29uZmlnJDogT2JzZXJ2YWJsZTxTaGFyZWRHbG9iYWxDb25maWc+ID0gdGhpcy5pbml0aWFsaXplckNvbnRleHQuY29uZmlnLmxlZ2FjeVxuICAgICAgICAuZ2xvYmFsQ29uZmlnJDtcbiAgICAgIGNvbnN0IGdsb2JhbENvbmZpZzogU2hhcmVkR2xvYmFsQ29uZmlnID0gYXdhaXQgZ2xvYmFsQ29uZmlnJC5waXBlKGZpcnN0KCkpLnRvUHJvbWlzZSgpO1xuICAgICAgY29uc3Qga2liYW5hSW5kZXggPSBnbG9iYWxDb25maWcua2liYW5hLmluZGV4O1xuICAgICAgY29uc3QgdHlwZVJlZ2lzdHJ5OiBJU2F2ZWRPYmplY3RUeXBlUmVnaXN0cnkgPSBjb3JlLnNhdmVkT2JqZWN0cy5nZXRUeXBlUmVnaXN0cnkoKTtcbiAgICAgIGNvbnN0IGVzQ2xpZW50ID0gY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlcjtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkNsaWVudCA9IGNyZWF0ZU1pZ3JhdGlvbkVzQ2xpZW50KGVzQ2xpZW50LCB0aGlzLmxvZ2dlcik7XG5cbiAgICAgIHNldHVwSW5kZXhUZW1wbGF0ZShlc0NsaWVudCwga2liYW5hSW5kZXgsIHR5cGVSZWdpc3RyeSwgdGhpcy5sb2dnZXIpO1xuXG4gICAgICBjb25zdCBzZXJpYWxpemVyOiBTYXZlZE9iamVjdHNTZXJpYWxpemVyID0gY29yZS5zYXZlZE9iamVjdHMuY3JlYXRlU2VyaWFsaXplcigpO1xuICAgICAgY29uc3Qga2liYW5hVmVyc2lvbiA9IHRoaXMuaW5pdGlhbGl6ZXJDb250ZXh0LmVudi5wYWNrYWdlSW5mby52ZXJzaW9uO1xuICAgICAgbWlncmF0ZVRlbmFudEluZGljZXMoXG4gICAgICAgIGtpYmFuYVZlcnNpb24sXG4gICAgICAgIG1pZ3JhdGlvbkNsaWVudCxcbiAgICAgICAgdGhpcy5zZWN1cml0eUNsaWVudCxcbiAgICAgICAgdHlwZVJlZ2lzdHJ5LFxuICAgICAgICBzZXJpYWxpemVyLFxuICAgICAgICB0aGlzLmxvZ2dlclxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZXM6IGNvcmUuZWxhc3RpY3NlYXJjaC5sZWdhY3ksXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBzdG9wKCkge31cbn1cbiJdfQ==