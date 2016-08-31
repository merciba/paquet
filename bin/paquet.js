#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Paquet = require('../index.js')
const pkg = require(path.join(__dirname, '../package.json'))

const CLI = function (args) {
	
	if (args[0] && fs.existsSync(__dirname+"/"+args[0]+".js")) require("./"+args[0]+".js")(instance)
	else {
		const instance = {}
		instance.pkg = pkg
		instance.log = log
		instance.done = done
		instance.mode = 'es5'
		instance.config = {}

		_.map(args, function (arg, index) {
			if ((arg[0] === '-') && (arg[1] === '-')) {
				let option = arg.replace('--', '')
				if (option === 'mode') {
					if (args[index+1] === 'es6') instance.mode = 'es6'
					else if (args[index+1] === 'es5') instance.mode = 'es5'
				}
				if (option === 'port') {
					if (!/\D/.test(args[index+1])) instance.config.port = args[index+1]
				}
				if ((option === 'name') || (option === 'public') || (option === 'middleware')) {
					if (typeof args[index+1] === 'string') instance.config[option] = args[index+1]
				}
			}
		})

		try {
			loadedConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'paquet.json'), { encoding: 'utf8' }))
			_.map(loadedConfig, function (value, key) {
				if (!instance.config[key]) instance.config[key] = value
			})
		}
		catch (e) {
			if (!instance.config.public && instance.config.routes) instance.done("No paquet.json could be found, and minimum flags not set.".red)
		}

		instance.paquet = new Paquet(instance.mode)

		if (instance.config.public || instance.config.routes) {
			if (instance.config.middleware) instance.config.middleware = require(path.join(process.cwd(), instance.config.middleware))
			if (instance.config.routes) _.map(instance.config.routes, function (location, method) {
				instance.config.routes[method] = require(path.join(process.cwd(), location))
			})

			instance.paquet.start(instance.config)
		}
		else done("Paquet must have, at minimum, either a public folder or routes")
	}
	
}

function log(str) {
	console.log(`[${pkg.name}]`.yellow.bgRed, str)
}

function done(exitmsg) {
	if (exitmsg) this.log(exitmsg)
	process.exit(0)
} 

CLI(process.argv.slice(2, 10))