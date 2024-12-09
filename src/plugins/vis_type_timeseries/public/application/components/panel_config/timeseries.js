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
import React, { Component } from 'react';
import { SeriesEditor } from '../series_editor';
import { AnnotationsEditor } from '../annotations_editor';
import { IndexPattern } from '../index_pattern';
import { createSelectHandler } from '../lib/create_select_handler';
import { createTextHandler } from '../lib/create_text_handler';
import { ColorPicker } from '../color_picker';
import { YesNo } from '../yes_no';
import {
  htmlIdGenerator,
  EuiComboBox,
  EuiTabs,
  EuiTab,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFormLabel,
  EuiSpacer,
  EuiFieldText,
  EuiTitle,
  EuiHorizontalRule,
} from '@elastic/eui';
import { injectI18n, FormattedMessage } from '@kbn/i18n/react';
import { getDefaultQueryLanguage } from '../lib/get_default_query_language';
import { QueryBarWrapper } from '../query_bar_wrapper';

class TimeseriesPanelConfigUi extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedTab: 'data' };
  }

  switchTab(selectedTab) {
    this.setState({ selectedTab });
  }

  render() {
    const defaults = {
      filter: { query: '', language: getDefaultQueryLanguage() },
      axis_max: '',
      axis_min: '',
      legend_position: 'right',
      show_grid: 1,
      tooltip_mode: 'show_all',
    };
    const model = { ...defaults, ...this.props.model };
    const { selectedTab } = this.state;
    const handleSelectChange = createSelectHandler(this.props.onChange);
    const handleTextChange = createTextHandler(this.props.onChange);
    const htmlId = htmlIdGenerator();
    const { intl } = this.props;

    const positionOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.positionOptions.rightLabel',
          defaultMessage: '右',
        }),
        value: 'right',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.positionOptions.leftLabel',
          defaultMessage: '左',
        }),
        value: 'left',
      },
    ];
    const tooltipModeOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.tooltipOptions.showAll',
          defaultMessage: '显示所有值',
        }),
        value: 'show_all',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.tooltipOptions.showFocused',
          defaultMessage: '显示聚焦值',
        }),
        value: 'show_focused',
      },
    ];
    const selectedPositionOption = positionOptions.find((option) => {
      return model.axis_position === option.value;
    });
    const scaleOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.scaleOptions.normalLabel',
          defaultMessage: '正常',
        }),
        value: 'normal',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.scaleOptions.logLabel',
          defaultMessage: '对数',
        }),
        value: 'log',
      },
    ];
    const selectedAxisScaleOption = scaleOptions.find((option) => {
      return model.axis_scale === option.value;
    });
    const legendPositionOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.legendPositionOptions.rightLabel',
          defaultMessage: '右',
        }),
        value: 'right',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.legendPositionOptions.leftLabel',
          defaultMessage: '左',
        }),
        value: 'left',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.timeseries.legendPositionOptions.bottomLabel',
          defaultMessage: 'Bott下om',
        }),
        value: 'bottom',
      },
    ];
    const selectedLegendPosOption = legendPositionOptions.find((option) => {
      return model.legend_position === option.value;
    });

    const selectedTooltipMode = tooltipModeOptions.find((option) => {
      return model.tooltip_mode === option.value;
    });

    let view;
    if (selectedTab === 'data') {
      view = (
        <SeriesEditor
          fields={this.props.fields}
          model={this.props.model}
          name={this.props.name}
          onChange={this.props.onChange}
        />
      );
    } else if (selectedTab === 'annotations') {
      view = (
        <AnnotationsEditor
          fields={this.props.fields}
          model={this.props.model}
          name="annotations"
          onChange={this.props.onChange}
        />
      );
    } else {
      view = (
        <div className="tvbPanelConfig__container">
          <EuiPanel>
            <EuiTitle size="s">
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.timeseries.optionsTab.dataLabel"
                  defaultMessage="数据"
                />
              </span>
            </EuiTitle>
            <EuiSpacer size="m" />

            <IndexPattern
              fields={this.props.fields}
              model={this.props.model}
              onChange={this.props.onChange}
            />

            <EuiHorizontalRule />

            <EuiFlexGroup responsive={false} wrap={true}>
              <EuiFlexItem>
                <EuiFormRow
                  id={htmlId('panelFilter')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.timeseries.optionsTab.panelFilterLabel"
                      defaultMessage="面板筛选"
                    />
                  }
                  fullWidth
                >
                  <QueryBarWrapper
                    query={{
                      language: model.filter.language || getDefaultQueryLanguage(),
                      query: model.filter.query || '',
                    }}
                    onChange={(filter) => this.props.onChange({ filter })}
                    indexPatterns={[model.index_pattern || model.default_index_pattern]}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.ignoreGlobalFilterLabel"
                    defaultMessage="忽略全局筛选？"
                  />
                </EuiFormLabel>
                <EuiSpacer size="m" />
                <YesNo
                  value={model.ignore_global_filter}
                  name="ignore_global_filter"
                  onChange={this.props.onChange}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>

          <EuiSpacer />

          <EuiPanel>
            <EuiTitle size="s">
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.timeseries.optionsTab.styleLabel"
                  defaultMessage="样式"
                />
              </span>
            </EuiTitle>
            <EuiSpacer size="m" />

            <EuiFlexGroup responsive={false} wrap={true} alignItems="center">
              <EuiFlexItem>
                <EuiFormRow
                  id={htmlId('axisMin')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.timeseries.optionsTab.axisMinLabel"
                      defaultMessage="轴最小值"
                    />
                  }
                >
                  <EuiFieldText onChange={handleTextChange('axis_min')} value={model.axis_min} />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  id={htmlId('axisMax')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.timeseries.optionsTab.axisMaxLabel"
                      defaultMessage="轴最大值"
                    />
                  }
                >
                  <EuiFieldText onChange={handleTextChange('axis_max')} value={model.axis_max} />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  id={htmlId('axisPos')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.timeseries.optionsTab.axisPositionLabel"
                      defaultMessage="轴位置"
                    />
                  }
                >
                  <EuiComboBox
                    isClearable={false}
                    options={positionOptions}
                    selectedOptions={selectedPositionOption ? [selectedPositionOption] : []}
                    onChange={handleSelectChange('axis_position')}
                    singleSelection={{ asPlainText: true }}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  id={htmlId('axisScale')}
                  label={
                    <FormattedMessage
                      id="visTypeTimeseries.timeseries.optionsTab.axisScaleLabel"
                      defaultMessage="轴刻度"
                    />
                  }
                >
                  <EuiComboBox
                    isClearable={false}
                    options={scaleOptions}
                    selectedOptions={selectedAxisScaleOption ? [selectedAxisScaleOption] : []}
                    onChange={handleSelectChange('axis_scale')}
                    singleSelection={{ asPlainText: true }}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiHorizontalRule />

            <EuiFlexGroup responsive={false} wrap={true} alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.backgroundColorLabel"
                    defaultMessage="背景色："
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <ColorPicker
                  onChange={this.props.onChange}
                  name="background_color"
                  value={model.background_color}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.showLegendLabel"
                    defaultMessage="显示图例？"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <YesNo
                  value={model.show_legend}
                  name="show_legend"
                  onChange={this.props.onChange}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel htmlFor={htmlId('legendPos')}>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.legendPositionLabel"
                    defaultMessage="图例位置"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiComboBox
                  isClearable={false}
                  id={htmlId('legendPos')}
                  options={legendPositionOptions}
                  selectedOptions={selectedLegendPosOption ? [selectedLegendPosOption] : []}
                  onChange={handleSelectChange('legend_position')}
                  singleSelection={{ asPlainText: true }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.displayGridLabel"
                    defaultMessage="显示网格"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <YesNo value={model.show_grid} name="show_grid" onChange={this.props.onChange} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormLabel>
                  <FormattedMessage
                    id="visTypeTimeseries.timeseries.optionsTab.tooltipMode"
                    defaultMessage="工具提示"
                  />
                </EuiFormLabel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiComboBox
                  isClearable={false}
                  id={htmlId('tooltipMode')}
                  options={tooltipModeOptions}
                  selectedOptions={selectedTooltipMode ? [selectedTooltipMode] : []}
                  onChange={handleSelectChange('tooltip_mode')}
                  singleSelection={{ asPlainText: true }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </div>
      );
    }
    return (
      <>
        <EuiTabs size="s">
          <EuiTab isSelected={selectedTab === 'data'} onClick={() => this.switchTab('data')}>
            <FormattedMessage
              id="visTypeTimeseries.timeseries.dataTab.dataButtonLabel"
              defaultMessage="数据"
            />
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === 'options'}
            onClick={() => this.switchTab('options')}
            data-test-subj="timeSeriesEditorPanelOptionsBtn"
          >
            <FormattedMessage
              id="visTypeTimeseries.timeseries.optionsTab.panelOptionsButtonLabel"
              defaultMessage="面板选项"
            />
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === 'annotations'}
            onClick={() => this.switchTab('annotations')}
          >
            <FormattedMessage
              id="visTypeTimeseries.timeseries.annotationsTab.annotationsButtonLabel"
              defaultMessage="注释"
            />
          </EuiTab>
        </EuiTabs>
        {view}
      </>
    );
  }
}

TimeseriesPanelConfigUi.propTypes = {
  fields: PropTypes.object,
  model: PropTypes.object,
  onChange: PropTypes.func,
};

export const TimeseriesPanelConfig = injectI18n(TimeseriesPanelConfigUi);
