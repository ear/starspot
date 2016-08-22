import { expect } from "chai";
import { Serializer, Model } from "../src/";

describe("Serializer", () => {

  describe("serialization protocol", () => {

    it("retrieves protocol from passed model", () => {
      let serializer = new Serializer();
      let model: Serializer.Serializable = {
        "@@SerializerProtocol": {
          getType(model) {
            return "my-type";
          },

          getID(model) {
            return "123";
          },

          getAttributes(model) {
            return ["firstName", "lastName"];
          },

          getAttribute(model, attribute) {
            return attribute === "firstName" ?
              "Tom" :
              "Dale";
          }
        }
      };

      expect(serializer.serialize(model)).to.deep.equal({
        data: {
          id: "123",
          type: "my-type",
          attributes: {
            firstName: "Tom",
            lastName: "Dale"
          }
        }
      });
    });

  });

  describe("JSON API serialization", function() {
    class Photo extends Model {
      static attributes = ["name"];
    }

    let serializer = new Serializer();

    it("serializes a model", function() {
      let photo = new Photo({
        id: 1,
        name: "Hassan"
      });

      expect(serializer.serialize(photo)).to.deep.equal({
        data: {
          id: 1,
          type: "photo",
          attributes: {
            name: "Hassan"
          }
        }
      });
    });

    it("serializes an array of models", function() {
      let photo1 = new Photo({
        id: 1,
        name: "Zahra"
      });

      let photo2 = new Photo({
        id: 2,
        name: "Tom"
      });

      expect(serializer.serializeMany([photo1, photo2])).to.deep.equal({
        data: [{
          id: 1,
          type: "photo",
          attributes: {
            name: "Zahra"
          }
        }, {
          id: 2,
          type: "photo",
          attributes: {
            name: "Tom"
          }
        }]
      });
    });

    it("converts undefined values to null", function() {
      class Post extends Model {
        static attributes = ["name", "datePosted"];
      }

      let post = new Post({
        id: 123,
        name: "The Importance of Being Earnest"
      });

      expect(serializer.serialize(post)).to.deep.equal({
        data: {
          type: "post",
          id: 123,
          attributes: {
            name: "The Importance of Being Earnest",
            datePosted: null
          }
        }
      });
    });

  });

});