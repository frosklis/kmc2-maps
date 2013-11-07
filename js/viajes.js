basepath = viajes_vars.basepath;

var vv = {};


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


function viajes () {

  // Cargar los datos
  queue()
    .defer(
      d3.json,
      basepath+'data/viajes.json'
    )
    .awaitAll(viajes_01);
}

function viajes_01(error, datosArr) {
  vv.visited = [];

  vv.data = [];

  var datos = datosArr[0];

  datos.forEach(function(v) {
    v.countries.forEach(function(p){
      if (vv.visited.indexOf(p) == -1) vv.visited.push(p);
    });

    v["points"] = [];
    vv.data.push(v);


    d3.csv(basepath+'data/'+v["placesFile"])
      .row(function (d) {
        v["points"].push(
          {
            sitio: d.sitio,
            lat: +d.lat,
            lon: +d.lon
          });
      })
      .get(function(error, rows) { 
        if (error == null) {
          v["dataExists"] = true;
        } else {
          v["dataExists"] = false;
        }
      });

  });

  // Llamar a viajes_02
  viajes_02();
}

function viajes_02 () {
  var aux, proj;
  var options = [];

  var interval, i, n;

  var currentproj;
  var svg;

  d3.select(".trips-weve-made svg").remove();
  vv.svg = d3.select(".trips-weve-made").append("svg");

  vv.width = jQuery(".trips-weve-made svg").width();

  vv.g = vv.svg.append("g");

  vv.projection = d3.geo.equirectangular()
    .scale(1)
    .center([0,0])
    .precision(.1);

  vv.path = d3.geo.path()
      .projection(vv.projection);

  var left_border = Infinity,
      lower_border = -Infinity,
      right_border = -Infinity,
      upper_border = Infinity;

  d3.json(basepath+'data/world-110m.json', function(world) {
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
        .attr('id', function(d){return d.properties.adm0_a3})
        .attr('class', 'land')
        .attr('d', d3.geo.path().projection(vv.projection))
        .on("click",vv. clicked)
        .on("mouseover", vv.hovered);
  }
  );


  // Dibujar los recorridos
  var intervalo =
        setInterval(function(){
          vv.data.forEach(function (d) {            
            dibujarRecorridos(d.slug, d.points);
            if (d.dataExists != undefined) {
              clearInterval(intervalo);
            } 
          });
        }, 200);
}



vv.hovered = function (d) {
  console.log("pasando por");
  console.log(d);
};
vv.clicked = function (d) {
  var x, y, k;
  var width, height;
  width = vv.width * vv.mult;
  height = vv.height * vv.mult;

  if (d && vv.centered !== d) {
    var centroid = vv.path.centroid(d);
    var bounds = vv.path.bounds(d);
    x = centroid[0] + (width-vv.width) / 2;
    y = centroid[1] + (height-vv.height) / 2;

    var maxKx, maxKy;
    maxKx = width / Math.abs(bounds[0][0] - bounds[1][0]);
    maxKy = height / Math.abs(bounds[0][1] - bounds[1][1]);
    k = Math.min(8,maxKy,maxKx) * vv.mult;
    vv.centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1 * vv.mult;
    vv.centered = null;
  }

  vv.g.selectAll("path")
      .classed("active", vv.centered && function(d) { return d === vv.centered; });

  var traslacion = "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")";
  
  traslacion += "translate(" + (width-vv.width) / 2 + "," + (height-vv.height) / 2 + ")";

  vv.g.transition()
      .duration(750)
      .attr("transform", traslacion);


  vv.g.selectAll(".route")
      .transition()
        .duration(750)
        .style("stroke-width", 1 / k + "px");

  // console.log(traslacion);
};


function dibujarRecorridos(name, data) {
  console.log("Dibujar recorridos");
  console.log(name);
  console.log(data);

  var g = vv.g.append("g")
    .attr("id", name)
    .attr("class","viaje");


  var route = {
    type: "LineString",
    coordinates: []
  }

  for(i=0;i<data.length;i++) {
    route.coordinates.push([data[i].lon, data[i].lat]);
  }  console.log(g);
  g.append("path")
    .datum(route)
    .attr("class", "route")
    .attr("d", vv.path);

}