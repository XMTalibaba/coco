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

import React, { useCallback, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonToggle,
  EuiToolTip,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import { useDebounce } from 'react-use';

import { Vis } from 'src/plugins/visualizations/public';
import { discardChanges, EditorAction } from './state';

interface DefaultEditorControlsProps {
  applyChanges(): void;
  isDirty: boolean;
  isInvalid: boolean;
  isTouched: boolean;
  dispatch: React.Dispatch<EditorAction>;
  vis: Vis;
}

function DefaultEditorControls({
  applyChanges,
  isDirty,
  isInvalid,
  isTouched,
  dispatch,
  vis,
}: DefaultEditorControlsProps) {
  const { enableAutoApply } = vis.type.editorConfig;
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const toggleAutoApply = useCallback((e) => setAutoApplyEnabled(e.target.checked), []);
  const onClickDiscard = useCallback(() => dispatch(discardChanges(vis)), [dispatch, vis]);

  useDebounce(
    () => {
      if (autoApplyEnabled && isDirty) {
        applyChanges();
      }
    },
    300,
    [isDirty, autoApplyEnabled, applyChanges]
  );

  return (
    <div className="visEditorSidebar__controls">
      {!autoApplyEnabled && (
        <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              data-test-subj="visualizeEditorResetButton"
              disabled={!isDirty}
              iconType="cross"
              onClick={onClickDiscard}
              size="s"
            >
              <FormattedMessage
                id="visDefaultEditor.sidebar.discardChangesButtonLabel"
                defaultMessage="丢弃"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            {isInvalid && isTouched ? (
              <EuiToolTip
                content={i18n.translate('visDefaultEditor.sidebar.errorButtonTooltip', {
                  defaultMessage: '需要解决突出显示的字段中的错误.',
                })}
              >
                <EuiButton color="danger" iconType="alert" size="s" disabled>
                  <FormattedMessage
                    id="visDefaultEditor.sidebar.updateChartButtonLabel"
                    defaultMessage="更新"
                  />
                </EuiButton>
              </EuiToolTip>
            ) : (
              <EuiButton
                data-test-subj="visualizeEditorRenderButton"
                disabled={!isDirty}
                fill
                iconType="play"
                onClick={applyChanges}
                size="s"
              >
                <FormattedMessage
                  id="visDefaultEditor.sidebar.updateChartButtonLabel"
                  defaultMessage="更新"
                />
              </EuiButton>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {enableAutoApply && (
        <EuiToolTip
          title={
            autoApplyEnabled
              ? i18n.translate('visDefaultEditor.sidebar.autoApplyChangesOnLabel', {
                  defaultMessage: '自动应用开启',
                })
              : i18n.translate('visDefaultEditor.sidebar.autoApplyChangesOffLabel', {
                  defaultMessage: '自动应用关闭',
                })
          }
          content={i18n.translate('visDefaultEditor.sidebar.autoApplyChangesTooltip', {
            defaultMessage: '每次更改时自动更新可视化.',
          })}
        >
          <EuiButtonToggle
            label={i18n.translate('visDefaultEditor.sidebar.autoApplyChangesAriaLabel', {
              defaultMessage: '自动应用编辑器更改',
            })}
            className="visEditorSidebar__autoApplyButton"
            data-test-subj="visualizeEditorAutoButton"
            fill={autoApplyEnabled}
            iconType="refresh"
            isSelected={autoApplyEnabled}
            onChange={toggleAutoApply}
            size="s"
            isIconOnly
          />
        </EuiToolTip>
      )}
    </div>
  );
}

export { DefaultEditorControls };
