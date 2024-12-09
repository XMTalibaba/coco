"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XpackFactory = void 0;

var _constants = require("../../../../common/constants");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XpackFactory {
  constructor(security) {
    this.security = security;

    _defineProperty(this, "platform", _constants.WAZUH_SECURITY_PLUGIN_XPACK_SECURITY);
  }

  async getCurrentUser(request) {
    try {
      const authContext = await this.security.authc.getCurrentUser(request);
      if (!authContext) return {
        username: 'elastic',
        authContext: {
          username: 'elastic'
        }
      };
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
    return authContext['username'];
  }

}

exports.XpackFactory = XpackFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInhwYWNrLWZhY3RvcnkudHMiXSwibmFtZXMiOlsiWHBhY2tGYWN0b3J5IiwiY29uc3RydWN0b3IiLCJzZWN1cml0eSIsIldBWlVIX1NFQ1VSSVRZX1BMVUdJTl9YUEFDS19TRUNVUklUWSIsImdldEN1cnJlbnRVc2VyIiwicmVxdWVzdCIsImF1dGhDb250ZXh0IiwiYXV0aGMiLCJ1c2VybmFtZSIsImdldFVzZXJOYW1lIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQTs7OztBQUVPLE1BQU1BLFlBQU4sQ0FBK0M7QUFFcERDLEVBQUFBLFdBQVcsQ0FBU0MsUUFBVCxFQUF3QztBQUFBLFNBQS9CQSxRQUErQixHQUEvQkEsUUFBK0I7O0FBQUEsc0NBRGhDQywrQ0FDZ0M7QUFBRTs7QUFFckQsUUFBTUMsY0FBTixDQUFxQkMsT0FBckIsRUFBNkM7QUFDM0MsUUFBSTtBQUNGLFlBQU1DLFdBQVcsR0FBRyxNQUFNLEtBQUtKLFFBQUwsQ0FBY0ssS0FBZCxDQUFvQkgsY0FBcEIsQ0FBbUNDLE9BQW5DLENBQTFCO0FBQ0EsVUFBRyxDQUFDQyxXQUFKLEVBQWlCLE9BQU87QUFBQ0UsUUFBQUEsUUFBUSxFQUFFLFNBQVg7QUFBc0JGLFFBQUFBLFdBQVcsRUFBRTtBQUFFRSxVQUFBQSxRQUFRLEVBQUU7QUFBWjtBQUFuQyxPQUFQO0FBQ2pCLFlBQU1BLFFBQVEsR0FBRyxLQUFLQyxXQUFMLENBQWlCSCxXQUFqQixDQUFqQjtBQUNBLGFBQU87QUFBQ0UsUUFBQUEsUUFBRDtBQUFXRixRQUFBQTtBQUFYLE9BQVA7QUFDRCxLQUxELENBS0UsT0FBT0ksS0FBUCxFQUFjO0FBQ2QsWUFBTUEsS0FBTjtBQUNEO0FBQ0Y7O0FBRURELEVBQUFBLFdBQVcsQ0FBQ0gsV0FBRCxFQUFrQjtBQUMzQixXQUFPQSxXQUFXLENBQUMsVUFBRCxDQUFsQjtBQUNEOztBQWpCbUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJU2VjdXJpdHlGYWN0b3J5IH0gZnJvbSAnLi4vJ1xuaW1wb3J0IHsgU2VjdXJpdHlQbHVnaW5TZXR1cCB9IGZyb20gJ3gtcGFjay9wbHVnaW5zL3NlY3VyaXR5L3NlcnZlcic7XG5pbXBvcnQgeyBLaWJhbmFSZXF1ZXN0IH0gZnJvbSAnc3JjL2NvcmUvc2VydmVyJztcbmltcG9ydCB7IFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9YUEFDS19TRUNVUklUWSB9IGZyb20gJy4uLy4uLy4uLy4uL2NvbW1vbi9jb25zdGFudHMnO1xuXG5leHBvcnQgY2xhc3MgWHBhY2tGYWN0b3J5IGltcGxlbWVudHMgSVNlY3VyaXR5RmFjdG9yeSB7XG4gIHBsYXRmb3JtOiBzdHJpbmcgPSBXQVpVSF9TRUNVUklUWV9QTFVHSU5fWFBBQ0tfU0VDVVJJVFk7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2VjdXJpdHk6IFNlY3VyaXR5UGx1Z2luU2V0dXApIHt9XG5cbiAgYXN5bmMgZ2V0Q3VycmVudFVzZXIocmVxdWVzdDogS2liYW5hUmVxdWVzdCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhdXRoQ29udGV4dCA9IGF3YWl0IHRoaXMuc2VjdXJpdHkuYXV0aGMuZ2V0Q3VycmVudFVzZXIocmVxdWVzdCk7XG4gICAgICBpZighYXV0aENvbnRleHQpIHJldHVybiB7dXNlcm5hbWU6ICdlbGFzdGljJywgYXV0aENvbnRleHQ6IHsgdXNlcm5hbWU6ICdlbGFzdGljJ319O1xuICAgICAgY29uc3QgdXNlcm5hbWUgPSB0aGlzLmdldFVzZXJOYW1lKGF1dGhDb250ZXh0KTtcbiAgICAgIHJldHVybiB7dXNlcm5hbWUsIGF1dGhDb250ZXh0fTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7IFxuICAgIH1cbiAgfVxuXG4gIGdldFVzZXJOYW1lKGF1dGhDb250ZXh0OmFueSkge1xuICAgIHJldHVybiBhdXRoQ29udGV4dFsndXNlcm5hbWUnXTtcbiAgfVxufSJdfQ==