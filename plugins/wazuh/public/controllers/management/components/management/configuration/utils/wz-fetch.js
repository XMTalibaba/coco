/*
 * Wazuh app - Fetch API function and utils.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { WzRequest } from '../../../../../../react-services/wz-request';
import { delay } from './utils';
import { replaceIllegalXML } from './xml';
import { getToasts }  from '../../../../../../kibana-services';

/**
 * Get configuration for an agent/manager of request sections
 * @param {string} [agentId=000] Agent ID
 * @param {array} sections Sections
 * @param {false} [node=false] Node
 */
export const getCurrentConfig = async (
  agentId = '000',
  sections,
  node = false,
  updateWazuhNotReadyYet
) => {
  try {
    if (
      !agentId ||
      typeof agentId !== 'string' ||
      !sections ||
      !sections.length ||
      typeof sections !== 'object' ||
      !Array.isArray(sections)
    ) {
      throw new Error('Invalid parameters');
    }

    const result = {};
    for (const section of sections) {
      const {
        component,
        configuration
      } = section;
      if (
        !component ||
        typeof component !== 'string' ||
        !configuration ||
        typeof configuration !== 'string'
      ) {
        throw new Error('Invalid section');
      }
      try {
        const url = node ?
          `/cluster/${node}/configuration/${component}/${configuration}` :
          !node && agentId === '000' ?
          `/manager/configuration/${component}/${configuration}` :
          `/agents/${agentId}/config/${component}/${configuration}`;

        const partialResult = await WzRequest.apiReq('GET', url, {});

        if (agentId === '000') {
          result[`${component}-${configuration}`] = partialResult.data.data.total_affected_items !== 0 ? partialResult.data.data.affected_items[0] : {};
        } else {
          result[`${component}-${configuration}`] = partialResult.data.data[configuration] ? partialResult.data.data : {};
        }

      } catch (error) {
        result[`${component}-${configuration}`] = await handleError(
          error,
          'Fetch configuration',
          updateWazuhNotReadyYet,
          node
        );
      }
    }
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Extracts error message string from any kind of error.
 * @param {*} error
 */
export const extractMessage = error => {
  if ((error || {}).status === -1) {
    const origin = ((error || {}).config || {}).url || '';
    const isFromAPI =
      origin.includes('/api/request') ||
      origin.includes('/api/csv') ||
      origin.includes('/api/agents-unique');
    return isFromAPI ?
      'API无法访问。 原因：超时。' :
      '服务器未响应';
  }
  if ((((error || {}).data || {}).errorData || {}).message)
    return error.data.errorData.message;
  if (((error || {}).errorData || {}).message) return error.errorData.message;
  if (typeof (error || {}).data === 'string') return error.data;
  if (typeof ((error || {}).data || {}).error === 'string')
    return error.data.error;
  if (typeof ((error || {}).data || {}).message === 'string')
    return error.data.message;
  if (typeof (((error || {}).data || {}).message || {}).msg === 'string')
    return error.data.message.msg;
  if (typeof ((error || {}).data || {}).data === 'string')
    return error.data.data;
  if (typeof error.message === 'string') return error.message;
  if (((error || {}).message || {}).msg) return error.message.msg;
  if (typeof error === 'string') return error;
  if (typeof error === 'object') return JSON.stringify(error);
  return error || 'Unexpected error';
};

/**
 *
 * @param {Error|string} error
 * @param {*} location
 * @param updateWazuhNotReadyYet
 * @param {boolean} isCluster
 */
export const handleError = async (error, location, updateWazuhNotReadyYet, isCluster) => {
  const message = extractMessage(error);
  const messageIsString = typeof message === 'string';
  try {
    if (messageIsString && message.includes('ERROR3099')) {
      updateWazuhNotReadyYet('Wazuh还没有准备好。');
      await makePing(updateWazuhNotReadyYet, isCluster);
      return;
    }

    const origin = ((error || {}).config || {}).url || '';
    const originIsString = typeof origin === 'string' && origin.length;

    const hasOrigin = messageIsString && originIsString;

    let text = hasOrigin ? `${message} (${origin})` : message;

    if (error.extraMessage) text = error.extraMessage;
    text = location ? location + '. ' + text : text;

    return text;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Check daemons status
 * @param {boolean} isCluster
 * @returns {object|Promise}
 */
export const checkDaemons = async (isCluster) => {
  try {
    const response = await WzRequest.apiReq('GET', '/manager/status', {});
    const daemons = ((((response || {}).data || {}).data || {}).affected_items || [])[0] || {};
    const wazuhdbExists = typeof daemons['wazuh-db'] !== 'undefined';

    const execd = daemons['ossec-execd'] === 'running';
    const modulesd = daemons['wazuh-modulesd'] === 'running';
    const wazuhdb = wazuhdbExists ? daemons['wazuh-db'] === 'running' : true;

    let clusterd = true;
    if (isCluster) {
      const clusterStatus = (((await clusterReq()) || {}).data || {}).data || {};
      clusterd = clusterStatus.enabled === 'yes' && clusterStatus.running === 'yes'
        ? daemons['wazuh-clusterd'] === 'running'
        : false;
    }

    const isValid = execd && modulesd && wazuhdb && (isCluster ? clusterd : true);

    if (isValid) {
      return { isValid };
    } else {
      console.warn('Wazuh还没有准备好');
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Make ping to Wazuh API
 * @param updateWazuhNotReadyYet
 * @param {boolean} isCluster
 * @param {number} [tries=10] Tries
 * @return {Promise}
 */
export const makePing = async (updateWazuhNotReadyYet, isCluster, tries = 30) => {
  try {
    let isValid = false;
    while (tries--) {
      await delay(2000);
      try {
        isValid = await checkDaemons(isCluster);
        if (isValid) {
          updateWazuhNotReadyYet('');
          break;
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (!isValid) {
      throw new Error('未恢复');
    }
    return Promise.resolve('系统已准备');
  } catch (error) {
    return Promise.reject('应用程序无法恢复。');
  }
};

/**
 * Get Cluster status from Wazuh API
 * @returns {Promise}
 */
export const clusterReq = async () => {
  try {
    return WzRequest.apiReq('GET', '/cluster/status', {});
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Fetch a config file from cluster node or manager
 * @return {string}
 */
export const fetchFile = async selectedNode => {
  try {
    const clusterStatus = (((await clusterReq() || {}).data || {}).data) || {}; // TODO: Check, when FIX ISSUE /cluster/status
    const isCluster =
      clusterStatus.enabled === 'yes' && clusterStatus.running === 'yes';
    const data = await WzRequest.apiReq(
      'GET',
      isCluster ?
      `/cluster/${selectedNode}/configuration` :
      `/manager/configuration`, 
      {
        params: {
          raw: true
        }
      }
    );

    let xml = (data || {}).data || false;

    if (!xml) {
      throw new Error('无法获取配置文件');
    }

    xml = xml.replace(/..xml.+\?>/, '');
    return xml;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Restart a node or manager
 * @param {} selectedNode Cluster Node
 * @param updateWazuhNotReadyYet
 */
export const restartNodeSelected = async (
  selectedNode,
  updateWazuhNotReadyYet
) => {
  try {
    const clusterStatus = (((await clusterReq()) || {}).data || {}).data || {};

    const isCluster = clusterStatus.enabled === 'yes' && clusterStatus.running === 'yes';
    // Dispatch a Redux action
    updateWazuhNotReadyYet(
      `重启 ${isCluster ? selectedNode : '管理器'}，请等待。`
    ); //FIXME: if it enables/disables cluster, this will show Manager instead node name
    isCluster ? await restartNode(selectedNode) : await restartManager();
    return await makePing(updateWazuhNotReadyYet, isCluster);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Restart manager (single-node API call)
 * @returns {object|Promise}
 */
export const restartManager = async () => {
  try {
    try {
      const validationError = await WzRequest.apiReq(
        'GET',
        `/manager/configuration/validation`, {}
      );
      const isOk = validationError.status === 'OK';
      if (!isOk && validationError.detail) {
        const str = validationError.detail;
        throw new Error(str);
      }
    } catch (err) {
      if (!err.includes('Timeout')) {
        return Promise.reject(err);
      }
    }
    const result = await WzRequest.apiReq('PUT', `/manager/restart`, {});
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Restart cluster
 * @returns {object|Promise}
 */
export const restartCluster = async () => {
  try {
    try {
      const validationError = await WzRequest.apiReq(
        'GET',
        `/cluster/configuration/validation`, {}
      );
  
      const isOk = validationError.status === 'OK';
      if (!isOk && validationError.detail) {
        const str = validationError.detail;
        throw new Error(str);
      }
    } catch (err) {
      if (!err.includes('Timeout')) {
        return Promise.reject(err);
      }
    }
    
    // this.performClusterRestart(); // TODO: convert AngularJS to React
    await WzRequest.apiReq('PUT', `/cluster/restart`, { delay: 15000 });
    // this.$rootScope.$broadcast('removeRestarting', {}); TODO: isRestarting: false?
    return {
      data: {
        data: '重新启动集群'
      }
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Restart a cluster node
 * @returns {object|Promise}
 */
export const restartNode = async node => {
  try {
    const node_param = node && typeof node == 'string' ? `?nodes_list=${node}` : '';

    const validationError = await WzRequest.apiReq(
      'GET',
      `/cluster/configuration/validation`, {}
    );

    const isOk = validationError.status === 200;
    if (!isOk && validationError.detail) {
      const str = validationError.detail;
      throw new Error(str);
    }
    const result = await WzRequest.apiReq(
      'PUT',
      `/cluster/restart${node_param}`, {delay: 15000}
    );

    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const saveConfiguration = async (selectedNode, xml) => {
  try {
    const clusterStatus = (((await clusterReq()) || {}).data || {}).data || {};
    const enabledAndRunning =
      clusterStatus.enabled === 'yes' && clusterStatus.running === 'yes';
    if (enabledAndRunning) {
      await saveFileCluster(xml, selectedNode);
    } else {
      await saveFileManager(xml);
    }
  } catch (error) {
    return Promise.reject(error.message || error);
  }
};

/**
 * Send ossec.conf content for a cluster node
 * @param {*} node Node name
 * @param {*} content XML raw content for ossec.conf file
 */
export const saveNodeConfiguration = async (node, content) => {
  try {
    const result = await WzRequest.apiReq(
      'PUT',
      `/cluster/${node}/configuration?overwrite=true`, {
        content,
        origin: 'xmleditor'
      }
    );
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Save text to ossec.conf cluster file
 * @param {string} text Text to save
 * @param {node}
 */
export const saveFileCluster = async (text, node) => {
  const xml = replaceIllegalXML(text);
  try {
    await WzRequest.apiReq(
      'PUT',
      `/cluster/${node}/configuration`, {
        body: xml.toString(),
        origin: 'raw'
      }
    );
    await validateAfterSent(node);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Save text to ossec.conf manager file
 * @param {string} text Text to save
 */
export const saveFileManager = async text => {
  const xml = replaceIllegalXML(text);
  try {
    await WzRequest.apiReq(
      'PUT',
      `/manager/configuration`, {
        body: xml.toString(),
        origin: 'raw'
      }
    );
    await validateAfterSent(false);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Validate after sent
 * @param {} node Node
 * @returns{boolean|Promise}
 */
export const validateAfterSent = async (node = false) => {
  try {
    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});

    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster =
      clusterData.enabled === 'yes' && clusterData.running === 'yes';

    let validation = false;
    if (node && isCluster) {
      validation = await WzRequest.apiReq(
        'GET',
        `/cluster/configuration/validation`, {}
      );
    } else {
      validation = isCluster
        ? await WzRequest.apiReq('GET', `/cluster/configuration/validation`, {})
        : await WzRequest.apiReq(
            'GET',
            `/manager/configuration/validation`,
            {}
          );
    }
    const data = ((validation || {}).data || {}).data || {};
    const isOk = data.status === 'OK';
    if (!isOk && Array.isArray(data.details)) {
      throw data;
    }
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const agentIsSynchronized = async agent => {
  const isSync = await WzRequest.apiReq(
    'GET',
    `/agents/${agent.id}/group/is_sync`, {}
  );
  return (((((isSync || {}).data || {}).data || {}).affected_items || [])[0] || {}).synced || false;
}

/**
 * Get cluster nodes
 */
export const clusterNodes = async () => {
  try {
    const result = await WzRequest.apiReq('GET', `/cluster/nodes`, {});
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};


/**
 * Check the current security platform that is installed (xpack, opendistro, searchguard...)
 */
export const checkCurrentSecurityPlatform = async () => {
  try {
    const result = await WzRequest.genericReq(
      'GET',
      '/elastic/security/current-platform',
      {}
    );
    const platform = (result.data || {}).platform;

    return platform;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Restart cluster or Manager
 */
export const restartClusterOrManager = async (updateWazuhNotReadyYet) => {
  try{
    const clusterStatus = (((await clusterReq()) || {}).data || {}).data || {};
    const isCluster =
      clusterStatus.enabled === 'yes' && clusterStatus.running === 'yes';
      getToasts().add({
        color: 'success',
        title: 'Await',
        text: isCluster ?' 重新启动群集，最多需要30秒。' : '重新启动管理器',
        toastLifeTimeMs: 3000
      });
    isCluster ? await restartCluster() : await restartManager();
    // Dispatch a Redux action
    updateWazuhNotReadyYet(
      `重启${isCluster ? '集群' : '管理器'}，请等待。`
    );
    await delay(15000);
    await makePing(updateWazuhNotReadyYet, isCluster);
    return { restarted: isCluster ? '集群' : '管理器'}
  }catch (error){
    return Promise.reject(error);
  };
};
