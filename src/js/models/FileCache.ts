export default interface FileCache {
  files: Map<string, string>;
  folders: Map<string, FileCache>;
}
