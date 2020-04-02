import { html } from "lit-element/lit-element";
import { CameraTest } from "./camera-test";
import { classMap } from "lit-html/directives/class-map";

export const template = (props: CameraTest) => html`
  <div class="wrapper ${classMap({ portrait: props.isPortraitMode })}">
    <video id="camera" class="${classMap({ hidden: props.mediaStreamTrack == undefined })}" autoplay></video>
    <div>
      <img
        id="preview"
        class="${classMap({ hidden: props.base64Preview == undefined })}"
        src="${props.base64Preview}"
      />
    </div>
    <div id="close">
      <button>X</button>
    </div>
    <div id="accept" class="${classMap({ hidden: props.base64Preview == undefined })}">
    </div>
    <div id="take-photo"></div>
    <div id="cancel" class="${classMap({ hidden: props.base64Preview == undefined })}">
    </div>
    <div id="toggle">
      <button>Cambiar de camara</button>
    </div>
  </div>
`;
