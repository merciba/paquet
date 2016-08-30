'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV === 'development') {
	try {
		_fs2.default.accessSync(process.cwd(), '.env');
		_dotenv2.default.config({ silent: true });
	} catch (e) {}
}

var Express = function Express(options) {
	var instance = {};

	instance.app = (0, _express2.default)();

	instance.app.use((0, _morgan2.default)('dev'));

	instance.app.use(_bodyParser2.default.json());
	instance.app.use(_bodyParser2.default.urlencoded({ extended: true }));
	instance.app.use((0, _cookieParser2.default)());

	instance.app.use(function (request, response, next) {
		response.success = function (result) {
			response.json({ status: 200, data: result });
		};
		response.error = function (statusCode, err) {
			var code = statusCode || 500;
			response.status(code).json({ status: code, data: err });
		};
		next();
	});

	if (options.middleware) _lodash2.default.map(options.middleware, function (middleware) {
		return instance.app.use(function (request, response, next) {
			instance.request = request;
			instance.response = response;

			var m = middleware.apply(instance, [req, res, next]);

			if (m.then && typeof m.then === 'function') m.then(function (res) {
				return response.locals = res;
			});else if (typeof m === 'function') m();else response.locals = m;

			next();
		});
	});

	if (options.public) instance.app.use(_express2.default.static(options.public));

	if (options.routes) _lodash2.default.map(options.routes, function (route, method) {
		_lodash2.default.map(route, function (controllers, url) {
			if (!controllers[0]) controllers = [controllers];
			instance.app[method].apply(instance.app, [url].concat(controllers.map(function (controller) {
				return function (req, res, next) {
					instance.request = req;
					instance.response = res;
					controller.apply(instance, [req, res, next]);
				};
			})));
		});
	});else throw new Error("options.routes is not defined.");

	instance.app.listen(options.port, function () {
		return console.log(('[' + options.name + '] listening at port ' + options.port).green);
	});

	return instance;
};

exports.default = Express;