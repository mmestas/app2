app.controller('createRxCtrl', function ($rootScope, $scope, $state, $stateParams, $location, $window, apiSrvc, authSrvc, commonFnSrvc,  NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, $mdToast, $document) {

  $scope.createRxInit = function() {
    var url = $location.path().split('/');
    var caseId = url[2];
    var tileId = url[3];
    var prescriptionGuid = url[4];
    var prescriptions = url[5];
    $scope.caseId = caseId;
    $scope.tileId = tileId;
    $scope.prescriptionGuid = prescriptionGuid;
    $scope.prescriptions = prescriptions;
    $scope.getPatientPrescriptionDetails(prescriptionGuid);
    $scope.getGuides();
  };

  //********* SAVING PATIENT DATA *************/
  $scope.submitFunction = function(prescription, newCasefile) {
    var finalSubmit = true;
    $scope.checkIndividualSections(prescription, newCasefile, finalSubmit);
  };

  $scope.saveAndCreatePrescription = function(prescription, newCasefile) {
    if($scope.allowChanges) {
      prescription.teethCharting = newCasefile.teethCharting;
    }
    var setPatient = function() {
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientPrescription&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(prescription),
              prescription: 1
          },
          withCredentials: true
      }).then(function (response) {
            // JC 7/11/2017
            blockUI.start("Saving ... ");
            $timeout(function () {
                blockUI.stop();
            }, 2000);

            $mdToast.show({
            hideDelay   : false,
            position    : 'top',
            parent : $document[0].querySelector('#toastHolder'),
            scope:$scope,
            preserveScope:true,
            controller  : toastCtrl,
            template :  '<md-toast class="md-success-toast-theme"><div class="md-toast-text flex">Your Rx is submitted and is "in Design." When fabrication begins, you will receive an invoice and the Rx status will update to, "In Fabrication".</div>  &nbsp; <button class="mr-10 btn teal" ng-click="goToPatientProfile()">Okay</button></md-toast>'
            });
           function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
           }

        });
    }
    authSrvc.getAuthenticationForClicks(setPatient);
  };

  $scope.goToPatientProfile = function() {
    $mdToast.cancel();
    $state.go('patientProfile', {id: $scope.caseId, selectedTile: $scope.tileId});
  };

  $scope.savePatientPrescriptionDetails = function(patientPrescriptionDetails, newCasefile, externalLink) {
    $scope.showErrorMsg = false;
    $scope.showErrorMsgModelSrc = false;

    if($scope.allowChanges) {
      patientPrescriptionDetails.teethCharting = newCasefile.teethCharting;
    };
    var setPatientPrescription = function() {
      $scope.formUpload = true;
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientPrescription&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(patientPrescriptionDetails),
          },
          withCredentials: true
      })
        .then(function (response) {
          if(response.data.errors.length > 0) {

          }
          else {
            $scope.patientPrescriptionDetails = response.data.data;
            $scope.newCasefile = angular.copy(response.data.data);
              $scope.checkIndividualSections($scope.patientPrescriptionDetails, $scope.newCasefile);
              blockUI.start("Saving ... ");
              $timeout(function () {
                  blockUI.stop();
              }, 2000);

              if(externalLink) {
                $scope.externalLink = externalLink;
                // $window.location.href = externalLink;
                // $window.open(externalLink, '_blank');
              }
              if(
                (($scope.patientPrescriptionDetails.labs.mailInConstructionBite || $scope.patientPrescriptionDetails.photos.studymodels.constructedBite3Dimpression)  && !$scope.patientPrescriptionDetails.studyModels.constructionBite.guid)

              ) {
                $scope.showErrorMsgModelSrc = true;
                $scope.errorMsg = 'Please select the Construction Bite Type to continue.';
              }
          }

        });
    };

    authSrvc.getAuthenticationForClicks(setPatientPrescription);



  };

  $scope.uploadFiles = function (file, field) {
    if($scope.allowChanges) {
      Upload.upload({
        url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFile&RequestBinary=true',
         method: 'POST',
         data: {
             imageFilename: file,
             PatientId: $scope.caseId,
             FieldName: field,
         },
         withCredentials: true
      })
       .then(function (response) {
         Upload.upload({
            url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientPrescriptionFile&RequestBinary=true',
            method: 'POST',
            data: {
                imageFilename: file,
                FieldName: field,
                PatientPrescriptionGuid: $scope.patientPrescriptionDetails.guid
            },
            withCredentials: true
         })
          .then(function (response) {
             $scope.patientPrescriptionDetailsImages = response.data.data;
             // if($scope.patientPrescriptionDetailsImages.photos.studymodels.constructedBite3Dimpression ||
             // $scope.patientPrescriptionDetailsImages.studyModels.constructionBite.id !== 0) {
             //   $scope.constBite.selected = true;
             // }
          });
       });
    }


  };

  $scope.saveAndReturn = function(patientPrescriptionDetails, newCasefile) {
    $scope.savePatientPrescriptionDetails(patientPrescriptionDetails, newCasefile);
    $state.go('patientProfile', {id: $scope.caseId, selectedTile: $scope.tileId});
  };

  $scope.goToVasLink = function(patientPrescriptionDetails, newCasefile) {
    if(patientPrescriptionDetails.labs.speakTourlSiteApplianceSpecialist && patientPrescriptionDetails.labs.applianceSpecialist) {
      var externalLink = patientPrescriptionDetails.labs.applianceSpecialist.scheduleURL;
      $scope.savePatientPrescriptionDetails(patientPrescriptionDetails, newCasefile, externalLink);
    }
  };

  //******************************** Check if Section is Complete *****************************/
  $scope.checkIndividualSections = function (prescription, newCasefile, finalSubmit) {
    $scope.allSectionsComplete = false;

    //Lab Selection
    $scope.labSectionComplete = false;
    if(prescription.labs.lab && prescription.labs.productionTime) {
      $scope.labSectionComplete = true;
      document.getElementById("labSelection").classList.remove("errorField");
    };

    //Teeth Charting Section
    var teeth = newCasefile.teethCharting;
    $scope.atLeastOneToothSelectedInDiagram = false;
    // $scope.teethChartedSectionComplete = false;
    $scope.teethChartedSectionComplete = true; //Todd wants this true no matter what
    for (var i in teeth.bridge) {
        if (teeth.bridge[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };
    for (var i in teeth.crown) {
        if (teeth.crown[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };
    for (var i in teeth.decidious) {
        if (teeth.decidious[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };
    for (var i in teeth.impacted) {
        if (teeth.impacted[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };
    for (var i in teeth.implants) {
        if (teeth.implants[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };
    for (var i in teeth.missingTeeth) {
        if (teeth.missingTeeth[i] === true) {
          $scope.atLeastOneToothSelectedInDiagram = true;
        };
    };

    // (us.base) &&
    // (us.clasps.adams.length > 0) &&
    // (us.clasps.ball.length > 0) &&
    // (us.clasps.c.length > 0) &&
    // (us.clasps.arrow.length > 0) &&
    // (us.stops.mesidal.length > 0) &&
    // (us.stops.distal.length > 0) &&
    // (us.stops.occusal.length > 0) &&
    // (us.screw) &&
    // (us.elasticHooks) &&
    // (us.bow) &&
    // (us.occusalAcrylicCoverage.length > 0) &&
    // (us.axialSprings.length > 0) &&
    // (us.eruptionFriendly.length > 0) &&
    // (us.cLoops.length > 0) &&
    // (us.osaExtension) &&
    // (us.osaExtensionLength > 0) &&
    // (us.headGear) &&
    // (us.additionalComments) &&
    // (us.diagram)

    //Appliance Construction Section
    $scope.applianceSystemComplete = false;
    if(prescription.healthHistory.sleepTestInfo.treatmentStage > 0) {
      var us = prescription.applianceSystem.upperSystem;
      var ls = prescription.applianceSystem.lowerSystem;
      if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{9303A641-E32C-43DF-9F18-03C551FD99F3}') {
        $scope.guideSystemSelected = false;
        //DNA Upper
          if(
          (us.base) &&
          (us.screw) &&
          (us.bow)
        ) {$scope.applianceSystemComplete = true;}
      }
      if((prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{AEC9E99B-1D7E-4466-A4DC-744162A005AB}') || (prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{476D52E7-4783-4D40-8BA6-E00471F7B13B}')) {
        $scope.guideSystemSelected = false;
        //Upper Lower / RNA
        if(
          (us.base) &&
          (us.screw) &&
          (us.bow) &&
          (ls.base) &&
          (ls.bow)
        ) {$scope.applianceSystemComplete = true; document.getElementById("applianceConstruction").classList.remove("errorField");}
      }
      if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{17854ec2-83be-4967-9442-edd568aad472}') {
        $scope.guideSystemSelected = false;
        //DNA Lower
        if(
          (ls.base) &&
          (ls.bow)
        ) {$scope.applianceSystemComplete = true; document.getElementById("applianceConstruction").classList.remove("errorField");}
      }
      if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
        $scope.guideSystemSelected = true;
        //Guide System
        if(prescription.applianceSystem.urlSiteGuides.length > 0) {
          angular.forEach(prescription.applianceSystem.urlSiteGuides, function(guide) {
            if(guide.invoiced === false) {
              $scope.applianceSystemComplete = true; //Only allows this section to be completed if there are NEW appliances
              document.getElementById("applianceConstruction").classList.remove("errorField");
            }
          })
          if(!$scope.applianceSystemComplete) {
            $scope.needToSelectGuide = true;
          }
        }
      }
    };

    //Model Source Section
    $scope.modelSourceComplete = false;
    var sm = prescription.studyModels;
    var smp = prescription.photos.studymodels;


    if(prescription.labs.mailInStoneModels) {
      if($scope.patientPrescriptionDetails.labs.mailInConstructionBite) {
        if(sm.constructionBite.id === 0) {
          $scope.modelSourceComplete = false;
        }
        else {
          $scope.modelSourceComplete = true;
        }
      }
      else {
          $scope.modelSourceComplete = true;
      }
    }

    if(prescription.labs.uploadStoneModels) {
      if(smp.impression3D && smp.lowerArch3Dimpression) {
        if(smp.constructedBite3Dimpression) {
          if(sm.constructionBite.id === 0) {
            $scope.modelSourceComplete = false;
          }
          else {
            $scope.modelSourceComplete = true;
          }
        }
        if(smp.naturalBite3Dimpression) {
          if($scope.patientPrescriptionDetails.labs.mailInConstructionBite) {
            if(sm.constructionBite.id === 0) {
              $scope.modelSourceComplete = false;
            }
            else {
              $scope.modelSourceComplete = true;
            }
          }
          else {
            $scope.modelSourceComplete = true;
          }

        }
      }
    }

    if($scope.guideSystemSelected) {
      //this allows if the urlSite guide system is selected, (b/c the model source section will not show up), the model source will still be counted as completed for submitting purposes
      $scope.modelSourceComplete = true;
    }

    //Final Review section
    $scope.finalReviewSectionComplete = false;
    $scope.speakToVAS = false;
    var fr = prescription.labs;

    if(fr.shippingMethod) {
      if(fr.shipToAddress.guid) {
        if(fr.speakTourlSiteApplianceSpecialist) {
          $scope.speakToVAS = true;
          if(fr.applianceSpecialist.id > 0) {$scope.finalReviewSectionComplete = true; document.getElementById("finalReview").classList.remove("errorField");}
        }
        else {
          $scope.finalReviewSectionComplete = true; document.getElementById("finalReview").classList.remove("errorField");
        }
      }
    }
     // && $scope.teethChartedSectionComplete - someone may have perfect teeth in which case, they won't have anything marked here
    if($scope.labSectionComplete && $scope.applianceSystemComplete && $scope.modelSourceComplete && $scope.finalReviewSectionComplete) {
      $scope.allSectionsComplete = true;
    }

    if(finalSubmit) {
      $scope.prescription = prescription;
      $scope.newCasefile = newCasefile;
      $scope.dismissToast = function() {$mdToast.cancel()}
      $scope.toastErrorMsg = '';
      var errorToast = {
        hideDelay   : false,
        position    : 'top',
        parent : $document[0].querySelector('#toastHolder'),
        scope:$scope,
        preserveScope:true,
        controller  : toastCtrl,
        template :  '<md-toast class="md-warning-toast-theme" style="padding: 5px 10px;"><div class="md-toast-text flex">{{toastErrorMsg}}</div><div class="ml-10 mr-10"><div ng-repeat="section in incompleteSections" style="color:#ffa400;">{{section}}</div></div>&nbsp; <button class="btn" ng-click="dismissToast()">Okay</button></md-toast>'
      }

      if($scope.allSectionsComplete) {
        if($scope.finalReviewSectionComplete) {
          if(!$scope.speakToVAS) {
            if(!$scope.atLeastOneToothSelectedInDiagram) {
              $scope.dismissToast = function() {
                $mdToast.cancel()
              }
              $mdToast.show({
              hideDelay   : false,
              position    : 'top',
              parent : $document[0].querySelector('#toastHolder'),
              scope:$scope,
              preserveScope:true,
              controller  : toastCtrl,
              template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">You have not made any selections in Teeth Charting.  Continue?</div>  &nbsp; <button class="mr-10 btn teal" ng-click="saveAndCreatePrescription(prescription, newCasefile)">Yes</button> <button class="btn" ng-click="dismissToast()">No</button></md-toast>'
              });
             function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
             }
            }
            else {
              $scope.saveAndCreatePrescription(prescription, newCasefile);
            }
          }
          else {
            $scope.scheduleAppt = function(prescription, newCasefile) {
              var externalLink = prescription.labs.applianceSpecialist.scheduleURL;
              var newWindow = window.open(externalLink, '_blank');
              $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink);
              newWindow.location = externalLink;
              $mdToast.cancel();
            }
            $mdToast.show({
            hideDelay   : false,
            position    : 'top',
            parent : $document[0].querySelector('#toastHolder'),
            scope:$scope,
            preserveScope:true,
            controller  : toastCtrl,
            template :  '<md-toast class="md-warning-toast-theme width_100"><div class="md-toast-text flex">You have selected to speak with a urlSite Appliance Design Specialist. In order to submit the prescription, please confirm you have made an appointment via their link, or click on “Schedule Appointment” to make one now.</div>   <button class="btn mr-5" ng-click="dismissToast()">Cancel</button> <button class="btn mr-5 orange" ng-click="saveAndCreatePrescription(prescription, newCasefile)">Confirm</button><button class="btn green" ng-click="scheduleAppt(prescription, newCasefile)" target="_blank" data-ng-href="{{prescription.labs.applianceSpecialist.scheduleURL}}"><i class="fa fa-calendar"></i> Schedule Appointment</button></md-toast>'
            });
           function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
           }
          }
        }
        else {
          if($scope.speakToVAS) {
            if(prescription.labs.applianceSpecialist.id === 0) {
              $mdToast.show({
                hideDelay   : false,
                position    : 'top',
                parent : $document[0].querySelector('#toastHolder'),
                scope:$scope,
                preserveScope:true,
                controller  : toastCtrl,
                template :  '<md-toast class="md-warning-toast-theme width_100"><div class="md-toast-text flex">You have selected to speak with a urlSite Appliance Design Specialist but have not selected a design specialist or made an appointment. In order to submit the prescription, please select a urlSite Design Specialist from the dropdown and make an appointment.</div> <button class="btn mr-5" ng-click="dismissToast()">Okay</button></md-toast>'
              });
              function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
              }
            }
            else {
              $scope.scheduleAppt = function(prescription, newCasefile) {
                var externalLink = prescription.labs.applianceSpecialist.scheduleURL;
                var newWindow = window.open(externalLink, '_blank');
                $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink);
                newWindow.location = externalLink;
                $mdToast.cancel();
              }
              $mdToast.show({
              hideDelay   : false,
              position    : 'top',
              parent : $document[0].querySelector('#toastHolder'),
              scope:$scope,
              preserveScope:true,
              controller  : toastCtrl,
              template :  '<md-toast class="md-warning-toast-theme width_100"><div class="md-toast-text flex">You have selected to speak with a urlSite Appliance Design Specialist. In order to submit the prescription, please confirm you have made an appointment via their link, or click on “Schedule Appointment” to make one now.</div>   <button class="btn mr-5" ng-click="dismissToast()">Cancel</button> <button class="btn mr-5 orange" ng-click="saveAndCreatePrescription(prescription, newCasefile)">Confirm</button><button class="btn green" ng-click="scheduleAppt(prescription, newCasefile)" target="_blank" data-ng-href="{{prescription.labs.applianceSpecialist.scheduleURL}}"><i class="fa fa-calendar"></i> Schedule Appointment</button></md-toast>'
              });
             function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
             }
            }

          }
          else {
            $scope.toastErrorMsg = 'Please make sure the shipping info is completed';
            $mdToast.show(errorToast);
          }

        }
      }
      else {
        if($scope.needToSelectGuide) {
          $scope.toastErrorMsg = 'Please select a urlSite Guide in Appliance Construction and Save Changes, to resubmit';
          $mdToast.show(errorToast);
        }
        else {
          $scope.incompleteSections = [];
          document.getElementById("labSelection").classList.remove("errorField");
          document.getElementById("applianceConstruction").classList.remove("errorField");
          document.getElementById("modelSrc").classList.remove("errorField");

          if(!$scope.labSectionComplete) {
            $scope.incompleteSections.push('Lab Selection');
            var element = document.getElementById("labSelection");
            element.classList.add("errorField");
          }
          if(!$scope.applianceSystemComplete) {
            $scope.incompleteSections.push('Appliance Construction');
            var element = document.getElementById("applianceConstruction");
            element.classList.add("errorField");

          }
          if(!$scope.modelSourceComplete) {
            $scope.incompleteSections.push('Model Source');
            var element = document.getElementById("modelSrc");
            element.classList.add("errorField");
          }
          if(!$scope.finalReviewSectionComplete) {
            $scope.incompleteSections.push('Final Review');
            var element = document.getElementById("finalReview");
            element.classList.add("errorField");
          }
          $scope.toastErrorMsg = 'We’re sorry, we are unable to create this Rx because the following fields need to be indicated or filled out before submitting:';
          $mdToast.show(errorToast);

          $scope.savePatientPrescriptionDetails(prescription, newCasefile);
        }

      }

    }

  };

  //********* GET FUNCTIONS *************/
  $scope.getPatientPrescriptionDetails = function(prescriptionGuid) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientPrescriptionDetails&patientPrescriptionGuid=' + prescriptionGuid).then(function (response) {
      var birthdate = response.data.patient.patientDOB;
      $scope.patientPrescriptionDetails = response.data;
      $scope.newCasefile = angular.copy(response.data);
      $scope.patientPrescriptionDetailsImages = angular.copy(response.data);
      $scope.checkIndividualSections($scope.newCasefile, $scope.newCasefile);
      commonFnSrvc.getAge($scope, birthdate);

      $scope.allowChanges = false;
      $scope.allowSave = false;
      if($scope.patientPrescriptionDetails.prescriptionId) {
        $scope.allowSave = false;

        // No longer needed - users will only be able to view Rx once submitted
        // if($scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
        //   if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.length < 4) {
        //     //patient has a prescription, but still can get more urlSite Guides
        //     $scope.allowSave = true;
        //   }
        //   if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides[3]) {
        //     if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides[3].invoiced === false) {
        //       $scope.allowSave = true;
        //     }
        //   }
        // }
        if($scope.patientPrescriptionDetails.status.guid === '{3D36742C-55DC-47D3-A742-65338BBF8FE5}') {
          // In design review status
          // provider can change guides until status is in fabrication
          $scope.allowSave = true;
        }

      }
      else {
        $scope.allowChanges = true;
        $scope.allowSave = true;
      }

      if(!$scope.patientPrescriptionDetails.labs.mailInStoneModels && !$scope.patientPrescriptionDetails.labs.uploadStoneModels) {
        if(
          $scope.patientPrescriptionDetails.photos.studymodels.constructedBite3Dimpression ||
          $scope.patientPrescriptionDetails.photos.studymodels.impression3D ||
          $scope.patientPrescriptionDetails.photos.studymodels.lowerArch3Dimpression ||
          $scope.patientPrescriptionDetails.photos.studymodels.naturalBite3Dimpression ||
          $scope.patientPrescriptionDetails.photos.studymodels.upperArch3Dimpression
        ) {
          $scope.patientPrescriptionDetails.labs.uploadStoneModels = true;
        }
        else {
          $scope.patientPrescriptionDetails.labs.mailInStoneModels = true;
        }
      }

      if($scope.patientPrescriptionDetails.prescriptionNumber === 0) {
        if($scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage === 0) {
          if($scope.prescriptions > 0) {
              $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = 2;
          }
          else {
            $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = 1;
          }
        }
      }

    });
  };

  $scope.getAge = function(birthdate) {
    commonFnSrvc.getAge($scope, birthdate);
  };

  $scope.getLabs = function() {
    if(!$scope.labSelections) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetLabSelections').then(function (response) {
        $scope.labSelections = response.data;
      });
    }
  };

  $scope.productionTime = [
      {id: 0, name: "Please Select"},
      {id: 1, name: "Standard"},
      {id: 2, name: "Rush"}
  ];

  $scope.getApplianceData = function() {
    commonFnSrvc.getAppliances($scope);
    commonFnSrvc.getTreatmentStages($scope);
  };

  $scope.getConstructionBites = function() {
    commonFnSrvc.getContructionBite($scope);
  };

  $scope.getShippingMethods = function() {
    commonFnSrvc.geturlSiteShippingMethods($scope);
  };

  $scope.getApplianceSpecialists = function() {
      commonFnSrvc.geturlSiteApplianceSpecialists($scope);

  };

  $scope.getGuides = function() {
    commonFnSrvc.geturlSiteGuides($scope);
  };

  $scope.getShippingAddress = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetShippingAddresses').then(function (response) {
        $scope.shippingAddresses = response.data;
        var other = {
          id: 0,
          guid: "",
          isPrimary: false,
          firstName: "",
          lastName: "",
          company: "",
          addressLine1: "Add New",
          addressLine2: "",
          city: "",
          zipPostalCode: "",
          stateProvince: "",
          country: ""
        }
        $scope.shippingAddresses.push(other);

        if(!$scope.patientPrescriptionDetails.labs.shipToAddress.guid) {
          // If a shipping address has not been selected
          angular.forEach($scope.shippingAddresses, function(address) {
            if(address.lastUsed) {
              // Default to the last used
                $scope.patientPrescriptionDetails.labs.shipToAddress = address;
            }
            else {
              if(address.isPrimary) {
                // If there isn't a last used, default to primary
                $scope.patientPrescriptionDetails.labs.shipToAddress = address;
              }
            }
          })
        }


    });
  };

  //************* Teeth Charting ************/
  $scope.allDiagram = true;

  $scope.selectModel = function(num) {
    $scope.missingTeethDiagram = false;
    $scope.bridgeDiagram = false;
    $scope.crownDiagram = false;
    $scope.implantsDiagram = false;
    $scope.impactedDiagram = false;
    $scope.deciduousDiagram = false;
    $scope.allDiagram = false;

    if(num === 1) {
      $scope.missingTeethDiagram = true;
    }
    if(num === 2) {
      $scope.bridgeDiagram = true;
    }
    else if(num === 3) {
      $scope.crownDiagram = true;
    }
    else if(num === 4) {
      $scope.implantsDiagram = true;
    }
    else if(num === 5) {
      $scope.impactedDiagram = true;
    }
    else if(num === 6) {
      $scope.deciduousDiagram = true;
    }
    else if(num === 7) {
      $scope.allDiagram = true;
    }
  };

  //**************************/
  $scope.checkLab = function(labs) {
    console.log(labs);
    if(labs.lab.guid === '{cfe70a68-ca83-4020-b9e6-0b622d74e309}') {
      $scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
        guid: "{5db38949-748f-4c89-942a-86f946945f2c}",
        id: 5,
        name: "urlSite Guide System"
      };
    }
    else {
      $scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
        guid: "",
        id: null,
        name: ""
      }
    }


    labs.productionTime = 0;
    $scope.disableProductionTimeSelection = false;
    if(labs.lab && (!labs.lab.allowRush)) {
      labs.productionTime = 1;
      $scope.disableProductionTimeSelection = true;
    }
    else {
      labs.productionTime = 1;
    }



  };

  $scope.showModelSource = false;

  //This will splice the urlSite guides from the already selected guides
  $scope.removeSelectedurlSiteGuides = function() {
    // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
    // angular.forEach($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides, function(selectedGuide) {
    //   angular.forEach($scope.urlSiteGuides, function(urlSiteGuide, index) {
    //     if(selectedGuide.id === urlSiteGuide.id) {
    //       $scope.urlSiteGuides.splice(index, 1);
    //     }
    //   });
    // });
  };

  $scope.guideSelect = {};

  $scope.selectGuid = function(selectedGuide) {
    // if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.length === 4) {
    //   $scope.showErrorMsg = true;
    //   $scope.errorMsg = 'You have reached the maximum number of guides';
    // }

    if(selectedGuide) {
      //New - hack for changes (originally done on save and return)
      selectedGuide.invoiced = false;

      $scope.showErrorMsg = true;
      $scope.errorMsg = '';
      // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
      if(!$scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides) {
        $scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides = [];
      }
      if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.length < 4) {
        // uncommented 4.12.19
        // if($scope.needToSelectGuide = true) {
        //   $scope.needToSelectGuide = false;
        // }


       $scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.push(selectedGuide);
       // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
       // angular.forEach($scope.urlSiteGuides, function(urlSiteGuide, index) {
       //   if(selectedGuide.id === urlSiteGuide.id) {
       //     $scope.urlSiteGuides.splice(index, 1);
       //   }
       // });
       if($scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.length === 4) {
         $scope.showErrorMsg = true;
         $scope.errorMsg = 'You have reached the maximum number of guides';
       }
      }
      else {
       $scope.showErrorMsg = true;
       $scope.errorMsg = 'You have reached the maximum number of guides';
      }
    }

  };

  $scope.addSize = function(size, selectedGuide) {
    selectedGuide.size = size;
  };

  $scope.removeGuide = function(selectedGuide, index) {
    $scope.urlSiteGuides.push(selectedGuide);
    $scope.patientPrescriptionDetails.applianceSystem.urlSiteGuides.splice(index, 1);
    $scope.showErrorMsg = true;
    $scope.errorMsg = '';
  };

  $scope.addNewShipping = function(address) {
    if(address && (address.id === 0)) {
      var emptyAddress = address;
      ModalService.showModal({
            templateUrl: 'views/createRx/addNewAddressModal.html',
            controller: 'addNewShippingModalCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              addressFields: emptyAddress,
              shippingAddresses: $scope.shippingAddresses
            }
        })
          .then(function (modal) {
              var newAddress = {
                id: 0,
                guid: "",
                isPrimary: false,
                firstName: "",
                lastName: "",
                company: "",
                addressLine1: "Add New",
                addressLine2: "",
                city: "",
                zipPostalCode: "",
                stateProvince: "",
                country: ""
              };
              modal.element.modal();
              modal.close.then(function(result) {
                var last = result.length - 1;
                if(result[last].addressLine1 === 'Add New') {
                  //Ensures that this will throw an error if submitted
                  $scope.patientPrescriptionDetails.labs.shippingMethod = null;
                  address.id = '';
                  address.guid = '';
                }
                else {
                  //Sets the ng-model to the newly created address
                  $scope.patientPrescriptionDetails.labs.shippingMethod = result[last];
                  address.id = result[last].id;
                  address.guid = result[last].guid;
                  //
                  $scope.shippingAddresses = result;
                   $scope.shippingAddresses.push(newAddress);
                }
              });
          });
    }
  }

  //******************************** MODALS *****************************/
  //Teeth Selection Modals
  $scope.openTeethSelectionModal = function (num) {
    if($scope.allowChanges) {
      var onlyBetween = false;
      var applianceSystem = $scope.patientPrescriptionDetails.applianceSystem.upperSystem;
      if(num === 1) {var selectedModel = applianceSystem.clasps.adams;}
      if(num === 2) {var selectedModel = applianceSystem.clasps.ball; onlyBetween = true;}
      if(num === 3) {var selectedModel = applianceSystem.clasps.c; }
      if(num === 4) {var selectedModel = applianceSystem.clasps.arrow; onlyBetween = true;}
      if(num === 5) {var selectedModel = applianceSystem.stops.mesidal;}
      if(num === 6) {var selectedModel = applianceSystem.stops.distal;}
      if(num === 7) {var selectedModel = applianceSystem.stops.occusal;}
      if(num === 8) {var selectedModel = applianceSystem.occusalAcrylicCoverage;}
      if(num === 9) {var selectedModel = applianceSystem.axialSprings;}
      if(num === 10) {var selectedModel = applianceSystem.eruptionFriendly;}
      if(num === 11) {var selectedModel = applianceSystem.cLoops;}
      if(num === 12) {var selectedModel = applianceSystem.ySplitCutsDistal;}
      if(num === 13) {var selectedModel = applianceSystem.cruciformCutsDistal;}
      ModalService.showModal({
            templateUrl: 'views/createRx/teethSelectionModal.html',
            controller: 'teethSelectionCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              editSelectedModel: selectedModel,
              applianceSystem: applianceSystem,
              num: num,
              onlyBetween: onlyBetween,
              showUpper: true,
              showLower: false
            }
        })
          .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                if(num === 1) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.adams = result;}
                if(num === 2) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.ball = result;}
                if(num === 3) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.c = result;}
                if(num === 4) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.arrow = result;}
                if(num === 5) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.mesidal = result;}
                if(num === 6) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.distal = result;}
                if(num === 7) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.occusal = result;}
                if(num === 8) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.occusalAcrylicCoverage = result;}
                if(num === 9) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.axialSprings = result;}
                if(num === 10) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.eruptionFriendly = result;}
                if(num === 11) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.cLoops = result;}
                if(num === 12) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.ySplitCutsDistal = result;}
                if(num === 13) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.cruciformCutsDistal = result;}
              });

          });
    }
  };

  $scope.openLowerArchTeethSelectionModal = function (num) {
    if($scope.allowChanges) {
      var onlyBetween = false;
      var applianceSystem = $scope.patientPrescriptionDetails.applianceSystem.lowerSystem;
      if(num === 1) {var selectedModel = applianceSystem.clasps.adams;}
      if(num === 2) {var selectedModel = applianceSystem.clasps.ball; onlyBetween = true;}
      if(num === 3) {var selectedModel = applianceSystem.clasps.c; }
      if(num === 4) {var selectedModel = applianceSystem.clasps.arrow; onlyBetween = true;}
      if(num === 5) {var selectedModel = applianceSystem.stops.mesidal;}
      if(num === 6) {var selectedModel = applianceSystem.stops.distal;}
      if(num === 7) {var selectedModel = applianceSystem.stops.occusal;}
      if(num === 8) {var selectedModel = applianceSystem.occusalAcrylicCoverage;}
      if(num === 9) {var selectedModel = applianceSystem.axialSprings;}
      if(num === 10) {var selectedModel = applianceSystem.eruptionFriendly;}
      if(num === 11) {var selectedModel = applianceSystem.cLoops;}
      ModalService.showModal({
            templateUrl: 'views/createRx/teethSelectionModal.html',
            controller: 'teethSelectionCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              editSelectedModel: selectedModel,
              applianceSystem: applianceSystem,
              num: num,
              onlyBetween: onlyBetween,
              showUpper: false,
              showLower: true
            }
        })
          .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                if(num === 1) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.adams = result;}
                if(num === 2) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.ball = result;}
                if(num === 3) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.c = result;}
                if(num === 4) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.arrow = result;}
                if(num === 5) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.mesidal = result;}
                if(num === 6) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.distal = result;}
                if(num === 7) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.occusal = result;}
                if(num === 8) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.occusalAcrylicCoverage = result;}
                if(num === 9) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.axialSprings = result;}
                if(num === 10) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.eruptionFriendly = result;}
                if(num === 11) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.cLoops = result;}
              });
          });
    }

  };

  //TEETH SELECTION - duplicate from new-case-steps/index.js
  $scope.hoverIn = function(tooth) {
    if($scope.allowChanges) {
      angular.element('#'+tooth).addClass('highlightMatch');
    }
  };
  $scope.hoverOut = function(tooth) {
    if($scope.allowChanges) {
      angular.element('#'+tooth).removeClass('highlightMatch');
    }
  };


  // $scope.generateBarcode = function() {
  //   // JsBarcode("#barcode", newCasefile.id);
  //   var divDOM = document.getElementById("barcode");
  //   var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  //   // svg.setAttribute('jsbarcode-format', 'ean13')
  //   svg.setAttribute('jsbarcode-value', newCasefile.casenumber)
  //   svg.className.baseVal = "barcode";
  //   divDOM.appendChild(svg);
  //
  //   console.log(document.querySelector('.barcode'));
  //   JsBarcode(".barcode").init();
  // }

}); //End of Controller
