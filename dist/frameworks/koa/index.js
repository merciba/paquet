'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaLogger = require('koa-logger');

var _koaLogger2 = _interopRequireDefault(_koaLogger);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _koaStrongParams = require('koa-strong-params');

var _koaStrongParams2 = _interopRequireDefault(_koaStrongParams);

var _koaUseragent = require('koa-useragent');

var _koaUseragent2 = _interopRequireDefault(_koaUseragent);

var _koaQs = require('koa-qs');

var _koaQs2 = _interopRequireDefault(_koaQs);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');

if (process.env.NODE_ENV === 'development') {
	try {
		_fs2.default.accessSync(process.cwd(), '.env');
		_dotenv2.default.config({ silent: true });
	} catch (e) {}
}

var Koa = function Koa(options) {
	var instance = {};

	instance.app = (0, _koa2.default)();
	instance.router = require('koa-router')();

	(0, _koaQs2.default)(instance.app);

	instance.app.use((0, _koaLogger2.default)()).use((0, _koaBody2.default)()).use((0, _koaStrongParams2.default)()).use((0, _koaUseragent2.default)()).use(regeneratorRuntime.mark(function _callee(next) {
		var _this = this;

		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						this.response.sendFile = function (path) {
							_this.response.body = _fs2.default.readFileSync(path, { 'encoding': 'utf8' });
						};
						this.response.success = function (result) {
							if (!result) result = { message: options.name + ' is up and running :)' };
							_this.response.status = 200;
							_this.response.body = { status: 200, data: result };
						};
						this.response.error = function (statusCode, err) {
							var code = statusCode || 500;
							_this.response.status = code;
							_this.response.body = { status: code, data: err };
						};
						_context.next = 5;
						return next;

					case 5:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	if (options.middleware) _lodash2.default.map(options.middleware, function (middleware) {
		return instance.app.use(regeneratorRuntime.mark(function _callee2(next) {
			var m;
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return middleware(this.request, this.response, next, instance);

						case 2:
							m = _context2.sent;

							if (!(typeof m === 'function')) {
								_context2.next = 8;
								break;
							}

							_context2.next = 6;
							return m();

						case 6:
							_context2.next = 9;
							break;

						case 8:
							response.locals = m;

						case 9:
							_context2.next = 11;
							return next;

						case 11:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));
	});

	if (options.docs) instance.app.use((0, _koaMount2.default)('/docs', (0, _koaStatic2.default)(options.docs)));
	instance.app.use(instance.router.routes());

	if (options.errorHandler) instance.app.on('error', options.errorHandler);
	if (options.routes) _lodash2.default.map(options.routes, function (route, method) {
		_lodash2.default.map(route, function (controllers, url) {
			if (!controllers[0]) controllers = [controllers];
			instance.router[method].apply(instance.router, [url].concat(controllers));
		});
	});else throw new Error("options.routes is not defined.");

	instance.app.listen(options.port);

	console.log(('[' + options.name + '] listening at port ' + options.port).green);

	return instance;
};

exports.default = Koa;