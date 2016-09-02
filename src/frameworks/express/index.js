'use strict';

import _ from 'lodash'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import colors from 'colors'
import fs from 'fs'
import session from 'express-session'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import logger from 'morgan'

if (process.env.NODE_ENV === 'development') {
	try {
	    fs.accessSync(process.cwd(), '.env');
	    dotenv.config({silent: true})
	} catch (e) {}
}

function setContext(ctx, req, res, next) {
	ctx.request = req
	ctx.params = req.params
	ctx.path = req.path
	ctx.response = res
	ctx.state = res.locals
	ctx.cookies = {
		set: (name, value, opts) => req.cookies[name] = value,
		get: (name) => req.cookies[name]
	}
	ctx.session = req.session
	return ctx
}

const Express = function (options) {
	if (!options.routes && !options.public) throw new Error("Either options.routes or options.public must be defined.")

	const instance = {}

	instance.app = express()

	instance.app.use(logger('dev'))

	instance.app.use(bodyParser.json())
	instance.app.use(bodyParser.urlencoded({ extended: true }))
	instance.app.use(cookieParser())

	if (options.session && options.session.name && options.session.keys) {
		instance.app.set('trust proxy', 1)
		instance.app.use(cookieSession(options.session))
	}

	instance.app.use(function (request, response, next) {
		response.success = function (result) {
			response.json({ status: 200, data: result })
		}
		response.error = function (statusCode, err) {
			const code = statusCode || 500
			response.status(code).json({ status: code, data: err })
		}
		response.serveFile = function (file) {
			try {
				response.sendFile(file, { root: process.cwd() })
			}
			catch (e) {
				response.error(404, "Not Found")
			}
		}
		next()
	})

	if (options.middleware) _.map(options.middleware, (middleware, path) => {
		if ((typeof path === 'string') && (typeof middleware === 'string')) instance.app.use(path, express.static(middleware))
		else if ((typeof path === 'string') && (typeof middleware === 'function')) instance.app.use(path, middleWareWrapper(middleware))
		else if ((typeof path === 'string') && middleware[0]) instance.app.use.apply(instance.app, [path].concat(_.map(middleware, (m) => middleWareWrapper(m))))
		else if (middleware[0]) instance.app.use.apply(instance.app, _.map(middleware, (m) => middleWareWrapper(m) ))
		else instance.app.use(middleWareWrapper(middleware))

		function middleWareWrapper(mw) {
			return function(request, response, next) {
				let ctx = setContext(instance, request, response, next)
				let m = mw.apply(ctx, [request, response, next])

				if (m && m.then && (typeof m.then === 'function')) {
					m.then((res) => {
						response.locals = ctx.state
						next()
					})
				}
				else if (m === next) {
					response.locals = ctx.state
					next()
				}
				else next()
			}
		}
	})

	if (options.public) instance.app.use(express.static(options.public))

	if (options.routes) _.map(options.routes, (route, method) => {
		_.map(route, (controllers, url) => {
			if (!controllers[0]) controllers = [controllers]
			instance.app[method].apply(instance.app, [url].concat(controllers.map((controller) => {
				return function (req, res, next) {
					let ctx = setContext(instance, req, res, next)
					controller.apply(ctx, [req, res, next])
				}
			})))
		})
	})
	else throw new Error("options.routes is not defined.")

	instance.app.listen(options.port, () => console.log(`[${options.name}] listening at port ${options.port}`.green))

	return instance
}

export { Express as default }
