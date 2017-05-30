'use strict';
/*global calculoid */
calculoid.controller('SubmissionsCtrl',
	['$scope', 'Calc', 'User', '$routeParams', '$window',
	function ($scope, Calc, User, $routeParams, $window) {

	$scope.search = '';
	$scope.paymentStatus = '';
	$scope.calcId = $routeParams.slug;
	$scope.user = User.get();
	$scope.submissions = Calc.getSubmissions($scope.user.token);
	$scope.statuses = ['', 'Completed', 'Pending', 'Refunded'];

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
		$scope.submissions = $scope.loadSubmissionList();
	});

	$window.document.title = 'Calculator submissions - Calculoid';

	$scope.loadSubmission = function(index, force) {
		var id = $scope.submissions.items[index].id;
		if (typeof $scope.submissions.items[index].detail === 'undefined' || force) {
			$scope.submissions.items[index].detailStatus = 'Loading...';
			Calc.getSubmission($scope.user.token, id).$promise.then(function(detail) {
				$scope.submissions.items[index].detail = detail;
				if (typeof detail.loaded !== 'undefined') {
					$scope.submissions.items[index].detailStatus = 'Loaded at ' + detail.loaded;
					$scope.submissions.items[index].loaded = detail.loaded;
				} else {
					$scope.submissions.items[index].detailStatus = 'Connection was lost';
				}
			});
		}
	};

	$scope.deleteSubmission = function(index) {
		var id = $scope.submissions.items[index].id;
		$scope.submissions.items[index].deleteStatus = 'Wait for it...';
		$scope.submissions.items[index].deleteButtonDisabled = true;
		Calc.deleteSubmission($scope.user.token, id).$promise.then(function(response) {
			$scope.submissions.items[index].deleteButtonDisabled = false;
			if (typeof response.deleted === 'undefined') {
				$scope.submissions.items[index].deleteStatus = 'Connection was lost';
			} else if (response.deleted) {
				$scope.submissions = $scope.loadSubmissionList();
			} else {
				$scope.submissions.items[index].deleteStatus = response.alerts[0].msg;
			}
		});
	};

	$scope.changeSearch = function() {
		$scope.submissions = $scope.loadSubmissionList();
	};

	$scope.changeStatus = function() {
		$scope.submissions = $scope.loadSubmissionList();
	};

	$scope.onGoToPage = function() {
		$scope.submissions = $scope.loadSubmissionList();
	};

	$scope.loadSubmissionList = function() {
		if (!$scope.submissions.pg) $scope.submissions.pg = {current: 1};
		return Calc.getSubmissions($scope.user.token, $scope.search, $scope.submissions.pg.current, $scope.paymentStatus);
	}
}]);
