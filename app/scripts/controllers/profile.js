'use strict';
/*global calculoid */
calculoid.controller('ProfileCtrl',
	['$scope', 'User', '$routeParams', '$window',
	function ($scope, User, $routeParams, $window) {

	$scope.user = User.getUser(true); // force update so the user see the latest and greatest data

	if ($routeParams.id) {
		$scope.profile = User.getAUser($routeParams.id);
	} else {
		$scope.profile = $scope.user;
	}

	$scope.updateTitle = function() {
		if ($scope.profile && typeof $scope.user.logged !== 'undefined' && $scope.user.logged === 'in') {
			$window.document.title = $scope.profile.name + '\'s profile - Calculoid';
		} else {
			$window.document.title = '404 Profile not found - Calculoid';
		}
	}

	$scope.saveProfile = function() {
		$scope.profile = User.saveProfile($scope.profile);
	}

	$scope.updateTitle();

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		$scope.updateTitle();
	});
}]);
