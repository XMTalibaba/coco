import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiToolTip,
  EuiHealth,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { formatUIDate } from '../../react-services/time-service';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { TemplateDetail }  from './baselineTemplate/template-detail';
import { AppState } from '../../react-services/app-state';

export const BaselineTemplate = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '合规基线' }, { text: '基线模板' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BaselineTemplate extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      currentUserInfo: {},
      listType: 'list',
      selectItem: {},
    };
	}

	async componentDidMount() {
    this._isMount = true;
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawAgents = await WzRequest.apiReq(
        'GET',
        '/sca/000?pretty=true',
        { params: this.buildFilter() }
      );

      const { affected_items, total_affected_items } = ((rawAgents || {}).data || {}).data || {};

      this._isMount &&
        this.setState({
          listItems: affected_items,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }
  buildFilter() {
    const { pageIndex, pageSize } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };

    return filter;
  }
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="模板详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation()
              this.toDetail(item);
            }}
            iconType="eye"
            color={'primary'}
            aria-label="模板详情"
          />
        </EuiToolTip>
      </div>
    )
  }
  columns() {
    return [
      {
        field: 'name',
        name: '模板名',
        width: '300'
      },
      {
        field: 'description',
        name: '描述',
      },
      {
        field: 'total_checks',
        name: '检查项数量',
        width: '80'
      },
      {
        align: 'right',
        width: '80',
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ];
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
      listItems,
      totalItems,
      pageIndex,
      pageSize,
      isLoading,
    } = this.state;
    const columns = this.columns();
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
        itemId="id"
        items={listItems}
        columns={columns}
        {...(pagination && { pagination })}
        onChange={this.onTableChange}
        loading={isLoading}
        noItemsMessage="没有找到模板"
      />
    )
  }

  toDetail(item) {
    this.setState({ selectItem: item, listType: 'detail' });
  };

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['baselineTemplate'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['baselineTemplate'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>模板列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  toList() {
    this.setState({ listType: 'list', selectItem: {} });
    this.getItems();
  };
	
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

	render() {
		const { listType, selectItem } = this.state;
		const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();

		return (
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
							<EuiPage>
								<EuiFlexGroup direction="column">
                  <EuiFlexItem grow={false}>
                    <EuiPanel>
                    { listType === 'list' && (
                      <div>
                        {head}
                        {table}
                      </div>
                    )}
                    { listType === 'detail' && (
                      <TemplateDetail detailsItem={selectItem} toList={() => this.toList()} />
                    )}
                    </EuiPanel>
                  </EuiFlexItem>
								</EuiFlexGroup>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});