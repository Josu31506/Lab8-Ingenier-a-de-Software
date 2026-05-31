const { RewardRepository } = require('../src/rewards/reward.repository');
const { RewardService } = require('../src/rewards/reward.service');
const CustomerAccount = require('../src/domain/customerAccount');
const Reward = require('../src/domain/reward');
const { EVENTS, QUEUES } = require('../src/messaging/queues');

describe('RewardService', () => {
  let repository;
  let publisher;
  let service;

  beforeEach(() => {
    repository = new RewardRepository();
    publisher = {
      publishToQueue: jest.fn().mockResolvedValue(true),
    };
    service = new RewardService(repository, publisher);
  });

  test('should calculate points correctly', () => {
    expect(service.calculatePoints(150.5)).toBe(150);
  });

  test('should calculate cashback correctly', () => {
    expect(service.calculateCashback(150.5)).toBe(7.53);
  });

  test('should process a valid DINNER_REGISTERED event', async () => {
    const result = await service.processDinnerRegisteredEvent({
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
        transactionDate: '2026-05-16T20:30:00',
      },
    });

    expect(result).toMatchObject({
      cardNumber: '1234567890123456',
      pointsEarned: 150,
      cashbackEarned: 7.53,
      totalPoints: 150,
      totalCashback: 7.53,
    });
    expect(result.processedAt).toEqual(expect.any(String));
  });

  test('should update an existing account', async () => {
    repository.save(
      new CustomerAccount({
        cardNumber: '1234567890123456',
        totalPoints: 20,
        totalCashback: 1.25,
      }),
    );

    await service.processDinnerRegisteredEvent({
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 100.25,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      },
    });

    const account = repository.findByCardNumber('1234567890123456');

    expect(account.toJSON()).toEqual({
      cardNumber: '1234567890123456',
      totalPoints: 120,
      totalCashback: 6.26,
    });
  });

  test('should create an account if it does not exist', async () => {
    await service.processDinnerRegisteredEvent({
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 75,
        cardNumber: '9999888877776666',
        restaurantCode: 'REST002',
      },
    });

    const account = repository.findByCardNumber('9999888877776666');

    expect(account).toBeDefined();
    expect(account.totalPoints).toBe(75);
    expect(account.totalCashback).toBe(3.75);
  });

  test('should publish REWARD_PROCESSED event', async () => {
    await service.processDinnerRegisteredEvent({
      eventType: EVENTS.DINNER_REGISTERED,
      payload: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      },
    });

    expect(publisher.publishToQueue).toHaveBeenCalledWith(
      QUEUES.REWARD_PROCESSED,
      {
        eventType: EVENTS.REWARD_PROCESSED,
        payload: expect.objectContaining({
          cardNumber: '1234567890123456',
          pointsEarned: 150,
          cashbackEarned: 7.53,
          totalPoints: 150,
          totalCashback: 7.53,
          processedAt: expect.any(String),
        }),
      },
    );
  });

  test('should throw an error if the event does not have payload', async () => {
    await expect(
      service.processDinnerRegisteredEvent({
        eventType: EVENTS.DINNER_REGISTERED,
      }),
    ).rejects.toThrow('DINNER_REGISTERED event must include payload');
  });

  test('should clear repository accounts', () => {
    repository.createAccount('1234567890123456');
    repository.clear();

    expect(repository.findByCardNumber('1234567890123456')).toBeNull();
  });

  test('should serialize reward domain model', () => {
    const reward = new Reward({
      cardNumber: '1234567890123456',
      pointsEarned: 150,
      cashbackEarned: 7.53,
      processedAt: '2026-05-16T20:30:00.000Z',
    });

    expect(reward.toJSON()).toEqual({
      cardNumber: '1234567890123456',
      pointsEarned: 150,
      cashbackEarned: 7.53,
      processedAt: '2026-05-16T20:30:00.000Z',
    });
  });
});
