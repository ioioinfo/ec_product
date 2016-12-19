var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_pictures = function(server) {
	return {
		find_by_product_id : function(product_id, callback) {
			var query = `select * from products_pictures where product_id = ?` ;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, product_id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

	};
};

module.exports = products_pictures;
