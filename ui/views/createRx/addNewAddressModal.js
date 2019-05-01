app.controller('addNewShippingModalCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, authSrvc, commonFnSrvc,  NgTableParams, fileUpload, $http, $timeout, $interval, $compile, $element, Upload, upload, $filter, blockUI, ModalService, addressFields, shippingAddresses, close) {

  addressFields.addressLine1 = "";
  $scope.addressFields = addressFields;
  commonFnSrvc.getCountries($scope);
  // commonFnSrvc.getStates($scope);
  $scope.statesIsInactive = true;

  $scope.getStatesbyCountry = function(country) {
    var countryId = country.id;
    if(countryId === 235) {
      $scope.statesIsInactive = false;
      commonFnSrvc.getStates($scope);
    }
    else {
      $scope.statesIsInactive = true;
    }
  }

  $scope.saveNewAddress = function(newAddress, addNewShippingAddressForm) {
    $scope.showErrorMsg = false;
    if(addNewShippingAddressForm.$invalid) {
      $scope.showErrorMsg = true;
      $scope.errorMsg = 'Please fill out all fields before submitting';
    }
    else {
      newAddress.country = newAddress.country.name;
      var json = JSON.parse(angular.toJson(newAddress));

      Upload.upload({
         url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetShippingAddress&RequestBinary=true',
         method: 'POST',
         data: {
           jsonData: JSON.stringify(json),
         },
         withCredentials: true
      })
       .then(function (response) {
         if(response.data.errors.length > 0) {
           $scope.showErrorMsg = true;
           $scope.errorMsg = 'There was an error with your submission.  Please try again or contact urlSite directly.';
         }
         else {
           close(response.data.data);
         }
       });

    }
  }

  $scope.closeModal = function() {
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
    addressFields.addressLine1 = "Add New";
    close(shippingAddresses);
  }

});
