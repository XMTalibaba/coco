/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiPanel,
  EuiPage,
  EuiTabs,
  EuiTab,
  EuiTitle,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
  EuiSpacer,
  EuiProgress,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiHorizontalRule,
  EuiButtonEmpty
} from '@elastic/eui';
import {
  InventoryTable,
  FilterBar,
  RegistryTable
} from './inventory/';
import { WzRequest } from '../../../react-services/wz-request';
import exportCsv from '../../../react-services/wz-csv';
import { getToasts }  from '../../../kibana-services';
import { ICustomBadges } from '../../wz-search-bar/components';
import { filtersToObject } from '../../wz-search-bar';
import { WzEmptyPromptNoPermissions } from "../../common/permissions/prompt";

export class Inventory extends Component {
  _isMount = false;
  state: {
    filters: [];
    selectedTabId: 'files' | 'registry';
    totalItemsFile: number;
    totalItemsRegistry: number;
    isLoading: Boolean;
    syscheck: [];
    customBadges: ICustomBadges[];
    isConfigured: Boolean;
  };

  props: any;

  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      syscheck: [],
      selectedTabId: 'files',
      totalItemsFile: 0,
      totalItemsRegistry: 0,
      isLoading: true,
      customBadges: [],
      isConfigured: false
    }
    this.onFiltersChange.bind(this);
  }

  async componentDidMount() {
    this._isMount = true;
    await this.loadAgent();
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.agent) !== JSON.stringify(prevProps.agent)){
      this.setState({isLoading: true}, this.loadAgent)
    }
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  async loadAgent() {
    const agentPlatform  = ((this.props.agent || {}).os || {}).platform;
    const {totalItemsFile, syscheck} = await this.getItemNumber('file');
    const totalItemsRegistry = agentPlatform === 'windows' ? await this.getItemNumber('registry') : 0;
    const isConfigured = await this.isConfigured();
    if (this._isMount){
      this.setState({ totalItemsFile, totalItemsRegistry, syscheck, isLoading: false, isConfigured });
    }
  }

  // Do not load the localStorage filters when changing tabs
  // componentDidUpdate(prevProps, prevState) {
  //   const { selectedTabId } = this.state;
  //   if (selectedTabId !== prevState.selectedTabId) {
  //     const filters = this.getStoreFilters(this.props);
  //     this.setState({ filters });
  //   }
  // }

  tabs() {
    let auxTabs = [
      {
        id: 'files',
        name: `文件 ${this.state.isLoading === true ? '' : '(' + this.state.totalItemsFile + ')'}`,
        disabled: false,
      },
    ]
    const platform = (this.props.agent.os || {}).platform || "other";
     platform  === 'windows' ? auxTabs.push(
      {
        id: 'registry',
        name: `Windows注册表 ${this.state.isLoading === true ? '' : '(' + this.state.totalItemsRegistry + ')'}`,
        disabled: false,
      },
    ) : null;
    return (auxTabs);
  }

  getStoreFilters(props) {
    const { section, selectView, agent } = props;
    const filters = JSON.parse(window.localStorage.getItem(`wazuh-${section}-${selectView}-${((this.state || {}).selectedTabId || 'files')}-${agent['id']}`) || '{}');
    return filters;
  }

  setStoreFilters(filters) {
    const { section, selectView, agent } = this.props;
    window.localStorage.setItem(`wazuh-${section}-${selectView}-${(this.state || {}).selectedTabId || 'files'}-${agent['id']}`, JSON.stringify(filters))
  }

  onFiltersChange = (filters) => {
    // this.setStoreFilters(filters);
    this.setState({ filters });
  }

  onTotalItemsChange = (totalItems: number) => {
    this.setState({ totalItemsFile: totalItems });
  }

  onSelectedTabChanged = id => {
    this.setState({ selectedTabId: id });
  }

  buildFilter(type) {
    const filters = filtersToObject(this.state.filters);
    const filter = {
      ...filters,
      limit: type === 'file' ? '15' : '1',
      ...(type === 'registry' ? {q: 'type=registry_key'} : {type}),
      ...(type === 'file' && {sort: '+file'})
    };
    return filter;
  }

  async getItemNumber(type: 'file' | 'registry') {
    try {
      const agentID = this.props.agent.id;
      const response = await WzRequest.apiReq('GET', `/syscheck/${agentID}`, {
        params: this.buildFilter(type),
      });
      if (type === 'file') {
        return {
          totalItemsFile: ((response.data || {}).data || {}).total_affected_items || 0,
          syscheck: ((response.data || {}).data || {}).affected_items || [],
        };
      }
      return ((response.data || {}).data || {}).total_affected_items || 0;
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast('danger', error, 3000);
    }
  }

  renderTabs() {
    const tabs = this.tabs();
    const { isLoading } = this.state;
    if (tabs.length > 1) {
      return (
        <div>
          <EuiTabs>
            {tabs.map((tab, index) => (
              <EuiTab
                onClick={() => this.onSelectedTabChanged(tab.id)}
                isSelected={tab.id === this.state.selectedTabId}
                disabled={tab.disabled}
                key={index}>
                {tab.name}&nbsp;{isLoading === true && <EuiLoadingSpinner size="s" />}
              </EuiTab>
            ))}
          </EuiTabs>
          <EuiSpacer size="s" />
          <EuiFlexGroup>
            <EuiFlexItem />
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="importAction" onClick={() => this.downloadCsv()}>
              download
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )
    } else {
      return (
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h1> {tabs[0].name}&nbsp;{isLoading === true && <EuiLoadingSpinner size="s" />}</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="importAction" onClick={() => this.downloadCsv()}>
              导download出
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }
  }

  showToast = (color, title, time) => {
    getToasts().add({
      color: color,
      title: title,
      toastLifeTimeMs: time,
    });
  };

  async downloadCsv() {
    const { filters } = this.state;
    try {
      const filtersObject = filtersToObject(filters);
      const formatedFilters = Object.keys(filtersObject).map(key => ({name: key, value: filtersObject[key]}));
      this.showToast('success', '您的下载已自动开始...', 3000);
      await exportCsv(
        '/syscheck/' + this.props.agent.id,
        [
          { name: 'type', value: this.state.selectedTabId === 'files' ? 'file' : this.state.selectedTabId },
          ...formatedFilters
        ],
        `fim-${this.state.selectedTabId}`
      );
    } catch (error) {
      this.showToast('danger', error, 3000);
    }
  }

  renderTable() {
    const { filters, syscheck, selectedTabId, customBadges, totalItemsRegistry, totalItemsFile } = this.state;
    return (
      <div>
        <FilterBar
          filters={filters}
          onFiltersChange={this.onFiltersChange}
          selectView={selectedTabId}
          agent={this.props.agent} />
        {selectedTabId === 'files' &&
          <InventoryTable
            {...this.props}
            filters={filters}
            items={syscheck}
            totalItems={totalItemsFile}
            onFiltersChange={this.onFiltersChange}
            onTotalItemsChange={this.onTotalItemsChange}/>
        }
        {selectedTabId === 'registry' &&
          <RegistryTable
            {...this.props}
            filters={filters}
            totalItems={totalItemsRegistry}
            onFiltersChange={this.onFiltersChange} />
        }
      </div>
    )
  }

  noConfiguredMonitoring() {
    return (
      <EuiEmptyPrompt
        iconType="filebeatApp"
        title={<h2>未为此代理配置完整性监控</h2>}
        body={<Fragment>
          <EuiHorizontalRule margin='s' />
          <EuiLink
            href='https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/index.html'
            target="_blank"
            style={{ textAlign: "center" }}
          >
            https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/index.html
          </EuiLink>
          <EuiHorizontalRule margin='s' />
        </Fragment>}
      />);
  }

  loadingInventory() {
    return <EuiPage>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiProgress size="xs" color="primary" />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPage>;
  }

  async isConfigured() {
    try {
      const response = await WzRequest.apiReq(
        'GET',
        `/agents/${this.props.agent.id}/config/syscheck/syscheck`,
        {}
      );

      return (((response.data || {}).data).syscheck || {}).disabled === 'no';
    } catch (error) {
      return false;
    }
  }

  render() {
    const { isLoading, isConfigured } = this.state;
    if (isLoading) {
      return this.loadingInventory()
    }
    const table = this.renderTable();
    const tabs = this.renderTabs();

    return isConfigured
      ? (<EuiPage>
        <EuiPanel>
          {tabs}
          <EuiSpacer size={(((this.props.agent || {}).os || {}).platform || false) === 'windows' ? 's' : 'm'} />
          {table}
        </EuiPanel>
      </EuiPage>)
      : this.noConfiguredMonitoring()
  }
}
