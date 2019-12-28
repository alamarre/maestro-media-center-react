export default class LoginProvider {
  constructor(apiRequester) {
    this.apiRequester = apiRequester;
  }

  loginPromise(username, password) {
    var self = this;
    var promise = new Promise(function(good, bad) {
      self.apiRequester.apiRequestPromise("login", "", {
        data: JSON.stringify({
          username: username,
          password: password,
        }),
        type: "POST",
        contentType: "application/json",
      }).then(function(result) {
        good(result.token);
      }, function(error) {
        bad(error);
      });
    });

    return promise;
  }

}

