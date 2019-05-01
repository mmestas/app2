app.filter('jsonDateFilter', function() {
  var re = /\/Date\(([0-9]*)\)\//;
  return function(x) {
    if(x) {
      var m = x.match(re);
      if( m ) return new Date(parseInt(m[1]));
      else return null;
    }

  };
});


app.filter('jsonDate', function() {
  return function(input, format) {

    // Exit if the value isn't defined
    if(angular.isUndefined(input)) {
      return;
    }

    var date = new Date(parseInt(input.substr(6)));

    // John Pedrie added Moment.js support
    if(typeof moment !== 'undefined' && format) {
      var momentObj = moment(date);
      return momentObj.format(format);
    }
    else {
      return date.toLocaleDateString();
    }
  }
});
