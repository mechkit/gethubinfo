var fs = require('fs');
var markdownpdf = require('markdown-pdf');

function write_report(report_text,file_path){

  //console.log(report_text);
  fs.writeFileSync( file_path+'.md', report_text );

  markdownpdf({
    paperFormat: 'Letter',
    paperBorder: '0.5cm',
    cssPath: './pdf.css',
  }).from.string(report_text).to( file_path+'.pdf', function () {
    console.log('Done');
  });
}

module.exports = write_report;
