'use strict';
/*global calculoid */
calculoid.controller('StatsCtrl',
	['$scope', 'User', '$http', '$window', 'googleChartApiPromise',
	function ($scope, User, $http, $window, googleChartApiPromise) {

	$window.document.title = 'Calculoid - Admini Statistics';
	$scope.user = User.get();
	$scope.currentChart = 'payments';
	$scope.chartData = [];
	$scope.chartData['payments'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"format": "€ #,##0.00"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		},
		"formatters": {
			"number": [
		        {
		            "columnNum": 1,
		            "pattern": "€ #,##0.00"
		        }
		    ]
		}
	};

	$scope.chartData['orders'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"title": "Count of created orders"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		}
	};

	$scope.chartData['users'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"title": "Count of registered users"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		}
	};

	$scope.chartData['calculators'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"title": "Count of created calculators"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		}
	};

	$scope.chartData['requests'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"title": "Count of loaded calculators"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		}
	};

	$scope.chartData['submissions'] = {
		"type": "AreaChart",
		"displayed": true,
		"data": {},
		"options": {
			"legend": {"position": 'top', "maxLines": 3},
			"height": 500,
			"isStacked": false,
			"fill": 20,
			"displayExactValues": true,
			"vAxis": {
				"title": "Count of submissions"
			},
			"hAxis": {
				"textStyle": {
					"fontSize": 10
				}
			}
		}
	};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		if (typeof $scope.user.token !== 'undefined' && $scope.user.token) {
			$scope.loadStatsData($scope.currentChart);
		}
	});

	$scope.loadStatsData = function (chart) {
		if (!$scope.chartData[chart].data.length && typeof $scope.user.token !== 'undefined') {
			$http.get(calculoidServices.baseUrl+'stats?token='+$scope.user.token+'&chart='+chart).then(function(response) {
				googleChartApiPromise.then( function () {
					$scope.chartData[chart].data = google.visualization.arrayToDataTable(response.data.items.chartData);
				});
			});
		}
	};

	$scope.showChart = function(chart) {
		$scope.currentChart = chart;
		$scope.loadStatsData(chart);
	};

	$scope.activeTab = function(chart) {
		if (chart === $scope.currentChart) {
			return 'active';
		}
		return '';
	};

	$scope.showChart($scope.currentChart);
}]);
