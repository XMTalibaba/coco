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
import { last } from 'lodash';
import { EuiIcon, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { AddDeleteButtons } from '../add_delete_buttons';
import { SeriesDragHandler } from '../series_drag_handler';
import { MetricsItemsSchema } from '../../../../common/types';
import { DragHandleProps } from '../../../types';

interface AggRowProps {
  disableDelete: boolean;
  model: MetricsItemsSchema;
  siblings: MetricsItemsSchema[];
  dragHandleProps: DragHandleProps;
  children: React.ReactNode;
  onAdd: () => void;
  onDelete: () => void;
}

export function AggRow(props: AggRowProps) {
  let iconType = 'eyeClosed';
  let iconColor = 'subdued';
  const lastSibling = last(props.siblings) as MetricsItemsSchema;

  if (lastSibling.id === props.model.id) {
    iconType = 'eye';
    iconColor = 'text';
  }

  return (
    <div className="tvbAggRow">
      <EuiFlexGroup
        data-test-subj="aggRow"
        gutterSize="s"
        alignItems="flexStart"
        responsive={false}
      >
        <EuiFlexItem grow={false}>
          <EuiIcon className="tvbAggRow__visibilityIcon" type={iconType} color={iconColor} />
        </EuiFlexItem>
        <EuiFlexItem className="tvbAggRow__children">{props.children}</EuiFlexItem>

        <SeriesDragHandler
          dragHandleProps={props.dragHandleProps}
          hideDragHandler={props.disableDelete}
        />

        <EuiFlexItem grow={false}>
          <AddDeleteButtons
            testSubj="addMetric"
            addTooltip={i18n.translate('visTypeTimeseries.aggRow.addMetricButtonTooltip', {
              defaultMessage: '添加指标',
            })}
            deleteTooltip={i18n.translate('visTypeTimeseries.aggRow.deleteMetricButtonTooltip', {
              defaultMessage: '删除指标',
            })}
            onAdd={props.onAdd}
            onDelete={props.onDelete}
            disableDelete={props.disableDelete}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
