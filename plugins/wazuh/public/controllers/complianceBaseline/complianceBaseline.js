export class ComplianceBaselineController {
  constructor(
    $scope,
    $location,
    $route,
    $window
  ) {
    this.$scope = $scope;
    this.$location = $location;
    this.$route = $route;
    this.$window = $window;
  }

	/**
   * On controller loads
   */
	async $onInit() {
		this.init = true;
		this.loading = true;

		//Props
		this.baselineCheckProps = {};
		this.baselineTemplateProps = {};

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