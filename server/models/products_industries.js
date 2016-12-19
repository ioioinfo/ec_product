var _ = require('lodash');
var EventProxy = require('eventproxy');

var products_industries = function(server) {
	return {
		get_industries_list : function(callback) {
			var query = `select id, logo_url, code_type, card_type, brand_name, title, color,
				 notice, description, time_type, begin_timestamp, end_timestamp, fixed_term, fixed_begin, quantity,
				 card_id, use_custom_code, get_custom_code_mode, bind_openid, service_phone, location_id_list,
				 use_all_locations, source, center_title, center_sub_title, center_url, custom_url_name,
				 custom_url_sub_title, custom_url, promotion_url_name, promotion_url_sub_title, promotion_url, get_limit,
				 can_share, can_give_friend, status FROM cards`;
			value = server.plugins['cache'].myCache.get("get_cards_list");
			if ( value == undefined ){
				server.plugins['mysql'].pool.getConnection(function(err, connection) {
					connection.query(query, function(err, rows) {
						server.plugins['cache'].myCache.set("get_cards_list", rows);
						callback(rows);
					});
				});
			} else {
				callback(value);
			}
		},

	};
};

module.exports = products_industries;
