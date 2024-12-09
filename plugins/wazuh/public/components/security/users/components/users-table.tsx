import React from 'react';
import {
  EuiInMemoryTable,
  EuiBadge,
  EuiFlexGroup,
  EuiLoadingSpinner,
  EuiFlexItem,
  EuiBasicTableColumn,
  SortDirection,
} from '@elastic/eui';
import { WzButtonModalConfirm } from '../../../common/buttons';
import UsersServices from '../services';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { WzAPIUtils } from '../../../../react-services/wz-api-utils';

export const UsersTable = ({ users, editUserFlyover, rolesLoading, roles, onSave }) => {
  const getRowProps = item => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      onClick: () => editUserFlyover(item),
    };
  };

  const columns: EuiBasicTableColumn<any>[] = [
    {
      field: 'username',
      name: '用户',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'allow_run_as',
      name: '允许运行 ',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'roles',
      name: '角色',
      dataType: 'boolean',
      render: userRoles => {
        if (rolesLoading) {
          return <EuiLoadingSpinner size="m" />;
        }
        if (!userRoles || !userRoles.length) return <></>;
        const tmpRoles = userRoles.map((userRole, idx) => {
          return (
            <EuiFlexItem grow={false} key={idx}>
              <EuiBadge color="secondary">{roles[userRole]}</EuiBadge>
            </EuiFlexItem>
          );
        });
        return (
          <EuiFlexGroup wrap responsive={false} gutterSize="xs">
            {tmpRoles}
          </EuiFlexGroup>
        );
      },
      sortable: true,
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
              content: WzAPIUtils.isReservedID(item.id) ? "不能删除保留用户" : '删除用户',
              position: 'left',
            }}
            isDisabled={WzAPIUtils.isReservedID(item.id)}
            modalTitle={`确认删除${item.username}用户吗？`}
            onConfirm={async () => {
              try {
                await UsersServices.DeleteUsers([item.id]);
                ErrorHandler.info('用户删除成功');
                onSave();
              } catch (err) {
                ErrorHandler.handle(err, '删除用户时出错');
              }
            }}
            modalProps={{ buttonColor: 'danger' }}
            iconType="trash"
            color="danger"
            aria-label="删除用户"
            modalCancelText="取消"
            modalConfirmText="确认"
          />
        </div>
      ),
    },
  ];

  const sorting = {
    sort: {
      field: 'username',
      direction: SortDirection.ASC,
    },
  };

  const search = {
    box: {
      incremental: false,
      schema: true,
    },
  };

  return (
    <EuiInMemoryTable
      items={users}
      columns={columns}
      search={search}
      rowProps={getRowProps}
      pagination={true}
      sorting={sorting}
    />
  );
};
