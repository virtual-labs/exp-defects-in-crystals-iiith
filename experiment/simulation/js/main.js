// import * as THREE from 'three';
import { OrbitControls } from './orbit.js'
import * as THREE from './three.js'
import {
  AddLight,
  addSphere,
  addSphereAtCoordinate,
  CheckHover,
  DeleteObject,
  RepeatPattern,
  TranslatePattern,
  updateButtonCSS,
  highlightSelectList,
  moveSelectList,
  checkSCP,
  select_Region,
  changeCurrentLatticePrev,
  changeCurrentLatticeNext,
  createLattice,
  latticeChecker,
} from './utils.js'

var container = document.getElementById('canvas-main')
//  init camera
var camera = new THREE.PerspectiveCamera(
  75, //FOV
  container.clientWidth / container.clientHeight, //aspect ratio
  0.1,
  1000,
)
// var camera = new THREE.OrthographicCamera(
//   100 / -2,
//   100 / 2,
//   100 / 2,
//   100 / -2,
//   1,
//   100,
// )
camera.position.set(30, 30, 30)

// init the renderer and the scene

var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#000000')
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// document.body.appendChild(renderer.domElement);
container.appendChild(renderer.domElement)

// console.log(window);
// initialize the axes
var axesHelper = new THREE.AxesHelper(container.clientHeight)
scene.add(axesHelper)

// add light to the  system
const lights = AddLight()
for (let i = 0; i < lights.length; i++) {
  scene.add(lights[i])
}
// init the orbit controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
controls.autoRotate = true
controls.autoRotateSpeed = 0
controls.enablePan = false
controls.enableDamping = true

// to check the current object which keyboard points to
let INTERSECTED

function getMouseCoords(event) {
  var mouse = new THREE.Vector2()
  mouse.x =
    ((event.clientX - renderer.domElement.offsetLeft) /
      renderer.domElement.clientWidth) *
      2 -
    1
  mouse.y =
    -(
      (event.clientY - renderer.domElement.offsetTop) /
      renderer.domElement.clientHeight
    ) *
      2 +
    1
  // mouse.x = ( ( event.clientX - container.offsetLeft ) / container.clientWidth ) * 2 - 1;
  // mouse.y = - ( ( event.clientY - container.offsetTop ) / container.clientHeight ) * 2 + 1;
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse);
  return mouse
}
var mouse = new THREE.Vector2()
//  detect mouse click
let drag = false
document.addEventListener('mousedown', function (event) {
  drag = false
  mouse = getMouseCoords(event)
})
document.addEventListener('mousemove', function (event) {
  drag = true
  mouse = getMouseCoords(event)
})

document.addEventListener('keydown', function (event) {
  var keyCode = event.key
  if (keyCode == 'd') {
    DeleteObject(mouse, camera, scene, atomList, INTERSECTED)
  }
})

let action = ''

// create a list of atoms in scene
var atomList = []

var SelectAtomList = []
var BoundaryAtomList = []
var CurrentHull
var CurrentHullMesh
var HullMeshList = []
// var currentatom = document.getElementById("atomtype");
// var atomtype = currentatom.options[currentatom.selectedIndex].text;

// select region enclosed between the atoms
const selectRegion = document.getElementById('SelectRegion')
selectRegion.addEventListener('click', function () {
  if (action != 'selectRegion') {
    action = 'selectRegion'
  } else {
    action = ''
    for (let i=0;i<HullMeshList.length;i++) {
      scene.remove(HullMeshList[i])
    }
  }
  let vals = select_Region(SelectAtomList, atomList)
  let hullmesh = vals.mesh
  CurrentHullMesh = vals.mesh
  let arr = vals.selectarray
  CurrentHull = vals.convexHull
  for (let i = 0; i < arr.length; i++) {
    SelectAtomList.push(arr[i])
  }
  //   console.log(hullmesh)
  HullMeshList.push(hullmesh)
  scene.add(hullmesh)
})

// respond to click addAtom
// const addSphereButton = document.getElementById("AddAtom");
// addSphereButton.addEventListener("click", function () {
//     console.log("adding atom mode");
//     if (action != "addAtom") {
//         action = "addAtom";
//     } else {
//         action = "";
//     }
// });

// respond to select a bunch of atoms
const addSelectList = document.getElementById('SelectAtom')
addSelectList.addEventListener('click', function () {
  //   console.log('Selecting atom mode')
  if (action != 'selectAtom') {
    action = 'selectAtom'
  } else {
    action = ''
    SelectAtomList = []
  }
})
const LatticeList = [
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]
var currentLatticeElement = document.getElementById('LatticeList')
var currentLattice =
  currentLatticeElement.options[currentLatticeElement.selectedIndex].text

let currentAtomList = createLattice(LatticeList.indexOf(currentLattice))
for (let i = 0; i < currentAtomList.length; i++) {
  //   console.log(currentAtomList[i])
  scene.add(currentAtomList[i])
  atomList.push(currentAtomList[i])
}
currentLatticeElement.addEventListener('click', function () {
  currentLattice =
    currentLatticeElement.options[currentLatticeElement.selectedIndex].text
  // console.log('lattice change to', currentLattice)
  for (let i = 0; i < currentAtomList.length; i++) {
    scene.remove(currentAtomList[i])
  }
  for (let i = 0; i < HullMeshList.length; i++) {
    scene.remove(HullMeshList[i])
  }
  atomList = []
  currentAtomList = createLattice(LatticeList.indexOf(currentLattice))

  for (let i = 0; i < currentAtomList.length; i++) {
    // console.log(currentAtomList[i])
    scene.add(currentAtomList[i])
    atomList.push(currentAtomList[i])
  }
})
// respond to prev/next lattice buttons
// const PrevButton = document.getElementById('prev-btn')
// PrevButton.addEventListener('click', function () {
//   //   console.log('Prev Button clicked')
//   latticeID = changeCurrentLatticePrev()
//   for (let i = 0; i < currentAtomList.length; i++) {
//     scene.remove(currentAtomList[i])
//   }
//   atomList = []
//   SelectAtomList = []
//   action = ''
//   currentAtomList = createLattice(latticeID)

//   for (let i = 0; i < currentAtomList.length; i++) {
//     // console.log(currentAtomList[i])
//     scene.add(currentAtomList[i])
//     atomList.push(currentAtomList[i])
//   }
//   for (let i = 0; i < HullMeshList.length; i++) {
//     scene.remove(HullMeshList[i])
//   }
// })
// const NextButton = document.getElementById('next-btn')
// NextButton.addEventListener('click', function () {
//   //   console.log('Next Button clicked')
//   latticeID = changeCurrentLatticeNext()
//   for (let i = 0; i < currentAtomList.length; i++) {
//     scene.remove(currentAtomList[i])
//   }
//   currentAtomList = createLattice(latticeID)
//   atomList = []
//   SelectAtomList = []
//   action = ''
//   for (let i = 0; i < currentAtomList.length; i++) {
//     // console.log(currentAtomList[i])
//     scene.add(currentAtomList[i])
//     atomList.push(currentAtomList[i])
//   }
//   for (let i = 0; i < HullMeshList.length; i++) {
//     scene.remove(HullMeshList[i])
//   }
// })

// respond to check selected lattice
const CheckLattice = document.getElementById('CheckLattice')
CheckLattice.addEventListener('click', function () {
  //   console.log('Check Lattice Clicked')
  let out = latticeChecker(LatticeList.indexOf(currentLattice), CurrentHull)
  let lbl = document.getElementById('lattice-result')

  if (out) lbl.innerHTML = "<span style='color: green;'>Correct</span>"
  else lbl.innerHTML = "<span style='color: red;'>InCorrect</span>"
})

// respond to select all atoms
// const addSelectAll = document.getElementById("SelectAll");
// addSelectAll.addEventListener("click", function () {
//     if (action != "selectAll") {
//         action = "selectAll";
//     } else {
//         action = "";
//         SelectAtomList = [];
//     }
// });

// respond to check for SCP
// const addCheckSC = document.getElementById("CheckSC");
// addCheckSC.addEventListener("click", function () {
//     console.log("checking SCP packing");
//     var checkresult = checkSCP(SelectAtomList);
//     alert(checkresult);
// });

// respond to add atom by coordinate
// const formAdd = document.getElementById("addatom");
// formAdd.addEventListener("submit", function () {
//     console.log("adding atom");
//     var vec = formAdd.elements;
//     var AddVec = new THREE.Vector3(
//         parseFloat(vec[0].value),
//         parseFloat(vec[1].value),
//         parseFloat(vec[2].value)
//     );
//     var addedatom = addSphereAtCoordinate(AddVec, atomtype);
//     console.log(AddVec, addedatom);
//     scene.add(addedatom);
//     atomList.push(addedatom);
// });

// respond to add dummy atom by coordinate
// const formAdddummy = document.getElementById("adddummyatom");
// formAdddummy.addEventListener("submit", function () {
//     console.log("adding dummy atom");
//     var vec = formAdddummy.elements;
//     var AddVec = new THREE.Vector3(
//         parseFloat(vec[0].value),
//         parseFloat(vec[1].value),
//         parseFloat(vec[2].value)
//     );
//     var addedatom = addSphereAtCoordinate(AddVec, "dummy");
//     console.log(AddVec, addedatom);
//     scene.add(addedatom);
//     atomList.push(addedatom);
// });

// respond to repeat
// const formRepeat = document.getElementById("repeat");
// formRepeat.addEventListener("submit", function () {
//     console.log("repeating");
//     var vec = formRepeat.elements;
//     var repeatVec = new THREE.Vector3(
//         parseFloat(vec[0].value),
//         parseFloat(vec[1].value),
//         parseFloat(vec[2].value)
//     );
//     var newAtoms = RepeatPattern(SelectAtomList, repeatVec);
//     console.log(repeatVec, newAtoms);
//     for (let i = 0; i < newAtoms.length; i++) {
//         scene.add(newAtoms[i]);
//         atomList.push(newAtoms[i]);
//     }
//     SelectAtomList = newAtoms;
// });

// respond to translate
// const formTranslate = document.getElementById("translate");
// formTranslate.addEventListener("submit", function () {
//     console.log("translating");
//     var vec = formTranslate.elements;
//     var translateVec = new THREE.Vector3(
//         parseFloat(vec[0].value),
//         parseFloat(vec[1].value),
//         parseFloat(vec[2].value)
//     );
//     var count = parseFloat(vec[3].value);
//     var newAtoms = TranslatePattern(SelectAtomList, translateVec, count);
//     console.log(translateVec, newAtoms);
//     for (let i = 0; i < newAtoms.length; i++) {
//         scene.add(newAtoms[i]);
//         atomList.push(newAtoms[i]);
//     }
//     SelectAtomList = newAtoms;
// });

// respond to move
// const formMove = document.getElementById("move");
// formMove.addEventListener("submit", function () {
//     console.log("moving");
//     var vec = formMove.elements;
//     var moveVector = new THREE.Vector3(
//         parseFloat(vec[0].value),
//         parseFloat(vec[1].value),
//         parseFloat(vec[2].value)
//     );
//     moveSelectList(SelectAtomList, moveVector);
//     console.log(moveVector, SelectAtomList);
// });

// const translateList = document.getElementById("TranslatePattern");
// translateList.addEventListener("click", function () {});

// make the window responsive
// window.addEventListener("resize", () => {
//     renderer.setSize(container.clientWidth, container.clientHeight);
//     camera.aspect = container.clientWidth / container.clientHeight;
//     camera.updateProjectionMatrix();
// });

document.addEventListener('mouseup', function (event) {
  if (drag == false) {
    // if the action is add atom
    if (action == 'selectAtom') {
      INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
      if (INTERSECTED) {
        SelectAtomList.push(INTERSECTED)
      }
    }
  }
})

// render the scene and animate
var render = function () {
  highlightSelectList(SelectAtomList, atomList)
  // updateButtonCSS(action);
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
