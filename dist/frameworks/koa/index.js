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

var _koaSession = require('koa-session');

var _koaSession2 = _interopRequireDefault(_koaSession);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.NODE_ENV === 'development') {
	try {
		_fs2.default.accessSync(process.cwd(), '.env');
		_dotenv2.default.config({ silent: true });
	} catch (e) {}
}

function validateMiddleware(arg) {
	if (typeof arg === 'string') return arg;else if (arg[0]) return _lodash2.default.filter(arg, function (o) {
		return isGeneratorFunction(o);
	});else return isGeneratorFunction(arg);

	function isGenerator(obj) {
		return 'function' == typeof obj.next && 'function' == typeof obj.throw;
	}

	function isGeneratorFunction(obj) {
		var c = obj.constructor;
		if (!c) return false;else if ('GeneratorFunction' === c.name || 'GeneratorFunction' === c.displayName) return obj;else if (isGenerator(c.prototype)) return obj;else return false;
	}
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
	if (!options.routes && !options.public) throw new Error("Either options.routes or options.public must be defined.");

	var instance = {};
	var render = (0, _coViews2.default)(options.views || process.cwd(), {
		map: {
			html: 'swig'
		}
	});

	instance.app = (0, _koa2.default)();
	instance.router = require('koa-router')();

	(0, _koaQs2.default)(instance.app);

	instance.app.use((0, _koaLogger2.default)()).use((0, _koaBody2.default)()).use((0, _koaStrongParams2.default)()).use((0, _koaUseragent2.default)());

	if (options.session && options.session.name && options.session.keys) {
		(function () {
			instance.app.keys = options.session.keys;
			var opts = { key: options.session.name };
			_lodash2.default.map(options, function (value, key) {
				return opts[key] = value;
			});
			instance.app.use((0, _koaSession2.default)(instance.app, opts));
		})();
	}

	instance.app.use(regeneratorRuntime.mark(function _callee2(next) {
		var _this = this;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						this.response.render = render;
						this.response.success = function (result) {
							_this.response.status = 200;
							if (!result) result = { message: options.name + ' is up and running :)' };
							if (typeof result === 'string') {
								_this.type = 'text/html';
								_this.response.body = result;
							} else {
								_this.type = 'application/json';
								_this.response.body = { status: 200, data: result };
							}
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
		middleware = validateMiddleware(middleware);
		if (path === '/*') path = '/';
		if (middleware) {
			if (typeof path === 'string' && typeof middleware === 'string') instance.app.use((0, _koaMount2.default)(path, serve(middleware)));else if (typeof path === 'string' && !middleware[0]) instance.app.use((0, _koaMount2.default)(path, middleware));else if (typeof path === 'string' && middleware[0]) _lodash2.default.map(middleware, function (m) {
				return instance.app.use((0, _koaMount2.default)(path, m));
			});else if (middleware[0]) _lodash2.default.map(middleware, function (m) {
				return instance.app.use(m);
			});else instance.app.use(middleware);
		} else throw new Error("ES6 mode requires generators as middleware.");
	});

	instance.app.use(instance.router.routes());
	if (options.public) instance.app.use(serve(options.public));

	if (options.errorHandler) instance.app.on('error', options.errorHandler);
	if (options.routes) _lodash2.default.map(options.routes, function (route, method) {
		_lodash2.default.map(route, function (controllers, url) {
			if (!controllers[0]) controllers = [controllers];
			instance.router[method].apply(instance.router, [url].concat(controllers));
		});
	});

	instance.app.listen(options.port);

	console.log(('[' + options.name + '] listening at port ' + options.port).green);

	return instance;
};

exports.default = Koa;