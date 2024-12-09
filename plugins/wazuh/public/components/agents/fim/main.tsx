import React from 'react';
import { Inventory } from './index';
import '../../common/modules/module.scss';
import { connect } from 'react-redux';
import { PromptNoSelectedAgent, PromptNoActiveAgent } from '../prompts';
import { compose } from 'redux';
import { withGuard, withUserAuthorizationPrompt } from '../../common/hocs';

const mapStateToProps = (state) => ({
  currentAgentData: state.appStateReducers.currentAgentData,
});

export const MainFim = compose(
  connect(mapStateToProps),
  withGuard(
    (props) => !((props.currentAgentData && props.currentAgentData.id) && props.agent),
    () => (
      <PromptNoSelectedAgent body="您需要选择一个代理来查看完整性监控目录。" />
    )
  ),
  withGuard(
    (props) => {
      const agentData =
        props.currentAgentData && props.currentAgentData.id ? props.currentAgentData : props.agent;
      return agentData.status !== 'active';
    },
    () => <PromptNoActiveAgent />
  ),
  withUserAuthorizationPrompt((props) => {
    const agentData =
      props.currentAgentData && props.currentAgentData.id ? props.currentAgentData : props.agent;
    return [
      { action: 'agent:read', resource: `agent:id:${agentData.id}` },
      { action: 'syscheck:read', resource: `agent:id:${agentData.id}` },
    ];
  })
)(function MainFim({ currentAgentData, agent, ...rest }) {
  const agentData = currentAgentData && currentAgentData.id ? currentAgentData : agent;
  return (
    <div>
      <Inventory {...rest} agent={agentData} />
    </div>
  );
});
