/*
 * Wazuh app - Prompt when status agent is Never connected.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Fragment } from 'react';
import { EuiEmptyPrompt, EuiButton } from '@elastic/eui';

export const WzAgentNeverConnectedPrompt = () => (
  <EuiEmptyPrompt
    iconType="securitySignalDetected"
    style={{ marginTop: 20 }}
    title={<h2>代理从未连接。</h2>}
    body={
      <Fragment>
        <p>
          代理已注册，但尚未连接到管理器。
        </p>
        <a href="https://documentation.wazuh.com/current/user-manual/agents/agent-connection.html" target="_blank">
          https://documentation.wazuh.com/current/user-manual/agents/agent-connection.html
        </a>
      </Fragment>
    }
    actions={
      <EuiButton href='#/agents-preview?' color="primary" fill>
        返回
      </EuiButton>
  }
  />)