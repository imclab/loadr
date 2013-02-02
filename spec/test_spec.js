var rewquire = require//("rewire")
// var chai = rewquire('chai')
var modules = rewquire('../modules')
var resolve = modules.resolve
var di = require('ng-di')
var x = jasmine
var mocks = require('ng-di/dist/ng-di-mocks')
// console.log(x === jasmine, mocks)
var temp = mocks.init(jasmine, global)
var module = temp.module
var inject = temp.inject

// console.log(mocks)
// di.module('main')
// var di = require('./node_modules/ng-di/dist/ng-di.js')

// console.log(require('components/angular/angular.js'))
// console.log(modules.__get__('cc'))
// di.injector(['modules']).invoke(function(resolve) {
//   console.log(resolve)
// })
// var ddescribe = describe.only
// var xdescribe = describe.skip
// var iit = it.only
// var xit = it.skip
// asdasd
// chai.should()

var f = {}
f.enum = function(start, end) {
  var list = []
  while (start <= end) {
    list.push(start++)
  }
  return list
}
f.map = function(fn, list) {
  var list2 = []
  for (var i = 0; i < list.length; i++) {
    list2[i] = fn(list[i])
  }
  return list2
}


var parse = function(str) {
  var list = str.split(/\s+/)
  var list2 = f.map(function(v) {return {name:v}}, list)
  return list2
}

// var resolve = function(ary) {
//   return ary
// }
// expect(0).toBe(1)
// console.log(1)
//   beforeEach(function() {
//     console.log('BEFORE')
//   })
  // afterEach(function() {})
describe('loader', function() {
  beforeEach(module('modules'))
  describe('parser', function() {
    it('should accept any kind of whitespace', function() {

      // expect(1).toBe(2)
      var t = function(s) {
        return {name:s}
      }
      expect(parse('m1 m2')).toEqual(f.map(t, ['m1', 'm2']))
      expect(parse('m1   m3')).toEqual(f.map(t, ['m1', 'm3']))
      expect(parse('m1 \n  m4')).toEqual(f.map(t, ['m1', 'm4']))
      expect(parse('a\n  b\n  c')).toEqual(f.map(t, ['a', 'b', 'c']))
    })
  })

  var dependencyMap

  var charSplit = function(str) {
    return str.split('')
  }
  describe('recursive resolver', function() {
    it('should resolve recursively', function() {
      module(function($provide) {
        dependencyMap =
          { 'a': ['b']
          , 'c': ['b']
          , 'b': []
          , 'd': ['e']
          , 'e': ['f']
          , 'f': []
          , 'g': ['a','c']
          }
        $provide.value('dependencyMap', dependencyMap); // override version here
      })

      inject(function(resolveSync) {
        expect(resolveSync(['f']))       .toEqual(charSplit('f'))
        expect(resolveSync(['e']))       .toEqual(charSplit('fe'))
        expect(resolveSync(['d']))       .toEqual(charSplit('fed'))
        expect(resolveSync(['a']))       .toEqual(charSplit('ba'))
        expect(resolveSync(['a', 'c']))  .toEqual(charSplit('babc'))
        expect(resolveSync(['d', 'f']))  .toEqual(charSplit('fedf'))
        expect(resolveSync(['d']))       .toEqual(charSplit('fed'))
        expect(resolveSync(['g']))       .toEqual(charSplit('babcg'))

        // var t
        // t = ['a']
        // t = [{name: 'a', requires: ['b']}]
        // t = [{name: 'a', requires: [{name:'b', requires:[]}]}]
      })
    })
  })

  describe('reducer', function() {
    it('should reduce', inject(function(reduce) {
      expect(reduce(charSplit('f')))      .toEqual(charSplit('f'))
      expect(reduce(charSplit('fe')))     .toEqual(charSplit('fe'))
      expect(reduce(charSplit('fed')))    .toEqual(charSplit('fed'))
      expect(reduce(charSplit('ba')))     .toEqual(charSplit('ba'))
      expect(reduce(charSplit('babc')))   .toEqual(charSplit('bac'))
      expect(reduce(charSplit('fedf')))   .toEqual(charSplit('fed'))
      expect(reduce(charSplit('fed')))    .toEqual(charSplit('fed'))
      expect(reduce(charSplit('babcg')))  .toEqual(charSplit('bacg'))

    }))
  })
})
