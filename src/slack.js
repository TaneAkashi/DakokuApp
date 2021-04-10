const { IncomingWebhook } = require('@slack/webhook');

const sendSuccessMessage = async (options, status = '', note = '', telework = '') => {
  const webhook = new IncomingWebhook(options.url);
  const blocks = [];

  let text = ':white_check_mark: ' + status;
  if (telework) {
    text += ' ' + telework;
  }
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text,
    },
  });

  if (note) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `:bell: アラートがあります: ${note}`,
        },
      ],
    });
  }

  return webhook.send({
    text,
    icon_emoji: options.icon_emoji,
    username: options.username,
    color: 'good',
    blocks,
  });
};

exports.sendSuccessMessage = sendSuccessMessage;
