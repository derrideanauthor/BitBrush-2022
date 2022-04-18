26 October 2018 Updates Log
========================
##Version 0.1.5

----------------------------------------------------------------------

New Additions:

	* Export panel is now complete, allowing quick nearest neighbor scaling and exporting to the following practical formats:
		** PNG spritesheet - set dynamic layouts in rows and columns with optional padding
		** PNG sequence - PNG files with padded numbering and filesystem safe naming conventions.
		** GIF animations with scalable quality settings
	* When using the brush tool, the shift modifier key draws a line between the current and last pixel drawn, similar to Photoshop's pencil tool
	* Background options in the artboard panel are now active with rudimentary control 
	* A new splash image has been added (designed in bitbrush)
	* Fullscreen toggle has been added to the navigation controls


Fixes:

	* Copy shortcut (ctrl+C) no longer displays copy feedback when no selection is present
	* Layer and frame thumbnails now respond to pointer/pen tap
	* Selecting text (click/tap on layer name) now selects correctly and usably
	* Artboard Resize widget : aspect ratio lock changed the value of width to that of height on click. 
	* Slight update to input gizmos to curb redundant firing (e.g. prevent update if new value is the same)
	* The eyedropper tool now samples the combined layers instead of just the current layer
	* The eyedropper tool now samples the secondary color on RMB click
	* The pixel select tool now de-selects active selections and confirms floating (pasted or moved) content to the artboard when the user selects a new tool or moves to another layer. For the latter case, empty selection boxes are preserved when the select tool is active.


Upgrades:

	* Performance on the color picker has been improved significantly by using prerendered gamut images
	* The eyedropper tool now renders shades and tints once a color is picked from the artboard
	* Assets (ui graphics and window) are now preloaded to speed up performance.
	* The preview window now tracks the position on the artboard when zooming and panning. Especially useful for wide dimensions
	
