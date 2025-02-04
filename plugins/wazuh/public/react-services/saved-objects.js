/*
 * Wazuh app - Saved Objects management service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { GenericRequest } from './generic-request';
import { KnownFields } from '../utils/known-fields';
import { FieldsStatistics } from '../utils/statistics-fields';
import { FieldsMonitoring } from '../utils/monitoring-fields';
import {
  WAZUH_INDEX_TYPE_ALERTS,
  WAZUH_INDEX_TYPE_MONITORING,
  WAZUH_INDEX_TYPE_STATISTICS,
} from '../../common/constants';

export class SavedObject {
  /**
   *
   * Returns the full list of index patterns
   */
  static async getListOfIndexPatterns() {
    try {
      const result = await GenericRequest.request(
        'GET',
        `/api/saved_objects/_find?type=index-pattern&fields=title&fields=fields&per_page=9999`
      );
      return ((result || {}).data || {}).saved_objects || [];
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  /**
   *
   * Returns the full list of index patterns that are valid
   * An index is valid if its fields contain at least these 4 fields: 'timestamp', 'rule.groups', 'agent.id' and 'manager.name'
   */
  static async getListOfWazuhValidIndexPatterns(defaultIndexPatterns, where) {
    try {
      let result = [];
      if (where === 'healthcheck') {
        const list = await Promise.all(
          defaultIndexPatterns.map(
            async (pattern) => await SavedObject.getExistingIndexPattern(pattern)
          )
        );
        result = this.validateIndexPatterns(list);
      }

      if (!result.length) {
        const list = await this.getListOfIndexPatterns();
        result = this.validateIndexPatterns(list);
      }

      return result.map((item) => {
        return { id: item.id, title: item.attributes.title };
      });
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  static validateIndexPatterns(list) {
    const requiredFields = [
      'timestamp',
      'rule.groups',
      'manager.name',
      'agent.id',
    ];
    return list.filter(item => {
      if (item.attributes && item.attributes.fields) {
        const fields = JSON.parse(item.attributes.fields);
        return requiredFields.every((reqField => {
          return fields ? fields.find(field => field.name === reqField) : {};
        }));        
      }
      return false;
    });
  }

  static async existsOrCreateIndexPattern(patternID) {
    const result = await SavedObject.existsIndexPattern(patternID);
    if (!result.data) {
      const fields = await SavedObject.getIndicesFields(patternID, WAZUH_INDEX_TYPE_ALERTS);
      await this.createSavedObject(
        'index-pattern',
        patternID,
        {
          attributes: {
            title: patternID,
            timeFieldName: 'timestamp'
          }
        },
        fields
      );
    }
  }


  /**
   *
   * Given an index pattern ID, checks if it exists
   */
  static async existsIndexPattern(patternID) {
    try {
      const result = await GenericRequest.request(
        'GET',
        `/api/saved_objects/index-pattern/${patternID}?fields=title&fields=fields`
      );

      const title = (((result || {}).data || {}).attributes || {}).title;
      const fields = (((result || {}).data || {}).attributes || {}).fields;
      if (title) {
        return {
          data: 'Index pattern found',
          status: true,
          statusCode: 200,
          title,
          fields
        };
      }
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  /**
   *
   * Given an index pattern ID, checks if it exists
   */
  static async getExistingIndexPattern(patternID) {
    try {
      const result = await GenericRequest.request(
        'GET',
        `/api/saved_objects/index-pattern/${patternID}?fields=title&fields=fields`,
        null,
        true
      );

      return result.data;
    } catch (error) {
      if (error && error.response && error.response.status == 404) return false;
      return Promise.reject(((error || {}).data || {}).message || false ? error.data.message : error.message || `Error getting the '${patternID}' index pattern`);
    }
  }

  static async createSavedObject(type, id, params, fields = '') {
    try {
      const result = await GenericRequest.request(
        'POST',
        `/api/saved_objects/${type}/${id}`,
        params
      );

      if (type === 'index-pattern')
        await this.refreshFieldsOfIndexPattern(id, params.attributes.title, fields);

      return result;
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  static async refreshFieldsOfIndexPattern(id, title, fields) {
    try {
      // same logic as Kibana when a new index is created, you need to refresh it to see its fields
      // we force the refresh of the index by requesting its fields and the assign these fields
      await GenericRequest.request(
        'PUT',
        `/api/saved_objects/index-pattern/${id}`,
        {
          attributes: {
            fields: JSON.stringify(fields),
            timeFieldName: 'timestamp',
            title: title,
            retry_on_conflict: 4,
          },
        }
      );
      return;
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  /**
   * Refresh an index pattern
   * Optionally force a new field
   */
  static async refreshIndexPattern(pattern, newFields = null) {
    try {
      const fields = await SavedObject.getIndicesFields(pattern.title, WAZUH_INDEX_TYPE_ALERTS);

      if(newFields && typeof newFields=="object")
        Object.keys(newFields).forEach((fieldName) => {
          if (this.isValidField(newFields[fieldName])) fields.push(newFields[fieldName]);
        });

      await this.refreshFieldsOfIndexPattern(pattern.id, pattern.title, fields);

      return;
    } catch (error) {
      console.log(error)
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  /**
   * Checks the field has a proper structure
   * @param {index-pattern-field} field
   */
  static isValidField(field) {

    if (field == null || typeof field != "object") return false;

    const isValid = ["name", "type", "esTypes", "searchable", "aggregatable", "readFromDocValues"].reduce((ok, prop) => {
      return ok && Object.keys(field).includes(prop);
    }, true)
    return isValid;
  }

  /**
   * Creates the 'wazuh-alerts-*'  index pattern
   */
  static async createWazuhIndexPattern(pattern) {
    try {
      const fields = await SavedObject.getIndicesFields(pattern, WAZUH_INDEX_TYPE_ALERTS);
      await this.createSavedObject(
        'index-pattern',
        pattern,
        {
          attributes: {
            title: pattern,
            timeFieldName: 'timestamp',
            fieldFormatMap: `{
              "data.virustotal.permalink":{"id":"url"},
              "data.vulnerability.reference":{"id":"url"},
              "data.url":{"id":"url"}
            }`,
            sourceFilters: '[{"value":"@timestamp"}]'
          }
        },
        fields
      );
      return;
    } catch (error) {
      return ((error || {}).data || {}).message || false
        ? error.data.message
        : error.message || error;
    }
  }

  static getIndicesFields = async (pattern, indexType) => GenericRequest.request(
    //we check if indices exist before creating the index pattern
    'GET',
    `/api/index_patterns/_fields_for_wildcard?pattern=${pattern}&meta_fields=_source&meta_fields=_id&meta_fields=_type&meta_fields=_index&meta_fields=_score`,
    {}
  ).then(response => response.data.fields).catch(() => {
    switch (indexType) {
      case WAZUH_INDEX_TYPE_MONITORING:
        return FieldsMonitoring;
      case WAZUH_INDEX_TYPE_STATISTICS:
        return FieldsStatistics;
      case WAZUH_INDEX_TYPE_ALERTS:
        return KnownFields
    }
  })
}
