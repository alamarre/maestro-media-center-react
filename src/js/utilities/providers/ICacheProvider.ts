import FileCache from "../../models/FileCache";
import RootFolder from "../../models/RootFolder";

export interface ICacheProvider {
  getCache(): Promise<FileCache>;
  fetchCache(): Promise<FileCache>;
  reload(): Promise<void>;
  isTvShow(path: string): Promise<boolean>;
  getShowPath(showName: string): Promise<string>;
  getCacheFromPath(path: string): Promise<FileCache>;
  getRootFolders(): Promise<RootFolder[]>;
  fetchRootFolders(): Promise<RootFolder[]>;
}
