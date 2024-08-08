import https from 'https';

const apiToken = '<ebdfc263c2bef629ada59cf63f9b35bb87074c7c4eda70070549199978cd>';
const url = 'https://resi-api.iproyal.com/v1/sessions';
const residentialUserHashes = ['hash1', 'hash2', 'hash3'];
const data = JSON.stringify({ residential_user_hashes: residentialUserHashes });

const options = {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(url, options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();