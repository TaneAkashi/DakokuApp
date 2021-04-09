const { IncomingWebhook } = require('@slack/webhook');

const sendMessage = async (options, text = '', blocks = undefined) => {
  const webhook = new IncomingWebhook(options.url);

  return webhook.send({
    text,
    blocks,
    icon_emoji: options.icon_emoji,
    username: options.username,
  });
};

exports.sendMessage = sendMessage;
