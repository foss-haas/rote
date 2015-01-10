/*jshint node: true */
/*global describe, it, beforeEach */
'use strict';
var expect = require('expect.js');
var spread = require('spread-args');
var rote = require('../');

describe('rote', function () {
  it('is a function', function () {
    expect(rote).to.be.a('function');
    expect(rote()).to.be.a('function');
  });
  it('returns a router', function () {
    var expectedArg = 'foo';
    var actualArg = null;
    var router = rote();
    router.resolve = function (arg) {
      actualArg = arg;
    };
    router(expectedArg);
    expect(actualArg).to.be(expectedArg);
  });
});

describe('rote()', function () {
  var router;
  beforeEach(function () {
    router = rote();
  });
  describe('add with name', function () {
    it('registers the named route', function () {
      var handler = function () {};
      var name = 'foo';
      router.add('/path', handler, name);
      var route = router.routeNames[name];
      expect(route).to.be.ok();
      expect(route.fn).to.equal(handler);
    });
    it('throws an error if the name is already taken', function () {
      var name = 'qux';
      router.add('/path', function () {}, name);
      expect(function () {
        router.add('/foo', function () {}, name);
      }).to.throwError(function (e) {
        expect(e.message).to.contain(name);
      });
    });
  });
  describe('resolve next', function () {
    it('returns matches in the correct order', function () {
      var handler1 = function () {};
      var handler2 = function () {};
      var path = '/path';
      router.add(path, handler1);
      router.add(path, handler2);
      var result = router.resolve(path);
      expect(result).to.be.ok();
      expect(result.fn).to.be(handler1);
      expect(result.next).to.be.a('function');
      result = result.next();
      expect(result).to.be.ok();
      expect(result.fn).to.be(handler2);
      expect(result.next).to.be.a('function');
      result = result.next();
      expect(result).to.be(null);
    });
  });
  var goodExamples = [
    ['/', ['$'], {'/': [{}, null]}],
    ['/*', ['*'], {
      '/foo': [{}, 'foo'],
      '/bar': [{}, 'bar'],
      '/foo/bar/qux': [{}, 'foo/bar/qux'],
      '/foo/': [{}, 'foo'],
      '/bar/': [{}, 'bar'],
      '/foo/bar/qux/': [{}, 'foo/bar/qux']
    }],
    ['/:foo', [':', '$'], {
      '/foo': [{foo: 'foo'}, null],
      '/bar': [{foo: 'bar'}, null],
      '/qux': [{foo: 'qux'}, null],
      '/foo/': [{foo: 'foo'}, null],
      '/bar/': [{foo: 'bar'}, null],
      '/qux/': [{foo: 'qux'}, null]
    }],
    ['/:foo/', [':', '$'], {
      '/foo': [{foo: 'foo'}, null],
      '/bar': [{foo: 'bar'}, null],
      '/qux': [{foo: 'qux'}, null],
      '/foo/': [{foo: 'foo'}, null],
      '/bar/': [{foo: 'bar'}, null],
      '/qux/': [{foo: 'qux'}, null]
    }],
    ['/qux', ['"qux', '$'], {
      '/qux': [{}, null],
      '/qux/': [{}, null]
    }],
    ['/qux/', ['"qux', '$'], {
      '/qux': [{}, null],
      '/qux/': [{}, null]
    }],
    ['/qux/*', ['"qux', '*'], {
      '/qux/foo': [{}, 'foo'],
      '/qux/bar': [{}, 'bar'],
      '/qux/foo/bar/qux': [{}, 'foo/bar/qux'],
      '/qux/foo/': [{}, 'foo'],
      '/qux/bar/': [{}, 'bar'],
      '/qux/foo/bar/qux/': [{}, 'foo/bar/qux']
    }],
    ['/qux/foo', ['"qux', '"foo', '$'], {
      '/qux/foo': [{}, null],
      '/qux/foo/': [{}, null]
    }],
    ['/qux/foo/', ['"qux', '"foo', '$'], {
      '/qux/foo': [{}, null],
      '/qux/foo/': [{}, null]
    }],
    ['/qux/:foo', ['"qux', ':', '$'], {
      '/qux/foo': [{foo: 'foo'}, null],
      '/qux/bar': [{foo: 'bar'}, null],
      '/qux/qux': [{foo: 'qux'}, null],
      '/qux/foo/': [{foo: 'foo'}, null],
      '/qux/bar/': [{foo: 'bar'}, null],
      '/qux/qux/': [{foo: 'qux'}, null]
    }],
    ['/qux/:foo/', ['"qux', ':', '$'], {
      '/qux/foo': [{foo: 'foo'}, null],
      '/qux/bar': [{foo: 'bar'}, null],
      '/qux/qux': [{foo: 'qux'}, null],
      '/qux/foo/': [{foo: 'foo'}, null],
      '/qux/bar/': [{foo: 'bar'}, null],
      '/qux/qux/': [{foo: 'qux'}, null]
    }],
    ['/:qux/*', [':', '*'], {
      '/qux/foo': [{qux: 'qux'}, 'foo'],
      '/qux/bar': [{qux: 'qux'}, 'bar'],
      '/qux/foo/bar/qux': [{qux: 'qux'}, 'foo/bar/qux'],
      '/qux/foo/': [{qux: 'qux'}, 'foo'],
      '/qux/bar/': [{qux: 'qux'}, 'bar'],
      '/qux/foo/bar/qux/': [{qux: 'qux'}, 'foo/bar/qux']
    }],
    ['/:qux/foo', [':', '"foo', '$'], {
      '/qux/foo': [{qux: 'qux'}, null],
      '/qux/foo/': [{qux: 'qux'}, null]
    }],
    ['/:qux/foo/', [':', '"foo', '$'], {
      '/qux/foo': [{qux: 'qux'}, null],
      '/qux/foo/': [{qux: 'qux'}, null]
    }],
    ['/:qux/:foo', [':', ':', '$'], {
      '/qux/foo': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux': [{qux: 'qux', foo: 'qux'}, null],
      '/qux/foo/': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar/': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux/': [{qux: 'qux', foo: 'qux'}, null]
    }],
    ['/:qux/:foo/', [':', ':', '$'], {
      '/qux/foo': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux': [{qux: 'qux', foo: 'qux'}, null],
      '/qux/foo/': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar/': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux/': [{qux: 'qux', foo: 'qux'}, null]
    }],
    ['/:foo/:foo', [':', ':', '$'], {
      '/qux/foo': [{foo: ['qux', 'foo']}, null],
      '/qux/bar': [{foo: ['qux', 'bar']}, null],
      '/qux/qux': [{foo: ['qux', 'qux']}, null],
      '/qux/foo/': [{foo: ['qux', 'foo']}, null],
      '/qux/bar/': [{foo: ['qux', 'bar']}, null],
      '/qux/qux/': [{foo: ['qux', 'qux']}, null]
    }],
    ['/:foo/:foo/', [':', ':', '$'], {
      '/qux/foo': [{foo: ['qux', 'foo']}, null],
      '/qux/bar': [{foo: ['qux', 'bar']}, null],
      '/qux/qux': [{foo: ['qux', 'qux']}, null],
      '/qux/foo/': [{foo: ['qux', 'foo']}, null],
      '/qux/bar/': [{foo: ['qux', 'bar']}, null],
      '/qux/qux/': [{foo: ['qux', 'qux']}, null]
    }]
  ];
  describe('reverse', function () {
    goodExamples.forEach(spread(function (route, tokens, matches) {
      Object.keys(matches).forEach(function (path) {
        if (path.length > 1 && path.slice(-1) === '/') path = path.slice(0, -1);
        it(route + ' reverses to ' + path, function () {
          var name = 'hello';
          router.add(route, function () {}, name);
          spread(function (keys, splat) {
            var result = router.reverse(name, keys, splat);
            expect(result).to.equal(path);
          })(matches[path]);
        });
      });
    }));
  });
  describe('resolve', function () {
    goodExamples.forEach(spread(function (route, tokens, matches) {
      Object.keys(matches).forEach(function (path) {
        it(route + ' matches ' + path, function () {
          var handler = function () {};
          router.add(route, handler);
          var map = router.routeMap;
          tokens.forEach(function (token) {
            expect(map).to.have.property(token);
            map = map[token];
          });
          expect(map).to.be.an(Array);
          expect(map.length).to.equal(1);
          expect(map[0].fn).to.equal(handler);
          spread(function (params, splat) {
            var result = router.resolve(path);
            expect(result).to.be.ok();
            expect(result.fn).to.be(handler);
            expect(result.params).to.eql(params);
            expect(result.splat).to.eql(splat);
          })(matches[path]);
        });
      });
    }));
    var badExamples = [
      ['/', ['/foo']],
      ['/*', ['/']],
      ['/:foo', ['/', '/foo/bar']],
      ['/:foo/', ['/', '/foo/bar']],
      ['/qux', ['/', '/foo']],
      ['/qux/', ['/', '/foo']],
      ['/qux/*', ['/qux', '/qux/']],
      ['/qux/foo', ['/qux', '/qux/']],
      ['/qux/foo/', ['/qux', '/qux/']],
      ['/qux/:foo', ['/foo/foo', '/foo/foo/']],
      ['/qux/:foo/', ['/foo/foo/', '/foo/foo']],
      ['/:qux/*', ['/qux', '/qux/']],
      ['/:qux/foo', ['/qux', '/qux/', '/qux/bar']],
      ['/:qux/foo/', ['/qux', '/qux/', '/qux/bar/']],
      ['/:qux/:foo', ['/foo/bar/qux', '/foo/bar/qux/']],
      ['/:qux/:foo/', ['/foo/bar/qux', '/foo/bar/qux/']],
      ['/:foo/:foo', ['/foo/bar/qux', '/foo/bar/qux/']],
      ['/:foo/:foo/', ['/foo/bar/qux', '/foo/bar/qux/']]
    ];
    badExamples.forEach(spread(function (route, matches) {
      matches.forEach(function (path) {
        it(route + ' does not match ' + path, function () {
          var handler = function () {};
          router.add(route, handler);
          expect(router.resolve(path)).to.equal(null);
        });
      });
    }));
  });
});

describe('rote(true)', function () {
  var router;
  beforeEach(function () {
    router = rote(true);
  });
  var goodExamples = [
    ['/', ['$'], {'/': [{}, null]}],
    ['/*', ['*'], {
      '/foo': [{}, 'foo'],
      '/bar': [{}, 'bar'],
      '/foo/bar/qux': [{}, 'foo/bar/qux'],
      '/foo/': [{}, 'foo/'],
      '/bar/': [{}, 'bar/'],
      '/foo/bar/qux/': [{}, 'foo/bar/qux/']
    }],
    ['/:foo', [':', '$'], {
      '/foo': [{foo: 'foo'}, null],
      '/bar': [{foo: 'bar'}, null],
      '/qux': [{foo: 'qux'}, null]
    }],
    ['/:foo/', [':', '"/', '$'], {
      '/foo/': [{foo: 'foo'}, null],
      '/bar/': [{foo: 'bar'}, null],
      '/qux/': [{foo: 'qux'}, null]
    }],
    ['/qux', ['"qux', '$'], {'/qux': [{}, null]}],
    ['/qux/', ['"qux', '"/', '$'], {'/qux/': [{}, null]}],
    ['/qux/*', ['"qux', '*'], {
      '/qux/foo': [{}, 'foo'],
      '/qux/bar': [{}, 'bar'],
      '/qux/foo/bar/qux': [{}, 'foo/bar/qux'],
      '/qux/foo/': [{}, 'foo/'],
      '/qux/bar/': [{}, 'bar/'],
      '/qux/foo/bar/qux/': [{}, 'foo/bar/qux/']
    }],
    ['/qux/foo', ['"qux', '"foo', '$'], {
      '/qux/foo': [{}, null]
    }],
    ['/qux/foo/', ['"qux', '"foo', '"/', '$'], {
      '/qux/foo/': [{}, null]
    }],
    ['/qux/:foo', ['"qux', ':', '$'], {
      '/qux/foo': [{foo: 'foo'}, null],
      '/qux/bar': [{foo: 'bar'}, null],
      '/qux/qux': [{foo: 'qux'}, null]
    }],
    ['/qux/:foo/', ['"qux', ':', '"/', '$'], {
      '/qux/foo/': [{foo: 'foo'}, null],
      '/qux/bar/': [{foo: 'bar'}, null],
      '/qux/qux/': [{foo: 'qux'}, null]
    }],
    ['/:qux/*', [':', '*'], {
      '/qux/foo': [{qux: 'qux'}, 'foo'],
      '/qux/bar': [{qux: 'qux'}, 'bar'],
      '/qux/foo/bar/qux': [{qux: 'qux'}, 'foo/bar/qux'],
      '/qux/foo/': [{qux: 'qux'}, 'foo/'],
      '/qux/bar/': [{qux: 'qux'}, 'bar/'],
      '/qux/foo/bar/qux/': [{qux: 'qux'}, 'foo/bar/qux/']
    }],
    ['/:qux/foo', [':', '"foo', '$'], {
      '/qux/foo': [{qux: 'qux'}, null]
    }],
    ['/:qux/foo/', [':', '"foo', '"/', '$'], {
      '/qux/foo/': [{qux: 'qux'}, null]
    }],
    ['/:qux/:foo', [':', ':', '$'], {
      '/qux/foo': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux': [{qux: 'qux', foo: 'qux'}, null]
    }],
    ['/:qux/:foo/', [':', ':', '"/', '$'], {
      '/qux/foo/': [{qux: 'qux', foo: 'foo'}, null],
      '/qux/bar/': [{qux: 'qux', foo: 'bar'}, null],
      '/qux/qux/': [{qux: 'qux', foo: 'qux'}, null]
    }],
    ['/:foo/:foo', [':', ':', '$'], {
      '/qux/foo': [{foo: ['qux', 'foo']}, null],
      '/qux/bar': [{foo: ['qux', 'bar']}, null],
      '/qux/qux': [{foo: ['qux', 'qux']}, null]
    }],
    ['/:foo/:foo/', [':', ':', '"/', '$'], {
      '/qux/foo/': [{foo: ['qux', 'foo']}, null],
      '/qux/bar/': [{foo: ['qux', 'bar']}, null],
      '/qux/qux/': [{foo: ['qux', 'qux']}, null]
    }]
  ];
  describe('reverse', function () {
    goodExamples.forEach(spread(function (route, tokens, matches) {
      Object.keys(matches).forEach(function (path) {
        it(route + ' reverses to ' + path, function () {
          var name = 'hello';
          router.add(route, function () {}, name);
          spread(function (keys, splat) {
            var result = router.reverse(name, keys, splat);
            expect(result).to.equal(path);
          })(matches[path]);
        });
      });
    }));
  });
  describe('resolve', function () {
    goodExamples.forEach(spread(function (route, tokens, matches) {
      Object.keys(matches).forEach(function (path) {
        spread(function (params, splat) {
          it(route + ' matches ' + path, function () {
            var handler = function () {};
            router.add(route, handler);
            var map = router.routeMap;
            tokens.forEach(function (token) {
              expect(map).to.have.property(token);
              map = map[token];
            });
            expect(map).to.be.an(Array);
            expect(map.length).to.equal(1);
            expect(map[0].fn).to.equal(handler);
            var result = router.resolve(path);
            expect(result).to.be.ok();
            expect(result.fn).to.be(handler);
            expect(result.params).to.eql(params);
            expect(result.splat).to.eql(splat);
          });
        })(matches[path]);
      });
    }));
    var badExamples = [
      ['/', ['/foo']],
      ['/*', ['/']],
      ['/:foo', ['/']],
      ['/:foo/', ['/foo', '/bar']],
      ['/qux', ['/qux/']],
      ['/qux/', ['/qux']],
      ['/qux/*', ['/qux', '/qux/']],
      ['/qux/foo', ['/qux/foo/']],
      ['/qux/foo/', ['/qux/foo']],
      ['/qux/:foo', ['/foo/foo', '/qux/foo/']],
      ['/qux/:foo/', ['/foo/foo/', '/qux/foo']],
      ['/:qux/*', ['/qux', '/qux/']],
      ['/:qux/foo', ['/qux/foo/', '/qux/bar']],
      ['/:qux/foo/', ['/qux/foo', '/qux/bar/']],
      ['/:qux/:foo', ['/foo/bar/']],
      ['/:qux/:foo/', ['/foo/bar']],
      ['/:foo/:foo', ['/foo/bar/']],
      ['/:foo/:foo/', ['/foo/bar']]
    ];
    badExamples.forEach(spread(function (route, matches) {
      matches.forEach(function (path) {
        it(route + ' does not match ' + path, function () {
          var handler = function () {};
          router.add(route, handler);
          expect(router.resolve(path)).to.equal(null);
        });
      });
    }));
  });
});