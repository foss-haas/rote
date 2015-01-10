# Synopsis

**rote** is a simple routing library for the browser and the server.

[![license - MIT](https://img.shields.io/npm/l/rote.svg)](http://foss-haas.mit-license.org) [![Dependencies](https://img.shields.io/david/foss-haas/rote.svg)](https://david-dm.org/foss-haas/rote)

[![NPM status](https://nodei.co/npm/rote.png?compact=true)](https://www.npmjs.com/package/rote)

[![Build status](https://img.shields.io/travis/foss-haas/rote.svg)](https://travis-ci.org/foss-haas/rote) [![Coverage status](https://img.shields.io/coveralls/foss-haas/rote.svg)](https://coveralls.io/r/foss-haas/rote?branch=master) [![Codacy rating](https://img.shields.io/codacy/235d77e8bfe041c8b1bb63e1c1b50d65.svg)](https://www.codacy.com/public/me_4/rote)

# Install

## With NPM

```sh
npm install rote
```

## From source

```sh
git clone https://github.com/foss-haas/rote.git
cd rote
npm install
npm run dist
```

# Usage example

```js
var router = require('rote')();

router.add('/:foo/:bar', views.fooBar, 'foo.bar');
var path = router.reverse('foo.bar', {foo: 'lorem', bar: 'ipsum'});
// => "/lorem/ipsum"
router.add('/:foo/:qux', views.fooQux);
var route = router.resolve('/hello/world');
/* => {
    "fn": views.fooBar,
    "name": "foo.bar",
    "params": {
        "foo": "hello",
        "bar": "world"
    },
    splat: null,
    next: function () {...}
} */
route = route.next();
/* => {
    "fn": views.fooQux,
    "name": null,
    "params": {
        "foo": "hello",
        "qux": "world"
    },
    splat: null,
    next: function () {...}
} */
route = route.next();
// => null
```

# API

## rote([trailingSlashes:Boolean]):Router

Creates a new router.

If `trailingSlashes` is set to `true`, the router will respect trailing slashes when resolving or reversing routes. Otherwise they will be stripped.

## router.add(path, fn[, name]):self

Adds a route for the given path to the router's routing map.

If `name` is not empty, the route can also be reversed. If a route with the given `name` has already been added to the router, an error will be thrown instead.

The `path` is expected to consist of zero or more parts delimited by slashes.

Redundant slashes will be ignored (e.g. `/foo//bar` becomes `/foo/bar`). If the router does not respect trailing slashes, any trailing slashes will also be ignored (e.g. `/foo/` becomes `/foo`).

Parts starting with a colon (e.g. `/:foo`) will be treated as parameter names and match any non-empty string that does not contain a slash.

Parts consisting of a single asterisk (i.e. `/*`) will be treated as wildcards and match any non-empty string, including slashes. Wildcards must always occur at the end of the path and can not be followed by another part or trailing slash. Wildcards do not match the empty string.

Any other part will be interpreted literally.

This method is chainable (i.e. it returns the router it was called on).

## router.reverse(name[, params[, splat]]):String

Reverses the route with the given `name` using the given `params` and `splat`.

This method returns the path that would match the given route with the given parameters and wildcard.

If no route with the given `name` exists, `null` will be returned instead.

If the route takes parameters and `params` is not set or missing any of the expected parameters, an error will be thrown.

If the route takes a wildcard and `splat` is not set or empty, an error will be thrown.

## router.resolve(path):route

Resolves the given `path` to a known route.

If the path does not match any known route, `null` will be returned instead.

Otherwise an object with the following properties will be returned:

* `fn`: the matching function registered for this route.
* `name`: the `name` the route was registered with.
* `params`: an object mapping any parameters to their values.
* `splat`: the value of the route's wildcard or `null`.
* `next`: a function that will return the next matching route for the path or `null`.

# License

The MIT/Expat license. For more information, see http://foss-haas.mit-license.org/ or the accompanying [LICENSE](https://github.com/foss-haas/rote/blob/master/LICENSE) file.
