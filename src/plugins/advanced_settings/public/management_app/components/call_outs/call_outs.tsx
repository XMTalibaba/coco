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

import React from 'react';

import { EuiCallOut } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

export const CallOuts = () => {
  return (
    <div>
      <EuiCallOut
        title={
          <FormattedMessage
            id="advancedSettings.callOutCautionTitle"
            defaultMessage="注意：在这里您可能会使问题出现"
          />
        }
        color="warning"
        iconType="bolt"
      >
        <p>
          <FormattedMessage
            id="advancedSettings.callOutCautionDescription"
            defaultMessage="此处请谨慎操作，这些设置仅供高级用户使用。您在这里所做的更改可能使 Kibana 的大部分功能出现问题。这些设置有一部分可能未在文档中说明、不受支持或是实验性设置。如果字段有默认值，将字段留空会将其设置为默认值，其他配置指令可能不接受其默认值。删除定制设置会将其从配置中永久删除."
          />
        </p>
      </EuiCallOut>
    </div>
  );
};
