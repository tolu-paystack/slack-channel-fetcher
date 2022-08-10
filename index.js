require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');

function encodeFormBody(details) {
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');
}

async function getChannels(next_cursor = '') {
  let details = {
    token: process.env.SLACK_TOKEN,
    exclude_archived: 'true',
    cursor: next_cursor,
  };

  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');
  let fetchResponse = await fetch('https://slack.com/api/conversations.list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  let {
    channels,
    response_metadata: { next_cursor: cursor },
  } = await fetchResponse.json();
  console.log(cursor);
  return [channels, cursor];
}

function writeChannelsToFile(channels) {
  let data = JSON.stringify(channels);
  fs.writeFileSync(`paystack-slack-channels.json`, data, (err) => {
    if (err) {
      console.log(error);
    } else {
      console.log('File written successfully');
    }
  });
}

async function run() {
  // get a set of channels. if next cursor, call again with next cursor until there's no next cursor
  let channelsArray = [];
  let nextCursor = '';
  do {
    let [channels, cursor] = await getChannels(nextCursor ? nextCursor : '');
    channelsArray.push(...channels);
    nextCursor = cursor;
  } while (nextCursor !== '');

  writeChannelsToFile(channelsArray);
}

run();
