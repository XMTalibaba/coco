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
import { EuiComboBox, EuiIcon } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { ICON_TYPES_MAP } from '../../visualizations/constants/icons';

export const ICONS = [
  {
    value: 'fa-asterisk',
    label: i18n.translate('visTypeTimeseries.iconSelect.asteriskLabel', {
      defaultMessage: '星号',
    }),
  },
  {
    value: 'fa-bell',
    label: i18n.translate('visTypeTimeseries.iconSelect.bellLabel', { defaultMessage: '钟铃' }),
  },
  {
    value: 'fa-bolt',
    label: i18n.translate('visTypeTimeseries.iconSelect.boltLabel', { defaultMessage: '闪电' }),
  },
  {
    value: 'fa-comment',
    label: i18n.translate('visTypeTimeseries.iconSelect.commentLabel', {
      defaultMessage: '注释',
    }),
  },
  {
    value: 'fa-map-marker',
    label: i18n.translate('visTypeTimeseries.iconSelect.mapMarkerLabel', {
      defaultMessage: '地图标记',
    }),
  },
  {
    value: 'fa-map-pin',
    label: i18n.translate('visTypeTimeseries.iconSelect.mapPinLabel', {
      defaultMessage: '地图图钉',
    }),
  },
  {
    value: 'fa-star',
    label: i18n.translate('visTypeTimeseries.iconSelect.starLabel', { defaultMessage: '五角星' }),
  },
  {
    value: 'fa-tag',
    label: i18n.translate('visTypeTimeseries.iconSelect.tagLabel', { defaultMessage: '标记' }),
  },
  {
    value: 'fa-bomb',
    label: i18n.translate('visTypeTimeseries.iconSelect.bombLabel', { defaultMessage: '炸弹' }),
  },
  {
    value: 'fa-bug',
    label: i18n.translate('visTypeTimeseries.iconSelect.bugLabel', { defaultMessage: '昆虫' }),
  },
  {
    value: 'fa-exclamation-circle',
    label: i18n.translate('visTypeTimeseries.iconSelect.exclamationCircleLabel', {
      defaultMessage: '圆形嵌感叹号',
    }),
  },
  {
    value: 'fa-exclamation-triangle',
    label: i18n.translate('visTypeTimeseries.iconSelect.exclamationTriangleLabel', {
      defaultMessage: '三角形嵌感叹号',
    }),
  },
  {
    value: 'fa-fire',
    label: i18n.translate('visTypeTimeseries.iconSelect.fireLabel', { defaultMessage: '火苗' }),
  },
  {
    value: 'fa-flag',
    label: i18n.translate('visTypeTimeseries.iconSelect.flagLabel', { defaultMessage: '旗帜' }),
  },
  {
    value: 'fa-heart',
    label: i18n.translate('visTypeTimeseries.iconSelect.heartLabel', { defaultMessage: '心形' }),
  },
];

export function IconView({ value: icon, label }) {
  return (
    <span>
      <EuiIcon type={ICON_TYPES_MAP[icon]} />
      {` ${label}`}
    </span>
  );
}

export function IconSelect({ value, onChange }) {
  const selectedIcon = ICONS.find((option) => value === option.value) || ICONS[0];

  return (
    <EuiComboBox
      isClearable={false}
      options={ICONS}
      selectedOptions={[selectedIcon]}
      onChange={onChange}
      singleSelection={{ asPlainText: true }}
      renderOption={IconView}
    />
  );
}

IconSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};
