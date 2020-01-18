export default interface ISimpleDataProvider<T> {
  get<T>(id: string): Promise<T>;
  list<T>(): Promise<T[]>;
  post<T>(body: T): Promise<any>;
  put<T>(body: T, id : string): Promise<any>;
  delete<T>(id : string): Promise<any>;
}
