var _ = require('lodash');
var EventProxy = require('eventproxy');

var prices_history = function(server) {
	return {
        save_history : function(product_id, product_name,
            old_price, new_price, discount, remark, cb){
			var query = `insert into prices_history (product_id, product_name,
                old_price, new_price, discount, remark,	created_at, updated_at, flag)
    			values
    			(?,?,
    		 	?,?,?,?,
    			now(),now(),0)` ;

            var columns = [product_id, product_name,
                old_price, new_price, discount, remark];

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

	};
};

module.exports = prices_history;
