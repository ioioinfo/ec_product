var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');

var products = function(server) {
	return {
		//查询产品分类不为null的
		find_sort_id : function(cb) {
			var query = `select id, sort_id
			FROM products where sort_id is not null and flag =0`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, function(err, results) {
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
		//更新商品分类 高手模式
		update_sort_id : function(sort_id,id, cb) {
			var query = `update products set sort_id = ?
			where id = ? and flag = 0
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [sort_id,id], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
		//单条商品上架
		product_up : function(id, cb) {
			var query = `update products set is_down = 0, update_at = now()
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
			var query = `update products set is_down = 1, update_at = now()
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

		get_products_list : function(params,cb) {
			var query = `select id,product_name,short_name,sort_id,product_sale_price,industry_id
				,color,code,color,product_marketing_price,product_brand,weight,is_down,origin,
				time_to_market, DATE_FORMAT(time_to_market,'%Y-%m-%d %H:%i:%S') up_to_marketing,
				DATE_FORMAT(update_at,'%Y-%m-%d %H:%i:%S') update_at_text
				FROM products
				where flag =0
			`;
			var colums=[];
			if (params.product_name) {
				query = query + " and product_name like ? ";
				colums.push('%'+params.product_name+'%');
			}
			if (params.product_id) {
				query = query + " and id = ? ";
				colums.push(params.product_id);
			}
			if (params.is_down) {
				query = query + " and is_down = ? ";
				colums.push(params.is_down);
			}
			if (params.thisPage) {
				var offset = params.thisPage-1;
				if (params.everyNum) {
					query = query + " limit " + offset*params.everyNum + "," + params.everyNum;
				}else {
					query = query + " limit " + offset*20 + ",20";
				}
			}
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,colums, function(err, rows) {
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
		get_products_count : function(params,cb) {
			var query = `select count(1) num
				FROM products
				where flag =0
			`;
			var colums=[];
			if (params.product_name) {
				query = query + " and product_name like ? ";
				colums.push('%'+params.product_name+'%');
			}
			if (params.product_id) {
				query = query + " and id = ? ";
				colums.push(params.product_id);
			}
			if (params.is_down) {
				query = query + " and is_down = ? ";
				colums.push(params.is_down);
			}
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,colums, function(err, rows) {
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
			sku_id, industry_id, time_to_market,
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
			sku_id, industry_id, time_to_market,
			code, color, report_id, service_id, pay_way, product_suggestion,
			send_way, weight, delivery_area, is_sale, is_presale, is_preorder,
			is_down, is_gift_product, is_time_limit_sale, price_stage, barcode,
			is_group_product, is_replace_product, is_crazy_product,
			is_point_product, is_net_point,is_free_product, is_low_price_product,
			origin, module_number, DATE_FORMAT(update_at,'%Y-%m-%d %H:%i:%S') update_at_text
			FROM products where id =? and flag =0`;

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
				,color,code,color,product_marketing_price,product_brand,weight,origin,is_sale
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
		search_pos_product : function(product_name, cb) {
			var query = `select a.id,a.product_name, a.product_sale_price, a.product_brand,
				a.industry_id, a.color
				from products a
				where a.product_name like ? and flag =0
			`;
			product_name = "%"+product_name+"%";
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_name], function(err, rows) {
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
				,a.color,a.code,a.color,a.product_marketing_price,a.product_brand,a.weight,a.origin
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
				query = query + " and a.sort_id in " + search_object.sort_ids;
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
			time_to_market, color, weight, guarantee, code,
			create_at, update_at, flag)
			values
			(?,?,?,
		 	?,?,?,
			?,?,?,?,?,
			now(),now(),0)` ;
			var columns=[product.id, product.product_name, product.sort_id,
				product.product_sale_price, product.product_marketing_price, product.product_brand,
				product.time_to_market, product.color, product.weight, product.guarantee, product.id
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
				sort_id, product_brand, time_to_market, color,
				weight, guarantee, barcode, origin,
				create_at, update_at, flag)
				values
				(?,?,
				?,?,?,?,
				?,?,?,?,
				?,?,?,?,
				now(),now(),0)` ;
			var id = product.product_id;
			var columns=[id, product.product_name,
				product.product_sale_price, product.product_marketing_price,
				product.product_id, product.industry_id,
				product.sort_id, product.product_brand, product.time_to_market, product.color,
				product.weight, product.guarantee, product.barcode,product.origin
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
		},
		//查询商品分类
		search_product_sort: function(id, cb) {
			var query = `select sort_id FROM products
				where id =? and flag =0
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
		//查询商品分类
		get_products_sort: function(cb) {
			var query = `select sort_id FROM products
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
		}


	};
};

module.exports = products;
