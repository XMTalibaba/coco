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

import React, { useState } from 'react';
import {
  EuiText,
  EuiFieldText,
  EuiIcon,
  EuiSpacer,
  EuiButton,
  EuiImage,
  EuiConfirmModal,
  EuiListGroup,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { ClientConfigType } from '../../types';
// import defaultBrandImage from '../../assets/open_distro_for_elasticsearch_logo_h.svg';
import { validateCurrentPassword } from '../../utils/login-utils';
import { ValidateCode } from './validate-code';
import axios from 'axios';

interface LoginPageDeps {
  http: CoreStart['http'];
  config: ClientConfigType['ui']['basicauth']['login'];
}

function redirect(serverBasePath: string) {
  // navigate to nextUrl
  const urlParams = new URLSearchParams(window.location.search);
  let nextUrl = urlParams.get('nextUrl');
  if (!nextUrl || nextUrl.toLowerCase().includes('//')) {
    nextUrl = serverBasePath;
  }
  window.location.href = nextUrl + window.location.hash;
}

export function LoginPage(props: LoginPageDeps) {
  const [username, setUsername] = React.useState('');
  const [emailauth, setUseremailauth] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('无效的用户名或密码，请重试');
  const [loginFailed, setloginFailed] = useState(false);
  const [usernameValidationFailed, setUsernameValidationFailed] = useState(false);
  const [useremailValidationFailed, setEmialValidationFailed] = useState(false);
  const [passwordValidationFailed, setPasswordValidationFailed] = useState(false);
  const [loginLoading, setloginLoading] = useState(false);
  const [loginPlatformName, setLoginPlatformName] = useState('');
  const [loginFooterText, setLoginFooterText] = useState('');
  const [loginEmail, setLoginemail] = useState(false);
  const [expass, setExpass] = useState(false);
  const [paramsemail, setParamsEmail] = useState({
    http: '',
    username: '',
    password: "",
    time: '',
    str1: ''

  });
  const [paramsConfig, setParamsConfig] = useState({
    attempttimes: '',
    blackloggingip: '',
    whiteloggingip: "",
    lockedtimes: '',
    passwordrules: '',
    pwdlen: '',
  });
  const [userLock, setUserLock] = useState({
    Bjtimestamp: '',
    attempttimes: '',
    user: '',
  });
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [loginFailedCount, setLoginFailedCount] = useState(0);


  React.useEffect(() => {
    getPlatformInfo();
    getLoginInfo();
  }, []);

  const getPlatformInfo = () => {
    props.http.get('/api/getPlatformInfo').then((res) => {
      setLoginPlatformName(res.data.login_platform_name ? res.data.login_platform_name : '');
      setLoginFooterText(res.data.login_footer_text ? res.data.login_footer_text : '');
      if (res.data.version_name) document.title = res.data.version_name;
    });
  }

  const getLoginInfo = async () => {
    const paramsConfigItems = await wzAxios('GET', `/manager/webloggingconfig?pretty=true`);
    const paramsConfig = ((paramsConfigItems || {}).data || {}).data.affected_items[0]; // 登录参数配置
    if (paramsConfig.outtimes) {
      const outTimeString = JSON.stringify(paramsConfig.outtimes)
      window.localStorage.setItem('outTimeString', outTimeString)
    }

    setParamsConfig(paramsConfig);
  }

  const getSso = async (val, time) => {
    const paramsso = await wzAxios('GET', `/manager/sso?islogin=${val}`);
    const paramssos = ((paramsso || {}).data || {}).data.affected_items[0]; // 登录参数配置

    await wzAxios('PUT', `/manager/logs/login?pretty=true&login_user=${paramssos.name}&&Bjtimestamp=${time}&&result=success`); // 记录登录成功日志

    // redirect(props.http.basePath.serverBasePath);
    window.location.href = '/app/wazuh';
  }

  let errorLabel = null;
  if (loginFailed) {
    errorLabel = (
      <EuiText id="error" color="danger" textAlign="center">
        <b>{loginError}</b>
      </EuiText>
    );
  }

  const addZero = item => {
    item = item < 10 ? '0' + item : item;
    return item;
  };

  const getTime = time => {
    let newTime = new Date();
    if (time) {
      newTime = new Date(time);
    }
    let Year = newTime.getFullYear();
    let Month = addZero(newTime.getMonth() + 1);
    let Day = addZero(newTime.getDate());
    let Hour = addZero(newTime.getHours());
    let Minute = addZero(newTime.getMinutes());
    let Second = addZero(newTime.getSeconds());

    return `${Year}-${Month}-${Day} ${Hour}:${Minute}:${Second}`;
  };

  const getIp = () => {
    return axios({
      method: 'get',
      url: '/api/getIp'
    })
  }

  const setCookie = (ip, username) => {
    return axios({
      method: 'post',
      headers: { 'kbn-xsrf': 'kibana' },
      url: '/api/setCookie',
      data: {
        ip,
        username
      }
    })
  }

  const setUser = (password, username, role) => {
    return axios({
      method: 'post',
      headers: { 'kbn-xsrf': 'kibana' },
      url: `/api/v1/configuration/internalusers/${username}`,
      data: {
        'password': password,
        'backend_roles': role
      }
    })
  }
  const getUser = async () => {
    try {
      const response = await axios({
        method: 'get',
        headers: { 'kbn-xsrf': 'kibana' },
        url: '/api/v1/configuration/internalusers/',
      });
      return response.data; // 返回 axios 请求的数据
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error; // 抛出错误以便调用者可以处理
    }

  }
  // await getHttp().post(`/api/v1/configuration/internalusers/${formParams.userName}`, { body: JSON.stringify(updateObject)});
  // const ssoData={
  //   password:formParams.password,
  //   userName:formParams.userName
  // }
  const wzAxios = (method, path, body = {}) => {
    return axios({
      method: 'post',
      headers: { 'kbn-xsrf': 'kibana' },
      // auth: { username: 'admin', password: '9D_nnj8H2yUuX76aAFXYNViaGU_r_LwV' },
      url: '/api/wz-request',
      data: {
        id: 'default',
        method,
        body,
        path
      }
    })
  }
  const Sendemail = async (username) => {

    await wzAxios('post', `/manager/email_auth`, {

      name: `${username}`,

    })
    setLoginemail(true)

  }
  const reactRmail = async () => {

    setLoginemail(false)
    setExpass(false)
  }

  const returnEmail = async () => {
    const prams = paramsemail
    await wzAxios('post', `/manager/email_auth`, {

      name: `${prams.username}`,

    })


  }
  

  const handleExpass = async () => {
    setExpass(false)
    const desuser = await getUser()
    const usernameToFind = username; // 你要查找的角色
    let isuser = null;
    
    // 遍历 data 对象，查找匹配的角色
    if (desuser.data && desuser.data[usernameToFind]) {
      isuser = desuser.data[usernameToFind];
      setUser('test.1234', username, isuser.backend_roles)
      window.location.href = '/app/wazuh';
    }
  

  }
  const handleEmial = async () => {
    const prams = paramsemail
    const authemil = await wzAxios('get', `/manager/email_auth?name=${prams.username}&authcode=${emailauth}`)
    const authsso = ((authemil || {}).data || {}).data.affected_items[0]

    if (authsso == 'success') {
      setLoginemail(false)
      await validateCurrentPassword(prams.http, prams.username, prams.password);
      await wzAxios('PUT', `/manager/logs/login?pretty=true&login_user=${prams.username}&&Bjtimestamp=${prams.time}&&result=success`); // 记录登录成功日志
      window.location.href = '/app/wazuh';
    } else {
      setEmialValidationFailed(true)
    }


  }
  const toLogin = async (http, username, password, time) => {


    const paramsso = await wzAxios('GET', `/manager/sso?islogin=${username}`);
    const emailsso = ((paramsso || {}).data || {}).data.affected_items[0].email ??= '';

    if (emailsso !== '') {
      const str = emailsso.split("@");
      const str1 =
        str[0].substr(0, 2) + "*****" + str[1].substr(2)
      const NEWparamsemail = {
        http,
        username,
        password,
        time,
        str1
      }
      setParamsEmail({ ...paramsemail, ...NEWparamsemail });

      Sendemail(username)
      return
    }
    
    await validateCurrentPassword(http, username, password);
    await wzAxios('PUT', `/manager/logs/login?pretty=true&login_user=${username}&&Bjtimestamp=${time}&&result=success`); // 记录登录成功日志
    let expiration=false
   
    if(username!=='master'&&expiration){
      setExpass(true)
    
    }


    // redirect(props.http.basePath.serverBasePath);
    window.location.href = '/app/wazuh';



  }

  // @ts-ignore : Parameter 'e' implicitly has an 'any' type.
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Clear errors
    setloginFailed(false);
    setUsernameValidationFailed(false);
    setPasswordValidationFailed(false);

    // Form validation
    if (username === '') {
      setUsernameValidationFailed(true);
      return;
    }


    if (password === '') {
      setPasswordValidationFailed(true);
      return;
    }

    const userLockItems = await wzAxios('GET', `/manager/weblogging?pretty=true&&webloguser=${username}`);
    const userLockInfo = ((userLockItems || {}).data || {}).data.affected_items[0]; // 登录尝试
    setUserLock(userLockInfo);

    let failedCount = userLockInfo.attempttimes ? 1 + parseInt(userLockInfo.attempttimes) : 1; // 登录失败时记录的次数
    setLoginFailedCount(failedCount);

    if (e && userLockInfo.attempttimes >= 1) {
      setIsCodeModalVisible(true);
    }
    else {
      loginCheck(failedCount);
    }
  };


  const url = window.location.href;  //获取url
  if (url.indexOf("isLogin") >= 0) { //判断url地址中是否包含code字符串
    const idx = url.lastIndexOf("=");
    const str = url.substring(idx + 1);
    let timesp = getTime(new Date().getTime());
    getSso(str, timesp)
  } else {

    //页面跳转
  }

  const loginCheck = async (failedCount) => {
    setloginLoading(true)
    const timestamp = new Date().getTime();
    const ipRes = await getIp();
    const userIp = ipRes && ipRes.data && ipRes.data.remoteAddress ? ipRes.data.remoteAddress : '';
    await setCookie(userIp, username);
    const timeBetween = userLock.Bjtimestamp ? Math.floor((timestamp - userLock.Bjtimestamp) / (1000 * 60)) : 0; // 上次登录失败间隔分钟
    try {
      const blackloggingipArr = paramsConfig.blackloggingip.split(',');
      const whiteloggingipArr = paramsConfig.whiteloggingip.split(',');

      if (username !== 'master' && userIp && paramsConfig.whiteloggingip.length > 5 && whiteloggingipArr.indexOf(userIp) === -1) {

        setLoginError(`您的IP不在白名单内，请联系管理员`);
        setloginFailed(true);

      } else if (username !== 'master' && userIp && blackloggingipArr.indexOf(userIp) !== -1) {
        setLoginError(`您的IP禁止登录，请联系管理员`);
        setloginFailed(true);
      }
      else if (!userLock.user || !paramsConfig.lockedtimes || parseInt(userLock.attempttimes) < parseInt(paramsConfig.attempttimes)) { // 该用户没触发锁定，可以继续登录
        await toLogin(props.http, username, password, getTime(timestamp));
      }
      else if (timeBetween >= parseInt(paramsConfig.lockedtimes)) { // 该用户触发了锁定，但是过了锁定时间，可以继续登录
        await wzAxios('PUT', `/manager/weblogging?pretty=true&&webloguser=${username}&&Bjtimestamp=${timestamp}&&attempttimes=0`);
        failedCount = 1;
        setLoginFailedCount(1);
        await toLogin(props.http, username, password, getTime(timestamp))
      }
      else { // 该用户在锁定，不可登录
        setLoginError(`该用户已锁定，请${paramsConfig.lockedtimes - timeBetween}分钟后尝试`);
        setloginFailed(true);
      }

    } catch (error) {
      await wzAxios('PUT', `/manager/weblogging?pretty=true&&webloguser=${username}&&Bjtimestamp=${timestamp}&&attempttimes=${failedCount}`); // 记录登录失败次数
      await wzAxios('PUT', `/manager/logs/login?pretty=true&login_user=${username}&&Bjtimestamp=${getTime(timestamp)}&&result=failed`); // 记录登录失败日志
      console.log(error);
      setLoginError(`用户名或密码错误`);
      setloginFailed(true);
    }
    setloginLoading(false)
  }

  const validateSuccess = async () => {
    setIsCodeModalVisible(false);
    loginCheck(loginFailedCount);
  }

  const closeValidateCode = () => {
    setIsCodeModalVisible(false);
    setloginLoading(false);
  }

  const logotype_url = props.http.basePath.prepend('/plugins/wazuh/assets/custom/favicon.png');

  // TODO: Get brand image from server config
  return (
    <div className="login-wrapper-box">
      <div className="login-wrapper-header-box">
        <div className="login-wrapper-header">
          <img src={logotype_url} alt="" />
          {/* 华安信息和事件管理系统 */}
          日志审计
        </div>
      </div>

      <div className="login-wrapper-contain">
        <div className="login-banner">
          <img src={require('../../assets/login-banner.png')} alt="" />
          {/* <p>部署企业安全探针，收集并设置企业主机安全信息，掌握企业主机的安全情况。</p> */}
        </div>
        <EuiListGroup className="login-wrapper">
          <EuiSpacer size="s" />
          <EuiText size="m" textAlign="left" className="login-title">
            {loginPlatformName}
          </EuiText>
          <EuiSpacer size="s" />
          <EuiSpacer size="m" />
          <EuiForm component="form">
            <EuiFormRow>
              <EuiFieldText
                data-test-subj="user-name"
                placeholder="用户名"
                prepend={<EuiIcon type="user" color="#fff" />}
                onChange={(e) => setUsername(e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join(""))}
                value={username}
                isInvalid={usernameValidationFailed}
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <EuiFormRow>
              <EuiFieldText
                data-test-subj="password"
                placeholder="密码"
                prepend={<EuiIcon type="lock" color="#fff" />}
                type="password"
                onChange={(e) => setPassword(e.target.value.split(" ").join(""))}
                value={password}
                isInvalid={passwordValidationFailed}
              />
            </EuiFormRow>



            <EuiFormRow>

              <EuiButton
                data-test-subj="submit"
                fill
                size="m"
                type="submit"
                className={props.config.buttonstyle || 'btn-login'}
                onClick={handleSubmit}
                isLoading={loginLoading}
              >
                登录
              </EuiButton>
            </EuiFormRow>
            {errorLabel}
          </EuiForm>
        </EuiListGroup>
      </div>
      {loginFooterText && (
        <div className="login-wrapper-footer">
          <EuiText size="s" textAlign="center">
            {loginFooterText}
          </EuiText>
        </div>
      )}

      <ValidateCode
        isCodeModalVisible={isCodeModalVisible}
        validateSuccess={validateSuccess}
        closeValidateCode={closeValidateCode}
      />

      <EuiConfirmModal
        className={loginEmail ? 'emailstyle' : 'emailstylenone'}

        title={`请输入邮箱${paramsemail.str1}的认证码`}
        onCancel={reactRmail}
        onConfirm={handleExpass}
        cancelButtonText="取消"
        confirmButtonText="确认"
      //  buttonColor="primary"
      //  defaultFocusedButton="confirm"
      >
        <EuiFormRow>
          <EuiFieldText
            data-test-subj="email"
            placeholder="认证码"
            onChange={(e) => setUseremailauth(e.target.value.split(" ").join(""))}
            value={emailauth}
            isInvalid={useremailValidationFailed}
          />




        </EuiFormRow>
        <EuiFormRow>
          <EuiButton
            data-test-subj="emailbtn"
            fill
            size="m"
            className={'btn-login'}
            onClick={returnEmail}

          >
            重新发送
          </EuiButton>
        </EuiFormRow>
      </EuiConfirmModal>

 <EuiConfirmModal
        className={expass ? 'emailstyle' : 'emailstylenone'}

        title={`请输入用户${username}新的密码`}
        onCancel={reactRmail}
        onConfirm={handleEmial}
        cancelButtonText="取消"
        confirmButtonText="确认"
      //  buttonColor="primary"
      //  defaultFocusedButton="confirm"
      >
          <EuiFormRow>
              <EuiFieldText
                data-test-subj="password"
                placeholder="密码"
                prepend={<EuiIcon type="lock" color="#fff" />}
                type="password"
                onChange={(e) => setPassword(e.target.value.split(" ").join(""))}
                value={password}
                isInvalid={passwordValidationFailed}
              />
            </EuiFormRow>

 
      </EuiConfirmModal>

    </div>
  );
}
