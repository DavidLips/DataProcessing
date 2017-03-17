/*
David Lips - 6225950
Javascript file for assignment week 6 - D3 Interactive series
*/

var	parseDate = d3.time.format("%Y").parse;

// create graph margins and dimensions
var margin = {top: 20, right: 30, bottom: 110, left: 0},
	width = 900 - margin.left - margin.right;
	height = 400 - margin.top - margin.bottom;

function makeYearBarChart(data){

	countryList = data.map(function(country){
		return country.name})

	// prep scales
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .10)
    	.domain(countryList)

	var y = d3.scale.linear()
	    .range([height, 0])
	    .domain([0, 100]); 

	// add margins for axes
	var chart = d3.select(".chart")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    // .append("g") // uncomment to add y-axis but lose interaction
	    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

	// create container elements for each bar and set x-position (using transform)
	var groups = chart.selectAll("g")
	  .data(data)
	  .enter().append("g")
	  .attr("class", "rbars")
	  .attr("transform", function(d, i) { return "translate(" + x(countryList[i]) + ",0)"; })

	 // create bars and add mouseover functionality
	groups.append("rect")
		.attr("width", x.rangeBand())
		.attr("y", function(d,i) {return y(d.population_percentage);})
		.attr("height", function(d,i) {return height - y(d.population_percentage);})
		.attr("id", function(d,i){return countryList[i]})
		.on('mouseover', function(d,i){
			d3.select(this).style("fill", "orangered");
		})
  		.on('mouseout', function(d,i){
  			d3.select(this).style("fill", "steelblue");
  		})

	// create axes
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")

	var yAxis = d3.svg.axis().outerTickSize(0) // remove last tick
		.scale(y)
		.orient("left");

	// add x-axis to graph
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", "-.55em")
		.attr("transform", "rotate(-80)");

	// add y-axis to graph
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	  .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("population (% of total)");

	// add multi-line title
	var title = chart.append("text")
		.attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Muslim population percentages in 1990");

}

function updateBars(newData, year){

	var y = d3.scale.linear()
	    .range([height, 0])
	    .domain([0, 100]); 

	// update bars
	d3.selectAll("rect")
		.transition()
			.duration(2000)
		.attr("y", function(d,i) {return y(newData[i].population_percentage);})
		.attr("height", function(d,i) {return height - y(newData[i].population_percentage);})

	// update titles
	d3.selectAll("#title-text")
		.transition()
			.duration(2000)
		.text("Muslim population percentages in " + year)

}

// IN PROGRESS: replace all-country barchart with country-specific data in grouped bar chart. NOT WORKING
function makeCountryBarChart(newData){

	
	var years = [parseDate("1990"), parseDate("2010"),parseDate("2030")];
	//var yearKeys = ["1990", "2010", "2030"]

	// prep scales
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .05)
        .domain(years)

    // create axes
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickFormat(d3.time.format("%Y"));

	var y = d3.scale.linear()
	    .range([height, 0])
	    .domain([0, 100]); 


	var chart = d3.select(".chart")

	console.log("data", newData)

	var updateBar = chart.selectAll(".rbars")	
	  .data(newData)

	updateBar.enter().append("g")
	  .attr("class", "rbars")
	  .attr("transform", function(d, i) { return "translate(" + x(years[i]) + ",0)"; })
	  
	var rect = updateBar.selectAll(".rbars")
	  .data(function(d){return d}) 

	rect.enter()
	  .append("rect")
	  .attr("width", x.rangeBand())
	  // .style("fill-opacity",1e-6);

	 rect.transition()
	 	.duration(1000)
	 	.ease("linear")
		.attr("y", function(d,i) {return y(d);})
		.attr("height", function(d,i) {return height - y(d);})

	rect.exit()
	  .transition()
	  .duration(1000)
	  .ease("circle")
	  .attr("x",width)
	  .remove();

	  updateBar.exit()
	    .transition()
	    .duration(1000)
	    .ease("circle")
	    .attr("x",width)
	    .remove();

	//  // create bars and add mouseover functionality
	// updateBar.append("rect")
	// 	.transition()
	// 		.duration(2000)
	// 	.attr("width", x.rangeBand())
	// 	.attr("y", function(d,i) {return y(d);})
	// 	.attr("height", function(d,i) {return height - y(d);})

	// EXIT
	// Remove old elements as needed.
	// updateBar.exit().remove();

	chart.select(".x") // change the y axis
		.transition()
		.duration(1000)
		.ease("circle")
		.call(xAxis);

}