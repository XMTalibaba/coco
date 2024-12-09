import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiFieldSearch,
  EuiButton,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';

export class WebServices extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      search: '',
      isLoading: false
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;
    if (this.props.selectView === 'webServices') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'webServices')
      && (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize)) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this.setState({ isLoading: true });
      const { selectAgent } = this.props;
      const rawItems = await WzRequest.apiReq(
        'GET',
        `/syscollector/${selectAgent.id}/webservers?pretty=true`,
        { params: this.buildFilter() }
      );

      const formatedAgents = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;

      this.setState({
        listItems: formatedAgents,
        totalItems: (((rawItems || {}).data || {}).data || {}).total_affected_items,
        isLoading: false
      });
        
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  buildFilter() {
    const { pageIndex, pageSize, search } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize
    };
    if (search) filter.search = search;

    return filter;
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this.setState({
      pageIndex,
      pageSize
    });
  };

  changeSearch(e) {
    this.setState({ search: e.target.value });
    if (this.textSearchTimer) clearTimeout(this.textSearchTimer);
    this.textSearchTimer = null;
    this.textSearchTimer = setTimeout(() => {
      this.getItems()
      clearTimeout(this.textSearchTimer);
      this.textSearchTimer = null;
    }, 500);
  }

  tableRender() {
    const {
      listItems,
      totalItems,
      pageIndex,
      pageSize,
      isLoading,
      search,
    } = this.state;
    const columns = [
      {
        field: 'server_name',
        name: '服务名',
      },
      {
        field: 'version',
        name: '版本',
      },
      {
        field: 'scan_time',
        name: '扫描日期',
        render: field => formatUIDate(field)
      },
    ];

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
      <div>
        <EuiFieldSearch
          placeholder={`过滤Web服务列表`}
          value={search}
          fullWidth={true}
          onChange={e => this.changeSearch(e)}
          aria-label={`过滤Web服务列表`}
        />
        <EuiSpacer size="m" />
        <EuiBasicTable
          items={listItems}
          columns={columns}
          pagination={pagination}
          loading={isLoading}
          onChange={this.onTableChange}
          noItemsMessage="未找到数据"
        />
      </div>
    )
  }
  
  async downloadCsv () {
    const { selectAgent } = this.props;
    const { search } = this.state;
    const csvKey = ['server_name', 'version', 'scan_time', 'agent_id', 'agent_ip', 'agent_name'];
    await AppState.downloadCsv(
      `/syscollector/${selectAgent.id}/webservers?pretty=true`,
      `${selectAgent.name}-Web服务.csv`,
      !!search ? [{ name: 'search', value: search }] : [],
      csvKey
    )
  }

  render() {
    const { totalItems } = this.state;
    const table = this.tableRender();
		return (
			<div>
				<EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`Web服务`}</h4>
            </EuiTitle>
          </EuiFlexItem>
          { totalItems > 0 && 
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.downloadCsv()}
            >
              导出CSV
            </EuiButton>
          </EuiFlexItem>
          }
        </EuiFlexGroup>
				<EuiSpacer size="s"></EuiSpacer>
        {table}
			</div>
		);
	}

}