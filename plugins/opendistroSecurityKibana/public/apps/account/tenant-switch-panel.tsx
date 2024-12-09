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
  EuiButtonEmpty,
  EuiCallOut,
  EuiCheckbox,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiOverlayMask,
  EuiRadioGroup,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from 'kibana/public';
import { keys } from 'lodash';
import React from 'react';
import { ClientConfigType } from '../../types';
import {
  RESOLVED_GLOBAL_TENANT,
  RESOLVED_PRIVATE_TENANT,
  resolveTenantName,
  selectTenant,
} from '../configuration/utils/tenant-utils';
import { fetchAccountInfo } from './utils';
import { constructErrorMessageAndLog } from '../error-utils';
import { getSavedTenant, setSavedTenant } from '../../utils/storage-utils';

interface TenantSwitchPanelProps {
  coreStart: CoreStart;
  handleClose: () => void;
  handleSwitchAndClose: () => void;
  config: ClientConfigType;
}

const GLOBAL_TENANT_KEY_NAME = 'global_tenant';
export const GLOBAL_TENANT_RADIO_ID = 'global';
export const PRIVATE_TENANT_RADIO_ID = 'private';
export const CUSTOM_TENANT_RADIO_ID = 'custom';

export function TenantSwitchPanel(props: TenantSwitchPanelProps) {
  const [tenants, setTenants] = React.useState<string[]>([]);
  const [username, setUsername] = React.useState<string>('');
  const [errorCallOut, setErrorCallOut] = React.useState<string>('');
  const [tenantSwitchRadioIdSelected, setTenantSwitchRadioIdSelected] = React.useState<string>();
  const [selectedCustomTenantOption, setSelectedCustomTenantOption] = React.useState<
    EuiComboBoxOptionOption[]
  >([]);

  // If saved tenant is present, set remember option to true
  const [rememberSelection, setRememberSelection] = React.useState<boolean>(
    Boolean(getSavedTenant())
  );

  const setCurrentTenant = (currentRawTenantName: string, currentUserName: string) => {
    const resolvedTenantName = resolveTenantName(currentRawTenantName, currentUserName);

    if (resolvedTenantName === RESOLVED_GLOBAL_TENANT) {
      setTenantSwitchRadioIdSelected(GLOBAL_TENANT_RADIO_ID);
    } else if (resolvedTenantName === RESOLVED_PRIVATE_TENANT) {
      setTenantSwitchRadioIdSelected(PRIVATE_TENANT_RADIO_ID);
    } else {
      setTenantSwitchRadioIdSelected(CUSTOM_TENANT_RADIO_ID);
      setSelectedCustomTenantOption([{ label: resolvedTenantName }]);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const accountInfo = await fetchAccountInfo(props.coreStart.http);
        const tenantsInfo = accountInfo.data.tenants || {};
        setTenants(keys(tenantsInfo));

        const currentUserName = accountInfo.data.user_name;
        setUsername(currentUserName);

        // @ts-ignore
        const currentRawTenantName = accountInfo.data.user_requested_tenant;
        setCurrentTenant(currentRawTenantName || '', currentUserName);
      } catch (e) {
        // TODO: switch to better error display.
        console.error(e);
      }
    };

    fetchData();
  }, [props.coreStart.http]);

  // Custom tenant super select related.
  const onCustomTenantChange = (selectedOption: EuiComboBoxOptionOption[]) => {
    setSelectedCustomTenantOption(selectedOption);
    setTenantSwitchRadioIdSelected(CUSTOM_TENANT_RADIO_ID);
    setErrorCallOut('');
  };
  const customTenantOptions = tenants
    .filter((tenant) => {
      return tenant !== GLOBAL_TENANT_KEY_NAME && tenant !== username;
    })
    .sort()
    .map((option: string) => ({
      label: option,
    }));

  const isMultiTenancyEnabled = props.config.multitenancy.enabled;
  const isGlobalEnabled = props.config.multitenancy.tenants.enable_global;
  const isPrivateEnabled = props.config.multitenancy.tenants.enable_private;

  const shouldDisableGlobal = !isGlobalEnabled || !tenants.includes(GLOBAL_TENANT_KEY_NAME);
  const getGlobalDisabledInstruction = () => {
    if (!isGlobalEnabled) {
      return '请联系管理员启用全局组员。';
    }

    if (!tenants.includes(GLOBAL_TENANT_KEY_NAME)) {
      return '请联系管理员获取全局组员的访问权限。';
    }
  };

  // The key for private tenant is the user name.
  const shouldDisablePrivate = !isPrivateEnabled || !tenants.includes(username);
  const getPrivateDisabledInstruction = () => {
    if (!isPrivateEnabled) {
      return '请联系管理员启用私有组员。';
    }

    if (!tenants.includes(username)) {
      return '请联系管理员获取私有组员的访问权限。';
    }
  };

  // Tenant switch radios related.
  const tenantSwitchRadios = [
    {
      id: GLOBAL_TENANT_RADIO_ID,
      label: (
        <>
          全局
          <EuiText size="s">全局组员由每个用户共享。</EuiText>
          {shouldDisableGlobal && <i>{getGlobalDisabledInstruction()}</i>}
          <EuiSpacer />
        </>
      ),
      disabled: shouldDisableGlobal,
    },
    {
      id: PRIVATE_TENANT_RADIO_ID,
      label: (
        <>
          私有
          <EuiText size="s">
            私有组员对每个用户是独占的，不能共享。您可以使用私有组员进行探索性工作。
          </EuiText>
          {shouldDisablePrivate && <i>{getPrivateDisabledInstruction()}</i>}
          <EuiSpacer />
        </>
      ),
      disabled: shouldDisablePrivate,
    },
    {
      id: CUSTOM_TENANT_RADIO_ID,
      label: <>自定义选择</>,
      disabled: customTenantOptions.length === 0,
    },
  ];

  const onTenantSwitchRadioChange = (radioId: string) => {
    setTenantSwitchRadioIdSelected(radioId);
    setErrorCallOut('');
  };

  const changeTenant = async (tenantName: string) => {
    await selectTenant(props.coreStart.http, {
      tenant: tenantName,
      username,
    });
  };

  const handleTenantConfirmation = async function () {
    let tenantName;

    if (tenantSwitchRadioIdSelected === GLOBAL_TENANT_RADIO_ID) {
      tenantName = '';
    } else if (tenantSwitchRadioIdSelected === PRIVATE_TENANT_RADIO_ID) {
      tenantName = '__user__';
    } else if (tenantSwitchRadioIdSelected === CUSTOM_TENANT_RADIO_ID) {
      if (selectedCustomTenantOption) {
        tenantName = selectedCustomTenantOption[0].label;
      }
    }

    // check tenant name before calling backend
    if (tenantName === undefined) {
      setErrorCallOut('没有指定目标组员!');
    } else {
      try {
        if (rememberSelection) {
          setSavedTenant(tenantName);
        } else {
          setSavedTenant(null);
        }

        await changeTenant(tenantName);
        props.handleSwitchAndClose();
      } catch (e) {
        setErrorCallOut(constructErrorMessageAndLog(e, '组员选择失败。'));
      }
    }
  };

  let content;

  if (isMultiTenancyEnabled) {
    content = (
      <>
        <EuiRadioGroup
          data-test-subj="tenant-switch-radios"
          options={tenantSwitchRadios}
          idSelected={tenantSwitchRadioIdSelected}
          onChange={(radioId) => onTenantSwitchRadioChange(radioId)}
          name="tenantSwitchRadios"
        />

        {/* This combo box has to be outside the radio group.
          In current EUI if put into the child of radio option, clicking in the combo box will not
          show the drop down list since the radio option consumes the click event. */}
        <EuiComboBox
          options={customTenantOptions}
          singleSelection={{ asPlainText: true }}
          selectedOptions={selectedCustomTenantOption}
          onChange={onCustomTenantChange}
          // For vertical alignment with the radio option.
          style={{ marginLeft: '24px' }}
        />

        <EuiSpacer />

        {errorCallOut && (
          <EuiCallOut color="danger" iconType="alert">
            {errorCallOut}
          </EuiCallOut>
        )}
      </>
    );
  } else {
    content = <>请联系管理员启用多组员功能。</>;
  }

  return (
    <EuiOverlayMask>
      <EuiModal data-test-subj="tenant-switch-modal" onClose={props.handleClose}>
        <EuiSpacer />
        <EuiModalBody>
          <EuiTitle>
            <h4>选择您的组员</h4>
          </EuiTitle>

          <EuiSpacer />

          <EuiText size="s" color="subdued">
            组员可以安全地与其他用户分享您的工作。您可以通过点击右上角的用户头像随时选择组员。
          </EuiText>

          <EuiSpacer />

          {content}

          <EuiSpacer />

          <EuiCheckbox
            id="remember"
            label="下次从这台设备登录时，请记住我的选择。"
            checked={rememberSelection}
            onChange={(e) => setRememberSelection(e.target.checked)}
          />
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={props.handleClose}>取消</EuiButtonEmpty>

          <EuiButton
            data-test-subj="confirm"
            fill
            disabled={!isMultiTenancyEnabled}
            onClick={handleTenantConfirmation}
          >
            确认
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}
