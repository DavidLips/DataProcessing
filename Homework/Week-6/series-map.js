/*
David Lips - 6225950
Javascript file for assignment week 6 - D3 Interactive series
*/


window.onload = function() {

	d3.queue()
		.defer(d3.json, 'Data/europe_1990.json')
		.defer(d3.json, 'Data/europe_2010.json')
		.defer(d3.json, 'Data/europe_2030.json')
		.await(load);
};

function load(error, europe_1990, europe_2010, europe_2030){

	if (error) throw error;

	format(europe_1990);
	format(europe_2010);
    format(europe_2030);

    // create dataobject combining all decades
    var europeAll = combineAllData(europe_1990, europe_2010, europe_2030)

	// makeCountryBarChart(filterCountry("EUR", europeAll));

	// default: load 1990 data
	makeYearBarChart(europe_1990);

	data = europe_1990	

	var mapData = {};

	percentageValues = data.map(function(country){ return country.population_percentage})
	populationValues = data.map(function(country){ return country.muslim_population })

	var minValue = Math.min.apply(null, percentageValues),
        maxValue = Math.max.apply(null, percentageValues);

    // create color palette function
    var paletteScale = d3.scale.linear()
        .domain([minValue,maxValue])
        .range(["#fff5f0","#67000d"]); // range obtained from http://colorbrewer2.org/#type=sequential&scheme=Reds&n=9
 
	// fill map dataset in appropriate format
    data.forEach(function(country, index){

        var code = replaceCountryCode(country.iso),
        	fullName = country.name, 
            muslimPop = populationValues[index],
            percentage = percentageValues[index];

	    mapData[code] = { "muslimPopulation": muslimPop, "name": fullName,  "percentage": percentage, "fillColor": paletteScale(percentage) };
    });

    // create map
    var map = new Datamap({
		element: document.getElementById('map'),
		setProjection: function(element) {
		    var projection = d3.geo.equirectangular()
		        .center([10, 50])
		        .rotate([4.4, 0])
		        .scale(1000)
		        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
		      var path = d3.geo.path()
		        .projection(projection);

		    return {path: path, projection: projection};
	  	}, // show europe
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
            // NOTE: this is not working when I also use the 'mouseover'/'click' event handlers in 'done:' below!!
            popupTemplate: function(geo, data) {
                // show 'data not available' if country not in dataset
                if (!data) { return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>No data available<strong>',
                    '</div>'].join(''); }
                // else return exact spending data
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Muslim population percentage: <strong>', parseFloat(data.percentage).toFixed(2), '</strong>',
                    '</div>'].join('');
            }
        },
        done: function(map) {
        // highlight bar in barchart graph when hovering over country in ma[]
	     map.svg.selectAll('.datamaps-subunit')
	     	.on('mouseover', function(geo) {
		        var localData = map.options.data[geo.id]
		        if ( localData) {
		          d3.select("#"+localData.name).style("fill", "orangered")
		        }
		      })
	     	.on('mouseout',function(geo) {
		        var localData = map.options.data[geo.id]
		        if ( localData) {
		          d3.select("#"+localData.name).style("fill", "steelblue")
		        }
		    })
		    .on('click',function(geo) {
		        var localData = map.options.data[geo.id]
		        if ( localData) {
		         	// in progress: make grouped barchart for country-specific data
					countryData = filterCountry(geo.id,europeAll)	
					makeCountryBarChart(countryData)
		        }
		    })
	    }
	});
	// update map and barchart on button click
	$("#option-1990").click(function(){
		updateBars(europe_1990, "1990")
        updateMap(europe_1990,map)
	})
	$("#option-2010").click(function(){
		updateBars(europe_2010, "2010")
		updateMap(europe_2010,map)
	})
	$("#option-2030").click(function(){
		updateBars(europe_2030, "2030")
		updateMap(europe_2030,map)
	})

}

function combineAllData(europe_1990, europe_2010, europe_2030){

	var europeAll = []

	var	parseDate = d3.time.format("%Y").parse;

	// total numbers for Europe
	var totalPopulation1990 = 29650000,
		totalPopulation2010 = 44138000,
		totalPopulation2030 = 58209000,
		totalPercentage1990 = 4.1,
		totalPercentage2010 = 6,
		totalPercentage2030 = 8;

	// format data
	percentageValues1990 = europe_1990.map(function(country){ return country.population_percentage });
	populationValues1990 = europe_1990.map(function(country){ return country.muslim_population });
		
	percentageValues2010 = europe_2010.map(function(country){ return country.population_percentage });
	populationValues2010 = europe_2010.map(function(country){ return country.muslim_population });

	percentageValues2030 = europe_2030.map(function(country){ return country.population_percentage });
	populationValues2030 = europe_2030.map(function(country){ return country.muslim_population });

	// organise in one data object
	for (var i = 0; i < europe_1990.length; i++){

		europeAll.push(
			{'code': replaceCountryCode(europe_1990[i].iso), 
			 'year': parseDate("1990"),
			 'muslim_population': populationValues1990[i],
			 'population_percentage': percentageValues1990[i]
			})

		europeAll.push(
			{'code': replaceCountryCode(europe_2010[i].iso), 
			 'year': parseDate("2010"),
			 'muslim_population': populationValues2010[i],
			 'population_percentage': percentageValues2010[i]
			})

		europeAll.push(
			{'code': replaceCountryCode(europe_1990[i].iso), 
			 'year': parseDate("2030"),
			 'muslim_population': populationValues2030[i],
			 'population_percentage': percentageValues2030[i]
			})
	}

	// add Europe_total entry
	europeAll.push(
			{'code': "EUR", 
			 'year': parseDate("1990"),
			 'muslim_population': totalPopulation1990,
			 'population_percentage': totalPercentage1990
			})

	europeAll.push(
		{'code': "EUR", 
		 'year': parseDate("2010"),
		 'muslim_population': totalPopulation2010,
		 'population_percentage': totalPercentage2010
		})

	europeAll.push(
		{'code': "EUR", 
		 'year': parseDate("2030"),
		 'muslim_population': totalPopulation2030,
		 'population_percentage': totalPercentage2030
		})

	return europeAll
}

// select data entries based on country
function filterCountry(countryCode,data){

	result = []

	data.forEach(function(entry) {

		if (entry.code == countryCode){
			result.push(entry)
		}
	})

	return result
}

// replace 2-code with 3-code
function replaceCountryCode(twoLetterCode){

	for (var i = 0; i < country_codes.length; i++){
		if (country_codes[i][0] == twoLetterCode.toLowerCase()){
			return country_codes[i][1]; 
		}

	}
	return twoLetterCode + ": not found"

}

// format data
function format(data){

	// convert years 
	data.forEach(function(country) {

		if (country.population_percentage == "<0.1"){ 
			country.population_percentage = 0 
		}
		else{ country.population_percentage = Number(country.population_percentage) }

		if (isNaN(parseFloat(country.muslim_population.replace(/,/g, '')))){ 
			country.muslim_population = 0
		}
		else{ country.muslim_population = parseFloat(country.muslim_population.replace(/,/g, '')) }
       
    });
	return data

}

function updateMap(data, map){

	colorData = {};

	var percentageValues = data.map(function(country){ return country.population_percentage}),
		populationValues = data.map(function(country){ return country.muslim_population });

	var minValue = Math.min.apply(null, percentageValues),
        maxValue = Math.max.apply(null, percentageValues);

    var paletteScale = d3.scale.linear()
        .domain([minValue,maxValue])
        .range(["#fff5f0","#67000d"]); // range obtained from http://colorbrewer2.org/#type=sequential&scheme=Reds&n=9
 
	// fill map dataset in appropriate format
    data.forEach(function(country, index){

        var code = replaceCountryCode(country.iso),
            percentage = percentageValues[index];

	    colorData[code] = paletteScale(percentage) // fill color data object for updateChoropleth function
    });

    // update colors
    map.updateChoropleth(colorData);

}













