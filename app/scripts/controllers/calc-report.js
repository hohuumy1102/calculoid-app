'use strict';
/*global calculoid */
calculoid.controller('CalcReportCtrl',
	['$scope', 'User', '$routeParams', '$window', '$http', 'googleChartApiPromise',
	function ($scope, User, $routeParams, $window, $http, googleChartApiPromise) {

	$window.document.title = 'Calculator report - Calculoid';

	$scope.calcId = $routeParams.slug;
	$scope.user = User.get();
	$scope.report = {};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
		$scope.loadReports();
	});

	$scope.requestChartData = {
		"type": "AreaChart",
		"title": "Views",
		"data": {
			"cols": [
		        {id: "t", label: "time", type: "string"},
		        {id: "v", label: "Views", type: "number"}
		    ],
		    "rows": []
		},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"is3D": true
		}
	};

	$scope.loadReports = function() {
		if (typeof $scope.user.token !== 'undefined') {
			$http.get(calculoidServices.baseUrl + 'calculator/report/' + $scope.calcId + '?token=' + $scope.user.token).then(function(response) {
				$scope.report = response.data;
				$scope.requestChartData.data = response.data.requests;
			});
		}
	};

	$scope.loadReports();
}]);
