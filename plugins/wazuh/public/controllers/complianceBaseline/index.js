import { getAngularModule } from '../../kibana-services';
import { ComplianceBaselineController } from './complianceBaseline';
import { BaselineCheck } from './baseline-check';
import { BaselineTemplate } from './baseline-template';
import { BaselinePolicy } from './baseline-policy';
const app = getAngularModule();

app
	.controller('complianceBaselineController', ComplianceBaselineController)
  .value('BaselineCheck', BaselineCheck)
  .value('BaselineTemplate', BaselineTemplate)
  .value('BaselinePolicy', BaselinePolicy)