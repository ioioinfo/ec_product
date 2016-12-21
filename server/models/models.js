// Base routes for default index/root path, about page, 404 error pages, and others..
exports.register = function(server, options, next){

	server.expose('products_industries', require('./products_industries.js')(server));
	server.expose('wines_industry', require('./wines_industry.js')(server));
	server.expose('products', require('./products.js')(server));
	server.expose('industries_configures', require('./industries_configures.js')(server));
	server.expose('products_pictures', require('./products_pictures.js')(server));
	server.expose('products_details', require('./products_details.js')(server));

	next();
}

exports.register.attributes = {
    name: 'models'
};
