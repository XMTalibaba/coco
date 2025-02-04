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

import React, { Fragment, useCallback, useState, useEffect } from 'react';
import {
  htmlIdGenerator,
  EuiButtonIcon,
  EuiFieldNumber,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFormErrorText,
  EuiIcon,
  EuiSpacer,
  EuiButtonEmpty,
  EuiFormRow,
  EuiToolTip,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import { isEqual, omit } from 'lodash';

const FROM_PLACEHOLDER = '\u2212\u221E';
const TO_PLACEHOLDER = '+\u221E';

const generateId = htmlIdGenerator();
const isEmpty = (value: any) => value === undefined || value === null;

export interface RangeValues {
  type?: 'range';
  from?: number;
  to?: number;
}

interface RangeValuesModel extends RangeValues {
  id: string;
}

interface RangesParamEditorProps {
  'data-test-subj'?: string;
  error?: React.ReactNode;
  value?: RangeValues[];
  hidePlaceholders?: boolean;
  setValue(value: RangeValues[]): void;
  setValidity?(isValid: boolean): void;
  setTouched?(isTouched: boolean): void;
  addRangeValues?(): RangeValues;
  validateRange?(range: RangeValues, index: number): boolean[];
}

function RangesParamEditor({
  'data-test-subj': dataTestSubj = 'range',
  addRangeValues,
  error,
  value = [],
  hidePlaceholders,
  setValue,
  setTouched,
  setValidity,
  validateRange,
}: RangesParamEditorProps) {
  const [ranges, setRanges] = useState(() =>
    value.map((range) => ({ ...range, id: generateId() }))
  );
  const updateRanges = useCallback(
    (rangeValues: RangeValuesModel[]) => {
      // do not set internal id parameter into saved object
      setValue(rangeValues.map((range) => omit(range, 'id')));
      setRanges(rangeValues);

      if (setTouched) {
        setTouched(true);
      }
    },
    [setTouched, setValue]
  );
  const onAddRange = useCallback(
    () =>
      addRangeValues
        ? updateRanges([...ranges, { ...addRangeValues(), id: generateId() }])
        : updateRanges([...ranges, { id: generateId() }]),
    [addRangeValues, ranges, updateRanges]
  );
  const onRemoveRange = (id: string) => updateRanges(ranges.filter((range) => range.id !== id));
  const onChangeRange = (id: string, key: string, newValue: string) =>
    updateRanges(
      ranges.map((range) =>
        range.id === id
          ? {
              ...range,
              [key]: newValue === '' ? undefined : parseFloat(newValue),
            }
          : range
      )
    );

  // set up an initial range when there is no default range
  useEffect(() => {
    if (!value.length) {
      onAddRange();
    }
  }, [onAddRange, value.length]);

  useEffect(() => {
    // responsible for discarding changes
    if (
      value.length !== ranges.length ||
      value.some((range, index) => !isEqual(range, omit(ranges[index], 'id')))
    ) {
      setRanges(value.map((range) => ({ ...range, id: generateId() })));
    }
  }, [ranges, value]);

  const hasInvalidRange =
    validateRange &&
    ranges.some(({ from, to, id }, index) => {
      const [isFromValid, isToValid] = validateRange({ from, to }, index);

      return !isFromValid || !isToValid;
    });

  useEffect(() => {
    if (setValidity) {
      setValidity(!hasInvalidRange);
    }
  }, [hasInvalidRange, setValidity]);

  return (
    <EuiFormRow compressed fullWidth>
      <>
        {ranges.map(({ from, to, id }, index) => {
          const deleteBtnTitle = i18n.translate(
            'visDefaultEditor.controls.ranges.removeRangeButtonAriaLabel',
            {
              defaultMessage: '移除范围 {from} 至 {to}',
              values: {
                from: isEmpty(from) ? FROM_PLACEHOLDER : from,
                to: isEmpty(to) ? TO_PLACEHOLDER : to,
              },
            }
          );

          let isFromValid = true;
          let isToValid = true;

          if (validateRange) {
            [isFromValid, isToValid] = validateRange({ from, to }, index);
          }

          const gtePrependLabel = i18n.translate(
            'visDefaultEditor.controls.ranges.greaterThanOrEqualPrepend',
            {
              defaultMessage: '≥',
            }
          );
          const gteTooltipContent = i18n.translate(
            'visDefaultEditor.controls.ranges.greaterThanOrEqualTooltip',
            {
              defaultMessage: '大于或等于',
            }
          );
          const ltPrependLabel = i18n.translate(
            'visDefaultEditor.controls.ranges.lessThanPrepend',
            {
              defaultMessage: '&lt',
            }
          );
          const ltTooltipContent = i18n.translate(
            'visDefaultEditor.controls.ranges.lessThanTooltip',
            {
              defaultMessage: '小于',
            }
          );

          return (
            <Fragment key={id}>
              <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <EuiFlexItem>
                  <EuiFieldNumber
                    aria-label={i18n.translate('visDefaultEditor.controls.ranges.fromLabel', {
                      defaultMessage: '从',
                    })}
                    data-test-subj={`${dataTestSubj}${index}__from`}
                    value={isEmpty(from) ? '' : from}
                    placeholder={hidePlaceholders ? undefined : FROM_PLACEHOLDER}
                    onChange={(ev) => onChangeRange(id, 'from', ev.target.value)}
                    fullWidth={true}
                    compressed={true}
                    isInvalid={!isFromValid}
                    prepend={
                      <EuiToolTip content={gteTooltipContent}>
                        <EuiText size="s">{gtePrependLabel}</EuiText>
                      </EuiToolTip>
                    }
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiIcon type="sortRight" color="subdued" />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFieldNumber
                    aria-label={i18n.translate('visDefaultEditor.controls.ranges.toLabel', {
                      defaultMessage: '到',
                    })}
                    data-test-subj={`${dataTestSubj}${index}__to`}
                    value={isEmpty(to) ? '' : to}
                    placeholder={hidePlaceholders ? undefined : TO_PLACEHOLDER}
                    onChange={(ev) => onChangeRange(id, 'to', ev.target.value)}
                    fullWidth={true}
                    compressed={true}
                    isInvalid={!isToValid}
                    prepend={
                      <EuiToolTip content={ltTooltipContent}>
                        <EuiText size="s">{ltPrependLabel}</EuiText>
                      </EuiToolTip>
                    }
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    title={deleteBtnTitle}
                    aria-label={deleteBtnTitle}
                    disabled={value.length === 1}
                    color="danger"
                    iconType="trash"
                    onClick={() => onRemoveRange(id)}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="xs" />
            </Fragment>
          );
        })}

        {hasInvalidRange && error && <EuiFormErrorText>{error}</EuiFormErrorText>}

        <EuiSpacer size="s" />
        <EuiFlexItem>
          <EuiButtonEmpty
            data-test-subj={`${dataTestSubj}__addRangeButton`}
            iconType="plusInCircleFilled"
            onClick={onAddRange}
            size="xs"
          >
            <FormattedMessage
              id="visDefaultEditor.controls.ranges.addRangeButtonLabel"
              defaultMessage="添加范围"
            />
          </EuiButtonEmpty>
        </EuiFlexItem>
      </>
    </EuiFormRow>
  );
}

export { RangesParamEditor };
