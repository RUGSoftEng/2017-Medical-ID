define(['jquery'], function($) {

  /**
   * The creator module power both document creators.
   * It handles all logic behind the form, including retrieval of data.
   * To actually be able to generate documents, the creator must be fed two methods: one to generate and one to download the pdf.
   * These methods can use the fields() method of the creator for input data.
   * The creator also needs to be provided with an endpoint for data persistency.
   * Finally, creator.init() must be called to start the creator form, filling it with pre-set data.
   * @exports creator
   * @requires jQuery
   */
  var creator = {
    /**
     * The TBODY element containing all the field rows of the creator form.
     * @member {Object}
     */
    table: $('#fields tbody'),
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
     * Method to feed the method for creating PDF's.
     * @param {method} getFnc - The method to call for downloading the PDF of the specific document.
     * The method is passed a callback to return the PDF data URI to the creator engine.
     */
    getMethod: function (getFnc) {
      this.getPDF = getFnc;
    },
    /**
     * Method to feed the method for downloading PDF's.
     * @param {method} downloadFnc - The method to call for downloading the PDF of the specific document.
     * The method is passed 1 parameter on using, which is the desired file name.
     */
    downloadMethod: function (downloadFnc) {
      this.downloadPDF = downloadFnc;
    },
    /**
     * The element to display messages in.
     * @member {Object}
     */
    message: $('#message'),
    /**
     * The errors to display messages in.
     * @member {Object}
     */
    error: $('#error'),
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
  }

  /**
   * Retrieval method for the field data.
   * @returns {Array} An array of tuples with label and field values.
   */
	creator.fields = function () {
		var fields = [];

		var label, field;
		creator.table.children('tr').each(function () {
      label = $(this).find('.medid-label');
      field = $(this).find('.medid-field');
      //labelEditable = label.is('[readonly]');
      //fieldEditable = field.is('[readonly]');

      if (label.val() == 'Image' && $(this).attr('id') != 'image') {
        //Don't add it as it is not an actual image
      } else {
        fields.push({label: label.val(), field: field.val()});
      }
      //fields.push({label: label.val(), field: field.val(), labelEditable: labelEditable, fieldEditable: fieldEditable});

      // We might want to get rid of this part
      if (label.val() == "Name" && creator.userName == "") {
        creator.userName = field.val();
      }
		});
    return fields;
	}

  /**
   * Method to add a field to the form.
   * The field comes with all necesarry buttons and the complementary listeners.
   * @param {string} [label] - Pre-set label text. Label is empty by default.
   * @param {string} [field] - Pre-set field text. Field is empty by default.
   * @param {boolean} [labelEditable] - Boolean stating whether the label will be editable.
   * @param {boolean} [labelEditbale] - Boolean stating whether the field will be editable.
   * @param {number} [labelSize] - Maximum size of the label in number of characters.
   * @param {number} [fieldSize] - Maximum size of the field in number of characters.
   */
  creator.addField = function (label, field, labelEditable, fieldEditable, labelSize, fieldSize) {
    inputLabel = "<input class='medid-label' maxlength='" + labelSize + "' value='" + label + "' type='text' " + (labelEditable == false ? 'readonly' : '') + " />";
    inputField = "<input class='medid-field' maxlength='" + fieldSize + "' type='text' value='" + field + "' " + (fieldEditable == false ? 'readonly' : '') + " />";
    removeField = "<input class='removeField' type='button' value='Remove' />";
    moveUp = "<span class='clickable moveUp'><img src='/img/up.png'></img></span>";
    moveDown = "<span class='clickable moveDown'><img src='/img/down.png'></img></span>";

    field = $("<tr><td>" + inputLabel + "</td><td>" + inputField + "</td><td>" + removeField + "</td><td>" + moveUp + moveDown + "</td></tr>");
		this.table.append(field);

		//The row can be removed again
		field.find('.removeField').on('click', function() {
			$(this).parent().parent().remove();
		});

    field.find('.moveUp').on('click', function() {
			row = $(this).parent().parent();
      row.prev().before(row);
		});

    field.find('.moveDown').on('click', function() {
      row = $(this).parent().parent();;
      row.before(row.next());
		});
  }

  /**
   * Method to add an image input field to the form.
   * If the image input field is already there, set the image to the data variable.
   * @param {string} [data] - Data URI representing the (pre-set) picture.
   */
  creator.imageField = function (data) {
    firstField = this.table.children('tr').first();
    if (firstField.attr('id') == 'image') {
      if (data && data != "") {
          firstField.find('img').attr('src', data);
          firstField.find('.medid-field').attr('value', data);
      }
    } else {
      removeField = "<input class='removeField' type='button' value='Remove' />";
      inputField = "<input class='medid-field' type='hidden' value='" + (data || "") + "' />";
      field = $('<tr id="image"><td><input class="medid-label" value="Image" readonly /></td><td><img class="previewImg" src="' + (data || "") + '" /><input id="upload" name="file" type="file" />' + inputField + '</td><td>' + removeField + '</td></tr>');
      this.table.prepend(field);

      creator.previewImg = field.find('img');

      // The row can be removed again
  		field.find('.removeField').on('click', function() {
  			$(this).parent().parent().remove();
  		});

      field.find('#upload').on('change', function() {
        var file = this.files[0];
        if (file.size < creator.imageMax) {
          reader = new FileReader();
          reader.onload = function(e) {
            data = e.target.result;
            field.find('.medid-field').val(data);
            creator.previewImg.attr('src', data);
          };
          reader.readAsDataURL(file);
        } else {
          creator.showError("Error: image to large (maximum is " + creator.imageMaxString + ")!");
          $(this).val(null);
        }
      });
    }
  }

  /**
   * Display a message for 1 second in the message object.
   * @param {string} text - Message text.
   */
  creator.showMessage = function (text) {
    creator.message.hide();
    creator.message.text(text);
    creator.message.fadeIn();
    setTimeout(function () {
      creator.message.fadeOut(function () {
        creator.message.val("");
      });
    }, 1000);
  }

  /**
   * Display an error for 1 second in the error object.
   * @param {string} text - Error text.
   */
  creator.showError = function (text) {
    creator.error.hide();
    creator.error.text(text);
    creator.error.fadeIn();
    setTimeout(function () {
      creator.error.fadeOut(function () {
        creator.error.val("");
      });
    }, 1000);
  }


  $('.downloadPDF').on('click', function () {
    // Call the function provided by the document-specific engine to download
    creator.downloadPDF("MedicalID.pdf");
  });

  $('.showPDF').on('click', function () {
    if (creator.previewImg) {
      creator.imageHeight = creator.previewImg.height();
      creator.imageWidth = creator.previewImg.width();
    }
    // Call the function provided by the document-specific engine to retrieve
  	previewFrame.src = "/preview_placeholder.html";
    $('#PDFCreate').slideUp(function() {
      $('#PDFPreview').slideDown();
      creator.getPDF(function(data) {
		  previewFrame.src = data;
  	  });
  	});
  });

  $('.hidePDF').on('click', function () {
  	$('#PDFPreview').slideUp(function() {
  		$('#PDFCreate').slideDown();
      previewFrame.src = '';
  	});
  });

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

  $('.addImage').on('click', function() {
    creator.imageField();
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



  /**
   * This method must be called by the document-specific controller when it is initialized itself.
   * This method checks for any user data and puts it into the pre-set form.
   */
  creator.init = function () {
    if (creator.saveEndpoint == "") {
      console.log("Error: no endpoint found for saving this document!")
    } else {
      $.getJSON(creator.saveEndpoint, function(data) {
        for (i = 0; i < data.length; i++) {
          if (data[i].label == "Image") {
            creator.imageField(data[i].field);
          } else {
            creator.addField(data[i].label, data[i].field);
          }
        }
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
