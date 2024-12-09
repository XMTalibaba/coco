import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPage,
  EuiPanel,
  EuiTitle,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiInMemoryTable,
} from '@elastic/eui';
import { getToasts } from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class DetailList extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading:false,
    }
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getItems();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevProps.searchProps.searchUrl !== this.props.searchProps.searchUrl) {
      await this.getItems();
    }
  }

  async getItems() {
    console.log('查询详情', this.props.searchProps.searchUrl)
    // let listItems = [
    //   { title: '名称1'},
    //   { title: '名称2'},
    //   { title: '名称3'},
    // ]
    // this.setState({ listItems, totalItems: 3 });
    this.setState({ isLoading: true });
    const { searchProps } = this.props;
    const rawDetails = await WzRequest.apiReq( 'GET', searchProps.searchUrl, {params: this.buildFilter()} );
    const { affected_items } = (
      ((rawDetails || {}).data || {}).data || {}
    )
    let totalItems = (
      ((rawDetails || {}).data || {}).data || {}
    ).total_affected_items;
    this.setState({ listItems: affected_items, totalItems, isLoading: false });
  }

  buildFilter() {
    const { pageIndex, pageSize } = this.state;
    const { searchProps } = this.props;

    const filter = {
      ...searchProps.params,
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };

    return filter;
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>详情列表</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  tableRender() {
    const {
      pageIndex,
      pageSize,
      totalItems,
      listItems,
      isLoading,
    } = this.state;
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
    )
  }

  render() {
    const header = this.headRender();
    const table = this.tableRender();
    return (
      <EuiPage>
        <EuiPanel>
          {header}
          {table}
        </EuiPanel>
      </EuiPage>
    )
  }
}