./lib/leaflet.markercluster.js:
	git clone git@github.com:Leaflet/Leaflet.markercluster.git
	cat Leaflet.markercluster/dist/*.css > ./less/markercluster.less
	mv Leaflet.markercluster/dist/leaflet.markercluster.js ./lib

clean:
	rm -rf Leaflet.markercluster/