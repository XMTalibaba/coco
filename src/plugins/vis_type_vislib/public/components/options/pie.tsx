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

import { EuiPanel, EuiTitle, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { VisOptionsProps } from 'src/plugins/vis_default_editor/public';
import { TruncateLabelsOption } from '../common';
import { BasicOptions, SwitchOption } from '../../../../charts/public';
import { PieVisParams } from '../../pie';

function PieOptions(props: VisOptionsProps<PieVisParams>) {
  const { stateParams, setValue } = props;
  const setLabels = <T extends keyof PieVisParams['labels']>(
    paramName: T,
    value: PieVisParams['labels'][T]
  ) => setValue('labels', { ...stateParams.labels, [paramName]: value });

  return (
    <>
      <EuiPanel paddingSize="s">
        <EuiTitle size="xs">
          <h3>
            <FormattedMessage
              id="visTypeVislib.editors.pie.pieSettingsTitle"
              defaultMessage="饼图设置"
            />
          </h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <SwitchOption
          label={i18n.translate('visTypeVislib.editors.pie.donutLabel', {
            defaultMessage: '圆环图',
          })}
          paramName="isDonut"
          value={stateParams.isDonut}
          setValue={setValue}
        />
        <BasicOptions {...props} />
      </EuiPanel>

      <EuiSpacer size="s" />

      <EuiPanel paddingSize="s">
        <EuiTitle size="xs">
          <h3>
            <FormattedMessage
              id="visTypeVislib.editors.pie.labelsSettingsTitle"
              defaultMessage="标签设置"
            />
          </h3>
        </EuiTitle>
        <EuiSpacer size="s" />
        <SwitchOption
          label={i18n.translate('visTypeVislib.editors.pie.showLabelsLabel', {
            defaultMessage: '显示标签',
          })}
          paramName="show"
          value={stateParams.labels.show}
          setValue={setLabels}
        />
        <SwitchOption
          label={i18n.translate('visTypeVislib.editors.pie.showTopLevelOnlyLabel', {
            defaultMessage: '仅显示顶级',
          })}
          paramName="last_level"
          value={stateParams.labels.last_level}
          setValue={setLabels}
        />
        <SwitchOption
          label={i18n.translate('visTypeVislib.editors.pie.showValuesLabel', {
            defaultMessage: '显示值',
          })}
          paramName="values"
          value={stateParams.labels.values}
          setValue={setLabels}
        />
        <TruncateLabelsOption value={stateParams.labels.truncate} setValue={setLabels} />
      </EuiPanel>
    </>
  );
}

export { PieOptions };
