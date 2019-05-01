app.controller('techDashCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, commonFnSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, authSrvc) {
    $scope.dashboardInit = function () {
        $scope.loggedInNav = true;
        $scope.navTech = true;
        $scope.navDiag = false;
        $scope.navAdmin = false;
        $scope.navProv = false;
        $scope.showHideCases = '';
        if($stateParams.selectedTile === null) {
          $scope.selectedTile = 1;
          $scope.getDashboardData();
        }
        else {
          $scope.selectedTile = parseInt($stateParams.selectedTile, 10);
          if($scope.selectedTile === 3 || $scope.selectedTile === 4) {
            $scope.getCompletedCases();
          }
          else {
            $scope.getDashboardData();
          }
        }
        $scope.getCompletedCount();
        $scope.getTags();
    };

    //******************* SELECT TILES ********************/
    $scope.selectTile = function(object) {
        $scope.selectedTile = object;
        if((object === 3) || (object === 4)) {
            $scope.getCompletedCases();
        }
        else {
          $scope.getDashboardData();
        }
      };
    //******************* END SELECT TILES ********************/

    $scope.getDashboardData = function () {
      commonFnSrvc.getDashboardData($scope);
    };
    //Completed Cases
    $scope.getCompletedCases = function () {
      commonFnSrvc.getRecentlyCompletedCases($scope);
    }

    $scope.getCompletedCount = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusCompleteCount').then(function (response) {
        $scope.notHiddenCompletedCases = response.data.notHiddenCompletedCases;
        $scope.statushiddenCompletedCases = response.data.hiddenCompletedCases;
      });
    }

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


    $scope.activeCasesFilter = [2, 4, 8];
    $scope.technicianCasesFilter = [2];
    $scope.diagnosticianCasesFilter = [4];
    $scope.finalReviewerCasesFilter = [8];

    $scope.filterByStatus = function (expected, actual) {
        return actual.indexOf(expected) > -1;
    };

    //COMMON FILES
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

    //******************************************************************/
    //* Go to Case File Details and Pass Perameter */
    //******************************************************************/
    $scope.gotocase = function (casefile) {
      authSrvc.goToPatientDetails(casefile, $scope.selectedTile);
    };

    //******************* END GO TO PATIENT DETAILS ********************/


});
