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

import React, { Component, Fragment } from 'react';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import PropTypes from 'prop-types';

import {
  EuiCallOut,
  EuiCode,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { getServices } from '../../../kibana_services';

// eslint-disable-next-line react/prefer-stateless-function
export class DiscoverNoResults extends Component {
  static propTypes = {
    timeFieldName: PropTypes.string,
    queryLanguage: PropTypes.string,
  };

  render() {
    const { timeFieldName, queryLanguage } = this.props;

    let timeFieldMessage;

    if (timeFieldName) {
      timeFieldMessage = (
        <Fragment>
          <EuiSpacer size="xl" />

          <EuiText>
            <h2 data-test-subj="discoverNoResultsTimefilter">
              <FormattedMessage
                id="discover.noResults.expandYourTimeRangeTitle"
                defaultMessage="扩大您的时间范围"
              />
            </h2>

            <p>
              <FormattedMessage
                id="discover.noResults.queryMayNotMatchTitle"
                defaultMessage="您正在寻找的一个或多个索引包含一个日期字段。您的查询可能与当前时间范围内的任何数据不匹配，或者在当前选定的时间范围内根本没有任何数据。您可以尝试将时间范围改为包含数据的范围。"
              />
            </p>
          </EuiText>
        </Fragment>
      );
    }

    let luceneQueryMessage;

    if (queryLanguage === 'lucene') {
      const searchExamples = [
        {
          description: <EuiCode>200</EuiCode>,
          title: (
            <EuiText>
              <strong>
                <FormattedMessage
                  id="discover.noResults.searchExamples.anyField200StatusCodeExampleTitle"
                  defaultMessage="查找在任何领域包含数字200的请求"
                />
              </strong>
            </EuiText>
          ),
        },
        {
          description: <EuiCode>status:200</EuiCode>,
          title: (
            <EuiText>
              <strong>
                <FormattedMessage
                  id="discover.noResults.searchExamples.statusField200StatusCodeExampleTitle"
                  defaultMessage="在状态栏中查找200"
                />
              </strong>
            </EuiText>
          ),
        },
        {
          description: <EuiCode>status:[400 TO 499]</EuiCode>,
          title: (
            <EuiText>
              <strong>
                <FormattedMessage
                  id="discover.noResults.searchExamples.400to499StatusCodeExampleTitle"
                  defaultMessage="查找400-499之间的所有状态代码"
                />
              </strong>
            </EuiText>
          ),
        },
        {
          description: <EuiCode>status:[400 TO 499] AND extension:PHP</EuiCode>,
          title: (
            <EuiText>
              <strong>
                <FormattedMessage
                  id="discover.noResults.searchExamples.400to499StatusCodeWithPhpExtensionExampleTitle"
                  defaultMessage="查找400-499之间的带有php扩展名的状态代码"
                />
              </strong>
            </EuiText>
          ),
        },
        {
          description: <EuiCode>status:[400 TO 499] AND (extension:php OR extension:html)</EuiCode>,
          title: (
            <EuiText>
              <strong>
                <FormattedMessage
                  id="discover.noResults.searchExamples.400to499StatusCodeWithPhpOrHtmlExtensionExampleTitle"
                  defaultMessage="查找400-499之间的带有php或html扩展名的状态代码"
                />
              </strong>
            </EuiText>
          ),
        },
      ];

      luceneQueryMessage = (
        <Fragment>
          <EuiSpacer size="xl" />

          <EuiText>
            <h3>
              <FormattedMessage
                id="discover.noResults.searchExamples.refineYourQueryTitle"
                defaultMessage="完善您的查询"
              />
            </h3>

            <p>
              <FormattedMessage
                id="discover.noResults.searchExamples.howTosearchForWebServerLogsDescription"
                defaultMessage="使用Elasticsearch对Lucene{queryStringSyntaxLink}支持的顶部搜索栏。下面是一些例子，您可以搜索已经被解析成几个字段的网络服务器日志。"
                values={{
                  queryStringSyntaxLink: (
                    <EuiLink
                      target="_blank"
                      href={getServices().docLinks.links.query.luceneQuerySyntax}
                    >
                      <FormattedMessage
                        id="discover.noResults.searchExamples.queryStringSyntaxLinkText"
                        defaultMessage="查询字符串的语法"
                      />
                    </EuiLink>
                  ),
                }}
              />
            </p>
          </EuiText>

          <EuiSpacer size="m" />

          <EuiDescriptionList type="column" listItems={searchExamples} />

          <EuiSpacer size="xl" />
        </Fragment>
      );
    }

    return (
      <I18nProvider>
        <Fragment>
          <EuiSpacer size="xl" />

          <EuiFlexGroup justifyContent="center">
            <EuiFlexItem grow={false} className="dscNoResults">
              <EuiCallOut
                title={
                  <FormattedMessage
                    id="discover.noResults.searchExamples.noResultsMatchSearchCriteriaTitle"
                    defaultMessage="没有符合您搜索标准的结果"
                  />
                }
                color="warning"
                iconType="help"
                data-test-subj="discoverNoResults"
              />
              {timeFieldMessage}
              {luceneQueryMessage}
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      </I18nProvider>
    );
  }
}
