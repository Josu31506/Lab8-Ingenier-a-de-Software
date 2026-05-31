jest.mock('../src/messaging/rabbitmq.connection', () => ({
  connectRabbitMQ: jest.fn(),
}));

jest.mock('../src/notifications/notification.service', () => ({
  sendRewardProcessedNotification: jest.fn(),
}));

const { connectRabbitMQ } = require('../src/messaging/rabbitmq.connection');
const notificationService = require('../src/notifications/notification.service');
const {
  startNotificationConsumer,
} = require('../src/notifications/notification.consumer');
const { EVENTS, QUEUES } = require('../src/messaging/queues');

describe('NotificationConsumer', () => {
  let channel;
  let consumeCallback;

  beforeEach(() => {
    channel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      prefetch: jest.fn(),
      consume: jest.fn((queue, callback) => {
        consumeCallback = callback;
        return Promise.resolve(true);
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    connectRabbitMQ.mockResolvedValue(channel);
    notificationService.sendRewardProcessedNotification.mockReturnValue({
      sent: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should start consumer with manual ack', async () => {
    await startNotificationConsumer();

    expect(channel.assertQueue).toHaveBeenCalledWith(QUEUES.REWARD_PROCESSED, {
      durable: true,
    });
    expect(channel.prefetch).toHaveBeenCalledWith(1);
    expect(channel.consume).toHaveBeenCalledWith(
      QUEUES.REWARD_PROCESSED,
      expect.any(Function),
      { noAck: false },
    );
  });

  test('should process REWARD_PROCESSED event and ack message', async () => {
    await startNotificationConsumer();

    const event = {
      eventType: EVENTS.REWARD_PROCESSED,
      payload: {
        cardNumber: '1234567890123456',
        pointsEarned: 150,
        cashbackEarned: 7.53,
      },
    };

    const message = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(message);

    expect(notificationService.sendRewardProcessedNotification).toHaveBeenCalledWith(
      event.payload,
    );
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  test('should ack and ignore events with different eventType', async () => {
    await startNotificationConsumer();

    const event = {
      eventType: 'OTHER_EVENT',
      payload: {},
    };

    const message = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(message);

    expect(notificationService.sendRewardProcessedNotification).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  test('should nack message when notification processing fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    notificationService.sendRewardProcessedNotification.mockImplementation(() => {
      throw new Error('notification error');
    });

    await startNotificationConsumer();

    const event = {
      eventType: EVENTS.REWARD_PROCESSED,
      payload: {
        cardNumber: '1234567890123456',
        pointsEarned: 150,
        cashbackEarned: 7.53,
      },
    };

    const message = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(message);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);

    consoleSpy.mockRestore();
  });
});