const { connectRabbitMQ } = require('./rabbitmq.connection');

async function publishToQueue(queueName, message) {
  const channel = await connectRabbitMQ();
  const eventMessage = Buffer.from(JSON.stringify(message));

  await channel.assertQueue(queueName, { durable: true });

  return channel.sendToQueue(queueName, eventMessage, {
    persistent: true,
    contentType: 'application/json',
  });
}

module.exports = {
  publishToQueue,
};
