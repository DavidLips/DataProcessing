window.onload = function() {

	// create graph margins and dimensions
	var margin = {top: 20, right: 30, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right;
	    height = 500 - margin.top - margin.bottom;

	// prep scales
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .05);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var	parseDate = d3.time.format("%Y").parse;

	// create tooltip
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return "<strong>ppm:</strong> <span style='color:orangered'>" + d.mean + "</span>";
	  });

	// add margins for axes
	var chart = d3.select(".chart")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add tooltip
	chart.call(tip);

	// load json data
	d3.json("http://rawgit.com/DavidLips/DataProcessing/master/Homework/Week-3/convertCSV2JSON_output.json", function(data){

		// convert years 
		data.forEach(function(d) {
	        d.year = parseDate(d.year);
	    });

		// add domain to scale functions
		x.domain(data.map(function(d) { return d.year; }))
		y.domain([0, 450]);

		// create container elements for each bar and set x-position (using transform)
		var bar = chart.selectAll("g")
		  .data(data)
		  .enter().append("g")
		  .attr("transform", function(d, i) {return "translate(" + x(d.year) + ",0)"; })

		 // create bars and add mouseover functionality
		bar.append("rect")
			.attr("width", x.rangeBand())
			.attr("y", function(d) {return y(d.mean);})
			.attr("height", function(d) {return height - y(d.mean);})
			.on('mouseover', function(d,i){
				tip.show(d,i)
				d3.select(this).style("fill", "orangered");
			})
      		.on('mouseout', function(d,i){
      			tip.hide(d,i);
      			d3.select(this).style("fill", "steelblue");
      		})
			
		// create axes
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(d3.time.format("%Y"));

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
			.text("ppm");

		// add multi-line title
		var title = chart.append("text")
	        .attr("x", (width / 2))             
	        .attr("y", 0)
	        .attr("dy", "0em")
	        .attr("text-anchor", "middle")  
	        .style("font-size", "20px") 
	        .html("Annual mean atmospheric CO&#8322; concentration in parts per million (ppm)");

		title.append("tspan")
			.attr("dy", "1.2em")
			.attr("x", (width / 2))     
			.text("Measured in Manau Lau, Hawaii, 1959-2016");			
	});
};