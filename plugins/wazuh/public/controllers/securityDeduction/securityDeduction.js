export class SecurityDeductionController {
  constructor(
    $scope,
  ) {
    this.$scope = $scope;
  }

	/**
   * On controller loads
   */
	async $onInit() {
		this.init = true;
		this.loading = true;

		//Props
    this.bruteForceProps = {};
    this.SQLInjectionProps = {};
    this.shellshockProps = {};
		this.riskServiceProps = {};

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
}