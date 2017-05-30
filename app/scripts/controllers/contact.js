'use strict';
/*global calculoid */
calculoid.controller('ContactCtrl',
	['$scope', 'User', '$http',
	function ($scope, User, $http) {

	$scope.name = '';
	$scope.email = '';
	$scope.phone = '';
	$scope.message = '';
	$scope.note = '';

	$scope.error = {'name':false, 'email':false, 'message':false};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
	});
	$scope.user = User.get();

	$scope.send = function(){
		if (!$scope.name){
			$scope.error.name = true;
		} else {
			$scope.error.name = false;
		}
		if (!$scope.email){
			$scope.error.email = true;
		} else {
			$scope.error.email = false;
		}
		if (!$scope.message){
			$scope.error.message = true;
		} else {
			$scope.error.message = false;
		}

		if (!$scope.error.message && !$scope.error.email && !$scope.error.name){
			$scope.note = 'Sending...';
			var postData = '?'
				+'token='+$scope.user.token
				+'&name='+$scope.name
				+'&phone='+$scope.phone
				+'&email='+$scope.email
				+'&message='+$scope.message;

			$http.post(calculoidServices.baseUrl+'contact/'+postData).
			    success(function(data, status, headers, config) {
					if (typeof data.alerts !== 'undefined'){
						$scope.note = data.alerts[0].msg;

						if (data.alerts[0].type === 'success'){
							$scope.name = '';
							$scope.email = '';
							$scope.phone = '';
							$scope.message = '';
						}
					}
			    }).
			    error(function(data, status, headers, config) {
			    	$scope.note = data;
			    });
		} else {
			$scope.note = 'Fill in all mandatory fields, please.';
		}
	}

}]);