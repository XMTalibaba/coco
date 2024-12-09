/*
* Wazuh app - Amazon Web Services interactive extension guide
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
  id: 'aws',
  name: '亚马逊AWS服务',
  wodle_name: 'aws-s3',
  description: 'AWS-S3配置选项。',
  category: '安全信息管理',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-s3.html',
  icon: 'logoAWSMono',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '必填设置',
      description: '',
      elements: [
        {
          name: 'disabled',
          description: `禁用AWS-S3选项。`,
          type: 'switch',
          required: true
        },
        {
          name: 'interval',
          description: '从S3存储桶读取的频率。',
          type: 'input',
          required: true,
          placeholder: '正数，带表示时间单位的后缀字符',
          default_value: '10m',
          validate_error_message: '一个正数，应包含表示时间单位的后缀字符，例如s（秒），m（分钟），h（小时），d（天）。 例如 10m',
          validate_regex: /^[1-9]\d*[s|m|h|d]$/
        },
        {
          name: 'run_on_start',
          description: '服务启动后立即运行评估。',
          type: 'switch',
          required: true,
          default_value: true
        },
        
      ]
    },
    {
      title: '可选设置',
      description: '',
      elements: [
        {
          name: 'remove_from_bucket',
          description: '定义是否读取S3存储桶中的日志。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'skip_on_error',
          description: '当无法处理和解析CloudTrail日志时，请跳过该日志并继续进行处理。',
          type: 'switch',
          default_value: true
        }
      ]
    },
    {
      title: 'Buckets',
      description: '定义一个或多个要处理的存储桶。',
      elements: [
        {
          name: 'bucket',
          description: '定义要处理的存储桶。',
          removable: true,
          required: true,
          repeatable: true,
          repeatable_insert_first: true,
          repeatable_insert_first_properties: {
            removable: false
          },
          validate_error_message: '任何目录或文件名',
          show_attributes: true,
          attributes: [
            {
              name: 'type',
              description: '指定存储桶的类型。',
              info: '由于macie具有自定义类型，因此配置不同。',
              type: 'select',
              required: true,
              values: [
                {value: 'cloudtrail', text: 'cloudtrail'},
                {value: 'guardduty', text: 'guardduty'},
                {value: 'vpcflow', text: 'vpcflow'},
                {value: 'config', text: 'config'},
                {value: 'custom', text: 'custom'}
              ],
              default_value: 'cloudtrail'
            }
          ],
          show_options: true,
          options: [
            {
              name: 'name',
              description: '从中读取日志的S3存储桶的名称。',
              type: 'input',
              required: true,
              placeholder: 'S3存储桶的名称'
            },
            {
              name: 'aws_account_id',
              description: '存储桶日志的AWS账户ID。 仅适用于CloudTrail存储桶。',
              type: 'input',
              placeholder: '12位AWS账户ID列表'
            },
            {
              name: 'aws_account_alias',
              description: 'AWS账户的用户友好名称。',
              type: 'input',
              placeholder: 'AWS账户用户友好名称'
            },
            {
              name: 'access_key',
              description: '具有从存储桶中读取日志的权限的IAM用户的访问密钥ID。',
              type: 'input',
              placeholder: '任何字母数字键。'
            },
            {
              name: 'secret_key',
              description: '为IAM用户创建的具有从存储桶中读取日志的权限的密钥。',
              type: 'input',
              placeholder: '任何字母数字键。'
            },
            {
              name: 'aws_profile',
              description: '共享凭证文件或AWS Config文件中的有效配置文件名称，并具有从存储桶中读取日志的权限。',
              type: 'input',
              placeholder: '有效的配置名称'
            },
            {
              name: 'iam_role_arn',
              description: '一个有效的角色arn，具有从存储桶中读取日志的权限。',
              type: 'input',
              placeholder: '有效角色'
            },
            {
              name: 'path',
              description: '如果已定义，则为存储桶的路径或前缀。',
              type: 'input',
              placeholder: '值区的路径或前缀。'
            },
            {
              name: 'only_logs_after',
              description: '只会解析该日期之后的有效日期，格式为YYYY-MMM-DD。 该日期之前的所有日志都将被跳过。',
              type: 'input',
              placeholder: '日期, 例如: 2020-APR-02',
              validate_regex: /^[1-9]\d{3}-((JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OCT)|(NOV)|(DEC))-\d{2}$/,
              validate_error_message: '有效日期，格式为YYYY-MMM-DD'
            },
            {
              name: 'regions',
              description: '以逗号分隔的区域列表，用于限制日志的解析。 仅适用于CloudTrail存储桶。',
              type: 'input',
              default_value: 'All regions',
              placeholder: '以逗号分隔的有效区域列表'
            },
            {
              name: 'aws_organization_id',
              description: 'AWS组织的名称。 仅适用于CloudTrail存储桶。',
              type: 'input',
              placeholder: '有效的AWS组织名称'
            }
          ]
        }
      ]
    }
  ]
}