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
import { EuiFieldText, EuiIcon } from '@elastic/eui';
import { FormRow } from './form-row';
import { PASSWORD_INSTRUCTION } from '../../apps-constants';

export function PasswordEditPanel(props: {
  updatePassword: (p: string) => void;
  updateIsInvalid: (v: boolean) => void;
  passwordRuleId: any;
  passwordLength: any;
}) {
  const [password, setPassword] = React.useState<string>('');
  const [repeatPassword, setRepeatPassword] = React.useState<string>('');
  const [isRepeatPasswordInvalid, setIsRepeatPasswordInvalid] = React.useState<boolean>(false);
  const [passwordHelp, setPasswordHelp] = React.useState<string>('');
  const passwordHelpOptions = {
    'upper': '大写字母',
    'lower': '小写字母',
    'num': '数字字符',
    'spechar': '特殊字符'
  };

  React.useEffect(() => {
    props.updatePassword(password);
    const isInvalid = repeatPassword !== password;
    setIsRepeatPasswordInvalid(isInvalid);
    props.updateIsInvalid(isInvalid);

    let helpText = `密码长度至少${props.passwordLength}位`;
    let passwordRuleArr = props.passwordRuleId.split(',');
    if (passwordRuleArr.length > 0) {
      helpText += `，且必须包含`
    }
    passwordRuleArr.map(k => {
      helpText += `${passwordHelpOptions[k]}、`
    })
    helpText = helpText.substring(0, helpText.length - 1);
    setPasswordHelp(helpText)
  }, [password, props, repeatPassword]);

  const passwordChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const repeatPasswordChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  };

  return (
    <>
      <FormRow headerText="密码" helpText={passwordHelp}>
        <EuiFieldText
          data-test-subj="password"
          prepend={<EuiIcon type="lock" />}
          type="password"
          onChange={passwordChangeHandler}
        />
      </FormRow>

      <FormRow
        headerText="重新输入密码"
        helpText="密码必须与上面输入的相同。"
      >
        <EuiFieldText
          data-test-subj="re-enter-password"
          prepend={<EuiIcon type="lock" />}
          type="password"
          isInvalid={isRepeatPasswordInvalid}
          onChange={repeatPasswordChangeHandler}
        />
      </FormRow>
    </>
  );
}
