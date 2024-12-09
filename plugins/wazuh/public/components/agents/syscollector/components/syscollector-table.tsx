import React, { useState } from "react";
import { EuiPanel, EuiFlexGroup, EuiButtonEmpty, EuiFlexItem, EuiText, EuiLoadingSpinner, EuiFieldSearch, EuiHorizontalRule, EuiIcon, EuiBasicTable, EuiButton } from "@elastic/eui";
import { useApiRequest } from '../../../common/hooks/useApiRequest';
import { KeyEquivalence } from '../../../../../common/csv-key-equivalence';
import { AppState } from '../../../../react-services/app-state';
import { formatUIDate } from '../../../../react-services/time-service'


export function SyscollectorTable({ tableParams }) {
  const [params, setParams] = useState(tableParams.searchInit ? { limit: 10, offset: 0, search: tableParams.searchInit } : tableParams.qInit ? { limit: 10, offset: 0, q: tableParams.qInit } : {limit: 10, offset: 0});
  const [pageIndex, setPageIndex] = useState(0);
  const [searchBarValue, setSearchBarValue] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('');
  const [timerDelaySearch, setTimerDelaySearch] = useState<NodeJS.Timeout>();
  const [sortDirection, setSortDirection] = useState('');
  const [loading, data, error] = useApiRequest('GET', tableParams.path, params);

  // 汉化分页
  let domArr = $(".euiButtonEmpty__text:contains('Rows per page')");
  domArr.length > 0 && domArr.each(function() {
    let text = $(this).text();
    text = text.replace(/Rows per page/g, '每页行数');
    $(this).text(text);
  })

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    setPageIndex(pageIndex);
    setPageSize(pageSize);
    setSortField(sortField);
    setSortDirection(sortDirection);
    const field = (sortField === 'os_name') ? '' : sortField;
    const direction = (sortDirection === 'asc') ? '+' : '-';
    const newParams = {
      ...params,
      limit: pageSize,
      offset: Math.floor((pageIndex * pageSize) / params.limit) * params.limit,
      ...(!!field ? { sort: `${direction}${field}` } : {})
    }

    setParams(newParams);

  };

  const buildColumnsTime = (field) => {
    return formatUIDate(field);
  }

  const buildColumns = () => {
    return (tableParams.columns || []).map(item => {
      if (item.id === 'scan_time') {
        return {
          field: item.id,
          name: item.label || KeyEquivalence[item.id] || item.id,
          sortable: typeof item.sortable !== 'undefined' ? item.sortable : true,
          width: item.width || undefined,
          render: field => buildColumnsTime(field)
        }
      }
      return {
        field: item.id,
        name: item.label || KeyEquivalence[item.id] || item.id,
        sortable: typeof item.sortable !== 'undefined' ? item.sortable : true,
        width: item.width || undefined,
      };
    });
  };

  const columns = buildColumns();

  const pagination = {
    pageIndex: pageIndex,
    pageSize: pageSize,
    totalItemCount: data.total_affected_items || 0,
    pageSizeOptions: [10, 25, 50],
  };

  const sorting = {
    sort: {
      field: sortField,
      direction: sortDirection,
    }
  };

  const onChange = (e) => {
    const value = e.target.value;
    setSearchBarValue(value);
    timerDelaySearch && clearTimeout(timerDelaySearch);
    const timeoutId = setTimeout(() => {
      const newParams = { ...params, search: value };
      setParams(newParams);
      setPageIndex(0);
    }, 400)
    setTimerDelaySearch(timeoutId);
  }

  const getTotal = () => {
    if (loading)
      return <>{'( '}<EuiLoadingSpinner></EuiLoadingSpinner>{' )'}</>;
    else
      return `(${data.total_affected_items})`;
  }

  const downloadCsv = async () => {
    await AppState.downloadCsv(
      tableParams.path,
      tableParams.exportFormatted,
      !!params.search ? [{ name: 'search', value: params.search }] : []
    )
  }

  return (
    <EuiPanel paddingSize="m" style={{ margin: '12px 16px 12px 16px' }}>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <span style={{ display: "flex" }}> <EuiIcon type={tableParams.icon} style={{ marginTop: 3 }}></EuiIcon>  &nbsp; <EuiText>{tableParams.title} {tableParams.hasTotal ? getTotal() : ''}</EuiText> </span>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule margin="xs" />
      {tableParams.searchBar &&
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFieldSearch
              placeholder={`过滤${tableParams.title.toLowerCase()}`}
              value={searchBarValue}
              fullWidth={true}
              onChange={onChange}
              aria-label={`过滤${tableParams.title.toLowerCase()}`}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      }
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            items={data.affected_items || []}
            columns={columns}
            pagination={pagination}
            loading={loading}
            error={error}
            sorting={sorting}
            onChange={onTableChange}
            noItemsMessage="未找到数据"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {tableParams.exportFormatted && tableParams.columns && (
        <EuiFlexGroup>
          <EuiFlexItem grow={true} />
          <EuiFlexItem grow={false}>
            {/* <EuiButtonEmpty
              onClick={downloadCsv}
              iconType="importAction"
            >
              下载CSV
            </EuiButtonEmpty> */}
            <EuiButton
              size="s"
              onClick={downloadCsv}
            >
              下载CSV
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiPanel>
  );
}
