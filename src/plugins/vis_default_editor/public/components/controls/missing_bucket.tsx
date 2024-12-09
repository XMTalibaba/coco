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

import React, { useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { SwitchParamEditor } from './switch';

import { search } from '../../../../data/public';
import { AggParamEditorProps } from '../agg_param_props';

function MissingBucketParamEditor(props: AggParamEditorProps<boolean>) {
  const fieldTypeIsNotString = !search.aggs.isStringType(props.agg);
  const { setValue } = props;

  useEffect(() => {
    if (fieldTypeIsNotString) {
      setValue(false);
    }
  }, [fieldTypeIsNotString, setValue]);

  return (
    <SwitchParamEditor
      {...props}
      dataTestSubj="missingBucketSwitch"
      displayLabel={i18n.translate('visDefaultEditor.controls.otherBucket.showMissingValuesLabel', {
        defaultMessage: '缺失值的标签',
      })}
      displayToolTip={i18n.translate(
        'visDefaultEditor.controls.otherBucket.showMissingValuesTooltip',
        {
          defaultMessage:
            '仅对“字符串”类型的字段有效。启用后，在搜索中包括缺失值的文档。如果此存储桶在排名前 N 中，其将会显示在图表中。如果不在排名前 N 中，并且启用了“在单独的存储桶中对其他值分组”，Elasticsearch 会将缺失值添加到“其他”存储桶.',
        }
      )}
      disabled={fieldTypeIsNotString}
    />
  );
}

export { MissingBucketParamEditor };
