import { getAngularModule } from '../../kibana-services';
import { SecurityDeductionController} from './securityDeduction';
import { BruteForce } from './brute-force';
import { SQLInjection } from './SQL-injection';
import { Shellshock } from './shellshock';
import { RiskService } from './risk-service';
import { BlackmailVirus } from './blackmail-virus';

const app = getAngularModule();

app
	.controller('securityDeductionController', SecurityDeductionController)
  .value('BruteForce', BruteForce)
  .value('SQLInjection', SQLInjection)
  .value('Shellshock', Shellshock)
  .value('RiskService', RiskService)
  .value('BlackmailVirus', BlackmailVirus)