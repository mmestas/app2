app.controller('confirmStatusChangeModalCtrl', function($scope, $rootScope, apiSrvc, upload, patientDetails, statusObject, isProvider, close) {

  $scope.patientDetails = patientDetails;
  $scope.statusObject = statusObject;

  if(isProvider) {
    $scope.headerMsg = 'Patient';
    $scope.bodyMsg = 'Resubmit this patient?';
    $scope.btnMsg = "Yes, Resubmit Patient"
  }
  else {
    $scope.headerMsg = "Confirm Status Change";
    $scope.bodyMsg = "You are about to change (and save) this patient's status to <span class='text-warning font-weight-bold'>"+$scope.statusObject.name+"</span>.  Proceed?";
    $scope.btnMsg = "Yes, change status";
  }

  $scope.changeStatus = function () {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientProfileStatus&PatientProfileGuid='+patientDetails.guid+'&StatusGuid='+statusObject.guid)
    .then(function(response){
      console.log(response.data);
      if(response.errors.length > 0) {}
      else {
        close(statusObject, 200);
      }
    })
  };

  $scope.dismissModal = function() {
    statusObject = patientDetails.status;
  	close(statusObject, 200);
  };

});
