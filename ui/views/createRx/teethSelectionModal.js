app.controller('teethSelectionCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, authSrvc, commonFnSrvc,  NgTableParams, fileUpload, $http, $timeout, $interval, $compile, $element, Upload, upload, $filter, blockUI, ModalService, editSelectedModel, applianceSystem, num, onlyBetween, showUpper, showLower, close) {

  $scope.showUpper = showUpper;
  $scope.showLower = showLower;

  var setTeethToFalse = function() {
    $scope.teeth = {
      tooth1: false,
      tooth1b: false,
      tooth2: false,
      tooth2b: false,
      tooth3: false,
      tooth3b: false,
      tooth4: false,
      tooth4b: false,
      tooth5: false,
      tooth5b: false,
      tooth6: false,
      tooth6b: false,
      tooth7: false,
      tooth7b: false,
      tooth8: false,
      tooth8b: false,
      tooth9: false,
      tooth9b: false,
      tooth10: false,
      tooth10b: false,
      tooth11: false,
      tooth11b: false,
      tooth12: false,
      tooth12b: false,
      tooth13: false,
      tooth13b: false,
      tooth14: false,
      tooth14b: false,
      tooth15: false,
      tooth15b: false,
      tooth16: false,
      tooth16b: false,
      tooth17: false,
      tooth17b: false,
      tooth18: false,
      tooth18b: false,
      tooth19: false,
      tooth19b: false,
      tooth20: false,
      tooth20b: false,
      tooth21: false,
      tooth21b: false,
      tooth22: false,
      tooth22b: false,
      tooth23: false,
      tooth23b: false,
      tooth24: false,
      tooth24b: false,
      tooth25: false,
      tooth25b: false,
      tooth26: false,
      tooth26b: false,
      tooth27: false,
      tooth27b: false,
      tooth28: false,
      tooth28b: false,
      tooth29: false,
      tooth29b: false,
      tooth30: false,
      tooth30b: false,
      tooth31: false,
      tooth31b: false,
      tooth32: false,
      tooth32b: false
    };
  };

  $scope.onlyBetween = onlyBetween;

  // $scope.editSelectedModel = editSelectedModel;
  $scope.highlightSelectedTooth = function() {
    setTeethToFalse();
    angular.forEach(editSelectedModel, function(eachSelection) {
      if(eachSelection === 1) {$scope.teeth.tooth1 = true};
      if(eachSelection === 1.5) {$scope.teeth.tooth1b = true};
      if(eachSelection === 2) {$scope.teeth.tooth2 = true};
      if(eachSelection === 2.5) {$scope.teeth.tooth2b = true};
      if(eachSelection === 3) {$scope.teeth.tooth3 = true};
      if(eachSelection === 3.5) {$scope.teeth.tooth3b = true};
      if(eachSelection === 4) {$scope.teeth.tooth4 = true};
      if(eachSelection === 4.5) {$scope.teeth.tooth4b = true};
      if(eachSelection === 5) {$scope.teeth.tooth5 = true};
      if(eachSelection === 5.5) {$scope.teeth.tooth5b = true};
      if(eachSelection === 6) {$scope.teeth.tooth6 = true};
      if(eachSelection === 6.5) {$scope.teeth.tooth6b = true};
      if(eachSelection === 7) {$scope.teeth.tooth7 = true};
      if(eachSelection === 7.5) {$scope.teeth.tooth7b = true};
      if(eachSelection === 8) {$scope.teeth.tooth8 = true};
      if(eachSelection === 8.5) {$scope.teeth.tooth8b = true};
      if(eachSelection === 9) {$scope.teeth.tooth9 = true};
      if(eachSelection === 9.5) {$scope.teeth.tooth9b = true};
      if(eachSelection === 10) {$scope.teeth.tooth10 = true};
      if(eachSelection === 10.5) {$scope.teeth.tooth10b = true};
      if(eachSelection === 11) {$scope.teeth.tooth11 = true};
      if(eachSelection === 11.5) {$scope.teeth.tooth11b = true};
      if(eachSelection === 12) {$scope.teeth.tooth12 = true};
      if(eachSelection === 12.5) {$scope.teeth.tooth12b = true};
      if(eachSelection === 13) {$scope.teeth.tooth13 = true};
      if(eachSelection === 13.5) {$scope.teeth.tooth13b = true};
      if(eachSelection === 14) {$scope.teeth.tooth14 = true};
      if(eachSelection === 14.5) {$scope.teeth.tooth14b = true};
      if(eachSelection === 15) {$scope.teeth.tooth15 = true};
      if(eachSelection === 15.5) {$scope.teeth.tooth15b = true};
      if(eachSelection === 16) {$scope.teeth.tooth16 = true};
      if(eachSelection === 16.5) {$scope.teeth.tooth16b = true};
      if(eachSelection === 17) {$scope.teeth.tooth17 = true};
      if(eachSelection === 17.5) {$scope.teeth.tooth17b = true};
      if(eachSelection === 18) {$scope.teeth.tooth18 = true};
      if(eachSelection === 18.5) {$scope.teeth.tooth18b = true};
      if(eachSelection === 19) {$scope.teeth.tooth19 = true};
      if(eachSelection === 19.5) {$scope.teeth.tooth19b = true};
      if(eachSelection === 20) {$scope.teeth.tooth20 = true};
      if(eachSelection === 20.5) {$scope.teeth.tooth20b = true};
      if(eachSelection === 21) {$scope.teeth.tooth21 = true};
      if(eachSelection === 21.5) {$scope.teeth.tooth21b = true};
      if(eachSelection === 22) {$scope.teeth.tooth22 = true};
      if(eachSelection === 22.5) {$scope.teeth.tooth22b = true};
      if(eachSelection === 23) {$scope.teeth.tooth23 = true};
      if(eachSelection === 23.5) {$scope.teeth.tooth23b = true};
      if(eachSelection === 24) {$scope.teeth.tooth24 = true};
      if(eachSelection === 24.5) {$scope.teeth.tooth24b = true};
      if(eachSelection === 25) {$scope.teeth.tooth25 = true};
      if(eachSelection === 25.5) {$scope.teeth.tooth25b = true};
      if(eachSelection === 26) {$scope.teeth.tooth26 = true};
      if(eachSelection === 26.5) {$scope.teeth.tooth26b = true};
      if(eachSelection === 27) {$scope.teeth.tooth27 = true};
      if(eachSelection === 27.5) {$scope.teeth.tooth27b = true};
      if(eachSelection === 28) {$scope.teeth.tooth28 = true};
      if(eachSelection === 28.5) {$scope.teeth.tooth28b = true};
      if(eachSelection === 29) {$scope.teeth.tooth29 = true};
      if(eachSelection === 29.5) {$scope.teeth.tooth29b = true};
      if(eachSelection === 30) {$scope.teeth.tooth30 = true};
      if(eachSelection === 30.5) {$scope.teeth.tooth30b = true};
      if(eachSelection === 31) {$scope.teeth.tooth31 = true};
      if(eachSelection === 31.5) {$scope.teeth.tooth31b = true};
      if(eachSelection === 32) {$scope.teeth.tooth32 = true};
      if(eachSelection === 32.5) {$scope.teeth.tooth32b = true};
    })

  };
  $scope.highlightSelectedTooth(); // to be called in init later

  $scope.addToSelected = function(num) {
    // var tooth;
    if(editSelectedModel.length === 0) {
      editSelectedModel = [];
      editSelectedModel.push(num);
      // tooth = true;
    }
    else {
      if(editSelectedModel.indexOf(num) === -1) {
          editSelectedModel.push(num);
          // tooth = true;
      }
      else {
          var pos = editSelectedModel.indexOf(num);
          editSelectedModel.splice(pos, 1);
          // tooth = false;
      }
    }

    $scope.highlightSelectedTooth();

  }

  $scope.closeModal = function() {
    // editSelectedModel.sort();
    editSelectedModel.sort(function(a, b){return a-b});
    $element.modal('hide');
    close(editSelectedModel);

 };


});
