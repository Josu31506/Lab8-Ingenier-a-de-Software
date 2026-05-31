class CustomerAccount {
  constructor({ cardNumber, totalPoints = 0, totalCashback = 0 }) {
    this.cardNumber = cardNumber;
    this.totalPoints = totalPoints;
    this.totalCashback = totalCashback;
  }

  addReward(reward) {
    this.totalPoints += reward.pointsEarned;
    this.totalCashback = Number(
      (this.totalCashback + reward.cashbackEarned).toFixed(2),
    );

    return this;
  }

  toJSON() {
    return {
      cardNumber: this.cardNumber,
      totalPoints: this.totalPoints,
      totalCashback: this.totalCashback,
    };
  }
}

module.exports = CustomerAccount;
