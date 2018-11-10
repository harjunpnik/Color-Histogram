//variables for the img
var img = new Image();
img.src = document.getElementById("image").src;
var c = document.getElementById("pictureCanvas");
var ctx = c.getContext("2d");
c.height = img.height;
c.width = img.width;
ctx.drawImage(img, 0, 0);
var imgData = ctx.getImageData(0, 0, c.width, c.height);
                
//variables for the colorvalue arrays
var red = new Array;
var green = new Array;
var blue = new Array;

//pushes 256 "0"s to each array                
for(var i = 0; i < 256; i++){
    red.push(0);
    blue.push(0);
    green.push(0);
}
//Loops through the data and increments each individual color pixel value by one each time it is represented
for (i = 0; i < imgData.data.length; i += 4) {
    red[imgData.data[i]] += 1;
    green[imgData.data[i+1]] += 1;
    blue[imgData.data[i+2]] += 1;
}

//creats the variable for the color output
var radioTest = d3.select('input[name="mode"]:checked').property("value");;

//creates the Canvas svg
var canvas = d3.select("#graphCanvas")
    .append("svg")
    .style("background", "lightgrey");

//draws the graph for the first time
drawGraph();
//draws the graph each time the window is resized
window.addEventListener("resize", drawGraph);
//sets the right opacity for the bars
document.getElementById("radioAll").addEventListener("click", drawGraph);
document.getElementById("radioRed").addEventListener("click", drawGraph);
document.getElementById("radioGreen").addEventListener("click", drawGraph);
document.getElementById("radioBlue").addEventListener("click", drawGraph);
//sets the values of the new picture from the input and draws the graph
document.getElementById("fileInput").addEventListener("change", inputChange);
//sets the values of the new picture from the link and draws the graph
document.getElementById("submitLink").addEventListener("click", linkChange);

//This function is used in inputChange and in linkChange to draw the picture and calculate the individual pixel values
function calc (){
    
    ctx = c.getContext("2d");
    c.height = img.height;
    c.width = img.width;
    ctx.drawImage(img, 0, 0);
    imgData = ctx.getImageData(0, 0, c.width, c.height);
    red = [];
    green = [];
    blue = [];
    
    //pushes 256 "0"s to each array                
    for(var i = 0; i < 256; i++){
        red.push(0);
        blue.push(0);
        green.push(0);
    }

    //Loops through the data and increments each individual color pixel value by one each time it is represented
    for (i = 0; i < imgData.data.length; i += 4) {
        red[imgData.data[i]] += 1;
        green[imgData.data[i+1]] += 1;
        blue[imgData.data[i+2]] += 1;
    }
    //and lastly draws the graph
        drawGraph();
}

//function that takes the input and calculates the values and draws the graph
function inputChange(){

    var pictureInput = document.getElementById('fileInput').files[0];
    img = document.getElementById("image");
    var reader = new FileReader();
    if (pictureInput) { reader.readAsDataURL(pictureInput); }
    reader.addEventListener("load", function() { img.src = reader.result;});
    img.onload = function() {calc() }
}

//function that takes the link and calculates the values and draws the graph
function linkChange(){

    img = document.getElementById("image2");
    img.src = document.getElementById("linkInput").value;
    img.onload = function() { ctx = c.getContext("2d"); calc(); };
}

//Function that draws the graphs.
function drawGraph(){
    // Height and width variables. Width adjusted to the window width
    var windowWidth = window.innerWidth * 0.95; 
    var height = window.innerHeight * 0.65;

    //opacity variables 
    var opacityRed,opacityGreen,opacityBlue;
    var opacityMin = 0.1;
    var opacityDefaul = 0.8;
    var opacityMax = 1.0;

    //checks state of the radio inputs
    var radioTest = d3.select('input[name="mode"]:checked').property("value");
    //sets correct opacity values based on the radio input value
    if (radioTest == "all"){
        opacityRed = opacityDefaul;
        opacityGreen = opacityDefaul;
        opacityBlue = opacityDefaul;
    }else if (radioTest == "red"){
        opacityRed = opacityMax;
        opacityGreen = opacityMin;
        opacityBlue = opacityMin;
    }else if (radioTest == "green"){
        opacityRed = opacityMin;
        opacityGreen = opacityMax;
        opacityBlue = opacityMin;
    }else if (radioTest == "blue"){
        opacityRed = opacityMin;
        opacityGreen = opacityMin;
        opacityBlue = opacityMax;
    };

    //individual values for the bars so that they are scaled to the size of the graph
    //The width scale for each bar
    var paddingLeft = windowWidth * 0.055;
    var barwidth = (windowWidth - paddingLeft)/256;
    var margin = barwidth *0.2;

    //The x scale 
    var xScale = d3.scaleLinear()
        .domain([0,256])
        .range([paddingLeft,windowWidth]);

    //The Height scale for each individual color
    var heightScaleRed = d3.scaleLinear()
        .domain([0, d3.max(red)])
        .range([0,height]);

    var heightScaleGreen = d3.scaleLinear()
        .domain([0, d3.max(green)])
        .range([0,height]);

    var heightScaleBlue = d3.scaleLinear()
        .domain([0, d3.max(blue)])
        .range([0,height]);
 
    //The Y scale for each individual color
    var yScaleRed = d3.scaleLinear()
        .domain([0,d3.max(red)])
        .range([height,0]);

    var yScaleGreen = d3.scaleLinear()
        .domain([0,d3.max(green)])
        .range([height,0]);

    var yScaleBlue = d3.scaleLinear()
        .domain([0,d3.max(blue)])
        .range([height,0]);

    var yAxisScale = yScaleRed;    
    var maxValue = Math.max(d3.max(red), d3.max(green), d3.max(blue));
    if(maxValue == d3.max(red)){
        yAxisScale = yScaleRed
    };
    if(maxValue == d3.max(green)){
        yAxisScale = yScaleGreen
    };
    if(maxValue == d3.max(blue)){
        yAxisScale = yScaleBlue
    }; 
    
    //Removes everything from the canvas so that it won't be duplicated
    canvas.selectAll("*").remove();
    
    //Canvas attributes
    canvas
      .attr("width", windowWidth)
      .attr("height", height);

    //creation of the "bars" variable which is used to create the bars of the graph  
    var bars = canvas.selectAll("stapel");
  
    //Appends the canvas selection with all the bars
    bars.data(blue)
        .enter().append('rect')
            .style('fill', "blue")
            .attr("opacity", opacityBlue)
            .attr('width', barwidth-margin)
            .attr("class", "rectangle")
            .attr('height', function(d) {return heightScaleBlue(d);})
            .attr('x', function(d,i) {return xScale(i);})
            .attr('y', yAxisScale);

    bars.data(green)
        .enter().append('rect')
            .style('fill', "green")
            .attr("opacity", opacityGreen)
            .attr('width', barwidth-margin)
            .attr('height', function(d) {return heightScaleGreen(d);})
            .attr('x', function(d,i) {return xScale(i);})
            .attr('y', yAxisScale);

    bars.data(red)
        .enter().append('rect')
            .style('fill', "red")
            .attr("opacity", opacityRed)
            .attr('width', barwidth-margin)
            .attr('height', function(d) {return heightScaleRed(d);})
            .attr('x', function(d,i) {return xScale(i);})
            .attr('y', yAxisScale);

    canvas.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + paddingLeft + ",0)")
        .call(d3.axisLeft(yAxisScale).ticks(10).tickSizeInner(10).tickSizeOuter(2));

    //Appends the canvas with the y-axis
    canvas.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Pixels");      
}