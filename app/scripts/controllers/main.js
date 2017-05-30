'use strict';
/*global calculoid */
calculoid.controller('MainCtrl',
	['$scope', 'User', '$routeParams', '$uibModal',
	function ($scope, User, $routeParams, $uibModal) {

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
	});

	$scope.calcId = $routeParams.slug;
	$scope.user = User.get();

	$scope.openVideo = function () {
		$scope.videoModal = $uibModal.open({
			templateUrl: 'views/video.html',
			windowClass: 'large'
		});
	};
}]);
