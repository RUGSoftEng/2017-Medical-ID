/**
 * The Creator module power both document Creators.
 * It handles all logic behind the form, including retrieval of data.
 * To actually be able to generate documents, the Creator needs additional modules corresponding to those documents.
 * These modules can use the fields() method of the Creator for input data.
 * The Creator also needs to be provided with an endpoint for data persistency.
 * Finally, Creator.init() must be called to start the Creator form, filling it with pre-set data.
 * @exports Creator
 * @requires jQuery
 * @requires card
 * @requires document
 */
var Creator = {

    /**
     * The DIV element containing all the fields of the Creator form.
     * The element is set to sortable to allow reordering of fields through drag and drop.
     * @member {Object}
     */
    list: $('#fields').sortable({
        axis: "y",
        cursor: "move",
        tolerance: "pointer",
        containment: "parent",
        update: function (event, ui) {
            Creator.cardNum = Creator.seperator.prevAll().length;
            if (Creator.cardNum > 7) {
                $('#fields .fieldBox:nth-child(7)').after(Creator.seperator);
                Creator.cardNum = 7;
            }
            Creator.colorCardFields();
            Creator.saveFields();
        }
    }),

    /**
     * The seperator element.
     * @member {Object}
     */
    seperator: $('#seperator'),

    /**
     * Used to possibly store the user's name to use explicitly.
     * @member {string}
     */
    userName: "",

    /**
     * Server endpoint URL for saving the saved data to using POST requests.
     * @member {string}
     */
    saveEndpoint: "",

    /**
     * Boolean on whether the fields should be saved.
     * @member {string}
     */
    saveEnabled: false,

    /**
     * The element to display messages in.
     * @member {Object}
     */
    message: $('#message'),

    /**
     * The errors to display error messages in.
     * @member {Object}
     */
    error: $('#error'),

    /**
     * The maximum length of a label.
     * @member {number}
     */
    labelSize: 30,

    /**
     * The maximum length a label on the card.
     * @member {number}
     */
    cardLabelSize: MIDcard.labelSize,

    /**
     * The maximum length of a field.
     * @member {number}
     */
    fieldSize: 200,

    /**
     * The maximum length a label on the card.
     * @member {number}
     */
    cardFieldSize: MIDcard.fieldSize,

    /**
     * The amount of rows selected for the card. Ranges from 1 to 7.
     * @member {number}
     */
    cardNum: null,

    /**
     * The element containing the user's name.
     * @member {Object}
     */
    name: null,

    /**
     * The picture object to retrieve (via the src attribute) the profile picture from.
     * @member {Object}
     */
    picture: null,

    /**
     * The image data of the profile picture.
     * @member {String}
     */
    image: null,

    /**
     * The base width of the profile picture as it relates to the height (imageHeight).
     * @member {number}
     */
    imageWidth: 0,

    /**
     * The base height of the profile picture as it relates to the width (imageWidth).
     * @member {number}
     */
    imageHeight: 0
}

/**
 * Retrieval method for the field data.
 * Also retrieves the picture.
 * @returns {Array} An array of tuples with label and field values, along with the in-profile boolean.
 */
Creator.fields = function () {
    var fields = [];
    var label, field;

    Creator.list.children('.fieldBox').each(function () {
        label = $(this).find('.medid-label');
        field = $(this).find('.medid-field');
        inprofile = $(this).find('.toggle').find('.btn-success').is(':visible');

        fields.push({
            label: label.val(),
            field: field.val(),
            inprofile: inprofile
        });
    });

    Creator.userName = Creator.name.val();

    if (Creator.picture.attr('src') != 'img/placeholder.png') {
        Creator.image = Creator.picture.attr('src');
        Creator.imageWidth = Creator.picture.width();
        Creator.imageHeight = Creator.picture.height();
    }

    return fields;
}

/**
 * Method to add a field to the form.
 * The field comes with all necesarry buttons and the complementary listeners.
 * @param {string} label - Pre-set label text. Can be an empty string.
 * @param {string} field - Pre-set field text. Can be an empty string.
 * @param {boolean} inprofile - Boolean denoting whether this field has the "in profile" property.
 */
Creator.addField = function (label, field, inprofile) {
    inputLabel = $('<input></input>')
        .addClass('medid-label form-control')
        .attr('maxlength', Creator.labelSize)
        .attr('type', 'text')
        .val(label);

    colon = $('<span></span>')
        .addClass('input-group-addon')
        .html(' ');

    inputField = $('<input></input>')
        .addClass('medid-field form-control')
        .attr('maxlength', Creator.fieldSize)
        .attr('type', 'text')
        .val(field);

    inputGroup = $('<div></div>')
        .addClass('input-group')
        .append([inputLabel, colon, inputField]);

    removeField = $('<button></button>')
        .addClass('removeField btn btn-danger')
        .html("<img src='/img/bin.png' class='icon'></img>");

    moveUp = $('<span></span>')
        .addClass('clickable moveUp')
        .html("<img src='/img/up.png' class='icon'></img>");

    moveDown = $('<span></span>')
        .addClass('clickable moveDown')
        .html("<img src='/img/down.png' class='icon'></img>");

    toggle = $('<div></div>')
        .addClass('toggle')
        .attr('data-toggle', 'buttons')
        .append(
            $('<label></label>')
            .addClass('btn btn-success' + (inprofile ? '' : ' active'))
            .append(
                $('<input></input>')
                .attr('type', 'radio')
                .attr('autocomplete', 'off')
            )
            .append('public')
        )
        .append(
            $('<label></label>')
            .addClass('btn btn-warning' + (inprofile ? ' active' : ''))
            .append(
                $('<input></input>')
                .attr('type', 'radio')
                .attr('autocomplete', 'off')
            )
            .append('private')
        );

    operations = $('<div></div>')
        .addClass('row')
        .addClass('justify-content-around')
        .append(toggle)
        .append(removeField)
        .append(
            $('<div></div>')
            .addClass('move-wrapper')
            .append(moveUp)
            .append(moveDown)
        );

    field = $('<div></div>')
        .addClass('fieldBox card')
        .append(
            $('<div></div>')
            .addClass('card-block row')
            .append(
                $('<div></div>')
                .addClass('col-md-8')
                .append(inputGroup)
            )
            .append(
                $('<div></div>')
                .addClass('col-md-4')
                .append(operations)
            )
        );

    toggle.on('click', function () {
        Creator.saveFields();
    });

    // Remove the field
    removeField.on('click', function () {
        $(this).parent().parent().parent().parent().remove();
        Creator.colorCardFields();
        Creator.saveFields();
    });

    // Move the field
    moveUp.on('click', function () {
        row = $(this).parent().parent().parent().parent().parent();
        row.prev().before(row);
        Creator.colorCardFields();
        Creator.saveFields();
    });

    moveDown.on('click', function () {
        row = $(this).parent().parent().parent().parent().parent();
        row.before(row.next());
        Creator.colorCardFields();
        Creator.saveFields();
    });

    // Keep track of the input lengths
    inputLabel.on('change', function () {
        colon = $(this).next();

        if ($(this).val().length > Creator.cardLabelSize) {
            $(this).addClass('red-border');

            if (colon.html() == ' ') {
                colon
                    .addClass('warning-block')
                    .append($('<span></span>').addClass('fa fa-warning'));
            }
        } else {
            $(this).removeClass('red-border');

            if (colon.html() != ' ') {
                colon
                    .removeClass('warning-block')
                    .html(' ');
            }
        }

        Creator.saveFields();
    });

    inputField.on('change', function () {
        colon = $(this).prev();

        if ($(this).val().length > Creator.cardFieldSize) {
            $(this).addClass('red-border');

            if (colon.html() == ' ') {
                colon
                    .addClass('warning-block')
                    .append($('<span></span>').addClass('fa fa-warning'));
            }
        } else {
            $(this).removeClass('red-border');

            if (colon.html() != ' ') {
                colon
                    .removeClass('warning-block')
                    .html(' ');
            }
        }

        Creator.saveFields();
    });

    // Add row to Creator
    if (Creator.list.children().length - 1 < Creator.cardNum) {
        field.insertBefore(Creator.seperator);
    } else {
        Creator.list.append(field);
    }

    // Updating coloring may be necesarry
    Creator.colorCardFields();
}

/**
 * Bind a Settings object to the Creator.
 * @param {Settings} settings - The settings object.
 */
Creator.settings = function (settings) {
    Creator.picture = settings.picturePreview;
    Creator.name = settings.nameInput;

    if (Creator.picture.attr('src') != 'img/placeholder.png') {
        Creator.image = Creator.picture.attr('src');
    }

    settings.showError = Creator.showError;
    settings.showMessage = Creator.showMessage;
}

/**
 * Display a message for 3 seconds in the message object.
 * @param {string} text - Message text.
 */
Creator.showMessage = function (text) {
    Creator.message.hide();
    Creator.message.text(text);
    Creator.message.slideDown();

    setTimeout(function () {
        Creator.message.slideUp(function () {
            Creator.message.val("");
        });
    }, 3000);
}

/**
 * Display an error for 3 seconds in the error object.
 * @param {string} text - Error text.
 */
Creator.showError = function (text) {
    Creator.error.hide();
    Creator.error.text(text);
    Creator.error.slideDown();

    setTimeout(function () {
        Creator.error.slideUp(function () {
            Creator.error.val("");
        });
    }, 3000);
}

/**
 * Update the coloring of the fields to be shown on the card according to the set amount of rows.
 * This amount of rows is read from the cardNum variable, and has to be updated seperately from input.
 */
Creator.colorCardFields = function () {
    Creator.list.children(".fieldBox").css("background", "#ABC");
    Creator.seperator.prevAll(".fieldBox").css("background", "#ACA");
}

/**
 * Store the field data on the server.
 */
Creator.saveFields = function () {
    if (Creator.saveEnabled) {
        $.ajax({
            type: 'POST',
            data: JSON.stringify({
                fields: Creator.fields(),
                cardNum: Creator.seperator.prevAll().length
            }),
            contentType: 'application/json',
            enctype: 'multipart/form-data',
            url: Creator.saveEndpoint,
            success: function (data) {
                if (data.status == "success") {
                    // Creator.showMessage("Data successfully stored.");
                }
            }
        });
    }
}

// LISTENERS

$('.addField').on('click', function () {
    /* Add a field, possibly with preset label or field */
    Creator.addField(
        $(this).attr('data-label') || "",
        $(this).attr('data-field') || "", !($(this).attr('data-label-editable') == 'false'), !($(this).attr('data-field-editable') == 'false'),
        $(this).attr('data-label-size') || 15,
        $(this).attr('data-field-size') || 57
    );
});

$('.save').on('click', function () {
    Creator.saveFields();
});

$('.createCard').on('click', function () {
    Creator.saveFields();
    MIDcard.get(Creator, function (doc) {
        window.open(doc);
    })
});

$('.createDoc').on('click', function () {
    Creator.saveFields();
    MIDdocument.get(Creator, function (doc) {
        window.open(doc);
    })
});

/**
 * Starts the Creator engine and its form.
 */
Creator.init = function () {
    if (Creator.saveEndpoint == "") {
        console.log("Error: no endpoint found for saving this document!");
    } else {
        $.getJSON(Creator.saveEndpoint, function (data) {
            fields = data.fields;
            Creator.cardNum = data.cardNum;
            for (i = 0; i < fields.length; i++) {
                Creator.addField(fields[i].label, fields[i].field, fields[i].inprofile);
            }

            Creator.colorCardFields();

            /* Only show the form once it is loaded */
            $('#creatorFormLoading').fadeOut(function () {
                $('#creatorForm').slideDown();
                $('.longloadErr').remove();
            });
        });

        setTimeout(function () {
            if ($('#creatorFormLoading').is(":visible")) {
                $('#creatorFormLoading').after("<p class='longloadErr' id='error_msg'>Things seem to take a bit long. Try refreshing.</p>");
            }
        }, 5000);
    }
}
