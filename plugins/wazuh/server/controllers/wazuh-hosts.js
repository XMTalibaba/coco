"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhHostsCtrl = void 0;

var _manageHosts = require("../lib/manage-hosts");

var _updateRegistry = require("../lib/update-registry");

var _logger = require("../lib/logger");

var _errorResponse = require("../lib/error-response");

var _cacheApiUserHasRunAs = require("../lib/cache-api-user-has-run-as");

var _constants = require("../../common/constants");

/*
 * Wazuh app - Class for Wazuh-API functions
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
class WazuhHostsCtrl {
  constructor() {
    this.manageHosts = new _manageHosts.ManageHosts();
    this.updateRegistry = new _updateRegistry.UpdateRegistry();
  }
  /**
   * This get all hosts entries in the wazuh.yml and the related info in the wazuh-registry.json
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * API entries or ErrorResponse
   */


  async getHostsEntries(context, request, response) {
    try {
      const removePassword = true;
      const hosts = await this.manageHosts.getHosts(removePassword);
      const registry = await this.updateRegistry.getHosts();
      const result = await this.joinHostRegistry(hosts, registry, removePassword);
      return response.ok({
        body: result
      });
    } catch (error) {
      if (error && error.message && ['ENOENT: no such file or directory', _constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH].every(text => error.message.includes(text))) {
        return response.badRequest({
          body: {
            message: `Error getting the hosts entries: The \'${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH}\' directory could not exist in your Kibana installation.
            If this doesn't exist, create it and give the permissions 'sudo mkdir ${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH};sudo chown -R kibana:kibana ${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH}'. After, restart the Kibana service.`
          }
        });
      }

      (0, _logger.log)('wazuh-hosts:getHostsEntries', error.message || error);
      return (0, _errorResponse.ErrorResponse)(error.message || error, 2001, 500, response);
    }
  }
  /**
   * Joins the hosts with the related information in the registry
   * @param {Object} hosts
   * @param {Object} registry
   * @param {Boolean} removePassword
   */


  async joinHostRegistry(hosts, registry, removePassword = true) {
    try {
      if (!Array.isArray(hosts)) {
        throw new Error('Hosts configuration error in wazuh.yml');
      }

      return await Promise.all(hosts.map(async h => {
        const id = Object.keys(h)[0];
        const api = Object.assign(h[id], {
          id: id
        });
        const host = Object.assign(api, registry[id]); // Add to run_as from API user. Use the cached value or get it doing a request

        host.allow_run_as = await _cacheApiUserHasRunAs.APIUserAllowRunAs.check(id);

        if (removePassword) {
          delete host.password;
          delete host.token;
        }

        ;
        return host;
      }));
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * This update an API hostname
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * Status response or ErrorResponse
   */


  async updateClusterInfo(context, request, response) {
    try {
      const {
        id
      } = request.params;
      const {
        cluster_info
      } = request.body;
      await this.updateRegistry.updateClusterInfo(id, cluster_info);
      (0, _logger.log)('wazuh-hosts:updateClusterInfo', `API entry ${id} hostname updated`, 'debug');
      return response.ok({
        body: {
          statusCode: 200,
          message: 'ok'
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-hosts:updateClusterInfo', error.message || error);
      return (0, _errorResponse.ErrorResponse)(`Could not update data in wazuh-registry.json due to ${error.message || error}`, 2012, 500, response);
    }
  }
  /**
   * Remove the orphan host entries in the registry
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   */


  async removeOrphanEntries(context, request, response) {
    try {
      const {
        entries
      } = request.body;
      (0, _logger.log)('wazuh-hosts:cleanRegistry', 'Cleaning registry', 'debug');
      await this.updateRegistry.removeOrphanEntries(entries);
      return response.ok({
        body: {
          statusCode: 200,
          message: 'ok'
        }
      });
    } catch (error) {
      (0, _logger.log)('wazuh-hosts:cleanRegistry', error.message || error);
      return (0, _errorResponse.ErrorResponse)(`Could not clean entries in the wazuh-registry.json due to ${error.message || error}`, 2013, 500, response);
    }
  }

}

exports.WazuhHostsCtrl = WazuhHostsCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLWhvc3RzLnRzIl0sIm5hbWVzIjpbIldhenVoSG9zdHNDdHJsIiwiY29uc3RydWN0b3IiLCJtYW5hZ2VIb3N0cyIsIk1hbmFnZUhvc3RzIiwidXBkYXRlUmVnaXN0cnkiLCJVcGRhdGVSZWdpc3RyeSIsImdldEhvc3RzRW50cmllcyIsImNvbnRleHQiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJyZW1vdmVQYXNzd29yZCIsImhvc3RzIiwiZ2V0SG9zdHMiLCJyZWdpc3RyeSIsInJlc3VsdCIsImpvaW5Ib3N0UmVnaXN0cnkiLCJvayIsImJvZHkiLCJlcnJvciIsIm1lc3NhZ2UiLCJXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEgiLCJldmVyeSIsInRleHQiLCJpbmNsdWRlcyIsImJhZFJlcXVlc3QiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJoIiwiaWQiLCJPYmplY3QiLCJrZXlzIiwiYXBpIiwiYXNzaWduIiwiaG9zdCIsImFsbG93X3J1bl9hcyIsIkFQSVVzZXJBbGxvd1J1bkFzIiwiY2hlY2siLCJwYXNzd29yZCIsInRva2VuIiwidXBkYXRlQ2x1c3RlckluZm8iLCJwYXJhbXMiLCJjbHVzdGVyX2luZm8iLCJzdGF0dXNDb2RlIiwicmVtb3ZlT3JwaGFuRW50cmllcyIsImVudHJpZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFZQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFsQkE7Ozs7Ozs7Ozs7O0FBb0JPLE1BQU1BLGNBQU4sQ0FBcUI7QUFDMUJDLEVBQUFBLFdBQVcsR0FBRztBQUNaLFNBQUtDLFdBQUwsR0FBbUIsSUFBSUMsd0JBQUosRUFBbkI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQUlDLDhCQUFKLEVBQXRCO0FBQ0Q7QUFFRDs7Ozs7Ozs7O0FBT0EsUUFBTUMsZUFBTixDQUFzQkMsT0FBdEIsRUFBc0RDLE9BQXRELEVBQThFQyxRQUE5RSxFQUErRztB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SUFBaUJELEtBQWxEO0FBQ0EsYUFBTyxrQ0FDSiw2REFBNERBLEtBQUssQ0FBQ0MsT0FBTixJQUFpQkQsS0FBTSxFQUQvRSxFQUVMLElBRkssRUFHTCxHQUhLLEVBSUxULFFBSkssQ0FBUDtBQU1EO0FBQ0Y7O0FBdEh5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBDbGFzcyBmb3IgV2F6dWgtQVBJIGZ1bmN0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cblxuaW1wb3J0IHsgTWFuYWdlSG9zdHMgfSBmcm9tICcuLi9saWIvbWFuYWdlLWhvc3RzJztcbmltcG9ydCB7IFVwZGF0ZVJlZ2lzdHJ5IH0gZnJvbSAnLi4vbGliL3VwZGF0ZS1yZWdpc3RyeSc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi9saWIvbG9nZ2VyJztcbmltcG9ydCB7IEVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi9saWIvZXJyb3ItcmVzcG9uc2UnO1xuaW1wb3J0IHsgQVBJVXNlckFsbG93UnVuQXMgfSBmcm9tICcuLi9saWIvY2FjaGUtYXBpLXVzZXItaGFzLXJ1bi1hcyc7XG5pbXBvcnQgeyBLaWJhbmFSZXF1ZXN0LCBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIEtpYmFuYVJlc3BvbnNlRmFjdG9yeSB9IGZyb20gJ3NyYy9jb3JlL3NlcnZlcic7XG5pbXBvcnQgeyBXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEggfSBmcm9tICcuLi8uLi9jb21tb24vY29uc3RhbnRzJztcblxuZXhwb3J0IGNsYXNzIFdhenVoSG9zdHNDdHJsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYW5hZ2VIb3N0cyA9IG5ldyBNYW5hZ2VIb3N0cygpO1xuICAgIHRoaXMudXBkYXRlUmVnaXN0cnkgPSBuZXcgVXBkYXRlUmVnaXN0cnkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGdldCBhbGwgaG9zdHMgZW50cmllcyBpbiB0aGUgd2F6dWgueW1sIGFuZCB0aGUgcmVsYXRlZCBpbmZvIGluIHRoZSB3YXp1aC1yZWdpc3RyeS5qc29uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBBUEkgZW50cmllcyBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyBnZXRIb3N0c0VudHJpZXMoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlbW92ZVBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGhvc3RzID0gYXdhaXQgdGhpcy5tYW5hZ2VIb3N0cy5nZXRIb3N0cyhyZW1vdmVQYXNzd29yZCk7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGF3YWl0IHRoaXMudXBkYXRlUmVnaXN0cnkuZ2V0SG9zdHMoKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuam9pbkhvc3RSZWdpc3RyeShob3N0cywgcmVnaXN0cnksIHJlbW92ZVBhc3N3b3JkKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgIGJvZHk6IHJlc3VsdFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmKGVycm9yICYmIGVycm9yLm1lc3NhZ2UgJiYgWydFTk9FTlQ6IG5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnknLCBXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEhdLmV2ZXJ5KHRleHQgPT4gZXJyb3IubWVzc2FnZS5pbmNsdWRlcyh0ZXh0KSkpe1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYmFkUmVxdWVzdCh7XG4gICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgbWVzc2FnZTogYEVycm9yIGdldHRpbmcgdGhlIGhvc3RzIGVudHJpZXM6IFRoZSBcXCcke1dBWlVIX0RBVEFfS0lCQU5BX0JBU0VfQUJTT0xVVEVfUEFUSH1cXCcgZGlyZWN0b3J5IGNvdWxkIG5vdCBleGlzdCBpbiB5b3VyIEtpYmFuYSBpbnN0YWxsYXRpb24uXG4gICAgICAgICAgICBJZiB0aGlzIGRvZXNuJ3QgZXhpc3QsIGNyZWF0ZSBpdCBhbmQgZ2l2ZSB0aGUgcGVybWlzc2lvbnMgJ3N1ZG8gbWtkaXIgJHtXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEh9O3N1ZG8gY2hvd24gLVIga2liYW5hOmtpYmFuYSAke1dBWlVIX0RBVEFfS0lCQU5BX0JBU0VfQUJTT0xVVEVfUEFUSH0nLiBBZnRlciwgcmVzdGFydCB0aGUgS2liYW5hIHNlcnZpY2UuYFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGxvZygnd2F6dWgtaG9zdHM6Z2V0SG9zdHNFbnRyaWVzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gRXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlIHx8IGVycm9yLCAyMDAxLCA1MDAsIHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSm9pbnMgdGhlIGhvc3RzIHdpdGggdGhlIHJlbGF0ZWQgaW5mb3JtYXRpb24gaW4gdGhlIHJlZ2lzdHJ5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBob3N0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gcmVnaXN0cnlcbiAgICogQHBhcmFtIHtCb29sZWFufSByZW1vdmVQYXNzd29yZFxuICAgKi9cbiAgYXN5bmMgam9pbkhvc3RSZWdpc3RyeShob3N0czogYW55LCByZWdpc3RyeTogYW55LCByZW1vdmVQYXNzd29yZDogYm9vbGVhbiA9IHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGhvc3RzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hvc3RzIGNvbmZpZ3VyYXRpb24gZXJyb3IgaW4gd2F6dWgueW1sJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChob3N0cy5tYXAoYXN5bmMgaCA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gT2JqZWN0LmtleXMoaClbMF07XG4gICAgICAgIGNvbnN0IGFwaSA9IE9iamVjdC5hc3NpZ24oaFtpZF0sIHsgaWQ6IGlkIH0pO1xuICAgICAgICBjb25zdCBob3N0ID0gT2JqZWN0LmFzc2lnbihhcGksIHJlZ2lzdHJ5W2lkXSk7XG4gICAgICAgIC8vIEFkZCB0byBydW5fYXMgZnJvbSBBUEkgdXNlci4gVXNlIHRoZSBjYWNoZWQgdmFsdWUgb3IgZ2V0IGl0IGRvaW5nIGEgcmVxdWVzdFxuICAgICAgICBob3N0LmFsbG93X3J1bl9hcyA9IGF3YWl0IEFQSVVzZXJBbGxvd1J1bkFzLmNoZWNrKGlkKTtcbiAgICAgICAgaWYgKHJlbW92ZVBhc3N3b3JkKSB7XG4gICAgICAgICAgZGVsZXRlIGhvc3QucGFzc3dvcmQ7XG4gICAgICAgICAgZGVsZXRlIGhvc3QudG9rZW47XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBob3N0O1xuICAgICAgfSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogVGhpcyB1cGRhdGUgYW4gQVBJIGhvc3RuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgKiBTdGF0dXMgcmVzcG9uc2Ugb3IgRXJyb3JSZXNwb25zZVxuICAgKi9cbiAgYXN5bmMgdXBkYXRlQ2x1c3RlckluZm8oY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcXVlc3QucGFyYW1zO1xuICAgICAgY29uc3QgeyBjbHVzdGVyX2luZm8gfSA9IHJlcXVlc3QuYm9keTtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlUmVnaXN0cnkudXBkYXRlQ2x1c3RlckluZm8oaWQsIGNsdXN0ZXJfaW5mbyk7XG4gICAgICBsb2coXG4gICAgICAgICd3YXp1aC1ob3N0czp1cGRhdGVDbHVzdGVySW5mbycsXG4gICAgICAgIGBBUEkgZW50cnkgJHtpZH0gaG9zdG5hbWUgdXBkYXRlZGAsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBib2R5OiB7IHN0YXR1c0NvZGU6IDIwMCwgbWVzc2FnZTogJ29rJyB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCd3YXp1aC1ob3N0czp1cGRhdGVDbHVzdGVySW5mbycsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgIGBDb3VsZCBub3QgdXBkYXRlIGRhdGEgaW4gd2F6dWgtcmVnaXN0cnkuanNvbiBkdWUgdG8gJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWAsXG4gICAgICAgIDIwMTIsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgb3JwaGFuIGhvc3QgZW50cmllcyBpbiB0aGUgcmVnaXN0cnlcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqL1xuICBhc3luYyByZW1vdmVPcnBoYW5FbnRyaWVzKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVudHJpZXMgfSA9IHJlcXVlc3QuYm9keTtcbiAgICAgIGxvZygnd2F6dWgtaG9zdHM6Y2xlYW5SZWdpc3RyeScsICdDbGVhbmluZyByZWdpc3RyeScsICdkZWJ1ZycpO1xuICAgICAgYXdhaXQgdGhpcy51cGRhdGVSZWdpc3RyeS5yZW1vdmVPcnBoYW5FbnRyaWVzKGVudHJpZXMpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keTogeyBzdGF0dXNDb2RlOiAyMDAsIG1lc3NhZ2U6ICdvaycgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnd2F6dWgtaG9zdHM6Y2xlYW5SZWdpc3RyeScsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoXG4gICAgICAgIGBDb3VsZCBub3QgY2xlYW4gZW50cmllcyBpbiB0aGUgd2F6dWgtcmVnaXN0cnkuanNvbiBkdWUgdG8gJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWAsXG4gICAgICAgIDIwMTMsXG4gICAgICAgIDUwMCxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=