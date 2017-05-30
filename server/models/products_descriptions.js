var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_descriptions = function(server) {
	return {
		//保存描述
		save_descriptions : function(product_id,description,cb){
			var query = `insert into products_descriptions(product_id, description,
			created_at, updated_at, flag)
			values
			(?,?,
			now(),now(),0)` ;
			var columns=[product_id, description];
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
		get_product_description : function(product_id,cb) {
			var query = `select product_id,description,created_at,updated_at
				FROM products_descriptions
				where flag =0 and product_id = ? order by created_at desc
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,product_id, function(err, rows) {
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

module.exports = products_descriptions;
