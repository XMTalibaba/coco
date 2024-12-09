import { AssetsController } from './assets';
import { ManageTool } from './manage-tool';

import { ProbeDownload } from './probe-download';
import { BatchDeployment } from './batch-deployment';
import { SoftwareApp } from './software-app';
import { SystemAccount } from './system-account';
import { SystemPort } from './system-port';
import { PatchDistribution } from './patch-distribution';
import { getAngularModule } from '../../kibana-services';
import { PlanTasks } from './plan-tasks';
import { ConnectionRecord } from './connection-record';
import { AgentVersion } from './agent-version';

const app = getAngularModule();

app
	.controller('assetsController', AssetsController)
  .value('ManageTool', ManageTool)
  .value('ProbeDownload', ProbeDownload)
  .value('BatchDeployment', BatchDeployment)
  .value('SoftwareApp', SoftwareApp)
  .value('SystemAccount', SystemAccount)
  .value('SystemPort', SystemPort)
  .value('PatchDistribution', PatchDistribution)
  .value('PlanTasks', PlanTasks)
  .value('ConnectionRecord', ConnectionRecord)
  .value('AgentVersion', AgentVersion)
