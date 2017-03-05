//Adds a field HTML row in the table
function addField() {
	$('#fields').append("<tr><td><input class='label' maxlength='15' type='text' /></td><td><input class='field' maxlength='100' type='text' /></td><td><input class='removeField' type='button' value='Remove' /></td></tr>");
	}

//A listener for a click on a 'remove' button
$(document).on('click', '.removeField', function() {
    $(this).parent().parent().remove();
});

//This object is used to store the methods and constants to generate the PDF
var MedicalDocument = {
	inset: 30,
	logoSize: 30,
	pageWidth: 210
	}

//Method to retrieve values from the form
MedicalDocument.parseValues = function () {	
	MedicalDocument.fields = {}
	
	$('.field').each(function () {
		MedicalDocument.fields[$(this).attr('id')] = $(this).val();
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

MedicalDocument.drawCard = function (doc, x, y, barSize) {
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

//Method to generate a PDF and present it to the user
MedicalDocument.buildPDF = function () {
	MedicalDocument.parseValues();
	var field = MedicalDocument.fields;
	var doc=new jsPDF();
	
	doc.setFont('helvetica');
	MedicalDocument.drawCard(doc, 10, 10, 15);
	doc.addImage(Resources.placeholder, 12, 27, 23, 23);

	//Labels
	doc.setFontSize(9);
	doc.setFontStyle("bold");
	doc.text(40, 30, "Name: ");
	doc.text(40, 35, "Age: ");
	doc.text(40, 40, "Insurance: ");
	doc.text(40, 50, "Emergency contacts: ");
	doc.text(12, 55, "Blood type: ");
	doc.text(12, 60, "Donor: ");
	//Emergency contacts
	doc.text(40, 55, field['contact1_type'] + ": ");
	doc.text(40, 60, field['contact2_type'] + ": ");
	
	//Data
	doc.setFontStyle("normal");
	doc.text(57, 30, field['name']); //Name
	doc.text(57, 35, field['age']); //Age
	doc.text(57, 40, field['insurance']); //Insurance
	doc.text(57, 45, "ID: " + field['insuranceID']); //Insurance ID
	doc.text(31, 55, field['bloodType']); //Blood type
	doc.text(31, 60, field['donor']); //Donor
	//Emergency contacts
	doc.text(55, 55, field['contact1_name'] + "  " + field['contact1_phone']);
	doc.text(55, 60, field['contact2_name'] + "  " + field['contact2_phone']);
	
	//Backside
	MedicalDocument.drawCard(doc, 100, 10, 15);
	doc.setFontStyle('normal');
	doc.text(110, 40, "This is an example card.");
	doc.text(110, 44, "The functional version of this card is reserved");
	doc.text(110, 48, "for registered users.");
	
	//Header bars
	doc.addImage(Resources.redLogo,'JPEG', 12,12,12,12);
	doc.setTextColor(255,255,255);
	doc.setFontSize(16);
	doc.text(25, 19.5, "MEDICAL INFORMATION");
	doc.setFontSize(14);
	doc.text(104, 19, "SCAN FOR MORE INFORMATION");
	
	//Output the PDF to the user
	doc.save("medicalID_card.pdf");
}