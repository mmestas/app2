app.controller('providerDashCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, commonFnSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, authSrvc, $q) {
  $scope.dashboardInit = function() {
    $scope.loggedInNav = true;
    $scope.navTech = false;
    $scope.navDiag = false;
    $scope.navAdmin = false;
    $scope.navProv = true;
    $scope.allCases = true;
    if($stateParams.selectedTile === null) {
      $scope.selectedTile = 1;
      $scope.selectTile($scope.selectedTile);
    }
    else {
      //convert $stateParams.selectedTile to a number
      $scope.selectedTile = parseInt($stateParams.selectedTile, 10);
      $scope.selectTile($scope.selectedTile);
    }
    $scope.getTreatmentCompletedCount();
    $scope.getTags();

  };

//******************* GET PATIENT INFO FOR DASHBOARD ********************/
  $scope.getDashboardData = function () {
      commonFnSrvc.getProviderDashboardData($scope);
  };

  $scope.getTreatmentCompletedData = function () {
      commonFnSrvc.getTreatmentCompletedCases($scope);
  };

  $scope.getTreatmentCompletedCount = function() {
      commonFnSrvc.getTreatmentCompletedCount($scope);
  }

//******************* END GET PATIENT INFO FOR DASHBOARD ********************/

//******************* SELECT TILES ********************/
  $scope.selectTile = function(object) {
    $scope.selectedTile = object;
    if(object === 3) {
        $scope.getTreatmentCompletedData();
    }
    else {
      $scope.getDashboardData();
    }
  };
//******************* END SELECT TILES ********************/

//******************* GO TO PATIENT DETAILS ********************/
$scope.gotocase = function (casefile) {
  authSrvc.goToProviderPatientDetails(casefile, $scope.selectedTile);
};
//******************* END GO TO PATIENT DETAILS ********************/

//******************* OPEN NEW CASE ********************/
  $scope.openNewCase = function (file) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              file = {};
              $scope.formUpload = true;
              upload({
                  url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&RequestBinary=true',
                  method: 'POST',
                  data: {
                      jsonData: JSON.stringify(file),
                  },
                  withCredentials: true
              })
                  .then(function (response) {
                      // JC 11/07/2017 add for upload file
                      $scope.casefile = response.data.data;
                      $scope.newCasefile = response.data.data;
                      $scope.newCasefile2 = angular.copy(response.data.data);
                      $state.go('new-case.step-1', {id: $scope.newCasefile2.id, selectedTile: $scope.selectedTile});
                  });
          }
      });
  };
//******************* END OPEN NEW CASE ********************/

//********************** TILE FILTERS **********************/
  // $scope.activeCases = [1, 2, 4, 8]; //Original
  $scope.activeCases = [2, 3, 4, 8];
  $scope.underReview = [2, 4, 8];
  $scope.attentionNeeded = [1, 6];
  $scope.archived = [5];
  $scope.inclusiveFilter = function (expected, actual) {
      return actual.indexOf(expected) > -1;
  };
//********************** END TILE FILTERS **********************/

//********************** DELETE/ARCHIVE CASE **********************/
  var openDeleteModal = function() {
    ModalService.showModal({
        templateUrl: 'confirmDelete.html',
        controller: function ($element) {
            this.data = $scope.casefile;
            this.user = $scope.userInfo;
            $scope.data = this.data;
            $scope.user = this.user;
            this.archiveCase = function (caseStatus) {
                caseStatus.status.status = 'Archived';
                caseStatus.status.ccGuid = '{ae0fd1e9-9c5a-47d2-86a2-d01932505146}';
                caseStatus.status.id = 5;
                caseStatus.status.name = 'Archived';
                $scope.archived = caseStatus.status.status;
                upload({
                    url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&RequestBinary=true',
                    method: 'POST',
                    data: {
                        jsonData: JSON.stringify(caseStatus),
                    },
                    withCredentials: true
                })
                    .then(function (response) {})
            }
            this.areYouSure = function () {
                if (confirm('You are about to close without saving.  Proceed?') === true) {
                     $element.modal('hide');
                }
                else {
                }
            }
        },
        controllerAs: "modalCtrl"
    })
        .then(function (modal) {
            modal.element.modal();
            modal.close.then(function(result) {});
        });
  };
  $scope.confirmDeleteModal = function (casefile) {
    $scope.casefile = casefile;
    var mySrvc = authSrvc.getAuthenticationForClicks(openDeleteModal);
  };
//******************** END DELETE/ARCHIVE CASE ********************/


//******************** REQUEST REFUND ********************/
  var requestRefundModal = function () {
    ModalService.showModal({
        templateUrl: 'requestRefund.html',
        controller: function ($element) {
            this.data = $scope.casefile;
            $scope.data = this.data;
            $scope.showErrorMsg = false;
            this.refundAndArchive = function () {
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSendRequestRefundandArchiveEmail&PatientID=' + $scope.data.id).then(function(response) {
                console.log(response);
                if(response.errors.length > 0) {
                  $scope.showErrorMsg = true;
                  $scope.errorMsg = "Something went wrong.  Please contact the urlSite Administrator for assistance."
                }
                else {
                   $element.modal('hide');
                   $scope.getDashboardData();
                }
              })
            }
        },
        controllerAs: "modalCtrl"
    })
        .then(function (modal) {
            modal.element.modal();
            modal.close.then(function(result) {
              $scope.getDashboardData();
            });
        });
};
  $scope.authRequestRefund = function(casefile) {
  $scope.casefile = casefile;
  authSrvc.getAuthenticationForClicks(requestRefundModal);
};

//******************** DOWNLOAD REPORT ********************/
  var dwnldFinalReport = function() {
    window.location = $scope.reportUrl;
  };
  $scope.downloadFinalReport = function(url) {
    $scope.reportUrl = url;
    authSrvc.getAuthenticationForClicks(dwnldFinalReport);
  };

//********************** TAGS **********************/
  $scope.getTags = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetTags').then(function(response) {
      $scope.tagSelections = response.data;
      var emptySelection = {id: null, title: null, color: "#ffffff"}
      $scope.tagSelections.push(emptySelection);
    })
  };
  $scope.tagColor = 'transparent';
  $scope.tagBorder = '#aaa';
  $scope.showTagDropdown = false;
  $scope.showTagFilterDropdown = function() {
    $scope.showTagDropdown = true;
    $scope.filterTagClicked = false;
  };
  $scope.filterTagClicked = false;
  $scope.filterTag = function(tag) {
    $scope.filterTagClicked = true;
    if(!tag) {
      $scope.tagFilter = '';
      $scope.tagColor = 'transparent';
      $scope.tagBorder = '#aaa';
    }
    else {
      $scope.tagFilter = tag.title;
      $scope.tagColor = tag.color;
      $scope.tagBorder = tag.color;
    }
    $scope.showTagDropdown = false;
  };
  $scope.showTagColors = function(selectedCase) {
    selectedCase.selected = true;
  };
  $scope.changeTagColor = function(selectedCase, selectedTag) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientTag&PatientID=' + selectedCase.id + '&TagID=' + selectedTag.id).then(function(response) {
      selectedCase.tag = response.data.tag;
      selectedCase.selected = false;
    })
  };
  $scope.openCaseTag = function(caseTag) {
    $scope.caseTag = caseTag;
    if(caseTag.selected) {
      caseTag.selected = false;
      $scope.caseTag.selected = false;
    }
    else {
      caseTag.selected = true;
      $scope.caseTag.selected = true;

    }
  };
  //Click outside to close Tag
  $(document).bind('click', function(event){
    if(event.target.id > 0) {
    }
    else {
      if($scope.showTagDropdown && !$scope.filterTagClicked) {
        $scope.$apply(function(){
            $scope.showTagDropdown = false;
        });
      }
      if($scope.caseTag && $scope.caseTag.selected) {
        $scope.$apply(function(){
            $scope.caseTag.selected = false;
        });
      }
    }
  });
//********************** END TAGS **********************/

}); //End of Controller

//*****************************************************************/
//_________________________________________________________________/
//-------------------- END DELETE/ARCHIVE CASE --------------------/
//____________________ END DELETE/ARCHIVE CASE ____________________/
////////////////////// END DELETE/ARCHIVE CASE ///////////////////////
