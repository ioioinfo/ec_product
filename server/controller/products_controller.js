// Base routes for item..
﻿var industries = require('../utils/industries.js');
var eventproxy = require('eventproxy');
exports.register = function(server, options, next){
	var service_info = "ec products service";

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
	//通过商品id获取
	var get_products_picture = function(product_ids, cb){
		server.plugins['models'].products_pictures.find_pictures(product_ids, function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"商品小图片不存在！");
			}
		});
	};
	//通过id找到产品详情
	var get_product_details = function(product_id, cb){
		server.plugins['models'].products_details.find_product_detail(product_id, function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"商品小图片不存在！");
			}
		});
	};
	//通过product_ids找到商品信息
	var find_products = function(product_ids, cb){
		server.plugins['models'].products.find_products(product_ids, function(err,rows){
			console.log(rows);
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"购物车还没商品！");
			}
		});
	};
	//通过id获得pos商品
	var get_pos_product = function(product_id,cb){
		server.plugins['models'].products.find_pos_product(product_id,function(err,rows){
			console.log(rows);
			if (rows[0]) {
				cb(false,rows[0]);
			}else {
				cb(true,"商品信息不存在！");
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
				if (!product_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
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
				if (!product_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
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
				if (!product_id || !industry_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
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
				if (!product_id || !same_code) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
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
		//根据id找到商品详情
		{
			method: 'GET',
			path: '/get_product_details',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				if (!product_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
				get_product_details(product_id, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows,"service_info":service_info});
					}
				});
			}
		},
		//根据id找到pos商品
		{
			method: 'GET',
			path: '/get_pos_product',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				if (!product_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
				get_pos_product(product_id, function(err, row){
					if (!err) {
						return reply({"success":true,"message":"ok","row":row,"service_info":service_info});
					}else {
						return reply({"success":false,"message":row,"service_info":service_info});
					}
				});
			}
		},
		//通过product_ids获取所有商品
		{
			method: 'GET',
			path: '/find_products',
			handler: function(request, reply){
				var product_ids = request.query.product_ids;
				if (!product_ids) {
					return reply({"success":false,"message":"product_ids null","service_info":service_info});
				}
				product_ids = JSON.parse(product_ids);
				console.log(product_ids);
				find_products(product_ids, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows,"service_info":service_info});
					}
				});
			}
		},
		//通过product_ids获取所有图片
		{
			method: 'GET',
			path: '/find_products_with_picture',
			handler: function(request, reply){
				var product_ids = request.query.product_ids;
				if (!product_ids) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}
				product_ids = JSON.parse(product_ids);
				console.log(product_ids);
				var ep =  eventproxy.create("products","pictures",
					function(products,pictures){
						for (var i = 0; i < products.length; i++) {
							for (var j = 0; j < pictures.length; j++) {
								if (products[i].id == pictures[j].product_id) {
									products[i].img = pictures[j];
								}
							}
						}
					return reply({"success":true,"products":products});
				});

				find_products(product_ids, function(err, rows) {
					if (!err) {
						ep.emit("products",rows);
					}else {
						ep.emit("products",{});
					}
				});

				get_products_picture(product_ids, function(err, rows){
					if (!err) {
						ep.emit("pictures",rows);
					}else {
						ep.emit("pictures",{});
					}
				});
			}
		},
		//根据product id 查询行业信息
		{
			method: 'GET',
			path: '/find_properties_by_product',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				if (!product_id) {
					return reply({"success":false,"message":"params wrong"});
				}
				get_productById(product_id, function(err, product){
					if (!err) {
						var industry_id = product.industry_id;
						var table_name = industries[industry_id]["table_name"];
						console.log("table_name:"+table_name);
						server.plugins.models[table_name].find_by_product_id(product_id, function(err,rows) {
							console.log("err:"+err);
							var row = rows[0];
							var properties = industries[industry_id]["properties"];
							for (var i = 0; i < properties.length; i++) {
								var property = properties[i];
								property.value = row[property.field_name];
							}
							return reply({"success":true,"properties":properties});
						});

					}else {

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
