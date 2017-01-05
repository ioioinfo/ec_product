var _ = require('lodash');
var EventProxy = require('eventproxy');

var products = function(server) {
	return {
		find_by_industry : function(industry_id, callback) {
			var query = `select id, product_name, product_sale_price,
			product_marketing_price, product_brand, sale_id,  after_sale_id, same_code,
			sku_id, product_describe, industry_id, time_to_market,
			code, color, report_id, service_id, pay_way, product_suggestion,
			send_way, weight, delivery_area, is_sale, is_presale, is_preorder,
			is_down, is_gift_product, is_time_limit_sale, price_stage, barcode,
			is_group_product, is_replace_product, is_crazy_product,
			is_point_product, is_net_point,is_free_product, is_low_price_product,
			origin, module_number FROM products where industry_id =? and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, industry_id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

		find_by_id : function(id, callback) {
			var query = `select id, product_name, product_sale_price,
			product_marketing_price, product_brand,sale_id,  after_sale_id, same_code,
			sku_id, product_describe, industry_id, time_to_market,
			code, color, report_id, service_id, pay_way, product_suggestion,
			send_way, weight, delivery_area, is_sale, is_presale, is_preorder,
			is_down, is_gift_product, is_time_limit_sale, price_stage, barcode,
			is_group_product, is_replace_product, is_crazy_product,
			is_point_product, is_net_point,is_free_product, is_low_price_product,
			origin, module_number FROM products where id =? and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

		find_same_product : function(same_code, callback) {
			var query = `select id FROM products where same_code=? and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {

				connection.query(query, [same_code], function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

		find_products : function(product_ids, cb) {
			var query = `select * FROM products where id in (?) and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {

				connection.query(query, [product_ids], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}

					cb(false,rows);
				});
			});
		},
		find_pos_product : function(product_id, cb) {
			var query = `select a.id,a.product_name, a.product_sale_price, a.product_brand,
			a.industry_id, a.color FROM products a where a.id =? and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_id], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},

	};
};

module.exports = products;
