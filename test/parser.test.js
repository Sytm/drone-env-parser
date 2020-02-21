'use strict';

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
            try {
                process.env[ 'PLUGIN_TEST' ] = 'one,two,three';
                assert.deepStrictEqual( parseEnvs( {
                    splitOnComma: false
                } ), {
                    test: 'one,two,three'
                } );
            } finally {
                delete process.env[ 'PLUGIN_TEST' ];
            }
        } );
        it( 'should split top-level strings into arrays if enabled', function () {
            try {
                process.env[ 'PLUGIN_TEST' ] = 'one,two,three';
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
                delete process.env[ 'PLUGIN_TEST' ];
            }
        } );
        it( 'should keep the upper-case names intact of the top-level properties if enabled', function () {
            try {
                process.env[ 'PLUGIN_TEST' ] = 'a string';
                assert.deepStrictEqual( parseEnvs( {
                    makeNameLowerCase: false
                } ), {
                    TEST: 'a string'
                } );
            } finally {
                delete process.env[ 'PLUGIN_TEST' ];
            }
        } );
        it( 'should use the provided prefix for the environment variables if provided', function () {
            try {
                process.env[ 'EXTENSION_TEST' ] = 'a string';
                process.env[ 'PLUGIN_THIS' ] = 'won\'t be parsed';
                assert.deepStrictEqual( parseEnvs( {
                    prefix: 'EXTENSION_'
                } ), {
                    test: 'a string'
                } );
            } finally {
                delete process.env[ 'EXTENSION_TEST' ];
                delete process.env[ 'PLUGIN_THIS' ];
            }
        } );
        it( 'should parse json objects properly', function () {
            try {
                let obj = { name: 'property' };
                process.env[ 'PLUGIN_OBJ' ] = JSON.stringify( obj );
                let parsed = parseEnvs();
                assert.deepStrictEqual( parsed.obj, obj );
            } finally {
                delete process.env[ 'PLUGIN_OBJ' ];
            }
        } );
        it( 'should parse json arrays properly', function () {
            try {
                let arr = [ 1, 2, 3 ];
                process.env[ 'PLUGIN_ARR' ] = JSON.stringify( arr );
                let parsed = parseEnvs();
                assert.deepStrictEqual( parsed.arr, arr );
            } finally {
                delete process.env[ 'PLUGIN_ARR' ];
            }
        } );
        it( 'should parse the example variables correctly with the default settings', function () {
            try {
                Object.keys( exampleEnvs ).forEach( key => {
                    process.env[ key ] = exampleEnvs[ key ];
                } );
                assert.deepStrictEqual( parseEnvs(), expectedReturn );
            } finally {
                Object.keys( exampleEnvs ).forEach( key => {
                    delete process.env[ key ];
                } );
            }
        } );
    } );
} );