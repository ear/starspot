import UI from "./ui";
import Router from "./router";
import Serializer from "./json-api/serializer";
import Resolver from "./resolver";

export interface ConstructorOptions {
  ui?: UI;
  rootPath?: string;
  resolver?: Resolver;
}

class Application {
  protected ui: UI;

  private _rootPath: string;
  private _resolver: Resolver;
  private _router: Router;
  private _serializer: Serializer;

  constructor(options: ConstructorOptions = {}) {
    this.ui = options.ui || new UI();

    this._rootPath = options.rootPath;
    this._resolver = options.resolver;
  }

  async boot() {
    let resolver = this._resolver;

    if (!resolver) {
      resolver = this._resolver = new Resolver(this._rootPath);
    }

    let router = this._router = this._resolver.findInstance("router", Resolver.MAIN);
    router.seal();

    this._serializer = new Serializer();
  }

  dispatch(request: Application.Request, response: Application.Response): Promise<Application.Response> {
    let path = request.url;

    let routes = this._router.handlersFor(path);

    if (!routes) {
      response.setHeader("Content-Type", "text/html");
      response.statusCode = 404;
      response.write("<h2>Not found!</h2>");
      response.end();
      return Promise.resolve(response);
    }

    let result: any;

    for (let i = 0; i < routes.length; i++) {
      let routeName = routes[i].handler;
      let controller = this._resolver.findController(routeName);
      result = controller.get();

      if (result) { break; }
    }

    return Promise.resolve(result)
      .then(model => {
        let json = this._serializer.serialize(model);
        let stringified = JSON.stringify(json);

        response.write(stringified);
        response.end();
      })
      .then(() => response);
  }
}

namespace Application {
  export interface Request {
    method: string;
    url: string;
    headers?: any;
    trailers?: any;
  }

  export interface Response {
    statusCode: number;
    setHeader(header: string, value: string): void;
    write(chunk: Buffer | string, cb?: Function): boolean;
    end(): void;
  }
}


export default Application;