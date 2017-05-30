'use strict';
/*global calculoid */

// Global HTTP error handler
calculoid.factory('HttpErrorHandler', ['$q', '$rootScope', function($q, $rootScope) {
  return {
   // 'requestError': function(rejection) {
   //    console.log('requestError', rejection);
   //    return $q.reject(rejection);
   //  },
   'responseError': function(rejection) {
      $rootScope.$broadcast('requestError', rejection);
      return $q.reject(rejection);
    }
  };
}]);
