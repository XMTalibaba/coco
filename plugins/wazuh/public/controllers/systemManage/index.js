import { getAngularModule } from '../../kibana-services';
import { SystemManageController } from './systemManage';
import { SystemParam } from './system-param';
import { LicenseManage } from './license-manage';
import { SystemStatus } from './system-status';
import { UserManage } from './user-manage';

import { DepartmentManage } from './department-manage';
import { ManagerAddr } from './manager-addr';
import { ManagerMsl } from './manager-msl';
import { ManagerSearch } from './manager-search';
import { ManagerEmail } from './manager-email';
const app = getAngularModule();

app
	.controller('systemManageController', SystemManageController)
  .value('SystemParam', SystemParam)
  .value('LicenseManage', LicenseManage)
  .value('SystemStatus', SystemStatus)
  .value('UserManage', UserManage)
  .value('ManagerSearch', ManagerSearch)
  .value('DepartmentManage', DepartmentManage)
  .value('ManagerAddr', ManagerAddr)
  .value('ManagerMsl', ManagerMsl)
  .value('ManagerEmail', ManagerEmail)