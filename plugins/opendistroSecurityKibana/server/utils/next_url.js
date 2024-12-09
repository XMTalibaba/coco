"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeNextUrlQeuryParam = composeNextUrlQeuryParam;
exports.validateNextUrl = exports.INVALID_NEXT_URL_PARAMETER_MESSAGE = void 0;

var _lodash = require("lodash");

var _url = require("url");

var _querystring = require("querystring");

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
function composeNextUrlQeuryParam(request, basePath) {
  const url = (0, _lodash.cloneDeep)(request.url);
  url.pathname = `${basePath}${url.pathname}`;
  const nextUrl = (0, _url.format)(url);
  return (0, _querystring.stringify)({
    nextUrl
  });
}

const INVALID_NEXT_URL_PARAMETER_MESSAGE = 'Invalid nextUrl parameter.';
/**
 * We require the nextUrl parameter to be an relative url.
 *
 * Here we leverage the normalizeUrl function. If the library can parse the url
 * parameter, which means it is an absolute url, then we reject it. Otherwise, the
 * library cannot parse the url, which means it is not an absolute url, we let to
 * go through.
 * Note: url has been decoded by Kibana.
 *
 * @param url url string.
 * @returns error message if nextUrl is invalid, otherwise void.
 */

exports.INVALID_NEXT_URL_PARAMETER_MESSAGE = INVALID_NEXT_URL_PARAMETER_MESSAGE;

const validateNextUrl = url => {
  if (url) {
    const path = url.split('?')[0];

    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || path.includes('@')) {
      return INVALID_NEXT_URL_PARAMETER_MESSAGE;
    }
  }
};

exports.validateNextUrl = validateNextUrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5leHRfdXJsLnRzIl0sIm5hbWVzIjpbImNvbXBvc2VOZXh0VXJsUWV1cnlQYXJhbSIsInJlcXVlc3QiLCJiYXNlUGF0aCIsInVybCIsInBhdGhuYW1lIiwibmV4dFVybCIsIklOVkFMSURfTkVYVF9VUkxfUEFSQU1FVEVSX01FU1NBR0UiLCJ2YWxpZGF0ZU5leHRVcmwiLCJwYXRoIiwic3BsaXQiLCJzdGFydHNXaXRoIiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBZUE7O0FBQ0E7O0FBQ0E7O0FBakJBOzs7Ozs7Ozs7Ozs7OztBQW9CTyxTQUFTQSx3QkFBVCxDQUFrQ0MsT0FBbEMsRUFBMERDLFFBQTFELEVBQW9GO0FBQ3pGLFFBQU1DLEdBQUcsR0FBRyx1QkFBVUYsT0FBTyxDQUFDRSxHQUFsQixDQUFaO0FBQ0FBLEVBQUFBLEdBQUcsQ0FBQ0MsUUFBSixHQUFnQixHQUFFRixRQUFTLEdBQUVDLEdBQUcsQ0FBQ0MsUUFBUyxFQUExQztBQUNBLFFBQU1DLE9BQU8sR0FBRyxpQkFBT0YsR0FBUCxDQUFoQjtBQUNBLFNBQU8sNEJBQVU7QUFBRUUsSUFBQUE7QUFBRixHQUFWLENBQVA7QUFDRDs7QUFFTSxNQUFNQyxrQ0FBa0MsR0FBRyw0QkFBM0M7QUFFUDs7Ozs7Ozs7Ozs7Ozs7O0FBWU8sTUFBTUMsZUFBZSxHQUFJSixHQUFELElBQTRDO0FBQ3pFLE1BQUlBLEdBQUosRUFBUztBQUNQLFVBQU1LLElBQUksR0FBR0wsR0FBRyxDQUFDTSxLQUFKLENBQVUsR0FBVixFQUFlLENBQWYsQ0FBYjs7QUFDQSxRQUNFLENBQUNELElBQUksQ0FBQ0UsVUFBTCxDQUFnQixHQUFoQixDQUFELElBQ0FGLElBQUksQ0FBQ0UsVUFBTCxDQUFnQixJQUFoQixDQURBLElBRUFGLElBQUksQ0FBQ0csUUFBTCxDQUFjLElBQWQsQ0FGQSxJQUdBSCxJQUFJLENBQUNHLFFBQUwsQ0FBYyxHQUFkLENBSkYsRUFLRTtBQUNBLGFBQU9MLGtDQUFQO0FBQ0Q7QUFDRjtBQUNGLENBWk0iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogICBDb3B5cmlnaHQgMjAyMCBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKS5cbiAqICAgWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogICBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICAgb3IgaW4gdGhlIFwibGljZW5zZVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkXG4gKiAgIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogICBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICogICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICdxdWVyeXN0cmluZyc7XG5pbXBvcnQgeyBLaWJhbmFSZXF1ZXN0IH0gZnJvbSAna2liYW5hL3NlcnZlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlTmV4dFVybFFldXJ5UGFyYW0ocmVxdWVzdDogS2liYW5hUmVxdWVzdCwgYmFzZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHVybCA9IGNsb25lRGVlcChyZXF1ZXN0LnVybCk7XG4gIHVybC5wYXRobmFtZSA9IGAke2Jhc2VQYXRofSR7dXJsLnBhdGhuYW1lfWA7XG4gIGNvbnN0IG5leHRVcmwgPSBmb3JtYXQodXJsKTtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7IG5leHRVcmwgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBJTlZBTElEX05FWFRfVVJMX1BBUkFNRVRFUl9NRVNTQUdFID0gJ0ludmFsaWQgbmV4dFVybCBwYXJhbWV0ZXIuJztcblxuLyoqXG4gKiBXZSByZXF1aXJlIHRoZSBuZXh0VXJsIHBhcmFtZXRlciB0byBiZSBhbiByZWxhdGl2ZSB1cmwuXG4gKlxuICogSGVyZSB3ZSBsZXZlcmFnZSB0aGUgbm9ybWFsaXplVXJsIGZ1bmN0aW9uLiBJZiB0aGUgbGlicmFyeSBjYW4gcGFyc2UgdGhlIHVybFxuICogcGFyYW1ldGVyLCB3aGljaCBtZWFucyBpdCBpcyBhbiBhYnNvbHV0ZSB1cmwsIHRoZW4gd2UgcmVqZWN0IGl0LiBPdGhlcndpc2UsIHRoZVxuICogbGlicmFyeSBjYW5ub3QgcGFyc2UgdGhlIHVybCwgd2hpY2ggbWVhbnMgaXQgaXMgbm90IGFuIGFic29sdXRlIHVybCwgd2UgbGV0IHRvXG4gKiBnbyB0aHJvdWdoLlxuICogTm90ZTogdXJsIGhhcyBiZWVuIGRlY29kZWQgYnkgS2liYW5hLlxuICpcbiAqIEBwYXJhbSB1cmwgdXJsIHN0cmluZy5cbiAqIEByZXR1cm5zIGVycm9yIG1lc3NhZ2UgaWYgbmV4dFVybCBpcyBpbnZhbGlkLCBvdGhlcndpc2Ugdm9pZC5cbiAqL1xuZXhwb3J0IGNvbnN0IHZhbGlkYXRlTmV4dFVybCA9ICh1cmw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB8IHZvaWQgPT4ge1xuICBpZiAodXJsKSB7XG4gICAgY29uc3QgcGF0aCA9IHVybC5zcGxpdCgnPycpWzBdO1xuICAgIGlmIChcbiAgICAgICFwYXRoLnN0YXJ0c1dpdGgoJy8nKSB8fFxuICAgICAgcGF0aC5zdGFydHNXaXRoKCcvLycpIHx8XG4gICAgICBwYXRoLmluY2x1ZGVzKCdcXFxcJykgfHxcbiAgICAgIHBhdGguaW5jbHVkZXMoJ0AnKVxuICAgICkge1xuICAgICAgcmV0dXJuIElOVkFMSURfTkVYVF9VUkxfUEFSQU1FVEVSX01FU1NBR0U7XG4gICAgfVxuICB9XG59O1xuIl19