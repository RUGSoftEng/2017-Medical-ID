define(['jquery', 'medid/card', 'medid/document'], function($, MIDcard, MIDdocument) {

  /**
   * The creator module power both document creators.
   * It handles all logic behind the form, including retrieval of data.
   * To actually be able to generate documents, the creator needs additional modules corresponding to those documents.
   * These modules can use the fields() method of the creator for input data.
   * The creator also needs to be provided with an endpoint for data persistency.
   * Finally, creator.init() must be called to start the creator form, filling it with pre-set data.
   * @exports creator
   * @requires jQuery
   * @requires card
   * @requires document
   */
  var creator = {

    /**
     * The DIV element containing all the fields of the creator form.
     * @member {Object}
     */
    list: $('#fields'),

    /**
     * Used to possibly store the user's name to use explicitly.
     * @member {string}
     */
    userName: "",

    /**
     * Server endpoint URL for saving the saved data to using POST requests.
     * @member {string}
     */
    saveEndpoint: "",

    /**
     * The element to display messages in.
     * @member {Object}
     */
    message: $('#message'),

    /**
     * The errors to display error messages in.
     * @member {Object}
     */
    error: $('#error'),

    /**
     * The maximum length of a label.
     * @member {number}
     */
    labelSize: 15,

    /**
     * The maximum length of a field.
     * @member {number}
     */
    fieldSize: 57,

    /**
     * The amount of rows selected for the card. Ranges from 1 to 7.
     * @member {number}
     */
    cardNum: null,

    /**
     * The picture object to retrieve (via the src attribute) the profile picture from.
     * @member {Object}
     */
    picture: null,

    /**
     * The image data of the profile picture.
     * @member {String}
     */
    image: null,

    /**
     * The base width of the profile picture as it relates to the height (imageHeight).
     * @member {number}
     */
    imageWidth: 0,

    /**
     * The base height of the profile picture as it relates to the width (imageWidth).
     * @member {number}
     */
    imageHeight: 0
  }

  /**
   * Retrieval method for the field data.
   * Also retrieves the picture.
   * @returns {Array} An array of tuples with label and field values.
   */
	creator.fields = function () {
		var fields = [];

		var label, field;
		creator.list.children('div.fieldBox').each(function () {
      label = $(this).find('.medid-label');
      field = $(this).find('.medid-field');
      inprofile = $(this).find('.toggle').find('.btn-success').is(':visible');

      fields.push({label: label.val(), field: field.val(), inprofile: inprofile});

      // We might want to get rid of this part
      if (label.val() == "Name" && creator.userName == "") {
        creator.userName = field.val();
      }
		});

    if (creator.picture.attr('src') != 'img/placeholder.png') {
      creator.image = creator.picture.attr('src');
      creator.imageWidth = creator.picture.width();
      creator.imageHeight = creator.picture.height();
    }

    return fields;
	}

  /**
   * Method to add a field to the form.
   * The field comes with all necesarry buttons and the complementary listeners.
   * @param {string} label - Pre-set label text. Can be an empty string.
   * @param {string} field - Pre-set field text. Can be an empty string.
   * @param {boolean} inprofile - Boolean denoting whether this field has the "in profile" property.
   */
  creator.addField = function (label, field, inprofile) {
    inputLabel = "<input class='medid-label form-control' maxlength='" + creator.labelSize + "' value='" + label + "' type='text' /></span>";
    inputField = "<span class='input-group-addon'>:</span><input class='medid-field form-control' maxlength='" + creator.fieldSize + "' type='text' value='" + field + "' /></span>";
    removeField = "<button class='removeField btn btn-danger'><svg class='icon-bin'><use xlink:href='/img/icons.svg#icon-bin'></use></svg></button>";
    moveUp = "<span class='clickable moveUp'><svg class='icon-arrow-up'><use xlink:href='/img/icons.svg#icon-arrow-up'></use></svg></span>";
    moveDown = "<span class='clickable moveDown'><svg class='icon-arrow-down'><use xlink:href='/img/icons.svg#icon-arrow-down'></use></svg></span>";
    if (inprofile) {
      toggle = "<div class='toggle' data-toggle='buttons'><label class='btn btn-success'><input type='radio' autocomplete='off'>used</label><label class='btn btn-warning active'><input type='radio' autocomplete='off'>not used</label></div>"
    } else {
      toggle = "<div class='toggle' data-toggle='buttons'><label class='btn btn-success active'><input type='radio' autocomplete='off'>used</label><label class='btn btn-warning'><input type='radio' autocomplete='off'>not used</label></div>"
    }
    operations = "<div class='row'>" + toggle + removeField + "<div class='move-wrapper'>" + moveUp + moveDown + "</div></div>";

    field = $("<div class='fieldBox card'><div class='card-block row'><div class='col-md-6'><div class='input-group'>" + inputLabel + inputField + "</div></div><div class='col-md-6'>" + operations + "</div></div></div>");
		this.list.append(field);

		//The row can be removed again
		field.find('.removeField').on('click', function() {
			$(this).parent().parent().parent().parent().remove();
      creator.colorCardFields();
		});

    // The row can be moved
    field.find('.moveUp').on('click', function() {
			row = $(this).parent().parent().parent().parent().parent();
      row.prev().before(row);
      creator.colorCardFields();
		});

    field.find('.moveDown').on('click', function() {
      row = $(this).parent().parent().parent().parent().parent();
      row.before(row.next());
      creator.colorCardFields();
		});

    // Updating coloring may be necesarry
    creator.colorCardFields();
  }

  /**
   * Bind a Settings object to the creator.
   * @param {Settings} settings - The settings object.
   */
  creator.settings = function (settings) {
    creator.cardNum = settings.cardNumInput.val();
    creator.picture = settings.picturePreview;
    if (creator.picture.attr('src') != 'img/placeholder.png') {
      creator.image = creator.picture.attr('src');
    }

    settings.showError = creator.showError;
    settings.showMessage = creator.showMessage;

    // Listeners
    creator.picture.on('change', function() {
      console.log("Picture changed!");
    });

    settings.cardNumInput.on('change', function() {
      creator.cardNum = $(this).val();
      creator.colorCardFields();
    });
  }

  /**
   * Display a message for 3 seconds in the message object.
   * @param {string} text - Message text.
   */
  creator.showMessage = function (text) {
    creator.message.hide();
    creator.message.text(text);
    creator.message.slideDown();
    setTimeout(function () {
      creator.message.slideUp(function () {
        creator.message.val("");
      });
    }, 3000);
  }

  /**
   * Display an error for 3 seconds in the error object.
   * @param {string} text - Error text.
   */
  creator.showError = function (text) {
    creator.error.hide();
    creator.error.text(text);
    creator.error.slideDown();
    setTimeout(function () {
      creator.error.slideUp(function () {
        creator.error.val("");
      });
    }, 3000);
  }

  /**
   * Update the coloring of the fields to be shown on the card according to the set amount of rows.
   * This amount of rows is read from the cardNum variable, and has to be updated seperately from input.
   */
  creator.colorCardFields = function() {
    creator.list.children().css("background", "#ABC");
    creator.list.children().slice(0,creator.cardNum ).css("background", "#ACA");
  }

  // LISTENERS

	$('.addField').on('click', function() {
    /* Add a field, possibly with preset label or field */
		creator.addField(
      $(this).attr('data-label') || "",
      $(this).attr('data-field') || "",
      !($(this).attr('data-label-editable') == 'false'),
      !($(this).attr('data-field-editable') == 'false'),
      $(this).attr('data-label-size') || 15,
      $(this).attr('data-field-size') || 57
      );
	});

  $('.save').on('click', function() {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(creator.fields()),
      contentType: 'application/json',
      enctype: 'multipart/form-data',
      url: creator.saveEndpoint,
      success: function(data) {
        if (data.status == "success") {
          creator.showMessage("Data successfully stored.");
        }
      }
    });
  });

  $('.createCard').on('click', function() {
    MIDcard.get(creator, function(doc) {
      window.open(doc);
    })
  });

  $('.createDoc').on('click', function() {
    MIDdocument.get(creator, function(doc) {
      window.open(doc);
    })
  });


  /**
   * Starts the creator engine and its form.
   */
  creator.init = function () {
    if (creator.saveEndpoint == "") {
      console.log("Error: no endpoint found for saving this document!")
    } else {
      $.getJSON(creator.saveEndpoint, function(data) {
		    for (i = 0; i < data.length; i++) {
          creator.addField(data[i].label, data[i].field, data[i].inprofile);
        }
        creator.colorCardFields();
        /* Only show the form once it is loaded */
        $('#creatorFormLoading').fadeOut(function () {
          $('#creatorForm').slideDown();
          $('.longloadErr').remove();
        });
      });
      setTimeout(function() {
        if ($('#creatorFormLoading').is(":visible")) {
          $('#creatorFormLoading').after("<p class='longloadErr' id='error_msg'>Things seem to take a bit long. Try refreshing.</p>");
        }
      }, 5000);
    }
  }

  return creator;
});
