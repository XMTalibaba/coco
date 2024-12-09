
import * as FileSaver from '../services/file-saver';
import { GenericRequest } from './generic-request';
import { formatUIDate } from './time-service';
var _json2csv = require("json2csv");
var _csvAlertKeyEquivalence = require("../../common/csv-alert-key-equivalence");

/**
 * Generates a CSV through the given data
 * @param {Array} data
 * @param {Array} fields
 * @param {String} exportName
 */
 const exportAlertCsv = async (indexPattern, newFilters, fields, exportName = 'data') => {
  try {
    const rawItems = await GenericRequest.request(
      'POST',
      `/elastic/alerts`,
      {
        index: indexPattern.title,
        body: newFilters
      }
    );
    let alerts = rawItems.data.hits.hits;

    let timeArr = ['timestamp', '@timestamp'];

    alerts.forEach((item, i) => {
      alerts[i] = indexPattern.flattenHit(item);
      timeArr.forEach(t => {
        alerts[i][t] = formatUIDate(alerts[i][t]);
      })
      alerts[i]['rule.id.text'] = alerts[i]['rule.id'] === '503' ? '上线' : '下线';
      alerts[i]['software.name'] = alerts[i]['data.package'] ? `${alerts[i]['data.package']}-${alerts[i]['data.version']}` : alerts[i]['data.pkgname'];
      alerts[i]['account.user'] = alerts[i]['data.dstuser'] ? alerts[i]['data.dstuser'] : alerts[i]['data.srcuser'] ? alerts[i]['data.srcuser'] : '';
    });

    fields = fields.map(item => ({
      value: item,
      default: '-'
    }));

    const json2csvParser = new _json2csv.Parser({
      fields
    });
    let csv = json2csvParser.parse(alerts);

    for (const field of fields) {
      const {
        value
      } = field;

      if (csv.includes(value)) {
        csv = csv.replace(value, _csvAlertKeyEquivalence.AlertKeyEquivalence[value] || value);
      }
    }

    const output = csv ? ["\ufeff" + csv] : [];
    const blob = new Blob(output, { type: 'text/csv,charset=UTF-8' });
    FileSaver.saveAs(blob, `${exportName}.csv`);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default exportAlertCsv;