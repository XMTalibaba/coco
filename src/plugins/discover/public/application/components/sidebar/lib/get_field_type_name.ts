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

export function getFieldTypeName(type: string) {
  switch (type) {
    case 'boolean':
      return i18n.translate('discover.fieldNameIcons.booleanAriaLabel', {
        defaultMessage: '布尔字段',
      });
    case 'conflict':
      return i18n.translate('discover.fieldNameIcons.conflictFieldAriaLabel', {
        defaultMessage: '冲突字段',
      });
    case 'date':
      return i18n.translate('discover.fieldNameIcons.dateFieldAriaLabel', {
        defaultMessage: '日期字段',
      });
    case 'geo_point':
      return i18n.translate('discover.fieldNameIcons.geoPointFieldAriaLabel', {
        defaultMessage: '地理字段',
      });
    case 'geo_shape':
      return i18n.translate('discover.fieldNameIcons.geoShapeFieldAriaLabel', {
        defaultMessage: '几何形状字段',
      });
    case 'ip':
      return i18n.translate('discover.fieldNameIcons.ipAddressFieldAriaLabel', {
        defaultMessage: 'IP字段',
      });
    case 'murmur3':
      return i18n.translate('discover.fieldNameIcons.murmur3FieldAriaLabel', {
        defaultMessage: 'Murmur3字段',
      });
    case 'number':
      return i18n.translate('discover.fieldNameIcons.numberFieldAriaLabel', {
        defaultMessage: '数字字段',
      });
    case 'source':
      // Note that this type is currently not provided, type for _source is undefined
      return i18n.translate('discover.fieldNameIcons.sourceFieldAriaLabel', {
        defaultMessage: '源字段',
      });
    case 'string':
      return i18n.translate('discover.fieldNameIcons.stringFieldAriaLabel', {
        defaultMessage: '字符串字段',
      });
    case 'nested':
      return i18n.translate('discover.fieldNameIcons.nestedFieldAriaLabel', {
        defaultMessage: '嵌套字段',
      });
    default:
      return i18n.translate('discover.fieldNameIcons.unknownFieldAriaLabel', {
        defaultMessage: '未知字段',
      });
  }
}
