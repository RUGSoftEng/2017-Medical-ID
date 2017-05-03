define(['jquery'], function($) {

  /**
   * The "settings" module is designed to manage the settings form and handle updating.
   * This includes uploading a profile picture and updating information like name and e-mail.
   * @exports settings
   * @requires jQuery
   */
  var settings = {

    /**
     * Object to store settings prior to sending them to the server for updating.
     * @member {Object}
     */
    values: {},

    /**
     * Endpoint location on the server to send updated settings to.
     * @member {String}
     */
    settingsEndpoint: '/create/settings',

    /**
     * Reference to the input location for the 'name' setting.
     * @member {Object}
     */
    nameInput: $('#inputName'),

    /**
     * Reference to the input location for the 'email' setting.
     * @member {Object}
     */
    emailInput: $('#inputEmail'),

    /**
     * Reference to the input location for the 'cardNum' setting.
     * @member {Object}
     */
    cardNumInput: $('#inputCardNum'),

    /**
     * Reference to the input location of the profile picture.
     * @member {Object}
     */
    pictureInput: $('#uploadPicture'),

    /**
     * Reference to the preview image location of the profile picture.
     * @member {Object}
     */
    picturePreview: $('#picturePreview'),

    /**
     * Limit for pictures to be uploaded in bytes.
     * @member {number}
     */
    imageMax: 500000,

    /**
     * Limit for pictures to be uploaded in words.
     * @member {string}
     */
    imageMaxString: "500Kb"
  };

  /**
   * Wrapper method for the procedure to update the settings.
   * This entails collecting the data, sending them to the server and refreshing on success.
   */
  settings.updateSettings = function() {
    settings.collectSettings();
    settings.sendSettings(function() {
      settings.showMessage("Settings updated successfully");
    });
  }

  /**
   * Method to collect the settings from the form and put them in the module object.
   */
  settings.collectSettings = function() {
    settings.values.name = settings.nameInput.val();
    settings.values.email = settings.emailInput.val();
    settings.values.cardNum = settings.cardNumInput.val();
  }

  /**
   * Method to send settings to the server.
   * @param {method} successCallback - Callback to be called on success.
   */
  settings.sendSettings = function(successCallback) {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(settings.values),
      contentType: 'application/json',
      enctype: 'multipart/form-data',
      url: settings.settingsEndpoint,
      success: function(data) {
        if (data.status == "success") {
          successCallback();
        }
      }
    });
  }

  /**
   * Method to show an error message.
   * @param {String} message - Message to show
   */
  settings.showError = function(message) {
    alert(message);
  }

  /**
   * Method to show a message.
   * @param {String} message - Message to show
   */
  settings.showMessage = function(message) {
    alert(message);
  }

  // LISTENERS
  $('.updateSettings').on('click', function() {
    settings.updateSettings();
  });

  settings.pictureInput.on('change', function() {
    var file = this.files[0];
    if (file.size < settings.imageMax) {
      reader = new FileReader();
      reader.onload = function(e) {
        // Set new picture
        data = e.target.result;
        settings.values.picture = data;
        settings.picturePreview.attr('src', settings.values.picture);
      };
      reader.readAsDataURL(file);
    } else {
      settings.showError("Error: image too large (maximum is " + settings.imageMaxString + ")!");
      $(this).val(null);
    }
  });

  return settings;
});
