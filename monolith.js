Accounts.oauth.registerService('monolith');

if (Meteor.isClient) {
  const loginWithMonolith = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Monolith.requestCredential(options, credentialRequestCompleteCallback);
  };

  const linkWithMonolith = function(options, callback) {
    if (!Meteor.userId()) {
      throw new Meteor.Error(402, 'Please login to an existing account before link.');
    }
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
    Monolith.requestCredential(
      options,
      credentialRequestCompleteCallback
    );
  };

  Accounts.registerClientLoginFunction('monolith', loginWithMonolith);
  Meteor.loginWithMonolith = (...args) => Accounts.applyLoginFunction('monolith', args);
  Meteor.linkWithMonolith = (...args) => linkWithMonolith(...args);
}