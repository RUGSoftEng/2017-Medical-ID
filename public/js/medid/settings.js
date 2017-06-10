/**
 * The "Settings" module is designed to manage the Settings form and handle updating.
 * This includes uploading a profile picture and updating information like name and e-mail.
 * @exports Settings
 * @requires jQuery
 */
var Settings = {

  /**
   * Object to store Settings prior to sending them to the server for updating.
   * @member {Object}
   */
  values: {},

  /**
   * Endpoint location on the server to send updated Settings to.
   * @member {String}
   */
  SettingsEndpoint: '/create/Settings',

  /**
   * Reference to the input location for the 'name' setting.
   * @member {Object}
   */
  nameInput: $('#inputName'),

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
   * Reference to the delete account button.
   * @member {Object}
   */
  removeButton: $('#removeAccount'),

  /**
   * Reference to the delete account form.
   * @member {Object}
   */
  removeForm: $('#removeForm'),

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
 * Wrapper method for the procedure to update the Settings.
 * This entails collecting the data, sending them to the server and refreshing on success.
 */
Settings.updateSettings = function() {
  Settings.collectSettings();
  Settings.sendSettings(function() {
    Settings.showMessage("Settings updated successfully");
  });
}

/**
 * Method to collect the Settings from the form and put them in the module object.
 */
Settings.collectSettings = function() {
  Settings.values.name = Settings.nameInput.val();
  Settings.values.picture = Settings.picturePreview.attr('src');
}

/**
 * Method to send Settings to the server.
 * @param {method} successCallback - Callback to be called on success.
 */
Settings.sendSettings = function(successCallback) {
  $.ajax({
    type: 'POST',
    data: JSON.stringify(Settings.values),
    contentType: 'application/json',
    enctype: 'multipart/form-data',
    url: Settings.SettingsEndpoint,
    success: function(data) {
      if (data.status == "success") {
        successCallback();
      }
    }
  });
}

/**
 * Method to show an error message.
 * To be overridden by a bound creator module.
 * @param {String} message - Message to show
 */
Settings.showError = function(message) {
  alert(message);
}

/**
 * Method to show a message.
 * To be overridden by a bound creator module.
 * @param {String} message - Message to show
 */
Settings.showMessage = function(message) {
  alert(message);
}

// LISTENERS
Settings.nameInput.on('change', function() {
  Settings.updateSettings();
});

Settings.pictureInput.on('change', function() {
  var file = this.files[0];
  if (file.size < Settings.imageMax) {
    reader = new FileReader();
    reader.onload = function(e) {
      // Set new picture
      data = e.target.result;
      Settings.values.picture = data;
      Settings.picturePreview.attr('src', Settings.values.picture);
      Settings.updateSettings();
    }
    reader.readAsDataURL(file);
  } else {
    Settings.showError("Error: image too large (maximum is " + Settings.imageMaxString + ")!");
    $(this).val(null);
  }
});

Settings.removeButton.on('click', function() {
  if (Settings.removeForm.is(':visible')) {
    Settings.removeForm.slideUp();
    Settings.removeButton.removeClass('btn-secondary');
    Settings.removeButton.addClass('btn-danger');
  } else {
    Settings.removeForm.slideDown();
    Settings.removeButton.addClass('btn-secondary');
    Settings.removeButton.removeClass('btn-danger');
  }
})
