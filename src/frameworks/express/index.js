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
import logger from 'morgan'

if (process.env.NODE_ENV === 'development') {
	try {
	    fs.accessSync(process.cwd(), '.env');
	    dotenv.config({silent: true})
	} catch (e) {}
}

function setContext(instance, req, res, next) {
	instance.request = req
	instance.params = req.params
	instance.response = res
	instance.cookies = {
		set: (name, value, opts) => req.cookies[name] = value,
		get: (name) => req.cookies[name]
	}
	return instance
}

const Express = function (options) {
	const instance = {}

	instance.app = express()

	instance.app.use(logger('dev'))

	instance.app.use(bodyParser.json())
	instance.app.use(bodyParser.urlencoded({ extended: true }))
	instance.app.use(cookieParser())

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
		if (path && (typeof middleware === 'string')) instance.app.use(path, express.static(middleware))
		else if (path && (typeof middleware === 'function')) instance.app.use(path, middleWareWrapper)
		else if (middleware[0]) instance.app.use.apply(instance.app, middleWareWrapper)
		else instance.app.use(middleWareWrapper)

		function middleWareWrapper(request, response, next) { 
			let ctx = setContext(instance, request, response, next)
			let m = middleware.apply(ctx, [request, response, next]) 
			
			if (m.then && (typeof m.then === 'function')) m.then((res) => response.locals = res)
			else {
				if (typeof m === 'function') m()
				else response.locals = m
				next()
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

