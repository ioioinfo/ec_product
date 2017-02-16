var _ = require('lodash');
var EventProxy = require('eventproxy');

var industry_women_clothes = function(server) {
	return {
		find_by_product_id : function(product_id, cb) {
			var query = `select a.origin,a.capacity,a.degree
			 	from industry_women_clothes a
				where product_id = ?
			`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, product_id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					cb(false,results);
				});
			});
		},

	};
};

module.exports = industry_women_clothes;
