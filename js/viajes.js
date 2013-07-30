//var texto_prueba = d3.select(".trips-weve-made").append("p").text("Esto está escrito desde javascript");

basepath = "http://localhost/kmc2/wp-content/plugins/kmc2-maps/";

// viajes significa visited countries
var viajes = {};

function visited_countries () {
  var aux, proj;
  var options = [];

  var interval, i, n;

  var currentproj;
  var svg;

  d3.select(".trips-weve-made svg").remove();
  viajes.svg = d3.select(".trips-weve-made").append("svg");

  viajes.width = jQuery(".trips-weve-made svg").width();

  viajes.g = viajes.svg.append("g");

  //var viajes.projection;

  viajes.projection = d3.geo.equirectangular()
    .scale(1)
    .center([0,0])
    .precision(.1);

  viajes.path = d3.geo.path()
      .projection(viajes.projection);

  viajes.data = [];

  d3.json(basepath+'data/viajes.json', function(v) {
    viajes.data.push(v);
    v["points"] = [];
    d3.csv(basepath+'data/'+v["placesFile"])
      .row(function (d) {
        v["points"].push(
          {
            sitio: d.sitio,
            lat: +d.lat,
            lon: +d.lon
          });

      })
      .get(function(error, rows) { console.log(rows); });
  });

  console.log(viajes.data);

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
          coords = viajes.projection(coords);
          var x = coords[0],
              y = coords[1];
          if (x < left_border) left_border = x;
          if (x > right_border) right_border = x;
          if (y > lower_border) lower_border = y;
          if (y < upper_border) upper_border = y;
      });

    }

    // Cambiar escala en función de la anchura de la pantalla
    viajes.projection.scale(viajes.width / (right_border-left_border));
    // Definir altura y centrar
    viajes.height = viajes.width * (lower_border-upper_border) / (right_border-left_border);
    viajes.svg
      .attr("width", viajes.width)
      .attr("height", viajes.height);
    viajes.projection.translate([viajes.width / 2, viajes.height / 2]);
    viajes.aspectratio = viajes.width / viajes.height;


    viajes.g.selectAll('path')
      .data(world.features)
      .enter().append('path')
        .attr('d', d3.geo.path().projection(viajes.projection))
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
  width = viajes.width * viajes.mult;
  height = viajes.height * viajes.mult;

  if (d && viajes.centered !== d) {
    var centroid = viajes.path.centroid(d);
    var bounds = viajes.path.bounds(d);
    x = centroid[0] + (width-viajes.width) / 2;
    y = centroid[1] + (height-viajes.height) / 2;

    var maxKx, maxKy;
    maxKx = width / Math.abs(bounds[0][0] - bounds[1][0]);
    maxKy = height / Math.abs(bounds[0][1] - bounds[1][1]);
    k = Math.min(8,maxKy,maxKx) * viajes.mult;
    viajes.centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1 * viajes.mult;
    viajes.centered = null;
  }

  viajes.g.selectAll("path")
      .classed("active", viajes.centered && function(d) { return d === viajes.centered; });

  var traslacion = "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")";
  
  traslacion += "translate(" + (width-viajes.width) / 2 + "," + (height-viajes.height) / 2 + ")";

  viajes.g.transition()
      .duration(750)
      .attr("transform", traslacion)
      .style("stroke-width", 1.5 / k + "px");

  console.log(traslacion);
}

jQuery(document).ready(function() {
  viajes.mult = 1.0;
  visited_countries();
});
jQuery(window).resize(function() {
  viajes.mult = jQuery(".trips-weve-made svg").width() / viajes.width;
  viajes.svg
    .attr("width", viajes.width*viajes.mult)
    .attr("height", viajes.height*viajes.mult);
  viajes.g.transition()
    .duration(750)
    .attr("transform", "scale(" + viajes.mult + ")");
  //clicked(null);
});