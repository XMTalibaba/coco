"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jobInitializeRun = jobInitializeRun;

var _logger = require("../../lib/logger");

var _package = _interopRequireDefault(require("../../../package.json"));

var _kibanaTemplate = require("../../integration-files/kibana-template");

var _getConfiguration = require("../../lib/get-configuration");

var _os = require("os");

var _fs = _interopRequireDefault(require("fs"));

var _manageHosts = require("../../lib/manage-hosts");

var _constants = require("../../../common/constants");

var _filesystem = require("../../lib/filesystem");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Wazuh app - Module for app initialization
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
const manageHosts = new _manageHosts.ManageHosts();

function jobInitializeRun(context) {
  const KIBANA_INDEX = context.server.config.kibana.index;
  (0, _logger.log)('initialize', `Kibana index: ${KIBANA_INDEX}`, 'info');
  (0, _logger.log)('initialize', `App revision: ${_package.default.revision}`, 'info');
  let configurationFile = {};
  let pattern = null; // Read config from package.json and wazuh.yml

  try {
    configurationFile = (0, _getConfiguration.getConfiguration)();
    pattern = configurationFile && typeof configurationFile.pattern !== 'undefined' ? configurationFile.pattern : _constants.WAZUH_ALERTS_PATTERN; // global.XPACK_RBAC_ENABLED =
    //   configurationFile &&
    //     typeof configurationFile['xpack.rbac.enabled'] !== 'undefined'
    //     ? configurationFile['xpack.rbac.enabled']
    //     : true;
  } catch (error) {
    (0, _logger.log)('initialize', error.message || error);
    context.wazuh.logger.error('Something went wrong while reading the configuration.' + (error.message || error));
  }

  try {
    // RAM in MB
    const ram = Math.ceil((0, _os.totalmem)() / 1024 / 1024);
    (0, _logger.log)('initialize', `Total RAM: ${ram}MB`, 'info');
  } catch (error) {
    (0, _logger.log)('initialize', `Could not check total RAM due to: ${error.message || error}`);
  } // Save Wazuh App setup


  const saveConfiguration = async () => {
    try {
      const commonDate = new Date().toISOString();
      const configuration = {
        name: 'Wazuh App',
        'app-version': _package.default.version,
        revision: _package.default.revision,
        installationDate: commonDate,
        lastRestart: commonDate,
        hosts: {}
      };

      try {
        (0, _filesystem.createDataDirectoryIfNotExists)();
        (0, _filesystem.createDataDirectoryIfNotExists)('config');
        await _fs.default.writeFileSync(_constants.WAZUH_DATA_CONFIG_REGISTRY_PATH, JSON.stringify(configuration), 'utf8');
        (0, _logger.log)('initialize:saveConfiguration', 'Wazuh configuration registry inserted', 'debug');
      } catch (error) {
        (0, _logger.log)('initialize:saveConfiguration', error.message || error);
        context.wazuh.logger.error('Could not create Wazuh configuration registry');
      }
    } catch (error) {
      (0, _logger.log)('initialize:saveConfiguration', error.message || error);
      context.wazuh.logger.error('Error creating wazuh-version registry');
    }
  };
  /**
   * Checks if the .wazuh index exist in order to migrate to wazuh.yml
   */


  const checkWazuhIndex = async () => {
    try {
      (0, _logger.log)('initialize:checkWazuhIndex', `Checking ${_constants.WAZUH_INDEX} index.`, 'debug');
      const result = await context.core.elasticsearch.client.asInternalUser.indices.exists({
        index: _constants.WAZUH_INDEX
      });

      if (result.body) {
        try {
          const data = await context.core.elasticsearch.client.asInternalUser.search({
            index: _constants.WAZUH_INDEX,
            size: 100
          });
          const apiEntries = (((data || {}).body || {}).hits || {}).hits || [];
          await manageHosts.migrateFromIndex(apiEntries);
          (0, _logger.log)('initialize:checkWazuhIndex', `Index ${_constants.WAZUH_INDEX} will be removed and its content will be migrated to wazuh.yml`, 'debug'); // Check if all APIs entries were migrated properly and delete it from the .wazuh index

          await checkProperlyMigrate();
          await context.core.elasticsearch.client.asInternalUser.indices.delete({
            index: _constants.WAZUH_INDEX
          });
        } catch (error) {
          throw new Error(error);
        }
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };
  /**
   * Checks if the API entries were properly migrated
   * @param {Array} migratedApis
   */


  const checkProperlyMigrate = async () => {
    try {
      let apisIndex = await await context.core.elasticsearch.client.asInternalUser.search({
        index: _constants.WAZUH_INDEX,
        size: 100
      });
      const hosts = await manageHosts.getHosts();
      apisIndex = ((apisIndex.body || {}).hits || {}).hits || [];
      const apisIndexKeys = apisIndex.map(api => {
        return api._id;
      });
      const hostsKeys = hosts.map(api => {
        return Object.keys(api)[0];
      }); // Get into an array the API entries that were not migrated, if the length is 0 then all the API entries were properly migrated.

      const rest = apisIndexKeys.filter(k => {
        return !hostsKeys.includes(k);
      });

      if (rest.length) {
        throw new Error(`Cannot migrate all API entries, missed entries: (${rest.toString()})`);
      }

      (0, _logger.log)('initialize:checkProperlyMigrate', 'The API entries migration was successful', 'debug');
    } catch (error) {
      (0, _logger.log)('initialize:checkProperlyMigrate', `${error}`, 'error');
      return Promise.reject(error);
    }
  };
  /**
   * Checks if the .wazuh-version exists, in this case it will be deleted and the wazuh-registry.json will be created
   */


  const checkWazuhRegistry = async () => {
    try {
      (0, _logger.log)('initialize:checkwazuhRegistry', 'Checking wazuh-version registry.', 'debug');

      try {
        const exists = await context.core.elasticsearch.client.asInternalUser.indices.exists({
          index: _constants.WAZUH_VERSION_INDEX
        });

        if (exists.body) {
          await context.core.elasticsearch.client.asInternalUser.indices.delete({
            index: _constants.WAZUH_VERSION_INDEX
          });
          (0, _logger.log)('initialize[checkwazuhRegistry]', `Successfully deleted old ${_constants.WAZUH_VERSION_INDEX} index.`, 'debug');
        }

        ;
      } catch (error) {
        (0, _logger.log)('initialize[checkwazuhRegistry]', `No need to delete old ${_constants.WAZUH_VERSION_INDEX} index`, 'debug');
      }

      if (!_fs.default.existsSync(_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH)) {
        throw new Error(`The data directory is missing in the Kibana root instalation. Create the directory in ${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH} and give it the required permissions (sudo mkdir ${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH};sudo chown -R kibana:kibana ${_constants.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH}). After restart the Kibana service.`);
      }

      ;

      if (!_fs.default.existsSync(_constants.WAZUH_DATA_CONFIG_REGISTRY_PATH)) {
        (0, _logger.log)('initialize:checkwazuhRegistry', 'wazuh-version registry does not exist. Initializing configuration.', 'debug'); // Create the app registry file for the very first time

        await saveConfiguration();
      } else {
        // If this function fails, it throws an exception
        const source = JSON.parse(_fs.default.readFileSync(_constants.WAZUH_DATA_CONFIG_REGISTRY_PATH, 'utf8')); // Check if the stored revision differs from the package.json revision

        const isUpgradedApp = _package.default.revision !== source.revision || _package.default.version !== source['app-version']; // Rebuild the registry file if revision or version fields are differents

        if (isUpgradedApp) {
          (0, _logger.log)('initialize:checkwazuhRegistry', 'Wazuh app revision or version changed, regenerating wazuh-version registry', 'info'); // Rebuild registry file in blank

          await saveConfiguration();
        }
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }; // Init function. Check for "wazuh-version" document existance.


  const init = async () => {
    try {
      await Promise.all([checkWazuhIndex(), checkWazuhRegistry()]);
    } catch (error) {
      (0, _logger.log)('initialize:init', error.message || error);
      context.wazuh.logger.error(error.message || error);
      return Promise.reject(error);
    }
  };

  const createKibanaTemplate = () => {
    (0, _logger.log)('initialize:createKibanaTemplate', `Creating template for ${KIBANA_INDEX}`, 'debug');

    try {
      _kibanaTemplate.kibanaTemplate.template = KIBANA_INDEX + '*';
    } catch (error) {
      (0, _logger.log)('initialize:createKibanaTemplate', error.message || error);
      context.wazuh.logger.error('Exception: ' + error.message || error);
    }

    return context.core.elasticsearch.client.asInternalUser.indices.putTemplate({
      name: _constants.WAZUH_KIBANA_TEMPLATE_NAME,
      order: 0,
      create: true,
      body: _kibanaTemplate.kibanaTemplate
    });
  };

  const createEmptyKibanaIndex = async () => {
    try {
      (0, _logger.log)('initialize:createEmptyKibanaIndex', `Creating ${KIBANA_INDEX} index.`, 'info');
      await context.core.elasticsearch.client.asInternalUser.indices.create({
        index: KIBANA_INDEX
      });
      (0, _logger.log)('initialize:createEmptyKibanaIndex', `Successfully created ${KIBANA_INDEX} index.`, 'debug');
      await init();
      return;
    } catch (error) {
      return Promise.reject(new Error(`Error creating ${KIBANA_INDEX} index due to ${error.message || error}`));
    }
  };

  const fixKibanaTemplate = async () => {
    try {
      await createKibanaTemplate();
      (0, _logger.log)('initialize:checkKibanaStatus', `Successfully created ${KIBANA_INDEX} template.`, 'debug');
      await createEmptyKibanaIndex();
      return;
    } catch (error) {
      return Promise.reject(new Error(`Error creating template for ${KIBANA_INDEX} due to ${error.message || error}`));
    }
  };

  const getTemplateByName = async () => {
    try {
      await context.core.elasticsearch.client.asInternalUser.indices.getTemplate({
        name: _constants.WAZUH_KIBANA_TEMPLATE_NAME
      });
      (0, _logger.log)('initialize:checkKibanaStatus', `No need to create the ${KIBANA_INDEX} template, already exists.`, 'debug');
      await createEmptyKibanaIndex();
      return;
    } catch (error) {
      (0, _logger.log)('initialize:checkKibanaStatus', error.message || error);
      return fixKibanaTemplate();
    }
  }; // Does Kibana index exist?


  const checkKibanaStatus = async () => {
    try {
      const response = await context.core.elasticsearch.client.asInternalUser.indices.exists({
        index: KIBANA_INDEX
      });

      if (response.body) {
        // It exists, initialize!
        await init();
      } else {
        // No Kibana index created...
        (0, _logger.log)('initialize:checkKibanaStatus', `Not found ${KIBANA_INDEX} index`, 'info');
        await getTemplateByName();
      }
    } catch (error) {
      (0, _logger.log)('initialize:checkKibanaStatus', error.message || error);
      context.wazuh.logger.error(error.message || error);
    }
  }; // Wait until Elasticsearch js is ready


  const checkStatus = async () => {
    try {
      // TODO: wait until elasticsearch is ready?
      // await server.plugins.elasticsearch.waitUntilReady();
      return await checkKibanaStatus();
    } catch (error) {
      (0, _logger.log)('initialize:checkStatus', 'Waiting for elasticsearch plugin to be ready...', 'debug');
      setTimeout(() => checkStatus(), 3000);
    }
  }; // Check Kibana index and if it is prepared, start the initialization of Wazuh App.


  return checkStatus();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbIm1hbmFnZUhvc3RzIiwiTWFuYWdlSG9zdHMiLCJqb2JJbml0aWFsaXplUnVuIiwiY29udGV4dCIsIktJQkFOQV9JTkRFWCIsInNlcnZlciIsImNvbmZpZyIsImtpYmFuYSIsImluZGV4IiwicGFja2FnZUpTT04iLCJyZXZpc2lvbiIsImNvbmZpZ3VyYXRpb25GaWxlIiwicGF0dGVybiIsIldBWlVIX0FMRVJUU19QQVRURVJOIiwiZXJyb3IiLCJtZXNzYWdlIiwid2F6dWgiLCJsb2dnZXIiLCJyYW0iLCJNYXRoIiwiY2VpbCIsInNhdmVDb25maWd1cmF0aW9uIiwiY29tbW9uRGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsImNvbmZpZ3VyYXRpb24iLCJuYW1lIiwidmVyc2lvbiIsImluc3RhbGxhdGlvbkRhdGUiLCJsYXN0UmVzdGFydCIsImhvc3RzIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwiV0FaVUhfREFUQV9DT05GSUdfUkVHSVNUUllfUEFUSCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjaGVja1dhenVoSW5kZXgiLCJXQVpVSF9JTkRFWCIsInJlc3VsdCIsImNvcmUiLCJlbGFzdGljc2VhcmNoIiwiY2xpZW50IiwiYXNJbnRlcm5hbFVzZXIiLCJpbmRpY2VzIiwiZXhpc3RzIiwiYm9keSIsImRhdGEiLCJzZWFyY2giLCJzaXplIiwiYXBpRW50cmllcyIsImhpdHMiLCJtaWdyYXRlRnJvbUluZGV4IiwiY2hlY2tQcm9wZXJseU1pZ3JhdGUiLCJkZWxldGUiLCJFcnJvciIsIlByb21pc2UiLCJyZWplY3QiLCJhcGlzSW5kZXgiLCJnZXRIb3N0cyIsImFwaXNJbmRleEtleXMiLCJtYXAiLCJhcGkiLCJfaWQiLCJob3N0c0tleXMiLCJPYmplY3QiLCJrZXlzIiwicmVzdCIsImZpbHRlciIsImsiLCJpbmNsdWRlcyIsImxlbmd0aCIsInRvU3RyaW5nIiwiY2hlY2tXYXp1aFJlZ2lzdHJ5IiwiV0FaVUhfVkVSU0lPTl9JTkRFWCIsImV4aXN0c1N5bmMiLCJXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEgiLCJzb3VyY2UiLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImlzVXBncmFkZWRBcHAiLCJpbml0IiwiYWxsIiwiY3JlYXRlS2liYW5hVGVtcGxhdGUiLCJraWJhbmFUZW1wbGF0ZSIsInRlbXBsYXRlIiwicHV0VGVtcGxhdGUiLCJXQVpVSF9LSUJBTkFfVEVNUExBVEVfTkFNRSIsIm9yZGVyIiwiY3JlYXRlIiwiY3JlYXRlRW1wdHlLaWJhbmFJbmRleCIsImZpeEtpYmFuYVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVCeU5hbWUiLCJnZXRUZW1wbGF0ZSIsImNoZWNrS2liYW5hU3RhdHVzIiwicmVzcG9uc2UiLCJjaGVja1N0YXR1cyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFXQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQW5CQTs7Ozs7Ozs7Ozs7QUFxQkEsTUFBTUEsV0FBVyxHQUFHLElBQUlDLHdCQUFKLEVBQXBCOztBQUVPLFNBQVNDLGdCQUFULENBQTBCQyxPQUExQixFQUFtQztBQUN4QyxRQUFNQyxZQUFZLEdBQUdELE9BQU8sQ0FBQ0UsTUFBUixDQUFlQyxNQUFmLENBQXNCQyxNQUF0QixDQUE2QkMsS0FBbEQ7QUFDQSxtQkFBSSxZQUFKLEVBQW1CLGlCQUFnQkosWUFBYSxFQUFoRCxFQUFtRCxNQUFuRDtBQUNBLG1CQUFJLFlBQUosRUFBbUIsaUJBQWdCSyxpQkFBWUMsUUFBUyxFQUF4RCxFQUEyRCxNQUEzRDtBQUVBLE1BQUlDLGlCQUFpQixHQUFHLEVBQXhCO0FBQ0EsTUFBSUMsT0FBTyxHQUFHLElBQWQsQ0FOd0MsQ0FPeEM7O0FBQ0EsTUFBSTtBQUNGRCxJQUFBQSxpQkFBaUIsR0FBRyx5Q0FBcEI7QUFFQUMsSUFBQUEsT0FBTyxHQUNMRCxpQkFBaUIsSUFBSSxPQUFPQSxpQkFBaUIsQ0FBQ0MsT0FBekIsS0FBcUMsV0FB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QUNEO0FBQ0YsS0FoQkQsQ0FnQkUsT0FBTzdFLEtBQVAsRUFBYztBQUNkLHVCQUFJLDhCQUFKLEVBQW9DQSxLQUFLLENBQUNDLE9BQU4sSUFBaUJELEtBQXJEO0FBQ0FYLE1BQUFBLE9BQU8sQ0FBQ2EsS0FBUixDQUFjQyxNQUFkLENBQXFCSCxLQUFyQixDQUEyQkEsS0FBSyxDQUFDQyxPQUFOLElBQWlCRCxLQUE1QztBQUNEO0FBQ0YsR0FyQkQsQ0F0VXdDLENBNlZ4Qzs7O0FBQ0EsUUFBTWlGLFdBQVcsR0FBRyxZQUFZO0FBQzlCLFFBQUk7QUFDRjtBQUNBO0FBQ0EsYUFBTyxNQUFNRixpQkFBaUIsRUFBOUI7QUFDRCxLQUpELENBSUUsT0FBTy9FLEtBQVAsRUFBYztBQUNkLHVCQUNFLHdCQURGLEVBRUUsaURBRkYsRUFHRSxPQUhGO0FBS0FrRixNQUFBQSxVQUFVLENBQUMsTUFBTUQsV0FBVyxFQUFsQixFQUFzQixJQUF0QixDQUFWO0FBQ0Q7QUFDRixHQWJELENBOVZ3QyxDQTZXeEM7OztBQUNBLFNBQU9BLFdBQVcsRUFBbEI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBNb2R1bGUgZm9yIGFwcCBpbml0aWFsaXphdGlvblxuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uLy4uL2xpYi9sb2dnZXInO1xuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgeyBraWJhbmFUZW1wbGF0ZSB9IGZyb20gJy4uLy4uL2ludGVncmF0aW9uLWZpbGVzL2tpYmFuYS10ZW1wbGF0ZSc7XG5pbXBvcnQgeyBnZXRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vbGliL2dldC1jb25maWd1cmF0aW9uJztcbmltcG9ydCB7IHRvdGFsbWVtIH0gZnJvbSAnb3MnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IE1hbmFnZUhvc3RzIH0gZnJvbSAnLi4vLi4vbGliL21hbmFnZS1ob3N0cyc7XG5pbXBvcnQgeyBXQVpVSF9BTEVSVFNfUEFUVEVSTiwgV0FaVUhfREFUQV9DT05GSUdfUkVHSVNUUllfUEFUSCwgV0FaVUhfSU5ERVgsIFdBWlVIX1ZFUlNJT05fSU5ERVgsIFdBWlVIX0tJQkFOQV9URU1QTEFURV9OQU1FLCBXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEggfSBmcm9tICcuLi8uLi8uLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IGNyZWF0ZURhdGFEaXJlY3RvcnlJZk5vdEV4aXN0cyB9IGZyb20gJy4uLy4uL2xpYi9maWxlc3lzdGVtJztcblxuY29uc3QgbWFuYWdlSG9zdHMgPSBuZXcgTWFuYWdlSG9zdHMoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGpvYkluaXRpYWxpemVSdW4oY29udGV4dCkge1xuICBjb25zdCBLSUJBTkFfSU5ERVggPSBjb250ZXh0LnNlcnZlci5jb25maWcua2liYW5hLmluZGV4O1xuICBsb2coJ2luaXRpYWxpemUnLCBgS2liYW5hIGluZGV4OiAke0tJQkFOQV9JTkRFWH1gLCAnaW5mbycpO1xuICBsb2coJ2luaXRpYWxpemUnLCBgQXBwIHJldmlzaW9uOiAke3BhY2thZ2VKU09OLnJldmlzaW9ufWAsICdpbmZvJyk7XG5cbiAgbGV0IGNvbmZpZ3VyYXRpb25GaWxlID0ge307XG4gIGxldCBwYXR0ZXJuID0gbnVsbDtcbiAgLy8gUmVhZCBjb25maWcgZnJvbSBwYWNrYWdlLmpzb24gYW5kIHdhenVoLnltbFxuICB0cnkge1xuICAgIGNvbmZpZ3VyYXRpb25GaWxlID0gZ2V0Q29uZmlndXJhdGlvbigpO1xuXG4gICAgcGF0dGVybiA9XG4gICAgICBjb25maWd1cmF0aW9uRmlsZSAmJiB0eXBlb2YgY29uZmlndXJhdGlvbkZpbGUucGF0dGVybiAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyBjb25maWd1cmF0aW9uRmlsZS5wYXR0ZXJuXG4gICAgICAgIDogV0FaVUhfQUxFUlRTX1BBVFRFUk47XG4gICAgLy8gZ2xvYmFsLlhQQUNLX1JCQUNfRU5BQkxFRCA9XG4gICAgLy8gICBjb25maWd1cmF0aW9uRmlsZSAmJlxuICAgIC8vICAgICB0eXBlb2YgY29uZmlndXJhdGlvbkZpbGVbJ3hwYWNrLnJiYWMuZW5hYmxlZCddICE9PSAndW5kZWZpbmVkJ1xuICAgIC8vICAgICA/IGNvbmZpZ3VyYXRpb25GaWxlWyd4cGFjay5yYmFjLmVuYWJsZWQnXVxuICAgIC8vICAgICA6IHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nKCdpbml0aWFsaXplJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoXG4gICAgICAnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVhZGluZyB0aGUgY29uZmlndXJhdGlvbi4nICsgKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpXG4gICAgKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gUkFNIGluIE1CXG4gICAgY29uc3QgcmFtID0gTWF0aC5jZWlsKHRvdGFsbWVtKCkgLyAxMDI0IC8gMTAyNCk7XG4gICAgbG9nKCdpbml0aWFsaXplJywgYFRvdGFsIFJBTTogJHtyYW19TUJgLCAnaW5mbycpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZyhcbiAgICAgICdpbml0aWFsaXplJyxcbiAgICAgIGBDb3VsZCBub3QgY2hlY2sgdG90YWwgUkFNIGR1ZSB0bzogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWBcbiAgICApO1xuICB9XG5cbiAgLy8gU2F2ZSBXYXp1aCBBcHAgc2V0dXBcbiAgY29uc3Qgc2F2ZUNvbmZpZ3VyYXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbW1vbkRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7XG4gICAgICAgIG5hbWU6ICdXYXp1aCBBcHAnLFxuICAgICAgICAnYXBwLXZlcnNpb24nOiBwYWNrYWdlSlNPTi52ZXJzaW9uLFxuICAgICAgICByZXZpc2lvbjogcGFja2FnZUpTT04ucmV2aXNpb24sXG4gICAgICAgIGluc3RhbGxhdGlvbkRhdGU6IGNvbW1vbkRhdGUsXG4gICAgICAgIGxhc3RSZXN0YXJ0OiBjb21tb25EYXRlLFxuICAgICAgICBob3N0czoge31cbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICBjcmVhdGVEYXRhRGlyZWN0b3J5SWZOb3RFeGlzdHMoKTtcbiAgICAgICAgY3JlYXRlRGF0YURpcmVjdG9yeUlmTm90RXhpc3RzKCdjb25maWcnKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlU3luYyhXQVpVSF9EQVRBX0NPTkZJR19SRUdJU1RSWV9QQVRILCBKU09OLnN0cmluZ2lmeShjb25maWd1cmF0aW9uKSwgJ3V0ZjgnKTtcbiAgICAgICAgbG9nKFxuICAgICAgICAgICdpbml0aWFsaXplOnNhdmVDb25maWd1cmF0aW9uJyxcbiAgICAgICAgICAnV2F6dWggY29uZmlndXJhdGlvbiByZWdpc3RyeSBpbnNlcnRlZCcsXG4gICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbG9nKCdpbml0aWFsaXplOnNhdmVDb25maWd1cmF0aW9uJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICAgIGNvbnRleHQud2F6dWgubG9nZ2VyLmVycm9yKFxuICAgICAgICAgICdDb3VsZCBub3QgY3JlYXRlIFdhenVoIGNvbmZpZ3VyYXRpb24gcmVnaXN0cnknXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZygnaW5pdGlhbGl6ZTpzYXZlQ29uZmlndXJhdGlvbicsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoXG4gICAgICAgICdFcnJvciBjcmVhdGluZyB3YXp1aC12ZXJzaW9uIHJlZ2lzdHJ5J1xuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgLndhenVoIGluZGV4IGV4aXN0IGluIG9yZGVyIHRvIG1pZ3JhdGUgdG8gd2F6dWgueW1sXG4gICAqL1xuICBjb25zdCBjaGVja1dhenVoSW5kZXggPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvZygnaW5pdGlhbGl6ZTpjaGVja1dhenVoSW5kZXgnLCBgQ2hlY2tpbmcgJHtXQVpVSF9JTkRFWH0gaW5kZXguYCwgJ2RlYnVnJyk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgIGluZGV4OiBXQVpVSF9JTkRFWFxuICAgICAgfSk7XG4gICAgICBpZiAocmVzdWx0LmJvZHkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLnNlYXJjaCh7XG4gICAgICAgICAgICBpbmRleDogV0FaVUhfSU5ERVgsXG4gICAgICAgICAgICBzaXplOiAxMDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBhcGlFbnRyaWVzID0gKCgoZGF0YSB8fCB7fSkuYm9keSB8fCB7fSkuaGl0cyB8fCB7fSkuaGl0cyB8fCBbXTtcbiAgICAgICAgICBhd2FpdCBtYW5hZ2VIb3N0cy5taWdyYXRlRnJvbUluZGV4KGFwaUVudHJpZXMpO1xuICAgICAgICAgIGxvZyhcbiAgICAgICAgICAgICdpbml0aWFsaXplOmNoZWNrV2F6dWhJbmRleCcsXG4gICAgICAgICAgICBgSW5kZXggJHtXQVpVSF9JTkRFWH0gd2lsbCBiZSByZW1vdmVkIGFuZCBpdHMgY29udGVudCB3aWxsIGJlIG1pZ3JhdGVkIHRvIHdhenVoLnltbGAsXG4gICAgICAgICAgICAnZGVidWcnXG4gICAgICAgICAgKTtcbiAgICAgICAgICAvLyBDaGVjayBpZiBhbGwgQVBJcyBlbnRyaWVzIHdlcmUgbWlncmF0ZWQgcHJvcGVybHkgYW5kIGRlbGV0ZSBpdCBmcm9tIHRoZSAud2F6dWggaW5kZXhcbiAgICAgICAgICBhd2FpdCBjaGVja1Byb3Blcmx5TWlncmF0ZSgpO1xuICAgICAgICAgIGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmRlbGV0ZSh7XG4gICAgICAgICAgICBpbmRleDogV0FaVUhfSU5ERVhcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIEFQSSBlbnRyaWVzIHdlcmUgcHJvcGVybHkgbWlncmF0ZWRcbiAgICogQHBhcmFtIHtBcnJheX0gbWlncmF0ZWRBcGlzXG4gICAqL1xuICBjb25zdCBjaGVja1Byb3Blcmx5TWlncmF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IGFwaXNJbmRleCA9IGF3YWl0IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5zZWFyY2goe1xuICAgICAgICBpbmRleDogV0FaVUhfSU5ERVgsXG4gICAgICAgIHNpemU6IDEwMFxuICAgICAgfSk7XG4gICAgICBjb25zdCBob3N0cyA9IGF3YWl0IG1hbmFnZUhvc3RzLmdldEhvc3RzKCk7XG4gICAgICBhcGlzSW5kZXggPSAoKGFwaXNJbmRleC5ib2R5IHx8IHt9KS5oaXRzIHx8IHt9KS5oaXRzIHx8IFtdO1xuXG4gICAgICBjb25zdCBhcGlzSW5kZXhLZXlzID0gYXBpc0luZGV4Lm1hcChhcGkgPT4ge1xuICAgICAgICByZXR1cm4gYXBpLl9pZDtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgaG9zdHNLZXlzID0gaG9zdHMubWFwKGFwaSA9PiB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcGkpWzBdO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBpbnRvIGFuIGFycmF5IHRoZSBBUEkgZW50cmllcyB0aGF0IHdlcmUgbm90IG1pZ3JhdGVkLCBpZiB0aGUgbGVuZ3RoIGlzIDAgdGhlbiBhbGwgdGhlIEFQSSBlbnRyaWVzIHdlcmUgcHJvcGVybHkgbWlncmF0ZWQuXG4gICAgICBjb25zdCByZXN0ID0gYXBpc0luZGV4S2V5cy5maWx0ZXIoayA9PiB7XG4gICAgICAgIHJldHVybiAhaG9zdHNLZXlzLmluY2x1ZGVzKGspO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXN0Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYENhbm5vdCBtaWdyYXRlIGFsbCBBUEkgZW50cmllcywgbWlzc2VkIGVudHJpZXM6ICgke3Jlc3QudG9TdHJpbmcoKX0pYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgbG9nKFxuICAgICAgICAnaW5pdGlhbGl6ZTpjaGVja1Byb3Blcmx5TWlncmF0ZScsXG4gICAgICAgICdUaGUgQVBJIGVudHJpZXMgbWlncmF0aW9uIHdhcyBzdWNjZXNzZnVsJyxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdpbml0aWFsaXplOmNoZWNrUHJvcGVybHlNaWdyYXRlJywgYCR7ZXJyb3J9YCwgJ2Vycm9yJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSAud2F6dWgtdmVyc2lvbiBleGlzdHMsIGluIHRoaXMgY2FzZSBpdCB3aWxsIGJlIGRlbGV0ZWQgYW5kIHRoZSB3YXp1aC1yZWdpc3RyeS5qc29uIHdpbGwgYmUgY3JlYXRlZFxuICAgKi9cbiAgY29uc3QgY2hlY2tXYXp1aFJlZ2lzdHJ5ID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsb2coXG4gICAgICAgICdpbml0aWFsaXplOmNoZWNrd2F6dWhSZWdpc3RyeScsXG4gICAgICAgICdDaGVja2luZyB3YXp1aC12ZXJzaW9uIHJlZ2lzdHJ5LicsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICB0cnkge1xuICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgICAgaW5kZXg6IFdBWlVIX1ZFUlNJT05fSU5ERVhcbiAgICAgICAgfSk7ICAgICAgICBcbiAgICAgICAgaWYgKGV4aXN0cy5ib2R5KXtcbiAgICAgICAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuaW5kaWNlcy5kZWxldGUoe1xuICAgICAgICAgICAgaW5kZXg6IFdBWlVIX1ZFUlNJT05fSU5ERVhcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsb2coXG4gICAgICAgICAgICAnaW5pdGlhbGl6ZVtjaGVja3dhenVoUmVnaXN0cnldJyxcbiAgICAgICAgICAgIGBTdWNjZXNzZnVsbHkgZGVsZXRlZCBvbGQgJHtXQVpVSF9WRVJTSU9OX0lOREVYfSBpbmRleC5gLFxuICAgICAgICAgICAgJ2RlYnVnJ1xuICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2coXG4gICAgICAgICAgJ2luaXRpYWxpemVbY2hlY2t3YXp1aFJlZ2lzdHJ5XScsXG4gICAgICAgICAgYE5vIG5lZWQgdG8gZGVsZXRlIG9sZCAke1dBWlVIX1ZFUlNJT05fSU5ERVh9IGluZGV4YCxcbiAgICAgICAgICAnZGVidWcnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmKCFmcy5leGlzdHNTeW5jKFdBWlVIX0RBVEFfS0lCQU5BX0JBU0VfQUJTT0xVVEVfUEFUSCkpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBkYXRhIGRpcmVjdG9yeSBpcyBtaXNzaW5nIGluIHRoZSBLaWJhbmEgcm9vdCBpbnN0YWxhdGlvbi4gQ3JlYXRlIHRoZSBkaXJlY3RvcnkgaW4gJHtXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEh9IGFuZCBnaXZlIGl0IHRoZSByZXF1aXJlZCBwZXJtaXNzaW9ucyAoc3VkbyBta2RpciAke1dBWlVIX0RBVEFfS0lCQU5BX0JBU0VfQUJTT0xVVEVfUEFUSH07c3VkbyBjaG93biAtUiBraWJhbmE6a2liYW5hICR7V0FaVUhfREFUQV9LSUJBTkFfQkFTRV9BQlNPTFVURV9QQVRIfSkuIEFmdGVyIHJlc3RhcnQgdGhlIEtpYmFuYSBzZXJ2aWNlLmApO1xuICAgICAgfTtcblxuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKFdBWlVIX0RBVEFfQ09ORklHX1JFR0lTVFJZX1BBVEgpKSB7XG4gICAgICAgIGxvZyhcbiAgICAgICAgICAnaW5pdGlhbGl6ZTpjaGVja3dhenVoUmVnaXN0cnknLFxuICAgICAgICAgICd3YXp1aC12ZXJzaW9uIHJlZ2lzdHJ5IGRvZXMgbm90IGV4aXN0LiBJbml0aWFsaXppbmcgY29uZmlndXJhdGlvbi4nLFxuICAgICAgICAgICdkZWJ1ZydcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGFwcCByZWdpc3RyeSBmaWxlIGZvciB0aGUgdmVyeSBmaXJzdCB0aW1lXG4gICAgICAgIGF3YWl0IHNhdmVDb25maWd1cmF0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGlzIGZ1bmN0aW9uIGZhaWxzLCBpdCB0aHJvd3MgYW4gZXhjZXB0aW9uXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFdBWlVIX0RBVEFfQ09ORklHX1JFR0lTVFJZX1BBVEgsICd1dGY4JykpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBzdG9yZWQgcmV2aXNpb24gZGlmZmVycyBmcm9tIHRoZSBwYWNrYWdlLmpzb24gcmV2aXNpb25cbiAgICAgICAgY29uc3QgaXNVcGdyYWRlZEFwcCA9IHBhY2thZ2VKU09OLnJldmlzaW9uICE9PSBzb3VyY2UucmV2aXNpb24gfHwgcGFja2FnZUpTT04udmVyc2lvbiAhPT0gc291cmNlWydhcHAtdmVyc2lvbiddO1xuXG4gICAgICAgIC8vIFJlYnVpbGQgdGhlIHJlZ2lzdHJ5IGZpbGUgaWYgcmV2aXNpb24gb3IgdmVyc2lvbiBmaWVsZHMgYXJlIGRpZmZlcmVudHNcbiAgICAgICAgaWYgKGlzVXBncmFkZWRBcHApIHsgXG4gICAgICAgICAgbG9nKFxuICAgICAgICAgICAgJ2luaXRpYWxpemU6Y2hlY2t3YXp1aFJlZ2lzdHJ5JyxcbiAgICAgICAgICAgICdXYXp1aCBhcHAgcmV2aXNpb24gb3IgdmVyc2lvbiBjaGFuZ2VkLCByZWdlbmVyYXRpbmcgd2F6dWgtdmVyc2lvbiByZWdpc3RyeScsXG4gICAgICAgICAgICAnaW5mbydcbiAgICAgICAgICApO1xuICAgICAgICAgIC8vIFJlYnVpbGQgcmVnaXN0cnkgZmlsZSBpbiBibGFua1xuICAgICAgICAgIGF3YWl0IHNhdmVDb25maWd1cmF0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSW5pdCBmdW5jdGlvbi4gQ2hlY2sgZm9yIFwid2F6dWgtdmVyc2lvblwiIGRvY3VtZW50IGV4aXN0YW5jZS5cbiAgY29uc3QgaW5pdCA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBjaGVja1dhenVoSW5kZXgoKSxcbiAgICAgICAgY2hlY2tXYXp1aFJlZ2lzdHJ5KClcbiAgICAgIF0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2coJ2luaXRpYWxpemU6aW5pdCcsIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgY29udGV4dC53YXp1aC5sb2dnZXIuZXJyb3IoZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBjcmVhdGVLaWJhbmFUZW1wbGF0ZSA9ICgpID0+IHtcbiAgICBsb2coXG4gICAgICAnaW5pdGlhbGl6ZTpjcmVhdGVLaWJhbmFUZW1wbGF0ZScsXG4gICAgICBgQ3JlYXRpbmcgdGVtcGxhdGUgZm9yICR7S0lCQU5BX0lOREVYfWAsXG4gICAgICAnZGVidWcnXG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICBraWJhbmFUZW1wbGF0ZS50ZW1wbGF0ZSA9IEtJQkFOQV9JTkRFWCArICcqJztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdpbml0aWFsaXplOmNyZWF0ZUtpYmFuYVRlbXBsYXRlJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICBjb250ZXh0LndhenVoLmxvZ2dlci5lcnJvcihcbiAgICAgICAgJ0V4Y2VwdGlvbjogJyArIGVycm9yLm1lc3NhZ2UgfHwgZXJyb3JcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLnB1dFRlbXBsYXRlKHtcbiAgICAgIG5hbWU6IFdBWlVIX0tJQkFOQV9URU1QTEFURV9OQU1FLFxuICAgICAgb3JkZXI6IDAsXG4gICAgICBjcmVhdGU6IHRydWUsXG4gICAgICBib2R5OiBraWJhbmFUZW1wbGF0ZVxuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IGNyZWF0ZUVtcHR5S2liYW5hSW5kZXggPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvZyhcbiAgICAgICAgJ2luaXRpYWxpemU6Y3JlYXRlRW1wdHlLaWJhbmFJbmRleCcsXG4gICAgICAgIGBDcmVhdGluZyAke0tJQkFOQV9JTkRFWH0gaW5kZXguYCxcbiAgICAgICAgJ2luZm8nXG4gICAgICApO1xuICAgICAgYXdhaXQgY29udGV4dC5jb3JlLmVsYXN0aWNzZWFyY2guY2xpZW50LmFzSW50ZXJuYWxVc2VyLmluZGljZXMuY3JlYXRlKHtcbiAgICAgICAgaW5kZXg6IEtJQkFOQV9JTkRFWFxuICAgICAgfSk7XG4gICAgICBsb2coXG4gICAgICAgICdpbml0aWFsaXplOmNyZWF0ZUVtcHR5S2liYW5hSW5kZXgnLFxuICAgICAgICBgU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgJHtLSUJBTkFfSU5ERVh9IGluZGV4LmAsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICBhd2FpdCBpbml0KCk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcbiAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciBjcmVhdGluZyAke1xuICAgICAgICAgIEtJQkFOQV9JTkRFWFxuICAgICAgICAgIH0gaW5kZXggZHVlIHRvICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGZpeEtpYmFuYVRlbXBsYXRlID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjcmVhdGVLaWJhbmFUZW1wbGF0ZSgpO1xuICAgICAgbG9nKFxuICAgICAgICAnaW5pdGlhbGl6ZTpjaGVja0tpYmFuYVN0YXR1cycsXG4gICAgICAgIGBTdWNjZXNzZnVsbHkgY3JlYXRlZCAke0tJQkFOQV9JTkRFWH0gdGVtcGxhdGUuYCxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICAgIGF3YWl0IGNyZWF0ZUVtcHR5S2liYW5hSW5kZXgoKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIGNyZWF0aW5nIHRlbXBsYXRlIGZvciAke1xuICAgICAgICAgIEtJQkFOQV9JTkRFWFxuICAgICAgICAgIH0gZHVlIHRvICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGdldFRlbXBsYXRlQnlOYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjb250ZXh0LmNvcmUuZWxhc3RpY3NlYXJjaC5jbGllbnQuYXNJbnRlcm5hbFVzZXIuaW5kaWNlcy5nZXRUZW1wbGF0ZSh7XG4gICAgICAgIG5hbWU6IFdBWlVIX0tJQkFOQV9URU1QTEFURV9OQU1FXG4gICAgICB9KTtcbiAgICAgIGxvZyhcbiAgICAgICAgJ2luaXRpYWxpemU6Y2hlY2tLaWJhbmFTdGF0dXMnLFxuICAgICAgICBgTm8gbmVlZCB0byBjcmVhdGUgdGhlICR7S0lCQU5BX0lOREVYfSB0ZW1wbGF0ZSwgYWxyZWFkeSBleGlzdHMuYCxcbiAgICAgICAgJ2RlYnVnJ1xuICAgICAgKTtcbiAgICAgIGF3YWl0IGNyZWF0ZUVtcHR5S2liYW5hSW5kZXgoKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdpbml0aWFsaXplOmNoZWNrS2liYW5hU3RhdHVzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICByZXR1cm4gZml4S2liYW5hVGVtcGxhdGUoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRG9lcyBLaWJhbmEgaW5kZXggZXhpc3Q/XG4gIGNvbnN0IGNoZWNrS2liYW5hU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNvbnRleHQuY29yZS5lbGFzdGljc2VhcmNoLmNsaWVudC5hc0ludGVybmFsVXNlci5pbmRpY2VzLmV4aXN0cyh7XG4gICAgICAgIGluZGV4OiBLSUJBTkFfSU5ERVhcbiAgICAgIH0pO1xuICAgICAgaWYgKHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgICAgLy8gSXQgZXhpc3RzLCBpbml0aWFsaXplIVxuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBObyBLaWJhbmEgaW5kZXggY3JlYXRlZC4uLlxuICAgICAgICBsb2coXG4gICAgICAgICAgJ2luaXRpYWxpemU6Y2hlY2tLaWJhbmFTdGF0dXMnLFxuICAgICAgICAgIGBOb3QgZm91bmQgJHtLSUJBTkFfSU5ERVh9IGluZGV4YCxcbiAgICAgICAgICAnaW5mbydcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgZ2V0VGVtcGxhdGVCeU5hbWUoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKCdpbml0aWFsaXplOmNoZWNrS2liYW5hU3RhdHVzJywgZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gICAgICBjb250ZXh0LndhenVoLmxvZ2dlci5lcnJvcihlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gV2FpdCB1bnRpbCBFbGFzdGljc2VhcmNoIGpzIGlzIHJlYWR5XG4gIGNvbnN0IGNoZWNrU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBUT0RPOiB3YWl0IHVudGlsIGVsYXN0aWNzZWFyY2ggaXMgcmVhZHk/XG4gICAgICAvLyBhd2FpdCBzZXJ2ZXIucGx1Z2lucy5lbGFzdGljc2VhcmNoLndhaXRVbnRpbFJlYWR5KCk7XG4gICAgICByZXR1cm4gYXdhaXQgY2hlY2tLaWJhbmFTdGF0dXMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nKFxuICAgICAgICAnaW5pdGlhbGl6ZTpjaGVja1N0YXR1cycsXG4gICAgICAgICdXYWl0aW5nIGZvciBlbGFzdGljc2VhcmNoIHBsdWdpbiB0byBiZSByZWFkeS4uLicsXG4gICAgICAgICdkZWJ1ZydcbiAgICAgICk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGNoZWNrU3RhdHVzKCksIDMwMDApO1xuICAgIH1cbiAgfTtcblxuICAvLyBDaGVjayBLaWJhbmEgaW5kZXggYW5kIGlmIGl0IGlzIHByZXBhcmVkLCBzdGFydCB0aGUgaW5pdGlhbGl6YXRpb24gb2YgV2F6dWggQXBwLlxuICByZXR1cm4gY2hlY2tTdGF0dXMoKTtcbn1cbiJdfQ==