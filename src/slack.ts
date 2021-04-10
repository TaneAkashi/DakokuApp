import { IncomingWebhook } from '@slack/webhook';

export const generateSuccessMessage = (status, note, telework) => {
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

  return {
    text,
    blocks,
  };
};

export const sendMessage = async (options, text = '', blocks = undefined) => {
  const webhook = new IncomingWebhook(options.url);

  return webhook.send({
    text,
    blocks,
    icon_emoji: options.icon_emoji,
    username: options.username,
  });
};
