var moment = require('moment');

function getrange(weeks_ago){
  var range = {
    start_moment: moment().subtract(weeks_ago, 'weeks').startOf('isoWeek'),
    end_moment: moment().subtract(weeks_ago, 'weeks').endOf('isoWeek'),
  };

  range.start = range.start_moment.format('YYYY-MM-DDTHH:MM:SS')+'Z';
  range.end = range.end_moment.format('YYYY-MM-DDTHH:MM:SS')+'Z';

  return range;

}


module.exports = getrange;
