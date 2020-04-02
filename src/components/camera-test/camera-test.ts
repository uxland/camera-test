import { listen, propertiesObserver } from "@uxland/uxl-utilities";
import { css, customElement, html, LitElement, property, query, unsafeCSS } from "lit-element";
import styles from "./styles.scss";
import { template } from "./template";
import Cropper from "cropperjs";
import { clone } from "ramda";
import { ImageCapture } from "image-capture";

//Ratios de aspecto 

const SQUARE_ASPECT_RATIO = 1;
const RECTANGLE_ASPECT_RATIO = 1.414;
const RECTANGLE_PORTRAIT_ASPECT_RATIO = 0.706;
// @ts-ignore
@customElement("camera-test")
export class CameraTest extends propertiesObserver(LitElement) {

	/**
	 * Properties
	 */

  @property()
	public isPortraitMode: boolean;
	
  @property()
	public imageCapture: any;
	
  @property()
	public cameraHtmlElement: any;
	
  @property()
	public mediaStreamTrack: any;
	
  @property()
	public mediaStreamTrackList: any;
	
  @property()
	public base64Preview: any;
	
  @property()
	public constraints: any = { video: {}, audio: false };
	
  @property()
	public cameraDevices: Array<any> = [];
	
  @property()
	public cropImage: any;
	
  @property()
	public selectedCamera: number = 0;
	
  @property()
	public canToggleCamera: boolean = true;
	
  @property()
	public aspectRatio: number = SQUARE_ASPECT_RATIO;
	
  @query("#preview")
	public imgPreviewHtmlImage: HTMLImageElement;

	@property()
	public submitCommand: Function = () => undefined; // Este es el metodo donde se trabaja el resultado de la foto
	
	/**
	 * Listeners
	 */

  @listen("click", "#take-photo")
  public _onTakePhoto() {
    if (this.imageCapture) {
      this.imageCapture.takePhoto().then(blob =>
        this.blobToBase64(blob)
          .then(result => {
            this.base64Preview = result;
          })
          .finally(() => {
            if (this.imgPreviewHtmlImage && this.base64Preview) {
              this.imgPreviewHtmlImage.src = this.base64Preview;
            }
            this.createNewCropper();
            this.stopMediaStreamTrack();
          })
      );
    }
  }

  @listen("click", "#close")
  public _onBack() {
    this.stopMediaStreamTrack().finally(() => {
      this.remove();
      if (this.cropImage) {
        this.cropImage.destroy();
      }
    });
  }

  @listen("click", "#accept")
  public _onAccept() {
    let canvas = this.cropImage.getCroppedCanvas({ maxWidth: 800 });
    this.rotateCanvas(canvas, canvas.toDataURL()).then((base64Image: string) => {
      let photo = base64Image.split(",")[1];
      this.submitCommand(photo);
      this.stopMediaStreamTrack().finally(() => {
        this.remove();
        if (this.cropImage) {
          this.cropImage.destroy();
        }
      });
    });
  }

  @listen("click", "#cancel")
  public _onCancel() {
    this.base64Preview = undefined;
    if (this.cropImage) {
      this.cropImage.destroy();
    }
    this.stopMediaStreamTrack().finally(() => {
      this.getUserMedia().then(stream => {
        this.gotMedia(stream);
      });
    });
  }

  @listen("click", "#toggle")
  public onClickToggleCamera() {
    if (this.canToggleCamera) {
      this.canToggleCamera = false;
      if (this.cameraDevices && this.cameraDevices.length && this.cameraDevices.length > 1) {
        if (this.cropImage) {
          this.cropImage.destroy();
        }
        if (this.selectedCamera == 0) {
          this.selectedCamera = 1;
        } else {
          this.selectedCamera = 0;
        }
        this.getUserMedia().then(stream => {
          this.gotMedia(stream);
        });
      }
    }
	}
	
	/**
	 * Methods
	 */

  rotateCanvas(canvas, base64data) {
    return new Promise(resolve => {
      if (canvas.width > canvas.height) {
        var ctx = canvas.getContext("2d");
        var image = new Image();
        image.src = base64data;
        image.onload = function() {
          ctx.translate(image.width, image.height);
          ctx.rotate((-90 * Math.PI) / -90);
          ctx.drawImage(image, 0, 0);
        };
      }
      resolve(canvas.toDataURL());
    });
  }

  public blobToBase64(blob: any) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function(this) {
        resolve(reader.result);
      };
    });
  }

  public isPortraitModeChanged() {
    if (this.aspectRatio != SQUARE_ASPECT_RATIO) {
      if (this.cropImage) {
        this.cropImage.destroy();
        this.recalculateAspectRatioPortraitMode();
        this.createNewCropper();
      }
    }
  }

  public recalculateAspectRatioPortraitMode() {
    if (this.aspectRatio != SQUARE_ASPECT_RATIO) {
      if (this.isPortraitMode) {
        this.aspectRatio = RECTANGLE_PORTRAIT_ASPECT_RATIO;
      } else {
        this.aspectRatio = RECTANGLE_ASPECT_RATIO;
      }
    }
  }

  public createNewCropper() {
    this.recalculateAspectRatioPortraitMode();
    this.cropImage = new Cropper(this.imgPreviewHtmlImage, {
      aspectRatio: this.aspectRatio,
      autoCrop: true,
      dragMode: "move",
      cropBoxResizable: false,
      cropBoxMovable: false,
      viewMode: 0,
      scalable: false,
      center: true
    });
  }

  public setOrientationScreen() {
    let orientation = window.matchMedia("(orientation: portrait)");
    this.isPortraitMode = orientation.matches;
  }

  public async getUserMedia() {
    this.cameraDevices = [];
    await navigator.mediaDevices.enumerateDevices().then((devices: any) => {
      for (let device of devices) {
        if (device.kind == "videoinput") {
          this.cameraDevices.push(device);
        }
      }
      this.constraints.video.deviceId = {
        exact: this.cameraDevices[this.selectedCamera].deviceId
      };
    });
    return navigator.mediaDevices.getUserMedia(clone(this.constraints));
  }

  public async getVideoDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === "videoinput");
    return videoDevices;
  }

  public gotMedia(mediaStream) {
    this.cameraHtmlElement = this.shadowRoot.querySelector("#camera");
    this.cameraHtmlElement.srcObject = mediaStream;
    this.mediaStreamTrackList = mediaStream.getVideoTracks();
    this.mediaStreamTrack = this.mediaStreamTrackList[0];
    this.imageCapture = new ImageCapture(this.mediaStreamTrack);
    this.canToggleCamera = true;
  }

  public stopMediaStreamTrack() {
    return new Promise(resolve => {
      if (this.mediaStreamTrackList) {
        for (let track of this.mediaStreamTrackList) {
          track.stop();
        }
      }
      if (this.mediaStreamTrack) {
        this.mediaStreamTrack.stop();
        this.mediaStreamTrack = undefined;
      }
      this.imageCapture = undefined;
      resolve();
    });
	}

	/**
	 * Metodos nativos
	 */

	constructor() {
    super();
    window.addEventListener(
      "resize",
      () => {
        this.setOrientationScreen();
      },
      false
    );
    Cropper.noConflict();
	}
	
	//** Muy importante el conected callback para que empiece a grabar el stream de la camara */

	public connectedCallback() {
    super.connectedCallback();
    this.setOrientationScreen();
    this.getUserMedia().then(stream => {
      this.gotMedia(stream);
    });
	}
	//** El disconected callback es muy importante para que para el stream de la camara, de lo contrario la camara no dejaria de grabar al cerrar la app */
	disconnectedCallback() {
    this.stopMediaStreamTrack();
  }

  render() {
    return html`
      ${template(this)}
    `;
  }

  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }
}
