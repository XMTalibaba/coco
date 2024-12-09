/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import {
  htmlIdGenerator,
  EuiHeaderSectionItemButton,
  EuiPopover,
  EuiIcon,
  EuiTitle,
  EuiText,
  EuiHorizontalRule,
  EuiSpacer,
} from '@elastic/eui';
import { HttpStart } from '../../../http';

export interface VersionInfoProps {
  http: HttpStart;
}

export function VersionInfo({ http }: VersionInfoProps) {
  const [isDescPopoverOpen, setIsDescPopoverOpen] = useState(false);
  const headerUserPopoverId = htmlIdGenerator()();
  const [versionName, setVersionName] = useState('');
  const [versionType, setVersionType] = useState('');
  const [versionSerialNumber, setVersionNameSerialNumber] = useState('');
  const [versionNumber, setVersionNumber] = useState('');

  React.useEffect(() => {
    getPlatformInfo();
  }, []);

  const getPlatformInfo = () => {
    http.get('/api/getPlatformInfo').then((res) => {
      setVersionName(res.data.version_name ? res.data.version_name : '');
      setVersionType(res.data.version_type ? res.data.version_type : '');
      setVersionNameSerialNumber(
        res.data.version_serial_number ? res.data.version_serial_number : ''
      );
      setVersionNumber(res.data.version_number ? res.data.version_number : '');
      if (res.data.version_name) document.title = res.data.version_name;
    });
  };

  return (
    <EuiPopover
      button={
        <EuiHeaderSectionItemButton
          aria-controls={headerUserPopoverId}
          aria-expanded={isDescPopoverOpen}
          aria-haspopup="true"
          aria-label="Open/close"
          onClick={() => setIsDescPopoverOpen(!isDescPopoverOpen)}
          className="header_version_icon"
        >
          <EuiIcon type="visTable" />
        </EuiHeaderSectionItemButton>
      }
      id={headerUserPopoverId}
      isOpen={isDescPopoverOpen}
      closePopover={() => setIsDescPopoverOpen(false)}
      panelClassName="header_version_panel"
      panelPaddingSize="s"
    >
      <div style={{ width: '215px' }}>
        <EuiTitle size={'xs'}>
          <h4>{`版本信息`}</h4>
        </EuiTitle>
        <EuiHorizontalRule margin="xs" />
        <EuiText>名称: {versionName}</EuiText>
        <EuiSpacer size="s" />
        <EuiText>型号: {versionType}</EuiText>
        <EuiSpacer size="s" />
        <EuiText>序列号: {versionSerialNumber}</EuiText>
        <EuiSpacer size="s" />
        <EuiText>版本号: {versionNumber}</EuiText>
      </div>
    </EuiPopover>
  );
}
