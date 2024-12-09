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
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiFormRow,
} from '@elastic/eui';
import { isEmpty } from 'lodash';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import {
  appendElementToArray,
  removeElementFromArray,
  updateElementInArrayHandler,
} from '../../utils/array-state-utils';
import { PanelWithHeader } from '../../utils/panel-with-header';
import { FormRow } from '../../utils/form-row';
import { DocLinks, LIMIT_WIDTH_INPUT_CLASS } from '../../constants';

function generateBackendRolesPanels(
  backendRoles: string[],
  setBackendRoles: Dispatch<SetStateAction<string[]>>
) {
  const panels = backendRoles.map((backendRole, arrayIndex) => {
    return (
      <Fragment key={`backend-role-${arrayIndex}`}>
        <EuiFlexGroup>
          <EuiFlexItem className={LIMIT_WIDTH_INPUT_CLASS}>
            <FormRow headerText={arrayIndex === 0 ? '后端角色' : ''}>
              <EuiFieldText
                id={`backend-role-${arrayIndex}`}
                value={backendRole}
                onChange={(e) =>
                  updateElementInArrayHandler(setBackendRoles, [arrayIndex])(e.target.value)
                }
                placeholder="输入后端角色"
              />
            </FormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace={arrayIndex === 0 ? true : false}>
              <EuiButton
                id={`backend-role-delete-${arrayIndex}`}
                size="s"
                color="danger"
                onClick={() => removeElementFromArray(setBackendRoles, [], arrayIndex)}
              >
                删除
              </EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  });
  return <>{panels}</>;
}

export function BackendRolePanel(props: {
  state: string[];
  setState: Dispatch<SetStateAction<string[]>>;
}) {
  const { state, setState } = props;
  // Show one empty row if there is no data.
  if (isEmpty(state)) {
    setState(['']);
  }
  return (
    <PanelWithHeader
      headerText="后端角色"
      headerSubText="后端角色用于将外部身份验证系统(如LDAP或SAML)的用户映射到Open Distro安全角色。"
      // helpLink={DocLinks.AttributeBasedSecurityDoc}
      optional
    >
      {generateBackendRolesPanels(state, setState)}
      <EuiSpacer />
      <EuiButton
        id="backend-role-add-row"
        size='s'
        onClick={() => {
          appendElementToArray(setState, [], '');
        }}
      >
        添加另一个后端角色
      </EuiButton>
    </PanelWithHeader>
  );
}
