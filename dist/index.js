'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Paquet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _koa = require('./frameworks/koa');

var _koa2 = _interopRequireDefault(_koa);

var _express = require('./frameworks/express');

var _express2 = _interopRequireDefault(_express);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultFramework = 'koa';

var Paquet = exports.Paquet = function () {
	function Paquet(options) {
		_classCallCheck(this, Paquet);

		if (options && options.hasOwnProperty('generators')) this.generators = options.generators;
	}

	_createClass(Paquet, [{
		key: 'start',
		value: function start(options) {
			if (options) {
				if (!options.port) options.port = 3000;

				if (this.generators) this.instance = (0, _koa2.default)(options);else this.instance = (0, _express2.default)(options);

				return this;
			} else throw new Error("options not defined.");
		}
	}, {
		key: 'route',
		value: function route(obj) {
			var router = this.instance.app;
			if (this.generators) router = this.instance.router;
			_lodash2.default.map(obj, function (route, method) {
				_lodash2.default.map(route, function (controllers, url) {
					if (!controllers[0]) controllers = [controllers];
					router[method].apply(router, [url].concat(controllers));
				});
			});
		}
	}]);

	return Paquet;
}();