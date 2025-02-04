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
import dateMath from '@elastic/datemath';
import { i18n } from '@kbn/i18n';
import { ToastsStart } from 'kibana/public';

/**
 * Validates a given time filter range, provided by URL or UI
 * Unless valid, it returns false and displays a notification
 */
export function validateTimeRange(
  { from, to }: { from: string; to: string },
  toastNotifications: ToastsStart
): boolean {
  const fromMoment = dateMath.parse(from);
  const toMoment = dateMath.parse(to);
  if (!fromMoment || !toMoment || !fromMoment.isValid() || !toMoment.isValid()) {
    toastNotifications.addDanger({
      title: i18n.translate('discover.notifications.invalidTimeRangeTitle', {
        defaultMessage: `无效的时间范围`,
      }),
      text: i18n.translate('discover.notifications.invalidTimeRangeText', {
        defaultMessage: `所提供的时间范围是无效的。(from: '{from}', to: '{to}')`,
        values: {
          from,
          to,
        },
      }),
    });
    return false;
  }
  return true;
}
