import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSpacer,
  EuiPage,
  EuiPanel,
  EuiBasicTable,
  EuiFieldSearch,
  EuiInMemoryTable,
  EuiText,
} from '@elastic/eui';
import { getToasts } from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { AppState } from '../../../react-services/app-state';

export class SearchList extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      searchParams: {},
      isLoading:false,
      currentUserInfo: {},
      departmentGroups: [],
    }
    this.textSearchTimer = null;
  }

  async componentDidMount() {
    this._isMount = true;
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }
    this.initParams();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectView !== this.props.selectView) {
      this.initParams();
      return;
    }
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevProps.selectView !== this.props.selectView) {
      await this.getItems();
    }
  }

  async getItems() {
    console.log('查询列表', this.props.searchProps.searchUrl, this.state.searchParams)
    this.setState({ listItems: [], totalItems: 0, isLoading: true });
    const { searchParams, currentUserInfo, departmentGroups } = this.state;
    const { selectView, searchProps } = this.props;

    if (currentUserInfo.department && departmentGroups.length === 0) {
      this.setState({ isLoading: false });
      return
    }
    
    let url = `${searchProps.searchUrl}`;
    Object.keys(searchParams).map(k => {
      if (searchParams[k]) {
        url += `&${k}=${searchParams[k]}`
      }
    })
    if (currentUserInfo.department) url += `${url.charAt(url.length -1) === '?' ? '' : '&'}groups_list=${departmentGroups.map(k => `${k.name}`).join(',')}`

    const rawDetails = await WzRequest.apiReq( 'GET', url, { params: this.buildFilter() } );
    const { affected_items } = (
      ((rawDetails || {}).data || {}).data || {}
    );
    const totalItems = (
      ((rawDetails || {}).data || {}).data || {}
    ).total_affected_items;

    let listItems = affected_items.map(item => {
      if ( selectView === 'agent' ) {
        item.detailSearch = {
          searchUrl: `/syscollector/${item.agent_id}/${searchProps.detailUrl}`,
          params: {}
        }
      }
      else {
        let url = {
          'software': '/experimental/syscollector/packages',
          'account': '/experimental/syscollector/accounts',
          'ports': '/experimental/syscollector/ports',
        }
        let viewParams = {
          'software': {
            name: item.package,
            agents_list: item.agent_id
          },
          'account': {
            user_name: item.user_name,
            // agents_list: item.agent_id
          },
          'ports': {
            'local.port': item.local_port,
            agents_list: item.agent_id
          }
        }
        item.detailSearch = {
          searchUrl: url[selectView],
          params: viewParams[selectView]
        }
      }
      return item;
    })
    this.setState({ listItems, totalItems, isLoading: false });
  }

  buildFilter() {
    const { pageIndex, pageSize } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };
    // filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;

    return filter;
  }

  initParams() {
    const { searchProps } = this.props;
    const { paramsOptions } = searchProps;
    let searchParams = {};
    paramsOptions.forEach(k => {
      searchParams[k.type] = k.initValue ? k.initValue : ''
    });
    this.setState({ searchParams }, this.getItems)
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  onSearchText(value, type, searchDelay = '') {
    const { searchParams } = this.state;
    searchParams[type] = value;
    this.setState({
      searchParams
    });
    if (searchDelay) {
      if (this.textSearchTimer) clearTimeout(this.textSearchTimer);
      this.textSearchTimer = null;
      this.textSearchTimer = setTimeout(() => {
        this.getItems()
        clearTimeout(this.textSearchTimer);
        this.textSearchTimer = null;
      }, searchDelay);
    }
    else {
      this.getItems();
    }
  }

  onSearchSelect(e, type) {
    const { searchParams } = this.state;
    searchParams[type] = e.target.value;
    this.setState(
      {
        searchParams
      },
      this.getItems
    );
  }

  header() {
    const { searchParams } = this.state;
    const { searchProps } = this.props;
    const { paramsOptions } = searchProps;
    return (
      <div>
        <EuiFlexGroup>
        {Object.keys(paramsOptions).map((idx) => (
          <EuiFlexItem grow={false} key={idx}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{paramsOptions[idx].label}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
              { paramsOptions[idx].inputType === 'text' && (
                <EuiFieldSearch
                  value={searchParams[paramsOptions[idx].type]}
                  onChange={(e) => this.onSearchText(e.target.value, paramsOptions[idx].type, 500)}
                  // onSearch={(e) => this.onSearchText(searchParams[paramsOptions[idx].type], paramsOptions[idx].type)}
                  placeholder={`过滤${paramsOptions[idx].label}`}
                  aria-label={`过滤${paramsOptions[idx].label}`}
                  fullWidth
                />
              )}
              { paramsOptions[idx].inputType === 'select' && (
                <EuiSelect
                  options={paramsOptions[idx].selectOptions}
                  value={searchParams[paramsOptions[idx].type]}
                  onChange={(e) => this.onSearchSelect(e, paramsOptions[idx].type)}
                  aria-label={`过滤${paramsOptions[idx].label}`}
                />
              )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}
        </EuiFlexGroup>
        <EuiSpacer size="l" />
      </div>
    )
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  tableRender() {
    const {
      pageIndex,
      pageSize,
      totalItems,
      listItems,
      isLoading,
    } = this.state;
    const { searchProps } = this.props;
    const { paramsOptions } = searchProps;
    const columns = this.props.searchProps.columns;
    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    return (
      <EuiBasicTable
        items={listItems}
        itemId="id"
        loading={isLoading}
        columns={columns}
        onChange={this.onTableChange}
        noItemsMessage="暂无数据"
        {...(pagination && { pagination })}
      />
      // <EuiInMemoryTable
      //   itemId="id"
      //   items={listItems}
      //   loading={isLoading}
      //   columns={columns}
      //   {...(pagination && { pagination })}
      //   onTableChange={(change) => this.onTableChange(change)}
      //   message={message}
      //   search={paramsOptions.length === 0 ? { box: { incremental: true, placeholder: '过滤' } } : false}
      // />
    )
  }

  render() {
    const header = this.header();
    const table = this.tableRender();
    const { searchProps } = this.props;
    const { paramsOptions } = searchProps;
    return (
      <EuiPage>
        <EuiPanel>
          {paramsOptions.length > 0 && header}
          {table}
        </EuiPanel>
      </EuiPage>
    )
  }
}