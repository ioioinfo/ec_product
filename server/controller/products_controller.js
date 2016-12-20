// Base routes for item..
﻿var industries = require('../utils/industries.js');
var eventproxy = require('eventproxy');
exports.register = function(server, options, next){
	var service_info = service_info;

	//通过商品id找到商品
	var get_productById = function(product_id, cb){
		server.plugins['models'].products.find_by_id(product_id,function(rows){
			if (rows[0]) {
				cb(false,rows[0]);
			}else {
				cb(true,"商品信息不存在！");
			}
		});
	};
	//通过商品id，行业id找到行业表及信息
	var get_product_industry = function(industry_id, product_id, cb){
		server.plugins['models'].industries_configures.find_by_industry_id(industry_id, product_id, function(rows){
			if (rows[0]) {
				cb(false,rows[0]);
			}else {
				cb(true,"商品行业信息不存在！");
			}
		});
	};
	//通过商品id找到图片
	var get_picturesById = function(product_id, cb){
		server.plugins['models'].products_pictures.find_by_product_id(product_id,function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"图片信息不存在！");
			}
		});
	}
	//通过商品id和samecode找到对应商品
	var get_same_code = function(product_id, same_code, cb){
		server.plugins['models'].products.find_same_product(same_code, function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"同类商品信息不存在！");
			}
		});
	};
	//通过商品id获取小图
	var get_products_picture = function(product_ids, cb){
		server.plugins['models'].products_pictures.find_pictures(product_ids, function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"商品小图片不存在！");
			}
		});
	};
	server.route([
		//产品展示页面，通过传入产品id获取产品
		{
			method: 'GET',
			path: '/product_info',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				get_productById(product_id, function(err, row){
					if (!err) {
						return reply({"success":true,"message":"ok","row":row,"service_info":service_info});
					}else {
						return reply({"success":false,"message":row,"service_info":service_info});
					}
				});
			}
		},
		//产品图片，通过产品id获取产品图片
		{
			method: 'GET',
			path: '/get_product_pictures',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				get_picturesById(product_id, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows,"service_info":service_info});
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
				get_product_industry(industry_id,product_id,function(err, row){
					if (!err) {
						return reply({"success":true,"message":"ok","row":row,"service_info":service_info});
					}else {
						return reply({"success":false,"message":row,"service_info":service_info});
					}
				});
			}
		},
		//查询同类商品
		{
			method: 'GET',
			path: '/get_same_products',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				var same_code = request.query.same_code;
				get_same_code(product_id, same_code, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows,"service_info":service_info});
					}
				});
			}
		},
		//根据id找同类商品图片
		{
			method: 'GET',
			path: '/get_products_picture',
			handler: function(request, reply){
				var product_ids = request.query.product_ids;
				if (!product_ids) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
				product_ids = JSON.parse(product_ids);
				get_products_picture(product_ids, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows,"service_info":service_info});
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
