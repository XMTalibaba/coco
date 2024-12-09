"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WazuhUtilsCtrl = void 0;

var _errorResponse = require("../lib/error-response");

var _getConfiguration = require("../lib/get-configuration");

var _readLastLines = require("read-last-lines");

var _updateConfiguration = require("../lib/update-configuration");

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

var _constants = require("../../common/constants");

var _manageHosts = require("../lib/manage-hosts");

var _cookie = require("../lib/cookie");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Require some libraries
const updateConfigurationFile = new _updateConfiguration.UpdateConfigurationFile();

class WazuhUtilsCtrl {
  /**
   * Constructor
   * @param {*} server
   */
  constructor() {
    this.manageHosts = new _manageHosts.ManageHosts();
  }
  /**
   * Returns the wazuh.yml file parsed
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} Configuration File or ErrorResponse
   */


  getConfigurationFile(context, request, response) {
    try {
      const configFile = (0, _getConfiguration.getConfiguration)();
      return response.ok({
        body: {
          statusCode: 200,
          error: 0,
          data: configFile || {}
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(error.message || error, 3019, 500, response);
    }
  }
  /**
   * Returns the wazuh.yml file in raw
   * @param {Object} context
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} Configuration File or ErrorResponse
   */


  async updateConfigurationFile(context, request, response) {
    try {
      // Check if user has administrator role in token
      const token = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-token');

      if (!token) {
        return (0, _errorResponse.ErrorResponse)('No token provided', 401, 401, response);
      }

      ;
      const decodedToken = (0, _jwtDecode.default)(token);

      if (!decodedToken) {
        return (0, _errorResponse.ErrorResponse)('No permissions in token', 401, 401, response);
      }

      ;

      if (!decodedToken.rbac_roles || !decodedToken.rbac_roles.includes(_constants.WAZUH_ROLE_ADMINISTRATOR_ID)) {
        return (0, _errorResponse.ErrorResponse)('No administrator role', 401, 401, response);
      }

      ;
      response; // Check the provided token is valid

      const apiHostID = (0, _cookie.getCookieValueByName)(request.headers.cookie, 'wz-api');

      if (!apiHostID) {
        return (0, _errorResponse.ErrorResponse)('No API id provided', 401, 401, response);
      }

      ;
      const responseTokenIsWorking = await context.wazuh.api.client.asCurrentUser.request('GET', '//', {}, {
        apiHostID
      });

      if (responseTokenIsWorking.status !== 200) {
        return (0, _errorResponse.ErrorResponse)('Token is not valid', 401, 401, response);
      }

      ;
      const result = await updateConfigurationFile.updateConfiguration(request);
      return response.ok({
        body: {
          statusCode: 200,
          error: 0,
          data: result
        }
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(error.message || error, 3021, 500, response);
    }
  }
  /**
   * Returns Wazuh app logs
   * @param {Object} context 
   * @param {Object} request
   * @param {Object} response
   * @returns {Array<String>} app logs or ErrorResponse
   */


  async getAppLogs(context, request, response) {
    try {
      const lastLogs = await (0, _readLastLines.read)(_constants.WAZUH_DATA_LOGS_RAW_PATH, 50);
      const spliterLog = lastLogs.split('\n');
      return spliterLog && Array.isArray(spliterLog) ? response.ok({
        body: {
          error: 0,
          lastLogs: spliterLog.filter(item => typeof item === 'string' && item.length)
        }
      }) : response.ok({
        error: 0,
        lastLogs: []
      });
    } catch (error) {
      return (0, _errorResponse.ErrorResponse)(error.message || error, 3036, 500, response);
    }
  }

}

exports.WazuhUtilsCtrl = WazuhUtilsCtrl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLXV0aWxzLnRzIl0sIm5hbWVzIjpbInVwZGF0ZUNvbmZpZ3VyYXRpb25GaWxlIiwiVXBkYXRlQ29uZmlndXJhdGlvbkZpbGUiLCJXYXp1aFV0aWxzQ3RybCIsImNvbnN0cnVjdG9yIiwibWFuYWdlSG9zdHMiLCJNYW5hZ2VIb3N0cyIsImdldENvbmZpZ3VyYXRpb25GaWxlIiwiY29udGV4dCIsInJlcXVlc3QiLCJyZXNwb25zZSIsImNvbmZpZ0ZpbGUiLCJvayIsImJvZHkiLCJzdGF0dXNDb2RlIiwiZXJyb3IiLCJkYXRhIiwibWVzc2FnZSIsInRva2VuIiwiaGVhZGVycyIsImNvb2tpZSIsImRlY29kZWRUb2tlbiIsInJiYWNfcm9sZXMiLCJpbmNsdWRlcyIsIldBWlVIX1JPTEVfQURNSU5JU1RSQVRPUl9JRCIsImFwaUhvc3RJRCIsInJlc3BvbnNlVG9rZW5Jc1dvcmtpbmciLCJ3YXp1aCIsImFwaSIsImNsaWVudCIsImFzQ3VycmVudFVzZXIiLCJzdGF0dXMiLCJyZXN1bHQiLCJ1cGRhdGVDb25maWd1cmF0aW9uIiwiZ2V0QXBwTG9ncyIsImxhc3RMb2dzIiwiV0FaVUhfREFUQV9MT0dTX1JBV19QQVRIIiwic3BsaXRlckxvZyIsInNwbGl0IiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwiaXRlbSIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7O0FBckJBOzs7Ozs7Ozs7OztBQVlBO0FBV0EsTUFBTUEsdUJBQXVCLEdBQUcsSUFBSUMsNENBQUosRUFBaEM7O0FBRU8sTUFBTUMsY0FBTixDQUFxQjtBQUMxQjs7OztBQUlBQyxFQUFBQSxXQUFXLEdBQUc7QUFDWixTQUFLQyxXQUFMLEdBQW1CLElBQUlDLHdCQUFKLEVBQW5CO0FBQ0Q7QUFFRDs7Ozs7Ozs7O0FBT0FDLEVBQUFBLG9CQUFvQixDQUFDQyxPQUFELEVBQWlDQyxPQUFqQyxFQUF5REMsUUFBekQsRUFBMEY7QUFDNUcsUUFBSTtBQUNGLFlBQU1DLFVBQVUsR0FBRyx5Q0FBbkI7QUFFQSxhQUFPRCxRQUFRLENBQUNFLEVBQVQsQ0FBWTtBQUNqQkMsUUFBQUEsSUFBSSxFQUFFO0FBQ0pDLFVBQUFBLFVBQVUsRUFBRSxHQURSO0FBRUpDLFVBQUFBLEtBQUssRUFBRSxDQUZIO0FBR0pDLFVBQUFBLElBQUksRUFBRUwsVUFBVSxJQUFJO0FBSGhCO0FBRFcsT0FBWixDQUFQO0FBT0QsS0FWRCxDQVVFLE9BQU9JLEtBQVAsRUFBYztBQUNkLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0UsT0FBTixJQUFpQkYsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURMLFFBQWpELENBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7Ozs7OztBQU9BLFFBQU1ULHVCQUFOLENBQThCTyxPQUE5QixFQUE4REMsT0FBOUQsRUFBc0ZDLFFBQXRGLEVBQXVIO0FBQ3JILFFBQUk7QUFDRjtBQUNBLFlBQU1RLEtBQUssR0FBRyxrQ0FBcUJULE9BQU8sQ0FBQ1UsT0FBUixDQUFnQkMsTUFBckMsRUFBNEMsVUFBNUMsQ0FBZDs7QUFDQSxVQUFHLENBQUNGLEtBQUosRUFBVTtBQUNSLGVBQU8sa0NBQWMsbUJBQWQsRUFBbUMsR0FBbkMsRUFBd0MsR0FBeEMsRUFBNkNSLFFBQTdDLENBQVA7QUFDRDs7QUFBQTtBQUNELFlBQU1XLFlBQVksR0FBRyx3QkFBVUgsS0FBVixDQUFyQjs7QUFDQSxVQUFHLENBQUNHLFlBQUosRUFBaUI7QUFDZixlQUFPLGtDQUFjLHlCQUFkLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1EWCxRQUFuRCxDQUFQO0FBQ0Q7O0FBQUE7O0FBQ0QsVUFBRyxDQUFDVyxZQUFZLENBQUNDLFVBQWQsSUFBNEIsQ0FBQ0QsWUFBWSxDQUFDQyxVQUFiLENBQXdCQyxRQUF4QixDQUFpQ0Msc0NBQWpDLENBQWhDLEVBQThGO0FBQzVGLGVBQU8sa0NBQWMsdUJBQWQsRUFBdUMsR0FBdkMsRUFBNEMsR0FBNUMsRUFBaURkLFFBQWpELENBQVA7QUFDRDs7QUFBQTtBQUFDQSxNQUFBQSxRQUFRLENBWlIsQ0FhRjs7QUFDQSxZQUFNZSxTQUFTLEdBQUcsa0NBQXFCaEIsT0FBTyxDQUFDVSxPQUFSLENBQWdCQyxNQUFyQyxFQUE0QyxRQUE1QyxDQUFsQjs7QUFDQSxVQUFJLENBQUNLLFNBQUwsRUFBZ0I7QUFDZCxlQUFPLGtDQUFjLG9CQUFkLEVBQW9DLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDZixRQUE5QyxDQUFQO0FBQ0Q7O0FBQUE7QUFDRCxZQUFNZ0Isc0JBQXNCLEdBQUcsTUFBTWxCLE9BQU8sQ0FBQ21CLEtBQVIsQ0FBY0MsR0FBZCxDQUFrQkMsTUFBbEIsQ0FBeUJDLGFBQXpCLENBQXVDckIsT0FBdkMsQ0FBK0MsS0FBL0MsRUFBc0QsSUFBdEQsRUFBNEQsRUFBNUQsRUFBZ0U7QUFBQ2dCLFFBQUFBO0FBQUQsT0FBaEUsQ0FBckM7O0FBQ0EsVUFBR0Msc0JBQXNCLENBQUNLLE1BQXZCLEtBQWtDLEdBQXJDLEVBQXlDO0FBQ3ZDLGVBQU8sa0NBQWMsb0JBQWQsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOENyQixRQUE5QyxDQUFQO0FBQ0Q7O0FBQUE7QUFDRCxZQUFNc0IsTUFBTSxHQUFHLE1BQU0vQix1QkFBdUIsQ0FBQ2dDLG1CQUF4QixDQUE0Q3hCLE9BQTVDLENBQXJCO0FBQ0EsYUFBT0MsUUFBUSxDQUFDRSxFQUFULENBQVk7QUFDakJDLFFBQUFBLElBQUksRUFBRTtBQUNKQyxVQUFBQSxVQUFVLEVBQUUsR0FEUjtBQUVKQyxVQUFBQSxLQUFLLEVBQUUsQ0FGSDtBQUdKQyxVQUFBQSxJQUFJLEVBQUVnQjtBQUhGO0FBRFcsT0FBWixDQUFQO0FBT0QsS0E5QkQsQ0E4QkUsT0FBT2pCLEtBQVAsRUFBYztBQUNkLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0UsT0FBTixJQUFpQkYsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURMLFFBQWpELENBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7Ozs7OztBQU9BLFFBQU13QixVQUFOLENBQWlCMUIsT0FBakIsRUFBaURDLE9BQWpELEVBQXlFQyxRQUF6RSxFQUEwRztBQUN4RyxRQUFJO0FBQ0YsWUFBTXlCLFFBQVEsR0FBRyxNQUFNLHlCQUNyQkMsbUNBRHFCLEVBRXJCLEVBRnFCLENBQXZCO0FBSUEsWUFBTUMsVUFBVSxHQUFHRixRQUFRLENBQUNHLEtBQVQsQ0FBZSxJQUFmLENBQW5CO0FBQ0EsYUFBT0QsVUFBVSxJQUFJRSxLQUFLLENBQUNDLE9BQU4sQ0FBY0gsVUFBZCxDQUFkLEdBQ0gzQixRQUFRLENBQUNFLEVBQVQsQ0FBWTtBQUNaQyxRQUFBQSxJQUFJLEVBQUU7QUFDSkUsVUFBQUEsS0FBSyxFQUFFLENBREg7QUFFSm9CLFVBQUFBLFFBQVEsRUFBRUUsVUFBVSxDQUFDSSxNQUFYLENBQ1JDLElBQUksSUFBSSxPQUFPQSxJQUFQLEtBQWdCLFFBQWhCLElBQTRCQSxJQUFJLENBQUNDLE1BRGpDO0FBRk47QUFETSxPQUFaLENBREcsR0FTSGpDLFFBQVEsQ0FBQ0UsRUFBVCxDQUFZO0FBQUVHLFFBQUFBLEtBQUssRUFBRSxDQUFUO0FBQVlvQixRQUFBQSxRQUFRLEVBQUU7QUFBdEIsT0FBWixDQVRKO0FBVUQsS0FoQkQsQ0FnQkUsT0FBT3BCLEtBQVAsRUFBYztBQUNkLGFBQU8sa0NBQWNBLEtBQUssQ0FBQ0UsT0FBTixJQUFpQkYsS0FBL0IsRUFBc0MsSUFBdEMsRUFBNEMsR0FBNUMsRUFBaURMLFFBQWpELENBQVA7QUFDRDtBQUNGOztBQXRHeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gQ2xhc3MgZm9yIFdhenVoLUFQSSBmdW5jdGlvbnNcbiAqIENvcHlyaWdodCAoQykgMjAxNS0yMDIxIFdhenVoLCBJbmMuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuICovXG5cbi8vIFJlcXVpcmUgc29tZSBsaWJyYXJpZXNcbmltcG9ydCB7IEVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi9saWIvZXJyb3ItcmVzcG9uc2UnO1xuaW1wb3J0IHsgZ2V0Q29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2xpYi9nZXQtY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyByZWFkIH0gZnJvbSAncmVhZC1sYXN0LWxpbmVzJztcbmltcG9ydCB7IFVwZGF0ZUNvbmZpZ3VyYXRpb25GaWxlIH0gZnJvbSAnLi4vbGliL3VwZGF0ZS1jb25maWd1cmF0aW9uJztcbmltcG9ydCBqd3REZWNvZGUgZnJvbSAnand0LWRlY29kZSc7XG5pbXBvcnQgeyBXQVpVSF9ST0xFX0FETUlOSVNUUkFUT1JfSUQsIFdBWlVIX0RBVEFfTE9HU19SQVdfUEFUSCB9IGZyb20gJy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgTWFuYWdlSG9zdHMgfSBmcm9tICcuLi9saWIvbWFuYWdlLWhvc3RzJztcbmltcG9ydCB7IEtpYmFuYVJlcXVlc3QsIFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgS2liYW5hUmVzcG9uc2VGYWN0b3J5IH0gZnJvbSAnc3JjL2NvcmUvc2VydmVyJztcbmltcG9ydCB7IGdldENvb2tpZVZhbHVlQnlOYW1lIH0gZnJvbSAnLi4vbGliL2Nvb2tpZSc7XG5cbmNvbnN0IHVwZGF0ZUNvbmZpZ3VyYXRpb25GaWxlID0gbmV3IFVwZGF0ZUNvbmZpZ3VyYXRpb25GaWxlKCk7XG5cbmV4cG9ydCBjbGFzcyBXYXp1aFV0aWxzQ3RybCB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0geyp9IHNlcnZlclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYW5hZ2VIb3N0cyA9IG5ldyBNYW5hZ2VIb3N0cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdhenVoLnltbCBmaWxlIHBhcnNlZFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBGaWxlIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGdldENvbmZpZ3VyYXRpb25GaWxlKGNvbnRleHQ6IFJlcXVlc3RIYW5kbGVyQ29udGV4dCwgcmVxdWVzdDogS2liYW5hUmVxdWVzdCwgcmVzcG9uc2U6IEtpYmFuYVJlc3BvbnNlRmFjdG9yeSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25maWdGaWxlID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuXG4gICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgIGVycm9yOiAwLFxuICAgICAgICAgIGRhdGE6IGNvbmZpZ0ZpbGUgfHwge31cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsIDMwMTksIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3YXp1aC55bWwgZmlsZSBpbiByYXdcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IENvbmZpZ3VyYXRpb24gRmlsZSBvciBFcnJvclJlc3BvbnNlXG4gICAqL1xuICBhc3luYyB1cGRhdGVDb25maWd1cmF0aW9uRmlsZShjb250ZXh0OiBSZXF1ZXN0SGFuZGxlckNvbnRleHQsIHJlcXVlc3Q6IEtpYmFuYVJlcXVlc3QsIHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnkpIHtcbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgaWYgdXNlciBoYXMgYWRtaW5pc3RyYXRvciByb2xlIGluIHRva2VuXG4gICAgICBjb25zdCB0b2tlbiA9IGdldENvb2tpZVZhbHVlQnlOYW1lKHJlcXVlc3QuaGVhZGVycy5jb29raWUsJ3d6LXRva2VuJyk7XG4gICAgICBpZighdG9rZW4pe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gdG9rZW4gcHJvdmlkZWQnLCA0MDEsIDQwMSwgcmVzcG9uc2UpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGRlY29kZWRUb2tlbiA9IGp3dERlY29kZSh0b2tlbik7XG4gICAgICBpZighZGVjb2RlZFRva2VuKXtcbiAgICAgICAgcmV0dXJuIEVycm9yUmVzcG9uc2UoJ05vIHBlcm1pc3Npb25zIGluIHRva2VuJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICBpZighZGVjb2RlZFRva2VuLnJiYWNfcm9sZXMgfHwgIWRlY29kZWRUb2tlbi5yYmFjX3JvbGVzLmluY2x1ZGVzKFdBWlVIX1JPTEVfQURNSU5JU1RSQVRPUl9JRCkpe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gYWRtaW5pc3RyYXRvciByb2xlJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07cmVzcG9uc2VcbiAgICAgIC8vIENoZWNrIHRoZSBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZFxuICAgICAgY29uc3QgYXBpSG9zdElEID0gZ2V0Q29va2llVmFsdWVCeU5hbWUocmVxdWVzdC5oZWFkZXJzLmNvb2tpZSwnd3otYXBpJyk7XG4gICAgICBpZiggIWFwaUhvc3RJRCApe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnTm8gQVBJIGlkIHByb3ZpZGVkJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICBjb25zdCByZXNwb25zZVRva2VuSXNXb3JraW5nID0gYXdhaXQgY29udGV4dC53YXp1aC5hcGkuY2xpZW50LmFzQ3VycmVudFVzZXIucmVxdWVzdCgnR0VUJywgJy8vJywge30sIHthcGlIb3N0SUR9KTtcbiAgICAgIGlmKHJlc3BvbnNlVG9rZW5Jc1dvcmtpbmcuc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZXR1cm4gRXJyb3JSZXNwb25zZSgnVG9rZW4gaXMgbm90IHZhbGlkJywgNDAxLCA0MDEsIHJlc3BvbnNlKTtcbiAgICAgIH07XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB1cGRhdGVDb25maWd1cmF0aW9uRmlsZS51cGRhdGVDb25maWd1cmF0aW9uKHJlcXVlc3QpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICBlcnJvcjogMCxcbiAgICAgICAgICBkYXRhOiByZXN1bHRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsIDMwMjEsIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIFdhenVoIGFwcCBsb2dzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAgICogQHJldHVybnMge0FycmF5PFN0cmluZz59IGFwcCBsb2dzIG9yIEVycm9yUmVzcG9uc2VcbiAgICovXG4gIGFzeW5jIGdldEFwcExvZ3MoY29udGV4dDogUmVxdWVzdEhhbmRsZXJDb250ZXh0LCByZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCByZXNwb25zZTogS2liYW5hUmVzcG9uc2VGYWN0b3J5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxhc3RMb2dzID0gYXdhaXQgcmVhZChcbiAgICAgICAgV0FaVUhfREFUQV9MT0dTX1JBV19QQVRILFxuICAgICAgICA1MFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHNwbGl0ZXJMb2cgPSBsYXN0TG9ncy5zcGxpdCgnXFxuJyk7XG4gICAgICByZXR1cm4gc3BsaXRlckxvZyAmJiBBcnJheS5pc0FycmF5KHNwbGl0ZXJMb2cpXG4gICAgICAgID8gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIGVycm9yOiAwLFxuICAgICAgICAgICAgbGFzdExvZ3M6IHNwbGl0ZXJMb2cuZmlsdGVyKFxuICAgICAgICAgICAgICBpdGVtID0+IHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyAmJiBpdGVtLmxlbmd0aFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgOiByZXNwb25zZS5vayh7IGVycm9yOiAwLCBsYXN0TG9nczogW10gfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBFcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IsIDMwMzYsIDUwMCwgcmVzcG9uc2UpO1xuICAgIH1cbiAgfVxufVxuIl19