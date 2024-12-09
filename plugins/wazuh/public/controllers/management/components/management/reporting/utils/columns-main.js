import React from 'react';
import { EuiToolTip, EuiButtonIcon } from '@elastic/eui';
import ReportingHandler from './reporting-handler';
import moment from 'moment-timezone';
import { WzButtonPermissions } from '../../../../../../components/common/permissions/button';
import { WAZUH_ROLE_ADMINISTRATOR_NAME } from '../../../../../../../common/constants';
import { getHttp, getUiSettings } from '../../../../../../kibana-services';
import { formatUIDate } from '../../../../../../react-services/time-service';
export default class ReportingColums {
  constructor(tableProps) {
    this.tableProps = tableProps;
    this.reportingHandler = ReportingHandler;

    this.buildColumns = () => {
      this.columns = [
        {
          field: 'name',
          name: '文件',
          align: 'left',
          sortable: true
        },
        {
          field: 'size',
          name: '大小',
          render: size => {
            const fixedSize = size / 1024;
            return `${fixedSize.toFixed(2)}KB`;
          },
          sortable: true
        },
        {
          field: 'date',
          name: '创建',
          render: value => formatUIDate(value),
          sortable: true
        }
      ];
      this.columns.push({
        name: '操作',
        align: 'left',
        render: item => {
          return (
            <div>
              <EuiToolTip position="top" content={`下载报告`}>
                <EuiButtonIcon
                  aria-label="下载报告"
                  iconType="importAction"
                  onClick={() => this.goReport(item.name)}
                  color="primary"
                />
              </EuiToolTip>

              <WzButtonPermissions
                buttonType='icon'
                // roles={[WAZUH_ROLE_ADMINISTRATOR_NAME]}
                aria-label="删除报告"
                iconType="trash"
                tooltip={{position: 'top', content: '删除报告'}}
                onClick={async () => {
                  this.tableProps.updateListItemsForRemove([item]);
                  this.tableProps.updateShowModal(true);
                }}
                color="danger"
                isDisabled={item.name === 'default'}
              />
            </div>
          );
        }
      });
    };

    this.buildColumns();
  }

  /**
   * Downloads the report
   * @param {*} name The name of the report
   */
  goReport(name) {
    window.open(getHttp().basePath.prepend(`/reports/${name}`), '_blank');
  }

  /**
   * Returns given date adding the timezone offset
   * @param {string} date Date
   */
  offset(d) {
    try {
      const dateUTC = moment.utc(d);
      const kibanaTz = getUiSettings().get('dateFormat:tz');
      const dateLocate =
        kibanaTz === 'Browser'
          ? moment(dateUTC).local()
          : moment(dateUTC).tz(kibanaTz);
      return dateLocate.format('YYYY/MM/DD HH:mm:ss');
    } catch (error) {
      throw new Error(error);
    }
  }
}
