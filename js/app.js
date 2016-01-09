/**
 * Created by Vlad on 09.01.2016.
 */
(function($){
    /**e
     * Bla bla
     * @private
     */
    function _ui() {
        this.showTooltip = function (relativeElement) {
            console.log(relativeElement.offsetLeft,relativeElement.offsetTop);
            var tpl = "<div data-type=\"ui-tooltip\"><p>I'm tooltip</p></div>",
                elBody = $('body');
            elBody.append($(tpl));
            elBody.find('[data-type="ui-tooltip"]')
                .css({
                    'left': relativeElement.offsetLeft,
                    'top': (relativeElement.offsetTop - relativeElement.outerHeight()),//maybe need to add somecentring
                    'position': 'fixed'
                });
        };
        /**
         * @param tooltip
         */
        this.hideTooltip = function (tooltip) {
            if (tooltip !== undefined && typeof tooltip === "object") {
                tooltip.remove();
                return true;
            } else {
                $('body').find('[data-type="ui-tooltip"]')
                    .remove();
            }
        }
    }

    var appEvents = {},
        evnt = {marker: {hover: 'app.event.marker.hover', 'leave': 'app.event.marker.leave'}},
        ui = (new function () {

        }).prototype = new _ui();

    $(appEvents).on(evnt.marker.hover, function (event, data) {
        console.log(data);
        ui.showTooltip($('#' + data.element.id));
    });
    $(appEvents).on(evnt.marker['leave'], function (event, data) {
        ui.hideTooltip();
    });
    $(function(){
        var lat=34.070;
        var lon=-118.73;
        var zoom=5;
        var map;
        var points = {};

        $("a#submitMarkerForm").on("click", function(e){
            var nameSelector = $("#markerName");
            var name = nameSelector.val();
            if (name !== "") {
                nameSelector.val("");
                var position = new OpenLayers.Geometry.Point(lon, lat);
                var markerVector = new OpenLayers.Feature.Vector(position, { tooltip: name, title: name });
                points[name] = markerVector;
                marker.addFeatures([
                    markerVector
                ]);


                var mainLink = $("<a>").text(name).addClass("editLink");
                mainLink.on("click", function(e) {
                    var template = $("div.editMarkerTemplate").html();
                    $("div.editMarkerBlock").html(template.replace("%s", name));
                });

                var deleteLink = $("<a>").text(" X ").addClass("deleteLink");
                deleteLink.on("click", function(e) {
                    e.preventDefault();
                    var id = $(this).parent().attr("data-vector-id");
                    marker.removeFeatures([marker.getFeatureById(id)]);
                    $(this).parent().remove();
                });

                $("ul.pointsList").append($("<li>").attr("data-vector-id", markerVector.id).append(mainLink).append(deleteLink));


            } else {
                e.preventDefault();
            }
        });



        var marker = new OpenLayers.Layer.Vector("Marker", {
            styleMap: new OpenLayers.StyleMap({
                externalGraphic: "img/marker.png",
                graphicWidth: 50,
                graphicHeight: 50,
                graphicYOffset: -50
            })
        });

        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single' : true,
                'double' : false,
                'pixelTolerance' : 0,
                'stopSingle' : false,
                'stopDouble' : false
            },
            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.handler = new OpenLayers.Handler.Click(this, {
                        'click': this.trigger
                    },
                    this.handlerOptions
                );
            },
            trigger: function(pos) {
                var lonLat = map.getLonLatFromPixel(pos.xy);
                click.deactivate();
                var popupLink = $("a[href='#addMarkerPopup']");
                $("div#map").css('cursor', 'default');
                lat = lonLat.lat;
                lon = lonLat.lon;
                popupLink.click();
            }
        });
        var click = new OpenLayers.Control.Click();

        var addMarkerAction = function() {
            $("div#map").css('cursor', 'crosshair');
            click.activate();
        };

        function init(){
            var tooltipPopup = $("div#tooltipPopup");
            map = new OpenLayers.Map ({
                div: "map",
                projection: "EPSG:3857",
                /*eventListeners: {
                 featureover: function(e) {
                 console.log("featureover: " + e.feature.attributes.title)
                 },
                 featureout: function(e) {
                 console.log("featureout: " + e.feature.attributes.title)
                 },
                 featureclick: function(e) {
                 console.log("featureclick: " + e.feature.attributes.title)
                 }
                 }*/
            });

            var panel = new OpenLayers.Control.Panel({
                displayClass: 'custom-panel'
            });
            map.addControl(panel);

            var addMarkerControl = new OpenLayers.Control.Button({
                displayClass: 'addMarkerControl',
                trigger: addMarkerAction,
                type: OpenLayers.Control.TYPE_BUTTON
            });

            panel.addControls([addMarkerControl]);

            $('div.addMarkerControlItemInactive').append($('<p/>').addClass("buttonInnerText").text('Add marker'));

            var drag = new OpenLayers.Control.DragFeature(marker, {
                autoActivate: true,
                onComplete: function() {
                    //alert("Hello");
                }
            });
            map.addControl(drag);

            map.addLayers([new OpenLayers.Layer.OSM(), marker]); //OSM base map
            var lonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
            map.setCenter (lonLat, zoom);
            map.addControl(click);

        }

        var position = function getCurrentLocation() {
            if (navigator.geolocation) { // success
                navigator.geolocation.getCurrentPosition(
                    function(data) {
                        lat = data.coords.latitude;
                        lon = data.coords.longitude;
                        zoom = 15;
                        init();
                    },
                    function(error) { // error
                        console.log("Error! ", error);
                        init();
                    },
                    { // options
                        enableHighAccuracy : true,
                        timeout : 5000,
                        maximumAge : 0
                    }
                );
            }
        };
        position();
    });
})(jQuery);