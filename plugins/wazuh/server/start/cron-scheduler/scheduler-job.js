"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SchedulerJob = void 0;

var _predefinedJobs = require("./predefined-jobs");

var _wazuhHosts = require("../../controllers/wazuh-hosts");

var _index = require("./index");

var _errorHandler = require("./error-handler");

var _configuredJobs = require("./configured-jobs");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const wazuhHostsController = new _wazuhHosts.WazuhHostsCtrl();
const fakeResponseEndpoint = {
  ok: body => body,
  custom: body => body
};

class SchedulerJob {
  constructor(jobName, context) {
    _defineProperty(this, "jobName", void 0);

    _defineProperty(this, "saveDocument", void 0);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "apiClient", void 0);

    this.jobName = jobName;
    this.context = context;
    this.logger = context.wazuh.logger;
    this.apiClient = context.wazuh.api.client.asInternalUser;
    this.saveDocument = new _index.SaveDocument(context);
  }

  async run() {
    const {
      index,
      status
    } = (0, _configuredJobs.configuredJobs)({})[this.jobName];

    if (!status) {
      return;
    }

    try {
      const hosts = await this.getApiObjects();
      const data = await hosts.reduce(async (acc, host) => {
        const {
          status
        } = (0, _configuredJobs.configuredJobs)({
          host,
          jobName: this.jobName
        })[this.jobName];
        if (!status) return acc;
        const response = await this.getResponses(host);
        const accResolve = await Promise.resolve(acc);
        return [...accResolve, ...response];
      }, Promise.resolve([]));
      !!data.length && (await this.saveDocument.save(data, index));
    } catch (error) {
      (0, _errorHandler.ErrorHandler)(error, this.logger);
    }
  }

  async getApiObjects() {
    const {
      apis
    } = _predefinedJobs.jobs[this.jobName];
    const hostsResponse = await wazuhHostsController.getHostsEntries(false, false, fakeResponseEndpoint);
    if (!hostsResponse.body.length) throw {
      error: 10001,
      message: 'No Wazuh host configured in wazuh.yml'
    };

    if (apis && apis.length) {
      return this.filterHosts(hostsResponse.body, apis);
    }

    return hostsResponse.body;
  }

  filterHosts(hosts, apis) {
    const filteredHosts = hosts.filter(host => apis.includes(host.id));

    if (filteredHosts.length <= 0) {
      throw {
        error: 10002,
        message: 'No host was found with the indicated ID'
      };
    }

    return filteredHosts;
  }

  async getResponses(host) {
    const {
      request,
      params
    } = _predefinedJobs.jobs[this.jobName];
    const data = [];

    if (typeof request === 'string') {
      const apiResponse = await this.apiClient.request('GET', request, params, {
        apiHostID: host.id
      });
      data.push({ ...apiResponse.data,
        apiName: host.id
      });
    } else {
      await this.getResponsesForIRequest(host, data);
    }

    return data;
  }

  async getResponsesForIRequest(host, data) {
    const {
      request,
      params
    } = _predefinedJobs.jobs[this.jobName];
    const fieldName = this.getParamName(typeof request !== 'string' && request.request);
    const paramList = await this.getParamList(fieldName, host);

    for (const param of paramList) {
      const paramRequest = typeof request !== 'string' && request.request.replace(/\{.+\}/, param);

      if (!!paramRequest) {
        const apiResponse = await this.apiClient.request('GET', paramRequest, params, {
          apiHostID: host.id
        });
        data.push({ ...apiResponse.data,
          apiName: host.id,
          [fieldName]: param
        });
      }
    }
  }

  getParamName(request) {
    const regexResult = /\{(?<fieldName>.+)\}/.exec(request);
    if (regexResult === null) throw {
      error: 10003,
      message: `The parameter is not found in the Request: ${request}`
    }; // @ts-ignore

    const {
      fieldName
    } = regexResult.groups;
    if (fieldName === undefined || fieldName === '') throw {
      error: 10004,
      message: `Invalid field in the request: {request: ${request}, field: ${fieldName}}`
    };
    return fieldName;
  }

  async getParamList(fieldName, host) {
    const {
      request
    } = _predefinedJobs.jobs[this.jobName]; // @ts-ignore

    const apiResponse = await this.apiClient.request('GET', request.params[fieldName].request, {}, {
      apiHostID: host.id
    });
    const {
      affected_items
    } = apiResponse.data.data;
    if (affected_items === undefined || affected_items.length === 0) throw {
      error: 10005,
      message: `Empty response when tried to get the parameters list: ${JSON.stringify(apiResponse.data)}`
    };
    const values = affected_items.map(this.mapParamList);
    return values;
  }

  mapParamList(item) {
    if (typeof item !== 'object') {
      return item;
    }

    ;
    const keys = Object.keys(item);
    if (keys.length > 1 || keys.length < 0) throw {
      error: 10006,
      message: `More than one key or none were obtained: ${keys}`
    };
    return item[keys[0]];
  }

}

exports.SchedulerJob = SchedulerJob;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxlci1qb2IudHMiXSwibmFtZXMiOlsid2F6dWhIb3N0c0NvbnRyb2xsZXIiLCJXYXp1aEhvc3RzQ3RybCIsImZha2VSZXNwb25zZUVuZHBvaW50Iiwib2siLCJib2R5IiwiY3VzdG9tIiwiU2NoZWR1bGVySm9iIiwiY29uc3RydWN0b3IiLCJqb2JOYW1lIiwiY29udGV4dCIsImxvZ2dlciIsIndhenVoIiwiYXBpQ2xpZW50IiwiYXBpIiwiY2xpZW50IiwiYXNJbnRlcm5hbFVzZXIiLCJzYXZlRG9jdW1lbnQiLCJTYXZlRG9jdW1lbnQiLCJydW4iLCJpbmRleCIsInN0YXR1cyIsImhvc3RzIiwiZ2V0QXBpT2JqZWN0cyIsImRhdGEiLCJyZWR1Y2UiLCJhY2MiLCJob3N0IiwicmVzcG9uc2UiLCJnZXRSZXNwb25zZXMiLCJhY2NSZXNvbHZlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJsZW5ndGgiLCJzYXZlIiwiZXJyb3IiLCJhcGlzIiwiam9icyIsImhvc3RzUmVzcG9uc2UiLCJnZXRIb3N0c0VudHJpZXMiLCJtZXNzYWdlIiwiZmlsdGVySG9zdHMiLCJmaWx0ZXJlZEhvc3RzIiwiZmlsdGVyIiwiaW5jbHVkZXMiLCJpZCIsInJlcXVlc3QiLCJwYXJhbXMiLCJhcGlSZXNwb25zZSIsImFwaUhvc3RJRCIsInB1c2giLCJhcGlOYW1lIiwiZ2V0UmVzcG9uc2VzRm9ySVJlcXVlc3QiLCJmaWVsZE5hbWUiLCJnZXRQYXJhbU5hbWUiLCJwYXJhbUxpc3QiLCJnZXRQYXJhbUxpc3QiLCJwYXJhbSIsInBhcmFtUmVxdWVzdCIsInJlcGxhY2UiLCJyZWdleFJlc3VsdCIsImV4ZWMiLCJncm91cHMiLCJ1bmRlZmluZWQiLCJhZmZlY3RlZF9pdGVtcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ2YWx1ZXMiLCJtYXAiLCJtYXBQYXJhbUxpc3QiLCJpdGVtIiwia2V5cyIsIk9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztB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QSxZQUFSLENBQXFCQyxJQUFyQixFQUEyQjtBQUN6QixRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBT0EsSUFBUDtBQUNEOztBQUFBO0FBQ0QsVUFBTUMsSUFBSSxHQUFHQyxNQUFNLENBQUNELElBQVAsQ0FBWUQsSUFBWixDQUFiO0FBQ0EsUUFBR0MsSUFBSSxDQUFDdEMsTUFBTCxHQUFjLENBQWQsSUFBbUJzQyxJQUFJLENBQUN0QyxNQUFMLEdBQWMsQ0FBcEMsRUFBdUMsTUFBTTtBQUFFRSxNQUFBQSxLQUFLLEVBQUUsS0FBVDtBQUFnQkssTUFBQUEsT0FBTyxFQUFHLDRDQUEyQytCLElBQUs7QUFBMUUsS0FBTjtBQUN2QyxXQUFPRCxJQUFJLENBQUNDLElBQUksQ0FBQyxDQUFELENBQUwsQ0FBWDtBQUNEOztBQS9HdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2JzIH0gZnJvbSAnLi9wcmVkZWZpbmVkLWpvYnMnO1xuaW1wb3J0IHsgV2F6dWhIb3N0c0N0cmwgfSBmcm9tICcuLi8uLi9jb250cm9sbGVycy93YXp1aC1ob3N0cyc7XG5pbXBvcnQgeyBJQXBpLCBTYXZlRG9jdW1lbnQgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IEVycm9ySGFuZGxlciB9IGZyb20gJy4vZXJyb3ItaGFuZGxlcic7XG5pbXBvcnQgeyBjb25maWd1cmVkSm9icyB9IGZyb20gJy4vY29uZmlndXJlZC1qb2JzJztcblxuY29uc3Qgd2F6dWhIb3N0c0NvbnRyb2xsZXIgPSBuZXcgV2F6dWhIb3N0c0N0cmwoKTtcblxuY29uc3QgZmFrZVJlc3BvbnNlRW5kcG9pbnQgPSB7XG4gIG9rOiAoYm9keTogYW55KSA9PiBib2R5LFxuICBjdXN0b206IChib2R5OiBhbnkpID0+IGJvZHksXG59O1xuZXhwb3J0IGNsYXNzIFNjaGVkdWxlckpvYiB7XG4gIGpvYk5hbWU6IHN0cmluZztcbiAgc2F2ZURvY3VtZW50OiBTYXZlRG9jdW1lbnQ7XG4gIGNvbnRleHQ6IGFueTtcbiAgbG9nZ2VyOiBhbnk7XG4gIGFwaUNsaWVudDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKGpvYk5hbWU6IHN0cmluZywgY29udGV4dCkge1xuICAgIHRoaXMuam9iTmFtZSA9IGpvYk5hbWU7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLmxvZ2dlciA9IGNvbnRleHQud2F6dWgubG9nZ2VyO1xuICAgIHRoaXMuYXBpQ2xpZW50ID0gY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzSW50ZXJuYWxVc2VyO1xuICAgIHRoaXMuc2F2ZURvY3VtZW50ID0gbmV3IFNhdmVEb2N1bWVudChjb250ZXh0KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW4oKSB7XG4gICAgY29uc3QgeyBpbmRleCwgc3RhdHVzIH0gPSBjb25maWd1cmVkSm9icyh7fSlbdGhpcy5qb2JOYW1lXTtcbiAgICBpZiAoICFzdGF0dXMgKSB7IHJldHVybjsgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBob3N0cyA9IGF3YWl0IHRoaXMuZ2V0QXBpT2JqZWN0cygpO1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGhvc3RzLnJlZHVjZShhc3luYyAoYWNjOlByb21pc2U8b2JqZWN0W10+LCBob3N0KSA9PiB7XG4gICAgICAgIGNvbnN0IHtzdGF0dXN9ID0gY29uZmlndXJlZEpvYnMoe2hvc3QsIGpvYk5hbWU6IHRoaXMuam9iTmFtZX0pW3RoaXMuam9iTmFtZV07XG4gICAgICAgIGlmICghc3RhdHVzKSByZXR1cm4gYWNjO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2V0UmVzcG9uc2VzKGhvc3QpO1xuICAgICAgICBjb25zdCBhY2NSZXNvbHZlID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKGFjYylcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAuLi5hY2NSZXNvbHZlLFxuICAgICAgICAgIC4uLnJlc3BvbnNlLFxuICAgICAgICBdO1xuICAgICAgfSwgUHJvbWlzZS5yZXNvbHZlKFtdKSk7XG4gICAgICAhIWRhdGEubGVuZ3RoICYmIGF3YWl0IHRoaXMuc2F2ZURvY3VtZW50LnNhdmUoZGF0YSwgaW5kZXgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBFcnJvckhhbmRsZXIoZXJyb3IsIHRoaXMubG9nZ2VyKTtcbiAgICB9IFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRBcGlPYmplY3RzKCkge1xuICAgIGNvbnN0IHsgYXBpcyB9ID0gam9ic1t0aGlzLmpvYk5hbWVdO1xuICAgIGNvbnN0IGhvc3RzUmVzcG9uc2U6IHtib2R5OiBJQXBpW119ID0gYXdhaXQgd2F6dWhIb3N0c0NvbnRyb2xsZXIuZ2V0SG9zdHNFbnRyaWVzKGZhbHNlLCBmYWxzZSwgZmFrZVJlc3BvbnNlRW5kcG9pbnQpO1xuICAgIGlmICghaG9zdHNSZXNwb25zZS5ib2R5Lmxlbmd0aCkgdGhyb3cge2Vycm9yOiAxMDAwMSwgbWVzc2FnZTogJ05vIFdhenVoIGhvc3QgY29uZmlndXJlZCBpbiB3YXp1aC55bWwnIH1cbiAgICBpZihhcGlzICYmIGFwaXMubGVuZ3RoKXtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlckhvc3RzKGhvc3RzUmVzcG9uc2UuYm9keSwgYXBpcyk7XG4gICAgfVxuICAgIHJldHVybiBob3N0c1Jlc3BvbnNlLmJvZHk7XG4gIH1cblxuICBwcml2YXRlIGZpbHRlckhvc3RzKGhvc3RzOiBJQXBpW10sIGFwaXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgZmlsdGVyZWRIb3N0cyA9IGhvc3RzLmZpbHRlcihob3N0ID0+IGFwaXMuaW5jbHVkZXMoaG9zdC5pZCkpO1xuICAgIGlmIChmaWx0ZXJlZEhvc3RzLmxlbmd0aCA8PSAwKSB7XG4gICAgICB0aHJvdyB7ZXJyb3I6IDEwMDAyLCBtZXNzYWdlOiAnTm8gaG9zdCB3YXMgZm91bmQgd2l0aCB0aGUgaW5kaWNhdGVkIElEJ307XG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJlZEhvc3RzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRSZXNwb25zZXMoaG9zdCk6IFByb21pc2U8b2JqZWN0W10+IHtcbiAgICBjb25zdCB7IHJlcXVlc3QsIHBhcmFtcyB9ID0gam9ic1t0aGlzLmpvYk5hbWVdO1xuICAgIGNvbnN0IGRhdGE6b2JqZWN0W10gPSBbXTtcbiAgICBcbiAgICBpZiAodHlwZW9mIHJlcXVlc3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBhcGlSZXNwb25zZSA9IGF3YWl0IHRoaXMuYXBpQ2xpZW50LnJlcXVlc3QoJ0dFVCcsIHJlcXVlc3QsIHBhcmFtcywgeyBhcGlIb3N0SUQ6IGhvc3QuaWQgfSk7XG4gICAgICBkYXRhLnB1c2goey4uLmFwaVJlc3BvbnNlLmRhdGEsIGFwaU5hbWU6aG9zdC5pZH0pO1xuICAgIH1lbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuZ2V0UmVzcG9uc2VzRm9ySVJlcXVlc3QoaG9zdCwgZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRSZXNwb25zZXNGb3JJUmVxdWVzdChob3N0OiBhbnksIGRhdGE6IG9iamVjdFtdKSB7XG4gICAgY29uc3QgeyByZXF1ZXN0LCBwYXJhbXMgfSA9IGpvYnNbdGhpcy5qb2JOYW1lXTtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSB0aGlzLmdldFBhcmFtTmFtZSh0eXBlb2YgcmVxdWVzdCAhPT0gJ3N0cmluZycgJiYgcmVxdWVzdC5yZXF1ZXN0KTtcbiAgICBjb25zdCBwYXJhbUxpc3QgPSBhd2FpdCB0aGlzLmdldFBhcmFtTGlzdChmaWVsZE5hbWUsIGhvc3QpO1xuICAgIGZvciAoY29uc3QgcGFyYW0gb2YgcGFyYW1MaXN0KSB7XG4gICAgICBjb25zdCBwYXJhbVJlcXVlc3QgPSB0eXBlb2YgcmVxdWVzdCAhPT0gJ3N0cmluZycgJiYgcmVxdWVzdC5yZXF1ZXN0LnJlcGxhY2UoL1xcey4rXFx9LywgcGFyYW0pO1xuICAgICAgaWYoISFwYXJhbVJlcXVlc3Qpe1xuICAgICAgICBjb25zdCBhcGlSZXNwb25zZSA9IGF3YWl0IHRoaXMuYXBpQ2xpZW50LnJlcXVlc3QoJ0dFVCcsIHBhcmFtUmVxdWVzdCwgcGFyYW1zLCB7IGFwaUhvc3RJRDogaG9zdC5pZCB9KTtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAuLi5hcGlSZXNwb25zZS5kYXRhLFxuICAgICAgICAgIGFwaU5hbWU6IGhvc3QuaWQsXG4gICAgICAgICAgW2ZpZWxkTmFtZV06IHBhcmFtLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UGFyYW1OYW1lKHJlcXVlc3QpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlZ2V4UmVzdWx0ID0gL1xceyg/PGZpZWxkTmFtZT4uKylcXH0vLmV4ZWMocmVxdWVzdCk7XG4gICAgaWYgKHJlZ2V4UmVzdWx0ID09PSBudWxsKSB0aHJvdyB7ZXJyb3I6IDEwMDAzLCBtZXNzYWdlOiBgVGhlIHBhcmFtZXRlciBpcyBub3QgZm91bmQgaW4gdGhlIFJlcXVlc3Q6ICR7cmVxdWVzdH1gfTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgeyBmaWVsZE5hbWUgfSA9IHJlZ2V4UmVzdWx0Lmdyb3VwcztcbiAgICBpZiAoZmllbGROYW1lID09PSB1bmRlZmluZWQgfHwgZmllbGROYW1lID09PSAnJykgdGhyb3cge2Vycm9yOiAxMDAwNCwgbWVzc2FnZTogYEludmFsaWQgZmllbGQgaW4gdGhlIHJlcXVlc3Q6IHtyZXF1ZXN0OiAke3JlcXVlc3R9LCBmaWVsZDogJHtmaWVsZE5hbWV9fWB9XG4gICAgcmV0dXJuIGZpZWxkTmFtZVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRQYXJhbUxpc3QoZmllbGROYW1lLCBob3N0KSB7XG4gICAgY29uc3QgeyByZXF1ZXN0IH0gPSBqb2JzW3RoaXMuam9iTmFtZV07XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGFwaVJlc3BvbnNlID0gYXdhaXQgdGhpcy5hcGlDbGllbnQucmVxdWVzdCgnR0VUJywgcmVxdWVzdC5wYXJhbXNbZmllbGROYW1lXS5yZXF1ZXN0LCB7fSwgeyBhcGlIb3N0SUQ6IGhvc3QuaWQgfSk7XG4gICAgY29uc3QgeyBhZmZlY3RlZF9pdGVtcyB9ID0gYXBpUmVzcG9uc2UuZGF0YS5kYXRhO1xuICAgIGlmIChhZmZlY3RlZF9pdGVtcyA9PT0gdW5kZWZpbmVkIHx8IGFmZmVjdGVkX2l0ZW1zLmxlbmd0aCA9PT0gMCApIHRocm93IHtlcnJvcjogMTAwMDUsIG1lc3NhZ2U6IGBFbXB0eSByZXNwb25zZSB3aGVuIHRyaWVkIHRvIGdldCB0aGUgcGFyYW1ldGVycyBsaXN0OiAke0pTT04uc3RyaW5naWZ5KGFwaVJlc3BvbnNlLmRhdGEpfWB9XG4gICAgY29uc3QgdmFsdWVzID0gYWZmZWN0ZWRfaXRlbXMubWFwKHRoaXMubWFwUGFyYW1MaXN0KVxuICAgIHJldHVybiB2YWx1ZXNcbiAgfVxuXG4gIHByaXZhdGUgbWFwUGFyYW1MaXN0KGl0ZW0pIHtcbiAgICBpZiAodHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gaXRlbVxuICAgIH07XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGl0ZW0pXG4gICAgaWYoa2V5cy5sZW5ndGggPiAxIHx8IGtleXMubGVuZ3RoIDwgMCkgdGhyb3cgeyBlcnJvcjogMTAwMDYsIG1lc3NhZ2U6IGBNb3JlIHRoYW4gb25lIGtleSBvciBub25lIHdlcmUgb2J0YWluZWQ6ICR7a2V5c31gfVxuICAgIHJldHVybiBpdGVtW2tleXNbMF1dO1xuICB9XG59XG4iXX0=