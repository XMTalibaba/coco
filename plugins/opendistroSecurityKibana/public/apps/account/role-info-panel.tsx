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
  EuiModal,
  EuiModalBody,
  EuiOverlayMask,
  EuiText,
  EuiTitle,
  EuiHorizontalRule,
  EuiSpacer,
} from '@elastic/eui';
import React, { useCallback } from 'react';
import { CoreStart } from 'kibana/public';
import { fetchAccountInfo } from './utils';

export function RoleInfoPanel(props: { coreStart: CoreStart; handleClose: () => void }) {
  const [roles, setRoles] = React.useState<string[]>([]);
  const [backendRoles, setBackendRoles] = React.useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const accountInfo = await fetchAccountInfo(props.coreStart.http);
      setRoles(accountInfo?.data.roles || []);
      setBackendRoles(accountInfo?.data.backend_roles || []);
    } catch (e) {
      console.log(e);
    }
  }, [props.coreStart.http]);

  React.useEffect(() => {
    fetchData();
  }, [props.coreStart.http, fetchData]);

  return (
    <EuiOverlayMask>
      <EuiModal data-test-subj="role-info-modal" onClose={props.handleClose}>
        <EuiSpacer />
        <EuiModalBody>
          <EuiTitle>
            <h4>角色 ({roles.length})</h4>
          </EuiTitle>
          <EuiText color="subdued">
            管理员当前映射到的角色。
          </EuiText>
          <EuiSpacer />
          {roles.map((item) => (
            <EuiText key={item}>
              {item}
              <br />
            </EuiText>
          ))}
          <EuiHorizontalRule />
          <EuiTitle>
            <h4>后端角色 ({backendRoles.length})</h4>
          </EuiTitle>
          <EuiText color="subdued">
            管理员当前映射到的后端角色。
          </EuiText>
          <EuiSpacer />
          {backendRoles.map((item) => (
            <EuiText key={item}>
              {item}
              <br />
            </EuiText>
          ))}
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  );
}
