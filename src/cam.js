import { FaceMesh, FACEMESH_FACE_OVAL } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { eye, point, line, screen } from "./renderer";

cam_canvas.width = 800
cam_canvas.height = 800

const ctx = cam_canvas.getContext('2d');

let z_start = 0.07
let z_end = 0.17

// 100 px <=> 1 <=> n cm (3 cm)

function norm(p) {
    // 0..1 => -1..1
    // let z_end = 0.122
    // z_start..z_end
    return {
        x: p.x * -2 + 1,
        y: (p.y) * -2 + 1, // 0..1 => 0..2 => 0..1
        // z: p.z * 10,
        z: ((-p.z) - z_start) / (z_end - z_start),
    }
}
// z 0..1
// z0 == 60 cm
const NOSE_LENGHT = 2 // cm

// (z - z0)
// nose tip at 60
// nose_dist *x = NOSE_LENGHT
// SCALE = NOSE_LENGHT / nose_dist
// 1 - z

function drawCam(ctx, image) {
    ctx.scale(-1, 1);
    ctx.drawImage(
        image, -cam_canvas.width, 0, cam_canvas.width, cam_canvas.height);
    ctx.restore();
}

function clearLog() {
    coords_el.innerHTML = ''
}
function logPointAdd(p) {
    coords_el.innerHTML += `(x: ${p.x.toFixed(5)}, y: ${p.y.toFixed(5)}, z: ${p.z.toFixed(5)}) <br>`
}
function logAdd(s) {
    coords_el.innerHTML += s + '<br>'
}
function square(n) {
    return Math.pow(n, 2)
}
function dist(a, b) {
    return Math.sqrt(square(a.x - b.x) + square(a.y - b.y) + square(a.z - b.z))
}

const ShowPoints = {
	all: 'all',
	border: 'border',
	nose: 'nose',
}

let showPoints = ShowPoints.all

toggle_show_points_btn.addEventListener('click', function() {
	console.log('clicked')
	if (showPoints === ShowPoints.all) {
		showPoints = ShowPoints.border
	} else if (showPoints === ShowPoints.border) {
		showPoints = ShowPoints.nose
	} else if (showPoints === ShowPoints.nose) {
		showPoints = ShowPoints.all
	}
	toggle_show_points_btn.innerHTML = 'Show: ' + showPoints
});

let isSendPoint = false
toggle_is_send_point.addEventListener('click', function() {
	isSendPoint = !isSendPoint
	toggle_is_send_point.innerHTML = 'Toggle send: ' + isSendPoint
})

// const borderIndices = [10, 21, 54, 58, 67, 93, 103, 109, 127, 132, 136, 148, 149, 150, 152, 162, 172, 176, 234, 251, 284, 288, 297, 323, 332, 338, 356, 361, 365, 377, 378, 379, 389, 397, 400, 454]

// const simplePoints = [2, 4, 10, 17, 21, 33, 37, 48, 58, 61, 93, 98, 103, 127, 145, 150, 152, 159, 173, 251, 263, 267, 278, 288, 291, 323, 327, 332, 356, 362, 374, 379, 386, 468, 473]

const nose = [2, 327, 278, 4, 48, 98, ]
const mouth = [17, 291, 267, 37, 61, ]

const left_eye = [263, 386, 362, 374]
const right_eye = [173, 159, 33, 145]
const iris = [468, 473]

const border = [
	251, 332, 10, 103, 21, // forehead
	127, 93, 58, 150, 152, 379, 288, 323, 356, // jawline
]

let i = 1
let ps = []
function onResults(results) {
    ctx.save();
    ctx.clearRect(0, 0, cam_canvas.width, cam_canvas.height);
    //drawCam(ctx, results.image)

    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            clearLog()
            let z_initial = landmarks[1].z
            logAdd('z tip' + z_initial.toFixed(5))

            let noseTip = norm({ ...landmarks[1] })
            let leftNose = norm({ ...landmarks[327] })
            let rightNose = norm({ ...landmarks[98] })
            // logPointAdd(noseTip)

            const midpoint = {
                x: (leftNose.x + rightNose.x) / 2,
                y: (leftNose.y + rightNose.y) / 2,
                z: (leftNose.z + rightNose.z) / 2,
            };

            const draw_mirrored = (p) => {
                point(ctx, screen(p, cam_canvas))
            }
            const draw_line_mirrored = (p1, p2) => {
                line(ctx, screen(p1, cam_canvas), screen(p2, cam_canvas))
            }
            const draw_polyline_mirrored = (indices) => {
							for (let i = 0; i < indices.length - 1; i++) {
								let idx1 = indices[i]
								let idx2 = indices[i+1]
								let p1 = norm({...landmarks[idx1]})
								let p2 = norm({...landmarks[idx2]})
							  draw_mirrored(p1)
								draw_line_mirrored(p1, p2)
							}
							let p1 = norm({...landmarks[indices[indices.length-1]]})
							let p2 = norm({...landmarks[indices[0]]})
							draw_mirrored(p1)
							draw_line_mirrored(p1, p2)
						}

						if (showPoints === ShowPoints.all) {
							for (let l of landmarks) {
								let p = norm({...l})
								draw_mirrored(p)
							}
						} else if (showPoints === ShowPoints.border) {
							//console.log('oval', FACEMESH_FACE_OVAL)
							draw_polyline_mirrored(border)
							draw_polyline_mirrored(left_eye)
							draw_polyline_mirrored(right_eye)
							draw_polyline_mirrored(mouth)
							draw_polyline_mirrored(nose)
							// draw_mirrored(midpoint)
							// draw_mirrored(noseTip)
							// draw_mirrored(leftNose)
							// draw_mirrored(rightNose)
						} else if (showPoints === ShowPoints.nose) {
							draw_mirrored(midpoint)
							draw_mirrored(noseTip)
							draw_mirrored(leftNose)
							draw_mirrored(rightNose)
						}

            // logPointAdd(leftNose)
            // let d = dist(midpoint, noseTip)
            // logAdd('nose_dist ' + d)
            let p = noseTip
            ps.push(p)
            if (ps.length === 5) {
                eye.x = ps.reduce((acc, p) => acc + p.x, 0) / ps.length
                eye.y = ps.reduce((acc, p) => acc + p.y, 0) / ps.length
                eye.z = ps.reduce((acc, p) => acc + p.z, 0) / ps.length

                ps.shift()
            }

						if (isSendPoint) {
							sendPoint(eye)
						}

            logPointAdd(eye)
        }
    }
    ctx.restore();
}

function sendPoint(p) {
	const payload = new ArrayBuffer(12);
	const view = new DataView(payload);
	view.setFloat32(0, p.x, false);
	view.setFloat32(4, p.y, false);
	view.setFloat32(8, p.z, false);
	fetch(`http://localhost:8000`, {
		method: 'POST',
		body: payload,
	})
}

console.log('oval', FACEMESH_FACE_OVAL)
export function runCamera() {
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        // minDetectionConfidence: 0.5,
        // minTrackingConfidence: 0.5
        minDetectionConfidence: 0.9,
        minTrackingConfidence: 0.9
    });
    faceMesh.onResults(onResults);

    const camera = new Camera(video_el, {
        onFrame: async () => {
            await faceMesh.send({ image: video_el });
        },
        width: cam_canvas.width,
        height: cam_canvas.height
    });
    camera.start();
}
