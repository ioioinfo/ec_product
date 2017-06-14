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
	var service_info = "ec sort service";
	server.route([
		//得到产品分类
		{
			method: 'GET',
			path: '/get_products_sort',
			handler: function(request, reply){
				server.plugins['models'].products.get_products_sort(function(err,rows){
					if (!err) {
						var sort_list = [];
						var sort_map = {};
						for (var i = 0; i < rows.length; i++) {
							if (rows[i].sort_id && rows[i].sort_id !="") {
								if (!sort_map[rows[i].sort_id]) {
									sort_map[rows[i].sort_id] = rows[i].sort_id;
									sort_list.push(rows[i].sort_id);
								}
							}
						}
						var sort_map_two = {};
						for (var i = 0; i < sort_list.length; i++) {
							var sort = sort_list[i].substring(0,6)+"000";
							if (!sort_map_two[sort]) {
								sort_map_two[sort] = sort;
								sort_list.push(sort);
							}
						}
						var sort_map_one = {};
						for (var i = 0; i < sort_list.length; i++) {
							var sort = sort_list[i].substring(0,3)+"000000";
							if (!sort_map_one[sort]) {
								sort_map_one[sort] = sort;
								sort_list.push(sort);
							}
						}
						server.plugins['models'].products_sorts.update_sort_id(sort_list,function(err,rows){
							if (!err) {
								server.plugins['models'].products_sorts.update_sort_id2(sort_list,function(err,rows){
									if (!err) {
										return reply({"success":true,"service_info":service_info});
									}else {
										return reply({"success":false,"message":rows.message,"service_info":service_info});
									}
								});
							}else {
								return reply({"success":false,"message":rows.message,"service_info":service_info});
							}
						});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//一级分类
		{
			method: 'GET',
			path: '/get_level_one',
			handler: function(request, reply){
                var parent = 0;
                if (request.query.id) {
                    parent = request.query.id;
                }
				server.plugins['models'].products_sorts.get_level_one(parent,function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询分类
		{
			method: 'GET',
			path: '/search_sort',
			handler: function(request, reply){
				var id = request.query.id;
				if (!id ) {
					return reply({"success":false,"message":"id is null","service_info":service_info});
				}
				server.plugins['models'].products_sorts.search_sort(id,function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询分类
		{
			method: 'GET',
			path: '/search_sorts',
			handler: function(request, reply){
				var sort_ids = request.query.sort_ids;
				if (!sort_ids) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
				sort_ids = JSON.parse(sort_ids);
				if (!sort_ids) {
					return reply({"success":false,"message":"sort_ids is null","service_info":service_info});
				}
				server.plugins['models'].products_sorts.search_sorts(sort_ids,function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询商品分类
		{
			method: 'GET',
			path: '/search_product_sort',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				if (!product_id ) {
					return reply({"success":false,"message":"product_id is null","service_info":service_info});
				}
				server.plugins['models'].products.search_product_sort(product_id,function(err,rows){
					if (!err) {
						if (rows.length == 0) {
							reply({"success":false,"message":"product_id is null","service_info":service_info});
						}else {
							var id = rows[0].sort_id;
							server.plugins['models'].products_sorts.search_sort(id,function(err,rows){
								if (!err) {
									return reply({"success":true,"rows":rows,"service_info":service_info});
								}else {
									return reply({"success":false,"message":"wrong","service_info":service_info});
								}
							});
						}
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询没有分类的产品
		{
			method: 'GET',
			path: '/get_no_sorts',
			handler: function(request, reply){
				server.plugins['models'].products.get_no_sorts(function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//三级分类
		{
			method: 'GET',
			path: '/search_level_three',
			handler: function(request, reply){
				server.plugins['models'].products_sorts.search_level_three(function(err,rows){
					if (!err) {
						return reply({"success":true,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},

	]);

    next();
};

exports.register.attributes = {
    name: 'sort_controller'
};
