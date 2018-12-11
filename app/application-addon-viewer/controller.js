import Controller from '@ember/controller';
import data from '../addon-data';

export default Controller.extend({
  data,

  init() {
    this._super(...arguments);
    let data = this.data;
    this.set('addons', data.sortBy('name'));
  }
});