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
import { parse } from 'hjson';
import { BaseVisTypeOptions } from 'src/plugins/visualizations/public';
import { DefaultEditorSize } from '../../vis_default_editor/public';
import { VegaVisualizationDependencies } from './plugin';
import { VegaVisEditor } from './components';

import type { VegaSpec } from './data_model/types';

import { extractIndexPatternsFromSpec } from './lib/extract_index_pattern';
import { createVegaRequestHandler } from './vega_request_handler';
// @ts-expect-error
import { createVegaVisualization } from './vega_visualization';
import { getDefaultSpec } from './default_spec';
import { createInspectorAdapters } from './vega_inspector';
import { VIS_EVENT_TO_TRIGGER } from '../../visualizations/public';

import { getInfoMessage } from './components/experimental_map_vis_info';

export const createVegaTypeDefinition = (
  dependencies: VegaVisualizationDependencies
): BaseVisTypeOptions => {
  const requestHandler = createVegaRequestHandler(dependencies);
  const visualization = createVegaVisualization(dependencies);

  return {
    name: 'vega',
    title: 'Vega',
    getInfoMessage,
    description: i18n.translate('visTypeVega.type.vegaDescription', {
      defaultMessage: '使用 Vega 和 Vega-Lite 创建定制可视化',
      description: 'Vega and Vega-Lite are product names and should not be translated',
    }),
    icon: 'visVega',
    visConfig: { defaults: { spec: getDefaultSpec() } },
    editorConfig: {
      optionsTemplate: VegaVisEditor,
      enableAutoApply: true,
      defaultSize: DefaultEditorSize.MEDIUM,
    },
    visualization,
    requestHandler,
    responseHandler: 'none',
    options: {
      showIndexSelection: false,
      showQueryBar: true,
      showFilterBar: true,
    },
    getSupportedTriggers: () => {
      return [VIS_EVENT_TO_TRIGGER.applyFilter];
    },
    getUsedIndexPattern: async (visParams) => {
      try {
        const spec = parse(visParams.spec, { legacyRoot: false, keepWsc: true });

        return extractIndexPatternsFromSpec(spec as VegaSpec);
      } catch (e) {
        // spec is invalid
      }
      return [];
    },
    inspectorAdapters: createInspectorAdapters,
  };
};
