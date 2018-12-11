'use strict';

const fs = require('fs');
const path = require('path');
const findRoot = require('find-root');
const Funnel = require('broccoli-funnel');
const debugTree = require('broccoli-debug').buildDebugCallback(`ember-addon-viewer:${this.name}`);
const writeFile = require('broccoli-file-creator');
const BroccoliMergeTrees = require('broccoli-merge-trees');
const defaultAddons = ['ember-addon-viewer', '@ember/jquery', 'ember-cli-babel', '@ember/optional-features', 'broccoli-asset-rev', 'ember-ajax', 'ember-cli-dependency-checker', 'ember-cli-eslint', 'ember-cli-htmlbars', 'ember-cli-htmlbars-inline-precompile', 'ember-cli-inject-live-reload', 'ember-cli-sri', 'ember-cli-template-lint', 'ember-cli-uglify', 'ember-disable-prototype-extensions', 'ember-export-application-global', 'ember-load-initializers', 'ember-maybe-import-regenerator', 'ember-qunit', 'ember-resolver', 'ember-source', 'ember-try', 'loader.js', 'qunit-dom'];

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);
    
    if (this._shouldIncludeViewer()) {
      this.import('vendor/ember-addon-viewer/base.css');
    }
  },

  treeForApp(tree) {
    let appTree = this._super(tree);

    if (this._shouldIncludeViewer()) {
      appTree = new Funnel(appTree, {
        include: [
          '**/instance-initializers/ember-addon-viewer.js',
          '**/application-addon-viewer/**/*'
        ]
      });

      let dataTree = this._generateDataTree();
      let newTree = new BroccoliMergeTrees([appTree, dataTree]);
  
      return debugTree(newTree, 'tree-for-app');
    }

    return appTree;
  },

  _shouldIncludeViewer() {
    let envConfig = this.parent.config(process.env.EMBER_ENV)[this.name];
    let shouldOverrideDefault = envConfig !== undefined && envConfig.shouldIncludeViewer !== undefined;
    return shouldOverrideDefault ? envConfig.shouldIncludeViewer : process.env.EMBER_ENV !== 'production';
  },

  _generateDataTree() {
    let rawPkg = fs.readFileSync(path.join(this.project.root, 'package.json'));
    let packageJson = JSON.parse(rawPkg.toString());
    let deps = Object.keys(packageJson.dependencies) || [];
    let devDeps = Object.keys(packageJson.devDependencies) || [];
    let libraries = deps.concat(devDeps);
    let addonPackages = libraries.map((key) => {
      let libPath = require.resolve(key);
      let rootPath = findRoot(libPath);
      let pkgBuffer = fs.readFileSync(path.join(rootPath, 'package.json'));
      let pkg = JSON.parse(pkgBuffer.toString());
      return pkg;
    }).filter((pkg) => {
      let isAddon = pkg && pkg.keywords && pkg.keywords.includes('ember-addon');
      let notDefaultAddon = !defaultAddons.includes(pkg.name);
      
      return isAddon && notDefaultAddon;
    }).map((pkg) => {
      return {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        repository: pkg.repository && pkg.repository.url,
        homepage: pkg.homepage,
        issues: pkg.bugs && pkg.bugs.url,
        author: pkg.author && pkg.author.name,
        config: pkg['ember-addon']
      }
    });

    let content = `export default ${JSON.stringify(addonPackages)};`;

    return writeFile('addon-data.js', content);
  }
};
