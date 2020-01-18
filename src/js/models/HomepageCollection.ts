export default interface HomepageCollection {
  visible: boolean;
  endDate: string;
  created: number;
  startDate: string;
  name: string;
  items: HomepageCollectionItem[];
}

export interface HomepageCollectionItem {
  name: string;
  type: string;
}
