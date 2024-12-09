import React, { useState, useEffect } from 'react';
import {
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiFieldText,
  EuiText,
  EuiButton,
} from '@elastic/eui';
import axios from 'axios';

interface ValidateCodeDeps {
  isCodeModalVisible: Boolean,
  validateSuccess: Function,
  closeValidateCode: Function,
}

export function ValidateCode(props: ValidateCodeDeps) {
  const [loginCode, setLoginCode] = useState('');
  const [codeSrc, setCodeSrc] = useState('');
  const [isCodeError, setIsCodeError] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (props.isCodeModalVisible) {
      getCode();
    }
  }, [props.isCodeModalVisible]);

  const getCode = async () => {
    let getCodeRes = await axios({
      method: 'get',
      url: '/api/getCode'
    })

    setCodeSrc(getCodeRes.data.svg);
  }

  const validateCode = async () => {
    if (!loginCode) {
      setErrorText('请输入验证码');
      setIsCodeError(true);
      return;
    }
    let validateRes = await axios({
      method: 'post',
      headers: { 'kbn-xsrf': 'kibana' },
      url: '/api/validateCode',
      data: {
        code: loginCode
      }
    })

    if (validateRes.data.msg === 'success') {
      props.validateSuccess();
      setLoginCode('');
      setIsCodeError(false);
    }
    else {
      getCode();
      setLoginCode('');
      setErrorText('验证码错误，请重新输入');
      setIsCodeError(true);
    }
  }

  const closeCode = () => {
    props.closeValidateCode();
    setLoginCode('');
    setIsCodeError(false);
  }

  let codeModal;

  if (props.isCodeModalVisible) {
    codeModal = (
      <EuiOverlayMask>
        <EuiModal onClose={() => closeCode()} initialFocus="[name=popswitch]">
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>验证</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <div style={{ padding: '4px 0'}}>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText textAlign="right">验证码:</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFieldText
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <span
                    dangerouslySetInnerHTML={{ __html: codeSrc}}
                    onClick={() => {
                      getCode();
                      setLoginCode('');
                    }}
                    style={{ cursor: 'pointer'}}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
            {isCodeError && (
              <EuiText id="error" color="danger" textAlign="center">
                <b>{errorText}</b>
              </EuiText>
            )}
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => closeCode()}>取消</EuiButtonEmpty>
            <EuiButton onClick={() => validateCode()} fill>确认</EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }

  return (
    <>{codeModal}</>
  )
}