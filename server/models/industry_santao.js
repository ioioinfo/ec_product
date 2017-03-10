var _ = require('lodash');
var EventProxy = require('eventproxy');

var industry_santao = function(server) {
	return {
		find_by_product_id : function(product_id, cb) {
			var query = `select a.is_new,a.row_materials,a.size_name,
				a.batch_code,a.donator
			 	from industry_santao a
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

module.exports = industry_santao;
