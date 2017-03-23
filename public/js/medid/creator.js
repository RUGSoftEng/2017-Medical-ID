define(['jquery'], function($) {

  var creator = {
    table: $('#fields tbody'),
    getMethod: function (getFnc) {
      this.getPDF = getFnc;
    },
    downloadMethod: function (downloadFnc) {
      this.downloadPDF = downloadFnc;
    }
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
		var field = $("<tr><td><input class='medid-label' maxlength='15' type='text' /></td><td><input class='medid-field' maxlength='200' type='text' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
		creator.table.append(field);

		//The row can be removed again
		field.find('.removeField').on('click', function() {
			$(this).parent().parent().remove();
		});
	});

  $('.saveCard').on('click', function() {
    $.post("/save/card", {'card[]': creator.fields()});
  });

  $('.saveDoc').on('click', function() {
    $.post("/save/document", JSON.stringify({'document': creator.fields()}));
  });

  return creator;
});
