var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_lable_infos = function(server) {
	return {
        find_by_name : function(name, cb) {
            var query = `select id, name
            FROM products_lables where name = ? and flag =0`;

            server.plugins['mysql'].pool.getConnection(function(err, connection) {
                connection.query(query, [name], function(err, results) {
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

        save_lable_info : function(product_id, name, cb){
			var query = `insert into products_lable_infos(product_id, name,
				created_at, updated_at, flag)
    			values
    			(?, ?,
    			now(),now(),0)` ;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [product_id, name], function(err, results) {
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

		products_lable_infos_list : function(info, cb) {
			var query = `select id, product_id, name,
				DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			 	from products_lable_infos
				where flag = 0
			`;
			var colums=[];
            if (info.product_id) {
				query = query + " and name = ?";
				colums.push(info.product_id);
			}
			if (info.name) {
				query = query + " and name = ?";
				colums.push(info.name);
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
		account_lables : function(info, cb) {
			var query = `select count(1) num
			 	from products_lable_infos
				where flag = 0
			`;
			var colums=[];
			if (info.name) {
				query = query + " and name = ?";
				colums.push(info.name);
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
        delete_lable:function(id, cb){
            var query = `update products_lable_infos set flag = 1, updated_at = now()
                where id = ?
                `;
                server.plugins['mysql'].pool.getConnection(function(err, connection) {
    				connection.query(query, [id], function(err, results) {
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

module.exports = products_lable_infos;
