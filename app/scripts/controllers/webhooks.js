'use strict';
/*global calculoid */
calculoid.controller('WebhooksCtrl',
	['$scope', 'Calc', 'User', '$routeParams', '$window', '$http',
	function ($scope, Calc, User, $routeParams, $window, $http) {

	$scope.calcId = $routeParams.slug;
	$scope.user = User.get();
	$scope.webhooks = {};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
		$scope.webhooks = $scope.loadWebhookList();
	});

	$window.document.title = 'Calculator Webhooks - Calculoid';

	$scope.loadWebhookList = function() {
		if (typeof $scope.user.token === 'undefined' || !$scope.user.token) {
			return;
		}
		$http.get(calculoidServices.baseUrl+'calculator/' + $scope.calcId + '/webhooks?token=' + $scope.user.token)
			.success(function(data, status, headers, config) {
				if (typeof data.items !== 'undefined') {
					$scope.webhooks = data.items;
				}
				if (typeof data.alerts !== 'undefined') {
					$scope.note = data.alerts[0].msg;

					if (data.alerts[0].type === 'success') {
						$scope.name = '';
						$scope.email = '';
						$scope.phone = '';
						$scope.message = '';
					}
				}
			});
	}

	$scope.loadWebhookList();

	$scope.resend = function(index) {
		if (typeof $scope.user.token === 'undefined' || !$scope.user.token) {
			return;
		}
		var webhook = $scope.webhooks[index];
		webhook.inProgress = true;
		$http.get(calculoidServices.baseUrl+'webhook/' + webhook.id + '/resend?token=' + $scope.user.token)
			.success(function(data, status, headers, config) {
				if (typeof data.status !== 'undefined' && data.status == 1) {
					$scope.loadWebhookList();
				}
				if (typeof data.alerts !== 'undefined') {
					$scope.note = data.alerts[0].msg;

					if (data.alerts[0].type === 'success') {
						$scope.name = '';
						$scope.email = '';
						$scope.phone = '';
						$scope.message = '';
					}
				}
				webhook.inProgress = false;
			});
	}

	$scope.getStatusStyle = function(code) {
		if (code < 200) {
			return 'text-primary';
		}
		if (code >= 200 && code < 300) {
			return 'text-success';
		}
		if (code >= 300 && code < 400) {
			return 'text-muted';
		}
		if (code >= 400 && code < 500) {
			return 'text-warning';
		}
		if (code >= 500) {
			return 'text-danger';
		}
	}

	$scope.displayKey = function(key) {
		key = key.charAt(0).toUpperCase() + key.slice(1);
		key = key.replace(/_/g, ' ');
		return key;
	}

	$scope.displayValue = function(key, value) {
		return value;
	}

	$scope.showInfo = function(webhook) {
		var info = '';
		angular.forEach(webhook, function(value, key) {
			if (key !== 'query' && key !== 'query_object' && key !== 'content' && key !== '$$hashKey') {
				info += $scope.displayKey(key) + ': ' + $scope.displayValue(key, value) + "\n";
			}
		});
		return info;
	}
}]);
