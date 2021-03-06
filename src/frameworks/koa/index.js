'use strict'

import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import dotenv from 'dotenv'
import koa from 'koa'
import logger from 'koa-logger'
import views from 'co-views'
import parse from 'koa-body'
import params from 'koa-strong-params'
import userAgent from 'koa-useragent'
import qs from 'koa-qs'
import mount from 'koa-mount'
import session from 'koa-session'
import Promise from 'bluebird'

if (process.env.NODE_ENV === 'development') {
	try {
	    fs.accessSync(process.cwd(), '.env');
	    dotenv.config({silent: true})
	} catch (e) {}
}

function validateMiddleware(arg) {
	if (typeof arg === 'string') return arg
	else if (arg[0]) return _.filter(arg, (o) => isGeneratorFunction(o))
	else return isGeneratorFunction(arg)

	function isGenerator(obj) {
	  return 'function' == typeof obj.next && 'function' == typeof obj.throw
	}

	function isGeneratorFunction(obj) {
	   var c = obj.constructor
	   if (!c) return false
	   else if ('GeneratorFunction' === c.name || 'GeneratorFunction' === c.displayName) return obj
	   else if (isGenerator(c.prototype)) return obj
		 else return false
	}
}

function serve(dir) {
	dir = dir.replace('./', `${process.cwd()}/`);
	return function * () {
		if (this.path[this.path.length - 1] === '/') this.response.serveFile(path.join(dir, 'index.html'))
		else this.response.serveFile(path.join(dir, this.path))
	}
}

const Koa = function (options) {
	if (!options.routes && !options.public) throw new Error("Either options.routes or options.public must be defined.")

	const instance = {};
	const render = views(options.views || process.cwd(), {
		map: {
			html: 'swig'
		}
	})

	instance.app = koa()
	instance.router = require('koa-router')()


	qs(instance.app)

	instance.app
		.use(logger())
		.use(parse())
		.use(params())
		.use(userAgent())

	if (options.session && options.session.name && options.session.keys) {
		instance.app.keys = options.session.keys
		let opts = { key: options.session.name }
		_.map(options, (value, key) => opts[key] = value)
		instance.app.use(session(instance.app, opts))
	}

	instance.app
		.use(function * (next) {
			this.response.render = render
			this.response.success = (result) => {
				this.response.status = 200
				if (!result) result = { message: `${options.name} is up and running :)` }
				if (typeof result === 'string') {
					this.type = 'text/html'
					this.response.body = result
				}
				else {
					this.type = 'application/json'
					this.response.body = { status: 200, data: result }
				}
			}
			this.response.error = (statusCode, err) => {
				const code = statusCode || 500
				this.response.status = code
				this.response.body = { status: code, data: err }
			}
			this.response.serveFile = (path) => {
				try {
					this.response.body = fs.readFileSync(path, {'encoding': 'utf8'})
				}
				catch (e) {
					this.response.error(404, "Not Found")
				}
			}
			yield next
		})

	if (options.middleware) _.map(options.middleware, (middleware, path) => {
		middleware = validateMiddleware(middleware)
		if (path === '/*') path = '/'
		if (middleware) {
			if ((typeof path === 'string') && (typeof middleware === 'string')) instance.app.use(mount(path, serve(middleware)))
			else if ((typeof path === 'string') && !middleware[0]) instance.app.use(mount(path, middleware))
			else if ((typeof path === 'string') && middleware[0]) _.map(middleware, (m) => instance.app.use(mount(path, m)))
			else if (middleware[0]) _.map(middleware, (m) => instance.app.use(m))
			else instance.app.use(middleware)
		}
		else throw new Error("ES6 mode requires generators as middleware.")
	})

	instance.app.use(instance.router.routes())
	if (options.public) instance.app.use(serve(options.public))

	if (options.errorHandler) instance.app.on('error', options.errorHandler)
	if (options.routes) _.map(options.routes, (route, method) => {
		_.map(route, (controllers, url) => {
			if (!controllers[0]) controllers = [controllers]
			instance.router[method].apply(instance.router, [url].concat(controllers))
		})
	})

	instance.app.listen(options.port);

	console.log(`[${options.name}] listening at port ${options.port}`.green)

	return instance
}

export { Koa as default }
