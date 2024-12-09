"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReportPrinter = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _printer = _interopRequireDefault(require("pdfmake/src/printer"));

var _clockIconRaw = _interopRequireDefault(require("./clock-icon-raw"));

var _filterIconRaw = _interopRequireDefault(require("./filter-icon-raw"));

var _visualizations = require("../../integration-files/visualizations");

var _logger = require("../logger");

var TimSort = _interopRequireWildcard(require("timsort"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const COLORS = {
  PRIMARY: '#00a9e5'
};
const pageConfiguration = {
  styles: {
    h1: {
      fontSize: 22,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h2: {
      fontSize: 18,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h3: {
      fontSize: 16,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h4: {
      fontSize: 14,
      monslight: true,
      color: COLORS.PRIMARY
    },
    standard: {
      color: '#333'
    },
    whiteColorFilters: {
      color: '#FFF',
      fontSize: 14
    },
    whiteColor: {
      color: '#FFF'
    }
  },
  pageMargins: [40, 40, 40, 80], // 左上右下
  // pageMargins: [40, 80, 40, 80],
  // header: {
  //   margin: [40, 20, 0, 0],
  //   columns: [{
  //     image: _path.default.join(__dirname, '../../../public/assets/logo.png'),
  //     width: 190
  //   }, {
  //     text: 'info@wazuh.com\nhttps://wazuh.com',
  //     alignment: 'right',
  //     margin: [0, 0, 40, 0],
  //     color: COLORS.PRIMARY
  //   }]
  // },
  content: [],

  footer(currentPage, pageCount) {
    return {
      columns: [{
        text: '',
        // text: 'Copyright © 2021 Wazuh, Inc.',
        color: COLORS.PRIMARY,
        width: 400,
        margin: [40, 40, 0, 0]
      }, {
        text: currentPage.toString() + ' / ' + pageCount,
        alignment: 'right',
        margin: [0, 40, 40, 0],
        color: COLORS.PRIMARY
      }]
    };
  },

  pageBreakBefore(currentNode, followingNodesOnPage) {
    if (currentNode.id && currentNode.id.includes('splitvis')) {
      return followingNodesOnPage.length === 6 || followingNodesOnPage.length === 7;
    }

    if (currentNode.id && currentNode.id.includes('splitsinglevis') || currentNode.id && currentNode.id.includes('singlevis')) {
      return followingNodesOnPage.length === 6;
    }

    return false;
  }

};
const fonts = {
  Roboto: {
    normal: _path.default.join(__dirname, '../../../public/assets/opensans/Alibaba-PuHuiTi-Light.ttf'),
    bold: _path.default.join(__dirname, '../../../public/assets/opensans/Alibaba-PuHuiTi-Bold.ttf'),
    italics: _path.default.join(__dirname, '../../../public/assets/opensans/Alibaba-PuHuiTi-Regular.ttf'),
    bolditalics: _path.default.join(__dirname, '../../../public/assets/opensans/Alibaba-PuHuiTi-Heavy.ttf'),
    monslight: _path.default.join(__dirname, '../../../public/assets/opensans/Alibaba-PuHuiTi-Medium.ttf')
    // normal: _path.default.join(__dirname, '../../../public/assets/opensans/OpenSans-Light.ttf'),
    // bold: _path.default.join(__dirname, '../../../public/assets/opensans/OpenSans-Bold.ttf'),
    // italics: _path.default.join(__dirname, '../../../public/assets/opensans/OpenSans-Italic.ttf'),
    // bolditalics: _path.default.join(__dirname, '../../../public/assets/opensans/OpenSans-BoldItalic.ttf'),
    // monslight: _path.default.join(__dirname, '../../../public/assets/opensans/Montserrat-Light.ttf')
  }
};

class ReportPrinter {
  constructor() {
    _defineProperty(this, "_content", void 0);

    _defineProperty(this, "_printer", void 0);

    this._printer = new _printer.default(fonts);
    this._content = [];
  }

  addContent(...content) {
    this._content.push(...content);

    return this;
  }

  addConfigTables(tables) {
    (0, _logger.log)('reporting:renderConfigTables', 'Started to render configuration tables', 'info');
    (0, _logger.log)('reporting:renderConfigTables', `tables: ${tables.length}`, 'debug');

    for (const table of tables) {
      let rowsparsed = table.rows;

      if (Array.isArray(rowsparsed) && rowsparsed.length) {
        const rows = rowsparsed.length > 100 ? rowsparsed.slice(0, 99) : rowsparsed;
        this.addContent({
          text: table.title,
          style: {
            fontSize: 11,
            color: '#000'
          },
          margin: table.title && table.type === 'table' ? [0, 0, 0, 5] : ''
        });

        if (table.title === 'Monitored directories') {
          this.addContent({
            text: 'RT: Real time | WD: Who-data | Per.: Permission | MT: Modification time | SL: Symbolic link | RL: Recursion level',
            style: {
              fontSize: 8,
              color: COLORS.PRIMARY
            },
            margin: [0, 0, 0, 5]
          });
        }

        const full_body = [];
        const modifiedRows = rows.map(row => row.map(cell => ({
          text: cell || '-',
          style: 'standard'
        }))); // for (const row of rows) {
        //   modifiedRows.push(
        //     row.map(cell => ({ text: cell || '-', style: 'standard' }))
        //   );
        // }

        let widths = [];
        widths = Array(table.columns.length - 1).fill('auto');
        widths.push('*');

        if (table.type === 'config') {
          full_body.push(table.columns.map(col => ({
            text: col || '-',
            border: [0, 0, 0, 20],
            fontSize: 0,
            colSpan: 2
          })), ...modifiedRows);
          this.addContent({
            fontSize: 8,
            table: {
              headerRows: 0,
              widths,
              body: full_body,
              dontBreakRows: true
            },
            layout: {
              fillColor: i => i === 0 ? '#fff' : null,
              hLineColor: () => '#D3DAE6',
              hLineWidth: () => 1,
              vLineWidth: () => 0
            }
          });
        } else if (table.type === 'table') {
          full_body.push(table.columns.map(col => ({
            text: col || '-',
            style: 'whiteColor',
            border: [0, 0, 0, 0]
          })), ...modifiedRows);
          this.addContent({
            fontSize: 8,
            table: {
              headerRows: 1,
              widths,
              body: full_body
            },
            layout: {
              fillColor: i => i === 0 ? COLORS.PRIMARY : null,
              hLineColor: () => COLORS.PRIMARY,
              hLineWidth: () => 1,
              vLineWidth: () => 0
            }
          });
        }

        this.addNewLine();
      }

      (0, _logger.log)('reporting:renderConfigTables', `Table rendered`, 'debug');
    }
  }

  addTables(tables) {
    (0, _logger.log)('reporting:renderTables', 'Started to render tables', 'info');
    (0, _logger.log)('reporting:renderTables', `tables: ${tables.length}`, 'debug');

    const titleText = {
      'Alerts summary': '告警统计',
      'Groups summary': '规则分组统计',
    }
    const cellText = {
      'Rule ID': '规则ID',
      'Description': '描述',
      'Level': '等级',
      'Group': '分组',
    }
    const hiddenTable = ['Groups summary']

    for (const table of tables) {
      let rowsparsed = [];
      rowsparsed = table.rows;

      if (hiddenTable.indexOf(table.title) !== -1) continue

      if (Array.isArray(rowsparsed) && rowsparsed.length) {
        const rows = rowsparsed.length > 100 ? rowsparsed.slice(0, 99) : rowsparsed;
        this.addContent({
          text: titleText[table.title] || table.title,
          style: 'h3',
          // pageBreak: 'before'
        });
        this.addNewLine();
        const full_body = [];

        const sortTableRows = (a, b) => parseInt(a[a.length - 1]) < parseInt(b[b.length - 1]) ? 1 : parseInt(a[a.length - 1]) > parseInt(b[b.length - 1]) ? -1 : 0;

        TimSort.sort(rows, sortTableRows);
        const modifiedRows = rows.map(row => row.map(cell => ({
          text: cell || '-',
          style: 'standard'
        })));
        // const widths = Array(table.columns.length).fill('auto');
        // widths.push('*');
        const widths = ['10%', '70%', '10%', '10%']
        full_body.push(table.columns.map(col => ({
          text: cellText[col] || col || '-',
          style: 'whiteColor',
          border: [0, 0, 0, 0]
        })), ...modifiedRows);
        this.addContent({
          fontSize: 8,
          table: {
            headerRows: 1,
            widths,
            body: full_body
          },
          layout: {
            fillColor: i => i === 0 ? COLORS.PRIMARY : null,
            hLineColor: () => COLORS.PRIMARY,
            hLineWidth: () => 1,
            vLineWidth: () => 0
          }
        });
        this.addNewLine();
        (0, _logger.log)('reporting:renderTables', `Table rendered`, 'debug');
      }
    }
  }

  addTimeRangeAndFilters(from, to, filters, timeZone) {
    (0, _logger.log)('reporting:renderTimeRangeAndFilters', `Started to render the time range and the filters`, 'info');
    (0, _logger.log)('reporting:renderTimeRangeAndFilters', `from: ${from}, to: ${to}, filters: ${filters}, timeZone: ${timeZone}`, 'debug');
    const fromDate = new Date(new Date(from).toLocaleString('en-US', {
      timeZone
    }));
    const toDate = new Date(new Date(to).toLocaleString('en-US', {
      timeZone
    }));
    const str = `${this.formatDate(fromDate)} to ${this.formatDate(toDate)}`;
    this.addContent({
      fontSize: 8,
      table: {
        widths: ['*'],
        body: [[{
          columns: [{
            svg: _clockIconRaw.default,
            width: 10,
            height: 10,
            margin: [0, 5, 0, 0]
          }, {
            text: str || '-',
            margin: [3, 0, 0, 0],
            style: 'whiteColorFilters'
          }]
        }], 
        // [{
        //   columns: [{
        //     svg: _filterIconRaw.default,
        //     width: 10,
        //     height: 10,
        //     margin: [40, 6, 0, 0]
        //   }, {
        //     text: filters || '-',
        //     margin: [43, 0, 0, 0],
        //     style: 'whiteColorFilters'
        //   }]
        // }]
      ]
      },
      // margin: [0, 0, 0, 0],
      // margin: [-40, 0, -40, 0],
      layout: {
        fillColor: () => COLORS.PRIMARY,
        hLineWidth: () => 0,
        vLineWidth: () => 0
      }
    });
    this.addContent({
      text: '\n'
    });
    (0, _logger.log)('reporting:renderTimeRangeAndFilters', 'Time range and filters rendered', 'debug');
  }

  addVisualizations(visualizations, isAgents, tab) {
    (0, _logger.log)('reporting:renderVisualizations', `${visualizations.length} visualizations for tab ${tab}`, 'info');
    const single_vis = visualizations.filter(item => item.width >= 600);
    const double_vis = visualizations.filter(item => item.width < 600);
    single_vis.forEach(visualization => {
      const title = this.checkTitle(visualization, isAgents, tab);
      this.addContent({
        id: 'singlevis' + title[0]._source.title,
        text: title[0]._source.title,
        style: 'h3'
      });
      this.addContent({
        columns: [{
          image: visualization.element,
          width: 500
        }]
      });
      this.addNewLine();
    });
    let pair = [];

    for (const item of double_vis) {
      pair.push(item);

      if (pair.length === 2) {
        const title_1 = this.checkTitle(pair[0], isAgents, tab);
        const title_2 = this.checkTitle(pair[1], isAgents, tab);
        this.addContent({
          columns: [{
            id: 'splitvis' + title_1[0]._source.title,
            text: title_1[0]._source.title,
            style: 'h3',
            width: 280
          }, {
            id: 'splitvis' + title_2[0]._source.title,
            text: title_2[0]._source.title,
            style: 'h3',
            width: 280
          }]
        });
        this.addContent({
          columns: [{
            image: pair[0].element,
            width: 270
          }, {
            image: pair[1].element,
            width: 270
          }]
        });
        this.addNewLine();
        pair = [];
      }
    }

    if (double_vis.length % 2 !== 0) {
      const item = double_vis[double_vis.length - 1];
      const title = this.checkTitle(item, isAgents, tab);
      this.addContent({
        columns: [{
          id: 'splitsinglevis' + title[0]._source.title,
          text: title[0]._source.title,
          style: 'h3',
          width: 280
        }]
      });
      this.addContent({
        columns: [{
          image: item.element,
          width: 280
        }]
      });
      this.addNewLine();
    }
  }

  formatDate(date) {
    (0, _logger.log)('reporting:formatDate', `Format date ${date}`, 'info');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const str = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    (0, _logger.log)('reporting:formatDate', `str: ${str}`, 'debug');
    return str;
  }

  checkTitle(item, isAgents, tab) {
    (0, _logger.log)('reporting:checkTitle', `Item ID ${item.id}, from ${isAgents ? 'agents' : 'overview'} and tab ${tab}`, 'info');
    const title = isAgents ? _visualizations.AgentsVisualizations[tab].filter(v => v._id === item.id) : _visualizations.OverviewVisualizations[tab].filter(v => v._id === item.id);
    return title;
  }

  addSimpleTable({
    columns,
    items,
    title
  }) {
    if (title) {
      this.addContent(typeof title === 'string' ? {
        text: title,
        style: 'h4'
      } : title).addNewLine();
    }

    if (!items || !items.length) {
      this.addContent({
        text: '没有符合搜索条件的结果',
        style: 'standard'
      });
      return this;
    }

    const tableHeader = columns.map(column => {
      return {
        text: column.label,
        style: 'whiteColor',
        border: [0, 0, 0, 0]
      };
    });
    const tableRows = items.map((item, index) => {
      return columns.map(column => {
        const cellValue = item[column.id];
        return {
          text: typeof cellValue !== 'undefined' ? cellValue : '-',
          style: 'standard'
        };
      });
    });
    const widths = new Array(columns.length - 1).fill('auto');
    widths.push('*');
    this.addContent({
      fontSize: 8,
      table: {
        headerRows: 1,
        widths,
        body: [tableHeader, ...tableRows]
      },
      layout: {
        fillColor: i => i === 0 ? COLORS.PRIMARY : null,
        hLineColor: () => COLORS.PRIMARY,
        hLineWidth: () => 1,
        vLineWidth: () => 0
      }
    }).addNewLine();
    return this;
  }

  addList({
    title,
    list
  }) {
    return this.addContentWithNewLine(typeof title === 'string' ? {
      text: title,
      style: 'h2'
    } : title).addContent({
      ul: list.filter(element => element)
    }).addNewLine();
  }

  addNewLine() {
    return this.addContent({
      text: '\n'
    });
  }

  addContentWithNewLine(title) {
    return this.addContent(title).addNewLine();
  }

  async print(path) {
    const document = this._printer.createPdfKitDocument({ ...pageConfiguration,
      content: this._content
    });

    await document.pipe(_fs.default.createWriteStream(path));
    document.end();
  }

}

exports.ReportPrinter = ReportPrinter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW50ZXIudHMiXSwibmFtZXMiOlsiQ09MT1JTIiwiUFJJTUFSWSIsInBhZ2VDb25maWd1cmF0aW9uIiwic3R5bGVzIiwiaDEiLCJmb250U2l6ZSIsIm1vbnNsaWdodCIsImNvbG9yIiwiaDIiLCJoMyIsImg0Iiwic3RhbmRhcmQiLCJ3aGl0ZUNvbG9yRmlsdGVycyIsIndoaXRlQ29sb3IiLCJwYWdlTWFyZ2lucyIsImhlYWRlciIsIm1hcmdpbiIsImNvbHVtbnMiLCJpbWFnZSIsInBhdGgiLCJqb2luIiwiX19kaXJuYW1lIiwid2lkdGgiLCJ0ZXh0IiwiYWxpZ25tZW50IiwiY29udGVudCIsImZvb3RlciIsImN1cnJlbnRQYWdlIiwicGFnZUNvdW50IiwidG9TdHJpbmciLCJwYWdlQnJlYWtCZWZvcmUiLCJjdXJyZW50Tm9kZSIsImZvbGxvd2luZ05vZGVzT25QYWdlIiwiaWQiLCJpbmNsdWRlcyIsImxlbmd0aCIsImZvbnRzIiwiUm9ib3RvIiwibm9ybWFsIiwiYm9sZCIsIml0YWxpY3MiLCJib2xkaXRhbGljcyIsIlJlcG9ydFByaW50ZXIiLCJjb25zdHJ1Y3RvciIsIl9wcmludGVyIiwiUGRmUHJpbnRlciIsIl9jb250ZW50IiwiYWRkQ29udGVudCIsInB1c2giLCJhZGRDb25maWdUYWJsZXMiLCJ0YWJsZXMiLCJ0YWJsZSIsInJvd3NwYXJzZWQiLCJyb3dzIiwiQXJyYXkiLCJpc0FycmF5Iiwic2xpY2UiLCJ0aXRsZSIsInN0eWxlIiwidHlwZSIsImZ1bGxfYm9keSIsIm1vZGlmaWVkUm93cyIsIm1hcCIsInJvdyIsImNlbGwiLCJ3aWR0aHMiLCJmaWxsIiwiY29sIiwiYm9yZGVyIiwiY29sU3BhbiIsImhlYWRlclJvd3MiLCJib2R5IiwiZG9udEJyZWFrUm93cyIsImxheW91dCIsImZpbGxDb2xvciIsImkiLCJoTGluZUNvbG9yIiwiaExpbmVXaWR0aCIsInZMaW5lV2lkdGgiLCJhZGROZXdMaW5lIiwiYWRkVGFibGVzIiwicGFnZUJyZWFrIiwic29ydFRhYmxlUm93cyIsImEiLCJiIiwicGFyc2VJbnQiLCJUaW1Tb3J0Iiwic29ydCIsImFkZFRpbWVSYW5nZUFuZEZpbHRlcnMiLCJmcm9tIiwidG8iLCJmaWx0ZXJzIiwidGltZVpvbmUiLCJmcm9tRGF0ZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsInRvRGF0ZSIsInN0ciIsImZvcm1hdERhdGUiLCJzdmciLCJjbG9ja0ljb25SYXciLCJoZWlnaHQiLCJmaWx0ZXJJY29uUmF3IiwiYWRkVmlzdWFsaXphdGlvbnMiLCJ2aXN1YWxpemF0aW9ucyIsImlzQWdlbnRzIiwidGFiIiwic2luZ2xlX3ZpcyIsImZpbHRlciIsIml0ZW0iLCJkb3VibGVfdmlzIiwiZm9yRWFjaCIsInZpc3VhbGl6YXRpb24iLCJjaGVja1RpdGxlIiwiX3NvdXJjZSIsImVsZW1lbnQiLCJwYWlyIiwidGl0bGVfMSIsInRpdGxlXzIiLCJkYXRlIiwieWVhciIsImdldEZ1bGxZZWFyIiwibW9udGgiLCJnZXRNb250aCIsImRheSIsImdldERhdGUiLCJob3VycyIsImdldEhvdXJzIiwibWludXRlcyIsImdldE1pbnV0ZXMiLCJzZWNvbmRzIiwiZ2V0U2Vjb25kcyIsIkFnZW50c1Zpc3VhbGl6YXRpb25zIiwidiIsIl9pZCIsIk92ZXJ2aWV3VmlzdWFsaXphdGlvbnMiLCJhZGRTaW1wbGVUYWJsZSIsIml0ZW1zIiwidGFibGVIZWFkZXIiLCJjb2x1bW4iLCJsYWJlbCIsInRhYmxlUm93cyIsImluZGV4IiwiY2VsbFZhbHVlIiwiYWRkTGlzdCIsImxpc3QiLCJhZGRDb250ZW50V2l0aE5ld0xpbmUiLCJ1bCIsInByaW50IiwiZG9jdW1lbnQiLCJjcmVhdGVQZGZLaXREb2N1bWVudCIsInBpcGUiLCJmcyIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxNQUFNQSxNQUFNLEdBQUc7QUFD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QUt6RyxRQUFMLENBQWMwRyxvQkFBZCxDQUFtQyxFQUFDLEdBQUdwSixpQkFBSjtBQUF1QnVCLE1BQUFBLE9BQU8sRUFBRSxLQUFLcUI7QUFBckMsS0FBbkMsQ0FBakI7O0FBQ0EsVUFBTXVHLFFBQVEsQ0FBQ0UsSUFBVCxDQUNKQyxZQUFHQyxpQkFBSCxDQUFxQnRJLElBQXJCLENBREksQ0FBTjtBQUdBa0ksSUFBQUEsUUFBUSxDQUFDSyxHQUFUO0FBQ0Q7O0FBMVp1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBQZGZQcmludGVyIGZyb20gJ3BkZm1ha2Uvc3JjL3ByaW50ZXInO1xuaW1wb3J0IGNsb2NrSWNvblJhdyBmcm9tICcuL2Nsb2NrLWljb24tcmF3JztcbmltcG9ydCBmaWx0ZXJJY29uUmF3IGZyb20gJy4vZmlsdGVyLWljb24tcmF3JztcbmltcG9ydCB7XG4gIEFnZW50c1Zpc3VhbGl6YXRpb25zLFxuICBPdmVydmlld1Zpc3VhbGl6YXRpb25zXG59IGZyb20gJy4uLy4uL2ludGVncmF0aW9uLWZpbGVzL3Zpc3VhbGl6YXRpb25zJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgKiBhcyBUaW1Tb3J0IGZyb20gJ3RpbXNvcnQnO1xuXG5jb25zdCBDT0xPUlMgPSB7XG4gIFBSSU1BUlk6ICcjMDBhOWU1J1xufTtcblxuY29uc3QgcGFnZUNvbmZpZ3VyYXRpb24gPSB7XG4gIHN0eWxlczoge1xuICAgIGgxOiB7XG4gICAgICBmb250U2l6ZTogMjIsXG4gICAgICBtb25zbGlnaHQ6IHRydWUsXG4gICAgICBjb2xvcjogQ09MT1JTLlBSSU1BUllcbiAgICB9LFxuICAgIGgyOiB7XG4gICAgICBmb250U2l6ZTogMTgsXG4gICAgICBtb25zbGlnaHQ6IHRydWUsXG4gICAgICBjb2xvcjogQ09MT1JTLlBSSU1BUllcbiAgICB9LFxuICAgIGgzOiB7XG4gICAgICBmb250U2l6ZTogMTYsXG4gICAgICBtb25zbGlnaHQ6IHRydWUsXG4gICAgICBjb2xvcjogQ09MT1JTLlBSSU1BUllcbiAgICB9LFxuICAgIGg0OiB7XG4gICAgICBmb250U2l6ZTogMTQsXG4gICAgICBtb25zbGlnaHQ6IHRydWUsXG4gICAgICBjb2xvcjogQ09MT1JTLlBSSU1BUllcbiAgICB9LFxuICAgIHN0YW5kYXJkOiB7XG4gICAgICBjb2xvcjogJyMzMzMnXG4gICAgfSxcbiAgICB3aGl0ZUNvbG9yRmlsdGVyczoge1xuICAgICAgY29sb3I6ICcjRkZGJyxcbiAgICAgIGZvbnRTaXplOiAxNFxuICAgIH0sXG4gICAgd2hpdGVDb2xvcjoge1xuICAgICAgY29sb3I6ICcjRkZGJ1xuICAgIH1cbiAgfSxcbiAgcGFnZU1hcmdpbnM6IFs0MCwgODAsIDQwLCA4MF0sXG4gIGhlYWRlcjoge1xuICAgIG1hcmdpbjogWzQwLCAyMCwgMCwgMF0sXG4gICAgY29sdW1uczogW1xuICAgICAge1xuICAgICAgICBpbWFnZTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3B1YmxpYy9hc3NldHMvbG9nby5wbmcnKSxcbiAgICAgICAgd2lkdGg6IDE5MFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ2luZm9Ad2F6dWguY29tXFxuaHR0cHM6Ly93YXp1aC5jb20nLFxuICAgICAgICBhbGlnbm1lbnQ6ICdyaWdodCcsXG4gICAgICAgIG1hcmdpbjogWzAsIDAsIDQwLCAwXSxcbiAgICAgICAgY29sb3I6IENPTE9SUy5QUklNQVJZXG4gICAgICB9XG4gICAgXVxuICB9LFxuICBjb250ZW50OiBbXSxcbiAgZm9vdGVyKGN1cnJlbnRQYWdlLCBwYWdlQ291bnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sdW1uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ0NvcHlyaWdodCDCqSAyMDIxIFdhenVoLCBJbmMuJyxcbiAgICAgICAgICBjb2xvcjogQ09MT1JTLlBSSU1BUlksXG4gICAgICAgICAgbWFyZ2luOiBbNDAsIDQwLCAwLCAwXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1BhZ2UgJyArIGN1cnJlbnRQYWdlLnRvU3RyaW5nKCkgKyAnIG9mICcgKyBwYWdlQ291bnQsXG4gICAgICAgICAgYWxpZ25tZW50OiAncmlnaHQnLFxuICAgICAgICAgIG1hcmdpbjogWzAsIDQwLCA0MCwgMF0sXG4gICAgICAgICAgY29sb3I6IENPTE9SUy5QUklNQVJZXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9LFxuICBwYWdlQnJlYWtCZWZvcmUoY3VycmVudE5vZGUsIGZvbGxvd2luZ05vZGVzT25QYWdlKSB7XG4gICAgaWYgKGN1cnJlbnROb2RlLmlkICYmIGN1cnJlbnROb2RlLmlkLmluY2x1ZGVzKCdzcGxpdHZpcycpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBmb2xsb3dpbmdOb2Rlc09uUGFnZS5sZW5ndGggPT09IDYgfHxcbiAgICAgICAgZm9sbG93aW5nTm9kZXNPblBhZ2UubGVuZ3RoID09PSA3XG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAoY3VycmVudE5vZGUuaWQgJiYgY3VycmVudE5vZGUuaWQuaW5jbHVkZXMoJ3NwbGl0c2luZ2xldmlzJykpIHx8XG4gICAgICAoY3VycmVudE5vZGUuaWQgJiYgY3VycmVudE5vZGUuaWQuaW5jbHVkZXMoJ3NpbmdsZXZpcycpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZvbGxvd2luZ05vZGVzT25QYWdlLmxlbmd0aCA9PT0gNjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBmb250cyA9IHtcbiAgUm9ib3RvOiB7XG4gICAgbm9ybWFsOiBwYXRoLmpvaW4oXG4gICAgICBfX2Rpcm5hbWUsXG4gICAgICAnLi4vLi4vLi4vcHVibGljL2Fzc2V0cy9vcGVuc2Fucy9PcGVuU2Fucy1MaWdodC50dGYnXG4gICAgKSxcbiAgICBib2xkOiBwYXRoLmpvaW4oXG4gICAgICBfX2Rpcm5hbWUsXG4gICAgICAnLi4vLi4vLi4vcHVibGljL2Fzc2V0cy9vcGVuc2Fucy9PcGVuU2Fucy1Cb2xkLnR0ZidcbiAgICApLFxuICAgIGl0YWxpY3M6IHBhdGguam9pbihcbiAgICAgIF9fZGlybmFtZSxcbiAgICAgICcuLi8uLi8uLi9wdWJsaWMvYXNzZXRzL29wZW5zYW5zL09wZW5TYW5zLUl0YWxpYy50dGYnXG4gICAgKSxcbiAgICBib2xkaXRhbGljczogcGF0aC5qb2luKFxuICAgICAgX19kaXJuYW1lLFxuICAgICAgJy4uLy4uLy4uL3B1YmxpYy9hc3NldHMvb3BlbnNhbnMvT3BlblNhbnMtQm9sZEl0YWxpYy50dGYnXG4gICAgKSxcbiAgICBtb25zbGlnaHQ6IHBhdGguam9pbihcbiAgICAgIF9fZGlybmFtZSxcbiAgICAgICcuLi8uLi8uLi9wdWJsaWMvYXNzZXRzL29wZW5zYW5zL01vbnRzZXJyYXQtTGlnaHQudHRmJ1xuICAgIClcbiAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFJlcG9ydFByaW50ZXJ7XG4gIHByaXZhdGUgX2NvbnRlbnQ6IGFueVtdO1xuICBwcml2YXRlIF9wcmludGVyOiBQZGZQcmludGVyO1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuX3ByaW50ZXIgPSBuZXcgUGRmUHJpbnRlcihmb250cyk7XG4gICAgdGhpcy5fY29udGVudCA9IFtdO1xuICB9XG4gIGFkZENvbnRlbnQoLi4uY29udGVudDogYW55KXtcbiAgICB0aGlzLl9jb250ZW50LnB1c2goLi4uY29udGVudCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgYWRkQ29uZmlnVGFibGVzKHRhYmxlczogYW55KXtcbiAgICBsb2coXG4gICAgICAncmVwb3J0aW5nOnJlbmRlckNvbmZpZ1RhYmxlcycsXG4gICAgICAnU3RhcnRlZCB0byByZW5kZXIgY29uZmlndXJhdGlvbiB0YWJsZXMnLFxuICAgICAgJ2luZm8nXG4gICAgKTtcbiAgICBsb2coJ3JlcG9ydGluZzpyZW5kZXJDb25maWdUYWJsZXMnLCBgdGFibGVzOiAke3RhYmxlcy5sZW5ndGh9YCwgJ2RlYnVnJyk7XG4gICAgZm9yIChjb25zdCB0YWJsZSBvZiB0YWJsZXMpIHtcbiAgICAgIGxldCByb3dzcGFyc2VkID0gdGFibGUucm93cztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJvd3NwYXJzZWQpICYmIHJvd3NwYXJzZWQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPVxuICAgICAgICAgIHJvd3NwYXJzZWQubGVuZ3RoID4gMTAwID8gcm93c3BhcnNlZC5zbGljZSgwLCA5OSkgOiByb3dzcGFyc2VkO1xuICAgICAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgICAgIHRleHQ6IHRhYmxlLnRpdGxlLFxuICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiAxMSwgY29sb3I6ICcjMDAwJyB9LFxuICAgICAgICAgIG1hcmdpbjogdGFibGUudGl0bGUgJiYgdGFibGUudHlwZSA9PT0gJ3RhYmxlJyA/IFswLCAwLCAwLCA1XSA6ICcnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0YWJsZS50aXRsZSA9PT0gJ01vbml0b3JlZCBkaXJlY3RvcmllcycpIHtcbiAgICAgICAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgICAgICAgdGV4dDpcbiAgICAgICAgICAgICAgJ1JUOiBSZWFsIHRpbWUgfCBXRDogV2hvLWRhdGEgfCBQZXIuOiBQZXJtaXNzaW9uIHwgTVQ6IE1vZGlmaWNhdGlvbiB0aW1lIHwgU0w6IFN5bWJvbGljIGxpbmsgfCBSTDogUmVjdXJzaW9uIGxldmVsJyxcbiAgICAgICAgICAgIHN0eWxlOiB7IGZvbnRTaXplOiA4LCBjb2xvcjogQ09MT1JTLlBSSU1BUlkgfSxcbiAgICAgICAgICAgIG1hcmdpbjogWzAsIDAsIDAsIDVdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsX2JvZHkgPSBbXTtcblxuICAgICAgICBjb25zdCBtb2RpZmllZFJvd3MgPSByb3dzLm1hcChyb3cgPT4gcm93Lm1hcChjZWxsID0+ICh7IHRleHQ6IGNlbGwgfHwgJy0nLCBzdHlsZTogJ3N0YW5kYXJkJyB9KSkpO1xuICAgICAgICAvLyBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIC8vICAgbW9kaWZpZWRSb3dzLnB1c2goXG4gICAgICAgIC8vICAgICByb3cubWFwKGNlbGwgPT4gKHsgdGV4dDogY2VsbCB8fCAnLScsIHN0eWxlOiAnc3RhbmRhcmQnIH0pKVxuICAgICAgICAvLyAgICk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgbGV0IHdpZHRocyA9IFtdO1xuICAgICAgICB3aWR0aHMgPSBBcnJheSh0YWJsZS5jb2x1bW5zLmxlbmd0aCAtIDEpLmZpbGwoJ2F1dG8nKTtcbiAgICAgICAgd2lkdGhzLnB1c2goJyonKTtcblxuICAgICAgICBpZiAodGFibGUudHlwZSA9PT0gJ2NvbmZpZycpIHtcbiAgICAgICAgICBmdWxsX2JvZHkucHVzaChcbiAgICAgICAgICAgIHRhYmxlLmNvbHVtbnMubWFwKGNvbCA9PiAoe1xuICAgICAgICAgICAgICB0ZXh0OiBjb2wgfHwgJy0nLFxuICAgICAgICAgICAgICBib3JkZXI6IFswLCAwLCAwLCAyMF0sXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAwLFxuICAgICAgICAgICAgICBjb2xTcGFuOiAyXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAuLi5tb2RpZmllZFJvd3NcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuYWRkQ29udGVudCh7XG4gICAgICAgICAgICBmb250U2l6ZTogOCxcbiAgICAgICAgICAgIHRhYmxlOiB7XG4gICAgICAgICAgICAgIGhlYWRlclJvd3M6IDAsXG4gICAgICAgICAgICAgIHdpZHRocyxcbiAgICAgICAgICAgICAgYm9keTogZnVsbF9ib2R5LFxuICAgICAgICAgICAgICBkb250QnJlYWtSb3dzOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogaSA9PiAoaSA9PT0gMCA/ICcjZmZmJyA6IG51bGwpLFxuICAgICAgICAgICAgICBoTGluZUNvbG9yOiAoKSA9PiAnI0QzREFFNicsXG4gICAgICAgICAgICAgIGhMaW5lV2lkdGg6ICgpID0+IDEsXG4gICAgICAgICAgICAgIHZMaW5lV2lkdGg6ICgpID0+IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWJsZS50eXBlID09PSAndGFibGUnKSB7XG4gICAgICAgICAgZnVsbF9ib2R5LnB1c2goXG4gICAgICAgICAgICB0YWJsZS5jb2x1bW5zLm1hcChjb2wgPT4gKHtcbiAgICAgICAgICAgICAgdGV4dDogY29sIHx8ICctJyxcbiAgICAgICAgICAgICAgc3R5bGU6ICd3aGl0ZUNvbG9yJyxcbiAgICAgICAgICAgICAgYm9yZGVyOiBbMCwgMCwgMCwgMF1cbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIC4uLm1vZGlmaWVkUm93c1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5hZGRDb250ZW50KHtcbiAgICAgICAgICAgIGZvbnRTaXplOiA4LFxuICAgICAgICAgICAgdGFibGU6IHtcbiAgICAgICAgICAgICAgaGVhZGVyUm93czogMSxcbiAgICAgICAgICAgICAgd2lkdGhzLFxuICAgICAgICAgICAgICBib2R5OiBmdWxsX2JvZHlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBpID0+IChpID09PSAwID8gQ09MT1JTLlBSSU1BUlkgOiBudWxsKSxcbiAgICAgICAgICAgICAgaExpbmVDb2xvcjogKCkgPT4gQ09MT1JTLlBSSU1BUlksXG4gICAgICAgICAgICAgIGhMaW5lV2lkdGg6ICgpID0+IDEsXG4gICAgICAgICAgICAgIHZMaW5lV2lkdGg6ICgpID0+IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZE5ld0xpbmUoKTtcbiAgICAgIH1cbiAgICAgIGxvZygncmVwb3J0aW5nOnJlbmRlckNvbmZpZ1RhYmxlcycsIGBUYWJsZSByZW5kZXJlZGAsICdkZWJ1ZycpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRhYmxlcyh0YWJsZXM6IGFueSl7XG4gICAgbG9nKCdyZXBvcnRpbmc6cmVuZGVyVGFibGVzJywgJ1N0YXJ0ZWQgdG8gcmVuZGVyIHRhYmxlcycsICdpbmZvJyk7XG4gICAgbG9nKCdyZXBvcnRpbmc6cmVuZGVyVGFibGVzJywgYHRhYmxlczogJHt0YWJsZXMubGVuZ3RofWAsICdkZWJ1ZycpO1xuICAgIGZvciAoY29uc3QgdGFibGUgb2YgdGFibGVzKSB7XG4gICAgICBsZXQgcm93c3BhcnNlZCA9IFtdO1xuICAgICAgcm93c3BhcnNlZCA9IHRhYmxlLnJvd3M7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyb3dzcGFyc2VkKSAmJiByb3dzcGFyc2VkLmxlbmd0aCkge1xuICAgICAgICBjb25zdCByb3dzID1cbiAgICAgICAgICByb3dzcGFyc2VkLmxlbmd0aCA+IDEwMCA/IHJvd3NwYXJzZWQuc2xpY2UoMCwgOTkpIDogcm93c3BhcnNlZDtcbiAgICAgICAgdGhpcy5hZGRDb250ZW50KHtcbiAgICAgICAgICB0ZXh0OiB0YWJsZS50aXRsZSxcbiAgICAgICAgICBzdHlsZTogJ2gzJyxcbiAgICAgICAgICBwYWdlQnJlYWs6ICdiZWZvcmUnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZE5ld0xpbmUoKTtcbiAgICAgICAgY29uc3QgZnVsbF9ib2R5ID0gW107XG4gICAgICAgIGNvbnN0IHNvcnRUYWJsZVJvd3MgPSAoYSwgYikgPT5cbiAgICAgICAgICBwYXJzZUludChhW2EubGVuZ3RoIC0gMV0pIDwgcGFyc2VJbnQoYltiLmxlbmd0aCAtIDFdKVxuICAgICAgICAgICAgPyAxXG4gICAgICAgICAgICA6IHBhcnNlSW50KGFbYS5sZW5ndGggLSAxXSkgPiBwYXJzZUludChiW2IubGVuZ3RoIC0gMV0pXG4gICAgICAgICAgICA/IC0xXG4gICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgVGltU29ydC5zb3J0KHJvd3MsIHNvcnRUYWJsZVJvd3MpO1xuXG4gICAgICAgIGNvbnN0IG1vZGlmaWVkUm93cyA9IHJvd3MubWFwKHJvdyA9PiByb3cubWFwKGNlbGwgPT4gKHsgdGV4dDogY2VsbCB8fCAnLScsIHN0eWxlOiAnc3RhbmRhcmQnIH0pKSk7XG5cbiAgICAgICAgY29uc3Qgd2lkdGhzID0gQXJyYXkodGFibGUuY29sdW1ucy5sZW5ndGggLSAxKS5maWxsKCdhdXRvJyk7XG4gICAgICAgIHdpZHRocy5wdXNoKCcqJyk7XG5cbiAgICAgICAgZnVsbF9ib2R5LnB1c2goXG4gICAgICAgICAgdGFibGUuY29sdW1ucy5tYXAoY29sID0+ICh7XG4gICAgICAgICAgICB0ZXh0OiBjb2wgfHwgJy0nLFxuICAgICAgICAgICAgc3R5bGU6ICd3aGl0ZUNvbG9yJyxcbiAgICAgICAgICAgIGJvcmRlcjogWzAsIDAsIDAsIDBdXG4gICAgICAgICAgfSkpLFxuICAgICAgICAgIC4uLm1vZGlmaWVkUm93c1xuICAgICAgICApO1xuICAgICAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgICAgIGZvbnRTaXplOiA4LFxuICAgICAgICAgIHRhYmxlOiB7XG4gICAgICAgICAgICBoZWFkZXJSb3dzOiAxLFxuICAgICAgICAgICAgd2lkdGhzLFxuICAgICAgICAgICAgYm9keTogZnVsbF9ib2R5XG4gICAgICAgICAgfSxcbiAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgIGZpbGxDb2xvcjogaSA9PiAoaSA9PT0gMCA/IENPTE9SUy5QUklNQVJZIDogbnVsbCksXG4gICAgICAgICAgICBoTGluZUNvbG9yOiAoKSA9PiBDT0xPUlMuUFJJTUFSWSxcbiAgICAgICAgICAgIGhMaW5lV2lkdGg6ICgpID0+IDEsXG4gICAgICAgICAgICB2TGluZVdpZHRoOiAoKSA9PiAwXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGROZXdMaW5lKCk7XG4gICAgICAgIGxvZygncmVwb3J0aW5nOnJlbmRlclRhYmxlcycsIGBUYWJsZSByZW5kZXJlZGAsICdkZWJ1ZycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBhZGRUaW1lUmFuZ2VBbmRGaWx0ZXJzKGZyb20sIHRvLCBmaWx0ZXJzLCB0aW1lWm9uZSl7XG4gICAgbG9nKFxuICAgICAgJ3JlcG9ydGluZzpyZW5kZXJUaW1lUmFuZ2VBbmRGaWx0ZXJzJyxcbiAgICAgIGBTdGFydGVkIHRvIHJlbmRlciB0aGUgdGltZSByYW5nZSBhbmQgdGhlIGZpbHRlcnNgLFxuICAgICAgJ2luZm8nXG4gICAgKTtcbiAgICBsb2coXG4gICAgICAncmVwb3J0aW5nOnJlbmRlclRpbWVSYW5nZUFuZEZpbHRlcnMnLFxuICAgICAgYGZyb206ICR7ZnJvbX0sIHRvOiAke3RvfSwgZmlsdGVyczogJHtmaWx0ZXJzfSwgdGltZVpvbmU6ICR7dGltZVpvbmV9YCxcbiAgICAgICdkZWJ1ZydcbiAgICApO1xuICAgIGNvbnN0IGZyb21EYXRlID0gbmV3IERhdGUoXG4gICAgICBuZXcgRGF0ZShmcm9tKS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IHRpbWVab25lIH0pXG4gICAgKTtcbiAgICBjb25zdCB0b0RhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSh0bykudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyB0aW1lWm9uZSB9KSk7XG4gICAgY29uc3Qgc3RyID0gYCR7dGhpcy5mb3JtYXREYXRlKGZyb21EYXRlKX0gdG8gJHt0aGlzLmZvcm1hdERhdGUodG9EYXRlKX1gO1xuXG4gICAgdGhpcy5hZGRDb250ZW50KHtcbiAgICAgIGZvbnRTaXplOiA4LFxuICAgICAgdGFibGU6IHtcbiAgICAgICAgd2lkdGhzOiBbJyonXSxcbiAgICAgICAgYm9keTogW1xuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29sdW1uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHN2ZzogY2xvY2tJY29uUmF3LFxuICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogWzQwLCA1LCAwLCAwXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGV4dDogc3RyIHx8ICctJyxcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogWzQzLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAgIHN0eWxlOiAnd2hpdGVDb2xvckZpbHRlcnMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzdmc6IGZpbHRlckljb25SYXcsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogMTAsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiBbNDAsIDYsIDAsIDBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0ZXh0OiBmaWx0ZXJzIHx8ICctJyxcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogWzQzLCAwLCAwLCAwXSxcbiAgICAgICAgICAgICAgICAgIHN0eWxlOiAnd2hpdGVDb2xvckZpbHRlcnMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgbWFyZ2luOiBbLTQwLCAwLCAtNDAsIDBdLFxuICAgICAgbGF5b3V0OiB7XG4gICAgICAgIGZpbGxDb2xvcjogKCkgPT4gQ09MT1JTLlBSSU1BUlksXG4gICAgICAgIGhMaW5lV2lkdGg6ICgpID0+IDAsXG4gICAgICAgIHZMaW5lV2lkdGg6ICgpID0+IDBcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29udGVudCh7IHRleHQ6ICdcXG4nIH0pO1xuICAgIGxvZyhcbiAgICAgICdyZXBvcnRpbmc6cmVuZGVyVGltZVJhbmdlQW5kRmlsdGVycycsXG4gICAgICAnVGltZSByYW5nZSBhbmQgZmlsdGVycyByZW5kZXJlZCcsXG4gICAgICAnZGVidWcnXG4gICAgKTtcbiAgfVxuICBhZGRWaXN1YWxpemF0aW9ucyh2aXN1YWxpemF0aW9ucywgaXNBZ2VudHMsIHRhYil7XG4gICAgbG9nKFxuICAgICAgJ3JlcG9ydGluZzpyZW5kZXJWaXN1YWxpemF0aW9ucycsXG4gICAgICBgJHt2aXN1YWxpemF0aW9ucy5sZW5ndGh9IHZpc3VhbGl6YXRpb25zIGZvciB0YWIgJHt0YWJ9YCxcbiAgICAgICdpbmZvJ1xuICAgICk7XG4gICAgY29uc3Qgc2luZ2xlX3ZpcyA9IHZpc3VhbGl6YXRpb25zLmZpbHRlcihpdGVtID0+IGl0ZW0ud2lkdGggPj0gNjAwKTtcbiAgICBjb25zdCBkb3VibGVfdmlzID0gdmlzdWFsaXphdGlvbnMuZmlsdGVyKGl0ZW0gPT4gaXRlbS53aWR0aCA8IDYwMCk7XG5cbiAgICBzaW5nbGVfdmlzLmZvckVhY2godmlzdWFsaXphdGlvbiA9PiB7XG4gICAgICBjb25zdCB0aXRsZSA9IHRoaXMuY2hlY2tUaXRsZSh2aXN1YWxpemF0aW9uLCBpc0FnZW50cywgdGFiKTtcbiAgICAgIHRoaXMuYWRkQ29udGVudCh7XG4gICAgICAgIGlkOiAnc2luZ2xldmlzJyArIHRpdGxlWzBdLl9zb3VyY2UudGl0bGUsXG4gICAgICAgIHRleHQ6IHRpdGxlWzBdLl9zb3VyY2UudGl0bGUsXG4gICAgICAgIHN0eWxlOiAnaDMnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYWRkQ29udGVudCh7IGNvbHVtbnM6IFt7IGltYWdlOiB2aXN1YWxpemF0aW9uLmVsZW1lbnQsIHdpZHRoOiA1MDAgfV0gfSk7XG4gICAgICB0aGlzLmFkZE5ld0xpbmUoKTtcbiAgICB9KVxuXG4gICAgbGV0IHBhaXIgPSBbXTtcblxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBkb3VibGVfdmlzKSB7XG4gICAgICBwYWlyLnB1c2goaXRlbSk7XG4gICAgICBpZiAocGFpci5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgY29uc3QgdGl0bGVfMSA9IHRoaXMuY2hlY2tUaXRsZShwYWlyWzBdLCBpc0FnZW50cywgdGFiKTtcbiAgICAgICAgY29uc3QgdGl0bGVfMiA9IHRoaXMuY2hlY2tUaXRsZShwYWlyWzFdLCBpc0FnZW50cywgdGFiKTtcblxuICAgICAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdzcGxpdHZpcycgKyB0aXRsZV8xWzBdLl9zb3VyY2UudGl0bGUsXG4gICAgICAgICAgICAgIHRleHQ6IHRpdGxlXzFbMF0uX3NvdXJjZS50aXRsZSxcbiAgICAgICAgICAgICAgc3R5bGU6ICdoMycsXG4gICAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlkOiAnc3BsaXR2aXMnICsgdGl0bGVfMlswXS5fc291cmNlLnRpdGxlLFxuICAgICAgICAgICAgICB0ZXh0OiB0aXRsZV8yWzBdLl9zb3VyY2UudGl0bGUsXG4gICAgICAgICAgICAgIHN0eWxlOiAnaDMnLFxuICAgICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgIHsgaW1hZ2U6IHBhaXJbMF0uZWxlbWVudCwgd2lkdGg6IDI3MCB9LFxuICAgICAgICAgICAgeyBpbWFnZTogcGFpclsxXS5lbGVtZW50LCB3aWR0aDogMjcwIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkTmV3TGluZSgpO1xuICAgICAgICBwYWlyID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvdWJsZV92aXMubGVuZ3RoICUgMiAhPT0gMCkge1xuICAgICAgY29uc3QgaXRlbSA9IGRvdWJsZV92aXNbZG91YmxlX3Zpcy5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5jaGVja1RpdGxlKGl0ZW0sIGlzQWdlbnRzLCB0YWIpO1xuICAgICAgdGhpcy5hZGRDb250ZW50KHtcbiAgICAgICAgY29sdW1uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnc3BsaXRzaW5nbGV2aXMnICsgdGl0bGVbMF0uX3NvdXJjZS50aXRsZSxcbiAgICAgICAgICAgIHRleHQ6IHRpdGxlWzBdLl9zb3VyY2UudGl0bGUsXG4gICAgICAgICAgICBzdHlsZTogJ2gzJyxcbiAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5hZGRDb250ZW50KHsgY29sdW1uczogW3sgaW1hZ2U6IGl0ZW0uZWxlbWVudCwgd2lkdGg6IDI4MCB9XSB9KTtcbiAgICAgIHRoaXMuYWRkTmV3TGluZSgpO1xuICAgIH1cbiAgfVxuICBmb3JtYXREYXRlKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICAgIGxvZygncmVwb3J0aW5nOmZvcm1hdERhdGUnLCBgRm9ybWF0IGRhdGUgJHtkYXRlfWAsICdpbmZvJyk7XG4gICAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXRlKCk7XG4gICAgY29uc3QgaG91cnMgPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgY29uc3QgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xuICAgIGNvbnN0IHNlY29uZHMgPSBkYXRlLmdldFNlY29uZHMoKTtcbiAgICBjb25zdCBzdHIgPSBgJHt5ZWFyfS0ke21vbnRoIDwgMTAgPyAnMCcgKyBtb250aCA6IG1vbnRofS0ke1xuICAgICAgZGF5IDwgMTAgPyAnMCcgKyBkYXkgOiBkYXlcbiAgICB9VCR7aG91cnMgPCAxMCA/ICcwJyArIGhvdXJzIDogaG91cnN9OiR7XG4gICAgICBtaW51dGVzIDwgMTAgPyAnMCcgKyBtaW51dGVzIDogbWludXRlc1xuICAgIH06JHtzZWNvbmRzIDwgMTAgPyAnMCcgKyBzZWNvbmRzIDogc2Vjb25kc31gO1xuICAgIGxvZygncmVwb3J0aW5nOmZvcm1hdERhdGUnLCBgc3RyOiAke3N0cn1gLCAnZGVidWcnKTtcbiAgICByZXR1cm4gc3RyO1xuICB9XG4gIGNoZWNrVGl0bGUoaXRlbSwgaXNBZ2VudHMsIHRhYikge1xuICAgIGxvZyhcbiAgICAgICdyZXBvcnRpbmc6Y2hlY2tUaXRsZScsXG4gICAgICBgSXRlbSBJRCAke2l0ZW0uaWR9LCBmcm9tICR7XG4gICAgICAgIGlzQWdlbnRzID8gJ2FnZW50cycgOiAnb3ZlcnZpZXcnXG4gICAgICB9IGFuZCB0YWIgJHt0YWJ9YCxcbiAgICAgICdpbmZvJ1xuICAgICk7XG5cbiAgICBjb25zdCB0aXRsZSA9IGlzQWdlbnRzXG4gICAgICA/IEFnZW50c1Zpc3VhbGl6YXRpb25zW3RhYl0uZmlsdGVyKHYgPT4gdi5faWQgPT09IGl0ZW0uaWQpXG4gICAgICA6IE92ZXJ2aWV3VmlzdWFsaXphdGlvbnNbdGFiXS5maWx0ZXIodiA9PiB2Ll9pZCA9PT0gaXRlbS5pZCk7XG4gICAgcmV0dXJuIHRpdGxlO1xuICB9XG5cbiAgYWRkU2ltcGxlVGFibGUoe2NvbHVtbnMsIGl0ZW1zLCB0aXRsZX06IHtjb2x1bW5zOiAoe2lkOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmd9KVtdLCB0aXRsZT86IChzdHJpbmcgfCB7dGV4dDogc3RyaW5nLCBzdHlsZTogc3RyaW5nfSksIGl0ZW1zOiBhbnlbXX0pe1xuXG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICB0aGlzLmFkZENvbnRlbnQodHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJyA/IHsgdGV4dDogdGl0bGUsIHN0eWxlOiAnaDQnIH0gOiB0aXRsZSlcbiAgICAgICAgLmFkZE5ld0xpbmUoKTtcbiAgICB9XG4gIFxuICAgIGlmICghaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgdGhpcy5hZGRDb250ZW50KHtcbiAgICAgICAgdGV4dDogJ05vIHJlc3VsdHMgbWF0Y2ggeW91ciBzZWFyY2ggY3JpdGVyaWEnLFxuICAgICAgICBzdHlsZTogJ3N0YW5kYXJkJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZUhlYWRlciA9IGNvbHVtbnMubWFwKGNvbHVtbiA9PiB7XG4gICAgICByZXR1cm4geyB0ZXh0OiBjb2x1bW4ubGFiZWwsIHN0eWxlOiAnd2hpdGVDb2xvcicsIGJvcmRlcjogWzAsIDAsIDAsIDBdIH07XG4gICAgfSk7XG5cbiAgICBjb25zdCB0YWJsZVJvd3MgPSBpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoY29sdW1uID0+IHtcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlID0gaXRlbVtjb2x1bW4uaWRdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRleHQ6IHR5cGVvZiBjZWxsVmFsdWUgIT09ICd1bmRlZmluZWQnID8gY2VsbFZhbHVlIDogJy0nLFxuICAgICAgICAgIHN0eWxlOiAnc3RhbmRhcmQnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSk7XG4gIFxuICAgIGNvbnN0IHdpZHRocyA9IG5ldyBBcnJheShjb2x1bW5zLmxlbmd0aCAtIDEpLmZpbGwoJ2F1dG8nKTtcbiAgICB3aWR0aHMucHVzaCgnKicpO1xuICBcbiAgICB0aGlzLmFkZENvbnRlbnQoe1xuICAgICAgZm9udFNpemU6IDgsXG4gICAgICB0YWJsZToge1xuICAgICAgICBoZWFkZXJSb3dzOiAxLFxuICAgICAgICB3aWR0aHMsXG4gICAgICAgIGJvZHk6IFt0YWJsZUhlYWRlciwgLi4udGFibGVSb3dzXVxuICAgICAgfSxcbiAgICAgIGxheW91dDoge1xuICAgICAgICBmaWxsQ29sb3I6IGkgPT4gKGkgPT09IDAgPyBDT0xPUlMuUFJJTUFSWSA6IG51bGwpLFxuICAgICAgICBoTGluZUNvbG9yOiAoKSA9PiBDT0xPUlMuUFJJTUFSWSxcbiAgICAgICAgaExpbmVXaWR0aDogKCkgPT4gMSxcbiAgICAgICAgdkxpbmVXaWR0aDogKCkgPT4gMFxuICAgICAgfVxuICAgIH0pLmFkZE5ld0xpbmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZExpc3Qoe3RpdGxlLCBsaXN0fToge3RpdGxlOiBzdHJpbmcgfCB7dGV4dDogc3RyaW5nLCBzdHlsZTogc3RyaW5nfSwgbGlzdDogKHN0cmluZyB8IHt0ZXh0OiBzdHJpbmcsIHN0eWxlOiBzdHJpbmd9KVtdfSl7XG4gICAgcmV0dXJuIHRoaXNcbiAgICAgIC5hZGRDb250ZW50V2l0aE5ld0xpbmUodHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJyA/IHt0ZXh0OiB0aXRsZSwgc3R5bGU6ICdoMid9IDogdGl0bGUpXG4gICAgICAuYWRkQ29udGVudCh7dWw6IGxpc3QuZmlsdGVyKGVsZW1lbnQgPT4gZWxlbWVudCl9KVxuICAgICAgLmFkZE5ld0xpbmUoKTtcbiAgfVxuXG4gIGFkZE5ld0xpbmUoKXtcbiAgICByZXR1cm4gdGhpcy5hZGRDb250ZW50KHt0ZXh0OiAnXFxuJ30pO1xuICB9XG5cbiAgYWRkQ29udGVudFdpdGhOZXdMaW5lKHRpdGxlOiBhbnkpe1xuICAgIHJldHVybiB0aGlzLmFkZENvbnRlbnQodGl0bGUpLmFkZE5ld0xpbmUoKTtcbiAgfVxuXG4gIGFzeW5jIHByaW50KHBhdGg6IHN0cmluZyl7XG4gICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9wcmludGVyLmNyZWF0ZVBkZktpdERvY3VtZW50KHsuLi5wYWdlQ29uZmlndXJhdGlvbiwgY29udGVudDogdGhpcy5fY29udGVudH0pO1xuICAgIGF3YWl0IGRvY3VtZW50LnBpcGUoXG4gICAgICBmcy5jcmVhdGVXcml0ZVN0cmVhbShwYXRoKVxuICAgICk7XG4gICAgZG9jdW1lbnQuZW5kKCk7XG4gIH1cbn0iXX0=