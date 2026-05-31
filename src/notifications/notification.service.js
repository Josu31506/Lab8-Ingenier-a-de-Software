class NotificationService {
  sendRewardProcessedNotification(payload) {
    if (!payload) {
      throw new Error('notification payload is required');
    }

    const notification = {
      sent: true,
      message: `Reward processed for card ${payload.cardNumber}: ${payload.pointsEarned} points and ${payload.cashbackEarned} cashback earned.`,
      payload,
      sentAt: new Date().toISOString(),
    };

    console.log(notification.message);

    return notification;
  }
}

module.exports = new NotificationService();
module.exports.NotificationService = NotificationService;
