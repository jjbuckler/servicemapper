var tItem;
var printList;
var services=[];
var serviceTxt;
var identifyTask;
var lgdRequestHandle;
var app=[];
var flags ={};
var title;
var pntLayer;
var lyrTitle;
var unitsName;
var varID;
require([
  "dojo/dom",
"dojo/query",	
  "dojo/on" ,
  "dojo/dom-construct", 
  "dojo/_base/lang",
"dojo/_base/array",
  "dojo/on", 
  "dojo/dom-class",
  "dojo/_base/json", 
  "dojo/_base/array",
  "dojo/string", 
  "esri/request", 
  "dojo/parser",
  "dijit/layout/AccordionContainer", 
  "dijit/TitlePane", 
  "dijit/form/CheckBox", 
  "dijit/Menu",
	"dijit/layout/LinkPane",
  "dijit/MenuItem",
  "dijit/form/DropDownButton",
  "dijit/DropDownMenu",
  "dojox/grid/DataGrid", 
	"dojox/grid/EnhancedGrid",
  "dojox/layout/ContentPane",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",
  "dojo/data/ItemFileReadStore",
  "dojo/data/ItemFileWriteStore",
	"dojo/Deferred",
  "dojo/request",
  "esri/map",
  "esri/dijit/Scalebar",
	 "esri/dijit/Legend",
  "esri/geometry/Extent",
  "esri/tasks/identify",
  "esri/dijit/Print",
  "esri/tasks/PrintTask", 
  "esri/tasks/PrintTemplate", 
	 "esri/dijit/InfoWindow",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/layers/FeatureLayer",
    "esri/InfoTemplate",
		"dijit/layout/TabContainer",
		 "esri/tasks/identify",
		 "esri/request",
		 "dojox/layout/FloatingPane",
		 "dijit/form/ComboBox",
		 "dojo/request/xhr",
  "dojo/domReady!"
 ],
   function(dom, query,  on,  domConstruct, lang,arrayUtils, on, domClass, dojoJson, array, dojoString, esriRequest, parser, AccordionContainer, TitlePane, CheckBox, Menu, LinkPane, MenuItem,
	DropDownButton, DropDownMenu, DataGrid, EnhancedGrid,ContentPane, Memory, ObjectStore, ItemFileReadStore, ItemFileWriteStore, Deferred, request, map, Scalebar, Legend, Extent, Identify, Print, 
	PrintTask, PrintTemplate,InfoWindow,SimpleMarkerSymbol, SimpleLineSymbol, FeatureLayer, InfoTemplate,TabContainer,identify,esriRquest,FloatingPane,ComboBox,xhr){
		var node
		parser.parse();
			var ext = new esri.geometry.Extent({
			"xmin" : -2500000,
			"ymin" : 130000,
			"xmax" : 2400000,
			"ymax" : 3700000,
			"spatialReference" : {
				"wkid" : 102039
			}
		});
var infoWindow = new esri.dijit.InfoWindow({
			anchor : esri.dijit.InfoWindow.ANCHOR_LOWERRIGHT
		}, dojo.create("div"));

	infoWindow.startup();
 var template = new InfoTemplate();

    //  template.setContent(getTextContent);
	app.map = new esri.Map("map", {
			extent : ext,
			sliderStyle : "small",
			showAttribution : false,
			logo : false,
			navigationMode : "classic"
		});
		
					 var legendDijit = new Legend({
            map: app.map
          }, "legendDiv");
          legendDijit.startup();
					
					//var legendDijit
					 app.map.on("layer-add", function (evt) {
					 console.log("here");
      });

        
    
						app.tiled = new esri.layers.ArcGISTiledMapServiceLayer("http://gis.ers.usda.gov/arcgis/rest/services/background_cache/MapServer", {
				"id" : "background"
			});
			app.map.addLayer(app.tiled);
		

				   var lcomboBox = new ComboBox({
        id: "layerSelect",
        name: "layers",
				value:"--select--",
				style:{width:"450px"}
    }, "layerSelect")
		
		
		lcomboBox.on("change", function(event){
		//console.log(event);
		var id = lcomboBox.item.id;
		app.varName = lcomboBox.value;
		console.log(app.varName)
		sName= dijit.byId("serviceSelect").item.name;
		      var featureLayer = new FeatureLayer("http://gis.ers.usda.gov/arcgis/rest/services/" + sName + "/MapServer/" + id, {
					id:"flayer",
          mode: FeatureLayer.MODE_SNAPSHOT,
          outFields: ["*"],
          infoTemplate: template
        });
              template.setTitle("<b>${County},${State}</b>");
     
      template.setContent(app.varName + ": ${LACCESS_POP10}");
				console.log(app.map.graphicsLayerIds);
				console.log(app.map.layerIds);
			//	console.log(app.map.getGraphicLayer("flayer"));
				if(app.map.graphicsLayerIds.indexOf("flayer")==-1){
					app.map.addLayer(featureLayer,{"id": "flayer"});
					dijit.byId("legendDiv").refresh();
				}
				else{
		app.map.removeLayer(app.map.getLayer("flayer"))
		app.map.addLayer(featureLayer,{"id": "flayer"});
			//legendDijit.refresh();
		}
		});
		lcomboBox.startup();
		
		
		
		
app.services = {items:[]}
    var serviceRequest = esri.request({
  url: "http://gis.ers.usda.gov/arcgis/rest/services",
  content: { f: "json" },
  handleAs: "json",
  callbackParamName: "callback"
});
serviceRequest.then(
  function(response) {
	
  	 for (var l=0, im=response.services.length; l<im; l++){
		// console.log(response.services[l].name);
//app.services.push(response.services[l].name);
if(response.services[l].name!="background_cache"){
  app.services.items.push(lang.mixin({id: response.services[l].id}, lang.mixin({name: response.services[l].name})));
	}
	}
	    		 var stateStore = new Memory({
        data: app.services
    }); 

      var comboBox = new ComboBox({
        id: "serviceSelect",
        name: "services",
				value:"select service",
        store: stateStore
    }, "serviceSelect");
		
		comboBox.on("change",function(){
		
		app.layers = {items:[]}
    var layersRequest = esri.request({
  url: "http://gis.ers.usda.gov/arcgis/rest/services/" + this.value + "/MapServer",
  content: { f: "json" },
  handleAs: "json",
  callbackParamName: "callback"
});
		layersRequest.then(function(response){
//		console.log(response);
for (var l=0, im=response.layers.length; l<im; l++){
	 app.layers.items.push(lang.mixin({id: response.layers[l].id}, lang.mixin({name: response.layers[l].name})));
}		
		 var layerStore = new Memory({
        data: app.layers
    }); 
		var box = dijit.byId("layerSelect");
		box.store.close;
		box.value="select layer"
box.store=layerStore;
   
		}, function(error) {
		console.log("Error: ", error.message);
		});
		
		
		});
		comboBox.startup();
 // console.log(response)

	
}, function(error) {
    console.log("Error: ", error.message);
});

});