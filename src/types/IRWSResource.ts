import RWSModel from "../models/_model";

export interface IRWSResource {
    name: string;
    model: typeof RWSModel<any>;
    endpoints?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      delete?: boolean;
      list?: boolean;
    };
    custom_routes?: {
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      handler: string;
    }[];
  }
