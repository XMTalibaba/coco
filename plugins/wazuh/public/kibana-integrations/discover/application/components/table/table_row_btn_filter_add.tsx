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
import { EuiToolTip, EuiButtonIcon } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export interface Props {
  onClick: () => void;
  disabled: boolean;
}

export function DocViewTableRowBtnFilterAdd({ onClick, disabled = false }: Props) {
  const tooltipContent = disabled ? (
    <FormattedMessage
      id="discover.docViews.table.unindexedFieldsCanNotBeSearchedTooltip"
      defaultMessage="不能搜索未被索引的字段"
    />
  ) : (
    <FormattedMessage
      id="discover.docViews.table.filterForValueButtonTooltip"
      defaultMessage="过滤出值"
    />
  );

  return (
    <EuiToolTip content={tooltipContent}>
      <EuiButtonIcon
        aria-label={i18n.translate('discover.docViews.table.filterForValueButtonAriaLabel', {
          defaultMessage: '过滤出值',
        })}
        className="kbnDocViewer__actionButton"
        data-test-subj="addInclusiveFilterButton"
        disabled={disabled}
        onClick={onClick}
        iconType={'magnifyWithPlus'}
        iconSize={'s'}
      />
    </EuiToolTip>
  );
}
