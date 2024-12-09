import { getAngularModule } from '../../kibana-services';
import { SafetyCheckupController } from './safetyCheckup';
import { CheckupPolicy } from './checkup-policy';
import { CheckupList } from './checkup-list';
const app = getAngularModule();

app
	.controller('safetyCheckupController', SafetyCheckupController)
  .value('CheckupPolicy', CheckupPolicy)
  .value('CheckupList', CheckupList)