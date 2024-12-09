/*
 * Wazuh app - APP state service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import store from '../redux/store';
import {
  updateCurrentApi,
  updateShowMenu,
  updateExtensions
} from '../redux/actions/appStateActions';
import { GenericRequest } from '../react-services/generic-request';
import { WzRequest } from '../react-services/wz-request';
import { WazuhConfig } from './wazuh-config';
import { CSVRequest } from '../services/csv-request';
import { getToasts, getCookies, getAngularModule }  from '../kibana-services';
import * as FileSaver from '../services/file-saver';
import { WzAuthentication } from './wz-authentication';
import { NavPermission } from '../../common/nav-permission';

export class AppState {

  static getCachedExtensions = (id) => {
    const extensions = ((store.getState() || {}).appStateReducers || {}).extensions;
    if(Object.keys(extensions).length && extensions[id]){
      return extensions[id];
    }
    return false;
  }


  /**
   * Returns if the extension 'id' is enabled
   * @param {id} id
   */
  static getExtensions = async id => {
    try {
      const cachedExtensions = this.getCachedExtensions(id);
      if(cachedExtensions){
        return cachedExtensions;
      }else{
        const data = await GenericRequest.request('GET', `/api/extensions/${id}`);

        const extensions = data.data.extensions;
        if (Object.keys(extensions).length) {
          AppState.setExtensions(id, extensions);
          return extensions;
        } else {
          const wazuhConfig = new WazuhConfig();
          const config = wazuhConfig.getConfig();
          if(!Object.keys(config).length) return;
          const extensions = {
            audit: config['extensions.audit'],
            pci: config['extensions.pci'],
            gdpr: config['extensions.gdpr'],
            hipaa: config['extensions.hipaa'],
            nist: config['extensions.nist'],
            tsc: config['extensions.tsc'],
            oscap: config['extensions.oscap'],
            ciscat: config['extensions.ciscat'],
            aws: config['extensions.aws'],
            gcp: config['extensions.gcp'],
            virustotal: config['extensions.virustotal'],
            osquery: config['extensions.osquery'],
            docker: config['extensions.docker']
          };
          AppState.setExtensions(id, extensions);
          return extensions;
        }
      }
    } catch (err) {
      console.log('错误获得扩展');
      console.log(err);
      throw err;
    }
  };

  /**
   *  Sets a new value for the cookie 'currentExtensions' object
   * @param {*} id
   * @param {*} extensions
   */
  static setExtensions = async (id, extensions) => {
    try {
      await GenericRequest.request('POST', '/api/extensions', {
        id,
        extensions
      });
      const updateExtension = updateExtensions(id,extensions);
      store.dispatch(updateExtension);
    } catch (err) {
      console.log('错误集扩展');
      console.log(err);
      throw err;
    }
  };

  /**
   * Cluster setters and getters
   **/
  static getClusterInfo() {
    try {
      const clusterInfo = getCookies().get('clusterInfo')
        ? decodeURI(getCookies().get('clusterInfo'))
        : false;
      return clusterInfo ? JSON.parse(clusterInfo) : {};
    } catch (err) {
      console.log('错误获取集群信息');
      console.log(err);
      throw err;
    }
  }

  /**
   * Sets a new value to the cookie 'clusterInfo' object
   * @param {*} cluster_info
   */
  static setClusterInfo(cluster_info) {
    try {
      const encodedClusterInfo = encodeURI(JSON.stringify(cluster_info));
      const exp = new Date();
      exp.setDate(exp.getDate() + 365);
      if (cluster_info) {
        getCookies().set('clusterInfo', encodedClusterInfo, {
          expires: exp,
          path: window.location.pathname
        });
      }
    } catch (err) {
      console.log('错误设置集群信息');
      console.log(err);
      throw err;
    }
  }

  /**
   * Set a new value to the 'createdAt' cookie
   * @param {*} date
   */
  static setCreatedAt(date) {
    try {
      const createdAt = encodeURI(date);
      const exp = new Date();
      exp.setDate(exp.getDate() + 365);
      getCookies().set('createdAt', createdAt, {
        expires: exp,
        path: window.location.pathname
      });
    } catch (err) {
      console.log('错误设置credateAt日期');
      console.log(err);
      throw err;
    }
  }

  /**
   * Get 'createdAt' value
   */
  static getCreatedAt() {
    try {
      const createdAt = getCookies().get('createdAt')
        ? decodeURI(getCookies().get('createdAt'))
        : false;
      return createdAt ? createdAt : false;
    } catch (err) {
      console.log('错误获得credateAt日期');
      console.log(err);
      throw err;
    }
  }

  /**
   * Get 'API' value
   */
  static getCurrentAPI() {
    try {
      const currentAPI = getCookies().get('currentApi');
      return currentAPI ? decodeURI(currentAPI) : false;
    } catch (err) {
      console.log('错误获得当前的Api');
      console.log(err);
      throw err;
    }
  }

  /**
   * Remove 'API' cookie
   */
  static removeCurrentAPI() {
    const updateApiMenu = updateCurrentApi(false);
    store.dispatch(updateApiMenu);
    return getCookies().remove('currentApi', { path: window.location.pathname });
  }

  /**
   * Set a new value to the 'API' cookie
   * @param {*} date
   */
  static setCurrentAPI(API) {
    try {
      const encodedApi = encodeURI(API);
      const exp = new Date();
      exp.setDate(exp.getDate() + 365);
      if (API) {
        getCookies().set('currentApi', encodedApi, {
          expires: exp,
          path: window.location.pathname
        });
        try {
          const updateApiMenu = updateCurrentApi(JSON.parse(API).id);
          store.dispatch(updateApiMenu);
          WzAuthentication.refresh();
        } catch (err) {}
      }
    } catch (err) {
      console.log('错误设置当前的Api');
      console.log(err);
      throw err;
    }
  }

  /**
   * Get 'APISelector' value
   */
  static getAPISelector() {
    return getCookies().get('APISelector')
      ? decodeURI(getCookies().get('APISelector')) == 'true'
      : false;
  }

  /**
   * Set a new value to the 'patternSelector' cookie
   * @param {*} value
   */
  static setAPISelector(value) {
    const encodedPattern = encodeURI(value);
    getCookies().set('APISelector', encodedPattern, {
      path: window.location.pathname
    });
  }

  /**
   * Get 'patternSelector' value
   */
  static getPatternSelector() {
    return getCookies().get('patternSelector')
      ? decodeURI(getCookies().get('patternSelector')) == 'true'
      : false;
  }

  /**
   * Set a new value to the 'patternSelector' cookie
   * @param {*} value
   */
  static setPatternSelector(value) {
    const encodedPattern = encodeURI(value);
    getCookies().set('patternSelector', encodedPattern, {
      path: window.location.pathname
    });
  }

  /**
   * Set a new value to the 'currentPattern' cookie
   * @param {*} newPattern
   */
  static setCurrentPattern(newPattern) {
    const encodedPattern = encodeURI(newPattern);
    const exp = new Date();
    exp.setDate(exp.getDate() + 365);
    if (newPattern) {
      getCookies().set('currentPattern', encodedPattern, {
        expires: exp,
        path: window.location.pathname
      });
    }
  }

  /**
   * Get 'currentPattern' value
   */
  static getCurrentPattern() {
    const currentPattern = getCookies().get('currentPattern')
      ? decodeURI(getCookies().get('currentPattern'))
      : '';
    // check if the current Cookie has the format of 3.11 and previous versions, in that case we remove the extra " " characters
    if (
      currentPattern &&
      currentPattern[0] === '"' &&
      currentPattern[currentPattern.length - 1] === '"'
    ) {
      const newPattern = currentPattern.substring(1, currentPattern.length - 1);
      this.setCurrentPattern(newPattern);
    }
    return getCookies().get('currentPattern')
      ? decodeURI(getCookies().get('currentPattern'))
      : '';
  }

  /**
   * Remove 'currentPattern' value
   */
  static removeCurrentPattern() {
    return getCookies().remove('currentPattern', { path: window.location.pathname });
  }

  /**
   * Set a new value to the 'currentDevTools' cookie
   * @param {*} current
   **/
  static setCurrentDevTools(current) {
    window.localStorage.setItem('currentDevTools', current);
  }

  /**
   * Get 'currentDevTools' value
   **/
  static getCurrentDevTools() {
    return window.localStorage.getItem('currentDevTools');
  }

  /**
   * Add/Edit an item in the session storage
   * @param {*} key
   * @param {*} value
   */
  static setSessionStorageItem(key, value) {
    window.sessionStorage.setItem(key, value);
  }

  /**
   * Returns session storage item
   * @param {*} key
   */
  static getSessionStorageItem(key) {
    return window.sessionStorage.getItem(key);
  }

  /**
   * Remove an item from the session storage
   * @param {*} key
   */
  static removeSessionStorageItem(key) {
    window.sessionStorage.removeItem(key);
  }

  static setNavigation(params) {
    const decodedNavigation = getCookies().get('navigate')
      ? decodeURI(getCookies().get('navigate'))
      : false;
    var navigate = decodedNavigation ? JSON.parse(decodedNavigation) : {};
    for (var key in params) {
      navigate[key] = params[key];
    }
    if (navigate) {
      const encodedURI = encodeURI(JSON.stringify(navigate));
      getCookies().set('navigate', encodedURI, { 
        path: window.location.pathname 
      });
    }
  }

  static getNavigation() {
    const decodedNavigation = getCookies().get('navigate')
      ? decodeURI(getCookies().get('navigate'))
      : false;
    const navigation = decodedNavigation ? JSON.parse(decodedNavigation) : {};
    return navigation;
  }

  static removeNavigation() {
    return getCookies().remove('navigate', { path: window.location.pathname });
  }

  static setWzMenu(isVisible = true) {
    const showMenu = updateShowMenu(isVisible);
    store.dispatch(showMenu);
  }


  static async downloadCsv(path, fileName, filters = [], csvKey = [], csvKeyContrast = {}, csvTextContrast = {}) {
    try {
      const csvReq = new CSVRequest();
      getToasts().add({
        color: 'success',
        title: 'CSV',
        text: '您的下载已自动开始...',
        toastLifeTimeMs: 4000,
      });
      const currentApi = JSON.parse(this.getCurrentAPI()).id;
      const output = await csvReq.fetch(path, currentApi, filters, csvKey, csvKeyContrast, csvTextContrast);
      const blob = new Blob([output.csv], { type: 'text/csv; charset=utf-8' }); // eslint-disable-line

      FileSaver.saveAs(blob, fileName);
    } catch (error) {
      getToasts().add({
        color: 'success',
        title: 'CSV',
        text: '生成CSV时出错',
        toastLifeTimeMs: 4000,
      }); 
    }
    return;
  }

  static async checkCookies() {
    getCookies().set('appName', 'wazuh', { path: window.location.pathname });
    await this.setCurrentUserInfo();
    return !!getCookies().get('appName')
  }

  /**
   * 获取当前页面的角色权限
   **/
  static getPagePermission = () => {
    let pagePermission = [];
    let location = window.location.hash;
    Object.keys(NavPermission).forEach(roleKey => {
      let hasPermission = false;
      Object.keys(NavPermission[roleKey]).forEach(navKey => {
        for (let i = 0, length = NavPermission[roleKey][navKey].routeItems.length; i < length; i ++) {
          let item = NavPermission[roleKey][navKey].routeItems[i];
          if (item.modulesTab && item.type && location.includes(`modulesTab=${item.modulesTab}`) && location.includes(`/${item.type}/`)) {
            hasPermission = true;
            return
          }
          else if (item.type && location.includes(`/${item.type}/`) && location.includes(`tab=${item.id}`)) {
            hasPermission = true;
            return
          }
          else if (location.includes(`/${item.id}/`)) {
            hasPermission = true;
            return
          }
        }
      });
      if (hasPermission) pagePermission.push(roleKey)
    });
    if (location.includes('#/overview/?tab=general')) {
      pagePermission = ['admin']
    }
    if (pagePermission.length === 0) pagePermission.push('none')
    return pagePermission;
  }

  /**
   * 获取当前用户信息：用户名，角色，部门
   **/
  static setCurrentUserInfo = async () => {
    try {
      const res = await GenericRequest.request('GET', `/api/v1/configuration/account`);
      let userInfo = {
        userName: '',
        role: '',
        department: [],
      };
      if (res.data.data.backend_roles.indexOf('admin') !== -1) {
        // 超级管理员
        userInfo.role = 'admin';
      } else if (res.data.data.backend_roles.indexOf('adminuser') !== -1) {
        // 用户管理员
        userInfo.role = 'adminuser';
      } else if (res.data.data.backend_roles.indexOf('system') !== -1) {
        // 系统管理员
        userInfo.role = 'system';
      } else if (res.data.data.backend_roles.indexOf('audit') !== -1) {
        // 审计管理员
        userInfo.role = 'audit';
      } else if (res.data.data.backend_roles.indexOf('wazuh') !== -1) {
        // 操作用户
        userInfo.role = 'wazuh';
      }
      userInfo.userName = res.data.data.user_name;
      if (res.data.data.custom_attribute_names.length > 0) {
        res.data.data.custom_attribute_names.forEach(k => {
          userInfo.department.push(k.split('.')[2])
        })
      }
      if (userInfo.department.length === 0) userInfo.department = null

      if (getCookies().get('currentUserInfo')) getCookies().remove('currentUserInfo', { path: window.location.pathname });
      getCookies().set('currentUserInfo', encodeURI(JSON.stringify(userInfo)), {
        path: window.location.pathname
      });
      // return userInfo.userName ? userInfo : {};
    } catch (err) {
      console.log('错误获取当前用户信息');
      console.log(err);
      throw err;
    }
  }
  static getCurrentUserInfo = async () => {
    let currentUserInfo = getCookies().get('currentUserInfo')
      ? decodeURI(getCookies().get('currentUserInfo'))
      : false;
    if (!currentUserInfo) {
      await this.setCurrentUserInfo()
      currentUserInfo = decodeURI(getCookies().get('currentUserInfo'))
    }
    const result = currentUserInfo ? JSON.parse(currentUserInfo) : {};
    return result;
  }

  /**
   * 获取当前用户部门权限主机分组列表信息
   **/
  static getDepartmentGroups = async () => {
    try {
      const currentUserInfo = await this.getCurrentUserInfo();
      // 传参 limit 为 0，返回全部列表数据
      let result = await WzRequest.apiReq('GET', `/groups${currentUserInfo.department && currentUserInfo.department.length > 0 ? `?labels_list=${currentUserInfo.department.join(',')}` : ''}`, { params: { limit: 0 } });
      let GroupsRes = (((result || {}).data || {}).data || {}).affected_items
      return GroupsRes
      // 未设置部门返回全部主机分组列表
    } catch (err) {
      console.log('错误获取当前用户部门权限主机分组列表信息');
      console.log(err);
      throw err;
    }
  }

  /**
   * 获取当前用户部门权限主机列表信息
   **/
  static getDepartmentAgents = async () => {
    try {
      const departmentGroups = await this.getDepartmentGroups();
      let AgentsRes = [];
      if (departmentGroups.length > 0) {
        // 传参 limit 为 0，返回全部列表数据
        let params = {
          limit: 0,
          q: `(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
        };
        const result = await WzRequest.apiReq(
          'GET',
          '/agents',
          { params }
        );
        AgentsRes = (((result || {}).data || {}).data || {}).affected_items;
      }
      return AgentsRes
      // 未设置部门返回全部主机列表
    } catch (err) {
      console.log('错误获取当前用户部门权限主机列表信息');
      console.log(err);
      throw err;
    }
  }
}
