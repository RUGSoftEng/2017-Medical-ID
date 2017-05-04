define(['jspdf', 'jquery', 'medid/res'], function(jsPDF, $) {

	/**
	 * The card module implements card creation functionality upon the creator.js module.
	 * Its main functionality lies in the createPDF method, which generates the Medical ID card PDF.
	 *
	 * @exports MIDcard
	 * @requires jquery
	 * @requires jsPDF
	 * @required res
	 */
	var MIDcard = {};

	/**
	 * Helper method to draw a card shape of a credit card size on a given document.
	 * @param {jsPDF} doc - Document to draw the card upon
	 * @param {number} x - Horizontal location of the card in the document in millimeters.
	 * @param {number} y - Horizontal location of the card in the document in millimeters.
	 * @param {number} barSize - Height of the red bar that is automatically added to the card.
	 */
	MIDcard.drawCard = function (doc, x, y, barSize) {
		doc.setFillColor(200,0,0)
		doc.setDrawColor(0,0,0)
		doc.roundedRect(x,y,85.6,53.98,3,3,'F')
		doc.setFillColor(255,255,255)
		doc.setDrawColor(255,255,255)
		doc.roundedRect(x, y + barSize,85.6,38.98,3,3,'F')
		doc.rect(x, y + barSize,85.6,10,'F')
		doc.setDrawColor(0,0,0)
		doc.roundedRect(x,y,85.6,53.98,3,3,'S')
		}

	/**
	 * Method to generate the Medical ID card PDF.
	 * Uses the fields() method of the creator module as input data.
	 * @param {Creator} creator - The creator object calling the method, needed for input.
	 * @param {method} callback - Callback to return the jsPDF document object.
	 */
	MIDcard.createPDF = function (creator, callback) {

		var fields = creator.fields();
		var doc = new jsPDF();

		doc.setFont('helvetica');

		// Front side
		MIDcard.drawCard(doc, 10, 10, 15);

		//Labels
		doc.setFontSize(9);

		var leftCounter = 0, rightCounter = 0;
		var leftStartPos = [12,55], rightStartPos = [38,30];
		var lineHeight = 5, leftLabelWidth = 19, rightLabelWidth = 21;
		for (i = 0; i < fields.length && i < creator.cardNum; i++) {
			fields[i].label = fields[i].label.substring(0, 13);
			fields[i].field = fields[i].field.substring(0, 19);
			if (fields[i].label == 'Donor' || fields[i].label == 'Blood type') {
				// We place the short fields 'donor' and 'blood type' in the corner
				if (leftCounter < 2) { // Max capacity
					doc.setFontStyle("bold");
					doc.text(leftStartPos[0], leftStartPos[1] + lineHeight * leftCounter, fields[i].label + ": ");
					doc.setFontStyle("normal");
					doc.text(leftStartPos[0] + leftLabelWidth, leftStartPos[1] + lineHeight * leftCounter, fields[i].field);
				}
				leftCounter++;
			}
			else {
				// Place remaining lines on the main part of the card
				if (rightCounter < 7) { // Max capacity
					doc.setFontStyle("bold");
					doc.text(rightStartPos[0], rightStartPos[1] + lineHeight * rightCounter, fields[i].label + ": ");
					doc.setFontStyle("normal");
					doc.text(rightStartPos[0] + rightLabelWidth, rightStartPos[1] + lineHeight * rightCounter, fields[i].field);
				}
				rightCounter++;
			}
		}

		if (creator.image) {
			doc.addImage(creator.image , 13, 28, creator.imageWidth/4.5, creator.imageHeight/4.5);
		} else {
			doc.addImage(Resources.placeholder , 11, 26, 23, 23);
		}

		// Back side
		MIDcard.drawCard(doc, 100, 10, 15);

		// Header bars
		doc.addImage(Resources.redLogo,'JPEG', 12,12,12,12);
		doc.setTextColor(255,255,255);
		doc.setFontSize(16);
		doc.text(25, 19.5, "MEDICAL INFORMATION");
		doc.setFontSize(14);
		doc.text(104, 19, "SCAN FOR MORE INFORMATION");

		// Retrieving QR code from server
		$.get('/save/qr', function(qrcode) {
			doc.addImage(qrcode, 'JPEG', 123, 25, 38, 38);
			callback(doc);
		})
	}

	/**
	 * Wrapper method to simply get the card PDF as base64.
	 * @param {Creator} creator - The creator object to use.
	 * @param {method} callback - Callback method to return the PDF data.
	 */
	MIDcard.get = function (creator, callback) {
		MIDcard.createPDF(creator, function(doc) {
			callback(doc.output('datauristring'));
		});
	}

	/**
	 * Wrapper method to instruct the browser to download the generated card PDF.
	 * @param {Creator} creator - The creator object to use.
	 * @param {String} name - The document name for the card PDF.
	 */
	MIDcard.download = function (creator, name) {
		MIDcard.createPDF(creator, function(doc) {
			doc.save(name);
		});
	}

	return MIDcard;

});
