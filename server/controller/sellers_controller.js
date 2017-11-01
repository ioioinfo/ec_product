// Base routes for item..
const uu_request = require('../utils/uu_request');
﻿var industries = require('../utils/industries.js');
var eventproxy = require('eventproxy');
var async = require('async');


var do_get_method = function(url,cb){
	uu_request.get(url, function(err, response, body){
		if (!err && response.statusCode === 200) {
			var content = JSON.parse(body);
			do_result(false, content, cb);
		} else {
			cb(true, null);
		}
	});
};
//所有post调用接口方法
var do_post_method = function(url,data,cb){
	uu_request.request(url, data, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			do_result(false, body, cb);
		} else {
			cb(true,null);
		}
	});
};
//处理结果
var do_result = function(err,result,cb){
	if (!err) {
		if (result.success) {
			cb(false,result);
		}else {
			cb(true,result);
		}
	}else {
		cb(true,null);
	}
};
exports.register = function(server, options, next){
	var service_info = "ec product service";
	server.route([
		//新增商家折扣
		{
			method: 'POST',
			path: '/add_seller_discount',
			handler: function(request, reply){
				var sellers_discount = request.payload.sellers_discount;
				sellers_discount = JSON.parse(sellers_discount);
				// var sellers_discount ={
				// 	"seller_id":"1",
				// 	"sort_id":"001000000",
				// 	"sort_name":"潮流女装",
				// 	"discount":8.8
				// };
				server.plugins['models'].sellers_discount.add_seller_discount(sellers_discount,function(err,result){
					if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
				});
			}
		},
		//查询商家折扣
        {
            method: "GET",
            path: '/get_sellers_discount',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num",
					function(rows, num){

					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].sellers_discount.get_sellers_discount_list(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].sellers_discount.account_sellers_discount(info2,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});

            }
        },


	]);

    next();
};

exports.register.attributes = {
    name: 'sellers_controller'
};
