/*
 * Wazuh app - Table with search bar
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { useState, useEffect } from 'react';
import { EuiBasicTable, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiTitle, EuiButton } from '@elastic/eui';
import { WzSearchBar } from '../../wz-search-bar/'
import GroupsHandler from '../../../controllers/management/components/management/groups/utils/groups-handler';
import { TableSearch } from '../../../controllers/agent/components/table-search';
import { WzRequest } from '../../../react-services/wz-request';

export function TableWithSearchBar({
  onSearch,
  searchBarSuggestions,
  keyName,
  searchBarPlaceholder = '筛选或搜索',
  searchBarProps = {},
  tableColumns,
  tablePageSizeOptions = [15, 25, 50, 100],
  tableInitialSortingDirection = 'asc',
  tableInitialSortingField = '',
  tableProps = {},
  reload
})
  {

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tablePageSizeOptions[0]
  });

  const [sorting, setSorting] = useState({
    sort: {
      field: tableInitialSortingField,
      direction: tableInitialSortingDirection,
    }
  });

  const [paramsOptions, setParamsOptions] = useState([
    {
      label: '状态',
      type: 'status',
      inputType: 'select',
      selectOptions: [
        { value: '', text: '所有状态' },
        { value: 'active', text: '已连接' },
        { value: 'disconnected', text: '未连接' },
        { value: 'never_connected', text: '从未连接' },
      ]
    },
    {
      label: '组',
      type: 'group',
      inputType: 'select',
      selectOptions: []
    },
    {
      label: 'IP',
      type: 'ip', // 参数字段
      inputType: 'text',
    },
    {
      label: '操作系统',
      type: 'os.platform',
      inputType: 'select',
      selectOptions: []
    },
    {
      label: '名称',
      type: 'name',
      inputType: 'text',
    },
  ]);
  const [searchParams, setSearchParams] = useState({});

  React.useEffect(() => {   
    initOptions();
  }, []);

  const initOptions = async () => {
    setParamsOptions([
      {
        label: '状态',
        type: 'status',
        inputType: 'select',
        selectOptions: [
          { value: '', text: '所有状态' },
          { value: 'active', text: '已连接' },
          { value: 'disconnected', text: '未连接' },
          { value: 'never_connected', text: '从未连接' },
        ]
      },
      {
        label: 'IP',
        type: 'ip', // 参数字段
        inputType: 'text',
      },
      {
        label: '操作系统',
        type: 'os.platform',
        inputType: 'select',
        selectOptions: await getOsOptions()
      },
      {
        label: '名称',
        type: 'name',
        inputType: 'text',
      },
    ]);
  }

  const getOsOptions = async () => {
    try {
      const rawOsItems = await WzRequest.apiReq(
        'GET',
        '/agents/stats/distinct',
        { params: { fields: "os.platform", q: "id!=000" } }
      );
      let rawOs = ((rawOsItems || {}).data || {}).data.affected_items;
      let osOptions = rawOs.map(k => {
				let item = {
					value: k.os.platform,
					text: k.os.platform
				}
				return item;
			});
      osOptions.unshift({ value: '', text: '所有操作系统' })
      return osOptions;
    } catch (error) {
      console.log(error)
    }
  };

  const getList = async (searchParams) => {
    try{
      setSearchParams(searchParams);
      let filters = [];
      Object.keys(searchParams).forEach(k => {
        if (searchParams[k]) {
          filters.push({
            field: 'q',
            value: `${k}=${searchParams[k]}`
          })
        }
      })
      setFilters(filters);
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize
      });
    }catch(error){
      setItems([]);
    }
    setLoading(false);
  }
  
  function tableOnChange({ page = {}, sort = {} }){
    const { index: pageIndex, size: pageSize } = page;
    const { field, direction } = sort;
    setPagination({
      pageIndex,
      pageSize
    });
    setSorting({
      sort: {
        field,
        direction,
      },
    });
  };
  
  useEffect(() => {
    (async function(){
      try{
        setLoading(true);
        const { items, totalItems } = await onSearch(filters, pagination, sorting);
        setItems(items);
        setTotalItems(totalItems);
      }catch(error){
        setItems([]);
        setTotalItems(0);
      }
      setLoading(false);
    })()
  }, [filters, pagination, sorting, reload]);

  const tablePagination = {
    ...pagination,
    totalItemCount: totalItems,
    pageSizeOptions: tablePageSizeOptions
  }
  return <>
    {/* <WzSearchBar
      noDeleteFiltersOnUpdateSuggests
      filters={filters}
      onFiltersChange={setFilters}
      suggestions={searchBarSuggestions}
      keyName={keyName}
      placeholder={searchBarPlaceholder}
      {...searchBarProps}
    /> */}
    <TableSearch paramsOptions={paramsOptions} getList={(searchParams) => getList(searchParams)} />
    <div style={{ marginTop: '12px' }}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              {!!items.length && (
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>代理 ({items.length})</h2>
                </EuiTitle>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            size="s"
            onClick={() => getList(searchParams)}
          >
            刷新
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size='xs'/>
    </div>
    <EuiBasicTable
      columns={tableColumns}
      items={items}
      noItemsMessage="无数据"
      loading={loading}
      pagination={tablePagination}
      sorting={sorting}
      onChange={tableOnChange}
      {...tableProps}
    />
  </>
}
