/*
 * Wazuh app - Acntion Agents Service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { WzRequest } from './wz-request';
import { getToasts }  from '../kibana-services';

export class ActionAgents {
  static showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  /**
   * Upgrade unique agent to the latest version avaible.
   * @param {Number} agentId
   */
  static upgradeAgent(agentId) {
    WzRequest.apiReq('PUT', `/agents/${agentId}/upgrade`, {
      force: 1
    })
      .then(() => {
        console.log('Upgrading');
      })
      .catch(error => {
        error !== 'Wazuh API error: 3021 - Timeout executing API request'
          ? this.showToast('danger', '升级代理出错', error, 5000)
          : false;
      });
    this.showToast('success', '升级代理...', '', 5000);
  }

  /**
   * Upgrade list of agents to the latest version avaible.
   * @param {Array} selectedItems
   */
  static upgradeAgents(selectedItems) {
    for (let item of selectedItems.filter(
      item => item.outdated && item.status !== 'Disconnected'
    )) {
      WzRequest.apiReq('PUT', `/agents/${item.id}/upgrade`, '1')
        .then(() => {})
        .catch(error => {});
    }
    this.showToast('success', '升级选择的代理...', '', 5000);
  }

  /**
   * Upgrade a list of agents to the latest version avaible.
   * @param {Array} selectedItems
   * @param {String} managerVersion
   */
  static upgradeAllAgents(selectedItems, managerVersion) {
    selectedItems.forEach(agent => {
      if (
        agent.id !== '000' &&
        this.compareVersions(agent.version, managerVersion) === true &&
        agent.status === 'active'
      ) {
        WzRequest.apiReq('PUT', `/agents/${agent.id}/upgrade`, '1')
          .then(() => {})
          .catch(error => {});
      }
    });
    this.showToast('success', '升级所有代理...', '', 5000);
  }

  /**
   * Restart an agent
   * @param {Number} agentId
   */
  static restartAgent(agentId) {
    WzRequest.apiReq('PUT', `/agents/restart`, { ids: agentId })
      .then(value => {
        value.status === 200
          ? this.showToast('success', '重启代理...', '', 5000)
          : this.showToast('warning', '重启代理时出错', '', 5000);
      })
      .catch(error => {
        this.showToast('danger', '重启代理时出错', error, 5000);
      });
  }

  /**
   * Restart a list of agents
   * @param {Array} selectedItems
   */
  static restartAgents(selectedItems) {
    const agentsId = selectedItems.map(item => item.id);

    WzRequest.apiReq('PUT', `/agents/restart`, { ids: [...agentsId] })
      .then(value => {
        value.status === 200
          ? this.showToast('success', '重启选择的代理...', '', 5000)
          : this.showToast(
              'warning',
              '重启选择的代理时出错',
              '',
              5000
            );
      })
      .catch(error => {
        this.showToast(
          'danger',
          '重启选择的代理时出错',
          error,
          5000
        );
      });
  }

  /**
   * Restart a list of agents
   * @param {Array} selectedItems
   */
  static restartAllAgents(selectedItems) {
    let idAvaibleAgents = [];
    selectedItems.forEach(agent => {
      if (agent.id !== '000' && agent.status === 'active') {
        idAvaibleAgents.push(agent.id);
      }
    });
    WzRequest.apiReq('PUT', `/agents/restart`, { ids: [...idAvaibleAgents] })
      .then(value => {
        value.status === 200
          ? this.showToast('success', '重启所有代理...', '', 5000)
          : this.showToast('warning', '重启所有代理时出错。', '', 5000);
      })
      .catch(error => {
        this.showToast('danger', '重启所有代理时出错。', error, 5000);
      });
  }

  /**
   * Delete an agent
   * @param {Number} selectedItems
   */
  static deleteAgents(selectedItems) {
    const auxAgents = selectedItems
      .map(agent => {
        return agent.id !== '000' ? agent.id : null;
      })
      .filter(agent => agent !== null);
    WzRequest.apiReq('DELETE', `/agents`, {
      purge: true,
      ids: auxAgents,
      older_than: '1s'
    })
      .then(value => {
        value.status === 200
          ? this.showToast(
              'success',
              `选择的代理已成功删除`,
              '',
              5000
            )
          : this.showToast(
              'warning',
              `删除所选代理失败`,
              '',
              5000
            );
      })
      .catch(error => {
        this.showToast(
          'danger',
          `删除所选代理失败`,
          error,
          5000
        );
      });
  }

  /**
   * This function compare version between any agents and master.
   * Return true if ManagerVersion > AgentVersion
   * @param {String} agentVersion
   * @param {String} managerVersion
   * @returns {Boolean}
   */
  static compareVersions(managerVersion, agentVersion) {
    let agentMatch = new RegExp(
      /[.+]?v(?<version>\d+)\.(?<minor>\d+)\.(?<path>\d+)/
    ).exec(agentVersion);
    let managerMatch = new RegExp(
      /[.+]?v(?<version>\d+)\.(?<minor>\d+)\.(?<path>\d+)/
    ).exec(managerVersion);
    if (agentMatch === null || managerMatch === null) return;
    return managerMatch[1] <= agentMatch[1]
      ? managerMatch[2] <= agentMatch[2]
        ? managerMatch[3] <= agentMatch[3]
          ? true
          : false
        : false
      : false;
  }
}
