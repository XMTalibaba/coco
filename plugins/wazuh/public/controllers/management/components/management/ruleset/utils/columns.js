import React from 'react';
import { EuiToolTip, EuiButtonIcon, EuiLink, EuiBadge } from '@elastic/eui';
import { resourceDictionary, RulesetHandler, RulesetResources } from './ruleset-handler';
import exportCsv from '../../../../../../react-services/wz-csv';
import { WzButtonPermissions } from '../../../../../../components/common/permissions/button';

export default class RulesetColumns {
  constructor(tableProps) {
    this.tableProps = tableProps;    

    this.buildColumns = () => {
      this.columns = {
        rules: [
          {
            field: 'id',
            name: 'ID',
            align: 'left',
            sortable: true,
            width: '5%'
          },
          {
            field: 'description',
            name: '描述',
            align: 'left',
            sortable: true,
            width: '30%',
            render: (value, item) => {
              if(value === undefined) return '';
              const regex = /\$(.*?)\)/g;
              let result = value.match(regex);
              let haveTooltip = false;
              let toolTipDescription = false;
              if(result !== null) {
                haveTooltip = true;
                toolTipDescription = value;
                for (const oldValue of result) {
                  let newValue = oldValue.replace('$(',`<strong style="color:#006BB4">`);
                  newValue = newValue.replace(')', ' </strong>');
                  value = value.replace(oldValue, newValue);
                }
              }
              return (
              <div>
                {haveTooltip === false ?
                <span dangerouslySetInnerHTML={{ __html: value}} /> :
                <EuiToolTip position="bottom" content={toolTipDescription}>
                  <span dangerouslySetInnerHTML={{ __html: value}} />
                </EuiToolTip>
                }
              </div>
              );
            }
          },
          {
            field: 'groups',
            name: '组',
            align: 'left',
            sortable: false,
            width: '10%'
          },
          {
            name: '合规性',
            render: this.buildComplianceBadges
          },
          {
            field: 'level',
            name: '等级',
            align: 'left',
            sortable: true,
            width: '5%'
          },
          {
            field: 'filename',
            name: '文件',
            align: 'left',
            sortable: true,
            width: '15%',
            render: (value, item) => {
              return (
                <WzButtonPermissions
                  buttonType='link'
                  permissions={getReadButtonPermissions(item)}
                  tooltip={{position:'top', content: `显示${value}内容`}}
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    const rulesetHandler = new RulesetHandler(RulesetResources.RULES);
                    const result = await rulesetHandler.getFileContent(value);
                    const file = { name: value, content: result, path: item.relative_dirname };
                    this.tableProps.updateFileContent(file);
                  }}>
                  {value}
                </WzButtonPermissions>
              );
            }
          },
          {
            field: 'relative_dirname',
            name: '路径',
            align: 'left',
            sortable: true,
            width: '10%'
          }
        ],
        decoders: [
          {
            field: 'name',
            name: '名称',
            align: 'left',
            sortable: true
          },
          {
            field: 'details.program_name',
            name: '程序名称',
            align: 'left',
            sortable: false
          },
          {
            field: 'details.order',
            name: '命令',
            align: 'left',
            sortable: false
          },
          {
            field: 'filename',
            name: '文件',
            align: 'left',
            sortable: true,
            render: (value, item) => {
              return (
                <WzButtonPermissions
                  buttonType='link'
                  permissions={getReadButtonPermissions(item)}
                  tooltip={{position:'top', content: `显示${value}内容`}}
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    const rulesetHandler = new RulesetHandler(RulesetResources.DECODERS);
                    const result = await rulesetHandler.getFileContent(value);
                    const file = { name: value, content: result, path: item.relative_dirname };
                    this.tableProps.updateFileContent(file);
                  }}>
                    {value}
                </WzButtonPermissions>
              );
            }
          },
          {
            field: 'relative_dirname',
            name: '路径',
            align: 'left',
            sortable: true
          }
        ],
        lists: [
          {
            field: 'filename',
            name: '名称',
            align: 'left',
            sortable: true
          },
          {
            field: 'relative_dirname',
            name: '路径',
            align: 'left',
            sortable: true
          },
          {
            name: '操作',
            align: 'left',
            render: (item) => (
              <EuiToolTip position="top" content={`导出${item.filename}`}>
                <EuiButtonIcon
                  aria-label="导出列表"
                  iconType="exportAction"
                  onClick={async ev => {
                    ev.stopPropagation();
                    await exportCsv(`/lists?path=${item.relative_dirname}/${item.filename}`, [{_isCDBList: true, name: 'path', value: `${item.relative_dirname}/${item.filename}`}], item.filename)
                  }}
                  color="primary"
                />
              </EuiToolTip>
            )
          }
        ],
        files: [
          {
            field: 'filename',
            name: '文件',
            align: 'left',
            sortable: true
          },
          {
            name: '操作',
            align: 'left',
            render: item => {
              if (item.relative_dirname.startsWith('ruleset/')) {
                return (
                  <WzButtonPermissions
                    buttonType='icon'
                    permissions={getReadButtonPermissions(item)}
                    aria-label="显示内容"
                    iconType="eye"
                    tooltip={{position: 'top', content:`查看${item.filename}的内容`}}
                    onClick={async ev => {
                      ev.stopPropagation();
                      const rulesetHandler = new RulesetHandler(this.tableProps.state.section);
                      const result = await rulesetHandler.getFileContent(item.filename);
                      const file = { name: item.filename, content: result, path: item.relative_dirname };
                      this.tableProps.updateFileContent(file);
                    }}
                    color="primary"
                  />
                );
              } else {
                return (
                  <div>
                    <WzButtonPermissions
                      buttonType='icon'
                      permissions={getEditButtonPermissions(item)}
                      aria-label="编辑内容"
                      iconType="pencil"
                      tooltip={{position: 'top', content:`编辑${item.filename}内容`}}
                      onClick={async ev => {
                        ev.stopPropagation();
                        const rulesetHandler = new RulesetHandler(this.tableProps.state.section);
                        const result = await rulesetHandler.getFileContent(item.filename);
                        const file = { name: item.filename, content: result, path: item.relative_dirname };
                        this.tableProps.updateFileContent(file);
                      }}
                      color="primary"
                    />
                    <WzButtonPermissions
                      buttonType='icon'
                      permissions={getDeleteButtonPermissions(item)}
                      aria-label="删除文件"
                      iconType="trash"
                      tooltip={{position: 'top', content:`删除${item.filename}文件`}}
                      onClick={ev => {
                        ev.stopPropagation();
                        this.tableProps.updateListItemsForRemove([item]);
                        this.tableProps.updateShowModal(true);
                      }}
                      color="danger"
                    />
                  </div>
                );
              }
            }
          }
        ]
      };

      const getReadButtonPermissions = (item) => {
        const { section } = this.tableProps.state;
        const { permissionResource } = resourceDictionary[section];
        return [
          {
            action: `${section}:read`,
            resource: permissionResource(item.filename),
          },
        ];
      };

      const getEditButtonPermissions = (item) => {
        const { section } = this.tableProps.state;
        const { permissionResource } = resourceDictionary[section];
        return [
          {
            action: `${section}:read`,
            resource: permissionResource(item.filename),
          },
          { action: `${section}:update`, resource: permissionResource(item.filename) },
        ];
      };

      const getDeleteButtonPermissions = (item) => {
        const { section } = this.tableProps.state;
        const { permissionResource } = resourceDictionary[section];
        return [
          {
            action: `${section}:delete`,
            resource: permissionResource(item.filename),
          },
        ];
      };

      this.columns.lists[2] =
        {
          name: '操作',
          align: 'left',
          render: item => {
            const defaultItems = this.tableProps.state.defaultItems;
            return (
              <div>
                <WzButtonPermissions
                  buttonType='icon'
                  permissions={getEditButtonPermissions(item)}
                  aria-label="编辑内容"
                  iconType="pencil"
                  tooltip={{position: 'top', content: `编辑${item.filename}内容`}}
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    const rulesetHandler = new RulesetHandler(this.tableProps.state.section);
                    const result = await rulesetHandler.getFileContent(item.filename);
                    const file = { name: item.filename, content: result, path: item.relative_dirname };
                    this.tableProps.updateListContent(file);
                  }}
                  color="primary"
                />
                <WzButtonPermissions
                  buttonType='icon'
                  permissions={getDeleteButtonPermissions(item)}
                  aria-label="删除文件"
                  iconType="trash"
                  tooltip={{position: 'top', content:(defaultItems.indexOf(`${item.relative_dirname}`) === -1) ? `删除${item.filename}` : `${item.filename}列表不能删除`}}
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    this.tableProps.updateListItemsForRemove([item]);
                    this.tableProps.updateShowModal(true);
                  }}
                  color="danger"
                  isDisabled={defaultItems.indexOf(`${item.relative_dirname}`) !== -1}
                />
                <WzButtonPermissions
                  buttonType='icon'
                  permissions={getReadButtonPermissions(item)}
                  aria-label="导出列表"
                  iconType="exportAction"
                  tooltip={{position: 'top', content: `导出${item.filename}内容`}}
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    await exportCsv(`/lists`, [{_isCDBList: true, name: 'filename', value: `${item.filename}`}], item.filename)
                  }}
                  color="primary"
                />
              </div>
            )
          }
        }
      };


    this.buildColumns();
  }

  buildComplianceBadges(item) {
    const badgeList = [];
    const fields = ['pci_dss', 'gpg13', 'hipaa', 'gdpr', 'nist_800_53', 'tsc', 'mitre'];
    const buildBadge = field => {
      const idGenerator = () => {
        return (
          '_' +
          Math.random()
            .toString(36)
            .substr(2, 9)
        );
      };

      return (
        <EuiToolTip
          content={item[field].join(', ')}
          key={idGenerator()}
          position="bottom"
        >
          <EuiBadge
            title={null}
            color="hollow"
            onClick={ev => ev.stopPropagation()}
            onClickAriaLabel={field.toUpperCase()}
            style={{ margin: '1px 2px' }}
          >
            {field.toUpperCase()}
          </EuiBadge>
        </EuiToolTip>
      );
    };
    try {
      for (const field of fields) {
        if (item[field].length) {
          badgeList.push(buildBadge(field));
        }
      }
    } catch (error) {}

    return <div>{badgeList}</div>;
  }
}
