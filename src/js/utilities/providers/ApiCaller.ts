export default class ApiCaller {
  private authTokenManager: any;
  private scheme: string;
  private host: string;

  constructor(authTokenManager, scheme: string, host: string) {
    this.authTokenManager = authTokenManager;
    this.scheme = scheme || "http";
    this.host = host;
  }

  updateSettings(scheme, host) {
    this.host = host;
    this.scheme = scheme;
  }

  getHost() {
    return this.scheme + "://" + this.host;
  }

  async get<T>(module: string, path: string, options: Map<string, any> = new Map()): Promise<T> {
    const requestOptions: RequestInit = Object.assign({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authTokenManager.getToken()}`,
      },
    }, options);

    const url = this.getUrl(module, path, options);
    const result = await fetch(url, requestOptions);
    const response: T = await result.json();
    return response;
  }

  async post<T>(module: string, path: string, body: object, options: Map<string, any> = new Map()) {
    const requestOptions: RequestInit = Object.assign({
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authTokenManager.getToken()}`,
      },
    }, options);

    const url = this.getUrl(module, path, options);
    const result = await fetch(url, requestOptions);
    const response: T = await result.json();
    return response;
  }

  async put(module: string, path: string, options: Map<string, any> = new Map()) {
    const requestOptions: RequestInit = Object.assign({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authTokenManager.getToken()}`,
      },
    }, options);

    const url = this.getUrl(module, path, options);
    const result = await fetch(url, requestOptions);
    return await result.json();
  }

  async delete(module: string, path: string, options: Map<string, any> = new Map()) {
    const requestOptions: RequestInit = Object.assign({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authTokenManager.getToken()}`,
      },
    }, options);

    const url = this.getUrl(module, path, options);
    const result = await fetch(url, requestOptions);
    return await result.json();
  }

  private getUrl(module: string, path: string, options: Map<string, any>): string {
    const version = options["version"] || "v1.0";
    const hostSection = this.host ? this.getHost() : "";
    let url = `${hostSection}/api/${version}/${module}`;
    if (path) {
      url += `/${path}`;
    }

    if (options["queryParameters"]) {
      url += "?";
      for (const key of Object.keys(options["queryParametets"])) {
        const prefix = url.endsWith("?") ? "" : "&";
        url += `${prefix}${key}=${options["queryParametets"][key]}`;
      }
    }

    return url;

  }
}
