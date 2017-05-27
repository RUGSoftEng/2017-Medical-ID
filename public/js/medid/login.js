define(['jquery'], function($) {

  /**
   * The "pass-strength" module is designed to manage the password strength indicator and handle updating.
   * @exports passbox
   * @requires jQuery
   */
  var passwordstrength = {
    strengthbox: $('.pass-strength')
  };
  
  /**
   * Method to update the styling of the password strength box.
   * @param {String} text - The text to be set
   * @param {String} bgcolor - The background color to be set
   * @param {String} textcolor - The text color to be set
   */
  passwordstrength.updateStyling = function(text, bgcolor, textcolor){
 	passwordstrength.strengthbox.text(text);
	passwordstrength.strengthbox.css({'background-color': bgcolor,'color': textcolor});
  }

  /**
   * Method to decide what the password strength box should show. Based on the content of the given password
   * @param {String} string - Password to be tested
   */
  passwordstrength.update = function(string) {
	// Regular expression to determine if the string contains at least one number
	var containsNumber 		= /\d/.test(string);
	
	// Check if the string contains at least one uppercase letter
	var containsUppercase 	= !(string == string.toLowerCase());
	
	// Check if the string contains at least one symbol
	var containsSymbol 		= !(/^[0-9a-zA-Z]+$/.test(string));
	
	// Calculate the 'score' of the password
    var count = containsNumber + containsUppercase + containsSymbol;
	
	// Depending on the count variable, assign different 
	if(string.length < 8 || count <= 1){
		passwordstrength.updateStyling('Weak', 'red', 'white');
	}else if(count == 2){
		passwordstrength.updateStyling('Fair', 'yellow', 'black');
	} else {
		passwordstrength.updateStyling('Strong', 'green', 'white');
	}
  }

  // When the contents of the password field changes, update the password strength box
  $('#password').on('input', function() {
    passwordstrength.update($(this).val());
  });

  return passwordstrength;
});
