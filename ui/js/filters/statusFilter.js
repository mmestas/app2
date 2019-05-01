app.filter('statusFilter', function() {
  return function (object) {
    var array = [];
        angular.forEach(object, function (status) {
            if (status.guid === '{ae0fd1e9-9c5a-47d2-86a2-d01932505146}') {
            }
            else {
              array.push(status);
            }
        });
        return array;
  }
})
