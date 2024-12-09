"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupMultitenantRoutes = setupMultitenantRoutes;

var _configSchema = require("@kbn/config-schema");

var _htmlEntities = require("html-entities");

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
function setupMultitenantRoutes(router, sessionStroageFactory, securityClient) {
  const PREFIX = '/api/v1';
  const entities = new _htmlEntities.AllHtmlEntities();
  /**
   * Updates selected tenant.
   */

  router.post({
    path: `${PREFIX}/multitenancy/tenant`,
    validate: {
      body: _configSchema.schema.object({
        username: _configSchema.schema.string(),
        tenant: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    const tenant = request.body.tenant;
    const cookie = await sessionStroageFactory.asScoped(request).get();

    if (!cookie) {
      return response.badRequest({
        body: 'Invalid cookie'
      });
    }

    cookie.tenant = tenant;
    sessionStroageFactory.asScoped(request).set(cookie);
    return response.ok({
      body: entities.encode(tenant)
    });
  });
  /**
   * Gets current selected tenant from session.
   */

  router.get({
    path: `${PREFIX}/multitenancy/tenant`,
    validate: false
  }, async (context, request, response) => {
    const cookie = await sessionStroageFactory.asScoped(request).get();

    if (!cookie) {
      return response.badRequest({
        body: 'Invalid cookie.'
      });
    }

    return response.ok({
      body: entities.encode(cookie.tenant)
    });
  });
  /**
   * Gets multitenant info of current user.
   *
   * Sample response of this API:
   * {
   *   "user_name": "admin",
   *   "not_fail_on_forbidden_enabled": false,
   *   "kibana_mt_enabled": true,
   *   "kibana_index": ".kibana",
   *   "kibana_server_user": "kibanaserver"
   * }
   */

  router.get({
    path: `${PREFIX}/multitenancy/info`,
    validate: false
  }, async (context, request, response) => {
    try {
      const esResponse = await securityClient.getMultitenancyInfo(request);
      return response.ok({
        body: esResponse,
        headers: {
          'content-type': 'application/json'
        }
      });
    } catch (error) {
      return response.internalError({
        body: error.message
      });
    }
  });
  router.post({
    // FIXME: Seems this is not being used, confirm and delete if not used anymore
    path: `${PREFIX}/multitenancy/migrate/{tenantindex}`,
    validate: {
      params: _configSchema.schema.object({
        tenantindex: _configSchema.schema.string()
      }),
      query: _configSchema.schema.object({
        force: _configSchema.schema.literal('true')
      })
    }
  }, async (context, request, response) => {
    return response.ok(); // TODO: implement tenant index migration logic
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlcy50cyJdLCJuYW1lcyI6WyJzZXR1cE11bHRpdGVuYW50Um91dGVzIiwicm91dGVyIiwic2Vzc2lvblN0cm9hZ2VGYWN0b3J5Iiwic2VjdXJpdHlDbGllbnQiLCJQUkVGSVgiLCJlbnRpdGllcyIsIkFsbEh0bWxFbnRpdGllcyIsInBvc3QiLCJwYXRoIiwidmFsaWRhdGUiLCJib2R5Iiwic2NoZW1hIiwib2JqZWN0IiwidXNlcm5hbWUiLCJzdHJpbmciLCJ0ZW5hbnQiLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiY29va2llIiwiYXNTY29wZWQiLCJnZXQiLCJiYWRSZXF1ZXN0Iiwic2V0Iiwib2siLCJlbmNvZGUiLCJlc1Jlc3BvbnNlIiwiZ2V0TXVsdGl0ZW5hbmN5SW5mbyIsImhlYWRlcnMiLCJlcnJvciIsImludGVybmFsRXJyb3IiLCJtZXNzYWdlIiwicGFyYW1zIiwidGVuYW50aW5kZXgiLCJxdWVyeSIsImZvcmNlIiwibGl0ZXJhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWVBOztBQUNBOztBQWhCQTs7Ozs7Ozs7Ozs7Ozs7QUFxQk8sU0FBU0Esc0JBQVQsQ0FDTEMsTUFESyxFQUVMQyxxQkFGSyxFQUdMQyxjQUhLLEVBSUw7QUFDQSxRQUFNQyxNQUFjLEdBQUcsU0FBdkI7QUFFQSxRQUFNQyxRQUFRLEdBQUcsSUFBSUMsNkJBQUosRUFBakI7QUFFQTs7OztBQUdBTCxFQUFBQSxNQUFNLENBQUNNLElBQVAsQ0FDRTtBQUNFQyxJQUFBQSxJQUFJLEVBQUcsR0FBRUosTUFBTyxzQkFEbEI7QUFFRUssSUFBQUEsUUFBUSxFQUFFO0FBQ1JDLE1BQUFBLElBQUksRUFBRUMscUJBQU9DLE1BQVAsQ0FBYztBQUNsQkMsUUFBQUEsUUFBUSxFQUFFRixxQkFBT0csTUFBUCxFQURRO0FBRWxCQyxRQUFBQSxNQUFNLEVBQUVKLHFCQUFPRyxNQUFQO0FBRlUsT0FBZDtBQURFO0FBRlosR0FERixFQVVFLE9BQU9FLE9BQVAsRUFBZ0JDLE9BQWhCLEVBQXlCQyxRQUF6QixLQUFzQztBQUNwQyxVQUFNSCxNQUFNLEdBQUdFLE9BQU8sQ0FBQ1AsSUFBUixDQUFhSyxNQUE1QjtBQUVBLFVBQU1JLE1BQW9DLEdBQUcsTUFBTWpCLHFCQUFxQixDQUNyRWtCLFFBRGdELENBQ3ZDSCxPQUR1QyxFQUVoREksR0FGZ0QsRUFBbkQ7O0FBR0EsUUFBSSxDQUFDRixNQUFMLEVBQWE7QUFDWCxhQUFPRCxRQUFRLENBQUNJLFVBQVQsQ0FBb0I7QUFDekJaLFFBQUFBLElBQUksRUFBRTtBQURtQixPQUFwQixDQUFQO0FBR0Q7O0FBQ0RTLElBQUFBLE1BQU0sQ0FBQ0osTUFBUCxHQUFnQkEsTUFBaEI7QUFDQWIsSUFBQUEscUJBQXFCLENBQUNrQixRQUF0QixDQUErQkgsT0FBL0IsRUFBd0NNLEdBQXhDLENBQTRDSixNQUE1QztBQUNBLFdBQU9ELFFBQVEsQ0FBQ00sRUFBVCxDQUFZO0FBQ2pCZCxNQUFBQSxJQUFJLEVBQUVMLFFBQVEsQ0FBQ29CLE1BQVQsQ0FBZ0JWLE1BQWhCO0FBRFcsS0FBWixDQUFQO0FBR0QsR0ExQkg7QUE2QkE7Ozs7QUFHQWQsRUFBQUEsTUFBTSxDQUFDb0IsR0FBUCxDQUNFO0FBQ0ViLElBQUFBLElBQUksRUFBRyxHQUFFSixNQUFPLHNCQURsQjtBQUVFSyxJQUFBQSxRQUFRLEVBQUU7QUFGWixHQURGLEVBS0UsT0FBT08sT0FBUCxFQUFnQkMsT0FBaEIsRUFBeUJDLFFBQXpCLEtBQXNDO0FBQ3BDLFVBQU1DLE1BQU0sR0FBRyxNQUFNakIscUJBQXFCLENBQUNrQixRQUF0QixDQUErQkgsT0FBL0IsRUFBd0NJLEdBQXhDLEVBQXJCOztBQUNBLFFBQUksQ0FBQ0YsTUFBTCxFQUFhO0FBQ1gsYUFBT0QsUUFBUSxDQUFDSSxVQUFULENBQW9CO0FBQ3pCWixRQUFBQSxJQUFJLEVBQUU7QUFEbUIsT0FBcEIsQ0FBUDtBQUdEOztBQUNELFdBQU9RLFFBQVEsQ0FBQ00sRUFBVCxDQUFZO0FBQ2pCZCxNQUFBQSxJQUFJLEVBQUVMLFFBQVEsQ0FBQ29CLE1BQVQsQ0FBZ0JOLE1BQU0sQ0FBQ0osTUFBdkI7QUFEVyxLQUFaLENBQVA7QUFHRCxHQWZIO0FBa0JBOzs7Ozs7Ozs7Ozs7O0FBWUFkLEVBQUFBLE1BQU0sQ0FBQ29CLEdBQVAsQ0FDRTtBQUNFYixJQUFBQSxJQUFJLEVBQUcsR0FBRUosTUFBTyxvQkFEbEI7QUFFRUssSUFBQUEsUUFBUSxFQUFFO0FBRlosR0FERixFQUtFLE9BQU9PLE9BQVAsRUFBZ0JDLE9BQWhCLEVBQXlCQyxRQUF6QixLQUFzQztBQUNwQyxRQUFJO0FBQ0YsWUFBTVEsVUFBVSxHQUFHLE1BQU12QixjQUFjLENBQUN3QixtQkFBZixDQUFtQ1YsT0FBbkMsQ0FBekI7QUFDQSxhQUFPQyxRQUFRLENBQUNNLEVBQVQsQ0FBWTtBQUNqQmQsUUFBQUEsSUFBSSxFQUFFZ0IsVUFEVztBQUVqQkUsUUFBQUEsT0FBTyxFQUFFO0FBQ1AsMEJBQWdCO0FBRFQ7QUFGUSxPQUFaLENBQVA7QUFNRCxLQVJELENBUUUsT0FBT0MsS0FBUCxFQUFjO0FBQ2QsYUFBT1gsUUFBUSxDQUFDWSxhQUFULENBQXVCO0FBQzVCcEIsUUFBQUEsSUFBSSxFQUFFbUIsS0FBSyxDQUFDRTtBQURnQixPQUF2QixDQUFQO0FBR0Q7QUFDRixHQW5CSDtBQXNCQTlCLEVBQUFBLE1BQU0sQ0FBQ00sSUFBUCxDQUNFO0FBQ0U7QUFDQUMsSUFBQUEsSUFBSSxFQUFHLEdBQUVKLE1BQU8scUNBRmxCO0FBR0VLLElBQUFBLFFBQVEsRUFBRTtBQUNSdUIsTUFBQUEsTUFBTSxFQUFFckIscUJBQU9DLE1BQVAsQ0FBYztBQUNwQnFCLFFBQUFBLFdBQVcsRUFBRXRCLHFCQUFPRyxNQUFQO0FBRE8sT0FBZCxDQURBO0FBSVJvQixNQUFBQSxLQUFLLEVBQUV2QixxQkFBT0MsTUFBUCxDQUFjO0FBQ25CdUIsUUFBQUEsS0FBSyxFQUFFeEIscUJBQU95QixPQUFQLENBQWUsTUFBZjtBQURZLE9BQWQ7QUFKQztBQUhaLEdBREYsRUFhRSxPQUFPcEIsT0FBUCxFQUFnQkMsT0FBaEIsRUFBeUJDLFFBQXpCLEtBQXNDO0FBQ3BDLFdBQU9BLFFBQVEsQ0FBQ00sRUFBVCxFQUFQLENBRG9DLENBQ2Q7QUFDdkIsR0FmSDtBQWlCRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgIENvcHlyaWdodCAyMDIwIEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuICogICBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogICBvciBpbiB0aGUgXCJsaWNlbnNlXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWRcbiAqICAgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiAgIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nXG4gKiAgIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICdAa2JuL2NvbmZpZy1zY2hlbWEnO1xuaW1wb3J0IHsgQWxsSHRtbEVudGl0aWVzIH0gZnJvbSAnaHRtbC1lbnRpdGllcyc7XG5pbXBvcnQgeyBJUm91dGVyLCBTZXNzaW9uU3RvcmFnZUZhY3RvcnkgfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvY29yZS9zZXJ2ZXInO1xuaW1wb3J0IHsgU2VjdXJpdHlTZXNzaW9uQ29va2llIH0gZnJvbSAnLi4vc2Vzc2lvbi9zZWN1cml0eV9jb29raWUnO1xuaW1wb3J0IHsgU2VjdXJpdHlDbGllbnQgfSBmcm9tICcuLi9iYWNrZW5kL29wZW5kaXN0cm9fc2VjdXJpdHlfY2xpZW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTXVsdGl0ZW5hbnRSb3V0ZXMoXG4gIHJvdXRlcjogSVJvdXRlcixcbiAgc2Vzc2lvblN0cm9hZ2VGYWN0b3J5OiBTZXNzaW9uU3RvcmFnZUZhY3Rvcnk8U2VjdXJpdHlTZXNzaW9uQ29va2llPixcbiAgc2VjdXJpdHlDbGllbnQ6IFNlY3VyaXR5Q2xpZW50XG4pIHtcbiAgY29uc3QgUFJFRklYOiBzdHJpbmcgPSAnL2FwaS92MSc7XG5cbiAgY29uc3QgZW50aXRpZXMgPSBuZXcgQWxsSHRtbEVudGl0aWVzKCk7XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgc2VsZWN0ZWQgdGVuYW50LlxuICAgKi9cbiAgcm91dGVyLnBvc3QoXG4gICAge1xuICAgICAgcGF0aDogYCR7UFJFRklYfS9tdWx0aXRlbmFuY3kvdGVuYW50YCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIGJvZHk6IHNjaGVtYS5vYmplY3Qoe1xuICAgICAgICAgIHVzZXJuYW1lOiBzY2hlbWEuc3RyaW5nKCksXG4gICAgICAgICAgdGVuYW50OiBzY2hlbWEuc3RyaW5nKCksXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgdGVuYW50ID0gcmVxdWVzdC5ib2R5LnRlbmFudDtcblxuICAgICAgY29uc3QgY29va2llOiBTZWN1cml0eVNlc3Npb25Db29raWUgfCBudWxsID0gYXdhaXQgc2Vzc2lvblN0cm9hZ2VGYWN0b3J5XG4gICAgICAgIC5hc1Njb3BlZChyZXF1ZXN0KVxuICAgICAgICAuZ2V0KCk7XG4gICAgICBpZiAoIWNvb2tpZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYmFkUmVxdWVzdCh7XG4gICAgICAgICAgYm9keTogJ0ludmFsaWQgY29va2llJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb29raWUudGVuYW50ID0gdGVuYW50O1xuICAgICAgc2Vzc2lvblN0cm9hZ2VGYWN0b3J5LmFzU2NvcGVkKHJlcXVlc3QpLnNldChjb29raWUpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keTogZW50aXRpZXMuZW5jb2RlKHRlbmFudCksXG4gICAgICB9KTtcbiAgICB9XG4gICk7XG5cbiAgLyoqXG4gICAqIEdldHMgY3VycmVudCBzZWxlY3RlZCB0ZW5hbnQgZnJvbSBzZXNzaW9uLlxuICAgKi9cbiAgcm91dGVyLmdldChcbiAgICB7XG4gICAgICBwYXRoOiBgJHtQUkVGSVh9L211bHRpdGVuYW5jeS90ZW5hbnRgLFxuICAgICAgdmFsaWRhdGU6IGZhbHNlLFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCBjb29raWUgPSBhd2FpdCBzZXNzaW9uU3Ryb2FnZUZhY3RvcnkuYXNTY29wZWQocmVxdWVzdCkuZ2V0KCk7XG4gICAgICBpZiAoIWNvb2tpZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYmFkUmVxdWVzdCh7XG4gICAgICAgICAgYm9keTogJ0ludmFsaWQgY29va2llLicsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keTogZW50aXRpZXMuZW5jb2RlKGNvb2tpZS50ZW5hbnQpLFxuICAgICAgfSk7XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBHZXRzIG11bHRpdGVuYW50IGluZm8gb2YgY3VycmVudCB1c2VyLlxuICAgKlxuICAgKiBTYW1wbGUgcmVzcG9uc2Ugb2YgdGhpcyBBUEk6XG4gICAqIHtcbiAgICogICBcInVzZXJfbmFtZVwiOiBcImFkbWluXCIsXG4gICAqICAgXCJub3RfZmFpbF9vbl9mb3JiaWRkZW5fZW5hYmxlZFwiOiBmYWxzZSxcbiAgICogICBcImtpYmFuYV9tdF9lbmFibGVkXCI6IHRydWUsXG4gICAqICAgXCJraWJhbmFfaW5kZXhcIjogXCIua2liYW5hXCIsXG4gICAqICAgXCJraWJhbmFfc2VydmVyX3VzZXJcIjogXCJraWJhbmFzZXJ2ZXJcIlxuICAgKiB9XG4gICAqL1xuICByb3V0ZXIuZ2V0KFxuICAgIHtcbiAgICAgIHBhdGg6IGAke1BSRUZJWH0vbXVsdGl0ZW5hbmN5L2luZm9gLFxuICAgICAgdmFsaWRhdGU6IGZhbHNlLFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlc1Jlc3BvbnNlID0gYXdhaXQgc2VjdXJpdHlDbGllbnQuZ2V0TXVsdGl0ZW5hbmN5SW5mbyhyZXF1ZXN0KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiBlc1Jlc3BvbnNlLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuaW50ZXJuYWxFcnJvcih7XG4gICAgICAgICAgYm9keTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIHJvdXRlci5wb3N0KFxuICAgIHtcbiAgICAgIC8vIEZJWE1FOiBTZWVtcyB0aGlzIGlzIG5vdCBiZWluZyB1c2VkLCBjb25maXJtIGFuZCBkZWxldGUgaWYgbm90IHVzZWQgYW55bW9yZVxuICAgICAgcGF0aDogYCR7UFJFRklYfS9tdWx0aXRlbmFuY3kvbWlncmF0ZS97dGVuYW50aW5kZXh9YCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczogc2NoZW1hLm9iamVjdCh7XG4gICAgICAgICAgdGVuYW50aW5kZXg6IHNjaGVtYS5zdHJpbmcoKSxcbiAgICAgICAgfSksXG4gICAgICAgIHF1ZXJ5OiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICBmb3JjZTogc2NoZW1hLmxpdGVyYWwoJ3RydWUnKSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soKTsgLy8gVE9ETzogaW1wbGVtZW50IHRlbmFudCBpbmRleCBtaWdyYXRpb24gbG9naWNcbiAgICB9XG4gICk7XG59XG4iXX0=