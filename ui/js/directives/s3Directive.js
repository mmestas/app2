app.directive('awsFile', function($rootScope, $http, apiSrvc, upload, Upload) {
  return {
    restrict: 'AE',
    scope: {
      file: '@'
    },
    link: function(scope, el, attrs){
      // This is a hack to get the patientRecordId -
      // I made the id in the html include the patientRecordId
      var htmlId = attrs.id;
      var getNumbers = /\d+/g;
      var regexId = htmlId.match(getNumbers);
      var regexIdMatched = regexId[0];
      var patientRecordId = parseInt(regexIdMatched, 10);
      var uploadS3 = function() {
        $rootScope.progressPercentage = 0;
       $rootScope.uploadCBCTScanDone = false;
       var files = event.target.files;
       var file = files[0];
       var filename = file.name;
       var contentType = file.type;
       scope.file = file;
       scope.$parent.file = file;

       scope.notAZip = false;
       scope.notAZipMsg = '';
       if(!contentType) {
         scope.notAZip = true;
         scope.notAZipMsg = 'Cannot upload the file extension. Only .zip files are accepted.';
       }

       apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteGetPatientRecordS3Parameters&patientRecordId=' + patientRecordId + '&filename=' + filename + '&content_type=' + contentType + '&acl=public-read').then(function (resp) {
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

           // var url = 'https://contensive-dev-upload.s3.amazonaws.com/';
           var url = $rootScope.awsURL;
           var formData = postParams;

           //Need to find an easier way to do this
           var fd = new FormData();
           fd.append('key', response.filename);
           fd.append('acl', response.acl);
           fd.append('success_action_status', '201');
           fd.append('policy', response.policyBase64);
           fd.append("content-type", response.content_type);
           fd.append('x-amz-algorithm', 'AWS4-HMAC-SHA256');
           fd.append('x-amz-credential', response.credential);
           fd.append('x-amz-date', dateString() + 'T000000Z');
           fd.append('x-amz-signature', response.signatureString);
           fd.append('file', file);

           Upload.upload({
               url: url,
               method: 'POST',
               data: {
                 'key': response.filename,
                 'acl': response.acl,
                 'success_action_status': '201',
                 'policy': response.policyBase64,
                 'content-type': response.content_type,
                 'x-amz-algorithm': 'AWS4-HMAC-SHA256',
                 'x-amz-credential': response.credential,
                 'x-amz-date': dateString() + 'T000000Z',
                 'x-amz-signature': response.signatureString,
                 'file': file
               },
               headers: { 'Content-Type': undefined },
               transformRequest: angular.identity,
               withCredentials: false //Need this so it doesn't throw a CORS error when posting to Amazon
           })

           .then(function (resp) {
              var s3XML = resp.data;
              uploadLargeFile(s3XML);
            }, function (resp) {
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $rootScope.progressPercentage = progressPercentage;
            });
       });
      }

      function dateString() {
          var date = new Date().toISOString();
          return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
      };

      var checkFileisEmpty = function () {
        scope.fileNameisEmpty = false;

        if (scope.notAZip) {
            scope.fileNameisEmpty = true;
        }
        else {
            scope.fileNameisEmpty = false;
        }
      };

      var uploadLargeFile = function (xmlText) {
          upload({
              url: $rootScope.apiUrl + '/Default.aspx?remoteCall=urlSiteSetPatientRecordS3CBCTFileResponse&RequestBinary=true',
              method: 'POST',
              data: {
                  PatientRecordId: patientRecordId,
                  s3CBCTResponse: xmlText
              },
              withCredentials: true
          })
              .then(function (response) {
                  $rootScope.uploadCBCTScanDone = true;
                  $rootScope.cbctScanName = response.data.data.cbct.s3PostResponseCBCTfileName;
              }
            )
      };

      el.bind('change', function(event){
        uploadS3();
      });


    },

  };
});
