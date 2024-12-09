import { AppState } from '../../react-services/app-state';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { getDataPlugin, getUiSettings } from '../../kibana-services';

export class HostProtectionController {
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
		this.microStrategyType = 'list';
		this.policyManageType = 'list';
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
		this.blackWhitelistProps = {};
		this.microStrategyProps = {
			changeMicroStrategyTypes: (type) => {
				this.changeMicroStrategyTypes(type);
        this.$scope.$applyAsync();
			},
			microStrategyType: this.microStrategyType
		}
		this.policyManageProps = {
			changePolicyManageTypes: (type) => {
				this.changePolicyManageTypes(type);
        this.$scope.$applyAsync();
			},
			policyManageType: this.policyManageType
		};

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

	changeMicroStrategyTypes(flag) {
    this.microStrategyType = flag;
		this.microStrategyProps.microStrategyType = flag;
  }

	changePolicyManageTypes(flag) {
    this.policyManageType = flag;
		this.policyManageProps.policyManageType = flag;
  }
}