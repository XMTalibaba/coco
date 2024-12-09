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

import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldPassword,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiOverlayMask,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from 'kibana/public';
import { FormRow } from '../configuration/utils/form-row';
import { logout, updateNewPassword } from './utils';
import { PASSWORD_INSTRUCTION } from '../apps-constants';
import { constructErrorMessageAndLog } from '../error-utils';
import { validateCurrentPassword } from '../../utils/login-utils';

interface PasswordResetPanelProps {
  coreStart: CoreStart;
  username: string;
  handleClose: () => void;
  logoutUrl?: string;
}

export function PasswordResetPanel(props: PasswordResetPanelProps) {
  const [currentPassword, setCurrentPassword] = React.useState<string>('');
  // reply on backend response of login call to verify
  const [isCurrentPasswordInvalid, setIsCurrentPasswordInvalid] = React.useState<boolean>(false);
  const [currentPasswordError, setCurrentPasswordError] = React.useState<string[]>([]);

  const [newPassword, setNewPassword] = React.useState<string>('');
  // reply on backend response of user update call to verify
  const [isNewPasswordInvalid, setIsNewPasswordInvalid] = React.useState<boolean>(false);

  const [repeatNewPassword, setRepeatNewPassword] = React.useState<string>('');
  const [isRepeatNewPasswordInvalid, setIsRepeatNewPasswordInvalid] = React.useState<boolean>(
    false
  );

  const [errorCallOut, setErrorCallOut] = React.useState<string>('');
  
  const [passwordRuleId, setPasswordRuleId] = React.useState<string>('');
  const [passwordLength, setPasswordLength] = React.useState<string>('8');
  const [passwordHelp, setPasswordHelp] = React.useState<string>('');

  React.useEffect(() => {
    initPasswordConfig();
  }, []);

  const initPasswordConfig = async () => {
    // 获取登录参数，查询密码规则ID
    const paramsConfig = await props.coreStart.http.post('/api/request', { body: JSON.stringify({ method: 'GET', id: 'default', body: {}, path: `/manager/webloggingconfig?pretty=true` })});
    const params = (
      (paramsConfig || {}).data || {}
    ).affected_items[0];
    setPasswordRuleId(params.passwordrules);
    setPasswordLength(params.pwdlen);

    const passwordHelpOptions = {
      'upper': '大写字母',
      'lower': '小写字母',
      'num': '数字字符',
      'spechar': '特殊字符'
    };
    let helpText = `密码长度至少${params.pwdlen}位`;
    let passwordRuleArr = params.passwordrules.split(',');
    if (passwordRuleArr.length > 0) {
      helpText += `，且必须包含`
    }
    passwordRuleArr.map(k => {
      helpText += `${passwordHelpOptions[k]}、`
    })
    helpText = helpText.substring(0, helpText.length - 1);
    setPasswordHelp(helpText)
  }

  const handleReset = async () => {
    const http = props.coreStart.http;

    // 密码规则验证
    const regexpOptions = {
      'upper': /[A-Z]/,
      'lower': /[a-z]/,
      'num': /[0-9]/,
      'spechar': new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？+-]")
    };
    let isCheck = true;
    passwordRuleId.split(',').map(k => {
      if (!regexpOptions[k].test(newPassword)) {
        isCheck = false;
      }
    })
    if (!isCheck || newPassword.length < Number(passwordLength)) {
      setIsNewPasswordInvalid(true);
      return
    }

    // validate the current password
    try {
      await validateCurrentPassword(http, props.username, currentPassword);
    } catch (e) {
      setIsCurrentPasswordInvalid(true);
      setCurrentPasswordError(['当前密码验证失败。']);
      return;
    }

    // update new password
    try {
      await updateNewPassword(http, newPassword, currentPassword);

      await logout(http, props.logoutUrl);
    } catch (e) {
      setErrorCallOut(constructErrorMessageAndLog(e, 'Failed to reset password.'));
    }
  };

  // TODO: replace the instruction message for new password once UX provides it.
  return (
    <EuiOverlayMask>
      <EuiModal data-test-subj="reset-password-modal" onClose={props.handleClose}>
        <EuiSpacer />
        <EuiModalBody>
          <EuiTitle>
            <h4>为&quot;{props.username}&quot;用户重置密码</h4>
          </EuiTitle>

          <EuiSpacer />

          <FormRow
            headerText="当前密码"
            helpText="请输入您当前的密码来验证您的帐户。"
            isInvalid={isCurrentPasswordInvalid}
            error={currentPasswordError}
          >
            <EuiFieldPassword
              data-test-subj="current-password"
              onChange={function (e: React.ChangeEvent<HTMLInputElement>) {
                setCurrentPassword(e.target.value);
                setIsCurrentPasswordInvalid(false);
              }}
              isInvalid={isCurrentPasswordInvalid}
            />
          </FormRow>

          <FormRow
            headerText="新密码"
            helpText={passwordHelp}
            isInvalid={isNewPasswordInvalid}
            error={['密码不符合规则。']}
          >
            <EuiFieldPassword
              data-test-subj="new-password"
              onChange={function (e: React.ChangeEvent<HTMLInputElement>) {
                const value = e.target.value;
                setNewPassword(value);
                setIsNewPasswordInvalid(false);
                setIsRepeatNewPasswordInvalid(repeatNewPassword !== value);
              }}
              isInvalid={isNewPasswordInvalid}
            />
          </FormRow>

          <FormRow
            headerText="确认新密码"
            helpText="密码必须与上面输入的相同。"
          >
            <EuiFieldPassword
              data-test-subj="reenter-new-password"
              isInvalid={isRepeatNewPasswordInvalid}
              onChange={function (e: React.ChangeEvent<HTMLInputElement>) {
                const value = e.target.value;
                setRepeatNewPassword(value);
                setIsRepeatNewPasswordInvalid(value !== newPassword);
              }}
            />
          </FormRow>

          <EuiSpacer />

          {errorCallOut && (
            <EuiCallOut color="danger" iconType="alert">
              {errorCallOut}
            </EuiCallOut>
          )}
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty data-test-subj="cancel" onClick={props.handleClose}>
            取消
          </EuiButtonEmpty>

          <EuiButton
            data-test-subj="reset"
            fill
            disabled={!currentPassword || !newPassword || !repeatNewPassword || isRepeatNewPasswordInvalid}
            onClick={handleReset}
          >
            重置
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}
