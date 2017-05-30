'use strict';
/*global calculoid */
calculoid.controller('ToolbarCtrl', ['$rootScope', '$scope', 'User', '$http','$document','$timeout', function ($rootScope, $scope, User, $http,$document,$timeout) {
    $scope.navIsCollapsed = true;
    User.getUser();
    $scope.user = User;
    $scope.redmineCustomFields = [];
    $scope.toolbar = {};
    $scope.menu = {};
    $scope.toolbar.tab = null;
    $scope.toolbar.opened = false;
    $scope.menu.check = false;
    $scope.activennt = {};
    // $scope.toolbar.style = {
    //     'height': '53px'
    // };
    $scope.toolbar.style = {
        'width': '35px',
        'min-width':'0px',
        'height':'100%',
        'top':'71px',
        'bottom':'0px',
        'left':'0px',
    };
    
    $scope.$on('user:updated', function(event, newUser) {
        $scope.user = newUser;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        User.authenticate('google', authResult);
    });

    $scope.$on('event:google-plus-signin-failure', function () {
        $scope.user.logged = 'out';
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.isAdmin = function() {
        return $scope.user.group === '6';
    };
   
    $scope.getToolbarStyle = function() {
        return $scope.toolbar.style;
    }
    $scope.mouseOverThing = function() {        
        $scope.menu.check = true;
        if($scope.toolbar.opened == false ){
            $scope.toolbar.style = {
                'width': '180px',
                'min-width':'0px',
                'height':'100%',
                'top':'71px',
            };
        }
    }
    $scope.mouseLeaveThing = function() {
        $scope.menu.check = false;
        if($scope.toolbar.opened == false){
            $scope.toolbar.style = {
                'width': '35px',
                'min-width':'0px',
                'height':'100%',
                'top':'71px',
            };
        }
    }
    $scope.toggleToolbar = function (newTab) {
        if (newTab === $scope.toolbar.tab && $scope.toolbar.opened) {
            $scope.toolbarClose();
        } else {
            $scope.toolbarOpen();
        }
        return $scope.toolbar.opened;
    }
    $scope.$on("closePopup", function (event)
    {
        $scope.toolbarClose();
    });
    $scope.toolbarClose = function (close) {
        if($scope.menu.check == false)
        {
            $scope.toolbar.style.width = '35px';
            $scope.displayLabel = "none";
            $scope.displayToolbarContent ="none";
            $scope.toolbar.opened = false;
        }
        else
        {
            $scope.toolbar.style.width = '180px';
            $scope.displayLabel = "none";
            $scope.displayToolbarContent ="none";
            $scope.toolbar.opened = false;
        }
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        $scope.$emit('closesclose');
    }
    $scope.toolbarOpen = function () {
        $scope.toolbar.style.width = '900px';
        $scope.displayLabel = "inline-block";
        $scope.displayToolbarContent ="block";
        $scope.toolbar.opened = true;
    }
    $scope.loadToolbarTab = function(tab) {
        if ($scope.toggleToolbar(tab)) {
            $scope.toolbar.tab = tab;
        }
    }
    $scope.displayToolbarTabDetails = function() {
        if ($scope.toolbar.tab) {
            return 'views/toolbar-tabs/' + $scope.toolbar.tab + '.html';
        }
    }
    $document.on('click', function(event){  
        if($scope.activennt.id && $scope.toolbar.opened == true)
        {
            $scope.activennt = {};
        }
        else if($scope.toolbar.opened == true)
        {
            var element = document.getElementById("editor-tools");            
            var parent = event.target;
            if(angular.element(parent).hasClass('btn-runformula'))
            {
                $timeout(function() {
                   var parent = document.getElementsByClassName("btn-runformula");
                   if(angular.element(parent).hasClass('true') )
                    {
                        var scrooll_scroll = angular.element( document.querySelector( "#calculoid-field-"+$scope.activeField.id )); 
                        window.scrollTo(0, scrooll_scroll.prop('offsetTop') + scrooll_scroll.prop('offsetHeight'));
                        $scope.toolbarClose();
                    } 
                }, 200);
            }
            else
            {
                while (parent && parent !== element)
                {
                    if(angular.element(parent).hasClass('cg-notify-message'))
                    {
                       break;
                    }
                    parent = parent.parentNode;                    
                }
                if (!parent)
                {
                    $scope.toolbarClose();
                }
            }            
             
        }
         
    });

   
    $scope.$on('onFieldEdit', function() {        
        if ($scope.activeField.id) {
            $scope.activennt = $scope.activeField;
            $scope.toolbar.opened = false;
            $scope.loadToolbarTab('edit-field');
        } else {
            $scope.activennt = {};
            $scope.toolbar.opened = true;
            $scope.loadToolbarTab('edit-field');
        }
    });

    $scope.activeTab = function(tabName) {
        if ($scope.toolbar.tab === tabName) {
            return 'active';
        }
    }

    $scope.showEmbedTitle = function(check) {
        if (check) {
            $scope.embedShowTitleText = '';
        } else {
            $scope.embedShowTitleText = ',showTitle:0';
        }
    };

    $scope.showEmbedDescription = function(check) {
        if (check) {
            $scope.embedShowDescriptionText = '';
        } else {
            $scope.embedShowDescriptionText = ',showDescription:0';
        }
    };

    $scope.loadRedmineCustomFields = function(calc, type) {
        if (calc.params.redmineKey && calc.params.redmineUrl) {
            $http.get(calculoidServices.baseUrl+'redmine/fields/' + type + '?key=' + calc.params.redmineKey + '&url=' + calc.params.redmineUrl).then(function(response) {
                if (response.data && response.data.custom_fields) {
                    
                    if (!calc.params.redmineCustomFields) {
                        calc.params.redmineCustomFields = {};
                    }

                    angular.forEach(response.data.custom_fields, function(field) {
                        if (typeof calc.params.redmineCustomFields[field.id] === 'undefined') {
                            if (field.default_value) {
                                calc.params.redmineCustomFields[field.id] = field.default_value;
                            } else {
                                calc.params.redmineCustomFields[field.id] = '';
                            }
                        }
                    });

                    $scope.redmineCustomFields = response.data.custom_fields;
                }
            });
        }
    }

    $scope.loadEasyRedmineCustomFields = function(calc, type) {
        if (calc.params.easyredmineCrmKey && calc.params.easyredmineCrmUrl) {
            $http.get(calculoidServices.baseUrl+'redmine/fields/' + type + '?key=' + calc.params.easyredmineCrmKey + '&url=' + calc.params.easyredmineCrmUrl).then(function(response) {
                if (response.data && response.data.custom_fields) {
                    
                    if (!calc.params.easyredmineCrmCustomFields) {
                        calc.params.easyredmineCrmCustomFields = {};
                    }

                    angular.forEach(response.data.custom_fields, function(field) {
                        if (typeof calc.params.easyredmineCrmCustomFields[field.id] === 'undefined') {
                            if (field.default_value) {
                                calc.params.easyredmineCrmCustomFields[field.id] = field.default_value;
                            } else {
                                calc.params.easyredmineCrmCustomFields[field.id] = '';
                            }
                        }
                    });

                    $scope.easyredmineCrmCustomFields = response.data.custom_fields;
                }
            });
        }
    }
}]);