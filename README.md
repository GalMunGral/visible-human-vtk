# Visible Human: VTK.js

- Volume: https://galmungral.github.io/visible-human-vtk/Volume
- Slicer: https://galmungral.github.io/visible-human-vtk/Slicer
- Marching Cubes: https://galmungral.github.io/visible-human-vtk/MarchingCubes

## Rhetorical Design

### Purpose

The second step in the visualization process, following the exploratory notebooks in
[visible-human-explore](https://github.com/GalMunGral/visible-human-explore). Before
implementing anything from scratch, it is worth seeing what the standard algorithms
look like through a production-grade library. Three interactive demos use VTK.js to
show the canonical techniques for volumetric data — slicing, volume rendering, and
isosurface extraction — each as a reference implementation of a well-known algorithm
rather than as a novel contribution.

### Strategy

Each demo isolates one technique. The Slicer cuts the volume along the three principal
axes with independently adjustable positions, revealing interior structure directly.
The Volume demo maps scalar density values to opacity through a transfer function,
rendering the full 3D distribution at once. The MarchingCubes demo extracts a surface
mesh at a user-adjustable isovalue, converting the implicit scalar field into an
explicit geometry.

Using VTK.js reduces each demo to pipeline configuration — data → mapper → actor →
renderer — keeping the technique visible and the implementation minimal.