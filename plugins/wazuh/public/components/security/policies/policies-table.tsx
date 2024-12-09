
import React, { useState, useEffect } from 'react';
import {
    EuiInMemoryTable,
    EuiBadge,
    EuiToolTip,
    EuiButtonIcon
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { ErrorHandler } from '../../../react-services/error-handler';
import { WzAPIUtils } from '../../../react-services/wz-api-utils';
import { WzButtonModalConfirm } from '../../common/buttons';

export const PoliciesTable = ({policies, loading, editPolicy, updatePolicies}) => {

    const getRowProps = item => {
        const { id } = item;
        return {
          'data-test-subj': `row-${id}`,
          onClick: () => editPolicy(item),
        };
      };


    const columns = [
        {
            field: 'id',
            name: 'ID',
            width: 75,
            sortable: true,
            truncateText: true,
        },
        {
            field: 'name',
            name: '名称',
            sortable: true,
            truncateText: true,
        },
        {
            field: 'policy.actions',
            name: '操作',
            sortable: true,
            render: actions => {
                return (actions || []).join(", ")
            },
            truncateText: true,
        },
        {
            field: 'policy.resources',
            name: '资源',
            sortable: true,
            truncateText: true,
        },
        {
            field: 'policy.effect',
            name: '效果',
            sortable: true,
            truncateText: true,
        },
        {
            field: 'id',
            name: '状态',
            render: (item) => {
                return WzAPIUtils.isReservedID(item) && <EuiBadge color="primary" >保留</EuiBadge>
            },
            width: 150,
            sortable: false,
        },
        {
          align: 'right',
          width: '5%',
          name: '操作',
          render: item => (
            <div onClick={ev => ev.stopPropagation()}>
                <WzButtonModalConfirm
                buttonType='icon'
                tooltip={{content: WzAPIUtils.isReservedID(item.id) ? "不能删除保留策略" : '删除策略', position: 'left'}}
                isDisabled={WzAPIUtils.isReservedID(item.id)}
                modalTitle={`确认删除${item.name}策略吗？`}
                onConfirm={async () => {
                    try{
                        const response = await WzRequest.apiReq(
                        'DELETE',
                        `/security/policies/`,
                        {
                            params: {
                                policy_ids: item.id
                            }
                        }
                    );                    
                    const data = (response.data || {}).data;
                    if (data.failed_items && data.failed_items.length){
                        return;
                    }
                    ErrorHandler.info('成功删除策略');
                    await updatePolicies();
                }catch(error){
                    ErrorHandler.handle(error, '删除策略出错');
                }
                }}
                modalProps={{buttonColor: 'danger'}}
                iconType='trash'
                color='danger'
                aria-label='删除策略'
                modalCancelText="取消"
                modalConfirmText="确认"
          />
            </div>
            )
        }
    ];

    const sorting = {
        sort: {
            field: 'id',
            direction: 'asc',
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
            items={policies}
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