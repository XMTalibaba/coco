/*
* Wazuh app - Docker listener interactive extension guide
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
  id: 'docker',
  name: 'Docker监听器',
  wodle_name: 'docker-listener',
  description: 'Docker的配置选项。',
  category: '威胁检测与响应',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-docker.html',
  icon: 'logoDocker',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'disabled',
          description: '禁用Docker选项。',
          type: 'switch',
          required: true
        },
        {
          name: 'interval',
          description: '一个正数，应包含表示时间单位的后缀字符，例如s（秒），m（分钟），h（小时），d（天）',
          type: 'input',
          required: true,
          placeholder: '时间格式为<数字> <时间单位后缀>',
          default_value: '1m',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符。 例如：1m',
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        },
        {
          name: 'attempts',
          description: '尝试执行次数。',
          type: 'input-number',
          required: true,
          placeholder: '尝试次数',
          values: { min: 1 },
          default_value: 5,
          validate_error_message: '尝试执行次数。'
        },
        {
          name: 'run_on_start',
          description: `服务启动后立即运行命令。`,
          type: 'switch',
          required: true,
          default_value: true
        }
      ]
    }
  ]
}