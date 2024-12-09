/*
* Wazuh app - Vulnerabilites extension guide
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
  id: 'vuls',
  xml_tag: 'vulnerabilities-detector',
  name: 'Vulnerabilities',
  description: '漏洞的配置选项。',
  category: '威胁检测与响应',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/vuln-detector.html',
  icon: 'securityApp',
  avaliable_for_manager: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'enabled',
          description: '启用模块。',
          type: 'switch',
          required: true
        },
        {
          name: 'interval',
          description: '漏洞扫描的间隔时间。',
          type: 'input',
          required: true,
          default_value: '5m',
          placeholder: '时间格式为<数字><时间单位后缀>',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符：s（秒），m（分钟），h（小时）或d（天）。',
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        },
        {
          name: 'run_on_start',
          description: '服务启动后立即运行更新和漏洞扫描。',
          type: 'switch',
          required: true,
          default_value: true
        },
        {
          name: 'ignore_time',
          description: ' 已经发出警报将被忽略的时间。',
          type: 'input',
          default_value: '6h',
          placeholder: '时间格式为<数字><时间单位后缀>',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符：s（秒），m（分钟），h（小时）或d（天）。',
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        }
      ]
    },
    {
      title: 'Providers',
      description: '定义漏洞更新的提供者。',
      elements: [
        {
          name: 'provider',
          description: '用于指定漏洞更新的配置块。',
          repeatable: true,
          required: true,
          removable: true,
          repeatable_insert_first: true,
          repeatable_insert_first_properties: {
            removable: false
          },
          attributes: [
            {
              name: 'name',
              description: '定义漏洞信息提供者。',
              type: 'select',
              required: true,
              values: [
                {value: 'canonical', text: 'canonical'},
                {value: 'debian', text: 'debian'},
                {value: 'redhat', text: 'redhat'},
                {value: 'nvd', text: 'nvd'}
              ],
              default_value: 'canonical'
            },
            
          ],
          show_options: true,
          options: [
            {
              name: 'enabled',
              description: '启用漏洞提供程序更新。',
              type: 'switch',
              required: true
            },
            {
              name: 'os',
              description: '提供更新',
              type: 'select',
              info: `规范：()`,

              repeatable: true,
              removable: true,
              required: true,
              values: [
                {value: 'precise', text: 'precise'},
                {value: 'trusty', text: 'trusty'},
                {value: 'xenial', text: 'xenial'},
                {value: 'bionic', text: 'bionic'},
                {value: 'wheezy', text: 'wheez'},
                {value: 'jessie', text: 'jessie'},
                {value: 'stretch', text: 'stretch'},
                {value: 'buster', text: 'buster'}
              ],
              default_value: 'precise',
              attributes: [
                {
                  name: 'update_interval',
                  description: '漏洞数据库更新的频率。它的优先级高于provider块的update_interval选项。',
                  type: 'input',
                  validate_error_message: '一个正数，应包含表示时间单位的后缀字符：s（秒），m（分钟），h（小时）或d（天）。',
                  validate_regex: /^[1-9]\d*[s|m|h|d]$/
                },
                {
                  name: 'url',
                  description: '定义到备用OVAL文件的链接。',
                  type: 'input',
                  placeholder: '从Canonical或Debian获得的OVAL文件的下载链接。'
                },
                {
                  name: 'path',
                  description: '定义备用OVAL文件的路径。',
                  type: 'input',
                  placeholder: ''
                },
                {
                  name: 'port',
                  description: '使用url属性时定义连接端口。',
                  type: 'input-number',
                  values: { min: 0 },
                  default_value: '',
                  validate_error_message: '有效端口。'
                },
                {
                  name: 'allow',
                  description: '定义与不受支持的系统的兼容性。',
                  info: '有关设置的指南 https://documentation.wazuh.com/current/user-manual/capabilities/vulnerability-detection/allow_os.html',
                  type: 'input',
                  validate_error_message: '默认情况下不支持的操作系统。'
                }
              ]
            },
            {
              name: 'update_interval',
              description: '提供者的漏洞多久更新一次。可以使用具有相同名称<os>的属性覆盖它。',
              type: 'input',
              default_value: '1h',
              placeholder: '一个正数，应包含表示时间单位的后缀字符：s（秒），m（分钟），h（小时）或d（天）。',
              validate_error_message: '一个正数，应包含表示时间单位的后缀字符：s（秒），m（分钟），h（小时）或d（天）。',
              validate_regex: /^[1-9]\d*[s|m|h|d]$/
            },
            {
              name: 'update_from_year',
              description: '提供者的更新年份。',
              default_value: '2010',
              type: 'input',
              placeholder: '提供者的更新年份。',
              validate_regex: /^([1-9]\d{3})$/,
              validate_error_message: '提供者的更新年份。',
            },
            {
              name: 'allow',
              description: '定义与不受支持的系统的兼容性。',
              attributes: [
                {
                  name: 'replaced_os',
                  description: '定义将替换不受支持的系统的Red Hat的版本。',
                  type: 'input',
                  placeholder: '用标签代替的数字值形成有效的链接。',
                  validate_error_message: '用标签代替的数字值形成有效的链接。'
                }
              ]
            },
            {
              name: 'url',
              description: '定义到备用提要文件的链接。',
              type: 'input',
              placeholder:'定义到备用提要文件的链接。',
              attributes: [
                {
                  name: 'start',
                  description: '定义将替换标签的第一个值。',
                  type: 'input-number',
                  values: { min: 0 },
                  default_value: '',
                  placeholder: '用标签代替的数字值形成有效的链接。',
                  validate_error_message: '用标签代替的数字值形成有效的链接。',
                },
                {
                  name: 'end',
                  description: '定义将替换标签的最后一个值。',
                  type: 'input-number',
                  values: { min: 0 },
                  default_value: '',
                  placeholder: '用标签代替的数字值形成有效的链接。',
                  validate_error_message: '用标签代替的数字值形成有效的链接。',
                },
                {
                  name: 'port',
                  description: '定义连接端口。',
                  type: 'input-number',
                  values: { min: 0 },
                  placeholder: '有效端口。',
                  validate_error_message: '有效端口。',
                }
              ]
            },
            {
              name: 'path',
              description: '定义备用提要文件的路径。',
              type: 'input',
              placeholder: '有效路径'
            }
          ]
        }
      ]
    }
  ]
}
