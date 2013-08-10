//var texto_prueba = d3.select(".trips-weve-made").append("p").text("Esto está escrito desde javascript");

basepath = "http://localhost/kmc2/wp-content/plugins/kmc2-maps/";

var vv = {};

function viajes () {

  // Cargar los datos
  queue()
    .defer(
      d3.json,
      basepath+'data/viajes.json'
    )
    .awaitAll(cargarDatos);

  var aux, proj;
  var options = [];

  var interval, i, n;

  var currentproj;
  var svg;

  d3.select(".trips-weve-made svg").remove();
  vv.svg = d3.select(".trips-weve-made").append("svg");

  vv.width = jQuery(".trips-weve-made svg").width();

  vv.g = vv.svg.append("g");

  //var vv.projection;

  vv.projection = d3.geo.equirectangular()
    .scale(1)
    .center([0,0])
    .precision(.1);

  vv.path = d3.geo.path()
      .projection(vv.projection);

  vv.data = [];


  var left_border = Infinity,
      lower_border = -Infinity,
      right_border = -Infinity,
      upper_border = Infinity;

  d3.json(basepath+'data/world.json', function(world) {
    // Añadir propiedades
    for(j=0; j<world.features.length; j++) {
      d3.geo.bounds(world.features[j]).forEach(function(coords) {
          coords = vv.projection(coords);
          var x = coords[0],
              y = coords[1];
          if (x < left_border) left_border = x;
          if (x > right_border) right_border = x;
          if (y > lower_border) lower_border = y;
          if (y < upper_border) upper_border = y;
      });

    }

    // Cambiar escala en función de la anchura de la pantalla
    vv.projection.scale(vv.width / (right_border-left_border));
    // Definir altura y centrar
    vv.height = vv.width * (lower_border-upper_border) / (right_border-left_border);
    vv.svg
      .attr("width", vv.width)
      .attr("height", vv.height);
    vv.projection.translate([vv.width / 2, vv.height / 2]);
    vv.aspectratio = vv.width / vv.height;


    vv.g.selectAll('path')
      .data(world.features)
      .enter().append('path')
        .attr('d', d3.geo.path().projection(vv.projection))
        .attr('id', function(d){return d.properties.adm0_a3})
        .attr('class', 'land')
        .on("click", clicked)
        .on("mouseover", hovered);
  }
  );
}

function hovered(d) {
  console.log("pasando por");
  console.log(d);
}
function clicked(d) {
  console.log(d);
}

jQuery(document).ready(function() {
  vv.mult = 1.0;
  viajes();
});
jQuery(window).resize(function() {
  vv.mult = jQuery(".trips-weve-made svg").width() / vv.width;
  vv.svg
    .attr("width", vv.width*vv.mult)
    .attr("height", vv.height*vv.mult);
  vv.g.transition()
    .duration(750)
    .attr("transform", "scale(" + vv.mult + ")");
  //clicked(null);
});


function cargarDatos(error, datosArr) {
    console.log("datosArr");
    console.log(datosArr);

    vv.visited = [];

    var datos = datosArr[0];
    datos.forEach(function(v) {
      v.countries.forEach(function(p){
        if (vv.visited.indexOf(p) == -1) vv.visited.push(p);
      });
      v["points"] = [];
      vv.data.push(v);
      queue()
        .defer(
          d3.csv,
          basepath+'data/'+v["placesFile"],
          function (d) {
            console.log("un puntín");
            v["points"].push(
              {
                sitio: d.sitio,
                lat: +d.lat,
                lon: +d.lon
              });
          }
        )
        .awaitAll(function(error, data) {
          dibujarRecorridos(v["name"],v["points"]);
        });
    });
}
function dibujarRecorridos(name, data) {
  console.log("Dibujar recorridos");
  console.log(name);
  console.log(data);

  var g = vv.svg.append("g")
    .attr("class","viaje");


  var route = {
    type: "LineString",
    coordinates: []
  }

  for(i=0;i<data.length;i++) {
    route.coordinates.push([data[i].lon, data[i].lat]);
  }

  console.log(g);
  g.append("path")
    .datum(route)
    .attr("class", "route")
    .attr("d", vv.path);

}