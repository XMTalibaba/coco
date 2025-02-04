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

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { AddDeleteButtons } from './add_delete_buttons';
import { collectionActions } from './lib/collection_actions';
import { ColorPicker } from './color_picker';
import {
  htmlIdGenerator,
  EuiComboBox,
  EuiFieldNumber,
  EuiFormLabel,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormattedMessage, injectI18n } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';

class ColorRulesUI extends Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
  }

  handleChange(item, name, cast = String) {
    return (e) => {
      const handleChange = collectionActions.handleChange.bind(null, this.props);
      const part = {};
      part[name] = cast(_.get(e, '[0].value', _.get(e, 'target.value')));
      if (part[name] === 'undefined') part[name] = undefined;
      if (cast === Number && isNaN(part[name])) part[name] = undefined;
      handleChange(_.assign({}, item, part));
    };
  }

  renderRow(row, i, items) {
    const defaults = { value: 0 };
    const model = { ...defaults, ...row };
    const handleAdd = () => collectionActions.handleAdd(this.props);
    const handleDelete = collectionActions.handleDelete.bind(null, this.props, model);
    const { intl } = this.props;
    const operatorOptions = [
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.colorRules.greaterThanLabel',
          defaultMessage: '> 大于',
        }),
        value: 'gt',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.colorRules.greaterThanOrEqualLabel',
          defaultMessage: '>= 大于等于',
        }),
        value: 'gte',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.colorRules.lessThanLabel',
          defaultMessage: '&lt; 小于',
        }),
        value: 'lt',
      },
      {
        label: intl.formatMessage({
          id: 'visTypeTimeseries.colorRules.lessThanOrEqualLabel',
          defaultMessage: '&lt;= 小于等于',
        }),
        value: 'lte',
      },
    ];
    const handleColorChange = (part) => {
      const handleChange = collectionActions.handleChange.bind(null, this.props);
      handleChange(_.assign({}, model, part));
    };
    const htmlId = htmlIdGenerator(model.id);
    const selectedOperatorOption = operatorOptions.find((option) => {
      return model.operator === option.value;
    });

    const labelStyle = { marginBottom: 0 };

    let secondary;
    if (!this.props.hideSecondary) {
      secondary = (
        <Fragment>
          <EuiFlexItem grow={false}>
            <EuiFormLabel style={labelStyle}>
              <FormattedMessage
                id="visTypeTimeseries.colorRules.setSecondaryColorLabel"
                defaultMessage="并将 {secondaryName} 设置为"
                values={{ secondaryName: this.props.secondaryName }}
                description="Part of a larger string: Set {primaryName} to {color} and {secondaryName} to {color} if
                metric is {greaterOrLessThan} {value}."
              />
            </EuiFormLabel>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ColorPicker
              onChange={handleColorChange}
              name={this.props.secondaryVarName}
              value={model[this.props.secondaryVarName]}
            />
          </EuiFlexItem>
        </Fragment>
      );
    }
    return (
      <EuiFlexGroup
        wrap={true}
        responsive={false}
        gutterSize="s"
        key={model.id}
        alignItems="center"
        className="tvbColorRules__rule"
      >
        <EuiFlexItem grow={false}>
          <EuiFormLabel style={labelStyle}>
            <FormattedMessage
              id="visTypeTimeseries.colorRules.setPrimaryColorLabel"
              defaultMessage="将 {primaryName} 设置为"
              values={{ primaryName: this.props.primaryName }}
              description="Part of a larger string: Set {primaryName} to {color} and {secondaryName} to {color} if
              metric is {greaterOrLessThan} {value}."
            />
          </EuiFormLabel>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ColorPicker
            onChange={handleColorChange}
            name={this.props.primaryVarName}
            value={model[this.props.primaryVarName]}
          />
        </EuiFlexItem>

        {secondary}

        <EuiFlexItem grow={false}>
          <EuiFormLabel style={labelStyle} htmlFor={htmlId('ifMetricIs')}>
            <FormattedMessage
              id="visTypeTimeseries.colorRules.ifMetricIsLabel"
              defaultMessage="如果指标"
              description="Part of a larger string: Set {primaryName} to {color} and {secondaryName} to {color} if
              metric is {greaterOrLessThan} {value}."
            />
          </EuiFormLabel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiComboBox
            id={htmlId('ifMetricIs')}
            options={operatorOptions}
            selectedOptions={selectedOperatorOption ? [selectedOperatorOption] : []}
            onChange={this.handleChange(model, 'operator')}
            singleSelection={{ asPlainText: true }}
            data-test-subj="colorRuleOperator"
            fullWidth
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFieldNumber
            aria-label={intl.formatMessage({
              id: 'visTypeTimeseries.colorRules.valueAriaLabel',
              defaultMessage: '值',
            })}
            value={model.value}
            onChange={this.handleChange(model, 'value', Number)}
            data-test-subj="colorRuleValue"
            fullWidth
          />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <AddDeleteButtons
            onAdd={handleAdd}
            onDelete={handleDelete}
            disableDelete={items.length < 2}
            responsive={false}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  render() {
    const { model, name } = this.props;
    if (!model[name]) return <div />;
    const rows = model[name].map(this.renderRow);
    return <div>{rows}</div>;
  }
}

ColorRulesUI.defaultProps = {
  name: 'color_rules',
  primaryName: i18n.translate('visTypeTimeseries.colorRules.defaultPrimaryNameLabel', {
    defaultMessage: '背景',
  }),
  primaryVarName: 'background_color',
  secondaryName: i18n.translate('visTypeTimeseries.colorRules.defaultSecondaryNameLabel', {
    defaultMessage: '文本',
  }),
  secondaryVarName: 'color',
  hideSecondary: false,
};

ColorRulesUI.propTypes = {
  name: PropTypes.string,
  model: PropTypes.object,
  onChange: PropTypes.func,
  primaryName: PropTypes.string,
  primaryVarName: PropTypes.string,
  secondaryName: PropTypes.string,
  secondaryVarName: PropTypes.string,
  hideSecondary: PropTypes.bool,
};

export const ColorRules = injectI18n(ColorRulesUI);
