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
import { EuiTabs, EuiTab } from '@elastic/eui';
import { injectI18n } from '@kbn/i18n/react';
import { PANEL_TYPES } from '../../../../../plugins/vis_type_timeseries/common/panel_types';

function VisPickerItem(props) {
  const { label, type, selected } = props;
  const itemClassName = 'tvbVisPickerItem';

  return (
    <EuiTab
      className={itemClassName}
      isSelected={selected}
      onClick={() => props.onClick(type)}
      data-test-subj={`${type}TsvbTypeBtn`}
    >
      {label}
    </EuiTab>
  );
}

VisPickerItem.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  selected: PropTypes.bool,
};

export const VisPicker = injectI18n(function (props) {
  const handleChange = (type) => {
    props.onChange({ type });
  };

  const { model, intl } = props;
  const tabs = [
    {
      type: PANEL_TYPES.TIMESERIES,
      label: intl.formatMessage({
        id: 'visTypeTimeseries.visPicker.timeSeriesLabel',
        defaultMessage: '时间序列',
      }),
    },
    {
      type: PANEL_TYPES.METRIC,
      label: intl.formatMessage({
        id: 'visTypeTimeseries.visPicker.metricLabel',
        defaultMessage: '指标',
      }),
    },
    {
      type: PANEL_TYPES.TOP_N,
      label: intl.formatMessage({
        id: 'visTypeTimeseries.visPicker.topNLabel',
        defaultMessage: '排名前 N',
      }),
    },
    {
      type: PANEL_TYPES.GAUGE,
      label: intl.formatMessage({
        id: 'visTypeTimeseries.visPicker.gaugeLabel',
        defaultMessage: '仪表盘图',
      }),
    },
    { type: PANEL_TYPES.MARKDOWN, label: 'Markdown' },
    {
      type: PANEL_TYPES.TABLE,
      label: intl.formatMessage({
        id: 'visTypeTimeseries.visPicker.tableLabel',
        defaultMessage: '表',
      }),
    },
  ].map((item) => {
    return (
      <VisPickerItem
        key={item.type}
        onClick={handleChange}
        selected={item.type === model.type}
        {...item}
      />
    );
  });

  return <EuiTabs>{tabs}</EuiTabs>;
});

VisPicker.propTypes = {
  model: PropTypes.object,
  onChange: PropTypes.func,
};
