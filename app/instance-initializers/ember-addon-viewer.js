import Router from '../router';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const AddonViewerApplicationRoute = Route.extend({
  router: service('-routing'),

  renderTemplate() {
    this.render('applicationAddonViewer', {
      controller: this.controllerFor('applicationAddonViewer')
    });
  }
});

export function initialize(appInstance) {
  let fastboot = appInstance.lookup('service:fastboot');
  let fastbootIsInstalled = fastboot;
  let fastbootIsNotInstalled = !fastboot;
  let notUsingFastboot = fastbootIsNotInstalled || (fastbootIsInstalled && !fastboot.get('isFastBoot'));
  let router = appInstance.lookup('service:router')._router;
  let initialURL = router.initialURL || ((window && window.location) ? window.location.href : ''); // fastboot guard :/

  if (notUsingFastboot && initialURL.match('/addon-viewer')) {
    appInstance.register('route:application', AddonViewerApplicationRoute);
    Router.map(function() {
      this.route('addon-viewer');
    });
  }
}

export default {
  initialize
};