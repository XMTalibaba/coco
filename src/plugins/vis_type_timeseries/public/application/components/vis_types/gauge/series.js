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
import { ColorPicker } from '../../color_picker';
import { AddDeleteButtons } from '../../add_delete_buttons';
import { SeriesConfig } from '../../series_config';
import { Split } from '../../split';
import { SeriesDragHandler } from '../../series_drag_handler';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiButtonIcon,
} from '@elastic/eui';
import { createTextHandler } from '../../lib/create_text_handler';
import { injectI18n, FormattedMessage } from '@kbn/i18n/react';
import { Aggs } from '../../aggs/aggs';

function GaugeSeriesUi(props) {
  const {
    panel,
    fields,
    onAdd,
    name,
    onChange,
    onDelete,
    disableDelete,
    disableAdd,
    selectedTab,
    visible,
    intl,
    uiRestrictions,
  } = props;

  const defaults = { label: '' };
  const model = { ...defaults, ...props.model };

  const handleChange = createTextHandler(onChange);

  let caretIcon = 'arrowDown';
  if (!visible) caretIcon = 'arrowRight';

  let body = null;
  if (visible) {
    let seriesBody;
    if (selectedTab === 'metrics') {
      seriesBody = (
        <div>
          <Aggs
            onChange={props.onChange}
            fields={fields}
            panel={panel}
            model={model}
            name={name}
            uiRestrictions={uiRestrictions}
            dragHandleProps={props.dragHandleProps}
          />
          <div className="tvbAggRow tvbAggRow--split">
            <Split
              onChange={props.onChange}
              fields={fields}
              panel={panel}
              model={model}
              uiRestrictions={uiRestrictions}
            />
          </div>
        </div>
      );
    } else {
      seriesBody = (
        <SeriesConfig
          fields={props.fields}
          model={props.model}
          onChange={props.onChange}
          indexPatternForQuery={props.indexPatternForQuery}
        />
      );
    }
    body = (
      <div className="tvbSeries__body">
        <EuiTabs size="s">
          <EuiTab isSelected={selectedTab === 'metrics'} onClick={() => props.switchTab('metrics')}>
            <FormattedMessage
              id="visTypeTimeseries.gauge.dataTab.metricsButtonLabel"
              defaultMessage="指标"
            />
          </EuiTab>
          <EuiTab
            data-test-subj="seriesOptions"
            isSelected={selectedTab === 'options'}
            onClick={() => props.switchTab('options')}
          >
            <FormattedMessage
              id="visTypeTimeseries.gauge.optionsTab.optionsButtonLabel"
              defaultMessage="选项"
            />
          </EuiTab>
        </EuiTabs>
        {seriesBody}
      </div>
    );
  }

  const colorPicker = (
    <ColorPicker disableTrash={true} onChange={props.onChange} name="color" value={model.color} />
  );

  return (
    <div className={`${props.className}`} style={props.style}>
      <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType={caretIcon}
            color="text"
            onClick={props.toggleVisible}
            aria-label={intl.formatMessage({
              id: 'visTypeTimeseries.gauge.editor.toggleEditorAriaLabel',
              defaultMessage: '切换序列编辑器',
            })}
            aria-expanded={props.visible}
          />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>{colorPicker}</EuiFlexItem>

        <EuiFlexItem>
          <EuiFieldText
            fullWidth
            onChange={handleChange('label')}
            placeholder={intl.formatMessage({
              id: 'visTypeTimeseries.gauge.editor.labelPlaceholder',
              defaultMessage: '标签',
            })}
            value={model.label}
          />
        </EuiFlexItem>

        <SeriesDragHandler
          dragHandleProps={props.dragHandleProps}
          hideDragHandler={props.disableDelete}
        />

        <EuiFlexItem grow={false}>
          <AddDeleteButtons
            addTooltip={intl.formatMessage({
              id: 'visTypeTimeseries.gauge.editor.addSeriesTooltip',
              defaultMessage: '添加序列',
            })}
            deleteTooltip={intl.formatMessage({
              id: 'visTypeTimeseries.gauge.editor.deleteSeriesTooltip',
              defaultMessage: '删除序列',
            })}
            cloneTooltip={intl.formatMessage({
              id: 'visTypeTimeseries.gauge.editor.cloneSeriesTooltip',
              defaultMessage: '克隆序列',
            })}
            onDelete={onDelete}
            onClone={props.onClone}
            onAdd={onAdd}
            disableDelete={disableDelete}
            disableAdd={disableAdd}
            responsive={false}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {body}
    </div>
  );
}

GaugeSeriesUi.propTypes = {
  className: PropTypes.string,
  colorPicker: PropTypes.bool,
  disableAdd: PropTypes.bool,
  disableDelete: PropTypes.bool,
  fields: PropTypes.object,
  name: PropTypes.string,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onClone: PropTypes.func,
  onDelete: PropTypes.func,
  model: PropTypes.object,
  panel: PropTypes.object,
  selectedTab: PropTypes.string,
  style: PropTypes.object,
  switchTab: PropTypes.func,
  toggleVisible: PropTypes.func,
  visible: PropTypes.bool,
  uiRestrictions: PropTypes.object,
  dragHandleProps: PropTypes.object,
  indexPatternForQuery: PropTypes.string,
};

export const GaugeSeries = injectI18n(GaugeSeriesUi);
