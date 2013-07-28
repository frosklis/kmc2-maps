//var texto_prueba = d3.select(".visited-countries-map").append("p").text("Esto está escrito desde javascript");

basepath = "http://localhost/kmc2/wp-content/plugins/kmc2-maps/";

// vc significa visited countries
var vc = {};

function visited_countries () {
  var aux, proj;
  var options = [];

  var interval, i, n;

  var currentproj;
  var svg;

  d3.select(".visited-countries-map svg").remove();
  vc.svg = d3.select(".visited-countries-map").append("svg");

  vc.width = jQuery(".visited-countries-map svg").width();

  vc.g = vc.svg.append("g");

  //var vc.projection;

  vc.projection = d3.geo.equirectangular()
    .scale(1)
    .center([0,0])
    .precision(.1);

  vc.path = d3.geo.path()
      .projection(vc.projection);

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
          coords = vc.projection(coords);
          var x = coords[0],
              y = coords[1];
          if (x < left_border) left_border = x;
          if (x > right_border) right_border = x;
          if (y > lower_border) lower_border = y;
          if (y < upper_border) upper_border = y;
      });

    }

    // Cambiar escala en función de la anchura de la pantalla
    vc.projection.scale(vc.width / (right_border-left_border));
    // Definir altura y centrar
    vc.height = vc.width * (lower_border-upper_border) / (right_border-left_border);
    vc.svg
      .attr("width", vc.width)
      .attr("height", vc.height);
    vc.projection.translate([vc.width / 2, vc.height / 2]);
    vc.aspectratio = vc.width / vc.height;


    vc.g.selectAll('path')
      .data(world.features)
      .enter().append('path')
        .attr('d', d3.geo.path().projection(vc.projection))
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
}

// http://bl.ocks.org/mbostock/2206590
function clicked(d) {
  var x, y, k;
  var width, height;
  width = vc.width * vc.mult;
  height = vc.height * vc.mult;

  if (d && vc.centered !== d) {
    var centroid = vc.path.centroid(d);
    var bounds = vc.path.bounds(d);
    x = centroid[0] + (width-vc.width) / 2;
    y = centroid[1] + (height-vc.height) / 2;

    var maxKx, maxKy;
    maxKx = width / Math.abs(bounds[0][0] - bounds[1][0]);
    maxKy = height / Math.abs(bounds[0][1] - bounds[1][1]);
    k = Math.min(8,maxKy,maxKx) * vc.mult;
    vc.centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1 * vc.mult;
    vc.centered = null;
  }

  vc.g.selectAll("path")
      .classed("active", vc.centered && function(d) { return d === vc.centered; });

  var traslacion = "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")";
  
  traslacion += "translate(" + (width-vc.width) / 2 + "," + (height-vc.height) / 2 + ")";

  vc.g.transition()
      .duration(750)
      .attr("transform", traslacion)
      .style("stroke-width", 1.5 / k + "px");

  console.log(traslacion);
}

jQuery(document).ready(function() {
  vc.mult = 1.0;
  visited_countries();
});
jQuery(window).resize(function() {
  vc.mult = jQuery(".visited-countries-map svg").width() / vc.width;
  vc.svg
    .attr("width", vc.width*vc.mult)
    .attr("height", vc.height*vc.mult);
  vc.g.transition()
    .duration(750)
    .attr("transform", "scale(" + vc.mult + ")");
  //clicked(null);
});