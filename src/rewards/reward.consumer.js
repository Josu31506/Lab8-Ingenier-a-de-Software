const { connectRabbitMQ } = require('../messaging/rabbitmq.connection');
const { EVENTS, QUEUES } = require('../messaging/queues');
const rewardService = require('./reward.service');

async function startRewardConsumer() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(QUEUES.DINNER_REGISTERED, { durable: true });
  channel.prefetch(1);

  return channel.consume(
    QUEUES.DINNER_REGISTERED,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const event = JSON.parse(message.content.toString());

        if (event.eventType !== EVENTS.DINNER_REGISTERED) {
          channel.ack(message);
          return;
        }

        await rewardService.processDinnerRegisteredEvent(event);
        channel.ack(message);
      } catch (error) {
        console.error('Failed to process DINNER_REGISTERED event:', error.message);
        channel.nack(message, false, false);
      }
    },
    { noAck: false },
  );
}

module.exports = {
  startRewardConsumer,
};
