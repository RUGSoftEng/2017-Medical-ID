define(['medid/creator', 'medid/util', 'medid/res', 'pdfmake', 'vfs_fonts'], function(Creator, Util) {
	var MIDdocument = {};

	/* This object contains some style information for use in
	 * the actual document object so it does not clutter that object.
	 */
	MIDdocument.documentStyle = {
		header: {
			fontSize: 22,
			bold: true
		},
		subheader: {
			fontSize: 17,
			margin: [20, 0]
		},
		smallSubheader: {
			fontSize: 10,
			margin: [20, 0]
		},
		fields: {
			alignment: 'justify'
		}
	};

	MIDdocument.labelWidth = 160;
	MIDdocument.logoSize = 100;

	/* Method for creating a PDF, returning a pdfMake PDF object.
	 */
	MIDdocument.createPDF = function () {
		// Get fields from Creator engine, turn them into something useful
		var fields = MIDdocument.parseFields( Creator.fields() );

		/* This is the actual final document definition
		 * This object alone defines the creation of the PDF
		 */
		var doc = {
			content: [
				{
					columns: [
						[
							{ text: 'Medical ID', style: 'header' },
							{ text: Creator.userName, style: 'subheader' },
							{ text: "Generated on " + Util.formatDate(), style: 'smallSubheader' }
						],
						{
							image: Resources.med,
							width: MIDdocument.logoSize
						}
					]
				},

				{
					table: {
						widths: [MIDdocument.labelWidth, '*'],
						body: fields
					},
					style: 'fields',
					layout: 'noBorders'
				}
			],

			styles: MIDdocument.documentStyle
		};

	return pdfMake.createPdf(doc);
	}

	/* Turn the fields the Creator engine provides us with into an object
	 * that can be actually inserted into the object used for creating the PDF.
	 */
	MIDdocument.parseFields = function (values) {
		var fields = [];
		for (i = 0; i < values.length; i++) {
			if (values[i].label) {
				fields.push([{text: values[i].label, bold: true}, values[i].field]);
			} else if (values[i].field) {
				fields.push([{text: values[i].field, colSpan: 2}, {}]);
			}
		}
		return fields;
	}

	/* The Creator engine needs to get 2 functions from the document-specific engine
	 */
	Creator.getMethod(function (callback) {
		MIDdocument.createPDF().getDataUrl(callback);
	});
	Creator.downloadMethod(function (name) {
		MIDdocument.createPDF().download(name);
	});
	Creator.saveEndpoint = '/save/document';
	Creator.init();

});
