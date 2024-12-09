/*
* Wazuh app - System auditing interactive extension guide
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
  id: 'audit',
  name: '系统审计',
  xml_tag: 'localfile',
  description: '系统审计扩展的配置选项。',
  category: '审计与策略监控',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/localfile.html',
  icon: 'securityApp',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'log_format',
          description: '设置要读取的日志格式。必填项',
          type: 'input',
          required: true,
          placeholder: '审计',
          default_value: 'audit',
          field_read_only: true
        },
        {
          name: 'location',
          description: '用于获取日志或一组日志的位置的选项。strftime格式字符串可用于日志文件名。',
          type: 'input',
          required: true,
          placeholder: '日志或日志组位置',
          default_value: '/var/log/audit/audit.log',
          field_read_only: true
        },
        {
          name: 'command',
          description: '给定命令输出，根据使用命令或full_command的不同，它将作为一条或多条日志消息读取。',
          type: 'input',
          placeholder: '任何命令行，可选地包括参数'
        },
        {
          name: 'alias',
          description: '在日志消息中更改命令名称。',
          type: 'input',
          placeholder: '别名'
        },
        {
          name: 'frequency',
          description: '防止执行命令的时间少于指定的时间（以秒为单位）。 此选项可与command和full_command一起使用。',
          type: 'input-number',
          values: { min: 1 },
          default_value: '',
          placeholder: '频率',
          validate_error_message: '秒的正整数'
        },
        {
          name: 'only-future-events',
          description: `将其设置为no以收集自Wazuh代理停止以来生成的事件。
          默认情况下，启动Wazuh时，自代理启动以来，它将仅从给定的Windows事件通道读取所有日志内容。
          此功能仅与事件通道日志格式兼容。`,
          type: 'switch',
          default_value: true
        },
        // { //Not for log_format audit
        //   name: 'query',
        //   description: 'Filter eventchannel events that Wazuh will process by using an XPATH query following the event schema.',
        //   type: 'input',
        //   placeholder: 'Any XPATH query following the event schema',
        //   validate_error_message: 'Any XPATH query following the event schema'
        // },
        // { //Not for log_format audit
        //   name: 'label',
        //   description: `Used to add custom data in JSON events. Set log_format to json to use it.
        //   Labels can be nested in JSON alerts by separating the “key” terms by a period.
        //   Here is an example of how to identify the source of each log entry when monitoring several files simultaneously:`,
        //   info: 'If a label key already exists in the log data, the configured field value will not be included. It is recommended that a unique label key is defined by using a symbol prior to the key name as in @source.',
        //   type: 'input',
        //   repeatable: true,
        //   placeholder: '',
        //   validate_error_message: ''
        // },
        {
          name: 'target',
          description: '目标指定将输出重定向到的套接字的名称。 套接字必须事先定义。',
          type: 'input',
          default_value: 'agent',
          placeholder: '任何定义的套接字'
        },
        {
          name: 'out_format',
          description: '此选项允许使用字段替换来格式化Logcollector中的日志。',
          info: `log:	来自日志的消息。
          json_escaped_log:	日志中的消息，转义JSON存储字符。
          output:	命令的输出。日志的别名。
          location:	源日志文件的路径。
          command:	为命令定义的命令行或别名。位置的别名。
          timestamp:	当前时间戳（发送日志时），采用RFC3164格式。
          timestamp <format>:	自定义时间戳，采用strftime字符串格式。
          hostname:	系统的主机名。
          host_ip:	主机的主要IP地址。`,
          type: 'input',
          placeholder: '使用字段替换从Logcollector格式化日志',
          show_attributes: true,
          attributes: [
            {
              name: 'target',
              description: '此选项选择已定义的目标以应用输出格式',
              type: 'input',
              required: true,
              placeholder: '选项<target>中定义的任何目标。'
            }
          ]
        },
        {
          name: 'ignore_binaries',
          description: `指定忽略二进制文件，测试文件是UTF8还是ASCII。
          如果将其设置为“yes”，文件是二进制文件，则将其丢弃。`,
          info: '在Windows代理上，它还将检查文件是否使用UCS-2 LE BOM或UCS-2 BE BOM编码。',
          type: 'switch'
        },
        {
          name: 'age',
          description: `这指定为在指定期限之前已修改的只读文件。
          例如，如果将时间设置为1天，则1天内未修改的所有文件都将被忽略。`,
          type: 'input',
          placeholder: '时间格式为<数字> <时间单位后缀>',
          validate_error_message: `一个正数，应包含表示时间单位的后缀字符，例如s（秒），m（分钟），h（小时），d（天）。`,
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        },
        {
          name: 'exclude',
          description: `这表示要排除的通配符日志组的位置。
          例如，我们可能要从目录中读取所有文件，但排除名称以e开头的文件。`,
          type: 'input',
          placeholder: '任何日志文件或通配符'
        },
        {
          name: 'exclude',
          description: `这表示要排除的通配符日志组的位置。
          例如，我们可能要从目录中读取所有文件，但排除名称以e开头的文件。`,
          type: 'input',
          placeholder: '任何日志文件或通配符'
        }
      ]
    }
  ]
}