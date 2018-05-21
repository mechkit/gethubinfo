var https = require('https');

function gethub(options, project_path, cb){
  var http_options = {
    host: 'api.github.com',
    path: project_path,
    headers: {
      Accept: 'application/vnd.github.inertia-preview+json',
      'User-Agent': ' ',
    }
  };

  if(options.token){
    http_options.auth = 'token:'+options.token;
  }


  if(options.parameters){
    http_options.path += '?';
    Object.keys(options.parameters).forEach(function(name){
      http_options.path += name+'='+options.parameters[name]+'&';
    });
    http_options.path = http_options.path.slice(0,-1);
  }

  https.get(http_options, function(res) {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
      `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
      `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        cb(parsedData);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });

}

module.exports = gethub;
