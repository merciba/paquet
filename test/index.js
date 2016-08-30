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

var API = new Paquet()

API.start({
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
