import { readImage } from "@itk-wasm/image-io";

export async function loadAllSlices() {
  const slices = new Int32Array(512 * 512 * 234);

  async function loadSlice(i) {
    const volumeArrayBuffer = await vtkLiteHttpDataAccessHelper.fetchBinary(
      `/vol/VHFCT1mm-Head (${i + 1}).dcm`
    );

    const { image: itkImage } = await readImage({
      data: new Uint8Array(volumeArrayBuffer),
      path: "DICOMImage",
    });

    slices.set(itkImage.data, i * 512 * 512);
  }

  await Promise.all(Array(234).keys().map(loadSlice));

  return slices;
}
