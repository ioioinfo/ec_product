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
		console.log(body);
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
	var service_info = "ec products service";

	//通过商品id找到商品
	var get_productById = function(product_id, cb){
		server.plugins['models'].products.find_by_id(product_id,function(err,rows){
			if (!err) {
				console.log("rows:"+JSON.stringify(rows));
				if (rows[0]) {
					cb(false,rows[0]);
				}else {
					cb(false,null);
				}
			}else {
				cb(true,rows)
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
	//通过product_ids找到善淘信息
	var find_shantao_infos = function(product_ids, cb){
		server.plugins['models'].industry_santao.find_shantao_infos(product_ids, function(err,rows){
			console.log(rows);
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"善淘属性null！");
			}
		});
	};
	//通过id获得pos商品
	var get_pos_product = function(product_id,cb){
		server.plugins['models'].products.get_pos_product(product_id,function(err,rows){
			console.log(rows);
			if (rows[0]) {
				cb(false,rows[0]);
			}else {
				cb(true,"商品信息不存在！");
			}
		});
	};
	//查询所有商品
	var search_products = function(search_object,cb){
		server.plugins['models'].products.search_products(search_object,function(err,rows){
			if (rows) {
				cb(false,rows);
			}else {
				cb(true,"商品信息不存在！");
			}
		});
	};
	//查询所有图片
	var search_pictures = function(cb){
		server.plugins['models'].products_pictures.search_pictures(function(err,rows){
			if (rows) {
				cb(false,rows);
			}else {
				cb(true,"商品信息不存在！");
			}
		});
	};
	//保存库存
	var save_stock_instruction = function(data,cb){
		var url = "http://211.149.248.241:12001/save_stock_instruction";
		do_post_method(url,data,cb);
	};
	server.route([
		//商品下架
		{
			method: 'POST',
			path: '/product_down',
			handler: function(request, reply){
				var id = request.payload.product_id;
				server.plugins['models'].products.product_down(id,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//商品上架
		{
			method: 'POST',
			path: '/product_up',
			handler: function(request, reply){
				var id = request.payload.product_id;
				server.plugins['models'].products.product_up(id,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//保存图片 批量
		{
			method: 'POST',
			path: '/save_product_picture',
			handler: function(request, reply){
				var product_id = request.payload.product_id;
				var imgs = request.payload.imgs;
				if (!product_id || !imgs) {
					return reply({"success":false,"message":"params wrong"});
				}
				imgs = JSON.parse(imgs);
				for (var i = 0; i < imgs.length; i++) {
					var img = imgs[i];
					var order_index = 0;
					if (i == 0) {
						order_index = 1;
					}
					var img_data = {
						"product_id" : product_id,
						"location" : img,
						"order_index" : order_index
					};
					img_data = JSON.stringify(img_data);
					console.log("i:"+i);
					server.plugins['models'].products_pictures.save_product_picture(img_data,function(err,rows){
						if (rows.affectedRows>0) {

						}else {
							return reply({"success":false,"message":rows.message,"service_info":service_info});
						}
					});
				}
				return reply({"success":true,"message":"ok","service_info":service_info});
			}
		},
		//新增商品
		{
			method: 'POST',
			path: '/add_product',
			handler: function(request, reply){
				var product = request.payload.product;
				console.log("product:"+product);
				product = JSON.parse(product);
				var industry_id = product.industry_id;
				server.plugins['models'].products.save_product_complex(product,function(err,result){
					if (result.affectedRows>0) {
						var industry = industries[industry_id];
						var product_id = result.product_id;
						var santao = {
							"product_id" : product_id,
							"is_new" : request.payload.is_new,
							"row_materials" : request.payload.row_materials,
							"batch_code" : request.payload.batch_code,
							"size_name" : request.payload.size_name
						};
						santao = JSON.stringify(santao);
						//暂时写死
						server.plugins['models'].industry_santao.save_santao_industy(santao,function(err,rows){
							if (!err) {
								return reply({"success":true,"service_info":service_info})
							}else {
								return reply({"success":false,"message":rows.message,"service_info":service_info})
							}
						});
					}else {
						return reply({"success":false,"message":result.message,"service_info":service_info})
					}
				});
			}
		},
		//保存商品库存
		{
			method: 'POST',
			path: '/save_product_inventory',
			handler: function(request, reply){
				var inventory = request.payload.inventory;
				inventory = JSON.parse(inventory);
				var no_products = [];
				var save_fail = [];
				var save_success = [];

				console.log("async begin--------");
				async.each(inventory, function(invent, cb) {

					server.plugins['models'].products.search_product_code(invent.product_id,function(err,rows){
						if (!err) {
							console.log("rows:"+JSON.stringify(rows));
							if (rows.length>0) {
								var product_id = rows[0].id;
								var industry_id;
								var instruction = {
									"shipper" : "shantao",
									"supplier_id" : 1,
									"warehouse_id" : 1,
									"region_id" : 1
								}
								if (invent.size_name) {
									console.log("size_name:"+JSON.stringify(invent.size_name));
									industry_id = 101;
									instruction.size_name = invent.size_name;
								}else {
									industry_id = 102;
								}
								var instruction = {
									"shipper" : "shantao",
									"supplier_id" : 1,
									"warehouse_id" : 1,
									"region_id" : 1,
									"size_name" : invent.size_name
								}
								var data = {
									"product_id" : product_id,
									"industry_id" : industry_id,
									"instruction" : JSON.stringify(instruction),
									"strategy" : "modify",
									"quantity" : invent.quantity,
									"batch_id" : "test"
								};
								save_stock_instruction(data,function(err,content){
									if (!err) {
										save_success.push(invent);
										cb();
									}else {
										save_fail.push(invent);
										cb();
									}
								});
							}else {
								no_products.push(invent);
								cb();
							}
						}else {
							save_fail.push(product);
							cb();
						}
					});
				}, function(err) {
					return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"no_products":no_products,"no_products":no_products.length,"save_fail":save_fail,"fail_num":save_fail.length});
				});
			}
		},
		//保存商品 复杂版
		{
			method: 'POST',
			path: '/save_product_complex',
			handler: function(request, reply){
				var products = request.payload.products;
				products = JSON.parse(products);
				var repeat_products = [];
				var save_fail = [];
				var save_success = [];
				console.log("async begin--------");
				async.each(products, function(product, cb) {
					var industry_id = product.industry_id;

					server.plugins['models'].products.search_product_code(product.product_id,function(err,rows){
						if (!err) {
							console.log("rows:"+JSON.stringify(rows));
							if (rows.length>0) {
								repeat_products.push(product);
								console.log("repeat_products.length:"+repeat_products.length);
								cb();
							}else {
								server.plugins['models'].products.save_product_complex(product,function(err,result){
									if (result.affectedRows>0) {
										save_success.push(product);
										var industry = industries[industry_id];
										var product_id = result.product_id;
										var santao = {
											"product_id" : product_id,
											"is_new" : request.payload.is_new,
											"row_materials" : request.payload.row_materials,
											"batch_code" : request.payload.batch_code,
											"size_name" : request.payload.size_name
										};
										santao = JSON.stringify(santao);
										//暂时写死
										server.plugins['models'].industry_santao.save_santao_industy(santao,function(err,rows){
											cb();
										});
									}else {
										save_fail.push(product);
										cb();
									}
								});
							}
						}else {
							save_fail.push(product);
							cb();
						}
					});

				}, function(err) {
					return reply({"success":true,"success_num":save_success.length,"service_info":service_info,"repeat_products":repeat_products,"repeat_num":repeat_products.length,"save_fail":save_fail,"fail_num":save_fail.length});
				});
			}
		},
		//保存商品 简易版
		{
			method: 'POST',
			path: '/save_product_simple',
			handler: function(request, reply){
				var product = {
					"product_id" : request.payload.product_id,
					"product_name" : request.payload.product_name,
					"product_sale_price" : request.payload.product_sale_price,
					"industry_id" : request.payload.industry_id
				}
				product = JSON.stringify(product);
				server.plugins['models'].products.save_product_simple(product,function(err,rows){
					console.log("rows:"+JSON.stringify(rows));
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info,"product_id":rows.product_id});
					}else {
						return reply({"success":false,"message":results.message,"service_info":service_info});
					}
				});
			}
		},

		//保存商品
		{
			method: 'POST',
			path: '/save_product',
			handler: function(request, reply){
				var product = request.payload.product;
				server.plugins['models'].products.save_product(product,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询商品列表
		{
			method: 'GET',
			path: '/get_products_list',
			handler: function(request, reply){
				server.plugins['models'].products.get_products_list(function(err,rows){
					if (!err) {
						return reply({"success":true,"message":"ok","products":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":results.message,"service_info":service_info});
					}
				});
			}
		},
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
						return reply({"success":false,"message":row.message,"service_info":service_info});
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
						if (!row) {
							return reply({"success":false,"message":"product not exists","service_info":service_info});
						}
						var industry_id = row.industry_id;
						var industry = industries[industry_id];
						if (!industry) {
							return reply({"success":false,"message":"行业不存在","service_info":service_info});
						}
						var sale_properties = industry["sale_properties"];

						return reply({"success":true,"message":"ok","row":row,"sale_properties":sale_properties,"service_info":service_info});
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
					return reply({"success":true,"message":"ok","products":products});
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
		//查询所有商品及图片
		{
			method: 'POST',
			path: '/search_products_info',
			handler: function(request, reply){
				var search_object = request.payload.search_object;
				if (!search_object) {
					return reply({"success":false,"message":"param wrong","service_info":service_info});
				}
				search_object = JSON.parse(search_object);
				console.log("search_object:"+search_object);
				var ep =  eventproxy.create("products","pictures",
					function(products,pictures){
						for (var i = 0; i < products.length; i++) {
							for (var j = 0; j < pictures.length; j++) {
								if (products[i].id == pictures[j].product_id) {
									products[i].img = pictures[j];
								}
							}
						}
						var img = pictures[pictures.length-1];
						for (var i = 0; i < products.length; i++) {
							if (!products[i].img) {
								products[i].img = img;
							}
						}
					return reply({"success":true,"products":products});
				});

				search_products(search_object,function(err, rows) {
					if (!err) {
						ep.emit("products",rows);
					}else {
						ep.emit("products",{});
					}
				});

				search_pictures(function(err, rows){
					if (!err) {
						ep.emit("pictures",rows);
					}else {
						ep.emit("pictures",{});
					}
				});
			}
		},
		//更加产品id在善淘
		{
			method: 'GET',
			path: '/find_shantao_infos',
			handler: function(request, reply){
				var product_ids = request.query.product_ids;
				if (!product_ids) {
					return reply({"success":false,"message":"product_ids null","service_info":service_info});
				}
				product_ids = JSON.parse(product_ids);
				find_shantao_infos(product_ids, function(err, rows){
					if (!err) {
						return reply({"success":true,"message":"ok","rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
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
						if (!product) {
							console.log("123");
							return reply({"success":false,"message":"查不到商品明细！","message":"ok"});
						}
						var industry_id = product.industry_id;
						var table_name = industries[industry_id]["table_name"];
						console.log("table_name:"+table_name);
						server.plugins.models[table_name].find_by_product_id(product_id, function(err,rows) {
							console.log("err:"+err);
							var properties = industries[industry_id]["properties"];

							if (rows.length>0) {
								var row = rows[0];
								for (var i = 0; i < properties.length; i++) {
									var property = properties[i];
									property.value = row[property.field_name];
								}
							}
							return reply({"success":true,"properties":properties,"message":"ok"});
						});
					}else {
						return reply({"success":false,"message":product.message});
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
