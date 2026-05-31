const {
  NotificationService,
} = require('../src/notifications/notification.service');

describe('NotificationService', () => {
  let service;
  let consoleSpy;

  beforeEach(() => {
    service = new NotificationService();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should generate a notification with card, points and cashback', () => {
    const payload = {
      cardNumber: '1234567890123456',
      pointsEarned: 150,
      cashbackEarned: 7.53,
    };

    const result = service.sendRewardProcessedNotification(payload);

    expect(result.message).toContain('1234567890123456');
    expect(result.message).toContain('150 points');
    expect(result.message).toContain('7.53 cashback');
    expect(consoleSpy).toHaveBeenCalledWith(result.message);
  });

  test('should return sent true', () => {
    const result = service.sendRewardProcessedNotification({
      cardNumber: '1234567890123456',
      pointsEarned: 150,
      cashbackEarned: 7.53,
    });

    expect(result.sent).toBe(true);
    expect(result.sentAt).toEqual(expect.any(String));
  });

  test('should throw an error when payload is missing', () => {
    expect(() => service.sendRewardProcessedNotification()).toThrow(
      'notification payload is required',
    );
  });
});
