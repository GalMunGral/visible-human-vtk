import "@kitware/vtk.js/Rendering/Profiles/Volume";
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkVolumeProperty from "@kitware/vtk.js/Rendering/Core/VolumeProperty";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkLiteHttpDataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";

const itkWasmUrl =
  "https://cdn.jsdelivr.net/npm/@itk-wasm/image-io@1.1.0/dist/bundle/index-worker-embedded.min.js";

async function loadImageData(onProgress) {
  const { readImage } = await import(itkWasmUrl);
  const slices = new Int32Array(512 * 512 * 234);
  let loaded = 0;

  async function loadSlice(i) {
    const buf = await vtkLiteHttpDataAccessHelper.fetchBinary(
      `./model/dicom/VHFCT1mm-Head (${i + 1}).dcm`
    );
    const { image } = await readImage({ data: new Uint8Array(buf), path: "DICOMImage" });
    slices.set(image.data, i * 512 * 512);
    onProgress?.(++loaded, 234);
  }

  await Promise.all(Array.from({ length: 234 }, (_, i) => loadSlice(i)));

  const imageData = vtkImageData.newInstance();
  imageData.setDimensions(512, 512, 234);
  imageData.getPointData().setScalars(
    vtkDataArray.newInstance({ numberOfComponents: 1, values: slices })
  );
  return imageData;
}

async function main() {
  const progressFill = document.getElementById("progress-fill");
  const loading = document.getElementById("loading");

  const imageData = await loadImageData((loaded, total) => {
    progressFill.style.width = `${(loaded / total) * 100}%`;
  });

  loading.remove();

  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0.05, 0.05, 0.05],
  });
  const renderer = fullScreenRenderWindow.getRenderer();
  const renderWindow = fullScreenRenderWindow.getRenderWindow();

  // --- Slices ---
  const imageActorI = vtkImageSlice.newInstance();
  const imageActorJ = vtkImageSlice.newInstance();
  const imageActorK = vtkImageSlice.newInstance();
  for (const actor of [imageActorI, imageActorJ, imageActorK]) {
    actor.getProperty().setColorLevel(1000);
    actor.getProperty().setColorWindow(3000);
  }

  const imageMapperI = vtkImageMapper.newInstance();
  imageMapperI.setInputData(imageData);
  imageMapperI.setISlice(0);
  imageActorI.setMapper(imageMapperI);

  const imageMapperJ = vtkImageMapper.newInstance();
  imageMapperJ.setInputData(imageData);
  imageMapperJ.setJSlice(511);
  imageActorJ.setMapper(imageMapperJ);

  const imageMapperK = vtkImageMapper.newInstance();
  imageMapperK.setInputData(imageData);
  imageMapperK.setKSlice(1);
  imageActorK.setMapper(imageMapperK);

  // --- Volume ---
  const [dataMin, dataMax] = imageData.getPointData().getScalars().getRange();

  const tfLowInput  = document.getElementById("tf-low");
  const tfHighInput = document.getElementById("tf-high");
  tfLowInput.min  = tfHighInput.min  = dataMin;
  tfLowInput.max  = tfHighInput.max  = dataMax;
  tfLowInput.value  = dataMin + (dataMax - dataMin) * 0.3;
  tfHighInput.value = dataMin + (dataMax - dataMin) * 0.7;

  const ofunc = vtkPiecewiseFunction.newInstance();
  const cfunc = vtkColorTransferFunction.newInstance();

  const MIN_GAP = Math.round((dataMax - dataMin) * 0.1);

  function updateTransferFunction() {
    let low  = Number(tfLowInput.value);
    let high = Number(tfHighInput.value);
    if (high - low < MIN_GAP) {
      if (document.activeElement === tfLowInput) {
        high = tfHighInput.value = Math.min(low + MIN_GAP, dataMax);
      } else {
        low = tfLowInput.value = Math.max(high - MIN_GAP, dataMin);
      }
    }
    const mid = (low + high) / 2;
    ofunc.removeAllPoints();
    ofunc.addPoint(dataMin, 0);
    ofunc.addPoint(low, 0);
    ofunc.addPoint(mid, 0.8);
    ofunc.addPoint(high, 0);
    ofunc.addPoint(dataMax, 0);
    cfunc.removeAllPoints();
    cfunc.addRGBPoint(dataMin, 0, 0, 0);
    cfunc.addRGBPoint(low,     0.2, 0.1, 0.1);
    cfunc.addRGBPoint(mid,     0.9, 0.6, 0.3);
    cfunc.addRGBPoint(high,    1.0, 1.0, 0.9);
    cfunc.addRGBPoint(dataMax, 1.0, 1.0, 1.0);
    renderWindow.render();
  }

  tfLowInput.addEventListener("input",  updateTransferFunction);
  tfHighInput.addEventListener("input", updateTransferFunction);

  const volumeProperty = vtkVolumeProperty.newInstance();
  volumeProperty.setScalarOpacity(0, ofunc);
  volumeProperty.setRGBTransferFunction(0, cfunc);

  const volumeMapper = vtkVolumeMapper.newInstance();
  volumeMapper.setSampleDistance(1);
  volumeMapper.setInputData(imageData);

  const volume = vtkVolume.newInstance({ property: volumeProperty });
  volume.setMapper(volumeMapper);

  // --- Surface ---
  const [min, max] = imageData.getPointData().getScalars().getRange();
  const initialContour = (min + max) / 3;

  const isoInput = document.querySelector(".isoValue");
  isoInput.min = min;
  isoInput.max = max;
  isoInput.value = initialContour;

  const mCube = vtkImageMarchingCubes.newInstance({
    contourValue: initialContour,
    computeNormals: true,
    mergePoints: true,
  });
  mCube.setInputData(imageData);

  const mcMapper = vtkMapper.newInstance();
  mcMapper.setInputConnection(mCube.getOutputPort());

  const mcActor = vtkActor.newInstance();
  mcActor.setMapper(mcMapper);

  renderer.addActor(imageActorI);
  renderer.addActor(imageActorJ);
  renderer.addActor(imageActorK);
  volume.setVisibility(false);
  renderer.addVolume(volume);
  renderer.addActor(mcActor);

  renderer.getActiveCamera().setPosition(0, -1, 0);
  renderer.resetCamera();
  renderer.getActiveCamera().zoom(1.5);
  updateTransferFunction();

  // Toggles
  document.getElementById("toggle-slices").addEventListener("change", (e) => {
    for (const actor of [imageActorI, imageActorJ, imageActorK])
      actor.setVisibility(e.target.checked);
    renderWindow.render();
  });
  document.getElementById("toggle-volume").addEventListener("change", (e) => {
    volume.setVisibility(e.target.checked);
    renderWindow.render();
  });
  document.getElementById("toggle-surface").addEventListener("change", (e) => {
    mcActor.setVisibility(e.target.checked);
    renderWindow.render();
  });

  // Sliders
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
  document.querySelector(".isoValue").addEventListener("change", (e) => {
    mCube.setContourValue(Number(e.target.value));
    renderWindow.render();
  });
}

main();