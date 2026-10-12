import "@mediapipe/face_mesh";

import { runRender } from "./renderer.js";
import { runCamera } from "./cam.js";

runRender()

start_camera_btn.addEventListener('click', function() {
    runCamera()
});
