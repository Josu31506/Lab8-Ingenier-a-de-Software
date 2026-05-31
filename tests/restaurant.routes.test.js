const request = require('supertest');

jest.mock('../src/restaurant/restaurant.service', () => ({
  registerDinner: jest.fn(),
}));

const restaurantService = require('../src/restaurant/restaurant.service');
const app = require('../src/app');

describe('RestaurantRoutes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/dinners should register a dinner', async () => {
    const serviceResult = {
      message: 'Cena registrada y evento publicado correctamente',
      transaction: {
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      },
    };

    restaurantService.registerDinner.mockResolvedValue(serviceResult);

    const response = await request(app)
      .post('/api/dinners')
      .send({
        amount: 150.5,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: serviceResult,
    });

    expect(restaurantService.registerDinner).toHaveBeenCalledWith({
      amount: 150.5,
      cardNumber: '1234567890123456',
      restaurantCode: 'REST001',
    });
  });

  test('POST /api/dinners should return 400 when service throws error', async () => {
    restaurantService.registerDinner.mockRejectedValue(
      new Error('El monto consumido debe ser mayor a cero'),
    );

    const response = await request(app)
      .post('/api/dinners')
      .send({
        amount: -10,
        cardNumber: '1234567890123456',
        restaurantCode: 'REST001',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'El monto consumido debe ser mayor a cero',
    });
  });
});