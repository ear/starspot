import { expect } from "chai";
import { Router } from "../src/";

describe("Router", () => {

  describe("mapping", () => {

    it("supports simple routes", () => {
      class MyRouter extends Router {
        map({ resources }: Router.DSL) {
          resources("my-route");
        }
      }

      let router = new MyRouter();
      router.seal();

      expect(router.handlersFor("GET", "my-route").length).to.equal(1);
    });

  });

});
