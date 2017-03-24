/*
David Lips - 6225950
Javascript file for assignment week 6 - D3 Interactive series
*/

// create overview bar graph margins and dimensions
var margin = {top: 40, right: 30, bottom: 110, left: 40},
	width = 900 - margin.left - margin.right;
	height = 400 - margin.top - margin.bottom;

var y = d3.scale.linear()
	    .range([height, 0])
	    .domain([0, 100]); 

function makeOverviewBarChart(data){

	// create graph margins and dimensions
	var margin = {top: 40, right: 30, bottom: 110, left: 40},
		width = 900 - margin.left - margin.right;
		height = 400 - margin.top - margin.bottom;

	countryList = data.map(function(country){
		return country.name})

	// prep scales
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .10)
    	.domain(countryList)

	

	// add margins for axes
	var chart = d3.select(".overview-chart")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g") // uncomment to add y-axis but lose interaction
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

	// create container elements for each bar and set x-position (using transform)
	var groups = chart.selectAll("g")
	  .data(data)
	  .enter().append("g")
	  .attr("transform", function(d, i) { return "translate(" + x(countryList[i]) + ",0)"; })

	 // create bars and add mouseover functionality
	groups.append("rect")
		.attr("width", x.rangeBand())
		.style("fill", "steelbue")
		.attr("y", function(d,i) {return y(d.population_percentage);})
		.attr("height", function(d,i) {return height - y(d.population_percentage);})
		.attr("class", "rects")
		.attr("id", function(d,i){return countryList[i]})
		.on('mouseover', function(d,i){
			d3.select(this).style("fill", "orangered");
			d3.select(".datamaps-subunit."+d.iso)
				.style("stroke", "#3690c0")
				.style("stroke-width", "2")
		})
  		.on('mouseout', function(d,i){
  			d3.select(this).style("fill", "steelblue");
  			d3.select(".datamaps-subunit."+d.iso)
				.style("stroke", "rgb(222,222,222)")
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

	// add title
	var title = chart.append("text")
		.attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", -40)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Muslim population percentages in 1990");

}

// function to update bars when new year is shown
function updateBars(newData, year){

	// (I still get )
	// var y = d3.scale.linear()
	//     .range([height, 0])
	//     .domain([0, 100]); 

	// update bars
	d3.selectAll(".rects")
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

function makeCountryBarChart(countryData){

	// country bar chart dimensions
	var countryMargin = {top: 40, right: 120, bottom: 110, left: 80},
		countryWidth = 400 - countryMargin.left - countryMargin.right;
		countryHeight = 400 - countryMargin.top - countryMargin.bottom;

	// format data for grouped bar chart
	var data = [[countryData.values[0].population_percentage,countryData.values[0].muslim_population],
				     [countryData.values[1].population_percentage,countryData.values[1].muslim_population],
				     [countryData.values[2].population_percentage,countryData.values[2].muslim_population]]

	var maxPercentage = Math.max(countryData.values[0].population_percentage, countryData.values[1].population_percentage, countryData.values[2].population_percentage),
		maxPopulation = Math.max(countryData.values[0].muslim_population, countryData.values[1].muslim_population, countryData.values[2].muslim_population)

	// prep scales
	var x0 = d3.scale.ordinal()
    .domain(["population percentage", "total population"])
    .rangeBands([0, countryWidth], .2);

	var x1 = d3.scale.ordinal()
    .domain(d3.range(data.length))
    .rangeBands([0, x0.rangeBand()]);

    var y0 = d3.scale.linear()
	    .range([countryHeight, 0])
	    .domain([0, maxPercentage]);

	var y1 = d3.scale.linear()
	    .range([countryHeight, 0])
	    .domain([0, maxPopulation]);

    var z = d3.scale.category20c();

    var xAxis = d3.svg.axis()
	    .scale(x0)
	    .orient("bottom")
	
	var yAxis0 = d3.svg.axis()
	    .scale(y0)
	    .orient("left");

	var yAxis1 = d3.svg.axis()
	    .scale(y1)
	    .orient("right");

	var svg = d3.select(".country-chart")
		.attr("width", countryWidth + countryMargin.left + countryMargin.right)
    	.attr("height", countryHeight + countryMargin.top + countryMargin.bottom)

    var g = svg.append("g")
    	.attr("transform", "translate(" + countryMargin.left + "," + countryMargin.top + ")");

    // add first y axis
	g.append("g")
	    .attr("class", "y axis")
	    .attr("id", "y-0")
	    .call(yAxis0)
	    .append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("% of total population");

    // second y axis
	g.append("g")				
        .attr("class", "y axis")
        .attr("id", "y-1")	
        .attr("transform", "translate(" + countryWidth + " ,0)")			
        .call(yAxis1)
         .append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -13)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("number of muslims");

	g.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + countryHeight + ")")
	    .call(xAxis)

	// grouped bars
	g.append("g").selectAll("g")
	    .data(data)
	  .enter().append("g")
	    .style("fill", function(d, i) { return z(i); })
	    .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; })
	  .selectAll("rect")
	    .data(function(d) { return d; })
	  .enter().append("rect")
	  	.attr("class", "country-rects")
	    .attr("width", x1.rangeBand())
	    .attr("x", function(d, i) { 
	    	if (i == 0){return x0("population percentage")}
	    	else if (i == 1){return x0("total population")}
	    })
	    .attr("height", function(d,i) {
	    	if (i == 0){return countryHeight - y0(d)}
	    	else if (i == 1){return countryHeight - y1(d)}	
	    })
	    .attr("y", function(d,i) { 
	    	if (i == 0){return y0(d)}
	    	else if (i == 1){return y1(d)}	
	    });

	// add legend    
    var legend = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
    .selectAll("g")
    .data(["1990", "2010", "2030"])
    .enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("rect")
	    .attr("x", countryWidth + 100)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", function(d, i) { return z(i); })

	legend.append("text")
		.attr("x", countryWidth + 95)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function(d) { return d; });

	// add title
	var title = g.append("text")
		.attr("id", "country-title-text")
        .attr("x", (countryWidth / 2))             
        .attr("y", -40)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Muslim population: Europe");
}

// update country bar graph when country is clicked
function updateCountryBars(newCountryData, name){

	var data = [newCountryData.values[0].population_percentage,newCountryData.values[0].muslim_population,
				newCountryData.values[1].population_percentage,newCountryData.values[1].muslim_population,
				newCountryData.values[2].population_percentage,newCountryData.values[2].muslim_population]


	var countryMargin = {top: 40, right: 120, bottom: 110, left: 40},
		countryWidth = 400 - countryMargin.left - countryMargin.right;
		countryHeight = 400 - countryMargin.top - countryMargin.bottom;

	var maxPercentage = Math.max(newCountryData.values[0].population_percentage, newCountryData.values[1].population_percentage, newCountryData.values[2].population_percentage),
		maxPopulation = Math.max(newCountryData.values[0].muslim_population, newCountryData.values[1].muslim_population, newCountryData.values[2].muslim_population)

	var y0 = d3.scale.linear()
	    .range([countryHeight, 0])
	    .domain([0, maxPercentage]);

	var y1 = d3.scale.linear()
	    .range([countryHeight, 0])
	    .domain([0, maxPopulation]);

	var yAxis1 = d3.svg.axis()
	    .scale(y1)
	    .orient("right");

	var yAxis0 = d3.svg.axis()
	    .scale(y0)
	    .orient("left");

	d3.select("#y-0")
		.transition()
			.duration(2000)
		.call(yAxis0)

	d3.select("#y-1")
		.transition()
			.duration(2000)
		.call(yAxis1)

	// update bars
	d3.selectAll(".country-rects")
		.transition()
			.duration(2000)
		.attr("y", function(d,i) { 
			if (i % 2 == 0){ return y0(data[i])}
			else {return y1(data[i])}
	    })
		.attr("height", function(d,i) {
			if (i % 2 == 0){return countryHeight - y0(data[i])}
			else {return countryHeight - y1(data[i])}
	    })
	    

	// update titles
	d3.selectAll("#country-title-text")
		.transition()
			.duration(2000)
		.text("Muslim population: "+name)

}