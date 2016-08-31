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

var _coViews = require('co-views');

var _coViews2 = _interopRequireDefault(_coViews);

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

function serve(dir) {
	dir = dir.replace('./', process.cwd() + '/');
	return regeneratorRuntime.mark(function _callee() {
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						if (this.path[this.path.length - 1] === '/') this.response.serveFile(_path2.default.join(dir, 'index.html'));else this.response.serveFile(_path2.default.join(dir, this.path));

					case 1:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	});
}

var Koa = function Koa(options) {
	var instance = {};
	var render = (0, _coViews2.default)(options.views || process.cwd(), {
		map: {
			html: 'swig'
		}
	});

	instance.app = (0, _koa2.default)();
	instance.router = require('koa-router')();

	(0, _koaQs2.default)(instance.app);

	instance.app.use((0, _koaLogger2.default)()).use((0, _koaBody2.default)()).use((0, _koaStrongParams2.default)()).use((0, _koaUseragent2.default)()).use(regeneratorRuntime.mark(function _callee2(next) {
		var _this = this;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						this.response.render = render;
						this.response.success = function (result) {
							_this.response.status = 200;
							if (!result) result = { message: options.name + ' is up and running :)' };
							if (typeof result === 'string') _this.response.body = result;else _this.response.body = { status: 200, data: result };
						};
						this.response.error = function (statusCode, err) {
							var code = statusCode || 500;
							_this.response.status = code;
							_this.response.body = { status: code, data: err };
						};
						this.response.serveFile = function (path) {
							try {
								_this.response.body = _fs2.default.readFileSync(path, { 'encoding': 'utf8' });
							} catch (e) {
								_this.response.error(404, "Not Found");
							}
						};
						_context2.next = 6;
						return next;

					case 6:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	if (options.middleware) _lodash2.default.map(options.middleware, function (middleware, path) {
		var _marked = [middleWareWrapper].map(regeneratorRuntime.mark);

		if (path && typeof middleware === 'string') instance.app.use((0, _koaMount2.default)(path, serve(middleware)));else if (path) instance.app.use((0, _koaMount2.default)(path, middleWareWrapper));else instance.app.use(middleWareWrapper);

		function middleWareWrapper(next) {
			var m;
			return regeneratorRuntime.wrap(function middleWareWrapper$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							_context3.next = 2;
							return middleware(next).bind(this);

						case 2:
							m = _context3.sent;

							if (!(typeof m === 'function')) {
								_context3.next = 8;
								break;
							}

							_context3.next = 6;
							return m();

						case 6:
							_context3.next = 9;
							break;

						case 8:
							response.locals = m;

						case 9:
							_context3.next = 11;
							return next;

						case 11:
						case 'end':
							return _context3.stop();
					}
				}
			}, _marked[0], this);
		}
	});

	instance.app.use(instance.router.routes());
	if (options.public) instance.app.use(serve(options.public));

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