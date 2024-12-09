import { AppState } from '../../react-services/app-state';
import { version } from '../../../package.json';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { WzRequest } from '../../react-services/wz-request';

export class AssetsController {
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
		this.batchDeploymentType = 'list';
  }

	/**
   * On controller loads
   */
	 async $onInit() {
		this.init = true;
    this.api = JSON.parse(AppState.getCurrentAPI()).id;

		this.isClusterEnabled =
      AppState.getClusterInfo() &&
      AppState.getClusterInfo().status === 'enabled';

		this.loading = true;
    this.batchDeployment = false;

    const summaryData = await WzRequest.apiReq('GET', '/agents/summary/status', {});
    this.summary = summaryData.data.data;
    if (this.summary.total === 0) {
      // if (this.addingNewAgent === undefined) {
      //   this.addNewAgent(true);
      // }
      this.hasAgents = false;
    } else {
      this.hasAgents = true;
    }

    this.init = false;

    //Props
    this.installToolsProps = {
      addingNewAgent: () => {
        this.addNewAgent(true);
        this.$scope.$applyAsync();
      },
      toBatchDeployment: () => {
        this.batchDeploymentChange(true);
        this.$scope.$applyAsync();
      }
    };
    this.probeDownloadProps = {
      addNewAgent: flag => this.addNewAgent(flag),
      hasAgents: this.hasAgents,
      reload: () => this.$route.reload(),
      getWazuhVersion: () => this.getWazuhVersion(),
      getCurrentApiAddress: () => this.getCurrentApiAddress()
    };
    this.hasAgents = true;

    this.batchDeploymentProps = {
      changeBatchDeploymentType: (type) => {
				this.changeBatchDeploymentType(type);
        this.$scope.$applyAsync();
			},
      batchDeploymentChange: flag => this.batchDeploymentChange(flag),
			batchDeploymentType: this.batchDeploymentType
    }

    this.softwareAppProps = {};
    this.systemAccountProps = {};
    this.systemPortProps = {};
    this.patchDistributionProps = {};
		this.planTasksProps = {};
    this.connectionRecordProps = {};
    this.agentVersionProps = {};

		//Load
		this.load();
	 }

	 /**
   * On controller loads
   */
	async load() {
		this.loading = false;
		this.$scope.$applyAsync();
	}

  addNewAgent(flag) {
    this.addingNewAgent = flag;
  }
  batchDeploymentChange(flag) {
    this.batchDeployment = flag;
  }
  changeBatchDeploymentType(flag) {
    this.batchDeploymentType = flag;
    this.batchDeploymentProps.batchDeploymentType = flag;
  }

  /**
   * Returns the current API address
   */
   async getCurrentApiAddress() {
    try {
      const result = await this.genericReq.request('GET', '/hosts/apis');
      const entries = result.data || [];
      const host = entries.filter(e => {
        return e.id == this.api;
      });
      const url = host[0].url;
      const numToClean = url.startsWith('https://') ? 8 : 7;
      return url.substr(numToClean);
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns the Wazuh version as x.y.z
   */
  async getWazuhVersion() {
    try {
      const data = await WzRequest.apiReq('GET', '//', {});
      const result = ((data || {}).data || {}).data || {};
      return result.api_version
    } catch (error) {
      return version;
    }
  }
}