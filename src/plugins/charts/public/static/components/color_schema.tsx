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

import React, { useEffect, useState } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiLink, EuiText } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

import { VisOptionsProps } from 'src/plugins/vis_default_editor/public';
import { SelectOption } from './select';
import { SwitchOption } from './switch';
import { ColorSchemaParams } from './types';
import { ColorSchema } from '../color_maps';

export type SetColorSchemaOptionsValue = <T extends keyof ColorSchemaParams>(
  paramName: T,
  value: ColorSchemaParams[T]
) => void;

interface ColorSchemaOptionsProps extends ColorSchemaParams {
  disabled?: boolean;
  colorSchemas: ColorSchema[];
  uiState: VisOptionsProps['uiState'];
  setValue: SetColorSchemaOptionsValue;
  showHelpText?: boolean;
}

function ColorSchemaOptions({
  disabled,
  colorSchema,
  colorSchemas,
  invertColors,
  uiState,
  setValue,
  showHelpText = true,
}: ColorSchemaOptionsProps) {
  const [isCustomColors, setIsCustomColors] = useState(() => !!uiState.get('vis.colors'));

  useEffect(() => {
    uiState.on('colorChanged', () => {
      setIsCustomColors(true);
    });
  }, [uiState]);

  const resetColorsButton = (
    <EuiText size="xs">
      <EuiLink
        onClick={() => {
          uiState.set('vis.colors', null);
          setIsCustomColors(false);
        }}
      >
        <FormattedMessage
          id="charts.controls.colorSchema.resetColorsButtonLabel"
          defaultMessage="重置颜色"
        />
      </EuiLink>
    </EuiText>
  );

  return (
    <>
      <SelectOption
        disabled={disabled}
        helpText={
          showHelpText &&
          i18n.translate('charts.controls.colorSchema.howToChangeColorsDescription', {
            defaultMessage: '可以更改图例中的各个颜色.',
          })
        }
        label={i18n.translate('charts.controls.colorSchema.colorSchemaLabel', {
          defaultMessage: '颜色方案',
        })}
        labelAppend={isCustomColors && resetColorsButton}
        options={colorSchemas}
        paramName="colorSchema"
        value={colorSchema}
        setValue={setValue}
      />

      <SwitchOption
        disabled={disabled}
        label={i18n.translate('charts.controls.colorSchema.reverseColorSchemaLabel', {
          defaultMessage: '反向方案',
        })}
        paramName="invertColors"
        value={invertColors}
        setValue={setValue}
      />
    </>
  );
}

export { ColorSchemaOptions };
