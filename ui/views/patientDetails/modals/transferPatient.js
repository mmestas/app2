app.controller('transferPatientCtrl', function($scope, close) {

  $scope.dismissModal = function(result) {
  	close(result, 200);
  };

  $scope.patientTransfer = {};

  $scope.submit = function(patientTransfer) {
    console.log(patientTransfer);
  }

});
