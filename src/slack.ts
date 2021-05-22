import { Block, KnownBlock } from '@slack/types';
import { IncomingWebhook } from '@slack/webhook';

type SlackOptions = {
  url: string;
  icon_emoji: string;
  username: string;
};

export const generateSuccessMessage = (
  status: string,
  time: string,
  note: string,
  telework?: string
): { text: string; blocks: (Block | KnownBlock)[] } => {
  const blocks: (Block | KnownBlock)[] = [];

  const hhmmss = ((date) => `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)(new Date(time));
  let text = `:white_check_mark: ${status} ${hhmmss}`;
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

export const sendMessage = async (
  options: SlackOptions,
  text = '',
  blocks?: (Block | KnownBlock)[]
): Promise<ReturnType<InstanceType<typeof IncomingWebhook>['send']>> => {
  const webhook = new IncomingWebhook(options.url);

  return webhook.send({
    text,
    blocks,
    icon_emoji: options.icon_emoji || undefined,
    username: options.username || undefined,
  });
};
