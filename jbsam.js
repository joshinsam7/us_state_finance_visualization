// var attributesList = ["Consumption.Residential.Coal","Consumption.Residential.Natural Gas","Consumption.Residential.Geothermal","Consumption.Residential.Wood","Consumption.Residential.Petroleum"];
// import {Legend, Swatches} from "@d3/color-legend"


const margin = {top : 70, right: 30, bottom:50, left:90};
const widthLine = 1200 - margin.left - margin.right;
const heightLine = 500 - margin.top - margin.bottom;
let maxValue = 0;
let minValue =  Number.MAX_VALUE;
let minValueScaled =  Number.MAX_VALUE;
let maxValueScaled = 0;
let Data = []; 
let path ;
let isAnimating = false;
let selectedStates = []; 
let shouldAnimate = false;

const allowedYears = [
    1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 
    2002, 2003, 2004, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019
];

const years = [...d3.range(1992, 2005), ...d3.range(2012, 2020)];
    
const x = d3.scalePoint()
    .domain(years) 
    .range([0, widthLine])
    .padding(0.5); 

const rangeInput = document.getElementById("rangeYear");
const rangeValue = document.getElementById("rangeValue");

rangeInput.addEventListener("input", function () {
    
    rangeValue.innerHTML = allowedYears[parseInt(rangeInput.value)];
    maxValue = 0;
    minValue = Number.MAX_VALUE;
    minValueScaled = Number.MAX_VALUE;
    maxValueScaled = 0;
    Data = [];
    isAnimating = false;
    selectedStates = []; 

    document.getElementById("currYear").innerHTML = allowedYears[parseInt(rangeInput.value)];

    importCSV().then(() => {
        d3.json("data/us_states_geojson.json")
            .then(function(data) {
                drawMap(data, selectedYear, selectedAttribute);
            })
            .catch(function(error) {
                console.error("Error loading GeoJSON:", error);
            });
    }).catch(function(error) {
        console.error("Error loading CSV:", error);
    });

});


document.getElementById("clearLasso").addEventListener("click", function() {
    
    const svgHex =  d3.select("#hexmap"); 
    svgHex.selectAll(".state").attr("stroke-width", "1px");
    selectedStates.forEach(d => {
        console.log("Remove : " + d.stateName);
        removeLineChart(d.stateName);
    });

    selectedStates = [];
});

document.getElementById("optionsID").addEventListener("change",function() {

    d3.select("#linechartSVG").selectAll("*").remove();
    Data = [];
    selectedStates = [];
    maxValue = 0;
    minValue = Number.MAX_VALUE;
    minValueScaled = Number.MAX_VALUE;
    maxValueScaled = 0;
    isAnimating = false;

    var selectedID = document.getElementById("optionsID");
    var selectedAttribute = selectedID.value; 
    var index = parseInt(document.getElementById("rangeYear").value); 
    var selectedYear = allowedYears[index]; 

    importCSV().then(() => {
        d3.json("data/us_states_geojson.json")
            .then(function(data) {
                drawMap(data, selectedYear, selectedAttribute);
            })
            .catch(function(error) {
                console.error("Error loading GeoJSON:", error);
            });
    }).catch(function(error) {
        console.error("Error loading CSV:", error);
    });
});

document.getElementById("playButton").addEventListener("click", function() {

    maxValue = 0;
    minValue =  Number.MAX_VALUE;
    maxValueScaled = 0;
    minValueScaled =  Number.MAX_VALUE;
    const submitButton = this;

    if (submitButton.innerHTML === "Play" ) {
            submitButton.innerHTML = "Pause"; 
            shouldAnimate = true;
            hexMap(); 
            isAnimating = true; 
    }
     else if (submitButton.innerHTML === "Pause") {
        isAnimating = false;
        drawLasso();
        submitButton.innerHTML = "Play"; 
    }
});

async function importCSV() {

    Data = []
    maxValue = 0;
    minValue = 100000000000;

    var selectedID = document.getElementById("optionsID");
    var selectedAttribute = selectedID.value;
    var checkScale ; 
    var index = parseInt(document.getElementById("rangeYear").value);
    var selectedYear = allowedYears[index];

    if (document.getElementById("toggleID").checked){
        checkScale = true; 
    }
    else {
        checkScale = false;
    }
    
    d3.csv('data/finance.csv').then(function (data) {
        data.forEach(row => {
            const state = row.State.toLowerCase();
            const year = row.Year;

            if (checkScale){
                maxValueScaled = Math.max(maxValueScaled, +row[selectedAttribute]);                    
                minValueScaled = Math.min(minValueScaled, +row[selectedAttribute]);

                console.log("Max Value scaled " + maxValueScaled + " Min Value scaled : " + minValueScaled);
            }
            
            Data.push({ state, year: year, selectedAttribute: +row[selectedAttribute] });

        });

        console.log(Data);
        hexMap()

    }).catch(function(error) {
        console.error("Error loading CSV:", error);
    });
}

function hexMap() {
    var index = document.getElementById("rangeYear").value;
    var selectedYear = allowedYears[index];

    console.log("Selected Year " + selectedYear);

    var selectedID = document.getElementById("optionsID");
    var selectedAttribute = selectedID.value;

    let yearTag = document.getElementById("currYear");

    d3.json("data/us_states_geojson.json")
    .then(function(data) {
        if (shouldAnimate) {
            animate(data, selectedAttribute, yearTag, index);
        }
        else {
            drawMap(data, selectedYear, selectedAttribute);
        }
        if (isAnimating == false) {
            drawLasso();
        }
    });
}

function animate(data, selectedAttribute, yearTag, index) {
    let animationDuration = 1000;

    let getRangeInput = document.getElementById("rangeYear");
    let getRangeValue = document.getElementById("rangeValue");

    function animateMap(index) {
        if (!isAnimating || index >= allowedYears.length) { 
            clearInterval(interval);
            document.getElementById("playButton").innerText = "Play";
            return;
        }

        let currentYear = allowedYears[index];

        if (!yearTag) {
            console.log("YearTag not valid");
        } else {
            yearTag.innerHTML = currentYear;
        }

        getRangeInput.value = index;  
        getRangeValue.innerText = currentYear;

        drawMap(data, currentYear, selectedAttribute);
        drawVerticalLines(currentYear, heightLine);

        console.log("Animating Year: " + currentYear);
    }

    let interval = setInterval(() => {
        if (index < allowedYears.length) {
            animateMap(index);
            index++; 
        } else {
            clearInterval(interval);
            document.getElementById("playButton").innerText = "Play";
        }        
    }, animationDuration);
}


function drawMap(data, currentYear, selectedAttribute) {

    let isScaled = document.getElementById("toggleID").checked;

    console.log("Current Year in Draw Map: " + currentYear);
        
    let color;
    switch (selectedAttribute) {
        case "Totals.Revenue":
        case "Totals.Expenditure":
            color = d3.scaleSequential(d3.interpolateBlues);
            break;
        case "Details.Financial Aid.Assistance and Subsidies":
            color = d3.scaleSequential(d3.interpolateGreens);
            break;
        case "Details.Interest on debt":
            color = d3.scaleSequential(d3.interpolateReds);
            break;
        case "Totals.Tax":
            color = d3.scaleSequential(d3.interpolateOranges);
            break;
        default:
            color = d3.scaleSequential(d3.interpolateTurbo);
    }

    console.log("Data in DrawMap : " + Data);

    let filteredData = Data.filter(row => row.year === String(currentYear));

    console.log("Filtered Data DrawMAp : "  + filteredData); 

    let values = filteredData.map(row => +row.selectedAttribute);

    console.log("Values DrawMAp : " + values);

    let scaledData = Data.map(row => +row.selectedAttribute);

    console.log(scaledData);

    if (!isScaled) {
        color.domain([d3.min(values), d3.max(values)]);   
        document.getElementById("spanMinValue").innerHTML = d3.min(values).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        document.getElementById("spanMaxValue").innerHTML = d3.max(values).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } 
    else {
        color.domain([d3.min(scaledData), d3.max(scaledData)]);
        document.getElementById("spanMinValue").innerHTML = d3.min(scaledData).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        document.getElementById("spanMaxValue").innerHTML = d3.max(scaledData).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    console.log("Scaled Min: " + (scaledData.length > 0 ? d3.min(scaledData) : "N/A"));
    console.log("Scaled Max: " + (scaledData.length > 0 ? d3.max(scaledData) : "N/A"));
    


    var svg = d3.select("#hexmap"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var projection = d3.geoMercator()
        .scale(500)
        .center([-101.5, 40])
        .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);

    const y = d3.scaleLinear()
        .domain(isScaled ? [d3.min(scaledData), d3.max(scaledData)] : [d3.min(values), d3.max(values)])
        .range([heightLine, 0]);

    d3.select("#legendID").html("");  

    const legendElement = Legend(color, currentYear, { title: selectedAttribute, selectedAttribute: selectedAttribute });
    d3.select("#legendID").node().appendChild(legendElement);   

    svg.selectAll("path").remove();

    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", function (d) { 
            let stateName = d.properties.google_name.toLowerCase().trim();
            let index = stateName.indexOf('(');
            if (index !== -1) {
                stateName = stateName.substring(0, index).trim();
            }

            let row = Data.find(item => item.state === stateName && item.year.toString() === currentYear.toString());

            let getRangeInput = document.getElementById("rangeYear");
            let getRangeValue = document.getElementById("rangeValue");

            getRangeInput.value = allowedYears.indexOf(currentYear); 
            getRangeValue.innerText = currentYear;

            if (row) {
                return color(+row.selectedAttribute);
            }

            return "gray";
        })
        .attr("stroke", "black")
        .transition()
        .duration(400);

    svg.append("g")
        .selectAll("text")
        .data(data.features)
        .enter()
        .append("text")
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
        .text(d => d.properties.iso3166_2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .style("font-size", "13px")
        .style("fill", "black")
        .style("font-weight", "bold"); 
}

function Legend(color, currentYear, { title, numTicks = 4, width = 500, height = 60, marginTop = 20, marginBottom = 20, marginLeft = 15, selectedAttribute } = {}) {
    let isScaled = document.getElementById("toggleID").checked;

    let filteredData = Data.filter(row => row.year === String(currentYear));
    let values = filteredData.map(row => +row.selectedAttribute);

    let scaledData = Data.map(row => +row.selectedAttribute);

    if (!isScaled) {
        color.domain([d3.min(values), d3.max(values)]);   
    } else {
        const minScaled = scaledData.length > 0 ? d3.min(scaledData) : 0;
        const maxScaled = scaledData.length > 0 ? d3.max(scaledData) : 1;
        color.domain([minScaled, maxScaled]);
    }

    const ramp = (color, n = 256) => {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");

        const scaleLinear = d3.scaleLinear()
            .domain([0, 1])
            .range(isScaled ? [d3.min(scaledData), d3.max(scaledData)] : [d3.min(values), d3.max(values)]);

        for (let i = 0; i < n; ++i) {
            const t = i / (n - 1);
            context.fillStyle = color(scaleLinear(t)); 
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    };

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height + 10)
        .attr("viewBox", [0, 0, width, height + 10])
        .style("overflow", "visible")
        .style("display", "block");

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - 2 * marginLeft)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("href", ramp(color).toDataURL());

    const scale = d3.scaleLinear()
        .domain(isScaled ? [d3.min(scaledData), d3.max(scaledData)] : [d3.min(values), d3.max(values)])
        .range([marginLeft, width - marginLeft]);

    const ticks = scale.ticks(numTicks);

    ticks.forEach(tick => {
        const x = scale(tick);
        svg.append("line")
            .attr("x1", x)
            .attr("y1", height - marginBottom)
            .attr("x2", x)
            .attr("y2", height - marginBottom + 5)
            .style("stroke", "black");

        svg.append("text")
            .attr("x", x)
            .attr("y", height - marginBottom + 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px") 
            .text(d3.format(",")(tick)); 
    });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", marginTop / 1.5)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(title);

    return svg.node();
}

function drawLasso() {
    const svgNode = d3.select("#hexmap")
        width = +svgNode.attr("width"),
        height = +svgNode.attr("height");

    let coords = []; 

    var index = document.getElementById("rangeYear").value;
    var selectedYear = allowedYears[index];

    const lassoPath = svgNode.append("path")
        .attr("class", "lasso")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("fill", "rgba(0, 0, 0, 0.5)")
        .attr("d", ""); 

    const drag = d3.drag()
        .on("start", function () {
            coords = []; 
            d3.select("#lasso").remove();
            lassoPath.attr("d", ""); 
        })
        .on("drag", function (event) {
            const [mouseX, mouseY] = [event.sourceEvent.offsetX, event.sourceEvent.offsetY];
            coords.push([mouseX, mouseY]); 
            drawPath(); 
        })
        .on("end", function () {
            svgNode.selectAll(".state").each(function(d) {
                var projection = d3.geoMercator()
                    .scale(500)
                    .center([-101.5, 40])
                    .translate([width / 2, height / 2]);

                const path = d3.geoPath().projection(projection);;

                const centroid = path.centroid(d); 

                if (isInsidePolygon(centroid, coords)) {
                    d3.select(this).attr("stroke-width", "5px"); 
                    let stateName = d.properties.google_name.toLowerCase().trim();
                    let index = stateName.indexOf('(');

                    if (index !== -1) {
                        stateName = stateName.substring(0, index).trim();
                    }
                    selectedStates.push({stateName:stateName, filledColor : d3.select(this).attr("fill")});
                }
            });

            selectedStates.forEach(obj => {
                console.log(`Selected States: ${obj.stateName}`);
                console.log(`Selected States: ${obj.filledColor}`);
            })

            createLineChart(selectedStates, document.getElementById("optionsID").value, selectedYear);
        });
        

    svgNode.call(drag);

    svgNode.selectAll(".state").on("click", function(event, d) {
        let stateName = d.properties.google_name.toLowerCase().trim();
        let index = stateName.indexOf('(');

        if (index !== -1) {
            stateName = stateName.substring(0, index).trim();
        }
        let existingIndex = selectedStates.findIndex(item => item.stateName === stateName);

        if (existingIndex !== -1) {
            d3.select(this).attr("stroke-width", "1px");
            selectedStates.splice(existingIndex, 1); 
            removeLineChart(stateName);

        } else {
            selectedStates.push({ stateName, filledColor: d3.select(this).attr("fill") });
            d3.select(this).attr("stroke-width", "5px"); // Highlight selection
            createLineChart(selectedStates, document.getElementById("optionsID").value, selectedYear);
        }

        console.log("Selected States:", selectedStates);
    });

    function drawPath() {
        const lineGenerator = d3.line(); 
        lassoPath.attr("d", lineGenerator(coords));
    }

    function isInsidePolygon(point, polygon) {
        const [x, y] = point; 
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = (yi > y) !== (yj > y) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}

function drawVerticalLines(selectedYear) {
    const svg = d3.select("#linechartSVG");

    if (selectedStates.length > 0){
        let line = svg.selectAll(".year-line").data([selectedYear]);

        line.enter()
            .append("line")
            .attr("class", "year-line")
            .attr("y1", 0)
            .attr("y2", heightLine)
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4")
            .merge(line)  
            .transition().duration(1000)
            .attr("x1", x(selectedYear))
            .attr("x2", x(selectedYear));
    }
}

function createLineChart(selectedStates) {

    if (!document.getElementById("toggleID").checked) {
        const index = document.getElementById("rangeYear").value;
        selectedYear = allowedYears[index];
    } else {
        const index = document.getElementById("rangeYear").value;
        selectedYear = allowedYears[index];
    }

    console.log("Line Chart Current Year: " + selectedYear);

    selectedStates.forEach(obj => {
        console.log(`Selected States: ${obj.stateName}`);
        console.log(`Selected States: ${obj.filledColor}`);
    });

    let svg = d3.select("#linechartSVG");
    let g = svg.select("g");

    if (g.empty()) {
        svg = svg.attr("width", widthLine + margin.left + margin.right)
                 .attr("height", heightLine + margin.top + margin.bottom);
        g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    const selectedAttributes = selectedStates.flatMap(obj => 
        Data.filter(d => d.state === obj.stateName).map(d => d.selectedAttribute)
    );

    let scaledData = Data.map(row => +row.selectedAttribute);
    
    let minValue = d3.min(scaledData);
    let maxValue= d3.max(scaledData);

    const y = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([heightLine, 0]);

    const line = d3.line()
        .x(d => x(+d.year))
        .y(d => y(d.selectedAttribute))
        .curve(d3.curveMonotoneX);

    if (g.select(".x-axis").empty()) {
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${heightLine})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
    }

    const yearLine = g.select(".year-line");
    if (yearLine.empty()) {
        g.append("line")
            .attr("class", "year-line")
            .attr("x1", x(selectedYear))
            .attr("x2", x(selectedYear))
            .attr("y1", 0)
            .attr("y2", heightLine)
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4");
    } else {
        yearLine.transition().duration(500).attr("x1", x(selectedYear)).attr("x2", x(selectedYear));
    }

    if (g.select(".x-label").empty()) {
        g.append("text")
            .attr("class", "x-label")
            .attr("x", widthLine / 2)
            .attr("y", heightLine + margin.bottom)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Years");
    }

    if (g.select(".y-label").empty()) {
        g.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -heightLine / 2)
            .attr("y", -margin.left + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(`${document.getElementById("optionsID").options[document.getElementById("optionsID").selectedIndex].text}`);
    }

    selectedStates.forEach(obj => {
        var stateName = obj.stateName;
        const stateData = Data.filter(d => d.state === stateName);

        if (stateData.length > 0) {
            console.log(`Drawing line for ${stateName}`);

            let statePath = g.select(`#line-${stateName}`);

            if (statePath.empty()) {
                statePath = g.append("path")
                    .attr("id", `line-${stateName}`)
                    .datum(stateData)
                    .attr("fill", "none")
                    .attr("stroke", obj.filledColor)
                    .attr("stroke-width", 2)
                    .attr("d", line(stateData));

                const totalLength = statePath.node().getTotalLength();

                statePath.attr("stroke-dasharray", totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1500)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);

                const lastDataPoint = stateData[stateData.length - 1];

                g.append("text")
                    .attr("class", "state-label")
                    .attr("id", `label-${stateName}`)
                    .attr("x", x(+lastDataPoint.year))
                    .attr("y", y(lastDataPoint.selectedAttribute))
                    .attr("dy", "-0.5em")
                    .attr("text-anchor", "start")
                    .style("fill", obj.filledColor)
                    .style("font-family", "sans-serif")
                    .style("font-size", 12)
                    .text(stateName);
            }
        }
    });

    // click on the x-axis and then draw the vertical line on the clicked x-axis point. 
    svg.selectAll(".x-axis .tick text")
    .style("cursor", "pointer") // Make it look clickable
    .on("click", function(event, d) {
        let selectedYear = d; // 'd' is the year from the scale domain

        console.log("Clicked Year:", selectedYear);
        let selectedAttribute  = document.getElementById("optionsID").value;
        d3.select(".year-line")
            .transition().duration(500)
            .attr("x1", x(selectedYear))
            .attr("x2", x(selectedYear));

        d3.json("data/us_states_geojson.json")
            .then(function(data) {
                drawMap(data, selectedYear, selectedAttribute);
            })
            .catch(function(error) {
                console.error("Error loading GeoJSON:", error);
            });
    });

}

function removeLineChart(stateName) {
    const svg = d3.select("#linechartSVG");
    const removedState = stateName.toLowerCase();

    // console.log("Removing:", `#line-${removedState}`);
    // console.log(svg.select(`#line-${removedState}`).node());
    
    svg.select(`#line-${removedState}`).remove();
    svg.select(`#label-${removedState}`).remove();
}