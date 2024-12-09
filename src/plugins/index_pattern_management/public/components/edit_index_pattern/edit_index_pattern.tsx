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

import { filter } from 'lodash';
import React, { useEffect, useState, useCallback } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiBadge,
  EuiText,
  EuiLink,
  EuiCallOut,
  EuiPanel,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { IndexPattern, IndexPatternField } from '../../../../../plugins/data/public';
import { useKibana } from '../../../../../plugins/kibana_react/public';
import { IndexPatternManagmentContext } from '../../types';
import { Tabs } from './tabs';
import { IndexHeader } from './index_header';
import { IndexPatternTableItem } from '../types';
import { getIndexPatterns } from '../utils';

export interface EditIndexPatternProps extends RouteComponentProps {
  indexPattern: IndexPattern;
}

const mappingAPILink = i18n.translate(
  'indexPatternManagement.editIndexPattern.timeFilterLabel.mappingAPILink',
  {
    defaultMessage: '映射 API',
  }
);

const mappingConflictHeader = i18n.translate(
  'indexPatternManagement.editIndexPattern.mappingConflictHeader',
  {
    defaultMessage: '映射冲突',
  }
);

const confirmMessage = i18n.translate('indexPatternManagement.editIndexPattern.refreshLabel', {
  defaultMessage: '此操作重置每个字段的常见度计数器.',
});

const confirmModalOptionsRefresh = {
  confirmButtonText: i18n.translate('indexPatternManagement.editIndexPattern.refreshButton', {
    defaultMessage: '刷新',
  }),
  title: i18n.translate('indexPatternManagement.editIndexPattern.refreshHeader', {
    defaultMessage: '刷新字段列表?',
  }),
};

const confirmModalOptionsDelete = {
  confirmButtonText: i18n.translate('indexPatternManagement.editIndexPattern.deleteButton', {
    defaultMessage: '删除',
  }),
  title: i18n.translate('indexPatternManagement.editIndexPattern.deleteHeader', {
    defaultMessage: '删除索引?',
  }),
};

export const EditIndexPattern = withRouter(
  ({ indexPattern, history, location }: EditIndexPatternProps) => {
    const {
      uiSettings,
      indexPatternManagementStart,
      overlays,
      savedObjects,
      chrome,
      data,
    } = useKibana<IndexPatternManagmentContext>().services;
    const [fields, setFields] = useState<IndexPatternField[]>(indexPattern.getNonScriptedFields());
    const [conflictedFields, setConflictedFields] = useState<IndexPatternField[]>(
      indexPattern.fields.getAll().filter((field) => field.type === 'conflict')
    );
    const [defaultIndex, setDefaultIndex] = useState<string>(uiSettings.get('defaultIndex'));
    const [tags, setTags] = useState<any[]>([]);

    useEffect(() => {
      setFields(indexPattern.getNonScriptedFields());
      setConflictedFields(
        indexPattern.fields.getAll().filter((field) => field.type === 'conflict')
      );
    }, [indexPattern]);

    useEffect(() => {
      const indexPatternTags =
        indexPatternManagementStart.list.getIndexPatternTags(
          indexPattern,
          indexPattern.id === defaultIndex
        ) || [];
      setTags(indexPatternTags);
    }, [defaultIndex, indexPattern, indexPatternManagementStart.list]);

    const setDefaultPattern = useCallback(() => {
      uiSettings.set('defaultIndex', indexPattern.id);
      setDefaultIndex(indexPattern.id || '');
    }, [uiSettings, indexPattern.id]);

    const refreshFields = () => {
      overlays.openConfirm(confirmMessage, confirmModalOptionsRefresh).then(async (isConfirmed) => {
        if (isConfirmed) {
          await data.indexPatterns.refreshFields(indexPattern);
          await data.indexPatterns.updateSavedObject(indexPattern);
          setFields(indexPattern.getNonScriptedFields());
        }
      });
    };

    const removePattern = () => {
      async function doRemove() {
        if (indexPattern.id === defaultIndex) {
          const indexPatterns: IndexPatternTableItem[] = await getIndexPatterns(
            savedObjects.client,
            uiSettings.get('defaultIndex'),
            indexPatternManagementStart
          );
          uiSettings.remove('defaultIndex');
          const otherPatterns = filter(indexPatterns, (pattern) => {
            return pattern.id !== indexPattern.id;
          });

          if (otherPatterns.length) {
            uiSettings.set('defaultIndex', otherPatterns[0].id);
          }
        }
        if (indexPattern.id) {
          Promise.resolve(data.indexPatterns.delete(indexPattern.id)).then(function () {
            history.push('');
          });
        }
      }

      overlays.openConfirm('', confirmModalOptionsDelete).then((isConfirmed) => {
        if (isConfirmed) {
          doRemove();
        }
      });
    };

    const timeFilterHeader = i18n.translate(
      'indexPatternManagement.editIndexPattern.timeFilterHeader',
      {
        defaultMessage: "Time 字段: '{timeFieldName}'",
        values: { timeFieldName: indexPattern.timeFieldName },
      }
    );

    const mappingConflictLabel = i18n.translate(
      'indexPatternManagement.editIndexPattern.mappingConflictLabel',
      {
        defaultMessage:
          '{conflictFieldsLength, plural, one {一个字段} other {# 个字段}}已在匹配此模式的各个索引中定义为多个类型（字符串、整数等）。您也许仍能够在 Kibana 的各个部分中使用这些冲突类型，但它们将无法用于需要 Kibana 知道其类型的函数。要解决此问题，需要重新索引您的数据.',
        values: { conflictFieldsLength: conflictedFields.length },
      }
    );

    const headingAriaLabel = i18n.translate('indexPatternManagement.editIndexPattern.detailsAria', {
      defaultMessage: '索引模式详细信息',
    });

    chrome.docTitle.change(indexPattern.title);

    const showTagsSection = Boolean(indexPattern.timeFieldName || (tags && tags.length > 0));

    return (
      <EuiPanel paddingSize={'l'}>
        <div data-test-subj="editIndexPattern" role="region" aria-label={headingAriaLabel}>
          <IndexHeader
            indexPattern={indexPattern}
            setDefault={setDefaultPattern}
            refreshFields={refreshFields}
            deleteIndexPatternClick={removePattern}
            defaultIndex={defaultIndex}
          />
          <EuiSpacer size="s" />
          {showTagsSection && (
            <EuiFlexGroup wrap>
              {Boolean(indexPattern.timeFieldName) && (
                <EuiFlexItem grow={false}>
                  <EuiBadge color="warning">{timeFilterHeader}</EuiBadge>
                </EuiFlexItem>
              )}
              {tags.map((tag: any) => (
                <EuiFlexItem grow={false} key={tag.key}>
                  <EuiBadge color="hollow">{tag.name}</EuiBadge>
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          )}
          <EuiSpacer size="m" />
          <EuiText>
            <p>
              <FormattedMessage
                id="indexPatternManagement.editIndexPattern.timeFilterLabel.timeFilterDetail"
                defaultMessage="此页根据 Elasticsearch 的记录列出“{indexPatternTitle}”索引中的每个字段以及字段的关联核心类型。要更改字段类型，请使用 Elasticsearch"
                values={{ indexPatternTitle: <strong>{indexPattern.title}</strong> }}
              />{' '}
           
                {mappingAPILink}
            
            </p>
          </EuiText>
          {conflictedFields.length > 0 && (
            <>
              <EuiSpacer />
              <EuiCallOut title={mappingConflictHeader} color="warning" iconType="alert">
                <p>{mappingConflictLabel}</p>
              </EuiCallOut>
            </>
          )}
          <EuiSpacer />
          <Tabs
            indexPattern={indexPattern}
            saveIndexPattern={data.indexPatterns.updateSavedObject.bind(data.indexPatterns)}
            fields={fields}
            history={history}
            location={location}
          />
        </div>
      </EuiPanel>
    );
  }
);
