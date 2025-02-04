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

import React, { useCallback, useEffect } from 'react';
import { i18n } from '@kbn/i18n';

import { ValueAxis } from '../../../types';
import { NumberInputOption, SwitchOption } from '../../../../../charts/public';
import { YExtents } from './y_extents';
import { SetScale } from './value_axis_options';

export interface CustomExtentsOptionsProps {
  axisScale: ValueAxis['scale'];
  setMultipleValidity(paramName: string, isValid: boolean): void;
  setValueAxis<T extends keyof ValueAxis>(paramName: T, value: ValueAxis[T]): void;
  setValueAxisScale: SetScale;
}

function CustomExtentsOptions({
  axisScale,
  setMultipleValidity,
  setValueAxis,
  setValueAxisScale,
}: CustomExtentsOptionsProps) {
  const invalidBoundsMarginMessage = i18n.translate(
    'visTypeVislib.controls.pointSeries.valueAxes.scaleToDataBounds.minNeededBoundsMargin',
    { defaultMessage: '边界边距必须大于或等于 0.' }
  );

  const isBoundsMarginValid =
    !axisScale.defaultYExtents || !axisScale.boundsMargin || axisScale.boundsMargin >= 0;

  const setBoundsMargin = useCallback(
    (paramName: 'boundsMargin', value: number | '') =>
      setValueAxisScale(paramName, value === '' ? undefined : value),
    [setValueAxisScale]
  );

  const onDefaultYExtentsChange = useCallback(
    (paramName: 'defaultYExtents', value: boolean) => {
      const scale = { ...axisScale, [paramName]: value };
      if (!scale.defaultYExtents) {
        delete scale.boundsMargin;
      }
      setValueAxis('scale', scale);
    },
    [axisScale, setValueAxis]
  );

  const onSetYExtentsChange = useCallback(
    (paramName: 'setYExtents', value: boolean) => {
      const scale = { ...axisScale, [paramName]: value };
      if (!scale.setYExtents) {
        delete scale.min;
        delete scale.max;
      }
      setValueAxis('scale', scale);
    },
    [axisScale, setValueAxis]
  );

  useEffect(() => {
    setMultipleValidity('boundsMargin', isBoundsMarginValid);

    return () => setMultipleValidity('boundsMargin', true);
  }, [isBoundsMarginValid, setMultipleValidity]);

  return (
    <>
      <SwitchOption
        label={i18n.translate(
          'visTypeVislib.controls.pointSeries.valueAxes.scaleToDataBoundsLabel',
          {
            defaultMessage: '缩放到数据边界',
          }
        )}
        paramName="defaultYExtents"
        value={axisScale.defaultYExtents}
        setValue={onDefaultYExtentsChange}
      />

      {axisScale.defaultYExtents && (
        <>
          <NumberInputOption
            error={!isBoundsMarginValid && invalidBoundsMarginMessage}
            isInvalid={!isBoundsMarginValid}
            label={i18n.translate(
              'visTypeVislib.controls.pointSeries.valueAxes.scaleToDataBounds.boundsMargin',
              {
                defaultMessage: '边界边距',
              }
            )}
            step={0.1}
            min={0}
            paramName="boundsMargin"
            value={axisScale.boundsMargin}
            setValue={setBoundsMargin}
          />
        </>
      )}

      <SwitchOption
        data-test-subj="yAxisSetYExtents"
        label={i18n.translate('visTypeVislib.controls.pointSeries.valueAxes.setAxisExtentsLabel', {
          defaultMessage: '设置轴范围',
        })}
        paramName="setYExtents"
        value={axisScale.setYExtents}
        setValue={onSetYExtentsChange}
      />

      {axisScale.setYExtents && (
        <YExtents
          scale={axisScale}
          setScale={setValueAxisScale}
          setMultipleValidity={setMultipleValidity}
        />
      )}
    </>
  );
}

export { CustomExtentsOptions };
