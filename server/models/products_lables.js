var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_lables = function(server) {
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

        save_lable : function(name, cb){
			var query = `insert into products_lables (name,
				created_at, updated_at, flag)
    			values
    			(?,
    			now(),now(),0)` ;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [name], function(err, results) {
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

		find_lables_list : function(info, cb) {
			var query = `select id, name,
				DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			 	from products_lables
				where flag = 0
			`;
			var colums=[];
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
			 	from products_lables
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

	};
};

module.exports = products_lables;
