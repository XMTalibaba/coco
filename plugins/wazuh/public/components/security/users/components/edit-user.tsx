import React, { useRef, useState } from 'react';
import {
  EuiButton,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiBadge,
  EuiComboBox,
  EuiSwitch,
  EuiFieldPassword,
  EuiPanel,
} from '@elastic/eui';

import { useApiService } from '../../../common/hooks/useApiService';
import { Role } from '../../roles/types/role.type';
import { UpdateUser } from '../types/user.type';
import UsersServices from '../services';
import RolesServices from '../../roles/services';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { WzAPIUtils } from '../../../../react-services/wz-api-utils';
import { useDebouncedEffect } from '../../../common/hooks/useDebouncedEffect';

export const EditUser = ({ currentUser, closeFlyout, rolesObject }) => {
  const userRolesFormatted =
    currentUser.roles && currentUser.roles.length
      ? currentUser.roles.map(item => ({ label: rolesObject[item], id: item }))
      : [];
  const [selectedRoles, setSelectedRole] = useState(userRolesFormatted);
  const [rolesLoading, roles, rolesError] = useApiService<Role[]>(RolesServices.GetRoles, {});
  const rolesOptions: any = roles
    ? roles.map(item => {
        return { label: item.name, id: item.id };
      })
    : [];

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allowRunAs, setAllowRunAs] = useState<boolean>(currentUser.allow_run_as);
  const [formErrors, setFormErrors] = useState<any>({
    password: '',
    confirmPassword: '',
  });
  const [showApply, setShowApply] = useState(false);

  const passwordRef = useRef(false);
  useDebouncedEffect(
    () => {
      if (passwordRef.current) validateFields(['password', 'confirmPassword']);
      else passwordRef.current = true;
    },
    300,
    [password]
  );

  const confirmPasswordRef = useRef(false);
  useDebouncedEffect(
    () => {
      if (confirmPasswordRef.current) validateFields(['confirmPassword']);
      else confirmPasswordRef.current = true;
    },
    300,
    [confirmPassword]
  );

  useDebouncedEffect(
    () => {
      let _showApply =
        isValidForm(false) &&
        (allowRunAs !== currentUser.allow_run_as ||
          Object.values(getRolesDiff()).some(i => i.length));

      setShowApply(_showApply);
    },
    300,
    [password, confirmPassword, allowRunAs, selectedRoles]
  );

  const validations = {
    password: [
      {
        fn: () =>
          password !== '' &&
          !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/)
            ? '密码长度为8~64个字符，至少包含一个大写字母、小写字母、数字和符号。'
            : '',
      },
    ],
    confirmPassword: [{ fn: () => (confirmPassword !== password ? `两次密码不一致。` : '') }],
  };

  const validateFields = (fields, showErrors = true) => {
    const _formErrors = { ...formErrors };
    let isValid = true;
    fields.forEach(field => {
      const error = validations[field].reduce((currentError, validation) => {
        return !!currentError ? currentError : validation.fn();
      }, '');
      _formErrors[field] = error;
      isValid = isValid && !!!error;
    });
    if (showErrors) setFormErrors(_formErrors);
    return isValid;
  };

  const isValidForm = (showErrors = true) => {
    return validateFields(Object.keys(validations), showErrors);
  };

  const editUser = async () => {
    if (!isValidForm()) {
      ErrorHandler.warning('请解决不正确的字段。');
      return;
    }

    setIsLoading(true);

    const userData: UpdateUser = {
      allow_run_as: allowRunAs,
    };

    if (password) {
      userData.password = password;
    }
    try {
      await Promise.all([UsersServices.UpdateUser(currentUser.id, userData), updateRoles()]);

      ErrorHandler.info('用户已成功更新');
      closeFlyout(true);
    } catch (error) {
      ErrorHandler.handle(error, '有一个错误');
      setIsLoading(false);
    }
  };

  const getRolesDiff = () => {
    const formattedRoles = selectedRoles.map(item => item.id);
    const _userRolesFormatted = userRolesFormatted.map(role => role.id);
    const toAdd = formattedRoles.filter(value => !_userRolesFormatted.includes(value));
    const toRemove = _userRolesFormatted.filter(value => !formattedRoles.includes(value));
    return { toAdd, toRemove };
  };

  const updateRoles = async () => {
    const { toAdd, toRemove } = getRolesDiff();
    if (toAdd.length) await UsersServices.AddUserRoles(currentUser.id, toAdd);
    if (toRemove.length) await UsersServices.RemoveUserRoles(currentUser.id, toRemove);
  };

  const onChangeRoles = selectedRoles => {
    setSelectedRole(selectedRoles);
  };

  const onChangePassword = e => {
    setPassword(e.target.value);
  };

  const onChangeConfirmPassword = e => {
    setConfirmPassword(e.target.value);
  };

  const onChangeAllowRunAs = e => {
    setAllowRunAs(e.target.checked);
  };

  return (
    <EuiFlyout className="wzApp" onClose={() => closeFlyout()}>
      <EuiFlyoutHeader hasBorder={false}>
        <EuiTitle size="m">
          <h2>
            编辑 {currentUser.username} 用户 &nbsp; &nbsp;
            {WzAPIUtils.isReservedID(currentUser.id) && <EuiBadge color="primary">保留</EuiBadge>}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" style={{ padding: 24 }}>
          <EuiPanel>
            <EuiTitle size="s">
              <h2>运行</h2>
            </EuiTitle>
            <EuiFormRow label="" helpText="如果用户能够使用运行，则设置">
              <EuiSwitch
                label="允许"
                showLabel={true}
                checked={allowRunAs}
                onChange={e => onChangeAllowRunAs(e)}
                aria-label=""
                disabled={WzAPIUtils.isReservedID(currentUser.id)}
              />
            </EuiFormRow>
          </EuiPanel>
          <EuiSpacer />
          <EuiPanel>
            <EuiTitle size="s">
              <h2>密码</h2>
            </EuiTitle>
            <EuiFormRow
              label=""
              isInvalid={!!formErrors.password}
              error={formErrors.password}
              helpText="为用户引入新密码。"
            >
              <EuiFieldPassword
                placeholder="密码"
                value={password}
                onChange={e => onChangePassword(e)}
                aria-label=""
                isInvalid={!!formErrors.password}
                disabled={WzAPIUtils.isReservedID(currentUser.id)}
              />
            </EuiFormRow>
            <EuiFormRow
              label=""
              isInvalid={!!formErrors.confirmPassword}
              error={formErrors.confirmPassword}
              helpText="确认新密码。"
            >
              <EuiFieldPassword
                placeholder="确认密码"
                value={confirmPassword}
                onChange={e => onChangeConfirmPassword(e)}
                aria-label=""
                isInvalid={!!formErrors.confirmPassword}
                disabled={WzAPIUtils.isReservedID(currentUser.id)}
              />
            </EuiFormRow>
          </EuiPanel>
          <EuiSpacer />
          <EuiPanel>
            <EuiTitle size="s">
              <h2>角色</h2>
            </EuiTitle>
            <EuiFormRow label="" helpText="为所选用户分配角色">
              <EuiComboBox
                placeholder="选择角色"
                options={rolesOptions}
                selectedOptions={selectedRoles}
                isLoading={rolesLoading || isLoading}
                onChange={onChangeRoles}
                isClearable={true}
                data-test-subj="demoComboBox"
                isDisabled={WzAPIUtils.isReservedID(currentUser.id)}
              />
            </EuiFormRow>
          </EuiPanel>

          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                isLoading={isLoading}
                isDisabled={WzAPIUtils.isReservedID(currentUser.id) || !showApply}
                onClick={editUser}
              >
                应用
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
