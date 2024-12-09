import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiText,
  EuiSelect,
  EuiButton,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';

export class DeviceInfo extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      sortField: '',
      sortDirection: 'asc',
      totalItems: 0,
      listItems: [],
      dev_type: 'usb',
      isLoading: false,
      pageType: 'manage', // manage：原设备识别管控，record：原外设上下线记录
      isCluster: false,
      nodeList: [],
      selectedNode: ''
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    let nodeList = [];
    let selectedNode = '';
    if (isCluster) {
      const nodeListTmp = await WzRequest.apiReq(
        'GET',
        '/cluster/nodes',
        {}
      );
      if (
        Array.isArray((((nodeListTmp || {}).data || {}).data || {}).affected_items)
      ) {
        nodeList = nodeListTmp.data.data.affected_items.map(clusterNode => ({
          value: clusterNode.name,
          text: `${clusterNode.name} (${clusterNode.type})`
        }))
        selectedNode = nodeList[0].value;
      }
    }
    this.setState({
      isCluster,
      nodeList,
      selectedNode
    });

    if (this.props.selectView === 'deviceInfo') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'deviceInfo')
      && (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection)) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this.setState({ isLoading: true });
      const { selectAgent } = this.props;
			const { dev_type, pageType, isCluster, selectedNode } = this.state;
      const urlOptions = {
        'manage': `/syscollector/${selectAgent.id}/devices?pretty=true&dev_type=${dev_type}`,
        'record': isCluster ? `/cluster/${selectedNode}/logs/device?pretty=true` : '/manager/logs/device?pretty=true',
      }
      const rawItems = await WzRequest.apiReq(
        'GET',
        urlOptions[pageType],
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
    const { selectAgent } = this.props;
    const { pageIndex, pageSize, pageType, dev_type } = this.state;

    let filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      ...this.buildSortFilter()
    };
    if (pageType === 'record') {
      filter['dev_type'] = dev_type;
      filter['location_id'] = selectAgent.id;
    }

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return !!field ? { sort: `${direction}${field}` } : {};
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    });
  };

  onSelectedChanged(e) {
    this.setState({ dev_type: e.target.value }, this.getItems);
  }

  onSelectedPageChanged(e) {
    this.setState({ pageType: e.target.value }, this.getItems);
  }

  onNodeChange = e => {
    this.setState({ selectedNode: e.target.value }, this.getItems);
  }

  tableRender() {
    const {
      listItems,
      totalItems,
      pageIndex,
      sortField,
      sortDirection,
      pageSize,
      isLoading,
      dev_type,
      pageType,
      isCluster,
      nodeList,
      selectedNode,
    } = this.state;
    const columnsOptions = {
      'manage': [
        {
          field: 'dev_id',
          name: '设备ID',
          sortable: true
        },
        {
          field: 'dev_name',
          name: '设备名',
          sortable: true
        },
        {
          field: 'dev_type',
          name: '设备类型',
          sortable: true
        },
        {
          field: 'scan_time',
          name: '扫描日期',
          sortable: true,
          render: field => formatUIDate(field)
        }
      ],
      'record': [
        {
          field: 'timestamp',
          name: '时间',
          render: timestamp => formatUIDate(timestamp),
        },
        {
          field: 'dev_id',
          name: '设备ID',
        },
        {
          field: 'dev_type',
          name: '设备类型',
          render: dev_type => (<span>{dev_type === 'usb' ? 'USB' : '蓝牙'}</span>),
        },
        {
          field: 'dev_action',
          name: '连接动作',
          render: dev_action => (<span>{dev_action === 'connect' ? '上线' : '下线'}</span>),
        },
        {
          field: 'agent_id',
          name: '代理ID',
        },
      ]
    }
    const columns = columnsOptions[pageType]

    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection
      }
    };
    const devTypeOptions = [
			{ value: 'usb', text: 'USB' },
			{ value: 'bluetooth', text: '蓝牙' },
			{ value: 'sata', text: 'SATA' },
			{ value: 'nvme', text: 'NVME' },
			{ value: 'pcie', text: 'PCI-E' }
		]
    const pageOptions = [
      { value: 'manage', text: '设备识别管控' },
      { value: 'record', text: '外设上下线记录' },
    ]

    return (
      <div>
        <EuiFlexGroup justifyContent="flexStart">
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{'数据类型'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
                <EuiSelect
                  options={pageOptions}
                  value={pageType}
                  onChange={(e) => this.onSelectedPageChanged(e)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{'设备类型'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
                <EuiSelect
                  options={devTypeOptions}
                  value={dev_type}
                  onChange={(e) => this.onSelectedChanged(e)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          { isCluster && (
            <EuiFlexItem grow={false}>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiText textAlign="right">{'node节点'}:</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ width: 150 }}>
                  <EuiSelect
                    options={nodeList}
                    value={selectedNode}
                    onChange={this.onNodeChange}
                    aria-label="按node节点过滤"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiBasicTable
          items={listItems}
          columns={columns}
          pagination={pagination}
          loading={isLoading}
          sorting={sorting}
          onChange={this.onTableChange}
          noItemsMessage="未找到数据"
        />
      </div>
    )
  }
  
  async downloadCsv () {
    const { selectAgent } = this.props;
    const { dev_type, pageType, isCluster, selectedNode  } = this.state;
    const urlOptions = {
      'manage': `/syscollector/${selectAgent.id}/devices?pretty=true&dev_type=${dev_type}`,
      'record': isCluster ? `/cluster/${selectedNode}/logs/device?pretty=true` : '/manager/logs/device?pretty=true',
    }
    await AppState.downloadCsv(
      urlOptions[pageType],
      `${selectAgent.name}-外设信息.csv`,
      pageType === 'record' ? [{ name: 'dev_type', value: dev_type }, { name: 'location_id', value: selectAgent.id }] : []
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
              <h4>{`外设信息`}</h4>
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