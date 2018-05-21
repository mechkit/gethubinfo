var gethub = require('./gethub');

var report = [];
var project_requests = 0;
var project_responces = 0;
var column_requests = 0;
var column_responces = 0;
var card_requests = 0;
var card_responces = 0;

module.exports = function(options, user, repo, cb){
  options.parameters = {};
  var project_path = `/repos/${user}/${repo}/projects`;
  gethub(options, project_path, function(data){
    data.forEach(function(project){
      var project_report = {};
      report.push(project_report);
      project_report.title = project.name;
      var columns = project_report.columns = {};
      project_requests++;
      gethub(options, project.columns_url,function(data){
        project_responces++;
        data.forEach(function(column){
          column_requests++;
          columns[column.name] = columns[column.name] || [];
          gethub(options, column.cards_url,function(cards){
            column_responces++;
            //console.log(cards);
            cards.forEach(function(card){
              card_requests++;
              gethub(options, card.content_url,function(content){
                card_responces++;
                //console.log(content);
                columns[column.name].push({
                  title: content.title,
                  url: content.html_url,
                  labels: content.labels.map(function(label){return label.name;})
                });
                if( project_requests === project_responces && column_requests === column_responces && card_requests === card_responces ){
                  //console.log('got everything');
                  cb(report);
                }
              });
            });
          });
        });
      });
    });
  });
};
