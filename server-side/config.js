//
// config.js
//
// Web service configuration parameters, separate
// from our photoapp-config file that contains 
// AWS-specific configuration information.
//

const config = {
  photoapp_config: "config.ini",
  photoapp_profile: "s3readwrite",
  service_port: 8080,
  ACCESS_TOKEN_SECRET: "secret"
};

module.exports = config;
