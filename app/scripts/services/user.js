'use strict';
/*global calculoidServices */
calculoidServices.factory('User', ['$rootScope', '$resource', function($rootScope, $resource) {

	var url = calculoidServices.baseUrl;
	var item = $resource(url+'user/:task/:id',
		{task:'@task', token:'@token', service:'@service', id:'@id', user:'@user'}, {query: {method:'GET'},
		isArray: true});

	var user = {};
	user.logged = 'out';

	user.getUser = function(forceUpdate) {
		var state = user.getState();
		if (state && forceUpdate !== true && typeof state.logged !== 'undefined' && (state.logged === 'in' || state.logged === 'out')) {
			$rootScope.$broadcast('user:updated', state);
		} else {
			var result = item.get({'task':'get'});
			result.$promise.then(function(userData){
				$rootScope.$broadcast('user:updated', userData);
				user.setState(userData);
				user.setUserData(userData);
			});
		}

		return user;
	};

	// get a user (other than the one who is logged in)
	user.getAUser = function(id) {
		var data = {
			'task':'get'
		};

		if (typeof id !== 'undefined' && id && user.token !== 'undefined' && user.token) {
			data.id = id;
			data.token = user.token;
		}

		var result = item.get(data);

		return result;
	};

	user.setUserData = function(userData) {
		angular.extend(user, userData);
	}

	user.setState = function(userData) {
		window.sessionStorage.setItem('calculoidUser', angular.toJson(userData));
	}

	user.getState = function() {
		var userData = angular.fromJson(window.sessionStorage.getItem('calculoidUser'));
		user.setUserData(userData);
		return userData;
	}

	user.authenticate = function(service, user2check) {
		var user2send = {};

		if (service === 'calculoid') {
			user2send = user2check;
		} else if (service === 'google') {
			user2send.code = user2check.code;
		}

		var result = item.save({'task':'authenticate', 'token': user.token, 'service': service, 'user': user2send});

		result.$promise.then(function(userData) {
			user.setUserData(userData);
			user.setState(userData);
			$rootScope.$broadcast('user:updated', userData);

			if (typeof userData.token !== 'undefined') {
				ga('send', 'event', 'user', 'login', userData.name);
			} 
		});
		
		return result;
	};

	user.sendReset = function(email) {
		var user2send = {'email': email, 'resetUrl': location.origin+'#/password/reset/'};

		var result = item.save({'task':'sendReset', 'token': user.token, 'user': user2send});

		return result;
	};

	user.resetPassword = function(user2send) {
		var result = item.save({'task':'resetPassword', 'token': user.token, 'user': user2send});

		return result;
	};

	user.logout = function() {
		var result = item.save({'task':'logout', 'token': user.token, 'user': user});
		result.$promise.then(function(data) {
			user.setUserData({}); // clear the user object
			user.setUserData(data);
			user.setState(data);
			$rootScope.$broadcast('user:updated', user);
		});
		return result;
	};

	user.register = function(registerUser) {
		var result = item.save({'task':'register', 'token': user.token, 'user': registerUser});
		result.$promise.then(function(data) {
			user.setUserData(data);
			user.setState(data);

			if (typeof data.token !== 'undefined') {
				ga('send', 'event', 'user', 'register', data.name);
			}

			$rootScope.$broadcast('user:updated', user);
		});
		return result;
	};

	user.get = function() {
		return user;
	};

	user.saveProfile = function(profile) {
		var data = {
			'email': profile.email,
			'group': profile.group,
			'groupExpire': profile.groupExpire,
			'name': profile.name
		}

		var result = item.save({'task': 'save', 'token': user.token, 'user': data});

		return result;
	};

	return user;

}]);
