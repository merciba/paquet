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

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV === 'development') {
	try {
		_fs2.default.accessSync(process.cwd(), '.env');
		_dotenv2.default.config({ silent: true });
	} catch (e) {}
}

function setContext(ctx, req, res, next) {
	ctx.request = req;
	ctx.params = req.params;
	ctx.path = req.path;
	ctx.response = res;
	ctx.state = res.locals;
	ctx.cookies = {
		set: function set(name, value, opts) {
			return req.cookies[name] = value;
		},
		get: function get(name) {
			return req.cookies[name];
		}
	};
	ctx.session = req.session;
	return ctx;
}

var Express = function Express(options) {
	if (!options.routes && !options.public) throw new Error("Either options.routes or options.public must be defined.");

	var instance = {};

	instance.app = (0, _express2.default)();

	instance.app.use((0, _morgan2.default)('dev'));

	instance.app.use(_bodyParser2.default.json());
	instance.app.use(_bodyParser2.default.urlencoded({ extended: true }));
	instance.app.use((0, _cookieParser2.default)());

	if (options.session && options.session.name && options.session.keys) {
		instance.app.set('trust proxy', 1);
		instance.app.use((0, _cookieSession2.default)(options.session));
	}

	instance.app.use(function (request, response, next) {
		response.success = function (result) {
			response.json({ status: 200, data: result });
		};
		response.error = function (statusCode, err) {
			var code = statusCode || 500;
			response.status(code).json({ status: code, data: err });
		};
		response.serveFile = function (file) {
			try {
				response.sendFile(file, { root: process.cwd() });
			} catch (e) {
				response.error(404, "Not Found");
			}
		};
		next();
	});

	if (options.middleware) _lodash2.default.map(options.middleware, function (middleware, path) {
		if (typeof path === 'string' && typeof middleware === 'string') instance.app.use(path, _express2.default.static(middleware));else if (typeof path === 'string' && typeof middleware === 'function') instance.app.use(path, middleWareWrapper(middleware));else if (typeof path === 'string' && middleware[0]) instance.app.use.apply(instance.app, [path].concat(_lodash2.default.map(middleware, function (m) {
			return middleWareWrapper(m);
		})));else if (middleware[0]) instance.app.use.apply(instance.app, _lodash2.default.map(middleware, function (m) {
			return middleWareWrapper(m);
		}));else instance.app.use(middleWareWrapper(middleware));

		function middleWareWrapper(mw) {
			return function (request, response, next) {
				var ctx = setContext(instance, request, response, next);
				var m = mw.apply(ctx, [request, response, next]);

				if (m && m.then && typeof m.then === 'function') {
					m.then(function (res) {
						response.locals = ctx.state;
						next();
					});
				} else if (m === next) {
					response.locals = ctx.state;
					next();
				} else next();
			};
		}
	});

	if (options.public) instance.app.use(_express2.default.static(options.public));

	if (options.routes) _lodash2.default.map(options.routes, function (route, method) {
		_lodash2.default.map(route, function (controllers, url) {
			if (!controllers[0]) controllers = [controllers];
			instance.app[method].apply(instance.app, [url].concat(controllers.map(function (controller) {
				return function (req, res, next) {
					var ctx = setContext(instance, req, res, next);
					controller.apply(ctx, [req, res, next]);
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