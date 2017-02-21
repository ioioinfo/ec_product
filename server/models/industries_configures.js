var _ = require('lodash');
var EventProxy = require('eventproxy');
﻿var industries = require('../utils/industries.js');

var industries_configures = function(server) {
	return {
		find_by_industry_id : function(industry_id, product_id, cb) {
			var industry = industries[industry_id];
			console.log(industry["table_name"]);
			var query = `select * from `+ industry["table_name"] + ` where product_id = ?` ;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, product_id, function(err, results) {
					if (err) {
						throw err;
					}
					var row = {};
					if (results.length > 0) {
						row = results[0];
					}
					
					connection.release();
					cb(results);
				});
			});
		},

	};
};

module.exports = industries_configures;
