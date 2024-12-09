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

import React, { useEffect, useState, useCallback } from 'react';
import {
  EuiButtonEmpty,
  EuiOverlayMask,
  EuiModal,
  EuiButton,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSwitch,
  EuiText,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { sortBy, isEqual } from 'lodash';
import { SavedQuery, SavedQueryService } from '../..';
import { SavedQueryAttributes } from '../../query';

interface Props {
  savedQuery?: SavedQueryAttributes;
  savedQueryService: SavedQueryService;
  onSave: (savedQueryMeta: SavedQueryMeta) => void;
  onClose: () => void;
  showFilterOption: boolean | undefined;
  showTimeFilterOption: boolean | undefined;
}

export interface SavedQueryMeta {
  title: string;
  description: string;
  shouldIncludeFilters: boolean;
  shouldIncludeTimefilter: boolean;
}

export function SaveQueryForm({
  savedQuery,
  savedQueryService,
  onSave,
  onClose,
  showFilterOption = true,
  showTimeFilterOption = true,
}: Props) {
  const [title, setTitle] = useState(savedQuery ? savedQuery.title : '');
  const [enabledSaveButton, setEnabledSaveButton] = useState(Boolean(savedQuery));
  const [description, setDescription] = useState(savedQuery ? savedQuery.description : '');
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [shouldIncludeFilters, setShouldIncludeFilters] = useState(
    savedQuery ? !!savedQuery.filters : true
  );
  // Defaults to false because saved queries are meant to be as portable as possible and loading
  // a saved query with a time filter will override whatever the current value of the global timepicker
  // is. We expect this option to be used rarely and only when the user knows they want this behavior.
  const [shouldIncludeTimefilter, setIncludeTimefilter] = useState(
    savedQuery ? !!savedQuery.timefilter : false
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const titleConflictErrorText = i18n.translate(
    'data.search.searchBar.savedQueryForm.titleConflictText',
    {
      defaultMessage: '标题与现有已保存查询有冲突',
    }
  );

  const savedQueryDescriptionText = i18n.translate(
    'data.search.searchBar.savedQueryDescriptionText',
    {
      defaultMessage: '保存想要再次使用的查询文本和筛选.',
    }
  );

  useEffect(() => {
    const fetchQueries = async () => {
      const allSavedQueries = await savedQueryService.getAllSavedQueries();
      const sortedAllSavedQueries = sortBy(allSavedQueries, 'attributes.title') as SavedQuery[];
      setSavedQueries(sortedAllSavedQueries);
    };
    fetchQueries();
  }, [savedQueryService]);

  const validate = useCallback(() => {
    const errors = [];
    if (
      !!savedQueries.find(
        (existingSavedQuery) => !savedQuery && existingSavedQuery.attributes.title === title
      )
    ) {
      errors.push(titleConflictErrorText);
    }

    if (!isEqual(errors, formErrors)) {
      setFormErrors(errors);
      return false;
    }

    return !formErrors.length;
  }, [savedQueries, savedQuery, title, titleConflictErrorText, formErrors]);

  const onClickSave = useCallback(() => {
    if (validate()) {
      onSave({
        title,
        description,
        shouldIncludeFilters,
        shouldIncludeTimefilter,
      });
    }
  }, [validate, onSave, title, description, shouldIncludeFilters, shouldIncludeTimefilter]);

  const onInputChange = useCallback((event) => {
    setEnabledSaveButton(Boolean(event.target.value));
    setFormErrors([]);
    setTitle(event.target.value);
  }, []);

  const autoTrim = useCallback(() => {
    const trimmedTitle = title.trim();
    if (title.length > trimmedTitle.length) {
      setTitle(trimmedTitle);
    }
  }, [title]);

  const hasErrors = formErrors.length > 0;

  const saveQueryForm = (
    <EuiForm isInvalid={hasErrors} error={formErrors} data-test-subj="saveQueryForm">
      <EuiFormRow>
        <EuiText color="subdued">{savedQueryDescriptionText}</EuiText>
      </EuiFormRow>
      <EuiFormRow
        label={i18n.translate('data.search.searchBar.savedQueryNameLabelText', {
          defaultMessage: '名称',
        })}
        helpText={i18n.translate('data.search.searchBar.savedQueryNameHelpText', {
          defaultMessage:
            '“名称”必填。标题不能包含前导或尾随空格。名称必须唯一.',
        })}
        isInvalid={hasErrors}
      >
        <EuiFieldText
          disabled={!!savedQuery}
          value={title}
          name="title"
          onChange={onInputChange}
          data-test-subj="saveQueryFormTitle"
          isInvalid={hasErrors}
          onBlur={autoTrim}
        />
      </EuiFormRow>

      <EuiFormRow
        label={i18n.translate('data.search.searchBar.savedQueryDescriptionLabelText', {
          defaultMessage: '描述',
        })}
      >
        <EuiFieldText
          value={description}
          name="description"
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          data-test-subj="saveQueryFormDescription"
        />
      </EuiFormRow>
      {showFilterOption && (
        <EuiFormRow>
          <EuiSwitch
            name="shouldIncludeFilters"
            label={i18n.translate('data.search.searchBar.savedQueryIncludeFiltersLabelText', {
              defaultMessage: '包括筛选',
            })}
            checked={shouldIncludeFilters}
            onChange={() => {
              setShouldIncludeFilters(!shouldIncludeFilters);
            }}
            data-test-subj="saveQueryFormIncludeFiltersOption"
          />
        </EuiFormRow>
      )}

      {showTimeFilterOption && (
        <EuiFormRow>
          <EuiSwitch
            name="shouldIncludeTimefilter"
            label={i18n.translate('data.search.searchBar.savedQueryIncludeTimeFilterLabelText', {
              defaultMessage: '包括时间筛选',
            })}
            checked={shouldIncludeTimefilter}
            onChange={() => {
              setIncludeTimefilter(!shouldIncludeTimefilter);
            }}
            data-test-subj="saveQueryFormIncludeTimeFilterOption"
          />
        </EuiFormRow>
      )}
    </EuiForm>
  );

  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} initialFocus="[name=title]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {i18n.translate('data.search.searchBar.savedQueryFormTitle', {
              defaultMessage: '保存查询',
            })}
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>{saveQueryForm}</EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose} data-test-subj="savedQueryFormCancelButton">
            {i18n.translate('data.search.searchBar.savedQueryFormCancelButtonText', {
              defaultMessage: '取消',
            })}
          </EuiButtonEmpty>

          <EuiButton
            onClick={onClickSave}
            fill
            data-test-subj="savedQueryFormSaveButton"
            disabled={hasErrors || !enabledSaveButton}
          >
            {i18n.translate('data.search.searchBar.savedQueryFormSaveButtonText', {
              defaultMessage: '保存',
            })}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}
