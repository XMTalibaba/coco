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

import { EuiTitle, EuiText, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

export const Header = () => (
  <>
    <EuiTitle size="s">
      <h3>
        <FormattedMessage
          id="indexPatternManagement.editIndexPattern.sourceHeader"
          defaultMessage="源刷选"
        />
      </h3>
    </EuiTitle>
    <EuiText>
      <p>
        <FormattedMessage
          id="indexPatternManagement.editIndexPattern.sourceLabel"
          defaultMessage="提取文档源时，源筛选可用于排除一个或多个字段。在 Discover 应用中查看文档时会发生此问题，表在 Dashboard 应用中显示已保存搜索的结果时也会发生此问题。将使用单个文档的源生成每行，如果您的文档含有较大或不重要字段的文档，则通过在此较低层级筛除这些字段可能会更好."
        />
      </p>
      <p>
        <FormattedMessage
          id="indexPatternManagement.editIndexPattern.source.noteLabel"
          defaultMessage="请注意，多字段将错误地显示为下表中的匹配。这些筛选仅应用于原始源文档中的字段，因此实际未筛选匹配的多字段."
        />
      </p>
    </EuiText>
    <EuiSpacer size="s" />
  </>
);
