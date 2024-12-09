"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialWazuhConfig = void 0;

/*
 * Wazuh app - Initial basic configuration file
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
const initialWazuhConfig = `---
#
# Wazuh app - App configuration file
# Copyright (C) 2015-2021 Wazuh, Inc.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# Find more information about this on the LICENSE file.
#
# ======================== Wazuh app configuration file ========================
#
# Please check the documentation for more information on configuration options:
# https://documentation.wazuh.com/current/installation-guide/index.html
#
# Also, you can check our repository:
# https://github.com/wazuh/wazuh-kibana-app
#
# ------------------------------- Index patterns -------------------------------
#
# Default index pattern to use.
#pattern: wazuh-alerts-*
#
# ----------------------------------- Checks -----------------------------------
#
# Defines which checks must to be consider by the healthcheck
# step once the Wazuh app starts. Values must to be true or false.
#checks.pattern : true
#checks.template: true
#checks.api     : true
#checks.setup   : true
#checks.metaFields: true
#checks.timeFilter: true
#checks.maxBuckets: true
#
# --------------------------------- Extensions ---------------------------------
#
# Defines which extensions should be activated when you add a new API entry.
# You can change them after Wazuh app starts.
# Values must to be true or false.
#extensions.pci       : true
#extensions.gdpr      : true
#extensions.hipaa     : true
#extensions.nist      : true
#extensions.tsc       : true
#extensions.audit     : true
#extensions.oscap     : false
#extensions.ciscat    : false
#extensions.aws       : false
#extensions.gcp       : false
#extensions.virustotal: false
#extensions.osquery   : false
#extensions.docker    : false
#
# ---------------------------------- Timeout ----------------------------------
#
# Defines maximum timeout to be used on the Wazuh app requests.
# It will be ignored if it is bellow 1500.
# It means milliseconds before we consider a request as failed.
# Default: 20000
#timeout: 20000
#
# -------------------------------- API selector --------------------------------
#
# Defines if the user is allowed to change the selected
# API directly from the Wazuh app top menu.
# Default: true
#api.selector: true
#
# --------------------------- Index pattern selector ---------------------------
#
# Defines if the user is allowed to change the selected
# index pattern directly from the Wazuh app top menu.
# Default: true
#ip.selector: true
#
# List of index patterns to be ignored
#ip.ignore: []
#
# -------------------------------- X-Pack RBAC ---------------------------------
#
# Custom setting to enable/disable built-in X-Pack RBAC security capabilities.
# Default: enabled
#xpack.rbac.enabled: true
#
# ------------------------------ wazuh-monitoring ------------------------------
#
# Custom setting to enable/disable wazuh-monitoring indices.
# Values: true, false, worker
# If worker is given as value, the app will show the Agents status
# visualization but won't insert data on wazuh-monitoring indices.
# Default: true
#wazuh.monitoring.enabled: true
#
# Custom setting to set the frequency for wazuh-monitoring indices cron task.
# Default: 900 (s)
#wazuh.monitoring.frequency: 900
#
# Configure wazuh-monitoring-* indices shards and replicas.
#wazuh.monitoring.shards: 2
#wazuh.monitoring.replicas: 0
#
# Configure wazuh-monitoring-* indices custom creation interval.
# Values: h (hourly), d (daily), w (weekly), m (monthly)
# Default: d
#wazuh.monitoring.creation: d
#
# Default index pattern to use for Wazuh monitoring
#wazuh.monitoring.pattern: wazuh-monitoring-*
#
# --------------------------------- wazuh-cron ----------------------------------
#
# Customize the index prefix of predefined jobs
# This change is not retroactive, if you change it new indexes will be created
# cron.prefix: test
#
# --------------------------------- wazuh-sample-alerts -------------------------
#
# Customize the index name prefix of sample alerts
# This change is not retroactive, if you change it new indexes will be created
# It should match with a valid index template to avoid unknown fields on
# dashboards
#alerts.sample.prefix: wazuh-alerts-4.x-
#
# ------------------------------ wazuh-statistics -------------------------------
#
# Custom setting to enable/disable statistics tasks.
#cron.statistics.status: true
#
# Enter the ID of the APIs you want to save data from, leave this empty to run
# the task on all configured APIs
#cron.statistics.apis: []
#
# Define the frequency of task execution using cron schedule expressions
#cron.statistics.interval: 0 */5 * * * *
#
# Define the name of the index in which the documents are to be saved.
#cron.statistics.index.name: statistics
#
# Define the interval in which the index will be created
#cron.statistics.index.creation: w
#
# Configure statistics indices shards and replicas.
#cron.statistics.shards: 2
#cron.statistics.replicas: 0
#
# ---------------------------- Hide manager alerts ------------------------------
# Hide the alerts of the manager in all dashboards and discover
#hideManagerAlerts: false
#
# ------------------------------- App logging level -----------------------------
# Set the logging level for the Wazuh App log files.
# Default value: info
# Allowed values: info, debug
#logs.level: info
#
# -------------------------------- Enrollment DNS -------------------------------
# Set the variable WAZUH_REGISTRATION_SERVER in agents deployment.
# Default value: ''
#enrollment.dns: ''
#
# Wazuh registration password
# Default value: ''
#enrollment.password: ''
#-------------------------------- API entries -----------------------------------
#The following configuration is the default structure to define an API entry.
#
#hosts:
#  - <id>:
      # URL
      # API url
      # url: http(s)://<url>

      # Port
      # API port
      # port: <port>

      # Username
      # API user's username
      # username: <username>

      # Password
      # API user's password
      # password: <password>

      # Run as
      # Define how the app user gets his/her app permissions.
      # Values:
      #   - true: use his/her authentication context. Require Wazuh API user allows run_as.
      #   - false or not defined: get same permissions of Wazuh API user.
      # run_as: <true|false>

hosts:
  - default:
     url: https://localhost
     port: 55000
     username: wazuh-wui
     password: wazuh-wui
     run_as: false
`;
exports.initialWazuhConfig = initialWazuhConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluaXRpYWwtd2F6dWgtY29uZmlnLnRzIl0sIm5hbWVzIjpbImluaXRpYWxXYXp1aENvbmZpZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztBQVlPLE1BQU1BLGtCQUEwQixHQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gSW5pdGlhbCBiYXNpYyBjb25maWd1cmF0aW9uIGZpbGVcbiAqIENvcHlyaWdodCAoQykgMjAxNS0yMDIxIFdhenVoLCBJbmMuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuICovXG5cbmV4cG9ydCBjb25zdCBpbml0aWFsV2F6dWhDb25maWc6IHN0cmluZyA9IGAtLS1cbiNcbiMgV2F6dWggYXBwIC0gQXBwIGNvbmZpZ3VyYXRpb24gZmlsZVxuIyBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuI1xuIyBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuIyBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuIyB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuIyAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuI1xuIyBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuI1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT0gV2F6dWggYXBwIGNvbmZpZ3VyYXRpb24gZmlsZSA9PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgUGxlYXNlIGNoZWNrIHRoZSBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGNvbmZpZ3VyYXRpb24gb3B0aW9uczpcbiMgaHR0cHM6Ly9kb2N1bWVudGF0aW9uLndhenVoLmNvbS9jdXJyZW50L2luc3RhbGxhdGlvbi1ndWlkZS9pbmRleC5odG1sXG4jXG4jIEFsc28sIHlvdSBjYW4gY2hlY2sgb3VyIHJlcG9zaXRvcnk6XG4jIGh0dHBzOi8vZ2l0aHViLmNvbS93YXp1aC93YXp1aC1raWJhbmEtYXBwXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gSW5kZXggcGF0dGVybnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZhdWx0IGluZGV4IHBhdHRlcm4gdG8gdXNlLlxuI3BhdHRlcm46IHdhenVoLWFsZXJ0cy0qXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENoZWNrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZpbmVzIHdoaWNoIGNoZWNrcyBtdXN0IHRvIGJlIGNvbnNpZGVyIGJ5IHRoZSBoZWFsdGhjaGVja1xuIyBzdGVwIG9uY2UgdGhlIFdhenVoIGFwcCBzdGFydHMuIFZhbHVlcyBtdXN0IHRvIGJlIHRydWUgb3IgZmFsc2UuXG4jY2hlY2tzLnBhdHRlcm4gOiB0cnVlXG4jY2hlY2tzLnRlbXBsYXRlOiB0cnVlXG4jY2hlY2tzLmFwaSAgICAgOiB0cnVlXG4jY2hlY2tzLnNldHVwICAgOiB0cnVlXG4jY2hlY2tzLm1ldGFGaWVsZHM6IHRydWVcbiNjaGVja3MudGltZUZpbHRlcjogdHJ1ZVxuI2NoZWNrcy5tYXhCdWNrZXRzOiB0cnVlXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFeHRlbnNpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZpbmVzIHdoaWNoIGV4dGVuc2lvbnMgc2hvdWxkIGJlIGFjdGl2YXRlZCB3aGVuIHlvdSBhZGQgYSBuZXcgQVBJIGVudHJ5LlxuIyBZb3UgY2FuIGNoYW5nZSB0aGVtIGFmdGVyIFdhenVoIGFwcCBzdGFydHMuXG4jIFZhbHVlcyBtdXN0IHRvIGJlIHRydWUgb3IgZmFsc2UuXG4jZXh0ZW5zaW9ucy5wY2kgICAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy5nZHByICAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy5oaXBhYSAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy5uaXN0ICAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy50c2MgICAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy5hdWRpdCAgICAgOiB0cnVlXG4jZXh0ZW5zaW9ucy5vc2NhcCAgICAgOiBmYWxzZVxuI2V4dGVuc2lvbnMuY2lzY2F0ICAgIDogZmFsc2VcbiNleHRlbnNpb25zLmF3cyAgICAgICA6IGZhbHNlXG4jZXh0ZW5zaW9ucy5nY3AgICAgICAgOiBmYWxzZVxuI2V4dGVuc2lvbnMudmlydXN0b3RhbDogZmFsc2VcbiNleHRlbnNpb25zLm9zcXVlcnkgICA6IGZhbHNlXG4jZXh0ZW5zaW9ucy5kb2NrZXIgICAgOiBmYWxzZVxuI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFRpbWVvdXQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZpbmVzIG1heGltdW0gdGltZW91dCB0byBiZSB1c2VkIG9uIHRoZSBXYXp1aCBhcHAgcmVxdWVzdHMuXG4jIEl0IHdpbGwgYmUgaWdub3JlZCBpZiBpdCBpcyBiZWxsb3cgMTUwMC5cbiMgSXQgbWVhbnMgbWlsbGlzZWNvbmRzIGJlZm9yZSB3ZSBjb25zaWRlciBhIHJlcXVlc3QgYXMgZmFpbGVkLlxuIyBEZWZhdWx0OiAyMDAwMFxuI3RpbWVvdXQ6IDIwMDAwXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFQSSBzZWxlY3RvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZpbmVzIGlmIHRoZSB1c2VyIGlzIGFsbG93ZWQgdG8gY2hhbmdlIHRoZSBzZWxlY3RlZFxuIyBBUEkgZGlyZWN0bHkgZnJvbSB0aGUgV2F6dWggYXBwIHRvcCBtZW51LlxuIyBEZWZhdWx0OiB0cnVlXG4jYXBpLnNlbGVjdG9yOiB0cnVlXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbmRleCBwYXR0ZXJuIHNlbGVjdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBEZWZpbmVzIGlmIHRoZSB1c2VyIGlzIGFsbG93ZWQgdG8gY2hhbmdlIHRoZSBzZWxlY3RlZFxuIyBpbmRleCBwYXR0ZXJuIGRpcmVjdGx5IGZyb20gdGhlIFdhenVoIGFwcCB0b3AgbWVudS5cbiMgRGVmYXVsdDogdHJ1ZVxuI2lwLnNlbGVjdG9yOiB0cnVlXG4jXG4jIExpc3Qgb2YgaW5kZXggcGF0dGVybnMgdG8gYmUgaWdub3JlZFxuI2lwLmlnbm9yZTogW11cbiNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gWC1QYWNrIFJCQUMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIEN1c3RvbSBzZXR0aW5nIHRvIGVuYWJsZS9kaXNhYmxlIGJ1aWx0LWluIFgtUGFjayBSQkFDIHNlY3VyaXR5IGNhcGFiaWxpdGllcy5cbiMgRGVmYXVsdDogZW5hYmxlZFxuI3hwYWNrLnJiYWMuZW5hYmxlZDogdHJ1ZVxuI1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gd2F6dWgtbW9uaXRvcmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ3VzdG9tIHNldHRpbmcgdG8gZW5hYmxlL2Rpc2FibGUgd2F6dWgtbW9uaXRvcmluZyBpbmRpY2VzLlxuIyBWYWx1ZXM6IHRydWUsIGZhbHNlLCB3b3JrZXJcbiMgSWYgd29ya2VyIGlzIGdpdmVuIGFzIHZhbHVlLCB0aGUgYXBwIHdpbGwgc2hvdyB0aGUgQWdlbnRzIHN0YXR1c1xuIyB2aXN1YWxpemF0aW9uIGJ1dCB3b24ndCBpbnNlcnQgZGF0YSBvbiB3YXp1aC1tb25pdG9yaW5nIGluZGljZXMuXG4jIERlZmF1bHQ6IHRydWVcbiN3YXp1aC5tb25pdG9yaW5nLmVuYWJsZWQ6IHRydWVcbiNcbiMgQ3VzdG9tIHNldHRpbmcgdG8gc2V0IHRoZSBmcmVxdWVuY3kgZm9yIHdhenVoLW1vbml0b3JpbmcgaW5kaWNlcyBjcm9uIHRhc2suXG4jIERlZmF1bHQ6IDkwMCAocylcbiN3YXp1aC5tb25pdG9yaW5nLmZyZXF1ZW5jeTogOTAwXG4jXG4jIENvbmZpZ3VyZSB3YXp1aC1tb25pdG9yaW5nLSogaW5kaWNlcyBzaGFyZHMgYW5kIHJlcGxpY2FzLlxuI3dhenVoLm1vbml0b3Jpbmcuc2hhcmRzOiAyXG4jd2F6dWgubW9uaXRvcmluZy5yZXBsaWNhczogMFxuI1xuIyBDb25maWd1cmUgd2F6dWgtbW9uaXRvcmluZy0qIGluZGljZXMgY3VzdG9tIGNyZWF0aW9uIGludGVydmFsLlxuIyBWYWx1ZXM6IGggKGhvdXJseSksIGQgKGRhaWx5KSwgdyAod2Vla2x5KSwgbSAobW9udGhseSlcbiMgRGVmYXVsdDogZFxuI3dhenVoLm1vbml0b3JpbmcuY3JlYXRpb246IGRcbiNcbiMgRGVmYXVsdCBpbmRleCBwYXR0ZXJuIHRvIHVzZSBmb3IgV2F6dWggbW9uaXRvcmluZ1xuI3dhenVoLm1vbml0b3JpbmcucGF0dGVybjogd2F6dWgtbW9uaXRvcmluZy0qXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB3YXp1aC1jcm9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ3VzdG9taXplIHRoZSBpbmRleCBwcmVmaXggb2YgcHJlZGVmaW5lZCBqb2JzXG4jIFRoaXMgY2hhbmdlIGlzIG5vdCByZXRyb2FjdGl2ZSwgaWYgeW91IGNoYW5nZSBpdCBuZXcgaW5kZXhlcyB3aWxsIGJlIGNyZWF0ZWRcbiMgY3Jvbi5wcmVmaXg6IHRlc3RcbiNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHdhenVoLXNhbXBsZS1hbGVydHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDdXN0b21pemUgdGhlIGluZGV4IG5hbWUgcHJlZml4IG9mIHNhbXBsZSBhbGVydHNcbiMgVGhpcyBjaGFuZ2UgaXMgbm90IHJldHJvYWN0aXZlLCBpZiB5b3UgY2hhbmdlIGl0IG5ldyBpbmRleGVzIHdpbGwgYmUgY3JlYXRlZFxuIyBJdCBzaG91bGQgbWF0Y2ggd2l0aCBhIHZhbGlkIGluZGV4IHRlbXBsYXRlIHRvIGF2b2lkIHVua25vd24gZmllbGRzIG9uXG4jIGRhc2hib2FyZHNcbiNhbGVydHMuc2FtcGxlLnByZWZpeDogd2F6dWgtYWxlcnRzLTQueC1cbiNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHdhenVoLXN0YXRpc3RpY3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDdXN0b20gc2V0dGluZyB0byBlbmFibGUvZGlzYWJsZSBzdGF0aXN0aWNzIHRhc2tzLlxuI2Nyb24uc3RhdGlzdGljcy5zdGF0dXM6IHRydWVcbiNcbiMgRW50ZXIgdGhlIElEIG9mIHRoZSBBUElzIHlvdSB3YW50IHRvIHNhdmUgZGF0YSBmcm9tLCBsZWF2ZSB0aGlzIGVtcHR5IHRvIHJ1blxuIyB0aGUgdGFzayBvbiBhbGwgY29uZmlndXJlZCBBUElzXG4jY3Jvbi5zdGF0aXN0aWNzLmFwaXM6IFtdXG4jXG4jIERlZmluZSB0aGUgZnJlcXVlbmN5IG9mIHRhc2sgZXhlY3V0aW9uIHVzaW5nIGNyb24gc2NoZWR1bGUgZXhwcmVzc2lvbnNcbiNjcm9uLnN0YXRpc3RpY3MuaW50ZXJ2YWw6IDAgKi81ICogKiAqICpcbiNcbiMgRGVmaW5lIHRoZSBuYW1lIG9mIHRoZSBpbmRleCBpbiB3aGljaCB0aGUgZG9jdW1lbnRzIGFyZSB0byBiZSBzYXZlZC5cbiNjcm9uLnN0YXRpc3RpY3MuaW5kZXgubmFtZTogc3RhdGlzdGljc1xuI1xuIyBEZWZpbmUgdGhlIGludGVydmFsIGluIHdoaWNoIHRoZSBpbmRleCB3aWxsIGJlIGNyZWF0ZWRcbiNjcm9uLnN0YXRpc3RpY3MuaW5kZXguY3JlYXRpb246IHdcbiNcbiMgQ29uZmlndXJlIHN0YXRpc3RpY3MgaW5kaWNlcyBzaGFyZHMgYW5kIHJlcGxpY2FzLlxuI2Nyb24uc3RhdGlzdGljcy5zaGFyZHM6IDJcbiNjcm9uLnN0YXRpc3RpY3MucmVwbGljYXM6IDBcbiNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBIaWRlIG1hbmFnZXIgYWxlcnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBIaWRlIHRoZSBhbGVydHMgb2YgdGhlIG1hbmFnZXIgaW4gYWxsIGRhc2hib2FyZHMgYW5kIGRpc2NvdmVyXG4jaGlkZU1hbmFnZXJBbGVydHM6IGZhbHNlXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQXBwIGxvZ2dpbmcgbGV2ZWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2V0IHRoZSBsb2dnaW5nIGxldmVsIGZvciB0aGUgV2F6dWggQXBwIGxvZyBmaWxlcy5cbiMgRGVmYXVsdCB2YWx1ZTogaW5mb1xuIyBBbGxvd2VkIHZhbHVlczogaW5mbywgZGVidWdcbiNsb2dzLmxldmVsOiBpbmZvXG4jXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVucm9sbG1lbnQgRE5TIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU2V0IHRoZSB2YXJpYWJsZSBXQVpVSF9SRUdJU1RSQVRJT05fU0VSVkVSIGluIGFnZW50cyBkZXBsb3ltZW50LlxuIyBEZWZhdWx0IHZhbHVlOiAnJ1xuI2Vucm9sbG1lbnQuZG5zOiAnJ1xuI1xuIyBXYXp1aCByZWdpc3RyYXRpb24gcGFzc3dvcmRcbiMgRGVmYXVsdCB2YWx1ZTogJydcbiNlbnJvbGxtZW50LnBhc3N3b3JkOiAnJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEFQSSBlbnRyaWVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jVGhlIGZvbGxvd2luZyBjb25maWd1cmF0aW9uIGlzIHRoZSBkZWZhdWx0IHN0cnVjdHVyZSB0byBkZWZpbmUgYW4gQVBJIGVudHJ5LlxuI1xuI2hvc3RzOlxuIyAgLSA8aWQ+OlxuICAgICAgIyBVUkxcbiAgICAgICMgQVBJIHVybFxuICAgICAgIyB1cmw6IGh0dHAocyk6Ly88dXJsPlxuXG4gICAgICAjIFBvcnRcbiAgICAgICMgQVBJIHBvcnRcbiAgICAgICMgcG9ydDogPHBvcnQ+XG5cbiAgICAgICMgVXNlcm5hbWVcbiAgICAgICMgQVBJIHVzZXIncyB1c2VybmFtZVxuICAgICAgIyB1c2VybmFtZTogPHVzZXJuYW1lPlxuXG4gICAgICAjIFBhc3N3b3JkXG4gICAgICAjIEFQSSB1c2VyJ3MgcGFzc3dvcmRcbiAgICAgICMgcGFzc3dvcmQ6IDxwYXNzd29yZD5cblxuICAgICAgIyBSdW4gYXNcbiAgICAgICMgRGVmaW5lIGhvdyB0aGUgYXBwIHVzZXIgZ2V0cyBoaXMvaGVyIGFwcCBwZXJtaXNzaW9ucy5cbiAgICAgICMgVmFsdWVzOlxuICAgICAgIyAgIC0gdHJ1ZTogdXNlIGhpcy9oZXIgYXV0aGVudGljYXRpb24gY29udGV4dC4gUmVxdWlyZSBXYXp1aCBBUEkgdXNlciBhbGxvd3MgcnVuX2FzLlxuICAgICAgIyAgIC0gZmFsc2Ugb3Igbm90IGRlZmluZWQ6IGdldCBzYW1lIHBlcm1pc3Npb25zIG9mIFdhenVoIEFQSSB1c2VyLlxuICAgICAgIyBydW5fYXM6IDx0cnVlfGZhbHNlPlxuXG5ob3N0czpcbiAgLSBkZWZhdWx0OlxuICAgICB1cmw6IGh0dHBzOi8vbG9jYWxob3N0XG4gICAgIHBvcnQ6IDU1MDAwXG4gICAgIHVzZXJuYW1lOiB3YXp1aC13dWlcbiAgICAgcGFzc3dvcmQ6IHdhenVoLXd1aVxuICAgICBydW5fYXM6IGZhbHNlXG5gXG4iXX0=