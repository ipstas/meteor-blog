// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by ipstas-meteor-blog.js.
import { meteor-blog } from "meteor/ipstas:meteor-blog";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-blog - example', function (test) {
  test.equal(packageName, "meteor-blog");
});
