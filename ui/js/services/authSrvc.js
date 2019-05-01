app.service('authSrvc', function ($http, $location, $state, $rootScope, apiSrvc, commonFnSrvc,  $q, ModalService) {

  this.getUserRole = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
      var user = response.data;
      if (response.errors.length > 0) {
          $rootScope.userInfo = {};
          window.location = $rootScope.apiUrl;
          $rootScope.loggedInNav = false;
          return false;
      } else {
          // User is authenticate
          $rootScope.userInfo = response.data;
          if (response.data.isInUSDoctorGroup) {
              $rootScope.portalAuthenticated = true;
              $rootScope.portalIntl = false;
              $rootScope.portal = true;
          }
          else if (response.data.isInInternationalDoctorGroup) {
              $rootScope.portalAuthenticated = true;
              $rootScope.portalIntl = true;
              $rootScope.portal = false;
          }
          else {
              $rootScope.portalAuthenticated = false;
              $rootScope.portalIntl = false;
              $rootScope.portal = false;
          }
          $rootScope.loggedInNav = true;
      }
      if($state.current.name === 'default') {
        if (user.userRole.ccGuid === "providerKey") {
            $state.go('providerDash');
        }
        else if (user.userRole.ccGuid === "clinicianKey") {
            $state.go('clinicianDash');

        }
        else if (user.userRole.ccGuid === "finalReviewerKey") {
            $state.go('finalReviewerDash');

        }
        else if (user.userRole.ccGuid === "technicianKey") {
            $state.go('techDash');

        }
        else if (user.userRole.ccGuid === "adminKey") {
            $state.go('adminDash');

        }
        else {
            window.location = $rootScope.apiUrl;
            $scope.loggedInNav = false;
        }
      }
      if (user.userRole.ccGuid === "providerKey") {
        //doctor
        $rootScope.navTech = false;
        $rootScope.navDiag = false;
        $rootScope.navAdmin = false;
        $rootScope.navProv = true;
      }
      else if (user.userRole.ccGuid === "clinicianKey") {
        //diagnostician
        $rootScope.navTech = false;
        $rootScope.navDiag = true;
        $rootScope.navAdmin = false;
        $rootScope.navProv = false;
        $rootScope.uiid = user.id;
      }
      else if (user.userRole.ccGuid === "finalReviewerKey") {
        //final reviewer
        $rootScope.navTech = false;
        $rootScope.navDiag = true;
        $rootScope.navAdmin = false;
        $rootScope.navProv = false;
        $rootScope.uiid = user.id;
      }
      else if (user.userRole.ccGuid === "technicianKey") {
        //technician
        $rootScope.navTech = true;
        $rootScope.navDiag = false;
        $rootScope.navAdmin = false;
        $rootScope.navProv = false;
      }
      else if (user.userRole.ccGuid === "adminKey") {
        //admin
        $rootScope.navTech = false;
        $rootScope.navDiag = false;
        $rootScope.navAdmin = true;
        $rootScope.navProv = false;
      }
    });
  };

  var autoLogoutModal = function() {
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

  this.getAuthenticationForClicks = function(functionToGetCalled) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
          var myBoolean = null;
          if (response.errors.length > 0) {
              myBoolean = false;
              autoLogoutModal();
          }
          else {
              myBoolean = true;
              functionToGetCalled();
          }
          return myBoolean;
      });
  };

  this.goToPatientDetails = function(casefile, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
        if (response.errors.length > 0) {
            autoLogoutModal();
        }
        else {
          $state.go('patientProfile', {id: casefile.id, selectedTile: selectedTile});

        }
    });
  };

  this.goToProviderPatientDetails = function(casefile, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetUserInformation').then(function (response) {
        if (response.errors.length > 0) {
            autoLogoutModal();
        }
        else {
          if(casefile.status.id === 1) {
            $state.go('new-case.step-1', {id: casefile.id, selectedTile: selectedTile});
          }
          else {
            $state.go('patientProfile', {id: casefile.id, selectedTile: selectedTile}); //USE FOR REAL
          }

        }
    });
  };

}); //End of Service
