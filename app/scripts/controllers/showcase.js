'use strict';
/*global calculoid */
calculoid.controller('ShowcaseCtrl',
	['$scope', '$http', '$window', 'User',
	function ($scope, $http, $window, User) {

	$window.document.title = 'Calculoid - Showcase';
	var url = calculoidServices.baseUrl;
	$scope.domains = {};
	$scope.user = User.get();

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		if (typeof $scope.user.token !== 'undefined' && $scope.user.token)
		{
			$http.get(url+'statistic/domains?token='+$scope.user.token).then(function(response) {
				$scope.domains = response.data.items;
			});
		}
	});

	$http.get(url+'statistic/domains').then(function(response) {
		$scope.domains = response.data.items;
	});

	$scope.getDomainLink = function(domain) {
		if (domain.referer) {
			return domain.referer;
		} else {
			return domain.origin;
		}
	}

	$scope.stripHttp = function(text) {
		return text.replace('www.', '').replace('http://', '').replace('https://', '');
	}

	$scope.ucfirst = function(string)
	{
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
}]);