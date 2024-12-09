import { getAngularModule } from '../../kibana-services';
import { LogStatementsController } from './logStatements';
import { AdminLoginlog } from './admin-loginlog';
import { AdminOperationlog } from './admin-operationlog';
import { SystemRunLog } from './system-run-log';

const app = getAngularModule();

app
	.controller('logStatementsController', LogStatementsController)
  .value('AdminLoginlog', AdminLoginlog)
  .value('AdminOperationlog', AdminOperationlog)
  .value('SystemRunLog', SystemRunLog)