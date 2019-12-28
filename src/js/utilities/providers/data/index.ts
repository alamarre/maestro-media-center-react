import RecentlyUpdatedTvShow from "../../../models/RecentlyUpdatedTvShow";
import ISimpleDataProvider from "./ISimpleDataProvider";
import SimpleDataProvider from "./SimpleDataProvider";
import ApiCaller from "../ApiCaller";

export default (apiCaller: ApiCaller) => {
  const recentTvShows : ISimpleDataProvider<RecentlyUpdatedTvShow> = new SimpleDataProvider(apiCaller, "shows", "recent");
  return {
    recentTvShows
  };
};
