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

function IsFilteredByCollarParamEditor(props: AggParamEditorProps<boolean>) {
  return (
    <SwitchParamEditor
      displayLabel={i18n.translate(
        'visDefaultEditor.controls.onlyRequestDataAroundMapExtentLabel',
        {
          defaultMessage: '仅请求地图范围的数据',
        }
      )}
      displayToolTip={i18n.translate(
        'visDefaultEditor.controls.onlyRequestDataAroundMapExtentTooltip',
        {
          defaultMessage:
            '应用 geo_bounding_box 筛选聚合以使用领口将主题区域缩小到地图视图框',
        }
      )}
      dataTestSubj="isFilteredByCollarCheckbox"
      {...props}
    />
  );
}

export { IsFilteredByCollarParamEditor };
