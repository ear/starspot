import { inspect } from "util";

class UI {
  protected logLevel = UI.LogLevel.Info;

  private inputStream: NodeJS.ReadableStream;
  private outputStream: NodeJS.WritableStream;
  private errorStream: NodeJS.WritableStream;

  constructor(options: UI.ConstructorOptions = {}) {
    this.inputStream = options.inputStream || process.stdin;
    this.outputStream = options.outputStream || process.stdout;
    this.errorStream = options.errorStream || process.stderr;
    this.logLevel = options.logLevel || this.logLevel;
  }

  verbose(event: UI.Event, category?: UI.Category) {
    if (this.logLevel > UI.LogLevel.Verbose) { return; }

    event.category = category || "info";
    this._log(event);
  }

  info(event: UI.Event) {
    if (this.logLevel > UI.LogLevel.Info) { return; }

    event.category = "info";
    this._log(event);
  }

  warn(event: UI.Event) {
    if (this.logLevel > UI.LogLevel.Warn) { return; }

    event.category = "warn";
    this._log(event);
  }

  error(event: UI.Event) {
    if (this.logLevel > UI.LogLevel.Error) { return; }

    event.category = "error";
    this._log(event);
  }

  _log(event: UI.Event) {
    console.log(inspect(event));
  }
}

namespace UI {
  export enum LogLevel {
    VeryVerbose,
    Verbose,
    Info,
    Warn,
    Error
  }

  export type Category = "info" | "warn" | "error" | "prompt";

  export interface Event {
    name: string;
    category?: Category;
    logLevel?: LogLevel;
    [key: string]: any;
  }

  export interface ConstructorOptions {
    logLevel?: LogLevel;
    inputStream?: NodeJS.ReadableStream;
    outputStream?: NodeJS.WritableStream;
    errorStream?: NodeJS.WritableStream;
  }
}

export { UI as default };