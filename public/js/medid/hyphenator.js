define(function() {

  /**
   * Module for the input bar with automatic hyphening.
   * @exports hypenator
   */
  var hypenator = {};

  /**
   * Method to return the string with hyphens denoting codons.
   * @returns {string} The date with hypens.
   */
  hypenator.insertHyphen = function(string) {
		if (string.length > 3) {
			return string.slice(0, 3) + "-" + hypenator.insertHyphen(string.slice(3));
		} else {
			return string;
		}
	}

  $('.hyphenCode').on('input', function () {
		var text = $(this).val().replace(/[^0-9a-zA-Z]/gi, '');
		text = hypenator.insertHyphen(text);
		$(this).val(text);
	});

  return hypenator;
});
