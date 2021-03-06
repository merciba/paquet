process.env.NODE_ENV = 'test'

const Paquet = require('../index')
const path = require('path')
const chai = require('chai');
const expect = chai.expect;
const request = require('request-promise')

require('mocha-generators').install()

var es6 = new Paquet('es6')
var es5 = new Paquet()

es6.start({
	port: 9090,
	name: 'Paquet API (ES6 mode)',
	public: `./test/public`,
	session: {
		name: 'paquet',
		keys: ['key1', 'key2']
	},
	middleware: {
		'/*': function * (next) {
		  if (this.path === '/favicon.ico') return;

		  var n = this.session.views || 0;
		  this.session.views = ++n;
			yield next
		},
		'/docs': `./test/docs`
	},
	routes: {
		get: {
			'/sessions/view_count': function * () {
				this.response.success(this.session.views)
			},
			'/file/:id': function * () {
				this.response.serveFile(`./test/files/${this.params.id}`)
			},
			'/post/:id': function * () {
				this.response.success({ title: "My post", author: "random guy" })
			},
			'/array': [
				function * (next) {
					this.state.first = true
					yield next
				},
				function * () {
					this.state.second = true
					this.response.success({ first: this.state.first, second: this.state.second })
				}
			],
			'/error': function * () {
				this.response.error(404, "uh oh! an error!")
			}
		},
		post: {
			'/cookie/:id': function * () {
				this.cookies.set(this.params.id, 'value')
				this.response.success({ id: this.params.id })
			}
		}
	}
})

es5.start({
	port: 9091,
	name: 'Paquet API (ES5 mode)',
	public: `./test/public`,
	session: {
		name: 'paquet',
		keys: ['key1', 'key2']
	},
	middleware: {
		'/*': function () {
		  if (this.path === '/favicon.ico') return;

		  var n = this.session.views || 0;
		  this.session.views = ++n;
		},
		'/docs': './test/docs'
	},
	routes: {
		get: {
			'/sessions/view_count': function () {
				this.response.success(this.session.views)
			},
			'/file/:id': function () {
				this.response.serveFile(`./test/files/${this.params.id}`)
			},
			'/post/:id': function () {
				this.response.success({ title: "My post", author: "random guy" })
			},
			'/array': [
				function (req, res, next) {
					this.state.first = true
					return next()
				},
				function () {
					this.state.second = true
					this.response.success({ first: this.state.first, second: this.state.second })
				}
			],
			'/error': function () {
				this.response.error(404, "uh oh! an error!")
			}
		},
		post: {
			'/cookie/:id': function () {
				this.cookies.set(this.params.id, 'value')
				this.response.success({ id: this.params.id })
			}
		}
	}
})

describe('Paquet', function() {

	describe('.start({ generators: true })', function() {

		it('public', function (done) {
			request('http://localhost:9090/')
				.then(function (res) {
					expect(res).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/ working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
					done()
				})
		})

		it('middleware', function (done) {
			request('http://localhost:9090/docs')
				.then(function (res) {
					expect(res).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/docs working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
					done()
				})
		})

		it('routes', function (done) {
			Promise.all([
				request('http://localhost:9090/file/test.html'),
				request('http://localhost:9090/post/1')
			]).then(function (res) {
				expect(res[0]).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/file/test.html working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
				expect(res[1]).to.equal('{"status":200,"data":{"title":"My post","author":"random guy"}}')
				done()
			})
		})

		it('cookies', function (done) {
			request({ method: 'POST', uri: 'http://localhost:9090/cookie/test', json: true })
				.then(function (res) {
					expect(res.data.id).to.equal('test')
					done()
				})
		})

		it('array', function (done) {
			request('http://localhost:9090/array')
				.then(function (res) {
					expect(res).to.equal('{"status":200,"data":{"first":true,"second":true}}')
					done()
				})
		})

		it('error', function (done) {
			request('http://localhost:9090/error')
				.then()
				.catch(function (err) {
					expect(err.statusCode).to.equal(404)
					expect(err.error).to.equal('{"status":404,"data":"uh oh! an error!"}')
					done()
				})
		})

		it('session', function (done) {
			request('http://localhost:9090/sessions/view_count')
				.then(function (res) {
					expect(res).to.equal('{"status":200,"data":1}')
					done()
				})
		})

	});

	describe('.start()', function() {

		it('public', function (done) {
			request('http://localhost:9091/')
				.then(function (res) {
					expect(res).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/ working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
					done()
				})
		})

		it('middleware', function (done) {
			request('http://localhost:9091/docs')
				.then(function (res) {
					expect(res).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/docs working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
					done()
				})
		})

		it('routes', function (done) {
			Promise.all([
				request('http://localhost:9091/file/test.html'),
				request('http://localhost:9091/post/1')
			]).then(function (res) {
				expect(res[0]).to.equal(`<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title>Paquet Test</title>\n    <!-- change this up! http://www.bootstrapcdn.com/bootswatch/ -->\n    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/cosmo/bootstrap.min.css" type="text/css" rel="stylesheet"/>\n  </head>\n\n  <body>\n  \t<h1>/file/test.html working!</h1>\n    <div id="app"></div>\n    <script src="client.min.js"></script>\n  </body>\n</html>`)
				expect(res[1]).to.equal('{"status":200,"data":{"title":"My post","author":"random guy"}}')
				done()
			})
		})

		it('cookies', function (done) {
			request({ method: 'POST', uri: 'http://localhost:9091/cookie/test', json: true })
				.then(function (res) {
					expect(res.data.id).to.equal('test')
					done()
				})
		})

		it('array', function (done) {
			request('http://localhost:9091/array')
				.then(function (res) {
					expect(res).to.equal('{"status":200,"data":{"first":true,"second":true}}')
					done()
				})
		})

		it('error', function (done) {
			request('http://localhost:9091/error')
				.then()
				.catch(function (err) {
					expect(err.statusCode).to.equal(404)
					expect(err.error).to.equal('{"status":404,"data":"uh oh! an error!"}')
					done()
				})
		})

		it('session', function (done) {
			request('http://localhost:9091/sessions/view_count')
				.then(function (res) {
					expect(res).to.equal('{"status":200,"data":1}')
					done()
				})
		})

	});
});
