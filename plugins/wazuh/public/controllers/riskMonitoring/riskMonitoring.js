import { AppState } from '../../react-services/app-state';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { getDataPlugin, getUiSettings } from '../../kibana-services';
import store from '../../redux/store';

export class RiskMonitoringController {
  constructor(
    $scope,
    $location,
    $route,
    errorHandler,
    csvReq,
    commonData,
    $window
  ) {
    this.$scope = $scope;
    this.$location = $location;
    this.$route = $route;
		this.wazuhConfig = new WazuhConfig();
    this.$window = $window;
		this.maliciousProgramsAgent = '';
  }

	/**
   * On controller loads
   */
	async $onInit() {
		this.init = true;
		this.api = JSON.parse(AppState.getCurrentAPI()).id;
		const loc = this.$location.search();
		this.isClusterEnabled =
			AppState.getClusterInfo() &&
			AppState.getClusterInfo().status === 'enabled';

		this.loading = true;

		//Props
		this.maliciousProgramsProps = {}
		this.vulnDetectionProps = {}

		//Load
		this.load();
	}

	 /**
   * On controller loads
   */
	async load() {
		const clusterInfo = AppState.getClusterInfo();
		this.firstUrlParam =
			clusterInfo.status === 'enabled' ? 'cluster' : 'manager';
		this.secondUrlParam = clusterInfo[this.firstUrlParam];
		this.pattern = (await getDataPlugin().indexPatterns.get(AppState.getCurrentPattern())).title;

		this.loading = false;
		this.$scope.$applyAsync();
	}

	updateMaliciousProgramsSelectedAgents(agentList) {
		this.maliciousProgramsAgent = agentList ? agentList[0] : false;
		this.maliciousProgramsProps.isAgent = agentList ? agentList[0] : false;
		this.$scope.$applyAsync();
	}
}