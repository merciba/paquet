import koa from './frameworks/koa'
import express from './frameworks/express'
import _ from 'lodash'

export class Paquet {

	constructor(mode) {
		if (mode && mode.generators) this.mode = 'es6'
		else if (mode === 'es6') this.mode = 'es6'
		else this.mdoe = 'es5'
	}

	start(options) {
		if (options) {
			if (!options.name) options.name = 'paquet'
			if (!options.port) options.port = 3000

			if (this.mode === 'es6') this.instance = koa(options)
			else this.instance = express(options)

			return this
		}
		else throw new Error("options not defined.")
	}

	route(obj) {
		let router = this.instance.app
		if (this.mode === 'es6') router = this.instance.router
		_.map(obj, (route, method) => {
			_.map(route, (controllers, url) => {
				if (!controllers[0]) controllers = [controllers]
				router[method].apply(router, [url].concat(controllers))
			}) 
		}) 
	}
}
