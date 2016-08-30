#!/usr/bin/env node

const fs = require('fs-sync')
const path = require('path')
const pkg = require(path.join(__dirname, '../package.json'))

const CLI = function (args) {
	
	this.pkg = pkg
	this.log = log
	this.done = done

	if (args[0] && (args[0][0] === '-')) {
		// handle flags
		switch (args[0]) {
			case '-v':
				this.done("v"+this.pkg.version)
		}
	}
	else if (args[0] && fs.exists(__dirname+"/"+args[0]+".js")) require("./"+args[0]+".js")(this)
	else this.log(`usage: ${pkg.name} <command> [<args>]`)
}

function log(str) {
	console.log(`[${pkg.name}]`.yellow.bgRed, str)
}

function done(exitmsg) {
	if (exitmsg) this.log(exitmsg)
	process.exit(0)
} 

module.exports = new CLI(process.argv.slice(2, 3))