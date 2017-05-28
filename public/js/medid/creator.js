define(['jquery', 'medid/card', 'medid/document'], function($, MIDcard, MIDdocument) {
    /**
    * The creator module power both document creators.
    * It handles all logic behind the form, including retrieval of data.
    * To actually be able to generate documents, the creator needs additional modules corresponding to those documents.
    * These modules can use the fields() method of the creator for input data.
    * The creator also needs to be provided with an endpoint for data persistency.
    * Finally, creator.init() must be called to start the creator form, filling it with pre-set data.
    * @exports creator
    * @requires jQuery
    * @requires card
    * @requires document
    */
    var creator = {
        
        /**
        * The DIV element containing all the fields of the creator form.
        * The element is set to sortable to allow reordering of fields through drag and drop.
        * @member {Object}
        */
        list: $('#fields').sortable({
            axis: "y",
            cursor: "move",
            tolerance: "pointer"
        }),

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
    * @returns {Array} An array of tuples with label and field values.
    */
    creator.fields = function () {
        var fields = [];
        var label, field;
        
        creator.list.children('div.fieldBox').each(function () {
            label = $(this).find('.medid-label');
            field = $(this).find('.medid-field');
            inprofile = $(this).find('.toggle').find('.btn-success').is(':visible');

            fields.push({label: label.val(), field: field.val(), inprofile: inprofile});
        });

        creator.userName = creator.name.val();
    
        if (creator.picture.attr('src') != 'img/placeholder.png') {
            creator.image = creator.picture.attr('src');
            creator.imageWidth = creator.picture.width();
            creator.imageHeight = creator.picture.height();
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
    creator.addField = function (label, field, inprofile) {
        inputLabel =    $('<input></input>')
                        .addClass('medid-label form-control')
                        .attr('maxlength', creator.labelSize)
                        .attr('type', 'text')
                        .val(label);
        
        colon =         $('<span></span>')
                        .addClass('input-group-addon')
                        .html(' ');
        
        inputField =    $('<input></input>')
                        .addClass('medid-field form-control')
                        .attr('maxlength', creator.fieldSize)
                        .attr('type', 'text')
                        .val(field);
        
        inputGroup =    $('<div></div>')
                        .addClass('input-group')
                        .append([inputLabel, colon, inputField]);

        removeField =   $('<button></button>')
                        .addClass('removeField btn btn-danger')
                        .html("<svg class='icon-bin'><use xlink:href='/img/icons.svg#icon-bin'></use></svg>");
        
        moveUp =        $('<span></span>')
                        .addClass('clickable moveUp')
                        .html("<svg class='icon-arrow-up'><use xlink:href='/img/icons.svg#icon-arrow-up'></use></svg>");
    
        moveDown =      $('<span></span>')
                        .addClass('clickable moveDown')
                        .html("<svg class='icon-arrow-up'><use xlink:href='/img/icons.svg#icon-arrow-down'></use></svg>");
                
        toggle =        $('<div></div>')
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
        
        operations =    $('<div></div>')
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
        
        field =         $('<div></div>')
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
        
        // Remove the field
        removeField.on('click', function() {
            $(this).parent().parent().parent().parent().remove();
            creator.colorCardFields();
        });

        // Move the field
        moveUp.on('click', function() {
            row = $(this).parent().parent().parent().parent().parent();
            row.prev().before(row);
            creator.colorCardFields();
        });

        moveDown.on('click', function() {
            row = $(this).parent().parent().parent().parent().parent();
            row.before(row.next());
            creator.colorCardFields();
        });

        // Keep track of the input lengths
        inputLabel.on('change', function() {
            colon = $(this).next();
            
            if ($(this).val().length > creator.cardLabelSize) {
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
        });

        inputField.on('change', function() {
            colon = $(this).prev();
    
            if ($(this).val().length > creator.cardFieldSize) {
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
        });

        // Add row to creator
        this.list.append(field);

        // Updating coloring may be necesarry
        creator.colorCardFields();
    }

    /**
    * Bind a Settings object to the creator.
    * @param {Settings} settings - The settings object.
    */
    creator.settings = function (settings) {
        creator.cardNum = settings.cardNumInput.val();
        creator.picture = settings.picturePreview;
        creator.name = settings.nameInput;
        
        if (creator.picture.attr('src') != 'img/placeholder.png') {
            creator.image = creator.picture.attr('src');
        }

        settings.showError = creator.showError;
        settings.showMessage = creator.showMessage;

        // Listeners
        settings.cardNumInput.on('input', function() {
            creator.cardNum = $(this).val();
            creator.colorCardFields();
        });
    }

    /**
    * Display a message for 3 seconds in the message object.
    * @param {string} text - Message text.
    */
    creator.showMessage = function (text) {
        creator.message.hide();
        creator.message.text(text);
        creator.message.slideDown();
    
        setTimeout(function () {
            creator.message.slideUp(function () {
                creator.message.val("");
            });
        }, 3000);
    }

    /**
    * Display an error for 3 seconds in the error object.
    * @param {string} text - Error text.
    */
    creator.showError = function (text) {
        creator.error.hide();
        creator.error.text(text);
        creator.error.slideDown();
    
        setTimeout(function () {
            creator.error.slideUp(function () {
                creator.error.val("");
            });
        }, 3000);
    }

    /**
    * Update the coloring of the fields to be shown on the card according to the set amount of rows.
    * This amount of rows is read from the cardNum variable, and has to be updated seperately from input.
    */
    creator.colorCardFields = function() {
        creator.list.children().css("background", "#ABC");
        creator.list.children().slice(0,creator.cardNum ).css("background", "#ACA");
    }

    /**
    * Store the field data on the server.
    */
    creator.saveFields = function () {
        $.ajax({
            type: 'POST',
            data: JSON.stringify(creator.fields()),
            contentType: 'application/json',
            enctype: 'multipart/form-data',
            url: creator.saveEndpoint,
            success: function(data) {
                if (data.status == "success") {
                    creator.showMessage("Data successfully stored.");
                }
            }
        });
    }

    // LISTENERS

    $('.addField').on('click', function() {
        /* Add a field, possibly with preset label or field */
        creator.addField(
            $(this).attr('data-label') || "",
            $(this).attr('data-field') || "",
            !($(this).attr('data-label-editable') == 'false'),
            !($(this).attr('data-field-editable') == 'false'),
            $(this).attr('data-label-size') || 15,
            $(this).attr('data-field-size') || 57
        );
    });

    $('.save').on('click', function() {
        creator.saveFields();
    });

    $('.createCard').on('click', function() {
        creator.saveFields();
        MIDcard.get(creator, function(doc) {
            window.open(doc);
        })
    });

    $('.createDoc').on('click', function() {
        creator.saveFields();
        MIDdocument.get(creator, function(doc) {
            window.open(doc);
        })
    });

    /**
    * Starts the creator engine and its form.
    */
    creator.init = function () {
        if (creator.saveEndpoint == "") {
            console.log("Error: no endpoint found for saving this document!")
        } else {
            $.getJSON(creator.saveEndpoint, function(data) {
                for (i = 0; i < data.length; i++) {
                    creator.addField(data[i].label, data[i].field, data[i].inprofile);
                }
                
                creator.colorCardFields();
    
                /* Only show the form once it is loaded */
    
                $('#creatorFormLoading').fadeOut(function () {
                    $('#creatorForm').slideDown();
                    $('.longloadErr').remove();
                });
            });
            
            setTimeout(function() {
                if ($('#creatorFormLoading').is(":visible")) {
                    $('#creatorFormLoading').after("<p class='longloadErr' id='error_msg'>Things seem to take a bit long. Try refreshing.</p>");
                }
            }, 5000);
        }
    }

    return creator;
});
