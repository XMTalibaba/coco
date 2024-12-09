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
import { UiSettingsParams } from '../../../types';

export const getStateSettings = (): Record<string, UiSettingsParams> => {
  return {
    'state:storeInSessionStorage': {
      name: i18n.translate('core.ui_settings.params.storeUrlTitle', {
        defaultMessage: '将 URL 存储在会话存储中',
      }),
      value: false,
      description: i18n.translate('core.ui_settings.params.storeUrlText', {
        defaultMessage:
          '有时，URL 可能会变得过长，使某些浏览器无法进行处理。为此，我们将正测试在会话存储中存储 URL 的组成部分是否会有所帮助。请向我们反馈您的体验!',
      }),
      schema: schema.boolean(),
    },
  };
};
