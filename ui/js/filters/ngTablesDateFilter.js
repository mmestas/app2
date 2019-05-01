app.filter('ngTablesDateFilter', function($filter) {
    return function(values, dateString) {
     var filtered = [];

      if(typeof values != 'undefined' && typeof dateString != 'undefined') {
        angular.forEach(values, function(value) {
            if($filter('date')(value.Date).indexOf(dateString) >= 0) {
              filtered.push(value);
            }
          });
      }

      return filtered;
    }
})
