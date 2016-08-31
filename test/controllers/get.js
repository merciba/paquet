module.exports = {
	'/file/:id': function () { 
		this.response.serveFile(`./test/files/${this.params.id}`) 
	},
	'/post/:id': function () {
		this.response.success({ title: "My post", author: "random guy" })
	},
	'/error': function () {
		this.response.error(404, "uh oh! an error!")
	}
}