var Paquet = require('../index')

var generatorsAPI = new Paquet({ generators: true })

generatorsAPI.start({
	name: 'Paquet API (with generators)',
	routes: {
		get: {
			'/': function * () { 
				this.response.sendFile(`${__dirname}/public/index.html`) 
			},
			'/error': function * () {
				this.response.error(404, "uh oh! an error!")
			}
		}
	}
})

generatorsAPI.route({
	get: {
		'/generators-only': function * () { this.response.success("This is a generators-only route") }
	}
})

var normalAPI = new Paquet()

normalAPI.start({
	port: 3001,
	name: 'Paquet API (without generators)',
	routes: {
		get: {
			'/': function () { 
				this.response.sendFile(`${__dirname}/public/index.html`) 
			},
			'/error': function () {
				this.response.error(404, "uh oh! an error!")
			}
		}
	}
})

normalAPI.route({
	get: {
		'/normal': function * () { this.response.success("This is a normal, everyday route") }
	}
})
