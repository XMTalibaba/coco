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
import { ExpressionFunctionDefinition, KibanaDatatable, Range } from '../../../expressions/public';

interface Arguments {
  from: number;
  to: number;
}

export const range = (): ExpressionFunctionDefinition<
  'range',
  KibanaDatatable | null,
  Arguments,
  Range
> => ({
  name: 'range',
  help: i18n.translate('visualizations.function.range.help', {
    defaultMessage: '生成范围对象',
  }),
  type: 'range',
  args: {
    from: {
      types: ['number'],
      help: i18n.translate('visualizations.function.range.from.help', {
        defaultMessage: '范围起始',
      }),
      required: true,
    },
    to: {
      types: ['number'],
      help: i18n.translate('visualizations.function.range.to.help', {
        defaultMessage: '范围结束',
      }),
      required: true,
    },
  },
  fn: (context, args) => {
    return {
      type: 'range',
      from: args.from,
      to: args.to,
    };
  },
});
