'use strict';
/*global calculoid */
calculoid.controller('CalcDetailCtrl',
	['$timeout','$anchorScroll','$scope', 'Calc', 'Field', 'User', '$routeParams', '$location', '$sce', '$window', 'Chart', '$uibModal', '$filter',
	function ($timeout,$anchorScroll,$scope, Calc, Field, User, $routeParams, $location, $sce, $window, Chart, $uibModal, $filter) {

	$scope.calc = Calc.getCalc($routeParams.slug);
	$scope.fieldWidth = {};
	$scope.fieldWidth.floor = 30;
	$scope.fieldWidth.step = 10;
	$scope.fields = Field.getList();
	$scope.activeField = {};
	$scope.user = User.get();
	$scope.fieldIds = [];
	$scope.fieldIdsRegistered = [];
	$scope.rating = {'valueSelected': false};
	$scope.saveStatus = 'Save Calc';
	$scope.customTexteditorToolbars = {};
	$scope.embedCollapsed = true;
	$scope.customer = {};
	$scope.languages = {};
	$scope.currentUrl = document.URL;
	$scope.rootClass = $location.url().replace('/', '').replace(/\//g, '-');
	$scope.fieldsWrapperClass = '';
	$scope.activeIntegration = 'webhook';
	$scope.formulaValues = {};
	$scope.currencies = [
		{label:'Australian Dollar', value:'AUD'},
		{label:'Canadian Dollar', value:'CAD'},
		{label:'Czech Koruna', value:'CZK'},
		{label:'Danish Krone', value:'DKK'},
		{label:'Euro', value:'EUR'},
		{label:'Hong Kong Dollar', value:'HKD'},
		{label:'Hungarian Forint', value:'HUF'},
		{label:'Japanese Yen', value:'JPY'},
		{label:'Norwegian Krone', value:'NOK'},
		{label:'New Zealand Dollar', value:'NZD'},
		{label:'Polish Zloty', value:'PLN'},
		{label:'Pound Sterling', value:'GBP'},
		{label:'Singapore Dollar', value:'SGD'},
		{label:'Swedish Krona', value:'SEK'},
		{label:'Swiss Franc', value:'CHF'},
		{label:'U.S. Dollar', value:'USD'}
	];

	$scope.paypalGates = [
		{label:'Production', value:'https://www.paypal.com/cgi-bin/webscr'},
		{label:'Sandbox', value:'https://www.sandbox.paypal.com/cgi-bin/webscr'}
	];

	$scope.stripe = StripeCheckout.configure({
		image: 'https://stripe.com/img/navigation/logo.png',
		locale: 'auto',
	});

	$scope.gridsterOpts = {
        columns: 12, // the width of the grid, in columns
        pushing: true, // whether to push other items out of the way on move or resize
        floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
        swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
        width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: '80', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [10, 10], // the pixel distance between each widget
        outerMargin: true, // whether margins apply to outer edges of the grid
        isMobile: true, // stacks the grid items if true
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
        minColumns: 1, // the minimum columns the grid must have
        minRows: 1, // the minimum height of the grid, in rows
        maxRows: 100,
        defaultSizeX: 3, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        minSizeX: 1, // minimum column width of an item
        maxSizeX: null, // maximum column width of an item
        minSizeY: 1, // minumum row height of an item
        maxSizeY: null, // maximum row height of an item
        resizable: {
           enabled: false,
           handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
           start: function(event, $element, widget) {}, // optional callback fired when resize is started,
           resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
           stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
        },
        draggable: {
           enabled: false, // whether dragging items is supported
           handle: '.btn.handle', // optional selector for resize handle
           start: function(event, $element, widget) {}, // optional callback fired when drag is started,
           drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
           stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
        }
    };

	$scope.safeApply = function() {
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	}

	$scope.calc.$promise.then(function() {
		$window.document.title = $scope.calc.name + ' - Calculoid';

		$scope.rating.value = $scope.calc.rating;

	    if ($scope.calc.canEdit === true) {
	    	$scope.gridsterOpts.resizable.enabled = true;
	        $scope.gridsterOpts.draggable.enabled = true;
	    }

		// Some calculators come with params in JSON string...
		if ($scope.calc.params && angular.isString($scope.calc.params)) {
			$scope.calc.params = angular.fromJson($scope.calc.params);
		}

		// set language
		if (typeof $scope.languages.$promise !== 'undefined') {
			$scope.languages.$promise.then(function() {
				$scope.preselectLanguage();
			});
		}
	});

	$scope.checkboxChanged = function(field) {
		if (field.params.checked) {
			if (typeof field.params.valueChecked !== 'undefined') {
				field.value = field.params.valueChecked;
			}
		} else {
			if (typeof field.params.valueUnchecked !== 'undefined') {
				field.value = field.params.valueUnchecked;
			} else {
				field.value = 0;
			}
		}
	}

	$scope.preselectLanguage = function() {
		if (typeof $scope.calc.language !== 'undefined' &&
			typeof $scope.languages.items !== 'undefined') {
			angular.forEach($scope.languages.items, function(lang) {
				if ($scope.calc.language === lang.id) {
					$scope.selectedLanguage = lang;
				}
			});
		}
	}

	// set fields to formula editor
	$scope.$watch('calc', function() {
		if (typeof $scope.customTexteditorToolbars !== 'undefined') {
			$scope.getCustomTexteditorToolbars();
		}
		$scope.generateFormulaValues();
		
	}, true);

	$scope.changeLanguage = function(selectedLanguage) {
		if (typeof $scope.calc !== 'undefined' && selectedLanguage !== null) {
			$scope.calc.language = selectedLanguage.id;
			$scope.selectedLanguage = selectedLanguage;
		}
	};

	$scope.$watch('activeField', function() {
		if (typeof $scope.activeField !== 'undefined' &&
			typeof $scope.activeField.value !== 'undefined' &&
			$scope.activeField.type === 'html') {
			$scope.activeField.value = $scope.activeField.value.replace(/&#10;/g,'');
			$scope.activeField.value = $scope.activeField.value.replace(/&#9;/g,'');
			$scope.activeField.value = $scope.activeField.value.replace(/&#160;/g,' ');// non-breaking space
		}
	});

	$scope.getCustomTexteditorToolbars = function() {
		$scope.customTexteditorToolbars.fields = {'class': 'btn-field-ids'};
		angular.forEach($scope.calc.fields, function(field) {
			if ($scope.activeField.id !== field.id) {
				$scope.customTexteditorToolbars.fields[field.id] = {
					'title': 'F' + field.id + ' = ' + field.name,
					'before': ' F' + field.id + ' ',
					'class': 'btn-primary'
				};
			}
		});
	};

	$scope.$on('user:updated', function(event, newUser) {
		$scope.user = newUser;
		User = newUser;
	});

	$scope.calc.$promise.then(function() {
		$scope.alerts = $scope.calc.alerts;
	});

	$scope.copy = function(calcId) {
		if ($scope.user.logged === 'in') {
			Calc.copy(calcId, $scope.user.token).$promise.then(function(data) {
				if (data.id) {
					$location.path('/calculator/' + data.id);
				}
			});
		}
	};

	$scope.$on('closesclose', function(event) {		
		$scope.activeField = {};
	});
	$scope.editCalcField = function(field,popuptrue) {  
		if(popuptrue)  {   
			$scope.activeField = field;  
		}  else if ($scope.activeField === field) {   
			$scope.activeField = {};  
		} else {   
			$scope.activeField = field; 
		}  
		$scope.$broadcast('onFieldEdit'); 
	};

	$scope.hasFields = function() {
		if (typeof $scope.calc !== 'undefined' && typeof $scope.calc.fields !== 'undefined') {
			return Object.keys($scope.calc.fields).length;
		} else {
			return false;
		}
	}

	$scope.loadLanguages = function() {
		$scope.languages = Calc.getLanguages(1);
		$scope.languages.$promise.then(function() {
			$scope.preselectLanguage();
		});
	}

	$scope.loadTags = function(search) {
		return Calc.getTags(5, search).$promise;
	}

	$scope.saveCalc = function(loadCalc) {
		$scope.saveStatus = 'Saving...';
		var results = Calc.save($scope.calc, $scope.user.token);

		results.then(function(results) {

			var result = results[0];
			if (result.alerts) {
				$scope.alerts = result.alerts;
			}
			if (typeof result.id !== 'undefined' && result.id) {
				$scope.calc.id = result.id;
				$scope.saveStatus = 'Save Calc';
				if (loadCalc) {
					$scope.loadCalc();
				}
			} else {
				$scope.saveStatus = 'Error while saving';
			}
		});

		return results;
	};

	$scope.deleteCalc = function() {
		var result = Calc.deleteCalc($scope.calc.id, $scope.user.token);
		result.$promise.then(function(data) {
			$scope.calc.id = data.id;
			if (data.alerts) {
				$scope.alerts = data.alerts;
			}
			if (data.deleted) {
				$location.path('/calculators/');
			}
		});
		return result;
	};

	$scope.saveCalcConfig = function() {
		var result = $scope.saveCalc();
		result.then(function(data) {
			data = data[0];
			if (data.alerts) {
				$scope.alerts = data.alerts;
			}
			if (data.id) {
				$location.path('/calculator/'+$scope.calc.id);
			}
		});
	};

	$scope.saveResult = function(field) {
		var result = Calc.saveResult($scope.calc, $scope.user.token, null, 'submission').$promise.then(function(result){
			if (result.alerts) {
				$scope.resultAlerts = result.alerts;
			}
			if (field.params.redirect) {
				window.location = field.params.redirect;
			}
		});
		return result;
	};

	$scope.pay = function(paymentField) {
		if ($scope.checkPayment(paymentField)) {
			if ((paymentField.params.paypalEnabled == 0 || paymentField.params.paymentGate === 'stripe') && paymentField.params.stripeEnabled == 1) {
				$scope.openStripe(paymentField);
			} else {
				$scope.redirectToPayPal(paymentField);
			}
		}
	};

	$scope.redirectToPayPal = function(paymentField) {
		if (typeof paymentField.params === 'undefined' ||
			typeof paymentField.params.paypalEmail === 'undefined' ||
			paymentField.params.paypalEmail === '') {
			$scope.paymentAlerts = [{msg:'Fill in PayPal email first.', type: 'danger'}];
		} else {
			// clear alerts
			$scope.paymentAlerts = [];
			$scope.customer.paymentStatus = 'Saving order ...';
			$scope.calc.payment = paymentField;
			Calc.saveResult($scope.calc, $scope.user.token, $scope.customer.email, 'paypal').$promise.then(function(result) {
				if (typeof result.id !== 'undefined') {
					$scope.customer.orderId = result.id;
					$scope.customer.paymentStatus = 'Redirecting to PayPal ...';

					// redirect to PayPal with payment info. We have to be sure that order ID is
					// correctly stored in the form before submission.
					var intervalId = setInterval(function() {
						var orderIdElement = document.getElementById('calculoidOrderId_' + $scope.calc.id);
						if (parseInt(orderIdElement.value) === parseInt(result.id)) {
							document.getElementById('paypalform_' + paymentField.id).submit();
							clearInterval(intervalId);
						}
					},500);
				} else if (typeof result.alerts !== 'undefined') {
					$scope.paymentAlerts = [{'msg': result.alerts[0].msg, 'type': result.alerts[0].type}];
				} else {
					$scope.paymentAlerts = [{'msg': 'Order was not stored correctly.', 'type': 'danger'}];
				}
			});
		}
	};

	$scope.checkPayment = function(paymentField) {
		if (typeof paymentField.params.priceField === 'undefined' ||
			typeof $scope.calc.fields[paymentField.params.priceField] === 'undefined') {
			$scope.paymentAlerts = [{msg:'Price field is not set.', type: 'danger'}];
			return false;
		}
		else if (typeof $scope.customer.email === 'undefined' || $scope.customer.email === '') {
			$scope.paymentAlerts = [{msg:'Fill in your email address, please.', type: 'danger'}];
			return false;
		} else {
			return true;
		}
	}

	$scope.deleteField = function(field) {
		var result = Calc.deleteField(field, $scope.user.token);
		result.$promise.then(function() {
			if (result.affectedRows) {
				//update activeField
				if (typeof $scope.activeField.id !== 'undefined' && $scope.activeField.id === field.id) {
					$scope.activeField = {};
				}
				// todo use http://bytearcher.com/articles/how-to-delete-value-from-array/
				delete $scope.calc.fields[field.id];
			}
		});
	};

	$scope.loadCalc = function() {
		Calc.getCalc($routeParams.slug).$promise.then(function(result) {
			if (typeof result.id !== 'undefined' && result.id){
				$scope.calc.fields = result.fields;
				var check = Object.keys($scope.calc.fields)[Object.keys($scope.calc.fields).length - 2];
				if(check > 0)
				{
					var elementa = document.getElementById("calculoid-field-"+check);
					var scrooll_scroll = angular.element( document.querySelector( "#calculoid-field-"+check ));
					window.scrollTo(0, scrooll_scroll.prop('offsetTop') + scrooll_scroll.prop('offsetHeight'));
				}
				
				
			}
		});
	};
	
	$scope.addField = function(field) {
		$scope.calc.fields[0] = {
			'calculator_id': $scope.calc.id,
			'field_id': field.id,
			'id': 0
		};
   		$scope.$broadcast("closePopup");
		$scope.saveCalc(true);

	};

	$scope.createOption = function(field) {

		Calc.createFieldOption(field, $scope.user.token).$promise.then(function(option) {
			if (typeof option.alerts !== 'undefined') {
				$scope.alerts = option.alerts;
			}
			if (option !== null) {
				if (angular.isUndefined($scope.calc.fields[field.id].options)) {
					$scope.calc.fields[field.id].options = {};
				}
				$scope.calc.fields[field.id].options[option.id] = option;
			}
		});
	};

	$scope.deleteOption = function(field, option) {
		Calc.deleteFieldOption(option, $scope.user.token).$promise.then(function(result) {
			if (typeof result.alerts !== 'undefined') {
				$scope.alerts = result.alerts;
			}
			if (typeof result.affectedRows !== 'undefined' && result.affectedRows)
			{
				delete $scope.calc.fields[field.id].options[option.id];
			}
		});
	};

	$scope.optionSelected = function(fieldId, option) {
		$scope.calc.fields[fieldId].value = option.value;
	};

	$scope.loadToolbarFields = function() {
		return $scope.loadEditElement('views/toolbar-field.html');
	};

	$scope.loadFieldList = function() {
		return $scope.loadEditElement('views/field-list.html');
	};

	$scope.loadCalcToolbar = function() {
		return $scope.loadEditElement('views/toolbar-calculator.html');
	};

	$scope.loadEditElement = function(element) {
		if ($scope.user.logged === 'in' && $scope.calc.canEdit === true) {
			return element;
		} else {
			return null;
		}
	};

	$scope.loadGeneralToolbar = function(element) {
		return 'views/toolbar-general.html';
	};

	$scope.loadNoFieldInfo = function()
	{
		if ($scope.calc.fields.length < 1 && $scope.calc.canEdit === true) {
			return 'views/info-no-field.html';
		} else {
			return null;
		}
	};

	$scope.getOptionStyles = function(field) {
		if (angular.isUndefined(field.params) || !field.params) {
			field.params = {};
		}
		if (angular.isUndefined(field.params.columns)) {
			field.params.columns = 1;
		}
		return 'width:'+(100/field.params.columns)+'%';
	};

	// $scope.hoveringRating = function(value) {
		// $scope.overStar = value;
		// $scope.percent = 100 * (value / $scope.max);
	// };

	$scope.rating.values = ['', 'hate it', 'not good', 'not bad', 'like it', 'love it'];

	// watch rating changes
	$scope.$watch('rating.value', function() {
		$scope.rating.saved = false;
		if($scope.calc.rating !== $scope.rating.value) {
			$scope.rating.valueSelected = true;
		}
	});

	$scope.rating.evaluate = function() {
		if ($scope.rating.value !== 'undefined') {
			return $scope.rating.values[$scope.rating.value];
		} else {
			return '';
		}
	};

	$scope.rate = function() {
		Calc.rate($scope.calc.id, $scope.user.token, $scope.rating.value).$promise.then(function(){
			$scope.rating.saved = true;
			Calc.getCalc($routeParams.slug).$promise.then(function(updatedCalc){
				$scope.calc.rating = updatedCalc.rating;
				$scope.calc.ratingCount = updatedCalc.ratingCount;
			});
		});
	};

	$scope.getFieldValue = function(fieldId, round, formatted) {
		var val;

		if (typeof $scope.calc.fields[fieldId] === 'undefined') {
			val = '';
		} else if (typeof $scope.calc.fields[fieldId].result !== 'undefined') {
			val = $scope.calc.fields[fieldId].result;
		} else {
			val = $scope.calc.fields[fieldId].value;
		}

		if (round) {
			if (formatted) {
				val = $filter('number')(val, round);
			} else {
				val = parseFloat(val).toFixed(round);
			}
		}

		return val;
	};

	$scope.getPaypalEmail = function(paymentField) {
		if (paymentField.params.paypalGate === 'https://www.paypal.com/cgi-bin/webscr') {
			return paymentField.params.paypalEmail;
		} else {
			return paymentField.params.paypalSandobxEmail;
		}
	};

	$scope.isEmptyObject = function(obj) {
		var name;
		for (name in obj) {
			return false;
		}
		return true;
	};

	$scope.gauge = function(field) {

		if (typeof field.params.valueField !== 'undefined' && field.params.valueField) {
			field.value = parseFloat($scope.getFieldValue(field.params.valueField));
		}

		return Chart.fieldToGauge(field);
	};

	$scope.validateNumber = function(field) {
		if (angular.isNumber(field.value)) {
			field.error = '';
		} else {
			field.error = 'This is not a number';
		}
	};

	$scope.deleteReally = function() {
		$scope.videoModal = $uibModal.open({
			templateUrl: 'views/confirm-delete-calc.html',
			windowClass: 'small'
		});
	};

	$scope.getPayButtonText = function(field) {
		var buttonText = field.params.buttonText;
		buttonText = buttonText.replace('{amount}', $scope.getFieldValue(field.params.priceField, 2, true));
		buttonText = buttonText.replace('{currency}', field.params.currency);
		return buttonText;
	};

	$scope.openStripe = function(field) {
		var amount = $scope.getFieldValue(field.params.priceField, 2) * 100;
		var config = {
			key: field.params.stripeKeySandbox,
			email: $scope.customer.email,
			amount: amount,
			token: function(token) {
				field.params.stripePaymentToken = token;
				$scope.calc.payment = field;
				Calc.saveResult($scope.calc, $scope.user.token, $scope.customer.email, 'stripe').$promise.then(function(result) {
					if (typeof result.id !== 'undefined') {
						$scope.customer.orderId = result.id;
						$scope.paymentAlerts = [{'msg':'The payment had been successfully processed. More details will be sent to your email address.', 'type': 'success'}];
					} else if (typeof result.alerts !== 'undefined') {
						$scope.paymentAlerts = [{'msg': result.alerts[0].msg, 'type': result.alerts[0].type}];
					} else {
						$scope.paymentAlerts = [{'msg':'Order was not stored correctly.', 'type': 'danger'}];
					}
				});
			}
		};

		if (field.params.stripeDescription) {
			config.description = field.params.stripeDescription;
		}

		if (field.params.stripeImage) {
			config.image = field.params.stripeImage;
		}

		if (field.params.stripeName) {
			config.name = field.params.stripeName;
		}

		$scope.stripe.open(config);
	};


	$scope.generateFormulaValues = function() {
		angular.forEach($scope.calc.fields, function(field, fieldId) {
			if (field.type !== 'email' && field.type !== 'payment' && field.type !== 'html') {
				$scope.formulaValues['F' + fieldId] = $scope.getFieldValue(fieldId, $scope.getDecimalPlaces(field));
			}
		});
		return $scope.formulaValues;
	};

	$scope.getDecimalPlaces = function(field) {
		if (typeof field.decimalPlaces === 'undefined') {
			return 0;
		} else {
			return parseInt(field.decimalPlaces);
		}
	};

	$scope.prepareSliderScale = function(textScale) {
		var scale = [];
		if (textScale) {
			var items = textScale.split(',');
			if (items) {
				angular.forEach(items, function(item) {
					item.trim();
					var withLabel = item.split(':');
					if (typeof withLabel[1] !== 'undefined') {
						// Scale value has a label
						scale.push({'val': parseFloat(withLabel[0].trim()), 'label': withLabel[1].trim()});
					} else {
						// Scale value is just a number or label
						scale.push({'val': parseFloat(item)});
					}
				});
			}
		}
		return scale;
	}
	$scope.countWords = function(field) {
		field.result = 0;

		if (field.value) {
			// split the text on space/tab/enter
			var s = field.value ? field.value.split(/\s+/) : 0;
		    field.result = s ? s.length : 0;
		}
	}
}]);
