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

import { i18n } from '@kbn/i18n';
import { CoreStart } from 'kibana/public';

export function addHelpMenuToAppChrome(
  chrome: CoreStart['chrome'],
  docLinks: CoreStart['docLinks']
) {
  chrome.setHelpExtension({
    appName: i18n.translate('dashboard.helpMenu.appName', {
      defaultMessage: '仪表板',
    }),
    links: [
      {
        linkType: 'documentation',
        href: `${docLinks.ELASTIC_WEBSITE_URL}guide/en/kibana/${docLinks.DOC_LINK_VERSION}/dashboard.html`,
      },
    ],
  });
}
