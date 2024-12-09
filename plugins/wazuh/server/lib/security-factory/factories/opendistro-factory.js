"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpendistroFactory = void 0;

var _constants = require("../../../../common/constants");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class OpendistroFactory {
  constructor(opendistroSecurityKibana) {
    this.opendistroSecurityKibana = opendistroSecurityKibana;

    _defineProperty(this, "platform", _constants.WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH);
  }

  async getCurrentUser(request, context) {
    try {
      const params = {
        path: `/_opendistro/_security/api/account`,
        method: 'GET'
      };
      const {
        body: authContext
      } = await context.core.elasticsearch.client.asCurrentUser.transport.request(params);
      const username = this.getUserName(authContext);
      return {
        username,
        authContext
      };
    } catch (error) {
      throw error;
    }
  }

  getUserName(authContext) {
    return authContext['user_name'];
  }

}

exports.OpendistroFactory = OpendistroFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wZW5kaXN0cm8tZmFjdG9yeS50cyJdLCJuYW1lcyI6WyJPcGVuZGlzdHJvRmFjdG9yeSIsImNvbnN0cnVjdG9yIiwib3BlbmRpc3Ryb1NlY3VyaXR5S2liYW5hIiwiV0FaVUhfU0VDVVJJVFlfUExVR0lOX09QRU5fRElTVFJPX0ZPUl9FTEFTVElDU0VBUkNIIiwiZ2V0Q3VycmVudFVzZXIiLCJyZXF1ZXN0IiwiY29udGV4dCIsInBhcmFtcyIsInBhdGgiLCJtZXRob2QiLCJib2R5IiwiYXV0aENvbnRleHQiLCJjb3JlIiwiZWxhc3RpY3NlYXJjaCIsImNsaWVudCIsImFzQ3VycmVudFVzZXIiLCJ0cmFuc3BvcnQiLCJ1c2VybmFtZSIsImdldFVzZXJOYW1lIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7OztBQUVPLE1BQU1BLGlCQUFOLENBQW9EO0FBR3pEQyxFQUFBQSxXQUFXLENBQVNDLHdCQUFULEVBQXdDO0FBQUEsU0FBL0JBLHdCQUErQixHQUEvQkEsd0JBQStCOztBQUFBLHNDQUZoQ0MsOERBRWdDO0FBQ2xEOztBQUVELFFBQU1DLGNBQU4sQ0FBcUJDLE9BQXJCLEVBQTZDQyxPQUE3QyxFQUE0RTtBQUMxRSxRQUFJO0FBQ0YsWUFBTUMsTUFBTSxHQUFHO0FBQ2JDLFFBQUFBLElBQUksRUFBRyxvQ0FETTtBQUViQyxRQUFBQSxNQUFNLEVBQUU7QUFGSyxPQUFmO0FBS0EsWUFBTTtBQUFDQyxRQUFBQSxJQUFJLEVBQUVDO0FBQVAsVUFBc0IsTUFBTUwsT0FBTyxDQUFDTSxJQUFSLENBQWFDLGFBQWIsQ0FBMkJDLE1BQTNCLENBQWtDQyxhQUFsQyxDQUFnREMsU0FBaEQsQ0FBMERYLE9BQTFELENBQWtFRSxNQUFsRSxDQUFsQztBQUNBLFlBQU1VLFFBQVEsR0FBRyxLQUFLQyxXQUFMLENBQWlCUCxXQUFqQixDQUFqQjtBQUNBLGFBQU87QUFBQ00sUUFBQUEsUUFBRDtBQUFXTixRQUFBQTtBQUFYLE9BQVA7QUFDRCxLQVRELENBU0UsT0FBT1EsS0FBUCxFQUFjO0FBQ2QsWUFBTUEsS0FBTjtBQUNEO0FBQ0Y7O0FBRURELEVBQUFBLFdBQVcsQ0FBQ1AsV0FBRCxFQUFrQjtBQUMzQixXQUFPQSxXQUFXLENBQUMsV0FBRCxDQUFsQjtBQUNEOztBQXZCd0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJU2VjdXJpdHlGYWN0b3J5IH0gZnJvbSAnLi4vJ1xuaW1wb3J0IHsgS2liYW5hUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXJDb250ZXh0IH0gZnJvbSAnc3JjL2NvcmUvc2VydmVyJztcbmltcG9ydCB7IFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9PUEVOX0RJU1RST19GT1JfRUxBU1RJQ1NFQVJDSCB9IGZyb20gJy4uLy4uLy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuXG5leHBvcnQgY2xhc3MgT3BlbmRpc3Ryb0ZhY3RvcnkgaW1wbGVtZW50cyBJU2VjdXJpdHlGYWN0b3J5IHtcbiAgcGxhdGZvcm06IHN0cmluZyA9IFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9PUEVOX0RJU1RST19GT1JfRUxBU1RJQ1NFQVJDSDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wZW5kaXN0cm9TZWN1cml0eUtpYmFuYTogYW55KSB7XG4gIH1cblxuICBhc3luYyBnZXRDdXJyZW50VXNlcihyZXF1ZXN0OiBLaWJhbmFSZXF1ZXN0LCBjb250ZXh0OlJlcXVlc3RIYW5kbGVyQ29udGV4dCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIHBhdGg6IGAvX29wZW5kaXN0cm8vX3NlY3VyaXR5L2FwaS9hY2NvdW50YCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHtib2R5OiBhdXRoQ29udGV4dH0gPSBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNDdXJyZW50VXNlci50cmFuc3BvcnQucmVxdWVzdChwYXJhbXMpO1xuICAgICAgY29uc3QgdXNlcm5hbWUgPSB0aGlzLmdldFVzZXJOYW1lKGF1dGhDb250ZXh0KTtcbiAgICAgIHJldHVybiB7dXNlcm5hbWUsIGF1dGhDb250ZXh0fTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7IFxuICAgIH1cbiAgfVxuXG4gIGdldFVzZXJOYW1lKGF1dGhDb250ZXh0OmFueSkge1xuICAgIHJldHVybiBhdXRoQ29udGV4dFsndXNlcl9uYW1lJ11cbiAgfVxufSJdfQ==