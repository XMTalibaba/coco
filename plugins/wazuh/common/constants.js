"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WAZUH_MODULES_ID = exports.WAZUH_AGENTS_OS_TYPE = exports.WAZUH_ERROR_DAEMONS_NOT_READY = exports.WAZUH_DEFAULT_APP_CONFIG = exports.WAZUH_QUEUE_CRON_FREQ = exports.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH = exports.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH = exports.WAZUH_DATA_LOGS_RAW_PATH = exports.WAZUH_DATA_LOGS_PLAIN_PATH = exports.WAZUH_DATA_LOGS_DIRECTORY_PATH = exports.WAZUH_DATA_CONFIG_REGISTRY_PATH = exports.WAZUH_DATA_CONFIG_APP_PATH = exports.WAZUH_DATA_CONFIG_DIRECTORY_PATH = exports.WAZUH_DATA_ABSOLUTE_PATH = exports.PLATFORM_DATA_ABSOLUTE_PATH = exports.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH = exports.WAZUH_API_RESERVED_ID_LOWER_THAN = exports.WAZUH_INDEX_REPLICAS = exports.WAZUH_INDEX_SHARDS = exports.WAZUH_CONFIGURATION_SETTINGS_NEED_RELOAD = exports.WAZUH_CONFIGURATION_SETTINGS_NEED_HEALTH_CHECK = exports.WAZUH_CONFIGURATION_SETTINGS_NEED_RESTART = exports.WAZUH_CONFIGURATION_CACHE_TIME = exports.WAZUH_MAX_BUCKETS_DEFAULT = exports.WAZUH_TIME_FILTER_DEFAULT = exports.WAZUH_SECURITY_PLUGINS = exports.WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH = exports.WAZUH_SECURITY_PLUGIN_XPACK_SECURITY = exports.WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS = exports.WAZUH_SAMPLE_ALERTS_DEFAULT_NUMBER_ALERTS = exports.WAZUH_SAMPLE_ALERTS_CATEGORY_THREAT_DETECTION = exports.WAZUH_SAMPLE_ALERTS_CATEGORY_AUDITING_POLICY_MONITORING = exports.WAZUH_SAMPLE_ALERTS_CATEGORY_SECURITY = exports.WAZUH_SAMPLE_ALERTS_INDEX_REPLICAS = exports.WAZUH_SAMPLE_ALERTS_INDEX_SHARDS = exports.WAZUH_SAMPLE_ALERT_PREFIX = exports.WAZUH_ROLE_ADMINISTRATOR_NAME = exports.WAZUH_ROLE_ADMINISTRATOR_ID = exports.WAZUH_KIBANA_TEMPLATE_NAME = exports.WAZUH_VERSION_INDEX = exports.WAZUH_INDEX = exports.WAZUH_INDEX_TYPE_STATISTICS = exports.WAZUH_MONITORING_DEFAULT_CRON_FREQ = exports.WAZUH_MONITORING_DEFAULT_FREQUENCY = exports.WAZUH_MONITORING_DEFAULT_ENABLED = exports.WAZUH_MONITORING_DEFAULT_CREATION = exports.WAZUH_MONITORING_DEFAULT_INDICES_SHARDS = exports.WAZUH_MONITORING_TEMPLATE_NAME = exports.WAZUH_MONITORING_PATTERN = exports.WAZUH_MONITORING_PREFIX = exports.WAZUH_INDEX_TYPE_MONITORING = exports.WAZUH_ALERTS_PATTERN = exports.WAZUH_ALERTS_PREFIX = exports.WAZUH_INDEX_TYPE_ALERTS = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Wazuh app - Wazuh Constants file
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
// Index patterns - Wazuh alerts
const WAZUH_INDEX_TYPE_ALERTS = "alerts";
exports.WAZUH_INDEX_TYPE_ALERTS = WAZUH_INDEX_TYPE_ALERTS;
const WAZUH_ALERTS_PREFIX = "wazuh-alerts-";
exports.WAZUH_ALERTS_PREFIX = WAZUH_ALERTS_PREFIX;
const WAZUH_ALERTS_PATTERN = "wazuh-alerts-*"; // Job - Wazuh monitoring

exports.WAZUH_ALERTS_PATTERN = WAZUH_ALERTS_PATTERN;
const WAZUH_INDEX_TYPE_MONITORING = "monitoring";
exports.WAZUH_INDEX_TYPE_MONITORING = WAZUH_INDEX_TYPE_MONITORING;
const WAZUH_MONITORING_PREFIX = "wazuh-monitoring-";
exports.WAZUH_MONITORING_PREFIX = WAZUH_MONITORING_PREFIX;
const WAZUH_MONITORING_PATTERN = "wazuh-monitoring-*";
exports.WAZUH_MONITORING_PATTERN = WAZUH_MONITORING_PATTERN;
const WAZUH_MONITORING_TEMPLATE_NAME = "wazuh-agent";
exports.WAZUH_MONITORING_TEMPLATE_NAME = WAZUH_MONITORING_TEMPLATE_NAME;
const WAZUH_MONITORING_DEFAULT_INDICES_SHARDS = 2;
exports.WAZUH_MONITORING_DEFAULT_INDICES_SHARDS = WAZUH_MONITORING_DEFAULT_INDICES_SHARDS;
const WAZUH_MONITORING_DEFAULT_CREATION = 'd';
exports.WAZUH_MONITORING_DEFAULT_CREATION = WAZUH_MONITORING_DEFAULT_CREATION;
const WAZUH_MONITORING_DEFAULT_ENABLED = true;
exports.WAZUH_MONITORING_DEFAULT_ENABLED = WAZUH_MONITORING_DEFAULT_ENABLED;
const WAZUH_MONITORING_DEFAULT_FREQUENCY = 900;
exports.WAZUH_MONITORING_DEFAULT_FREQUENCY = WAZUH_MONITORING_DEFAULT_FREQUENCY;
const WAZUH_MONITORING_DEFAULT_CRON_FREQ = '0 * * * * *'; // Job - Wazuh statistics

exports.WAZUH_MONITORING_DEFAULT_CRON_FREQ = WAZUH_MONITORING_DEFAULT_CRON_FREQ;
const WAZUH_INDEX_TYPE_STATISTICS = "statistics"; // Job - Wazuh initialize

exports.WAZUH_INDEX_TYPE_STATISTICS = WAZUH_INDEX_TYPE_STATISTICS;
const WAZUH_INDEX = '.wazuh';
exports.WAZUH_INDEX = WAZUH_INDEX;
const WAZUH_VERSION_INDEX = '.wazuh-version';
exports.WAZUH_VERSION_INDEX = WAZUH_VERSION_INDEX;
const WAZUH_KIBANA_TEMPLATE_NAME = 'wazuh-kibana'; // Permissions

exports.WAZUH_KIBANA_TEMPLATE_NAME = WAZUH_KIBANA_TEMPLATE_NAME;
const WAZUH_ROLE_ADMINISTRATOR_ID = 1;
exports.WAZUH_ROLE_ADMINISTRATOR_ID = WAZUH_ROLE_ADMINISTRATOR_ID;
const WAZUH_ROLE_ADMINISTRATOR_NAME = 'administrator'; // Sample data

exports.WAZUH_ROLE_ADMINISTRATOR_NAME = WAZUH_ROLE_ADMINISTRATOR_NAME;
const WAZUH_SAMPLE_ALERT_PREFIX = "wazuh-alerts-4.x-";
exports.WAZUH_SAMPLE_ALERT_PREFIX = WAZUH_SAMPLE_ALERT_PREFIX;
const WAZUH_SAMPLE_ALERTS_INDEX_SHARDS = 1;
exports.WAZUH_SAMPLE_ALERTS_INDEX_SHARDS = WAZUH_SAMPLE_ALERTS_INDEX_SHARDS;
const WAZUH_SAMPLE_ALERTS_INDEX_REPLICAS = 0;
exports.WAZUH_SAMPLE_ALERTS_INDEX_REPLICAS = WAZUH_SAMPLE_ALERTS_INDEX_REPLICAS;
const WAZUH_SAMPLE_ALERTS_CATEGORY_SECURITY = "security";
exports.WAZUH_SAMPLE_ALERTS_CATEGORY_SECURITY = WAZUH_SAMPLE_ALERTS_CATEGORY_SECURITY;
const WAZUH_SAMPLE_ALERTS_CATEGORY_AUDITING_POLICY_MONITORING = "auditing-policy-monitoring";
exports.WAZUH_SAMPLE_ALERTS_CATEGORY_AUDITING_POLICY_MONITORING = WAZUH_SAMPLE_ALERTS_CATEGORY_AUDITING_POLICY_MONITORING;
const WAZUH_SAMPLE_ALERTS_CATEGORY_THREAT_DETECTION = "threat-detection";
exports.WAZUH_SAMPLE_ALERTS_CATEGORY_THREAT_DETECTION = WAZUH_SAMPLE_ALERTS_CATEGORY_THREAT_DETECTION;
const WAZUH_SAMPLE_ALERTS_DEFAULT_NUMBER_ALERTS = 3000;
exports.WAZUH_SAMPLE_ALERTS_DEFAULT_NUMBER_ALERTS = WAZUH_SAMPLE_ALERTS_DEFAULT_NUMBER_ALERTS;
const WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS = {
  [WAZUH_SAMPLE_ALERTS_CATEGORY_SECURITY]: [{
    syscheck: true
  }, {
    aws: true
  }, {
    gcp: true
  }, {
    authentication: true
  }, {
    ssh: true
  }, {
    apache: true,
    alerts: 2000
  }, {
    web: true
  }, {
    windows: {
      service_control_manager: true
    },
    alerts: 1000
  }],
  [WAZUH_SAMPLE_ALERTS_CATEGORY_AUDITING_POLICY_MONITORING]: [{
    rootcheck: true
  }, {
    audit: true
  }, {
    openscap: true
  }, {
    ciscat: true
  }],
  [WAZUH_SAMPLE_ALERTS_CATEGORY_THREAT_DETECTION]: [{
    vulnerabilities: true
  }, {
    virustotal: true
  }, {
    osquery: true
  }, {
    docker: true
  }, {
    mitre: true
  }]
}; // Security

exports.WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS = WAZUH_SAMPLE_ALERTS_CATEGORIES_TYPE_ALERTS;
const WAZUH_SECURITY_PLUGIN_XPACK_SECURITY = 'X-Pack Security';
exports.WAZUH_SECURITY_PLUGIN_XPACK_SECURITY = WAZUH_SECURITY_PLUGIN_XPACK_SECURITY;
const WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH = 'Open Distro for Elasticsearch';
exports.WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH = WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH;
const WAZUH_SECURITY_PLUGINS = [WAZUH_SECURITY_PLUGIN_XPACK_SECURITY, WAZUH_SECURITY_PLUGIN_OPEN_DISTRO_FOR_ELASTICSEARCH]; // Default time filter set by the app

exports.WAZUH_SECURITY_PLUGINS = WAZUH_SECURITY_PLUGINS;
const WAZUH_TIME_FILTER_DEFAULT = {
  from: "now-24h",
  to: 'now'
}; //Default max buckets set by the app

exports.WAZUH_TIME_FILTER_DEFAULT = WAZUH_TIME_FILTER_DEFAULT;
const WAZUH_MAX_BUCKETS_DEFAULT = 200000; // App configuration

exports.WAZUH_MAX_BUCKETS_DEFAULT = WAZUH_MAX_BUCKETS_DEFAULT;
const WAZUH_CONFIGURATION_CACHE_TIME = 10000; // time in ms;

exports.WAZUH_CONFIGURATION_CACHE_TIME = WAZUH_CONFIGURATION_CACHE_TIME;
const WAZUH_CONFIGURATION_SETTINGS_NEED_RESTART = ['wazuh.monitoring.enabled', 'wazuh.monitoring.frequency', 'cron.statistics.interval', 'logs.level'];
exports.WAZUH_CONFIGURATION_SETTINGS_NEED_RESTART = WAZUH_CONFIGURATION_SETTINGS_NEED_RESTART;
const WAZUH_CONFIGURATION_SETTINGS_NEED_HEALTH_CHECK = ['pattern', 'wazuh.monitoring.replicas', 'wazuh.monitoring.creation', 'wazuh.monitoring.pattern', 'alerts.sample.prefix', 'cron.statistics.index.name', 'cron.statistics.index.creation', 'cron.statistics.index.shards', 'cron.statistics.index.replicas', 'wazuh.monitoring.shards'];
exports.WAZUH_CONFIGURATION_SETTINGS_NEED_HEALTH_CHECK = WAZUH_CONFIGURATION_SETTINGS_NEED_HEALTH_CHECK;
const WAZUH_CONFIGURATION_SETTINGS_NEED_RELOAD = ['hideManagerAlerts']; // Default number of shards and replicas for indices

exports.WAZUH_CONFIGURATION_SETTINGS_NEED_RELOAD = WAZUH_CONFIGURATION_SETTINGS_NEED_RELOAD;
const WAZUH_INDEX_SHARDS = 2;
exports.WAZUH_INDEX_SHARDS = WAZUH_INDEX_SHARDS;
const WAZUH_INDEX_REPLICAS = 0; // Reserved ids for Users/Role mapping

exports.WAZUH_INDEX_REPLICAS = WAZUH_INDEX_REPLICAS;
const WAZUH_API_RESERVED_ID_LOWER_THAN = 100; // Wazuh data path

exports.WAZUH_API_RESERVED_ID_LOWER_THAN = WAZUH_API_RESERVED_ID_LOWER_THAN;

const KIBANA_CONFIG_BASE_PATH = 'custom';
const KIBANA_CONFIG_BASE_ABSOLUTE_PATH = _path.default.join(__dirname, '../public/assets/', KIBANA_CONFIG_BASE_PATH);
const PLATFORM_DATA_ABSOLUTE_PATH = _path.default.join(KIBANA_CONFIG_BASE_ABSOLUTE_PATH, 'platform.yml');
exports.PLATFORM_DATA_ABSOLUTE_PATH = PLATFORM_DATA_ABSOLUTE_PATH;

const WAZUH_DATA_KIBANA_BASE_PATH = 'data';

const WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH = _path.default.join(__dirname, '../../../', WAZUH_DATA_KIBANA_BASE_PATH);

exports.WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH = WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH;

const WAZUH_DATA_ABSOLUTE_PATH = _path.default.join(WAZUH_DATA_KIBANA_BASE_ABSOLUTE_PATH, 'wazuh'); // Wazuh data path - config


exports.WAZUH_DATA_ABSOLUTE_PATH = WAZUH_DATA_ABSOLUTE_PATH;

const WAZUH_DATA_CONFIG_DIRECTORY_PATH = _path.default.join(WAZUH_DATA_ABSOLUTE_PATH, 'config');

exports.WAZUH_DATA_CONFIG_DIRECTORY_PATH = WAZUH_DATA_CONFIG_DIRECTORY_PATH;

const WAZUH_DATA_CONFIG_APP_PATH = _path.default.join(WAZUH_DATA_CONFIG_DIRECTORY_PATH, 'wazuh.yml');

exports.WAZUH_DATA_CONFIG_APP_PATH = WAZUH_DATA_CONFIG_APP_PATH;

const WAZUH_DATA_CONFIG_REGISTRY_PATH = _path.default.join(WAZUH_DATA_CONFIG_DIRECTORY_PATH, 'wazuh-registry.json'); // Wazuh data path - logs


exports.WAZUH_DATA_CONFIG_REGISTRY_PATH = WAZUH_DATA_CONFIG_REGISTRY_PATH;

const WAZUH_DATA_LOGS_DIRECTORY_PATH = _path.default.join(WAZUH_DATA_ABSOLUTE_PATH, 'logs');

exports.WAZUH_DATA_LOGS_DIRECTORY_PATH = WAZUH_DATA_LOGS_DIRECTORY_PATH;

const WAZUH_DATA_LOGS_PLAIN_PATH = _path.default.join(WAZUH_DATA_LOGS_DIRECTORY_PATH, 'wazuhapp-plain.log');

exports.WAZUH_DATA_LOGS_PLAIN_PATH = WAZUH_DATA_LOGS_PLAIN_PATH;

const WAZUH_DATA_LOGS_RAW_PATH = _path.default.join(WAZUH_DATA_LOGS_DIRECTORY_PATH, 'wazuhapp.log'); // Wazuh data path - downloads


exports.WAZUH_DATA_LOGS_RAW_PATH = WAZUH_DATA_LOGS_RAW_PATH;

const WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH = _path.default.join(WAZUH_DATA_ABSOLUTE_PATH, 'downloads');

exports.WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH = WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH;

const WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH = _path.default.join(WAZUH_DATA_DOWNLOADS_DIRECTORY_PATH, 'reports'); // Queue


exports.WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH = WAZUH_DATA_DOWNLOADS_REPORTS_DIRECTORY_PATH;
const WAZUH_QUEUE_CRON_FREQ = '*/15 * * * * *'; // Every 15 seconds
// Default App Config

exports.WAZUH_QUEUE_CRON_FREQ = WAZUH_QUEUE_CRON_FREQ;
const WAZUH_DEFAULT_APP_CONFIG = {
  pattern: WAZUH_ALERTS_PATTERN,
  'checks.pattern': true,
  'checks.template': true,
  'checks.api': true,
  'checks.setup': true,
  'checks.fields': true,
  'checks.metaFields': true,
  'checks.maxBuckets': true,
  'checks.timeFilter': true,
  'extensions.pci': true,
  'extensions.gdpr': true,
  'extensions.hipaa': true,
  'extensions.nist': true,
  'extensions.tsc': true,
  'extensions.audit': true,
  'extensions.oscap': false,
  'extensions.ciscat': false,
  'extensions.aws': false,
  'extensions.gcp': false,
  'extensions.virustotal': false,
  'extensions.osquery': false,
  'extensions.docker': false,
  timeout: 20000,
  'api.selector': true,
  'ip.selector': true,
  'ip.ignore': [],
  'xpack.rbac.enabled': true,
  'wazuh.monitoring.enabled': true,
  'wazuh.monitoring.frequency': 900,
  'wazuh.monitoring.shards': WAZUH_INDEX_SHARDS,
  'wazuh.monitoring.replicas': WAZUH_INDEX_REPLICAS,
  'wazuh.monitoring.creation': 'd',
  'wazuh.monitoring.pattern': WAZUH_MONITORING_PATTERN,
  'cron.prefix': 'wazuh',
  'cron.statistics.status': true,
  'cron.statistics.apis': [],
  'cron.statistics.interval': '0 */5 * * * *',
  'cron.statistics.index.name': 'statistics',
  'cron.statistics.index.creation': 'w',
  'cron.statistics.index.shards': WAZUH_INDEX_SHARDS,
  'cron.statistics.index.replicas': WAZUH_INDEX_REPLICAS,
  'alerts.sample.prefix': WAZUH_SAMPLE_ALERT_PREFIX,
  hideManagerAlerts: false,
  'logs.level': 'info',
  'enrollment.dns': ''
}; // Wazuh errors

exports.WAZUH_DEFAULT_APP_CONFIG = WAZUH_DEFAULT_APP_CONFIG;
const WAZUH_ERROR_DAEMONS_NOT_READY = 'ERROR3099 - Some Wazuh daemons are not ready yet in node'; // Agents

exports.WAZUH_ERROR_DAEMONS_NOT_READY = WAZUH_ERROR_DAEMONS_NOT_READY;
let WAZUH_AGENTS_OS_TYPE;
exports.WAZUH_AGENTS_OS_TYPE = WAZUH_AGENTS_OS_TYPE;

(function (WAZUH_AGENTS_OS_TYPE) {
  WAZUH_AGENTS_OS_TYPE["WINDOWS"] = "windows";
  WAZUH_AGENTS_OS_TYPE["LINUX"] = "linux";
  WAZUH_AGENTS_OS_TYPE["SUNOS"] = "sunos";
  WAZUH_AGENTS_OS_TYPE["DARWIN"] = "darwin";
  WAZUH_AGENTS_OS_TYPE["OTHERS"] = "";
})(WAZUH_AGENTS_OS_TYPE || (exports.WAZUH_AGENTS_OS_TYPE = WAZUH_AGENTS_OS_TYPE = {}));

let WAZUH_MODULES_ID;
exports.WAZUH_MODULES_ID = WAZUH_MODULES_ID;

(function (WAZUH_MODULES_ID) {
  WAZUH_MODULES_ID["SYSTEMCOMMANDS"] = "systemCommands"; // 主机检测-高危指令
  WAZUH_MODULES_ID["WEBATTACK"] = "webAttack"; // 风险检测-web攻击
  WAZUH_MODULES_ID["BRUTEFORCE"] = "bruteForce"; // 风险检测-暴力破解
  WAZUH_MODULES_ID["LOGTOCLEAR"] = "logToClear"; // 日志清除行为
  WAZUH_MODULES_ID["REBOUNDSHELL"] = "reboundShell"; // 风险检测-反弹shell
  WAZUH_MODULES_ID["LOCALASKRIGHT"] = "localAskRight"; // 风险检测-本地提权
  WAZUH_MODULES_ID["DATATHEFT"] = "dataTheft"; // 风险检测-数据窃取
  WAZUH_MODULES_ID["BLACKMAILVIRUS"] = "blackmailVirus"; // 勒索病毒
  WAZUH_MODULES_ID["RISKPORT"] = "riskPort"; // 高危端口
  WAZUH_MODULES_ID["ACCOUNTCHANGE"] = "accountChange"; // 账户检测-账户变更
  WAZUH_MODULES_ID["ACCOUNTUNUSUAL"] = "accountUnusual"; // 账户检测-账户异常
  WAZUH_MODULES_ID["ACCOUNTLOGIN"] = "accountLogin"; // 账户检测-账户登录
  WAZUH_MODULES_ID["ZOMBIES"] = "zombies"; // 恶意进程-僵尸进程
  WAZUH_MODULES_ID["HIDDENPROCESS"] = "hiddenProcess"; // 恶意进程-隐藏进程
  WAZUH_MODULES_ID["RISKSERVICE"] = "riskService"; // 高危系统服务
  WAZUH_MODULES_ID["VIRUSFOUND"] = "virusFound"; // 高危系统服务
  WAZUH_MODULES_ID["SYSTEMCOMMANDVERIFY"] = "systemCommandVerify"; // 高危系统服务
  
  WAZUH_MODULES_ID["SECURITY_EVENTS"] = "general";
  WAZUH_MODULES_ID["INTEGRITY_MONITORING"] = "fim";
  WAZUH_MODULES_ID["AMAZON_WEB_SERVICES"] = "aws";
  WAZUH_MODULES_ID["GOOGLE_CLOUD_PLATFORM"] = "gcp";
  WAZUH_MODULES_ID["POLICY_MONITORING"] = "pm";
  WAZUH_MODULES_ID["SECURITY_CONFIGURATION_ASSESSMENT"] = "sca";
  WAZUH_MODULES_ID["AUDITING"] = "audit";
  WAZUH_MODULES_ID["OPEN_SCAP"] = "oscap";
  WAZUH_MODULES_ID["VULNERABILITIES"] = "vuls";
  WAZUH_MODULES_ID["OSQUERY"] = "osquery";
  WAZUH_MODULES_ID["DOCKER"] = "docker";
  WAZUH_MODULES_ID["MITRE_ATTACK"] = "mitre";
  WAZUH_MODULES_ID["PCI_DSS"] = "pci";
  WAZUH_MODULES_ID["HIPAA"] = "hipaa";
  WAZUH_MODULES_ID["NIST_800_53"] = "nist";
  WAZUH_MODULES_ID["TSC"] = "tsc";
  WAZUH_MODULES_ID["CIS_CAT"] = "ciscat";
  WAZUH_MODULES_ID["VIRUSTOTAL"] = "virustotal";
  WAZUH_MODULES_ID["GDPR"] = "gdpr";
})(WAZUH_MODULES_ID || (exports.WAZUH_MODULES_ID = WAZUH_MODULES_ID = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnN0YW50cy50cyJdLCJuYW1lcyI6WyJXQVpVSF9JTkRFWF9UWVBFX0FMRVJUUyIsIldBWlVIX0FMRVJUU19QUkVGSVgiLCJXQVpVSF9BTEVSVFNfUEFUVEVSTiIsIldBWlVIX0lOREVYX1RZUEVfTU9OSVRPUklORyIsIldBWlVIX01PTklUT1JJTkdfUFJFRklYIiwiV0FaVUhfTU9OSVRPUklOR19QQVRURVJOIiwiV0FaVUhfTU9OSVRPUklOR19URU1QTEFURV9OQU1FIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0lORElDRVNfU0hBUkRTIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NSRUFUSU9OIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0VOQUJMRUQiLCJXQVpVSF9NT05JVE9SSU5HX0RFRkFVTFRfRlJFUVVFTkNZIiwiV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NST05fRlJFUSIsIldBWlVIX0lOREVYX1RZUEVfU1RBVElTVElDUyIsIldBWlVIX0lOREVYIiwiV0FaVUhfVkVSU0lPTl9JTkRFWCIsIldBWlVIX0tJQkFOQV9URU1QTEFURV9OQU1FIiwiV0FaVUhfUk9MRV9BRE1JTklTVFJBVE9SX0lEIiwiV0FaVUhfUk9MRV9BRE1JTklTVFJBVE9SX05BTUUiLCJXQVpVSF9TQU1QTEVfQUxFUlRfUFJFRklYIiwiV0FaVUhfU0FNUExFX0FMRVJUU19JTkRFWF9TSEFSRFMiLCJXQVpVSF9TQU1QTEVfQUxFUlRTX0lOREVYX1JFUExJQ0FTIiwiV0FaVUhfU0FNUExFX0FMRVJUU19DQVRFR09SWV9TRUNVUklUWSIsIldBWlVIX1NBTVBMRV9BTEVSVFNfQ0FURUdPUllfQVVESVRJTkdfUE9MSUNZX01PTklUT1JJTkciLCJXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JZX1RIUkVBVF9ERVRFQ1RJT04iLCJXQVpVSF9TQU1QTEVfQUxFUlRTX0RFRkFVTFRfTlVNQkVSX0FMRVJUUyIsIldBWlVIX1NBTVBMRV9BTEVSVFNfQ0FURUdPUklFU19UWVBFX0FMRVJUUyIsInN5c2NoZWNrIiwiYXdzIiwiZ2NwIiwiYXV0aGVudGljYXRpb24iLCJzc2giLCJhcGFjaGUiLCJhbGVydHMiLCJ3ZWIiLCJ3aW5kb3dzIiwic2VydmljZV9jb250cm9sX21hbmFnZXIiLCJyb290Y2hlY2siLCJhdWRpdCIsIm9wZW5zY2FwIiwiY2lzY2F0IiwidnVsbmVyYWJpbGl0aWVzIiwidmlydXN0b3RhbCIsIm9zcXVlcnkiLCJkb2NrZXIiLCJtaXRyZSIsIldBWlVIX1NFQ1VSSVRZX1BMVUdJTl9YUEFDS19TRUNVUklUWSIsIldBWlVIX1NFQ1VSSVRZX1BMVUdJTl9PUEVOX0RJU1RST19GT1JfRUxBU1RJQ1NFQVJDSCIsIldBWlVIX1NFQ1VSSVRZX1BMVUdJTlMiLCJXQVpVSF9USU1FX0ZJTFRFUl9ERUZBVUxUIiwiZnJvbSIsInRvIiwiV0FaVUhfTUFYX0JVQ0tFVFNfREVGQVVMVCIsIldBWlVIX0NPTkZJR1VSQVRJT05fQ0FDSEVfVElNRSIsIldBWlVIX0NPTkZJR1VSQVRJT05fU0VUVElOR1NfTkVFRF9SRVNUQVJUIiwiV0FaVUhfQ09ORklHVVJBVElPTl9TRVRUSU5HU19ORUVEX0hFQUxUSF9DSEVDSyIsIldBWlVIX0NPTkZJR1VSQVRJT05fU0VUVElOR1NfTkVFRF9SRUxPQUQiLCJXQVpVSF9JTkRFWF9TSEFSRFMiLCJXQVpVSF9JTkRFWF9SRVBMSUNBUyIsIldBWlVIX0FQSV9SRVNFUlZFRF9JRF9MT1dFUl9USEFOIiwiV0FaVUhfREFUQV9LSUJBTkFfQkFTRV9QQVRIIiwiV0FaVUhfREFUQV9LSUJBTkFfQkFTRV9BQlNPTFVURV9QQVRIIiwicGF0aCIsImpvaW4iLCJfX2Rpcm5hbWUiLCJXQVpVSF9EQVRBX0FCU09MVVRFX1BBVEgiLCJXQVpVSF9EQVRBX0NPTkZJR19ESVJFQ1RPUllfUEFUSCIsIldBWlVIX0RBVEFfQ09ORklHX0FQUF9QQVRIIiwiV0FaVUhfREFUQV9DT05GSUdfUkVHSVNUUllfUEFUSCIsIldBWlVIX0RBVEFfTE9HU19ESVJFQ1RPUllfUEFUSCIsIldBWlVIX0RBVEFfTE9HU19QTEFJTl9QQVRIIiwiV0FaVUhfREFUQV9MT0dTX1JBV19QQVRIIiwiV0FaVUhfREFUQV9ET1dOTE9BRFNfRElSRUNUT1JZX1BBVEgiLCJXQVpVSF9EQVRBX0RPV05MT0FEU19SRVBPUlRTX0RJUkVDVE9SWV9QQVRIIiwiV0FaVUhfUVVFVUVfQ1JPTl9GUkVRIiwiV0FaVUhfREVGQVVMVF9BUFBfQ09ORklHIiwicGF0dGVybiIsInRpbWVvdXQiLCJoaWRlTWFuYWdlckFsZXJ0cyIsIldBWlVIX0VSUk9SX0RBRU1PTlNfTk9UX1JFQURZIiwiV0FaVUhfQUdFTlRTX09TX1RZUEUiLCJXQVpVSF9NT0RVTEVTX0lEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBV0E7Ozs7QUFYQTs7Ozs7Ozs7Ozs7QUFhQTtBQUNPLE1BQU1BLHVCQUF1QixHQUFHLFFBQWhDOztBQUNBLE1BQU1DLG1CQUFtQixHQUFHLGVBQTVCOztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLGdCQUE3QixDLENBRVA7OztBQUVPLE1BQU1DLDJCQUEyQixHQUFHLFlBQXBDOztBQUNBLE1BQU1DLHVCQUF1QixHQUFHLG1CQUFoQzs7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxvQkFBakM7O0FBQ0EsTUFBTUMsOEJBQThCLEdBQUcsYUFBdkM7O0FBQ0EsTUFBTUMsdUNBQXVDLEdBQUcsQ0FBaEQ7O0FBQ0EsTUFBTUMsaUNBQWlDLEdBQUcsR0FBMUM7O0FBQ0EsTUFBTUMsZ0NBQWdDLEdBQUcsSUFBekM7O0FBQ0EsTUFBTUMsa0NBQWtDLEdBQUcsR0FBM0M7O0FBQ0EsTUFBTUMsa0NBQWtDLEdBQUcsYUFBM0MsQyxDQUVQOzs7QUFFTyxNQUFNQywyQkFBMkIsR0FBRyxZQUFwQyxDLENBRVA7OztBQUNPLE1BQU1DLFdBQVcsR0FBRyxRQUFwQjs7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxnQkFBNUI7O0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsY0FBbkMsQyxDQUVQOzs7QUFDTyxNQUFNQywyQkFBMkIsR0FBRyxDQUFw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QUFqQyxDLENBZ0RQOzs7QUFDTyxNQUFNQyw2QkFBNkIsR0FBRywwREFBdEMsQyxDQUVQOzs7SUFDWUMsb0I7OztXQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtHQUFBQSxvQixvQ0FBQUEsb0I7O0lBUUFDLGdCOzs7V0FBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7QUFBQUEsRUFBQUEsZ0I7R0FBQUEsZ0IsZ0NBQUFBLGdCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIFdhenVoIENvbnN0YW50cyBmaWxlXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMiBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogRmluZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgb24gdGhlIExJQ0VOU0UgZmlsZS5cbiAqL1xuaW1wb3J0IHBhdGggIGZyb20gJ3BhdGgnO1xuXG4vLyBJbmRleCBwYXR0ZXJucyAtIFdhenVoIGFsZXJ0c1xuZXhwb3J0IGNvbnN0IFdBWlVIX0lOREVYX1RZUEVfQUxFUlRTID0gXCJhbGVydHNcIjtcbmV4cG9ydCBjb25zdCBXQVpVSF9BTEVSVFNfUFJFRklYID0gXCJ3YXp1aC1hbGVydHMtXCI7XG5leHBvcnQgY29uc3QgV0FaVUhfQUxFUlRTX1BBVFRFUk4gPSBcIndhenVoLWFsZXJ0cy0qXCI7XG5cbi8vIEpvYiAtIFdhenVoIG1vbml0b3JpbmdcblxuZXhwb3J0IGNvbnN0IFdBWlVIX0lOREVYX1RZUEVfTU9OSVRPUklORyA9IFwibW9uaXRvcmluZ1wiO1xuZXhwb3J0IGNvbnN0IFdBWlVIX01PTklUT1JJTkdfUFJFRklYID0gXCJ3YXp1aC1tb25pdG9yaW5nLVwiO1xuZXhwb3J0IGNvbnN0IFdBWlVIX01PTklUT1JJTkdfUEFUVEVSTiA9IFwid2F6dWgtbW9uaXRvcmluZy0qXCI7XG5leHBvcnQgY29uc3QgV0FaVUhfTU9OSVRPUklOR19URU1QTEFURV9OQU1FID0gXCJ3YXp1aC1hZ2VudFwiO1xuZXhwb3J0IGNvbnN0IFdBWlVIX01PTklUT1JJTkdfREVGQVVMVF9JTkRJQ0VTX1NIQVJEUyA9IDI7XG5leHBvcnQgY29uc3QgV0FaVUhfTU9OSVRPUklOR19ERUZBVUxUX0NSRUFUSU9OID0gJ2QnO1xuZXhwb3J0IGNvbnN0IFdBWlVIX01PTklUT1JJTkdfREVGQVVMVF9FTkFCTEVEID0gdHJ1ZTtcbmV4cG9ydCBjb25zdCBXQVpVSF9NT05JVE9SSU5HX0RFRkFVTFRfRlJFUVVFTkNZID0gOTAwO1xuZXhwb3J0IGNvbnN0IFdBWlVIX01PTklUT1JJTkdfREVGQVVMVF9DUk9OX0ZSRVEgPSAnMCAqICogKiAqIConO1xuXG4vLyBKb2IgLSBXYXp1aCBzdGF0aXN0aWNzXG5cbmV4cG9ydCBjb25zdCBXQVpVSF9JTkRFWF9UWVBFX1NUQVRJU1RJQ1MgPSBcInN0YXRpc3RpY3NcIjtcblxuLy8gSm9iIC0gV2F6dWggaW5pdGlhbGl6ZVxuZXhwb3J0IGNvbnN0IFdBWlVIX0lOREVYID0gJy53YXp1aCc7XG5leHBvcnQgY29uc3QgV0FaVUhfVkVSU0lPTl9JTkRFWCA9ICcud2F6dWgtdmVyc2lvbic7XG5leHBvcnQgY29uc3QgV0FaVUhfS0lCQU5BX1RFTVBMQVRFX05BTUUgPSAnd2F6dWgta2liYW5hJztcblxuLy8gUGVybWlzc2lvbnNcbmV4cG9ydCBjb25zdCBXQVpVSF9ST0xFX0FETUlOSVNUUkFUT1JfSUQgPSAxO1xuZXhwb3J0IGNvbnN0IFdBWlVIX1JPTEVfQURNSU5JU1RSQVRPUl9OQU1FID0gJ2FkbWluaXN0cmF0b3InO1xuXG4vLyBTYW1wbGUgZGF0YVxuZXhwb3J0IGNvbnN0IFdBWlVIX1NBTVBMRV9BTEVSVF9QUkVGSVggPSBcIndhenVoLWFsZXJ0cy00LngtXCI7XG5leHBvcnQgY29uc3QgV0FaVUhfU0FNUExFX0FMRVJUU19JTkRFWF9TSEFSRFMgPSAxO1xuZXhwb3J0IGNvbnN0IFdBWlVIX1NBTVBMRV9BTEVSVFNfSU5ERVhfUkVQTElDQVMgPSAwO1xuZXhwb3J0IGNvbnN0IFdBWlVIX1NBTVBMRV9BTEVSVFNfQ0FURUdPUllfU0VDVVJJVFkgPSBcInNlY3VyaXR5XCI7XG5leHBvcnQgY29uc3QgV0FaVUhfU0FNUExFX0FMRVJUU19DQVRFR09SWV9BVURJVElOR19QT0xJQ1lfTU9OSVRPUklORyA9IFwiYXVkaXRpbmctcG9saWN5LW1vbml0b3JpbmdcIjtcbmV4cG9ydCBjb25zdCBXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JZX1RIUkVBVF9ERVRFQ1RJT04gPSBcInRocmVhdC1kZXRlY3Rpb25cIjtcbmV4cG9ydCBjb25zdCBXQVpVSF9TQU1QTEVfQUxFUlRTX0RFRkFVTFRfTlVNQkVSX0FMRVJUUyA9IDMwMDA7XG5leHBvcnQgY29uc3QgV0FaVUhfU0FNUExFX0FMRVJUU19DQVRFR09SSUVTX1RZUEVfQUxFUlRTID0ge1xuICBbV0FaVUhfU0FNUExFX0FMRVJUU19DQVRFR09SWV9TRUNVUklUWV06IFt7IHN5c2NoZWNrOiB0cnVlIH0sIHsgYXdzOiB0cnVlIH0sIHsgZ2NwOiB0cnVlIH0sIHsgYXV0aGVudGljYXRpb246IHRydWUgfSwgeyBzc2g6IHRydWUgfSwgeyBhcGFjaGU6IHRydWUsIGFsZXJ0czogMjAwMCB9LCB7IHdlYjogdHJ1ZSB9LCB7IHdpbmRvd3M6IHsgc2VydmljZV9jb250cm9sX21hbmFnZXI6IHRydWUgfSwgYWxlcnRzOiAxMDAwIH1dLFxuICBbV0FaVUhfU0FNUExFX0FMRVJUU19DQVRFR09SWV9BVURJVElOR19QT0xJQ1lfTU9OSVRPUklOR106IFt7IHJvb3RjaGVjazogdHJ1ZSB9LCB7IGF1ZGl0OiB0cnVlIH0sIHsgb3BlbnNjYXA6IHRydWUgfSwgeyBjaXNjYXQ6IHRydWUgfV0sXG4gIFtXQVpVSF9TQU1QTEVfQUxFUlRTX0NBVEVHT1JZX1RIUkVBVF9ERVRFQ1RJT05dOiBbeyB2dWxuZXJhYmlsaXRpZXM6IHRydWUgfSwgeyB2aXJ1c3RvdGFsOiB0cnVlIH0sIHsgb3NxdWVyeTogdHJ1ZSB9LCB7IGRvY2tlcjogdHJ1ZSB9LCB7IG1pdHJlOiB0cnVlIH1dXG59O1xuXG4vLyBTZWN1cml0eVxuZXhwb3J0IGNvbnN0IFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9YUEFDS19TRUNVUklUWSA9ICdYLVBhY2sgU2VjdXJpdHknO1xuZXhwb3J0IGNvbnN0IFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9PUEVOX0RJU1RST19GT1JfRUxBU1RJQ1NFQVJDSCA9ICdPcGVuIERpc3RybyBmb3IgRWxhc3RpY3NlYXJjaCc7XG5cbmV4cG9ydCBjb25zdCBXQVpVSF9TRUNVUklUWV9QTFVHSU5TID0gW1xuICBXQVpVSF9TRUNVUklUWV9QTFVHSU5fWFBBQ0tfU0VDVVJJVFksXG4gIFdBWlVIX1NFQ1VSSVRZX1BMVUdJTl9PUEVOX0RJU1RST19GT1JfRUxBU1RJQ1NFQVJDSFxuXTtcblxuLy8gRGVmYXVsdCB0aW1lIGZpbHRlciBzZXQgYnkgdGhlIGFwcFxuZXhwb3J0IGNvbnN0IFdBWlVIX1RJTUVfRklMVEVSX0RFRkFVTFQgPSB7XG4gIGZyb206IFwibm93LTI0aFwiLFxuICB0bzogJ25vdydcbn07XG5cbi8vRGVmYXVsdCBtYXggYnVja2V0cyBzZXQgYnkgdGhlIGFwcFxuZXhwb3J0IGNvbnN0IFdBWlVIX01BWF9CVUNLRVRTX0RFRkFVTFQgPSAyMDAwMDA7XG5cbi8vIEFwcCBjb25maWd1cmF0aW9uXG5leHBvcnQgY29uc3QgV0FaVUhfQ09ORklHVVJBVElPTl9DQUNIRV9USU1FID0gMTAwMDAgLy8gdGltZSBpbiBtcztcbmV4cG9ydCBjb25zdCBXQVpVSF9DT05GSUdVUkFUSU9OX1NFVFRJTkdTX05FRURfUkVTVEFSVCA9IFtcbiAgJ3dhenVoLm1vbml0b3JpbmcuZW5hYmxlZCcsXG4gICd3YXp1aC5tb25pdG9yaW5nLmZyZXF1ZW5jeScsXG4gICdjcm9uLnN0YXRpc3RpY3MuaW50ZXJ2YWwnLFxuICAnbG9ncy5sZXZlbCcsXG5dO1xuZXhwb3J0IGNvbnN0IFdBWlVIX0NPTkZJR1VSQVRJT05fU0VUVElOR1NfTkVFRF9IRUFMVEhfQ0hFQ0sgPSBbXG4gICdwYXR0ZXJuJyxcbiAgJ3dhenVoLm1vbml0b3JpbmcucmVwbGljYXMnLFxuICAnd2F6dWgubW9uaXRvcmluZy5jcmVhdGlvbicsXG4gICd3YXp1aC5tb25pdG9yaW5nLnBhdHRlcm4nLFxuICAnYWxlcnRzLnNhbXBsZS5wcmVmaXgnLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmluZGV4Lm5hbWUnLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmluZGV4LmNyZWF0aW9uJyxcbiAgJ2Nyb24uc3RhdGlzdGljcy5pbmRleC5zaGFyZHMnLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmluZGV4LnJlcGxpY2FzJyxcbiAgJ3dhenVoLm1vbml0b3Jpbmcuc2hhcmRzJ1xuXTtcbmV4cG9ydCBjb25zdCBXQVpVSF9DT05GSUdVUkFUSU9OX1NFVFRJTkdTX05FRURfUkVMT0FEID0gW1xuICAnaGlkZU1hbmFnZXJBbGVydHMnLFxuXTtcblxuLy8gRGVmYXVsdCBudW1iZXIgb2Ygc2hhcmRzIGFuZCByZXBsaWNhcyBmb3IgaW5kaWNlc1xuZXhwb3J0IGNvbnN0IFdBWlVIX0lOREVYX1NIQVJEUyA9IDI7XG5leHBvcnQgY29uc3QgV0FaVUhfSU5ERVhfUkVQTElDQVMgPSAwO1xuXG4vLyBSZXNlcnZlZCBpZHMgZm9yIFVzZXJzL1JvbGUgbWFwcGluZ1xuZXhwb3J0IGNvbnN0IFdBWlVIX0FQSV9SRVNFUlZFRF9JRF9MT1dFUl9USEFOID0gMTAwO1xuXG4vLyBXYXp1aCBkYXRhIHBhdGhcbmNvbnN0IFdBWlVIX0RBVEFfS0lCQU5BX0JBU0VfUEFUSCA9ICdkYXRhJztcbmV4cG9ydCBjb25zdCBXQVpVSF9EQVRBX0tJQkFOQV9CQVNFX0FCU09MVVRFX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vJywgV0FaVUhfREFUQV9LSUJBTkFfQkFTRV9QQVRIKTtcbmV4cG9ydCBjb25zdCBXQVpVSF9EQVRBX0FCU09MVVRFX1BBVEggPSBwYXRoLmpvaW4oV0FaVUhfREFUQV9LSUJBTkFfQkFTRV9BQlNPTFVURV9QQVRILCAnd2F6dWgnKTtcblxuLy8gV2F6dWggZGF0YSBwYXRoIC0gY29uZmlnXG5leHBvcnQgY29uc3QgV0FaVUhfREFUQV9DT05GSUdfRElSRUNUT1JZX1BBVEggPSBwYXRoLmpvaW4oV0FaVUhfREFUQV9BQlNPTFVURV9QQVRILCAnY29uZmlnJyk7XG5leHBvcnQgY29uc3QgV0FaVUhfREFUQV9DT05GSUdfQVBQX1BBVEggPSBwYXRoLmpvaW4oV0FaVUhfREFUQV9DT05GSUdfRElSRUNUT1JZX1BBVEgsICd3YXp1aC55bWwnKTtcbmV4cG9ydCBjb25zdCBXQVpVSF9EQVRBX0NPTkZJR19SRUdJU1RSWV9QQVRIID0gcGF0aC5qb2luKFdBWlVIX0RBVEFfQ09ORklHX0RJUkVDVE9SWV9QQVRILCAnd2F6dWgtcmVnaXN0cnkuanNvbicpO1xuXG4vLyBXYXp1aCBkYXRhIHBhdGggLSBsb2dzXG5leHBvcnQgY29uc3QgV0FaVUhfREFUQV9MT0dTX0RJUkVDVE9SWV9QQVRIID0gcGF0aC5qb2luKFdBWlVIX0RBVEFfQUJTT0xVVEVfUEFUSCwgJ2xvZ3MnKTtcbmV4cG9ydCBjb25zdCBXQVpVSF9EQVRBX0xPR1NfUExBSU5fUEFUSCA9IHBhdGguam9pbihXQVpVSF9EQVRBX0xPR1NfRElSRUNUT1JZX1BBVEgsICd3YXp1aGFwcC1wbGFpbi5sb2cnKTtcbmV4cG9ydCBjb25zdCBXQVpVSF9EQVRBX0xPR1NfUkFXX1BBVEggPSBwYXRoLmpvaW4oV0FaVUhfREFUQV9MT0dTX0RJUkVDVE9SWV9QQVRILCAnd2F6dWhhcHAubG9nJyk7XG5cbi8vIFdhenVoIGRhdGEgcGF0aCAtIGRvd25sb2Fkc1xuZXhwb3J0IGNvbnN0IFdBWlVIX0RBVEFfRE9XTkxPQURTX0RJUkVDVE9SWV9QQVRIID0gcGF0aC5qb2luKFdBWlVIX0RBVEFfQUJTT0xVVEVfUEFUSCwgJ2Rvd25sb2FkcycpO1xuZXhwb3J0IGNvbnN0IFdBWlVIX0RBVEFfRE9XTkxPQURTX1JFUE9SVFNfRElSRUNUT1JZX1BBVEggPSBwYXRoLmpvaW4oV0FaVUhfREFUQV9ET1dOTE9BRFNfRElSRUNUT1JZX1BBVEgsICdyZXBvcnRzJyk7XG5cbi8vIFF1ZXVlXG5leHBvcnQgY29uc3QgV0FaVUhfUVVFVUVfQ1JPTl9GUkVRID0gJyovMTUgKiAqICogKiAqJzsgLy8gRXZlcnkgMTUgc2Vjb25kc1xuXG4vLyBEZWZhdWx0IEFwcCBDb25maWdcbmV4cG9ydCBjb25zdCBXQVpVSF9ERUZBVUxUX0FQUF9DT05GSUcgPSB7XG4gIHBhdHRlcm46IFdBWlVIX0FMRVJUU19QQVRURVJOLFxuICAnY2hlY2tzLnBhdHRlcm4nOiB0cnVlLFxuICAnY2hlY2tzLnRlbXBsYXRlJzogdHJ1ZSxcbiAgJ2NoZWNrcy5hcGknOiB0cnVlLFxuICAnY2hlY2tzLnNldHVwJzogdHJ1ZSxcbiAgJ2NoZWNrcy5maWVsZHMnOiB0cnVlLFxuICAnY2hlY2tzLm1ldGFGaWVsZHMnOiB0cnVlLFxuICAnY2hlY2tzLm1heEJ1Y2tldHMnOiB0cnVlLFxuICAnY2hlY2tzLnRpbWVGaWx0ZXInOiB0cnVlLFxuICAnZXh0ZW5zaW9ucy5wY2knOiB0cnVlLFxuICAnZXh0ZW5zaW9ucy5nZHByJzogdHJ1ZSxcbiAgJ2V4dGVuc2lvbnMuaGlwYWEnOiB0cnVlLFxuICAnZXh0ZW5zaW9ucy5uaXN0JzogdHJ1ZSxcbiAgJ2V4dGVuc2lvbnMudHNjJzogdHJ1ZSxcbiAgJ2V4dGVuc2lvbnMuYXVkaXQnOiB0cnVlLFxuICAnZXh0ZW5zaW9ucy5vc2NhcCc6IGZhbHNlLFxuICAnZXh0ZW5zaW9ucy5jaXNjYXQnOiBmYWxzZSxcbiAgJ2V4dGVuc2lvbnMuYXdzJzogZmFsc2UsXG4gICdleHRlbnNpb25zLmdjcCc6IGZhbHNlLFxuICAnZXh0ZW5zaW9ucy52aXJ1c3RvdGFsJzogZmFsc2UsXG4gICdleHRlbnNpb25zLm9zcXVlcnknOiBmYWxzZSxcbiAgJ2V4dGVuc2lvbnMuZG9ja2VyJzogZmFsc2UsXG4gIHRpbWVvdXQ6IDIwMDAwLFxuICAnYXBpLnNlbGVjdG9yJzogdHJ1ZSxcbiAgJ2lwLnNlbGVjdG9yJzogdHJ1ZSxcbiAgJ2lwLmlnbm9yZSc6IFtdLFxuICAneHBhY2sucmJhYy5lbmFibGVkJzogdHJ1ZSxcbiAgJ3dhenVoLm1vbml0b3JpbmcuZW5hYmxlZCc6IHRydWUsXG4gICd3YXp1aC5tb25pdG9yaW5nLmZyZXF1ZW5jeSc6IDkwMCxcbiAgJ3dhenVoLm1vbml0b3Jpbmcuc2hhcmRzJzogV0FaVUhfSU5ERVhfU0hBUkRTLFxuICAnd2F6dWgubW9uaXRvcmluZy5yZXBsaWNhcyc6IFdBWlVIX0lOREVYX1JFUExJQ0FTLFxuICAnd2F6dWgubW9uaXRvcmluZy5jcmVhdGlvbic6ICdkJyxcbiAgJ3dhenVoLm1vbml0b3JpbmcucGF0dGVybic6IFdBWlVIX01PTklUT1JJTkdfUEFUVEVSTixcbiAgJ2Nyb24ucHJlZml4JzogJ3dhenVoJyxcbiAgJ2Nyb24uc3RhdGlzdGljcy5zdGF0dXMnOiB0cnVlLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmFwaXMnOiBbXSxcbiAgJ2Nyb24uc3RhdGlzdGljcy5pbnRlcnZhbCc6ICcwICovNSAqICogKiAqJyxcbiAgJ2Nyb24uc3RhdGlzdGljcy5pbmRleC5uYW1lJzogJ3N0YXRpc3RpY3MnLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmluZGV4LmNyZWF0aW9uJzogJ3cnLFxuICAnY3Jvbi5zdGF0aXN0aWNzLmluZGV4LnNoYXJkcyc6IFdBWlVIX0lOREVYX1NIQVJEUyxcbiAgJ2Nyb24uc3RhdGlzdGljcy5pbmRleC5yZXBsaWNhcyc6IFdBWlVIX0lOREVYX1JFUExJQ0FTLFxuICAnYWxlcnRzLnNhbXBsZS5wcmVmaXgnOiBXQVpVSF9TQU1QTEVfQUxFUlRfUFJFRklYLFxuICBoaWRlTWFuYWdlckFsZXJ0czogZmFsc2UsXG4gICdsb2dzLmxldmVsJzogJ2luZm8nLFxuICAnZW5yb2xsbWVudC5kbnMnOiAnJ1xufTtcblxuLy8gV2F6dWggZXJyb3JzXG5leHBvcnQgY29uc3QgV0FaVUhfRVJST1JfREFFTU9OU19OT1RfUkVBRFkgPSAnRVJST1IzMDk5IC0gU29tZSBXYXp1aCBkYWVtb25zIGFyZSBub3QgcmVhZHkgeWV0IGluIG5vZGUnO1xuXG4vLyBBZ2VudHNcbmV4cG9ydCBlbnVtIFdBWlVIX0FHRU5UU19PU19UWVBFe1xuICBXSU5ET1dTID0gJ3dpbmRvd3MnLFxuICBMSU5VWCA9ICdsaW51eCcsXG4gIFNVTk9TID0gJ3N1bm9zJyxcbiAgREFSV0lOID0gJ2RhcndpbicsXG4gIE9USEVSUyA9ICcnXG59XG5cbmV4cG9ydCBlbnVtIFdBWlVIX01PRFVMRVNfSUR7XG4gIFNFQ1VSSVRZX0VWRU5UUyA9ICdnZW5lcmFsJyxcbiAgSU5URUdSSVRZX01PTklUT1JJTkcgPSAnZmltJyxcbiAgQU1BWk9OX1dFQl9TRVJWSUNFUyA9ICdhd3MnLFxuICBHT09HTEVfQ0xPVURfUExBVEZPUk0gPSAnZ2NwJyxcbiAgUE9MSUNZX01PTklUT1JJTkcgPSAncG0nLFxuICBTRUNVUklUWV9DT05GSUdVUkFUSU9OX0FTU0VTU01FTlQgPSAnc2NhJyxcbiAgQVVESVRJTkcgPSAnYXVkaXQnLFxuICBPUEVOX1NDQVAgPSAnb3NjYXAnLFxuICBWVUxORVJBQklMSVRJRVMgPSAndnVscycsXG4gIE9TUVVFUlkgPSAnb3NxdWVyeScsXG4gIERPQ0tFUiA9ICdkb2NrZXInLFxuICBNSVRSRV9BVFRBQ0sgPSAnbWl0cmUnLFxuICBQQ0lfRFNTID0gJ3BjaScsXG4gIEhJUEFBID0gJ2hpcGFhJyxcbiAgTklTVF84MDBfNTMgPSAnbmlzdCcsXG4gIFRTQyA9ICd0c2MnLFxuICBDSVNfQ0FUID0gJ2Npc2NhdCcsXG4gIFZJUlVTVE9UQUwgPSAndmlydXN0b3RhbCcsXG4gIEdEUFIgPSAnZ2Rwcidcbn1cbiJdfQ==