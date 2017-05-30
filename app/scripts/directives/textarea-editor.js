'use strict';
/*global calculoid */
calculoid.directive('texteditor', function() {
	var textEditor = {e: null, toolbars: {}, selection: null, onChangeTimeout: false};

	textEditor.toolbars.operators = {
		'class': 'btn-group pull-left',
		'plus':{
			'title':'+',
			'before':' + '
		},
		'minus':{
			'title':'-',
			'before':' - '
		},
		'multiply':{
			'title':'*',
			'before':' * '
		},
		'devide':{
			'title':'/',
			'before':' / '
		},
		'pow':{
			'title':'^',
			'before':' ^ '
		},
		'brackets':{
			'title':'()',
			'before':' ( ',
			'after':' ) '
		}
	};

	textEditor.toolbars.functions = {
		'class': 'btn-group btn-group-xs',
		'sin':{
			'title':'sin',
			'before':' sin( ',
			'after':' ) '
		},
		'cos':{
			'title':'cos',
			'before':' cos( ',
			'after':' ) '
		},
		'tan':{
			'title':'tan',
			'before':' tan( ',
			'after':' ) '
		},
		'asin':{
			'title':'asin',
			'before':' asin( ',
			'after':' ) '
		},
		'acos':{
			'title':'acos',
			'before':' acos( ',
			'after':' ) '
		},
		'atan':{
			'title':'atan',
			'before':' atan( ',
			'after':' ) '
		},
		'sqrt':{
			'title':'sqrt',
			'before':' sqrt( ',
			'after':' ) '
		},
		'log':{
			'title':'log',
			'before':' log( ',
			'after':' ) '
		},
		'abs':{
			'title':'abs',
			'before':' abs( ',
			'after':' ) '
		},
		'ceil':{
			'title':'ceil',
			'before':' ceil( ',
			'after':' ) '
		},
		'floor':{
			'title':'floor',
			'before':' floor( ',
			'after':' ) '
		},
		'round':{
			'title':'round',
			'before':' round( ',
			'after':' ) '
		},
		'exp':{
			'title':'exp',
			'before':' exp( ',
			'after':' ) '
		}
	};

	textEditor.setElement = function(element){
		this.e = element;
	};

	textEditor.getSelection = function(){
		if(!!document.selection) {
			return document.selection.createRange().text;
		}
		else if(!!this.e.setSelectionRange) {
			return this.e.value.substring(this.e.selectionStart,this.e.selectionEnd);
		}
		else {
			return false;
		}
	};

	textEditor.getCaretPosition = function(){
		var caretPostion = 0;
		if (document.selection) {
			this.e.focus ();
			var oSel = document.selection.createRange ();
			oSel.moveStart ('character', -this.e.value.length);
			caretPostion = oSel.text.length;
		}
		else if (this.e.selectionStart || this.e.selectionStart === '0'){
			caretPostion = this.e.selectionStart;
		}
		return (caretPostion);
	};

	textEditor.setCaretPosition = function (position) {
		this.e.selectionStart = position;
		this.e.selectionEnd = position;
		this.e.focus();
	};

	textEditor.replaceSelection = function(before, after, selection){
		if(typeof selection === 'undefined'){
			selection = '';
		}
		var text = before + selection + after;
		if(!!document.selection){
			this.e.focus();
			var range = document.selection.createRange();
			range.text = text;
			range.select();
		}else if(!!this.e.setSelectionRange){
			var selectionStart = this.e.selectionStart;
			this.e.value = this.e.value.substring(0,selectionStart) + text + this.e.value.substring(this.e.selectionEnd);
			this.e.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
		}
		this.e.focus();
	};

	textEditor.wrapSelection = function(before, after){
		var selection = this.getSelection();
		this.replaceSelection(before, after, selection);
	};

	textEditor.insertIntoPosition = function(before, after) {
		this.replaceSelection(before, after);
	};

	textEditor.hasSelection = function () {
		if (this.e.selectionStart === this.e.selectionEnd) {
			return false;
		} else {
			return true;
		}
	};

	var generateTemplate = function(){
		// toolbar wrapper
		var template = '<div ng-repeat="toolbar in textEditorToolbars" class="textEditorToolbarWrapper {{toolbar.class}}">';
		
		// normal button
		template += '<button ng-if="button.title" type="button" ng-repeat="button in toolbar" ng-click="textEditorButtonClicked(button)" class="btn btn-default {{button.class}}">';
		template += '<b>{{button.title}}</b>';
		template += '</button>';

		// end of toolbar wraper
		template += '</div><br />';

		// textarea itself ng-model="activeField.value"
		// runFormula()
		
		template += '<textarea rows="{{textEditorRows}}" cols="{{textEditorCols}}"  id="textareaFormula" class="form-control">{{activeField.value}}</textarea>';
		template += '<button ng-click="runFormula()" class="btn btn-default btn-runformula {{activeField.clickrun}}">Run Formula</button>';
		return template;
	};

	return {
		template: generateTemplate(),
		controller: ['$scope', 'notify', function($scope, notify) {
			$scope.runFormula = function() {
				var textarea = angular.element( document.querySelector( '#textareaFormula' ))[0];
				var caretPosition = 0;
				textEditor.setElement(textarea);
				notify.closeAll();
				if($scope.activeField.value == textarea.value)
				{
					$scope.activeField.clickrun = 'yes';
				}
				else
				{
					$scope.activeField.clickrun = 'changes';
					$scope.activeField.value = textarea.value;

				}
			}
		}],		
		link: function($scope, elem, attrs) {

			$scope.textEditorToolbars = textEditor.toolbars;
			$scope.textEditorRows = attrs.rows;
			$scope.textEditorCols = attrs.cols;
			
			var customToolbars = $scope.customTexteditorToolbars;

			angular.forEach(customToolbars, function(toolbar, toolbarName){
				$scope.textEditorToolbars[toolbarName] = toolbar;
			});

			// var editor = elem[0];
			// var textarea = angular.element(editor.lastChild)[0];
			var textarea = angular.element( document.querySelector( '#textareaFormula' ))[0];
			var caretPosition = 0;
			textEditor.setElement(textarea);
			$scope.textEditorButtonClicked = function(button) {
				if(typeof button.before === 'undefined'){
					button.before = '';
				}
				if(typeof button.after === 'undefined'){
					button.after = '';
				}
				caretPosition = textEditor.getCaretPosition();

				if(textEditor.hasSelection()){
					textEditor.wrapSelection(button.before, button.after);
				}else{
					textEditor.insertIntoPosition(button.before, button.after);
				}
				// let angular know about value change
				
			};
		}
	};
});