/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiFormRow,
} from '@elastic/eui';
import { map, isEmpty } from 'lodash';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { UserAttributes } from '../../types';
import {
  appendElementToArray,
  removeElementFromArray,
  updateElementInArrayHandler,
} from '../../utils/array-state-utils';
import { PanelWithHeader } from '../../utils/panel-with-header';
import { UserAttributeStateClass } from './types';
import { FormRow } from '../../utils/form-row';
import { DocLinks } from '../../constants';

export function buildAttributeState(attributesDict: UserAttributes): UserAttributeStateClass[] {
  return map(attributesDict, (v, k) => ({
    key: k.toString(),
    value: v,
  }));
}

export function unbuildAttributeState(attributesList: UserAttributeStateClass[]): UserAttributes {
  return attributesList.reduce(
    (attributes: UserAttributes, { key, value }: UserAttributeStateClass) => ({
      ...attributes,
      [key]: value,
    }),
    {}
  );
}

function getEmptyAttribute() {
  return { key: '', value: '' };
}

function generateAttributesPanels(
  userAttributes: UserAttributeStateClass[],
  setAttributes: Dispatch<SetStateAction<UserAttributeStateClass[]>>
) {
  const panels = userAttributes.map((userAttribute, arrayIndex) => {
    const onValueChangeHandler = (attributeToUpdate: string) =>
      updateElementInArrayHandler(setAttributes, [arrayIndex, attributeToUpdate]);

    return (
      <Fragment key={`attributes-${arrayIndex}`}>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <FormRow headerText={arrayIndex === 0 ? '变量名' : ''}>
              <EuiFieldText
                id={`attribute-${arrayIndex}`}
                value={userAttribute.key}
                onChange={(e) => onValueChangeHandler('key')(e.target.value)}
                placeholder="输入变量名"
              />
            </FormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <FormRow headerText={arrayIndex === 0 ? '值' : ''}>
              <EuiFieldText
                id={`value-${arrayIndex}`}
                value={userAttribute.value}
                onChange={(e) => onValueChangeHandler('value')(e.target.value)}
                placeholder="输入值"
              />
            </FormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace={arrayIndex === 0 ? true : false}>
              <EuiButton
                id={`delete-${arrayIndex}`}
                color="danger"
                onClick={() => removeElementFromArray(setAttributes, [], arrayIndex)}
              >
                删除
              </EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  });
  return <>{panels}</>;
}

export function AttributePanel(props: {
  state: UserAttributeStateClass[];
  setState: Dispatch<SetStateAction<UserAttributeStateClass[]>>;
}) {
  const { state, setState } = props;
  // Show one empty row if there is no data.
  if (isEmpty(state)) {
    setState([getEmptyAttribute()]);
  }
  return (
    <PanelWithHeader
      headerText="属性"
      headerSubText="属性可以用于进一步描述用户，更重要的是，它们可以作为角色索引权限中的文档级别安全查询中的变量。这使得基于用户属性编写动态DLS查询成为可能。"
      // helpLink={DocLinks.AttributeBasedSecurityDoc}
      optional
    >
      {generateAttributesPanels(state, setState)}
      <EuiSpacer />
      <EuiButton
        id="add-row"
        onClick={() => {
          appendElementToArray(setState, [], getEmptyAttribute());
        }}
      >
        添加另一个属性
      </EuiButton>
    </PanelWithHeader>
  );
}
