//Adds a field HTML row in the table
function addField() {
	$('#fields').append("<tr><td><input class='label' maxlength='15' type='text' /></td><td><input class='field' maxlength='200' type='text' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
	}

//A listener for a click on a 'remove' button
$(document).on('click', '.removeField', function() {
    $(this).parent().parent().remove();
});

MedicalDocument = {};

//Method to retrieve values from the form
MedicalDocument.parseValues = function () {	
	MedicalDocument.fields = [];
	
	var label, field;
	$('#fields tbody').children('tr').each(function () {
		label = $(this).find('.label').val();
		field = $(this).find('.field').val();
		
		if (label == "") {
			MedicalDocument.fields.push([{text: field, colSpan: 2}, {}]);
		} else {
			MedicalDocument.fields.push([{text: label, bold: true}, field]);
		}
		
		if (label == 'Name') {
			MedicalDocument.name = field;
		}
	});
}

//Method to generate a nicely formatted date
MedicalDocument.formatDate = function () {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	dd = (dd < 10 ? '0' + dd : dd);
	mm = (mm < 10 ? '0' + mm : mm);

	return dd + '-' + mm + '-' + yyyy;
	}

//Method to generate a PDF and present it to the user
MedicalDocument.buildPDF = function () {
	this.parseValues()
	
	var doc = {
		content: [
			{
				columns: [
					[
						{ text: 'Medical ID', style: 'header' },
						{ text: MedicalDocument.name, margin: [20, 0], style: 'subheader' },
						{ text: "Generated on " + MedicalDocument.formatDate(), margin: [20, 0], style: 'small' }
					],
					{
						image: Resources.med,
						width: 100
					}
				]
			},
			
			{
				table: {
					widths: [160, '*'],
					body: MedicalDocument.fields
				},
				style: 'fields',
				layout: 'noBorders'
			}
		],
		
		styles: {
			header: {
				fontSize: 22,
				bold: true
			},
			subheader: {
				fontSize: 17,
			},
			small: {
				fontSize: 10,
			},
			fields: {
				alignment: 'justify'
			}
		}
	};
	
	pdfMake.createPdf(doc).download('MedicalID.pdf');
}