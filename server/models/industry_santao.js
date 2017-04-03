var _ = require('lodash');
var EventProxy = require('eventproxy');

var industry_santao = function(server) {
	return {
		find_by_product_id : function(product_id, cb) {
			var query = `select a.product_id,a.is_new,a.row_materials,a.size_name,
				a.batch_code
			 	from industry_santao a
				where product_id = ? and flag =0
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
		//批量查信息
		find_shantao_infos : function(product_ids, cb) {
			var query = `select a.product_id,a.is_new,a.row_materials,a.size_name,
				a.batch_code
			 	from industry_santao a
				where a.product_id in (?) and flag =0
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
		//保存行业信息
		save_santao_industy : function(santao,cb){
			var santao = JSON.parse(santao);
			var query = `insert into industry_santao (product_id, is_new, row_materials,
				size_name, batch_code, created_at, updated_at, flag)
				values
				(?,?,?,
			 	?,?,now(),now(),0)` ;
			console.log(query);
			var columns=[santao.product_id,santao.is_new,santao.row_materials,
				santao.size_name,santao.batch_code
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
		}




	};
};

module.exports = industry_santao;
