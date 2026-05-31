const CustomerAccount = require('../domain/customerAccount');

class RewardRepository {
  constructor() {
    this.accounts = new Map();
  }

  findByCardNumber(cardNumber) {
    return this.accounts.get(cardNumber) || null;
  }

  createAccount(cardNumber) {
    const account = new CustomerAccount({ cardNumber });
    this.save(account);
    return account;
  }

  findOrCreateByCardNumber(cardNumber) {
    return this.findByCardNumber(cardNumber) || this.createAccount(cardNumber);
  }

  save(account) {
    this.accounts.set(account.cardNumber, account);
    return account;
  }

  clear() {
    this.accounts.clear();
  }
}

const rewardRepository = new RewardRepository();

module.exports = rewardRepository;
module.exports.RewardRepository = RewardRepository;
