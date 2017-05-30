'use strict';
/*global calculoidServices */
calculoidServices.factory('Calc', ['$resource', '$routeParams', '$q', function($resource, $routeParams, $q) {
	var url = calculoidServices.baseUrl;
	var list = $resource(url+'calculators/', {tag:'@tag', search:'@search', language:'@language', page:'@page'},
		{query: {method:'GET'}});
	var item = $resource(url+'calculator/:task/:slug',
		{task:'@task', token:'@token', slug:'@slug', calculator:'@calculator', field:'@field'},
		{query: {method:'GET'}, save: {method: 'POST'},
		isArray: true});
	var option = $resource(url+'option/:task/:id', {task:'@task', id:'@id', fieldId:'@fieldId', token:'@token'});
	var submissions = $resource(url+'submissions/:slug', {'token': '@token','slug': '@slug', search: '@search'},
		{query: {method:'GET'}});
	var submission = $resource(url+'submission/:task/:id', {'token': '@token', 'task': '@task', 'id': '@id'},
		{query: {method:'GET'}});
	var languages = $resource(url+'languages/', {'empty': '@empty'},
		{query: {method:'GET'}});
	var tags = $resource(url+'tags/:limit/:search', {'limit': '@limit', 'search': '@search'},
		{query: {method:'GET'}});

	var loadedCalc = {};

	var calc = {};
	calc.slug = '';

	calc.getList = function(tag, search, language, page) {
		return list.query({'tag':tag, 'search':search, 'language':language, 'page':page});
	};

	calc.getCalc = function(slug) {
		calc.slug = slug;
		var result = item.get({'slug':slug});
		result.$promise.then(function(data) {
			loadedCalc = angular.copy(data);
		});
		return result;
	};

	calc.getSubmissions = function(token, search, page, status) {
		if (token) {
			return submissions.query({'token': token, 'slug': $routeParams.slug, 'search':search, 'page': page, 'status': status});
		} else {
			return {};
		}
	};

	calc.getSubmission = function(token, id) {
		if (token) {
			return submission.query({'token': token, 'id': id});
		} else {
			return {};
		}
	};

	calc.deleteSubmission = function(token, id) {
		if (token) {
			return submission.save({'token': token, 'task': 'delete', 'id': id});
		} else {
			return {};
		}
	};

	calc.getLanguages = function(empty){
		return languages.query({'empty':empty});
	};

	calc.getTags = function(limit, search){
		if (!limit) {
			limit = 10;
		}
		return tags.query({'limit':limit, 'search':search});
	};

	calc.deleteField = function(field, token){
		return item.save({'task': 'deleteField', 'slug': field.id, 'token': token});
	};

	calc.createFieldOption = function(field, token){
		return option.save({'task': 'create', 'fieldId': field.id, 'token': token});
	};

	calc.deleteFieldOption = function(optionField, token){
		return option.save({'task': 'delete', 'id': optionField.id, 'token': token});
	};

	calc.save = function(calcToSave, token){
		calcToSave = angular.copy(calcToSave);
		calc.prepareCalcToSave(calcToSave);

		var batches = [];
		var promises = [];
		var fieldCount = 0;
		var batchLimit = 3;

		for (var o in calcToSave.fields) {
		    fieldCount++;
		}

		if (fieldCount > batchLimit) {
			var batch = {};
			var fields = angular.copy(calcToSave.fields);
			var counter = 0;
			var savedFields = null;
			calcToSave.fields = {};
		}

		// Sanitize description
		if (typeof calcToSave.description !== 'undefined') {
			calcToSave.description = calcToSave.description.replace(/&#10;/g,'');
			calcToSave.description = calcToSave.description.replace(/&#9;/g,'');
			calcToSave.description = calcToSave.description.replace(/&#160;/g,' ');// non-breaking space
		}

		// Save calc to the array
		batches.push(calcToSave);

		// Save fields of the calc
		// if there is a lot of fields, we can't save them all at once because of OPTION HTTP request limit
		if (fieldCount > batchLimit) {
			angular.forEach(fields, function(field, key) {

				batch[key] = field;

				if (counter === batchLimit) {

					batches.push({'id': calcToSave.id, 'name':calcToSave.name, 'fields': batch});
					batch = {};
					counter = 0;
				} else {
					counter++;
				}
			});
		}

		// save the rest of the fields
		batches.push({'id': calcToSave.id, 'name':calcToSave.name, 'fields': batch});

		angular.forEach(batches, function(batchCalc, key) {
				var deffered  = $q.defer();
				var saved = item.save({'task': 'save', 'token': token, 'slug': calcToSave.slug, 'calculator': batchCalc});
				saved
					.$promise
					.then(function(data) {
						deffered.resolve(data);
					});
				promises.push(deffered.promise);
		});

		return $q.all(promises);
	};

	calc.prepareCalcToSave = function(calcToSave) {
		// we do not need to send these back
		delete calcToSave.created;
		delete calcToSave.modified;
		delete calcToSave.canEdit;
		delete calcToSave.rating;
		delete calcToSave.ratingCount;

		// compare saving calc with loaded calc.
		// if nothing changed, delete it.
		if (calc.compare(calcToSave.description, loadedCalc.description)) {
			delete calcToSave.description;
		}

		if (calc.compare(calcToSave.tags, loadedCalc.tags)) {
			delete calcToSave.tags;
		}

		if (typeof calcToSave.fields !== 'undefined') {

			angular.forEach(calcToSave.fields, function(field) {

				if (typeof loadedCalc.fields[field.id] !== 'undefined') {
					field.value = field.value.toString();
					delete field.result;
					delete field.calculatedWidth;

					// do not save fields which hasn't changed
					// if (calc.compare(field, loadedCalc.fields[field.id])) {
					// 	delete calcToSave.fields[field.id];
					// 	return;
					// }

					// // do not save field values which hasn't changed
					// if (calc.compare(field.value, loadedCalc.fields[field.id].value)) {
					// 	delete calcToSave.fields[field.id].value;
					// }

					// // do not save field params which hasn't changed
					// if (calc.compare(field.params, loadedCalc.fields[field.id].params)) {
					// 	delete calcToSave.fields[field.id].params;
					// }

					// // do not save field options which hasn't changed
					// if (typeof loadedCalc.fields[field.id].options !== 'undefined' &&
					// 	calc.compare(field.options, loadedCalc.fields[field.id].options)) {
					// 	delete calcToSave.fields[field.id].options;
					// }
				}
			});
		}
	}

	calc.compare = function(valA, valB) {
		valA = angular.toJson(valA);
		valB = angular.toJson(valB);

		return (valA === valB);
	}

	calc.saveResult = function(calculator, token, customerEmail, type) {
		// we do not need to send all information about the calculator
		var result = {};
		result.calculatorId = calculator.id;
		result.fields = {};
		result.url = document.URL;
		result.type = type;

		if (customerEmail) {
			result.email = customerEmail;
		}

		if (typeof calculator.payment !== 'undefined') {
			result.payment = calculator.payment;
		}

		angular.forEach(calculator.fields, function(field){
			if (typeof field.result !== 'undefined') {
				result.fields[field.id] = field.result;
			} else {
				result.fields[field.id] = field.value;
			}
			if (typeof result.email === 'undefined' && field.type === 'email') {
				result.email = field.value;
			}
			if (field.type === 'payment' && typeof calculator.payment !== 'undefined') {
				result.fields[field.id] = calculator.payment.params.priceField;
			}
			if (field.type === 'email') {
				if (typeof field.params.sendEmail !== 'undefined') {
					result.sendEmail = field.params.sendEmail;
				} else {
					result.sendEmail = true;
				}
			}
			if (field.type === 'payment') {
				if (typeof field.params.sendEmail !== 'undefined') {
					result.sendPaymentEmail = field.params.sendEmail;
				} else {
					result.sendPaymentEmail = true;
				}
			}
			if (field.type === 'radio' && typeof field.value !== 'undefined' && typeof field.options !== 'undefined') {
				angular.forEach(field.options, function(option){
					if (option.value == field.value) {
						result.fields[field.id] = field.value+' | '+option.name;
					}
				});
			}
			if (field.type === 'textarea') {
				result.fields[field.id] = field.value + ' | ' + field.result;
			}
			// do not send html fields - they are informative and do not carry customer's value
			if (field.type === 'html') {
				delete result.fields[field.id];
			}
		});

		return item.save({'task': 'saveResult', 'token': token, 'slug': result.id, 'calculator': result});
	};

	calc.rate = function(calcId, token, rating){
		return item.save({'task': 'rate', 'token': token, 'slug': calcId, 'calculator': {'rating': rating}});
	};

	calc.deleteCalc = function(calcId, token){
		return item.save({'task': 'delete', 'token': token, 'slug': calcId});
	};

	calc.copy = function(calcId, token){
		return item.get({'task': 'copy', 'token': token, 'slug': calcId});
	};

	return calc;

}]);
