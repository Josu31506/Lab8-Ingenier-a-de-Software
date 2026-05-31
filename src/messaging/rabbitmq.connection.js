const amqp = require('amqplib');

let connection = null;
let channel = null;

function buildRabbitMQUrl() {
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || '5672';
  const user = encodeURIComponent(process.env.RABBITMQ_USER || 'guest');
  const password = encodeURIComponent(
    process.env.RABBITMQ_PASSWORD || 'guest',
  );
  const vhost = encodeURIComponent(process.env.RABBITMQ_VHOST || '/');

  return `amqp://${user}:${password}@${host}:${port}/${vhost}`;
}

async function connectRabbitMQ() {
  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(buildRabbitMQUrl());
    channel = await connection.createChannel();

    connection.on('error', (error) => {
      console.error('RabbitMQ connection error:', error.message);
    });

    connection.on('close', () => {
      connection = null;
      channel = null;
      console.warn('RabbitMQ connection closed');
    });

    return channel;
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message);
    throw error;
  }
}

async function closeRabbitMQ() {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
}

module.exports = {
  connectRabbitMQ,
  closeRabbitMQ,
};
