var _ = require('lodash');
var EventProxy = require('eventproxy');

var products = function(server) {
	return {
		find_by_industry : function(industry_id, callback) {
			var query = `select id, product_name, product_sale_price,
			product_marketing_price, sale_id,  after_sale_id, same_code,
			sku_id, product_describe, industry_id, time_to_market,
			code, color, report_id, service_id, pay_way, product_suggestion,
			send_way, weight, delivery_area, is_sale, is_presale, is_preorder,
			is_down, is_gift_product, is_time_limit_sale, price_stage, barcode,
			is_group_product, is_replace_product, is_crazy_product,
			is_point_product, is_net_point,is_free_product, is_low_price_product,
			origin, module_number FROM products where industry_id =?`;

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
			product_marketing_price, sale_id,  after_sale_id, same_code,
			sku_id, product_describe, industry_id, time_to_market,
			code, color, report_id, service_id, pay_way, product_suggestion,
			send_way, weight, delivery_area, is_sale, is_presale, is_preorder,
			is_down, is_gift_product, is_time_limit_sale, price_stage, barcode,
			is_group_product, is_replace_product, is_crazy_product,
			is_point_product, is_net_point,is_free_product, is_low_price_product,
			origin, module_number FROM products where id =?`;

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

	};
};

module.exports = products;
