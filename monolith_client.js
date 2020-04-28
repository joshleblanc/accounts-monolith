import Monolith from './namespace.js';

Monolith.requestCredential = (options, credentialRequestCompleteCallback) => {
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  const config = ServiceConfiguration.configurations.findOne({service: 'monolith'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError());
    return;
  }

  const credentialToken = Random.secret();

  const scope = (options && options.requestPermissions) || ['profile'];
  const flatScope = scope.map(encodeURIComponent).join('+');

  const loginStyle = OAuth._loginStyle('monolith', config, options);
  console.log(OAuth._redirectUri('monolith', config));

  const loginUrl =
    'http://localhost:3000/oauth/authorize' +
    '?client_id=' + config.clientId +
    '&response_type=code' +
    '&scope=' + flatScope +
    '&redirect_uri=' + OAuth._redirectUri('monolith', config) +
    '&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

  OAuth.launchLogin({
    loginService: 'monolith',
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken,
    popupOptions: {width: 450, height: 750}
  });
};