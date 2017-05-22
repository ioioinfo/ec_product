var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_sorts = function(server) {
	return {
		//更新sort_id
		update_sort_id : function(sort_list, cb) {
			var query = `update products_sorts set flag = 0
			where id in(?)
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [sort_list], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
		update_sort_id2 : function(sort_list, cb) {
			var query = `update products_sorts set flag = 1
			where id not in(?)
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, [sort_list], function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
        //一级分类查询
		get_level_one : function(parent,cb) {
			var query = `select id,sort_name,parent,web_link,img_location
            from products_sorts where flag =0 and parent =?
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,parent, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
		//查询
		search_sort : function(id,cb) {
			var query = `select id,sort_name,parent,web_link,img_location
            from products_sorts where flag =0 and id =?
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,id, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},

		//查询
		search_sorts : function(ids,cb) {
			var query = `select id,sort_name,parent,web_link,img_location
            from products_sorts where flag =0 and id in (?)
			`;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query,[ids], function(err, rows) {
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

module.exports = products_sorts;
