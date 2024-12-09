import { AppState } from '../../react-services/app-state';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { getDataPlugin, getUiSettings } from '../../kibana-services';

export class BackAnalysisController {
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
		this.commonData = commonData;
		this.wazuhConfig = new WazuhConfig();
    this.$window = $window;
		
		this.isAgent = false;
		
		this.threatBackAgent = '';
		this.threatBackSelectAlert = false;
  }

	/**
   * On controller loads
   */
	async $onInit() {
		this.init = true;
		this.loading = true;

		// this.tab = this.commonData.checkTabLocation(); // 溯源分析的模块名
		// this.tabView = this.commonData.checkTabViewLocation(); // 模块下的具体页面名

		//Props
		this.threatBackProps = {
			isAgent: this.threatBackAgent,
			agentsSelectionProps: {
        setAgent: async agentList => {
          this.updateThreatBackAgentSelectedAgents(agentList)
        },
      },
			threatBackSelectAlert: this.threatBackSelectAlert,
			changeThreatBackSelectAlert: (alert) => {
				this.changeThreatBackSelectAlert(alert);
			},
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

	updateThreatBackAgentSelectedAgents(agentList) {
		this.threatBackAgent = agentList ? agentList[0] : false;
		this.threatBackProps.isAgent = agentList ? agentList[0] : false;
		this.$scope.$applyAsync();
	}

	changeThreatBackSelectAlert(alert) {
    this.threatBackSelectAlert = alert;
		this.threatBackProps.threatBackSelectAlert = alert;
		this.$scope.$applyAsync();
  }
}