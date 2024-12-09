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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import { DataFormatPicker } from '../../data_format_picker';
import { createSelectHandler } from '../../lib/create_select_handler';
import { createTextHandler } from '../../lib/create_text_handler';
import { FieldSelect } from '../../aggs/field_select';
import { YesNo } from '../../yes_no';
import { ColorRules } from '../../color_rules';
import {
  htmlIdGenerator,
  EuiComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
  EuiCode,
  EuiHorizontalRule,
  EuiFormLabel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { FormattedMessage, injectI18n } from '@kbn/i18n/react';
import { getDefaultQueryLanguage } from '../../lib/get_default_query_language';

import { QueryBarWrapper } from '../../query_bar_wrapper';
class TableSeriesConfigUI extends Component {
  UNSAFE_componentWillMount() {
    const { model } = this.props;
    if (!model.color_rules || (model.color_rules && model.color_rules.length === 0)) {
      this.props.onChange({
        color_rules: [{ id: uuid.v1() }],
      });
    }
  }

  render() {
    const defaults = { offset_time: '', value_template: '' };
    const model = { ...defaults, ...this.props.model };
    const handleSelectChange = createSelectHandler(this.props.onChange);
    const handleTextChange = createTextHandler(this.props.onChange);
    const htmlId = htmlIdGenerator();
    const { intl } = this.props;

    const functionOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.sumLabel',
          defaultMessage: '和',
        }),
        value: 'sum',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.maxLabel',
          defaultMessage: '最大值',
        }),
        value: 'max',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.minLabel',
          defaultMessage: '最小值',
        }),
        value: 'min',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.avgLabel',
          defaultMessage: '平均值',
        }),
        value: 'mean',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.overallSumLabel',
          defaultMessage: '总体和',
        }),
        value: 'overall_sum',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.overallMaxLabel',
          defaultMessage: '总体最大值',
        }),
        value: 'overall_max',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.overallMinLabel',
          defaultMessage: '总体最小值',
        }),
        value: 'overall_min',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.overallAvgLabel',
          defaultMessage: '总体平均值',
        }),
        value: 'overall_avg',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.table.cumulativeSumLabel',
          defaultMessage: '累计和',
        }),
        value: 'cumulative_sum',
      },
    ];
    const selectedAggFuncOption = functionOptions.find((option) => {
      return model.aggregate_function === option.value;
    });

    return (
      <div className="tvbAggRow">
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem grow={false}>
            <DataFormatPicker onChange={handleSelectChange('formatter')} value={model.formatter} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow
              id={htmlId('template')}
              label={
                <FormattedMessage
                  id="visTypeTimeseries.table.templateLabel"
                  defaultMessage="模板"
                />
              }
              helpText={
                <span>
                  <FormattedMessage
                    id="visTypeTimeseries.table.templateHelpText"
                    defaultMessage="eg.{templateExample}"
                    values={{ templateExample: <EuiCode>{'{{value}}/s'}</EuiCode> }}
                  />
                </span>
              }
              fullWidth
            >
              <EuiFieldText
                onChange={handleTextChange('value_template')}
                value={model.value_template}
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiHorizontalRule margin="s" />

        <EuiFlexGroup responsive={false} wrap={true}>
          <EuiFlexItem grow={true}>
            <EuiFormRow
              id={htmlId('filterInput')}
              label={
                <FormattedMessage
                  id="visTypeTimeseries.table.filterLabel"
                  defaultMessage="筛选"
                />
              }
              fullWidth
            >
              <QueryBarWrapper
                query={{
                  language:
                    model.filter && model.filter.language
                      ? model.filter.language
                      : getDefaultQueryLanguage(),
                  query: model.filter && model.filter.query ? model.filter.query : '',
                }}
                onChange={(filter) => this.props.onChange({ filter })}
                indexPatterns={[this.props.indexPatternForQuery]}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormLabel>
              <FormattedMessage
                id="visTypeTimeseries.table.showTrendArrowsLabel"
                defaultMessage="显示趋势箭头？"
              />
            </EuiFormLabel>
            <EuiSpacer size="s" />
            <YesNo value={model.trend_arrows} name="trend_arrows" onChange={this.props.onChange} />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiHorizontalRule margin="s" />

        <EuiFlexGroup responsive={false} wrap={true}>
          <EuiFlexItem grow={true}>
            <EuiFormRow
              id={htmlId('field')}
              label={
                <FormattedMessage id="visTypeTimeseries.table.fieldLabel" defaultMessage="字段" />
              }
            >
              <FieldSelect
                fields={this.props.fields}
                indexPattern={this.props.panel.index_pattern}
                value={model.aggregate_by}
                onChange={handleSelectChange('aggregate_by')}
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            <EuiFormRow
              id={htmlId('aggregateFunctionInput')}
              label={
                <FormattedMessage
                  id="visTypeTimeseries.table.aggregateFunctionLabel"
                  defaultMessage="聚合函数"
                />
              }
              fullWidth
            >
              <EuiComboBox
                options={functionOptions}
                selectedOptions={selectedAggFuncOption ? [selectedAggFuncOption] : []}
                onChange={handleSelectChange('aggregate_function')}
                singleSelection={{ asPlainText: true }}
                fullWidth
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiHorizontalRule margin="s" />

        <EuiTitle size="xxs">
          <span>
            <FormattedMessage
              id="visTypeTimeseries.table.colorRulesLabel"
              defaultMessage="颜色规则"
            />
          </span>
        </EuiTitle>
        <EuiSpacer size="s" />

        <ColorRules
          primaryName="text"
          primaryVarName="text"
          hideSecondary={true}
          model={model}
          onChange={this.props.onChange}
          name="color_rules"
        />
      </div>
    );
  }
}

TableSeriesConfigUI.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
  indexPatternForQuery: PropTypes.string,
};

export const TableSeriesConfig = injectI18n(TableSeriesConfigUI);
