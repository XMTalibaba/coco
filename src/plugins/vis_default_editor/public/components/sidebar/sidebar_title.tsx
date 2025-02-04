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
import { EventEmitter } from 'events';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiPopoverTitle,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';

import { Vis } from 'src/plugins/visualizations/public';
import { SavedObject } from 'src/plugins/saved_objects/public';
import { ApplicationStart } from '../../../../../core/public';
import { useKibana } from '../../../../kibana_react/public';

interface LinkedSearchProps {
  savedSearch: SavedObject;
  eventEmitter: EventEmitter;
}

interface SidebarTitleProps {
  isLinkedSearch: boolean;
  savedSearch?: SavedObject;
  vis: Vis;
  eventEmitter: EventEmitter;
}

export function LinkedSearch({ savedSearch, eventEmitter }: LinkedSearchProps) {
  const [showPopover, setShowPopover] = useState(false);
  const {
    services: { application },
  } = useKibana<{ application: ApplicationStart }>();

  const closePopover = useCallback(() => setShowPopover(false), []);
  const onClickButtonLink = useCallback(() => setShowPopover((v) => !v), []);
  const onClickUnlikFromSavedSearch = useCallback(() => {
    setShowPopover(false);
    eventEmitter.emit('unlinkFromSavedSearch');
  }, [eventEmitter]);
  const onClickViewInDiscover = useCallback(() => {
    application.navigateToApp('discover', {
      path: `#/view/${savedSearch.id}`,
    });
  }, [application, savedSearch.id]);

  const linkButtonAriaLabel = i18n.translate(
    'visDefaultEditor.sidebar.savedSearch.linkButtonAriaLabel',
    {
      defaultMessage: '链接到已保存搜索。单击以了解详情或断开链接.',
    }
  );

  return (
    <EuiFlexGroup
      alignItems="center"
      className="visEditorSidebar__titleContainer visEditorSidebar__linkedSearch"
      gutterSize="xs"
      responsive={false}
    >
      <EuiFlexItem grow={false}>
        <EuiIcon type="search" />
      </EuiFlexItem>

      <EuiFlexItem grow={false} className="eui-textTruncate">
        <EuiTitle size="xs" className="eui-textTruncate">
          <h2
            title={i18n.translate('visDefaultEditor.sidebar.savedSearch.titleAriaLabel', {
              defaultMessage: '已保存搜索：{title}',
              values: {
                title: savedSearch.title,
              },
            })}
          >
            {savedSearch.title}
          </h2>
        </EuiTitle>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiPopover
          anchorPosition="downRight"
          button={
            <EuiToolTip content={linkButtonAriaLabel}>
              <EuiButtonIcon
                aria-label={linkButtonAriaLabel}
                data-test-subj="showUnlinkSavedSearchPopover"
                iconType="link"
                onClick={onClickButtonLink}
              />
            </EuiToolTip>
          }
          isOpen={showPopover}
          closePopover={closePopover}
          panelPaddingSize="s"
        >
          <EuiPopoverTitle>
            <FormattedMessage
              id="visDefaultEditor.sidebar.savedSearch.popoverTitle"
              defaultMessage="已链接到已保存搜索"
            />
          </EuiPopoverTitle>
          <div style={{ width: 260 }}>
            <EuiText size="s">
              <p>
                <EuiButtonEmpty
                  data-test-subj="viewSavedSearch"
                  flush="left"
                  onClick={onClickViewInDiscover}
                  size="xs"
                >
                  <FormattedMessage
                    id="visDefaultEditor.sidebar.savedSearch.goToDiscoverButtonText"
                    defaultMessage="在 Discover 中查看此搜索"
                  />
                </EuiButtonEmpty>
              </p>
              <p>
                <FormattedMessage
                  id="visDefaultEditor.sidebar.savedSearch.popoverHelpText"
                  defaultMessage="对此已保存搜索的后续修改将反映在可视化中。要禁用自动更新，请移除该链接."
                />
              </p>
              <p>
                <EuiButton
                  color="danger"
                  data-test-subj="unlinkSavedSearch"
                  fullWidth
                  onClick={onClickUnlikFromSavedSearch}
                  size="s"
                >
                  <FormattedMessage
                    id="visDefaultEditor.sidebar.savedSearch.unlinkSavedSearchButtonText"
                    defaultMessage="移除已保存搜索的链接"
                  />
                </EuiButton>
              </p>
            </EuiText>
          </div>
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

function SidebarTitle({ savedSearch, vis, isLinkedSearch, eventEmitter }: SidebarTitleProps) {
  return isLinkedSearch && savedSearch ? (
    <LinkedSearch savedSearch={savedSearch} eventEmitter={eventEmitter} />
  ) : vis.type.options.showIndexSelection ? (
    <EuiTitle size="xs" className="visEditorSidebar__titleContainer eui-textTruncate">
      <h2
        title={i18n.translate('visDefaultEditor.sidebar.indexPatternAriaLabel', {
          defaultMessage: '索引模式：{title}',
          values: {
            title: vis.data.indexPattern!.title,
          },
        })}
      >
        {vis.data.indexPattern!.title}
      </h2>
    </EuiTitle>
  ) : (
    <div className="visEditorSidebar__indexPatternPlaceholder" />
  );
}

export { SidebarTitle };
