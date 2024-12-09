
import React, { useState, useEffect } from 'react';
import {
    EuiInMemoryTable,
    EuiBadge,
    EuiFlexGroup,
    EuiFlexItem,
    EuiToolTip,
    EuiButtonIcon,
    EuiSpacer,
    EuiLoadingSpinner
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { ErrorHandler } from '../../../react-services/error-handler';
import { WzButtonModalConfirm } from '../../common/buttons';
import { WzAPIUtils } from '../../../react-services/wz-api-utils';

export const RolesTable = ({roles, policiesData, loading, editRole, updateRoles}) => {
   
    const getRowProps = item => {
        const { id } = item;
        return {
          'data-test-subj': `row-${id}`,
        //   onClick: () => editRole(item),
        };
      };

    const columns = [
        // {
        //     field: 'id',
        //     name: 'ID',
        //     width: 75,
        //     sortable: true,
        //     truncateText: true,
        // },
        {
            field: 'name',
            name: '名称',
            width: 200,
            sortable: true,
            truncateText: true,
        },
        {
            field: 'policies',
            name: '策略',
            render: policies => {
                return policiesData && <EuiFlexGroup
                    wrap
                    responsive={false}
                    gutterSize="xs">
                    {policies.map(policy => {
                        const data = ((policiesData || []).find(x => x.id === policy) || {});
                        return data.name && <EuiFlexItem grow={false} key={policy}>
                            <EuiToolTip
                                position="top"
                                content={
                                    <div>
                                        <b>操作</b>
                                        <p>{((data.policy || {}).actions || []).join(", ")}</p>
                                        <EuiSpacer size="s" />
                                        <b>资源</b>
                                        <p>{((data.policy || {}).resources || []).join(", ")}</p>
                                        <EuiSpacer size="s" />
                                        <b>效果</b>
                                        <p>{(data.policy || {}).effect}</p>
                                    </div>
                                }>
                                <EuiBadge color="hollow" onClick={() => {}} onClickAriaLabel={`${data.name} policy`} title={null}>{
                                    data.name
                                }</EuiBadge>
                            </EuiToolTip>
                        </EuiFlexItem>;
                    })}
                </EuiFlexGroup> ||
                    <EuiLoadingSpinner size="m" />
            },
            sortable: true,
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
        // {
        //   align: 'right',
        //   width: '5%',
        //   name: '操作',
        //   render: item => (
        //     <div onClick={ev => ev.stopPropagation()}>
        //         <WzButtonModalConfirm
        //         buttonType='icon'
        //         tooltip={{content: WzAPIUtils.isReservedID(item.id) ? "不能删除保留角色" : '删除角色', position: 'left'}}
        //         isDisabled={WzAPIUtils.isReservedID(item.id)}
        //         modalTitle={`确认删除${item.name}角色吗？`}
        //         onConfirm={async () => {
        //             try{
        //                 const response = await WzRequest.apiReq(
        //                 'DELETE',
        //                 `/security/roles/`,
        //                 {
        //                     params: {
        //                         role_ids: item.id
        //                     }
        //                 }
        //             );                    
        //             const data = (response.data || {}).data;
        //             if (data.failed_items && data.failed_items.length){
        //                 return;
        //             }
        //             ErrorHandler.info('角色删除成功');
        //             await updateRoles();
        //         }catch(error){}
        //         }}
        //         modalProps={{buttonColor: 'danger'}}
        //         iconType='trash'
        //         color='danger'
        //         aria-label='删除角色'
        //         modalCancelText="取消"
        //         modalConfirmText="确认"
        //         />
        //     </div>
        //     )
        // }
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
            items={roles}
            columns={columns}
            search={search}
            pagination={true}
            rowProps={getRowProps}
            loading={loading}
            sorting={sorting}
            noItemsMessage="无数据"
        />
    );
};