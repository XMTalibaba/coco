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
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiCallOut } from '@elastic/eui';
import { SurrDocType } from '../../api/context';

export function ActionBarWarning({ docCount, type }: { docCount: number; type: SurrDocType }) {
  if (type === 'predecessors') {
    return (
      <EuiCallOut
        color="warning"
        data-test-subj="predecessorsWarningMsg"
        iconType="bolt"
        title={
          docCount === 0 ? (
            <FormattedMessage
              id="discover.context.newerDocumentsWarningZero"
              defaultMessage="找不到比定位标记新的文档。"
            />
          ) : (
            <FormattedMessage
              id="discover.context.newerDocumentsWarning"
              defaultMessage="仅可以找到 {docCount} 个比定位标记新的文档。"
              values={{ docCount }}
            />
          )
        }
        size="s"
      />
    );
  }

  return (
    <EuiCallOut
      color="warning"
      data-test-subj="successorsWarningMsg"
      iconType="bolt"
      title={
        docCount === 0 ? (
          <FormattedMessage
            id="discover.context.olderDocumentsWarningZero"
            defaultMessage="找不到比定位标记新的文档。"
          />
        ) : (
          <FormattedMessage
            id="discover.context.olderDocumentsWarning"
            defaultMessage="仅可以找到 {docCount} 个比定位标记新的文档。"
            values={{ docCount }}
          />
        )
      }
      size="s"
    />
  );
}
