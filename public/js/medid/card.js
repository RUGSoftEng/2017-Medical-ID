define(['medid/creator', 'jquery', 'jspdf', 'medid/res'], function(Creator, $, jsPDF) {

	var MIDcard = {};
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

	MIDcard.createPDF = function () {
		var fields = Creator.fields();
		var doc = new jsPDF();

		doc.setFont('helvetica');

		// Front side
		MIDcard.drawCard(doc, 10, 10, 15);
		doc.addImage(Resources.placeholder, 12, 27, 23, 23);

		//Labels
		doc.setFontSize(9);

		var leftCounter = 0, rightCounter = 0;
		var leftStartPos = [12,55], rightStartPos = [40,30];
		var lineHeight = 5, leftLabelWidth = 19, rightLabelWidth = 21;
		for (i = 0; i < fields.length; i++) {
			if (fields[i].label == 'Donor' || fields[i].label == 'Blood type') {
				// We place the short fields 'donor' and 'blood type' in the corner
				if (leftCounter <= 2) { // Max capacity
					doc.setFontStyle("bold");
					doc.text(leftStartPos[0], leftStartPos[1] + lineHeight * leftCounter, fields[i].label + ": ");
					doc.setFontStyle("normal");
					doc.text(leftStartPos[0] + leftLabelWidth, leftStartPos[1] + lineHeight * leftCounter, fields[i].field);
				}
				leftCounter++;
			}
			else {
				// Place remaining lines on the main part of the card
				if (leftCounter <= 7) { // Max capacity
					doc.setFontStyle("bold");
					doc.text(rightStartPos[0], rightStartPos[1] + lineHeight * rightCounter, fields[i].label + ": ");
					doc.setFontStyle("normal");
					doc.text(rightStartPos[0] + rightLabelWidth, rightStartPos[1] + lineHeight * rightCounter, fields[i].field);
				}
				rightCounter++;
			}
		}

		/*
		doc.setFontStyle("bold");
		doc.text(40, 30, "Name: ");
		doc.text(40, 35, "Age: ");
		doc.text(40, 40, "Insurance: ");
		doc.text(40, 50, "Emergency contacts: ");
		doc.text(12, 55, "Blood type: ");
		doc.text(12, 60, "Donor: ");
		// Emergency contacts
		doc.setFontStyle("italic");

		// Data
		doc.setFontStyle("normal");
		doc.text(57, 30, fields['Name']); //Name
		doc.text(57, 35, fields['Age']); //Age
		doc.text(57, 40, fields['Insurance']); //Insurance
		doc.text(57, 45, "ID: " + fields['Insurance ID']); //Insurance ID
		doc.text(31, 55, fields['Blood type']); //Blood type
		doc.text(31, 60, fields['Donor']); //Donor
		// Emergency contacts
		*/

		// Back side
		MIDcard.drawCard(doc, 100, 10, 15);
		doc.setFontStyle('normal');
		doc.text(110, 40, "This is an example card.");
		doc.text(110, 44, "The functional version of this card is reserved");
		doc.text(110, 48, "for registered users.");

		// Header bars
		doc.addImage(Resources.redLogo,'JPEG', 12,12,12,12);
		doc.setTextColor(255,255,255);
		doc.setFontSize(16);
		doc.text(25, 19.5, "MEDICAL INFORMATION");
		doc.setFontSize(14);
		doc.text(104, 19, "SCAN FOR MORE INFORMATION");

		return doc;
	}

	/*
	MIDcard.parseFields = function (values) {
		var fields = {};
		for (i = 0; i < values.length; i++) {
			fields[values[i].label] = values[i].field;
		}
		return fields;
	}*/

	Creator.getMethod(function (callback) {
		callback(MIDcard.createPDF().output('datauristring')); //getDataUrl(callback);
	});
	Creator.downloadMethod(function (name) {
		MIDcard.createPDF().save(name);
	});
	Creator.saveEndpoint = '/save/card';
	Creator.init();

});
