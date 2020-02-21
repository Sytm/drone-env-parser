'use strict';

const extend = require('extend');

const defaults = {
    prefix: 'PLUGIN_',
    makeNameLowerCase:  true,
    splitOnComma: true
};

function parseEnvs(options, variables) {
    let opts = extend({}, defaults, options);

    let env = variables || process.env;

    env = env.filter(str => str.startsWith(opts.prefix)).map(str => parseEnvVariable(opts, str));    

    let root = {};

    env.forEach(env => {
        try {
            let obj = JSON.parse(env.content);
            root[env.name] = obj;
        } catch {
            if (opts.splitOnComma) {
                root[env.name] = env.content.split(',');
            } else {
                root[env.name] = env.content;
            }
        }
    });

    return root;
}

function parseEnvVariable(opts, str) {
    str = str.substr(opts.prefix.length);
    let index = str.indexOf('=');
    let name = str.substr(0, index);
    if (opts.makeNameLowerCase) {
        name = name.toLowerCase();
    }
    return {
        name,
        content: str.substr(index + 1)
    };
}

exports.parseEnvs = parseEnvs;