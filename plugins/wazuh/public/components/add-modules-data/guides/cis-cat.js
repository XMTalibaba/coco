/*
* Wazuh app - CIS-CAT interactive interactive extension guide
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
  id: 'ciscat',
  name: 'CIS-CAT',
  wodle_name: 'cis-cat',
  description: 'CIS-CAT配置选项。',
  category: '审计与策略监控',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-ciscat.html',
  icon: 'securityApp',
  callout_warning: `默认情况下未安装CIS-CAT。 它是使用此模块必须获得的专有软件。`,
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '设置',
      description: '',
      elements: [
        {
          name: 'disabled',
          description: '禁用CIS-CAT选项。',
          type: 'switch',
          required: true
        },
        {
          name: 'timeout',
          description: '每次评估超时。 如果执行花费的时间超过了指定的超时时间，它将停止。',
          type: 'input-number',
          required: true,
          placeholder: '时间（以秒为单位）',
          values: { min: 1 },
          default_value: 1800,
          validate_error_message: '正数（秒）'
        },
        {
          name: 'java_path',
          description: '定义Java的位置。 如果未设置此参数，则在默认环境变量$ PATH中搜索Java位置。',
          warning: '对于此字段，可以将其设置为完整路径或相对路径。无论您是否指定相对路径，它都将连接到Wazuh安装路径。ciscat_path具有相同的行为。',
          type: 'input',
          placeholder: 'Java位置'
        },
        {
          name: 'ciscat_path',
          description: '定义CIS-CAT的位置。',
          type: 'input',
          required: true,
          placeholder: 'CIS-CAT位置',
          validate_error_message: '无效的路径'
        },
        {
          name: 'scan-on-start',
          description: '服务启动后立即运行评估。',
          type: 'switch'
        },
        {
          name: 'interval',
          description: `CIS-CAT执行之间的间隔。
          间隔选项受以下所述的日期，星期几和时间的限制。 如果未设置这些选项，则间隔可以取任何允许的值。`,
          type: 'input',
          default_value: '1d',
          placeholder: '时间格式为<数字> <时间单位后缀>，例如：1d',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符，例如s（秒），m（分钟），h（小时），d（天），w（周），M（月）。 例如：1天',
          validate_regex: /^[1-9]\d*[s|m|h|d|w|M]$/
        },
        {
          name: 'day',
          description: '每月的第几天运行CIS-CAT扫描。',
          info: '设置“天”选项后，间隔值必须是几个月的倍数。 默认情况下，间隔设置为一个月。',
          type: 'select',
          values: [
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: '3', text: '3' },
            { value: '4', text: '4' },
            { value: '5', text: '5' },
            { value: '6', text: '6' },
            { value: '7', text: '7' },
            { value: '8', text: '8' },
            { value: '9', text: '9' },
            { value: '10', text: '10' },
            { value: '11', text: '11' },
            { value: '12', text: '12' },
            { value: '13', text: '13' },
            { value: '14', text: '14' },
            { value: '15', text: '15' },
            { value: '16', text: '16' },
            { value: '17', text: '17' },
            { value: '18', text: '18' },
            { value: '19', text: '19' },
            { value: '20', text: '20' },
            { value: '21', text: '21' },
            { value: '22', text: '22' },
            { value: '23', text: '23' },
            { value: '24', text: '24' },
            { value: '25', text: '25' },
            { value: '26', text: '26' },
            { value: '27', text: '27' },
            { value: '28', text: '28' },
            { value: '29', text: '29' },
            { value: '30', text: '30' },
            { value: '31', text: '31' }
          ],
          default_value: '1'
        },
        {
          name: 'wday',
          description: '一周中的一天运行CIS-CAT扫描。 该选项与day选项不兼容。',
          info: '设置wday选项时，间隔值必须是几周。 默认情况下，间隔设置为一周。',
          type: 'select',
          values: [
            { value: 'sunday', text: '星期日' },
            { value: 'monday', text: '星期一' },
            { value: 'tuesday', text: '星期二' },
            { value: 'wednesday', text: '星期三' },
            { value: 'thursday', text: '星期四' },
            { value: 'friday', text: '星期五' },
            { value: 'saturday', text: '星期六' }
          ],
          default_value: 'sunday',
          placeholder: '每月的某天[1..31]',
          validate_error_message: '每月的某天[1..31]'
        },
        {
          name: 'time',
          description: '一天中的时间运行扫描。 必须以hh:mm格式表示。',
          type: 'input',
          placeholder: '一天中的时间',
          validate_error_message: '一天中的时间：hh:mm格式',
          validate_regex: /^(((0[0-9])|(1[0-9])|(2[0-4])):[0-5][0-9])$/
        }
      ]
    },
    {
      title: '内容',
      description: '定义评估。',
      elements: [
        {
          name: 'content',
          description: `定义评估。 目前，您只能对XCCDF策略文件运行评估。`,
          removable: false,
          required: true,
          validate_error_message: '任何目录或文件名。',
          show_attributes: true,
          show_options: true,
          attributes: [
            {
              name: 'type',
              description: '选择内容类型。',
              type: 'input',
              required: true,
              default_value: 'xccdf',
              field_read_only: true
            },
            {
              name: 'path',
              description: '使用指定的策略文件。',
              info: '可以使用基准文件所在的整个路径或CIS-CAT工具位置的相对路径来填充path属性。',
              type: 'input',
              required: true,
              placeholder: '基准文件所在的路径',
              validate_error_message: '基准文件所在的路径'
            },
            {
              name: 'timeout',
              description: `评估超时（以秒为单位）。
              使用此属性将覆盖通用超时。`,
              type: 'input-number',
              values: { min: 1 },
              default_value: 1800,
              validate_error_message: '正数（秒）'
            }
          ],
          options: [
            {
              name: 'profile',
              description: '选择配置。',
              type: 'input',
              required: true,
              placeholder: 'Profile',
              validate_error_message: '有效的配置。'
            }
          ]
        }
      ]
    }
  ]
}