class Reward {
  constructor({ cardNumber, pointsEarned, cashbackEarned, processedAt }) {
    this.cardNumber = cardNumber;
    this.pointsEarned = pointsEarned;
    this.cashbackEarned = cashbackEarned;
    this.processedAt = processedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      cardNumber: this.cardNumber,
      pointsEarned: this.pointsEarned,
      cashbackEarned: this.cashbackEarned,
      processedAt: this.processedAt,
    };
  }
}

module.exports = Reward;
