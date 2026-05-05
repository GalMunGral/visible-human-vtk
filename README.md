# Visible Human: VTK.js

**Live demo:** https://galmungral.github.io/visible-human-vtk/

## Rhetorical Design

### Purpose

Volumetric data does not have a single natural representation. A scalar field defined on
a 3D grid can be read as a stack of cross-sections, as a semi-transparent density cloud,
or as a collection of isosurfaces — and none of these alone gives a complete account of
the data. This demo, built with VTK.js, puts all three representations of the same CT
volume in one scene so the viewer can see directly what each reveals and what each
obscures.

### Strategy

Three representations are composited in a single 3D scene and can be toggled
independently. Slicing reveals interior structure along the anatomical planes; volume
rendering shows the density distribution as a continuous 3D field; isosurface extraction
converts a threshold into an explicit surface mesh. Each has adjustable parameters —
slice positions, transfer function ramps, isovalue — so the viewer can probe how the
representation responds to the underlying data.