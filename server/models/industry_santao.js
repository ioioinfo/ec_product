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



	};
};

module.exports = industry_santao;
