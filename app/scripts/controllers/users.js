'use strict';
/*global calculoid */
calculoid.controller('UsersCtrl',
	['$scope', 'User', '$routeParams', '$window', '$http',
	function ($scope, User, $routeParams, $window, $http) {

	$scope.limit = 20;
	$scope.alerts = [];
	$scope.user = User.get();
	$scope.orderByColumn = 'u.group';
	$scope.search = '';
	$scope.pg = {current: 1};
	$window.document.title = 'User manager - Calculoid';


	$scope.loadUsers = function() {
		var order = 'desc';
		if ($scope.reverseSort === false) {
			order = 'asc';
		}
		var postData = '?'
			+'token='+$scope.user.token
			+'&limit='+$scope.limit
			+'&page='+$scope.pg.current
			+'&order='+order
			+'&orderby='+$scope.orderByColumn
			+'&search='+$scope.search;

		$http.post(calculoidServices.baseUrl+'users/'+postData).
		    success(function(data, status, headers, config) {
				if (typeof data.alerts !== 'undefined') {
					$scope.alerts = data.alerts;
				}
				if (typeof data.items !== 'undefined') {
					$scope.users = data.items;
				}
				if (typeof data.pg !== 'undefined') {
					$scope.pg = data.pg;
				}
		    }).
		    error(function(data, status, headers, config) {
		    });
	};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
		$scope.loadUsers();
	});

	if (typeof $scope.user.token !== 'undefined') {
		$scope.loadUsers();
	} else {
		$scope.users = [];
	}

	$scope.reorder = function(column) {
		$scope.reverseSort = !$scope.reverseSort;
		$scope.orderByColumn = column;
		$scope.loadUsers();
	}

	$scope.changeSearch = function() {
		$scope.loadUsers();
	}

	$scope.onGoToPage = function() {
		$scope.loadUsers();
	};
}]);