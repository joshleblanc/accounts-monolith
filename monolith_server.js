import Monolith from './namespace.js';
import { Accounts } from 'meteor/accounts-base';

const hasOwn = Object.prototype.hasOwnProperty;

Monolith.whitelistedFields = [];

OAuth.registerService('monolith', 2, null, query => {
  const tokens = getTokens(query);
  const identity = getIdentity(tokens.access_token).user;
  const scope = tokens.scope;
  var serviceData = {
    id: tokens.user_id,
    accessToken: OAuth.sealSecret(tokens.access_token),
    tokenType: tokens.token_type,
    scope: scope
  };

  if (hasOwn.call(tokens, "expires_in")) {
    serviceData.expiresIn = Date.now() + 1000 * parseInt(tokens.expires_in, 10);
  }
  Monolith.whitelistedFields.forEach(name => {
    if (hasOwn.call(identity, name))
      serviceData[name] = identity[name]
  });

  if (tokens.refresh_token) {
    serviceData.refreshToken = tokens.refresh_token;
  }

  return {
    serviceData
  }
});

let userAgent = "Meteor";
if (Meteor.release)
  userAgent += '/${Meteor.release}';

const getTokens = query => {
  const config = ServiceConfiguration.configurations.findOne({service: 'monolith'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  let response;
  try {
    const auth = Buffer.from(`${config.clientId}:${OAuth.openSecret(config.secret)}`).toString('base64');
    response = HTTP.post(
      "https://api.monolith.com/oauth2/token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          redirect_uri: OAuth._redirectUri('monolith', config),
          state: query.state
        }
      });
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to complete OAuth handshake with Monolith. ${err.message}`),
      {response: err.response},
    );
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error(`Failed to complete OAuth handshake with Monolith. ${response.data.error}`);
  } else {
    return response.data;
  }
};

const getIdentity = accessToken => {
  try {
    return HTTP.get(
      "https://api.monolith.com/1/user/-/profile.json", {
        headers: {
          "User-Agent": userAgent,
          "Authorization": "Bearer " + accessToken
        },
      }).data;
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to fetch identity from Monolith ${err.message}`),
      {response: err.response},
    );
  }
};

Monolith.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);