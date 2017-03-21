define(['jquery','medid/util','medid/creator','medid/res','pdfmake','vfs_fonts'], function($, Util, Creator) {
	$('#PDFPreview').hide();
	var MIDdocument = {};

	MIDdocument.createPDF = function () {
		var values = Creator.fields();

		var doc = {
			content: [
				{
					columns: [
						[
							{ text: 'Medical ID', style: 'header' },
							{ text: Creator.userName, margin: [20, 0], style: 'subheader' },
							{ text: "Generated on " + Util.formatDate(), margin: [20, 0], style: 'small' }
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
						body: values
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

	return pdfMake.createPdf(doc);
	}

	Creator.getMethod(function (callback) {
		MIDdocument.createPDF().getDataUrl(callback);
	});
	Creator.downloadMethod(function (name) {
		MIDdocument.createPDF().download(name);
	});

});

/*
$(function() {
	previewFrame.src = '';
	});

//Adds a field HTML row in the table
function addField() {
	$('#fields').append("<tr><td><input class='medid-label' maxlength='15' type='text' /></td><td><input class='medid-field' maxlength='200' type='text' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
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
		label = $(this).find('.medid-label').val();
		field = $(this).find('.medid-field').val();

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


MedicalDocument.showPDF = function () {
	MedicalDocument.buildPDF();
	pdfMake.createPdf(MedicalDocument.doc).getDataUrl(function(data) {
		previewFrame.src = data;
		$('#PDFCreate').fadeOut(function() {
			$('#PDFPreview').fadeIn();
			});
		});
}

MedicalDocument.hidePDF = function () {
	$('#PDFPreview').fadeOut(function() {
		$('#PDFCreate').fadeIn();
		});
	previewFrame.src = '';
}

MedicalDocument.downloadPDF = function () {
	pdfMake.createPdf(MedicalDocument.doc).download("MedicalID_document.pdf");
}

//Method to generate a PDF and present it to the user
MedicalDocument.buildPDF = function () {
	this.parseValues();

	MedicalDocument.doc = {
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
}
*/
