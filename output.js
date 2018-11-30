
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
    })({0: [
      function (require, module, exports) {
        "use strict";

var _module = require("./module1.js");

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('loader replace here');
console.log(_module2.default);
      },
      {"./module1.js":1},
    ],1: [
      function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _module = require("./module2.js");

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var test = 'aa' + _module2.default;
exports.default = test;
      },
      {"./module2.js":2},
    ],2: [
      function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = 'Yhspehy';
      },
      {},
    ],})
  