app.controller('newCaseCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService) {

    $scope.newStepsInit = function() {
        var url = $location.path().split('/');
        var caseId = url[4];
        $rootScope.caseLinkId = caseId;
        $scope.getPendingCaseDetails(caseId);
        $scope.selectedTile = $stateParams.selectedTile;
        if($scope.selectedTile === '') {
           $scope.selectedTile = 1;
        }
    };
    $scope.step1Init = function() {
        $rootScope.currentState = 1;
        $scope.getEthnicity();
    };
    $scope.step2Init = function() {
        $rootScope.currentState = 2;
        $scope.showSleepTestInfo = true;
        $scope.showOHHI = true;
        $scope.getTreatmentStages();
        $scope.getMallampati();
    };
    $scope.step3Init = function() {
        $rootScope.currentState = 3;
    };
    $scope.step4Init = function() {
        $rootScope.currentState = 4;
    };
    $scope.step5Init = function() {
        $rootScope.currentState = 5;
        $scope.show2DImages = true;
        // $rootScope.uploadCBCTScanDone = false;
    };
    $scope.step6Init = function() {
        $rootScope.currentState = 6;
        $scope.getCBCTInfo();
        $scope.getClasses();
        $scope.show3DUploads = true;
        $scope.show2DStoneModels = false;
        $scope.showTeethCharting = false;
        $scope.showArchAnalysis = false;
    };
    $scope.step7Init = function() {
        $rootScope.currentState = 7;
        $scope.getAppliances();
        $scope.getTreatmentOptions();
        $scope.getConsiderations();
        $scope.showPatientComplaints = true;
        $scope.showDiagnosticImpression = false;
        $scope.showTreatmentPlan = false;
        $scope.showTreatmentTime = false;
        $scope.showTreatmentOptions = false;

    };
    $scope.step8Init = function() {
        $rootScope.currentState = 8;
    };
    $scope.initOrderDetails = function () {
        $rootScope.currentState = 9;
        $scope.getOrderDetails();
        $scope.getCC();
        $scope.doctorCCid = 0;
        $scope.showPlaceOrderBtn = false;
        $scope.getPaymentForm();
    };
    $scope.initNeedsMoreInfo = function() {
      $rootScope.currentState = 101;
    };
    $scope.initNewCaseSuccessfullySubmitted = function() {
      $scope.patientDetails = $stateParams.patientDetails;
    };

    $scope.getPendingCaseDetails = function(caseID) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientDetails&patientid=' + caseID).then(function (response) {
            response.data.studyModels.schwarzIndex = parseInt(response.data.studyModels.schwarzIndex, 10);
            $scope.casefile = response.data;
            $scope.casefile2 = angular.copy(response.data);
            $scope.newCasefile = response.data;
            $scope.newCasefile2 = angular.copy(response.data);

            if($scope.casefile.status.id === 1 || $scope.casefile.status.id === 6 ) {
              $scope.caseIsSubmitted = false;
            }
            else {
              $scope.caseIsSubmitted = true;
            }

             if($scope.newCasefile.estimatedTreatmentTime.appliance.length === 0) {
               $scope.newCasefile.estimatedTreatmentTime.appliance[0] =
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
            var currentDate = new Date();
            var dob = new Date($scope.newCasefile.info.birthdate);
            var age = new Date(currentDate - dob).getFullYear() - 1970;
            if (age < 18) {
                $scope.under18 = true;
            }
            else {
                $scope.under18 = false;
            }
            if (age < 12) {
                $scope.under12 = true;
            }
            else {
                $scope.under12 = false;
            }
            if($scope.newCasefile.info.birthdate) {
              $scope.newCasefile.info.birthdate = new Date($scope.newCasefile.info.birthdate);
              $scope.getAge($scope.newCasefile.info.birthdate);
            }
            else {

            }

            $scope.checkIfStepsAreComplete($scope.newCasefile, $scope.newCasefile2);
      });
    };

    $scope.goToProviderDashboard = function() {
      $state.go('providerDash');
    };

    $scope.checkIfStepsAreComplete = function(newCasefile, newCasefile2) {
        //This will tell which section is completed
        $rootScope.step1Complete = false;
        $rootScope.step2Complete = false;
        $rootScope.step3Complete = false;
        $rootScope.step4Complete = false;
        $rootScope.step5Complete = false;
        $rootScope.step6Complete = false;
        $rootScope.step6CONTINUE = false;
        $rootScope.step7Complete = false;
        $rootScope.step8Complete = false;
        $rootScope.showOrderDetails = false;
            //Step 1
            if(
                newCasefile.info.firstname &&
                newCasefile.info.lastname &&
                newCasefile.info.birthdate &&
                newCasefile.info.gender &&
                newCasefile.info.ethnicity.name &&
                (
                    newCasefile.photos.facial.bigsmile &&
                    (newCasefile.photos.facial.bigsmile !== $rootScope.apiUrl+'/images/camera.svg')
                )
            ) {$rootScope.step1Complete = true;};
            //Step 2 NOTE: Need a better solution for Step 2 complete as there are no required fields
            if($rootScope.step1Complete === true) {
                if(newCasefile.healthHistory.sleepTestInfo.pAHITest) {
                    if(
                        newCasefile.healthHistory.sleepTestInfo.dateOfSleepTest &&
                        // (newCasefile.healthHistory.sleepTestInfo.pAHI >= 0) &&
                        newCasefile.healthHistory.sleepTestInfo.treatmentStage &&
                        newCasefile2.files.sleepstudy
                    ) {$rootScope.step2Complete = true;}
                    else {$rootScope.step2Complete = false;}
                    }
                else {$rootScope.step2Complete = true;};
            }
            //Step 3
            if(
                (
                  newCasefile.photos.facial.frontatrest !== $rootScope.apiUrl+'/images/camera.svg' &&
                  newCasefile.photos.facial.rightprofile !== $rootScope.apiUrl+'/images/camera.svg' &&
                  newCasefile.photos.facial.submentovertex !== $rootScope.apiUrl+'/images/camera.svg'
                )
            ){$rootScope.step3Complete = true;};
            //Step 4
            if(
                (
                newCasefile.photos.intraoral.upperarch !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.intraoral.lowerarch !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.intraoral.anteriorocclusion !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.intraoral.leftocclusion !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.intraoral.rightocclusion !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.intraoral.ventricalsurfacetongue !== $rootScope.apiUrl+'/images/camera.svg'
                )
            ){$rootScope.step4Complete = true; };
            //Step 5
            if(
                newCasefile.s3PostResponseCBCTfileName ||
                (
                newCasefile.photos.cbct.lateralceph !== $rootScope.apiUrl+'/images/camera.svg' &&
                newCasefile.photos.cbct.pano !== $rootScope.apiUrl+'/images/camera.svg'
                )
            ){$rootScope.step5Complete = true;};
            //Step 6
            // $scope.newCasefile.photos.studymodels.impression3D
            // $scope.newCasefile.photos.studymodels.lowerArch3Dimpression
            // $scope.newCasefile.photos.studymodels.naturalBite3Dimpression
            // $scope.newCasefile.photos.studymodels.naturalBite3Dimpression
            // $scope.newCasefile.photos.studymodels.upperarchStoneModel
            // $scope.newCasefile.photos.studymodels.lowerarchStoneModel
            // $scope.newCasefile.photos.studymodels.anteriorocclusionStoneModel
            // $scope.newCasefile.photos.studymodels.leftocclusionStoneModel
            // $scope.newCasefile.photos.studymodels.rightocclusionStoneModel
            // $scope.newCasefile.studyModels.rightModalRelationship
            // $scope.newCasefile.studyModels.leftModalRelationship
            // $scope.newCasefile.studyModels.staffMemberWhoTookTheImpression

            if(
                (
                    (
                        (newCasefile.photos.studymodels.impression3D && (newCasefile.photos.studymodels.impression3D !== $rootScope.apiUrl+'/images/camera.svg')) &&
                        (newCasefile.photos.studymodels.lowerArch3Dimpression && (newCasefile.photos.studymodels.lowerArch3Dimpression !== $rootScope.apiUrl+'/images/camera.svg'))
                    ) &&
                    (
                        (newCasefile.photos.studymodels.naturalBite3Dimpression && (newCasefile.photos.studymodels.naturalBite3Dimpression !== $rootScope.apiUrl+'/images/camera.svg')) ||
                        (newCasefile.photos.studymodels.constructedBite3Dimpression && (newCasefile.photos.studymodels.constructedBite3Dimpression !== $rootScope.apiUrl+'/images/camera.svg'))
                     )
                )

                ||

                (
                    (newCasefile.photos.studymodels.upperarchStoneModel && (newCasefile.photos.studymodels.upperarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg')) &&
                    (newCasefile.photos.studymodels.lowerarchStoneModel && (newCasefile.photos.studymodels.lowerarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg'))
                )

            ) {$rootScope.step6Complete = true;}

            if(
                (
                    (
                        (newCasefile2.photos.studymodels.impression3D && (newCasefile2.photos.studymodels.impression3D !== $rootScope.apiUrl+'/images/camera.svg')) &&
                        (newCasefile2.photos.studymodels.lowerArch3Dimpression && (newCasefile2.photos.studymodels.lowerArch3Dimpression !== $rootScope.apiUrl+'/images/camera.svg'))
                    ) &&
                    (
                        (newCasefile2.photos.studymodels.naturalBite3Dimpression && (newCasefile2.photos.studymodels.naturalBite3Dimpression !== $rootScope.apiUrl+'/images/camera.svg')) ||
                        (newCasefile2.photos.studymodels.constructedBite3Dimpression && (newCasefile2.photos.studymodels.constructedBite3Dimpression !== $rootScope.apiUrl+'/images/camera.svg'))
                     )
                )

                ||

                (
                    (newCasefile2.photos.studymodels.upperarchStoneModel && (newCasefile2.photos.studymodels.upperarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg')) &&
                    (newCasefile2.photos.studymodels.lowerarchStoneModel && (newCasefile2.photos.studymodels.lowerarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg'))
                )

            ) {$rootScope.step6CONTINUE = true;}

            //Step 7
            if(newCasefile.patientComplaints.notes) {
                $rootScope.step7Complete = true;
                $rootScope.step8Complete = true; //Step 8
            }
            //Step 8
            // if($rootScope.step7Complete) {
            //     $rootScope.step8Complete = true;
            // }

             if($rootScope.step1Complete && $rootScope.step2Complete && $rootScope.step3Complete && $rootScope.step4Complete && $rootScope.step5Complete && $rootScope.step6Complete && $rootScope.step7Complete) {
                $rootScope.showOrderDetails = true;
             }
    };

    //******************************************************************/
    //* Remote Get Calls */
    //******************************************************************/
    $scope.getEthnicity = function () {
        if(!$scope.ethnicities) {
            apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetEthnicity').then(function (response) {
                $scope.ethnicities = response.data;
            });
        };
    };
    $scope.getAppliances = function () {
        if(!$scope.appliances) {
            apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetAppliances').then(function (response) {
                $scope.appliances = response.data;
            });
        };
    };
    $scope.getConsiderations = function () {
        $scope.considerations = [
            {name: 'consideration 1', guid: '{1234123}'},
            {name: 'consideration 2', guid: '{1234123}'},
            {name: 'consideration 3', guid: '{1234123}'}
        ];
    };
    $scope.getTreatmentStages = function() {
        $scope.treatmentStages = [
        {id: 1, name: "Pre-Treatment"},
        {id: 2, name: "Mid-Treatment"},
        {id: 3, name: "Post Treatment"}
        ];
    };
    $scope.getMallampati = function() {
        $scope.mallampati = [
        {id: 1, name: "Class I"},
        {id: 2, name: "Class II"},
        {id: 3, name: "Class III"},
        {id: 4, name: "Class IV"}
        ];
    };
    $scope.getClasses = function() {
        $scope.classRelationships = [
        {id: 1, name: "Class I"},
        {id: 2, name: "Class II"},
        {id: 4, name: "Class II tendency"},
        {id: 3, name: "Class III"},
        {id: 5, name: "Class III tendency"}
        ];
    };
    $scope.getTreatmentOptions = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetTreatmentOptions').then(function (response) {
          $scope.treatementOptions  = response.data;
      });
    };
    $scope.getCBCTInfo = function () {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetContent').then(function (response) {
            $scope.cbctInfoData = response.data.pageContentCBCT;
            $scope.impression3DInfoData = response.data.pageContentImpression3D;
        });
    };

    //******************************************************************/
    //* Step 7 functions */
    //******************************************************************/
    $scope.addNewTreatmentOption = function(applianceArray) {
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
        $scope.newCasefile.estimatedTreatmentTime.appliance.push(applianceOption);
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

    $scope.calculateTotalMIU = function(appliance) {
        $scope.newCasefile.estimatedTreatmentTime.monthsEstimatedTreatmentTime = 0;
        angular.forEach($scope.newCasefile.estimatedTreatmentTime.appliance, function(ap) {
             $scope.newCasefile.estimatedTreatmentTime.monthsEstimatedTreatmentTime += ap.monthsInUse;
        });
    };

    //******************************************************************/
    //* Get Credut Cards */
    //******************************************************************/
    $scope.doctorCCList = [
        {
            "cc_number": "",
            "cc_year": 0,
            "cc_month": 0,
            "cc_cvv": 0,
            "user_id": 0,
            "id": 0,
            "name": "",
            "ccGuid": "",
            "DateAdded": "",
            "ModifiedDate": ""
        }
    ]
    $scope.getCC = function () {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetDoctorCreditCards').then(function (response) {
            $scope.doctorCCList = response.data;
        });
    }
    //******************************************************************/
    //* Add New Credit Card */
    //******************************************************************/
    $scope.addNewCC = function (doctorCC) {
        $scope.showPlaceOrderBtn = true;
        upload({
            url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetDoctorCreditCard&RequestBinary=true',
            method: 'POST',
            data: {
                jsonData: JSON.stringify(doctorCC),
            },
            withCredentials: true
        })
            .then(function (response) {
                $scope.doctorCCList = response.data.data;
                var newCC = response.data.data[response.data.data.length - 1];
                $scope.doctorCCList.push(newCC);
                $scope.doctorCCid = newCC.id;
                blockUI.start("Saving Credit Card ... ");
                $timeout(function () {
                    blockUI.stop();
                }, 1000);
                $scope.getCC();
                $scope.showOrderBtn(newCC.id);
            })
    }
    $scope.showOrderBtn = function (ccId) {
        $scope.showPlaceOrderBtn = true;
        $scope.doctorCC = {};
        $scope.doctorCC.id = ccId;
    }
    //******************************************************************/
    //* JSON for Credut Cards */
    //******************************************************************/
    $scope.months = [
        { id: 1, month: "Jan" },
        { id: 2, month: "Feb" },
        { id: 3, month: "Mar" },
        { id: 4, month: "Apr" },
        { id: 5, month: "May" },
        { id: 6, month: "June" },
        { id: 7, month: "Jul" },
        { id: 8, month: "Aug" },
        { id: 9, month: "Sept" },
        { id: 10, month: "Oct" },
        { id: 11, month: "Nov" },
        { id: 12, month: "Dec" }
    ];
    $scope.years = [
        { value: 2019, year: 2019 },
        { value: 2020, year: 2020 },
        { value: 2021, year: 2021 },
        { value: 2022, year: 2022 },
        { value: 2023, year: 2023 },
        { value: 2024, year: 2024 },
        { value: 2025, year: 2025 }
    ];
    //******************************************************************/
    //* PlaceOrder */
    //******************************************************************/
    $scope.getPaymentForm = function () {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserPaymentForm')
            .then(function (response) {
                $('#js-ecommercePayments').html(response.data);
            });
    };
    $scope.ccError = false;

    $scope.placeOrder = function (newCasefile, orderDetails) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
            if (response.errors.length > 0) {
                $scope.autoLoggedOutAlert();
            }
            else {
                var formSerializeData = $("#js-ecommercePayments").serialize();
                if (formSerializeData) {
                    formSerializeData = '&' + formSerializeData;
                }
                upload({
                    url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteProcessPayment&RequestBinary=true' + formSerializeData,
                    method: 'POST',
                    data: {
                        jsonData: JSON.stringify(newCasefile),
                        products: JSON.stringify(orderDetails),
                        creditcard: JSON.stringify($scope.doctorCC)
                    },
                    withCredentials: true
                })
                    .then(function (response) {
                        if (response.data.errors.length === 0) {
                            // JC 7/11/2017
                            $state.go('new-case-success');
                        }
                        else {
                            $scope.getPaymentForm();
                            $scope.ccError = true;
                            $scope.errorMsg = response.data.errors[0].userMsg;
                        }
                    })
            }
        });
    };

    $scope.submitPatientCase= function (newCasefile) {
      if(!newCasefile.estimatedTreatmentTime.monthsEstimatedTreatmentTime) {
        newCasefile.estimatedTreatmentTime.monthsEstimatedTreatmentTime = 0;
      }
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
            if (response.errors.length > 0) {
                $scope.autoLoggedOutAlert();
            }
            else {
                if(newCasefile.statusModifiedDate) {
                    delete newCasefile.statusModifiedDate;
                }
                upload({
                    url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteProcessSubmitPatientCase&RequestBinary=true',
                    method: 'POST',
                    data: {
                        jsonData: JSON.stringify(newCasefile),
                    },
                    withCredentials: true
                })
                    .then(function (response) {
                        if (response.data.errors.length === 0) {
                            // JC 7/11/2017
                            var patientDetails = response.data.data;
                            // $state.go('patientProfile', {id: patientDetails.id, selectedTile: 1}); //Keep - this will be used later
                            $state.go('providerDash');
                        }
                        else {
                            $scope.ccError = true;
                            $scope.errorMsg = response.data.errors[0].userMsg;
                        }
                    })
            }
        });
    };

    //***********************************************************************************************************************************************/
    //* ng-file-upload upload.js  - Possibly do not need all of this code*/
    //***********************************************************************************************************************************************/
    var version = '11.1.3';
    $scope.usingFlash = FileAPI && FileAPI.upload != null;
    $scope.changeAngularVersion = function () {
        window.location.hash = $scope.angularVersion;
        window.location.reload(true);
    };
    $scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ?
        window.location.hash.substring(2) : window.location.hash.substring(1)) : '1.2.24';
    $scope.invalidFiles = [];
    $scope.uploadPic = function (file) {
        $scope.formUpload = true;
        if (file != null) {
            $scope.upload(file);

        }
    };
    //******************************************************************/
    //* Update Case File - Patient Info - Multipart Form */
    //******************************************************************/
    //NOTE: Not sure if this is needed in this controller
    $scope.uploadCasefile = function (file) {
      if(!file.estimatedTreatmentTime.monthsEstimatedTreatmentTime) {
        file.estimatedTreatmentTime.monthsEstimatedTreatmentTime = 0;
      }
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
            if (response.errors.length > 0) {
                $scope.autoLoggedOutAlert();
            }
            else {
                var dob = new Date(file.info.birthdate);
                file.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
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
                        $scope.mycoolfunction(response);
                        //Added 12.7.18
                        $scope.newCasefile = response.data;
                        $scope.newCasefile2 = angular.copy(response.data);
                        $scope.checkIfStepsAreComplete($scope.newCasefile, $scope.newCasefile2);
                        // JC 7/11/2017
                        blockUI.start("Saving ... ");
                        $timeout(function () {
                            blockUI.stop();
                        }, 2000);

                    });
            }
        });
    };
    //******************************** LOGGED OUT MODAL ************************/
    $scope.autoLoggedOutAlert = function () {
        ModalService.showModal({
            templateUrl: 'autoLogout.html',
            controller: function ($element) {
                this.redirectToLogin = function () {
                     $element.modal('hide');
                    window.location = $rootScope.apiUrl;
                }
            },
            controllerAs: "modalCtrl"
        })
            .then(function (modal) {
                modal.element.modal();
                modal.close.then(function(result) {});
            });
    };
    //******************* Get Age from Birthdate *********************/
    $scope.getAge = function (birthdate) {
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
          $scope.patientAge = 'Patient Age';
        }
        else {
          $scope.currentAge = age;
          $scope.newCasefile.info.age = age;
          $scope.currentAgeMonth = ageMonth;
          $scope.newCasefile.info.ageMonth = ageMonth;
          $scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';
        }
    };
    //Duplicate Function
    // $scope.updateAge = function (birthdate) {
    //     var currentDate = new Date();
    //     var currentMonth = currentDate.getMonth() + 1;
    //     var dob = new Date(birthdate);
    //     var dobMonth = dob.getMonth() + 1;
    //     if (currentMonth < dobMonth) {
    //       var ageMonth = (currentMonth + 12) - dobMonth;
    //     }
    //     else {
    //       var ageMonth = (currentMonth - dobMonth);
    //     }
    //     var age = new Date(currentDate - dob).getFullYear() - 1970;
    //     if (isNaN(age)) {
    //       $scope.patientAge = 'Patient Age';
    //     }
    //     else {
    //       $scope.currentAge = age;
    //       $scope.casefile.info.age = age;
    //       $scope.currentAgeMonth = ageMonth;
    //       $scope.casefile.info.ageMonth = ageMonth;
    //       $scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';
    //     }
    // };
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
    //******************* Once a new case is started, *********************/
    //******************* To Save and Return to Dashboard *********************/
    $scope.saveAndReturn = function (newCasefile) {
      if(newCasefile.statusModifiedDate) {
          delete newCasefile.statusModifiedDate;
      }
        $rootScope.uploadCBCTScanDone = false;
        var dob = new Date(newCasefile.info.birthdate);
        newCasefile.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
        $scope.formUpload = true;
        upload({
            url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&RequestBinary=true',
            method: 'POST',
            data: {
                jsonData: JSON.stringify(newCasefile),
            },
            withCredentials: true
        })
            .then(function (response) {
                $scope.mycoolfunction(response);
                $scope.newCasefile = response.data.data;
                $scope.newCasefile2 = angular.copy(response.data.data);
                // $scope.checkIfStepsAreComplete();
                $state.go('providerDash', {selectedTile: $stateParams.selectedTile});
                //************* Get Value of Selected Addons *************/
                if ($scope.newCasefile.cbctAnalysis) {
                    $scope.cbctAnalysisValue = 95;
                }
                else {
                    $scope.cbctAnalysisValue = 0;
                }
                if ($scope.newCasefile.sleepStudyAnalysis) {
                    $scope.sleepAnalysisValue = 195;
                }
                else {
                    $scope.sleepAnalysisValue = 0;
                }
                $scope.addonTotal = ($scope.cbctAnalysisValue + $scope.sleepAnalysisValue);
            });

    };
    //******************* To Save and Continue to Next Step *********************/
    $scope.continueNewCase = function (newCasefile) {

        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
            if (response.errors.length > 0) {
                $scope.autoLoggedOutAlert();
            }
            else {
                //
                var currentDate = new Date();
                var dob = new Date(newCasefile.info.birthdate);
                newCasefile.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
                var age = new Date(currentDate - dob).getFullYear() - 1970;
                $scope.newCasefile.info.age = age;
                if (age < 18) {
                    $scope.under18 = true;
                }
                else {
                    $scope.under18 = false;
                }
                if (age < 12) {
                    $scope.under12 = true;
                }
                else {
                    $scope.under12 = false;
                }
                $scope.formUpload = true;

                if(newCasefile.statusModifiedDate) {
                    delete newCasefile.statusModifiedDate;
                }

                //appliance fix
                if(newCasefile.estimatedTreatmentTime.appliance && (newCasefile.estimatedTreatmentTime.appliance.length > 0)) {
                  angular.forEach(newCasefile.estimatedTreatmentTime.appliance, function(appliance) {
                    appliance.name = appliance.appliance.name;
                    appliance.guid = appliance.appliance.guid;
                  });
                }
                //
                upload({
                    url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatient&RequestBinary=true',
                    method: 'POST',
                    data: {
                        jsonData: JSON.stringify(newCasefile),
                    },
                    withCredentials: true
                })
                .then(function (response) {
                    $scope.mycoolfunction(response); // for upload file
                    $scope.casefile = response.data.data;
                    $scope.newCasefile = response.data.data;
                    $scope.newCasefile2 = angular.copy(response.data.data);

                    $scope.checkIfStepsAreComplete($scope.newCasefile, $scope.newCasefile2);

                    if ($state.current.name === 'new-case.step-1') {
                        $state.go('new-case.step-2', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-2') {
                        $state.go('new-case.step-3', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-3') {
                        $state.go('new-case.step-4', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-4') {
                        $state.go('new-case.step-5', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-5') {
                        $state.go('new-case.step-6', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-6') {
                        $state.go('new-case.step-7', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-7') {
                        $state.go('new-case.step-8', {id: newCasefile.id});
                    }
                    else if ($state.current.name === 'new-case.step-8') {
                        $state.go('new-case-success');
                    //     $state.go('new-case.order-details', {id: newCasefile.id});
                    // }
                    // else if ($state.current.name === 'new-case.order-details') {
                    //     $state.go('new-case-success');
                    }

                });
            }
        });
    };
    $scope.mycoolfunction = function (response) {
        //This is needed - don't erase
    };

    // check If Required Fields Are Complete Before Saving And Continuing
    $scope.checkRequiredFields = function(newCasefile, newCasefile2, step) {
      //Temporary fix for quick push - to be changed later

      if(newCasefile.status.id === 1 || $scope.casefile.status.id === 6) {
        $scope.showErrorMsg = false;
        $scope.errorMsg = "Please fill out all required fields * to continue.";
        if(step === 1) {
          if(!newCasefile.info.firstname || !newCasefile.info.lastname || !newCasefile.info.birthdate || !newCasefile.info.gender || !newCasefile.info.ethnicity || !newCasefile2.photos.facial.bigsmile) {
            $scope.showErrorMsg = true;
          }
          else {
            $scope.continueNewCase(newCasefile);
          }
        }
        if(step === 2) {
          if(newCasefile.healthHistory.sleepTestInfo.pAHITest && (!newCasefile.healthHistory.sleepTestInfo.dateOfSleepTest ||
            !newCasefile.healthHistory.sleepTestInfo.pAHI || !newCasefile.healthHistory.sleepTestInfo.treatmentStage ||
          !newCasefile2.files.sleepstudy)) {
            $scope.showErrorMsg = true;
            // $scope.errorMsg = "Please fill out all required fields * to continue.";
          }
          else {
            $scope.continueNewCase(newCasefile);
          }
        }
        if(step === 3) {
          if((newCasefile2.photos.facial.frontatrest === $rootScope.apiUrl+'/images/camera.svg') ||
          (newCasefile2.photos.facial.rightprofile === $rootScope.apiUrl+'/images/camera.svg') ||
          (newCasefile2.photos.facial.submentovertex === $rootScope.apiUrl+'/images/camera.svg')) {
            $scope.showErrorMsg = true;
            console.log('error');
          }
          else {
            $scope.continueNewCase(newCasefile);
            console.log('no error found');
          }
        }
        if(step === 4) {
          if(newCasefile2.photos.intraoral.upperarch === $rootScope.apiUrl+'/images/camera.svg' || newCasefile2.photos.intraoral.lowerarch === $rootScope.apiUrl+'/images/camera.svg' || newCasefile2.photos.intraoral.anteriorocclusion === $rootScope.apiUrl+'/images/camera.svg' || newCasefile2.photos.intraoral.leftocclusion === $rootScope.apiUrl+'/images/camera.svg' || newCasefile2.photos.intraoral.rightocclusion === $rootScope.apiUrl+'/images/camera.svg' || newCasefile2.photos.intraoral.ventricalsurfacetongue === $rootScope.apiUrl+'/images/camera.svg') {
            $scope.showErrorMsg = true;
            console.log('error');
          }
          else {
            $scope.continueNewCase(newCasefile);
          }
        }
        if(step === 5) {
          if($rootScope.uploadCBCTScanDone || $scope.newCasefile2.s3PostResponseCBCTfileName) {
            $scope.continueNewCase(newCasefile);
          }
          else if((newCasefile2.photos.cbct.lateralceph  !== $rootScope.apiUrl+'/images/camera.svg') && ( newCasefile2.photos.cbct.pano !== $rootScope.apiUrl+'/images/camera.svg')) {
            $scope.continueNewCase(newCasefile);
          }
          else {
            $scope.errorMsg = '*You must provide either a CBCT Scan or the required alternative images, Lateral Ceph and Pano to continue';
            $scope.showErrorMsg = true;
          }

        }
        if(step === 6) {
          if(newCasefile2.photos.studymodels.impression3D && newCasefile2.photos.studymodels.lowerArch3Dimpression && (newCasefile2.photos.studymodels.naturalBite3Dimpression || newCasefile2.photos.studymodels.constructedBite3Dimpression)) {
            console.log('3d impression complete');
            $scope.continueNewCase(newCasefile);
          }
          else if((newCasefile2.photos.studymodels.upperarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg') && (newCasefile2.photos.studymodels.lowerarchStoneModel !== $rootScope.apiUrl+'/images/camera.svg')) {
            console.log('Stone Models Complete');
            $scope.continueNewCase(newCasefile);
          }
          else {
            $scope.errorMsg = '*Required Images Missing.  Please provide either 3D impression files for both Upper Arch and Lower arch along with either Natural Bite or Constructed Bite, OR provide 2D Stone Model Images for either Upper Arch and Lower Arch';
            $scope.showErrorMsg = true;
          }
        }
        if(step === 7) {
          if(!newCasefile.patientComplaints.notes) {
            $scope.showErrorMsg = true;
          }
          else {
            $scope.continueNewCase(newCasefile);
          }
        }
      }
      else {
        console.log('do not allow save');
      }

    };

    //******************************************************************/
    //* Order Details */
    //******************************************************************/
    $scope.getOrderDetails = function () {
        $scope.cbctAnalysisValue = 0;
        $scope.sleepAnalysisValue = 0;

        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetProducts').then(function (response) {
            $scope.orderDetails = response.data;
            $scope.calculateOrder();
        });
    };
    $scope.calculateOrder = function () {
        $scope.totalOrder = 0;
        if ($scope.newCasefile.cbctAnalysis) {
            $scope.totalOrder = $scope.totalOrder + 95;
        }
        else {
        }
        if ($scope.newCasefile.sleepStudyAnalysis) {
            $scope.totalOrder = $scope.totalOrder + 195;
        }
        else {
        }
        angular.forEach($scope.orderDetails, function (item) {
            if (!item.isOptional || item.addToOrder) {
                $scope.totalOrder = $scope.totalOrder + item.product_price;
            }
        });
    };
    //******************************************************************/
    //* Add the values of the selected checkboxes */
    //******************************************************************/
    $scope.addItem = function (detail) {
        $scope.selectedDetail = detail;
        $scope.addonPrice = detail.product_price;
        $scope.addonTotal = ($scope.addonTotal + $scope.addonPrice);
    };
    //******************************************************************/
    //* Upload the Files (photos/zip/pdf/etc.) - Patient Info - Multipart Form */
    //******************************************************************/
    $scope.uploadFiles = function (file, field) {
      if($scope.newCasefile.status.id === 1 || $scope.newCasefile.status.id === 6) {
        Upload.upload({
           url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFile&RequestBinary=true',
           method: 'POST',
           data: {
               imageFilename: file,
               PatientId: $scope.casefile.id,
               FieldName: field
           },
           withCredentials: true

        })
         .then(function (response) {
            // $scope.newCasefile = response.data.data;
            $scope.newCasefile2 = angular.copy(response.data.data);
            $scope.checkIfStepsAreComplete($scope.newCasefile, $scope.newCasefile2);
         });
      }
      else {
        console.log('do not allow save');
      }

    };
    $scope.uploadFilesForFirstTime = function (file, field) {
        if($scope.newCasefile.status.id === 1) {
          Upload.upload({
             url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFile&RequestBinary=true',
             method: 'POST',
             data: {
                 imageFilename: file,
                 PatientId: $scope.casefile.id,
                 FieldName: field
             },
             withCredentials: true

          })
           .then(function (response) {
           });
        }
        else {
          console.log('do not allow save');
        }

    };
    $scope.uploadLargeFile = function (file) {
        var xmlText = new XMLSerializer().serializeToString(file);
        var casefileId;
        if ($scope.newCasefile && $scope.newCasefile.id) {
            casefileId = $scope.newCasefile.id;
        }
        else {
            casefileId = $scope.casefile.id;
        }
        upload({
            url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientS3CBCTFileResponse&RequestBinary=true',
            method: 'POST',
            data: {
                PatientId: casefileId,
                s3CBCTResponse: xmlText
            },
            withCredentials: true
        })
            .then(function (response) {
                $rootScope.uploadCBCTScanDone = true;
            })
    };
    // *****
    // JC 7/10/2017
    $scope.GetActualCaseId = function () {
        var result = 0;
        if ($scope.newCasefile && $scope.newCasefile.id) {
            return $scope.newCasefile.id;
        }
        else {
            return $scope.casefile.id;
        }

    };

    $scope.checkFileisEmpty = function () {
      $scope.fileNameisEmpty = false;

      if (jQuery('#files').is(':empty')) {
          $scope.fileNameisEmpty = true;
      }
      else {
          $scope.fileNameisEmpty = false;
      }
  };
    // *****
    $scope.uploadNewFiles = function (file, field) {
        upload({
            url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientFile&RequestBinary=true',
            method: 'POST',
            data: {
                PatientId: $scope.newCasefile.id,
                FieldName: field,
                imageFilename: file,
            },
            withCredentials: true
        })
            .then(function (response) {
              $scope.newCasefile = response.data;
              $scope.newCasefile2 = angular.copy(response.data);
              $scope.checkIfStepsAreComplete($scope.newCasefile, $scope.newCasefile2);
            })
    };

    $scope.upload = function (file, resumable) {
        $scope.errorMsg = null;
        if ($scope.howToSend === 1) {
            uploadUsingUpload(file, resumable);
        } else if ($scope.howToSend == 2) {
            uploadUsing$http(file);
        } else {
            uploadS3(file);
        }
    };

    //******************************************************************/
    //* Get S3 Link from XML */
    //******************************************************************/
    $scope.getS3Link = function (casefile) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
            if (response.errors.length > 0) {
                $scope.autoLoggedOutAlert();
            }
            else {
                apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
                    if (response.errors.length > 0) {
                        $scope.autoLoggedOutAlert();
                    }
                    else {
                        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientS3CBCTPreSignedURL&patientId=' + casefile.id).then(function (response) {
                            if (response) {
                                $scope.s3URL = response.data;
                                $scope.s3LinkProvided = true;
                                $scope.s3LinkNotProvided = false;
                            }
                            else {
                                $scope.s3URL = '';
                                $scope.s3LinkProvided = false;
                                $scope.s3LinkNotProvided = true;
                            }
                        });
                    }
                });
            }
        });
    };

    var acceptFileType = /.*/i;
    var maxFileSize = 1000;
    var credentialsUrl = '/urlSiteGetS3Parameters';
    // The URL to your endpoint to register the uploaded file
    var uploadUrl = '/upload';
    window.initS3FileUpload = function ($fileInput) {
        $scope.newFileName = false;
        $fileInput.fileupload({
            paramName: 'file',
            add: uploadS3,
            dataType: 'xml',
            done: onS3Done
        })
            .on('fileuploadprogressall', function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progress .progress-bar').css(
                    'width',
                    progress + '%'
                );
            })
            .on('fileuploadadd', function (e, data) {
                data.context = $('<div/>').appendTo('#files');
                if(data.files[0].name) {
                   $scope.newFileName = true;
                }

                $('#files').text(data.files[0].name);
            });
        $('#fileInput').fileupload({
            dropZone: $('#dropzone')
        });
    };
    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });
    function uploadS3(e, data) {
        $rootScope.uploadCBCTScanDone = false;
        var filename = data.files[0].name;
        var contentType = data.files[0].type;
        $scope.notAZip = false;
        $scope.notAZipMsg = '';
        if(!contentType) {
            $scope.notAZip = true;
            $scope.notAZipMsg = 'Cannot upload the file extension. Only .zip files are accepted.';
        }
        // JC 7/10/2017
        // Pull actual case id from angular dom
        var actualcaseId = angular.element('#fileInput').scope().GetActualCaseId();

        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetS3Parameters&patientId=' + actualcaseId + '&filename=' + filename + '&content_type=' + contentType + '&acl=public-read').then(function (resp) {
            var response = resp.data;
            postParams = {
                key: response.filename,
                acl: response.acl,
                success_action_status: '201',
                policy: response.policyBase64,
                "content-type": response.content_type,
                'x-amz-algorithm': 'AWS4-HMAC-SHA256',
                'x-amz-credential': response.credential,
                'x-amz-date': dateString() + 'T000000Z',
                'x-amz-signature': response.signatureString
            }
            data.url = response.endpoint_url;
            data.formData = postParams;
            data.submit();
        });
    };
    function onS3Done(e, data) {
        var s3Url = $(data.jqXHR.responseXML).find('Location').text();
        var s3Key = $(data.jqXHR.responseXML).find('Key').text();

        var s3XML = data.jqXHR.responseXML;
        angular.element('#fileInput').scope().uploadLargeFile(s3XML);

        $scope.checkFileisEmpty();
    };
    function dateString() {
        var date = new Date().toISOString();
        return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
    };
    $scope.generateSignature = function () {
        $http.post('/s3sign?aws-secret-key=' + encodeURIComponent($scope.AWSSecretKey), $scope.jsonPolicy).success(function (data) {
            $scope.policy = data.policy;
            $scope.signature = data.signature;
        });
    };
    if (localStorage) {
        $scope.s3url = localStorage.getItem('s3url');
        $scope.AWSAccessKeyId = localStorage.getItem('AWSAccessKeyId');
        $scope.acl = localStorage.getItem('acl');
        $scope.success_action_redirect = localStorage.getItem('success_action_redirect');
        $scope.policy = localStorage.getItem('policy');
        $scope.signature = localStorage.getItem('signature');
    };
    angular.element(window).bind('dragover', function (e) {
        e.preventDefault();
    });
    angular.element(window).bind('drop', function (e) {
        e.preventDefault();
    });

    $timeout(function () { });


    //TEETH SELECTION
    $scope.hoverIn = function(tooth) {
      angular.element('#'+tooth).addClass('highlightMatch');
    };
    $scope.hoverOut = function(tooth) {
      angular.element('#'+tooth).removeClass('highlightMatch');
    };

    $scope.missingTeethDiagram = true;
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

    $scope.calculateDiscrepancy = function(archAnalysis) {
        var a = archAnalysis.archAnalysis.schwarzIndex;
        var b = a + 9;
        var c = b + 9;
        var b1 = a + 9;
        var c1 = b + 9;

        archAnalysis.archAnalysis.upperFirstPremolars.discrepancy =  archAnalysis.archAnalysis.upperFirstPremolars.measurement - b;
        archAnalysis.archAnalysis.upperFirstMolars.discrepancy =  archAnalysis.archAnalysis.upperFirstMolars.measurement - c;
        archAnalysis.archAnalysis.lowerFirstPremolars.discrepancy =  archAnalysis.archAnalysis.lowerFirstPremolars.measurement - b1;
        archAnalysis.archAnalysis.lowerFirstMolars.discrepancy =  archAnalysis.archAnalysis.lowerFirstMolars.measurement - c1;
    };




});
