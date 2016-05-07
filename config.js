var config = {
  dev: {
    aqiServiceEndpoint: 'http://192.168.99.100/aqi-service',
    luisEndpoint: 'https://api.projectoxford.ai/luis/v1/application?id=c5b1296c-ef3f-437e-b574-a1f7c4eded53&subscription-key=406d2cee0c624a0f932ef42a5a8ea17c'
  },
  container: {
    aqiServiceEndpoint: 'http://aqi-service',
    luisEndpoint: 'https://api.projectoxford.ai/luis/v1/application?id=c5b1296c-ef3f-437e-b574-a1f7c4eded53&subscription-key=406d2cee0c624a0f932ef42a5a8ea17c'
  }
};

module.exports = config;
