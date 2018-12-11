import Controller from '@ember/controller';
import { A } from '@ember/array';
import data from '../addon-data';

export default Controller.extend({
  data,

  init() {
    this._super(...arguments);
    let data = A(this.data);
    let sorted = A(data.sortBy('name'));

    this.set('addons', sorted);
    this.set('filteredAddons', A([...sorted]));
    this.set('uniqueAuthors', A(A(sorted.mapBy('author')).uniq()));
  },

  actions: {
    filter(query) {
      let filtered;

      if (query) {
        filtered = A(this.addons.filter(addon => addon.name.includes(query)));
      } else {
        filtered = A([...this.addons]);
      }

      this.set('filteredAddons', filtered);
      this.set('uniqueAuthors', A(A(filtered.mapBy('author')).uniq()));
    }
  }
});