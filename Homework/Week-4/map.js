/*
David Lips - 6225950
Javascript file for assignment week 4 - D3 Map
*/


window.onload = function() {

	// read data
	d3.json("Data/json_output.json", function(error, data){
		if (error) throw error;
		createMap(data);
	});
};

function createMap(data){

	// create container for Datamap-readable data
	var mapData = {};

	// remove countries without gdp data
	var filteredData = data.filter(function(country){ if(country.gdp != ""){ return country }});

	// retrieve gdp values
	onlyValues = filteredData.map(function(country){ return Number(country.gdp) });
	var minValue = Math.min.apply(null, onlyValues),
        maxValue = Math.max.apply(null, onlyValues);

    // create color palette function
    var paletteScale = d3.scale.linear()
        .domain([minValue,maxValue])
        .range(["#fff5f0","#67000d"]); // range obtained from http://colorbrewer2.org/#type=sequential&scheme=Reds&n=9
	
	// fill map dataset in appropriate format
    filteredData.forEach(function(country){
        var code = country.code,
        	fullName = country.name, 
            gdp = Number(country.gdp);

        mapData[code] = { "gdp": gdp, "name": fullName,  "fillColor": paletteScale(gdp) };
    });

    // create map
    var map = new Datamap({
		element: document.getElementById('map'),
		projection: 'mercator', // big world map
		fills: {
            defaultFill: '#F5F5F5' // default color for countries without data
        },
        data: mapData,
        geographyConfig: {
            borderColor: '#DEDEDE',
            highlightBorderWidth: 2,
            // don't change country color on mouse hover 
            highlightFillColor: function(geo) {
                return geo['fillColor'] || '#F5F5F5';
            },
            // only change border color
            highlightBorderColor: '#3690c0', // color chosen for high contrast
            // create tooltip
            popupTemplate: function(geo, data) {
                // show 'data not available' if country not in dataset
                if (!data) { return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>No data available<strong>',
                    '</div>'].join(''); }
                // else return exact spending data
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Military spending: <strong>', parseFloat(data.gdp).toFixed(2), '% of GDP</strong>',
                    '</div>'].join('');
            }
        }
	});

	createLegend(paletteScale);
};

// function to create a custom legend with a quantized scale
// code adapted from http://data-map-d3.readthedocs.io/en/latest/steps/step_14.html
function createLegend(paletteScale){

	// Create quantize scale to categorize the values in groups.
	var numberOfCategories = 20;
	var quantize = d3.scale.quantize()
	    .domain([0, 15])
	    .range(d3.range(numberOfCategories).map(function(i) { return 'q' + i + '-' + numberOfCategories; }));

	// prepare number format with 2 decimal places.
	var formatNumber = d3.format('.2f');

	// prep legend scale
	var legendX = d3.scale.linear();

	// define an axis for the legend
	var legendXAxis = d3.svg.axis()
	  .scale(legendX)
	  .orient("bottom")
	  .tickSize(13)
	  .tickFormat(function(d) {
	    return formatNumber(d);
	  });

	// create SVG element in the legend container
	var legendSvg = d3.select('#legend').append('svg')
	  .attr('width', '100%')
	  .attr('height', '60');

	// append <g> element to hold legend entries.
	var g = legendSvg.append('g')
	    .attr("class", "legend-key")
	    .attr("transform", "translate(" + 20 + "," + 20 + ")");

	// add <rect> element for each quantize category
	g.selectAll("rect")
		.data(quantize.range().map(function(d) { return quantize.invertExtent(d); }))
		.enter().append("rect");

	// add legend caption
	g.append("text")
	    .attr("class", "caption")
	    .attr("y", -6)
	    .text("Military spending as % of GDP");

	// set witdth of legend based on map
	var legendWidth = d3.select('#map').node().getBoundingClientRect().width - 50;

	// set domain of quantize scale for each category using invertExtent()
	var legendDomain = quantize.range().map(function(d) {
	var r = quantize.invertExtent(d);
	return r[1];
	});

	// add lower limit of first category to top of the domain
	legendDomain.unshift(quantize.domain()[0]);

	// set domain (same as for quantize scale defined above) and range for the x scale 
	legendX
	.domain(quantize.domain())
	.range([0, legendWidth]);

	// defining attributes of category <rect> elements
	g.selectAll("rect")
	.data(quantize.range().map(function(d) {
	  return quantize.invertExtent(d);
	}))
	.attr("height", 8)
	.attr("x", function(d) { return legendX(d[0]); })
	.attr("width", function(d) { return legendX(d[1]) - legendX(d[0]); })
	.attr('class', function(d, i) {
	  return quantize.range()[i];
	})
	.attr("fill", function(d,i) { return paletteScale(legendDomain[i+1]); }) // directly translate domain values to color

	// use domain values as tickValues
	legendXAxis
	.tickValues(legendDomain)

	// draw the axis
	g.call(legendXAxis);
};