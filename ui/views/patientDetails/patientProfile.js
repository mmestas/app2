app.controller('patientProfileCtrl', function ($rootScope, $scope, $state, $stateParams, $location, $window, apiSrvc, authSrvc, commonFnSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, $mdToast, $document, Upload, upload, $filter, blockUI, ModalService, $anchorScroll) {

  $scope.getPatientProfile = function() {
    var url = $location.path().split('/');
    var caseId = url[2];
    var selectedTile = url[3];
    $scope.caseId = caseId;
    $scope.selectedTile = selectedTile;
    if($scope.selectedTile === '') {
       $scope.selectedTile = 1;
    }
    commonFnSrvc.getPatientProfile($scope, caseId);
    $scope.getPatientPrescriptions(caseId);
    $scope.getPatientStatuses();
  }

  $scope.getPatientPrescriptions = function(caseId) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientPrescriptions&patientid=' + caseId).then(function (response) {
      $scope.patientPrescriptions = response.data;
      if($scope.patientPrescriptions.length === 0) {
        $scope.createNewRx = true;
      }
      else {
        var firstRx = $scope.patientPrescriptions.length - 1;
        var initalPrescriptionDate = $scope.patientPrescriptions[firstRx].prescriptionSubmittedDate;
        if(initalPrescriptionDate) {$scope.isInActiveTreatment = true;};
        var today = new Date();
        var startOfTreatment = new Date(initalPrescriptionDate);

        var msPerDay = 1000 * 60 * 60 * 24;
        var msPerMonth = 1000 * 60 * 60 * 24 * 30;
        var msPerYear = 1000 * 60 * 60 * 24 * 365;
        var utc1 = Date.UTC(startOfTreatment.getFullYear(), startOfTreatment.getMonth(), startOfTreatment.getDate());
        var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        var daysDiff = Math.floor((utc2 - utc1) / msPerDay);
        var monthDiff = Math.floor((utc2 - utc1) / msPerMonth);
        var yearDiff = Math.floor((utc2 - utc1) / msPerYear);

        if(monthDiff > 12) {
          monthDiff =  Math.floor(monthDiff / 12);
        }
        if(daysDiff > 30) {
          daysDiff =  Math.floor(daysDiff / 30);
        }

        $scope.totalTimeInActiveTreatment =  yearDiff + ' years ' + monthDiff + ' months ' + daysDiff + ' days ';

        var lastPrescriptionIndex = $scope.patientPrescriptions.length - 1;
        $scope.lastPrescription = $scope.patientPrescriptions[lastPrescriptionIndex];

        $scope.createNewRx = true;
        angular.forEach($scope.patientPrescriptions, function(prescription) {
          if(prescription.prescriptionId) {
            prescription.editable = false;
            if(prescription.status.guid === '{3D36742C-55DC-47D3-A742-65338BBF8FE5}') {
              prescription.editable = true;
            }
            else {
              if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
                if(prescription.applianceSystem.urlSiteGuides.length < 4) {
                  prescription.editable = true;
                }
                if(prescription.applianceSystem.urlSiteGuides[3]) {
                  if(prescription.applianceSystem.urlSiteGuides[3].invoiced === false) {
                    prescription.editable = true;
                  }
                }
              }
            }
          }
          else {
            prescription.editable = true;
            $scope.createNewRx = false;
          }
        })
      }


    });
  };

  $scope.savePatientProfile = function(patientDetails) {
    // Only send the necessary fields
    var info = {
      firstname: patientDetails.info.firstname,
      lastname: patientDetails.info.lastname,
      birthdate: patientDetails.info.birthdate,
      age: $scope.currentAge,
      ageMonth: $scope.currentAgeMonth,
      gender: patientDetails.info.gender
    }
    var patientObj = {
      caseFile: patientDetails.caseFile,
      caseNumber: patientDetails.caseNumber,
      info: info
    }

    var setPatient = function() {
      commonFnSrvc.urlSiteSetPatientProfile($scope, patientObj);
    }
    authSrvc.getAuthenticationForClicks(setPatient);
  };

  $scope.editInfo = function(patientDetails) {
    // copy fields to edit in case editing canceled
    $scope.patientDetailsEdit = angular.copy(patientDetails);
  };

  $scope.cancelEditInfo = function(patientDetails) {
    // reset editing fields
    $scope.patientDetailsEdit = {};
    $scope.currentAge = patientDetails.info.age;
    $scope.currentAgeMonth = patientDetails.info.ageMonth;
  };

  $scope.getAge = function(birthdate) {
    commonFnSrvc.getAge($scope, birthdate);
  };

  $scope.getPatientStatuses = function() {
    commonFnSrvc.getPatientStatuses($scope);
  };

  //Create New Prescription (only if there are no open prescriptions)
  $scope.createPatientPrescription = function(caseId, selectedTile) {
    var createNewRx = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteCreatePatientPrescription&patientid=' + caseId).then(function (response) {
        if(response.errors.length > 0) {
          console.log('error');
        }
        else {
          var prescriptionGuid = response.data.guid;
          $state.go('createRx', {id: caseId, selectedTile: $scope.selectedTile, prescriptionGuid: prescriptionGuid, prescriptions: $scope.patientPrescriptions.length});
        }
      });
    }
    // If a patient is mid-treatement (already has a Rx) and the provider clicks to create a new Rx - prompt the provider if they want to update the treatemtnt plan for this patient.
    if($scope.patientPrescriptions.length > 0) {
      $scope.toastMsg = 'Would you like to update the treatment plan for this case before creating a new Rx?'
        $mdToast.show({
        hideDelay   : false,
        position    : 'left',
        parent : $document[0].querySelector('#createRxToast'),
        scope:$scope,
        preserveScope:true,
        controller  : toastCtrl,
        template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="updateTreatmentPlan()">Yes</button><button class="btn btn-secondary" ng-click="goStraitToRx()">No</button></md-toast>'
        });
       function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
         $scope.updateTreatmentPlan = function() {
           $mdToast.cancel();
           $scope.showTreatmentPlanningSection = true;
           $scope.getTreatmentPlanningTabs();
           $scope.getAppliances();
           $scope.getTreatmentOptions();
         };
         $scope.goStraitToRx = function() {
          $mdToast.cancel();
           createNewRx();
         };
       }
    }
    else {
      createNewRx();
    }
  };

  $scope.editPatientPrescription = function(caseId, selectedTile, prescription) {
    var prescriptionGuid = prescription.guid;
      $state.go('createRx', {id: caseId, selectedTile: selectedTile, prescriptionGuid: prescriptionGuid, prescriptions: $scope.patientPrescriptions.length});
  };

  $scope.viewPatientPrescription = function(caseId, selectedTile, prescription) {
    var prescriptionGuid = prescription.guid;
    $state.go('createRx', {id: caseId, selectedTile: selectedTile, prescriptionGuid: prescriptionGuid, prescriptions: $scope.patientPrescriptions.length});
  };

  $scope.openPatientRecords = function() {
    $scope.showPatientRecordsSection = true;
    $scope.getPatientRecordTabs();
    $scope.getTreatmentStages();
    $location.hash('patientRecords');
    $anchorScroll();
  };

  $scope.openTreatmentPlanning = function() {
    $scope.showTreatmentPlanningSection = true;
    $scope.getTreatmentPlanningTabs();
    $scope.getAppliances();
    $scope.getTreatmentOptions();
    $location.hash('treatmentPlanning');
    $anchorScroll();
  };

  //********************** TREATMENT COMPLETED CASE **********************/
  var openConfirmChangeStatusToTreatmentCompleted = function() {
    ModalService.showModal({
        templateUrl: 'confirmTreatmentCompleted.html',
        controller: function ($element) {
            this.data = $scope.casefile;
            this.user = $scope.userInfo;
            $scope.data = this.data;
            $scope.user = this.user;
            this.completeTreatment = function (caseStatus) {
                caseStatus.status.status = 'Treatment Completed';
                caseStatus.status.ccGuid = '{FB196E76-2923-45F7-ACCD-D9080124A17C}';
                caseStatus.status.id = 10;
                caseStatus.status.name = 'Treatment Completed';
                // $scope.archived = caseStatus.status.status;
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

  $scope.confirmTreatmentCompletedModal = function (casefile) {
    $scope.casefile = casefile;
    var mySrvc = authSrvc.getAuthenticationForClicks(openConfirmChangeStatusToTreatmentCompleted);
  };

  //******************** END TREATMENT COMPLETED CASE ********************/
  // TREATMENT PLANNING //************************/
  $scope.getTreatmentPlanningTabs = function() {
    var patientId = $scope.caseId;

    if($scope.treatmentPlanningTabs) {}
    else {
      blockUI.start("Loading... ");
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfileTreatmentPlannings&PatientId='+patientId).then(function(response) {
        blockUI.done(function() {});
        blockUI.stop();
        if(response.errors.length > 0) {}
        else {
          $scope.treatmentPlanningTabs = response.data;
          var last = $scope.treatmentPlanningTabs.length - 1;
          $scope.tpTabSelected = last;
          // Need to create an appliance object in order to edit the field
          if($scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance.length === 0) {
            $scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance[0] =
            {
               appliance: {
                name: "",
                guid: ""
                },
                monthsInUse: 0,
                hoursWornPerDay: 0,
                monthsOfPassiveUse: 0
            };
          }
          //If the last treament has been submitted, the user can create a new treatement plan, otherwise, he/she can only edit the current plan
          if($scope.treatmentPlanningTabs[last].submited) {
            $scope.addNewTreatmentPlanTab = true;
            $scope.submitNTBtnTitle = 'Update Treatment Plan';
          }
          else {
            $scope.addNewTreatmentPlanTab = false;
            $scope.submitNTBtnTitle = 'Create Treatment Plan';
          }
          //User can edit the record date, but if it doesn't exist default to Date Created/Added
          // Possibly not needed here - only needed under addNewTreatmentPlanTab()
          angular.forEach($scope.treatmentPlanningTabs, function(tp) {
            if(!tp.recordDate) {
              tp.recordDate = tp.DateAdded;
            }
          })
          //User can only edit a treatment plan for up to 30 days after creation date/date added
          $scope.defineEditableTreatmentPlanning(last);
        }
      })
    }
  };

  $scope.showTPTabContent = function(tab, index) {
    $scope.tpTabSelected = index;
  };

  $scope.getTreatmentPlanning = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfileTreatmentPlanning&guid='+tab.guid).then(function(response)
     {console.log(response.data);})
  };

  $scope.setTreatmentPlanning = function(tab, toastContainer, index, submitted) {
    toastContainer = toastContainer+index;
    if(submitted) {
      tab.submited = submitted;
      var submittedVal = 1;
      $scope.toastMsg = 'Your Treatment Plan has been submitted.';
    }
    else {
      tab.submited = false;
      var submittedVal = 0;
      $scope.toastMsg = 'Your data has been saved!';
    }
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientProfileTreatmentPlanning&RequestBinary=true&submited='+submittedVal,
        method: 'POST',
        data: {
            jsonData: JSON.stringify(tab)
        },
        withCredentials: true
    }).then(function (response) {

            if(response.data.errors.length > 0) {
            }
            else {
              if(response.data.data.submited) {
                $scope.addNewTreatmentPlanTab = true;
                $scope.submitNTBtnTitle = 'Update Treatment Plan';
              }
              else {
                $scope.addNewTreatmentPlanTab = false;
                $scope.submitNTBtnTitle = 'Create Treatment Plan';
              }
              $mdToast.show({
              hideDelay   : false,
              position    : 'right',
              parent : $document[0].querySelector(toastContainer),
              scope:$scope,
              preserveScope:true,
              controller  : toastCtrl,
              template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="dismissToast()">Okay</button></md-toast>'
              });
             function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
               $scope.dismissToast = function() {
                 $mdToast.cancel()
               }
             }

            }
        });
  };

  $scope.addNewTreatmentPlanning = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteAddPatientProfileTreatmentPlanning&PatientId='+$scope.caseId).then(function(response)
     {
       if(response.errors.length > 0) {}
       else {
         var newTab = response.data;
         $scope.treatmentPlanningTabs.push(newTab);
         var noLongerEditable = $scope.treatmentPlanningTabs.length - 2;
         $scope.treatmentPlanningTabs[noLongerEditable].editable = false;
         var last =  $scope.treatmentPlanningTabs.indexOf(newTab);
         $scope.tpTabSelected = last;
         if($scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance.length === 0) {
           $scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance[0] =
           {
              appliance: {
               name: "",
               guid: ""
               },
               monthsInUse: 0,
               hoursWornPerDay: 0,
               monthsOfPassiveUse: 0
           };
         }
         //User can edit the record date, but if it doesn't exist default to Date Created/Added
         if(!$scope.treatmentPlanningTabs[last].recordDate) {
           $scope.treatmentPlanningTabs[last].recordDate = $scope.treatmentPlanningTabs[last].DateAdded;
         }
         $scope.defineEditableTreatmentPlanning(last);
         $scope.addNewTreatmentPlanTab = false;
         $scope.submitNTBtnTitle = 'Create Treatment Plan';
       }

     })
  };

  $scope.defineEditableTreatmentPlanning = function(last) {
    var lastTab = $scope.treatmentPlanningTabs[last];
    var today = new Date();
    var lastTabDateAdded = new Date(lastTab.DateAdded);
    var msPerDay = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(lastTabDateAdded.getFullYear(), lastTabDateAdded.getMonth(), lastTabDateAdded.getDate());
    var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    var daysDiff = Math.floor((utc2 - utc1) / msPerDay);

    if(daysDiff > 30) {
      console.log('greater than 30');
      $scope.treatmentPlanningTabs[last].editable = false;
      $scope.addNewTreatmentPlanTab = true;
    }
    else if(daysDiff <= 30) {
      console.log('less than 30');
      $scope.treatmentPlanningTabs[last].editable = true;
    }

  };

  $scope.calculateDiscrepancy = function(archAnalysis) {
      var a = archAnalysis.schwarzIndex;
      var b = a + 9;
      var c = b + 9;
      var b1 = a + 9;
      var c1 = b + 9;

      archAnalysis.upperFirstPremolars.discrepancy =  archAnalysis.upperFirstPremolars.measurement - b;
      archAnalysis.upperFirstMolars.discrepancy =  archAnalysis.upperFirstMolars.measurement - c;
      archAnalysis.lowerFirstPremolars.discrepancy =  archAnalysis.lowerFirstPremolars.measurement - b1;
      archAnalysis.lowerFirstMolars.discrepancy =  archAnalysis.lowerFirstMolars.measurement - c1;
  };

  // PATIENT RECORDS //************************/
  $scope.getPatientRecordTabs = function() {
    var patientId = $scope.caseId;
    $scope.resubmitClass = false;
    if($scope.patientRecordTabs) {}
    else {
      blockUI.start("Loading... ");
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfilePatientRecords&PatientId='+patientId).then(function(response) {
        if(response.errors.length > 0) {}
        else {
        blockUI.done(function() {});
        blockUI.stop();
        $scope.patientRecordTabs = response.data;
        var last = $scope.patientRecordTabs.length - 1;
        $scope.prTabSelected = last;
        $scope.prTabReportSelected = last;


        if($scope.navProv && $scope.patientDetails.status.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
          $scope.addNewPRTab = false;
          $scope.submitPRBtnTitle = 'Resubmit';
          $scope.resubmitClass = true;
        }
        else {
          //If the last treament has been submitted, the user can create a new treatement plan, otherwise, he/she can only edit the current plan
          if($scope.patientRecordTabs[last].submited) {
            $scope.addNewPRTab = true;
            $scope.submitPRBtnTitle = 'Update Patient Record';
          }
          else {
            $scope.addNewPRTab = false;
            $scope.submitPRBtnTitle = 'Submit Patient Record';
          }
        }


        //User can edit the record date, but if it doesn't exist default to Date Created/Added
        // Possibly not needed here - only needed under addNewPatientRecord()
        angular.forEach($scope.patientRecordTabs, function(pr) {
          if(!pr.recordDate) {
            pr.recordDate = pr.DateAdded;
          }
        })
        $scope.defineEditablePatientRecord(last);
        }
      })
    }
  };

  $scope.showPRTabContent = function(tab, index) {
    $scope.prTabSelected = index;
  };

  $scope.getPatientRecord = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientProfilePatientRecord&guid='+tab.guid).then(function(response)
     {console.log(response.data);})
  };

  function savePatientRecord(tab, toastContainer, index, submittedVal) {
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientProfilePatientRecord&RequestBinary=true&providerSubmitted='+submittedVal,
        method: 'POST',
        data: {
            jsonData: JSON.stringify(tab),
        },
        withCredentials: true
    }).then(function (response) {
            if(response.data.errors.length > 0) {
              console.log('errors');
            }
            else {
              function showSavedToast() {
                $mdToast.show({
                hideDelay   : false,
                position    : 'right',
                parent : $document[0].querySelector(toastContainer),
                scope:$scope,
                preserveScope:true,
                controller  : toastCtrl2,
                template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="dismissToast()">Okay</button></md-toast>'
                });
              function toastCtrl2($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
               $scope.dismissToast = function() {
                 $mdToast.cancel();
                 }
               }
              };

              if($scope.navProv && $scope.patientDetails.status.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
                // $scope.addNewPRTab = false;
                // $scope.submitPRBtnTitle = 'Resubmit';
                // $scope.resubmitClass = true;

                if(submittedVal === 1) {
                  $scope.addNewPRTab = true;
                  $scope.submitPRBtnTitle = 'Update Patient Record';
                  $scope.resubmitClass = false;
                  // $scope.resubmit($scope.patientDetails);
                  commonFnSrvc.getPatientProfile($scope, $scope.patientDetails.id);
                }
                else {
                  // showSavedToast();
                  $scope.addNewPRTab = false;
                  $scope.submitPRBtnTitle = 'Resubmit';
                  $scope.resubmitClass = true;
                }
              }
              else {
                  console.log(response.data.data.submited);
                if(response.data.data.submited) {

                  $scope.addNewPRTab = true;
                  $scope.submitPRBtnTitle = 'Update Patient Record';
                }
                else {
                  $scope.addNewPRTab = false;
                  $scope.submitPRBtnTitle = 'Submit Patient Record';
                }
                // showSavedToast();
              }

              showSavedToast();

            }

        });
  }


  $scope.setPatientRecord = function(tab, toastContainer, index, submitted) {
    toastContainer = toastContainer+index;
    if(submitted) {
      tab.submited = submitted;
      var submittedVal = 1;
      $scope.toastMsg = 'Your Patient Record has been submitted.';
    }
    else {
      tab.submited = false;
      var submittedVal = 0;
      $scope.toastMsg = 'Your data has been saved!';
    }

    savePatientRecord(tab, toastContainer, index, submittedVal);

    // if($scope.navProv && $scope.patientDetails.status.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
    //   if(submitted) {
    //     $scope.resubmitPatientRecord();
    //   }
    // }
    // else {
    //   savePatientRecord(tab, toastContainer, index, submittedVal);
    // }

  };

  $scope.addNewPatientRecord = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteAddPatientProfilePatientRecord&PatientId='+$scope.caseId).then(function(response) {
       if(response.errors.length > 0) {}
       else {
         var newTab = response.data;
         $scope.patientRecordTabs.push(newTab);
         var noLongerEditable = $scope.patientRecordTabs.length - 2;
         $scope.patientRecordTabs[noLongerEditable].editable = false;
         var last = $scope.patientRecordTabs.indexOf(newTab);
         $scope.prTabSelected = last;
         //User can edit the record date, but if it doesn't exist default to Date Created/Added
         if(!$scope.patientRecordTabs[last].recordDate) {
           $scope.patientRecordTabs[last].recordDate = $scope.patientRecordTabs[last].DateAdded;
         }
         $scope.defineEditablePatientRecord(last);
         $scope.addNewPRTab = false;
         $scope.submitPRBtnTitle = 'Submit Patient Record';
       }
     })
  };

  $scope.defineEditablePatientRecord = function(last) {
    $scope.patientRecordTabs[last].editable = true;
  };

  $scope.uploadPatientProfileRecordImage = function(prTab, file, field) {
    var tabIndex = $scope.patientRecordTabs.indexOf(prTab);
    console.log(tabIndex);
    Upload.upload({
       url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientRecordFile&RequestBinary=true',
       method: 'POST',
       data: {
           imageFilename: file,
           PatientRecordId: prTab.id,
           FieldName: field
       },
       withCredentials: true

    })
     .then(function (response) {
       console.log(response);
       console.log(prTab);
       prTab = response.data.data;
       // $scope.patientRecordTabs[tabIndex] = response.data.data;
       //hack to replace images with correct url
       $scope.patientRecordTabs[tabIndex].patientImages = response.data.data.patientImages;
       $scope.patientRecordTabs[tabIndex].patientOcclussions.digitalImpression = response.data.data.patientOcclussions.digitalImpression;
       $scope.patientRecordTabs[tabIndex].patientOcclussions.stoneModels = response.data.data.patientOcclussions.stoneModels;
       $scope.patientRecordTabs[tabIndex].miscellaneousDocuments = response.data.data.miscellaneousDocuments;
       $scope.patientRecordTabs[tabIndex].files = response.data.data.files;
       $scope.patientRecordTabs[tabIndex].faciometricPosturalImages = response.data.data.faciometricPosturalImages;
       $scope.patientRecordTabs[tabIndex].cbct = response.data.data.cbct;
       $scope.patientRecordTabs[tabIndex].patientHealthHistory.sleepTestInfo.sleepstudy = response.data.data.patientHealthHistory.sleepTestInfo.sleepstudy;
       $scope.patientRecordTabs[tabIndex].editable = true;
       console.log(prTab);
     });
  };

  $scope.deletePatientRecordFile = function(prTab, file, field, index) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteDeletePatientRecordFile&PatientRecordId='+prTab.id+'&FieldName='+field).then(function(response) {
      if(response.errors.length > 0) {
      }
      else {
        prTab = response.data; //doesn't work,I believe  Need below
        $scope.patientRecordTabs[index] = response.data;
        var last = $scope.patientRecordTabs.length - 1;
        $scope.defineEditablePatientRecord(last);
      }
    });
  };

  $scope.getTreatmentStages = function() {
    commonFnSrvc.getTreatmentStages($scope);
  };

  $scope.getTreatmentOptions = function() {
    commonFnSrvc.getTreatmentOptions($scope)
  };

  $scope.getAppliances = function() {
    commonFnSrvc.getAppliances($scope);
  };

  $scope.addNewTreatmentOption = function(applianceArray, tab) {
      $scope.showNAErrorMsg = false;
      var lastInArray = (applianceArray.length - 1);
      if(!applianceArray[lastInArray].appliance.name) {
          $scope.showNAErrorMsg = true;
          $scope.newApplianceErrorMsg = 'Please select an appliance before adding an new one.'
      }
      else if((applianceArray[lastInArray].appliance.guid === '{C9C9726A-F542-40B8-9674-DD48E2C7AB22}') && !applianceArray[lastInArray].appliance.other) {
              $scope.showNAErrorMsg = true;
              $scope.newApplianceErrorMsg = 'Please fill out a name for the appliance.'
      }
      else {
          var applianceOption = {
            appliance: {
              name: "",
              guid: ""
              },
              monthsInUse: 0,
              hoursWornPerDay: 0,
              monthsOfPassiveUse: 0
          };
          tab.estimatedTreatmentTime.appliance.push(applianceOption);
      }
  };

  $scope.checkIfApplianceIsSelected = function(appliance) {
      $scope.noApplianceSelected = false;
      $scope.showErrorMsg = false;
      if(appliance === null) {
          $scope.noApplianceSelected = true;
          $scope.showErrorMsg = true;
          $scope.errorMsg = 'Please select an appliance before adding an new one.'
      }
  };

  $scope.allowChanges = true; //temp for testing

  $scope.hoverIn = function(tooth, tab) {
    commonFnSrvc.hoverIn(tooth, $scope.allowChanges);
  };

  $scope.hoverOut = function(tooth, tab) {
    commonFnSrvc.hoverOut(tooth, $scope.allowChanges);
  };

  $scope.selectedModel = 1; //this is for teeth charting

  $scope.processZipFile = function(tab) {
    var urlSiteSetPatientRecordZipFile = function() {
      // tab.reportUrl = '';
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientRecordZipFile&PatientRecordId =' + tab.id).then(function (response) {
        console.log(response.data);
        tab = response.data;
        var fileUrl = tab.files.patientRecordReport;
        $window.open(fileUrl)
      });
    }
    authSrvc.getAuthenticationForClicks(urlSiteSetPatientRecordZipFile);
  };

  // PATIENT RECORDS - Airway Intelligence Reports **************************/
  $scope.showprTabReportContents = function(tab, index) {
    $scope.prTabReportSelected = index;
  };

  $scope.downloadReport = function(url) {
    var openReportLink = function() {
      $window.open(url);
    }
    authSrvc.getAuthenticationForClicks(openReportLink);
  };

  //********************** Change Status **********************/

  var statusChangeFunction = function() {
    var statusObject = $scope.statusObject;
    var patientDetails = $scope.patientDetails;
    if (statusObject.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
        $scope.needsMoreInfoModal(patientDetails, statusObject);
    }
    else {
        $scope.confirmStatusChangeModal(patientDetails, statusObject);
    }
  };
  $scope.changeStatus = function (patientDetails, statusObj) {
    $scope.isProvider = false;
    $scope.statusObject = statusObj;
    $scope.patientDetails = patientDetails;
    authSrvc.getAuthenticationForClicks(statusChangeFunction);
  };

  // Keep! - original if manually changing status only
  // $scope.resubmit = function(patientDetails) {
  //   alert('resubmit called');
  //   $scope.isProvider = true;
  //   $scope.statusObject = {
  //     guid: "{776ea8b3-00d8-4abf-9559-2e8c3c43bc81}",
  //     id: 2,
  //     name: "Technician Review"
  //   };
  //   $scope.patientDetails = patientDetails;
  //   authSrvc.getAuthenticationForClicks(statusChangeFunction);
  // };

  //********************** Resubmit **********************/
  $scope.resubmitPatientRecord = function() {

  };
  //**************************** MODALS ****************************/
  $scope.showArchivePatientModal = function(patientId) {
    ModalService.showModal({
      templateUrl: "/views/patientDetails/modals/archivePatient.html",
      controller: "archivePatientCtrl",
      preClose: (modal) => { modal.element.modal('hide'); },
      inputs: {
        patientId : patientId
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if(result) {
          $state.go('providerDash');
        }
      });
    });
  };

  $scope.showTransferPatientModal = function() {
    ModalService.showModal({
      templateUrl: "/views/patientDetails/modals/transferPatient.html",
      controller: "transferPatientCtrl"
    }).then(function(modal2) {
      modal2.element.modal();
      modal2.close.then(function(result) {
        console.log('modal closed');
      });
    });
  };

  $scope.confirmStatusChangeModal = function(patientDetails, statusObject) {
    console.log($scope.isProvider);
    ModalService.showModal({
        templateUrl: '/views/modals/admin/confirmStatusChange.html',
        controller: 'confirmStatusChangeModalCtrl',
        preClose: (modal) => { modal.element.modal('hide'); },
        inputs: {
          patientDetails : patientDetails,
          statusObject : statusObject,
          isProvider : $scope.isProvider
        }
    })
      .then(function (modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            console.log('result', result);
            $scope.statusObj.status = result;
            $scope.patientDetails.status = result;
          });
      });
  };

  $scope.needsMoreInfoModal = function(patientDetails, statusObject) {
    ModalService.showModal({
        templateUrl: '/views/modals/admin/needMoreInfo.html',
        controller: 'needMoreInfoModalCtrl',
        preClose: (modal) => { modal.element.modal('hide'); },
        inputs: {
          patientDetails : patientDetails,
          statusObject : statusObject
        }
    })
      .then(function (modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            $scope.statusObj.status = result;
            $scope.patientDetails.status = result;
            $scope.resubmitClass = false;
          });
      });
  };


}); //End of Controller
