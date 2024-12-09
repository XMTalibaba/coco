import React, { Component } from 'react';
import {
  EuiPage,
  EuiButtonEmpty,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
	EuiBasicTable,
	EuiSpacer,
	EuiToolTip,
	EuiOverlayMask,
	EuiConfirmModal,
	EuiButton,
  EuiHealth,
  EuiText,
  EuiStat,
  EuiRadioGroup,
  EuiFieldText,
  EuiDescriptionList,
} from '@elastic/eui';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { GroupTruncate } from '../../../components/common/util';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class TemplateDetail extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
      pageSize: 10,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      itemIdToExpandedRowMap: {},
    }
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
      const { detailsItem } = this.props;
      const rawAgents = await WzRequest.apiReq(
        'GET',
        `/sca/000/checks/${detailsItem.policy_id}?pretty=true`,
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

  columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        width: "100px"
      },
      {
        field: 'title',
        name: '标题',
      },
      {
        name: '目标',
        render: item => (
          <div>
            {item.file ? (
              <span>
                <b>文件:</b> {item.file}
              </span>
            ) : item.directory ? (
              <span>
                <b>目录:</b> {item.directory}
              </span>
            ) : item.process ? (
              <span>
                <b>过程: </b> {item.process}
              </span>
            ) : item.command ? (
              <span>
                <b>命令: </b> {item.command}
              </span>
            ) : item.registry ? (
              <span>
                <b>注册表: </b> {item.registry}
              </span>
            ) : (
                        '-'
                      )}
          </div>
        )
      },
      {
        align: 'right',
        width: "40px",
        isExpander: true,
        render: item => (
          <EuiButtonIcon
            onClick={() => this.toggleDetails(item)}
            aria-label={
              this.state.itemIdToExpandedRowMap[item.id] ? 'Collapse' : 'Expand'
            }
            iconType={
              this.state.itemIdToExpandedRowMap[item.id]
                ? 'arrowUp'
                : 'arrowDown'
            }
          />
        )
      }
    ];
  }
  toggleDetails = item => {
    const itemIdToExpandedRowMap = { ...this.state.itemIdToExpandedRowMap };

    if (itemIdToExpandedRowMap[item.id]) {
      delete itemIdToExpandedRowMap[item.id];
    } else {
      let checks = '';
      checks += (item.rules || []).length > 1 ? '检查' : '检查';
      checks += item.condition ? ` (条件: ${item.condition})` : '';
      const complianceText = item.compliance && item.compliance.length 
        ? item.compliance.map(el => `${el.key}: ${el.value}`).join('\n')
        : '';
      const rulesText = item.rules.length ? item.rules.map(el => el.rule).join('\n') : '';
      const listItems = [
        {
          title: '依据',
          description: item.rationale || '-'
        },
        {
          title: '补救',
          description: item.remediation || '-'
        },
        {
          title: '描述',
          description: item.description || '-'
        },
        {
          title: (item.directory || '').includes(',') ? '路径' : '路径',
          description: item.directory
        },
        {
          title: checks,
          // description: <RuleText rulesText={rulesText} />,
          description: <EuiText size="s">
            <ul>
              {rulesText.split(' -> ').map((text, idx) => <li key={idx}>{text}</li>)}
            </ul>
          </EuiText>,
        },
        {
          title: '合规',
          // description: <ComplianceText complianceText={complianceText} />
          description: <EuiFlexGroup direction="column" gutterSize="xs">
            {complianceText.split("\n").map(item => /(?<title>\S+): (?<description>.+)/.exec(item)?.groups).filter(item => !!item).map((item, idx) => <EuiFlexItem key={idx}><p><strong>{item.title}: </strong> {item.description}</p></EuiFlexItem>)}
          </EuiFlexGroup>
        }
      ];
      const itemsToShow = listItems.filter(x => {
        return x.description;
      });
      itemIdToExpandedRowMap[item.id] = (
        <EuiDescriptionList listItems={itemsToShow} />
      );
    }
    this.setState({ itemIdToExpandedRowMap });
  };
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
      itemIdToExpandedRowMap,
    } = this.state;
    const columns = this.columns();
    const pagination =
      totalItems > 10
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [10, 25, 50]
        }
        : false;
    const getRowProps = (item, idx) => {
      return {
        'data-test-subj': `sca-check-row-${idx}`,
        className: 'customRowClass',
        onClick: () => this.toggleDetails(item)
      };
    };
    return (
      <EuiBasicTable
        itemId="id"
        rowProps={getRowProps}
        isExpandable={true}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        items={listItems}
        columns={columns}
        {...(pagination && { pagination })}
        onChange={this.onTableChange}
        loading={isLoading}
        noItemsMessage="没有找到检查项"
      />
    )
  }

  render() {
    const { detailsItem } = this.props;
    const table = this.tableRender();
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{`${detailsItem.name}模板详情`}</h3>
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
        <EuiSpacer></EuiSpacer>
        {table}
      </div>
    )
  }

}