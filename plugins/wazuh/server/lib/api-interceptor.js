"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestAsCurrentUser = exports.requestAsInternalUser = exports.authenticate = void 0;

var _axios2 = _interopRequireDefault(require("axios"));

var _manageHosts = require("./manage-hosts");

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Wazuh app - Interceptor API entries
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
const httpsAgent = new _https.default.Agent({
  rejectUnauthorized: false
});

const _axios = _axios2.default.create({
  httpsAgent
});

const manageHosts = new _manageHosts.ManageHosts(); // Cache to save the token for the internal user by API host ID

const CacheInternalUserAPIHostToken = new Map();

// 存储 login-ip 和 user-name
let _headers = {};

const authenticate = async (apiHostID, headers, authContext) => {
  if (headers && headers['login-ip']) _headers = headers;
  try {
    const api = await manageHosts.getHostById(apiHostID);
    const optionsRequest = {
      method: !!authContext ? 'POST' : 'GET',
      headers: {
        'content-type': 'application/json',
        ...(headers ? headers : _headers ? _headers : {})
      },
      auth: {
        username: api.username,
        password: api.password
      },
      url: `${api.url}:${api.port}/security/user/authenticate${!!authContext ? '/run_as' : ''}`,
      ...(!!authContext ? {
        data: authContext
      } : {})
    };
    const response = await _axios(optionsRequest);
    const token = (((response || {}).data || {}).data || {}).token;

    if (!authContext) {
      CacheInternalUserAPIHostToken.set(apiHostID, token);
    }

    ;
    return token;
  } catch (error) {
    throw error;
  }
};

exports.authenticate = authenticate;

const buildRequestOptions = async (method, path, data, {
  apiHostID,
  forceRefresh,
  token
}) => {
  const api = await manageHosts.getHostById(apiHostID);
  const {
    body,
    params,
    headers,
    ...rest
  } = data;
  if (headers && headers['login-ip']) _headers = headers;
  return {
    method: method,
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(headers ? headers : _headers ? _headers : {})
    },
    data: body || rest || {},
    params: params || {},
    url: `${api.url}:${api.port}${path}`
  };
};

const requestAsInternalUser = async (method, path, data, options) => {
  const { headers } = data;
  if (headers && headers['login-ip']) _headers = headers;

  try {
    const token = CacheInternalUserAPIHostToken.has(options.apiHostID) && !options.forceRefresh ? CacheInternalUserAPIHostToken.get(options.apiHostID) : await authenticate(options.apiHostID, _headers);
    return await request(method, path, data, { ...options,
      token
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const token = await authenticate(options.apiHostID, _headers);
        return await request(method, path, data, { ...options,
          token
        });
      } catch (error) {
        throw error;
      }
    }

    throw error;
  }
};

exports.requestAsInternalUser = requestAsInternalUser;

const requestAsCurrentUser = async (method, path, data, options) => {
  return await request(method, path, data, options);
};

exports.requestAsCurrentUser = requestAsCurrentUser;

const request = async (method, path, data, options) => {
  try {
    const optionsRequest = await buildRequestOptions(method, path, data, options);
    const response = await _axios(optionsRequest);
    return response;
  } catch (error) {
    throw error;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwaS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6WyJodHRwc0FnZW50IiwiaHR0cHMiLCJBZ2VudCIsInJlamVjdFVuYXV0aG9yaXplZCIsIl9heGlvcyIsImF4aW9zIiwiY3JlYXRlIiwibWFuYWdlSG9zdHMiLCJNYW5hZ2VIb3N0cyIsIkNhY2hlSW50ZXJuYWxVc2VyQVBJSG9zdFRva2VuIiwiTWFwIiwiYXV0aGVudGljYXRlIiwiYXBpSG9zdElEIiwiYXV0aENvbnRleHQiLCJhcGkiLCJnZXRIb3N0QnlJZCIsIm9wdGlvbnNSZXF1ZXN0IiwibWV0aG9kIiwiaGVhZGVycyIsImF1dGgiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwidXJsIiwicG9ydCIsImRhdGEiLCJyZXNwb25zZSIsInRva2VuIiwic2V0IiwiZXJyb3IiLCJidWlsZFJlcXVlc3RPcHRpb25zIiwicGF0aCIsImZvcmNlUmVmcmVzaCIsImJvZHkiLCJwYXJhbXMiLCJyZXN0IiwiQXV0aG9yaXphdGlvbiIsInJlcXVlc3RBc0ludGVybmFsVXNlciIsIm9wdGlvbnMiLCJoYXMiLCJnZXQiLCJyZXF1ZXN0Iiwic3RhdHVzIiwicmVxdWVzdEFzQ3VycmVudFVzZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFZQTs7QUFDQTs7QUFDQTs7OztBQWRBOzs7Ozs7Ozs7OztBQWdCQSxNQUFNQSxVQUFVLEdBQUcsSUFBSUMsZUFBTUMsS0FBVixDQUFnQjtBQUNqQ0MsRUFBQUEsa0JBQWtCLEVBQUU7QUFEYSxDQUFoQixDQUFuQjs7QUFJQSxNQUFNQyxNQUFNLEdBQUdDLGdCQUFNQyxNQUFOLENBQWE7QUFBRU4sRUFBQUE7QUFBRixDQUFiLENBQWY7O0FBb0JBLE1BQU1PLFdBQVcsR0FBRyxJQUFJQyx3QkFBSixFQUFwQixDLENBRUE7O0FBQ0EsTUFBTUMsNkJBQTZCLEdBQUcsSUFBSUMsR0FBSixFQUF0Qzs7QUFFTyxNQUFNQyxZQUFZLEdBQUcsT0FBT0MsU0FBUCxFQUEwQkMsV0FBMUIsS0FBaUU7QUFD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QUNELEdBSkQsQ0FJQyxPQUFNRyxLQUFOLEVBQVk7QUFDWCxVQUFNQSxLQUFOO0FBQ0Q7QUFDRixDQVJEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIEludGVyY2VwdG9yIEFQSSBlbnRyaWVzXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMiBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogRmluZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgb24gdGhlIExJQ0VOU0UgZmlsZS5cbiAqL1xuXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IE1hbmFnZUhvc3RzIH0gZnJvbSAnLi9tYW5hZ2UtaG9zdHMnO1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcblxuY29uc3QgaHR0cHNBZ2VudCA9IG5ldyBodHRwcy5BZ2VudCh7XG4gIHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UsICBcbn0pO1xuXG5jb25zdCBfYXhpb3MgPSBheGlvcy5jcmVhdGUoeyBodHRwc0FnZW50IH0pO1xuXG5pbnRlcmZhY2UgQVBJSG9zdHtcbiAgdXJsOiBzdHJpbmdcbiAgcG9ydDogc3RyaW5nXG4gIHVzZXJuYW1lOiBzdHJpbmdcbiAgcGFzc3dvcmQ6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFQSUludGVyY2VwdG9yUmVxdWVzdE9wdGlvbnN7XG4gIGFwaUhvc3RJRDogc3RyaW5nXG4gIHRva2VuOiBzdHJpbmdcbiAgZm9yY2VSZWZyZXNoPzogYm9vbGVhblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFQSUludGVyY2VwdG9yUmVxdWVzdE9wdGlvbnNJbnRlcm5hbFVzZXJ7XG4gIGFwaUhvc3RJRDogc3RyaW5nXG4gIGZvcmNlUmVmcmVzaD86IGJvb2xlYW5cbn1cblxuY29uc3QgbWFuYWdlSG9zdHMgPSBuZXcgTWFuYWdlSG9zdHMoKTtcblxuLy8gQ2FjaGUgdG8gc2F2ZSB0aGUgdG9rZW4gZm9yIHRoZSBpbnRlcm5hbCB1c2VyIGJ5IEFQSSBob3N0IElEXG5jb25zdCBDYWNoZUludGVybmFsVXNlckFQSUhvc3RUb2tlbiA9IG5ldyBNYXA8c3RyaW5nLHN0cmluZz4oKTtcblxuZXhwb3J0IGNvbnN0IGF1dGhlbnRpY2F0ZSA9IGFzeW5jIChhcGlIb3N0SUQ6IHN0cmluZywgYXV0aENvbnRleHQ/OiBhbnkpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICB0cnl7XG4gICAgY29uc3QgYXBpOiBBUElIb3N0ID0gYXdhaXQgbWFuYWdlSG9zdHMuZ2V0SG9zdEJ5SWQoYXBpSG9zdElEKTtcbiAgICBjb25zdCBvcHRpb25zUmVxdWVzdCA9IHtcbiAgICAgIG1ldGhvZDogISFhdXRoQ29udGV4dCA/ICdQT1NUJyA6ICdHRVQnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICAgIGF1dGg6IHtcbiAgICAgICAgdXNlcm5hbWU6IGFwaS51c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IGFwaS5wYXNzd29yZCxcbiAgICAgIH0sXG4gICAgICB1cmw6IGAke2FwaS51cmx9OiR7YXBpLnBvcnR9L3NlY3VyaXR5L3VzZXIvYXV0aGVudGljYXRlJHshIWF1dGhDb250ZXh0ID8gJy9ydW5fYXMnIDogJyd9YCxcbiAgICAgIC4uLighIWF1dGhDb250ZXh0ID8geyBkYXRhOiBhdXRoQ29udGV4dCB9IDoge30pXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgX2F4aW9zKG9wdGlvbnNSZXF1ZXN0KTtcbiAgICBjb25zdCB0b2tlbjogc3RyaW5nID0gKCgocmVzcG9uc2UgfHwge30pLmRhdGEgfHwge30pLmRhdGEgfHwge30pLnRva2VuO1xuICAgIGlmICghYXV0aENvbnRleHQpIHtcbiAgICAgIENhY2hlSW50ZXJuYWxVc2VyQVBJSG9zdFRva2VuLnNldChhcGlIb3N0SUQsIHRva2VuKTtcbiAgICB9O1xuICAgIHJldHVybiB0b2tlbjtcbiAgfWNhdGNoKGVycm9yKXtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuY29uc3QgYnVpbGRSZXF1ZXN0T3B0aW9ucyA9IGFzeW5jIChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBkYXRhOiBhbnksIHsgYXBpSG9zdElELCBmb3JjZVJlZnJlc2gsIHRva2VuIH06IEFQSUludGVyY2VwdG9yUmVxdWVzdE9wdGlvbnMpID0+IHtcbiAgY29uc3QgYXBpID0gYXdhaXQgbWFuYWdlSG9zdHMuZ2V0SG9zdEJ5SWQoYXBpSG9zdElEKTtcbiAgY29uc3QgeyBib2R5LCBwYXJhbXMsIGhlYWRlcnMsIC4uLnJlc3QgfSA9IGRhdGE7XG4gIHJldHVybiB7XG4gICAgbWV0aG9kOiBtZXRob2QsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxuICAgICAgLi4uKGhlYWRlcnMgPyBoZWFkZXJzIDoge30pXG4gICAgfSxcbiAgICBkYXRhOiBib2R5IHx8IHJlc3QgfHwge30sXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwge30sXG4gICAgdXJsOiBgJHthcGkudXJsfToke2FwaS5wb3J0fSR7cGF0aH1gLFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCByZXF1ZXN0QXNJbnRlcm5hbFVzZXIgPSBhc3luYyAobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZGF0YTogYW55LCBvcHRpb25zOiBBUElJbnRlcmNlcHRvclJlcXVlc3RPcHRpb25zSW50ZXJuYWxVc2VyKSA9PiB7XG4gIHRyeXtcbiAgICBjb25zdCB0b2tlbiA9IENhY2hlSW50ZXJuYWxVc2VyQVBJSG9zdFRva2VuLmhhcyhvcHRpb25zLmFwaUhvc3RJRCkgJiYgIW9wdGlvbnMuZm9yY2VSZWZyZXNoXG4gICAgICA/IENhY2hlSW50ZXJuYWxVc2VyQVBJSG9zdFRva2VuLmdldChvcHRpb25zLmFwaUhvc3RJRClcbiAgICAgIDogYXdhaXQgYXV0aGVudGljYXRlKG9wdGlvbnMuYXBpSG9zdElEKTtcbiAgICByZXR1cm4gYXdhaXQgcmVxdWVzdChtZXRob2QsIHBhdGgsIGRhdGEsIHsuLi5vcHRpb25zLCB0b2tlbn0pO1xuICB9Y2F0Y2goZXJyb3Ipe1xuICAgIGlmIChlcnJvci5yZXNwb25zZSAmJiBlcnJvci5yZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgdHJ5e1xuICAgICAgICBjb25zdCB0b2tlbjogc3RyaW5nID0gYXdhaXQgYXV0aGVudGljYXRlKG9wdGlvbnMuYXBpSG9zdElEKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlcXVlc3QobWV0aG9kLCBwYXRoLCBkYXRhLCB7Li4ub3B0aW9ucywgdG9rZW59KTtcbiAgICAgIH1jYXRjaChlcnJvcil7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlcXVlc3RBc0N1cnJlbnRVc2VyID0gYXN5bmMgKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSwgb3B0aW9uczogQVBJSW50ZXJjZXB0b3JSZXF1ZXN0T3B0aW9ucykgPT4ge1xuICByZXR1cm4gYXdhaXQgcmVxdWVzdChtZXRob2QsIHBhdGgsIGRhdGEsIG9wdGlvbnMpXG59O1xuXG5jb25zdCByZXF1ZXN0ID0gYXN5bmMgKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSwgb3B0aW9uczogYW55KTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPiA9PiB7XG4gIHRyeXtcbiAgICBjb25zdCBvcHRpb25zUmVxdWVzdCA9IGF3YWl0IGJ1aWxkUmVxdWVzdE9wdGlvbnMobWV0aG9kLCBwYXRoLCBkYXRhLCBvcHRpb25zKTtcbiAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IF9heGlvcyhvcHRpb25zUmVxdWVzdCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9Y2F0Y2goZXJyb3Ipe1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19