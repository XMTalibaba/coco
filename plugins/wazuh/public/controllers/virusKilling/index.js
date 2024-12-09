import { getAngularModule } from '../../kibana-services';
import { VirusKillingController } from './virusKilling';
import { KillingStrategy } from './killing-strategy';
import { KillLog } from './kill-log';
const app = getAngularModule();

app
	.controller('virusKillingController', VirusKillingController)
  .value('KillingStrategy', KillingStrategy)
  .value('KillLog', KillLog)