/*
* Wazuh app - OpenSCAP interactive extension guide
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
  id: 'oscap',
  name: 'OpenSCAP',
  wodle_name: 'open-scap',
  description: 'OpenSCAP的配置选项。',
  category: '审计与策略监控',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-openscap.html',
  icon: 'securityApp',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'disabled',
          description: `禁用OpenSCAP选项。`,
          type: 'switch',
          required: true
        },
        {
          name: 'timeout',
          description: '每次评估的超时时间（以秒为单位）',
          type: 'input-number',
          required: true,
          placeholder: '时间（以秒为单位）',
          values: { min: 1 },
          default_value: 1800,
          validate_error_message: '正数（秒）'
        },
        {
          name: 'interval',
          description: 'OpenSCAP执行之间的间隔。',
          type: 'input',
          required: true,
          placeholder: '时间格式为<数字><时间单位后缀>，例如：1d',
          default_value: '1d',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符，例如s（秒），m（分钟），h（小时），d（天）。',
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        },
        {
          name: 'scan-on-start',
          description: '服务启动后立即运行评估。',
          type: 'switch',
          required: true,
          default_value: true
        }
      ]
    },
    {
      title: '内容',
      description: '定义评估。',
      elements: [
        {
          name: 'content',
          description: `定义评估。`,
          removable: true,
          required: true,
          repeatable: true,
          repeatable_insert_first: true,
          repeatable_insert_first_properties: {
            removable: false
          },
          validate_error_message: '任何目录或文件名。',
          show_attributes: true,
          attributes: [
            {
              name: 'type',
              description: '选择内容类型：xccdf或oval。',
              type: 'select',
              required: true,
              values: [
                {value: 'xccdf ', text: 'xccdf '},
                {value: 'oval', text: 'oval'}
              ],
              default_value: 'xccdf'
            },
            {
              name: 'path',
              description: `使用指定的策略文件（DataStream，XCCDF或OVAL）。
              默认路径：/var/ossec/wodles/oscap/content`,
              type: 'input',
              required: true,
              placeholder: 'Policy file',
              default_value: '/var/ossec/wodles/oscap/content',
              validate_error_message: '使用指定的策略文件'
            },
            {
              name: 'timeout',
              description: `评估超时（以秒为单位）。
              使用此属性将覆盖通用超时。`,
              type: 'input-number',
              placeholder: '时间（以秒为单位）',
              values: { min: 1 },
              default_value: 1800,
              validate_error_message: '正数'
            },
            {
              name: 'xccdf-id',
              description: 'XCCDF id.',
              type: 'input',
              placeholder: 'XCCDF id'
            },
            {
              name: 'oval-id',
              description: 'OVAL id.',
              type: 'input',
              placeholder: 'OVAL id'
            },
            {
              name: 'datastream-id',
              description: '数据流id。',
              type: 'input',
              placeholder: '数据流id'
            },
            {
              name: 'cpe',
              description: `CPE词典文件。
              默认路径：/var/ossec/wodles/oscap/content`,
              type: 'input',
              placeholder: '/var/ossec/wodles/oscap/content',
              default_value: '/var/ossec/wodles/oscap/content',
              validate_error_message: 'CPE词典文件。'
            }
          ],
          show_options: true,
          options: [
            {
              name: 'profile',
              description: '选择配置。',
              type: 'input',
              placeholder: '配置',
              repeatable: true,
              removable: true,
              required: true,
              repeatable_insert_first: true,
              repeatable_insert_first_properties: {
                removable: false
              }
            }
          ]
        }
      ]
    }
  ]
}