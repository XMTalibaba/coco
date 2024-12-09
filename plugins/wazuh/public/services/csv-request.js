/*
 * Wazuh app - API request service
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { GenericRequest } from '../react-services/generic-request';
import { formatUIDate } from '../react-services/time-service'

var _json2csv = require("json2csv");
var _csvKeyEquivalence = require("../../common/csv-key-equivalence");
export class CSVRequest {
  /**
   * Constructor
   */
  constructor() {
    this.genericReq = GenericRequest;
  }

  /**
   * It fetchs data from /api/csv route using the below parameters.
   * @param {string} path Wazuh API route
   * @param {number|string} id Elasticsearch document ID
   * @param {*} filters Array of Wazuh API filters. Optional
   */
  async fetch(path, id, filters = null, csvKey = [], csvKeyContrast = {}, csvTextContrast = {}) {
    try {
      const output = await this.genericReq.request('POST', '/api/csv', {
          path,
          id,
          filters,
          csvKey,
          csvKeyContrast
      });

      // 处理时间转换
      let timeArr = ['dateAdd', 'lastKeepAlive', 'timestamp', 'scan_time']; // 注册日期,最后连接,时间
      timeArr.forEach(timeKey => {
        let timeIndex = output.data.fields.findIndex(k => k.value === timeKey);
        if (timeIndex !== -1) {
          let { itemsArray } = output.data;
          itemsArray.forEach(row => {
            row[timeKey] = formatUIDate(row[timeKey]);
          })
          const json2csvParser = new _json2csv.Parser({
            fields: output.data.fields
          });
          let csv = json2csvParser.parse(itemsArray);

          for (const field of output.data.fields) {
            const {
              value
            } = field;
  
            if (csv.includes(value)) {
              let keyField = csvKeyContrast[value] ?csvKeyContrast[value] : value;
              csv = csv.replace(value, _csvKeyEquivalence.KeyEquivalence[keyField] || keyField);
            }
          }
          output.data.csv = csv;
        }
      })

      // 处理文字转换
      Object.keys(csvTextContrast).forEach(timeKey => {
        let timeIndex = output.data.fields.findIndex(k => k.value === timeKey);
        if (timeIndex !== -1) {
          let { itemsArray } = output.data;
          let options = csvTextContrast[timeKey]
          itemsArray.forEach(row => {
            let item = options.find(i => i.value === row[timeKey])
            row[timeKey] = item ? item.text : row[timeKey];
          })
          const json2csvParser = new _json2csv.Parser({
            fields: output.data.fields
          });
          let csv = json2csvParser.parse(itemsArray);

          for (const field of output.data.fields) {
            const {
              value
            } = field;
  
            if (csv.includes(value)) {
              let keyField = csvKeyContrast[value] ?csvKeyContrast[value] : value;
              csv = csv.replace(value, _csvKeyEquivalence.KeyEquivalence[keyField] || keyField);
            }
          }
          output.data.csv = csv;
        }
      })

      return output.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
