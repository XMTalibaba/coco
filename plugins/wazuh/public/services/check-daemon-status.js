import store from '../redux/store';
import { updateWazuhNotReadyYet } from '../redux/actions/appStateActions';
import { WzRequest } from '../react-services/wz-request';

export class CheckDaemonsStatus {
  constructor($rootScope, $timeout) {
    this.$rootScope = $rootScope;
    this.tries = 10;
    this.$timeout = $timeout;
    this.busy = false;
  }

  async makePing() {
    try {
      if (this.busy) return;

      this.busy = true;

      let isValid = false;
      while (this.tries--) {
        await this.$timeout(1200);
        const result = await WzRequest.apiReq('GET', '/ping', {});
        isValid = ((result || {}).data || {}).isValid;
        if (isValid) {
          const updateNotReadyYet = updateWazuhNotReadyYet(false);
          store.dispatch(updateNotReadyYet);

          this.$rootScope.wazuhNotReadyYet = false;
          this.$rootScope.$applyAsync();
          break;
        }
      }

      if (!isValid) {
        throw new Error('未恢复');
      }

      this.tries = 10;
    } catch (error) {
      this.tries = 10;

      const updateNotReadyYet = updateWazuhNotReadyYet(
        '应用程序无法恢复。'
      );
      store.dispatch(updateNotReadyYet);

      this.$rootScope.wazuhNotReadyYet = '应用程序无法恢复。';
      this.$rootScope.$applyAsync();
    }

    this.busy = false;
  }
}
