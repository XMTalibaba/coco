/*
 * Wazuh app - Pattern Handler service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { AppState } from './app-state';
import { WzMisc } from '../factories/misc';
import { SavedObject } from './saved-objects';
import { getDataPlugin, getHttp, getToasts } from '../kibana-services';
import { WazuhConfig } from '../react-services/wazuh-config';

export class PatternHandler {
  /**
   * Get the available pattern list
   */
  static async getPatternList(where) {
    try {
      const wazuhConfig = new WazuhConfig();
      const { pattern } = wazuhConfig.getConfig();

      const defaultPatterns = [pattern];
      const selectedPattern = AppState.getCurrentPattern();
      if (selectedPattern && selectedPattern !== pattern) defaultPatterns.push(selectedPattern);
      let patternList = await SavedObject.getListOfWazuhValidIndexPatterns(defaultPatterns, where);

      if (where === 'healthcheck') {
        function getIndexPatterns() {
          return new Promise(function (resolve, reject) {
            setTimeout(async function () {
              const patternList = await SavedObject.getListOfWazuhValidIndexPatterns(
                defaultPatterns,
                where
              );
              resolve(patternList);
            }, 500);
          });
        }

        let i = 0;
        // if the index pattern doesn't exist yet, we check 5 more times with a delay of 500ms
        while (i < 5 && !patternList.length) {
          i++;
          patternList = await getIndexPatterns().then(function (result) {
            return result;
          });
        }

        const indexPatternFound = patternList.find(
          (indexPattern) => indexPattern.title === pattern
        );

        if (!indexPatternFound) {
          // if no valid index patterns are found we try to create the wazuh-alerts-*
          try {
            if (!pattern) return;

            getToasts().add({
              color: 'warning',
              title: `没有发现${pattern.replace('wazuh', '')}索引模式，继续创建`,
              toastLifeTimeMs: 5000,
            });

            if (await SavedObject.getExistingIndexPattern(pattern)) {
              await SavedObject.refreshIndexPattern(pattern);
              getToasts().addSuccess(`${pattern.replace('wazuh', '')}索引模式更新成功`);
            } else {
              await SavedObject.createWazuhIndexPattern(pattern);
              getToasts().addSuccess(`${pattern.replace('wazuh', '')}索引模式创建成功`);
            }

            getDataPlugin().indexPatterns.setDefault(pattern, true);
          } catch (err) {
            getToasts().add({
              color: 'error',
              title: '创建索引模式时出错。',
              text: err.message || err,
              toastLifeTimeMs: 3000,
            });
            AppState.removeCurrentPattern();

            this.wzMisc = new WzMisc();
            this.wzMisc.setBlankScr(
              '对不起，没有找到有效的索引模式，创建失败。'
            );
            if (
              !window.location.hash.includes('#/settings') &&
              !window.location.hash.includes('#/blank-screen')
            ) {
              window.location.href = getHttp().basePath.prepend('/app/wazuh#/blank-screen/');
            }
            return;
          }
          // retry again with the newly created index pattern
          if (
            !window.location.hash.includes('#/settings') &&
            !window.location.hash.includes('#/health-check')
          ) {
            window.location.href = getHttp().basePath.prepend('/app/wazuh#/health-check/');
          }
          patternList = await SavedObject.getListOfWazuhValidIndexPatterns(defaultPatterns, where);
        }
      }

      if (AppState.getCurrentPattern() && patternList.length) {
        let filtered = patternList.filter((item) => item.id === AppState.getCurrentPattern());
        if (!filtered.length) AppState.setCurrentPattern(patternList[0].id);
      }

      return patternList;
    } catch (error) {
      console.error('getPatternList', error);
      throw new Error('错误模式处理程序（getPatternList）。');
    }
  }

  /**
   * Change current pattern for the given pattern
   * @param {String} selectedPattern
   */
  static async changePattern(selectedPattern) {
    try {
      AppState.setCurrentPattern(selectedPattern);
      await this.refreshIndexPattern();
      return AppState.getCurrentPattern();
    } catch (error) {
      throw new Error('错误模式处理程序（changePattern）。');
    }
  }

  /**
   * Refresh current pattern for the given pattern
   * @param newFields
   */
  static async refreshIndexPattern(newFields = null) {
    try {
      const currentPattern = AppState.getCurrentPattern();
      const pattern = await getDataPlugin().indexPatterns.get(currentPattern);
      await SavedObject.refreshIndexPattern(pattern, newFields);
    } catch (error) {
      throw new Error(error);
    }
  }
}
