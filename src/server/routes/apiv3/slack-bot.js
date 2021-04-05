
const express = require('express');
const { createMessageAdapter } = require('@slack/interactive-messages');

const router = express.Router();

module.exports = (crowi) => {
  this.app = crowi.express;

  const signingSecret = crowi.configManager.getConfig('crowi', 'slackbot:signingSecret');
  const slackInteractions = createMessageAdapter(signingSecret);

  // Check if the access token is correct
  // function verificationAccessToken(req, res, next) {
  //   const slackBotAccessToken = req.body.slack_bot_access_token || null;

  //   if (slackBotAccessToken == null || slackBotAccessToken !== this.crowi.configManager.getConfig('crowi', 'slackbot:access-token')) {
  //     logger.error('slack_bot_access_token is invalid.');
  //     return res.send('*Access token is inValid*');
  //   }

  //   return next();
  // }

  slackInteractions.viewSubmission('view_submission', (payload) => {
    // Log the input elements from the view submission.
    console.log(payload.view.state);
  });


  function verificationRequestUrl(req, res, next) {
    // for verification request URL on Event Subscriptions
    if (req.body.type === 'url_verification') {
      return res.send(req.body);
    }

    return next();
  }

  router.post('/', verificationRequestUrl, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();
    console.log(req.body);

    const { body } = req;
    const args = body.text.split(' ');
    const command = args[0];

    switch (command) {
      case 'search':
        await crowi.boltService.showEphemeralSearchResults(body, args);
        break;
      case 'create':
        await crowi.boltService.createModal(body);
        break;
      default:
        await crowi.boltService.notCommand(body);
        break;
    }

  });

  router.post('/interactive', verificationRequestUrl, async(req, res) => {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();
    console.log(req.body);
    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    switch (type) {
      case 'view_submission':
        await crowi.boltService.createPageInGrowi(payload);
        break;
      default:
        break;
    }

  });


  return router;
};
