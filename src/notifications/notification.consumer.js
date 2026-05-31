const { connectRabbitMQ } = require('../messaging/rabbitmq.connection');
const { EVENTS, QUEUES } = require('../messaging/queues');
const notificationService = require('./notification.service');

async function startNotificationConsumer() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(QUEUES.REWARD_PROCESSED, { durable: true });
  channel.prefetch(1);

  return channel.consume(
    QUEUES.REWARD_PROCESSED,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const event = JSON.parse(message.content.toString());

        if (event.eventType !== EVENTS.REWARD_PROCESSED) {
          channel.ack(message);
          return;
        }

        notificationService.sendRewardProcessedNotification(event.payload);
        channel.ack(message);
      } catch (error) {
        console.error('Failed to process REWARD_PROCESSED event:', error.message);
        channel.nack(message, false, false);
      }
    },
    { noAck: false },
  );
}

module.exports = {
  startNotificationConsumer,
};
