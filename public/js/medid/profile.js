define(['medid/creator', 'medid/settings', 'medid/util', 'medid/res', 'pdfmake', 'vfs_fonts'], function(Creator, Settings, Util) {
	Creator.saveEndpoint = '/save/document';
	Creator.settings(Settings);
	Creator.init();
});
