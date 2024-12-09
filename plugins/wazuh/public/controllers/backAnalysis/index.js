import { getAngularModule } from '../../kibana-services';
import { BackAnalysisController } from './backAnalysisController';
import { ThreatBack } from './threat-back';

const app = getAngularModule();

app
	.controller('BackAnalysisController', BackAnalysisController)
	.value('ThreatBack', ThreatBack)