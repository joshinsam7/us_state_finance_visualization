# Homework #4: D3 Transitions

In this homework, you'll apply knowledge about D3 transitions and joins to create a linked **hex map** and **line chart** showing state-level statistics about the United States. When you draw a lasso selection on the map, that will select a set of states that will be shown in the line chart (each state is one line). You'll use D3 joins and transitions to add, remove, and update the lines.

This assignment is worth 10 points. It will include the following aspects:

* You will create a page with a control panel to hold a set of required HTML controls and two visualization panels to hold your hex map and line chart.
* A user can select a desired attribute and year from the control panel, that data is plotted (or updated) on the hex map.
* When the user lassoes a selection of states on the map, draw or update the line chart accordingly.
* The line chart will also have a vertical line (in the background of the chart) to indicate the currently selected year.

We don't give you any starter code for this assignment: you'll have to create everything from scratch, including making the `index.html` page. You have the freedom to stylize your chart (and webpage) as desired, though points will be deducted for sloppy design (in other words, you should apply good principles of styling and interface design that we have been teaching in lectures).

> ❗️ This homework asks you to perform very specific animations and interactions. Be sure to carefully read the steps below!

> ❗️ Remember, you must use D3 v7 for this assignment!

> ❗️ The sharing and copying code with other students is considering cheating, as is using ChatGPT, IDE co-pilots, or other generative AI, for any part of this assignment. Passing off (part of) a codebase from someone else (including from a previous semester) as your own is also plagiarism.

## Step 1: Create your initial page

Name your html file `index.html`. Create three panels on your page: one will be a control panel, one will hold the hex map, and one will hold the line chart. The exact layout and sizing is up to you, but I recommend you make your overall page no wider than ~1400-1920 px. (It's fine if you have to scroll to see everything.) Your page can use fixed widths and heights (i.e., your panels do not have to adjust as the browser window is resized.) At the top of the page, add a title for the homework, your name, and your email, similar to prior homeworks.

For this assignment, you will store your CSS and Javascript code in their own separate files, naming the files with your ASURITE. For example, I would name my files `cbryan16.css` and `cbryan16.js`, and link to them from my `index.html`.

## Step 3: Create your control panel controls and import the dataset

The control panel should have the following controls (you may add additional controls if you want) with appropriate labeling:

- **Attribute**: A `select` dropdown that shows the available attributes for your page. Picking an option here will update the hex map and (if currently drawn) the line chart.
- **Attribute Scale**: This option will allow users to toggle whether the currently visualized attribute on the hex map is scaled based on the currently selected year's min/max values, or if it is scaled according to _all_ years for that attribute in the dataset. How you implement this control is up to you: some options include a `select` dropdown, a `toggle switch` type of control, a pair of `radio buttons`, a `checkbox`, and more. [Here's a Bootstrap page that discusses some of these options.](https://getbootstrap.com/docs/5.1/forms/checks-radios/) Keep in mind that the control should be intuitive to use (and appropriately labeled).
- **Year**: This option selects the year for the hex map. You may either choose a `<input type="range">` slider or a `<input type="number">` textbox. If you choose to use a slider option, make sure you add a text label besides the slider that updates to always show the currently selected year.
- **Play**: This control will animate through the years shown in the charts. One way to do this is with an `<input type="button">` control. When pressed, the chart will begin animating through the years. If pressed again, the animation will stop on the current year. When the playback is paused, the button's text should read "Play" (or something similar). When playback is currently happening, the button's text should read "Pause" or "Stop" (or similar). Alternatively, instead of a "Play" button, you could use clickable icons/images that look like play/stop buttons.

My suggestion is to place these elements in a control panel area, either to the side of the charts or above or below them, so they can be organized in a way that makes sense. Controls should use consistent styling/theme. Feel free to use Bootstrap or custom CSS to help your design and styling.

## Step 3: Import (and wrangle?) your dataset

Download the Finance dataset from the [CORGIS website](https://corgis-edu.github.io/corgis/csv/) and pick five attributes you would like to visualize. Create a `data` folder in this repository and place the downloaded CSV file there. (If you would like to manipulate or wrangle this data file, that is also okay, though certainly not necessary.) Then, import the file into your web page. The five attributes you select should be the options in the ***Attribute*** dropdown. The years in this dataset go from 1992-2019, so these should be the domain in your ***Year*** control.

## Step 4: Hex map encodings and interactions

> 🔍 The D3 Gallery website ([link](https://d3-graph-gallery.com/hexbinmap.html)) has some nice tutorials for creating hex maps (they call them hexbin maps). You are also allowed to use other shapes for your map, such as [sqares](https://gist.github.com/officeofjane/2c3ed88c4be050d92765de912d71b7c4) or [circles](https://www.presentationgo.com/presentation/circle-tile-grid-map-usa-powerpoint-google-slides/). (Even if you use a different shape instead of a hex, let's call it a hex map for succinctness.) ***Remember to use D3 v7!***

The default encodings for your hex map should be the following:

- You should display the 50 states of the US in a geographically approximate positioning that is used for hex maps. The exact positioning of states is up to you (especially Alaska and Hawaii). You can also use D3's geographic projection logic along with a GeoJson file (e.g., the D3 Gallery examples provide one you can use, at this [URL](https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/us_states_hexgrid.geojson.json)).
- How you style each state's hex is up to you, in terms of exact shape (e.g., hex, square, octagon, etc.), border, spacing between each other, labels, etc. Feel free to make it look nice!
- The fill color each state will be done using a sequential colorscale that maps to the min/max of the currently selected attribute from the ***Attribute*** dropdown for the 50 states in the US. 
    - The choice of specific color(s) is up to you. D3 provides lots of [pre-built sequential colorscales](https://d3js.org/d3-scale-chromatic/sequential), including some multi-hue ones, or you can [manually define your own](https://d3js.org/d3-scale/sequential). (Make sure you are using a continuous, not binned, scale.)
    - If the ***Attribute Scale*** control is checked/enabled, you the scale should be based on all years in the dataset for that attribute (i.e., 1992-2019). If it is NOT checked (or toggled, etc.), then you will base the min/max values for the colorscale on the currently selected year only (based on current year in the ***Year*** control). 
- You should also add a [color legend](https://observablehq.com/@d3/color-legend) that shows the currently mapped colorscale to the data min/max. How you style the legend and where you place it in relation to the map is up to you.

> 🔍 The CORGIS finance dataset includes 1 attribute that includes negative values, where a diverging colorscale would make more sense. Since we're forcing you to use a sequential scale, I would suggest not picking that specific attribute.


You hex map should support the following interactions:

- When the ***Attribute*** dropdown value is changed, use D3's join and transition functionalities to update the hex map. Specifically, instead of just immediately changing the color of each state from the old to new value, each state should use a D3 transition to _animate_ from the old to new colors based on its updated value. It is up to you how long this transition should last (I'd recommend 250-500 ms), and you're also allowed to implement staggered transitions if you'd like.
- If the ***Attribute Scale*** is NOT checked, you'll have to re-calculate your colorscale for the updated year. This also means you'll need to update your color legend. Instead of just deleting and re-drawing your legend and its labels, again use an animated transition to update/shift the text label values. ([This link has an example of applying transitions when updating a scale axis.](https://www.d3indepth.com/axes/))
- When the user clicks the ***Play*** control, begin playing through each year. [Here's an example of an animated Choropleth map based on a Play/Pause button](https://samples.azuremaps.com/?sample=animate-a-choropleth-map) (this choropleth is at the county, and not state, level, and they aren't using transitions between each year, but you should be able to get the idea). You can start the animation on the currently selected year, and stop once you reach the last year.
- The user should also be able to draw a lasso on top of the hex map to select a set of states. The exact implementation and styling for this is up to you (and there's several examples of lasso implementations online you might like to reference: [example1](https://stackoverflow.com/questions/64107576/lasso-plugin-wont-work-with-d3-upgrade-to-v6) (see Jan 26, 2023 answer, which works well but has rather rudimentary styling), [example2](https://observablehq.com/@fil/lasso-selection), [example3](https://observablehq.com/d/169d5c4e08b83ac1). Keep in mind all your code should use D3.v7 code.
    - When you lasso around a set of states on the map, you should implmenet a way to visually indicate which states are currently selected. For example, you could add a border to the states or slighly increase their size. (Changing the colors of selected hex tiles is probably a bad idea, since you're already using color as a channel, though you could slightly de-emphasize non-selected states.) It is up to you if you want to erase the lasso polyline when the user releases the mouse, or if you want to keep it on the chart until the next lasso is drawn/cleared.
    - If the user just clicks the mouse on the map without lassoing states, that should be a way to de-select all the states or clear the lasso selection.
    

## Step 5: Line chart encodings and interactions

When the user lassos a set of states on the hex map, this should trigger a function to draw (or update) the line chart, based on the set of currently selected states. Your line chart encodings will be the following:

- The line chart will show each selected state as a line.
- One axis will show the years (1992-2019), and the other will be based on the current attribute scale for all years in the dataset. It is up to you if you want to set the bottom value to 0 or be based on the min for the current attribute (you might decide this based on what attributes you choose to include on the page!). Be sure to add axis labels!
- At the end of each line, you should add a label to indicate the state ([here's an example](https://observablehq.com/@nikomccarty/multiline-chart-d3)). It is okay if labels overlap.
- Behind the lines, draw a vertical line to indicate the currently selected year. When the year changes (including via the ***Play*** control), this line should animate (via a D3 transition) to the updated year.

When the lasso selection is updated on the hex map (thus updating the set of selected states), use D3 join and transition functionalities to do the following:
- If a state was previously being drawn on the line chart, but is now NOT going to be drawn anymore, fade out the line by transitioning its opacity from 100% to 0%, and then removing it from the SVG. If desired, you can do these removals using staggered transitions. Keep in mind that, if the user clears the lasso selection in the hex map, you will need to remove ALL the states being shown in the line chart, using this transition!
- After removing all lines that need to be removed, for any new states that need to be drawn on the line chart (i.e., states newly added to the selection), use a D3 transition to do so. You can choose the specific way you'd like to add them to the page, either by animating its opacity from 0% to 100%, or drawing the line from left-to-right across the chart. The label should transition in with the line, and you can stagger this animation if desired.
- States that were previously in the selection, and are still currently in the selection, can remain as is, since they neither need to be added nor removed.

If a user updates the selection in the ***Attributes*** dropdown, you will need to update the lines in this chart.
- Use D3 joins and transitions functionalities to animate the lines from their old to new positions. If desired, you can stagger the animations. Make sure to also animate the state labels too!
- At the same time, also update the Attribute axis from its old to new values, and update the label. (Since the Year axis will always be the same, you don't need to update it.)

## Grading

This assignment is worth 10 points.

## Extra Credit
- Add functionality where, when the user clicks on the background of the line chart, the year updates based on where the mouse clicks. For example, if they click over where the year 1995 is mapped, you should update to the year to 1995. (This will shift the line chart's background line to the appropriate year, using the aforementioned animation, and update the hex map's values using the join/transition logic.) (+1)
- Add a toggle that, when pressed,  animates from a hex map to a geographically accurate map of the USA (and back, if clicked again). I'd recommend you use D3's [shape tweening](https://observablehq.com/@d3/shape-tweening) for this. All other map encodings (e.g., using color to indicate state values) and interaction functionalities (lasso, etc.) should still work on both maps.
- Make it so state labels never overlap on the line chart. (This will get tricky as you select more states!) (+2)
