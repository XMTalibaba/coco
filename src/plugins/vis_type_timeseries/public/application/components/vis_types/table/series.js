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
import PropTypes from 'prop-types';
import { AddDeleteButtons } from '../../add_delete_buttons';
import { TableSeriesConfig as SeriesConfig } from './config';
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
import { FormattedMessage, injectI18n } from '@kbn/i18n/react';
import { Aggs } from '../../aggs/aggs';

function TableSeriesUI(props) {
  const {
    model,
    onAdd,
    name,
    fields,
    panel,
    onChange,
    onDelete,
    disableDelete,
    disableAdd,
    selectedTab,
    visible,
    intl,
    uiRestrictions,
  } = props;

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
        </div>
      );
    } else {
      seriesBody = (
        <SeriesConfig
          panel={props.panel}
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
              id="visTypeTimeseries.table.tab.metricsLabel"
              defaultMessage="指标"
            />
          </EuiTab>
          <EuiTab
            data-test-subj="seriesOptions"
            isSelected={selectedTab === 'options'}
            onClick={() => props.switchTab('options')}
          >
            <FormattedMessage
              id="visTypeTimeseries.table.tab.optionsLabel"
              defaultMessage="选项"
            />
          </EuiTab>
        </EuiTabs>
        {seriesBody}
      </div>
    );
  }

  return (
    <div className={`${props.className}`} style={props.style}>
      <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType={caretIcon}
            color="text"
            onClick={props.toggleVisible}
            aria-label={intl.formatMessage({
              id: 'visTypeTimeseries.table.toggleSeriesEditorAriaLabel',
              defaultMessage: '切换序列编辑器',
            })}
            aria-expanded={props.visible}
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFieldText
            fullWidth
            aria-label={intl.formatMessage({
              id: 'visTypeTimeseries.table.labelAriaLabel',
              defaultMessage: '标签',
            })}
            onChange={handleChange('label')}
            placeholder={intl.formatMessage({
              id: 'visTypeTimeseries.table.labelPlaceholder',
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
              id: 'visTypeTimeseries.table.addSeriesTooltip',
              defaultMessage: '添加序列',
            })}
            deleteTooltip={intl.formatMessage({
              id: 'visTypeTimeseries.table.deleteSeriesTooltip',
              defaultMessage: '删除序列',
            })}
            cloneTooltip={intl.formatMessage({
              id: 'visTypeTimeseries.table.cloneSeriesTooltip',
              defaultMessage: '克隆序列',
            })}
            onDelete={onDelete}
            onClone={props.onClone}
            onAdd={onAdd}
            togglePanelActivation={props.togglePanelActivation}
            isPanelActive={!model.hidden}
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

TableSeriesUI.propTypes = {
  className: PropTypes.string,
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
  togglePanelActivation: PropTypes.func,
  uiRestrictions: PropTypes.object,
  dragHandleProps: PropTypes.object,
  indexPatternForQuery: PropTypes.string,
};

export const TableSeries = injectI18n(TableSeriesUI);
