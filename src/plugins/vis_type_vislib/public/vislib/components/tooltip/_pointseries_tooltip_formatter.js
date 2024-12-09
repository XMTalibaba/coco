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
import { renderToStaticMarkup } from 'react-dom/server';

export function pointSeriesTooltipFormatter() {
  return function tooltipFormatter({ datum, data }) {
    if (!datum) return '';

    const details = [];

    const currentSeries =
      data.series && data.series.find((serie) => serie.rawId === datum.seriesId);
    const addDetail = (label, value) => details.push({ label, value });

    if (datum.extraMetrics) {
      datum.extraMetrics.forEach((metric) => {
        addDetail(metric.label, metric.value);
      });
    }

    if (datum.x !== null && datum.x !== undefined) {
      addDetail(data.xAxisLabel, data.xAxisFormatter(datum.x));
    }

    if (datum.y !== null && datum.y !== undefined) {
      const value = datum.yScale ? datum.yScale * datum.y : datum.y;
      addDetail(currentSeries.label, currentSeries.yAxisFormatter(value));
    }

    if (datum.z !== null && datum.z !== undefined) {
      addDetail(currentSeries.zLabel, currentSeries.zAxisFormatter(datum.z));
    }
    if (datum.series && datum.parent) {
      const dimension = datum.parent;
      addDetail(dimension.title, datum.series);
    }
    if (datum.tableRaw) {
      addDetail(datum.tableRaw.title, datum.tableRaw.value);
    }

    function labelTransform(label) {
      const labelText = {
        'rule.level': '告警等级',
        'agent.name': '代理名称',
        'syscheck.event': '文件行为2',
        Alerts: '告警',
        'rule.description': '描述',
        'data.title': '标题',
        'data.vulnerability.severity': '严重程度',
        'data.vulnerability.package.name': '程序包',
        'data.vulnerability.cve': 'CVE',
        Count: '数量',
        status: '状态',
        active: '已连接',
        disconnected: '未连接',
        never_connected: '从未连接',
        pending: '挂起',
      };
      let res = label;
      Object.keys(labelText).some((key) => {
        if (label.includes(`${key}`)) {
          res = labelText[key];

          return true;
        }
      });
      return res;
    }

    function valueTransform(value) {
      const valueText = {
        active: '已连接',
        disconnected: '未连接',
        never_connected: '从未连接',
        pending: '挂起',
      };
      let res = value;
      Object.keys(valueText).some((key) => {
        if (value.includes(`${key}`)) {
          res = valueText[key];

          return true;
        }
      });
      return res;
    }

    return renderToStaticMarkup(
      <table>
        <tbody>
          {details.map((detail, index) => (
            <tr key={index}>
              <td className="visTooltip__label">
                {/* <div className="visTooltip__labelContainer">{detail.label}</div> */}
                <div className="visTooltip__labelContainer">{labelTransform(detail.label)}</div>
              </td>

              <td className="visTooltip__value">
                <div className="visTooltip__valueContainer">
                  {valueTransform(detail.value)}
                  {detail.percent && <span> ({detail.percent})</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
}
