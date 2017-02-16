var _ = require('lodash');
var EventProxy = require('eventproxy');

var industry_wines = function(server) {
	return {
		find_by_product_id : function(product_id, cb) {
			var query = `select a.origin,a.capacity,a.degree,a.level,a.type,
				a.specifications,a.carton,a.row_materials
			 	from industry_wines a
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

module.exports = industry_wines;
