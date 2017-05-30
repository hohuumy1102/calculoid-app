'use strict';
/*global calculoid */
calculoid.controller('PasswordResetCtrl', ['$scope', 'User', '$routeParams', function ($scope, User, $routeParams) {
	$scope.user = {'resetToken': $routeParams.secret};

	$scope.resetPassword = function(){
		User.resetPassword($scope.user).$promise.then(function(data){
			if(typeof data.alerts !== 'undefined'){
				$scope.alerts = data.alerts;
			}
		});
	};

}]);


