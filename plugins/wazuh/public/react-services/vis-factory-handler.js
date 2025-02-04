 
/*
 * Wazuh app - Vis factory handler service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { DiscoverPendingUpdates } from '../factories/discover-pending-updates';
import { VisHandlers } from '../factories/vis-handlers';
import { RawVisualizations } from '../factories/raw-visualizations';
import { LoadedVisualizations } from '../factories/loaded-visualizations';
import { TabVisualizations } from '../factories/tab-visualizations';
import { AppState } from './app-state';
import { GenericRequest } from './generic-request';
import store from '../redux/store';
import { updateVis } from '../redux/actions/visualizationsActions';
import { getAngularModule } from '../kibana-services';

export class VisFactoryHandler {
  /**
   * Remove visualizations data
   * @param {Boolean} onlyAgent
   */
  static clear(onlyAgent = false) {
    const discoverPendingUpdates = new DiscoverPendingUpdates();
    const visHandlers = new VisHandlers();
    const loadedVisualizations = new LoadedVisualizations();
    const rawVisualizations = new RawVisualizations();

    if (!onlyAgent) visHandlers.removeAll();
    discoverPendingUpdates.removeAll();
    rawVisualizations.removeAll();
    loadedVisualizations.removeAll();
  }

  /**
   * Remove all visualizations data
   * @param {Boolean} onlyAgent
   */
  static clearAll() {
    const tabVisualizations = new TabVisualizations();
    this.clear();
    tabVisualizations.removeAll();
  }

  static buildWorkbenchVisualizations(raw, searchSource) {
    const discoverPendingUpdates = new DiscoverPendingUpdates();
    discoverPendingUpdates.removeAll();
    discoverPendingUpdates.addItem(searchSource, []);
    const rawVisualizations = new RawVisualizations();
    rawVisualizations.setType('workbench');
    rawVisualizations.assignItems(raw);
    store.dispatch(updateVis({ update: true, raw: rawVisualizations.getList() }));
    return;
  }

  /**
   * Build the overview section visualizations
   * @param {*} filterHandler
   * @param {*} tab
   * @param {*} subtab
   * @param {*} localChange
   */
  static async buildOverviewVisualizations(filterHandler, tab, subtab, fromDiscover = false) {
    const rawVisualizations = new RawVisualizations();
    //if(rawVisualizations.getType() !== 'general'){
      rawVisualizations.setType('general');
      const $injector = getAngularModule().$injector;
      const commonData = $injector.get('commonData');
  
      try {
        const currentPattern = AppState.getCurrentPattern();
        const data =
          tab !== 'sca'
            ? await GenericRequest.request(
                'GET',
                `/elastic/visualizations/overview-${tab}/${currentPattern}`
              )
            : false;
        data && rawVisualizations.assignItems(data.data.raw);
        if(!fromDiscover){
          commonData.assignFilters(filterHandler, tab);
        }
        store.dispatch(updateVis({ update: true, raw: rawVisualizations.getList() }));
        return;
      } catch (error) {
        return Promise.reject(error);
      }
    //}
  }

  /**
   * Build the agents section visualizations
   * @param {*} filterHandler
   * @param {*} tab
   * @param {*} subtab
   * @param {*} localChange
   * @param {*} id
   */
  static async buildAgentsVisualizations(filterHandler, tab, subtab, id, fromDiscover = false){
    const rawVisualizations = new RawVisualizations();
  //  if (rawVisualizations.getType() !== 'agents') {
      rawVisualizations.setType('agents');
      const $injector = getAngularModule().$injector;
      const commonData = $injector.get('commonData');

      try {
        const data =
          tab !== 'sca'
            ? await GenericRequest.request(
                'GET',
                `/elastic/visualizations/agents-${tab}/${AppState.getCurrentPattern()}`
              )
            : false;
        data && rawVisualizations.assignItems(data.data.raw);
        if(!fromDiscover){
          commonData.assignFilters(filterHandler, tab, id);
        }
        store.dispatch(updateVis({ update: true }));
        return;
      } catch (error) {
        return Promise.reject(error);
      }
    }
//  }
}