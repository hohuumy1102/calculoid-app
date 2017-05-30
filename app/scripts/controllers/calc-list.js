'use strict';
/*global calculoid */
calculoid.controller('CalcListCtrl', ['$scope', 'Calc', '$location', 'User', '$uibModal', '$routeParams', '$route', '$window',
	function ($scope, Calc, $location, User, $uibModal, $routeParams, $route, $window) {

	$scope.user = User.getUser();
	$scope.search = '';
	$scope.selectedTag = '';
	$scope.languages = Calc.getLanguages(0);
	$scope.language = {};
	$scope.tagsLimit = 10;
	$scope.tags = Calc.getTags($scope.tagsLimit);
	$scope.tagsLoad = '[+] More';

	if ($routeParams.tag)
	{
		$scope.selectedTag = $routeParams.tag;
	}

	$scope.getTag = function() {
		if ($routeParams.tag) {
			return $routeParams.tag;
		} else {
			return $scope.selectedTag;
		}
	}

	$scope.getLangId = function() {
		var langId = null;
		if (typeof $scope.language.id !== 'undefined') {
			langId = $scope.language.id;
		}
		return langId;
	}

	$scope.calcList = Calc.getList($routeParams.tag, $scope.search, $scope.getLangId(), 1);

	$window.document.title = 'List of ' + $scope.selectedTag + ' calculators - Calculoid';

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
		if ($scope.user.logged === 'in' && typeof $scope.loginModal !== 'undefined') {
			$scope.loginModal.close();
		}

		// load calcList again. It may be different for different user
		$scope.calcList = Calc.getList($routeParams.tag, $scope.search, $scope.getLangId(), 1);
	});

	$scope.changeSearch = function() {
		$scope.calcList = Calc.getList($scope.getTag(), $scope.search, $scope.getLangId(), $scope.calcList.pg.current);
	};

	$scope.setTag = function(tag) {
		if (tag === $scope.selectedTag) {
			$scope.selectedTag = '';
		} else {
			$scope.selectedTag = tag;
		}
		$location.url($scope.selectedTag + '/calculators');
	};

	$scope.changeLanguage = function() {
		$scope.calcList = Calc.getList($scope.getTag(), $scope.search, $scope.language.id, $scope.page);
	};

	$scope.create = function() {
		if ($scope.user.logged !== 'in') {
			$scope.openLogin();
		} else {
			$location.path('/new/');
		}
	};

	$scope.openLogin = function() {
		$scope.loginModal = $uibModal.open({
			templateUrl: 'views/user-login.html',
		});
	};

	$scope.loadTags = function() {
		if ($scope.tagsLimit === 10) {
			$scope.tagsLoad = '[-] Less';
			$scope.tagsLimit = 50;
		} else {
			$scope.tagsLoad = '[+] More';
			$scope.tagsLimit = 10;
		}
		$scope.tags = Calc.getTags($scope.tagsLimit);
	}

	$scope.onGoToPage = function() {
		$scope.calcList = Calc.getList($scope.getTag(), $scope.search, $scope.getLangId(), $scope.calcList.pg.current);
	};
}]);
