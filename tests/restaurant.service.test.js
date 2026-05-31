const { RestaurantService } = require('../src/restaurant/restaurant.service');
const { EVENTS, QUEUES } = require('../src/messaging/queues');

describe('RestaurantService', () => {
  let publisher;
  let service;

  beforeEach(() => {
    publisher = {
      publishToQueue: jest.fn().mockResolvedValue(true),
    };
    service = new RestaurantService(publisher);
  });

  test('should register a valid dinner', async () => {
    const request = {
      amount: 150.5,
      cardNumber: '1234567890123456',
      restaurantCode: 'REST001',
      transactionDate: '2026-05-16T20:30:00',
    };

    const result = await service.registerDinner(request);

    expect(result).toEqual({
      message: 'Cena registrada y evento publicado correctamente',
      transaction: request,
    });
  });

  test('should publish DINNER_REGISTERED event', async () => {
    const request = {
      amount: 150.5,
      cardNumber: '1234567890123456',
      restaurantCode: 'REST001',
      transactionDate: '2026-05-16T20:30:00',
    };

    await service.registerDinner(request);

    expect(publisher.publishToQueue).toHaveBeenCalledWith(
      QUEUES.DINNER_REGISTERED,
      {
        eventType: EVENTS.DINNER_REGISTERED,
        payload: request,
      },
    );
  });

  test('should generate transactionDate when it is not provided', async () => {
    const result = await service.registerDinner({
      amount: 100,
      cardNumber: '1234567890123456',
      restaurantCode: 'REST001',
    });

    expect(result.transaction.transactionDate).toEqual(expect.any(String));
    expect(new Date(result.transaction.transactionDate).toString()).not.toBe(
      'Invalid Date',
    );
  });

  test('should throw an error if amount is less than or equal to 0', async () => {
    await expect(
      service.registerDinner({
        amount: 0,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      }),
    ).rejects.toThrow('amount is required and must be greater than 0');
  });

  test('should throw an error if cardNumber is missing', async () => {
    await expect(
      service.registerDinner({
        amount: 150.5,
        restaurantCode: 'REST001',
      }),
    ).rejects.toThrow('cardNumber is required');
  });

  test('should throw an error if restaurantCode is missing', async () => {
    await expect(
      service.registerDinner({
        amount: 150.5,
        cardNumber: '1234567890123456',
      }),
    ).rejects.toThrow('restaurantCode is required');
  });
});
