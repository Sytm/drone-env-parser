'use strict';

const assert = require('assert');

const exampleEnvs = `PLUGIN_USERS={"lukas":{"age":16,"hobbys":["programming","r6"]},"tim":{"age":21,"hobbys":["empty inside","or is he?"]}}
PLUGIN_SERVERS=[{"host":"one.server","lines":["oof"],"name":"Server One","port":420},{"host":"two.server","lines":["exec foo-bar"],"name":"Server Two","port":666}]
PLUGIN_REPO=test-repo
PLUGIN_NAMES=one,two,three`.split('\n');
const expectedReturn = {
    repo: [
        'test-repo'
    ],
    names: [
        'one',
        'two',
        'three'
    ],
    users: {
        'lukas': {
            age: 16,
            hobbys: [
                'programming',
                'r6'
            ]
        },
        'tim': {
            age: 21,
            hobbys: [
                'empty inside',
                'or is he?'
            ]
        }
    },
    servers: [
        {
            name: 'Server One',
            host: 'one.server',
            port: 420,
            lines: [
                'oof'
            ]
        },
        {
            name: 'Server Two',
            host: 'two.server',
            port: 666,
            lines: [
                'exec foo-bar'
            ]
        }
    ]
};

const parseEnvs = require('../parser').parseEnvs;


describe('Parser', function() {
    describe('#parseEnvs()', function() {
        it('shouldn\'t split top-level strings into arrays if disabled', function() {
            assert.deepStrictEqual(parseEnvs({
                splitOnComma: false
            }, [
                'PLUGIN_TEST=one,two,three'
            ]), {
                test: 'one,two,three'
            });
        });
        it('should keep the upper-case names intact of the top-level properties if enabled', function() {
            assert.deepStrictEqual(parseEnvs({
                makeNameLowerCase: false
            }, [
                'PLUGIN_TEST=a string'
            ]), {
                TEST: [
                    'a string'
                ]
            });
        });
        it('should use the provided prefix for the environment variables if provided', function() {
            assert.deepStrictEqual(parseEnvs({
                prefix: 'EXTENSION_'
            }, [
                'EXTENSION_TEST=a string',
                'PLUGIN_THIS=won\'t be parsed'
            ]), {
                test: [
                    'a string'
                ]
            });
        });
        it('should parse json values properly', function() {
            let obj = {name: 'property'};
            let arr = [1, 2, 3];
            let parsed = parseEnvs({}, [
                'PLUGIN_OBJ=' + JSON.stringify(obj),
                'PLUGIN_ARR=' + JSON.stringify(arr)
            ]);
            assert.deepStrictEqual(parsed.obj, obj);
            assert.deepStrictEqual(parsed.arr, arr);
        });
        it('should parse the example variables correctly with the default settings', function() {
            assert.deepStrictEqual(parseEnvs({}, exampleEnvs), expectedReturn);
        });
    });
});