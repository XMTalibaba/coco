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
import React, { Component } from 'react';
import { getFilterValues } from './lib';
import { WzSearchBar, IFilter, IWzSuggestItem } from '../../../../components/wz-search-bar'
import { ICustomBadges } from '../../../wz-search-bar/components';
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import moment from 'moment';

export class FilterBar extends Component {
  formatDate = (date: String) => {
    return moment(date).format('YYYY-MM-DD');
  }
  // TODO: Change the type
  suggestions: {[key:string]: IWzSuggestItem[]} = {
    files: [
      {type: 'q', label: 'file', description:"文件名", operators:['=','!=', '~'], values: async (value) => getFilterValues('file', value, this.props.agent.id, {type:'file'})},
      ...(((this.props.agent || {}).os || {}).platform !== 'windows' ? [{type: 'q', label: 'perm', description:"文件权限", operators:['=','!=', '~'], values: async (value) => getFilterValues('perm', value, this.props.agent.id)}]: []),
      {type: 'q', label: 'mtime', description:"文件被修改的日期", operators:['=','!=', '>', '<'], values: async (value) => getFilterValues('mtime', value, this.props.agent.id,{}, this.formatDate)},
      {type: 'q', label: 'date', description:"活动登记日期", operators:['=','!=', '>', '<'], values: async (value) => getFilterValues('date', value, this.props.agent.id, {}, this.formatDate)},
      {type: 'q', label: 'uname', description:"文件的所有者", operators:['=','!=', '~'], values: async (value) => getFilterValues('uname', value, this.props.agent.id)},
      {type: 'q', label: 'uid', description:"onowner文件Id", operators:['=','!=', '~'], values: async (value) => getFilterValues('uid', value, this.props.agent.id)},
      ...(((this.props.agent || {}).os || {}).platform !== 'windows' ? [{type: 'q', label: 'gname', description:"组所有者文件的名称", operators:['=','!=', '~'], values: async (value) => getFilterValues('gname', value, this.props.agent.id)}]: []),
      ...(((this.props.agent || {}).os || {}).platform !== 'windows' ? [{type: 'q', label: 'gid', description:"组所有者Id", operators:['=','!=', '~'], values: async (value) => getFilterValues('gid', value, this.props.agent.id)}]: []),
      {type: 'q', label: 'md5', description:"md5哈希", operators:['=','!=', '~'], values: async (value) => getFilterValues('md5', value, this.props.agent.id)},
      {type: 'q', label: 'sha1', description:"sha1哈希", operators:['=','!=', '~'], values: async (value) => getFilterValues('sha1', value, this.props.agent.id)},
      {type: 'q', label: 'sha256', description:"sha256哈希", operators:['=','!=', '~'], values: async (value) => getFilterValues('sha256', value, this.props.agent.id)},
      ...(((this.props.agent || {}).os || {}).platform !== 'windows' ? [{type: 'q', label: 'inode', description:"文件的索引节点", operators:['=','!=', '~'], values: async (value) => getFilterValues('inode', value, this.props.agent.id)}]: []),
      {type: 'q', label: 'size', description:"文件大小(以字节为单位)", values: async (value) => getFilterValues('size', value, this.props.agent.id)}, 
    ],
    registry: [
      {type: 'q', label: 'file', description:"registry_key的名称", operators:['=','!=', '~'], values: async (value) => getFilterValues('file', value, this.props.agent.id, {q:'type=registry_key'})},
    ]
  }

  props!:{
    onFiltersChange(filters:IFilter[]): void
    selectView: 'files' | 'registry'
    agent: {id: string, agentPlatform: string}
    onChangeCustomBadges?(customBadges: ICustomBadges[]): void 
    customBadges?: ICustomBadges[]
    filters: IFilter[]
  }

  render() {
    const { onFiltersChange, selectView, filters} = this.props;
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <WzSearchBar
            noDeleteFiltersOnUpdateSuggests
            filters={filters}
            onFiltersChange={onFiltersChange}
            suggestions={this.suggestions[selectView]}
            placeholder='过滤或搜索文件' />
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }
}