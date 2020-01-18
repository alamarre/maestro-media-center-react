export default interface VideoPlayInformation {
  sources?: string[],
  subtitles?: string[],
  name?: string,
  seekTime?: number,
  path?: string,
  index?: number;
}
