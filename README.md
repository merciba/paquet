# Paquet

A practical REST API framework

[![NPM](https://nodei.co/npm/paquet.png)](https://nodei.co/npm/paquet/)  

[![Build Status](https://travis-ci.org/merciba/paquet.svg?branch=master)](https://travis-ci.org/merciba/paquet)  [![License](https://img.shields.io/npm/l/paquet.svg)](https://github.com/merciba/paquet/blob/master/LICENSE) [![Gratipay](http://img.shields.io/gratipay/merciba.svg)](https://gratipay.com/merciba/)

Paquet is a REST API framework with a specific mission: To get a REST API set up as quickly and effortlessly as possible, with a full suite of production-ready features. Paquet was written so that you could use one line and an object structure to spin up a REST API - written entirely in ES6.

Under the hood, Paquet is simply leveraging [Express](https://expressjs.com) and [Koa](http://koajs.com/) to give you two basic options - ES6 with [generator functions](https://davidwalsh.name/es6-generators) and ES5. 

## Table of Contents

[Install](#install)   
[Examples](#examples)   
[API](#api)  
[Notes](#notes)  
[Contributors](#contributors)  

### Okay, so who is this for? Why wouldn't I just use Express or Koa?

Paquet is for: 

 * front-end developers who want to get started quickly with a basic API for their single-page React or Angular app to consume
 * anyone who wants to use ES5 and ES6 syntax without switching frameworks
 * human beings just starting out with Node.js who want a more opinionated framework
 * experienced developers who want object-based mapping between routes and controllers

Paquet is not claiming to be something new, it simply makes what's out there more accessible and intuitive to get started with, by unifying their APIs. Instead of worrying about whether you've installed and loaded all the correct middleware, Paquet ships with some basic features out of the box, such as: 

 * Body parsing
 * Cookie parsing
 * URL Querystring parsing
 * Serving static files

Plus, you can still load the Express/Koa middleware you know and love!

When you create an API using `var paquet = new Paquet(mode).start(options)`, the underlyng Koa/Express app will always be accessible as `paquet.instance.app`.

## Install

### CLI

```
npm install paquet -g
```

### Module

```
npm install paquet --save
```

## Examples

### Using the CLI

```
paquet --public ./public --middleware ./middleware.js
```

This would start an API on the default port 3000 and point the static file server at ./public (relative to your project's root) and load middleware from the file `middleware.js` in your project's root. 

To specify `routes`, use a `paquet.json` in your project's root. Here's an [example paquet.json](https://gist.github.com/merciba/f72f7dd0f910e7eb46a21eaf8fed9f32).

### ES6

``` JavaScript
import Paquet from 'paquet'

const paquet = new Paquet('es6')

paquet.start({
	port: 9090,																// optional, defaults to 3000
	name: 'helloworld',														// optional
	public: './test/public',												// optional
	middleware: {															// optional
		'/docs': './test/docs'
	},
	routes: {																// required
		get: {
			'/file/:id': function * () { 
				this.response.serveFile(`./test/files/${this.params.id}`) 
			},
			'/post/:id': [
				function * (next) {
					yield next
				},
				function * () {
					this.response.success({ title: "My post", author: "random guy" })
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
```

That's it - all your declaraion upon instantiation. Of course, you're still able to do this: 

``` JavaScript
paquet.route({ 
	get: {
		'/new-route': function * () {
			this.response.success("A new route for my new app")
		}
	}
})
```

after the fact.

### ES5

``` JavaScript
var Paquet = require('paquet')

var paquet = new Paquet()

paquet.start({
	port: 9090,																
	name: 'helloworld',														
	public: './test/public',												
	middleware: {															
		'/docs': './test/docs'
	},
	routes: {																// syntax is identical. except for the absence of generators
		get: {
			'/file/:id': function () { 
				this.response.serveFile('./test/files/' + this.params.id) 
			},
			'/post/:id': [
				function (req, res, next) {
					return next												// You can also call next() or not call it at all, it's all good. 
				},															// You can even return a promise :)
				function () {
					this.response.success({ title: "My post", author: "random guy" })
				}
			],
			'/error': function() {
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
```

And, you're still able to do this: 

``` JavaScript
paquet.route({ 
	get: {
		'/new-route': function () {
			this.response.success("A new route for my new app")
		}
	}
})
```

after the fact, as well.

## API

### Constructor

#### `new Paquet(mode)`
 
Creates a new instance of class `Paquet`.  

`mode` Defaults to `es5`. When `es6`, Paquet will only accept [generator functions](https://davidwalsh.name/es6-generators) as middleware and routes.

### Instance Methods

#### `.start(options)`

Starts a Paquet API with the following available options: 

 * `name: String`, required
 * `port: Number`, optional. Defaults to 3000
 * `public: String`, optional. Sets a folder as a static file server
 * `middleware: Object`, optional. Inserts middleware before the routes

`options.middleware` object has the following structure: 

 ```JavaScript
 {
 	'/:path': (String|Array|Function),
 	...
 }
 ```

 When a String is passed, if it is a valid path, this path will also be set as a static file server, accessible at `/:path`.  

 When an Array of functions is passed, these will be injected as cascading middleware into the stack.  

 When a single Function is passed, the function will be injected into the stack.  

 * `routes: Object`, required. Sets the routes for your app

`options.routes` object has the following structure: 

 ```JavaScript
 {
 	'(get|post|put|patch|delete)': {
 		'/:path': (Array|Function),
 		...
 	},
 	...
 }
 ```

#### .route(routes)

Helper method - behaves identically to `options.routes`, allowing you to add new routes later on in your code.

## Notes

This project is brand new, so there will inevitably be some bugs. Please file an issue with this repo and I'll get to it as soon as I can. 

Coming soon: 

 * Plugins
 * ES7 async/await support via Koa 2

## Contributors

- [Alfonso Gober](https://www.linkedin.com/in/alfonsogober)
