app.controller('adminDashCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, commonFnSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, authSrvc) {

  $scope.adminDashboardInit = function () {
      $scope.loggedInNav = true;
      $scope.navTech = false;
      $scope.navDiag = false;
      $scope.navAdmin = true;
      $scope.navProv = false;
      $scope.getDashboardData();
      $scope.getCompletedCount();
      $scope.getTechnicians();
      $scope.getDiagnosticians();
      $scope.getFinalReviewers();
      $scope.showHideCases = false;
      if($stateParams.selected === null) {
        $scope.selected = 10;
        $scope.getStatus($scope.selected);
      }
      else {
        $scope.selected = parseInt($stateParams.selected, 10);
        $scope.getStatus($scope.selected);
      }
      $scope.getTags();
  };

  $scope.getDashboardData = function () {
    commonFnSrvc.getDashboardData($scope);
  };

  $scope.getCompletedCases = function () {
    // commonFnSrvc.getCompletedCases($scope); //Original function to get completed cases
    commonFnSrvc.getRecentlyCompletedCases($scope);  //4.17.19 - Patient Search
  };

  $scope.getCompletedCount = function() {
    commonFnSrvc.getCompletedCount($scope);
  };

  // 4.17.19 - Patient Search
  $scope.searchFields = {
     input: "",
     caseNo: "",
     patientId: "",
   };
  $scope.autocompleteField = 'Patient Name';
  $scope.getPatientsByAutocomplete = function(input) {
    if(input.length > 2) {
      commonFnSrvc.getPatientsByAutocomplete($scope, input);
    }
  };
  $scope.getCasesBySearch = function(resultSelection) {
    $scope.searchFields = {
      input: "",
      caseNo: "",
      patientId: "",
    };
    $scope.autocompleteSelected = true;
    $scope.autocompleteField = resultSelection.info.firstname + ' ' + resultSelection.info.lastname + ' ' + resultSelection.casenumber ;
    commonFnSrvc.getCasesBySearch($scope, resultSelection);
  };
  $scope.clearSearch = function(searchFields) {
    searchFields = {
      input: "",
      caseNo: "",
      patientId: "",
    };
    $scope.autocompleteSelected = false;
    $scope.searchFields = searchFields;
    $scope.autocompleteField = 'Patient Name';
    $scope.getCompletedCases();
  };
  // End 4.17.19 - Patient Search


  //******************* GO TO PATIENT DETAILS ********************/
  $scope.gotocase = function (casefile) {
    authSrvc.goToPatientDetails(casefile, $scope.selected);
  };
  //******************* END GO TO PATIENT DETAILS ********************/

  //************************** TAGS ***************************/
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
  //Click outside to close
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

  //******************************************************************/
  //* Get User Role Data - Technician*/
  //******************************************************************/
  $scope.getTechnicians = function () {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUsersFromRole&roleGuid={fbc16991-fd1b-43db-89c8-9c2906281eb3}').then(function (response) {
          $scope.listOfTechs = response.data;
      });
  };
  $scope.editTechnician = function (caseFile) {
      $scope.case = caseFile;
      $scope.case.assignedTo.id = 0;
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientTechnician&patientId=' + caseFile.id + '&userId=' + 0)
          .then(function (response) {
          });
  };
  $scope.setTechnician = function (caseFile) {
    var techId = caseFile.assignedTo;
    var caseId = caseFile.id;

      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientTechnician&patientId=' + caseId + '&userId=' + techId.id)
                  .then(function (response) {
                  });
          }
      });
  };
  //******************************************************************/
  //* Get User Role Data - Diagnostician*/
  //******************************************************************/
  $scope.getDiagnosticians = function () {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUsersFromRole&roleGuid=clinicianKey&roleGuid2={35196A22-7C2C-4F91-A25C-7CD783D28CCC}').then(function (response) {
          $scope.listOfDiagnosticians = response.data;
      });
  };
  $scope.editDiagnostician = function (caseFile) {
      $scope.diagnosticianCase = caseFile;
      $scope.diagnosticianCase.assignedTo.id = 0;
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientDiagnostician&patientId=' + caseFile.id + '&userId=' + 0)
          .then(function (response) {
          });
  };
  $scope.setDiagnostician = function (caseFile) {
    var diagnosticianId = caseFile.assignedToDiagnostician;
    var caseId = caseFile.id;

      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientDiagnostician&patientId=' + caseId + '&userId=' + diagnosticianId.id)
                  .then(function (response) {
                  });
          }
      });

  };

  //******************************************************************/
  //* Get User Role Data - Final Reviewer*/
  //******************************************************************/
  $scope.getFinalReviewers = function () {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUsersFromRole&roleGuid={35196A22-7C2C-4F91-A25C-7CD783D28CCC}').then(function (response) {
          $scope.listOfFinalReviewers = response.data;
      });
  };
  $scope.editFinalReviewer = function (caseFile) {
      $scope.finalReviewerCase = caseFile;
      $scope.finalReviewerCase.assignedTo.id = 0;
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFinalReviewer&patientId=' + caseFile.id + '&userId=' + 0)
          .then(function (response) {
          });
  };
  $scope.setFinalReviewer = function (caseFile) {
    var finalReviewerId = caseFile.assignedToFinalReviewer;
    var caseId = caseFile.id;
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFinalReviewer&patientId=' + caseId + '&userId=' + finalReviewerId.id)
                  .then(function (response) {
                  });
          }
      });

  };

  //****************** TILE FILTERS ********************/
  $scope.filterByStatus = function (stat) {
      return ($scope.diagnosticFilter.indexOf(stat) !== -1);
  };
  $scope.diagnosticFilter2 = [2, 3, 4, 8];
  $scope.diagnosticFilter3 = [2, 4, 8];
  $scope.finalReviewFilter2 = [2, 3, 4, 8];
  $scope.techStatus = [2, 8];
  $scope.allCasesProvider = [1, 2, 3, 4, 6, 8];
  $scope.filterByStatus2 = function (expected, actual) {
      return actual.indexOf(expected) > -1;
  };
  $scope.getStatus = function (myObject) {
      $scope.selected = myObject;
      if (myObject === 10) {
        $scope.techId = '';
        $scope.diagnosticianId = '';
        $scope.techStatusFilter = [2, 4, 8];
        $scope.showRadioSelections = false;
        $scope.selectedTBA = false;
      }
      if (myObject === 3) {
          $scope.getCompletedCases();
          $scope.allCases = false;
          $scope.allReview = false;
          $scope.statCompleted = true;
          $scope.selectedTBA = false;
      }
      if (myObject === 1) {
          // $scope.allInReview = [1];
          $scope.allCases = false;
          $scope.allReview = false;
          $scope.statCompleted = false;
      }
      if (myObject === 6) {
          $scope.allCases = false;
          $scope.allReview = false;
          $scope.statCompleted = false;

      }
      if (myObject === 9) {
          $scope.selectedTBA = true;
          $scope.statusClicked = false;
          $scope.casesInProgressSelected = false;
          $scope.diagnosticianId = '';
          $scope.techId = '';
          $scope.techStatusFilter = [2, 4, 8];
          $scope.setRadio(0);
          $scope.showRadioSelections = true;
      }
      if (myObject === 2) {
              $scope.techStatusFilter = [2];
              $scope.techId = 0;
              $scope.diagnosticianId = 0;
              $scope.showRadioSelections = false;
              $scope.selectedTBA = false;
      }
       if (myObject === 4) {
              $scope.techStatusFilter = [4];
              $scope.techId = '';
              $scope.diagnosticianId = 0;
              $scope.showRadioSelections = false;
              $scope.selectedTBA = false;
      }
      else {
        //old - probably needs to be changed
          $scope.diagnosticianId = '';
          $scope.techId = '';
          $scope.techStatusFilter = [myObject];
          $scope.showRadioSelections = false;
      }
  };
  $scope.techOnlyFilter = function(datarow) {
    if(datarow.assignedTo.id != 0) {
      return true;
    }
  }
  $scope.clinicianOnlyFilter = function(datarow) {
    if(datarow.assignedToDiagnostician.id != 0) {
      return true;
    }
  }
  $scope.finalReviewerOnlyFilter = function(datarow) {
    if(datarow.assignedToFinalReviewer.id != 0) {
      return true;
    }
  }
  $scope.allToBeAssignedFilter = function(datarow) {
    var returnStatus = false;
    if (datarow.assignedTo.id == 0) {
        if ($scope.selectedValue != 2 && $scope.selectedValue != 3) {
            returnStatus = true;
        }

    }
    if (datarow.status.id == 4 && datarow.assignedTo.id != 0 && datarow.assignedToDiagnostician.id == 0) {
      if ($scope.selectedValue != 1  && $scope.selectedValue != 3) {
          returnStatus = true;
      }
    }
    if (datarow.status.id == 8 && datarow.assignedTo.id != 0 && datarow.assignedToDiagnostician.id != 0 && datarow.assignedToFinalReviewer.id == 0) {
      if ($scope.selectedValue != 1 && $scope.selectedValue != 2) {
          returnStatus = true;
      }
    }
    return returnStatus;
  }
  $scope.setRadio = function (selectedValue) {
      $scope.selectedValue = selectedValue;
  };
  //******************************************************************/
  //* Sorting Newest to Oldest */
  //******************************************************************/
  $scope.sortByDate = [
      { id: 1, date: "newest to oldest" },
      { id: 2, date: "oldest to newest" }
  ];
  $scope.sortNewstOldest = function (option) {

      $scope.orderDate = '';
      if (option.date === 'newest to oldest') {
        $scope.casesTable.sorting({ submittedDateSort: 'desc' });
        if($scope.completedCasesTable) {
          $scope.completedCasesTable.sorting({ submittedDateSort: 'desc' });
        }

      }
      else if (option.date === 'oldest to newest') {
        $scope.casesTable.sorting({ submittedDateSort: 'asc' });
        if($scope.completedCasesTable) {
          $scope.completedCasesTable.sorting({ submittedDateSort: 'asc' });
        }

      }
      else {
        $scope.casesTable.sorting({ submittedDateSort: 'asc' });
        if($scope.completedCasesTable) {
          $scope.completedCasesTable.sorting({ submittedDateSort: 'asc' });
        }
      }
  };

  //******************* Get How Many Days Submitted (to Admin) *********************/
  $scope.getFormattedDate = function(date) {
    var submitted = new Date(date);
    return submitted;
  };
  $scope.getDaysSubmitted = function (date) {
    if(date == '12/30/1899') {
      return '--'
    }
      var daysSubmitted = 0
      if (date) {
          var _MS_PER_DAY = 1000 * 60 * 60 * 24;
          var current = new Date();
          var submitted = new Date(date);
          var currentDate = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
          var submittedDate = Date.UTC(submitted.getFullYear(), submitted.getMonth(), submitted.getDate());
          daysSubmitted = Math.floor((currentDate - submittedDate) / _MS_PER_DAY);
      }
      $scope.daysSubmitted = daysSubmitted;
      return $scope.daysSubmitted;
  };
  $scope.getSimpleDate = function(tableDate) {
    var simpleDate = new Date(tableDate);
    simpleDate = $filter('date')(simpleDate);
    return simpleDate;
  };

  //******************************************************/
  //********** Admin Hides Case from Patient List ********/
  //******************************************************/
  $scope.hideCase = function (casefile) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              casefile.adminHide = true;
              var value = casefile.adminHide;
              var caseId = casefile.id;
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetToHidePatientCasefile&patientId=' + caseId + '&value=' + value)
                  .then(function (response) {
                      response.data.adminHide = $scope.hiddenFile;
                  });
          }
      });
  };

  //******************************************************/
  //********** Admin Undoes Hide Case from Patient List ********/
  //******************************************************/
  $scope.undoHideCase = function (casefile) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              $scope.autoLoggedOutAlert();
          }
          else {
              casefile.adminHide = false;
              var value = casefile.adminHide;
              var caseId = casefile.id;
              apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetToHidePatientCasefile&patientId=' + caseId + '&value=' + value)
                  .then(function (response) {
                      response.data.adminHide = $scope.shownFile;
                  });
          }
      });
  };

  //******************************** LOGGED OUT MODAL ************************/
  //NOTE: Need to make this GLOBAL!!!
  $scope.autoLoggedOutAlert = function () {
      ModalService.showModal({
          templateUrl: 'autoLogout.html',
          controller: function ($element) {
              this.redirectToLogin = function () {
                   $element.modal('hide');
                  window.location = $rootScope.cloudUrl;
              }
          },
          controllerAs: "modalCtrl"
      })
          .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {});
          });
  };

}); //End of Controller
