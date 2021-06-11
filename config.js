const mongodbCredential = require("./secret");
const config = {
  mongodb: {
    // url: `mongodb://${mongodbCredential.username}:${mongodbCredential.password}@127.0.0.1:27017/Bisous`,
    // mongo ""
    url: `mongodb+srv://${mongodbCredential.username}:${mongodbCredential.password}@cluster0.8vnpv.mongodb.net/myFirstDatabase`,
  },
  key: "12345-54321-67890-09876",
  facebook: {
    clientID: "202906524623361",
    clientSecret: "9e96b8f4eb7a2cad2f27cb8379aa24cb",
  },
  google: {
    clientID:
      "148362350360-bmrua549n7sofmcjv7dmv4ku21jgfd1u.apps.googleusercontent.com",
    clientSecret: "plr9zPWan2YAPPpDZfJJhUkK",
  },
};

module.exports = config;
