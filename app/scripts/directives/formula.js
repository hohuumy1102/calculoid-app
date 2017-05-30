'use strict';
/*global calculoid */
/*global Parser */
calculoid.directive('calculoidFormula', function() {
	return {
		restrict: 'E',
		template: '<span class="formula-result">{{calculatedResultFormatted}}</span>',
		scope: {
			round: '=round',
			separatorThousand: '=separatorThousand',
			separatorDecimal: '=separatorDecimal',
			formula: '=formula',
			values: '=values',
			formulaError: '=error',
			calculatedResult: '=result',
			clickrun: '=clickrun',
						
		},
		controller: ['$scope', 'notify', '$filter', function($scope, notify, $filter) {
			
			$scope.calculate = function(values) {				
				var formula = $scope.formula;
				var result = 0;

				if (angular.isNumber(formula)) {
					$scope.calculatedResult = formula.toFixed($scope.round);
					return;
				}


				formula = formula.replace(/^\s+|\s+$/g,''); // trim spaces				
				angular.forEach($scope.values, function(value, key) {
					formula = $scope.replaceFieldIds(key, value, formula);
				});				
				if (formula) {
					try {
						result = parseFloat(Parser.parse(formula).evaluate());
						$scope.clickrun = true;
						
					} catch(err) {
						if(values && $scope.clickrun == 'yes')
						{
							notify({message: 'Formula error: ' + err.message + ' on formula: ' + formula});							
						}
						if (err.message !== $scope.formulaError) {
							notify({message: 'Formula error: ' + err.message + ' on formula: ' + formula});							
						}
						$scope.clickrun = false;
						$scope.formulaError = err.message;
					}
				}

				$scope.calculatedResult = result.toFixed($scope.round);
				$scope.calculatedResultFormatted = $filter('formatNumber')($scope.calculatedResult, $scope.separatorThousand, $scope.separatorDecimal);
			};

			$scope.replaceFieldIds = function(find, replace, str) {
				if (typeof replace === 'string') {
					replace = replace.replace(/,/, '.');
				}

				if (replace === '') {
					replace = 0;
				}

				replace = parseFloat(replace);

				if (isNaN(replace)) {
					replace = 0;
				}
				
				var regex = new RegExp(find + '(?!\\d)', 'g');
				return str.replace(regex, replace);
			};

			$scope.calculate();
			
			// calculate after change
			$scope.$watch('clickrun', function() {				
				if($scope.clickrun == 'yes')
				{
					$scope.calculate(true);
				}
			}, true);


			$scope.$watch('values', function() {				
				$scope.calculate();
			}, true);

			$scope.$watch('formula', function() {
				$scope.calculate();
			});

			$scope.$watch('round', function() {
				$scope.calculate();
			});

			$scope.$watch('separatorThousand', function() {
				$scope.calculatedResultFormatted = $filter('formatNumber')($scope.calculatedResult, $scope.separatorThousand, $scope.separatorDecimal);
			});

			$scope.$watch('separatorDecimal', function() {
				$scope.calculatedResultFormatted = $filter('formatNumber')($scope.calculatedResult, $scope.separatorThousand, $scope.separatorDecimal);
			});
		}]
	};
});

