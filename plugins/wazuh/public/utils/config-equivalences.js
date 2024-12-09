export const configEquivalences = {
  pattern: '在应用程序上使用的默认模式。',
  'checks.pattern':
    '打开应用程序时启用或禁用模式运行状况检查。',
  'checks.template':
    '打开应用程序时启用或禁用模板运行状况检查。',
  'checks.api': '打开应用程序时启用或禁用API运行状况检查。',
  'checks.setup':
    '打开应用程序时启用或禁用设置运行状况检查。',
  'checks.fields':
    '打开应用程序时启用或禁用已知字段运行状况检查。',
    'checks.metaFields':
      '更改Kibana metaField配置的默认值',
    'checks.timeFilter':
      '更改Kibana timeFilter配置的默认值',
    'checks.maxBuckets':
      '改变Kibana最大桶配置的默认值',
  'extensions.pci': '在“概述和代理”上启用或禁用“PCI DSS”选项卡。',
  'extensions.gdpr': '在“概述和代理”上启用或禁用“GDPR”选项卡。',
  'extensions.audit': '在“概述和代理”上启用或禁用“审核”选项卡。',
  'extensions.oscap':
    '在“概述和代理”上启用或禁用“打开SCAP”选项卡。',
  'extensions.ciscat':
    '在“概述和代理”上启用或禁用“ CIS-CAT”选项卡。',
  'extensions.aws': '在概述上启用或禁用Amazon（AWS）选项卡。',
  'extensions.gcp': '在概述上启用或禁用Google Cloud Platform标签。',
  'extensions.virustotal':
    '在“概述和代理”上启用或禁用“ VirusTotal”选项卡。',
  'extensions.osquery':
    '在概述和代理上启用或禁用Osquery选项卡。',
  'extensions.mitre': '在“概述和代理”上启用或禁用“ MITRE”选项卡。',
  'extensions.docker':
    '在概述和代理上启用或禁用Docker侦听器选项卡。',
  timeout:
    '定义应用向API发出请求时等待API响应的最长时间。',
  'api.selector':
    '定义是否允许用户直接从顶部菜单栏中更改所选的API。',
  'ip.selector':
    '定义是否允许用户直接从顶部菜单栏中更改所选的模式。',
  'ip.ignore':
    '禁用某些模式名称在应用程序的模式选择器中可用。',
  'wazuh.monitoring.enabled':
    '启用或禁用监视的创建和/或可视化。',
  'wazuh.monitoring.frequency':
    '在几秒钟内定义应用程序在监视上生成新文档的频率。',
  'wazuh.monitoring.shards':
    '定义用于监视的分片数。',
  'wazuh.monitoring.replicas':
    '定义要用于监视的副本数。',
  'wazuh.monitoring.creation':
    '定义将创建监视的时间间隔。',
  'wazuh.monitoring.pattern':
    '在应用程序上用于监视的默认模式。',
  hideManagerAlerts:
    '在所有仪表板中隐藏管理器的警报。',
  'logs.level':
    '设置应用程序日志记录级别，允许的值为info和debug。 默认值为info。',
  'enrollment.dns':
    '在代理程序部署中设置服务器地址。',
  'cron.prefix':
    '定义预定义作业的前缀。',
  'cron.statistics.status':
    '启用或禁用统计任务。',
  'cron.statistics.apis':
    '输入要从中保存数据的API的ID，将其保留为空以在所有已配置的API上运行任务。',
  'cron.statistics.interval': '使用cron计划表达式定义任务执行的频率。',
  'cron.statistics.index.name': '定义要在其中保存文档的名称。',
  'cron.statistics.index.creation': '定义创建的间隔。',
  'cron.statistics.index.shards': '定义要用于统计的分片数。',
  'cron.statistics.index.replicas': '定义用于统计的副本数。',
  'alerts.sample.prefix': '定义样本警报的名称前缀。 它必须与模式使用的模板匹配，以避免仪表板中的未知字段。',
};

export const nameEquivalence = {
  pattern: '模式',
  'checks.pattern': '模式',
  'checks.template': '模板',
  'checks.api': 'API连接',
  'checks.setup': 'API版本',
  'checks.fields': '已知字段',
  'checks.metaFields': '删除元字段',
  'checks.timeFilter': '将时间过滤器设置为24h',
  'checks.maxBuckets': '设置最大的桶为200000',
  timeout: 'Request timeout',
  'api.selector': 'API选择',
  'ip.selector': 'IP选择',
  'ip.ignore': 'IP忽略',
  'xpack.rbac.enabled': 'X-Pack RBAC',
  'wazuh.monitoring.enabled': '状态',
  'wazuh.monitoring.frequency': '频率',
  'wazuh.monitoring.shards': '分片',
  'wazuh.monitoring.replicas': '副本',
  'wazuh.monitoring.creation': '创建间隔',
  'wazuh.monitoring.pattern': '模式',
  hideManagerAlerts: '隐藏管理器警报',
  'logs.level': '日志等级',
  'enrollment.dns': '注册DNS',
  'cron.prefix': 'Cron前缀',
  'cron.statistics.status': '状态',
  'cron.statistics.apis': '包含API',
  'cron.statistics.interval': '间隔',
  'cron.statistics.index.name': '名称',
  'cron.statistics.index.creation': '创建',
  'cron.statistics.index.shards': '分片',
  'cron.statistics.index.replicas': '副本',
  'alerts.sample.prefix': '样本警报前缀',
}

const HEALTH_CHECK = '监控检查';
const GENERAL = '常规';
const SECURITY = '安全';
const MONITORING = '监控'
const STATISTICS = '统计'
export const categoriesNames = [HEALTH_CHECK, GENERAL, SECURITY, MONITORING, STATISTICS,];

export const categoriesEquivalence = {
  pattern: GENERAL,
  'checks.pattern': HEALTH_CHECK,
  'checks.template': HEALTH_CHECK,
  'checks.api': HEALTH_CHECK,
  'checks.setup': HEALTH_CHECK,
  'checks.fields': HEALTH_CHECK,
  'checks.metaFields': HEALTH_CHECK,
  'checks.timeFilter': HEALTH_CHECK,
  'checks.maxBuckets': HEALTH_CHECK,
  timeout: GENERAL,
  'api.selector': GENERAL,
  'ip.selector': GENERAL,
  'ip.ignore': GENERAL,
  'wazuh.monitoring.enabled': MONITORING,
  'wazuh.monitoring.frequency': MONITORING,
  'wazuh.monitoring.shards': MONITORING,
  'wazuh.monitoring.replicas': MONITORING,
  'wazuh.monitoring.creation': MONITORING,
  'wazuh.monitoring.pattern': MONITORING,
  hideManagerAlerts: GENERAL,
  'logs.level': GENERAL,
  'enrollment.dns': GENERAL,
  'cron.prefix': GENERAL,
  'cron.statistics.status': STATISTICS,
  'cron.statistics.apis': STATISTICS,
  'cron.statistics.interval': STATISTICS,
  'cron.statistics.index.name': STATISTICS,
  'cron.statistics.index.creation': STATISTICS,
  'cron.statistics.index.shards': STATISTICS,
  'cron.statistics.index.replicas': STATISTICS,
  'alerts.sample.prefix': GENERAL,
}

const TEXT = 'text';
const NUMBER = 'number';
const LIST = 'list';
const BOOLEAN = 'boolean';
const ARRAY = 'array';
const INTERVAL = 'interval'

export const formEquivalence = {
  pattern: { type: TEXT },
  'checks.pattern': { type: BOOLEAN },
  'checks.template': { type: BOOLEAN },
  'checks.api': { type: BOOLEAN },
  'checks.setup': { type: BOOLEAN },
  'checks.fields': { type: BOOLEAN },
  'checks.metaFields': { type: BOOLEAN },
  'checks.timeFilter': { type: BOOLEAN },
  'checks.maxBuckets': { type: BOOLEAN },
  timeout: { type: NUMBER },
  'api.selector': { type: BOOLEAN },
  'ip.selector': { type: BOOLEAN },
  'ip.ignore': { type: ARRAY },
  'xpack.rbac.enabled': { type: BOOLEAN },
  'wazuh.monitoring.enabled': { type: BOOLEAN },
  'wazuh.monitoring.frequency': { type: NUMBER },
  'wazuh.monitoring.shards': { type: NUMBER },
  'wazuh.monitoring.replicas': { type: NUMBER },
  'wazuh.monitoring.creation': {
    type: LIST, params: {
      options: [
        { text: 'Hourly', value: 'h' },
        { text: 'Daily', value: 'd' },
        { text: 'Weekly', value: 'w' },
        { text: 'Monthly', value: 'm' },
      ]
    }
  },
  'wazuh.monitoring.pattern': { type: TEXT },
  hideManagerAlerts: { type: BOOLEAN },
  'logs.level': {
    type: LIST, params: {
      options: [
        { text: 'Info', value: 'info' },
        { text: 'Debug', value: 'debug' },
      ]
    }
  },
  'enrollment.dns': { type: TEXT },
  'cron.prefix': { type: TEXT },
  'cron.statistics.status': { type: BOOLEAN },
  'cron.statistics.apis': { type: ARRAY },
  'cron.statistics.interval': { type: INTERVAL },
  'cron.statistics.index.name': { type: TEXT },
  'cron.statistics.index.creation': {
    type: LIST, params: {
      options: [
        { text: 'Hourly', value: 'h' },
        { text: 'Daily', value: 'd' },
        { text: 'Weekly', value: 'w' },
        { text: 'Monthly', value: 'm' },
      ]
    }
  },
  'cron.statistics.index.shards': { type: NUMBER },
  'cron.statistics.index.replicas': { type: NUMBER },
  'alerts.sample.prefix': { type: TEXT },
}
