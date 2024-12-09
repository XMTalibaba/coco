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

import React, { Fragment } from 'react';
import { EuiCode, EuiIcon, EuiLink, EuiText, EuiSpacer } from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';
import { useKibana } from '../../../../../../../plugins/kibana_react/public';
import { IndexPatternManagmentContext } from '../../../../types';

export const ScriptingSyntax = () => {
  const docLinksScriptedFields = useKibana<IndexPatternManagmentContext>().services.docLinks?.links
    .scriptedFields;
  return (
    <Fragment>
      <EuiSpacer />
      <EuiText>
        <h3>
          <FormattedMessage id="indexPatternManagement.syntaxHeader" defaultMessage="Syntax" />
        </h3>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.defaultLabel.defaultDetail"
            defaultMessage="默认情况下，脚本字段使用 {painless}（一种简单且安全的脚本语言，专用于 Elasticsearch）通过以下格式访问文档中的值："
            values={{
              painless: (
                <EuiLink target="_blank" href={docLinksScriptedFields.painless}>
                  <FormattedMessage
                    id="indexPatternManagement.syntax.defaultLabel.painlessLink"
                    defaultMessage="Painless"
                  />{' '}
                  <EuiIcon type="link" />
                </EuiLink>
              ),
            }}
          />
        </p>
        <p>
          <EuiCode>
            <FormattedMessage
              id="indexPatternManagement.syntax.default.formatLabel"
              defaultMessage="doc['some_field'].value"
            />
          </EuiCode>
        </p>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.painlessLabel.painlessDetail"
            defaultMessage="Painless 功能强大但却易于使用。其提供对许多 {javaAPIs} 的访问。研读其 {syntax}，您将很快上手!"
            values={{
              javaAPIs: (
                <EuiLink target="_blank" href={docLinksScriptedFields.painlessApi}>
                  <FormattedMessage
                    id="indexPatternManagement.syntax.painlessLabel.javaAPIsLink"
                    defaultMessage="原生 Java API"
                  />
                  &nbsp;
                  <EuiIcon type="link" />
                </EuiLink>
              ),
              syntax: (
                <EuiLink target="_blank" href={docLinksScriptedFields.painlessSyntax}>
                  <FormattedMessage
                    id="indexPatternManagement.syntax.painlessLabel.syntaxLink"
                    defaultMessage="语法"
                  />
                  &nbsp;
                  <EuiIcon type="link" />
                </EuiLink>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.kibanaLabel"
            defaultMessage="当前对您编写的 Painless 脚本强加一个特殊限制。它们不能包含命名函数."
          />
        </p>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.lucene.commonLabel.commonDetail"
            defaultMessage="来自较旧的版本？您了解并喜爱的 {lucene} 仍可用。Lucene 表达式很像 JavaScript，但仅限于基本的算术、位和比较运算."
            values={{
              lucene: (
                <EuiLink target="_blank" href={docLinksScriptedFields.luceneExpressions}>
                  <FormattedMessage
                    id="indexPatternManagement.syntax.lucene.commonLabel.luceneLink"
                    defaultMessage="Lucene 表达式"
                  />
                  &nbsp;
                  <EuiIcon type="link" />
                </EuiLink>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.lucene.limitsLabel"
            defaultMessage="使用 Lucene 表达式时有一些限制:"
          />
        </p>
        <ul>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.limits.typesLabel"
              defaultMessage="仅数值、布尔值、日期和 geo_point 字段可以访问"
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.limits.fieldsLabel"
              defaultMessage="存储字段不可用"
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.limits.sparseLabel"
              defaultMessage="如果字段为稀疏字段（仅某些文档包含值），则缺失该字段的文档将具有 0 值"
            />
          </li>
        </ul>
        <p>
          <FormattedMessage
            id="indexPatternManagement.syntax.lucene.operationsLabel"
            defaultMessage="以下是可用于 lucene 表达式的所有运算:"
          />
        </p>
        <ul>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.arithmeticLabel"
              defaultMessage="算术运算符：{operators}"
              values={{ operators: <code>+ - * / %</code> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.bitwiseLabel"
              defaultMessage="位运算符：{operators}"
              values={{
                operators: <code>| & ^ ~ &#x3C;&#x3C; &#x3E;&#x3E; &#x3E;&#x3E;&#x3E;</code>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.booleanLabel"
              defaultMessage="布尔运算符（包括三元运算符）：{operators}"
              values={{ operators: <code>&& || ! ?:</code> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.comparisonLabel"
              defaultMessage="比较运算符：{operators}"
              values={{ operators: <code>&#x3C; &#x3C;= == &#x3E;= &#x3E;</code> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.mathLabel"
              defaultMessage="常用数学函数：{operators}"
              values={{ operators: <code>abs ceil exp floor ln log10 logn max min sqrt pow</code> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.trigLabel"
              defaultMessage="三角库函数：{operators}"
              values={{
                operators: (
                  <code>acosh acos asinh asin atanh atan atan2 cosh cos sinh sin tanh tan</code>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.distanceLabel"
              defaultMessage="距离函数：{operators}"
              values={{ operators: <code>haversin</code> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="indexPatternManagement.syntax.lucene.operations.miscellaneousLabel"
              defaultMessage="其他函数：{operators}"
              values={{ operators: <code>min, max</code> }}
            />
          </li>
        </ul>
      </EuiText>
    </Fragment>
  );
};
