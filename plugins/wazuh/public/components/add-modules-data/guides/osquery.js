/*
* Wazuh app - Osquery interactive extension guide
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
  id: 'osquery',
  name: 'Osquery',
  wodle_name: 'osquery',
  description: 'osquery的配置选项。',
  category: '威胁检测与响应',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-osquery.html',
  icon: 'securityApp',
  callout_warning: '默认情况下未安装Osquery。它是使用此模块必须获得的开源软件。',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'disabled',
          description: '禁用osquery选项',
          type: 'switch',
          required: true
        },
        {
          name: 'run_daemon',
          description: '使模块以osqueryd作为子进程运行，或者让模块在不运行Osquery的情况下监视结果日志。',
          type: 'switch',
          required: true,
          default_value: true
        },
        {
          name: 'bin_path',
          description: '包含osqueryd可执行文件的文件夹的完整路径。',
          type: 'input',
          required: true,
          placeholder: '任何有效路径。',
          default_value_linux: '',
          default_value_windows: 'C:\\Program Files\\osquery\\osqueryd'
        },
        {
          name: 'log_path',
          description: 'Osquery编写的结果日志的完整路径。',
          type: 'input',
          required: true,
          placeholder: '任何有效的路径',
          default_value_linux: '/var/log/osquery/osqueryd.results.log',
          default_value_windows: 'C:\\Program Files\\osquery\\log\\osqueryd.results.log',
          validate_error_message: '任何有效的路径'
        },
        {
          name: 'config_path',
          description: 'Osquery配置文件的路径。该路径可以相对于代理运行所在的文件夹。',
          type: 'input',
          required: true,
          placeholder: 'Osquery配置文件的路径',
          default_value_linux: '/etc/osquery/osquery.conf',
          default_value_windows: 'C:\\Program Files\\osquery\\osquery.conf'
        },
        {
          name: 'add_labels',
          description: '添加定义为装饰器的代理标签。',
          type: 'switch',
          required: true,
          default_value: true
        }
      ]
    },
    {
      title: '包',
      description: '将查询包添加到配置中。可以多次定义此选项。',
      elements: [
        {
          name: 'pack',
          description: '将查询包添加到配置中。',
          type: 'input',
          placeholder: '打包配置文件的路径',
          default_value: '',
          removable: true,
          repeatable: true,
          required: true,
          validate_error_message: '打包配置文件的路径',
          show_attributes: true,
          attributes: [
            {
              name: 'name',
              description: '包的名称',
              type: 'input',
              required: true,
              placeholder: '包的名称',
              default_value: '',
              validate_error_message: '包的名称'
            }
          ]
        }
      ]
    }
  ]
}