/*
* Wazuh app - VirusTotal interactive extension guide
* Copyright (C) 2015-2021 Wazuh, Inc.
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* Find more information about this on the LICENSE file.
*/
export default {
  id: 'virustotal',
  xml_tag: 'integration',
  name: 'VirusTotal',
  description: 'VirusTotal集成的配置选项。',
  category: '威胁检测与响应',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/integration.html',
  icon: 'securityApp',
  avaliable_for_manager: true,
  steps: [
    {
      title: '必填设置',
      description: '',
      elements: [
        {
          name: 'name',
          description: '集成的服务。',
          type: 'input',
          required: true,
          default_value: 'virustotal',
          field_read_only: true
        },
        {
          name: 'api_key',
          description: '从VirusTotal API中检索到的密钥。',
          type: 'input',
          required: true,
          placeholder: 'VirusTotal Api密钥'
        }
      ]
    },
    {
      title: '可选设置',
      description: '',
      elements: [
        {
          name: 'level',
          description: '按规则级别过滤警报，以便仅推送指定级别或更高级别的警报。',
          type: 'input-number',
          values: { min: 0, max: 16 },
          default_value: 0,
          placeholder: '警报级别，0到16',
          validate_error_message: '警报级别，0到16'
        },
        {
          name: 'rule_id',
          description: '这将按规则ID过滤警报。',
          type: 'input',
          default_value: '',
          placeholder: '逗号分隔的规则ID',
          validate_error_message: '逗号分隔的规则ID'
        },
        {
          name: 'group',
          description: '这将按规则组过滤警报。对于VirusTotal集成，仅syscheck组中的规则可用。',
          type: 'input',
          placeholder: '规则组或逗号分隔的规则组。'
        },
        {
          name: 'event_location',
          description: '根据事件的来源过滤警报。遵循OS_Regex语法。',
          type: 'input',
          placeholder: '单个日志文件。'
        },
        {
          name: 'alert_format',
          description: '以JSON格式写入警报文件。积分器使用此文件来获取字段值。',
          type: 'input',
          placeholder: 'json',
          default_value: 'json',
          field_read_only: true,
          validate_error_message: 'json'
        },
        {
          name: 'max_log',
          description: '将发送给Integrator的警报代码段的最大长度。较长的字符串将被截断...',
          type: 'input-number',
          values: { min: 165, max: 1024 },
          default_value: 165,
          placeholder: '165到1024之间的任何整数。',
          validate_error_message: '165到1024之间的任何整数。'
        }
      ]
    }
  ]
}
