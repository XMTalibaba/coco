/*
 * Wazuh app - React component for show search and filter
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { useState, useEffect, Fragment } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiContextMenu,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiPopover,
  EuiSuperSelect,
  EuiInputPopover,
  EuiSuggestItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer
} from '@elastic/eui';

const operators = {
  '=': '相等',
  '!=': '不相等',
  '<': '小于',
  '>': '大于',
  '~': '相似'
}

export function ContextMenu(props) {
  const [isOpen, setIsOpen] = useState(false);
  const panels = flattenPanelTree(panelTree({...props, setIsOpen}));
  const { conjuntion = false, field, value, operator } = props.qFilter;
  const button = (<EuiButtonEmpty color='text' size="xs" onClick={() => setIsOpen(!isOpen)}>
    <strong>{conjuntion && conjuntion}</strong> {field} {operators[operator]} {value}
  </EuiButtonEmpty>)
  return (
    <EuiPopover
      button={button}
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      panelPaddingSize="none"
      anchorPosition="downLeft">
      <EuiContextMenu initialPanelId={0} panels={panels} />
    </EuiPopover>);
}

function flattenPanelTree(tree, array = []) {
  // @ts-ignore
  array.push(tree);
  const treeEach = item => {
    if (item.panel) {
      flattenPanelTree(item.panel, array);
      item.panel = item.panel.id;
    }
  }

  if (!tree.items) {
    return array;
  }
  tree.items.forEach(treeEach);

  return array;
}

const panelTree = (props) => {
  const { operator, conjuntion } = props.qFilter;
  const { invertOperator, changeConjuntion } = props;
  const panels = {
    id: 0,
    items: [
      {
        name: '编辑筛选',
        icon: 'pencil',
        panel: {
          id: 1,
          title: '编辑筛选',
          width: 400,
          content: <EditFilter {...props} />
        }
      },
      {
        name: '删除筛选',
        icon: 'trash',
        onClick: props.deleteFilter
      },
    ]
  }
  operator !== '~' && panels.items.unshift(operatorItem(props))
  !!conjuntion && panels.items.unshift(conjuntionItem(props))
  return panels;
}

const operatorItem = (props) => {
  const { invertOperator, setIsOpen } = props;
  return {
    name: '反转运算符',
    icon: 'kqlOperand',
    onClick: (...args) => {invertOperator(...args); setIsOpen(false)}
  }
}

const conjuntionItem = (props) => {
  const { changeConjuntion, setIsOpen } = props;
  return {
    name: '改变连接词',
    icon: 'kqlSelector',
    onClick: (...args) => {changeConjuntion(...args); setIsOpen(false)}
  }
}

function EditFilter(props) {
  const { index, qSuggest } = props
  const query = props.qInterpreter.getQuery(index);
  const [conjuntion, setConjuntion] = useState(query.conjuntion);
  const [operator, setOperator] = useState(query.operator);
  const [value, setValue] = useState(query.value);
  return <EuiForm className="globalFilterItem__editorForm">
    {conjuntion &&
      EditFilterConjuntion(conjuntion, setConjuntion)}
    {EditFilterOperator(operator, setOperator)}
    {EditFilterValue(value, setValue, qSuggest)}
    {EditFilterSaveButton(query, operator, value, conjuntion, props)}
  </EuiForm>;
}

function EditFilterSaveButton(query: any, operator: any, value: any, conjuntion: any, props: any): React.ReactNode {
  return (
    <Fragment>
      <EuiSpacer />
      <EuiFlexGroup direction='rowReverse'>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={() => {
            const newFilter = { field: query.field, operator, value };
            conjuntion && (newFilter['conjuntion'] = conjuntion);
            props.qInterpreter.editByIndex(props.index, newFilter);
            props.updateFilters(newFilter);
            props.setIsOpen(false);
          }}>
            保存
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => {
            props.setIsOpen(false);
          }}>
            取消
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
}

function EditFilterValue(value, setValue, suggest): React.ReactNode {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [suggetsValues, setSuggetsValues] = useState([]);
  useEffect(() => {
    updateSuggestsValues(suggest, value, setSuggetsValues);
  }, [value])
  return <EuiFormRow label="Value">
    <EuiInputPopover
      input={<EuiFieldText
        value={value}
        onFocus={() => setIsPopoverOpen(true)}
        onChange={(e) => setValue(e.target.value)} />}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)} >
      {suggetsValues.map((item, key) => (
        <EuiSuggestItem key={key}
          label={item}
          type={{ iconType: 'kqlValue', color: 'tint0' }}
          onClick={() => { setValue(item); setIsPopoverOpen(false) }} />
      ))}
    </EuiInputPopover>
  </EuiFormRow>;
}

async function updateSuggestsValues(suggest: any, value: any, setSuggetsValues: React.Dispatch<React.SetStateAction<never[]>>) {
  (suggest.values && {}.toString.call(suggest.values) === '[object Function]')
    ? setSuggetsValues(await suggest.values(value))
    : setSuggetsValues(suggest.values || []);
}

function EditFilterOperator(operator, setOperator) {
  return <EuiFormRow label="Operator">
    <EuiSuperSelect options={[
      { value: '=', inputDisplay: '相等' },
      { value: '!=', inputDisplay: '不相等' },
      { value: '<', inputDisplay: '小于' },
      { value: '>', inputDisplay: '大于' },
      { value: '~', inputDisplay: '相似' },
    ]} valueOfSelected={operator} onChange={setOperator} />
  </EuiFormRow>;
}

function EditFilterConjuntion(conjuntion: string, setConjuntion): React.ReactNode {
  return <EuiFormRow label="Conjuntion">
    <EuiButtonGroup options={[
      { id: `conjuntion-AND`, label: "AND" },
      { id: `conjuntion-OR`, label: "OR" },
    ]} idSelected={`conjuntion-${conjuntion.trim()}`} onChange={() => setConjuntion(/and/gi.test(conjuntion) ? ' OR ' : ' AND ')} />
  </EuiFormRow>;
}
