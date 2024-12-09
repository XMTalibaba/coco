"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineAuthTypeRoutes = defineAuthTypeRoutes;

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
function defineAuthTypeRoutes(router, config) {
  /**
   * Auth type API that returns current auth type configured on Kibana Server.
   *
   * GET /api/authtype
   * Response:
   *  200 OK
   *  {
   *    authtype: saml
   *  }
   */
  router.get({
    path: '/api/authtype',
    validate: false,
    options: {
      authRequired: false
    }
  }, async (context, request, response) => {
    const authType = config.auth.type || 'basicauth';
    return response.ok({
      body: {
        authtype: authType
      }
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1dGhfdHlwZV9yb3V0ZXMudHMiXSwibmFtZXMiOlsiZGVmaW5lQXV0aFR5cGVSb3V0ZXMiLCJyb3V0ZXIiLCJjb25maWciLCJnZXQiLCJwYXRoIiwidmFsaWRhdGUiLCJvcHRpb25zIiwiYXV0aFJlcXVpcmVkIiwiY29udGV4dCIsInJlcXVlc3QiLCJyZXNwb25zZSIsImF1dGhUeXBlIiwiYXV0aCIsInR5cGUiLCJvayIsImJvZHkiLCJhdXRodHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7OztBQWtCTyxTQUFTQSxvQkFBVCxDQUE4QkMsTUFBOUIsRUFBK0NDLE1BQS9DLEVBQWlGO0FBQ3RGOzs7Ozs7Ozs7O0FBVUFELEVBQUFBLE1BQU0sQ0FBQ0UsR0FBUCxDQUNFO0FBQUVDLElBQUFBLElBQUksRUFBRSxlQUFSO0FBQXlCQyxJQUFBQSxRQUFRLEVBQUUsS0FBbkM7QUFBMENDLElBQUFBLE9BQU8sRUFBRTtBQUFFQyxNQUFBQSxZQUFZLEVBQUU7QUFBaEI7QUFBbkQsR0FERixFQUVFLE9BQU9DLE9BQVAsRUFBZ0JDLE9BQWhCLEVBQXlCQyxRQUF6QixLQUFzQztBQUNwQyxVQUFNQyxRQUFRLEdBQUdULE1BQU0sQ0FBQ1UsSUFBUCxDQUFZQyxJQUFaLElBQW9CLFdBQXJDO0FBQ0EsV0FBT0gsUUFBUSxDQUFDSSxFQUFULENBQVk7QUFDakJDLE1BQUFBLElBQUksRUFBRTtBQUNKQyxRQUFBQSxRQUFRLEVBQUVMO0FBRE47QUFEVyxLQUFaLENBQVA7QUFLRCxHQVRIO0FBV0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgSVJvdXRlciB9IGZyb20gJ2tpYmFuYS9zZXJ2ZXInO1xuaW1wb3J0IHsgU2VjdXJpdHlQbHVnaW5Db25maWdUeXBlIH0gZnJvbSAnLi4nO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lQXV0aFR5cGVSb3V0ZXMocm91dGVyOiBJUm91dGVyLCBjb25maWc6IFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZSkge1xuICAvKipcbiAgICogQXV0aCB0eXBlIEFQSSB0aGF0IHJldHVybnMgY3VycmVudCBhdXRoIHR5cGUgY29uZmlndXJlZCBvbiBLaWJhbmEgU2VydmVyLlxuICAgKlxuICAgKiBHRVQgL2FwaS9hdXRodHlwZVxuICAgKiBSZXNwb25zZTpcbiAgICogIDIwMCBPS1xuICAgKiAge1xuICAgKiAgICBhdXRodHlwZTogc2FtbFxuICAgKiAgfVxuICAgKi9cbiAgcm91dGVyLmdldChcbiAgICB7IHBhdGg6ICcvYXBpL2F1dGh0eXBlJywgdmFsaWRhdGU6IGZhbHNlLCBvcHRpb25zOiB7IGF1dGhSZXF1aXJlZDogZmFsc2UgfSB9LFxuICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgYXV0aFR5cGUgPSBjb25maWcuYXV0aC50eXBlIHx8ICdiYXNpY2F1dGgnO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIGF1dGh0eXBlOiBhdXRoVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn1cbiJdfQ==