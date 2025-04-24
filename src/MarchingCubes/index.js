import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";

import { loadImageData } from "../DICOM/loader";

import controlPanel from "bundle-text:./controlPanel.html";

async function main() {
  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0.5, 0.5, 0.5],
  });
  const renderWindow = fullScreenRenderWindow.getRenderWindow();
  const renderer = fullScreenRenderWindow.getRenderer();
  fullScreenRenderWindow.addController(controlPanel);

  const imageData = await loadImageData();
  const [min, max] = imageData.getPointData().getScalars().getRange();

  const isoValueInput = document.querySelector(".isoValue");
  isoValueInput.min = min;
  isoValueInput.max = max;

  const mCube = vtkImageMarchingCubes.newInstance({
    contourValue: 1200,
    computeNormals: true,
    mergePoints: true,
  });
  mCube.setInputData(imageData);
  mCube.setContourValue((min + max) / 3);

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(mCube.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  renderer.addActor(actor);

  renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
  renderer.resetCamera();
  renderWindow.render();

  isoValueInput.addEventListener("change", (e) => {
    mCube.setContourValue(Number(e.target.value));
    renderer.resetCamera();
    renderWindow.render();
  });
}

main();
