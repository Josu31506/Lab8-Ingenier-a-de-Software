const {
  RestaurantController,
} = require('../src/restaurant/restaurant.controller');

describe('RestaurantController', () => {
  let service;
  let controller;
  let req;
  let res;

  beforeEach(() => {
    service = {
      registerDinner: jest.fn(),
    };

    controller = new RestaurantController(service);

    req = {
      body: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should return 201 when dinner is registered', async () => {
    const serviceResult = {
      message: 'Cena registrada y evento publicado correctamente',
      transaction: req.body,
    };

    service.registerDinner.mockResolvedValue(serviceResult);

    await controller.registerDinner(req, res);

    expect(service.registerDinner).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: serviceResult,
    });
  });

  test('should return 400 when service throws an error', async () => {
    service.registerDinner.mockRejectedValue(new Error('amount is required'));

    await controller.registerDinner(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'amount is required',
    });
  });
});