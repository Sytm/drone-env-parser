"use strict";

const extend = require("extend");

const defaultOptions = {
  prefix: "PLUGIN_",
  makeNameLowerCase: true,
  splitOnComma: false,
  defaults: {},
};

function parseEnvs(options) {
  let opts = extend(true, {}, defaultOptions, options);

  let env = process.env;

  env = Object.keys(env)
    .filter((str) => str.startsWith(opts.prefix))
    .map((str) => parseEnvVariable(opts, str));

  let root = {};

  env.forEach((env) => {
    try {
      let obj = JSON.parse(env.content);
      root[env.name] = obj;
    } catch (e) {
      if (opts.splitOnComma) {
        root[env.name] = env.content.split(",");
      } else {
        root[env.name] = env.content;
      }
    }
  });

  return extend(true, {}, opts.defaults, root);
}

function parseEnvVariable(opts, str) {
  let content = process.env[str];
  let name = str.substr(opts.prefix.length);
  if (opts.makeNameLowerCase) {
    name = name.toLowerCase();
  }
  return {
    name,
    content,
  };
}

exports.parseEnvs = parseEnvs;
