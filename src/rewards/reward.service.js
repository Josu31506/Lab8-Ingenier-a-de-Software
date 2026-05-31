const Reward = require('../domain/reward');
const rewardRepository = require('./reward.repository');
const publisher = require('../messaging/publisher');
const { EVENTS, QUEUES } = require('../messaging/queues');

class RewardService {
  constructor(repository = rewardRepository, messagePublisher = publisher) {
    this.repository = repository;
    this.publisher = messagePublisher;
  }

  calculatePoints(amount) {
    return Math.floor(Number(amount));
  }

  calculateCashback(amount) {
    return Number((Number(amount) * 0.05).toFixed(2));
  }

  async processDinnerRegisteredEvent(event) {
    if (!event?.payload) {
      throw new Error('DINNER_REGISTERED event must include payload');
    }

    const { amount, cardNumber } = event.payload;

    const reward = new Reward({
      cardNumber,
      pointsEarned: this.calculatePoints(amount),
      cashbackEarned: this.calculateCashback(amount),
    });

    const account = this.repository.findOrCreateByCardNumber(cardNumber);
    account.addReward(reward);
    this.repository.save(account);

    const processedPayload = {
      cardNumber,
      pointsEarned: reward.pointsEarned,
      cashbackEarned: reward.cashbackEarned,
      totalPoints: account.totalPoints,
      totalCashback: account.totalCashback,
      processedAt: reward.processedAt,
    };

    await this.publisher.publishToQueue(QUEUES.REWARD_PROCESSED, {
      eventType: EVENTS.REWARD_PROCESSED,
      payload: processedPayload,
    });

    return processedPayload;
  }
}

const rewardService = new RewardService();

module.exports = rewardService;
module.exports.RewardService = RewardService;