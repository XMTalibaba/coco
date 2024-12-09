import { getAngularModule } from '../../kibana-services';
import { HomeOverviewController } from './homeOverview';
import { Workbench } from './workbench';

const app = getAngularModule();

app
	.controller('homeOverviewController', HomeOverviewController)
  .value('Workbench', Workbench)