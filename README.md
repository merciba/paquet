# Paquet

A highly-modular REST API meta-framework

---

Paquet is a REST API framework with a specific mission: To get a REST API set up as quickly and effortlessly as possible, with a full suite of production-ready features. Paquet was written so that you could use one line and a config object to spin up a REST API - written entirely in ES6.

Under the hood, Paquet is simply leveraging [Express](https://expressjs.com) and Koa to give you two basic options - one with generator functions and one in vanilla ES5. 

Paquet is not claiming to be something new, it simply makes what's out there more accessible and intuitive to get started with. Instead of worrying about whether you've installed nad loaded all the correct middleware, Paquet ships with some basic features out of the box, such as: 

	* Body parsing
	* Cookie parsing
	* URL Querystring parsing
	* Serving static files

Plus, you can still load the Express/Koa middleware you know and love!

## Install

```
npm install --save paquet
```

## Gettting Started

### ES6

``` JavaScript
import Paquet from 'paquet'

const paquet = new Paquet({ generators: true })

paquet.start({
	port: 8080 																// optional, defaults to 3000
	name: 'My new app',														// required
	routes: {																// required
		get: {
			'/': function * () { 												// routes can be functions or arrays of functions
				this.response.sendFile(`${__dirname}/public/index.html`) 
			},
			'/error': function * () {
				this.response.error(404, "uh oh! an error!")
			}
		}
	},
	middleware: [															// optional
		someKoaMiddleware()
	]
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
	port: 8080 																// optional, defaults to 3000
	name: 'My new app',														// required
	routes: {																// required
		get: {
			'/': function () { 												// Syntax is identical, except the absence of generators
				this.response.sendFile(`${__dirname}/public/index.html`) 
			},
			'/error': function () {
				this.response.error(404, "uh oh! an error!")
			}
		}
	},
	middleware: [															// optional
		someExpressMiddleware()
	]
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

This project is brand new, so there will inevitably be some bugs. Please file an issue with this repo and I'll get to it as soon as I can. 

- Alfonso
