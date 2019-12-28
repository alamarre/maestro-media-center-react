import FileCache from "../../models/FileCache";
import RootFolder from "../../models/RootFolder";

export interface ICacheProvider {
  getCache(): Promise<FileCache>;
  fetchCache(): Promise<FileCache>;
  reload(): Promise<void>;
  isTvShow(path: undefined): Promise<boolean>;
  getShowPath(showName: undefined): Promise<string>;
  getCacheFromPath(path: undefined): Promise<FileCache>;
  getRootFolders(): Promise<RootFolder[]>;
  fetchRootFolders(): Promise<RootFolder[]>;
}
