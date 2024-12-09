import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiFieldSearch,
  EuiButton,
  EuiToolTip,
  EuiInMemoryTable,
  EuiButtonIcon,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';

export class MirrorContain extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      search: '',
      isLoading: false,
      portList: [],
      isPortModalVisible: false,
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;
    if (this.props.selectView === 'mirrorContain') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'mirrorContain')
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
        `/syscollector/${selectAgent.id}/containers?pretty=true`,
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
        field: 'container_id',
        name: '容器ID',
      },
      {
        field: 'image_name',
        name: '镜像名称',
      },
      {
        field: 'image_tag',
        name: '镜像标签',
      },
      {
        field: 'scan_time',
        name: '扫描日期',
        render: field => formatUIDate(field)
      },
      {
        align: 'right',
        width: '50',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
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
          placeholder={`过滤容器列表`}
          value={search}
          fullWidth={true}
          onChange={e => this.changeSearch(e)}
          aria-label={`过滤容器列表`}
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

  portTableRender() {
    const { portList, isLoading } = this.state;
    const columns = [
      {
        field: 'host',
        name: '主机端口',
      },
      {
        field: 'contain',
        name: '容器端口',
      }
    ]
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        items={portList}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤端口映射' } }}
      />
    )
  }

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="查看端口映射"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.toShowPortModal(item);
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查看端口映射"
          />
        </EuiToolTip>
      </div>
    );
  }

  toShowPortModal(item) {
    let portList = item.port_bindings === 'null' ? [] : item.port_bindings.split(';').map(k => ({ host: k.split('->')[0], contain: k.split('->')[1] }))
    this.setState({ portList });
    this.setPortModal(true);
  }

  setPortModal(flag) {
    this.setState({isPortModalVisible: flag});
    if (!flag) this.setState({ portList: [] });
  }
  
  async downloadCsv () {
    const { selectAgent } = this.props;
    const { search } = this.state;
    const csvKey = ['container_id', 'port_bindings', 'image_name', 'image_tag', 'scan_time'];
    await AppState.downloadCsv(
      `/syscollector/${selectAgent.id}/containers?pretty=true`,
      `${selectAgent.name}-容器.csv`,
      !!search ? [{ name: 'search', value: search }] : [],
      csvKey
    )
  }

  render() {
    const { totalItems, isPortModalVisible } = this.state;
    const table = this.tableRender();

    let portModal, portTable;
    if (isPortModalVisible) {
      portTable = this.portTableRender();
      portModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setPortModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>端口映射</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                {portTable}
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButton onClick={() => this.setPortModal(false)} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
		return (
			<div>
				<EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`容器`}</h4>
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
        {portModal}
			</div>
		);
	}

}