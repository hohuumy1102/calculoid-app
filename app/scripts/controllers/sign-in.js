'use strict';
/*global calculoid */
calculoid.controller('SignInCtrl', ['$scope', 'User', function ($scope, User) {
	$scope.user = User.get();
	$scope.showResetForm = false;
	$scope.loginUser = {};
	$scope.registerUser = {};
	$scope.registerUser.password = '';
	$scope.alerts = [];
	
	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
	});

	$scope.register = function() {
		User.register($scope.registerUser).$promise.then(function(data){
			if(typeof data.alerts !== 'undefined'){
				$scope.alerts.registration = data.alerts;
			}
		});
	};

	$scope.showReset = function(resetValue) {
		$scope.showResetForm = resetValue;
	};

	$scope.authenticate = function(service) {
		User.authenticate(service, $scope.loginUser).$promise.then(function(data){
			if(typeof data.alerts !== 'undefined') {
				$scope.alerts.login = data.alerts;
			}
		});
	};

	$scope.sendReset = function() {
		User.sendReset($scope.loginUser.email).$promise.then(function(data){
			if(typeof data.alerts !== 'undefined') {
				$scope.alerts.reset = data.alerts;
			}
		});
	};

}]);


