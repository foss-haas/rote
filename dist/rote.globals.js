(function(root){
var module = {exports: {}};
(function(require, exports, module) {
/*jshint es3: true */
/*global module */
'use strict';
module.exports = createRouter;

function createRouter(trailing) {
  function resolve(path) {
    resolve.resolve(path);
  }
  resolve.trailing = Boolean(trailing);
  resolve.routeMap = {};
  resolve.routeNames = {};
  for (var key in createRouter.methods) {
    if (!createRouter.methods.hasOwnProperty(key)) continue;
    resolve[key] = createRouter.methods[key];
  }
  return resolve;
}

createRouter.methods = {
  parse: function parse(path) {
    var trailing = this.trailing && path.charAt(path.length - 1) === '/';
    var tokens = path.split('/').filter(Boolean);
    if (trailing) tokens.push('/');
    return tokens;
  },
  reverse: function reverse(name, params, splat) {
    var route = this.routeNames[name];
    if (!route) return null;
    if (route.params.length && !params) {
      throw new Error(
        'Route "' + name + '" expects the following parameters: ' +
        route.params.join(', ')
      );
    }
    var tokens = this.parse(route.path);
    if (tokens[tokens.length - 1] === '*') {
      if (!splat) throw new Error('Unmet wildcard.');
    } else if (splat) throw new Error('Route does not take a wildcard.');
    return '/' + tokens.map(function (token) {
      if (token.charAt(0) === ':') {
        token = token.slice(1);
        if (!params[token]) throw new Error('Mising parameter: ' + token);
        return params[token];
      }
      if (token === '*') return splat;
      if (token === '/') return '';
      return token;
    }).join('/');
  },
  add: function add(path, fn, name) {
    var route = {
      name: name,
      path: path,
      fn: fn,
      params: []
    };
    if (name) {
      if (!this.routeNames.hasOwnProperty(name)) this.routeNames[name] = route;
      else throw new Error('Route "' + name + '" already exists.');
    }
    var tokens = this.parse(path);
    var map = this.routeMap;
    if (tokens[tokens.length - 1] !== '*') tokens.push(null);
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token !== '/' && token !== '*') {
        if (token === null) {
          token = '$';
        } else if (token.charAt(0) === ':') {
          var key = token.slice(0);
          if (!key || key === '*') throw new Error('Invalid parameter name.');
          route.params.push(key);
          token = ':';
        } else {
          token = '"' + token;
        }
      }
      if (i === tokens.length - 1) {
        if (token !== '*' && token !== '$') throw new Error('Parser is drunk.');
        if (!map[token]) map[token] = [];
        map[token].push(route);
        break;
      }
      if (token === '*') throw new Error('Only trailing wildcards are supported.');
      if (!map[token]) map[token] = {'^': map};
      map = map[token];
    }
    return this;
  },
  resolve: function resolve(/* path */) {
    // var match = {
    //   fn: null,
    //   name: null,
    //   params: {},
    //   splat: null
    //   next: null,
    // };
  }
};
}(function(key){return root[key];}, module.exports, module));
root.rote = module.exports;
}(this));