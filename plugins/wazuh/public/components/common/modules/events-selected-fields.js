/*
 * Wazuh app - Simple description for each App tabs
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
export const EventsSelectedFiles = {
  fim: [
    'agent.name',
    'syscheck.path',
    'syscheck.event',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  mitre: [
    'agent.name',
    'rule.mitre.id',
    'rule.mitre.tactic',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  sca: [
    'data.sca.check.title',
    'data.sca.check.file',
    'data.sca.check.result',
    'data.sca.policy',
  ],
  systemCommands: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  webAttack: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  bruteForce: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  logToClear: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  reboundShell: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  localAskRight: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  dataTheft: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  blackmailVirus: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  riskPort: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  accountChange: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  accountUnusual: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  accountLogin: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  zombies: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  hiddenProcess: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  riskService: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  virusFound: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  systemCommandVerify: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  general: [
    'agent.name',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  aws: [
    'data.aws.source',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  gcp: [
    'agent.name',
    'data.gcp.jsonPayload.vmInstanceName',
    'data.gcp.resource.labels.location',
    'data.gcp.resource.labels.project_id',
    'data.gcp.resource.type',
    'data.gcp.severity',
  ],
  pm: [
    'agent.name',
    'data.title',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  audit: [
    'agent.name',
    'data.audit.command',
    'data.audit.pid',
    'rule.description',
    'rule.level',
    // 'rule.id',
  ],
  oscap: [
    'agent.name',
    'data.oscap.check.title',
    'data.oscap.check.description',
    'data.oscap.check.result',
    'data.oscap.check.severity',
  ],
  ciscat: [
    'agent.name',
    'data.cis.benchmark',
    'data.cis.group',
    'data.cis.pass',
    'data.cis.fail',
    'data.cis.unknown',
    'data.cis.result',
  ],
  vuls: [
    'agent.name',
    'data.vulnerability.package.name',
    'data.vulnerability.cve',
    'data.vulnerability.severity'
  ],
  virustotal: [
    'agent.name',
    'data.virustotal.source.file',
    'data.virustotal.permalink',
    'data.virustotal.malicious',
    'data.virustotal.positives',
    'data.virustotal.total',
  ],
  osquery: [
    'agent.name',
    'data.osquery.name',
    'data.osquery.pack',
    'data.osquery.action',
    'data.osquery.subquery',
  ],
  docker: [
    'agent.name',
    'data.docker.from',
    'data.docker.Type',
    'data.docker.Action',
    'rule.description',
    'rule.level',
  ],
  pci: [
    'agent.name',
    'rule.pci_dss',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  gdpr: [
    'agent.name',
    'rule.gdpr',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  hipaa: [
    'agent.name',
    'rule.hipaa',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  nist: [
    'agent.name',
    'rule.nist_800_53',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  tsc: [
    'agent.name',
    'rule.tsc',
    'rule.description',
    'rule.level',
    // 'rule.id'
  ],
  
};
