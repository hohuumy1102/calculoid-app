'use strict';
/*global calculoidServices */
calculoidServices.factory('Field', ['$resource', function($resource){

	var url = calculoidServices.baseUrl;
	var list = $resource(url+'fields/', {}, {query: {method:'GET'}});
	var item = $resource(url+'field/:id', {id: '@id', field_id: '@field_id'}, {query: {method:'GET'}});
	var field = {};

	field.getList = function(){
		return list.query();
	};

	field.getField = function(id){
		return item.query({'id':id});
	};

	field.saveField = function(field){
		return item.query({'id':field.id});
	};

	return field;

}]);