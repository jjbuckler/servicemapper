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
  "esri/geometry/Extent",
  "esri/tasks/identify",
  "esri/dijit/Print",
  "esri/tasks/PrintTask", 
  "esri/tasks/PrintTemplate", 
	 "esri/dijit/InfoWindow",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
		"dijit/layout/TabContainer",
		 "esri/tasks/identify",
		 "esri/request",
		 "dojox/layout/FloatingPane",
		 "dojo/request/xhr",
  "dojo/domReady!"
 ],
   function(dom, query,  on,  domConstruct, lang, on, domClass, dojoJson, array, dojoString, esriRequest, parser, AccordionContainer, TitlePane, CheckBox, Menu, LinkPane, MenuItem,
	DropDownButton, DropDownMenu, DataGrid, EnhancedGrid,ContentPane, Memory, ObjectStore, ItemFileReadStore, ItemFileWriteStore, Deferred, request, map, Scalebar, Extent, Identify, Print, 
	PrintTask, PrintTemplate,InfoWindow,SimpleMarkerSymbol, SimpleLineSymbol, TabContainer,identify,esriRquest,FloatingPane, xhr){
		var node
		
		
				/*	 var infoWindow = new esri.dijit.InfoWindow({
															anchor: esri.dijit.InfoWindow.ANCHOR_LOWERRIGHT
															}, dojo.create("div"));
          
													 
						infoWindow.startup(); 
				
					app.map = new esri.Map("map", {   
								sliderStyle: "small",
								showAttribution: false,
								logo: false
					}); */
			/*get the main service list	*/	
			//esriConfig.defaults.io.alwaysUseProxy = true;
		//esri.config.defaults.io.proxyUrl = "http://gis.ers.usda.gov/DotNet/proxy.ashx"
	/*				  var servicesRequest = 
		esriRequest({
      "url": "http://gis.ers.usda.gov/arcgis/rest/services",
      "content": {
        "f": "json"
      },
      "callbackParamName": "callback"
    });
    		servicesRequest.then(main_servicesSucceeded, main_servicesFailed); */
    var layersRequest = esri.request({
  url: "http://gis.ers.usda.gov/arcgis/rest/services",
  content: { f: "json" },
  handleAs: "json",
  callbackParamName: "callback"
});
layersRequest.then(
  function(response) {
    console.log("Success: ", response);
}, function(error) {
    console.log("Error: ", error.message);
});
    
		
		
		
	});