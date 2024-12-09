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
import { WzStatisticsRemoted } from "../../management/components/management/statistics/statistics-dashboard-remoted";

export class Remoted extends Component {
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
            title={`远程统计使用已存在的历史累积数据。`}
            iconType="iInCircle"
          />
          <EuiSpacer size={"m"} />
          { !this.state.loadingNode && (
            <WzStatisticsRemoted clusterNodeSelected={this.state.clusterNodeSelected} refreshVisualizations={this.state.refreshVisualizations}/>
          )}
        </EuiPanel>
      </EuiPage>
    )
  }
}