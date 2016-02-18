/*
 * The MIT License
 *
 * Copyright (c) 2016 Juan Cruz Viotti. https://github.com/jviotti
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const m = require('mochainon');
const _ = require('lodash');
const fs = require('fs');
const storage = require('../lib/storage');
const utils = require('../lib/utils');

describe('Electron JSON Storage', function() {

  // Ensure each test case is always ran in a clean state
  beforeEach(storage.clear);

  describe('.get()', function() {

    it('should yield an error if no key', function(done) {
      storage.get(null, function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.get(123, function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.get('    ', function(error, data) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(data).to.not.exist;
        done();
      });
    });

    describe('given stored settings', function() {

      beforeEach(function(done) {
        storage.set('foo', { data: 'hello world' }, done);
      });

      it('should yield the data', function(done) {
        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield the data if explicitly passing the extension', function(done) {
        storage.get('foo.json', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ data: 'hello world' });
          done();
        });
      });

      it('should yield an empty object given an incorrect key', function(done) {
        storage.get('foobarbaz', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({});
          done();
        });
      });

    });

    describe('given invalid stored JSON', function() {

      beforeEach(function(done) {
        const fileName = utils.getFileName('foo');

        // Using fs directly since storage.set()
        // contains logic to prevent invalid JSON
        // from being written at all
        return fs.writeFile(fileName, 'Foo{bar}123', done);

      });

      it('should yield an error with an error', function(done) {
        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.be.an.instanceof(Error);
          m.chai.expect(error.message).to.equal('Invalid data');
          m.chai.expect(data).to.not.exist;
          done();
        });
      });

    });

  });

  describe('.set()', function() {

    it('should yield an error if no key', function(done) {
      storage.set(null, { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.set(123, { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.set('    ', { foo: 'bar' }, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if data is not a valid JSON object', function(done) {
      storage.set('foo', _.noop, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid JSON data');
        done();
      });
    });

    it('should be able to store a valid JSON object', function(done) {
      storage.set('foo', { foo: 'baz' }, function(error) {
        m.chai.expect(error).to.not.exist;

        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ foo: 'baz' });
          done();
        });
      });
    });

    it('should ignore an explicit json extension', function(done) {
      storage.set('foo.json', { foo: 'baz' }, function(error) {
        m.chai.expect(error).to.not.exist;

        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ foo: 'baz' });
          done();
        });
      });
    });

    describe('given an existing stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to override the stored key', function(done) {
        storage.get('foo', function(error, data) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(data).to.deep.equal({ foo: 'bar' });

          storage.set('foo', { foo: 'baz' }, function(error) {
            m.chai.expect(error).to.not.exist;

            storage.get('foo', function(error, data) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(data).to.deep.equal({ foo: 'baz' });
              done();
            });
          });
        });
      });

      it('should not override the stored key if the passed data is invalid', function(done) {
        storage.set('foo', _.noop, function(error) {
          m.chai.expect(error).to.be.an.instanceof(Error);

          storage.get('foo', function(error, data) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(data).to.deep.equal({ foo: 'bar' });
            done();
          });
        });
      });

    });

  });

  describe('.has()', function() {

    it('should yield an error if no key', function(done) {
      storage.has(null, function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.has(123, function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.has('    ', function(error, hasKey) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        m.chai.expect(hasKey).to.not.exist;
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should yield true if the key exists', function(done) {
        storage.has('foo', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield true if the key has a json extension', function(done) {
        storage.has('foo.json', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(true);
          done();
        });
      });

      it('should yield false if the key does not exist', function(done) {
        storage.has('hello', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.equal(false);
          done();
        });
      });

    });

  });

  describe('.keys()', function() {

    it('should yield an empty array if no keys', function(done) {
      storage.keys(function(error, keys) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(keys).to.deep.equal([]);
        done();
      });
    });

    it('should yield a single key if there is one saved setting', function(done) {
      storage.set('foo', 'bar', function(error) {
        m.chai.expect(error).to.not.exist;

        storage.keys(function(error, keys) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(keys).to.deep.equal([ 'foo' ]);
          done();
        });
      });
    });

    it('should ignore the .json extension', function(done) {
      storage.set('foo.json', 'bar', function(error) {
        m.chai.expect(error).to.not.exist;

        storage.keys(function(error, keys) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(keys).to.deep.equal([ 'foo' ]);
          done();
        });
      });
    });

    it('should only remove the .json extension', function(done) {
      storage.set('foo.data', 'bar', function(error) {
        m.chai.expect(error).to.not.exist;

        storage.keys(function(error, keys) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(keys).to.deep.equal([ 'foo.data' ]);
          done();
        });
      });
    });

    it('should detect multiple saved settings', function(done) {
      storage.set('one', 'foo', function(error) {
        m.chai.expect(error).to.not.exist;

        storage.set('two', 'bar', function(error) {
          m.chai.expect(error).to.not.exist;

          storage.set('three', 'baz', function(error) {
            m.chai.expect(error).to.not.exist;

            storage.keys(function(error, keys) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(keys).to.deep.equal([
                'one',
                'three',
                'two'
              ]);
              done();
            });
          });
        });
      });
    });

  });

  describe('.remove()', function() {

    it('should yield an error if no key', function(done) {
      storage.remove(null, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Missing key');
        done();
      });
    });

    it('should yield an error if key is not a string', function(done) {
      storage.remove(123, function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    it('should yield an error if key is a blank string', function(done) {
      storage.remove('     ', function(error) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('Invalid key');
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should be able to remove the key', function(done) {
        storage.has('foo', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.true;

          storage.remove('foo', function(error) {
            m.chai.expect(error).to.not.exist;

            storage.has('foo', function(error, hasKey) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(hasKey).to.be.false;
              done()
            });
          });
        });
      });

      it('should do nothing if the key does not exist', function(done) {
        storage.has('bar', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.false;

          storage.remove('bar', function(error) {
            m.chai.expect(error).to.not.exist;

            storage.has('bar', function(error, hasKey) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(hasKey).to.be.false;
              done()
            });
          });
        });
      });

    });

  });

  describe('.clear()', function() {

    it('should not yield an error if no keys', function(done) {
      storage.clear(function(error) {
        m.chai.expect(error).to.not.exist;
        done();
      });
    });

    describe('given a stored key', function() {

      beforeEach(function(done) {
        storage.set('foo', { foo: 'bar' }, done);
      });

      it('should clear the key', function(done) {
        storage.has('foo', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.true;

          storage.clear(function(error) {
            m.chai.expect(error).to.not.exist;

            storage.has('foo', function(error, hasKey) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(hasKey).to.be.false;
              done()
            });
          });
        });
      });

      it('should not delete the user data directory', function(done) {
        const isDirectory = function(dir, callback) {
          fs.stat(dir, function(error, stat) {
            if (error) {
              if (error.code === 'ENOENT') {
                return callback(null, false);
              }

              return callback(error);
            }

            return callback(null, stat.isDirectory());
          });
        };

        const userDataPath = utils.getUserDataPath();

        isDirectory(userDataPath, function(error, exists) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(exists).to.be.true;

          storage.clear(function(error) {
            m.chai.expect(error).to.not.exist;

            isDirectory(userDataPath, function(error, exists) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(exists).to.be.true;
              done();
            });
          });
        });
      });

    });

    describe('given many stored keys', function() {

      beforeEach(function(done) {
        storage.set('foo', { name: 'foo' }, function(error) {
          if (error) {
            return done(error);
          }

          storage.set('bar', { name: 'bar' }, function(error) {
            if (error) {
              return done(error);
            }

            storage.set('baz', { name: 'baz' }, function(error) {
              if (error) {
                return done(error);
              }

              done();
            });
          });
        });
      });

      it('should clear all stored keys', function(done) {
        storage.has('foo', function(error, hasKey) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(hasKey).to.be.true;

          storage.has('bar', function(error, hasKey) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(hasKey).to.be.true;

            storage.has('baz', function(error, hasKey) {
              m.chai.expect(error).to.not.exist;
              m.chai.expect(hasKey).to.be.true;

              storage.clear(function(error) {
                m.chai.expect(error).to.not.exist;

                storage.has('foo', function(error, hasKey) {
                  m.chai.expect(error).to.not.exist;
                  m.chai.expect(hasKey).to.be.false;

                  storage.has('bar', function(error, hasKey) {
                    m.chai.expect(error).to.not.exist;
                    m.chai.expect(hasKey).to.be.false;

                    storage.has('baz', function(error, hasKey) {
                      m.chai.expect(error).to.not.exist;
                      m.chai.expect(hasKey).to.be.false;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

    });

  });

});
