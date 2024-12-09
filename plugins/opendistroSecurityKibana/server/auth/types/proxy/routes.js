"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProxyAuthRoutes = void 0;

var _configSchema = require("@kbn/config-schema");

var _next_url = require("../../../utils/next_url");

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
class ProxyAuthRoutes {
  constructor(router, config, sessionStorageFactory, securityClient, coreSetup) {
    this.router = router;
    this.config = config;
    this.sessionStorageFactory = sessionStorageFactory;
    this.securityClient = securityClient;
    this.coreSetup = coreSetup;
  }

  setupRoutes() {
    this.router.get({
      path: `/auth/proxy/login`,
      validate: {
        query: _configSchema.schema.object({
          nextUrl: _configSchema.schema.maybe(_configSchema.schema.string({
            validate: _next_url.validateNextUrl
          }))
        })
      },
      options: {
        // TODO: set to false?
        authRequired: 'optional'
      }
    }, async (context, request, response) => {
      var _this$config$proxycac;

      if (request.auth.isAuthenticated) {
        const nextUrl = request.query.nextUrl || `${this.coreSetup.http.basePath.serverBasePath}/app/kibana`;
        response.redirected({
          headers: {
            location: nextUrl
          }
        });
      }

      const loginEndpoint = (_this$config$proxycac = this.config.proxycache) === null || _this$config$proxycac === void 0 ? void 0 : _this$config$proxycac.login_endpoint;

      if (loginEndpoint) {
        return response.redirected({
          headers: {
            location: loginEndpoint
          }
        });
      } else {
        return response.badRequest();
      }
    });
    this.router.post({
      path: `/auth/proxy/logout`,
      validate: false
    }, async (context, request, response) => {
      this.sessionStorageFactory.asScoped(request).clear();
      return response.ok();
    });
  }

}

exports.ProxyAuthRoutes = ProxyAuthRoutes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlcy50cyJdLCJuYW1lcyI6WyJQcm94eUF1dGhSb3V0ZXMiLCJjb25zdHJ1Y3RvciIsInJvdXRlciIsImNvbmZpZyIsInNlc3Npb25TdG9yYWdlRmFjdG9yeSIsInNlY3VyaXR5Q2xpZW50IiwiY29yZVNldHVwIiwic2V0dXBSb3V0ZXMiLCJnZXQiLCJwYXRoIiwidmFsaWRhdGUiLCJxdWVyeSIsInNjaGVtYSIsIm9iamVjdCIsIm5leHRVcmwiLCJtYXliZSIsInN0cmluZyIsInZhbGlkYXRlTmV4dFVybCIsIm9wdGlvbnMiLCJhdXRoUmVxdWlyZWQiLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiYXV0aCIsImlzQXV0aGVudGljYXRlZCIsImh0dHAiLCJiYXNlUGF0aCIsInNlcnZlckJhc2VQYXRoIiwicmVkaXJlY3RlZCIsImhlYWRlcnMiLCJsb2NhdGlvbiIsImxvZ2luRW5kcG9pbnQiLCJwcm94eWNhY2hlIiwibG9naW5fZW5kcG9pbnQiLCJiYWRSZXF1ZXN0IiwicG9zdCIsImFzU2NvcGVkIiwiY2xlYXIiLCJvayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWVBOztBQU1BOztBQXJCQTs7Ozs7Ozs7Ozs7Ozs7QUF1Qk8sTUFBTUEsZUFBTixDQUFzQjtBQUMzQkMsRUFBQUEsV0FBVyxDQUNRQyxNQURSLEVBRVFDLE1BRlIsRUFHUUMscUJBSFIsRUFJUUMsY0FKUixFQUtRQyxTQUxSLEVBTVQ7QUFBQSxTQUxpQkosTUFLakIsR0FMaUJBLE1BS2pCO0FBQUEsU0FKaUJDLE1BSWpCLEdBSmlCQSxNQUlqQjtBQUFBLFNBSGlCQyxxQkFHakIsR0FIaUJBLHFCQUdqQjtBQUFBLFNBRmlCQyxjQUVqQixHQUZpQkEsY0FFakI7QUFBQSxTQURpQkMsU0FDakIsR0FEaUJBLFNBQ2pCO0FBQUU7O0FBRUdDLEVBQUFBLFdBQVAsR0FBcUI7QUFDbkIsU0FBS0wsTUFBTCxDQUFZTSxHQUFaLENBQ0U7QUFDRUMsTUFBQUEsSUFBSSxFQUFHLG1CQURUO0FBRUVDLE1BQUFBLFFBQVEsRUFBRTtBQUNSQyxRQUFBQSxLQUFLLEVBQUVDLHFCQUFPQyxNQUFQLENBQWM7QUFDbkJDLFVBQUFBLE9BQU8sRUFBRUYscUJBQU9HLEtBQVAsQ0FDUEgscUJBQU9JLE1BQVAsQ0FBYztBQUNaTixZQUFBQSxRQUFRLEVBQUVPO0FBREUsV0FBZCxDQURPO0FBRFUsU0FBZDtBQURDLE9BRlo7QUFXRUMsTUFBQUEsT0FBTyxFQUFFO0FBQ1A7QUFDQUMsUUFBQUEsWUFBWSxFQUFFO0FBRlA7QUFYWCxLQURGLEVBaUJFLE9BQU9DLE9BQVAsRUFBZ0JDLE9BQWhCLEVBQXlCQyxRQUF6QixLQUFzQztBQUFBOztBQUNwQyxVQUFJRCxPQUFPLENBQUNFLElBQVIsQ0FBYUMsZUFBakIsRUFBa0M7QUFDaEMsY0FBTVYsT0FBTyxHQUNYTyxPQUFPLENBQUNWLEtBQVIsQ0FBY0csT0FBZCxJQUEwQixHQUFFLEtBQUtSLFNBQUwsQ0FBZW1CLElBQWYsQ0FBb0JDLFFBQXBCLENBQTZCQyxjQUFlLGFBRDFFO0FBRUFMLFFBQUFBLFFBQVEsQ0FBQ00sVUFBVCxDQUFvQjtBQUNsQkMsVUFBQUEsT0FBTyxFQUFFO0FBQ1BDLFlBQUFBLFFBQVEsRUFBRWhCO0FBREg7QUFEUyxTQUFwQjtBQUtEOztBQUVELFlBQU1pQixhQUFhLDRCQUFHLEtBQUs1QixNQUFMLENBQVk2QixVQUFmLDBEQUFHLHNCQUF3QkMsY0FBOUM7O0FBQ0EsVUFBSUYsYUFBSixFQUFtQjtBQUNqQixlQUFPVCxRQUFRLENBQUNNLFVBQVQsQ0FBb0I7QUFDekJDLFVBQUFBLE9BQU8sRUFBRTtBQUNQQyxZQUFBQSxRQUFRLEVBQUVDO0FBREg7QUFEZ0IsU0FBcEIsQ0FBUDtBQUtELE9BTkQsTUFNTztBQUNMLGVBQU9ULFFBQVEsQ0FBQ1ksVUFBVCxFQUFQO0FBQ0Q7QUFDRixLQXRDSDtBQXlDQSxTQUFLaEMsTUFBTCxDQUFZaUMsSUFBWixDQUNFO0FBQ0UxQixNQUFBQSxJQUFJLEVBQUcsb0JBRFQ7QUFFRUMsTUFBQUEsUUFBUSxFQUFFO0FBRlosS0FERixFQUtFLE9BQU9VLE9BQVAsRUFBZ0JDLE9BQWhCLEVBQXlCQyxRQUF6QixLQUFzQztBQUNwQyxXQUFLbEIscUJBQUwsQ0FBMkJnQyxRQUEzQixDQUFvQ2YsT0FBcEMsRUFBNkNnQixLQUE3QztBQUNBLGFBQU9mLFFBQVEsQ0FBQ2dCLEVBQVQsRUFBUDtBQUNELEtBUkg7QUFVRDs7QUE3RDBCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqICAgQ29weXJpZ2h0IDIwMjAgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIikuXG4gKiAgIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqICAgQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiAgIG9yIGluIHRoZSBcImxpY2Vuc2VcIiBmaWxlIGFjY29tcGFueWluZyB0aGlzIGZpbGUuIFRoaXMgZmlsZSBpcyBkaXN0cmlidXRlZFxuICogICBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXJcbiAqICAgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmdcbiAqICAgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IHNjaGVtYSB9IGZyb20gJ0BrYm4vY29uZmlnLXNjaGVtYSc7XG5pbXBvcnQgeyBJUm91dGVyLCBTZXNzaW9uU3RvcmFnZUZhY3RvcnkgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zZXJ2ZXInO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXNzaW9uQ29va2llIH0gZnJvbSAnLi4vLi4vLi4vc2Vzc2lvbi9zZWN1cml0eV9jb29raWUnO1xuaW1wb3J0IHsgU2VjdXJpdHlQbHVnaW5Db25maWdUeXBlIH0gZnJvbSAnLi4vLi4vLi4nO1xuaW1wb3J0IHsgU2VjdXJpdHlDbGllbnQgfSBmcm9tICcuLi8uLi8uLi9iYWNrZW5kL29wZW5kaXN0cm9fc2VjdXJpdHlfY2xpZW50JztcbmltcG9ydCB7IENvcmVTZXR1cCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NlcnZlcic7XG5pbXBvcnQgeyB2YWxpZGF0ZU5leHRVcmwgfSBmcm9tICcuLi8uLi8uLi91dGlscy9uZXh0X3VybCc7XG5cbmV4cG9ydCBjbGFzcyBQcm94eUF1dGhSb3V0ZXMge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJvdXRlcjogSVJvdXRlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZzogU2VjdXJpdHlQbHVnaW5Db25maWdUeXBlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2Vzc2lvblN0b3JhZ2VGYWN0b3J5OiBTZXNzaW9uU3RvcmFnZUZhY3Rvcnk8U2VjdXJpdHlTZXNzaW9uQ29va2llPixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlY3VyaXR5Q2xpZW50OiBTZWN1cml0eUNsaWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvcmVTZXR1cDogQ29yZVNldHVwXG4gICkge31cblxuICBwdWJsaWMgc2V0dXBSb3V0ZXMoKSB7XG4gICAgdGhpcy5yb3V0ZXIuZ2V0KFxuICAgICAge1xuICAgICAgICBwYXRoOiBgL2F1dGgvcHJveHkvbG9naW5gLFxuICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgIHF1ZXJ5OiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICAgIG5leHRVcmw6IHNjaGVtYS5tYXliZShcbiAgICAgICAgICAgICAgc2NoZW1hLnN0cmluZyh7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHZhbGlkYXRlTmV4dFVybCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAvLyBUT0RPOiBzZXQgdG8gZmFsc2U/XG4gICAgICAgICAgYXV0aFJlcXVpcmVkOiAnb3B0aW9uYWwnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5hdXRoLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgIGNvbnN0IG5leHRVcmwgPVxuICAgICAgICAgICAgcmVxdWVzdC5xdWVyeS5uZXh0VXJsIHx8IGAke3RoaXMuY29yZVNldHVwLmh0dHAuYmFzZVBhdGguc2VydmVyQmFzZVBhdGh9L2FwcC9raWJhbmFgO1xuICAgICAgICAgIHJlc3BvbnNlLnJlZGlyZWN0ZWQoe1xuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICBsb2NhdGlvbjogbmV4dFVybCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2dpbkVuZHBvaW50ID0gdGhpcy5jb25maWcucHJveHljYWNoZT8ubG9naW5fZW5kcG9pbnQ7XG4gICAgICAgIGlmIChsb2dpbkVuZHBvaW50KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlZGlyZWN0ZWQoe1xuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICBsb2NhdGlvbjogbG9naW5FbmRwb2ludCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJhZFJlcXVlc3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnJvdXRlci5wb3N0KFxuICAgICAge1xuICAgICAgICBwYXRoOiBgL2F1dGgvcHJveHkvbG9nb3V0YCxcbiAgICAgICAgdmFsaWRhdGU6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgICB0aGlzLnNlc3Npb25TdG9yYWdlRmFjdG9yeS5hc1Njb3BlZChyZXF1ZXN0KS5jbGVhcigpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG59XG4iXX0=