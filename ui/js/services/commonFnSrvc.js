app.service('commonFnSrvc', function ($http, $location, $rootScope, apiSrvc, $filter, NgTableParams, Upload, upload, blockUI, $timeout) {

  //GETS
  this.getDashboardData = function(scope) {
    if(!scope.activeCasesData) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusNotComplete').then(function (response) {
          scope.activeCasesData = response.data;
          scope.cases = response;
          var caseData = response.data;
          scope.casesData = caseData;
          scope.casesTable = new NgTableParams(
              {
                  count: response.data.length,
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.casesData
              }
          );
          scope.casesTable.sorting({ submittedDateSort: 'asc' });
      })

      this.tableFilters(scope);
    }
  };

  this.getCompletedCases = function(scope) {
    if(!scope.completedCases) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusComplete').then(function (response) {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
      })
    }

    this.tableFilters(scope);
  };

  this.getRecentlyCompletedCases = function(scope) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsRecentlyCompletedCases').then(function (response) {
        if(response.errors.length > 0) {
        }
        else {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
        }
        scope.showAutocompleteDropdown = false;
      })
    this.tableFilters(scope);
  };

  this.getPatientsByAutocomplete = function(scope, input) {
    scope.showAutocompleteDropdown = true;
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsForAutocompleteSearch&input='+input).then(function (response) {
      scope.patientSearchDropdown = response.data;
    });
  };

  this.getCasesBySearch = function(scope, resultSelection) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsBySearch&patientId='+resultSelection.id).then(function (response) {
        if(response.errors.length > 0) {
        }
        else {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
        }
        scope.showAutocompleteDropdown = false;
      })
    this.tableFilters(scope);
  };

  this.getTreatmentCompletedCases = function(scope) {
      if(!scope.treatmentCompletedCasessData) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusTreatmentCompleted').then(function (response) {
            var treatmentCompletedCasesData = response.data;
            scope.treatmentCompletedCasessData = treatmentCompletedCasesData;
            scope.treatmentCompletedCasessTable = new NgTableParams(
                {
                    count: response.data.length
                },
                {
                    filterOptions: {
                        filterLayout: "horizontal",
                        show: true
                    },
                    counts: [],
                    dataset: scope.treatmentCompletedCasessData
                }
            );
            scope.treatmentCompletedCasessTable.sorting({ casenumber: 'desc' });
        })

        this.tableFilters(scope);
      }


  };

  this.getProviderDashboardData = function(scope) {
    if(!scope.activeCasesData) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusNotComplete').then(function (response) {
          var cases = response.data;
          scope.activeCasesData = response.data;
            apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusComplete').then(function (response) {
                scope.completedCases = response.data;
                var cases2 = cases.concat(scope.completedCases);
                scope.casesData = cases2;
                scope.casesTable = new NgTableParams(
                    {
                        count: scope.casesData.length,
                    },
                    {
                        filterOptions: {
                            filterLayout: "horizontal",
                            show: true
                        },
                        counts: [],
                        dataset: scope.casesData
                    }
                );
                scope.casesTable.sorting({ submittedDateSort: 'asc' });

            })
      })
      this.tableFilters(scope);
    }
  };

  this.getCompletedCount = function(scope) {
    //NOTE: Completed is now "In-Treatment"
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusCompleteCount').then(function (response) {
      scope.notHiddenCompletedCases = response.data.notHiddenCompletedCases;
      scope.statushiddenCompletedCases = response.data.hiddenCompletedCases;
    });
  };

  this.getTreatmentCompletedCount = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientsStatusTreatmentCompletedCount').then(function (response) {
      scope.notHiddenTreatmentCompletedCases = response.data.hiddenCompletedCases;
      scope.statushiddenTreatmentCompletedCases = response.data.notHiddenCompletedCases;
    });
  };

  this.getPatientDetails = function(scope, caseID) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientDetails&patientid=' + caseID).then(function (response) {
      scope.patientDetails = response.data;
      scope.patientDetailsImages = angular.copy(response.data);
      scope.newCasefile = angular.copy(response.data); //Needed for teeth charting svg files
      scope.currentAge = response.data.info.age;
      scope.currentAgeMonth = response.data.info.ageMonth;

    });
  };

  this.getPatientProfile = function(scope, caseID) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfile&patientid=' + caseID).then(function (response) {
      scope.patientDetails = response.data;
      scope.patientDetailsImages = angular.copy(response.data);
      scope.newCasefile = angular.copy(response.data); //Needed for teeth charting svg files
      scope.currentAge = response.data.info.age;
      scope.currentAgeMonth = response.data.info.ageMonth;
      scope.statusObj = {};
      scope.statusObj.status = scope.patientDetails.status;
    });
  };

  this.getAge = function (scope, birthdate) {
      var currentDate = new Date();
      var currentMonth = currentDate.getMonth() + 1;
      var dob = new Date(birthdate);
      var dobMonth = dob.getMonth() + 1;
      if (currentMonth < dobMonth) {
        var ageMonth = (currentMonth + 12) - dobMonth;
      }
      else {
        var ageMonth = (currentMonth - dobMonth);
      }
      var age = new Date(currentDate - dob).getFullYear() - 1970;
      if (isNaN(age)) {
        scope.patientAge = 'Patient Age';
      }
      else {
        scope.currentAge = age;
        scope.currentAgeMonth = ageMonth;
        scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';

        if(scope.patientDetails) {
          var dob = new Date(birthdate);
          birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
          console.log(birthdate);
        }
      }
  };

  this.getAppliances = function(scope) {
    if(!scope.appliances) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetAppliances').then(function (response) {
            scope.appliances = response.data;
        });
    };
  };

  this.getTreatmentStages = function(scope) {
      scope.treatmentStages = [
      {id: 1, name: "Initial Treatment"},
      {id: 2, name: "Mid-Treatment"}
      ];
  };

  this.getTreatmentOptions = function(scope) {
    if(!scope.treatementOptions) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetTreatmentOptions').then(function (response) {
          scope.treatementOptions = response.data;
      });
    }

  };

  this.getContructionBite = function(scope) {
    if(!scope.constructionBite) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetConstructionBite').then(function (response) {
            scope.constructionBites = response.data;

            var selectNone = {
              guid: "",
              id: 0,
              name: "None"
            }
            scope.constructionBites.push(selectNone);
        });
    };
  };

  this.geturlSiteShippingMethods = function(scope) {
    if(!scope.shippingMethods) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetShippingMethods').then(function (response) {
            scope.shippingMethods = response.data;
        });
    };
  };

  this.geturlSiteApplianceSpecialists = function(scope) {
    if(!scope.urlSiteApplianceSpecialists) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetApplianceSpecialists').then(function (response) {
            scope.urlSiteApplianceSpecialists = response.data;
        });
    }
  };

  this.geturlSiteGuides = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGeturlSiteGuides').then(function (response) {
      scope.urlSiteGuides = response.data.urlSiteGuides;
      scope.urlSiteUpperGuides = response.data.urlSiteUpperGuides;
      scope.urlSiteLowerGuides = response.data.urlSiteLowerGuides;
    });

  };

  this.getStates = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetStates').then(function (response) {
        scope.statesList = response.data;
    });
  };

  this.getCountries = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetCountries').then(function (response) {
        scope.countriesList = response.data;
    });
  };

  this.getStatesFromCountry = function(scope, countryId) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetStatesFromCountry&CountryId='+countryId).then(function (response) {
        scope.statesList = response.data;
    });
  };

  this.getPatientStatuses = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfileStatuses').then(function (response) {
        scope.statuses = response.data;
    })
  };

  //POSTS
    //Old patient profile/details page
  this.urlSiteSetPatient = function(scope, patientDetails) {
    var dob = new Date(patientDetails.info.birthdate);
    patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
    scope.formUpload = true;
    if(patientDetails.statusModifiedDate) {
        delete patientDetails.statusModifiedDate;
    }
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&RequestBinary=true',
        method: 'POST',
        data: {
            jsonData: JSON.stringify(patientDetails),
        },
        withCredentials: true
    })
      .then(function (response) {
          // JC 7/11/2017
          blockUI.start("Saving ... ");
          $timeout(function () {
              blockUI.stop();
          }, 2000);

      });
  };

    //New patient profile page
  this.urlSiteSetPatientProfile = function(scope, patientDetails) {
    var dob = new Date(patientDetails.info.birthdate);
    patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
    scope.patientDetails.info.birthdate = patientDetails.info.birthdate;

    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientProfile&RequestBinary=true',
        method: 'POST',
        data: {
            PatientProfileId: patientDetails.caseFile,
            jsonData: JSON.stringify(patientDetails)
        },
        withCredentials: true
    })
      .then(function (response) {
          scope.patientDetails = response.data.data;
          // JC 7/11/2017
          blockUI.start("Saving ... ");
          $timeout(function () {
              blockUI.stop();
          }, 2000);

      });
  };

  this.urlSiteSubmitPrescription = function(scope, patientDetails) {
    var dob = new Date(patientDetails.info.birthdate);
    patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
    scope.formUpload = true;
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&prescription=1&RequestBinary=true',
        method: 'POST',
        data: {
            jsonData: JSON.stringify(patientDetails),
        },
        withCredentials: true
    })
      .then(function (response) {
        scope.patientDetails = response.data.data;
          // JC 7/11/2017
          blockUI.start("Saving ... ");
          $timeout(function () {
              blockUI.stop();
          }, 2000);

      });
  };

  //Other functions
  this.updateAge = function(scope, birthdate) {
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth() + 1;
    var dob = new Date(birthdate);
    var dobMonth = dob.getMonth() + 1;
    if (currentMonth < dobMonth) {
      var ageMonth = (currentMonth + 12) - dobMonth;
    }
    else {
      var ageMonth = (currentMonth - dobMonth);
    }
    var age = new Date(currentDate - dob).getFullYear() - 1970;
    if (isNaN(age)) {
      scope.patientAge = 'Patient Age';
    }
    else {
      scope.currentAge = age;
      scope.casefile.info.age = age;
      scope.currentAgeMonth = ageMonth;
      scope.casefile.info.ageMonth = ageMonth;
      scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';
    }
  };

  this.tableFilters = function(scope) {
    //This formats the date so it's filterable
    scope.byFormattedDateFilter = function(datarow) {
      var returnStatus = true;
      var simpleDate = new Date(datarow.paymentCompletedDate);
      var simpleDate2 = new Date(datarow.submittedDate);
      var simpleDate3 = new Date(datarow.statusCompletedDate);
      var simpleDateOriginal = new Date(datarow.originalSubmittedDate);

      simpleDate = $filter('date')(simpleDate);
      simpleDate2 = $filter('date')(simpleDate2);
      simpleDate3 = $filter('date')(simpleDate3);
      simpleDateOriginal = $filter('date')(simpleDateOriginal);

      datarow.paymentCompletedDate = simpleDate;
      datarow.submittedDate = simpleDate2;
      datarow.statusCompletedDate = simpleDate3;
      datarow.originalSubmittedDate = simpleDateOriginal;

      datarow.submittedDate.toString();
      datarow.originalSubmittedDate.toString();

      if(typeof datarow.submittedDate !== 'string') {
        datarow.submittedDate = 'N/A';
      }

      if(typeof datarow.originalSubmittedDate !== 'string') {
        datarow.originalSubmittedDate = 'N/A';
      }

      return returnStatus;
    }
    scope.firstLastNameFilter = {
        'info.firstname': {
            id: "text",
            placeholder: "First Name"
        },
        'info.lastname': {
            id: "text",
            placeholder: "Last Name"
        }
    };

  };

  this.hoverIn = function(tooth, allowChanges) {
      if(allowChanges) {
        angular.element('#'+tooth).addClass('highlightMatch');
      }
  };
  this.hoverOut = function(tooth, allowChanges) {
    if(allowChanges) {
      angular.element('#'+tooth).removeClass('highlightMatch');
    }
  };



}); //End of Service
