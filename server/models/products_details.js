var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_details = function(server) {
	return {
		//找产品详情
		find_product_detail : function(product_id, callback) {
			var query = `select product_id, picture_location from products_details where product_id = ? and flag =0` ;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_id], function(err, results) {
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

module.exports = products_details;
