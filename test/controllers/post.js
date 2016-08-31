module.exports = {
	'/cookie/:id': function () { 
		this.cookies.set(this.params.id, 'value')
		this.response.success({ id: this.params.id })
	}
}