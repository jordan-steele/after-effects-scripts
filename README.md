# After Effects Scripts

A collection of After Effects utilities for KBar, Tool Launcher, Quick Menu, or any other script file launcher.

These tools were developed mainly for my own personal workflow and may not have been tested very thoroughly. As After Effects evolves, some scripts may stop working or need maintenance. Run them at your own discretion.

## Installation Instructions

1. Open the script you want from the catalog below.
2. Download the corresponding `.jsx` file.
3. In After Effects, go to `File > Scripts > Run Script File...` and choose the downloaded script.

## Categories

- App: 2
- Project: 14
- Comp: 15
- Layer: 16
- Effect: 10
- Keyframe: 3
- Expression: 5

## App

### <img src="icons/Allow EXR Straight Alpha.svg" alt="Allow EXR Straight Alpha icon" width="20" height="20"> Allow EXR Straight Alpha

Allow After Effects to render EXR with a straight alpha channel. This changes an AE preference setting and needs an AE restart to take effect after it's run.

### <img src="icons/Purge.svg" alt="Purge icon" width="20" height="20"> Purge

Purge RAM

| Modifier | Action |
| --- | --- |
| Shift-click | Purge disk cache |

## Project

### <img src="icons/Assembly.svg" alt="Assemble Comps icon" width="20" height="20"> Assemble Comps

Assembles selected items in a new comp minus handles

### <img src="icons/Audio Off.svg" alt="Audio Off icon" width="20" height="20"> Audio Off

Mutes all layers with audio in all comps in the project

### <img src="icons/Comps to Projects.svg" alt="Comps to Projects icon" width="20" height="20"> Comps to Projects

Saves each selected composition as a separate reduced .aep in a chosen output folder

### <img src="icons/Count.svg" alt="Count icon" width="20" height="20"> Count

Alerts the number of selected items in the Project panel and selected layers in the active comp

### <img src="icons/Default Folders.svg" alt="Default Folders icon" width="20" height="20"> Default Folders

Creates standard set of folders and sets project to OCIO 1.3 at 16bpc

### <img src="icons/Font Report.svg" alt="Font Report icon" width="20" height="20"> Font Report

Scans project for fonts used and generates report

### <img src="icons/Ignore Alpha.svg" alt="Ignore Alpha icon" width="20" height="20"> Ignore Alpha

Ignore alpha for selected footage in the project panel

### <img src="icons/Import Project.svg" alt="Import Project icon" width="20" height="20"> Import Project

Import AE Project and merge folders with existing project structure

### <img src="icons/Prefix Suffix Project Items.svg" alt="Prefix Suffix icon" width="20" height="20"> Prefix Suffix

Add a prefix or suffix to the names of selected project items

### <img src="icons/Reduce & Keep Folders.svg" alt="Reduce & Keep Folders icon" width="20" height="20"> Reduce & Keep Folders

Reduce project but keep all folders

| Modifier | Action |
| --- | --- |
| Shift-click | Regular reduce project |

### <img src="icons/Relative Importer.svg" alt="Relative Importer icon" width="20" height="20"> Relative Importer

Import files relative to the currently open project

### <img src="icons/Relink.svg" alt="Relink icon" width="20" height="20"> Relink

Relink selected missing footage by recursively searching a chosen folder

### <img src="icons/Search and Replace Project.svg" alt="Search & Replace icon" width="20" height="20"> Search & Replace

Search and replace names in selected project items

### <img src="icons/Viewer Resolution.svg" alt="Viewer Resolution icon" width="20" height="20"> Viewer Resolution

Changes Viewer Resolution in all comps to Full

| Modifier | Action |
| --- | --- |
| Shift-click | Half resolution |
| Cmd-click | Quarter resolution |

## Comp

### <img src="icons/Add Handles.svg" alt="Add Handles icon" width="20" height="20"> Add Handles

Add frames to beginning or end of a comp. Selected layers will extend to fill the new time.

### <img src="icons/Add Slate.svg" alt="Auto Slate icon" width="20" height="20"> Auto Slate

Copies layers from a "slate" comp in project to current comp(s)

| Modifier | Action |
| --- | --- |
| Shift-click | Adds 1 frame at the beginning for the slate |

### `CDL` Auto CDL

Search for CDL matching comp name pattern of SHOW_000_001_010

### <img src="icons/Create Mattes.svg" alt="Create Mattes icon" width="20" height="20"> Create Mattes

Create matte comp by filling selected layers with white and other layers with black

| Modifier | Action |
| --- | --- |
| Shift-click | Duplicates comp first and adds "_matte" |

### <img src="icons/LUT.svg" alt="Add LUT icon" width="20" height="20"> Add LUT

New Adjustment Layer w/ LUT

### <img src="icons/Precomp with Timecode.svg" alt="Precomp icon" width="20" height="20"> Precomp

Precomp selected layers, retaining the timecode of the original comp

| Modifier | Action |
| --- | --- |
| Shift-click | Precomp single layer with collapse transformations |

### <img src="icons/PSD Pre-Render.svg" alt="PSD Pre-Render icon" width="20" height="20"> PSD Pre-Render

Render a PSD of the current frame. Auto saves to 05_prerenders/PSD directory of the current project and imports again to the same comp.

### <img src="icons/Render HiRes.svg" alt="Render Hi-Res icon" width="20" height="20"> Render Hi-Res

Add hi-res to render queue

| Modifier | Action |
| --- | --- |
| Alt-click | Set render templates |

### <img src="icons/Render LowRes.svg" alt="Render Low-Res icon" width="20" height="20"> Render Low-Res

Add low-res to render queue

| Modifier | Action |
| --- | --- |
| Alt-click | Set render templates |

### <img src="icons/Save Photo.svg" alt="Save Photo icon" width="20" height="20"> Save Photo

Saves current frame as PSD

| Modifier | Action |
| --- | --- |
| Shift-click | Saves JPEG (if template is available) |
| Cmd-click | Saves PNG in the background to the desktop |

### <img src="icons/Scale Comps.svg" alt="Scale Comps icon" width="20" height="20"> Scale Comps

Scale one or more selected compositions and all layers within them. Select comps in the Project panel before running, or leave a comp open to scale just that one.

### <img src="icons/Shutter.svg" alt="Shutter icon" width="20" height="20"> Shutter

Set shutter angle and phase for motion blur

### <img src="icons/Textless.svg" alt="Textless icon" width="20" height="20"> Textless

Recursively hide text layers

| Modifier | Action |
| --- | --- |
| Shift-click | Duplicate comp and nested comps, hiding text layers in all |

### <img src="icons/Trim Layers to Comp.svg" alt="Trim Layers to Comp icon" width="20" height="20"> Trim Layers to Comp

Trim all layers in selected comp(s) if they extend beyond the beginning or end of the comp

### <img src="icons/Version Up.svg" alt="Version Up icon" width="20" height="20"> Version Up

Version up selected comps in the project panel

| Modifier | Action |
| --- | --- |
| Shift-click | Duplicates the comp |
| Cmd-click | Version up letters |

## Layer

### <img src="icons/Checkerboard.svg" alt="Checkerboard icon" width="20" height="20"> Checkerboard

Creates 16x8 checkerboard layer

| Modifier | Action |
| --- | --- |
| Shift-click | Creates 32x16 checkerboard layer |
| Cmd-click | Creates 16-wide square checkerboard layer |

### `FRCTL NOISE` Fractal Noise

New layer w/ Fractal Noise

| Modifier | Action |
| --- | --- |
| Shift-click | Precomposes the fractal noise |

### <img src="icons/Grain.svg" alt="Add grain icon" width="20" height="20"> Add grain

Adds Grain adjustment layer

| Modifier | Action |
| --- | --- |
| Shift-click | Apply Match Grain adjustment layer |
| Cmd-click | Higher grain intensity adjustment layer |

### <img src="icons/Null.svg" alt="Add Null icon" width="20" height="20"> Add Null

Add Null

| Modifier | Action |
| --- | --- |
| Shift-click | Applies Copied Data to the Null |
| Cmd-click | Starts null at playhead |

### <img src="icons/Paste.svg" alt="Paste icon" width="20" height="20"> Paste

Paste at the beginning of the selected layer

### <img src="icons/Ramp.svg" alt="Gradient Ramp icon" width="20" height="20"> Gradient Ramp

Create new solid ramp for a DoF map

| Modifier | Action |
| --- | --- |
| Shift-click | Center gradient |
| Cmd-click | Precomp the gradient |

### <img src="icons/Reload Selected Layers.svg" alt="Reload Selected Layers icon" width="20" height="20"> Reload Selected Layers

Reload the file sources of selected layers if After Effects doesn't detect it automatically

### <img src="icons/Reverse Selected Layers.svg" alt="Reverse Layers icon" width="20" height="20"> Reverse Layers

Reverse selected layers

### <img src="icons/Scale Aware Properties.svg" alt="Scale Aware Properties icon" width="20" height="20"> Scale Aware Properties

Adds an expression for known properties that don't scale along with a layer's scale

### <img src="icons/Smart Grid.svg" alt="Smart Grid icon" width="20" height="20"> Smart Grid

Makes a smart grid from the selected layers in the current comp

| Modifier | Action |
| --- | --- |
| Shift-click | Adds null Grid Controller with parameters to control the grid |
| Cmd-click | Removes the Grid Controller and bakes all the children to their current positions |

### <img src="icons/Solid - Black.svg" alt="Black Solid icon" width="20" height="20"> Black Solid

New Black Solid

| Modifier | Action |
| --- | --- |
| Shift-click | 50% grey layer |

### <img src="icons/Solid - White.svg" alt="White Solid icon" width="20" height="20"> White Solid

New White Solid

| Modifier | Action |
| --- | --- |
| Shift-click | Sets to blending mode to Classic Color Dodge |

### `SPLT MSK` Split Layer Masks

Split a layer's masks into individual layers named after each mask

| Modifier | Action |
| --- | --- |
| Shift-click | Split into grouped masks by name prefix instead |

### <img src="icons/Stagger Layers.svg" alt="Stagger Layers icon" width="20" height="20"> Stagger Layers

Stagger layers by a certain number of frames

### <img src="icons/Track in Mocha.svg" alt="Track in Mocha icon" width="20" height="20"> Track in Mocha

Track in Mocha AE Plugin. Renames layer to "Mocha Track" and turns it brown.

| Modifier | Action |
| --- | --- |
| Shift-click | Mocha Pro Plugin |
| Cmd-click | Mocha Pro Standalone |

### <img src="icons/Transform Null from Mocha Track.svg" alt="Transform Null for Mocha icon" width="20" height="20"> Transform Null for Mocha

Creates null and sets it as the transform null for the selected layers Mocha AE or Mocha Pro effect

## Effect

### <img src="icons/Blur.svg" alt="Blur icon" width="20" height="20"> Blur

Apply gaussian blur

| Modifier | Action |
| --- | --- |
| Shift-click | Apply camera lens blur |
| Cmd-click | Creates a depth map for camera lens blur |

### <img src="icons/Curves.svg" alt="Curves icon" width="20" height="20"> Curves

Apply curves

| Modifier | Action |
| --- | --- |
| Shift-click | New adjustment layer with curves |

### <img src="icons/Fill.svg" alt="Fill icon" width="20" height="20"> Fill

Fill selected layers with black

| Modifier | Action |
| --- | --- |
| Shift-click | Fill selected layers with white |
| Cmd-click | Apply invert effect to select layers |

### <img src="icons/High-Pass.svg" alt="High-Pass icon" width="20" height="20"> High-Pass

Adds a set of effects with sliders for a high pass filter

| Modifier | Action |
| --- | --- |
| Shift-click | Will add reduce noise and precomp before applying high pass |

### <img src="icons/Levels.svg" alt="Levels icon" width="20" height="20"> Levels

Apply levels

| Modifier | Action |
| --- | --- |
| Shift-click | New adjustment layer with levels |

### <img src="icons/Randomize Seeds.svg" alt="Randomize Seeds icon" width="20" height="20"> Randomize Seeds

Randomize random seed properties of all effects of selected layers

### <img src="icons/Reduce Noise.svg" alt="Reduce Noise icon" width="20" height="20"> Reduce Noise

Apply Neat Video's reduce noise v5

| Modifier | Action |
| --- | --- |
| Shift-click | Precomp de-noise |
| Cmd-click | Grain subtraction method |

### <img src="icons/Reset Layer Controls.svg" alt="Reset Layer Effects icon" width="20" height="20"> Reset Layer Effects

Reset layer controls for all effects on selected layers

| Modifier | Action |
| --- | --- |
| Shift-click | Reset layer controls for all effects on all layers |

### <img src="icons/Set Matte.svg" alt="Set Matte icon" width="20" height="20"> Set Matte

Set matte effect to layer above selected layer

| Modifier | Action |
| --- | --- |
| Shift-click | Set matte all selected layers to layer above first selected layer |

### <img src="icons/Tint.svg" alt="Tint icon" width="20" height="20"> Tint

Apply tint

| Modifier | Action |
| --- | --- |
| Shift-click | Creates new adjustment layer with effect |
| Cmd-click | Apply hue/saturation |

## Keyframe

### <img src="icons/Ease Between.svg" alt="Ease Between icon" width="20" height="20"> Ease Between

Eases out the first keyframe and eases in the second keyframe

### <img src="icons/Key Before & After.svg" alt="Key Before & After icon" width="20" height="20"> Key Before & After

Adds keyframes before & after the current playhead

| Modifier | Action |
| --- | --- |
| Shift-click | Only add keyframe before |
| Cmd-click | Only add keyframe after |

### <img src="icons/Match Rate.svg" alt="Match Rate icon" width="20" height="20"> Match Rate

Match linear rate of two selected keyframes to current play head position. Can do multiple properties at once.

## Expression

### <img src="icons/Blink.svg" alt="Blink icon" width="20" height="20"> Blink

Adds a blinking expression to the opacity with adjustable sliders

| Modifier | Action |
| --- | --- |
| Shift-click | Uses a blink that fades between start opacity and 0 |

### <img src="icons/Parent.svg" alt="Parent icon" width="20" height="20"> Parent

Adds a parent expression to selected property with an intensity slider

### <img src="icons/Rate Controller.svg" alt="Rate Controller icon" width="20" height="20"> Rate Controller

Adds a Rate Controller effect and expression to give a constant rate of time * multiplier

### <img src="icons/Smooth.svg" alt="Smooth Expression icon" width="20" height="20"> Smooth Expression

Apply smoothing expression to selected properties

### <img src="icons/Wiggle Slider.svg" alt="Wiggle Slider icon" width="20" height="20"> Wiggle Slider

Adds a wiggle slider for the selected property(s)

| Modifier | Action |
| --- | --- |
| Shift-click | Creates a wiggle null with sliders |
| Cmd-click | Creates property specific sliders |

_This README is auto-generated by `.github/scripts/generate-readme.mjs`._
