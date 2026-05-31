const EVENTS = Object.freeze({
  DINNER_REGISTERED: 'DINNER_REGISTERED',
  REWARD_PROCESSED: 'REWARD_PROCESSED',
});

const QUEUES = Object.freeze({
  DINNER_REGISTERED:
    process.env.QUEUE_DINNER_REGISTERED || 'laboratorio_1',
  REWARD_PROCESSED:
    process.env.QUEUE_REWARD_PROCESSED || 'laboratorio_reward_processed',
});

module.exports = {
  EVENTS,
  QUEUES,
};
