import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkGLTFImporter from "@kitware/vtk.js/IO/Geometry/GLTFImporter";

async function main() {
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
  const renderer = fullScreenRenderer.getRenderer();
  renderer.setBackground(0, 0, 0);
  const renderWindow = fullScreenRenderer.getRenderWindow();
  const reader = vtkGLTFImporter.newInstance({
    renderer,
  });
  reader.setUrl("/model/spike2.glb", { binary: true, sceneId: 0 });
  reader.onReady(() => {
    reader.importActors();
    renderer.resetCamera();
    renderWindow.render();
  });
  renderWindow.render();
}

main();
