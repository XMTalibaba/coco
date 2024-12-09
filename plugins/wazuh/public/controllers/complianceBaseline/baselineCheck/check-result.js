import React, { Component } from 'react';
import {
  EuiPage,
  EuiPanel,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiHealth,
  EuiDescriptionList,
  EuiInMemoryTable,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { formatUIDate } from '../../../react-services/time-service';
import { RuleText, ComplianceText } from '../../../components/agents/sca/components';

export class CheckResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      listItems: [],
      selectPolicy: {},
      itemIdToExpandedRowMap: {},
    }

    this.columnsPolicies = [
      {
        field: 'name',
        name: '策略'
      },
      {
        field: 'description',
        name: '描述',
        truncateText: true
      },
      {
        field: 'end_scan',
        name: '扫描结束时间',
        dataType: 'date',
        render: formatUIDate
      },
      {
        field: 'pass',
        name: '通过',
        width: "100px"
      },
      {
        field: 'fail',
        name: '失败',
        width: "100px"
      },
      {
        field: 'invalid',
        name: '不适用',
        width: "100px"
      },
      {
        field: 'score',
        name: '得分',
        render: score => {
          return `${score}%`;
        },
        width: "100px"
      },
    ];
    this.columnsChecks = [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
        width: "100px"
      },
      {
        field: 'title',
        name: '标题',
        sortable: true,
        truncateText: true
      },
      {
        name: '目标',
        truncateText: true,
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
        field: 'result',
        name: '结果',
        truncateText: true,
        sortable: true,
        width: "150px",
        render: this.addHealthResultRender,
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

  async componentDidMount() {
    this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.selectPolicy.policy_id !== this.state.selectPolicy.policy_id) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      const { selectPolicy } = this.state;
      const { selectAgent } = this.props;
      this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq(
        'GET',
        `/sca/${selectAgent.agent_id}${selectPolicy.policy_id ? `/checks/${selectPolicy.policy_id}` : ''}`,
        {}
      );

      const { affected_items } = ((rawItems || {}).data || {}).data || {};

      this.setState({
        listItems: affected_items,
        isLoading: false
      });
        
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  addHealthResultRender(result) {
    const color = result => {
      if (result.toLowerCase() === 'passed') {
        return 'success';
      } else if (result.toLowerCase() === 'failed') {
        return 'danger';
      } else {
        return 'subdued';
      }
    };
    const statusText = {
      passed: '通过',
      failed: '失败',
      'not applicable': '不适用'
    }

    return (
      <EuiHealth color={color(result)} style={{ textTransform: 'capitalize' }}>
        {statusText[result] || result || '不适用'}
      </EuiHealth>
    );
  }

  toggleDetails = item => {
    const itemIdToExpandedRowMap = { ...this.state.itemIdToExpandedRowMap };

    if (itemIdToExpandedRowMap[item.id]) {
      delete itemIdToExpandedRowMap[item.id];
    } else {
      let checks = '';
      checks += (item.rules || []).length > 1 ? 'Checks' : 'Check';
      checks += item.condition ? ` (Condition: ${item.condition})` : '';
      const complianceText = item.compliance && item.compliance.length 
        ? item.compliance.map(el => `${el.key}: ${el.value}`).join('\n')
        : '';
      const rulesText = item.rules.length ? item.rules.map(el => el.rule).join('\n') : '';
      const listItems = [
        {
          title: '检查不适用，因为:',
          description: item.reason
        },
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
          description: <RuleText rulesText={rulesText} />,
        },
        {
          title: '合规',
          description: <ComplianceText complianceText={complianceText} />
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

  renderPolicyTable() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const getPoliciesRowProps = (item, idx) => {
      return {
        'data-test-subj': `sca-row-${idx}`,
        className: 'customRowClass',
        onClick: () => { this.setState({ selectPolicy: item, listItems: [], itemIdToExpandedRowMap: {} })}
      };
    };
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        rowProps={getPoliciesRowProps}
        items={listItems}
        loading={isLoading}
        columns={this.columnsPolicies}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤' } }}
      />
    )
  }

  renderCheckTable() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const getChecksRowProps = (item, idx) => {
      return {
        'data-test-subj': `sca-check-row-${idx}`,
        className: 'customRowClass',
        onClick: () => this.toggleDetails(item)
      };
    };
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        rowProps={getChecksRowProps}
        items={listItems}
        loading={isLoading}
        columns={this.columnsChecks}
        itemIdToExpandedRowMap={this.state.itemIdToExpandedRowMap}
        isExpandable={true}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤' } }}
      />
    )
  }

  render() {
    const { selectPolicy } = this.state;
    const { selectAgent } = this.props;
    const tableCheck = this.renderCheckTable();
    const tablePolicy = this.renderPolicyTable();

    return (
      <EuiPage style={{ background: 'transparent' }}>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem grow={false} style={{ marginRight: 0 }}>
              <EuiToolTip position="right" content={`返回主机列表`}>
                <EuiButtonIcon
                  aria-label="Back"
                  style={{ paddingTop: 8 }}
                  color="primary"
                  iconSize="l"
                  iconType="arrowLeft"
                  onClick={() => {this.setState({ selectPolicy: {}, itemIdToExpandedRowMap: {} }); this.props.toList()}}
                />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h1>{selectAgent.agent_name}</h1>
              </EuiTitle>
            </EuiFlexItem>
            { selectPolicy.policy_id && (
              <EuiFlexItem grow={false} style={{ marginRight: 0 }}>
                <EuiToolTip position="right" content={`返回策略列表`}>
                  <EuiButtonIcon
                    aria-label="Back"
                    style={{ paddingTop: 8 }}
                    color="primary"
                    iconSize="l"
                    iconType="arrowLeft"
                    onClick={() => this.setState({ selectPolicy: {}, listItems: [], itemIdToExpandedRowMap: {} })}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
            { selectPolicy.policy_id && (
              <EuiFlexItem grow={false}>
                <EuiTitle>
                  <h1>{selectPolicy.name}</h1>
                </EuiTitle>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFlexGroup style={{ marginTop: '0', borderTop: '1px solid rgb(211, 218, 230)'}}>
                <EuiFlexItem>
                  {!selectPolicy.policy_id && tablePolicy}
                  {selectPolicy.policy_id && tableCheck}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiPage>
    )
  }
}