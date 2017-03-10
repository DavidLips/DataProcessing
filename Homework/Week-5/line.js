/*
David Lips - 6225950
Javascript file for assignment week 4 - D3 Line series

Note that the code is not optimal: a lot of blocks are repeated and should have been defined as functions instead.
Unfortunately, I tried this repeatedly and struggled for eternity with accessing variables outside of the function's
scope, even if these were defined globally. Gosia and I were not able to solve this. There are also various issues
with the toggling of the succesful and failed launch variables. Again, I struggled with this as long as I had time
and could not for the life of it figure out what's wrong. Please explain next time. Apologies for the mess.
*/



window.onload = function() {


	queue()
		.defer(d3.json, 'Data/launch_success.json')
		.defer(d3.json, 'Data/launch_fail.json')
		.await(makeLineGraph);

};

function makeLineGraph(error, successes, failures){

	if (error) throw error;

	// remove header
	successes.shift()
	failures.shift()

	// load succesful launch data as default
	var outcome = "success",
		launchData = successes;

	var margin = {top: 20, right: 80, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right;
		height = 500 - margin.top - margin.bottom;

	var svg = d3.select("svg"),
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseDate = d3.timeParse("%Y");
	var formatTime = d3.timeFormat("%Y")

	// set up axes
	var xScale = d3.scaleTime().rangeRound([0, width]);
		yScale = d3.scaleLinear().rangeRound([height, 0]);
		zScale = d3.scaleOrdinal(d3.schemeCategory10);

	// Define the div for the tooltip
	var tooltip = d3.select("body").append("g")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);


	var columns = ["unmanned", "manned", "total"];

	// convert years 
	launchData.forEach(function(d) {
        d.year = parseDate(d.year);
    });	

	// format data
	var formattedLaunchData = columns.map(function(launchType) { return formatLaunchData(launchType, launchData); });

	// define axes domains
	xDomain = d3.extent(launchData, function(d) { return d.year; })
	yDomain = [ 0, d3.max( formattedLaunchData[0].values.map(function(d){ return Number(d.launches); } )) ]

	xScale.domain(xDomain);
	yScale.domain(yDomain);
	zScale.domain(formattedLaunchData.map(function(d) { return d.type; }));

	var line = d3.line()
	    .x(function(d) { return xScale(d.year); })
	    .y(function(d) { return yScale(d.launches); });

	// add x-axis
	g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    // add y-axis
	g.append("g")
	  .attr("class", "axis axis--y")
	  .call(d3.axisLeft(yScale))
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .attr("fill", "#000")
	  .text("Launches");

	// create line container for each category
	var launchLines = g.selectAll(".launch")
	    .data(formattedLaunchData)
	    .enter().append("g")
	      .attr("class", function(d) { return d.type; });

	// draw lines
	launchLines.append("path")
		.attr("class", "line")
		.attr("d", function(d) { return line(d.values); })
		  .style("stroke", function(d) { return zScale(d.type); });

	launchLines.append("text")
		.attr("x", function(){ return xScale(xDomain[1]) + 5})
		.attr("y", function(d,i){return yScale(formattedLaunchData[i].values[formattedLaunchData[i].values.length-1].launches)})
		.text(function(d){return d.type})

	// add crosshair and tooltip on mouseover
	var years = formattedLaunchData[0].values.map(function(d){return d.year})
	
	var crosshair = g.append('g').style('display', 'none');
                
    crosshair.append('line')
        .attr('id', 'crossLineX')
        .attr('class', 'crossLine');
    crosshair.append('line')
        .attr('id', 'crossLineY')
        .attr('class', 'crossLine');
    crosshair.append('circle')
        .attr('id', 'crossCircle')
        .attr('r', 5)
        .attr('class', 'circle crossCircle');

    var bisectDate = d3.bisector(function(d) { return d; }).left;

    g.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function(d,i) { 
        	tooltip.style('display', null);
        	crosshair.style('display', null); 
        })
        .on('mouseout', function(d,i) { 
        	tooltip.style('display', 'none')
        	crosshair.style('display', 'none'); 
        })
        .on('mousemove', function() { 

        	// obtain mouse coordinates and values
            var mouse = d3.mouse(this);
            var mouseX = xScale.invert(mouse[0]);
            var mouseY = yScale.invert(mouse[1]);

            var i = bisectDate(years, mouseX); // returns the index to the current data item
     
            var mouseYear = years[i]

            // find nearest line and launch type
            var nearestResult = findNearest(formattedLaunchData, i, mouseY),
            	nearestLineY = nearestResult[0]
            	nearestType = nearestResult[1];

            // convert to crosshair coordinates
            var x = xScale(mouseYear);
            var y = yScale(nearestLineY); 

            // format tooltip
            tooltip.transition()		
                .duration(50)		
                .style("opacity", .9);		
            tooltip.html("<span>Succesful "+ nearestType + " launches in " + formatTime(mouseYear) + ":<br/><strong>"+nearestLineY+"</strong>")	
                .style("left", d3.event.pageX + "px")		
                .style("top", y + "px");	
            
            // position crosshair
            crosshair.select('#crossCircle')
                .attr('cx', x)
                .attr('cy', y);
            crosshair.select('#crossLineX')
                .attr('x1', x).attr('y1', yScale(yDomain[0]))
                .attr('x2', x).attr('y2', yScale(yDomain[1]));
            crosshair.select('#crossLineY')
                .attr('x1', xScale(xDomain[0])).attr('y1', y)
                .attr('x2', xScale(xDomain[1])).attr('y2', y);
        })
        .on('mouseout', function(d,i) { 
        	tooltip.style('display', 'none')
        	crosshair.style('display', 'none'); 
		}); 

        //On click and difference, update with new data (note .change function not working for me)		
		$(".option").click(function() {

				var clickResult = this.getAttribute("value"); 

				// switch from failure to success is not working! Can't reset the line data, leading to
				// a giant mess, despite hours of trying to get this to work and the exact same thing
				// working fine when switching to failed launches the first time.

				if (clickResult === "success" & clickResult != outcome){

					outcome = clickResult;

					// update data
					launchData = successes;				
					launchData.forEach(function(d) {
					    d.year = parseDate(d.year);
					});	
					formattedLaunchData = columns.map(function(launchType) { return formatLaunchData(launchType, launchData); });

					// update y-axis
					yDomain = [ 0, d3.max( formattedLaunchData[0].values.map(function(d){ return Number(d.launches); } )) ]
					yScale.domain(yDomain);

					// Make the changes
					var transition = svg.transition().duration(750),
					    delay = function(d, i) { return i * 50; };

					transition.select(".axis--y") // change the y axis
					  .call(d3.axisLeft(yScale));	

					// reset line container and draw new lines (NOT WORKING)
					launchLines
						.remove()
						.exit()
					    .data(formattedLaunchData, function(d){return d})
					    .enter().append("g")
					      .attr("class", function(d) { return d.type; })
						.append("path")
						   .attr("class", "line")
						.attr("d", function(d) { return line(d.values); })
						  .style("stroke", function(d) { return zScale(d.type); });

					// redefine crosshair 
					var years = formattedLaunchData[0].values.map(function(d){return d.year})
					
					var crosshair = g.append('g').style('display', 'none');
				                
				    crosshair.append('line')
				        .attr('id', 'crossLineX')
				        .attr('class', 'crossLine');
				    crosshair.append('line')
				        .attr('id', 'crossLineY')
				        .attr('class', 'crossLine');
				    crosshair.append('circle')
				        .attr('id', 'crossCircle')
				        .attr('r', 5)
				        .attr('class', 'circle crossCircle');

				    var bisectDate = d3.bisector(function(d) { return d; }).left;

				    g.append('rect')
				        .attr('class', 'overlay')
				        .attr('width', width)
				        .attr('height', height)
				        .on('mouseover', function(d,i) { 
				        	tooltip.style('display', null);
				        	crosshair.style('display', null); 
				        })
				        .on('mousemove', function() { 

				            var mouse = d3.mouse(this);
				            var mouseX = xScale.invert(mouse[0]);
				            var mouseY = yScale.invert(mouse[1]);

				            var i = bisectDate(years, mouseX); // returns the index to the current data item
				     
				            var mouseYear = years[i]

				            var nearestResult = findNearest(formattedLaunchData, i, mouseY),
				            	nearestLineY = nearestResult[0]
				            	nearestType = nearestResult[1];

				            var x = xScale(mouseYear);
				            var y = yScale(nearestLineY); 

				            tooltip.transition()		
				                .duration(50)		
				                .style("opacity", .9);		
				            tooltip.html("<span>Succesful "+ nearestType + " launches in " + formatTime(mouseYear) + ":<br/><strong>"+nearestLineY+"</strong>")	
				                .style("left", d3.event.pageX + "px")		
				                .style("top", y + "px");	
				            
				            crosshair.select('#crossCircle')
				                .attr('cx', x)
				                .attr('cy', y);
				            crosshair.select('#crossLineX')
				                .attr('x1', x).attr('y1', yScale(yDomain[0]))
				                .attr('x2', x).attr('y2', yScale(yDomain[1]));
				            crosshair.select('#crossLineY')
				                .attr('x1', xScale(xDomain[0])).attr('y1', y)
				                .attr('x2', xScale(xDomain[1])).attr('y2', y);
				        }) 
						.on('mouseout', function(d,i) { 
				        	tooltip.style('display', 'none')
				        	crosshair.style('display', 'none'); 
				        })

					
				}
				else if (clickResult === "failure" & clickResult != outcome){

					outcome = clickResult;

					// update data
					launchData = failures					
					launchData.forEach(function(d) {
					    d.year = parseDate(d.year);
					});	
					var formattedLaunchData = columns.map(function(launchType) { return formatLaunchData(launchType, launchData); });

					// update y-axis
					yDomain = [ 0, d3.max( formattedLaunchData[0].values.map(function(d){ return Number(d.launches); } )) ]
					yScale.domain(yDomain);

					// Make the changes
					var transition = svg.transition().duration(750),
					    delay = function(d, i) { return i * 50; };

					 transition.select(".axis--y") // change the y axis
					  .call(d3.axisLeft(yScale));	

					// reset line container and draw new lines
					launchLines
						.remove()
						.exit()
					    .data(formattedLaunchData, function(d){return d})
					    .enter().append("g")
					      .attr("class", function(d) { return d.type; })
						.append("path")
						   .attr("class", "line")
						.attr("d", function(d) { return line(d.values); })
						  .style("stroke", function(d) { return zScale(d.type); });

					launchLines.append("text") // not working..
						.attr("x", function(){ return xScale(xDomain[1]) + 5})
						.attr("y", function(d,i){return yScale(formattedLaunchData[i].values[formattedLaunchData[i].values.length-1].launches)})
						.text(function(d){return d.type})

					// redefine crosshair
					var crosshair = g.append('g').style('display', 'none');
				                
				    crosshair.append('line')
				        .attr('id', 'crossLineX')
				        .attr('class', 'crossLine');
				    crosshair.append('line')
				        .attr('id', 'crossLineY')
				        .attr('class', 'crossLine');
				    crosshair.append('circle')
				        .attr('id', 'crossCircle')
				        .attr('r', 5)
				        .attr('class', 'circle crossCircle');

				    var bisectDate = d3.bisector(function(d) { return d; }).left;

				    g.append('rect')
				        .attr('class', 'overlay')
				        .attr('width', width)
				        .attr('height', height)
				        .on('mouseover', function(d,i) { 
				        	tooltip.style('display', null);
				        	crosshair.style('display', null); 
				        })
				        .on('mousemove', function() { 

				            var mouse = d3.mouse(this);
				            var mouseX = xScale.invert(mouse[0]);
				            var mouseY = yScale.invert(mouse[1]);

				            var i = bisectDate(years, mouseX); // returns the index to the current data item
				     
				            var mouseYear = years[i]

				            var nearestResult = findNearest(formattedLaunchData, i, mouseY),
				            	nearestLineY = nearestResult[0]
				            	nearestType = nearestResult[1];

				            var x = xScale(mouseYear);
				            var y = yScale(nearestLineY); 

				            tooltip.transition()		
				                .duration(50)		
				                .style("opacity", .9);		
				            tooltip.html("<span> Failed "+ nearestType + " launches in " + formatTime(mouseYear) + ":<br/><strong>"+nearestLineY+"</strong>")	
				                .style("left", d3.event.pageX + "px")		
				                .style("top", y + "px");	
				            
				            crosshair.select('#crossCircle')
				                .attr('cx', x)
				                .attr('cy', y);
				            crosshair.select('#crossLineX')
				                .attr('x1', x).attr('y1', yScale(yDomain[0]))
				                .attr('x2', x).attr('y2', yScale(yDomain[1]));
				            crosshair.select('#crossLineY')
				                .attr('x1', xScale(xDomain[0])).attr('y1', y)
				                .attr('x2', xScale(xDomain[1])).attr('y2', y);
				        }) 
						.on('mouseout', function(d,i) { 
				        	tooltip.style('display', 'none')
				        	crosshair.style('display', 'none'); 
				        })
				}
			});
  
}



// function to format data for easy processing into a multi-series line graph
function formatLaunchData(launchType, data){

	return {
      type: launchType,
      values: data.map(function(d) { return {year: d.year, launches: d[launchType]}; })
    };
}

// finds y-value for nearest line compared to mouse Y position
function findNearest(data, index, mouseY) {

    var nearest = null,
    	type = null,
        yHolder = Number.MAX_VALUE;

    data.forEach(function(launchType) {

    	yValue = launchType.values[index].launches

    	yDiff = Math.abs(mouseY - yValue);

    	if (yDiff < yHolder){
    		yHolder = yDiff;
    		nearest = yValue;
    		type = launchType.type

    	}

    });

    return [nearest,type]
}




