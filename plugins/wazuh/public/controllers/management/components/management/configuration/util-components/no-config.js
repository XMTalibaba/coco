/*
 * Wazuh app - React component for render no config.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  EuiIcon,
  EuiHorizontalRule,
  EuiSpacer,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';

import WzHelpButtonPopover from './help-button-popover';

class WzNoConfig extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { error, help } = this.props;
    return (
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem>
            <div style={{ textAlign: 'center' }}>
              <EuiIcon type="help" style={{ marginRight: '4px' }} />
              {(error === 'not-present' && (
                <span>配置不存在</span>
              )) || <span>提取配置时出错</span>}
              {help && <WzHelpButtonPopover links={help} />}
              <EuiHorizontalRule margin="s" />
              {(error === 'not-present' && (
                <p>此部分不在配置文件上。</p>
              )) || (
                <span>
                  为此部分获取配置时出现问题。
                </span>
              )}
              <EuiSpacer size="s" />
              <div>
                <p>
                  点击<EuiIcon type="questionInCircle" /> 图标获得帮助。 查看文档链接以了解更多有关如何配置它。
                </p>
              </div>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }
}

WzNoConfig.propTypes = {
  error: PropTypes.string.isRequired,
  links: PropTypes.array
};

export default WzNoConfig;
