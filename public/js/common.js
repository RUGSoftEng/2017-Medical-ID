requirejs.config({
  baseUrl: '/js',
  paths: {
    'jquery': 'lib/jquery.min',
    'jspdf': 'lib/jspdf.min',
    'pdfmake': 'lib/pdfmake.min',
    'vfs_fonts': 'lib/vfs_fonts'
  },
  shim: {
    'vfs_fonts': ['pdfmake']
  }
});
