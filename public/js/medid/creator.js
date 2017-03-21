define(['jquery'], function($) {
  $('#PDFPreview').hide();

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

			if (label == "") {
				fields.push([{text: field, colSpan: 2}, {}]);
			} else {
				fields.push([{text: label, bold: true}, field]);
			}

			if (label == 'Name') {
				creator.userName = field;
			}
		});
    return fields;
	}


  // Button listeners
  $('.downloadPDF').on('click', function () {
    creator.downloadPDF("MedicalID.pdf");
  });

  $('.showPDF').on('click', function () {
  	creator.getPDF(function(data) {
  		previewFrame.src = data;
  		$('#PDFCreate').fadeOut(function() {
  			$('#PDFPreview').fadeIn();
  		});
  	});
  });

  $('.hidePDF').on('click', function () {
  	$('#PDFPreview').fadeOut(function() {
  		$('#PDFCreate').fadeIn();
  	});
  	previewFrame.src = '';
  });

	$('.addField').on('click', function() {
		var field = $("<tr><td><input class='medid-label' maxlength='15' type='text' /></td><td><input class='medid-field' maxlength='200' type='text' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
		creator.table.append(field);

		//The row can be removed again
		field.find('.removeField').on('click', function() {
			$(this).parent().parent().remove();
		});
	});

  return creator;
});
