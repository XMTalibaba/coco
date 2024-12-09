/*
 * Wazuh app - Tools to check the version of the plugin
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { GenericRequest } from '../react-services/generic-request';
import { AxiosResponse } from 'axios';
import _ from 'lodash';
import { version as appVersion, revision as appRevision} from '../../package.json';
import { getCookies, getToasts } from '../kibana-services';

type TAppInfo = {
  revision: string;
  'app-version': string;
};

type TAppInfoResponse = {
  statusCode: number;
  data: TAppInfo;
};

export const checkPluginVersion = async () => {
  try {
    const response: AxiosResponse<TAppInfoResponse> = await GenericRequest.request(
      'GET',
      '/api/setup'
    );
    const { revision, 'app-version': appRevision } = response.data.data;
    return checkClientAppVersion({ revision, 'app-version': appRevision });
  } catch (error) {
    console.error(`获取插件版本时出错: ${error}`);
  }
};

const checkClientAppVersion = (appInfo: TAppInfo) => {
  if (appInfo['app-version'] !== appVersion || appInfo.revision !== appRevision) {
    if( window.history.state !== 'refreshed') {
      clearBrowserInfo(appInfo);
    } else {
      getToasts().addDanger({
        title: '与应用程序版本相冲突',
        text: '浏览器中的应用程序的版本与Kibana中安装的应用程序版本不一致。\n请清除您的浏览器缓存。\n如果错误持续存在，也请重新启动Kibana。'
      });
    }
  } else {
    if(window.history.state == 'refreshed'){
      window.history.replaceState('', 'wazuh');
    };
    const storeAppInfo = localStorage.getItem('appInfo');
    !storeAppInfo && updateAppInfo(appInfo);
  }
};

function clearBrowserInfo(appInfo: TAppInfo) {
  console.warn('清除浏览器缓存');
  //remove cookies
  const cookies = getCookies().getAll();
  Object.keys(cookies).forEach((cookie) => getCookies().remove(cookie));

  //remove cache
  if (window.caches) {    
    window.caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
  }

  //update localStorage
  updateAppInfo(appInfo);

  //replace status to avoid infinite refresh
  window.history.replaceState('refreshed', 'wazuh');

  // delete browser cache and hard reload
  window.location.reload(true);
}

function updateAppInfo(appInfo: TAppInfo) {
  localStorage.setItem('appInfo', JSON.stringify(appInfo));
}

