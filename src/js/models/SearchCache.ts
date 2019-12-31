import SearchResult from "./SearchResult";
export default interface SearchCache {
  files: SearchResult[];
  folders: string[];
}
