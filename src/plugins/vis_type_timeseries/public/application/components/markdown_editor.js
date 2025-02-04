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

/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
// Markdown builder is not yet properly accessible

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { createTickFormatter } from './lib/tick_formatter';
import { convertSeriesToVars } from './lib/convert_series_to_vars';
import _ from 'lodash';
import 'brace/mode/markdown';
import 'brace/theme/github';

import { EuiText, EuiCodeBlock, EuiSpacer, EuiTitle, EuiCodeEditor } from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';

export class MarkdownEditor extends Component {
  handleChange = (value) => {
    this.props.onChange({ markdown: value });
  };

  handleOnLoad = (ace) => {
    this.ace = ace;
  };

  handleVarClick(snippet) {
    return () => {
      if (this.ace) this.ace.insert(snippet);
    };
  }

  render() {
    const { visData, model, dateFormat } = this.props;

    if (!visData) {
      return null;
    }

    const series = _.get(visData, `${model.id}.series`, []);
    const variables = convertSeriesToVars(series, model, dateFormat, this.props.getConfig);
    const rows = [];
    const rawFormatter = createTickFormatter('0.[0000]', null, this.props.getConfig);

    const createPrimitiveRow = (key) => {
      const snippet = `{{ ${key} }}`;
      let value = _.get(variables, key);
      if (/raw$/.test(key)) value = rawFormatter(value);
      rows.push(
        <tr key={key}>
          <td>
            <a onClick={this.handleVarClick(snippet)}>{snippet}</a>
          </td>
          <td>
            <code>&ldquo;{value}&rdquo;</code>
          </td>
        </tr>
      );
    };

    const createArrayRow = (key) => {
      const snippet = `{{# ${key} }}{{/ ${key} }}`;
      const date = _.get(variables, `${key}[0][0]`);
      let value = _.get(variables, `${key}[0][1]`);
      if (/raw$/.test(key)) value = rawFormatter(value);
      rows.push(
        <tr key={key}>
          <td>
            <a onClick={this.handleVarClick(snippet)}>{`{{ ${key} }}`}</a>
          </td>
          <td>
            <code>
              [ [ &ldquo;{date}&rdquo;, &ldquo;{value}&rdquo; ], ... ]
            </code>
          </td>
        </tr>
      );
    };

    function walk(obj, path = []) {
      for (const name in obj) {
        if (Array.isArray(obj[name])) {
          createArrayRow(path.concat(name).join('.'));
        } else if (_.isObject(obj[name])) {
          walk(obj[name], path.concat(name));
        } else {
          createPrimitiveRow(path.concat(name).join('.'));
        }
      }
    }

    walk(variables);

    return (
      <div className="tvbMarkdownEditor">
        <div className="tvbMarkdownEditor__editor">
          <EuiCodeEditor
            onLoad={this.handleOnLoad}
            mode="markdown"
            theme="github"
            width="100%"
            height="100%"
            name={`ace-${model.id}`}
            setOptions={{ wrap: true, fontSize: '14px' }}
            value={model.markdown}
            onChange={this.handleChange}
          />
        </div>
        <div className="tvbMarkdownEditor__variables">
          <EuiText>
            <p>
              <FormattedMessage
                id="visTypeTimeseries.markdownEditor.howToUseVariablesInMarkdownDescription"
                defaultMessage="通过 Handlebar (mustache) 语法，以下变量可用于 Markdown 中。{handlebarLink}，以了解可用的表达式."
                values={{
                  // handlebarLink: (
                  //   <a
                  //     href="https://handlebarsjs.com/guide/expressions.html"
                  //     target="_BLANK"
                  //     rel="noreferrer noopener"
                  //   >
                  //     <FormattedMessage
                  //       id="visTypeTimeseries.markdownEditor.howUseVariablesInMarkdownDescription.documentationLinkText"
                  //       defaultMessage="单击此处获取文档"
                  //     />
                  //   </a>
                  // ),
                }}
              />
            </p>
          </EuiText>
          <table className="table" data-test-subj="tsvbMarkdownVariablesTable">
            <thead>
              <tr>
                <th scope="col">
                  <FormattedMessage
                    id="visTypeTimeseries.markdownEditor.nameLabel"
                    defaultMessage="名称"
                  />
                </th>
                <th scope="col">
                  <FormattedMessage
                    id="visTypeTimeseries.markdownEditor.valueLabel"
                    defaultMessage="值"
                  />
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>

          {rows.length === 0 && (
            <EuiTitle
              size="xxs"
              className="tsvbMarkdownVariablesTable__noVariables"
              data-test-subj="tvbMarkdownEditor__noVariables"
            >
              <span>
                <FormattedMessage
                  id="visTypeTimeseries.markdownEditor.noVariablesAvailableDescription"
                  defaultMessage="没有可用于选定数据指标的变量."
                />
              </span>
            </EuiTitle>
          )}

          <EuiSpacer />

          <EuiText>
            <p>
              <FormattedMessage
                id="visTypeTimeseries.markdownEditor.howToAccessEntireTreeDescription"
                defaultMessage="此外，还有名为 {all} 的特殊变量，可用于访问整个树。此变量可用于根据分组依据创建具有数据的列表："
                values={{ all: <code>_all</code> }}
              />
            </p>
          </EuiText>

          <EuiSpacer />

          <EuiCodeBlock>
            {`# All servers:

    {{#each _all}}
    - {{ label }} {{ last.formatted }}
    {{/each}}`}
          </EuiCodeBlock>
        </div>
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  onChange: PropTypes.func,
  model: PropTypes.object,
  dateFormat: PropTypes.string,
  visData: PropTypes.object,
};
