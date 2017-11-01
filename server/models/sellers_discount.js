var _ = require('lodash');
var EventProxy = require('eventproxy');
const uuidV1 = require('uuid/v1');

var sellers_discount = function(server) {
	return {
        //查询商家折扣
		get_sellers_discount_list : function(params,cb) {
			var query = `select id, seller_id, sort_id, sort_name, discount,
				DATE_FORMAT(update_at,'%Y-%m-%d %H:%i:%S') update_at_text
				FROM sellers_discount
				where flag =0
			`;
			var colums=[];

			server.plugins['mysql'].query(query,colums, function(err, rows) {
				if (err) {
					cb(true,null);
					return;
				}
				cb(false,rows);
			});
		},
        account_sellers_discount : function(params, cb){
            var query = `select count(1) num
                from sellers_discount where flag = 0
            `;

            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
        //添加商家折扣
        add_seller_discount : function(seller,cb) {
			var query = `insert into sellers_discount (id, seller_id, sort_id, sort_name, discount,
    			create_at, update_at, flag)
    			values
    			(?, ?, ?, ?, ?,
    			now(),now(),0)
			`;
            var id = uuidV1();
			var colums=[id,seller.seller_id, seller.sort_id, seller.sort_name, seller.discount];
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, colums, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
        //更新商家折扣
        update_seller_discount : function(seller,cb) {
			var query = `update sellers_discount set seller_id =?, sort_id =?, sort_name =?,
                discount =?, update_at = now()
			    where id =? and flag = 0
			`;
			var colums=[seller.seller_id, seller.sort_id, seller.sort_name, seller.discount, seller.id];

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, colums, function(err, rows) {
					connection.release();
					if (err) {
						cb(true,null);
						return;
					}
					cb(false,rows);
				});
			});
		},
        //删除商家折扣
        delete_seller_discount : function(id, cb) {
			var query = `update sellers_discount set flag =1, update_at =now()
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


	};
};

module.exports = sellers_discount;
