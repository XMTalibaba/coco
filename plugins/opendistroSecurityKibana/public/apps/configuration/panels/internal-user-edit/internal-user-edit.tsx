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
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiGlobalToastList,
  EuiPageHeader,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { useState } from 'react';
import { BreadcrumbsPageDependencies } from '../../../types';
import { InternalUserUpdate, ResourceType } from '../../types';
import { getUserDetail, updateUser } from '../../utils/internal-user-detail-utils';
import { PanelWithHeader } from '../../utils/panel-with-header';
import { PasswordEditPanel } from '../../utils/password-edit-panel';
import {
  createErrorToast,
  createUnknownErrorToast,
  useToastState,
  getSuccessToastMessage,
} from '../../utils/toast-utils';
import { buildHashUrl, buildUrl } from '../../utils/url-builder';
import { AttributePanel, buildAttributeState, unbuildAttributeState } from './attribute-panel';
import { UserAttributeStateClass } from './types';
import { setCrossPageToast } from '../../utils/storage-utils';
import { ExternalLink } from '../../utils/display-utils';
import { generateResourceName } from '../../utils/resource-utils';
import { NameRow } from '../../utils/name-row';
import { DocLinks } from '../../constants';
import { constructErrorMessageAndLog } from '../../../error-utils';
import { BackendRolePanel } from './backend-role-panel';

interface InternalUserEditDeps extends BreadcrumbsPageDependencies {
  action: 'create' | 'edit' | 'duplicate';
  // For creation, sourceUserName should be empty string.
  // For editing, sourceUserName should be the name of the user to edit.
  // For duplication, sourceUserName should be the name of the user to copy from.
  sourceUserName: string;
}

const TITLE_TEXT_DICT = {
  create: '创建登录用户',
  edit: '编辑登录用户',
  duplicate: '复制的登录用户',
};

export function InternalUserEdit(props: InternalUserEditDeps) {
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState<boolean>(false);
  const [attributes, setAttributes] = useState<UserAttributeStateClass[]>([]);
  const [backendRoles, setBackendRoles] = useState<string[]>([]);
  const [passwordRuleId, setPasswordRuleId] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<string>('8');

  const [toasts, addToast, removeToast] = useToastState();

  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  
  const [isAdminuser, setIsAdminuser] = useState(false);

  React.useEffect(() => {   
    initUserType();
    initPasswordConfig();
  }, []);

  const initUserType = async () => {
    let res = await props.coreStart.http.get('/api/v1/configuration/account');
    if (res.data.backend_roles.indexOf('adminuser') !== -1) { // 用户管理员
      setIsAdminuser(true);
    }
  };

  const initPasswordConfig = async () => {
    // 获取登录参数，查询密码规则ID
    const paramsConfig = await props.coreStart.http.post('/api/request', { body: JSON.stringify({ method: 'GET', id: 'default', body: {}, path: `/manager/webloggingconfig?pretty=true` })});
    const params = (
      (paramsConfig || {}).data || {}
    ).affected_items[0];
    setPasswordRuleId(params.passwordrules);
    setPasswordLength(params.pwdlen);
  }

  React.useEffect(() => {
    const action = props.action;
    if (action === 'edit' || action === 'duplicate') {
      const fetchData = async () => {
        try {
          const user = await getUserDetail(props.coreStart.http, props.sourceUserName);
          setAttributes(buildAttributeState(user.attributes));
          setBackendRoles(user.backend_roles);
          setUserName(generateResourceName(action, props.sourceUserName));
        } catch (e) {
          addToast(createUnknownErrorToast('fetchUser', 'load data'));
          console.error(e);
        }
      };

      fetchData();
    }
  }, [addToast, props.action, props.coreStart.http, props.sourceUserName]);

  const updateUserHandler = async () => {
    try {
      if (isPasswordInvalid) {
        addToast(createErrorToast('passwordInvalid', '保存失败', '密码不匹配。'));
        return;
      }

      if (password === '' && props.action !== 'edit') {
        addToast(createErrorToast('emptyPassword', '保存失败', '密码是必需的。'));
        return;
      }

      if (backendRoles.indexOf('admin') !== -1) {
        addToast(createErrorToast('backendRolesInvalid', '保存失败', '后端角色不可设置admin。'));
        return;
      }

      // Remove attributes with empty key
      const validAttributes = attributes.filter((v: UserAttributeStateClass) => v.key !== '');

      const updateObject: InternalUserUpdate = {
        backend_roles: backendRoles,
        attributes: unbuildAttributeState(validAttributes),
      };

      // 密码规则验证
      const regexpOptions = {
        'upper': /[A-Z]/,
        'lower': /[a-z]/,
        'num': /[0-9]/,
        'spechar': new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？+-]")
      };
      let isCheck = true;
      passwordRuleId.split(',').map(k => {
        if (!regexpOptions[k].test(password)) {
          isCheck = false;
        }
      })

      if (password && (!isCheck || password.length < Number(passwordLength))) {
        addToast(createErrorToast('emptyPassword', '保存失败', '密码不符合规则。'));
        return
      }
      else if (password) {
        updateObject.password = password;
      }

      if (isAdminuser && updateObject.backend_roles.indexOf('admin') !== -1) {
        addToast(createErrorToast('emptyPassword', '保存失败', '用户管理员角色没有设置admin后端角色的权限。'));
        return
      }

      await updateUser(props.coreStart.http, userName, updateObject);

      setCrossPageToast(buildUrl(ResourceType.users), {
        id: 'updateUserSucceeded',
        color: 'success',
        title: getSuccessToastMessage('用户', props.action, userName),
      });
      // Redirect to user listing
      window.location.href = buildHashUrl(ResourceType.users);
    } catch (e) {
      addToast(
        createErrorToast('updateUserFailed', '保存失败', constructErrorMessageAndLog(e, ''))
      );
    }
  };

  return (
    <>
      {props.buildBreadcrumbs(TITLE_TEXT_DICT[props.action])}
      {/* <EuiSpacer /> */}
      {/* <EuiPageHeader>
        <EuiFlexGroup direction="column" gutterSize="xs">
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>{TITLE_TEXT_DICT[props.action]}</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="xs" color="subdued"> */}
              {/* 安全插件包括一个内部用户数据库。使用此数据库代替或补充外部身份验证系统(如LDAP或Active Directory)。 */}
              {/* 用户管理功能包含一个登录用户数据库。使用此数据库代替或补充外部身份验证系统(如LDAP服务器或活动目录)。{' '} */}
              {/* <ExternalLink href={DocLinks.UsersAndRolesDoc} /> */}
            {/* </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageHeader> */}
      <PanelWithHeader headerText={`${TITLE_TEXT_DICT[props.action]}凭证`}>
        <EuiForm>
          <NameRow
            headerText="用户名"
            headerSubText="指定一个描述性的和唯一的用户名。一旦创建了用户，就不能编辑该名称。"
            resourceName={userName}
            resourceType="user"
            action={props.action}
            setNameState={setUserName}
            setIsFormValid={setIsFormValid}
          />
          <PasswordEditPanel updatePassword={setPassword} updateIsInvalid={setIsPasswordInvalid} passwordRuleId={passwordRuleId} passwordLength={passwordLength}/>
        </EuiForm>
      </PanelWithHeader>
      <EuiSpacer size="m" />
      <BackendRolePanel state={backendRoles} setState={setBackendRoles} />
      <EuiSpacer size="m" />
      {/* <AttributePanel state={attributes} setState={setAttributes} />
      <EuiSpacer size="m" /> */}
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            size='s'
            onClick={() => {
              window.location.href = buildHashUrl(ResourceType.users);
            }}
          >
            取消
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton id="submit" size='s' fill onClick={updateUserHandler} disabled={!isFormValid}>
            {props.action === 'edit' ? '保存修改' : '创建'}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiGlobalToastList toasts={toasts} toastLifeTimeMs={10000} dismissToast={removeToast} />
    </>
  );
}
