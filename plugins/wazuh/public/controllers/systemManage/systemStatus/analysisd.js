import React, { Component } from "react";
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiPage,
  EuiCallOut,
  EuiSpacer,
  EuiSelect,
  EuiButton,
} from "@elastic/eui";
import { clusterNodes } from "../../management/components/management/configuration/utils/wz-fetch";
import { WzDatePicker } from "../../../components/wz-date-picker/wz-date-picker";
import { WzStatisticsAnalysisd } from "../../management/components/management/statistics/statistics-dashboard-analysisd";

export class Analysisd extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      clusterNodes: [],
      loadingNode: false,
      clusterNodeSelected: 'all',
      refreshVisualizations: Date.now()
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    try {
      const data = await clusterNodes();
      const nodes = data.data.data.affected_items.map((item) => {
        return { value: item.name, text: `${item.name} (${item.type})` };
      });
      nodes.unshift({ value: 'all', text: 'All' })
      this.setState({
        clusterNodes: nodes,
        clusterNodeSelected: nodes[0].value,
      });
    } catch (err) {
      this.setState({
        clusterNodes: [],
        clusterNodeSelected: 'all',
      });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  onSelectNode = (e) => {
    const newValue = e.target.value;
    this.setState(
      {
        loadingNode: true
      },
      () => {
        this.setState({ clusterNodeSelected: newValue, loadingNode: false })
      }
    );
  };

  refreshVisualizations = () => {
    this.setState({ refreshVisualizations: Date.now() })
  }

  render() {
    return (
      <EuiPage>
        <EuiPanel>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem />
            {!!(
              this.state.clusterNodes &&
              this.state.clusterNodes.length &&
              this.state.clusterNodeSelected
            ) && (
                <EuiFlexItem grow={false}>
                  <EuiSelect
                    id="selectNode"
                    options={this.state.clusterNodes}
                    value={this.state.clusterNodeSelected}
                    onChange={this.onSelectNode}
                    aria-label="选择节点"
                  />
                </EuiFlexItem>
              )}
            <EuiFlexItem grow={false}>
              <WzDatePicker condensed={true} onTimeChange={() => this.refreshVisualizations()} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                onClick={this.refreshVisualizations}
              >
                刷新
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={"m"} />
          <EuiCallOut
            title={`分析统计：从变量‘analysis.stat_interval’中指示的时间段开始存储的数据。`}
            iconType="iInCircle"
          />
          <EuiSpacer size={"m"} />
          { !this.state.loadingNode && (
            <WzStatisticsAnalysisd clusterNodeSelected={this.state.clusterNodeSelected} refreshVisualizations={this.state.refreshVisualizations}/>
          )}
        </EuiPanel>
      </EuiPage>
    )
  }
}