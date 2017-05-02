define(['medid/creator', 'medid/util', 'medid/res', 'pdfmake', 'vfs_fonts'], function(Creator, Util) {

	/**
	 * The document module implements document creation functionality upon the creator.js module.
	 * Its main functionality lies in the createPDF method, which generates the Medical ID document PDF.
	 *
	 * @exports MIDdocument
	 * @requires creator
	 * @requires util
	 * @requires pdfMake
	 */
	var MIDdocument = {};

	/**
	 * This style object contains some settings regarding the style of the document.
	 * @member {Object}
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

	/**
	 * The width of the label used in the document.
	 * @member {number}
	 */
	MIDdocument.labelWidth = 160;
	/**
	 * The width and height of the logo in the top right corner of the document.
	 * @member {number}
	 */
	MIDdocument.logoSize = 100;

	/**
	 * Method to generate the Medical ID document PDF.
	 * Uses the fields() method of the creator module as input data.
	 * @returns {Object} The object of the generated document.
	 */
	MIDdocument.createPDF = function (creator) {
		// Get fields from Creator engine, turn them into something useful
		var fields = MIDdocument.parseFields( creator.fields() );

		/* This is the actual final document definition
		 * This object alone defines the creation of the PDF
		 */
		var doc = {
			content: [
				{
					columns: [
						[
							{ text: 'Medical ID', style: 'header' },
							{ text: creator.userName, style: 'subheader' },
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

	/**
	 * Turns the fields the Creator engine provides us with into an object
	 * that can be actually inserted into the object used for creating the PDF.
	 * @param {Array} values - The values provided by the Creator engine.
	 * @param {string} values[].label - The label of the field.
	 * @param {string} values[].field - The text of the field.
	 */
	MIDdocument.parseFields = function (values) {
		var fields = [];
		for (i = 0; i < values.length; i++) {
			if (values[i].inprofile) {
				if (values[i].label) {
					fields.push([{text: values[i].label, bold: true}, values[i].field]);
				} else if (values[i].field) {
					fields.push([{text: values[i].field, colSpan: 2}, {}]);
				}
			}
		}
		return fields;
	}

	// The Creator engine needs to get 2 functions from the document-specific engine
	MIDdocument.get = function (creator, callback) {
		MIDdocument.createPDF(creator).getDataUrl(callback);
	}

	MIDdocument.download = function (name) {
		MIDdocument.createPDF(creator).download(name);
	}

	return MIDdocument;

});
