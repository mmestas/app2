app.service('s3Srvc', function ($http, $location, $rootScope, apiSrvc, $filter, NgTableParams, Upload, upload, blockUI, $timeout) {

  // Step 4 - Called from onS3Done() - Step 3
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

  //*******************************
  // JC 7/10/2017
  // Called from uploadS3() Step 2
  $scope.GetActualCaseId = function () {
      var result = 0;
      if ($scope.newCasefile && $scope.newCasefile.id) {
          return $scope.newCasefile.id;
      }
      else {
          return $scope.casefile.id;
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

  //Step 1 - First function called from HTML
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

  //Step 2 - Second function - called as a parameter from window.initS3FileUpload
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

  //Step 3- Third function called as a parameter from window.initS3FileUpload after uploadS3() is completed
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


});
