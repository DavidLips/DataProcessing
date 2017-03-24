/*
David Lips - 6225950
Javascript file for assignment week 6 - D3 Interactive series
Small multiples adapted from: http://flowingdata.com/2014/10/15/linked-small-multiples/
*/

var SmallMultiples, plotData, setupIsoytpe, transformData;

function smallMultiples(data){

	var area, bisect, caption, chart, circle, curYear, format, height, line, margin, mousemove, mouseout, mouseover, setupScales, width, xScale, xValue, yAxis, yScale, yValue;
    width = 150;
    height = 120;
    margin = {
      top: 15,
      right: 10,
      bottom: 40,
      left: 35
    };

    circle = null;
    caption = null;
    curYear = null;

    bisect = d3.bisector(function(d) {
      return d.date;
    }).left;

    format = d3.time.format("%Y");

    xScale = d3.time.scale().range([0, width]);
    yScale = d3.scale.linear().range([height, 0]);

    // accessor functions
    xValue = function(d) {
      return d.date;
    };
    yValue = function(d) {
      return d.population_percentage;
    };

    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(4).outerTickSize(0).tickSubdivide(1).tickSize(-width);

    // area and line functions
    area = d3.svg.area().x(function(d) {
      return xScale(xValue(d));
    }).y0(height).y1(function(d) {
      return yScale(yValue(d));
    });

    line = d3.svg.line().x(function(d) {
      return xScale(xValue(d));
    }).y(function(d) {
      return yScale(yValue(d));
    });

    setupScales = function(data) {

      var extentX, maxY;
      maxY = d3.max(data, function(country) {
        return d3.max(country.values, function(d) {
          return yValue(d);
        });
      });
      maxY = maxY + (maxY * 1 / 4);
      yScale.domain([0, maxY]);
      extentX = d3.extent(data[0].values, function(d) {
        return xValue(d);
      });

      return xScale.domain(extentX);
    };

    chart = function(selection) {

      return selection.forEach(function(data) {
        var div, g, lines, svg;

        // extract data
        data = data[0].__data__

        setupScales(data);

        div = d3.select(selection[0][0]).selectAll(".chart")
          .data(data);

        // append chart objects for each multiple
        div.enter().append("div")
          .attr("class", "chart")
          .append("svg")
          .append("g");

        svg = div.select("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // create rect for catching mouse events
        g.append("rect")
          .attr("class", "background")
          .style("pointer-events", "all")
          .attr("width", width + margin.right)
          .attr("height", height)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);

        // draw area under line
        lines = g.append("g");
        lines.append("path")
        .attr("class", "area")
        .style("pointer-events", "none")
        .attr("d", function(country) {
          return area(country.values);
        });

        // draw line
        lines.append("path")
          .attr("class", "line")
          .style("pointer-events", "none")
          .attr("d", function(country) {
          return line(country.values);
        });

        // add country title
        lines.append("text")
          .attr("class", "title")
          .attr("text-anchor", "middle")
          .attr("y", height)
          .attr("dy", margin.bottom / 2 + 5)
          .attr("x", width / 2).text(function(country) { return country.name; });

        // add year text
        lines.append("text")
          .attr("class", "static_year")
          .attr("text-anchor", "start")
          .style("pointer-events", "none")
          .attr("dy", 13).attr("y", height)
          .attr("x", 0).text(function(c) {
          return xValue(c.values[0]).getFullYear();
        });

        lines.append("text")
          .attr("class", "static_year")
          .attr("text-anchor", "end")
          .style("pointer-events", "none").attr("dy", 13)
          .attr("y", height)
          .attr("x", width).text(function(c) {
          return xValue(c.values[c.values.length - 1]).getFullYear();
        });

        circle = lines.append("circle")
          .attr("r", 2.2)
          .attr("opacity", 0)
          .style("pointer-events", "none");

        caption = lines.append("text")
          .attr("class", "caption")
          .attr("text-anchor", "middle")
          .style("pointer-events", "none")
          .attr("dy", -8);

        curYear = lines.append("text")
          .attr("class", "year")
          .attr("text-anchor", "middle")
          .style("pointer-events", "none")
          .attr("dy", 13)
          .attr("y", height);

        return g.append("g").attr("class", "small-multiple-y small-multiple-axis").call(yAxis);
      });
    };

    mouseover = function() {
      circle.attr("opacity", 1.0);
      d3.selectAll(".static_year").classed("hidden", true);
      return mousemove.call(this);
    };

    mouseout = function() {
      d3.selectAll(".static_year").classed("hidden", false);
      circle.attr("opacity", 0);
      caption.text("");
      return curYear.text("");
    };

    mousemove = function() {
      var date, index, year, counter;
      year = xScale.invert(d3.mouse(this)[0]).getFullYear();
      date = format.parse('' + year);
      index = 0;
      circle.attr("cx", xScale(date)).attr("cy", function(country) {
        index = bisect(country.values, date, 0, country.values.length - 1);

        // get circle to follow interpolated lines
        if (year < 2010 && year > 1990){ 
          return yScale(country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (1990-year) )) 
        }

        if (year > 2010 && year < 2030){
          return yScale(country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (2010-year) )) 
        }

        if (year == 1990 || year == 2030 || year === 2010){
          return yScale(yValue(country.values[index]));
        }

        // move circle off the chart if it extends below 1990 or beyond 2030
        return yScale(200)


      });
      caption.attr("x", xScale(date)).attr("y", function(country) {

        // add caption to follow circle
        if (year < 2010 && year > 1990){ 
          return yScale(country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (1990-year) )) 
        }

        if (year > 2010 && year < 2030){
          return yScale(country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (2010-year) )) 
        }

        if (year == 1990 || year == 2030 || year === 2010){
          return yScale(yValue(country.values[index]));
        }
      }).text(function(country) {
        // estimate and round value for interpolated years
        if (year < 2010 && year > 1990){ 
          return Math.round((country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (1990-year)))*100)/100 
        }

        if (year > 2010 && year < 2030){
          return Math.round((country.values[index-1].population_percentage + (((country.values[index].population_percentage - country.values[index-1].population_percentage)/20) * -1 * (2010-year)))*100)/100
        }

        if (year == 1990 || year == 2030 || year === 2010){
          return Math.round(yValue(country.values[index])*100)/100;
        }
      });
      return curYear.attr("x", xScale(date)).text(year);
    };

    chart.x = function(_) {
      if (!arguments.length) {
        return xValue;
      }
      xValue = _;
      return chart;
    };
    chart.y = function(_) {
      if (!arguments.length) {
        return yValue;
      }
      yValue = _;
      return chart;
    };

    // call chart
    return chart;
}

plotData = function(selector, data, plot) {
    return d3.select(selector).datum(data).call(plot);
  };

// sorting function
setupIsoytpe = function() {

    $("#small-multiple-container").isotope({
      itemSelector: '.chart',
      layoutMode: 'fitRows',
      getSortData: {
        count: function(e) {
          var d, sum;
          d = d3.select(e).datum();
          sum = d3.sum(d.values, function(d) {
            return d.population_percentage;
          });
          return sum * -1;
        },
        name: function(e) {
          var d;
          d = d3.select(e).datum();
          return d.key;
        }
      }
    });
    return $("#small-multiple-container").isotope({
      sortBy: 'count'
    });
 };


makeSmallMultiples = function(data) {

    var display, plot;
    plot = smallMultiples(data);

    display = function(data) {
      plotData("#small-multiple-container", data, plot);
      return setupIsoytpe();
    };

    display(data)

    // sort on button click
    return d3.select("#button-wrap").selectAll("div").on("click", function() {
      var id;
      id = d3.select(this).attr("id");
      d3.select("#button-wrap").selectAll("div")
        .classed("active", false);
      d3.select("#" + id)
        .classed("active", true);
      return $("#small-multiple-container").isotope({
        sortBy: id
      });
    });
};