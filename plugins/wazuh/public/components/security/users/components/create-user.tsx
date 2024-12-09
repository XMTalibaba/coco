import React, { useEffect, useRef, useState } from 'react';
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
  EuiComboBox,
  EuiSwitch,
  EuiFieldPassword,
  EuiText,
  EuiFieldText,
  EuiPanel,
} from '@elastic/eui';

import { useApiService } from '../../../common/hooks/useApiService';
import { Role } from '../../roles/types/role.type';
import { CreateUser as TCreateUser } from '../types/user.type';
import UsersServices from '../services';
import RolesServices from '../../roles/services';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { useDebouncedEffect } from '../../../common/hooks/useDebouncedEffect';

export const CreateUser = ({ closeFlyout }) => {
  const [selectedRoles, setSelectedRole] = useState<any>([]);
  const [rolesLoading, roles, rolesError] = useApiService<Role[]>(RolesServices.GetRoles, {});
  const rolesOptions: any = roles
    ? roles.map(item => {
        return { label: item.name, id: item.id };
      })
    : [];

  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allowRunAs, setAllowRunAs] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<any>({
    userName: '',
    password: '',
    confirmPassword: '',
  });
  const [showApply, setShowApply] = useState(false);

  const userNameRef = useRef(false);
  useDebouncedEffect(
    () => {
      if (userNameRef.current) validateFields(['userName']);
      else userNameRef.current = true;
    },
    300,
    [userName]
  );

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
      setShowApply(isValidForm(false));
    },
    300,
    [userName, password, confirmPassword]
  );

  const validations = {
    userName: [
      { fn: () => (userName.trim() === '' ? '用户名为必填' : '') },
      {
        fn: () =>
          !userName.match(/^.{4,20}$/)
            ? '用户名长度为4~20个字符。'
            : '',
      },
    ],
    password: [
      { fn: () => (password === '' ? '密码为必填' : '') },
      {
        fn: () =>
          !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/)
            ? '密码长度为8~64个字符，至少包含一个大写字母、小写字母、数字和符号。'
            : '',
      },
    ],
    confirmPassword: [
      { fn: () => (confirmPassword === '' ? '确认密码为必填' : '') },
      { fn: () => (confirmPassword !== password ? `两次密码不一致。` : '') },
    ],
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

    const userData: TCreateUser = {
      username: userName,
      password: password,
      allow_run_as: allowRunAs,
    };

    try {             
      const user = await UsersServices.CreateUser(userData);
      await addRoles(user.id);

      ErrorHandler.info('用户已成功创建');
      closeFlyout(true);
    } catch (error) {
      ErrorHandler.handle(error, '有一个错误');
      setIsLoading(false);
    }
  };

  const addRoles = async userId => {
    const formattedRoles = selectedRoles.map(item => {
      return item.id;
    });
    if (formattedRoles.length > 0) await UsersServices.AddUserRoles(userId, formattedRoles);
  };

  const onChangeRoles = selectedRoles => {
    setSelectedRole(selectedRoles);
  };

  const onChangeUserName = e => {
    setUserName(e.target.value);
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
          <h2>创建新用户</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" style={{ padding: 24 }}>
          <EuiPanel>
            <EuiTitle size="s">
              <h2>用户数据</h2>
            </EuiTitle>
            <EuiSpacer />
            <EuiFormRow
              label="用户名"
              isInvalid={!!formErrors.userName}
              error={formErrors.userName}
              helpText="为用户引入用户名。"
            >
              <EuiFieldText
                placeholder="用户名"
                value={userName}
                onChange={e => onChangeUserName(e)}
                aria-label=""
                isInvalid={!!formErrors.userName}
              />
            </EuiFormRow>
            <EuiFormRow
              label="密码"
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
              />
            </EuiFormRow>
            <EuiFormRow
              label="确认密码"
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
              />
            </EuiFormRow>
            <EuiFormRow label="允许运行" helpText="如果用户能够使用运行，则设置">
              <EuiSwitch
                label="允许运行"
                showLabel={false}
                checked={allowRunAs}
                onChange={e => onChangeAllowRunAs(e)}
                aria-label=""
              />
            </EuiFormRow>
          </EuiPanel>
          <EuiSpacer />
          <EuiPanel>
            <EuiTitle size="s">
              <h2>用户角色</h2>
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
              />
            </EuiFormRow>
          </EuiPanel>
          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiButton fill isLoading={isLoading} onClick={editUser} isDisabled={!showApply}>
                应用
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
