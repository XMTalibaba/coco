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

import React, { useCallback } from 'react';
import { EuiButtonGroup, EuiFormRow, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { AggControlProps } from './agg_control_props';

const PARAMS = {
  NAME: 'row',
  ROWS: 'visEditorSplitBy__true',
  COLUMNS: 'visEditorSplitBy__false',
};

function RowsOrColumnsControl({ editorStateParams, setStateParamValue }: AggControlProps) {
  if (editorStateParams.row === undefined) {
    setStateParamValue(PARAMS.NAME, true);
  }
  const idSelected = `visEditorSplitBy__${editorStateParams.row}`;
  const options = [
    {
      id: PARAMS.ROWS,
      label: i18n.translate('visDefaultEditor.controls.rowsLabel', {
        defaultMessage: '行',
      }),
    },
    {
      id: PARAMS.COLUMNS,
      label: i18n.translate('visDefaultEditor.controls.columnsLabel', {
        defaultMessage: '列',
      }),
    },
  ];
  const onChange = useCallback(
    (optionId) => setStateParamValue(PARAMS.NAME, optionId === PARAMS.ROWS),
    [setStateParamValue]
  );

  return (
    <>
      <EuiFormRow compressed fullWidth={true}>
        <EuiButtonGroup
          data-test-subj="visEditorSplitBy"
          legend={i18n.translate('visDefaultEditor.controls.splitByLegend', {
            defaultMessage: '按行或列拆分图表.',
          })}
          options={options}
          isFullWidth={true}
          idSelected={idSelected}
          onChange={onChange}
        />
      </EuiFormRow>
      <EuiSpacer size="m" />
    </>
  );
}

export { RowsOrColumnsControl };
