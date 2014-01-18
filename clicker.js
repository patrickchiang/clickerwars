var producer = [{
	name : "workshop",
	cost : 10,
	increase : 1,
	amount : 0
}, {
	name : "assembly line",
	cost : 1000,
	increase : 10,
	amount : 0
}, {
	name : "factory",
	cost : 100000,
	increase : 100,
	amount : 0
}, {
	name : "industrial area",
	cost : 10000000,
	increase : 1000,
	amount : 0
}];

var military = [{
	name : "fighter",
	cost : 10,
	increase : 0,
	amount : 0
}, {
	name : "tank",
	cost : 1000,
	increase : 0,
	amount : 0
}, {
	name : "helo",
	cost : 100000,
	increase : 0,
	amount : 0
}, {
	name : "jet",
	cost : 10000000,
	increase : 0,
	amount : 0
}];

if (Meteor.isClient) {

	Accounts.ui.config({
		passwordSignupFields : "USERNAME_ONLY"
	});

	Meteor.subscribe("userData");

	Template.playerInfo.user = function() {
		return Meteor.user();
	};

	Template.populate.events({
		"click button.populate" : function() {
			Meteor.call("click");
		}
	});

	Template.production.display = function() {
		return producer;
	};

	Template.production.events({
		"click button" : function(event) {
			Meteor.call("produce", event.target.id);
		}
	});

	Template.military.display = function() {
		return military;
	};

	Template.military.events({
		"click button" : function(event) {
			Meteor.call("produce", event.target.id);
		}
	});

	Template.stats.prod = function() {
		if (Meteor.user())
			return Meteor.user().production;
		else
			return [];
	};

	Template.stats.mil = function() {
		if (Meteor.user())
			return Meteor.user().military;
		else
			return [];
	};

	Handlebars.registerHelper('key_value', function(context, options) {
		var result = [];
		_.each(context, function(value, key, list) {
			result.push({
				key : key,
				value : value
			});
		});
		return result;
	});

}

if (Meteor.isServer) {
	Accounts.onCreateUser(function(options, user) {
		user.robots = 0;
		user.rate = 0;
		user.production = {
			"workshop" : 0,
			"assembly line" : 0,
			"factory" : 0,
			"industrial area" : 0
		};
		user.military = {
			"fighter" : 0,
			"tank" : 0,
			"helo" : 0,
			"jet" : 0
		};
		user.x = 10;
		user.y = 11;
		return user;
	});

	Meteor.publish("userData", function() {
		return Meteor.users.find({}, {
			sort : {
				"robots" : -1
			}
		});
	});

	Meteor.startup(function() {
		Meteor.setInterval(function() {
			Meteor.users.find({}).map(function(user) {
				Meteor.users.update({
					_id : user._id
				}, {
					$inc : {
						"robots" : user.rate
					}
				});
			});
		}, 1000);
	});
}

Meteor.methods({
	click : function() {
		Meteor.users.update({
			_id : this.userId
		}, {
			$inc : {
				"robots" : 1
			}
		});
	},
	produce : function(type) {
		var producerType, prodName;
		for (var temp in producer) {
			if (producer[temp].name == type) {
				producerType = producer[temp];
				prodName = "production." + producerType.name;
			}
		}
		for (var temp in military) {
			if (military[temp].name == type) {
				producerType = military[temp];
				prodName = "military." + producerType.name;

			}
		}
		if (producerType !== undefined && Meteor.user().robots >= producerType.cost) {
			var updateInfo = {
				$inc : {
					"robots" : 0 - producerType.cost,
					"rate" : producerType.increase,
				}
			};
			updateInfo.$inc[prodName] = 1;
			Meteor.users.update({
				_id : this.userId
			}, updateInfo);
		}
	},
	demolish : function(type) {
		var producerType, prodName;
		for (var temp in producer) {
			if (producer[temp].name == type) {
				producerType = producer[temp];
				prodName = "production." + producerType.name;
			}
		}
		for (var temp in military) {
			if (military[temp].name == type) {
				producerType = military[temp];
				prodName = "military." + producerType.name;

			}
		}
		if (producerType !== undefined && Meteor.user().robots >= producerType.cost) {
			var updateInfo = {
				$inc : {
					"robots" : producerType.cost,
					"rate" : 0 - producerType.increase,
				}
			};
			updateInfo.$inc[prodName] = -1;
			Meteor.users.update({
				_id : this.userId
			}, updateInfo);
		}
	}
});
