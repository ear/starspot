namespace JSONAPI {
  export type ID = string | number;
  export type Value = string | number | boolean | {};

  export interface DataDocument {
    /** the document’s “primary data” */
    data: PrimaryData;

    /** a meta object that contains non-standard meta-information. */
    meta?: {};

    /** an object describing the server’s implementation */
    jsonapi?: {};

    /** a links object related to the primary data */
    links?: LinkObject;

    /** an array of resource objects that are related to the primary data and/or each other  */
    included?: ResourceObject[];
  }

  export interface ErrorDocument {
    /** an array of error objects */
    errors: Error[];

    /** a meta object that contains non-standard meta-information. */
    meta?: {};

    /** an object describing the server’s implementation */
    jsonapi?: {};

    /** a links object related to the primary data */
    links?: LinkObject;

    /** an array of resource objects that are related to the primary data and/or each other  */
    included?: ResourceObject[];
  }

  export type Document = ErrorDocument | DataDocument;

  export type PrimaryData = ResourceObject | ResourceObject[];

  export interface LinkObject {
    href: string;
    meta: any;
  }

  export type Link = LinkObject | string;

  export interface LinksAbout {
    about: Link;
  }

  export interface AttributesObject {
    [key: string]: Value;
  }

  export interface ResourceObject {
    id: ID;
    type: string;

    /** an attributes object representing some of the resource’s data. */
    attributes?: AttributesObject;
  }

  export interface Error {
    /**  a unique identifier for this particular occurrence of the problem. */
    id: ID;

    /** a links object containing an `about` field */
    links: LinksAbout;

    /**  the HTTP status code applicable to this problem, expressed as a string value. */
    status: string;

    /** an application-specific error code, expressed as a string value. */
    code: string;

    /** a short, human-readable summary of the problem that SHOULD NOT change
     *  from occurrence to occurrence of the problem, except for purposes of
     *  localization. */
    title: string;

    /** a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized. */
    detail: string;

    /**  an object containing references to the source of the error */
    source: any;

    /** a meta object containing non-standard meta-information about the error. */
    meta: any;
  }
}

export default JSONAPI;