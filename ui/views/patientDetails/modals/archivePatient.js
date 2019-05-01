app.controller('archivePatientCtrl', function($scope, $rootScope, apiSrvc, upload, patientId, close) {

  $scope.dismissModal = function(result) {
  	close(result, 200);
  };

  $scope.getReasonsForArchive = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetReasonsForArchive').then(function (response) {
      $scope.reasonsForArchive = response.data;
      console.log($scope.reasonsForArchive);
    });
  }
  $scope.getReasonsForArchive();

  $scope.patientArchive = {};

  $scope.archiveCase = function(patientArchive) {
    patientArchive.patientId = patientId;
    console.log(patientArchive);

    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientReasonsForArchive&RequestBinary=true',
        method: 'POST',
        data: {
            jsonData: JSON.stringify(patientArchive),
        },
        withCredentials: true
    })
        .then(function (response) {
          console.log(response);
          if(response.data.errors > 0) {
            console.log('error');
          }
          else {
              $scope.dismissModal(response.data);
          }
        })

  };

});
