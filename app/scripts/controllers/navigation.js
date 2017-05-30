'use strict';
/*global calculoid */
calculoid.controller('NavigationCtrl', ['$rootScope', '$scope', 'User', '$uibModal', '$window', function ($rootScope, $scope, User, $uibModal, $window) {
	$scope.navIsCollapsed = true;
	User.getUser();
	$scope.user = User;

	$scope.$on('user:updated', function(event, newUser) {
	  	$scope.user = newUser;
	  	$scope.safeApply();
	});

	$scope.safeApply = function() {
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	}

	$scope.$on('$routeChangeStart', function(next, current) {
		$window.document.title = 'Calculoid.com - Calculators widget for websites';
	});

	$scope.$on('event:google-plus-signin-success', function (event, authResult) {
		User.authenticate('google', authResult);
	});

	$scope.$on('event:google-plus-signin-failure', function () {
		// $scope.user.logged = 'out';
		$scope.safeApply();
	});

	$scope.openLogin = function () {
		$scope.loginModal = $uibModal.open({
			templateUrl: 'views/user-login.html',
		});
	};

	$scope.logout = function() {
		User.logout();
	};

	$scope.isAdmin = function() {
		return $scope.user.group === '6';
	};
}]);
