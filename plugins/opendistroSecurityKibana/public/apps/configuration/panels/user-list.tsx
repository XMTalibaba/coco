/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiText,
  EuiTitle,
  Query,
  EuiTextColor,
} from '@elastic/eui';
import { Dictionary, difference, isEmpty, map } from 'lodash';
import React, { useState } from 'react';
import { getAuthInfo } from '../../../utils/auth-info-utils';
import { AppDependencies } from '../../types';
import { API_ENDPOINT_INTERNALUSERS, DocLinks } from '../constants';
import { Action, ResourceType } from '../types';
import { EMPTY_FIELD_VALUE } from '../ui-constants';
import { useContextMenuState } from '../utils/context-menu';
import { useDeleteConfirmState } from '../utils/delete-confirm-modal-utils';
import { ExternalLink, tableItemsUIProps, truncatedListView } from '../utils/display-utils';
import {
  getUserList,
  InternalUsersListing,
  requestDeleteUsers,
} from '../utils/internal-user-list-utils';
import { showTableStatusMessage } from '../utils/loading-spinner-utils';
import { buildHashUrl } from '../utils/url-builder';

export function dictView(items: Dictionary<string>) {
  if (isEmpty(items)) {
    return EMPTY_FIELD_VALUE;
  }
  return (
    <EuiFlexGroup direction="column" style={{ margin: '1px' }}>
      {map(items, (v, k) => (
        <EuiText key={k} className={tableItemsUIProps.cssClassName}>
          {k}: {`"${v}"`}
        </EuiText>
      ))}
    </EuiFlexGroup>
  );
}

export function getColumns(currentUsername: string, isAdminuser: boolean) {
  return [
    // {
    //   field: 'username',
    //   name: '用户名',
    //   render: (username: string) => (
    //     <>
    //       <a href={buildHashUrl(ResourceType.users, Action.edit, username)}>{username}</a>
    //       {username === currentUsername && (
    //         <>
    //           &nbsp;
    //           <EuiBadge>当前用户</EuiBadge>
    //         </>
    //       )}
    //     </>
    //   ),
    //   sortable: true,
    // },
    {
      field: '',
      name: '用户名',
      render: (item: any) => (
        <>
          {(!isAdminuser || item.backend_roles.indexOf('admin') === -1) && (
            <a href={buildHashUrl(ResourceType.users, Action.edit, item.username)}>{item.username}</a>
          )}
          {isAdminuser && item.backend_roles.indexOf('admin') !== -1 && (
            <span>{item.username}</span>
          )}
          {item.username === currentUsername && (
            <>
              &nbsp;
              <EuiBadge>当前用户</EuiBadge>
            </>
          )}
        </>
      ),
      sortable: true,
    },
    {
      field: 'backend_roles',
      name: '后端角色',
      render: truncatedListView(tableItemsUIProps),
    },
    {
      field: 'attributes',
      name: '属性',
      render: dictView,
      truncateText: true,
    },
  ];
}

export function UserList(props: AppDependencies) {
  const [userData, setUserData] = React.useState<InternalUsersListing[]>([]);
  const [errorFlag, setErrorFlag] = React.useState(false);
  const [selection, setSelection] = React.useState<InternalUsersListing[]>([]);
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<Query | null>(null);
  const [isAdminuser, setIsAdminuser] = useState(false);

  React.useEffect(() => {   
    initUserType();
  }, []);

  const initUserType = async () => {
    let res = await props.coreStart.http.get('/api/v1/configuration/account');
    if (res.data.backend_roles.indexOf('adminuser') !== -1) { // 用户管理员
      setIsAdminuser(true);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userDataPromise = getUserList(props.coreStart.http);
        setCurrentUsername((await getAuthInfo(props.coreStart.http)).user_name);
        setUserData(await userDataPromise);
      } catch (e) {
        console.log(e);
        setErrorFlag(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props.coreStart.http]);

  const handleDelete = async () => {
    const usersToDelete: string[] = selection.map((r) => r.username);
    try {
      await requestDeleteUsers(props.coreStart.http, usersToDelete);
      // Refresh from server (calling fetchData) does not work here, the server still return the users
      // that had been just deleted, probably because ES takes some time to sync to all nodes.
      // So here remove the selected users from local memory directly.
      setUserData(difference(userData, selection));
      setSelection([]);
    } catch (e) {
      console.log(e);
    } finally {
      closeActionsMenu();
    }
  };

  const [showDeleteConfirmModal, deleteConfirmModal] = useDeleteConfirmState(
    handleDelete,
    '用户'
  );

  const actionsMenuItems = [
    <EuiButtonEmpty
      data-test-subj="edit"
      key="edit"
      onClick={() => {
        window.location.href = buildHashUrl(ResourceType.users, Action.edit, selection[0].username);
      }}
      disabled={selection.length !== 1}
    >
      编辑
    </EuiButtonEmpty>,
    <EuiButtonEmpty
      data-test-subj="duplicate"
      key="duplicate"
      onClick={() => {
        window.location.href = buildHashUrl(
          ResourceType.users,
          Action.duplicate,
          selection[0].username
        );
      }}
      disabled={selection.length !== 1}
    >
      复制
    </EuiButtonEmpty>,
    <EuiButtonEmpty
      key="export"
      disabled={selection.length !== 1}
      href={
        selection.length === 1
          ? `${props.coreStart.http.basePath.serverBasePath}${API_ENDPOINT_INTERNALUSERS}/${selection[0].username}`
          : ''
      }
      target="_blank"
    >
      导出JSON
    </EuiButtonEmpty>,
    <EuiButtonEmpty
      key="delete"
      color="danger"
      onClick={showDeleteConfirmModal}
      disabled={selection.length === 0 || selection.some((e) => e.username === currentUsername)}
    >
      删除
    </EuiButtonEmpty>,
  ];

  const [actionsMenu, closeActionsMenu] = useContextMenuState('操作', {}, actionsMenuItems);

  return (
    <>
      {/* <EuiPageHeader>
        <EuiTitle size="l">
          <h1>登录用户</h1>
        </EuiTitle>
      </EuiPageHeader> */}
      <EuiPageContent>
        <EuiPageContentHeader>
          {/* <EuiPageContentHeaderSection>
            <EuiTitle size="s">
              <h3>
              用户列表
                <span className="panel-header-count">
                  {' '}
                  ({Query.execute(query || '', userData).length})
                </span>
              </h3>
            </EuiTitle>
            <EuiText size="xs" color="subdued"> */}
              {/* 安全管理功能包含一个内部用户数据库。使用此数据库代替或补充外部身份验证系统(如LDAP服务器或活动目录)。您可以从{' '}
              <EuiLink href={buildHashUrl(ResourceType.roles)}>角色管理</EuiLink>
              将一个内部用户映射到一个角色。首先，单击角色的详细信息页面。然后，在“映射用户”下，点击“管理映射”
              <ExternalLink href={DocLinks.MapUsersToRolesDoc} /> */}
              {/* 用户管理功能包含一个登录用户数据库。使用此数据库代替或补充外部身份验证系统(如LDAP服务器或活动目录)。您可以从{' '}
              系统控制-角色映射页面中将一个内部用户映射到一个角色。
            </EuiText>
          </EuiPageContentHeaderSection> */}
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h3>
                  {`用户列表 (${Query.execute(query || '', userData).length})`}
                </h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTextColor color="subdued">{'登录用户管理。'}</EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiPageContentHeaderSection>
            <EuiFlexGroup>
              <EuiFlexItem>{actionsMenu}</EuiFlexItem>
              <EuiFlexItem>
                {/* <EuiButton fill href={buildHashUrl(ResourceType.users, Action.create)}>
                  创建登录用户
                </EuiButton> */}
                <EuiButton
                  size="s"
                  href={buildHashUrl(ResourceType.users, Action.create)}
                >
                  创建登录用户
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageContentHeaderSection>
        </EuiPageContentHeader>
        <EuiPageBody>
          <EuiInMemoryTable
            tableLayout={'auto'}
            loading={userData === [] && !errorFlag}
            columns={getColumns(currentUsername, isAdminuser)}
            // @ts-ignore
            items={userData}
            itemId={'username'}
            pagination
            search={{
              box: { placeholder: '搜索登录用户' },
              onChange: (arg) => {
                setQuery(arg.query);
                return true;
              },
            }}
            // @ts-ignore
            selection={{ 
              onSelectionChange: setSelection,
              selectable: (item) => !isAdminuser || item.backend_roles.indexOf('admin') === -1
            }}
            sorting
            error={errorFlag ? '加载数据失败，请查看控制台日志了解更多细节。' : ''}
            message={showTableStatusMessage(loading, userData)}
          />
        </EuiPageBody>
        {deleteConfirmModal}
      </EuiPageContent>
    </>
  );
}
