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

import { get } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { EuiIconTip, EuiPanel } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { VisOptionsProps } from 'src/plugins/vis_default_editor/public';
import { search } from '../../../data/public';
import { SwitchOption, SelectOption, NumberInputOption } from '../../../charts/public';
import { TableVisParams } from '../types';
import { totalAggregations } from './utils';

const { tabifyGetColumns } = search;

function TableOptions({
  aggs,
  stateParams,
  setValidity,
  setValue,
}: VisOptionsProps<TableVisParams>) {
  const percentageColumns = useMemo(
    () => [
      {
        value: '',
        text: i18n.translate('visTypeTable.params.defaultPercentageCol', {
          defaultMessage: '不显示',
        }),
      },
      ...tabifyGetColumns(aggs.getResponseAggs(), true)
        .filter((col) => get(col.aggConfig.toSerializedFieldFormat(), 'id') === 'number')
        .map(({ name }) => ({ value: name, text: name })),
    ],
    [aggs]
  );

  const isPerPageValid = stateParams.perPage === '' || stateParams.perPage > 0;

  useEffect(() => {
    setValidity(isPerPageValid);
  }, [isPerPageValid, setValidity]);

  useEffect(() => {
    if (
      !percentageColumns.find(({ value }) => value === stateParams.percentageCol) &&
      percentageColumns[0] &&
      percentageColumns[0].value !== stateParams.percentageCol
    ) {
      setValue('percentageCol', percentageColumns[0].value);
    }
  }, [percentageColumns, stateParams.percentageCol, setValidity, setValue]);

  return (
    <EuiPanel paddingSize="s">
      <NumberInputOption
        label={
          <>
            <FormattedMessage
              id="visTypeTable.params.perPageLabel"
              defaultMessage="每页最大行数"
            />{' '}
            <EuiIconTip
              content="Leaving this field empty means it will use number of buckets from the response."
              position="right"
            />
          </>
        }
        isInvalid={!isPerPageValid}
        min={1}
        paramName="perPage"
        value={stateParams.perPage}
        setValue={setValue}
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showMetricsLabel', {
          defaultMessage: '显示每个桶/级别的指标',
        })}
        paramName="showMetricsAtAllLevels"
        value={stateParams.showMetricsAtAllLevels}
        setValue={setValue}
        data-test-subj="showMetricsAtAllLevels"
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showPartialRowsLabel', {
          defaultMessage: '显示部分行',
        })}
        tooltip={i18n.translate('visTypeTable.params.showPartialRowsTip', {
          defaultMessage:
            '显示具有部分数据的行。这仍将计算每个桶/级别的指标，即使它们未显示.',
        })}
        paramName="showPartialRows"
        value={stateParams.showPartialRows}
        setValue={setValue}
        data-test-subj="showPartialRows"
      />

      <SwitchOption
        label={i18n.translate('visTypeTable.params.showTotalLabel', {
          defaultMessage: '显示汇总',
        })}
        paramName="showTotal"
        value={stateParams.showTotal}
        setValue={setValue}
      />

      <SelectOption
        label={i18n.translate('visTypeTable.params.totalFunctionLabel', {
          defaultMessage: '汇总函数',
        })}
        disabled={!stateParams.showTotal}
        options={totalAggregations}
        paramName="totalFunc"
        value={stateParams.totalFunc}
        setValue={setValue}
      />

      <SelectOption
        label={i18n.translate('visTypeTable.params.PercentageColLabel', {
          defaultMessage: '百分比列',
        })}
        options={percentageColumns}
        paramName="percentageCol"
        value={stateParams.percentageCol}
        setValue={setValue}
        id="datatableVisualizationPercentageCol"
      />
    </EuiPanel>
  );
}
// default export required for React.Lazy
// eslint-disable-next-line import/no-default-export
export { TableOptions as default };
