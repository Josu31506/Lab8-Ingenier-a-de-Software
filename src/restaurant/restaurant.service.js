const Transaction = require('../domain/transaction');
const publisher = require('../messaging/publisher');
const { EVENTS, QUEUES } = require('../messaging/queues');

class RestaurantService {
  constructor(messagePublisher = publisher) {
    this.publisher = messagePublisher;
  }

  async registerDinner(dinnerData) {
    const transaction = new Transaction(dinnerData);
    const transactionPayload = transaction.toJSON();

    await this.publisher.publishToQueue(QUEUES.DINNER_REGISTERED, {
      eventType: EVENTS.DINNER_REGISTERED,
      payload: transactionPayload,
    });

    return {
      message: 'Cena registrada y evento publicado correctamente',
      transaction: transactionPayload,
    };
  }
}

const restaurantService = new RestaurantService();

module.exports = restaurantService;
module.exports.RestaurantService = RestaurantService;
