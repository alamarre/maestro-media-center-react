import ISimpleDataProvider from "./ISimpleDataProvider";

import ApiCaller from "../ApiCaller";

export default class SimpleDataProvider<T> implements ISimpleDataProvider<T> {
  private apiCaller: ApiCaller;
  private module: string;
  private path: string;
  constructor(apiCaller : ApiCaller, module: string, path: string) {
    this.apiCaller = apiCaller;
    this.module = module;
    this.path = path;
  }

  async get<T>(id: string): Promise<T> {
    return await this.apiCaller.get<T>(this.module, `${this.path}/${id}`, new Map());
  }
  async list<T>(): Promise<T[]> {
    return await this.apiCaller.get<T[]>(this.module, this.path, new Map());
  }
  async post<T>(body: T): Promise<any> {
    await this.apiCaller.post(this.module, `${this.path}`, new Map(Object.entries({
      body: JSON.stringify(body)
    })));
  }
  async put<T>(body: T, id: string): Promise<any> {
    await this.apiCaller.put(this.module, `${this.path}`, new Map(Object.entries({
      body: JSON.stringify(body)
    })));
  }
  async delete<T>(id: string): Promise<any> {
    await this.apiCaller.put(this.module, `${this.path}/${id}`, new Map());
  }
}
