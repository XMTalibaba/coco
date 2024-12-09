/*
 * Wazuh app - React component for show configuration of AWS S3 - buckets tab.
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

import WzNoConfig from "../util-components/no-config";
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationListSelector from '../util-components/configuration-settings-list-selector';
import { settingsListBuilder } from '../utils/builders';
import helpLinks from './help-links';

import { connect } from 'react-redux';

const mainSettings = [
  { field: 'name', label: '桶名称' },
  { field: 'type', label: '桶类型' },
  { field: 'aws_account_id', label: 'AWS账号ID' },
  { field: 'aws_account_alias', label: 'AWS账户别名' },
  { field: 'aws_profile', label: '具有读权限的配置文件名称' },
  { field: 'iam_role_arn', label: 'IAM ARN角色用于读取桶日志' },
  { field: 'path', label: '桶路径' },
  { field: 'only_logs_after', label: '只解析从这个日期开始的日志' },
  { field: 'remove_from_bucket', label: '读取桶日志后，请及时删除' },
  { field: 'regions', label: '将日志解析限制在这些区域' }
];

class WzConfigurationAmazonS3Buckets extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wodleConfig, wazuhNotReadyYet } = this.props;
    const items =
      wodleConfig && wodleConfig['aws-s3'] && wodleConfig['aws-s3'].buckets
        ? settingsListBuilder(wodleConfig['aws-s3'].buckets, 'name')
        : {};
    return (
      <Fragment>
        {currentConfig &&
        (!wodleConfig['aws-s3'] || (wodleConfig['aws-s3'] && !wodleConfig['aws-s3'].buckets)) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet && (!currentConfig || !wodleConfig['aws-s3']) && (
          <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
        )}
        {currentConfig &&
          wodleConfig['aws-s3'] &&
          wodleConfig['aws-s3'].buckets && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="从其中读取日志的Amazon桶"
              currentConfig={wodleConfig}
              minusHeight={320}
              helpLinks={helpLinks}
            >
              <WzConfigurationListSelector
                items={items}
                settings={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzConfigurationAmazonS3Buckets.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default connect(mapStateToProps)(WzConfigurationAmazonS3Buckets);
