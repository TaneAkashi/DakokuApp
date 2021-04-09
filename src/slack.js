const { IncomingWebhook } = require('@slack/webhook');

const generateSuccessMessage = (status, telework, note) => {
  const text = ':check_mark: ' + status + (telework ? ` ${telework}` : '');
  const blocks = [];

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

  return {
    text,
    blocks,
  };
};

const sendMessage = async (options, text = '', blocks = undefined) => {
  const webhook = new IncomingWebhook(options.url);

  return webhook.send({
    text,
    blocks,
    icon_emoji: options.icon_emoji,
    username: options.username,
  });
};

exports.generateSuccessMessage = generateSuccessMessage;
exports.sendMessage = sendMessage;
