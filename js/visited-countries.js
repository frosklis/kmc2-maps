//var texto_prueba = d3.select(".visited-countries-map").append("p").text("Esto está escrito desde javascript");

basepath = "http://localhost/kmc2/wp-content/plugins/kmc2-maps/";

function visited_countries () {
  var width,
      height,
      centered;


  var aux, proj;
  var options = [];

  var interval, i, n;

  var currentproj;
  var svg;

  d3.select(".visited-countries-map svg").remove();
  svg = d3.select(".visited-countries-map").append("svg");

  width = jQuery(".visited-countries-map svg").width();

  var g = svg.append("g");

  var projection;

  projection = d3.geo.equirectangular()
    .scale(1)
    .center([0,0])
    .precision(.1);

  var path = d3.geo.path()
      .projection(projection);

  var visited = [];
  d3.csv(basepath+"data/visited.csv")
    .row(function(d) { 
      visited.push( 
        {
          iso: d.iso, 
          name: d.name, 
          claudio: +d.claudio,
          ceci: +d.ceci,
          juntos: +d.juntos
        }); 
    }) 
    .get(function(error, rows) { console.log(rows); });



  var left_border = Infinity,
      lower_border = -Infinity,
      right_border = -Infinity,
      upper_border = Infinity;

  d3.json(basepath+'data/world.json', function(world) {
    // Añadir propiedades
    for(j=0; j<world.features.length; j++) {
      // Paso de la Antártida
      //if (world.features[j].properties.adm0_a3 == "ATA") continue;
      for(i=0; i<visited.length; i++) {
        if (visited[i].iso == world.features[j].properties.adm0_a3) {
          world.features[j].properties.claudio = visited[i].claudio;
          world.features[j].properties.ceci = visited[i].ceci;
          world.features[j].properties.juntos = visited[i].juntos;
          world.features[j].properties.name = visited[i].name;;
        }
      }

      d3.geo.bounds(world.features[j]).forEach(function(coords) {
          coords = projection(coords);
          var x = coords[0],
              y = coords[1];
          if (x < left_border) left_border = x;
          if (x > right_border) right_border = x;
          if (y > lower_border) lower_border = y;
          if (y < upper_border) upper_border = y;
      });

    }

    // Cambiar escala en función de la anchura de la pantalla
    projection.scale(width / (right_border-left_border));
    // Definir altura y centrar
    height = width * (lower_border-upper_border) / (right_border-left_border);
    svg
      .attr("width", width)
      .attr("height", height);
    projection.translate([width / 2, height / 2]);


    g.selectAll('path')
      .data(world.features)
      .enter().append('path')
        .attr('d', d3.geo.path().projection(projection))
        .attr('id', function(d){return d.properties.adm0_a3})
        .attr('class', function(d) {
          // if (d.properties.juntos == undefined) {
          //   return "visited-none";
          // }
          if (d.properties.juntos == 1) {
            return "visited-juntos";
          }
          else if (d.properties.ceci == 1 && d.properties.claudio == 1) {
            return "visited-separados";
          }
          else if (d.properties.ceci == 1) {
            return "visited-ceci";
          }
          else if (d.properties.claudio == 1) {
            return "visited-claudio";
          }

          return "visited-none";

        })
        .on("click", clicked);
  }
  );



  // http://bl.ocks.org/mbostock/2206590
  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      var bounds = path.bounds(d);
      x = centroid[0];
      y = centroid[1];

      var maxKx, maxKy;
      maxKx = width / Math.abs(bounds[0][0] - bounds[1][0]);
      maxKy = height / Math.abs(bounds[0][1] - bounds[1][1]);
      // k = 4;
      k = Math.min(8,maxKy,maxKx);
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }
}

jQuery(document).ready(function() {
  visited_countries();
});
jQuery(window).resize(function() {
  visited_countries();
});