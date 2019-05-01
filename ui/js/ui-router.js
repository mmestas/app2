app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!')
  $stateProvider
    .state('default', {
        controller: 'mainCtrl',
        url: '/',
        templateUrl: '/views/dashboard/default.html',
        resolve: {factory: authorize}
    })
    .state('providerDash', {
        controller: 'providerDashCtrl',
        url: '/provider-dashboard',
        templateUrl: 'views/dashboard/provider/dashboard.html',
        resolve: {factory: authorize},
        params: {selectedTile: null}
    })
    .state('techDash', {
        controller: 'techDashCtrl',
        url: '/technician-dashboard',
        templateUrl: '/views/dashboard/technician/dashboard.html',
        resolve: {factory: authorize},
        params: {selectedTile: null}
    })
    .state('clinicianDash', {
        controller: 'clinicanDashCtrl',
        url: '/clinician-dashboard',
        templateUrl: '/views/dashboard/clinician/dashboard.html',
        resolve: {factory: authorize},
        params: {selected: null}
    })
    .state('finalReviewerDash', {
        controller: 'finalReviewerDashCtrl',
        url: '/finalReview-dashboard',
        templateUrl: '/views/dashboard/finalReviewer/dashboard.html',
        resolve: {factory: authorize},
        params: {selected: null}
    })
    .state('adminDash', {
        controller: 'adminDashCtrl',
        url: '/admin-dashboard',
        templateUrl: '/views/dashboard/admin/dashboard.html',
        resolve: {factory: authorize},
        params: {selected: null}
    })
    .state('caseDetails', {
        controller: 'patientDetailsCtrl',
        url: '/caseDetails/{id:int}/{selectedTile:int}',
        templateUrl: '/views/patientDetails/Active-Case-File.html',
        resolve: {factory: authorize},
        params: {selectedTile: null}
    })
    .state('patientProfile', {
        controller: 'patientProfileCtrl',
        url: '/patientProfile/{id:int}/{selectedTile:int}',
        templateUrl: '/views/patientDetails/patientProfile.html',
        resolve: {factory: authorize}
    })
    //New Patient Sign Up
    .state('new-case', {
        controller: 'newCaseCtrl',
        url: '/new-case/{selectedTile:int}',
        templateUrl: '/views/new-case-steps/new-case-signup.html',
        resolve: {factory: authorize},
        params: {selectedTile: null}
    })
    .state('new-case.step-1', {
        controller: 'newCaseCtrl',
        url: '/step-1/:id',
        templateUrl: '/views/new-case-steps/new-case-step-1.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-2', {
        controller: 'newCaseCtrl',
        url: '/step-2/:id',
        templateUrl: '/views/new-case-steps/new-case-step-2.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-3', {
        controller: 'newCaseCtrl',
        url: '/step-3/:id',
        templateUrl: '/views/new-case-steps/new-case-step-3.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-4', {
        controller: 'newCaseCtrl',
        url: '/step-4/:id',
        templateUrl: '/views/new-case-steps/new-case-step-4.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-5', {
        controller: 'newCaseCtrl',
        url: '/step-5/:id',
        templateUrl: '/views/new-case-steps/new-case-step-5.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-6', {
        controller: 'newCaseCtrl',
        url: '/step-6/:id',
        templateUrl: '/views/new-case-steps/new-case-step-6.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-7', {
        controller: 'newCaseCtrl',
        url: '/step-7/:id',
        templateUrl: '/views/new-case-steps/new-case-step-7.html',
        params: {selectedTile: null}
    })
    .state('new-case.step-8', {
        controller: 'newCaseCtrl',
        url: '/step-8/:id',
        templateUrl: '/views/new-case-steps/new-case-step-8.html',
        params: {selectedTile: null}
    })
    .state('new-case.order-details', {
        controller: 'newCaseCtrl',
        url: '/order-details/:id',
        templateUrl: '/views/new-case-steps/order-details.html',
        params: {selectedTile: null}
    })
    .state('new-case.needsMoreInfo', {
        controller: 'newCaseCtrl',
        url: '/needsMoreInfo/:id',
        templateUrl: '/views/new-case-steps/needsMoreInfo.html',
        params: {selectedTile: null}
    })
    .state('new-case-success', {
        controller: 'newCaseCtrl',
        url: 'new-case-success',
        templateUrl: '/views/new-case-steps/new-case-success.html',
        params: {selectedTile: null}
    })
    //Create Rx
    .state('createRx', {
        controller: 'createRxCtrl',
        url: '/createRx/{id:int}/{selectedTile:int}/:prescriptionGuid/:prescriptions',
        templateUrl: '/views/createRx/createRx.html',
        resolve: {factory: authorize}
    })

});

  var authorize = function(authSrvc) {
     authSrvc.getUserRole();
  }

app.run(function ($rootScope, $window, apiSrvc, $interval) {
  $rootScope.logOut = function () {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteProcessLogout').then(function (response) {
        window.location = $rootScope.apiUrl;
    });
  };
  $interval(callAtInterval, 600*1000, [18]); //call every 10 minutes, call 18 times (18 x 10 min = 3 hours + contensive timeout (1hr)= 4 hours
  function callAtInterval() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=heartbeat').then(function (response) {
      });
  };
  //My Account Link
  $rootScope.portalClick = function () {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              // Go to login Page
              $rootScope.userInfo = {};
              window.location = $rootScope.apiUrl;
              $rootScope.loggedInNav = false;
          }
          if (response.data.isInUSDoctorGroup) {
              window.location = response.data.pageUrlUSDoctor;
          }
          else if (response.data.isInInternationalDoctorGroup) {
              window.location = response.data.pageUrlUSDoctor;
          }
          else {
          }
      })
  };
  $rootScope.myAccountLink = function () {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          if (response.errors.length > 0) {
              // Go to login Page
              $rootScope.userInfo = {};
              window.location = $rootScope.apiUrl;
              $rootScope.loggedInNav = false;
          }
          else {
              window.location = $rootScope.apiUrl + '/My-Account';
          }
      })
  };
});
