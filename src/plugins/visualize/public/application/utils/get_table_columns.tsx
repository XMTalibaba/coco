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

import React from 'react';
import { History } from 'history';
import { EuiBetaBadge, EuiButton, EuiEmptyPrompt, EuiIcon, EuiLink, EuiBadge } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { ApplicationStart } from 'kibana/public';
import { VisualizationListItem } from 'src/plugins/visualizations/public';

const getBadge = (item: VisualizationListItem) => {
  if (item.stage === 'beta') {
    return (
      <EuiBetaBadge
        className="visListingTable__betaIcon"
        label="B"
        title={i18n.translate('visualize.listing.betaTitle', {
          defaultMessage: '公测版',
        })}
        tooltipContent={i18n.translate('visualize.listing.betaTooltip', {
          defaultMessage:
            "此可视化为公测版，可能会进行更改。设计和代码相对于正式发行版功能还不够成熟，将按原样提供，且不提供任何保证。公测版功能不受正式发行版功能支持 SLA 的约束",
        })}
      />
    );
  } else if (item.stage === 'experimental') {
    return (
      <EuiBetaBadge
        className="visListingTable__experimentalIcon"
        label="E"
        title={i18n.translate('visualize.listing.experimentalTitle', {
          defaultMessage: '实验性',
        })}
        tooltipContent={i18n.translate('visualize.listing.experimentalTooltip', {
          defaultMessage:
            '未来版本可能会更改或删除此可视化，其不受支持 SLA 的约束',
        })}
      />
    );
  }
};

const renderItemTypeIcon = (item: VisualizationListItem) => {
  let icon;
  if (item.image) {
    icon = (
      <img className="visListingTable__typeImage" aria-hidden="true" alt="" src={item.image} />
    );
  } else {
    icon = (
      <EuiIcon
        className="visListingTable__typeIcon"
        aria-hidden="true"
        type={item.icon || 'empty'}
        size="m"
      />
    );
  }

  return icon;
};

export const getTableColumns = (application: ApplicationStart, history: History) => [
  {
    field: 'title',
    name: i18n.translate('visualize.listing.table.titleColumnName', {
      defaultMessage: '标题',
    }),
    sortable: true,
    render: (field: string, { editApp, editUrl, title, error }: VisualizationListItem) =>
      // In case an error occurs i.e. the vis has wrong type, we render the vis but without the link
      !error ? (
        <EuiLink
          onClick={() => {
            if (editApp) {
              application.navigateToApp(editApp, { path: editUrl });
            } else if (editUrl) {
              history.push(editUrl);
            }
          }}
          data-test-subj={`visListingTitleLink-${title.split(' ').join('-')}`}
        >
          {field}
        </EuiLink>
      ) : (
        field
      ),
  },
  {
    field: 'typeTitle',
    name: i18n.translate('visualize.listing.table.typeColumnName', {
      defaultMessage: '类型',
    }),
    sortable: true,
    render: (field: string, record: VisualizationListItem) =>
      !record.error ? (
        <span>
          {renderItemTypeIcon(record)}
          {record.typeTitle}
          {getBadge(record)}
        </span>
      ) : (
        <EuiBadge iconType="alert" color="warning">
          {record.error}
        </EuiBadge>
      ),
  },
  {
    field: 'description',
    name: i18n.translate('visualize.listing.table.descriptionColumnName', {
      defaultMessage: '描述',
    }),
    sortable: true,
    render: (field: string, record: VisualizationListItem) => <span>{record.description}</span>,
  },
];

export const getNoItemsMessage = (createItem: () => void) => (
  <EuiEmptyPrompt
    iconType="visualizeApp"
    title={
      <h1 id="visualizeListingHeading">
        <FormattedMessage
          id="visualize.listing.createNew.title"
          defaultMessage="创建您的首个可视化"
        />
      </h1>
    }
    body={
      <p>
        <FormattedMessage
          id="visualize.listing.createNew.description"
          defaultMessage="可以根据您的数据创建不同的可视化。"
        />
      </p>
    }
    actions={
      <EuiButton
        onClick={createItem}
        fill
        iconType="plusInCircle"
        data-test-subj="createVisualizationPromptButton"
      >
        <FormattedMessage
          id="visualize.listing.createNew.createButtonLabel"
          defaultMessage="新建可视化"
        />
      </EuiButton>
    }
  />
);
