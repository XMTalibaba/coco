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
import { i18n } from '@kbn/i18n';
import { SwitchParamEditor } from './switch';
import { AggParamEditorProps } from '../agg_param_props';

function DropPartialsParamEditor(props: AggParamEditorProps<boolean>) {
  return (
    <SwitchParamEditor
      dataTestSubj="dropPartialBucketsCheckbox"
      displayLabel={i18n.translate('visDefaultEditor.controls.dropPartialBucketsLabel', {
        defaultMessage: 'Drop partial buckets',
      })}
      displayToolTip={i18n.translate('visDefaultEditor.controls.dropPartialBucketsTooltip', {
        defaultMessage:
          "移除超出时间范围的存储桶，以便直方图不以不完整的存储桶开始和结束.",
      })}
      {...props}
    />
  );
}

export { DropPartialsParamEditor };
