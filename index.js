var moment = require('moment');
var fs = require('fs');
var markdownpdf = require('markdown-pdf');

var gethub = require('./gethub');
var getproject = require('./getproject');
var write_report = require('./write_report');
var get_date_range = require('./get_date_range');


var owner = 'FSEC';
var repo = 'SPD_server';
var title = 'Solar Plans Designer';
var file_path = './reports/';

var daterange = get_date_range(1);

var GITHUB_TOKEN = process.env.GITHUB_TOKEN;

var options = {
  token: GITHUB_TOKEN,
  parameters: {
    since: daterange.start,
    until: daterange.end,
  }
};

var week_of = options.parameters.since;

var project_path;

/*
project_path = `/repos/${owner}/${repo}/commits`;
gethub(options, project_path, function(returned){
  //console.log(returned);
  returned.forEach(function(item){
    console.log(item.commit.committer.date);
  });
});
//*/


var API_request = 0;
var API_responce = 0;



var returned;

var events = [];

project_path = `/repos/${owner}/${repo}/commits`;
API_request++;
gethub(options, project_path, function(returned){
  returned.forEach(function(commit_info){
    events.push({
      type: 'Commit',
      date: commit_info.commit.committer.date,
      text: 'Code changed: ['+commit_info.commit.message+']('+commit_info.html_url+')',
    });
  });

  API_responce++;
  if( API_request === API_responce ){ done(); }
});


project_path = `/repos/${owner}/${repo}/events`;
API_request++;
gethub(options, project_path, function(returned){
  returned.forEach(function(event){
    if( event.type === 'IssuesEvent' &&
          moment(event.payload.issue.created_at).isAfter(daterange.start_moment) &&
          moment(event.payload.issue.created_at).isBefore(daterange.end_moment) ){
      var issue_action = event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1);
      events.push({
        type: 'Issue',
        date: event.payload.issue.created_at,
        text: issue_action + ' issue: [' + event.payload.issue.title + '](' + event.payload.issue.html_url + ')',
      });
    }
  });

  API_responce++;
  if( API_request === API_responce ){ done(); }
});



//console.log(returned);




//*
var project_string = '';

API_request++;
getproject(options, owner, repo, function(projects){
  projects.forEach(function(project){
    project_string += '\n## ' + project.title + ' ( as of ' + moment().format('YYYY-MM-DD') + ' )' + '\n\n';
    Object.keys(project.columns).forEach(function(column_name){
      project_string += '\n### ' + column_name + '\n\n';
      project.columns[column_name].forEach(function(card){
        var labels = card.labels.length ? ' ['+card.labels.join(',')+']' : '';
        project_string += '  * ['+card.title+']('+card.url+')' + labels  + '\n';
      });
      project_string += '\n';

    });
  });
  API_responce++;
  if( API_request === API_responce ){ done(); }
});

//*/

function done(){
  var report_string = '#  ' + title + '\n\n';

  report_string += '\n## Log ( week of ' + week_of.replace(/T.*Z/, '') + ' )\n\n';

  events = events.sort(function(a,b){
    if( a.date < b.date ){
      return -1;
    } else if( a.date > b.date ){
      return 1;
    } else {
      return 0;
    }
  });

  events.forEach(function(event){
    report_string += ' * ' + event.date.replace(/T.*Z/,' ') + event.text + '\n';
  });


  report_string += project_string;

  //console.log(report_string);

  var filename = title.replace(' ', '_') + '_' + week_of.replace(/T.*Z/, '') + '_report';

  write_report(report_string, file_path+filename);


  //*/
}
