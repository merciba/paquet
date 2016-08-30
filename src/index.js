import koa from './frameworks/koa'
import express from './frameworks/express'
import _ from 'lodash'
const defaultFramework = 'koa'

export class Paquet {

	constructor(options) {
		if (options && options.hasOwnProperty('generators')) this.generators = options.generators
	}

	start(options) {
		if (options) {
			if (!options.port) options.port = 3000

			if (this.generators) this.instance = koa(options)
			else this.instance = express(options)

			return this
		}
		else throw new Error("options not defined.")
	}

	route(obj) {
		let router = this.instance.app
		if (this.generators) router = this.instance.router
		_.map(obj, (route, method) => {
			_.map(route, (controllers, url) => {
				if (!controllers[0]) controllers = [controllers]
				router[method].apply(router, [url].concat(controllers))
			}) 
		}) 
	}
}
