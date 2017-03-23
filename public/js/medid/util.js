define(function() {
  var util = {};

  util.formatDate = function () {
  	var today = new Date();
  	var dd = today.getDate();
  	var mm = today.getMonth() + 1;
  	var yyyy = today.getFullYear();
  	dd = (dd < 10 ? '0' + dd : dd);
  	mm = (mm < 10 ? '0' + mm : mm);

  	return dd + '-' + mm + '-' + yyyy;
  }

  return util;
});
