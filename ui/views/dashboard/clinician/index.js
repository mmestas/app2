app.controller('clinicanDashCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, authSrvc) {
    $scope.dashboardInit = function () {
        $scope.loggedInNav = true;
        $scope.navTech = true;
        $scope.navDiag = false;
        $scope.navAdmin = false;
        $scope.navProv = false;
        $scope.showHideCases = '';
        if($stateParams.selected === null) {
          $scope.selected = 1;
        }
        else {
          $scope.selected = parseInt($stateParams.selected, 10);
          if($scope.selected === 3 || $scope.selected === 4) {
            $scope.getCompletedCases();
          }
        }

        $scope.getDashboardData();
        $scope.getCompletedCount();
        $scope.getTags();
    }

    $scope.getDashboardData = function () {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusNotComplete').then(function (response) {
            $scope.cases = response;
            var caseData = response.data;
            angular.forEach(caseData, function(caseToBeFiltered) {
              caseToBeFiltered.setPatientDiagnosticianDate = $filter('jsonDate')(caseToBeFiltered.setPatientDiagnosticianDate);
              return caseToBeFiltered;
            })
            $scope.casesData = caseData;
            $scope.casesTable = new NgTableParams(
                {
                  count: response.data.length
                },
                {
                    filterOptions: {
                        filterLayout: "horizontal",
                        show: true
                    },
                    counts: [],
                    dataset: $scope.casesData
                }
            );
            $scope.casesTable.sorting({ submittedDateSort: 'asc' });
        })
        //This first formats the date so it's filterable
        $scope.byFormattedDateFilter = function(datarow) {
          var returnStatus = true;
          var simpleDate = new Date(datarow.paymentCompletedDate);
          simpleDate = $filter('date')(simpleDate);
          datarow.paymentCompletedDate = simpleDate;
          return returnStatus;
        }
        $scope.assignedFormattedDateFilter = function(datarow) {
          var returnStatus = true;
              var simpleDate = new Date(datarow.setPatientDiagnosticianDate);
              simpleDate = $filter('date')(simpleDate);
              datarow.setPatientDiagnosticianDate = simpleDate;
          return returnStatus;
        }

        $scope.firstLastNameFilter = {
            'info.firstname': {
                id: "text",
                placeholder: "First Name"
            },
            'info.lastname': {
                id: "text",
                placeholder: "Last Name"
            }
        };
    }
    //Completed Cases
    $scope.getCompletedCases = function () {
      if(!$scope.completedCases) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusComplete').then(function (response) {
          $scope.completedCases = response;
          var completedCaseData = response.data;
          $scope.completedCasesData = completedCaseData;
          $scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: $scope.completedCasesData
              }
          );
          $scope.completedCasesTable.sorting({ casenumber: 'desc' });
      })
    }

      //This first formats the date so it's filterable
      $scope.formattedDateFilter = function(datarow) {
        var returnStatus = true;
        var simpleDate = new Date(datarow.statusCompletedDate);
        simpleDate = $filter('date')(simpleDate);
        datarow.statusCompletedDate = simpleDate;
        return returnStatus;
      }

      $scope.firstLastNameFilter = {
          'info.firstname': {
              id: "text",
              placeholder: "First Name"
          },
          'info.lastname': {
              id: "text",
              placeholder: "Last Name"
          }
      };
    }

    $scope.getCompletedCount = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusCompleteCount').then(function (response) {
        $scope.notHiddenCompletedCases = response.data.notHiddenCompletedCases;
        $scope.statushiddenCompletedCases = response.data.hiddenCompletedCases;
      });
    }

    $scope.getTechDashStatuses = function(myObject) {
      $scope.selected = myObject;
      if((myObject === 3) || (myObject === 4)) {
        $scope.getCompletedCases();
      }
    }

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
    }
    $scope.tagColor = 'transparent';
    $scope.tagBorder = '#aaa';
    $scope.showTagDropdown = false;
    $scope.showTagFilterDropdown = function() {
      $scope.showTagDropdown = true;
      $scope.filterTagClicked = false;
    }

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
    }

    $scope.showTagColors = function(selectedCase) {
      selectedCase.selected = true;
    }
    $scope.changeTagColor = function(selectedCase, selectedTag) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientTag&PatientID=' + selectedCase.id + '&TagID=' + selectedTag.id).then(function(response) {
        selectedCase.tag = response.data.tag;
        selectedCase.selected = false;
      })
    }

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
    }
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
    }
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
    }
    $scope.getSimpleDate = function(tableDate) {
      var simpleDate = new Date(tableDate);
      simpleDate = $filter('date')(simpleDate);
      return simpleDate;
    }
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
    }

    //******************* GO TO PATIENT DETAILS ********************/
    $scope.gotocase = function (casefile) {
      authSrvc.goToPatientDetails(casefile, $scope.selected);
    };
    //******************* END GO TO PATIENT DETAILS ********************/


});
