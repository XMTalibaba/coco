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

import PropTypes from 'prop-types';
import React from 'react';
import { AggSelect } from './agg_select';
import { FieldSelect } from './field_select';
import { AggRow } from './agg_row';
import { createChangeHandler } from '../lib/create_change_handler';
import { createSelectHandler } from '../lib/create_select_handler';
import {
  htmlIdGenerator,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiLink,
  EuiComboBox,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import { KBN_FIELD_TYPES } from '../../../../../../plugins/data/public';

const UNIT_OPTIONS = [
  {
    label: i18n.translate('visTypeTimeseries.units.auto', { defaultMessage: 'auto' }),
    value: '',
  },
  {
    label: i18n.translate('visTypeTimeseries.units.perMillisecond', {
      defaultMessage: '每毫秒',
    }),
    value: '1ms',
  },
  {
    label: i18n.translate('visTypeTimeseries.units.perSecond', { defaultMessage: '每秒' }),
    value: '1s',
  },
  {
    label: i18n.translate('visTypeTimeseries.units.perMinute', { defaultMessage: '每分钟' }),
    value: '1m',
  },
  {
    label: i18n.translate('visTypeTimeseries.units.perHour', { defaultMessage: '每小时' }),
    value: '1h',
  },
  {
    label: i18n.translate('visTypeTimeseries.units.perDay', { defaultMessage: '每天' }),
    value: '1d',
  },
];

export const PositiveRateAgg = (props) => {
  const defaults = { unit: '' };
  const model = { ...defaults, ...props.model };

  const handleChange = createChangeHandler(props.onChange, model);
  const handleSelectChange = createSelectHandler(handleChange);

  const htmlId = htmlIdGenerator();
  const indexPattern =
    (props.series.override_index_pattern && props.series.series_index_pattern) ||
    props.panel.index_pattern;

  const selectedUnitOptions = UNIT_OPTIONS.filter((o) => o.value === model.unit);

  return (
    <AggRow
      disableDelete={props.disableDelete}
      model={props.model}
      onAdd={props.onAdd}
      onDelete={props.onDelete}
      siblings={props.siblings}
      dragHandleProps={props.dragHandleProps}
    >
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem>
          <EuiFormLabel htmlFor={htmlId('aggregation')}>
            <FormattedMessage
              id="visTypeTimeseries.positiveRate.aggregationLabel"
              defaultMessage="聚合"
            />
          </EuiFormLabel>
          <EuiSpacer size="xs" />
          <AggSelect
            id={htmlId('aggregation')}
            panelType={props.panel.type}
            siblings={props.siblings}
            value={model.type}
            onChange={handleSelectChange('type')}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            id={htmlId('field')}
            label={
              <FormattedMessage
                id="visTypeTimeseries.postiveRate.fieldLabel"
                defaultMessage="字段"
              />
            }
            fullWidth
          >
            <FieldSelect
              fields={props.fields}
              type={model.type}
              restrict={[KBN_FIELD_TYPES.NUMBER]}
              indexPattern={indexPattern}
              value={model.field}
              onChange={handleSelectChange('field')}
              uiRestrictions={props.uiRestrictions}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            id={htmlId('units')}
            label={
              <FormattedMessage
                id="visTypeTimeseries.positiveRate.unitsLabel"
                defaultMessage="比例"
              />
            }
            fullWidth
          >
            <EuiComboBox
              placeholder={i18n.translate('visTypeTimeseries.positiveRate.unitSelectPlaceholder', {
                defaultMessage: '选择比例...',
              })}
              options={UNIT_OPTIONS}
              onChange={handleSelectChange('unit')}
              singleSelection={{ asPlainText: true }}
              selectedOptions={selectedUnitOptions}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiText size="xs" color="subdued">
        <p>
          <FormattedMessage
            id="visTypeTimeseries.positiveRate.helpText"
            defaultMessage="此聚合应仅应用到{link}，这是仅将最大值、导数和正数应用到字段的快捷方式."
            values={{
              link: (
                <EuiLink href="https://en.wikipedia.org/wiki/Monotonic_function" target="_BLANK">
                  <FormattedMessage
                    id="visTypeTimeseries.positiveRate.helpTextLink"
                    defaultMessage="单调递增数字"
                  />
                </EuiLink>
              ),
            }}
          />
        </p>
      </EuiText>
    </AggRow>
  );
};

PositiveRateAgg.propTypes = {
  disableDelete: PropTypes.bool,
  fields: PropTypes.object,
  model: PropTypes.object,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  panel: PropTypes.object,
  series: PropTypes.object,
  siblings: PropTypes.array,
};
