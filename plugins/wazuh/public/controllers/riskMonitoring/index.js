import { getAngularModule } from '../../kibana-services';
import { RiskMonitoringController } from './riskMonitoring';
import { VulnDetection } from './vuln-detection';

const app = getAngularModule();

app
	.controller('riskMonitoringController', RiskMonitoringController)
  .value('VulnDetection', VulnDetection)