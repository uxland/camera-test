import {CameraTest} from "../src/index";

const cameraTest = new CameraTest();

const content = document.querySelector(".content");
content.appendChild(cameraTest as any);
