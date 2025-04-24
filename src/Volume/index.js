import "@kitware/vtk.js/Rendering/Profiles/Volume";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkVolumeProperty from "@kitware/vtk.js/Rendering/Core/VolumeProperty";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";

import { loadImageData } from "../DICOM/loader";
import vtkCamera from "@kitware/vtk.js/Rendering/OpenGL/Camera";

async function main() {
  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0.5, 0.5, 0.5],
  });
  const renderWindow = fullScreenRenderWindow.getRenderWindow();
  const renderer = fullScreenRenderWindow.getRenderer();

  const imageData = await loadImageData();

  const volumeMapper = vtkVolumeMapper.newInstance();
  volumeMapper.setSampleDistance(1);
  volumeMapper.setInputData(imageData);

  const volume = vtkVolume.newInstance({
    property: vtkVolumeProperty.newInstance(),
  });
  const ofunc = vtkPiecewiseFunction.newInstance();
  ofunc.addPoint(0.0, 0.0);
  ofunc.addPoint(1000.0, 0.5);
  volume.getProperty().setScalarOpacity(0, ofunc);
  volume.setMapper(volumeMapper);

  renderer.addActor(volume);

  renderer.getActiveCamera().setPosition(0, -1, 0);
  renderer.resetCamera();
  renderWindow.render();
}

main();
