'use strict';

const mockedEnv = require( 'mocked-env' );
const assert = require( 'assert' );

const exampleEnvs = {
    PLUGIN_USERS: '{"lukas":{"age":16,"hobbys":["programming","r6"]},"tim":{"age":21,"hobbys":["empty inside","or is he?"]}}',
    PLUGIN_SERVERS: '[{"host":"one.server","lines":["oof"],"name":"Server One","port":420},{"host":"two.server","lines":["exec foo-bar"],"name":"Server Two","port":666}]',
    PLUGIN_REPO: 'test-repo',
    PLUGIN_NAMES: 'one,two,three'
};

const expectedReturn = {
    repo: 'test-repo',
    names: 'one,two,three',
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

const parseEnvs = require( '../parser' ).parseEnvs;


describe( 'Parser', function () {
    describe( '#parseEnvs()', function () {
        it( 'shouldn\'t split top-level strings into arrays if disabled', function () {
            let restore = mockedEnv( {
                PLUGIN_TEST: 'one,two,three'
            }, { clear: true } );
            try {
                assert.deepStrictEqual( parseEnvs( {
                    splitOnComma: false
                } ), {
                    test: 'one,two,three'
                } );
            } finally {
                restore();
            }
        } );
        it( 'should split top-level strings into arrays if enabled', function () {
            let restore = mockedEnv( { PLUGIN_TEST: 'one,two,three' }, { clear: true } );
            try {
                assert.deepStrictEqual( parseEnvs( {
                    splitOnComma: true
                } ), {
                    test: [
                        'one',
                        'two',
                        'three'
                    ]
                } );
            } finally {
                restore();
            }
        } );
        it( 'should keep the upper-case names intact of the top-level properties if enabled', function () {
            let restore = mockedEnv( { PLUGIN_TEST: 'a string' }, { clear: true } );
            try {
                assert.deepStrictEqual( parseEnvs( {
                    makeNameLowerCase: false
                } ), {
                    TEST: 'a string'
                } );
            } finally {
                restore();
            }
        } );
        it( 'should use the provided prefix for the environment variables if provided', function () {
            let restore = mockedEnv( { EXTENSION_TEST: 'a string', PLUGIN_THIS: 'won\t be parsed' }, { clear: true } );
            try {
                assert.deepStrictEqual( parseEnvs( {
                    prefix: 'EXTENSION_'
                } ), {
                    test: 'a string'
                } );
            } finally {
                restore();
            }
        } );
        it( 'should parse json objects properly', function () {
            let obj = { name: 'property' };
            let restore = mockedEnv( { PLUGIN_OBJ: JSON.stringify( obj ) }, { clear: true } );
            try {
                let parsed = parseEnvs();
                assert.deepStrictEqual( parsed.obj, obj );
            } finally {
                restore();
            }
        } );
        it( 'should parse json arrays properly', function () {
            let arr = [ 1, 2, 3 ];
            let restore = mockedEnv( { PLUGIN_ARR: JSON.stringify( arr ) }, { clear: true } );
            try {
                let parsed = parseEnvs();
                assert.deepStrictEqual( parsed.arr, arr );
            } finally {
                restore();
            }
        } );
        it( 'should extend upon the default values provided', function () {
            let restore = mockedEnv( {
                PLUGIN_OVERWRITTEN: 'another value',
                PLUGIN_MIXED: JSON.stringify( {
                    overwritten: 'not the same anymore'
                } )
            } );
            try {
                let parsed = parseEnvs( {
                    defaults: {
                        keep: 'this value should be kept',
                        mixed: {
                            keep: 'kept',
                            overwritten: 'overwritten'
                        },
                        overwritten: 'this value should be overwritten'
                    }
                } );
                assert.deepStrictEqual( parsed, {
                    keep: 'this value should be kept',
                    mixed: {
                        keep: 'kept',
                        overwritten: 'not the same anymore'
                    },
                    overwritten: 'another value'
                } );
            } finally {
                restore();
            }
        } );
        it( 'should parse the example variables correctly with the default settings', function () {
            let restore = mockedEnv( {
                ...exampleEnvs
            }, { clear: true } );
            try {
                assert.deepStrictEqual( parseEnvs(), expectedReturn );
            } finally {
                restore();
            }
        } );
    } );
} );