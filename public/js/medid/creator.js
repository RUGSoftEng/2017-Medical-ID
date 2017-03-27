define(['jquery'], function($) {

  var creator = {
    table: $('#fields tbody'),
    saveEndpoint: "",
    getMethod: function (getFnc) {
      this.getPDF = getFnc;
    },
    downloadMethod: function (downloadFnc) {
      this.downloadPDF = downloadFnc;
    },
    message: $('#message')
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

      fields.push({label: label.val(), field: field.val()});
      //fields.push({label: label.val(), field: field.val(), labelEditable: labelEditable, fieldEditable: fieldEditable});

      // Thijs: We might want to get rid of this part
      if (label == "Name") {
        creator.userName = field;
      }
		});
    return fields;
	}

  creator.addField = function (label, field, labelEditable, fieldEditable) {
    inputLabel = "<input class='medid-label' maxlength='15' value='" + label + "' type='text' " + (labelEditable == false ? 'readonly' : '') + " />";
    inputField = "<input class='medid-field' maxlength='200' type='text' value='" + field + "' " + (fieldEditable == false ? 'readonly' : '') + " />";
    removeField = "<input class='removeField' type='button' value='Remove' />";

    field = $("<tr><td>" + inputLabel + "</td><td>" + inputField + "</td><td>" + removeField + "</td></tr>");
		this.table.append(field);

		//The row can be removed again
		field.find('.removeField').on('click', function() {
			$(this).parent().parent().remove();
		});
  }

  creator.flashSaveSuccess = function () {
    creator.message.hide();
    creator.message.text("Data successfully stored");
    creator.message.fadeIn();
    setTimeout(function () {
      creator.message.fadeOut(function () {
        creator.message.val("");
      });
    }, 1000);
  }

  // Button listeners
  $('.downloadPDF').on('click', function () {
    // Call the function provided by the document-specific engine to download
    creator.downloadPDF("MedicalID.pdf");
  });

  $('.showPDF').on('click', function () {
    // Call the function provided by the document-specific engine to retrieve

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
      !($(this).attr('data-field-editable') == 'false')
      );
	});

  $('.save').on('click', function() {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(creator.fields()),
      contentType: 'application/json',
      url: creator.saveEndpoint,
      success: function(data) {
        if (data.status == "success") {
          creator.flashSaveSuccess();
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
          creator.addField(data[i].label, data[i].field);
        }
        /* Only show the form once it is loaded */
        $('#creatorFormLoading').fadeOut(function () {
          $('#creatorForm').slideDown();
        });
      });
    }
  }

  return creator;
});
