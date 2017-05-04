define(['medid/util', 'medid/res', 'pdfmake', 'vfs_fonts'], function(Util) {

	/**
	 * The document module implements document creation functionality upon the creator.js module.
	 * Its main functionality lies in the createPDF method, which generates the Medical ID document PDF.
	 *
	 * @exports MIDdocument
	 * @requires util
	 * @requires pdfMake
	 * @required res
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
	 * @param {Creator} creator - The creator object calling the method, needed for input.
	 * @returns {Object} The object of the generated document.
	 */
	MIDdocument.createPDF = function (creator) {
		// Get fields from Creator engine, turn them into something useful
		var fields = MIDdocument.parseFields( creator.fields() );

		var picture;
		if (creator.image) {
			picture = {image: creator.image, width: creator.imageWidth, height: creator.imageHeight}
		} else {
			picture = {image: Resources.med, width: 100}
		}

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
						picture
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
	 * @param {boolean} values[].inprofile - Boolean denoting whether the field is to be included.
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

	/**
	 * Wrapper method to simply get the document PDF as base64.
	 * @param {Creator} creator - The creator object to use.
	 * @param {method} callback - Callback method to return the PDF data.
	 */
	MIDdocument.get = function (creator, callback) {
		MIDdocument.createPDF(creator).getDataUrl(callback);
	}

	/**
	 * Wrapper method to instruct the browser to download the generated document PDF.
	 * @param {Creator} creator - The creator object to use.
	 * @param {String} name - The document name for the document PDF.
	 */
	MIDdocument.download = function (creator, name) {
		MIDdocument.createPDF(creator).download(name);
	}

	return MIDdocument;

});
