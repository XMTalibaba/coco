"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AlertKeyEquivalence = void 0;

const AlertKeyEquivalence = {
  timestamp: '时间',
  'agent.id': '代理',
  'agent.name': '代理名称',
  'rule.description': '描述',
  'rule.level': '等级',
  'data.vulnerability.cnnvd': 'CNNVD',
  'data.vulnerability.solution': '解决方案',
  "rule.mitre.id": "技术",
  "rule.mitre.tactic": "策略",
  'data.audit.command': '命令',
  'data.uid': '用户ID',
  'data.gid': '用户组ID',
  'data.srcip': '源IP',
  'data.srcuser': '用户',
  "syscheck.path": "文件路径",
  "syscheck.event": "文件行为8",
  "agent.ip": "代理IP",
  "data.connection.id": "网络名称",
  "data.connection.uuid": "网络UUID",
  "data.connection.type": "网络类型",
  "data.connection.mac": "MAC地址",
  'rule.id.text': '状态',
  'software.name': '软件名称',
  'account.user': '用户/组'
}
exports.AlertKeyEquivalence = AlertKeyEquivalence;