'use strict';
/*global calculoid */
/*global $ */
calculoid.directive('flexicolor', function() {
	return {
		restrict: 'A',
		scope: {ngModel: '=?', flexicolorWidth: '=?', flexicolorHeight: '=?'},
		template: "<div class=\"flexicolor-picker\"><div class=\"flexicolor-picker-indicator\"></div></div><div class=\"flexicolor-slider\"><div class=\"flexicolor-slider-indicator\"></div></div>",
		link: function(scope, elem, attr) {

			scope.safeApply = function(fn) {
				var phase = this.$root.$$phase;
				if(phase == '$apply' || phase == '$digest') {
					if(fn && (typeof(fn) === 'function')) {
						fn();
					}
				} else {
					this.$apply(fn);
				}
			};
			
			var colorpicker = elem.children();
			var picker = colorpicker[0];
			var slider = colorpicker[1];
			var pickerIndicator = angular.element(picker).children()[0];
			var sliderIndicator = angular.element(slider).children()[0];

			elem.css('width', (scope.flexicolorWidth) + 'px')
				.css('height', (scope.flexicolorHeight + 6) + 'px')
				.css('border', '3px solid gray')
				.css('border-radius', '5px');

			angular.element(picker)
				.css('width', (scope.flexicolorWidth - 36) + 'px')
				.css('height', scope.flexicolorHeight + 'px')
				.css('cursor', 'crosshair')
				.css('border-right', '3px solid gray')
				.css('float', 'left')
				.css('position', 'relative');

			angular.element(slider)
				.css('width','30px')
				.css('height', scope.flexicolorHeight + 'px')
				.css('cursor', 'crosshair')
				.css('float', 'left')
				.css('position', 'relative');

			ColorPicker.fixIndicators(sliderIndicator, pickerIndicator);

			var cp = ColorPicker(slider, picker, function(hex, hsv, rgb, pickerCoordinate, sliderCoordinate) {

				ColorPicker.positionIndicators(
                    sliderIndicator,
                    pickerIndicator,
                    sliderCoordinate,
                    pickerCoordinate
                );

	            scope.ngModel = hex;
	            scope.safeApply();
	        });

			scope.$watch('ngModel', function(v) {
				if(scope.ngModel.length > 4){
					cp.setHex(scope.ngModel);
				}
			}, true);
		}
	};
});