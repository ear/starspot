import Resolver from "./resolver";

interface Cache {
  [key: string]: TypeCache;
}

interface TypeCache {
  [key: string]: any;
}

interface FileMap {
  [key: string]: [string, Key];
}

export type Key = string | symbol;

export interface Factory {
  new (...args: any[]): any;
}

export type Entity = [string, Key];

export interface InjectionOptions {
  /** The resolver type and name to inject into */
  with: Entity;
  /** Set the injected value to this property name */
  as: string;

  /** Optional name for this injection used for debugging */
  annotation?: string;
}

const ALL = Symbol("all");

class Container {
  public resolver: Resolver;

  private factoryCache: Cache = { };
  private instanceCache: Cache = { };
  private moduleCache: Cache = { };

  private factoryRegistrations: Cache = { };
  private injectionsMap: Cache = { };
  private fileMap: FileMap = { };

  constructor(rootPath?: string) {
    this.resolver = new Resolver({ rootPath });
  }

  static metaFor(instance: any): Container.Meta {
    return instance[Container.META];
  }

  registerFactory(type: string, name: Key, factory: Factory): void {
    cacheFor(this.factoryRegistrations, type)[name] = factory;
  }

  inject(target: Entity, options: InjectionOptions): void;
  inject(type: string, options: InjectionOptions): void;
  inject(target: any, options: InjectionOptions) {
    let injections: InjectionOptions[];

    if (typeof target === "string") {
      injections = this.injectionsFor(target);
    } else {
      let [type, name] = target;
      injections = this.injectionsFor(type, name);
    }

    injections.push(options);
  }

  findController(controllerName: string) {
    return this.findInstance("controller", controllerName);
  }

  fileDidChange(path: string) {
    path = path.split(".").slice(0, -1).join(".");
    let fileInfo = this.fileMap[path];
    if (!fileInfo) { return; }

    let [type, name] = fileInfo;

    let cache = cacheFor(this.factoryCache, type);
    cache[name] = null;

    cache = cacheFor(this.instanceCache, type);
    cache[name] = null;

    cache = cacheFor(this.moduleCache, type);
    cache[name] = null;

    delete require.cache[require.resolve(path)];
  }

  findModule(type: string, name: Key) {
    let cache = cacheFor(this.moduleCache, type);
    if (cache[name]) { return cache[name]; }

    let [mod, modulePath] = this.resolver.resolve<any>([type, name]);

    this.fileMap[modulePath] = [type, name];

    return cache[name] = mod;
  }

  findInstance(type: string, name: Key) {
    let cache = cacheFor(this.instanceCache, type);

    if (cache[name]) { return cache[name]; }

    let Factory = this.findFactory(type, name);
    let instance = new Factory();

    instance[Container.META] = { name, container: this };

    cache[name] = instance;

    return instance;
  }

  findFactory(type: string, name: Key) {
    let cache = cacheFor(this.factoryCache, type);
    if (cache[name]) { return cache[name]; }

    let registrations = cacheFor(this.factoryRegistrations, type);
    if (registrations[name]) {
      return this.buildFactoryWithInjections(type, name, registrations[name]);
    }

    let [factory, factoryPath] = this.resolver.resolve<Factory>([type, name]);

    this.fileMap[factoryPath] = [type, name];

    return cache[name] = this.buildFactoryWithInjections(type, name, factory);
  }

  injectionsFor(type: string, name: Key = ALL): InjectionOptions[] {
    let typeInjections = cacheFor(this.injectionsMap, type);
    let injections = typeInjections[name];

    if (!injections) {
      injections = typeInjections[name] = [];
    }

    return injections;
  }

  buildFactoryWithInjections(type: string, name: Key, factory: Factory): any {
    let injections = this.injectionsFor(type, name);
    let typeInjections = this.injectionsFor(type);

    if (!injections && !typeInjections) { return factory; }

    injections = injections || [];
    typeInjections = typeInjections || [];

    if (!injections.length && !typeInjections.length) { return factory; }

    injections = injections.concat(typeInjections);

    injections.filter(injection => {
      let [withType, withName] = injection.with;
      if (withType === type && withName === name) {
        let annotation = injection.annotation || "an injection";
        throw new Error(`Circular injection detected: injection "${annotation}" attempted to inject ${name} ${type} into itself.`);
      }
    });

    let resolver = this;

    return function() {
      let instance = new factory(...arguments);

      for (let i = 0; i < injections.length; i++) {
        let injection = injections[0];
        let [injectionType, injectionName] = injection.with;

        instance[injection.as] = resolver.findInstance(injectionType, injectionName);
      }

      return instance;
    };
  }
}

namespace Container {
  export const MAIN = Symbol("resolver main");
  export const META = Symbol("meta");

  export interface Meta {
    name: string;
    container: Container;
  }

  export interface Result {
    [meta: string]: Meta;
  }
}

function cacheFor(cache: Cache, type: string): TypeCache {
  let typeCache = cache[type];

  if (!typeCache) {
    typeCache = cache[type] = {};
  }

  return typeCache;
}

export default Container;