'use strict';

/* Factories */
module.factory('app.factory', function($http) {
   return {
        getFoos: function() {
             //return the promise directly.
             return $http.get('/foos')
                       .then(function(result) {
                            //resolve the promise as the data
                            return result.data;
                        });
        }
   }
});