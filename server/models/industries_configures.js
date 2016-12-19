var _ = require('lodash');
var EventProxy = require('eventproxy');
﻿var industries = require('../utils/industries.js');

var industries_configures = function(server) {
	return {
		find_by_industry_id : function(industry_id, product_id, callback) {
			var industry = industries[industry_id];
			console.log(industry["table_name"]);
			var query = `select * from `+ industry["table_name"] + ` where product_id = ?` ;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, product_id, function(err, results) {
					if (err) {
						throw err;
					}
					_.each(industry["properties"],function(property) {
						console.log("name:"+property["name"]+",value:"+results[0][property["field_name"]])
					})
					connection.release();
					callback(results);
				});
			});
		},

	};
};

module.exports = industries_configures;
