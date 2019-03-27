// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by ipstas-meteor-blog.js.
import { name as packageName } from "meteor/ipstas-meteor-blog";

// Write your tests here!
// Here is an example.
Tinytest.add('ipstas-meteor-blog - example', function (test) {
  test.equal(packageName, "ipstas-meteor-blog");
});
