/**
 * Utilities module to hold methods that may be useful all around.
 * Currently contains only one method.
 * @exports Util
 */
var Util = {};

/**
 * Method to generate a nicely formatted date string.
 * @returns {string} The date formatted according to the dd-mm-yyy format.
 */
Util.formatDate = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    dd = (dd < 10 ? '0' + dd : dd);
    mm = (mm < 10 ? '0' + mm : mm);

    return dd + '-' + mm + '-' + yyyy;
}
