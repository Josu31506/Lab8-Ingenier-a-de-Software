jest.mock('../src/messaging/rabbitmq.connection', () => ({
  connectRabbitMQ: jest.fn(),
}));

const { connectRabbitMQ } = require('../src/messaging/rabbitmq.connection');
const { publishToQueue } = require('../src/messaging/publisher');

describe('Publisher', () => {
  let channel;

  beforeEach(() => {
    channel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      sendToQueue: jest.fn().mockReturnValue(true),
    };

    connectRabbitMQ.mockResolvedValue(channel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should declare queue and publish a JSON message', async () => {
    const message = {
      eventType: 'TEST_EVENT',
      payload: {
        id: 1,
        value: 'hello',
      },
    };

    const result = await publishToQueue('test.queue', message);

    expect(connectRabbitMQ).toHaveBeenCalledTimes(1);
    expect(channel.assertQueue).toHaveBeenCalledWith('test.queue', {
      durable: true,
    });

    expect(channel.sendToQueue).toHaveBeenCalledTimes(1);

    const [queueName, buffer, options] = channel.sendToQueue.mock.calls[0];

    expect(queueName).toBe('test.queue');
    expect(JSON.parse(buffer.toString())).toEqual(message);
    expect(options).toEqual({
      persistent: true,
      contentType: 'application/json',
    });

    expect(result).toBe(true);
  });
});