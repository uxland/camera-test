import {listen, propertiesObserver} from "@uxland/uxl-utilities";
import {css, customElement, html, LitElement, property, query, unsafeCSS} from "lit-element";
import styles from "./styles.scss";
import {template} from "./template";

// @ts-ignore
@customElement("camera-test")
export class CameraTest extends propertiesObserver(LitElement) {

	render() {
		return html`${template(this)}`;
	}

	static get styles() {
		return css`${unsafeCSS(styles)}`;
	}

}


