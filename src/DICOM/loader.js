import vtkLiteHttpDataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
const itkWasmUrl =
  "https://cdn.jsdelivr.net/npm/@itk-wasm/image-io@1.1.0/dist/bundle/index-worker-embedded.min.js";

export async function loadImageData() {
  const { readImage } = await import(itkWasmUrl);

  const slices = new Int32Array(512 * 512 * 234);

  async function loadSlice(i) {
    const volumeArrayBuffer = await vtkLiteHttpDataAccessHelper.fetchBinary(
      `../model/dicom/VHFCT1mm-Head (${i + 1}).dcm`
    );

    const { image: itkImage } = await readImage({
      data: new Uint8Array(volumeArrayBuffer),
      path: "DICOMImage",
    });

    slices.set(itkImage.data, i * 512 * 512);
  }

  await Promise.all(Array(234).keys().map(loadSlice));

  const imageData = vtkImageData.newInstance();
  imageData.setDimensions(512, 512, 234);
  imageData.getPointData().setScalars(
    vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: slices,
    })
  );

  return imageData;
}
