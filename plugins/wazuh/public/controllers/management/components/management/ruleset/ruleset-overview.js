import React, { Component } from 'react';
// Eui components
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPage,
  EuiText,
  EuiTitle,
  EuiLoadingSpinner
} from '@elastic/eui';

import { connect } from 'react-redux';

// Wazuh components
import WzRulesetTable from './ruleset-table';
import WzRulesetSearchBar from './ruleset-search-bar';
import WzRulesetActionButtons from './actions-buttons';
import './ruleset-overview.scss';
import { withUserAuthorizationPrompt, withGlobalBreadcrumb } from '../../../../../components/common/hocs';
import { compose } from 'redux';
import { resourceDictionary } from './utils/ruleset-handler';

class WzRulesetOverview extends Component {
  sectionNames = {
    rules: '规则',
    decoders: '解码器',
    lists: 'CDB列表'
  };

  constructor(props) {
    super(props);
    this.state = {
      totalItems: 0
    }
  }

  render() {
    const { section } = this.props.state;
    const { totalItems } = this.state;

    return (
      <EuiPage style={{ background: 'transparent' }}>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h2>{this.sectionNames[section]} {totalItems === false ? <EuiLoadingSpinner /> : <span>({totalItems})</span>}</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem></EuiFlexItem>
            <WzRulesetActionButtons clusterStatus={this.props.clusterStatus} />
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText color="subdued">
                {`在这里您可以管理您的${section}。`}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          <WzRulesetSearchBar />
          <EuiFlexGroup>
            <EuiFlexItem>
              <WzRulesetTable
                clusterStatus={this.props.clusterStatus}
                request={section}
                updateTotalItems={(totalItems) => this.setState({ totalItems })}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiPage>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers
  };
};

export default compose(
  connect(
    mapStateToProps
  ),
  withGlobalBreadcrumb(props => {
    const sectionNames = {
      rules: '规则',
      decoders: '解码器',
      lists: 'CDB列表'
    }
    return [
      { text: '' },
      { text: '策略管理', href: '/app/wazuh#/manager' },
      { text: sectionNames[props.state.section] }
    ];
  }),
  withUserAuthorizationPrompt((props) => [{action: `${props.state.section}:read`, resource: resourceDictionary[props.state.section].permissionResource('*')}])
)(WzRulesetOverview);
