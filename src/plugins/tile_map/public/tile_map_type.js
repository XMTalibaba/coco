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
import { i18n } from '@kbn/i18n';
import { convertToGeoJson, MapTypes } from '../../maps_legacy/public';
import { Schemas } from '../../vis_default_editor/public';
import { createTileMapVisualization } from './tile_map_visualization';
import { TileMapOptions } from './components/tile_map_options';
import { supportsCssFilters } from './css_filters';
import { truncatedColorSchemas } from '../../charts/public';
import { getDeprecationMessage } from './get_deprecation_message';

export function createTileMapTypeDefinition(dependencies) {
  const CoordinateMapsVisualization = createTileMapVisualization(dependencies);
  const { uiSettings, getServiceSettings } = dependencies;

  return {
    name: 'tile_map',
    getInfoMessage: getDeprecationMessage,
    title: i18n.translate('tileMap.vis.mapTitle', {
      defaultMessage: '坐标地图',
    }),
    icon: 'visMapCoordinate',
    description: i18n.translate('tileMap.vis.mapDescription', {
      defaultMessage: '在地图上绘制纬度和经度坐标',
    }),
    visConfig: {
      canDesaturate: Boolean(supportsCssFilters),
      defaults: {
        colorSchema: 'Yellow to Red',
        mapType: 'Scaled Circle Markers',
        isDesaturated: true,
        addTooltip: true,
        heatClusterSize: 1.5,
        legendPosition: 'bottomright',
        mapZoom: 2,
        mapCenter: [0, 0],
        wms: uiSettings.get('visualization:tileMap:WMSdefaults'),
      },
    },
    visualization: CoordinateMapsVisualization,
    responseHandler: convertToGeoJson,
    editorConfig: {
      collections: {
        colorSchemas: truncatedColorSchemas,
        legendPositions: [
          {
            value: 'bottomleft',
            text: i18n.translate('tileMap.vis.editorConfig.legendPositions.bottomLeftText', {
              defaultMessage: '左下方',
            }),
          },
          {
            value: 'bottomright',
            text: i18n.translate('tileMap.vis.editorConfig.legendPositions.bottomRightText', {
              defaultMessage: '右下方',
            }),
          },
          {
            value: 'topleft',
            text: i18n.translate('tileMap.vis.editorConfig.legendPositions.topLeftText', {
              defaultMessage: '左上方',
            }),
          },
          {
            value: 'topright',
            text: i18n.translate('tileMap.vis.editorConfig.legendPositions.topRightText', {
              defaultMessage: '右上方',
            }),
          },
        ],
        mapTypes: [
          {
            value: MapTypes.ScaledCircleMarkers,
            text: i18n.translate('tileMap.vis.editorConfig.mapTypes.scaledCircleMarkersText', {
              defaultMessage: '缩放式圆形标记',
            }),
          },
          {
            value: MapTypes.ShadedCircleMarkers,
            text: i18n.translate('tileMap.vis.editorConfig.mapTypes.shadedCircleMarkersText', {
              defaultMessage: '带阴影圆形标记',
            }),
          },
          {
            value: MapTypes.ShadedGeohashGrid,
            text: i18n.translate('tileMap.vis.editorConfig.mapTypes.shadedGeohashGridText', {
              defaultMessage: '带阴影 geohash 网格',
            }),
          },
          {
            value: MapTypes.Heatmap,
            text: i18n.translate('tileMap.vis.editorConfig.mapTypes.heatmapText', {
              defaultMessage: '热图',
            }),
          },
        ],
        tmsLayers: [],
      },
      optionsTemplate: (props) => <TileMapOptions {...props} />,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: i18n.translate('tileMap.vis.map.editorConfig.schemas.metricTitle', {
            defaultMessage: '值',
          }),
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'top_hits'],
          defaults: [{ schema: 'metric', type: 'count' }],
        },
        {
          group: 'buckets',
          name: 'segment',
          title: i18n.translate('tileMap.vis.map.editorConfig.schemas.geoCoordinatesTitle', {
            defaultMessage: '地理坐标',
          }),
          aggFilter: ['geohash_grid'],
          min: 1,
          max: 1,
        },
      ]),
    },
    setup: async (vis) => {
      let tmsLayers;

      try {
        const serviceSettings = await getServiceSettings();
        tmsLayers = await serviceSettings.getTMSServices();
      } catch (e) {
        return vis;
      }

      vis.type.editorConfig.collections.tmsLayers = tmsLayers;
      if (!vis.params.wms.selectedTmsLayer && tmsLayers.length) {
        vis.params.wms.selectedTmsLayer = tmsLayers[0];
      }
      return vis;
    },
  };
}
