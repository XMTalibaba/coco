/*
 * Wazuh app - Prompt component with the user required permissions and/or roles
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Fragment } from 'react';
import { useUserPermissionsRequirements } from '../hooks/useUserPermissions';
import { useUserRolesRequirements } from '../hooks/useUserRoles';
import { EuiEmptyPrompt, EuiSpacer, EuiPanel } from '@elastic/eui';
import { TUserPermissions, TUserPermissionsFunction, TUserRoles, TUserRolesFunction } from '../permissions/button';
import { WzPermissionsFormatted } from './format';

interface IEmptyPromptNoPermissions{
  permissions?: TUserPermissions
  roles?: TUserRoles
  actions?: React.ReactNode
}

export const WzEmptyPromptNoPermissions = ({permissions, roles, actions}: IEmptyPromptNoPermissions) => {
  const prompt = (<EuiEmptyPrompt
    iconType="securityApp"
    title={<h2>您没有权限</h2>}
    body={
      <Fragment>
        {permissions && (
          <div>
            本部分要求 {permissions.length > 1 ? '许可' : '许可'}:
            {WzPermissionsFormatted(permissions)}
          </div>
        )}
        {permissions && roles && (<EuiSpacer />)}
        {roles && (
          <div>
            本部分要求 {roles.map(role => (<strong key={`empty-prompt-no-roles-${role}`}>{role}</strong>)).reduce((accum, cur) => [accum, ', ', cur])} {roles.length > 1 ? '角色' : '角色'}
          </div>
        )}
      </Fragment>
    }
    actions={actions}
  />)
  return (
  // <EuiPanel>{prompt}</EuiPanel>
  prompt
  )
}

interface IPromptNoPermissions{
  permissions?: TUserPermissions | TUserPermissionsFunction
  roles?: TUserRoles | TUserRolesFunction
  children?: React.ReactNode
  rest?: any
}

export const WzPromptPermissions = ({permissions = null, roles = null, children, ...rest} : IPromptNoPermissions) => {
  const [userPermissionRequirements, userPermissions] = useUserPermissionsRequirements(typeof permissions === 'function' ? permissions(rest) : permissions);
  const [userRolesRequirements, userRoles] = useUserRolesRequirements(typeof roles === 'function' ? roles(rest) : roles);

  return (userPermissionRequirements || userRolesRequirements) ? <WzEmptyPromptNoPermissions permissions={userPermissionRequirements} roles={userRolesRequirements} /> : children;
}