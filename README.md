# Visible Human: VTK.js

**Live demo:** https://galmungral.github.io/visible-human-vtk/

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

All three techniques share a single renderer and coordinate space, so they can be
toggled independently or combined. Slicing cuts the volume along the three anatomical
planes (sagittal, coronal, axial) with adjustable positions. Volume rendering maps
scalar density to color and opacity through a transfer function with adjustable ramp
values. Isosurface extraction runs marching cubes at a user-adjustable isovalue,
converting the implicit scalar field into an explicit surface mesh.

Using VTK.js reduces each pipeline to data → mapper → actor → renderer, keeping
the technique visible and the implementation minimal.