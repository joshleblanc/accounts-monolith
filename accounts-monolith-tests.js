// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by accounts-monolith.js.
import { name as packageName } from "meteor/accounts-monolith";

// Write your tests here!
// Here is an example.
Tinytest.add('accounts-monolith - example', function (test) {
  test.equal(packageName, "accounts-monolith");
});
