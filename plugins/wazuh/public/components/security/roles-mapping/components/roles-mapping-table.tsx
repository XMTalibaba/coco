import React from 'react';
import {
  EuiSpacer,
  EuiToolTip,
  EuiInMemoryTable,
  EuiBadge,
  EuiFlexItem,
  EuiFlexGroup,
  EuiBasicTableColumn,
  SortDirection,
} from '@elastic/eui';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { WzButtonModalConfirm } from '../../../common/buttons';
import { WzAPIUtils } from '../../../../react-services/wz-api-utils';
import RulesServices from '../../rules/services';

export const RolesMappingTable = ({ rolesEquivalences, rules, loading, editRule, updateRules }) => {
  const getRowProps = item => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      onClick: () => editRule(item),
    };
  };

  const columns: EuiBasicTableColumn<any>[] = [
    // {
    //   field: 'id',
    //   name: 'ID',
    //   width: '75',
    //   sortable: true,
    //   truncateText: true,
    // },
    {
      field: 'name',
      name: '名称',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'roles',
      name: '角色',
      sortable: true,
      render: item => {
        const tmpRoles = item.map((role, idx) => {
          return (
            <EuiFlexItem key={`role_${idx}`} grow={false}>
              <EuiBadge color="secondary">{rolesEquivalences[role]}</EuiBadge>
            </EuiFlexItem>
          );
        });
        return (
          <EuiFlexGroup wrap responsive={false} gutterSize="xs">
            {tmpRoles}
          </EuiFlexGroup>
        );
      },
      truncateText: true,
    },
    {
      field: 'id',
      name: '状态',
      render (item, obj){
        if(WzAPIUtils.isReservedID(item)){
          if( (obj.id === 1 || obj.id === 2)){
            return(
              <EuiFlexGroup>
              <EuiBadge color="primary">保留</EuiBadge>
                <EuiToolTip position="top" content="wui_规则属于wazuh-wui API用户">
                  <EuiBadge color="accent" title="" style={{ marginLeft: 10 }}>wazuh-wui</EuiBadge>
                </EuiToolTip>
              </EuiFlexGroup>
            );
          }
          else
            return <EuiBadge color="primary">保留</EuiBadge>;
        }
      },
      width: '300',
      sortable: false,
    },
    {
      align: 'right',
      width: '5%',
      name: '操作',
      render: item => (
        <div onClick={ev => ev.stopPropagation()}>
          <WzButtonModalConfirm
            buttonType="icon"
            tooltip={{
              content:
                WzAPIUtils.isReservedID(item.id) ? "保留角色映射无法删除" : '删除角色映射',
              position: 'left',
            }}
            isDisabled={WzAPIUtils.isReservedID(item.id)}
            modalTitle={`确认删除${item.name}角色映射吗？`}
            onConfirm={async () => {
              try {
                await RulesServices.DeleteRules([item.id]);
                ErrorHandler.info('角色映射已成功删除');
                updateRules();
              } catch (err) {
                ErrorHandler.handle(err, '删除角色映射时出错');
              }
            }}
            modalProps={{ buttonColor: 'danger' }}
            iconType="trash"
            color="danger"
            aria-label="删除角色映射"
            modalCancelText="取消"
            modalConfirmText="确认"
          />
        </div>
      ),
    },
  ];

  const sorting = {
    sort: {
      field: 'id',
      direction: SortDirection.ASC,
    },
  };

  const search = {
    box: {
      incremental: false,
      schema: true,
      placeholder: '过滤'
    },
  };

  return (
    <EuiInMemoryTable
      items={rules || []}
      columns={columns}
      search={search}
      rowProps={getRowProps}
      pagination={true}
      loading={loading}
      sorting={sorting}
      noItemsMessage="无数据"
    />
  );
};
