"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

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
// eslint-disable-next-line import/no-default-export
function _default(Client, config, components) {
  const ca = components.clientAction.factory;

  if (!Client.prototype.opendistro_security) {
    Client.prototype.opendistro_security = components.clientAction.namespaceFactory();
  }

  Client.prototype.opendistro_security.prototype.restapiinfo = ca({
    url: {
      fmt: '/_opendistro/_security/api/permissionsinfo'
    }
  });
  /**
   * list all field mappings for all indices.
   */

  Client.prototype.opendistro_security.prototype.indices = ca({
    url: {
      fmt: '/_all/_mapping/field/*'
    }
  });
  /**
   * Returns a Security resource configuration.
   *
   * Sample response:
   *
   * {
   *   "user": {
   *     "hash": "#123123"
   *   }
   * }
   */

  Client.prototype.opendistro_security.prototype.listResource = ca({
    url: {
      fmt: '/_opendistro/_security/api/<%=resourceName%>',
      req: {
        resourceName: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Creates a Security resource instance.
   *
   * At the moment Security does not support conflict detection,
   * so this method can be effectively used to both create and update resource.
   *
   * Sample response:
   *
   * {
   *   "status": "CREATED",
   *   "message": "User username created"
   * }
   */

  Client.prototype.opendistro_security.prototype.saveResource = ca({
    method: 'PUT',
    needBody: true,
    url: {
      fmt: '/_opendistro/_security/api/<%=resourceName%>/<%=id%>',
      req: {
        resourceName: {
          type: 'string',
          required: true
        },
        id: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Updates a resource.
   * Resource identification is expected to computed from headers. Eg: auth headers.
   *
   * Sample response:
   * {
   *   "status": "OK",
   *   "message": "Username updated."
   * }
   */

  Client.prototype.opendistro_security.prototype.saveResourceWithoutId = ca({
    method: 'PUT',
    needBody: true,
    url: {
      fmt: '/_opendistro/_security/api/<%=resourceName%>',
      req: {
        resourceName: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Returns a Security resource instance.
   *
   * Sample response:
   *
   * {
   *   "user": {
   *     "hash": '#123123'
   *   }
   * }
   */

  Client.prototype.opendistro_security.prototype.getResource = ca({
    method: 'GET',
    url: {
      fmt: '/_opendistro/_security/api/<%=resourceName%>/<%=id%>',
      req: {
        resourceName: {
          type: 'string',
          required: true
        },
        id: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Deletes a Security resource instance.
   */

  Client.prototype.opendistro_security.prototype.deleteResource = ca({
    method: 'DELETE',
    url: {
      fmt: '/_opendistro/_security/api/<%=resourceName%>/<%=id%>',
      req: {
        resourceName: {
          type: 'string',
          required: true
        },
        id: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Deletes a Security resource instance.
   */

  Client.prototype.opendistro_security.prototype.clearCache = ca({
    method: 'DELETE',
    url: {
      fmt: '/_opendistro/_security/api/cache'
    }
  });
  /**
   * Validate query.
   */

  Client.prototype.opendistro_security.prototype.validateDls = ca({
    method: 'POST',
    needBody: true,
    url: {
      fmt: '/_validate/query?explain=true'
    }
  });
  /**
   * Gets index mapping.
   */

  Client.prototype.opendistro_security.prototype.getIndexMappings = ca({
    method: 'GET',
    needBody: true,
    url: {
      fmt: '/<%=index%>/_mapping',
      req: {
        index: {
          type: 'string',
          required: true
        }
      }
    }
  });
  /**
   * Gets audit log configuration.
   */

  Client.prototype.opendistro_security.prototype.getAudit = ca({
    method: 'GET',
    url: {
      fmt: '/_opendistro/_security/api/audit'
    }
  });
  /**
   * Updates audit log configuration.
   */

  Client.prototype.opendistro_security.prototype.saveAudit = ca({
    method: 'PUT',
    needBody: true,
    url: {
      fmt: '/_opendistro/_security/api/audit/config'
    }
  });
}

module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wZW5kaXN0cm9fc2VjdXJpdHlfY29uZmlndXJhdGlvbl9wbHVnaW4udHMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiY29tcG9uZW50cyIsImNhIiwiY2xpZW50QWN0aW9uIiwiZmFjdG9yeSIsInByb3RvdHlwZSIsIm9wZW5kaXN0cm9fc2VjdXJpdHkiLCJuYW1lc3BhY2VGYWN0b3J5IiwicmVzdGFwaWluZm8iLCJ1cmwiLCJmbXQiLCJpbmRpY2VzIiwibGlzdFJlc291cmNlIiwicmVxIiwicmVzb3VyY2VOYW1lIiwidHlwZSIsInJlcXVpcmVkIiwic2F2ZVJlc291cmNlIiwibWV0aG9kIiwibmVlZEJvZHkiLCJpZCIsInNhdmVSZXNvdXJjZVdpdGhvdXRJZCIsImdldFJlc291cmNlIiwiZGVsZXRlUmVzb3VyY2UiLCJjbGVhckNhY2hlIiwidmFsaWRhdGVEbHMiLCJnZXRJbmRleE1hcHBpbmdzIiwiaW5kZXgiLCJnZXRBdWRpdCIsInNhdmVBdWRpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7OztBQWVBO0FBQ2Usa0JBQVVBLE1BQVYsRUFBdUJDLE1BQXZCLEVBQW9DQyxVQUFwQyxFQUFxRDtBQUNsRSxRQUFNQyxFQUFFLEdBQUdELFVBQVUsQ0FBQ0UsWUFBWCxDQUF3QkMsT0FBbkM7O0FBRUEsTUFBSSxDQUFDTCxNQUFNLENBQUNNLFNBQVAsQ0FBaUJDLG1CQUF0QixFQUEyQztBQUN6Q1AsSUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsR0FBdUNMLFVBQVUsQ0FBQ0UsWUFBWCxDQUF3QkksZ0JBQXhCLEVBQXZDO0FBQ0Q7O0FBRURSLEVBQUFBLE1BQU0sQ0FBQ00sU0FBUCxDQUFpQkMsbUJBQWpCLENBQXFDRCxTQUFyQyxDQUErQ0csV0FBL0MsR0FBNkROLEVBQUUsQ0FBQztBQUM5RE8sSUFBQUEsR0FBRyxFQUFFO0FBQ0hDLE1BQUFBLEdBQUcsRUFBRTtBQURGO0FBRHlELEdBQUQsQ0FBL0Q7QUFN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SDhELEdBQUQsQ0FBcEU7QUFjQTs7OztBQUdBakIsRUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsQ0FBcUNELFNBQXJDLENBQStDdUIsUUFBL0MsR0FBMEQxQixFQUFFLENBQUM7QUFDM0RnQixJQUFBQSxNQUFNLEVBQUUsS0FEbUQ7QUFFM0RULElBQUFBLEdBQUcsRUFBRTtBQUNIQyxNQUFBQSxHQUFHLEVBQUU7QUFERjtBQUZzRCxHQUFELENBQTVEO0FBT0E7Ozs7QUFHQVgsRUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsQ0FBcUNELFNBQXJDLENBQStDd0IsU0FBL0MsR0FBMkQzQixFQUFFLENBQUM7QUFDNURnQixJQUFBQSxNQUFNLEVBQUUsS0FEb0Q7QUFFNURDLElBQUFBLFFBQVEsRUFBRSxJQUZrRDtBQUc1RFYsSUFBQUEsR0FBRyxFQUFFO0FBQ0hDLE1BQUFBLEdBQUcsRUFBRTtBQURGO0FBSHVELEdBQUQsQ0FBN0Q7QUFPRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgIENvcHlyaWdodCAyMDIwIEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuICogICBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogICBvciBpbiB0aGUgXCJsaWNlbnNlXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWRcbiAqICAgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiAgIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nXG4gKiAgIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLWRlZmF1bHQtZXhwb3J0XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoQ2xpZW50OiBhbnksIGNvbmZpZzogYW55LCBjb21wb25lbnRzOiBhbnkpIHtcbiAgY29uc3QgY2EgPSBjb21wb25lbnRzLmNsaWVudEFjdGlvbi5mYWN0b3J5O1xuXG4gIGlmICghQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5KSB7XG4gICAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5ID0gY29tcG9uZW50cy5jbGllbnRBY3Rpb24ubmFtZXNwYWNlRmFjdG9yeSgpO1xuICB9XG5cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5yZXN0YXBpaW5mbyA9IGNhKHtcbiAgICB1cmw6IHtcbiAgICAgIGZtdDogJy9fb3BlbmRpc3Ryby9fc2VjdXJpdHkvYXBpL3Blcm1pc3Npb25zaW5mbycsXG4gICAgfSxcbiAgfSk7XG5cbiAgLyoqXG4gICAqIGxpc3QgYWxsIGZpZWxkIG1hcHBpbmdzIGZvciBhbGwgaW5kaWNlcy5cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUuaW5kaWNlcyA9IGNhKHtcbiAgICB1cmw6IHtcbiAgICAgIGZtdDogJy9fYWxsL19tYXBwaW5nL2ZpZWxkLyonLFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgU2VjdXJpdHkgcmVzb3VyY2UgY29uZmlndXJhdGlvbi5cbiAgICpcbiAgICogU2FtcGxlIHJlc3BvbnNlOlxuICAgKlxuICAgKiB7XG4gICAqICAgXCJ1c2VyXCI6IHtcbiAgICogICAgIFwiaGFzaFwiOiBcIiMxMjMxMjNcIlxuICAgKiAgIH1cbiAgICogfVxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5saXN0UmVzb3VyY2UgPSBjYSh7XG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2FwaS88JT1yZXNvdXJjZU5hbWUlPicsXG4gICAgICByZXE6IHtcbiAgICAgICAgcmVzb3VyY2VOYW1lOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgU2VjdXJpdHkgcmVzb3VyY2UgaW5zdGFuY2UuXG4gICAqXG4gICAqIEF0IHRoZSBtb21lbnQgU2VjdXJpdHkgZG9lcyBub3Qgc3VwcG9ydCBjb25mbGljdCBkZXRlY3Rpb24sXG4gICAqIHNvIHRoaXMgbWV0aG9kIGNhbiBiZSBlZmZlY3RpdmVseSB1c2VkIHRvIGJvdGggY3JlYXRlIGFuZCB1cGRhdGUgcmVzb3VyY2UuXG4gICAqXG4gICAqIFNhbXBsZSByZXNwb25zZTpcbiAgICpcbiAgICoge1xuICAgKiAgIFwic3RhdHVzXCI6IFwiQ1JFQVRFRFwiLFxuICAgKiAgIFwibWVzc2FnZVwiOiBcIlVzZXIgdXNlcm5hbWUgY3JlYXRlZFwiXG4gICAqIH1cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUuc2F2ZVJlc291cmNlID0gY2Eoe1xuICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgbmVlZEJvZHk6IHRydWUsXG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2FwaS88JT1yZXNvdXJjZU5hbWUlPi88JT1pZCU+JyxcbiAgICAgIHJlcToge1xuICAgICAgICByZXNvdXJjZU5hbWU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgaWQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgYSByZXNvdXJjZS5cbiAgICogUmVzb3VyY2UgaWRlbnRpZmljYXRpb24gaXMgZXhwZWN0ZWQgdG8gY29tcHV0ZWQgZnJvbSBoZWFkZXJzLiBFZzogYXV0aCBoZWFkZXJzLlxuICAgKlxuICAgKiBTYW1wbGUgcmVzcG9uc2U6XG4gICAqIHtcbiAgICogICBcInN0YXR1c1wiOiBcIk9LXCIsXG4gICAqICAgXCJtZXNzYWdlXCI6IFwiVXNlcm5hbWUgdXBkYXRlZC5cIlxuICAgKiB9XG4gICAqL1xuICBDbGllbnQucHJvdG90eXBlLm9wZW5kaXN0cm9fc2VjdXJpdHkucHJvdG90eXBlLnNhdmVSZXNvdXJjZVdpdGhvdXRJZCA9IGNhKHtcbiAgICBtZXRob2Q6ICdQVVQnLFxuICAgIG5lZWRCb2R5OiB0cnVlLFxuICAgIHVybDoge1xuICAgICAgZm10OiAnL19vcGVuZGlzdHJvL19zZWN1cml0eS9hcGkvPCU9cmVzb3VyY2VOYW1lJT4nLFxuICAgICAgcmVxOiB7XG4gICAgICAgIHJlc291cmNlTmFtZToge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIFNlY3VyaXR5IHJlc291cmNlIGluc3RhbmNlLlxuICAgKlxuICAgKiBTYW1wbGUgcmVzcG9uc2U6XG4gICAqXG4gICAqIHtcbiAgICogICBcInVzZXJcIjoge1xuICAgKiAgICAgXCJoYXNoXCI6ICcjMTIzMTIzJ1xuICAgKiAgIH1cbiAgICogfVxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5nZXRSZXNvdXJjZSA9IGNhKHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDoge1xuICAgICAgZm10OiAnL19vcGVuZGlzdHJvL19zZWN1cml0eS9hcGkvPCU9cmVzb3VyY2VOYW1lJT4vPCU9aWQlPicsXG4gICAgICByZXE6IHtcbiAgICAgICAgcmVzb3VyY2VOYW1lOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGlkOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgU2VjdXJpdHkgcmVzb3VyY2UgaW5zdGFuY2UuXG4gICAqL1xuICBDbGllbnQucHJvdG90eXBlLm9wZW5kaXN0cm9fc2VjdXJpdHkucHJvdG90eXBlLmRlbGV0ZVJlc291cmNlID0gY2Eoe1xuICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2FwaS88JT1yZXNvdXJjZU5hbWUlPi88JT1pZCU+JyxcbiAgICAgIHJlcToge1xuICAgICAgICByZXNvdXJjZU5hbWU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgaWQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgYSBTZWN1cml0eSByZXNvdXJjZSBpbnN0YW5jZS5cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUuY2xlYXJDYWNoZSA9IGNhKHtcbiAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgIHVybDoge1xuICAgICAgZm10OiAnL19vcGVuZGlzdHJvL19zZWN1cml0eS9hcGkvY2FjaGUnLFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBxdWVyeS5cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUudmFsaWRhdGVEbHMgPSBjYSh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgbmVlZEJvZHk6IHRydWUsXG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX3ZhbGlkYXRlL3F1ZXJ5P2V4cGxhaW49dHJ1ZScsXG4gICAgfSxcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEdldHMgaW5kZXggbWFwcGluZy5cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUuZ2V0SW5kZXhNYXBwaW5ncyA9IGNhKHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIG5lZWRCb2R5OiB0cnVlLFxuICAgIHVybDoge1xuICAgICAgZm10OiAnLzwlPWluZGV4JT4vX21hcHBpbmcnLFxuICAgICAgcmVxOiB7XG4gICAgICAgIGluZGV4OiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBHZXRzIGF1ZGl0IGxvZyBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5nZXRBdWRpdCA9IGNhKHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDoge1xuICAgICAgZm10OiAnL19vcGVuZGlzdHJvL19zZWN1cml0eS9hcGkvYXVkaXQnLFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGF1ZGl0IGxvZyBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5zYXZlQXVkaXQgPSBjYSh7XG4gICAgbWV0aG9kOiAnUFVUJyxcbiAgICBuZWVkQm9keTogdHJ1ZSxcbiAgICB1cmw6IHtcbiAgICAgIGZtdDogJy9fb3BlbmRpc3Ryby9fc2VjdXJpdHkvYXBpL2F1ZGl0L2NvbmZpZycsXG4gICAgfSxcbiAgfSk7XG59XG4iXX0=