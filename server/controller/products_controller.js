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
	var service_info = "ec products service";

	//通过商品id找到商品
	var get_productById = function(product_id, cb){
		server.plugins['models'].products.find_by_id(product_id,function(err,rows){
			if (!err) {
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
		if (product_ids && product_ids.length==0) {
			cb(true,"商品小图片不存在！");
			return;
		}
		server.plugins['models'].products_pictures.find_pictures(product_ids, function(rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"商品小图片不存在！");
			}
		});
	};
	//通过product_ids找到商品信息
	var find_products = function(product_ids, cb){
		if (product_ids && product_ids.length==0) {
			cb(true,"购物车还没商品！");
			return;
		}
		server.plugins['models'].products.find_products(product_ids, function(err,rows){
			if (rows.length > 0) {
				cb(false,rows);
			}else {
				cb(true,"购物车还没商品！");
			}
		});
	};
	//通过product_ids找到善淘信息
	var find_shantao_infos = function(product_ids, cb){
		if (product_ids && product_ids.length==0) {
			cb(true,{message:"error"});
			return;
		}
		server.plugins['models'].industry_santao.find_shantao_infos(product_ids, function(err,rows){
			if (!err) {
				cb(false,rows);
			}else {
				cb(true,{message:"error"});
			}
		});
	};
	//通过id获得pos商品
	var get_pos_product = function(product_id,cb){
		server.plugins['models'].products.get_pos_product(product_id,function(err,rows){
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
		//批量改价
		{
			method: 'POST',
			path: '/update_products_prices',
			handler: function(request, reply){
				var remark = "正常改价";
				if (request.payload.remark) {
					remark = request.payload.remark;
				}
				var product_ids = request.payload.product_ids;
				var discount = request.payload.discount;
				product_ids = JSON.parse(product_ids);
				if (!discount || product_ids.length ==0) {
					return reply({"success":false,"message":"params wrong"});
				}

				//110 , 25 , 29
				// var product_ids = ["00001260_A21","00001311_A19","00001314_A19"];
				// var discount = 0.1;

				var save_fail = [];
				var save_success = [];
				async.eachLimit(product_ids,1, function(product_id, cb) {
					server.plugins['models'].products.find_by_id(product_id,function(err,rows){
						if (!err) {
							var product_name = rows[0].product_name;
							var old_price = rows[0].product_sale_price;
							var new_price = old_price * discount;
							new_price = parseFloat(new_price.toFixed(2));

							server.plugins['models'].products.update_products_prices(product_id,new_price,function(err,rows){
								if (rows.affectedRows>0) {

									server.plugins['models'].prices_history.save_history(product_id, product_name, old_price, new_price, discount, remark, function(err,rows){
										if (rows.affectedRows>0) {
											save_success.push(product_id);
											cb();
										}else {
											console.log(rows.message);
											save_fail.push(product_id);
											cb();
										}
									});

								}else {
									console.log(rows.message);
									save_fail.push(product_id);
									cb();
								}
							});

						}else {
							console.log(rows.message);
							save_fail.push(product_id);
							cb();
						}
					});

				}, function(err) {
					if (err) {
						console.error("err: " + err);
					}
					return reply({"success":true,"success_num":save_success.length,"fail_ids":save_fail,"fail_num":save_fail.length,"service_info":service_info});
				});

			}
		},
		//更新描述
		{
			method: 'POST',
			path: '/update_product_description',
			handler: function(request, reply){
				var product_id = request.payload.product_id;
				var description = request.payload.description;
				if (!product_id || !description) {
					return reply({"success":false,"message":"params wrong"});
				}
				server.plugins['models'].products_descriptions.update_product_description(product_id,description,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//更新sort_id
		{
			method: 'GET',
			path: '/sort_change',
			handler: function(request, reply){
				server.plugins['models'].products.find_sort_id(function(err,rows){
					if (!err) {
						var fail_list = [];
						var num =0;
						for (var i = 0; i < rows.length; i++) {
							var sort_id = rows[i].sort_id;
							if (parseInt(sort_id/100000000) >0) {
							}else {
								if (parseInt(sort_id/10000000) >0) {
									rows[i].sort_id = "0"+ sort_id;
								}else if (parseInt(sort_id/1000000) >0) {
									rows[i].sort_id = "00"+ sort_id;
								}
								server.plugins['models'].products.update_sort_id(rows[i].sort_id,rows[i].id,function(err,rows){
									if (rows.affectedRows>0) {

									}else {
										var fail_product = {};
										fail_product[rows[i].id]=rows[i];
										fail_list.push(fail_product);
									}
								});
							}
						}

						return reply({"success":true,"fail_list":fail_list,"fail_num":fail_list.length,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},

		//商品编辑
		{
			method: 'POST',
			path: '/update_product_info',
			handler: function(request, reply){
				var old_id = request.payload.old_id;
				var id = request.payload.id;
				var product_name = request.payload.product_name;
				var weight = request.payload.weight;
				var product_sale_price = request.payload.product_sale_price;
				var product_marketing_price = request.payload.product_marketing_price;
				var origin = request.payload.origin;
				if (!id || !product_name || !weight || !product_sale_price || !product_marketing_price || !origin || !old_id) {
					return reply({"success":false,"message":"params wrong"});
				}
				server.plugins['models'].products.update_product_info(id, product_name, weight, product_sale_price, product_marketing_price, origin, old_id,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//商品分类，高手模式
		{
			method: 'POST',
			path: '/update_sort_id',
			handler: function(request, reply){
				var id = request.payload.product_id;
				var sort_id = request.payload.sort_id;
				if (!id || !sort_id) {
					return reply({"success":false,"message":"params wrong"});
				}
				server.plugins['models'].products.update_sort_id(sort_id,id,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//商品下架
		{
			method: 'POST',
			path: '/product_down',
			handler: function(request, reply){
				var id = request.payload.product_id;
				if (!id) {
					return reply({"success":false,"message":"params wrong"});
				}
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
				if (!id) {
					return reply({"success":false,"message":"params wrong"});
				}
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
		// {
		// 	method: 'POST',
		// 	path: '/add_product',
		// 	handler: function(request, reply){
		// 		var product = request.payload.product;
		// 		product = JSON.parse(product);
		// 		var product_description = product.product_describe;
		// 		var industry_id = product.industry_id;
		// 		server.plugins['models'].products.save_product_complex(product,function(err,result){
		// 			if (result.affectedRows>0) {
		// 				var industry = industries[industry_id];
		// 				var product_id = result.product_id;
		// 				var santao = {
		// 					"product_id" : product_id,
		// 					"is_new" : request.payload.is_new,
		// 					"row_materials" : request.payload.row_materials,
		// 					"batch_code" : request.payload.batch_code,
		// 					"size_name" : request.payload.size_name
		// 				};
		// 				santao = JSON.stringify(santao);
		// 				//暂时写死
		// 				server.plugins['models'].industry_santao.save_santao_industy(santao,function(err,rows){
		// 					if (!err) {
		// 						return reply({"success":true,"service_info":service_info})
		// 					}else {
		// 						return reply({"success":false,"message":rows.message,"service_info":service_info})
		// 					}
		// 				});
		// 			}else {
		// 				return reply({"success":false,"message":result.message,"service_info":service_info})
		// 			}
		// 		});
		// 	}
		// },
		{
			method: 'POST',
			path: '/add_product',
			handler: function(request, reply){
				var product = request.payload.product;
				console.log("product:"+product);
				product = JSON.parse(product);
				var product_description = product.product_describe;
				var industry_id = product.industry_id;
				server.plugins['models'].products.save_product_complex(product,function(err,result){
					if (result.affectedRows>0) {
						return reply({"success":true,"service_info":service_info})
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
							if (rows.length>0) {
								var product_id = rows[0].id;
								var industry_id;
								if (invent.size_name) {
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
									"size_name" : invent.size_name,
									"point_id" : 1
								}
								var data = {
									"product_id" : product_id,
									"industry_id" : industry_id,
									"instruction" : JSON.stringify(instruction),
									"strategy" : "modify",
									"quantity" : invent.quantity,
									"batch_id" : "test",
									"platform_code" :"drp_admin"
								};
								console.log("address:"+invent.address);
								console.log("address:"+invent.stock_location);
								save_stock_instruction(data,function(err,content){
									if (!err) {
										save_success.push(invent);
										cb();
									}else {
										console.log(content.message);
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
					var description = product.product_describe;
					server.plugins['models'].products.search_product_code(product.product_id,function(err,rows){
						if (!err) {
							if (rows.length>0) {
								repeat_products.push(product);
								cb();
							}else {
								server.plugins['models'].products.save_product_complex(product,function(err,result){
									if (result.affectedRows>0) {
										save_success.push(product);
										var industry = industries[industry_id];
										var product_id = result.product_id;
										var santao = {
											"product_id" : product_id,
											"is_new" : product.is_new,
											"row_materials" : product.row_materials,
											"batch_code" : product.batch_code,
											"size_name" : product.size_name
										};
										santao = JSON.stringify(santao);
										//暂时写死
										server.plugins['models'].industry_santao.save_santao_industy(santao,function(err,rows){
											server.plugins['models'].products_descriptions.save_descriptions(product_id,description,function(err,rows){
												if (rows.affectedRows>0) {
													cb();
												}else {
													save_fail.push(product);
													cb();
												}
											});
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
					if (rows.affectedRows>0) {
						return reply({"success":true,"message":"ok","service_info":service_info,"product_id":rows.product_id});
					}else {
						return reply({"success":false,"message":results.message,"service_info":service_info});
					}
				});
			}
		},
		//保存商品描述
		{
			method: 'POST',
			path: '/save_descriptions',
			handler: function(request, reply){
				var product_id = request.payload.product_id;
				var description = request.payload.description;
				server.plugins['models'].products_descriptions.save_descriptions(product_id,description,function(err,rows){
					if (rows.affectedRows>0) {
						return reply({"success":true,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//查询产品描述
		{
			method: 'GET',
			path: '/search_descriptions',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				server.plugins['models'].products_descriptions.get_product_description(product_id,function(err,rows){
					if (!err) {
						if (rows.length>0) {
							return reply({"success":true,"row":rows,"service_info":service_info});
						}else {
							return reply({"success":true,"row":[],"service_info":service_info});
						}
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//产品展示页面，通过传入产品id获取产品
		{
			method: 'GET',
			path: '/get_product',
			handler: function(request, reply){
				var product_id = request.query.product_id;
				if (!product_id) {
					return reply({"success":false,"message":"参数错误","service_info":service_info});
				}
				server.plugins['models'].products.find_by_id(product_id,function(err,rows){
					if (!err) {
						return reply({"success":false,"rows":rows,"service_info":service_info});
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
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
				var params = request.query.params;
				if (!params) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}
				params = JSON.parse(params);
				server.plugins['models'].products.get_products_list(params,function(err,rows){
					if (!err) {
						if (rows.length>0) {
							server.plugins['models'].products.get_products_count(params,function(err,row){
								if (!err) {
									var num = row[0].num;
									return reply({"success":true,"message":"ok","rows":rows,"num":num,"service_info":service_info});
								}else {
									return reply({"success":false,"message":results.message,"service_info":service_info});
								}
							});
						}else {
							reply({"success":true,"message":"ok","rows":rows,"num":0,"service_info":service_info});
						}
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
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
						return reply({"success":true,"row":row,"service_info":service_info});
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
						for (var i = 0; i < rows.length; i++) {
							if (rows[i].location && rows[i].location.indexOf("http")==-1) {
								rows[i].location = "images/"+rows[i].location;
							}
						}
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
				server.plugins['models'].products_descriptions.get_product_description(product_id,function(err,rows){
					if (!err) {
						if (rows.length>0) {
							return reply({"success":true,"row":rows,"service_info":service_info});
						}else {
							return reply({"success":true,"row":[],"service_info":service_info});
						}
					}else {
						return reply({"success":false,"message":rows.message,"service_info":service_info});
					}
				});
			}
		},
		//根据名字找到商品
		{
			method: 'GET',
			path: '/search_pos_product',
			handler: function(request, reply){
				var product_name = request.query.product_name;
				if (!product_name) {
					return reply({"success":false,"message":"param null","service_info":service_info});
				}
				server.plugins['models'].products.search_pos_product(product_name, function(err, rows){
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
				var ep =  eventproxy.create("products","pictures",
					function(products,pictures){
						for (var i = 0; i < products.length; i++) {
							var flag = 0;
							for (var j = 0; j < pictures.length; j++) {
								if (flag == 0 && pictures[j].location && products[i].id == pictures[j].product_id) {
									var boolean = pictures[j].location.indexOf("http");
									if (boolean==-1) {
										pictures[j].location="images/"+pictures[j].location;
									}
									products[i].img = pictures[j];
									flag = 1;
								}

							}
						}
					return reply({"success":true,"message":"ok","products":products});
				});

				find_products(product_ids, function(err, rows) {
					if (!err) {
						ep.emit("products",rows);
					}else {
						ep.emit("products",[]);
					}
				});

				get_products_picture(product_ids, function(err, rows){
					if (!err) {
						ep.emit("pictures",rows);
					}else {
						ep.emit("pictures",[]);
					}
				});
			}
		},
		//查询最新商品
		{
			method: 'GET',
			path: '/find_lastest_products',
			handler: function(request, reply){
				var search_object = request.query.search_object;
				if (!search_object) {
					return reply({"success":false,"message":"param wrong","service_info":service_info});
				}
				search_object = JSON.parse(search_object);
				var ep =  eventproxy.create("products","pictures",
					function(products,pictures){
						for (var i = 0; i < products.length; i++) {
							var flag = 0;
							for (var j = 0; j < pictures.length; j++) {
								if (flag == 0 && pictures[j].location && products[i].id == pictures[j].product_id) {
									var boolean = pictures[j].location.indexOf("http");
									if (boolean==-1) {
										pictures[j].location="images/"+pictures[j].location;
									}
									products[i].img = pictures[j];
									flag = 1;
								}
							}
						}
						var img = {location:"images/no_picture.png"};
						for (var i = 0; i < products.length; i++) {
							if (!products[i].img) {
								products[i].img = img;
							}
						}
					return reply({"success":true,"rows":products});
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
		//查询所有商品及图片
		{
			method: 'POST',
			path: '/search_products_info',
			handler: function(request, reply){
				var search_object = request.payload.search_object;
				if (!search_object) {
					return reply({"success":false,"message":"param wrong","service_info":service_info});
				}
				var ep =  eventproxy.create("products","pictures",
					function(products,pictures){
						for (var i = 0; i < products.length; i++) {
							var flag = 0;
							for (var j = 0; j < pictures.length; j++) {
								if (flag ==0 && pictures[j].location && products[i].id == pictures[j].product_id) {
									var boolean = pictures[j].location.indexOf("http");
									if (boolean==-1) {
										pictures[j].location="images/"+pictures[j].location;
									}
									products[i].img = pictures[j];
									flag =1;
								}
							}
						}
						var img = {location:"images/no_picture.png"};
						for (var i = 0; i < products.length; i++) {
							if (!products[i].img) {
								products[i].img = img;
							}
						}
					return reply({"success":true,"products":products});
				});
				search_object = JSON.parse(search_object);
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
							return reply({"success":false,"message":"查不到商品明细！"});
						}
						var industry_id = product.industry_id;
						var table_name = industries[industry_id]["table_name"];
						server.plugins.models[table_name].find_by_product_id(product_id, function(err,rows) {
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
