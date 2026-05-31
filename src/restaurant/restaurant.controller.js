const restaurantService = require('./restaurant.service');

class RestaurantController {
  constructor(service = restaurantService) {
    this.service = service;
    this.registerDinner = this.registerDinner.bind(this);
  }

  async registerDinner(req, res) {
    try {
      const data = await this.service.registerDinner(req.body);

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new RestaurantController();
module.exports.RestaurantController = RestaurantController;
