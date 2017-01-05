var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_pictures = function(server) {
	return {
		//根据id找到商品大图
		find_by_product_id : function(product_id, callback) {
			var query = `select location from products_pictures where product_id = ? and order_index =1 and flag =0` ;
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
		//根据id找到商品图片
		find_pictures : function(product_ids, callback) {
			var query = `select a.location,a.product_id  from products_pictures a
				where a.product_id in (?) and a.flag =0
				and a.order_index = 1` ;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_ids], function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},
		//根据ids找到商品图片
		find_products_pictures : function(product_ids, callback) {
			var query = `select a.location,a.product_id  from products_pictures a
				where a.product_id in (?) and a.flag =0
				and a.order_index = 2` ;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_ids], function(err, results) {
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
