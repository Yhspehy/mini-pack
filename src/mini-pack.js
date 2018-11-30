const fs = require('fs');
const path = require('path');
const traverse = require('babel-traverse').default;
const {
  transformFromAst,
  transform
} = require('babel-core');
var UglifyJS = require("uglify-es");

let ID = 0



/**
 * parse js file to get AST
 * @params { String } filePath
 * @return { Object } 
 */
function getAst(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const deps = [];
  const ast = transform(content).ast;
  traverse(ast, {
    ImportDeclaration(path) {
      const sourcePath = path.node.source.value
      deps.push(sourcePath)
    }
  })
  const id = ID++

  let code = transformFromAst(ast, null, {
    presets: ['env']
  }).code

  code = loader(code)
  code = plugin(code, [{
    name: 'uglify-es',
    option: {
      compress: false,
      mangle: false,
      output: {
        beautify: true
      }
    }
  }])
  return {
    id,
    filePath,
    deps,
    code,
  };
}



/**
 * Achieve loader
 * Just like webpack-loader
 */
function loader(code) {
  return code.replace(/222/g, '\'loader replace here\'')
}




/**
 * plugin 
 * Just like webpack-plugin
 */
function plugin(code, plugins) {
  plugins.forEach(p => {
    const r = require(p.name)
    // Just example
    // You can use directly if it is a plugin
    // You don't need to use minify
    r.minify(code, p.option)
  })
  return code
}



/**
 * entry function
 * start here
 * get path in process.argv[2]
 */
function entry() {
  const entryPath = process.argv[2] ? process.cwd() + process.argv[2].match(/^-PATH=(.*)$/)[1] : process.cwd()
  const entryAst = getAst(entryPath)
  // all assets
  const assets = [entryAst]

  for (const ast of assets) {
    // each file require deps
    if (!ast.mapping) ast.mapping = {}
    const dir = path.dirname(ast.filePath)
    ast.deps.forEach(relativePath => {
      const absolutePath = path.resolve(dir, relativePath)
      const depAst = getAst(absolutePath)
      ast.mapping[relativePath] = depAst.id
      assets.push(depAst)
    })
  }

  getBundle(assets)
}



/**
 * getBundle
 * @params { Array } assets (all file asts object)
 * @return result  bundle code 
 */
function getBundle(assets) {
  let modules = '';

  assets.forEach(mod => {
    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`;
  });

  const result = `
    (function(modules) {
      function require(id) {
        let [fn, mapping] = modules[id];
        function localRequire(name) {
          return require(mapping[name]);
        }
        let module = { exports : {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require(0);
    })({${modules}})
  `;

  uglify(result)
}


/**
 * uglify code
 * env: development or production
 * get env from process.argv[3]
 */
function uglify(result) {
  const env = process.argv[3] ? process.argv[3].match(/^-ENV=(.*)$/)[1] : null
  let option = {}
  if (env === 'development') {
    option = {
      compress: false,
      mangle: false,
      output: {
        beautify: true
      }
    }
  }
  if (env === null) {
    fs.writeFileSync('./output.js', result)
  } else {
    const format = UglifyJS.minify(result, option)
    if (format.error) {
      fs.writeFileSync('./output.js', format.error)
    } else {
      fs.writeFileSync('./output.js', format.code)
    }
  }
}

entry()