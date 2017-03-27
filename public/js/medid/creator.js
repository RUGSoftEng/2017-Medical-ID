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
			label = $(this).find('.medid-label').val();
			field = $(this).find('.medid-field').val();

			//if (label == "") {
      //  fields.push({field: field});
			//} else {
			//	fields.push({label: label, field: field})
			//}

      fields.push({label: label, field: field});

      // Thijs: We might want to get rid of this part
      if (label == "Name") {
        creator.userName = field;
      }
		});
    return fields;
	}

  creator.addField = function (label, field) {
    var field = $("<tr><td><input class='medid-label' maxlength='15' value='" + label + "' type='text' /></td><td><input class='medid-field' maxlength='200' type='text' value='" + field + "' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
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
		creator.addField("",""); // Add empty field
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
