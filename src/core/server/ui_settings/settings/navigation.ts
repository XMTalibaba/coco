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

import { schema } from '@kbn/config-schema';
import { i18n } from '@kbn/i18n';
import { isRelativeUrl } from '@kbn/std';
import { UiSettingsParams } from '../../../types';

export const getNavigationSettings = (): Record<string, UiSettingsParams> => {
  return {
    defaultRoute: {
      name: i18n.translate('core.ui_settings.params.defaultRoute.defaultRouteTitle', {
        defaultMessage: '默认路由',
      }),
      value: '/app/wazuh',
      schema: schema.string({
        validate(value) {
          if (!value.startsWith('/') || !isRelativeUrl(value)) {
            return i18n.translate(
              'core.ui_settings.params.defaultRoute.defaultRouteIsRelativeValidationMessage',
              {
                defaultMessage: '必须是相对 URL.',
              }
            );
          }
        },
      }),
      description: i18n.translate('core.ui_settings.params.defaultRoute.defaultRouteText', {
        defaultMessage:
          '此设置用于指定打开 Kibana 时的默认路由。您可以使用此设置修改打开 Kibana 时的登陆页面。路由必须是相对 URL.',
      }),
    },
    pageNavigation: {
      name: i18n.translate('core.ui_settings.params.pageNavigationName', {
        defaultMessage: '侧边导航样式',
      }),
      value: 'modern',
      description: i18n.translate('core.ui_settings.params.pageNavigationDesc', {
        defaultMessage: '更改导航样式',
      }),
      type: 'select',
      options: ['modern', 'legacy'],
      optionLabels: {
        modern: i18n.translate('core.ui_settings.params.pageNavigationModern', {
          defaultMessage: '现代',
        }),
        legacy: i18n.translate('core.ui_settings.params.pageNavigationLegacy', {
          defaultMessage: '旧版',
        }),
      },
      schema: schema.oneOf([schema.literal('modern'), schema.literal('legacy')]),
    },
  };
};
