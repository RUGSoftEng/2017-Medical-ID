define(['medid/creator', 'medid/settings', 'medid/util', 'medid/res', 'pdfmake', 'vfs_fonts'], function(Creator, Settings, Util) {
	Creator.saveEndpoint = '/save/fields';
	Creator.settings(Settings);
	Creator.init();
});
