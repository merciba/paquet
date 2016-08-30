'use strict'

require('babel-polyfill')

import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import dotenv from 'dotenv'
import koa from 'koa'
import logger from 'koa-logger'
import serve from 'koa-static'
import parse from 'koa-body'
import params from 'koa-strong-params'
import userAgent from 'koa-useragent'
import qs from 'koa-qs'
import mount from 'koa-mount'
import Promise from 'bluebird'

if (process.env.NODE_ENV === 'development') {
	try {
	    fs.accessSync(process.cwd(), '.env');
	    dotenv.config({silent: true})
	} catch (e) {}
}

const Koa = function (options) {
	const instance = {};

	instance.app = koa()
	instance.router = require('koa-router')()

	qs(instance.app)

	instance.app
		.use(logger())
		.use(parse())
		.use(params())
		.use(userAgent())
		.use(function * (next) {
			this.response.sendFile = (path) => {
				this.response.body = fs.readFileSync(path, {'encoding': 'utf8'})
			}
			this.response.success = (result) => {
				if (!result) result = { message: `${options.name} is up and running :)` }
				this.response.status = 200
				this.response.body = { status: 200, data: result }
			}
			this.response.error = (statusCode, err) => {
				const code = statusCode || 500
				this.response.status = code
				this.response.body = { status: code, data: err }
			}
			yield next
		})

	if (options.middleware) _.map(options.middleware, (middleware) => instance.app.use(function * (next) { 
		let m = yield middleware(this.request, this.response, next, instance)
		
		if (typeof m === 'function') yield m()
		else response.locals = m
		
		yield next 
	}))

	if (options.docs) instance.app.use(mount('/docs', serve(options.docs)))
	instance.app.use(instance.router.routes())

	if (options.errorHandler) instance.app.on('error', options.errorHandler)
	if (options.routes) _.map(options.routes, (route, method) => { 
		_.map(route, (controllers, url) => {
			if (!controllers[0]) controllers = [controllers]
			instance.router[method].apply(instance.router, [url].concat(controllers)) 
		})
	})
	else throw new Error("options.routes is not defined.")
	
	instance.app.listen(options.port);

	console.log(`[${options.name}] listening at port ${options.port}`.green)

	return instance
}

export { Koa as default }