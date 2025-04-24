import "@kitware/vtk.js/Rendering/Profiles/Volume";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkITKHelper from "@kitware/vtk.js/Common/DataModel/ITKHelper";
import vtkLiteHttpDataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper";
import { loadAllSlices } from "./loader";

import controlPanel from "bundle-text:./controlPanel.html";

async function main() {
  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0.5, 0.5, 0.5],
  });
  const renderWindow = fullScreenRenderWindow.getRenderWindow();
  const renderer = fullScreenRenderWindow.getRenderer();
  fullScreenRenderWindow.addController(controlPanel);

  const imageData = vtkImageData.newInstance();
  imageData.setDimensions(512, 512, 234);
  imageData.getPointData().setScalars(
    vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: await loadAllSlices(),
    })
  );

  const imageActorI = vtkImageSlice.newInstance();
  const imageActorJ = vtkImageSlice.newInstance();
  const imageActorK = vtkImageSlice.newInstance();

  const colorLevel = 1000;
  imageActorI.getProperty().setColorLevel(colorLevel);
  imageActorJ.getProperty().setColorLevel(colorLevel);
  imageActorK.getProperty().setColorLevel(colorLevel);

  const colorWindow = 3000;
  imageActorI.getProperty().setColorWindow(colorWindow);
  imageActorJ.getProperty().setColorWindow(colorWindow);
  imageActorK.getProperty().setColorWindow(colorWindow);

  renderer.addActor(imageActorK);
  renderer.addActor(imageActorJ);
  renderer.addActor(imageActorI);

  const imageMapperK = vtkImageMapper.newInstance();
  imageMapperK.setInputData(imageData);
  imageMapperK.setKSlice(30);
  imageActorK.setMapper(imageMapperK);

  const imageMapperJ = vtkImageMapper.newInstance();
  imageMapperJ.setInputData(imageData);
  imageMapperJ.setJSlice(30);
  imageActorJ.setMapper(imageMapperJ);

  const imageMapperI = vtkImageMapper.newInstance();
  imageMapperI.setInputData(imageData);
  imageMapperI.setISlice(30);
  imageActorI.setMapper(imageMapperI);

  renderer.resetCamera();
  renderer.resetCameraClippingRange();
  renderWindow.render();

  document.querySelector(".sliceI").addEventListener("input", (e) => {
    imageMapperI.setISlice(Number(e.target.value));
    renderWindow.render();
  });

  document.querySelector(".sliceJ").addEventListener("input", (e) => {
    imageMapperJ.setJSlice(Number(e.target.value));
    renderWindow.render();
  });

  document.querySelector(".sliceK").addEventListener("input", (e) => {
    imageMapperK.setKSlice(Number(e.target.value));
    renderWindow.render();
  });
}

main();
