define(['jquery'], function($) {

  var creator = {
    table: $('#fields tbody'),
    userName: "",
    saveEndpoint: "",
    getMethod: function (getFnc) {
      this.getPDF = getFnc;
    },
    downloadMethod: function (downloadFnc) {
      this.downloadPDF = downloadFnc;
    },
    message: $('#message'),
    error: $('#error'),
    imageMax: 500000,
    imageMaxString: "500Kb"
  }

  // Retrieval method for the field data
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

  creator.addField = function (label, field, labelEditable, fieldEditable, labelSize, fieldSize) {
    inputLabel = "<input class='medid-label' maxlength='" + labelSize + "' value='" + label + "' type='text' " + (labelEditable == false ? 'readonly' : '') + " />";
    inputField = "<input class='medid-field' maxlength='" + fieldSize + "' type='text' value='" + field + "' " + (fieldEditable == false ? 'readonly' : '') + " />";
    removeField = "<input class='removeField' type='button' value='Remove' />";
    moveUp = "<span class='glyphicon glyphicon-arrow-up clickable moveUp'></span>";
    moveDown = "<span class='glyphicon glyphicon-arrow-down clickable moveDown'></span>";

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

  /* Might want to reduce these two functions to one */
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

  // Button listeners
  $('.downloadPDF').on('click', function () {
    // Call the function provided by the document-specific engine to download
    creator.downloadPDF("MedicalID.pdf");
  });

  $('.showPDF').on('click', function () {
    if (creator.previewImg) {
      creator.imageHeight = creator.previewImg.height();
      creator.imageWidth = creator.previewImg.width();
    }
    $('#PDFCreate').slideUp(function() {
      previewFrame.src = "/preview_placeholder.html";
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
          creator.showMessage("Data succesfully stored.");
        }
      }
    });
  });



  /* This method must be called by the document-specific
   * controller when it is initialized itself.
   * This method checks for any user data.
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
