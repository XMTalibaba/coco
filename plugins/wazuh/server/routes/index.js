"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupRoutes = void 0;

var _wazuhApi = require("./wazuh-api");

var _wazuhElastic = require("./wazuh-elastic");

var _wazuhHosts = require("./wazuh-hosts");

var _wazuhUtils = require("./wazuh-utils");

var _wazuhReporting = require("./wazuh-reporting");

const setupRoutes = router => {
  (0, _wazuhApi.WazuhApiRoutes)(router);
  (0, _wazuhElastic.WazuhElasticRoutes)(router);
  (0, _wazuhHosts.WazuhHostsRoutes)(router);
  (0, _wazuhUtils.WazuhUtilsRoutes)(router);
  (0, _wazuhReporting.WazuhReportingRoutes)(router);
};

exports.setupRoutes = setupRoutes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbInNldHVwUm91dGVzIiwicm91dGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRU8sTUFBTUEsV0FBVyxHQUFJQyxNQUFELElBQXFCO0FBQzVDLGdDQUFlQSxNQUFmO0FBQ0Esd0NBQW1CQSxNQUFuQjtBQUNBLG9DQUFpQkEsTUFBakI7QUFDQSxvQ0FBaUJBLE1BQWpCO0FBQ0EsNENBQXFCQSxNQUFyQjtBQUNILENBTk0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJUm91dGVyIH0gZnJvbSAna2liYW5hL3NlcnZlcic7XG5pbXBvcnQgeyBXYXp1aEFwaVJvdXRlcyB9IGZyb20gJy4vd2F6dWgtYXBpJztcbmltcG9ydCB7IFdhenVoRWxhc3RpY1JvdXRlcyB9IGZyb20gXCIuL3dhenVoLWVsYXN0aWNcIjtcbmltcG9ydCB7IFdhenVoSG9zdHNSb3V0ZXMgfSBmcm9tIFwiLi93YXp1aC1ob3N0c1wiO1xuaW1wb3J0IHsgV2F6dWhVdGlsc1JvdXRlcyB9IGZyb20gXCIuL3dhenVoLXV0aWxzXCI7XG5pbXBvcnQgeyBXYXp1aFJlcG9ydGluZ1JvdXRlcyB9IGZyb20gXCIuL3dhenVoLXJlcG9ydGluZ1wiO1xuXG5leHBvcnQgY29uc3Qgc2V0dXBSb3V0ZXMgPSAocm91dGVyOiBJUm91dGVyKSA9PiB7XG4gICAgV2F6dWhBcGlSb3V0ZXMocm91dGVyKTtcbiAgICBXYXp1aEVsYXN0aWNSb3V0ZXMocm91dGVyKTtcbiAgICBXYXp1aEhvc3RzUm91dGVzKHJvdXRlcik7XG4gICAgV2F6dWhVdGlsc1JvdXRlcyhyb3V0ZXIpO1xuICAgIFdhenVoUmVwb3J0aW5nUm91dGVzKHJvdXRlcik7XG59O1xuIl19