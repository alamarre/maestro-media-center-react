import React from "react";

import ApiCaller from "../../utilities/providers/ApiCaller";
import uuid from "uuid/v4";

const tvPattern = /s?([0-9]{1,3})(\s|[.exEX-])+([0-9]{1,3})/i;
const removeLeadingPattern = /^(\s|[-.])*(.*)$/i;

interface EpisodeData {
  movieName?: string;
  name: string;
  show?: string;
  season?: string;
  type: string;
  episode?: string;
}

function cleanup(value) {
  const result = removeLeadingPattern.exec(value);
  const [,,output,] = result;
  return output;
}
function parseByName(value) {
  const result = tvPattern.exec(value);
  if(result) {
    const [fullMatch,season,,episode,] = result;
    let show ="";
    if(value.indexOf(fullMatch) > 0) {
      show = value.substring(0, value.indexOf(fullMatch)).trim();
    }

    const name = cleanup(value.substring(value.indexOf(fullMatch) + fullMatch.length));

    return {show, movieName: value, season, name, episode, type: "tv",};
  }

  return {type: "movie", moveieName: value, name: value,};
}

interface File {
  stream: () => any;
  name: string;
  size: number;
  type: string;
  progress: number;
  data: EpisodeData;
  videoType: string;
  enqueued: boolean;
  slice: (start: number, end: number, contentType?: string) => Blob;
  arrayBuffer: () => ArrayBuffer;
}

interface Blob {
  arrayBuffer: () => ArrayBuffer;
  size: number;
}

export interface UploaderProps {
  apiCaller: ApiCaller;
}

export interface UploaderState {
  files: any[];
}



export default class Uploader extends React.Component<UploaderProps, UploaderState> {
  private toUpload;
  private currentIndex = 0;
  private uploading = false;
  constructor(props) {
    super(props);
    this.state = { files: [] };
    this.toUpload = [];
  }

  componentDidMount() {

  }

  async handleFileSelect(evt) {

    const files : File[] = Array.from(evt.target.files);
    files.forEach(file => {
      const data = parseByName(file.name);
      file.data = data;
      file.videoType = data.type;
    });
    this.setState({files: this.state.files.concat(files)});
  }

  async enqueueFile(file: File) {
    this.toUpload.push(file);
    file.enqueued = true;
    file.progress = 0;


    this.setState({files: this.state.files});

    if(!this.uploading) {
      this.startUpload();
    }
  }

  async startUpload() {
    while(this.currentIndex <= this.toUpload.length) {
      const file : File = this.toUpload[this.currentIndex++];
      const bucket = "lamarre-videos";
      const extension = file.name.substring(file.name.lastIndexOf(".")+1);
      const fileName = uuid()+"."+extension;

      if(file.size < 5*1024*1024) {
        const shaArray = await crypto.subtle.digest("SHA-1", await file.arrayBuffer());
        const hashArray = Array.from(new Uint8Array(shaArray));                     // convert buffer to byte array
        const sha = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        const uploadInfo : any = await this.props.apiCaller.post("b2", "files/get_upload_url", {bucket});
        const {uploadUrl, authorizationToken, fileId} = uploadInfo;
        let status = -1;
        const headers : any = {
          "Authorization": authorizationToken,
          "X-Bz-File-Name": fileName,
          "Content-Type": file.type,
          "Content-Length": file.size,
          "X-Bz-Content-Sha1": sha
        };
        const blob : any = file;
        while(status != 200) {
          const result = await fetch(`https://cors-proxy.al.workers.dev/?${uploadUrl}`, {
            method: "POST",
            mode: "cors",
            headers,
            body: blob
          });
          status = result.status;
        }
        continue;
      }

      const startInfo : object = await this.props.apiCaller.post("b2", `files/${bucket}/${fileName}`, {});
      const uploadInfo : any = await this.props.apiCaller.post("b2", "files/get_upload_part_url", startInfo);
      const {uploadUrl, authorizationToken, fileId} = uploadInfo;
      const shas = [];



      let i = 1;
      const partSize = Math.min(1*1024*1024, file.size / 2);
      let start = 0;

      while(start < file.size) {

        const current : any = file.slice(start, Math.min(start+partSize, file.size), file.type);

        const shaArray = await crypto.subtle.digest("SHA-1", await current.arrayBuffer());
        const hashArray = Array.from(new Uint8Array(shaArray));                     // convert buffer to byte array
        const sha = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        start += partSize;
        shas.push(sha);
        const headers : any = {
          "Authorization": authorizationToken,
          "X-Bz-Part-Number": i++,
          "Content-Length": current.size,
          "X-Bz-Content-Sha1": sha
        };
        let status = -1;
        while(status != 200) {
          const result = await fetch(`https://cors-proxy.al.workers.dev/?${uploadUrl}`, {
            method: "POST",
            mode: "cors",
            headers,
            body: current
          });
          status = result.status;
        }
        file.progress = Math.round((100 * start/file.size) * 100) / 100;
        if(file.progress > 100) {
          file.progress = 100;
        }
        this.setState({files: this.state.files});
      }

      const completeInfo = await this.props.apiCaller.put("b2", "files/complete", Object.assign(startInfo, {shas}));
      //return completeInfo;
    }
    this.uploading = false;
  }

  render() {
    const files = this.state.files.map((f: File) => {
      const bottom = f.enqueued ? <div>{f.progress}%</div> : <button onClick={() => this.enqueueFile(f)}>Upload</button>;

      const selector = <select onChange={(evt) => {f.videoType = evt.target.value; this.setState({files: this.state.files})}} defaultValue={f.videoType}>
        <option value="tv">TV Show</option>
        <option value="movie">Movie</option>
      </select>;

      const form = f.videoType ? f.videoType == "tv" ?
        <div>
          <div>Show Name: <input onChange={(evt) => f.data.show = evt.target.name} defaultValue={f.data.show}></input></div>
          <div>Season: <input onChange={(evt) => f.data.season = evt.target.name} defaultValue={f.data.season}></input></div>
          <div>Episode: <input onChange={(evt) => f.data.episode = evt.target.name} defaultValue={f.data.episode}></input></div>
          <div>Name: <input onChange={(evt) => f.data.name = evt.target.name} defaultValue={f.data.name}></input></div>

        </div> :
        <div>
          <div>Name: <input onChange={(evt) => f.data.movieName = evt.target.name} defaultValue={f.data.movieName}></input></div>
        </div> : null;

      const formWrapper = f.videoType ? <div>{selector}{form}</div>: null;
      return <div key={f.name}>
        <div>{f.name}</div>
        {formWrapper}
        {bottom}
      </div>
    })
    return (
      <div>
        <label style={{
          cursor: "pointer",
          fontWeight: 700,
          color: "white",
          backgroundColor: "red",
          display: "inline-block"}}>Choose files
          <input style={{position: "absolute", top: 0, left: 0, width: "0.1px", height: "0.1px", opacity: 0, overflow: "hidden", zIndex: -1}} type="file" onChange={(evt) => this.handleFileSelect(evt)} name="filefield" multiple={true} />
        </label>

        <div>{files}</div>
      </div>
    );
  }
}


