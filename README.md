# ES5 Basic Shim

A basic ES5 shim for older browsers.

Contains shims for the following objects:

- Function
- String
- Object
- Array

If any of the shimmed methods already exist in the environment, they are not replaced.

## Function

Shim to Function.bind

## String

Shim to String.trim

## Object

Shim to Object.keys and Object.create. For Object.create, only the first param is considered, that is, the prototype of the object to be created. Property descriptors are not parsed.

## Array

Shim to

- forEach
- indexOf
- map
- filter
- some
- every
- lastIndexOf
- reduce
- recuceRight
- Array.isArray
