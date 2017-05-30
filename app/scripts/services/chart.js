'use strict';
/*global calculoidServices */
calculoidServices.factory('Chart', ['$rootScope', function($rootScope){
	
	var chart = {};
	var gaugeFields = [];
	var gaugeOptions = [];

	chart.compare = function(valA, valB){
		valA = angular.toJson(valA);
		valB = angular.toJson(valB);

		if(valA === valB){
			return true;
		}else{
			return false;
		}
	}

	chart.generateArray = function(count, max, min){
		var gaugeMajorTicks = [];
		if (count){
			for(var i = 0; i <= count; i++){
				if(i === 0){
					gaugeMajorTicks.push(min);
				}else{
					gaugeMajorTicks.push(parseInt(((max - min) / count * i)) + +min);
				}
			}
			return gaugeMajorTicks;
		}
	}

	chart.fieldToGauge = function(field){

		if (typeof gaugeFields[field.id] !== 'undefined' && chart.compare(gaugeFields[field.id], field)){
			return gaugeOptions[field.id];
		}

		gaugeFields[field.id] = angular.copy(field);

		if(!field.value){
			field.value = 0;
		}

		var majorTicks = chart.generateArray(field.params.majorTicks, field.params.max, field.params.min);

		if (typeof field.calculatedWidth !== 'undefined' && field.calculatedWidth < field.params.width){
			var width = field.calculatedWidth;
		} else {
			var width = field.params.width;
		}

		gaugeOptions[field.id] = {
			'type': 'Gauge',
			'displayed': true,
			'data': [
				['Label', 'Value'],
				[field.params.header, field.value]
			],
			'options': {
				'width': width,
				'height': width,
				'min': field.params.min,
				'max': field.params.max,
				'redFrom': field.params.redFrom,
				'redTo': field.params.redTo,
				'yellowFrom':field.params.yellowFrom,
				'yellowTo': field.params.yellowTo,
				'greenFrom': field.params.greenFrom,
				'greenTo': field.params.greenTo,
				'majorTicks': majorTicks,
				'minorTicks': field.params.minorTicks
	        }
		}
		return gaugeOptions[field.id];
	}

	return chart;
	
}]);