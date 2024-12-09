"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateAlert = generateAlert;
exports.generateAlerts = generateAlerts;

var _common = require("./sample-data/common");

var _regulatoryCompliance = require("./sample-data/regulatory-compliance");

var Audit = _interopRequireWildcard(require("./sample-data/audit"));

var Authentication = _interopRequireWildcard(require("./sample-data/authentication"));

var AWS = _interopRequireWildcard(require("./sample-data/aws"));

var IntegrityMonitoring = _interopRequireWildcard(require("./sample-data/integrity-monitoring"));

var CISCAT = _interopRequireWildcard(require("./sample-data/ciscat"));

var GCP = _interopRequireWildcard(require("./sample-data/gcp"));

var Docker = _interopRequireWildcard(require("./sample-data/docker"));

var Mitre = _interopRequireWildcard(require("./sample-data/mitre"));

var Osquery = _interopRequireWildcard(require("./sample-data/osquery"));

var OpenSCAP = _interopRequireWildcard(require("./sample-data/openscap"));

var PolicyMonitoring = _interopRequireWildcard(require("./sample-data/policy-monitoring"));

var Virustotal = _interopRequireWildcard(require("./sample-data/virustotal"));

var Vulnerability = _interopRequireWildcard(require("./sample-data/vulnerabilities"));

var SSH = _interopRequireWildcard(require("./sample-data/ssh"));

var Apache = _interopRequireWildcard(require("./sample-data/apache"));

var Web = _interopRequireWildcard(require("./sample-data/web"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
 * Wazuh app - Script to generate sample alerts
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
// General
//Alert
const alertIDMax = 6000; // Rule

const ruleDescription = ['Sample alert 1', 'Sample alert 2', 'Sample alert 3', 'Sample alert 4', 'Sample alert 5'];
const ruleMaxLevel = 14;
/**
 * Generate a alert
 * @param {any} params - params to configure the alert
 * @param {boolean} params.aws - if true, set aws fields
 * @param {boolean} params.audit - if true, set System Auditing fields
 * @param {boolean} params.ciscat - if true, set CIS-CAT fields
 * @param {boolean} params.gcp - if true, set GCP fields
 * @param {boolean} params.docker - if true, set Docker fields
 * @param {boolean} params.mitre - if true, set Mitre att&ck fields
 * @param {boolean} params.openscap - if true, set OpenSCAP fields
 * @param {boolean} params.osquery - if true, set Osquery fields
 * @param {boolean} params.rootcheck - if true, set Policy monitoring fields
 * @param {boolean} params.syscheck - if true, set integrity monitoring fields
 * @param {boolean} params.virustotal - if true, set VirusTotal fields
 * @param {boolean} params.vulnerabilities - if true, set vulnerabilities fields
 * @param {boolean} params.pci_dss - if true, set pci_dss fields
 * @param {boolean} params.gdpr - if true, set gdpr fields
 * @param {boolean} params.gpg13 - if true, set gpg13 fields
 * @param {boolean} params.hipaa - if true, set hipaa fields
 * @param {boolean} params.nist_800_53 - if true, set nist_800_53 fields
 * @param {boolean} params.nist_800_53 - if true, set nist_800_53 fields
 * @param {boolean} params.win_authentication_failed - if true, add win_authentication_failed to rule.groups
 * @param {number} params.probability_win_authentication_failed - probability to add win_authentication_failed to rule.groups. Example: 20 will be 20% of probability to add this to rule.groups
 * @param {boolean} params.authentication_failed - if true, add win_authentication_failed to rule.groups
 * @param {number} params.probability_authentication_failed - probability to add authentication_failed to rule.groups
 * @param {boolean} params.authentication_failures - if true, add win_authentication_failed to rule.groups
 * @param {number} params.probability_authentication_failures - probability to add authentication_failures to rule.groups
 * @return {any} - Alert generated
 */

function generateAlert(params) {
  let alert = {
    ['@sampledata']: true,
    timestamp: '2020-01-27T11:08:47.777+0000',
    rule: {
      level: 3,
      description: 'Sample alert',
      id: '5502',
      mail: false,
      groups: []
    },
    agent: {
      id: '000',
      name: 'master'
    },
    manager: {
      name: 'master'
    },
    cluster: {
      name: 'wazuh'
    },
    id: '1580123327.49031',
    predecoder: {},
    decoder: {},
    data: {},
    location: ''
  };
  alert.agent = (0, _common.randomArrayItem)(_common.Agents);
  alert.rule.description = (0, _common.randomArrayItem)(ruleDescription);
  alert.rule.id = `${randomIntervalInteger(1, alertIDMax)}`;
  alert.rule.level = randomIntervalInteger(1, ruleMaxLevel);
  alert.timestamp = randomDate();

  if (params.manager) {
    if (params.manager.name) {
      alert.manager.name = params.manager.name;
    }
  }

  if (params.cluster) {
    if (params.cluster.name) {
      alert.cluster.name = params.cluster.name;
    }

    if (params.cluster.node) {
      alert.cluster.node = params.cluster.node;
    }
  }

  if (params.aws) {
    let randomType = (0, _common.randomArrayItem)(['guarddutyPortProbe', 'apiCall', 'networkConnection', 'iamPolicyGrantGlobal']);
    const beforeDate = new Date(new Date(alert.timestamp) - 3 * 24 * 60 * 60 * 1000);

    switch (randomType) {
      case 'guarddutyPortProbe':
        {
          const typeAlert = AWS.guarddutyPortProbe;
          alert.data = { ...typeAlert.data
          };
          alert.data.integration = 'aws';
          alert.data.aws.region = (0, _common.randomArrayItem)(AWS.region);
          alert.data.aws.resource.instanceDetails = { ...(0, _common.randomArrayItem)(AWS.instanceDetails)
          };
          alert.data.aws.resource.instanceDetails.iamInstanceProfile.arn = interpolateAlertProps(typeAlert.data.aws.resource.instanceDetails.iamInstanceProfile.arn, alert);
          alert.data.aws.title = interpolateAlertProps(alert.data.aws.title, alert);
          alert.data.aws.accountId = (0, _common.randomArrayItem)(AWS.accountId);
          alert.data.aws.service.eventFirstSeen = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.eventLastSeen = formatDate(new Date(alert.timestamp), 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.action.portProbeAction.portProbeDetails.remoteIpDetails = { ...(0, _common.randomArrayItem)(AWS.remoteIpDetails)
          };
          alert.data.aws.log_info = {
            s3bucket: (0, _common.randomArrayItem)(AWS.buckets),
            log_file: `guardduty/${formatDate(new Date(alert.timestamp), 'Y/M/D/h')}/firehose_guardduty-1-${formatDate(new Date(alert.timestamp), 'Y-M-D-h-m-s-l')}b5b9b-ec62-4a07-85d7-b1699b9c031e.zip`
          };
          alert.data.aws.service.count = `${randomIntervalInteger(400, 4000)}`;
          alert.data.aws.createdAt = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.rule = { ...typeAlert.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 50);
          alert.rule.description = interpolateAlertProps(typeAlert.rule.description, alert);
          alert.decoder = { ...typeAlert.decoder
          };
          alert.location = typeAlert.location;
          break;
        }

      case 'apiCall':
        {
          const typeAlert = AWS.apiCall;
          alert.data = { ...typeAlert.data
          };
          alert.data.integration = 'aws';
          alert.data.aws.region = (0, _common.randomArrayItem)(AWS.region);
          alert.data.aws.resource.accessKeyDetails.userName = (0, _common.randomArrayItem)(_common.Users);
          alert.data.aws.log_info = {
            s3bucket: (0, _common.randomArrayItem)(AWS.buckets),
            log_file: `guardduty/${formatDate(new Date(alert.timestamp), 'Y/M/D/h')}/firehose_guardduty-1-${formatDate(new Date(alert.timestamp), 'Y-M-D-h-m-s-l')}b5b9b-ec62-4a07-85d7-b1699b9c031e.zip`
          };
          alert.data.aws.accountId = (0, _common.randomArrayItem)(AWS.accountId);
          alert.data.aws.service.action.awsApiCallAction.remoteIpDetails = { ...(0, _common.randomArrayItem)(AWS.remoteIpDetails)
          };
          alert.data.aws.service.eventFirstSeen = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.eventLastSeen = formatDate(new Date(alert.timestamp), 'Y-M-DTh:m:s.lZ');
          alert.data.aws.createdAt = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.title = interpolateAlertProps(alert.data.aws.title, alert);
          alert.data.aws.description = interpolateAlertProps(alert.data.aws.description, alert);
          const count = `${randomIntervalInteger(400, 4000)}`;
          alert.data.aws.service.additionalInfo.recentApiCalls.count = count;
          alert.data.aws.service.count = count;
          alert.rule = { ...typeAlert.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 50);
          alert.rule.description = interpolateAlertProps(typeAlert.rule.description, alert);
          alert.decoder = { ...typeAlert.decoder
          };
          alert.location = typeAlert.location;
          break;
        }

      case 'networkConnection':
        {
          const typeAlert = AWS.networkConnection;
          alert.data = { ...typeAlert.data
          };
          alert.data.integration = 'aws';
          alert.data.aws.region = (0, _common.randomArrayItem)(AWS.region);
          alert.data.aws.resource.instanceDetails = { ...(0, _common.randomArrayItem)(AWS.instanceDetails)
          };
          alert.data.aws.log_info = {
            s3bucket: (0, _common.randomArrayItem)(AWS.buckets),
            log_file: `guardduty/${formatDate(new Date(alert.timestamp), 'Y/M/D/h')}/firehose_guardduty-1-${formatDate(new Date(alert.timestamp), 'Y-M-D-h-m-s-l')}b5b9b-ec62-4a07-85d7-b1699b9c031e.zip`
          };
          alert.data.aws.description = interpolateAlertProps(alert.data.aws.description, alert);
          alert.data.aws.title = interpolateAlertProps(alert.data.aws.title, alert);
          alert.data.aws.accountId = (0, _common.randomArrayItem)(AWS.accountId);
          alert.data.aws.createdAt = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.action.networkConnectionAction.remoteIpDetails = { ...(0, _common.randomArrayItem)(AWS.remoteIpDetails)
          };
          alert.data.aws.service.eventFirstSeen = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.eventLastSeen = formatDate(new Date(alert.timestamp), 'Y-M-DTh:m:s.lZ');
          alert.data.aws.service.additionalInfo = {
            localPort: `${(0, _common.randomArrayItem)(_common.Ports)}`,
            outBytes: `${randomIntervalInteger(1000, 3000)}`,
            inBytes: `${randomIntervalInteger(1000, 10000)}`,
            unusual: `${randomIntervalInteger(1000, 10000)}`
          };
          alert.data.aws.service.count = `${randomIntervalInteger(400, 4000)}`;
          alert.data.aws.service.action.networkConnectionAction.localIpDetails.ipAddressV4 = alert.data.aws.resource.instanceDetails.networkInterfaces.privateIpAddress;
          alert.data.aws.arn = interpolateAlertProps(typeAlert.data.aws.arn, alert);
          alert.rule = { ...typeAlert.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 50);
          alert.rule.description = interpolateAlertProps(typeAlert.rule.description, alert);
          alert.decoder = { ...typeAlert.decoder
          };
          alert.location = typeAlert.location;
          break;
        }

      case 'iamPolicyGrantGlobal':
        {
          const typeAlert = AWS.iamPolicyGrantGlobal;
          alert.data = { ...typeAlert.data
          };
          alert.data.integration = 'aws';
          alert.data.aws.region = (0, _common.randomArrayItem)(AWS.region);
          alert.data.aws.summary.Timestamps = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.log_info = {
            s3bucket: (0, _common.randomArrayItem)(AWS.buckets),
            log_file: `macie/${formatDate(new Date(alert.timestamp), 'Y/M/D/h')}/firehose_macie-1-${formatDate(new Date(alert.timestamp), 'Y-M-D-h-m-s')}-0b1ede94-f399-4e54-8815-1c6587eee3b1//firehose_guardduty-1-${formatDate(new Date(alert.timestamp), 'Y-M-D-h-m-s-l')}b5b9b-ec62-4a07-85d7-b1699b9c031e.zip`
          };
          alert.data.aws['created-at'] = formatDate(beforeDate, 'Y-M-DTh:m:s.lZ');
          alert.data.aws.url = interpolateAlertProps(typeAlert.data.aws.url, alert);
          alert.data.aws['alert-arn'] = interpolateAlertProps(typeAlert.data.aws['alert-arn'], alert);
          alert.rule = { ...typeAlert.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 50);
          alert.decoder = { ...typeAlert.decoder
          };
          alert.location = typeAlert.location;
          break;
        }

      default:
        {}
    }

    alert.input = {
      type: 'log'
    };
    alert.GeoLocation = (0, _common.randomArrayItem)(_common.GeoLocation);
  }

  if (params.gcp) {
    alert.rule = (0, _common.randomArrayItem)(GCP.arrayRules);
    alert.data.integration = 'gcp';
    alert.data.gcp = {
      insertId: 'uk1zpe23xcj',
      jsonPayload: {
        authAnswer: GCP.arrayAuthAnswer[Math.floor(GCP.arrayAuthAnswer.length * Math.random())],
        protocol: GCP.arrayProtocol[Math.floor(GCP.arrayProtocol.length * Math.random())],
        queryName: GCP.arrayQueryName[Math.floor(GCP.arrayQueryName.length * Math.random())],
        queryType: GCP.arrayQueryType[Math.floor(GCP.arrayQueryType.length * Math.random())],
        responseCode: GCP.arrayResponseCode[Math.floor(GCP.arrayResponseCode.length * Math.random())],
        sourceIP: GCP.arraySourceIP[Math.floor(GCP.arraySourceIP.length * Math.random())],
        vmInstanceId: '4980113928800839680.000000',
        vmInstanceName: '531339229531.instance-1'
      },
      logName: 'projects/wazuh-dev/logs/dns.googleapis.com%2Fdns_queries',
      receiveTimestamp: '2019-11-11T02:42:05.05853152Z',
      resource: {
        labels: {
          location: GCP.arrayLocation[Math.floor(GCP.arrayLocation.length * Math.random())],
          project_id: GCP.arrayProject[Math.floor(GCP.arrayProject.length * Math.random())],
          source_type: GCP.arraySourceType[Math.floor(GCP.arraySourceType.length * Math.random())],
          target_type: 'external'
        },
        type: GCP.arrayType[Math.floor(GCP.arrayType.length * Math.random())]
      },
      severity: GCP.arraySeverity[Math.floor(GCP.arraySeverity.length * Math.random())],
      timestamp: '2019-11-11T02:42:04.34921449Z'
    };
    alert.GeoLocation = (0, _common.randomArrayItem)(_common.GeoLocation);
  }

  if (params.audit) {
    let dataAudit = (0, _common.randomArrayItem)(Audit.dataAudit);
    alert.data = dataAudit.data;
    alert.data.audit.file ? alert.data.audit.file.name === '' ? alert.data.audit.file.name = (0, _common.randomArrayItem)(Audit.fileName) : null : null;
    alert.rule = dataAudit.rule;
  }

  if (params.ciscat) {
    alert.rule.groups.push('ciscat');
    alert.data.cis = {};
    alert.data.cis.group = (0, _common.randomArrayItem)(CISCAT.group);
    alert.data.cis.fail = randomIntervalInteger(0, 100);
    alert.data.cis.rule_title = (0, _common.randomArrayItem)(CISCAT.ruleTitle);
    alert.data.cis.notchecked = randomIntervalInteger(0, 100);
    alert.data.cis.score = randomIntervalInteger(0, 100);
    alert.data.cis.pass = randomIntervalInteger(0, 100);
    alert.data.cis.timestamp = new Date(randomDate());
    alert.data.cis.error = randomIntervalInteger(0, 1);
    alert.data.cis.benchmark = (0, _common.randomArrayItem)(CISCAT.benchmark);
    alert.data.cis.unknown = randomIntervalInteger(0, 100);
    alert.data.cis.notchecked = randomIntervalInteger(0, 5);
    alert.data.cis.result = (0, _common.randomArrayItem)(CISCAT.result);
  }

  if (params.docker) {
    const dataDocker = (0, _common.randomArrayItem)(Docker.dataDocker);
    alert.data = {};
    alert.data = dataDocker.data;
    alert.rule = dataDocker.rule;
  }

  if (params.mitre) {
    alert.rule = (0, _common.randomArrayItem)(Mitre.arrayMitreRules);
    alert.location = (0, _common.randomArrayItem)(Mitre.arrayLocation);
  }

  if (params.openscap) {
    alert.data = {};
    alert.data.oscap = {};
    const typeAlert = { ...(0, _common.randomArrayItem)(OpenSCAP.data)
    };
    alert.data = { ...typeAlert.data
    };
    alert.rule = { ...typeAlert.rule
    };
    alert.rule.firedtimes = randomIntervalInteger(2, 10);
    alert.input = {
      type: 'log'
    };
    alert.decoder = { ...OpenSCAP.decoder
    };
    alert.location = OpenSCAP.location;

    if (typeAlert.full_log) {
      alert.full_log = interpolateAlertProps(typeAlert.full_log, alert);
    }
  }

  if (params.rootcheck) {
    alert.location = PolicyMonitoring.location;
    alert.decoder = { ...PolicyMonitoring.decoder
    };
    alert.input = {
      type: 'log'
    };
    const alertCategory = (0, _common.randomArrayItem)(['Rootkit', 'Trojan']);

    switch (alertCategory) {
      case 'Rootkit':
        {
          const rootkitCategory = (0, _common.randomArrayItem)(Object.keys(PolicyMonitoring.rootkits));
          const rootkit = (0, _common.randomArrayItem)(PolicyMonitoring.rootkits[rootkitCategory]);
          alert.data = {
            title: interpolateAlertProps(PolicyMonitoring.rootkitsData.data.title, alert, {
              _rootkit_category: rootkitCategory,
              _rootkit_file: rootkit
            })
          };
          alert.rule = { ...PolicyMonitoring.rootkitsData.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 10);
          alert.full_log = alert.data.title;
          break;
        }

      case 'Trojan':
        {
          const trojan = (0, _common.randomArrayItem)(PolicyMonitoring.trojans);
          alert.data = {
            file: trojan.file,
            title: 'Trojaned version of file detected.'
          };
          alert.rule = { ...PolicyMonitoring.trojansData.rule
          };
          alert.rule.firedtimes = randomIntervalInteger(1, 10);
          alert.full_log = interpolateAlertProps(PolicyMonitoring.trojansData.full_log, alert, {
            _trojan_signature: trojan.signature
          });
          break;
        }

      default:
        {}
    }
  }

  if (params.syscheck) {
    alert.rule.groups.push('syscheck');
    alert.syscheck = {};
    alert.syscheck.event = (0, _common.randomArrayItem)(IntegrityMonitoring.events);
    alert.syscheck.path = (0, _common.randomArrayItem)(alert.agent.name === 'Windows' ? IntegrityMonitoring.pathsWindows : IntegrityMonitoring.pathsLinux);
    alert.syscheck.uname_after = (0, _common.randomArrayItem)(_common.Users);
    alert.syscheck.gname_after = 'root';
    alert.syscheck.mtime_after = new Date(randomDate());
    alert.syscheck.size_after = randomIntervalInteger(0, 65);
    alert.syscheck.uid_after = (0, _common.randomArrayItem)(IntegrityMonitoring.uid_after);
    alert.syscheck.gid_after = (0, _common.randomArrayItem)(IntegrityMonitoring.gid_after);
    alert.syscheck.perm_after = 'rw-r--r--';
    alert.syscheck.inode_after = randomIntervalInteger(0, 100000);

    switch (alert.syscheck.event) {
      case 'added':
        alert.rule = IntegrityMonitoring.regulatory[0];
        break;

      case 'modified':
        alert.rule = IntegrityMonitoring.regulatory[1];
        alert.syscheck.mtime_before = new Date(alert.syscheck.mtime_after.getTime() - 1000 * 60);
        alert.syscheck.inode_before = randomIntervalInteger(0, 100000);
        alert.syscheck.sha1_after = (0, _common.randomElements)(40, 'abcdef0123456789');
        alert.syscheck.changed_attributes = [(0, _common.randomArrayItem)(IntegrityMonitoring.attributes)];
        alert.syscheck.md5_after = (0, _common.randomElements)(32, 'abcdef0123456789');
        alert.syscheck.sha256_after = (0, _common.randomElements)(60, 'abcdef0123456789');
        break;

      case 'deleted':
        alert.rule = IntegrityMonitoring.regulatory[2];
        alert.syscheck.tags = [(0, _common.randomArrayItem)(IntegrityMonitoring.tags)];
        alert.syscheck.sha1_after = (0, _common.randomElements)(40, 'abcdef0123456789');
        alert.syscheck.audit = {
          process: {
            name: (0, _common.randomArrayItem)(_common.Paths),
            id: randomIntervalInteger(0, 100000),
            ppid: randomIntervalInteger(0, 100000)
          },
          effective_user: {
            name: (0, _common.randomArrayItem)(_common.Users),
            id: randomIntervalInteger(0, 100)
          },
          user: {
            name: (0, _common.randomArrayItem)(_common.Users),
            id: randomIntervalInteger(0, 100)
          },
          group: {
            name: (0, _common.randomArrayItem)(_common.Users),
            id: randomIntervalInteger(0, 100)
          }
        };
        alert.syscheck.md5_after = (0, _common.randomElements)(32, 'abcdef0123456789');
        alert.syscheck.sha256_after = (0, _common.randomElements)(60, 'abcdef0123456789');
        break;

      default:
        {}
    }
  }

  if (params.virustotal) {
    alert.rule.groups.push('virustotal');
    alert.location = 'virustotal';
    alert.data.virustotal = {};
    alert.data.virustotal.found = (0, _common.randomArrayItem)(['0', '1', '1', '1']);
    alert.data.virustotal.source = {
      sha1: (0, _common.randomElements)(40, 'abcdef0123456789'),
      file: (0, _common.randomArrayItem)(Virustotal.sourceFile),
      alert_id: `${(0, _common.randomElements)(10, '0123456789')}.${(0, _common.randomElements)(7, '0123456789')}`,
      md5: (0, _common.randomElements)(32, 'abcdef0123456789')
    };

    if (alert.data.virustotal.found === '1') {
      alert.data.virustotal.malicious = (0, _common.randomArrayItem)(Virustotal.malicious);
      alert.data.virustotal.positives = `${randomIntervalInteger(0, 65)}`;
      alert.data.virustotal.total = alert.data.virustotal.malicious + alert.data.virustotal.positives;
      alert.rule.description = `VirusTotal: Alert - ${alert.data.virustotal.source.file} - ${alert.data.virustotal.positives} engines detected this file`;
      alert.data.virustotal.permalink = (0, _common.randomArrayItem)(Virustotal.permalink);
      alert.data.virustotal.scan_date = new Date(Date.parse(alert.timestamp) - 4 * 60000);
    } else {
      alert.data.virustotal.malicious = '0';
      alert.rule.description = 'VirusTotal: Alert - No records in VirusTotal database';
    }
  }

  if (params.vulnerabilities) {
    const dataVulnerability = (0, _common.randomArrayItem)(Vulnerability.data);
    alert.rule = { ...dataVulnerability.rule,
      mail: false,
      groups: ['vulnerability-detector'],
      gdpr: ['IV_35.7.d'],
      pci_dss: ['11.2.1', '11.2.3'],
      tsc: ['CC7.1', 'CC7.2']
    };
    alert.location = 'vulnerability-detector';
    alert.decoder = {
      name: 'json'
    };
    alert.data = { ...dataVulnerability.data
    };
  }

  if (params.osquery) {
    alert.rule.groups.push('osquery');
    alert.data.osquery = {};

    if (randomIntervalInteger(0, 5) === 0) {
      alert.rule.description = 'osquery error message';
    } else {
      let dataOsquery = (0, _common.randomArrayItem)(Osquery.dataOsquery);
      alert.data.osquery = dataOsquery.osquery;
      alert.data.osquery.calendarTime = alert.timestamp;
      alert.rule.description = dataOsquery.rule.description;
      randomIntervalInteger(0, 99) === 0 ? alert.data.osquery.action = 'removed' : null;
    }
  } // Regulatory compliance


  if (params.pci_dss || params.regulatory_compliance || params.random_probability_regulatory_compliance && randomProbability(params.random_probability_regulatory_compliance)) {
    alert.rule.pci_dss = [(0, _common.randomArrayItem)(_regulatoryCompliance.PCI_DSS)];
  }

  if (params.gdpr || params.regulatory_compliance || params.random_probability_regulatory_compliance && randomProbability(params.random_probability_regulatory_compliance)) {
    alert.rule.gdpr = [(0, _common.randomArrayItem)(_regulatoryCompliance.GDPR)];
  }

  if (params.gpg13 || params.regulatory_compliance || params.random_probability_regulatory_compliance && randomProbability(params.random_probability_regulatory_compliance)) {
    alert.rule.gpg13 = [(0, _common.randomArrayItem)(_regulatoryCompliance.GPG13)];
  }

  if (params.hipaa || params.regulatory_compliance || params.random_probability_regulatory_compliance && randomIntervalInteger(params.random_probability_regulatory_compliance)) {
    alert.rule.hipaa = [(0, _common.randomArrayItem)(_regulatoryCompliance.HIPAA)];
  }

  if (params.nist_800_83 || params.regulatory_compliance || params.random_probability_regulatory_compliance && randomIntervalInteger(params.random_probability_regulatory_compliance)) {
    alert.rule.nist_800_53 = [(0, _common.randomArrayItem)(_regulatoryCompliance.NIST_800_53)];
  }

  if (params.authentication) {
    alert.data = {
      srcip: (0, _common.randomArrayItem)(_common.IPs),
      srcuser: (0, _common.randomArrayItem)(_common.Users),
      srcport: (0, _common.randomArrayItem)(_common.Ports)
    };
    alert.GeoLocation = (0, _common.randomArrayItem)(_common.GeoLocation);
    alert.decoder = {
      name: 'sshd',
      parent: 'sshd'
    };
    alert.input = {
      type: 'log'
    };
    alert.predecoder = {
      program_name: 'sshd',
      timestamp: formatDate(new Date(alert.timestamp), 'N D h:m:s'),
      hostname: alert.manager.name
    };
    let typeAlert = (0, _common.randomArrayItem)(['invalidLoginPassword', 'invalidLoginUser', 'multipleAuthenticationFailures', 'windowsInvalidLoginPassword', 'userLoginFailed', 'passwordCheckFailed', 'nonExistentUser', 'bruteForceTryingAccessSystem', 'authenticationSuccess', 'maximumAuthenticationAttemptsExceeded']);

    switch (typeAlert) {
      case 'invalidLoginPassword':
        {
          alert.location = Authentication.invalidLoginPassword.location;
          alert.rule = { ...Authentication.invalidLoginPassword.rule
          };
          alert.rule.groups = [...Authentication.invalidLoginPassword.rule.groups];
          alert.full_log = interpolateAlertProps(Authentication.invalidLoginPassword.full_log, alert);
          break;
        }

      case 'invalidLoginUser':
        {
          alert.location = Authentication.invalidLoginUser.location;
          alert.rule = { ...Authentication.invalidLoginUser.rule
          };
          alert.rule.groups = [...Authentication.invalidLoginUser.rule.groups];
          alert.full_log = interpolateAlertProps(Authentication.invalidLoginUser.full_log, alert);
          break;
        }

      case 'multipleAuthenticationFailures':
        {
          alert.location = Authentication.multipleAuthenticationFailures.location;
          alert.rule = { ...Authentication.multipleAuthenticationFailures.rule
          };
          alert.rule.groups = [...Authentication.multipleAuthenticationFailures.rule.groups];
          alert.rule.frequency = randomIntervalInteger(5, 50);
          alert.full_log = interpolateAlertProps(Authentication.multipleAuthenticationFailures.full_log, alert);
          break;
        }

      case 'windowsInvalidLoginPassword':
        {
          alert.location = Authentication.windowsInvalidLoginPassword.location;
          alert.rule = { ...Authentication.windowsInvalidLoginPassword.rule
          };
          alert.rule.groups = [...Authentication.windowsInvalidLoginPassword.rule.groups];
          alert.rule.frequency = randomIntervalInteger(5, 50);
          alert.data.win = { ...Authentication.windowsInvalidLoginPassword.data_win
          };
          alert.data.win.eventdata.ipAddress = (0, _common.randomArrayItem)(_common.IPs);
          alert.data.win.eventdata.ipPort = (0, _common.randomArrayItem)(_common.Ports);
          alert.data.win.system.computer = (0, _common.randomArrayItem)(_common.Win_Hostnames);
          alert.data.win.system.eventID = `${randomIntervalInteger(1, 600)}`;
          alert.data.win.system.eventRecordID = `${randomIntervalInteger(10000, 50000)}`;
          alert.data.win.system.processID = `${randomIntervalInteger(1, 1200)}`;
          alert.data.win.system.systemTime = alert.timestamp;
          alert.data.win.system.processID = `${randomIntervalInteger(1, 1200)}`;
          alert.data.win.system.task = `${randomIntervalInteger(1, 1800)}`;
          alert.data.win.system.threadID = `${randomIntervalInteger(1, 500)}`;
          alert.full_log = interpolateAlertProps(Authentication.windowsInvalidLoginPassword.full_log, alert);
          break;
        }

      case 'userLoginFailed':
        {
          alert.location = Authentication.userLoginFailed.location;
          alert.rule = { ...Authentication.userLoginFailed.rule
          };
          alert.rule.groups = [...Authentication.userLoginFailed.rule.groups];
          alert.data = {
            srcip: (0, _common.randomArrayItem)(_common.IPs),
            dstuser: (0, _common.randomArrayItem)(_common.Users),
            uid: `${randomIntervalInteger(0, 50)}`,
            euid: `${randomIntervalInteger(0, 50)}`,
            tty: 'ssh'
          };
          alert.decoder = { ...Authentication.userLoginFailed.decoder
          };
          alert.full_log = interpolateAlertProps(Authentication.userLoginFailed.full_log, alert);
          break;
        }

      case 'passwordCheckFailed':
        {
          alert.location = Authentication.passwordCheckFailed.location;
          alert.rule = { ...Authentication.passwordCheckFailed.rule
          };
          alert.rule.groups = [...Authentication.passwordCheckFailed.rule.groups];
          alert.data = {
            srcuser: (0, _common.randomArrayItem)(_common.Users)
          };
          alert.predecoder.program_name = 'unix_chkpwd';
          alert.decoder = { ...Authentication.passwordCheckFailed.decoder
          };
          alert.full_log = interpolateAlertProps(Authentication.passwordCheckFailed.full_log, alert);
          break;
        }

      case 'nonExistentUser':
        {
          alert.location = Authentication.nonExistentUser.location;
          alert.rule = { ...Authentication.nonExistentUser.rule
          };
          alert.rule.groups = [...Authentication.nonExistentUser.rule.groups];
          alert.full_log = interpolateAlertProps(Authentication.nonExistentUser.full_log, alert);
          break;
        }

      case 'bruteForceTryingAccessSystem':
        {
          alert.location = Authentication.bruteForceTryingAccessSystem.location;
          alert.rule = { ...Authentication.bruteForceTryingAccessSystem.rule
          };
          alert.rule.groups = [...Authentication.bruteForceTryingAccessSystem.rule.groups];
          alert.full_log = interpolateAlertProps(Authentication.bruteForceTryingAccessSystem.full_log, alert);
          break;
        }

      case 'reverseLoockupError':
        {
          alert.location = Authentication.reverseLoockupError.location;
          alert.rule = { ...Authentication.reverseLoockupError.rule
          };
          alert.rule.groups = [...Authentication.reverseLoockupError.rule.groups];
          alert.data = {
            srcip: (0, _common.randomArrayItem)(_common.IPs)
          };
          alert.full_log = interpolateAlertProps(Authentication.reverseLoockupError.full_log, alert);
        }

      case 'insecureConnectionAttempt':
        {
          alert.location = Authentication.insecureConnectionAttempt.location;
          alert.rule = { ...Authentication.insecureConnectionAttempt.rule
          };
          alert.rule.groups = [...Authentication.insecureConnectionAttempt.rule.groups];
          alert.data = {
            srcip: (0, _common.randomArrayItem)(_common.IPs),
            srcport: (0, _common.randomArrayItem)(_common.Ports)
          };
          alert.full_log = interpolateAlertProps(Authentication.insecureConnectionAttempt.full_log, alert);
        }

      case 'authenticationSuccess':
        {
          alert.location = Authentication.authenticationSuccess.location;
          alert.rule = { ...Authentication.authenticationSuccess.rule
          };
          alert.rule.groups = [...Authentication.authenticationSuccess.rule.groups];
          alert.data = {
            srcip: (0, _common.randomArrayItem)(_common.IPs),
            srcport: (0, _common.randomArrayItem)(_common.Ports),
            dstuser: (0, _common.randomArrayItem)(_common.Users)
          };
          alert.full_log = interpolateAlertProps(Authentication.authenticationSuccess.full_log, alert);
        }

      case 'maximumAuthenticationAttemptsExceeded':
        {
          alert.location = Authentication.maximumAuthenticationAttemptsExceeded.location;
          alert.rule = { ...Authentication.maximumAuthenticationAttemptsExceeded.rule
          };
          alert.rule.groups = [...Authentication.maximumAuthenticationAttemptsExceeded.rule.groups];
          alert.data = {
            srcip: (0, _common.randomArrayItem)(_common.IPs),
            srcport: (0, _common.randomArrayItem)(_common.Ports),
            dstuser: (0, _common.randomArrayItem)(_common.Users)
          };
          alert.full_log = interpolateAlertProps(Authentication.maximumAuthenticationAttemptsExceeded.full_log, alert);
        }

      default:
        {}
    }

    alert.rule.firedtimes = randomIntervalInteger(2, 15);
    alert.rule.tsc = [(0, _common.randomArrayItem)(_regulatoryCompliance.tsc)];
  }

  if (params.ssh) {
    alert.data = {
      srcip: (0, _common.randomArrayItem)(_common.IPs),
      srcuser: (0, _common.randomArrayItem)(_common.Users),
      srcport: (0, _common.randomArrayItem)(_common.Ports)
    };
    alert.GeoLocation = (0, _common.randomArrayItem)(_common.GeoLocation);
    alert.decoder = {
      name: 'sshd',
      parent: 'sshd'
    };
    alert.input = {
      type: 'log'
    };
    alert.predecoder = {
      program_name: 'sshd',
      timestamp: formatDate(new Date(alert.timestamp), 'N D h:m:s'),
      hostname: alert.manager.name
    };
    const typeAlert = (0, _common.randomArrayItem)(SSH.data);
    alert.location = typeAlert.location;
    alert.rule = { ...typeAlert.rule
    };
    alert.rule.groups = [...typeAlert.rule.groups];
    alert.rule.firedtimes = randomIntervalInteger(1, 15);
    alert.full_log = interpolateAlertProps(typeAlert.full_log, alert);
  }

  if (params.windows) {
    alert.rule.groups.push('windows');

    if (params.windows.service_control_manager) {
      alert.predecoder = {
        program_name: 'WinEvtLog',
        timestamp: '2020 Apr 17 05:59:05'
      };
      alert.input = {
        type: 'log'
      };
      alert.data = {
        extra_data: 'Service Control Manager',
        dstuser: 'SYSTEM',
        system_name: (0, _common.randomArrayItem)(_common.Win_Hostnames),
        id: '7040',
        type: 'type',
        status: 'INFORMATION'
      };
      alert.rule.description = 'Windows: Service startup type was changed.';
      alert.rule.firedtimes = randomIntervalInteger(1, 20);
      alert.rule.mail = false;
      alert.rule.level = 3;
      alert.rule.groups.push('windows', 'policy_changed');
      alert.rule.pci = ['10.6'];
      alert.rule.hipaa = ['164.312.b'];
      alert.rule.gdpr = ['IV_35.7.d'];
      alert.rule.nist_800_53 = ['AU.6'];
      alert.rule.info = 'This does not appear to be logged on Windows 2000.';
      alert.location = 'WinEvtLog';
      alert.decoder = {
        parent: 'windows',
        name: 'windows'
      };
      alert.full_log = `2020 Apr 17 05:59:05 WinEvtLog: type: INFORMATION(7040): Service Control Manager: SYSTEM: NT AUTHORITY: ${alert.data.system_name}: Background Intelligent Transfer Service auto start demand start BITS `; //TODO: date

      alert.id = 18145;
      alert.fields = {
        timestamp: alert.timestamp
      };
    }
  }

  if (params.apache) {
    const typeAlert = { ...Apache.data[0]
    }; // there is only one type alert in data array at the moment. Randomize if add more type of alerts to data array

    alert.data = {
      srcip: (0, _common.randomArrayItem)(_common.IPs),
      srcport: (0, _common.randomArrayItem)(_common.Ports),
      id: `AH${randomIntervalInteger(10000, 99999)}`
    };
    alert.GeoLocation = { ...(0, _common.randomArrayItem)(_common.GeoLocation)
    };
    alert.rule = { ...typeAlert.rule
    };
    alert.rule.firedtimes = randomIntervalInteger(2, 10);
    alert.input = {
      type: 'log'
    };
    alert.location = Apache.location;
    alert.decoder = { ...Apache.decoder
    };
    alert.full_log = interpolateAlertProps(typeAlert.full_log, alert, {
      _timestamp_apache: formatDate(new Date(alert.timestamp), 'E N D h:m:s.l Y'),
      _pi_id: randomIntervalInteger(10000, 30000)
    });
  }

  if (params.web) {
    alert.input = {
      type: 'log'
    };
    alert.data = {
      protocol: 'GET',
      srcip: (0, _common.randomArrayItem)(_common.IPs),
      id: '404',
      url: (0, _common.randomArrayItem)(Web.urls)
    };
    alert.GeoLocation = { ...(0, _common.randomArrayItem)(_common.GeoLocation)
    };
    const typeAlert = (0, _common.randomArrayItem)(Web.data);
    const userAgent = (0, _common.randomArrayItem)(Web.userAgents);
    alert.rule = { ...typeAlert.rule
    };
    alert.rule.firedtimes = randomIntervalInteger(1, 10);
    alert.decoder = { ...typeAlert.decoder
    };
    alert.location = typeAlert.location;
    alert.full_log = interpolateAlertProps(typeAlert.full_log, alert, {
      _user_agent: userAgent,
      _date: formatDate(new Date(alert.timestamp), 'D/N/Y:h:m:s +0000')
    });

    if (typeAlert.previous_output) {
      const previousOutput = [];
      const beforeSeconds = 4;

      for (let i = beforeSeconds; i > 0; i--) {
        const beforeDate = new Date(new Date(alert.timestamp) - (2 + i) * 1000);
        previousOutput.push(interpolateAlertProps(typeAlert.full_log, alert, {
          _user_agent: userAgent,
          _date: formatDate(new Date(beforeDate), 'D/N/Y:h:m:s +0000')
        }));
      }

      alert.previous_output = previousOutput.join('\n');
    }
  }

  return alert;
}
/**
 * Get a random array with unique values
 * @param {[]} array Array to extract the values
 * @param {*} randomMaxRepetitions Number max of random extractions
 * @param {function} sort Funciton to seort elements
 * @return {*} Array with random values extracted of paramater array passed
 */


function randomUniqueValuesFromArray(array, randomMaxRepetitions = 1, sort) {
  const repetitions = randomIntervalInteger(1, randomMaxRepetitions);
  const set = new Set();

  for (let i = 0; i < repetitions; i++) {
    set.add(array[randomIntervalInteger(0, array.length - 1)]);
  }

  return sort ? Array.from(set).sort(sort) : Array.from(set);
}
/**
 * Get a integer within a range
 * @param {number} min - Minimum limit
 * @param {number} max - Maximum limit
 * @returns {number} - Randomized number in interval
 */


function randomIntervalInteger(min, max) {
  return Math.floor(Math.random() * (max - (min - 1))) + min;
}
/**
 * Generate random alerts
 * @param {*} params
 * @param {number} numAlerts - Define number of alerts
 * @return {*} - Random generated alerts defined with params
 */


function generateAlerts(params, numAlerts = 1) {
  const alerts = [];

  for (let i = 0; i < numAlerts; i++) {
    alerts.push(generateAlert(params));
  }

  return alerts;
}
/**
 * Get a random Date in range(7 days ago - now)
 * @returns {date} - Random date in range (7 days ago - now)
 */


function randomDate(inf, sup) {
  const nowTimestamp = Date.now();
  const time = randomIntervalInteger(0, 604800000); // Random 7 days in miliseconds

  const unix_timestamp = nowTimestamp - time; // Last 7 days from now

  const lastWeek = new Date(unix_timestamp);
  return formatDate(lastWeek, 'Y-M-DTh:m:s.l+0000');
}

const formatterNumber = (number, zeros = 0) => ('0'.repeat(zeros) + `${number}`).slice(-zeros);

const monthNames = {
  long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
const dayNames = {
  long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

function formatDate(date, format) {
  // It could use "moment" library to format strings too
  const tokens = {
    D: d => formatterNumber(d.getDate(), 2),
    // 01-31
    A: d => dayNames.long[d.getDay()],
    // 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    E: d => dayNames.short[d.getDay()],
    // 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    M: d => formatterNumber(d.getMonth() + 1, 2),
    // 01-12
    J: d => monthNames.long[d.getMonth()],
    // 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    N: d => monthNames.short[d.getMonth()],
    // 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    Y: d => d.getFullYear(),
    // 2020
    h: d => formatterNumber(d.getHours(), 2),
    // 00-23
    m: d => formatterNumber(d.getMinutes(), 2),
    // 00-59
    s: d => formatterNumber(d.getSeconds(), 2),
    // 00-59
    l: d => formatterNumber(d.getMilliseconds(), 3) // 000-999

  };
  return format.split('').reduce((accum, token) => {
    if (tokens[token]) {
      return accum + tokens[token](date);
    }

    return accum + token;
  }, '');
}
/**
 *
 * @param {string} str String with interpolations
 * @param {*} alert Alert object
 * @param {*} extra Extra parameters to interpolate what aren't in alert objet. Only admit one level of depth
 */


function interpolateAlertProps(str, alert, extra = {}) {
  const matches = str.match(/{([\w\._]+)}/g);
  return matches && matches.reduce((accum, cur) => {
    const match = cur.match(/{([\w\._]+)}/);
    const items = match[1].split('.');
    const value = items.reduce((a, c) => a && a[c] || extra[c] || undefined, alert) || cur;
    return accum.replace(cur, value);
  }, str) || str;
}
/**
 * Return a random probability
 * @param {number} probability
 * @param {number[=100]} maximum
 */


function randomProbability(probability, maximum = 100) {
  return randomIntervalInteger(0, maximum) <= probability;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdlbmVyYXRlLWFsZXJ0cy1zY3JpcHQuanMiXSwibmFtZXMiOlsiYWxlcnRJRE1heCIsInJ1bGVEZXNjcmlwdGlvbiIsInJ1bGVNYXhMZXZlbCIsImdlbmVyYXRlQWxlcnQiLCJwYXJhbXMiLCJhbGVydCIsInRpbWVzdGFtcCIsInJ1bGUiLCJsZXZlbCIsImRlc2NyaXB0aW9uIiwiaWQiLCJtYWlsIiwiZ3JvdXBzIiwiYWdlbnQiLCJuYW1lIiwibWFuYWdlciIsImNsdXN0ZXIiLCJwcmVkZWNvZGVyIiwiZGVjb2RlciIsImRhdGEiLCJsb2NhdGlvbiIsIkFnZW50cyIsInJhbmRvbUludGVydmFsSW50ZWdlciIsInJhbmRvbURhdGUiLCJub2RlIiwiYXdzIiwicmFuZG9tVHlwZSIsImJlZm9yZURhdGUiLCJEYXRlIiwidHlwZUFsZXJ0IiwiQVdTIiwiZ3VhcmRkdXR5UG9ydFByb2JlIiwiaW50ZWdyYXRpb24iLCJyZWdpb24iLCJyZXNvdXJjZSIsImluc3RhbmNlRGV0YWlscyIsImlhbUluc3RhbmNlUHJvZmlsZSIsImFybiIsImludGVycG9sYXRlQWxlcnRQcm9wcyIsInRpdGxlIiwiYWNjb3VudElkIiwic2VydmljZSIsImV2ZW50Rmlyc3RTZWVuIiwiZm9ybWF0RGF0ZSIsImV2ZW50TGFzdFNlZW4iLCJhY3Rpb24iLCJwb3J0UHJvYmVBY3Rpb24iLCJwb3J0UHJvYmVEZXRhaWxzIiwicmVtb3RlSXBEZXRhaWxzIiwibG9nX2luZm8iLCJzM2J1Y2tldCIsImJ1Y2tldHMiLCJsb2dfZmlsZSIsImNvdW50IiwiY3JlYXRlZEF0IiwiZmlyZWR0aW1lcyIsImFwaUNhbGwiLCJhY2Nlc3NLZXlEZXRhaWxzIiwidXNlck5hbWUiLCJVc2VycyIsImF3c0FwaUNhbGxBY3Rpb24iLCJhZGRpdGlvbmFsSW5mbyIsInJlY2VudEFwaUNhbGxzIiwibmV0d29ya0Nvbm5lY3Rpb24iLCJuZXR3b3JrQ29ubmVjdGlvbkFjdGlvbiIsImxvY2FsUG9ydCIsIlBvcnRzIiwib3V0Qnl0ZXMiLCJpbkJ5dGVzIiwidW51c3VhbCIsImxvY2FsSXBEZXRhaWxzIiwiaXBBZGRyZXNzVjQiLCJuZXR3b3JrSW50ZXJmYWNlcyIsInByaXZhdGVJcEFkZHJlc3MiLCJpYW1Qb2xpY3lHcmFudEdsb2JhbCIsInN1bW1hcnkiLCJUaW1lc3RhbXBzIiwidXJsIiwiaW5wdXQiLCJ0eXBlIiwiR2VvTG9jYXRpb24iLCJnY3AiLCJHQ1AiLCJhcnJheVJ1bGVzIiwiaW5zZXJ0SWQiLCJqc29uUGF5bG9hZCIsImF1dGhBbnN3ZXIiLCJhcnJheUF1dGhBbnN3ZXIiLCJNYXRoIiwiZmxvb3IiLCJsZW5ndGgiLCJyYW5kb20iLCJwcm90b2NvbCIsImFycmF5UHJvdG9jb2wiLCJxdWVyeU5hbWUiLCJhcnJheVF1ZXJ5TmFtZSIsInF1ZXJ5VHlwZSIsImFycmF5UXVlcnlUeXBlIiwicmVzcG9uc2VDb2RlIiwiYXJyYXlSZXNwb25zZUNvZGUiLCJzb3VyY2VJUCIsImFycmF5U291cmNlSVAiLCJ2bUluc3RhbmNlSWQiLCJ2bUluc3RhbmNlTmFtZSIsImxvZ05hbWUiLCJyZWNlaXZlVGltZXN0YW1wIiwibGFiZWxzIiwiYXJyYXlMb2NhdGlvbiIsInByb2plY3RfaWQiLCJhcnJheVByb2plY3QiLCJzb3VyY2VfdHlwZSIsImFycmF5U291cmNlVHlwZSIsInRhcmdldF90eXBlIiwiYXJyYXlUeXBlIiwic2V2ZXJpdHkiLCJhcnJheVNldmVyaXR5IiwiYXVkaXQiLCJkYXRhQXVkaXQiLCJBdWRpdCIsImZpbGUiLCJmaWxlTmFtZSIsImNpc2NhdCIsInB1c2giLCJjaXMiLCJncm91cCIsIkNJU0NBVCIsImZhaWwiLCJydWxlX3RpdGxlIiwicnVsZVRpdGxlIiwibm90Y2hlY2tlZCIsInNjb3JlIiwicGFzcyIsImVycm9yIiwiYmVuY2htYXJrIiwidW5rbm93biIsInJlc3VsdCIsImRvY2tlciIsImRhdGFEb2NrZXIiLCJEb2NrZXIiLCJtaXRyZSIsIk1pdHJlIiwiYXJyYXlNaXRyZVJ1bGVzIiwib3BlbnNjYXAiLCJvc2NhcCIsIk9wZW5TQ0FQIiwiZnVsbF9sb2ciLCJyb290Y2hlY2siLCJQb2xpY3lNb25pdG9yaW5nIiwiYWxlcnRDYXRlZ29yeSIsInJvb3RraXRDYXRlZ29yeSIsIk9iamVjdCIsImtleXMiLCJyb290a2l0cyIsInJvb3RraXQiLCJyb290a2l0c0RhdGEiLCJfcm9vdGtpdF9jYXRlZ29yeSIsIl9yb290a2l0X2ZpbGUiLCJ0cm9qYW4iLCJ0cm9qYW5zIiwidHJvamFuc0RhdGEiLCJfdHJvamFuX3NpZ25hdHVyZSIsInNpZ25hdHVyZSIsInN5c2NoZWNrIiwiZXZlbnQiLCJJbnRlZ3JpdHlNb25pdG9yaW5nIiwiZXZlbnRzIiwicGF0aCIsInBhdGhzV2luZG93cyIsInBhdGhzTGludXgiLCJ1bmFtZV9hZnRlciIsImduYW1lX2FmdGVyIiwibXRpbWVfYWZ0ZXIiLCJzaXplX2FmdGVyIiwidWlkX2FmdGVyIiwiZ2lkX2FmdGVyIiwicGVybV9hZnRlciIsImlub2RlX2FmdGVyIiwicmVndWxhdG9yeSIsIm10aW1lX2JlZm9yZSIsImdldFRpbWUiLCJpbm9kZV9iZWZvcmUiLCJzaGExX2FmdGVyIiwiY2hhbmdlZF9hdHRyaWJ1dGVzIiwiYXR0cmlidXRlcyIsIm1kNV9hZnRlciIsInNoYTI1Nl9hZnRlciIsInRhZ3MiLCJwcm9jZXNzIiwiUGF0aHMiLCJwcGlkIiwiZWZmZWN0aXZlX3VzZXIiLCJ1c2VyIiwidmlydXN0b3RhbCIsImZvdW5kIiwic291cmNlIiwic2hhMSIsIlZpcnVzdG90YWwiLCJzb3VyY2VGaWxlIiwiYWxlcnRfaWQiLCJtZDUiLCJtYWxpY2lvdXMiLCJwb3NpdGl2ZXMiLCJ0b3RhbCIsInBlcm1hbGluayIsInNjYW5fZGF0ZSIsInBhcnNlIiwidnVsbmVyYWJpbGl0aWVzIiwiZGF0YVZ1bG5lcmFiaWxpdHkiLCJWdWxuZXJhYmlsaXR5IiwiZ2RwciIsInBjaV9kc3MiLCJ0c2MiLCJvc3F1ZXJ5IiwiZGF0YU9zcXVlcnkiLCJPc3F1ZXJ5IiwiY2FsZW5kYXJUaW1lIiwicmVndWxhdG9yeV9jb21wbGlhbmNlIiwicmFuZG9tX3Byb2JhYmlsaXR5X3JlZ3VsYXRvcnlfY29tcGxpYW5jZSIsInJhbmRvbVByb2JhYmlsaXR5IiwiUENJX0RTUyIsIkdEUFIiLCJncGcxMyIsIkdQRzEzIiwiaGlwYWEiLCJISVBBQSIsIm5pc3RfODAwXzgzIiwibmlzdF84MDBfNTMiLCJOSVNUXzgwMF81MyIsImF1dGhlbnRpY2F0aW9uIiwic3JjaXAiLCJJUHMiLCJzcmN1c2VyIiwic3JjcG9ydCIsInBhcmVudCIsInByb2dyYW1fbmFtZSIsImhvc3RuYW1lIiwiQXV0aGVudGljYXRpb24iLCJpbnZhbGlkTG9naW5QYXNzd29yZCIsImludmFsaWRMb2dpblVzZXIiLCJtdWx0aXBsZUF1dGhlbnRpY2F0aW9uRmFpbHVyZXMiLCJmcmVxdWVuY3kiLCJ3aW5kb3dzSW52YWxpZExvZ2luUGFzc3dvcmQiLCJ3aW4iLCJkYXRhX3dpbiIsImV2ZW50ZGF0YSIsImlwQWRkcmVzcyIsImlwUG9ydCIsInN5c3RlbSIsImNvbXB1dGVyIiwiV2luX0hvc3RuYW1lcyIsImV2ZW50SUQiLCJldmVudFJlY29yZElEIiwicHJvY2Vzc0lEIiwic3lzdGVtVGltZSIsInRhc2siLCJ0aHJlYWRJRCIsInVzZXJMb2dpbkZhaWxlZCIsImRzdHVzZXIiLCJ1aWQiLCJldWlkIiwidHR5IiwicGFzc3dvcmRDaGVja0ZhaWxlZCIsIm5vbkV4aXN0ZW50VXNlciIsImJydXRlRm9yY2VUcnlpbmdBY2Nlc3NTeXN0ZW0iLCJyZXZlcnNlTG9vY2t1cEVycm9yIiwiaW5zZWN1cmVDb25uZWN0aW9uQXR0ZW1wdCIsImF1dGhlbnRpY2F0aW9uU3VjY2VzcyIsIm1heGltdW1BdXRoZW50aWNhdGlvbkF0dGVtcHRzRXhjZWVkZWQiLCJzc2giLCJTU0giLCJ3aW5kb3dzIiwic2VydmljZV9jb250cm9sX21hbmFnZXIiLCJleHRyYV9kYXRhIiwic3lzdGVtX25hbWUiLCJzdGF0dXMiLCJwY2kiLCJpbmZvIiwiZmllbGRzIiwiYXBhY2hlIiwiQXBhY2hlIiwiX3RpbWVzdGFtcF9hcGFjaGUiLCJfcGlfaWQiLCJ3ZWIiLCJXZWIiLCJ1cmxzIiwidXNlckFnZW50IiwidXNlckFnZW50cyIsIl91c2VyX2FnZW50IiwiX2RhdGUiLCJwcmV2aW91c19vdXRwdXQiLCJwcmV2aW91c091dHB1dCIsImJlZm9yZVNlY29uZHMiLCJpIiwiam9pbiIsInJhbmRvbVVuaXF1ZVZhbHVlc0Zyb21BcnJheSIsImFycmF5IiwicmFuZG9tTWF4UmVwZXRpdGlvbnMiLCJzb3J0IiwicmVwZXRpdGlvbnMiLCJzZXQiLCJTZXQiLCJhZGQiLCJBcnJheSIsImZyb20iLCJtaW4iLCJtYXgiLCJnZW5lcmF0ZUFsZXJ0cyIsIm51bUFsZXJ0cyIsImFsZXJ0cyIsImluZiIsInN1cCIsIm5vd1RpbWVzdGFtcCIsIm5vdyIsInRpbWUiLCJ1bml4X3RpbWVzdGFtcCIsImxhc3RXZWVrIiwiZm9ybWF0dGVyTnVtYmVyIiwibnVtYmVyIiwiemVyb3MiLCJyZXBlYXQiLCJzbGljZSIsIm1vbnRoTmFtZXMiLCJsb25nIiwic2hvcnQiLCJkYXlOYW1lcyIsImRhdGUiLCJmb3JtYXQiLCJ0b2tlbnMiLCJEIiwiZCIsImdldERhdGUiLCJBIiwiZ2V0RGF5IiwiRSIsIk0iLCJnZXRNb250aCIsIkoiLCJOIiwiWSIsImdldEZ1bGxZZWFyIiwiaCIsImdldEhvdXJzIiwibSIsImdldE1pbnV0ZXMiLCJzIiwiZ2V0U2Vjb25kcyIsImwiLCJnZXRNaWxsaXNlY29uZHMiLCJzcGxpdCIsInJlZHVjZSIsImFjY3VtIiwidG9rZW4iLCJzdHIiLCJleHRyYSIsIm1hdGNoZXMiLCJtYXRjaCIsImN1ciIsIml0ZW1zIiwidmFsdWUiLCJhIiwiYyIsInVuZGVmaW5lZCIsInJlcGxhY2UiLCJwcm9iYWJpbGl0eSIsIm1heGltdW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBYUE7O0FBV0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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QUFLLEdBQUdGLEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBU1AsS0FBVCxDQUFlLEdBQWYsQ0FBZDtBQUNBLFVBQU1VLEtBQUssR0FBR0QsS0FBSyxDQUFDUixNQUFOLENBQWEsQ0FBQ1UsQ0FBRCxFQUFJQyxDQUFKLEtBQVdELENBQUMsSUFBSUEsQ0FBQyxDQUFDQyxDQUFELENBQVAsSUFBZVAsS0FBSyxDQUFDTyxDQUFELENBQXBCLElBQTJCQyxTQUFsRCxFQUE2RHBXLEtBQTdELEtBQXVFK1YsR0FBckY7QUFDQSxXQUFPTixLQUFLLENBQUNZLE9BQU4sQ0FBY04sR0FBZCxFQUFtQkUsS0FBbkIsQ0FBUDtBQUNELEdBTEQsRUFLR04sR0FMSCxDQURGLElBT0FBLEdBUkY7QUFVRDtBQUVEOzs7Ozs7O0FBS0EsU0FBU3RJLGlCQUFULENBQTJCaUosV0FBM0IsRUFBd0NDLE9BQU8sR0FBRyxHQUFsRCxFQUF1RDtBQUNyRCxTQUFPdFYscUJBQXFCLENBQUMsQ0FBRCxFQUFJc1YsT0FBSixDQUFyQixJQUFxQ0QsV0FBNUM7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBTY3JpcHQgdG8gZ2VuZXJhdGUgc2FtcGxlIGFsZXJ0c1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cblxuLy8gR2VuZXJhbFxuaW1wb3J0IHtcbiAgSVBzLFxuICBVc2VycyxcbiAgUG9ydHMsXG4gIFBhdGhzLFxuICBXaW5fSG9zdG5hbWVzLFxuICBHZW9Mb2NhdGlvbixcbiAgQWdlbnRzLFxuICByYW5kb21FbGVtZW50cyxcbiAgcmFuZG9tQXJyYXlJdGVtLFxufSBmcm9tICcuL3NhbXBsZS1kYXRhL2NvbW1vbic7XG5pbXBvcnQgeyBQQ0lfRFNTLCBHRFBSLCBISVBBQSwgR1BHMTMsIE5JU1RfODAwXzUzLCB0c2MgfSBmcm9tICcuL3NhbXBsZS1kYXRhL3JlZ3VsYXRvcnktY29tcGxpYW5jZSc7XG5cbmltcG9ydCAqIGFzIEF1ZGl0IGZyb20gJy4vc2FtcGxlLWRhdGEvYXVkaXQnO1xuaW1wb3J0ICogYXMgQXV0aGVudGljYXRpb24gZnJvbSAnLi9zYW1wbGUtZGF0YS9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQgKiBhcyBBV1MgZnJvbSAnLi9zYW1wbGUtZGF0YS9hd3MnO1xuaW1wb3J0ICogYXMgSW50ZWdyaXR5TW9uaXRvcmluZyBmcm9tICcuL3NhbXBsZS1kYXRhL2ludGVncml0eS1tb25pdG9yaW5nJztcbmltcG9ydCAqIGFzIENJU0NBVCBmcm9tICcuL3NhbXBsZS1kYXRhL2Npc2NhdCc7XG5pbXBvcnQgKiBhcyBHQ1AgZnJvbSAnLi9zYW1wbGUtZGF0YS9nY3AnO1xuaW1wb3J0ICogYXMgRG9ja2VyIGZyb20gJy4vc2FtcGxlLWRhdGEvZG9ja2VyJztcbmltcG9ydCAqIGFzIE1pdHJlIGZyb20gJy4vc2FtcGxlLWRhdGEvbWl0cmUnO1xuaW1wb3J0ICogYXMgT3NxdWVyeSBmcm9tICcuL3NhbXBsZS1kYXRhL29zcXVlcnknO1xuaW1wb3J0ICogYXMgT3BlblNDQVAgZnJvbSAnLi9zYW1wbGUtZGF0YS9vcGVuc2NhcCc7XG5pbXBvcnQgKiBhcyBQb2xpY3lNb25pdG9yaW5nIGZyb20gJy4vc2FtcGxlLWRhdGEvcG9saWN5LW1vbml0b3JpbmcnO1xuaW1wb3J0ICogYXMgVmlydXN0b3RhbCBmcm9tICcuL3NhbXBsZS1kYXRhL3ZpcnVzdG90YWwnO1xuaW1wb3J0ICogYXMgVnVsbmVyYWJpbGl0eSBmcm9tICcuL3NhbXBsZS1kYXRhL3Z1bG5lcmFiaWxpdGllcyc7XG5pbXBvcnQgKiBhcyBTU0ggZnJvbSAnLi9zYW1wbGUtZGF0YS9zc2gnO1xuaW1wb3J0ICogYXMgQXBhY2hlIGZyb20gJy4vc2FtcGxlLWRhdGEvYXBhY2hlJztcbmltcG9ydCAqIGFzIFdlYiBmcm9tICcuL3NhbXBsZS1kYXRhL3dlYic7XG5cbi8vQWxlcnRcbmNvbnN0IGFsZXJ0SURNYXggPSA2MDAwO1xuXG4vLyBSdWxlXG5jb25zdCBydWxlRGVzY3JpcHRpb24gPSBbXG4gICdTYW1wbGUgYWxlcnQgMScsXG4gICdTYW1wbGUgYWxlcnQgMicsXG4gICdTYW1wbGUgYWxlcnQgMycsXG4gICdTYW1wbGUgYWxlcnQgNCcsXG4gICdTYW1wbGUgYWxlcnQgNScsXG5dO1xuY29uc3QgcnVsZU1heExldmVsID0gMTQ7XG5cbi8qKlxuICogR2VuZXJhdGUgYSBhbGVydFxuICogQHBhcmFtIHthbnl9IHBhcmFtcyAtIHBhcmFtcyB0byBjb25maWd1cmUgdGhlIGFsZXJ0XG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5hd3MgLSBpZiB0cnVlLCBzZXQgYXdzIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYXVkaXQgLSBpZiB0cnVlLCBzZXQgU3lzdGVtIEF1ZGl0aW5nIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuY2lzY2F0IC0gaWYgdHJ1ZSwgc2V0IENJUy1DQVQgZmllbGRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5nY3AgLSBpZiB0cnVlLCBzZXQgR0NQIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuZG9ja2VyIC0gaWYgdHJ1ZSwgc2V0IERvY2tlciBmaWVsZHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLm1pdHJlIC0gaWYgdHJ1ZSwgc2V0IE1pdHJlIGF0dCZjayBmaWVsZHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLm9wZW5zY2FwIC0gaWYgdHJ1ZSwgc2V0IE9wZW5TQ0FQIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMub3NxdWVyeSAtIGlmIHRydWUsIHNldCBPc3F1ZXJ5IGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMucm9vdGNoZWNrIC0gaWYgdHJ1ZSwgc2V0IFBvbGljeSBtb25pdG9yaW5nIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuc3lzY2hlY2sgLSBpZiB0cnVlLCBzZXQgaW50ZWdyaXR5IG1vbml0b3JpbmcgZmllbGRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy52aXJ1c3RvdGFsIC0gaWYgdHJ1ZSwgc2V0IFZpcnVzVG90YWwgZmllbGRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy52dWxuZXJhYmlsaXRpZXMgLSBpZiB0cnVlLCBzZXQgdnVsbmVyYWJpbGl0aWVzIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMucGNpX2RzcyAtIGlmIHRydWUsIHNldCBwY2lfZHNzIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuZ2RwciAtIGlmIHRydWUsIHNldCBnZHByIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuZ3BnMTMgLSBpZiB0cnVlLCBzZXQgZ3BnMTMgZmllbGRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy5oaXBhYSAtIGlmIHRydWUsIHNldCBoaXBhYSBmaWVsZHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyYW1zLm5pc3RfODAwXzUzIC0gaWYgdHJ1ZSwgc2V0IG5pc3RfODAwXzUzIGZpZWxkc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMubmlzdF84MDBfNTMgLSBpZiB0cnVlLCBzZXQgbmlzdF84MDBfNTMgZmllbGRzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmFtcy53aW5fYXV0aGVudGljYXRpb25fZmFpbGVkIC0gaWYgdHJ1ZSwgYWRkIHdpbl9hdXRoZW50aWNhdGlvbl9mYWlsZWQgdG8gcnVsZS5ncm91cHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMucHJvYmFiaWxpdHlfd2luX2F1dGhlbnRpY2F0aW9uX2ZhaWxlZCAtIHByb2JhYmlsaXR5IHRvIGFkZCB3aW5fYXV0aGVudGljYXRpb25fZmFpbGVkIHRvIHJ1bGUuZ3JvdXBzLiBFeGFtcGxlOiAyMCB3aWxsIGJlIDIwJSBvZiBwcm9iYWJpbGl0eSB0byBhZGQgdGhpcyB0byBydWxlLmdyb3Vwc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYXV0aGVudGljYXRpb25fZmFpbGVkIC0gaWYgdHJ1ZSwgYWRkIHdpbl9hdXRoZW50aWNhdGlvbl9mYWlsZWQgdG8gcnVsZS5ncm91cHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMucHJvYmFiaWxpdHlfYXV0aGVudGljYXRpb25fZmFpbGVkIC0gcHJvYmFiaWxpdHkgdG8gYWRkIGF1dGhlbnRpY2F0aW9uX2ZhaWxlZCB0byBydWxlLmdyb3Vwc1xuICogQHBhcmFtIHtib29sZWFufSBwYXJhbXMuYXV0aGVudGljYXRpb25fZmFpbHVyZXMgLSBpZiB0cnVlLCBhZGQgd2luX2F1dGhlbnRpY2F0aW9uX2ZhaWxlZCB0byBydWxlLmdyb3Vwc1xuICogQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5wcm9iYWJpbGl0eV9hdXRoZW50aWNhdGlvbl9mYWlsdXJlcyAtIHByb2JhYmlsaXR5IHRvIGFkZCBhdXRoZW50aWNhdGlvbl9mYWlsdXJlcyB0byBydWxlLmdyb3Vwc1xuICogQHJldHVybiB7YW55fSAtIEFsZXJ0IGdlbmVyYXRlZFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUFsZXJ0KHBhcmFtcykge1xuICBsZXQgYWxlcnQgPSB7XG4gICAgWydAc2FtcGxlZGF0YSddOiB0cnVlLFxuICAgIHRpbWVzdGFtcDogJzIwMjAtMDEtMjdUMTE6MDg6NDcuNzc3KzAwMDAnLFxuICAgIHJ1bGU6IHtcbiAgICAgIGxldmVsOiAzLFxuICAgICAgZGVzY3JpcHRpb246ICdTYW1wbGUgYWxlcnQnLFxuICAgICAgaWQ6ICc1NTAyJyxcbiAgICAgIG1haWw6IGZhbHNlLFxuICAgICAgZ3JvdXBzOiBbXSxcbiAgICB9LFxuICAgIGFnZW50OiB7XG4gICAgICBpZDogJzAwMCcsXG4gICAgICBuYW1lOiAnbWFzdGVyJyxcbiAgICB9LFxuICAgIG1hbmFnZXI6IHtcbiAgICAgIG5hbWU6ICdtYXN0ZXInLFxuICAgIH0sXG4gICAgY2x1c3Rlcjoge1xuICAgICAgbmFtZTogJ3dhenVoJyxcbiAgICB9LFxuICAgIGlkOiAnMTU4MDEyMzMyNy40OTAzMScsXG4gICAgcHJlZGVjb2Rlcjoge30sXG4gICAgZGVjb2Rlcjoge30sXG4gICAgZGF0YToge30sXG4gICAgbG9jYXRpb246ICcnLFxuICB9O1xuICBhbGVydC5hZ2VudCA9IHJhbmRvbUFycmF5SXRlbShBZ2VudHMpO1xuICBhbGVydC5ydWxlLmRlc2NyaXB0aW9uID0gcmFuZG9tQXJyYXlJdGVtKHJ1bGVEZXNjcmlwdGlvbik7XG4gIGFsZXJ0LnJ1bGUuaWQgPSBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoMSwgYWxlcnRJRE1heCl9YDtcbiAgYWxlcnQucnVsZS5sZXZlbCA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCBydWxlTWF4TGV2ZWwpO1xuXG4gIGFsZXJ0LnRpbWVzdGFtcCA9IHJhbmRvbURhdGUoKTtcblxuICBpZiAocGFyYW1zLm1hbmFnZXIpIHtcbiAgICBpZiAocGFyYW1zLm1hbmFnZXIubmFtZSkge1xuICAgICAgYWxlcnQubWFuYWdlci5uYW1lID0gcGFyYW1zLm1hbmFnZXIubmFtZTtcbiAgICB9XG4gIH1cblxuICBpZiAocGFyYW1zLmNsdXN0ZXIpIHtcbiAgICBpZiAocGFyYW1zLmNsdXN0ZXIubmFtZSkge1xuICAgICAgYWxlcnQuY2x1c3Rlci5uYW1lID0gcGFyYW1zLmNsdXN0ZXIubmFtZTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy5jbHVzdGVyLm5vZGUpIHtcbiAgICAgIGFsZXJ0LmNsdXN0ZXIubm9kZSA9IHBhcmFtcy5jbHVzdGVyLm5vZGU7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmFtcy5hd3MpIHtcbiAgICBsZXQgcmFuZG9tVHlwZSA9IHJhbmRvbUFycmF5SXRlbShbXG4gICAgICAnZ3VhcmRkdXR5UG9ydFByb2JlJyxcbiAgICAgICdhcGlDYWxsJyxcbiAgICAgICduZXR3b3JrQ29ubmVjdGlvbicsXG4gICAgICAnaWFtUG9saWN5R3JhbnRHbG9iYWwnLFxuICAgIF0pO1xuXG4gICAgY29uc3QgYmVmb3JlRGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCkgLSAzICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgc3dpdGNoIChyYW5kb21UeXBlKSB7XG4gICAgICBjYXNlICdndWFyZGR1dHlQb3J0UHJvYmUnOiB7XG4gICAgICAgIGNvbnN0IHR5cGVBbGVydCA9IEFXUy5ndWFyZGR1dHlQb3J0UHJvYmU7XG5cbiAgICAgICAgYWxlcnQuZGF0YSA9IHsgLi4udHlwZUFsZXJ0LmRhdGEgfTtcbiAgICAgICAgYWxlcnQuZGF0YS5pbnRlZ3JhdGlvbiA9ICdhd3MnO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5yZWdpb24gPSByYW5kb21BcnJheUl0ZW0oQVdTLnJlZ2lvbik7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnJlc291cmNlLmluc3RhbmNlRGV0YWlscyA9IHsgLi4ucmFuZG9tQXJyYXlJdGVtKEFXUy5pbnN0YW5jZURldGFpbHMpIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnJlc291cmNlLmluc3RhbmNlRGV0YWlscy5pYW1JbnN0YW5jZVByb2ZpbGUuYXJuID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKFxuICAgICAgICAgIHR5cGVBbGVydC5kYXRhLmF3cy5yZXNvdXJjZS5pbnN0YW5jZURldGFpbHMuaWFtSW5zdGFuY2VQcm9maWxlLmFybixcbiAgICAgICAgICBhbGVydFxuICAgICAgICApO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy50aXRsZSA9IGludGVycG9sYXRlQWxlcnRQcm9wcyhhbGVydC5kYXRhLmF3cy50aXRsZSwgYWxlcnQpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5hY2NvdW50SWQgPSByYW5kb21BcnJheUl0ZW0oQVdTLmFjY291bnRJZCk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuZXZlbnRGaXJzdFNlZW4gPSBmb3JtYXREYXRlKGJlZm9yZURhdGUsICdZLU0tRFRoOm06cy5sWicpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zZXJ2aWNlLmV2ZW50TGFzdFNlZW4gPSBmb3JtYXREYXRlKFxuICAgICAgICAgIG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCksXG4gICAgICAgICAgJ1ktTS1EVGg6bTpzLmxaJ1xuICAgICAgICApO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zZXJ2aWNlLmFjdGlvbi5wb3J0UHJvYmVBY3Rpb24ucG9ydFByb2JlRGV0YWlscy5yZW1vdGVJcERldGFpbHMgPSB7XG4gICAgICAgICAgLi4ucmFuZG9tQXJyYXlJdGVtKEFXUy5yZW1vdGVJcERldGFpbHMpLFxuICAgICAgICB9O1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5sb2dfaW5mbyA9IHtcbiAgICAgICAgICBzM2J1Y2tldDogcmFuZG9tQXJyYXlJdGVtKEFXUy5idWNrZXRzKSxcbiAgICAgICAgICBsb2dfZmlsZTogYGd1YXJkZHV0eS8ke2Zvcm1hdERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLFxuICAgICAgICAgICAgJ1kvTS9EL2gnXG4gICAgICAgICAgKX0vZmlyZWhvc2VfZ3VhcmRkdXR5LTEtJHtmb3JtYXREYXRlKFxuICAgICAgICAgICAgbmV3IERhdGUoYWxlcnQudGltZXN0YW1wKSxcbiAgICAgICAgICAgICdZLU0tRC1oLW0tcy1sJ1xuICAgICAgICAgICl9YjViOWItZWM2Mi00YTA3LTg1ZDctYjE2OTliOWMwMzFlLnppcGAsXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuY291bnQgPSBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoNDAwLCA0MDAwKX1gO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5jcmVhdGVkQXQgPSBmb3JtYXREYXRlKGJlZm9yZURhdGUsICdZLU0tRFRoOm06cy5sWicpO1xuXG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCA1MCk7XG4gICAgICAgIGFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24gPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHModHlwZUFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24sIGFsZXJ0KTtcblxuICAgICAgICBhbGVydC5kZWNvZGVyID0geyAuLi50eXBlQWxlcnQuZGVjb2RlciB9O1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IHR5cGVBbGVydC5sb2NhdGlvbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdhcGlDYWxsJzoge1xuICAgICAgICBjb25zdCB0eXBlQWxlcnQgPSBBV1MuYXBpQ2FsbDtcblxuICAgICAgICBhbGVydC5kYXRhID0geyAuLi50eXBlQWxlcnQuZGF0YSB9O1xuICAgICAgICBhbGVydC5kYXRhLmludGVncmF0aW9uID0gJ2F3cyc7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnJlZ2lvbiA9IHJhbmRvbUFycmF5SXRlbShBV1MucmVnaW9uKTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3MucmVzb3VyY2UuYWNjZXNzS2V5RGV0YWlscy51c2VyTmFtZSA9IHJhbmRvbUFycmF5SXRlbShVc2Vycyk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLmxvZ19pbmZvID0ge1xuICAgICAgICAgIHMzYnVja2V0OiByYW5kb21BcnJheUl0ZW0oQVdTLmJ1Y2tldHMpLFxuICAgICAgICAgIGxvZ19maWxlOiBgZ3VhcmRkdXR5LyR7Zm9ybWF0RGF0ZShcbiAgICAgICAgICAgIG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCksXG4gICAgICAgICAgICAnWS9NL0QvaCdcbiAgICAgICAgICApfS9maXJlaG9zZV9ndWFyZGR1dHktMS0ke2Zvcm1hdERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLFxuICAgICAgICAgICAgJ1ktTS1ELWgtbS1zLWwnXG4gICAgICAgICAgKX1iNWI5Yi1lYzYyLTRhMDctODVkNy1iMTY5OWI5YzAzMWUuemlwYCxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3MuYWNjb3VudElkID0gcmFuZG9tQXJyYXlJdGVtKEFXUy5hY2NvdW50SWQpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zZXJ2aWNlLmFjdGlvbi5hd3NBcGlDYWxsQWN0aW9uLnJlbW90ZUlwRGV0YWlscyA9IHtcbiAgICAgICAgICAuLi5yYW5kb21BcnJheUl0ZW0oQVdTLnJlbW90ZUlwRGV0YWlscyksXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuZXZlbnRGaXJzdFNlZW4gPSBmb3JtYXREYXRlKGJlZm9yZURhdGUsICdZLU0tRFRoOm06cy5sWicpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zZXJ2aWNlLmV2ZW50TGFzdFNlZW4gPSBmb3JtYXREYXRlKFxuICAgICAgICAgIG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCksXG4gICAgICAgICAgJ1ktTS1EVGg6bTpzLmxaJ1xuICAgICAgICApO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5jcmVhdGVkQXQgPSBmb3JtYXREYXRlKGJlZm9yZURhdGUsICdZLU0tRFRoOm06cy5sWicpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy50aXRsZSA9IGludGVycG9sYXRlQWxlcnRQcm9wcyhhbGVydC5kYXRhLmF3cy50aXRsZSwgYWxlcnQpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5kZXNjcmlwdGlvbiA9IGludGVycG9sYXRlQWxlcnRQcm9wcyhhbGVydC5kYXRhLmF3cy5kZXNjcmlwdGlvbiwgYWxlcnQpO1xuICAgICAgICBjb25zdCBjb3VudCA9IGAke3JhbmRvbUludGVydmFsSW50ZWdlcig0MDAsIDQwMDApfWA7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuYWRkaXRpb25hbEluZm8ucmVjZW50QXBpQ2FsbHMuY291bnQgPSBjb3VudDtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3Muc2VydmljZS5jb3VudCA9IGNvdW50O1xuXG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCA1MCk7XG4gICAgICAgIGFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24gPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHModHlwZUFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24sIGFsZXJ0KTtcblxuICAgICAgICBhbGVydC5kZWNvZGVyID0geyAuLi50eXBlQWxlcnQuZGVjb2RlciB9O1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IHR5cGVBbGVydC5sb2NhdGlvbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICduZXR3b3JrQ29ubmVjdGlvbic6IHtcbiAgICAgICAgY29uc3QgdHlwZUFsZXJ0ID0gQVdTLm5ldHdvcmtDb25uZWN0aW9uO1xuXG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7IC4uLnR5cGVBbGVydC5kYXRhIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuaW50ZWdyYXRpb24gPSAnYXdzJztcbiAgICAgICAgYWxlcnQuZGF0YS5hd3MucmVnaW9uID0gcmFuZG9tQXJyYXlJdGVtKEFXUy5yZWdpb24pO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5yZXNvdXJjZS5pbnN0YW5jZURldGFpbHMgPSB7IC4uLnJhbmRvbUFycmF5SXRlbShBV1MuaW5zdGFuY2VEZXRhaWxzKSB9O1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5sb2dfaW5mbyA9IHtcbiAgICAgICAgICBzM2J1Y2tldDogcmFuZG9tQXJyYXlJdGVtKEFXUy5idWNrZXRzKSxcbiAgICAgICAgICBsb2dfZmlsZTogYGd1YXJkZHV0eS8ke2Zvcm1hdERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLFxuICAgICAgICAgICAgJ1kvTS9EL2gnXG4gICAgICAgICAgKX0vZmlyZWhvc2VfZ3VhcmRkdXR5LTEtJHtmb3JtYXREYXRlKFxuICAgICAgICAgICAgbmV3IERhdGUoYWxlcnQudGltZXN0YW1wKSxcbiAgICAgICAgICAgICdZLU0tRC1oLW0tcy1sJ1xuICAgICAgICAgICl9YjViOWItZWM2Mi00YTA3LTg1ZDctYjE2OTliOWMwMzFlLnppcGAsXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLmRlc2NyaXB0aW9uID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKGFsZXJ0LmRhdGEuYXdzLmRlc2NyaXB0aW9uLCBhbGVydCk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnRpdGxlID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKGFsZXJ0LmRhdGEuYXdzLnRpdGxlLCBhbGVydCk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLmFjY291bnRJZCA9IHJhbmRvbUFycmF5SXRlbShBV1MuYWNjb3VudElkKTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3MuY3JlYXRlZEF0ID0gZm9ybWF0RGF0ZShiZWZvcmVEYXRlLCAnWS1NLURUaDptOnMubFonKTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3Muc2VydmljZS5hY3Rpb24ubmV0d29ya0Nvbm5lY3Rpb25BY3Rpb24ucmVtb3RlSXBEZXRhaWxzID0ge1xuICAgICAgICAgIC4uLnJhbmRvbUFycmF5SXRlbShBV1MucmVtb3RlSXBEZXRhaWxzKSxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3Muc2VydmljZS5ldmVudEZpcnN0U2VlbiA9IGZvcm1hdERhdGUoYmVmb3JlRGF0ZSwgJ1ktTS1EVGg6bTpzLmxaJyk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuZXZlbnRMYXN0U2VlbiA9IGZvcm1hdERhdGUoXG4gICAgICAgICAgbmV3IERhdGUoYWxlcnQudGltZXN0YW1wKSxcbiAgICAgICAgICAnWS1NLURUaDptOnMubFonXG4gICAgICAgICk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuYWRkaXRpb25hbEluZm8gPSB7XG4gICAgICAgICAgbG9jYWxQb3J0OiBgJHtyYW5kb21BcnJheUl0ZW0oUG9ydHMpfWAsXG4gICAgICAgICAgb3V0Qnl0ZXM6IGAke3JhbmRvbUludGVydmFsSW50ZWdlcigxMDAwLCAzMDAwKX1gLFxuICAgICAgICAgIGluQnl0ZXM6IGAke3JhbmRvbUludGVydmFsSW50ZWdlcigxMDAwLCAxMDAwMCl9YCxcbiAgICAgICAgICB1bnVzdWFsOiBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoMTAwMCwgMTAwMDApfWAsXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnNlcnZpY2UuY291bnQgPSBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoNDAwLCA0MDAwKX1gO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zZXJ2aWNlLmFjdGlvbi5uZXR3b3JrQ29ubmVjdGlvbkFjdGlvbi5sb2NhbElwRGV0YWlscy5pcEFkZHJlc3NWNCA9XG4gICAgICAgICAgYWxlcnQuZGF0YS5hd3MucmVzb3VyY2UuaW5zdGFuY2VEZXRhaWxzLm5ldHdvcmtJbnRlcmZhY2VzLnByaXZhdGVJcEFkZHJlc3M7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLmFybiA9IGludGVycG9sYXRlQWxlcnRQcm9wcyh0eXBlQWxlcnQuZGF0YS5hd3MuYXJuLCBhbGVydCk7XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCA1MCk7XG4gICAgICAgIGFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24gPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHModHlwZUFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24sIGFsZXJ0KTtcblxuICAgICAgICBhbGVydC5kZWNvZGVyID0geyAuLi50eXBlQWxlcnQuZGVjb2RlciB9O1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IHR5cGVBbGVydC5sb2NhdGlvbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdpYW1Qb2xpY3lHcmFudEdsb2JhbCc6IHtcbiAgICAgICAgY29uc3QgdHlwZUFsZXJ0ID0gQVdTLmlhbVBvbGljeUdyYW50R2xvYmFsO1xuXG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7IC4uLnR5cGVBbGVydC5kYXRhIH07XG4gICAgICAgIGFsZXJ0LmRhdGEuaW50ZWdyYXRpb24gPSAnYXdzJztcbiAgICAgICAgYWxlcnQuZGF0YS5hd3MucmVnaW9uID0gcmFuZG9tQXJyYXlJdGVtKEFXUy5yZWdpb24pO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5zdW1tYXJ5LlRpbWVzdGFtcHMgPSBmb3JtYXREYXRlKGJlZm9yZURhdGUsICdZLU0tRFRoOm06cy5sWicpO1xuICAgICAgICBhbGVydC5kYXRhLmF3cy5sb2dfaW5mbyA9IHtcbiAgICAgICAgICBzM2J1Y2tldDogcmFuZG9tQXJyYXlJdGVtKEFXUy5idWNrZXRzKSxcbiAgICAgICAgICBsb2dfZmlsZTogYG1hY2llLyR7Zm9ybWF0RGF0ZShcbiAgICAgICAgICAgIG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCksXG4gICAgICAgICAgICAnWS9NL0QvaCdcbiAgICAgICAgICApfS9maXJlaG9zZV9tYWNpZS0xLSR7Zm9ybWF0RGF0ZShcbiAgICAgICAgICAgIG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCksXG4gICAgICAgICAgICAnWS1NLUQtaC1tLXMnXG4gICAgICAgICAgKX0tMGIxZWRlOTQtZjM5OS00ZTU0LTg4MTUtMWM2NTg3ZWVlM2IxLy9maXJlaG9zZV9ndWFyZGR1dHktMS0ke2Zvcm1hdERhdGUoXG4gICAgICAgICAgICBuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLFxuICAgICAgICAgICAgJ1ktTS1ELWgtbS1zLWwnXG4gICAgICAgICAgKX1iNWI5Yi1lYzYyLTRhMDctODVkNy1iMTY5OWI5YzAzMWUuemlwYCxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuZGF0YS5hd3NbJ2NyZWF0ZWQtYXQnXSA9IGZvcm1hdERhdGUoYmVmb3JlRGF0ZSwgJ1ktTS1EVGg6bTpzLmxaJyk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzLnVybCA9IGludGVycG9sYXRlQWxlcnRQcm9wcyh0eXBlQWxlcnQuZGF0YS5hd3MudXJsLCBhbGVydCk7XG4gICAgICAgIGFsZXJ0LmRhdGEuYXdzWydhbGVydC1hcm4nXSA9IGludGVycG9sYXRlQWxlcnRQcm9wcyh0eXBlQWxlcnQuZGF0YS5hd3NbJ2FsZXJ0LWFybiddLCBhbGVydCk7XG5cbiAgICAgICAgYWxlcnQucnVsZSA9IHsgLi4udHlwZUFsZXJ0LnJ1bGUgfTtcbiAgICAgICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDUwKTtcblxuICAgICAgICBhbGVydC5kZWNvZGVyID0geyAuLi50eXBlQWxlcnQuZGVjb2RlciB9O1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IHR5cGVBbGVydC5sb2NhdGlvbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICB9XG4gICAgfVxuICAgIGFsZXJ0LmlucHV0ID0geyB0eXBlOiAnbG9nJyB9O1xuICAgIGFsZXJ0Lkdlb0xvY2F0aW9uID0gcmFuZG9tQXJyYXlJdGVtKEdlb0xvY2F0aW9uKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuZ2NwKSB7XG4gICAgYWxlcnQucnVsZSA9IHJhbmRvbUFycmF5SXRlbShHQ1AuYXJyYXlSdWxlcyk7XG4gICAgYWxlcnQuZGF0YS5pbnRlZ3JhdGlvbiA9ICdnY3AnO1xuICAgIGFsZXJ0LmRhdGEuZ2NwID0ge1xuICAgICAgaW5zZXJ0SWQ6ICd1azF6cGUyM3hjaicsXG4gICAgICBqc29uUGF5bG9hZDoge1xuICAgICAgICBhdXRoQW5zd2VyOiBHQ1AuYXJyYXlBdXRoQW5zd2VyW01hdGguZmxvb3IoR0NQLmFycmF5QXV0aEFuc3dlci5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgIHByb3RvY29sOiBHQ1AuYXJyYXlQcm90b2NvbFtNYXRoLmZsb29yKEdDUC5hcnJheVByb3RvY29sLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkpXSxcbiAgICAgICAgcXVlcnlOYW1lOiBHQ1AuYXJyYXlRdWVyeU5hbWVbTWF0aC5mbG9vcihHQ1AuYXJyYXlRdWVyeU5hbWUubGVuZ3RoICogTWF0aC5yYW5kb20oKSldLFxuICAgICAgICBxdWVyeVR5cGU6IEdDUC5hcnJheVF1ZXJ5VHlwZVtNYXRoLmZsb29yKEdDUC5hcnJheVF1ZXJ5VHlwZS5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgIHJlc3BvbnNlQ29kZTpcbiAgICAgICAgICBHQ1AuYXJyYXlSZXNwb25zZUNvZGVbTWF0aC5mbG9vcihHQ1AuYXJyYXlSZXNwb25zZUNvZGUubGVuZ3RoICogTWF0aC5yYW5kb20oKSldLFxuICAgICAgICBzb3VyY2VJUDogR0NQLmFycmF5U291cmNlSVBbTWF0aC5mbG9vcihHQ1AuYXJyYXlTb3VyY2VJUC5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgIHZtSW5zdGFuY2VJZDogJzQ5ODAxMTM5Mjg4MDA4Mzk2ODAuMDAwMDAwJyxcbiAgICAgICAgdm1JbnN0YW5jZU5hbWU6ICc1MzEzMzkyMjk1MzEuaW5zdGFuY2UtMScsXG4gICAgICB9LFxuICAgICAgbG9nTmFtZTogJ3Byb2plY3RzL3dhenVoLWRldi9sb2dzL2Rucy5nb29nbGVhcGlzLmNvbSUyRmRuc19xdWVyaWVzJyxcbiAgICAgIHJlY2VpdmVUaW1lc3RhbXA6ICcyMDE5LTExLTExVDAyOjQyOjA1LjA1ODUzMTUyWicsXG4gICAgICByZXNvdXJjZToge1xuICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICBsb2NhdGlvbjogR0NQLmFycmF5TG9jYXRpb25bTWF0aC5mbG9vcihHQ1AuYXJyYXlMb2NhdGlvbi5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgcHJvamVjdF9pZDogR0NQLmFycmF5UHJvamVjdFtNYXRoLmZsb29yKEdDUC5hcnJheVByb2plY3QubGVuZ3RoICogTWF0aC5yYW5kb20oKSldLFxuICAgICAgICAgIHNvdXJjZV90eXBlOiBHQ1AuYXJyYXlTb3VyY2VUeXBlW01hdGguZmxvb3IoR0NQLmFycmF5U291cmNlVHlwZS5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICAgICAgdGFyZ2V0X3R5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6IEdDUC5hcnJheVR5cGVbTWF0aC5mbG9vcihHQ1AuYXJyYXlUeXBlLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkpXSxcbiAgICAgIH0sXG4gICAgICBzZXZlcml0eTogR0NQLmFycmF5U2V2ZXJpdHlbTWF0aC5mbG9vcihHQ1AuYXJyYXlTZXZlcml0eS5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV0sXG4gICAgICB0aW1lc3RhbXA6ICcyMDE5LTExLTExVDAyOjQyOjA0LjM0OTIxNDQ5WicsXG4gICAgfTtcblxuICAgIGFsZXJ0Lkdlb0xvY2F0aW9uID0gcmFuZG9tQXJyYXlJdGVtKEdlb0xvY2F0aW9uKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuYXVkaXQpIHtcbiAgICBsZXQgZGF0YUF1ZGl0ID0gcmFuZG9tQXJyYXlJdGVtKEF1ZGl0LmRhdGFBdWRpdCk7XG4gICAgYWxlcnQuZGF0YSA9IGRhdGFBdWRpdC5kYXRhO1xuICAgIGFsZXJ0LmRhdGEuYXVkaXQuZmlsZVxuICAgICAgPyBhbGVydC5kYXRhLmF1ZGl0LmZpbGUubmFtZSA9PT0gJydcbiAgICAgICAgPyAoYWxlcnQuZGF0YS5hdWRpdC5maWxlLm5hbWUgPSByYW5kb21BcnJheUl0ZW0oQXVkaXQuZmlsZU5hbWUpKVxuICAgICAgICA6IG51bGxcbiAgICAgIDogbnVsbDtcbiAgICBhbGVydC5ydWxlID0gZGF0YUF1ZGl0LnJ1bGU7XG4gIH1cblxuICBpZiAocGFyYW1zLmNpc2NhdCkge1xuICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzLnB1c2goJ2Npc2NhdCcpO1xuICAgIGFsZXJ0LmRhdGEuY2lzID0ge307XG5cbiAgICBhbGVydC5kYXRhLmNpcy5ncm91cCA9IHJhbmRvbUFycmF5SXRlbShDSVNDQVQuZ3JvdXApO1xuICAgIGFsZXJ0LmRhdGEuY2lzLmZhaWwgPSByYW5kb21JbnRlcnZhbEludGVnZXIoMCwgMTAwKTtcbiAgICBhbGVydC5kYXRhLmNpcy5ydWxlX3RpdGxlID0gcmFuZG9tQXJyYXlJdGVtKENJU0NBVC5ydWxlVGl0bGUpO1xuICAgIGFsZXJ0LmRhdGEuY2lzLm5vdGNoZWNrZWQgPSByYW5kb21JbnRlcnZhbEludGVnZXIoMCwgMTAwKTtcbiAgICBhbGVydC5kYXRhLmNpcy5zY29yZSA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCAxMDApO1xuICAgIGFsZXJ0LmRhdGEuY2lzLnBhc3MgPSByYW5kb21JbnRlcnZhbEludGVnZXIoMCwgMTAwKTtcbiAgICBhbGVydC5kYXRhLmNpcy50aW1lc3RhbXAgPSBuZXcgRGF0ZShyYW5kb21EYXRlKCkpO1xuICAgIGFsZXJ0LmRhdGEuY2lzLmVycm9yID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDEpO1xuICAgIGFsZXJ0LmRhdGEuY2lzLmJlbmNobWFyayA9IHJhbmRvbUFycmF5SXRlbShDSVNDQVQuYmVuY2htYXJrKTtcbiAgICBhbGVydC5kYXRhLmNpcy51bmtub3duID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDEwMCk7XG4gICAgYWxlcnQuZGF0YS5jaXMubm90Y2hlY2tlZCA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCA1KTtcbiAgICBhbGVydC5kYXRhLmNpcy5yZXN1bHQgPSByYW5kb21BcnJheUl0ZW0oQ0lTQ0FULnJlc3VsdCk7XG4gIH1cblxuICBpZiAocGFyYW1zLmRvY2tlcikge1xuICAgIGNvbnN0IGRhdGFEb2NrZXIgPSByYW5kb21BcnJheUl0ZW0oRG9ja2VyLmRhdGFEb2NrZXIpO1xuICAgIGFsZXJ0LmRhdGEgPSB7fTtcbiAgICBhbGVydC5kYXRhID0gZGF0YURvY2tlci5kYXRhO1xuICAgIGFsZXJ0LnJ1bGUgPSBkYXRhRG9ja2VyLnJ1bGU7XG4gIH1cblxuICBpZiAocGFyYW1zLm1pdHJlKSB7XG4gICAgYWxlcnQucnVsZSA9IHJhbmRvbUFycmF5SXRlbShNaXRyZS5hcnJheU1pdHJlUnVsZXMpO1xuICAgIGFsZXJ0LmxvY2F0aW9uID0gcmFuZG9tQXJyYXlJdGVtKE1pdHJlLmFycmF5TG9jYXRpb24pO1xuICB9XG5cbiAgaWYgKHBhcmFtcy5vcGVuc2NhcCkge1xuICAgIGFsZXJ0LmRhdGEgPSB7fTtcbiAgICBhbGVydC5kYXRhLm9zY2FwID0ge307XG4gICAgY29uc3QgdHlwZUFsZXJ0ID0geyAuLi5yYW5kb21BcnJheUl0ZW0oT3BlblNDQVAuZGF0YSkgfTtcbiAgICBhbGVydC5kYXRhID0geyAuLi50eXBlQWxlcnQuZGF0YSB9O1xuICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDIsIDEwKTtcbiAgICBhbGVydC5pbnB1dCA9IHtcbiAgICAgIHR5cGU6ICdsb2cnLFxuICAgIH07XG4gICAgYWxlcnQuZGVjb2RlciA9IHsgLi4uT3BlblNDQVAuZGVjb2RlciB9O1xuICAgIGFsZXJ0LmxvY2F0aW9uID0gT3BlblNDQVAubG9jYXRpb247XG4gICAgaWYgKHR5cGVBbGVydC5mdWxsX2xvZykge1xuICAgICAgYWxlcnQuZnVsbF9sb2cgPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHModHlwZUFsZXJ0LmZ1bGxfbG9nLCBhbGVydCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmFtcy5yb290Y2hlY2spIHtcbiAgICBhbGVydC5sb2NhdGlvbiA9IFBvbGljeU1vbml0b3JpbmcubG9jYXRpb247XG4gICAgYWxlcnQuZGVjb2RlciA9IHsgLi4uUG9saWN5TW9uaXRvcmluZy5kZWNvZGVyIH07XG4gICAgYWxlcnQuaW5wdXQgPSB7XG4gICAgICB0eXBlOiAnbG9nJyxcbiAgICB9O1xuXG4gICAgY29uc3QgYWxlcnRDYXRlZ29yeSA9IHJhbmRvbUFycmF5SXRlbShbJ1Jvb3RraXQnLCAnVHJvamFuJ10pO1xuXG4gICAgc3dpdGNoIChhbGVydENhdGVnb3J5KSB7XG4gICAgICBjYXNlICdSb290a2l0Jzoge1xuICAgICAgICBjb25zdCByb290a2l0Q2F0ZWdvcnkgPSByYW5kb21BcnJheUl0ZW0oT2JqZWN0LmtleXMoUG9saWN5TW9uaXRvcmluZy5yb290a2l0cykpO1xuICAgICAgICBjb25zdCByb290a2l0ID0gcmFuZG9tQXJyYXlJdGVtKFBvbGljeU1vbml0b3Jpbmcucm9vdGtpdHNbcm9vdGtpdENhdGVnb3J5XSk7XG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICAgICAgdGl0bGU6IGludGVycG9sYXRlQWxlcnRQcm9wcyhQb2xpY3lNb25pdG9yaW5nLnJvb3RraXRzRGF0YS5kYXRhLnRpdGxlLCBhbGVydCwge1xuICAgICAgICAgICAgX3Jvb3RraXRfY2F0ZWdvcnk6IHJvb3RraXRDYXRlZ29yeSxcbiAgICAgICAgICAgIF9yb290a2l0X2ZpbGU6IHJvb3RraXQsXG4gICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLlBvbGljeU1vbml0b3Jpbmcucm9vdGtpdHNEYXRhLnJ1bGUgfTtcbiAgICAgICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDEwKTtcbiAgICAgICAgYWxlcnQuZnVsbF9sb2cgPSBhbGVydC5kYXRhLnRpdGxlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ1Ryb2phbic6IHtcbiAgICAgICAgY29uc3QgdHJvamFuID0gcmFuZG9tQXJyYXlJdGVtKFBvbGljeU1vbml0b3JpbmcudHJvamFucyk7XG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICAgICAgZmlsZTogdHJvamFuLmZpbGUsXG4gICAgICAgICAgdGl0bGU6ICdUcm9qYW5lZCB2ZXJzaW9uIG9mIGZpbGUgZGV0ZWN0ZWQuJyxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQucnVsZSA9IHsgLi4uUG9saWN5TW9uaXRvcmluZy50cm9qYW5zRGF0YS5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCAxMCk7XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKFBvbGljeU1vbml0b3JpbmcudHJvamFuc0RhdGEuZnVsbF9sb2csIGFsZXJ0LCB7XG4gICAgICAgICAgX3Ryb2phbl9zaWduYXR1cmU6IHRyb2phbi5zaWduYXR1cmUsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAocGFyYW1zLnN5c2NoZWNrKSB7XG4gICAgYWxlcnQucnVsZS5ncm91cHMucHVzaCgnc3lzY2hlY2snKTtcbiAgICBhbGVydC5zeXNjaGVjayA9IHt9O1xuICAgIGFsZXJ0LnN5c2NoZWNrLmV2ZW50ID0gcmFuZG9tQXJyYXlJdGVtKEludGVncml0eU1vbml0b3JpbmcuZXZlbnRzKTtcbiAgICBhbGVydC5zeXNjaGVjay5wYXRoID0gcmFuZG9tQXJyYXlJdGVtKFxuICAgICAgYWxlcnQuYWdlbnQubmFtZSA9PT0gJ1dpbmRvd3MnXG4gICAgICAgID8gSW50ZWdyaXR5TW9uaXRvcmluZy5wYXRoc1dpbmRvd3NcbiAgICAgICAgOiBJbnRlZ3JpdHlNb25pdG9yaW5nLnBhdGhzTGludXhcbiAgICApO1xuICAgIGFsZXJ0LnN5c2NoZWNrLnVuYW1lX2FmdGVyID0gcmFuZG9tQXJyYXlJdGVtKFVzZXJzKTtcbiAgICBhbGVydC5zeXNjaGVjay5nbmFtZV9hZnRlciA9ICdyb290JztcbiAgICBhbGVydC5zeXNjaGVjay5tdGltZV9hZnRlciA9IG5ldyBEYXRlKHJhbmRvbURhdGUoKSk7XG4gICAgYWxlcnQuc3lzY2hlY2suc2l6ZV9hZnRlciA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCA2NSk7XG4gICAgYWxlcnQuc3lzY2hlY2sudWlkX2FmdGVyID0gcmFuZG9tQXJyYXlJdGVtKEludGVncml0eU1vbml0b3JpbmcudWlkX2FmdGVyKTtcbiAgICBhbGVydC5zeXNjaGVjay5naWRfYWZ0ZXIgPSByYW5kb21BcnJheUl0ZW0oSW50ZWdyaXR5TW9uaXRvcmluZy5naWRfYWZ0ZXIpO1xuICAgIGFsZXJ0LnN5c2NoZWNrLnBlcm1fYWZ0ZXIgPSAncnctci0tci0tJztcbiAgICBhbGVydC5zeXNjaGVjay5pbm9kZV9hZnRlciA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCAxMDAwMDApO1xuICAgIHN3aXRjaCAoYWxlcnQuc3lzY2hlY2suZXZlbnQpIHtcbiAgICAgIGNhc2UgJ2FkZGVkJzpcbiAgICAgICAgYWxlcnQucnVsZSA9IEludGVncml0eU1vbml0b3JpbmcucmVndWxhdG9yeVswXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtb2RpZmllZCc6XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSBJbnRlZ3JpdHlNb25pdG9yaW5nLnJlZ3VsYXRvcnlbMV07XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLm10aW1lX2JlZm9yZSA9IG5ldyBEYXRlKGFsZXJ0LnN5c2NoZWNrLm10aW1lX2FmdGVyLmdldFRpbWUoKSAtIDEwMDAgKiA2MCk7XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLmlub2RlX2JlZm9yZSA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCAxMDAwMDApO1xuICAgICAgICBhbGVydC5zeXNjaGVjay5zaGExX2FmdGVyID0gcmFuZG9tRWxlbWVudHMoNDAsICdhYmNkZWYwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLmNoYW5nZWRfYXR0cmlidXRlcyA9IFtyYW5kb21BcnJheUl0ZW0oSW50ZWdyaXR5TW9uaXRvcmluZy5hdHRyaWJ1dGVzKV07XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLm1kNV9hZnRlciA9IHJhbmRvbUVsZW1lbnRzKDMyLCAnYWJjZGVmMDEyMzQ1Njc4OScpO1xuICAgICAgICBhbGVydC5zeXNjaGVjay5zaGEyNTZfYWZ0ZXIgPSByYW5kb21FbGVtZW50cyg2MCwgJ2FiY2RlZjAxMjM0NTY3ODknKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZWxldGVkJzpcbiAgICAgICAgYWxlcnQucnVsZSA9IEludGVncml0eU1vbml0b3JpbmcucmVndWxhdG9yeVsyXTtcbiAgICAgICAgYWxlcnQuc3lzY2hlY2sudGFncyA9IFtyYW5kb21BcnJheUl0ZW0oSW50ZWdyaXR5TW9uaXRvcmluZy50YWdzKV07XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLnNoYTFfYWZ0ZXIgPSByYW5kb21FbGVtZW50cyg0MCwgJ2FiY2RlZjAxMjM0NTY3ODknKTtcbiAgICAgICAgYWxlcnQuc3lzY2hlY2suYXVkaXQgPSB7XG4gICAgICAgICAgcHJvY2Vzczoge1xuICAgICAgICAgICAgbmFtZTogcmFuZG9tQXJyYXlJdGVtKFBhdGhzKSxcbiAgICAgICAgICAgIGlkOiByYW5kb21JbnRlcnZhbEludGVnZXIoMCwgMTAwMDAwKSxcbiAgICAgICAgICAgIHBwaWQ6IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCAxMDAwMDApLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZWZmZWN0aXZlX3VzZXI6IHtcbiAgICAgICAgICAgIG5hbWU6IHJhbmRvbUFycmF5SXRlbShVc2VycyksXG4gICAgICAgICAgICBpZDogcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDEwMCksXG4gICAgICAgICAgfSxcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBuYW1lOiByYW5kb21BcnJheUl0ZW0oVXNlcnMpLFxuICAgICAgICAgICAgaWQ6IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCAxMDApLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICAgIG5hbWU6IHJhbmRvbUFycmF5SXRlbShVc2VycyksXG4gICAgICAgICAgICBpZDogcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDEwMCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuc3lzY2hlY2subWQ1X2FmdGVyID0gcmFuZG9tRWxlbWVudHMoMzIsICdhYmNkZWYwMTIzNDU2Nzg5Jyk7XG4gICAgICAgIGFsZXJ0LnN5c2NoZWNrLnNoYTI1Nl9hZnRlciA9IHJhbmRvbUVsZW1lbnRzKDYwLCAnYWJjZGVmMDEyMzQ1Njc4OScpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAocGFyYW1zLnZpcnVzdG90YWwpIHtcbiAgICBhbGVydC5ydWxlLmdyb3Vwcy5wdXNoKCd2aXJ1c3RvdGFsJyk7XG4gICAgYWxlcnQubG9jYXRpb24gPSAndmlydXN0b3RhbCc7XG4gICAgYWxlcnQuZGF0YS52aXJ1c3RvdGFsID0ge307XG4gICAgYWxlcnQuZGF0YS52aXJ1c3RvdGFsLmZvdW5kID0gcmFuZG9tQXJyYXlJdGVtKFsnMCcsICcxJywgJzEnLCAnMSddKTtcblxuICAgIGFsZXJ0LmRhdGEudmlydXN0b3RhbC5zb3VyY2UgPSB7XG4gICAgICBzaGExOiByYW5kb21FbGVtZW50cyg0MCwgJ2FiY2RlZjAxMjM0NTY3ODknKSxcbiAgICAgIGZpbGU6IHJhbmRvbUFycmF5SXRlbShWaXJ1c3RvdGFsLnNvdXJjZUZpbGUpLFxuICAgICAgYWxlcnRfaWQ6IGAke3JhbmRvbUVsZW1lbnRzKDEwLCAnMDEyMzQ1Njc4OScpfS4ke3JhbmRvbUVsZW1lbnRzKDcsICcwMTIzNDU2Nzg5Jyl9YCxcbiAgICAgIG1kNTogcmFuZG9tRWxlbWVudHMoMzIsICdhYmNkZWYwMTIzNDU2Nzg5JyksXG4gICAgfTtcblxuICAgIGlmIChhbGVydC5kYXRhLnZpcnVzdG90YWwuZm91bmQgPT09ICcxJykge1xuICAgICAgYWxlcnQuZGF0YS52aXJ1c3RvdGFsLm1hbGljaW91cyA9IHJhbmRvbUFycmF5SXRlbShWaXJ1c3RvdGFsLm1hbGljaW91cyk7XG4gICAgICBhbGVydC5kYXRhLnZpcnVzdG90YWwucG9zaXRpdmVzID0gYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDY1KX1gO1xuICAgICAgYWxlcnQuZGF0YS52aXJ1c3RvdGFsLnRvdGFsID1cbiAgICAgICAgYWxlcnQuZGF0YS52aXJ1c3RvdGFsLm1hbGljaW91cyArIGFsZXJ0LmRhdGEudmlydXN0b3RhbC5wb3NpdGl2ZXM7XG4gICAgICBhbGVydC5ydWxlLmRlc2NyaXB0aW9uID0gYFZpcnVzVG90YWw6IEFsZXJ0IC0gJHthbGVydC5kYXRhLnZpcnVzdG90YWwuc291cmNlLmZpbGV9IC0gJHthbGVydC5kYXRhLnZpcnVzdG90YWwucG9zaXRpdmVzfSBlbmdpbmVzIGRldGVjdGVkIHRoaXMgZmlsZWA7XG4gICAgICBhbGVydC5kYXRhLnZpcnVzdG90YWwucGVybWFsaW5rID0gcmFuZG9tQXJyYXlJdGVtKFZpcnVzdG90YWwucGVybWFsaW5rKTtcbiAgICAgIGFsZXJ0LmRhdGEudmlydXN0b3RhbC5zY2FuX2RhdGUgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKGFsZXJ0LnRpbWVzdGFtcCkgLSA0ICogNjAwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbGVydC5kYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzID0gJzAnO1xuICAgICAgYWxlcnQucnVsZS5kZXNjcmlwdGlvbiA9ICdWaXJ1c1RvdGFsOiBBbGVydCAtIE5vIHJlY29yZHMgaW4gVmlydXNUb3RhbCBkYXRhYmFzZSc7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmFtcy52dWxuZXJhYmlsaXRpZXMpIHtcbiAgICBjb25zdCBkYXRhVnVsbmVyYWJpbGl0eSA9IHJhbmRvbUFycmF5SXRlbShWdWxuZXJhYmlsaXR5LmRhdGEpO1xuICAgIGFsZXJ0LnJ1bGUgPSB7XG4gICAgICAuLi5kYXRhVnVsbmVyYWJpbGl0eS5ydWxlLFxuICAgICAgbWFpbDogZmFsc2UsXG4gICAgICBncm91cHM6IFsndnVsbmVyYWJpbGl0eS1kZXRlY3RvciddLFxuICAgICAgZ2RwcjogWydJVl8zNS43LmQnXSxcbiAgICAgIHBjaV9kc3M6IFsnMTEuMi4xJywgJzExLjIuMyddLFxuICAgICAgdHNjOiBbJ0NDNy4xJywgJ0NDNy4yJ10sXG4gICAgfTtcbiAgICBhbGVydC5sb2NhdGlvbiA9ICd2dWxuZXJhYmlsaXR5LWRldGVjdG9yJztcbiAgICBhbGVydC5kZWNvZGVyID0geyBuYW1lOiAnanNvbicgfTtcbiAgICBhbGVydC5kYXRhID0ge1xuICAgICAgLi4uZGF0YVZ1bG5lcmFiaWxpdHkuZGF0YSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHBhcmFtcy5vc3F1ZXJ5KSB7XG4gICAgYWxlcnQucnVsZS5ncm91cHMucHVzaCgnb3NxdWVyeScpO1xuICAgIGFsZXJ0LmRhdGEub3NxdWVyeSA9IHt9O1xuICAgIGlmIChyYW5kb21JbnRlcnZhbEludGVnZXIoMCwgNSkgPT09IDApIHtcbiAgICAgIGFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24gPSAnb3NxdWVyeSBlcnJvciBtZXNzYWdlJztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGRhdGFPc3F1ZXJ5ID0gcmFuZG9tQXJyYXlJdGVtKE9zcXVlcnkuZGF0YU9zcXVlcnkpO1xuICAgICAgYWxlcnQuZGF0YS5vc3F1ZXJ5ID0gZGF0YU9zcXVlcnkub3NxdWVyeTtcbiAgICAgIGFsZXJ0LmRhdGEub3NxdWVyeS5jYWxlbmRhclRpbWUgPSBhbGVydC50aW1lc3RhbXA7XG4gICAgICBhbGVydC5ydWxlLmRlc2NyaXB0aW9uID0gZGF0YU9zcXVlcnkucnVsZS5kZXNjcmlwdGlvbjtcbiAgICAgIHJhbmRvbUludGVydmFsSW50ZWdlcigwLCA5OSkgPT09IDAgPyAoYWxlcnQuZGF0YS5vc3F1ZXJ5LmFjdGlvbiA9ICdyZW1vdmVkJykgOiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlZ3VsYXRvcnkgY29tcGxpYW5jZVxuICBpZiAoXG4gICAgcGFyYW1zLnBjaV9kc3MgfHxcbiAgICBwYXJhbXMucmVndWxhdG9yeV9jb21wbGlhbmNlIHx8XG4gICAgKHBhcmFtcy5yYW5kb21fcHJvYmFiaWxpdHlfcmVndWxhdG9yeV9jb21wbGlhbmNlICYmXG4gICAgICByYW5kb21Qcm9iYWJpbGl0eShwYXJhbXMucmFuZG9tX3Byb2JhYmlsaXR5X3JlZ3VsYXRvcnlfY29tcGxpYW5jZSkpXG4gICkge1xuICAgIGFsZXJ0LnJ1bGUucGNpX2RzcyA9IFtyYW5kb21BcnJheUl0ZW0oUENJX0RTUyldO1xuICB9XG4gIGlmIChcbiAgICBwYXJhbXMuZ2RwciB8fFxuICAgIHBhcmFtcy5yZWd1bGF0b3J5X2NvbXBsaWFuY2UgfHxcbiAgICAocGFyYW1zLnJhbmRvbV9wcm9iYWJpbGl0eV9yZWd1bGF0b3J5X2NvbXBsaWFuY2UgJiZcbiAgICAgIHJhbmRvbVByb2JhYmlsaXR5KHBhcmFtcy5yYW5kb21fcHJvYmFiaWxpdHlfcmVndWxhdG9yeV9jb21wbGlhbmNlKSlcbiAgKSB7XG4gICAgYWxlcnQucnVsZS5nZHByID0gW3JhbmRvbUFycmF5SXRlbShHRFBSKV07XG4gIH1cbiAgaWYgKFxuICAgIHBhcmFtcy5ncGcxMyB8fFxuICAgIHBhcmFtcy5yZWd1bGF0b3J5X2NvbXBsaWFuY2UgfHxcbiAgICAocGFyYW1zLnJhbmRvbV9wcm9iYWJpbGl0eV9yZWd1bGF0b3J5X2NvbXBsaWFuY2UgJiZcbiAgICAgIHJhbmRvbVByb2JhYmlsaXR5KHBhcmFtcy5yYW5kb21fcHJvYmFiaWxpdHlfcmVndWxhdG9yeV9jb21wbGlhbmNlKSlcbiAgKSB7XG4gICAgYWxlcnQucnVsZS5ncGcxMyA9IFtyYW5kb21BcnJheUl0ZW0oR1BHMTMpXTtcbiAgfVxuICBpZiAoXG4gICAgcGFyYW1zLmhpcGFhIHx8XG4gICAgcGFyYW1zLnJlZ3VsYXRvcnlfY29tcGxpYW5jZSB8fFxuICAgIChwYXJhbXMucmFuZG9tX3Byb2JhYmlsaXR5X3JlZ3VsYXRvcnlfY29tcGxpYW5jZSAmJlxuICAgICAgcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKHBhcmFtcy5yYW5kb21fcHJvYmFiaWxpdHlfcmVndWxhdG9yeV9jb21wbGlhbmNlKSlcbiAgKSB7XG4gICAgYWxlcnQucnVsZS5oaXBhYSA9IFtyYW5kb21BcnJheUl0ZW0oSElQQUEpXTtcbiAgfVxuICBpZiAoXG4gICAgcGFyYW1zLm5pc3RfODAwXzgzIHx8XG4gICAgcGFyYW1zLnJlZ3VsYXRvcnlfY29tcGxpYW5jZSB8fFxuICAgIChwYXJhbXMucmFuZG9tX3Byb2JhYmlsaXR5X3JlZ3VsYXRvcnlfY29tcGxpYW5jZSAmJlxuICAgICAgcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKHBhcmFtcy5yYW5kb21fcHJvYmFiaWxpdHlfcmVndWxhdG9yeV9jb21wbGlhbmNlKSlcbiAgKSB7XG4gICAgYWxlcnQucnVsZS5uaXN0XzgwMF81MyA9IFtyYW5kb21BcnJheUl0ZW0oTklTVF84MDBfNTMpXTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuYXV0aGVudGljYXRpb24pIHtcbiAgICBhbGVydC5kYXRhID0ge1xuICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgc3JjdXNlcjogcmFuZG9tQXJyYXlJdGVtKFVzZXJzKSxcbiAgICAgIHNyY3BvcnQ6IHJhbmRvbUFycmF5SXRlbShQb3J0cyksXG4gICAgfTtcbiAgICBhbGVydC5HZW9Mb2NhdGlvbiA9IHJhbmRvbUFycmF5SXRlbShHZW9Mb2NhdGlvbik7XG4gICAgYWxlcnQuZGVjb2RlciA9IHtcbiAgICAgIG5hbWU6ICdzc2hkJyxcbiAgICAgIHBhcmVudDogJ3NzaGQnLFxuICAgIH07XG4gICAgYWxlcnQuaW5wdXQgPSB7XG4gICAgICB0eXBlOiAnbG9nJyxcbiAgICB9O1xuICAgIGFsZXJ0LnByZWRlY29kZXIgPSB7XG4gICAgICBwcm9ncmFtX25hbWU6ICdzc2hkJyxcbiAgICAgIHRpbWVzdGFtcDogZm9ybWF0RGF0ZShuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLCAnTiBEIGg6bTpzJyksXG4gICAgICBob3N0bmFtZTogYWxlcnQubWFuYWdlci5uYW1lLFxuICAgIH07XG4gICAgbGV0IHR5cGVBbGVydCA9IHJhbmRvbUFycmF5SXRlbShbXG4gICAgICAnaW52YWxpZExvZ2luUGFzc3dvcmQnLFxuICAgICAgJ2ludmFsaWRMb2dpblVzZXInLFxuICAgICAgJ211bHRpcGxlQXV0aGVudGljYXRpb25GYWlsdXJlcycsXG4gICAgICAnd2luZG93c0ludmFsaWRMb2dpblBhc3N3b3JkJyxcbiAgICAgICd1c2VyTG9naW5GYWlsZWQnLFxuICAgICAgJ3Bhc3N3b3JkQ2hlY2tGYWlsZWQnLFxuICAgICAgJ25vbkV4aXN0ZW50VXNlcicsXG4gICAgICAnYnJ1dGVGb3JjZVRyeWluZ0FjY2Vzc1N5c3RlbScsXG4gICAgICAnYXV0aGVudGljYXRpb25TdWNjZXNzJyxcbiAgICAgICdtYXhpbXVtQXV0aGVudGljYXRpb25BdHRlbXB0c0V4Y2VlZGVkJyxcbiAgICBdKTtcblxuICAgIHN3aXRjaCAodHlwZUFsZXJ0KSB7XG4gICAgICBjYXNlICdpbnZhbGlkTG9naW5QYXNzd29yZCc6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi5pbnZhbGlkTG9naW5QYXNzd29yZC5sb2NhdGlvbjtcbiAgICAgICAgYWxlcnQucnVsZSA9IHsgLi4uQXV0aGVudGljYXRpb24uaW52YWxpZExvZ2luUGFzc3dvcmQucnVsZSB9O1xuICAgICAgICBhbGVydC5ydWxlLmdyb3VwcyA9IFsuLi5BdXRoZW50aWNhdGlvbi5pbnZhbGlkTG9naW5QYXNzd29yZC5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKEF1dGhlbnRpY2F0aW9uLmludmFsaWRMb2dpblBhc3N3b3JkLmZ1bGxfbG9nLCBhbGVydCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnaW52YWxpZExvZ2luVXNlcic6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi5pbnZhbGlkTG9naW5Vc2VyLmxvY2F0aW9uO1xuICAgICAgICBhbGVydC5ydWxlID0geyAuLi5BdXRoZW50aWNhdGlvbi5pbnZhbGlkTG9naW5Vc2VyLnJ1bGUgfTtcbiAgICAgICAgYWxlcnQucnVsZS5ncm91cHMgPSBbLi4uQXV0aGVudGljYXRpb24uaW52YWxpZExvZ2luVXNlci5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKEF1dGhlbnRpY2F0aW9uLmludmFsaWRMb2dpblVzZXIuZnVsbF9sb2csIGFsZXJ0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdtdWx0aXBsZUF1dGhlbnRpY2F0aW9uRmFpbHVyZXMnOiB7XG4gICAgICAgIGFsZXJ0LmxvY2F0aW9uID0gQXV0aGVudGljYXRpb24ubXVsdGlwbGVBdXRoZW50aWNhdGlvbkZhaWx1cmVzLmxvY2F0aW9uO1xuICAgICAgICBhbGVydC5ydWxlID0geyAuLi5BdXRoZW50aWNhdGlvbi5tdWx0aXBsZUF1dGhlbnRpY2F0aW9uRmFpbHVyZXMucnVsZSB9O1xuICAgICAgICBhbGVydC5ydWxlLmdyb3VwcyA9IFsuLi5BdXRoZW50aWNhdGlvbi5tdWx0aXBsZUF1dGhlbnRpY2F0aW9uRmFpbHVyZXMucnVsZS5ncm91cHNdO1xuICAgICAgICBhbGVydC5ydWxlLmZyZXF1ZW5jeSA9IHJhbmRvbUludGVydmFsSW50ZWdlcig1LCA1MCk7XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKFxuICAgICAgICAgIEF1dGhlbnRpY2F0aW9uLm11bHRpcGxlQXV0aGVudGljYXRpb25GYWlsdXJlcy5mdWxsX2xvZyxcbiAgICAgICAgICBhbGVydFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3dpbmRvd3NJbnZhbGlkTG9naW5QYXNzd29yZCc6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi53aW5kb3dzSW52YWxpZExvZ2luUGFzc3dvcmQubG9jYXRpb247XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLndpbmRvd3NJbnZhbGlkTG9naW5QYXNzd29yZC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLkF1dGhlbnRpY2F0aW9uLndpbmRvd3NJbnZhbGlkTG9naW5QYXNzd29yZC5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LnJ1bGUuZnJlcXVlbmN5ID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDUsIDUwKTtcbiAgICAgICAgYWxlcnQuZGF0YS53aW4gPSB7IC4uLkF1dGhlbnRpY2F0aW9uLndpbmRvd3NJbnZhbGlkTG9naW5QYXNzd29yZC5kYXRhX3dpbiB9O1xuICAgICAgICBhbGVydC5kYXRhLndpbi5ldmVudGRhdGEuaXBBZGRyZXNzID0gcmFuZG9tQXJyYXlJdGVtKElQcyk7XG4gICAgICAgIGFsZXJ0LmRhdGEud2luLmV2ZW50ZGF0YS5pcFBvcnQgPSByYW5kb21BcnJheUl0ZW0oUG9ydHMpO1xuICAgICAgICBhbGVydC5kYXRhLndpbi5zeXN0ZW0uY29tcHV0ZXIgPSByYW5kb21BcnJheUl0ZW0oV2luX0hvc3RuYW1lcyk7XG4gICAgICAgIGFsZXJ0LmRhdGEud2luLnN5c3RlbS5ldmVudElEID0gYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDYwMCl9YDtcbiAgICAgICAgYWxlcnQuZGF0YS53aW4uc3lzdGVtLmV2ZW50UmVjb3JkSUQgPSBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoMTAwMDAsIDUwMDAwKX1gO1xuICAgICAgICBhbGVydC5kYXRhLndpbi5zeXN0ZW0ucHJvY2Vzc0lEID0gYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDEyMDApfWA7XG4gICAgICAgIGFsZXJ0LmRhdGEud2luLnN5c3RlbS5zeXN0ZW1UaW1lID0gYWxlcnQudGltZXN0YW1wO1xuICAgICAgICBhbGVydC5kYXRhLndpbi5zeXN0ZW0ucHJvY2Vzc0lEID0gYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDEyMDApfWA7XG4gICAgICAgIGFsZXJ0LmRhdGEud2luLnN5c3RlbS50YXNrID0gYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDE4MDApfWA7XG4gICAgICAgIGFsZXJ0LmRhdGEud2luLnN5c3RlbS50aHJlYWRJRCA9IGAke3JhbmRvbUludGVydmFsSW50ZWdlcigxLCA1MDApfWA7XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKFxuICAgICAgICAgIEF1dGhlbnRpY2F0aW9uLndpbmRvd3NJbnZhbGlkTG9naW5QYXNzd29yZC5mdWxsX2xvZyxcbiAgICAgICAgICBhbGVydFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3VzZXJMb2dpbkZhaWxlZCc6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi51c2VyTG9naW5GYWlsZWQubG9jYXRpb247XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLnVzZXJMb2dpbkZhaWxlZC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLkF1dGhlbnRpY2F0aW9uLnVzZXJMb2dpbkZhaWxlZC5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgICAgIGRzdHVzZXI6IHJhbmRvbUFycmF5SXRlbShVc2VycyksXG4gICAgICAgICAgdWlkOiBgJHtyYW5kb21JbnRlcnZhbEludGVnZXIoMCwgNTApfWAsXG4gICAgICAgICAgZXVpZDogYCR7cmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIDUwKX1gLFxuICAgICAgICAgIHR0eTogJ3NzaCcsXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmRlY29kZXIgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLnVzZXJMb2dpbkZhaWxlZC5kZWNvZGVyIH07XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKEF1dGhlbnRpY2F0aW9uLnVzZXJMb2dpbkZhaWxlZC5mdWxsX2xvZywgYWxlcnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3Bhc3N3b3JkQ2hlY2tGYWlsZWQnOiB7XG4gICAgICAgIGFsZXJ0LmxvY2F0aW9uID0gQXV0aGVudGljYXRpb24ucGFzc3dvcmRDaGVja0ZhaWxlZC5sb2NhdGlvbjtcbiAgICAgICAgYWxlcnQucnVsZSA9IHsgLi4uQXV0aGVudGljYXRpb24ucGFzc3dvcmRDaGVja0ZhaWxlZC5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLkF1dGhlbnRpY2F0aW9uLnBhc3N3b3JkQ2hlY2tGYWlsZWQucnVsZS5ncm91cHNdO1xuICAgICAgICBhbGVydC5kYXRhID0ge1xuICAgICAgICAgIHNyY3VzZXI6IHJhbmRvbUFycmF5SXRlbShVc2VycyksXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LnByZWRlY29kZXIucHJvZ3JhbV9uYW1lID0gJ3VuaXhfY2hrcHdkJztcbiAgICAgICAgYWxlcnQuZGVjb2RlciA9IHsgLi4uQXV0aGVudGljYXRpb24ucGFzc3dvcmRDaGVja0ZhaWxlZC5kZWNvZGVyIH07XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKEF1dGhlbnRpY2F0aW9uLnBhc3N3b3JkQ2hlY2tGYWlsZWQuZnVsbF9sb2csIGFsZXJ0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdub25FeGlzdGVudFVzZXInOiB7XG4gICAgICAgIGFsZXJ0LmxvY2F0aW9uID0gQXV0aGVudGljYXRpb24ubm9uRXhpc3RlbnRVc2VyLmxvY2F0aW9uO1xuICAgICAgICBhbGVydC5ydWxlID0geyAuLi5BdXRoZW50aWNhdGlvbi5ub25FeGlzdGVudFVzZXIucnVsZSB9O1xuICAgICAgICBhbGVydC5ydWxlLmdyb3VwcyA9IFsuLi5BdXRoZW50aWNhdGlvbi5ub25FeGlzdGVudFVzZXIucnVsZS5ncm91cHNdO1xuICAgICAgICBhbGVydC5mdWxsX2xvZyA9IGludGVycG9sYXRlQWxlcnRQcm9wcyhBdXRoZW50aWNhdGlvbi5ub25FeGlzdGVudFVzZXIuZnVsbF9sb2csIGFsZXJ0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdicnV0ZUZvcmNlVHJ5aW5nQWNjZXNzU3lzdGVtJzoge1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IEF1dGhlbnRpY2F0aW9uLmJydXRlRm9yY2VUcnlpbmdBY2Nlc3NTeXN0ZW0ubG9jYXRpb247XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLmJydXRlRm9yY2VUcnlpbmdBY2Nlc3NTeXN0ZW0ucnVsZSB9O1xuICAgICAgICBhbGVydC5ydWxlLmdyb3VwcyA9IFsuLi5BdXRoZW50aWNhdGlvbi5icnV0ZUZvcmNlVHJ5aW5nQWNjZXNzU3lzdGVtLnJ1bGUuZ3JvdXBzXTtcbiAgICAgICAgYWxlcnQuZnVsbF9sb2cgPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHMoXG4gICAgICAgICAgQXV0aGVudGljYXRpb24uYnJ1dGVGb3JjZVRyeWluZ0FjY2Vzc1N5c3RlbS5mdWxsX2xvZyxcbiAgICAgICAgICBhbGVydFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3JldmVyc2VMb29ja3VwRXJyb3InOiB7XG4gICAgICAgIGFsZXJ0LmxvY2F0aW9uID0gQXV0aGVudGljYXRpb24ucmV2ZXJzZUxvb2NrdXBFcnJvci5sb2NhdGlvbjtcbiAgICAgICAgYWxlcnQucnVsZSA9IHsgLi4uQXV0aGVudGljYXRpb24ucmV2ZXJzZUxvb2NrdXBFcnJvci5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLkF1dGhlbnRpY2F0aW9uLnJldmVyc2VMb29ja3VwRXJyb3IucnVsZS5ncm91cHNdO1xuICAgICAgICBhbGVydC5kYXRhID0ge1xuICAgICAgICAgIHNyY2lwOiByYW5kb21BcnJheUl0ZW0oSVBzKSxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuZnVsbF9sb2cgPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHMoQXV0aGVudGljYXRpb24ucmV2ZXJzZUxvb2NrdXBFcnJvci5mdWxsX2xvZywgYWxlcnQpO1xuICAgICAgfVxuICAgICAgY2FzZSAnaW5zZWN1cmVDb25uZWN0aW9uQXR0ZW1wdCc6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi5pbnNlY3VyZUNvbm5lY3Rpb25BdHRlbXB0LmxvY2F0aW9uO1xuICAgICAgICBhbGVydC5ydWxlID0geyAuLi5BdXRoZW50aWNhdGlvbi5pbnNlY3VyZUNvbm5lY3Rpb25BdHRlbXB0LnJ1bGUgfTtcbiAgICAgICAgYWxlcnQucnVsZS5ncm91cHMgPSBbLi4uQXV0aGVudGljYXRpb24uaW5zZWN1cmVDb25uZWN0aW9uQXR0ZW1wdC5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgICAgIHNyY3BvcnQ6IHJhbmRvbUFycmF5SXRlbShQb3J0cyksXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKFxuICAgICAgICAgIEF1dGhlbnRpY2F0aW9uLmluc2VjdXJlQ29ubmVjdGlvbkF0dGVtcHQuZnVsbF9sb2csXG4gICAgICAgICAgYWxlcnRcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2F1dGhlbnRpY2F0aW9uU3VjY2Vzcyc6IHtcbiAgICAgICAgYWxlcnQubG9jYXRpb24gPSBBdXRoZW50aWNhdGlvbi5hdXRoZW50aWNhdGlvblN1Y2Nlc3MubG9jYXRpb247XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0aW9uU3VjY2Vzcy5ydWxlIH07XG4gICAgICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLkF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0aW9uU3VjY2Vzcy5ydWxlLmdyb3Vwc107XG4gICAgICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgICAgIHNyY3BvcnQ6IHJhbmRvbUFycmF5SXRlbShQb3J0cyksXG4gICAgICAgICAgZHN0dXNlcjogcmFuZG9tQXJyYXlJdGVtKFVzZXJzKSxcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQuZnVsbF9sb2cgPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHMoXG4gICAgICAgICAgQXV0aGVudGljYXRpb24uYXV0aGVudGljYXRpb25TdWNjZXNzLmZ1bGxfbG9nLFxuICAgICAgICAgIGFsZXJ0XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjYXNlICdtYXhpbXVtQXV0aGVudGljYXRpb25BdHRlbXB0c0V4Y2VlZGVkJzoge1xuICAgICAgICBhbGVydC5sb2NhdGlvbiA9IEF1dGhlbnRpY2F0aW9uLm1heGltdW1BdXRoZW50aWNhdGlvbkF0dGVtcHRzRXhjZWVkZWQubG9jYXRpb247XG4gICAgICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLkF1dGhlbnRpY2F0aW9uLm1heGltdW1BdXRoZW50aWNhdGlvbkF0dGVtcHRzRXhjZWVkZWQucnVsZSB9O1xuICAgICAgICBhbGVydC5ydWxlLmdyb3VwcyA9IFsuLi5BdXRoZW50aWNhdGlvbi5tYXhpbXVtQXV0aGVudGljYXRpb25BdHRlbXB0c0V4Y2VlZGVkLnJ1bGUuZ3JvdXBzXTtcbiAgICAgICAgYWxlcnQuZGF0YSA9IHtcbiAgICAgICAgICBzcmNpcDogcmFuZG9tQXJyYXlJdGVtKElQcyksXG4gICAgICAgICAgc3JjcG9ydDogcmFuZG9tQXJyYXlJdGVtKFBvcnRzKSxcbiAgICAgICAgICBkc3R1c2VyOiByYW5kb21BcnJheUl0ZW0oVXNlcnMpLFxuICAgICAgICB9O1xuICAgICAgICBhbGVydC5mdWxsX2xvZyA9IGludGVycG9sYXRlQWxlcnRQcm9wcyhcbiAgICAgICAgICBBdXRoZW50aWNhdGlvbi5tYXhpbXVtQXV0aGVudGljYXRpb25BdHRlbXB0c0V4Y2VlZGVkLmZ1bGxfbG9nLFxuICAgICAgICAgIGFsZXJ0XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICB9XG4gICAgfVxuICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigyLCAxNSk7XG4gICAgYWxlcnQucnVsZS50c2MgPSBbcmFuZG9tQXJyYXlJdGVtKHRzYyldO1xuICB9XG5cbiAgaWYgKHBhcmFtcy5zc2gpIHtcbiAgICBhbGVydC5kYXRhID0ge1xuICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgc3JjdXNlcjogcmFuZG9tQXJyYXlJdGVtKFVzZXJzKSxcbiAgICAgIHNyY3BvcnQ6IHJhbmRvbUFycmF5SXRlbShQb3J0cyksXG4gICAgfTtcbiAgICBhbGVydC5HZW9Mb2NhdGlvbiA9IHJhbmRvbUFycmF5SXRlbShHZW9Mb2NhdGlvbik7XG4gICAgYWxlcnQuZGVjb2RlciA9IHtcbiAgICAgIG5hbWU6ICdzc2hkJyxcbiAgICAgIHBhcmVudDogJ3NzaGQnLFxuICAgIH07XG4gICAgYWxlcnQuaW5wdXQgPSB7XG4gICAgICB0eXBlOiAnbG9nJyxcbiAgICB9O1xuICAgIGFsZXJ0LnByZWRlY29kZXIgPSB7XG4gICAgICBwcm9ncmFtX25hbWU6ICdzc2hkJyxcbiAgICAgIHRpbWVzdGFtcDogZm9ybWF0RGF0ZShuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLCAnTiBEIGg6bTpzJyksXG4gICAgICBob3N0bmFtZTogYWxlcnQubWFuYWdlci5uYW1lLFxuICAgIH07XG4gICAgY29uc3QgdHlwZUFsZXJ0ID0gcmFuZG9tQXJyYXlJdGVtKFNTSC5kYXRhKTtcbiAgICBhbGVydC5sb2NhdGlvbiA9IHR5cGVBbGVydC5sb2NhdGlvbjtcbiAgICBhbGVydC5ydWxlID0geyAuLi50eXBlQWxlcnQucnVsZSB9O1xuICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzID0gWy4uLnR5cGVBbGVydC5ydWxlLmdyb3Vwc107XG4gICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDE1KTtcbiAgICBhbGVydC5mdWxsX2xvZyA9IGludGVycG9sYXRlQWxlcnRQcm9wcyh0eXBlQWxlcnQuZnVsbF9sb2csIGFsZXJ0KTtcbiAgfVxuXG4gIGlmIChwYXJhbXMud2luZG93cykge1xuICAgIGFsZXJ0LnJ1bGUuZ3JvdXBzLnB1c2goJ3dpbmRvd3MnKTtcbiAgICBpZiAocGFyYW1zLndpbmRvd3Muc2VydmljZV9jb250cm9sX21hbmFnZXIpIHtcbiAgICAgIGFsZXJ0LnByZWRlY29kZXIgPSB7XG4gICAgICAgIHByb2dyYW1fbmFtZTogJ1dpbkV2dExvZycsXG4gICAgICAgIHRpbWVzdGFtcDogJzIwMjAgQXByIDE3IDA1OjU5OjA1JyxcbiAgICAgIH07XG4gICAgICBhbGVydC5pbnB1dCA9IHtcbiAgICAgICAgdHlwZTogJ2xvZycsXG4gICAgICB9O1xuICAgICAgYWxlcnQuZGF0YSA9IHtcbiAgICAgICAgZXh0cmFfZGF0YTogJ1NlcnZpY2UgQ29udHJvbCBNYW5hZ2VyJyxcbiAgICAgICAgZHN0dXNlcjogJ1NZU1RFTScsXG4gICAgICAgIHN5c3RlbV9uYW1lOiByYW5kb21BcnJheUl0ZW0oV2luX0hvc3RuYW1lcyksXG4gICAgICAgIGlkOiAnNzA0MCcsXG4gICAgICAgIHR5cGU6ICd0eXBlJyxcbiAgICAgICAgc3RhdHVzOiAnSU5GT1JNQVRJT04nLFxuICAgICAgfTtcbiAgICAgIGFsZXJ0LnJ1bGUuZGVzY3JpcHRpb24gPSAnV2luZG93czogU2VydmljZSBzdGFydHVwIHR5cGUgd2FzIGNoYW5nZWQuJztcbiAgICAgIGFsZXJ0LnJ1bGUuZmlyZWR0aW1lcyA9IHJhbmRvbUludGVydmFsSW50ZWdlcigxLCAyMCk7XG4gICAgICBhbGVydC5ydWxlLm1haWwgPSBmYWxzZTtcbiAgICAgIGFsZXJ0LnJ1bGUubGV2ZWwgPSAzO1xuICAgICAgYWxlcnQucnVsZS5ncm91cHMucHVzaCgnd2luZG93cycsICdwb2xpY3lfY2hhbmdlZCcpO1xuICAgICAgYWxlcnQucnVsZS5wY2kgPSBbJzEwLjYnXTtcbiAgICAgIGFsZXJ0LnJ1bGUuaGlwYWEgPSBbJzE2NC4zMTIuYiddO1xuICAgICAgYWxlcnQucnVsZS5nZHByID0gWydJVl8zNS43LmQnXTtcbiAgICAgIGFsZXJ0LnJ1bGUubmlzdF84MDBfNTMgPSBbJ0FVLjYnXTtcbiAgICAgIGFsZXJ0LnJ1bGUuaW5mbyA9ICdUaGlzIGRvZXMgbm90IGFwcGVhciB0byBiZSBsb2dnZWQgb24gV2luZG93cyAyMDAwLic7XG4gICAgICBhbGVydC5sb2NhdGlvbiA9ICdXaW5FdnRMb2cnO1xuICAgICAgYWxlcnQuZGVjb2RlciA9IHtcbiAgICAgICAgcGFyZW50OiAnd2luZG93cycsXG4gICAgICAgIG5hbWU6ICd3aW5kb3dzJyxcbiAgICAgIH07XG4gICAgICBhbGVydC5mdWxsX2xvZyA9IGAyMDIwIEFwciAxNyAwNTo1OTowNSBXaW5FdnRMb2c6IHR5cGU6IElORk9STUFUSU9OKDcwNDApOiBTZXJ2aWNlIENvbnRyb2wgTWFuYWdlcjogU1lTVEVNOiBOVCBBVVRIT1JJVFk6ICR7YWxlcnQuZGF0YS5zeXN0ZW1fbmFtZX06IEJhY2tncm91bmQgSW50ZWxsaWdlbnQgVHJhbnNmZXIgU2VydmljZSBhdXRvIHN0YXJ0IGRlbWFuZCBzdGFydCBCSVRTIGA7IC8vVE9ETzogZGF0ZVxuICAgICAgYWxlcnQuaWQgPSAxODE0NTtcbiAgICAgIGFsZXJ0LmZpZWxkcyA9IHtcbiAgICAgICAgdGltZXN0YW1wOiBhbGVydC50aW1lc3RhbXAsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJhbXMuYXBhY2hlKSB7XG4gICAgY29uc3QgdHlwZUFsZXJ0ID0geyAuLi5BcGFjaGUuZGF0YVswXSB9OyAvLyB0aGVyZSBpcyBvbmx5IG9uZSB0eXBlIGFsZXJ0IGluIGRhdGEgYXJyYXkgYXQgdGhlIG1vbWVudC4gUmFuZG9taXplIGlmIGFkZCBtb3JlIHR5cGUgb2YgYWxlcnRzIHRvIGRhdGEgYXJyYXlcbiAgICBhbGVydC5kYXRhID0ge1xuICAgICAgc3JjaXA6IHJhbmRvbUFycmF5SXRlbShJUHMpLFxuICAgICAgc3JjcG9ydDogcmFuZG9tQXJyYXlJdGVtKFBvcnRzKSxcbiAgICAgIGlkOiBgQUgke3JhbmRvbUludGVydmFsSW50ZWdlcigxMDAwMCwgOTk5OTkpfWAsXG4gICAgfTtcbiAgICBhbGVydC5HZW9Mb2NhdGlvbiA9IHsgLi4ucmFuZG9tQXJyYXlJdGVtKEdlb0xvY2F0aW9uKSB9O1xuICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDIsIDEwKTtcbiAgICBhbGVydC5pbnB1dCA9IHsgdHlwZTogJ2xvZycgfTtcbiAgICBhbGVydC5sb2NhdGlvbiA9IEFwYWNoZS5sb2NhdGlvbjtcbiAgICBhbGVydC5kZWNvZGVyID0geyAuLi5BcGFjaGUuZGVjb2RlciB9O1xuXG4gICAgYWxlcnQuZnVsbF9sb2cgPSBpbnRlcnBvbGF0ZUFsZXJ0UHJvcHModHlwZUFsZXJ0LmZ1bGxfbG9nLCBhbGVydCwge1xuICAgICAgX3RpbWVzdGFtcF9hcGFjaGU6IGZvcm1hdERhdGUobmV3IERhdGUoYWxlcnQudGltZXN0YW1wKSwgJ0UgTiBEIGg6bTpzLmwgWScpLFxuICAgICAgX3BpX2lkOiByYW5kb21JbnRlcnZhbEludGVnZXIoMTAwMDAsIDMwMDAwKSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChwYXJhbXMud2ViKSB7XG4gICAgYWxlcnQuaW5wdXQgPSB7XG4gICAgICB0eXBlOiAnbG9nJyxcbiAgICB9O1xuICAgIGFsZXJ0LmRhdGEgPSB7XG4gICAgICBwcm90b2NvbDogJ0dFVCcsXG4gICAgICBzcmNpcDogcmFuZG9tQXJyYXlJdGVtKElQcyksXG4gICAgICBpZDogJzQwNCcsXG4gICAgICB1cmw6IHJhbmRvbUFycmF5SXRlbShXZWIudXJscyksXG4gICAgfTtcbiAgICBhbGVydC5HZW9Mb2NhdGlvbiA9IHsgLi4ucmFuZG9tQXJyYXlJdGVtKEdlb0xvY2F0aW9uKSB9O1xuXG4gICAgY29uc3QgdHlwZUFsZXJ0ID0gcmFuZG9tQXJyYXlJdGVtKFdlYi5kYXRhKTtcbiAgICBjb25zdCB1c2VyQWdlbnQgPSByYW5kb21BcnJheUl0ZW0oV2ViLnVzZXJBZ2VudHMpO1xuICAgIGFsZXJ0LnJ1bGUgPSB7IC4uLnR5cGVBbGVydC5ydWxlIH07XG4gICAgYWxlcnQucnVsZS5maXJlZHRpbWVzID0gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDEsIDEwKTtcbiAgICBhbGVydC5kZWNvZGVyID0geyAuLi50eXBlQWxlcnQuZGVjb2RlciB9O1xuICAgIGFsZXJ0LmxvY2F0aW9uID0gdHlwZUFsZXJ0LmxvY2F0aW9uO1xuICAgIGFsZXJ0LmZ1bGxfbG9nID0gaW50ZXJwb2xhdGVBbGVydFByb3BzKHR5cGVBbGVydC5mdWxsX2xvZywgYWxlcnQsIHtcbiAgICAgIF91c2VyX2FnZW50OiB1c2VyQWdlbnQsXG4gICAgICBfZGF0ZTogZm9ybWF0RGF0ZShuZXcgRGF0ZShhbGVydC50aW1lc3RhbXApLCAnRC9OL1k6aDptOnMgKzAwMDAnKSxcbiAgICB9KTtcbiAgICBpZiAodHlwZUFsZXJ0LnByZXZpb3VzX291dHB1dCkge1xuICAgICAgY29uc3QgcHJldmlvdXNPdXRwdXQgPSBbXTtcbiAgICAgIGNvbnN0IGJlZm9yZVNlY29uZHMgPSA0O1xuICAgICAgZm9yIChsZXQgaSA9IGJlZm9yZVNlY29uZHM7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgYmVmb3JlRGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKGFsZXJ0LnRpbWVzdGFtcCkgLSAoMiArIGkpICogMTAwMCk7XG4gICAgICAgIHByZXZpb3VzT3V0cHV0LnB1c2goXG4gICAgICAgICAgaW50ZXJwb2xhdGVBbGVydFByb3BzKHR5cGVBbGVydC5mdWxsX2xvZywgYWxlcnQsIHtcbiAgICAgICAgICAgIF91c2VyX2FnZW50OiB1c2VyQWdlbnQsXG4gICAgICAgICAgICBfZGF0ZTogZm9ybWF0RGF0ZShuZXcgRGF0ZShiZWZvcmVEYXRlKSwgJ0QvTi9ZOmg6bTpzICswMDAwJyksXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGFsZXJ0LnByZXZpb3VzX291dHB1dCA9IHByZXZpb3VzT3V0cHV0LmpvaW4oJ1xcbicpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYWxlcnQ7XG59XG5cbi8qKlxuICogR2V0IGEgcmFuZG9tIGFycmF5IHdpdGggdW5pcXVlIHZhbHVlc1xuICogQHBhcmFtIHtbXX0gYXJyYXkgQXJyYXkgdG8gZXh0cmFjdCB0aGUgdmFsdWVzXG4gKiBAcGFyYW0geyp9IHJhbmRvbU1heFJlcGV0aXRpb25zIE51bWJlciBtYXggb2YgcmFuZG9tIGV4dHJhY3Rpb25zXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzb3J0IEZ1bmNpdG9uIHRvIHNlb3J0IGVsZW1lbnRzXG4gKiBAcmV0dXJuIHsqfSBBcnJheSB3aXRoIHJhbmRvbSB2YWx1ZXMgZXh0cmFjdGVkIG9mIHBhcmFtYXRlciBhcnJheSBwYXNzZWRcbiAqL1xuZnVuY3Rpb24gcmFuZG9tVW5pcXVlVmFsdWVzRnJvbUFycmF5KGFycmF5LCByYW5kb21NYXhSZXBldGl0aW9ucyA9IDEsIHNvcnQpIHtcbiAgY29uc3QgcmVwZXRpdGlvbnMgPSByYW5kb21JbnRlcnZhbEludGVnZXIoMSwgcmFuZG9tTWF4UmVwZXRpdGlvbnMpO1xuICBjb25zdCBzZXQgPSBuZXcgU2V0KCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVwZXRpdGlvbnM7IGkrKykge1xuICAgIHNldC5hZGQoYXJyYXlbcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKDAsIGFycmF5Lmxlbmd0aCAtIDEpXSk7XG4gIH1cbiAgcmV0dXJuIHNvcnQgPyBBcnJheS5mcm9tKHNldCkuc29ydChzb3J0KSA6IEFycmF5LmZyb20oc2V0KTtcbn1cblxuLyoqXG4gKiBHZXQgYSBpbnRlZ2VyIHdpdGhpbiBhIHJhbmdlXG4gKiBAcGFyYW0ge251bWJlcn0gbWluIC0gTWluaW11bSBsaW1pdFxuICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIE1heGltdW0gbGltaXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gUmFuZG9taXplZCBudW1iZXIgaW4gaW50ZXJ2YWxcbiAqL1xuZnVuY3Rpb24gcmFuZG9tSW50ZXJ2YWxJbnRlZ2VyKG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gKG1pbiAtIDEpKSkgKyBtaW47XG59XG5cbi8qKlxuICogR2VuZXJhdGUgcmFuZG9tIGFsZXJ0c1xuICogQHBhcmFtIHsqfSBwYXJhbXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1BbGVydHMgLSBEZWZpbmUgbnVtYmVyIG9mIGFsZXJ0c1xuICogQHJldHVybiB7Kn0gLSBSYW5kb20gZ2VuZXJhdGVkIGFsZXJ0cyBkZWZpbmVkIHdpdGggcGFyYW1zXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQWxlcnRzKHBhcmFtcywgbnVtQWxlcnRzID0gMSkge1xuICBjb25zdCBhbGVydHMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1BbGVydHM7IGkrKykge1xuICAgIGFsZXJ0cy5wdXNoKGdlbmVyYXRlQWxlcnQocGFyYW1zKSk7XG4gIH1cbiAgcmV0dXJuIGFsZXJ0cztcbn1cblxuLyoqXG4gKiBHZXQgYSByYW5kb20gRGF0ZSBpbiByYW5nZSg3IGRheXMgYWdvIC0gbm93KVxuICogQHJldHVybnMge2RhdGV9IC0gUmFuZG9tIGRhdGUgaW4gcmFuZ2UgKDcgZGF5cyBhZ28gLSBub3cpXG4gKi9cbmZ1bmN0aW9uIHJhbmRvbURhdGUoaW5mLCBzdXApIHtcbiAgY29uc3Qgbm93VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgdGltZSA9IHJhbmRvbUludGVydmFsSW50ZWdlcigwLCA2MDQ4MDAwMDApOyAvLyBSYW5kb20gNyBkYXlzIGluIG1pbGlzZWNvbmRzXG5cbiAgY29uc3QgdW5peF90aW1lc3RhbXAgPSBub3dUaW1lc3RhbXAgLSB0aW1lOyAvLyBMYXN0IDcgZGF5cyBmcm9tIG5vd1xuXG4gIGNvbnN0IGxhc3RXZWVrID0gbmV3IERhdGUodW5peF90aW1lc3RhbXApO1xuICByZXR1cm4gZm9ybWF0RGF0ZShsYXN0V2VlaywgJ1ktTS1EVGg6bTpzLmwrMDAwMCcpO1xufVxuXG5jb25zdCBmb3JtYXR0ZXJOdW1iZXIgPSAobnVtYmVyLCB6ZXJvcyA9IDApID0+ICgnMCcucmVwZWF0KHplcm9zKSArIGAke251bWJlcn1gKS5zbGljZSgtemVyb3MpO1xuY29uc3QgbW9udGhOYW1lcyA9IHtcbiAgbG9uZzogW1xuICAgICdKYW51YXJ5JyxcbiAgICAnRmVicnVhcnknLFxuICAgICdNYXJjaCcsXG4gICAgJ0FwcmlsJyxcbiAgICAnTWF5JyxcbiAgICAnSnVuZScsXG4gICAgJ0p1bHknLFxuICAgICdBdWd1c3QnLFxuICAgICdTZXB0ZW1iZXInLFxuICAgICdPY3RvYmVyJyxcbiAgICAnTm92ZW1iZXInLFxuICAgICdEZWNlbWJlcicsXG4gIF0sXG4gIHNob3J0OiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG59O1xuXG5jb25zdCBkYXlOYW1lcyA9IHtcbiAgbG9uZzogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICBzaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXSxcbn07XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZSwgZm9ybWF0KSB7XG4gIC8vIEl0IGNvdWxkIHVzZSBcIm1vbWVudFwiIGxpYnJhcnkgdG8gZm9ybWF0IHN0cmluZ3MgdG9vXG4gIGNvbnN0IHRva2VucyA9IHtcbiAgICBEOiBkID0+IGZvcm1hdHRlck51bWJlcihkLmdldERhdGUoKSwgMiksIC8vIDAxLTMxXG4gICAgQTogZCA9PiBkYXlOYW1lcy5sb25nW2QuZ2V0RGF5KCldLCAvLyAnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXG4gICAgRTogZCA9PiBkYXlOYW1lcy5zaG9ydFtkLmdldERheSgpXSwgLy8gJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCdcbiAgICBNOiBkID0+IGZvcm1hdHRlck51bWJlcihkLmdldE1vbnRoKCkgKyAxLCAyKSwgLy8gMDEtMTJcbiAgICBKOiBkID0+IG1vbnRoTmFtZXMubG9uZ1tkLmdldE1vbnRoKCldLCAvLyAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcbiAgICBOOiBkID0+IG1vbnRoTmFtZXMuc2hvcnRbZC5nZXRNb250aCgpXSwgLy8gJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ1xuICAgIFk6IGQgPT4gZC5nZXRGdWxsWWVhcigpLCAvLyAyMDIwXG4gICAgaDogZCA9PiBmb3JtYXR0ZXJOdW1iZXIoZC5nZXRIb3VycygpLCAyKSwgLy8gMDAtMjNcbiAgICBtOiBkID0+IGZvcm1hdHRlck51bWJlcihkLmdldE1pbnV0ZXMoKSwgMiksIC8vIDAwLTU5XG4gICAgczogZCA9PiBmb3JtYXR0ZXJOdW1iZXIoZC5nZXRTZWNvbmRzKCksIDIpLCAvLyAwMC01OVxuICAgIGw6IGQgPT4gZm9ybWF0dGVyTnVtYmVyKGQuZ2V0TWlsbGlzZWNvbmRzKCksIDMpLCAvLyAwMDAtOTk5XG4gIH07XG5cbiAgcmV0dXJuIGZvcm1hdC5zcGxpdCgnJykucmVkdWNlKChhY2N1bSwgdG9rZW4pID0+IHtcbiAgICBpZiAodG9rZW5zW3Rva2VuXSkge1xuICAgICAgcmV0dXJuIGFjY3VtICsgdG9rZW5zW3Rva2VuXShkYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY3VtICsgdG9rZW47XG4gIH0sICcnKTtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBTdHJpbmcgd2l0aCBpbnRlcnBvbGF0aW9uc1xuICogQHBhcmFtIHsqfSBhbGVydCBBbGVydCBvYmplY3RcbiAqIEBwYXJhbSB7Kn0gZXh0cmEgRXh0cmEgcGFyYW1ldGVycyB0byBpbnRlcnBvbGF0ZSB3aGF0IGFyZW4ndCBpbiBhbGVydCBvYmpldC4gT25seSBhZG1pdCBvbmUgbGV2ZWwgb2YgZGVwdGhcbiAqL1xuZnVuY3Rpb24gaW50ZXJwb2xhdGVBbGVydFByb3BzKHN0ciwgYWxlcnQsIGV4dHJhID0ge30pIHtcbiAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaCgveyhbXFx3XFwuX10rKX0vZyk7XG4gIHJldHVybiAoXG4gICAgKG1hdGNoZXMgJiZcbiAgICAgIG1hdGNoZXMucmVkdWNlKChhY2N1bSwgY3VyKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gY3VyLm1hdGNoKC97KFtcXHdcXC5fXSspfS8pO1xuICAgICAgICBjb25zdCBpdGVtcyA9IG1hdGNoWzFdLnNwbGl0KCcuJyk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaXRlbXMucmVkdWNlKChhLCBjKSA9PiAoYSAmJiBhW2NdKSB8fCBleHRyYVtjXSB8fCB1bmRlZmluZWQsIGFsZXJ0KSB8fCBjdXI7XG4gICAgICAgIHJldHVybiBhY2N1bS5yZXBsYWNlKGN1ciwgdmFsdWUpO1xuICAgICAgfSwgc3RyKSkgfHxcbiAgICBzdHJcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20gcHJvYmFiaWxpdHlcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9iYWJpbGl0eVxuICogQHBhcmFtIHtudW1iZXJbPTEwMF19IG1heGltdW1cbiAqL1xuZnVuY3Rpb24gcmFuZG9tUHJvYmFiaWxpdHkocHJvYmFiaWxpdHksIG1heGltdW0gPSAxMDApIHtcbiAgcmV0dXJuIHJhbmRvbUludGVydmFsSW50ZWdlcigwLCBtYXhpbXVtKSA8PSBwcm9iYWJpbGl0eTtcbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVBbGVydCwgZ2VuZXJhdGVBbGVydHMgfTtcbiJdfQ==