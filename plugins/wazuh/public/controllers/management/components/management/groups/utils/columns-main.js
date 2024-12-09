import React from 'react';
import { EuiToolTip, EuiButtonIcon } from '@elastic/eui';
import GroupsHandler from './groups-handler';
import { WzButtonPermissions } from '../../../../../../components/common/permissions/button';

export default class GroupsColums {
  constructor(tableProps) {
    this.tableProps = tableProps;
    this.groupsHandler = GroupsHandler;

    this.buildColumns = () => {
      this.columns = [
        {
          field: 'name',
          name: '名称',
          align: 'left',
          sortable: true
        },
        {
          field: 'count',
          name: '代理数量',
          align: 'left',
        },
        // {
        //   field: 'configSum',
        //   name: '配置校验和',
        //   align: 'left',
        // }
        {
          field: 'label',
          name: '部门',
          align: 'left',
          render: label => this.tableProps.labelList.find(k => k.value === label)?.text
        },
      ];
      this.columns.push({
        name: '操作',
        align: 'left',
        render: item => {
          return (
            <div>
              <WzButtonPermissions
                buttonType='icon'
                permissions={[{action: 'group:read', resource: `group:id:${item.name}`}]}
                tooltip={{position: 'top', content: `查看分组代理`}}
                aria-label="查看组详情"
                iconType="eye"
                onClick={async () => {
                  this.tableProps.updateGroupDetail(item);
                }}
                color="primary"
              />
              <WzButtonPermissions
                buttonType='icon'
                permissions={[{action: 'group:read', resource: `group:id:${item.name}`}]}
                tooltip={{position: 'top', content: `编辑分组`}}
                aria-label="编辑分组"
                iconType="indexEdit"
                onClick={async () => {
                  // console.log(this.tableProps)
                  this.tableProps.toDetails(item);
                }}
                color="primary"
              />
              {/* <WzButtonPermissions
                buttonType='icon'
                permissions={[{action: 'group:read', resource: `group:id:${item.name}`}]}
                tooltip={{position: 'top', content: '编辑组配置'}}
                aria-label="编辑组配置"
                iconType="pencil"
                onClick={async ev => {
                  ev.stopPropagation();
                  this.showGroupConfiguration(item.name);
                }}
              /> */}
              <WzButtonPermissions
                buttonType='icon'
                permissions={[{action: 'group:delete', resource: `group:id:${item.name}`}]}
                tooltip={{posiiton: 'top', content: item.name === 'default' ? `${item.name}组不能删除`: `删除${item.name}`}}
                aria-label="删除内容"
                iconType="trash"
                onClick={async ev => {
                  ev.stopPropagation();
                  this.tableProps.updateListItemsForRemove([item]);
                  this.tableProps.updateShowModal(true);
                }}
                color="danger"
                isDisabled={item.name === 'default'}
              />
            </div>
          );
        }
      });
    };

    this.buildColumns();
  }

  async showGroupConfiguration(groupId) {
    const result = await this.groupsHandler.getFileContent(
      `/groups/${groupId}/files/agent.conf/xml`
    );

    const file = {
      name: 'agent.conf',
      content: this.autoFormat(result),
      isEditable: true,
      groupName: groupId
    };
    this.tableProps.updateFileContent(file);
  }

  autoFormat = xml => {
    var reg = /(>)\s*(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml
      .replace(reg, '$1\n$2$3')
      .replace(wsexp, '$1\n')
      .replace(contexp, '$1\n$2');
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    var transitions = {
      'single->single': 0,
      'single->closing': -1,
      'single->opening': 0,
      'single->other': 0,
      'closing->single': 0,
      'closing->closing': -1,
      'closing->opening': 0,
      'closing->other': 0,
      'opening->single': 1,
      'opening->closing': 0,
      'opening->opening': 1,
      'opening->other': 1,
      'other->single': 0,
      'other->closing': -1,
      'other->opening': 0,
      'other->other': 0
    };

    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (ln.match(/\s*<\?xml/)) {
        formatted += ln + '\n';
        continue;
      }
      var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
      var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
      var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
      var type = single
        ? 'single'
        : closing
        ? 'closing'
        : opening
        ? 'opening'
        : 'other';
      var fromTo = lastType + '->' + type;
      lastType = type;
      var padding = '';

      indent += transitions[fromTo];
      for (var j = 0; j < indent; j++) {
        padding += '\t';
      }
      if (fromTo == 'opening->closing')
        formatted = formatted.substr(0, formatted.length - 1) + ln + '\n';
      // substr removes line break (\n) from prev loop
      else formatted += padding + ln + '\n';
    }
    return formatted.trim();
  };
}
