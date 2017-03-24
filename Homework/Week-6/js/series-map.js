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

	// format data
	format(europe_1990);
	format(europe_2010);
    format(europe_2030);


    // create dataobject combining all decades
    var europeAll = combineAllData(europe_1990, europe_2010, europe_2030)

    // make small multiples for top 25 muslim countries
    var top25Countries = selectTopCountries(europeAll, 25);
    makeSmallMultiples(top25Countries)

    // set default country chart to show Europe's total data
	makeCountryBarChart(filterCountry("EUR", europeAll));

	// make overview bar chart of percentage values starting in 1990
	makeOverviewBarChart(europe_1990);

	var year = "1990",
		data = europe_1990
		currentData = europe_1990	

	var mapData = {};

	// extract specific data
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

        var code = country.iso,
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
            // change border color
            highlightBorderColor: '#3690c0', // color chosen for high contrast
            // create tooltip
            popupTemplate: function(geo, data,map) {
               
               	// get country data from hovering country
            	var updatedCountry = filterCountry(geo.id, currentData)

                // change color of corresponding country bar in bar chart
                if (geo.properties.name){
		        	d3.select("#"+geo.properties.name).style("fill", "orangered")
		        };

		        // show 'data not available' if country not in dataset
                if (!data) { return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>No data available<strong>',
                    '</div>'].join(''); }
                // else display exact population data
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong> in ',year,
                    '<br>Muslim population percentage: <strong>', parseFloat(updatedCountry.population_percentage).toFixed(2), '</strong>',
                    '</div>'].join('');
            }
        },
        done: function(map) {

	     map.svg.selectAll('.datamaps-subunit')

	    	.on('mouseout',function(geo) {

	     		$(".hoverinfo").remove() // remove popup on mouseout

	     		// remove border color highlight
	     		d3.select(".datamaps-subunit."+geo.id)
	     			.style("stroke", "rgb(222,222,222)")

	     		// restore bar color in overview chart
		        var localData = map.options.data[geo.id]
		        if ( localData) {
		          d3.select("#"+localData.name).style("fill", "steelblue")
		        }
		    })
		    .on('click',function(geo) {
		        var localData = map.options.data[geo.id]
		        if ( localData) {
		         	// show grouped bar chart for clicked country
					countryData = filterCountry(geo.id,europeAll)	
					updateCountryBars(countryData, countryData.name)
		        }
		    })
	    }
	});

	// update map and overview barchart on button click
	$("#option-1990").click(function(){
		year = "1990"
		currentData = europe_1990
		updateBars(europe_1990, "1990")
        updateMap(europe_1990,map)
	})
	$("#option-2010").click(function(){
		year = "2010"
		currentData = europe_2010
		updateBars(europe_2010, "2010")
		updateMap(europe_2010,map)
	})
	$("#option-2030").click(function(){
		year = "2030"
		currentData = europe_2030
		updateBars(europe_2030, "2030")
		updateMap(europe_2030,map)
	})

}

// combine data for 1990, 2010, and 2030 in one object
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

	for (var i = 0; i < europe_1990.length; i++){

		europeAll.push(
			{'key': europe_1990[i].iso,
			 'name': europe_1990[i].name,
			 'values': [{'year': '1990', 'muslim_population': populationValues1990[i], 'population_percentage': percentageValues1990[i], 'date': parseDate("1990")},
			 		    {'year': '2010', 'muslim_population': populationValues2010[i], 'population_percentage': percentageValues2010[i], 'date': parseDate("2010")},
			 		    {'year': '2030', 'muslim_population': populationValues2030[i], 'population_percentage': percentageValues2030[i], 'date': parseDate("2030")}]
			})
	}

	// add europe total
	europeAll.push(
		{'key': "EUR", 
		 'name': "Europe (total)",
		 'values': [{'year': '1990', 'muslim_population': totalPopulation1990, 'population_percentage': totalPercentage1990, 'date': parseDate("1990")},
		 		    {'year': '2010', 'muslim_population': totalPopulation2010, 'population_percentage': totalPercentage2010, 'date': parseDate("2010")},
		 		    {'year': '2030', 'muslim_population': totalPopulation2030, 'population_percentage': totalPercentage2030, 'date': parseDate("2030")}]
		})

	return europeAll
}


// select data entries for specific country
function filterCountry(countryCode,data){

	var result;

	data.forEach(function(entry) {

		if (entry.key == countryCode || entry.iso == countryCode){
			result = entry
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

// format number data
function format(data){

	// convert years 
	data.forEach(function(country) {

		country.iso = replaceCountryCode(country.iso)

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

// change color of map
function updateMap(data, map){

	colorData = {};

	// create new palette function
	var percentageValues = data.map(function(country){ return country.population_percentage}),
		populationValues = data.map(function(country){ return country.muslim_population });

	var minValue = Math.min.apply(null, percentageValues),
        maxValue = Math.max.apply(null, percentageValues);

    var paletteScale = d3.scale.linear()
        .domain([minValue,maxValue])
        .range(["#fff5f0","#67000d"]); // range obtained from http://colorbrewer2.org/#type=sequential&scheme=Reds&n=9
 
	// fill map dataset in appropriate format
    data.forEach(function(country, index){

        var code = country.iso,
            percentage = percentageValues[index];

	    colorData[code] = paletteScale(percentage) // fill color data object for updateChoropleth function
    });

    // update colors
    map.updateChoropleth(colorData);

}

// extract selected number of top muslim population countries from dataset
function selectTopCountries(europeAll, number){

	percentageWithIndex = []
    indices = []
    topCountries = []

    // combine index and percentage values
	for (var i = 0; i < europeAll.length; i++){
		percentageWithIndex.push([europeAll[i].values[2].population_percentage,i])
	}

	// sort on percentage
	percentageWithIndex.sort(function(a,b){ return b[0]-a[0] })

	// extract indices
	for (var i = 0; i < percentageWithIndex.length; i++){
		indices.push(percentageWithIndex[i][1])
	}

	// select countries on indexs
	indices.slice(0,number).forEach(function(index){
		topCountries.push(europeAll[index])
	})

	return topCountries

}









