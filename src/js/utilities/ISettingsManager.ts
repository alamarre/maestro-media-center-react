export default interface ISettingsManager {
  get(name: string): string;
  set(name: string, value: string): void;
}
