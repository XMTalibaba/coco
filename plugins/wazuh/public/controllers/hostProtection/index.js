import { getAngularModule } from '../../kibana-services';
import { HostProtectionController } from './hostProtection';
import { BlackWhitelist } from './black-whitelist';
import { MicroStrategy } from './micro-strategy';
import { PolicyManage } from './policy-manage';

const app = getAngularModule();

app
	.controller('hostProtectionController', HostProtectionController)
  .value('BlackWhitelist', BlackWhitelist)
  .value('MicroStrategy', MicroStrategy)
  .value('PolicyManage', PolicyManage)
