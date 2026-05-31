class Transaction {
  constructor({ amount, cardNumber, restaurantCode, transactionDate }) {
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('amount is required and must be greater than 0');
    }

    if (!cardNumber) {
      throw new Error('cardNumber is required');
    }

    if (!restaurantCode) {
      throw new Error('restaurantCode is required');
    }

    this.amount = numericAmount;
    this.cardNumber = cardNumber;
    this.restaurantCode = restaurantCode;
    this.transactionDate = transactionDate || new Date().toISOString();
  }

  toJSON() {
    return {
      amount: this.amount,
      cardNumber: this.cardNumber,
      restaurantCode: this.restaurantCode,
      transactionDate: this.transactionDate,
    };
  }
}

module.exports = Transaction;
