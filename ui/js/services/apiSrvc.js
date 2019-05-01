app.service('apiSrvc', function ($http, $location, $rootScope) {
    //
    // configure hosts
    window.__env = window.__env || {};
    if ($location.host().toLowerCase() === 'url.com') {
        // API url - url to the data services
        $rootScope.apiUrl = 'https://apiUrl.com';
        $rootScope.urlSecondary = 'https://urlSecondary.com';
        $rootScope.baseUrl = 'https://urlApp.com';

        $rootScope.awsURL = 'https://url.s3.amazonaws.com/';

    } else {
        // API url - url to the data services
        $rootScope.apiUrl = 'http://apiUrl.com';
        $rootScope.urlSecondary = 'http://urlSecondary.com';
        $rootScope.baseUrl = 'http://urlApp.com';

        $rootScope.awsURL = 'http://url.s3.amazonaws.com/';
    }
    // Enable cross domain calls
    $http.defaults.useXDomain = true;
    // Remove the header used to identify ajax call  that would prevent CORS from working
    delete $http.defaults.headers.common['X-Requested-With'];

    //*****************************
    this.getData = function (addonName, queryString) {
        if (queryString) {
            queryString = '?' + queryString;
            // queryString = 'index.aspx?' + queryString;
        } else {
            queryString = "";
        }
        return $http.get(addonName + queryString, { withCredentials: true })
            .then(function (result) {
                return result.data
            }, function (error) {
                console.error('Error: getData callback');
            })
    };

});


//***************************************************************************************
//* UPLOAD SERVICE
//***************************************************************************************
// NOTE: .success(function) is deprecated in Angular 1.6+
app.service('fileUpload', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined },
            withCredentials: true
        })
            .then(function successCallback(response) {
            }
                , function errorCallback(response) {
                });
    }
});

//***************************************************************************************
//* UPLOAD DIRECTIVE
//***************************************************************************************
app.directive('fileModel', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope.$parent, element[0].files[0]);
                });
            });
        }
    };
});
