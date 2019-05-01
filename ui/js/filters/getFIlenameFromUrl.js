app.filter('fileNameOnly', function() {
  return function (fileNameOnly) {
    if (!fileNameOnly) { return ''; }
    if(fileNameOnly){
      if(fileNameOnly.name) {}
      else {
          var filename = fileNameOnly.substring(fileNameOnly.lastIndexOf('/')+1);
          return filename;
      }



    }

  }
})
