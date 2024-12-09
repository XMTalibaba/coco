"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSecurityCookieOptions = getSecurityCookieOptions;
exports.clearOldVersionCookieValue = clearOldVersionCookieValue;

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
function getSecurityCookieOptions(config) {
  return {
    name: config.cookie.name,
    encryptionKey: config.cookie.password,
    validate: sessionStorage => {
      sessionStorage = sessionStorage;

      if (sessionStorage === undefined) {
        return {
          isValid: false,
          path: '/'
        };
      } // TODO: with setting redirect attributes to support OIDC and SAML,
      //       we need to do additonal cookie validatin in AuthenticationHandlers.
      // if SAML fields present


      if (sessionStorage.saml && sessionStorage.saml.requestId && sessionStorage.saml.nextUrl) {
        return {
          isValid: true,
          path: '/'
        };
      } // if OIDC fields present


      if (sessionStorage.oidc) {
        return {
          isValid: true,
          path: '/'
        };
      }

      if (sessionStorage.expiryTime === undefined || sessionStorage.expiryTime < Date.now()) {
        return {
          isValid: false,
          path: '/'
        };
      }

      return {
        isValid: true,
        path: '/'
      };
    },
    isSecure: config.cookie.secure,
    sameSite: config.cookie.isSameSite || undefined
  };
}

function clearOldVersionCookieValue(config) {
  if (config.cookie.secure) {
    return 'security_authentication=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/';
  } else {
    return 'security_authentication=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Path=/';
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlY3VyaXR5X2Nvb2tpZS50cyJdLCJuYW1lcyI6WyJnZXRTZWN1cml0eUNvb2tpZU9wdGlvbnMiLCJjb25maWciLCJuYW1lIiwiY29va2llIiwiZW5jcnlwdGlvbktleSIsInBhc3N3b3JkIiwidmFsaWRhdGUiLCJzZXNzaW9uU3RvcmFnZSIsInVuZGVmaW5lZCIsImlzVmFsaWQiLCJwYXRoIiwic2FtbCIsInJlcXVlc3RJZCIsIm5leHRVcmwiLCJvaWRjIiwiZXhwaXJ5VGltZSIsIkRhdGUiLCJub3ciLCJpc1NlY3VyZSIsInNlY3VyZSIsInNhbWVTaXRlIiwiaXNTYW1lU2l0ZSIsImNsZWFyT2xkVmVyc2lvbkNvb2tpZVZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7OztBQXlDTyxTQUFTQSx3QkFBVCxDQUNMQyxNQURLLEVBRStDO0FBQ3BELFNBQU87QUFDTEMsSUFBQUEsSUFBSSxFQUFFRCxNQUFNLENBQUNFLE1BQVAsQ0FBY0QsSUFEZjtBQUVMRSxJQUFBQSxhQUFhLEVBQUVILE1BQU0sQ0FBQ0UsTUFBUCxDQUFjRSxRQUZ4QjtBQUdMQyxJQUFBQSxRQUFRLEVBQUdDLGNBQUQsSUFBcUU7QUFDN0VBLE1BQUFBLGNBQWMsR0FBR0EsY0FBakI7O0FBQ0EsVUFBSUEsY0FBYyxLQUFLQyxTQUF2QixFQUFrQztBQUNoQyxlQUFPO0FBQUVDLFVBQUFBLE9BQU8sRUFBRSxLQUFYO0FBQWtCQyxVQUFBQSxJQUFJLEVBQUU7QUFBeEIsU0FBUDtBQUNELE9BSjRFLENBTTdFO0FBQ0E7QUFDQTs7O0FBQ0EsVUFBSUgsY0FBYyxDQUFDSSxJQUFmLElBQXVCSixjQUFjLENBQUNJLElBQWYsQ0FBb0JDLFNBQTNDLElBQXdETCxjQUFjLENBQUNJLElBQWYsQ0FBb0JFLE9BQWhGLEVBQXlGO0FBQ3ZGLGVBQU87QUFBRUosVUFBQUEsT0FBTyxFQUFFLElBQVg7QUFBaUJDLFVBQUFBLElBQUksRUFBRTtBQUF2QixTQUFQO0FBQ0QsT0FYNEUsQ0FhN0U7OztBQUNBLFVBQUlILGNBQWMsQ0FBQ08sSUFBbkIsRUFBeUI7QUFDdkIsZUFBTztBQUFFTCxVQUFBQSxPQUFPLEVBQUUsSUFBWDtBQUFpQkMsVUFBQUEsSUFBSSxFQUFFO0FBQXZCLFNBQVA7QUFDRDs7QUFFRCxVQUFJSCxjQUFjLENBQUNRLFVBQWYsS0FBOEJQLFNBQTlCLElBQTJDRCxjQUFjLENBQUNRLFVBQWYsR0FBNEJDLElBQUksQ0FBQ0MsR0FBTCxFQUEzRSxFQUF1RjtBQUNyRixlQUFPO0FBQUVSLFVBQUFBLE9BQU8sRUFBRSxLQUFYO0FBQWtCQyxVQUFBQSxJQUFJLEVBQUU7QUFBeEIsU0FBUDtBQUNEOztBQUNELGFBQU87QUFBRUQsUUFBQUEsT0FBTyxFQUFFLElBQVg7QUFBaUJDLFFBQUFBLElBQUksRUFBRTtBQUF2QixPQUFQO0FBQ0QsS0F6Qkk7QUEwQkxRLElBQUFBLFFBQVEsRUFBRWpCLE1BQU0sQ0FBQ0UsTUFBUCxDQUFjZ0IsTUExQm5CO0FBMkJMQyxJQUFBQSxRQUFRLEVBQUVuQixNQUFNLENBQUNFLE1BQVAsQ0FBY2tCLFVBQWQsSUFBNEJiO0FBM0JqQyxHQUFQO0FBNkJEOztBQUVNLFNBQVNjLDBCQUFULENBQW9DckIsTUFBcEMsRUFBOEU7QUFDbkYsTUFBSUEsTUFBTSxDQUFDRSxNQUFQLENBQWNnQixNQUFsQixFQUEwQjtBQUN4QixXQUFPLHNHQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyw4RkFBUDtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgU2Vzc2lvblN0b3JhZ2VDb29raWVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2VydmVyJztcbmltcG9ydCB7IFNlY3VyaXR5UGx1Z2luQ29uZmlnVHlwZSB9IGZyb20gJy4uJztcblxuZXhwb3J0IGludGVyZmFjZSBTZWN1cml0eVNlc3Npb25Db29raWUge1xuICAvLyBzZWN1cml0eV9hdXRoZW50aWNhdGlvblxuICB1c2VybmFtZT86IHN0cmluZztcbiAgY3JlZGVudGlhbHM/OiBhbnk7XG4gIGF1dGhUeXBlPzogc3RyaW5nO1xuICBhc3NpZ25BdXRoSGVhZGVyPzogYm9vbGVhbjtcbiAgaXNBbm9ueW1vdXNBdXRoPzogYm9vbGVhbjtcbiAgZXhwaXJ5VGltZT86IG51bWJlcjtcbiAgYWRkaXRpb25hbEF1dGhIZWFkZXJzPzogYW55O1xuXG4gIC8vIHNlY3VyaXR5X3N0b3JhZ2VcbiAgdGVuYW50PzogYW55O1xuXG4gIC8vIGZvciBvaWRjIGF1dGggd29ya2Zsb3dcbiAgb2lkYz86IGFueTtcblxuICAvLyBmb3IgU2FtbCBhdXRoIHdvcmtmbG93XG4gIHNhbWw/OiB7XG4gICAgcmVxdWVzdElkPzogc3RyaW5nO1xuICAgIG5leHRVcmw/OiBzdHJpbmc7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWN1cml0eUNvb2tpZU9wdGlvbnMoXG4gIGNvbmZpZzogU2VjdXJpdHlQbHVnaW5Db25maWdUeXBlXG4pOiBTZXNzaW9uU3RvcmFnZUNvb2tpZU9wdGlvbnM8U2VjdXJpdHlTZXNzaW9uQ29va2llPiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogY29uZmlnLmNvb2tpZS5uYW1lLFxuICAgIGVuY3J5cHRpb25LZXk6IGNvbmZpZy5jb29raWUucGFzc3dvcmQsXG4gICAgdmFsaWRhdGU6IChzZXNzaW9uU3RvcmFnZTogU2VjdXJpdHlTZXNzaW9uQ29va2llIHwgU2VjdXJpdHlTZXNzaW9uQ29va2llW10pID0+IHtcbiAgICAgIHNlc3Npb25TdG9yYWdlID0gc2Vzc2lvblN0b3JhZ2UgYXMgU2VjdXJpdHlTZXNzaW9uQ29va2llO1xuICAgICAgaWYgKHNlc3Npb25TdG9yYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIHBhdGg6ICcvJyB9O1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiB3aXRoIHNldHRpbmcgcmVkaXJlY3QgYXR0cmlidXRlcyB0byBzdXBwb3J0IE9JREMgYW5kIFNBTUwsXG4gICAgICAvLyAgICAgICB3ZSBuZWVkIHRvIGRvIGFkZGl0b25hbCBjb29raWUgdmFsaWRhdGluIGluIEF1dGhlbnRpY2F0aW9uSGFuZGxlcnMuXG4gICAgICAvLyBpZiBTQU1MIGZpZWxkcyBwcmVzZW50XG4gICAgICBpZiAoc2Vzc2lvblN0b3JhZ2Uuc2FtbCAmJiBzZXNzaW9uU3RvcmFnZS5zYW1sLnJlcXVlc3RJZCAmJiBzZXNzaW9uU3RvcmFnZS5zYW1sLm5leHRVcmwpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgcGF0aDogJy8nIH07XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIE9JREMgZmllbGRzIHByZXNlbnRcbiAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS5vaWRjKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIHBhdGg6ICcvJyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZXhwaXJ5VGltZSA9PT0gdW5kZWZpbmVkIHx8IHNlc3Npb25TdG9yYWdlLmV4cGlyeVRpbWUgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBwYXRoOiAnLycgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIHBhdGg6ICcvJyB9O1xuICAgIH0sXG4gICAgaXNTZWN1cmU6IGNvbmZpZy5jb29raWUuc2VjdXJlLFxuICAgIHNhbWVTaXRlOiBjb25maWcuY29va2llLmlzU2FtZVNpdGUgfHwgdW5kZWZpbmVkLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJPbGRWZXJzaW9uQ29va2llVmFsdWUoY29uZmlnOiBTZWN1cml0eVBsdWdpbkNvbmZpZ1R5cGUpOiBzdHJpbmcge1xuICBpZiAoY29uZmlnLmNvb2tpZS5zZWN1cmUpIHtcbiAgICByZXR1cm4gJ3NlY3VyaXR5X2F1dGhlbnRpY2F0aW9uPTsgTWF4LUFnZT0wOyBFeHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgR01UOyBTZWN1cmU7IEh0dHBPbmx5OyBQYXRoPS8nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnc2VjdXJpdHlfYXV0aGVudGljYXRpb249OyBNYXgtQWdlPTA7IEV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7IEh0dHBPbmx5OyBQYXRoPS8nO1xuICB9XG59XG4iXX0=