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
  disabled?: boolean;
  scripted?: boolean;
}

export function DocViewTableRowBtnFilterExists({
  onClick,
  disabled = false,
  scripted = false,
}: Props) {
  const tooltipContent = disabled ? (
    scripted ? (
      <FormattedMessage
        id="discover.docViews.table.unableToFilterForPresenceOfScriptedFieldsTooltip"
        defaultMessage="无法筛选脚本字段是否存在"
      />
    ) : (
      <FormattedMessage
        id="discover.docViews.table.unableToFilterForPresenceOfMetaFieldsTooltip"
        defaultMessage="无法筛选元数据字段是否存在"
      />
    )
  ) : (
    <FormattedMessage
      id="discover.docViews.table.filterForFieldPresentButtonTooltip"
      defaultMessage="字段是否存在筛选"
    />
  );

  return (
    <EuiToolTip content={tooltipContent}>
      <EuiButtonIcon
        aria-label={i18n.translate('discover.docViews.table.filterForFieldPresentButtonAriaLabel', {
          defaultMessage: '字段是否存在筛选',
        })}
        onClick={onClick}
        className="kbnDocViewer__actionButton"
        data-test-subj="addExistsFilterButton"
        disabled={disabled}
        iconType={'indexOpen'}
        iconSize={'s'}
      />
    </EuiToolTip>
  );
}
