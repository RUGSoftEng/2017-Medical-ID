define(function() {

  /**
   * Module for the input bar with automatic hyphening.
   * @exports hyphenator
   */
  var hyphenator = {};

  /**
   * Method to return the string with hyphens denoting codons.
   * @returns {string} The string with hypens.
   */
  hyphenator.insertHyphen = function(string) {
		if (string.length > 3) {
			return string.slice(0, 3) + "-" + hyphenator.insertHyphen(string.slice(3));
		} else {
			return string;
		}
	}

  // Listener
  $('.hyphenCode').on('input', function () {
		var text = $(this).val().replace(/[^0-9a-zA-Z]/gi, '');
		text = hyphenator.insertHyphen(text);
		$(this).val(text);
	});

  return hyphenator;
});
