var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');

var products = function(server) {
	return {
		//单条商品上架
		product_up : function(id, cb) {
			var query = `update products set is_down = 1
			where id = ? and flag = 0
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [id], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
		//单条商品下架
		product_down : function(id, cb) {
			var query = `update products set is_down = 0
			where id = ? and flag = 0
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [id], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},

		get_products_list : function(cb) {
			var query = `select id,product_name,short_name,product_sale_price,industry_id
				,color,code,color,product_marketing_price,product_brand,weight,is_down,
				time_to_market, DATE_FORMAT(time_to_market,'%Y-%m-%d %H:%i:%S') up_to_marketing
				FROM products
				where flag =0
				limit 10
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},

		//查询商品总数
		get_products_count : function(cb) {
			var query = `select count(1) num
				FROM products
				where flag =0
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},

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

		find_by_id : function(id, cb) {
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
				connection.query(query, [id], function(err, results) {
					connection.release();
					if (err) {
						console.log(err);
						cb(true,null);
						return;
					}
					cb(false,results);
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
			var query = `select id,product_name,short_name,product_sale_price,industry_id
				,color,code,color,product_marketing_price,product_brand,weight
				FROM products
				where id in (?) and flag =0
			`;
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
		get_pos_product : function(product_id, cb) {
			var query = `select a.id,a.product_name, a.product_sale_price, a.product_brand,
				a.industry_id, a.color
				from products a
				where a.id =? and flag =0
			`;

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
		search_products : function(search_object,cb) {
			var query = `select a.id,a.product_name,a.short_name,a.product_sale_price,a.industry_id
				,a.color,a.code,a.color,a.product_marketing_price,a.product_brand,a.weight
				FROM products a
				where a.flag =0 and is_down = 0
			`;
			// sort_id
			if (search_object.sort_id) {
				query = query + " and a.sort_id like '" + search_object.sort_id+"%' ";
			}
			//q product_name
			if (search_object.q) {
				query = query + " and a.product_name like '%" + search_object.q + "%'";
			}
			if (search_object.size_name) {
				query = query + " and exists (select 1 from industry_santao b where a.id = b.product_id and b.size_name = '" + search_object.size_name + "')";
			}
			if (search_object.is_new) {
				query = query + " and exists (select 1 from industry_santao b where a.id = b.product_id and b.is_new = '" + search_object.is_new + "')";
			}
			if (search_object.row_materials) {
				query = query + " and exists (select 1 from industry_santao b where a.id = b.product_id and b.row_materials = '" + search_object.row_materials + "')";
			}
			if (search_object.sort_ids) {
				// var sort_ids = JSON.parse(search_object.sort_ids);
				// console.log("sort_ids:"+sort_ids);
				query = query + " and a.sort_id in " + search_object.sort_ids;
				// for (var i = 0; i < sort_ids.length; i++) {
				// 	query = query + " and a.sort_id ='" + sort_ids[i] +"'";
				// 	// console.log("sort_id:"+sort_id);
				// 	// if (i = 0) {
				// 	// 	query = query + " and a.sort_id ='" + sort_ids[0] +"'";
				// 	// }else {
				// 	// 	query = query + " or a.sort_id ='" + sort_ids[i] +"'";
				// 	// }
				// }
			}

			//排序
			if (search_object.sort) {
				query = query + " order by ";
				if (search_object.sort=="price_asc") {
					query = query + "a.product_sale_price asc";
				} else if (search_object.sort=="price_desc") {
					query = query + "a.product_sale_price desc";
				} else {
					query = query + "a.id";
				}
			}
			if (search_object.lastest) {
				query = query + " order by create_at desc";
			}
			if (search_object.num) {
				query = query + " limit "+search_object.num;
			}else {
				query = query + " limit 100 ";
			}


			console.log("query:"+query);
			server.plugins['mysql'].pool.getConnection(function(err, connection) {

				connection.query(query, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
		//保存商品
		save_product : function(product,cb){
			var product = JSON.parse(product);
			var query = `insert into products (id, product_name, sort_id,
			product_sale_price, product_marketing_price, product_brand,
			product_describe, time_to_market, color, weight, guarantee,code,
			create_at, update_at, flag)
			values
			(uuid(),?,?,
		 	?,?,?,
			?,?,?,?,?,
			now(),now(),0)` ;
			console.log(query);
			var columns=[product.product_name,product.sort_id,
				product.product_sale_price,product.product_marketing_price,
				product.product_brand,product.product_describe,product.time_to_market,
				product.color,product.weight,product.guarantee,product.id
			];
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, columns, function(err, results) {
					connection.release();
					if (err) {
						console.log(err);
						cb(true,results);
						return;
					}
					cb(false,results);
				});
			});
		},
		//保存商品简单版
		save_product_simple : function(product,cb){
			var product = JSON.parse(product);
			var query = `insert into products (id, product_name,
				product_sale_price, product_marketing_price, code,
				industry_id,create_at, update_at, flag)
				values
				(?,?,
			 	?,?,?,
				?,now(),now(),0)` ;
				console.log(query);
			var id = uuidV1();
			var columns=[id,product.product_name,product.product_sale_price,
				product.product_sale_price, product.product_id,product.industry_id
			];
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, columns, function(err, results) {
					connection.release();
					if (err) {
						console.log(err);
						cb(true,results);
						return;
					}
					results.product_id = id;
					cb(false,results);
				});
			});
		},
		//保存商品 复杂版
		save_product_complex : function(product,cb){
			var query = `insert into products (id, product_name,
				product_sale_price, product_marketing_price, code, industry_id,
				sort_id, product_brand, product_describe, time_to_market, color,
				weight, guarantee,barcode,
				create_at, update_at, flag)
				values
				(?,?,
				?,?,?,?,
				?,?,?,?,?,
				?,?,?,
				now(),now(),0)` ;
			var id = uuidV1();
			var columns=[id,product.product_name,
				product.product_sale_price,product.product_marketing_price, product.product_id,product.industry_id,
				product.sort_id, product.product_brand, product.product_describe,product.time_to_market, product.color,
				product.weight,product.guarantee, product.barcode
			];
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, columns, function(err, results) {
					connection.release();
					if (err) {
						console.log(err);
						cb(true,results);
						return;
					}
					results.product_id = id;
					cb(false,results);
				});
			});
		},
		//查询所有商品 code
		search_product_code : function(code, cb) {
			var query = `select id FROM products
				where code =? and flag =0
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [code], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		}



	};
};

module.exports = products;
