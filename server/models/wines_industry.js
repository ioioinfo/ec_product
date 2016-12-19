var _ = require('lodash');
var EventProxy = require('eventproxy');

var wines_industry = function(server) {
	return {
		find_by_table_id : function(industry_id, callback) {
			var query = `select table_name from industries_configures where industry_id = ?`;

			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, industry_id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

	};
};

module.exports = wines_industry;
