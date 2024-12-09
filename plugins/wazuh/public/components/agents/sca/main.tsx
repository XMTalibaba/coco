import React from 'react';
import { Inventory } from './index';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { PromptSelectAgent, PromptNoSelectedAgent } from '../prompts';
import { withGuard, withUserAuthorizationPrompt } from '../../common/hocs';

const mapStateToProps = (state) => ({
  currentAgentData: state.appStateReducers.currentAgentData,
});

export const MainSca = compose(
  connect(mapStateToProps),
  withGuard(
    (props) => !(props.currentAgentData && props.currentAgentData.id && props.agent),
    () => (
      <PromptNoSelectedAgent body="您需要选择一个代理来查看安全配置评估清单。" />
    )
  ),
  withGuard(
    ({ currentAgentData, agent }) => {
      const agentData = currentAgentData && currentAgentData.id ? currentAgentData : agent;
      return agentData.status === 'never_connected';
    },
    () => (
      <PromptSelectAgent title="代理没有连接" body="代理从未连接，请选择其他代理" />
    )
  ),
  withUserAuthorizationPrompt((props) => {
    const agentData =
      props.currentAgentData && props.currentAgentData.id ? props.currentAgentData : props.agent;
    return [
      { action: 'agent:read', resource: `agent:id:${agentData.id}` },
      { action: 'sca:read', resource: `agent:id:${agentData.id}` },
    ];
  })
)(function MainSca({ selectView, currentAgentData, agent, ...rest }) {
  const agentData = currentAgentData && currentAgentData.id ? currentAgentData : agent;
  return (
    <div>
      <Inventory {...rest} agent={agentData} />
    </div>
  );
});
