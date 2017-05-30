define(['medid/creator', 'medid/settings', 'medid/util', 'medid/res', 'pdfmake', 'vfs_fonts', 'jqueryui'], function(Creator, Settings, Util) {
	Creator.saveEndpoint = '/save/fields';
	Creator.saveEnabled = true;
	Creator.settings(Settings);
	Creator.init();
});
