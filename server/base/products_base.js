// Base routes for item..
﻿var industries = require('../utils/industries.js');
var eventproxy = require('eventproxy');
var callball_one = function(data,cb){
	if (data[0]) {
		cb("success",data[0]);
	}else {
		cb("fail","信息不存在！");
	}
}
var callball_many = function(data,cb){
	if (data.length > 0) {
		cb("success",data);
	}else {
		cb("fail","信息不存在！");
	}
}
exports.register = function(server, options, next){
	//通过商品id找到商品
	var get_productById = function(product_id, cb){
		server.plugins['models'].products.find_by_id(product_id,function(rows){
			if (rows[0]) {
				cb("success",rows[0]);
			}else {
				cb("fail","商品信息不存在！");
			}
		});
	};
	//通过商品id，行业id找到行业表及信息
	var get_product_industry = function(industry_id, product_id, cb){
		server.plugins['models'].industries_configures.find_by_industry_id(industry_id, product_id, function(rows){
			if (rows[0]) {
				cb("success",rows[0]);
			}else {
				cb("fail","商品行业信息不存在！");
			}
		});
	};
	//通过商品id找到图片
	var get_picturesById = function(product_id, cb){
		server.plugins['models'].products_pictures.find_by_product_id(product_id,function(rows){
			if (rows.length > 0) {
				cb("success",rows);
			}else {
				cb("fail","图片信息不存在！");
			}
		});
	}
	server.route([
		//产品展示页面，通过传入产品id获取产品
		{
			method: 'GET',
			path: '/product_info',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				get_productById(product_id, function(state, data){
					if (state == "success") {
						return reply({"success":state,"message":"ok","data":data,"service_info":"ec products service"});
					}else {
						return reply({"success":state,"message":data,"service_info":"ec products service"});
					}
				});
			}
		},
		//产品图片，通过产品id获取产品图片
		{
			method: 'GET',
			path: '/products_pictures',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				get_picturesById(product_id, function(state, data){
					if (state == "success") {
						return reply({"success":state,"message":"ok","data":data,"service_info":"ec products service"});
					}else {
						return reply({"success":state,"message":data,"service_info":"ec products service"});
					}
				});
			}
		},
		//产品id获得产品行业
		{
			method: 'GET',
			path: '/products_industries',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				var industry_id = request.query.industry_id;
				console.log("industry_id: "+industry_id+" product_id:"+product_id);
				get_product_industry(industry_id,product_id,function(state, data){
					if (state == "success") {
						return reply({"success":state,"message":"ok","data":data,"service_info":"ec products service"});
					}else {
						return reply({"success":state,"message":data,"service_info":"ec products service"});
					}
				});
			}
		},
    ]);

    next();
};

exports.register.attributes = {
    name: 'products_base'
};
