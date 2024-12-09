/*
* Wazuh app - Vulnerabilities interactive extension guide
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
  id: 'fim',
  xml_tag: 'syscheck',
  name: '完整性监控',
  description: '文件完整性监视的配置选项。',
  category: '安全信息管理',
  documentation_link: 'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/syscheck.html',
  icon: 'filebeatApp',
  avaliable_for_manager: true,
  avaliable_for_agent: true,
  steps: [
    {
      title: '要监控的目录/文件',
      description: '添加或删除要监控的目录。您可以添加具有不同监控配置的多个目录。',
      elements: [
        {
          name: 'directories',
          description: `使用此选项可以添加或删除要监控的目录。 目录必须用逗号分隔。
          注意目录中所有文件和子目录也将受到监控。             
          没有目录的驱动器号无效。 至少应包含“.”（D：\\.）。
          这将在要监控的系统上设置（或在agent.conf中，如果适用）。`,
          type: 'input',
          required: true,
          removable: true,
          repeatable: true,
          repeatable_insert_first: true,
          repeatable_insert_first_properties: {
            removable: false
          },
          placeholder: '任何目录，逗号分隔',
          default_value: '/etc,/usr/bin,/usr/sbin,/bin,/sbin',
          attributes: [
            {
              name: 'realtime',
              description: `这将在Linux（使用inotify系监控统调用）和Windows系统上启用实时/连续监控。
              实时仅适用于目录，不适用于单个文件。`,
              type: 'switch',
              default_value: false
            },
            {
              name: 'who-data',
              description: '这将启用Linux和Windows系统上的Who-data监控。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'report_changes',
              description: '报告文件更改。目前仅限文本文件。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_all',
              description: '所有带有前缀check_的属性都将被激活。',
              type: 'switch',
              default_value: true
            },
            {
              name: 'check_sum',
              description: `检查文件的MD5，SHA-1和SHA-256哈希值。
              与同时使用check_md5sum="yes", check_sha1sum="yes" and check_sha256sum="yes"相同。`,
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_sha1sum',
              description: '仅检查文件的SHA-1哈希。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_md5sum',
              description: '仅检查文件的MD5哈希。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_sha256sum',
              description: '仅检查文件的SHA-256哈希。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_size',
              description: '检查文件的大小。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_owner',
              description: `检查文件的所有者。
              在Windows上，uid始终为0。`,
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_group',
              description: `检查文件/目录的组所有者。
              适用于UNIX。 在Windows上，gid将始终为0，组名将为空白。`,
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_perm',
              description: `检查文件/目录的权限。
              在Windows上，从3.8.0版开始，将为每个用户或组提供拒绝和允许的权限列表。
              仅适用于Windows系统上的NTFS分区。`,
              type: 'switch',
              default_value: false,
              agent_os: 'windows'
            },
            {
              name: 'check_attrs',
              description: `检查文件的属性。
              适用于Windows。`,
              type: 'switch',
              default_value: false,
              agent_os: 'windows'
            },
            {
              name: 'check_mtime',
              description: '检查文件的修改时间。',
              type: 'switch',
              default_value: false
            },
            {
              name: 'check_inode',
              description: `检查文件节点。
              适用于UNIX。在Windows上，inode始终为0。`,
              type: 'switch',
              default_value: false,
              agent_os: 'linux'
            },
            {
              name: 'restrict',
              description: `将检查范围限制为文件名中包含输入的字符串的文件。
              允许使用任何目录或文件名（但不能包含路径）`,
              type: 'input',
              placeholder: 'sregex',
              default_value: 'sregex',
              field_read_only: true,
              validate_error_message: '允许使用任何目录或文件名（但不能包含路径）'
            },
            {
              name: 'tags',
              description: '将标签添加到受监视目录的警报中。',
              type: 'input',
              placeholder: '标签列表以逗号分隔'
            },
            {
              name: 'recursion_level',
              description: '限制允许的最大递归级别。',
              type: 'input-number',
              default_value: '',
              values: { min: 0, max: 320 },
              placeholder: '0到320之间的任何整数',
              validate_error_message: '0到320之间的任何整数'
            },
            {
              name: 'follow_symbolic_link',
              description: `跟随符号链接（目录或文件）。 默认值为“ no”。 该设置可用于UNIX系统。
              如果设置，则实时将照常工作（具有指向目录而非文件的符号链接）。`,
              type: 'switch',
              default_value: false,
              agent_os: 'linux'
            }
          ]
        }
      ]
    },
    {
      title: 'Ignore directories and/or files',
      description: '要忽略的文件或目录列表。 您可以多次添加此选项。 这些文件和目录仍处于检查状态，但结果将被忽略。',
      elements: [
        {
          name: 'ignore',
          description: '要忽略的文件或目录。',
          type: 'input',
          removable: true,
          required: true,
          repeatable: true,
          placeholder: '文件/目录路径',
          attributes: [
            {
              name: 'type',
              description: '这是一个简单的正则表达式模式，用于过滤掉文件，因此不会生成警报。',
              type: 'input',
              placeholder: 'sregex',
              default_value: 'sregex',
              field_read_only: true
            }
          ]
        }
      ]
    },
    {
      title: 'Not compute',
      description: '不计算差异的文件列表。您可以多次添加此选项。它可用于敏感文件，例如私钥，存储在文件或数据库配置中的凭据，通过通过警报发送文件内容更改来避免数据泄漏。',
      elements: [
        {
          name: 'nodiff',
          description: '不计算差异的文件。',
          type: 'input',
          placeholder: '文件路径',
          required: true,
          removable: true,
          repeatable: true,
          validate_error_message: '任何文件名。例如 /etc/ssl/private.key',
          attributes: [
            {
              name: 'type',
              description: '这是一个简单的正则表达式模式，用于过滤掉文件，因此不会生成警报。',
              type: 'input',
              placeholder: 'sregex',
              default_value: 'sregex',
              field_read_only: true
            }
          ]
        }
      ]
    },
    {
      title: 'Scan day',
      description: '一周中的一天运行扫描。您可以多次添加此选项。',
      elements: [
        {
          name: 'scan_day',
          description: '一周中的一天运行扫描。',
          type: 'select',
          removable: true,
          required: true,
          repeatable: true,
          values: [
            {value: 'sunday', text: '星期日'},
            {value: 'monday', text: '星期一'},
            {value: 'tuesday', text: '星期二'},
            {value: 'wednesday', text: '星期三'},
            {value: 'thursday', text: '星期四'},
            {value: 'friday', text: '星期五'},
            {value: 'saturday', text: '星期六'}
          ],
          default_value: 'sunday',
          validate_error_message: `一周中的一天。`
        }
      ]
    },
    {
      title: 'Windows registry',
      description: '使用此选项可以监视指定的Windows注册表项。您可以多次添加此选项。',
      elements: [
        {
          name: 'windows_registry',
          description: '使用此选项监视指定的Windows注册表项',
          info: '新条目将不会触发警报，只会更改现有条目。',
          type: 'input',
          placeholder: 'Windows注册表项',
          default_value: 'HKEY_LOCAL_MACHINE\\Software',
          required: true,
          repeatable: true,
          removable: true,
          agent_os: 'windows',
          attributes: [
            {
              name: 'arch',
              description: '根据体系结构选择注册表视图。',
              type: 'select',
              values: [{value: '32bit', text: '32bit'}, {value: '64bit', text: '64bit'}, {value: 'both', text: 'both'}],
              default_value: '32bit'
            },
            {
              name: 'tags',
              description: '将标签添加到警报中，以监视受监视的注册表项。',
              type: 'input',
              placeholder: '标签列表以逗号分隔'
            }
          ]
        }
      ]
    },
    {
      title: 'Registry ignore',
      description: '注册表项列表将被忽略。',
      elements: [
        {
          name: 'registry_ignore',
          description: '注册表项列表将被忽略。（每行一个条目）。可以输入多行以包括多个注册表项。',
          type: 'input',
          placeholder: '任何注册表项。',
          validate_error_message: '任何注册表项。',
          toggeable: true,
          attributes: [
            {
              name: 'arch',
              description: '选择要忽略的注册表，具体取决于体系结构。',
              type: 'select',
              values: [{value: '32bit', text: '32bit'}, {value: '64bit', text: '64bit'}, {value: 'both', text: 'both'}],
              default_value: '32bit'
            },
            {
              name: 'tags',
              description: '这是一个简单的正则表达式模式，用于过滤掉文件，因此不会生成警报。',
              type: 'input',
              placeholder: 'sregex'
            }
          ]
        }
      ]
    },
    {
      title: '其他设置',
      description: '',
      elements: [
        {
          name: 'frequency',
          description: 'syscheck运行的频率（以秒为单位）。',
          type: 'input-number',
          required: true,
          default_value: 43200,
          values: { min: 1 },
          placeholder: '时间以秒为单位。',
          validate_error_message: `正数，以秒为单位的时间。`
        },
        {
          name: 'scan_time',
          description: '进行扫描的时间。时间可以用9pm或8:30表示。',
          info: '这可能会延迟实时扫描的初始化。',
          type: 'input',
          placeholder: '一天中的时间',
          validate_error_message: '一天中的时间，例如 9pm或8:30',
          validate_regex: /^(((0?[1-9]|1[012])(:[0-5][0-9])?am)|(((0?[0-9])|(1[0-9])|(2[0-4]))(:[0-5][0-9])?pm))|(((0?[0-9])|(1[012])|(2[0-4])):([0-5][0-9]))$/,
          warning: '这可能会延迟实时扫描的初始化。'
        },
        {
          name: 'auto_ignore',
          description: '指定syscheck是否将忽略更改次数过多的文件（仅用于管理器）。',
          info: '生效于服务器和本地。',
          type: 'switch',
          agent_type: 'manager',
          show_attributes: true,
          attributes: [
            {
              name: 'frequency',
              description: '在“timeframe”时间间隔内可以重复发出警报的次数。',
              type: 'input-number',
              required: true,
              values: { min: 1, max: 99 },
              default_value: 10,
              validate_error_message: '1到99的任意数。'
            },
            {
              name: 'timeframe',
              description: '文件生成的警报数量累积的时间间隔。',
              type: 'input-number',
              required: true,
              placeholder: '时间以秒为单位',
              values: { min: 1, max: 43200 },
              default_value: 3600,
              validate_error_message: '1到43200的任意数。'
            }
          ]
        },
        {
          name: 'alert_new_files',
          description: '指定在创建新文件时syscheck是否应发出警报。',
          info: '生效于服务器和本地。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'scan_on_start',
          description: '指定syscheck在启动时是否立即扫描。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'allow_remote_prefilter_cmd',
          description: '允许prefilter_cmd选项应用于远程配置（agent.conf）。',
          info: '此选项只能在代理端的自己的ossec.conf中激活。',
          type: 'switch',
          default_value: false
        },
        {
          name: 'prefilter_cmd',
          description: '运行以防止预链接产生误报。',
          info: `此选项可能会对性能产生负面影响，因为将对每个检查的文件运行配置的命令。
          如果在ossec.conf上将allow_remote_prefilter_cmd设置为no，则在agent.conf上定义时将忽略此选项。`,
          type: 'input',
          placeholder: '防止预链接的命令。'
        },
        {
          name: 'skip_nfs',
          description: '指定syscheck是否应扫描网络安装的文件系统（在Linux和FreeBSD上运行）。当前，skip_nfs将排除在CIFS或NFS挂载上检查文件的能力。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'skip_dev',
          description: '指定syscheck是否应扫描/dev目录。（适用于Linux和FreeBSD）。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'skip_sys',
          description: '指定syscheck是否应扫描/sys目录。（在Linux上运行）。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'skip_proc',
          description: '指定syscheck是否应扫描/proc目录。（适用于Linux和FreeBSD）。',
          type: 'switch',
          default_value: true
        },
        {
          name: 'windows_audit_interval',
          description: '此选项设置Windows代理检查以whodata模式监视的目录的SACL正确的频率（以秒为单位）。',
          type: 'input-number',
          values: { min: 1, max: 9999 },
          default_value: 300,
          placeholer: '时间（以秒为单位）',
          validate_error_message: '1到9999的任意数',
          agent_os: 'windows'
        },
        {
          name: 'process_priority',
          description: '为Syscheck进程设置值。',
          info: 'Linux中的“ niceness”范围从-20到19，而-20是最高优先级，19是最低优先级。',
          type: 'input-number',
          placholder: '流程优先级',
          default_value: 10,
          values: { min: -20, max: 19 },
          validate_error_message: '-20到19的整数。'
        },
        {
          name: 'max_eps',
          description: '设置最大事件报告吞吐量。事件是将产生警报的消息。',
          info: '0表示禁用。',
          type: 'input-number',
          placholder: '流程优先级',
          default_value: 100,
          values: { min: 0, max: 1000000 },
          validate_error_message: '0到1000000的整数。'
        },
        {
          name: 'database',
          description: '指定要将数据库存储在何处。',
          type: 'select',
          default_value: 'disk',
          values: [
            { value: 'disk', text: 'disk'},
            { value: 'memory', text: 'memory'}
          ]
        },
        {
          name: 'synchronization',
          description: '数据库同步设置将在此标记内配置。',
          show_options: true,
          options: [
            {
              name: 'enabled',
              description: '指定是否进行定期库存同步。',
              type: 'switch',
              default_value: true,
              required: true
            },
            {
              name: 'interval',
              description: '指定每次清单同步之间的初始秒数。如果同步失败，则该值将被复制，直到达到max_interval的值为止。',
              type: 'input',
              default_value: '300s',
              required: true,
              validate_error_message: '大于或等于0的任何数字。允许的后缀（s，m，h，d）。',
              validate_regex: /^[1-9]\d*[s|m|h|d]$/
            },
            {
              name: 'max_interval',
              description: '指定每次清单同步之间的最大秒数。',
              type: 'input',
              default_value: '1h',
              required: true,
              validate_error_message: '大于或等于0的任何数字。允许的后缀（s，m，h，d）。',
              validate_regex: /^[1-9]\d*[s|m|h|d]$/
            },
            {
              name: 'response_timeout',
              description: '指定自代理将消息发送到管理器并接收响应以来经过的时间（以秒为单位）。如果在此时间间隔内未收到响应，则消息将标记为未应答（超时），并且代理可以按定义的时间间隔启动新的同步会话。',
              type: 'input-number',
              default_value: 30,
              required: true,
              values: { min: 0 },
              validate_error_message: '大于或等于0的任何数字。'
            },
            {
              name: 'queue_size',
              description: '指定管理器同步响应的队列大小。',
              type: 'input-number',
              default_value: 16384,
              required: true,
              values: { min: 0, max: 1000000 },
              validate_error_message: '2到1000000之间的整数。'
            },
            {
              name: 'max_eps',
              description: '设置最大同步消息吞吐量。',
              info: '0表示禁用。',
              type: 'input-number',
              default_value: 10,
              required: true,
              values: { min: 0, max: 1000000 },
              validate_error_message: '0到1000000的整数。0表示禁用。'
            }
          ]
        },
        {
            name: 'whodata',
            description: 'Whodata选项将在此标记内配置。',
            options: [
              {
                name: 'restart_audit',
                description: '安装插件后，允许系统重新启动Audited。 请注意，将此字段设置为no不会自动应用新的whodata规则。',
                type: 'switch',
                default_value: true
              },
              {
                name: 'audit_key',
                description: '设置完整性监控引擎以使用带有audit_key的键来收集Audit事件。系统将在其完整性监控基线中包括由Audit使用audit_key监视的那些事件。对于已经将Audit设置为监视文件夹以用于其他目的的系统，Wazuh可以从audit_key收集作为密钥生成的事件。该选项仅适用于带有Audit的Linux系统。',
                info: 'Audit允许在键中插入空格，因此，在<audit_key>字段中插入的空格将成为键的一部分。',
                type: 'input',
                placeholder: '任何用逗号分隔的字符串',
                validate_error_message: '任何用逗号分隔的字符串',
                agent_os: 'linux'
              },
              {
                name: 'startup_healthcheck',
                description: '此选项允许在Whodata引擎启动期间禁用审核运行状况检查。该选项仅适用于带有Audit的Linux系统。',
                warning: '健康状况检查可确保可以在Audit中正确设置Whodata所需的规则，并确保可以获得生成的事件。禁用运行状况检查可能会导致Whodata运行正常，并丢失完整性监控事件。',
                type: 'switch',
                default_value: true,
                agent_os: 'linux'
              }
            ]
          }
      ]
    },
  ]
}
