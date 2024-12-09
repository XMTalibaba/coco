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
  /**
   * Gets auth info.
   */


  Client.prototype.opendistro_security.prototype.authinfo = ca({
    url: {
      fmt: '/_opendistro/_security/authinfo'
    }
  });
  /**
   * Gets tenant info and kibana server info.
   *
   * e.g.
   * {
   *   "user_name": "admin",
   *   "not_fail_on_forbidden_enabled": false,
   *   "kibana_mt_enabled": true,
   *   "kibana_index": ".kibana",
   *   "kibana_server_user": "kibanaserver"
   * }
   */

  Client.prototype.opendistro_security.prototype.multitenancyinfo = ca({
    url: {
      fmt: '/_opendistro/_security/kibanainfo'
    }
  });
  /**
   * Gets tenant info. The output looks like:
   * {
   *   ".kibana_92668751_admin":"__private__"
   * }
   */

  Client.prototype.opendistro_security.prototype.tenantinfo = ca({
    url: {
      fmt: '/_opendistro/_security/tenantinfo'
    }
  });
  /**
   * Gets SAML token.
   */

  Client.prototype.opendistro_security.prototype.authtoken = ca({
    method: 'POST',
    needBody: true,
    url: {
      fmt: '/_opendistro/_security/api/authtoken'
    }
  });
}

module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wZW5kaXN0cm9fc2VjdXJpdHlfcGx1Z2luLnRzIl0sIm5hbWVzIjpbIkNsaWVudCIsImNvbmZpZyIsImNvbXBvbmVudHMiLCJjYSIsImNsaWVudEFjdGlvbiIsImZhY3RvcnkiLCJwcm90b3R5cGUiLCJvcGVuZGlzdHJvX3NlY3VyaXR5IiwibmFtZXNwYWNlRmFjdG9yeSIsImF1dGhpbmZvIiwidXJsIiwiZm10IiwibXVsdGl0ZW5hbmN5aW5mbyIsInRlbmFudGluZm8iLCJhdXRodG9rZW4iLCJtZXRob2QiLCJuZWVkQm9keSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7OztBQWVBO0FBQ2Usa0JBQVVBLE1BQVYsRUFBdUJDLE1BQXZCLEVBQW9DQyxVQUFwQyxFQUFxRDtBQUNsRSxRQUFNQyxFQUFFLEdBQUdELFVBQVUsQ0FBQ0UsWUFBWCxDQUF3QkMsT0FBbkM7O0FBRUEsTUFBSSxDQUFDTCxNQUFNLENBQUNNLFNBQVAsQ0FBaUJDLG1CQUF0QixFQUEyQztBQUN6Q1AsSUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsR0FBdUNMLFVBQVUsQ0FBQ0UsWUFBWCxDQUF3QkksZ0JBQXhCLEVBQXZDO0FBQ0Q7QUFFRDs7Ozs7QUFHQVIsRUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsQ0FBcUNELFNBQXJDLENBQStDRyxRQUEvQyxHQUEwRE4sRUFBRSxDQUFDO0FBQzNETyxJQUFBQSxHQUFHLEVBQUU7QUFDSEMsTUFBQUEsR0FBRyxFQUFFO0FBREY7QUFEc0QsR0FBRCxDQUE1RDtBQU1BOzs7Ozs7Ozs7Ozs7O0FBWUFYLEVBQUFBLE1BQU0sQ0FBQ00sU0FBUCxDQUFpQkMsbUJBQWpCLENBQXFDRCxTQUFyQyxDQUErQ00sZ0JBQS9DLEdBQWtFVCxFQUFFLENBQUM7QUFDbkVPLElBQUFBLEdBQUcsRUFBRTtBQUNIQyxNQUFBQSxHQUFHLEVBQUU7QUFERjtBQUQ4RCxHQUFELENBQXBFO0FBTUE7Ozs7Ozs7QUFNQVgsRUFBQUEsTUFBTSxDQUFDTSxTQUFQLENBQWlCQyxtQkFBakIsQ0FBcUNELFNBQXJDLENBQStDTyxVQUEvQyxHQUE0RFYsRUFBRSxDQUFDO0FBQzdETyxJQUFBQSxHQUFHLEVBQUU7QUFDSEMsTUFBQUEsR0FBRyxFQUFFO0FBREY7QUFEd0QsR0FBRCxDQUE5RDtBQU1BOzs7O0FBR0FYLEVBQUFBLE1BQU0sQ0FBQ00sU0FBUCxDQUFpQkMsbUJBQWpCLENBQXFDRCxTQUFyQyxDQUErQ1EsU0FBL0MsR0FBMkRYLEVBQUUsQ0FBQztBQUM1RFksSUFBQUEsTUFBTSxFQUFFLE1BRG9EO0FBRTVEQyxJQUFBQSxRQUFRLEVBQUUsSUFGa0Q7QUFHNUROLElBQUFBLEdBQUcsRUFBRTtBQUNIQyxNQUFBQSxHQUFHLEVBQUU7QUFERjtBQUh1RCxHQUFELENBQTdEO0FBT0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1kZWZhdWx0LWV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKENsaWVudDogYW55LCBjb25maWc6IGFueSwgY29tcG9uZW50czogYW55KSB7XG4gIGNvbnN0IGNhID0gY29tcG9uZW50cy5jbGllbnRBY3Rpb24uZmFjdG9yeTtcblxuICBpZiAoIUNsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eSkge1xuICAgIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eSA9IGNvbXBvbmVudHMuY2xpZW50QWN0aW9uLm5hbWVzcGFjZUZhY3RvcnkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGF1dGggaW5mby5cbiAgICovXG4gIENsaWVudC5wcm90b3R5cGUub3BlbmRpc3Ryb19zZWN1cml0eS5wcm90b3R5cGUuYXV0aGluZm8gPSBjYSh7XG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2F1dGhpbmZvJyxcbiAgICB9LFxuICB9KTtcblxuICAvKipcbiAgICogR2V0cyB0ZW5hbnQgaW5mbyBhbmQga2liYW5hIHNlcnZlciBpbmZvLlxuICAgKlxuICAgKiBlLmcuXG4gICAqIHtcbiAgICogICBcInVzZXJfbmFtZVwiOiBcImFkbWluXCIsXG4gICAqICAgXCJub3RfZmFpbF9vbl9mb3JiaWRkZW5fZW5hYmxlZFwiOiBmYWxzZSxcbiAgICogICBcImtpYmFuYV9tdF9lbmFibGVkXCI6IHRydWUsXG4gICAqICAgXCJraWJhbmFfaW5kZXhcIjogXCIua2liYW5hXCIsXG4gICAqICAgXCJraWJhbmFfc2VydmVyX3VzZXJcIjogXCJraWJhbmFzZXJ2ZXJcIlxuICAgKiB9XG4gICAqL1xuICBDbGllbnQucHJvdG90eXBlLm9wZW5kaXN0cm9fc2VjdXJpdHkucHJvdG90eXBlLm11bHRpdGVuYW5jeWluZm8gPSBjYSh7XG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2tpYmFuYWluZm8nLFxuICAgIH0sXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRlbmFudCBpbmZvLiBUaGUgb3V0cHV0IGxvb2tzIGxpa2U6XG4gICAqIHtcbiAgICogICBcIi5raWJhbmFfOTI2Njg3NTFfYWRtaW5cIjpcIl9fcHJpdmF0ZV9fXCJcbiAgICogfVxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS50ZW5hbnRpbmZvID0gY2Eoe1xuICAgIHVybDoge1xuICAgICAgZm10OiAnL19vcGVuZGlzdHJvL19zZWN1cml0eS90ZW5hbnRpbmZvJyxcbiAgICB9LFxuICB9KTtcblxuICAvKipcbiAgICogR2V0cyBTQU1MIHRva2VuLlxuICAgKi9cbiAgQ2xpZW50LnByb3RvdHlwZS5vcGVuZGlzdHJvX3NlY3VyaXR5LnByb3RvdHlwZS5hdXRodG9rZW4gPSBjYSh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgbmVlZEJvZHk6IHRydWUsXG4gICAgdXJsOiB7XG4gICAgICBmbXQ6ICcvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2FwaS9hdXRodG9rZW4nLFxuICAgIH0sXG4gIH0pO1xufVxuIl19