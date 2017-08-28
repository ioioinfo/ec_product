var _ = require('lodash');
var EventProxy = require('eventproxy');

var prices_history = function(server) {
	return {
        save_history : function(product_id, product_name,
            old_price, new_price, discount, remark, person_id,marketing_price, cb){
			var query = `insert into prices_history (product_id, product_name,
                old_price, new_price, discount, remark, person_id,marketing_price,
				created_at, updated_at, flag)
    			values
    			(?,?,
    		 	?,?,?,?,?,?,
    			now(),now(),0)` ;

            var columns = [product_id, product_name,
                old_price, new_price, discount, remark, person_id,marketing_price];

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

		find_history_list : function(info, cb) {
			var query = `select id, product_id, product_name, marketing_price,
                old_price, new_price, discount, remark, person_id,
				DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			 	from prices_history
				where flag = 0
			`;
			var colums=[];
			if (info.product_id) {
				query = query + " and product_id = ?";
				colums.push(info.product_id);
			}

			query = query + " order by created_at desc";
			if (info.thisPage) {
				var offset = info.thisPage-1;
				if (info.everyNum) {
					query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
				}else {
					query = query + " limit " + offset*20 + ",20";
				}
			}
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, colums, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					cb(false,results);
				});
			});
		},
		account_history : function(info, cb) {
			var query = `select count(1) num
			 	from prices_history
				where flag = 0
			`;
			var colums=[];
			if (info.product_id) {
				query = query + " and product_id = ?";
				colums.push(info.product_id);
			}
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, colums, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					cb(false,results);
				});
			});
		},

	};
};

module.exports = prices_history;
