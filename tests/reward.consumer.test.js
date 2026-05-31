jest.mock('../src/messaging/rabbitmq.connection', () => ({
  connectRabbitMQ: jest.fn(),
}));

jest.mock('../src/rewards/reward.service', () => ({
  processDinnerRegisteredEvent: jest.fn(),
}));

const { connectRabbitMQ } = require('../src/messaging/rabbitmq.connection');
const rewardService = require('../src/rewards/reward.service');
const { startRewardConsumer } = require('../src/rewards/reward.consumer');
const { EVENTS, QUEUES } = require('../src/messaging/queues');

describe('RewardConsumer', () => {
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
    rewardService.processDinnerRegisteredEvent.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should start consumer with manual ack', async () => {
    await startRewardConsumer();

    expect(channel.assertQueue).toHaveBeenCalledWith(QUEUES.DINNER_REGISTERED, {
      durable: true,
    });
    expect(channel.prefetch).toHaveBeenCalledWith(1);
    expect(channel.consume).toHaveBeenCalledWith(
      QUEUES.DINNER_REGISTERED,
      expect.any(Function),
      { noAck: false },
    );
  });

  test('should process DINNER_REGISTERED event and ack message', async () => {
    await startRewardConsumer();

    const event = {
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      },
    };

    const message = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(message);

    expect(rewardService.processDinnerRegisteredEvent).toHaveBeenCalledWith(event);
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  test('should ack and ignore events with different eventType', async () => {
    await startRewardConsumer();

    const event = {
      eventType: 'OTHER_EVENT',
      payload: {},
    };

    const message = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(message);

    expect(rewardService.processDinnerRegisteredEvent).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  test('should nack message when processing fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    rewardService.processDinnerRegisteredEvent.mockRejectedValue(
      new Error('processing error'),
    );

    await startRewardConsumer();

    const event = {
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
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
