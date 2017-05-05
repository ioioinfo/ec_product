var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_pictures = function(server) {
	return {
		//上传图片保存
		save_product_picture : function(img_data,cb){
			var img_data = JSON.parse(img_data);
			var query = `insert into products_pictures (id, product_id,
				location, order_index, create_at, update_at, flag)
				values
				(uuid(),?,
				?,?,now(),now(),0)` ;
				console.log(query);
			var columns=[img_data.product_id,img_data.location,img_data.order_index];
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

		//保存产品图片
		save_picture : function(picture,cb){
			var product = JSON.parse(product);
			var query = `insert into products_pictures (id, product_id,
				location,create_at, update_at, flag)
				values
				(uuid(),?,
				?,now(),now(),0)` ;
				console.log(query);
			var columns=[picture.product_id,picture.location];
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
		//根据id找到商品大图
		find_by_product_id : function(product_id, callback) {
			var query = `select location from products_pictures where product_id = ? and flag =0` ;
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
				where a.product_id in (?) and a.flag =0` ;

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
		//查询所有商品图片
		search_pictures: function(callback) {
			var query = `select a.location,a.product_id from products_pictures a
				where a.flag =0` ;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(false,results);
				});
			});
		},



	};
};

module.exports = products_pictures;
