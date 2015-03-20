var tItem;
var printList;
var services = [];
var serviceTxt;
var identifyTask;
var lgdRequestHandle;
var app = [];
var title;
var pntLayer;
var lyrTitle;
var unitsName;
var varID;
require([
'dgrid/OnDemandGrid',
'dojo/store/Memory',
"dgrid/extensions/ColumnHider",
"dgrid/extensions/DijitRegistry",
"dgrid/Selection",
"dgrid/CellSelection",
"dojo/_base/declare",
"dgrid/selector",
"dojo/dom",
"dojo/promise/all",
"dojo/query",
"dojo/on",
"dojo/dom-construct",
"dojo/_base/lang",
"dojo/on",
"dojo/dom-class",
"dojo/_base/json",
"dojo/_base/array",
"dojo/string",
"esri/request",
"dojo/aspect",
"dojo/parser",
"dijit/layout/AccordionContainer",
"dijit/TitlePane",
"dijit/form/CheckBox",
"dijit/Menu",
"dijit/layout/LinkPane",
"dijit/MenuItem",
"dijit/form/DropDownButton",
"dijit/form/Button",
"dijit/DropDownMenu",
"dojox/grid/DataGrid",
"dojox/layout/ContentPane",
"dojo/data/ObjectStore",
"dojo/data/ItemFileReadStore",
"dojo/Deferred",
"esri/map",
"esri/config",
"esri/dijit/Scalebar",
"esri/geometry/Extent",
"esri/tasks/identify",
"esri/tasks/PrintTask",
"esri/tasks/PrintTemplate",
"esri/tasks/query",
"esri/dijit/InfoWindow",
"esri/layers/FeatureLayer",
"esri/symbols/SimpleMarkerSymbol",
"esri/symbols/SimpleLineSymbol",
"esri/symbols/SimpleFillSymbol",
"esri/renderers/SimpleRenderer",
"esri/Color",
"esri/tasks/identify",
"dojox/layout/FloatingPane",
"dojo/request/xhr",
"scripts/CloseableAccordionContainer.js",
"dojo/domReady!"
],
function (OnDemandGrid, Memory, ColumnHider, DijitRegistry, Selection, CellSelection, declare, selector, dom, all, query, on, domConstruct, lang, on, domClass, dojoJson, array, dojoString, esriRequest, aspect, parser, AccordionContainer, TitlePane, CheckBox, Menu, LinkPane, MenuItem,
DropDownButton, Button, DropDownMenu, DataGrid, ContentPane, ObjectStore, ItemFileReadStore, Deferred, map, esriConfig, Scalebar, Extent, Identify,
PrintTask, PrintTemplate, Query, InfoWindow, FeatureLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer, Color, identify, FloatingPane, xhr, CloseableAccordionContainer) {
var node, clicked, xCoord, yCoord;
parser.parse();
var appconfig = getUrlVars()["config"];
//var second = getUrlVars()["page"];
/******GETS THE SERVICES AND OTHER APP INFO FROM THE JSON ************************************/
xhr("main_app_config_test.txt", {
handleAs : "json",
sync : true,
timeout : 1500,
error : function (response, ioArgs) {
alert("Unable to find servers or configuration file. Please try again later");
}
}).then(function (data) {
app.serviceSource = data.general.servSource;
app.lSource = data.general.lSource;
app.proxyServer = data.general.proxyServ;
app.ref = new esri.layers.ArcGISDynamicMapServiceLayer(data.general.refServ, {
"id" : "reference"
});
app.zoomSt = new FeatureLayer(data.general.refServ + "/1", {
mode : FeatureLayer.MODE_SELECTION,
outFields : ["STATE_NAME"]
});
app.zoomCvr = new FeatureLayer(data.general.refServ + "/1", {
mode : FeatureLayer.MODE_SNAPSHOT,
outFields : ["STATE_NAME"]
});
app.tiled = new esri.layers.ArcGISTiledMapServiceLayer(data.general.backServ, {
"id" : "background"
});
//"rural_atlas_config.txt
appconfig_file= "sub_app_config.txt" //appconfig + ".txt";
xhr(appconfig_file, {
handleAs : "json",
sync : true,
timeout : 1500,
error : function (response, ioArgs) {
alert("Unable to find servers or configuration file. Please try again later");
}
}).then(function (data) {
var x;
var appvars=[];
for (x in data){
//if(data[appconfig]){
if(x== appconfig){
console.log(x);
appvars=data[x];
console.log(appvars);
}
// console.log(data[i]);
// }

}
app.MapServices = appvars.services;
app.svcAddress = appvars.servStart;
app.stateZoom = appvars.stateZoom;
app.initialService = appvars.servStart;
app.SelLayerIndex = appvars.layerStart;
app.initialLayerName = appvars.titleStart;
})
})

Array.prototype.move = function (from, to) {
this.splice(to, 0, this.splice(from, 1)[0]);
};
/*****************************************************************************************/

app.Services = [];

esri.config.defaults.io.proxyUrl = app.proxyServer;

esri.config.defaults.io.alwaysUseProxy = false;
//serviceTxt="cropsplants"; //this variable is no longer needed.
// app.svcAddress="ra_people";

var printTemplate = ["png", "landscape", "portrait"];

var ext = new esri.geometry.Extent({
"xmin" : -2500000,
"ymin" : 130000,
"xmax" : 2400000,
"ymax" : 3700000,
"spatialReference" : {
"wkid" : 102039
}
});

var x = document.getElementById("mask");

var y = document.getElementById("maskToggle");

y.checked = false;

/***********************Content Panes for the ID Box *****************************************/
var cp1 = new ContentPane({
id : "valuecp",
style : "background-color: #f6f3e7 !important; font: 10px Segoe UI; overflow:hidden"
});

var cp2 = new ContentPane({
title : "County Information",
id : "parcelTab",
style : "background-color: white; height:100px; font: 10px Segoe UI; overflow:auto"
});

var cp3 = new ContentPane({
id : "Dtext",
style : "background-color: #f6f3e7 !important; #DDDDDD;font:9px; font-weight:bold; Segoe UI; overflow:hidden"
});
/**********************************************************************************************/
/***opening and closing classes for the Layer Tool *************************/
dijit.byId("tPane").on("click", function () {
infoWindow.hide(); // Added this line in, to remove the ID box when someone clicks on the layer chooser box
app.map.isScrollWheelZoom = true;
if (!dijit.byId("tPane").open) {
dijit.byId("tPane").set("class", "tPaneClosed");
} else {
dijit.byId("tPane").set("class", "tPaneOpened");
}
});

/*******************************************************************/
var infoWindow = new esri.dijit.InfoWindow({
anchor : esri.dijit.InfoWindow.ANCHOR_LOWERRIGHT
}, dojo.create("div"));

infoWindow.startup();

app.map = new esri.Map("map", {
extent : ext,
infoWindow : infoWindow,
sliderStyle : "small",
showAttribution : false,
logo : false,
navigationMode : "classic"
});

/************************************************* setting up Zoom ************************************/

if (app.stateZoom == "true") {
var renderer = new SimpleRenderer(
new SimpleFillSymbol("solid", null, new Color([255, 30, 255, 0.0]))
);
app.zoomSt.setRenderer(renderer);
renderer2 = new SimpleRenderer(new SimpleFillSymbol("solid", null, new Color([255, 255, 255, 0.7])));
app.zoomCvr.setRenderer(renderer);
var stateArray = [];
app.zoomSt.on("load", function (evt) {
var query = new Query();
query.where = "1=1";
evt.layer.queryFeatures(query, function (featureSet) {
var items = array.map(featureSet.features, function (feature) {
return feature.attributes;
});
for (var i = 0; i < items.length; i++) {
stateArray.push(items[i].STATE_NAME);
}
stateArray.sort();
var menuZ = new DropDownMenu({
style : "display: none;"
});
var menuItemsZ = [];
for (var p = 0; p < stateArray.length; p++) {
var nameSt = stateArray[p];
menuItemsZ[p] = new MenuItem({
label : stateArray[p],
onClick : function (e) {
app.selectedState = (this.label);
setDefinition(this.label);
zoomRow(this.label);
getCheckBox()
}
})
menuZ.addChild(menuItemsZ[p]);
}
menuZ.startup();
var buttonZ = new dijit.form.DropDownButton({
id : "zoombtn",
label : "State Zoom",
dropDown : menuZ
});
buttonZ.on('mouseout', function () {
menuZ.hide;
})
buttonZ.startup();
dom.byId("zoom").appendChild(buttonZ.domNode);
});
});
}
// this line can be added to config file setup


/*******************************************************************************************************************/

dojo.place(infoWindow.domNode, app.map.root);

app.map.infoWindow.on("hide", function () {
app.map.graphics.clear();
app.map.enableScrollWheelZoom();
});
app.map.infoWindow.on("show", function () {
app.map.disableScrollWheelZoom();
});

infoWindow.addChild(cp1);

infoWindow.addChild(cp2);

infoWindow.addChild(cp3);

/* function to help with rounding */
fixedTo = function (number, n) {
var k = Math.pow(10, n + 1);
return (Math.round(number * k) / k);
}

app.map.infoWindow.on("show", function () {
if (navigator.appName == "Netscape" && !(navigator.msSaveBlob)) {
app.map.infoWindow.resize(380, 215)
} else if (navigator.appName == "Microsoft Internet Explorer") {
app.map.infoWindow.resize(380, 217)
} else {
app.map.infoWindow.resize(380, 218)
}
infoWindow.startupDijits();
});

app.map.on("click", doIdentify);

app.svcName = app.svcAddress //"fa_access"; //setting initial service name, used for ID box

app.layerSource = app.serviceSource + app.initialService + "/MapServer";

app.svcNameC = "Crops and Plants";

app.mlayer = new esri.layers.ArcGISDynamicMapServiceLayer(app.layerSource, {
"id" : "currentLayer"
});

app.mlayer.setVisibleLayers([app.SelLayerIndex]);

app.map.addLayer(app.tiled);

app.map.addLayer(app.mlayer);

app.map.addLayer(app.ref);

app.map.addLayer(app.zoomSt);

getLegend(app.initialService, app.SelLayerIndex);

identifyTask = new esri.tasks.IdentifyTask(app.mlayer.url);

identifyParams = new esri.tasks.IdentifyParameters();
// app.map.infoWindow.resize(400, 720);
symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color("yellow"), 3)

imgVis = dojo.byId("imgVisibility");

loading = dojo.byId("loadingImg");

lProg = dojo.byId("loadProg");

pProg = dojo.byId("prntProg");

app.map.on("update-start", function () {
showLoading();
});

app.map.on("update-end", function () {
hideLoading();
})

app.map.on("click", function () {
dijit.byId("printbtn").set('open', false);
});

app.map.on("pan", function () {
dijit.byId("tPane").set("class", "tPaneClosed");
dijit.byId("tPane").set('open', false);

});

app.map.on("zoom-start", function () {
dijit.byId("tPane").set("class", "tPaneClosed");
dijit.byId("tPane").set('open', false);
});

headerTitle = dom.byId("title");

headerTitle.innerHTML = app.initialLayerName; //"Acres of Corn Harvested for Grain as Percent of Harvested Cropland Acreage: 2012";
/* the code for extents for (Alaska, Hawaii) can be gotten from foodatlas4_dm*/
/*

*/
on(dom.byId("US"), 'click', function () {
app.map.setExtent(new esri.geometry.Extent({
"xmin" : -2400000,
"ymin" : 158493,
"xmax" : 2200000,
"ymax" : 3500000,
"spatialReference" : {
"wkid" : 102039
}
}));
});

var k = -1;
/* this is the code to generate the layertool */
/*********************************************/

loadLayers();

function getUrlVars() {
var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
vars[key] = value;
});
return vars;
}

function infoFailed(response, io) {}

function servicesFailed(response, io) {
dojoJson.toJsonIndentStr = " ";
}

/* The function below gathers all of the services to be
added to the layer tool. Its pulls the information from the
config file. It creates each rest call, adds the to the array
then puts the array into the promise object, and then sent.
The response that's returned contains ALL of the responses
*/


function loadLayers2(){
var promises2;
var req2 = [];
app.count = 0
for (var l = 0, im = app.MapServices.length; l < im; l++) {
var requestHandle2 = esriRequest({
"url" : app.lSource + app.MapServices[l] + "/MapServer/layers",
"content" : {
"f" : "json",
"svc" : app.MapServices[l]
},
"callbackParamName" : "callback"
});
req2.push(requestHandle2);
}
promises2 = all(req2)
promises2.then(requestSucceeded, requestFailed)
}

function loadLayers(services) {
var promises;
var req = [];
app.count = 0
for (var l = 0, im = app.MapServices.length; l < im; l++) {
var requestHandle = esriRequest({
"url" : app.lSource + app.MapServices[l] + "/MapServer",
"content" : {
"f" : "json",
"svc" : app.MapServices[l]
},
"callbackParamName" : "callback"
});
req.push(requestHandle);
}
promises = all(req)
promises.then(requestSucceeded2, requestFailed)
}

function getLegend(serviceName, selectLayer) {
urlNew = app.serviceSource + serviceName + "/MapServer/" // url base used to get json request for units, and for legend
unitRequestHandle = esriRequest({ // Added a new request handle, to get the units information stored in "copyrightText"
"url" : urlNew + selectLayer, //tItem[0].id ,
"content" : {
"f" : "json"
},
"callbackParamName" : "callback"
});
unitRequestHandle.then(unitRequestSucceeded, requestFailed);
lgdRequestHandle = esriRequest({ // the legend request handle is recreated here as well
"url" : urlNew + "legend",
"content" : {
"f" : "json"
},
"callbackParamName" : "callback"
});
lgdRequestHandle.then(lgdRequestSucceeded, requestFailed);
}

/*BUILD THE LAYER LIST */
/*****************************************************************************************************************/


function requestSucceeded2(response) {
app.serviceTitles=[]
for (var t = 0; t < response.length; t++) {
app.serviceTitles.push(response[t].documentInfo.Title.replace("ERS Food Environment Atlas: ",""))
}
loadLayers2();
}
// John, Is this script still used?

function requestSucceeded(response) {
app.layerJSON= response;
var tpaneIndex;
for (var x = 0; x < app.layerJSON.length; x++) {
app.layerJSON[x].mapName = app.serviceTitles[x]; //This just makes sure that the map name is something other than "Layers"
var title = app.serviceTitles[x]//app.layerJSON[x].mapName; //response[x].documentInfo.Title.replace("ERS Food Environment Atlas: ","") //may need to make this more generic
var tp = new TitlePane({
id : app.MapServices[x] + ":" + x,
title : title,
open : true
});
tp.set("class", "cPane");
tp.on("click", function () {
var curTpane = this.id;
// console.log(curTpane);
dojo.query(".cPane").forEach(function (node, index, arr) {
if (node.id != curTpane) {
dijit.byId(node.id).set('open', false);
}
});

app.svcNameC = curTpane.slice(0,(curTpane.indexOf(":"))) // keeping the long service name for ID box, used when clicking on layer chooser
var svcName = curTpane.slice(0,(curTpane.indexOf(":"))) //app.layerJSON.mapName;
tpaneIndex = curTpane.slice((curTpane.indexOf(":")+1));
//console.log(tpaneIndex);
//console.log(svcName);
if (svcName.indexOf(" and ") > -1) {
var svcName = svcName.replace(" and ", "")
}
app.svcAddress = svcName.trim();
updateService(app.svcAddress);
});
tp.startup();
tp.placeAt("tPane");
var node = domConstruct.create("div");
var lyrs;
var fieldInfo,
pad;
pad = dojoString.pad;
var aContainer = new nass.CloseableAccordionContainer({
title : "",
id : "ac" + app.layerJSON[x].mapName + Math.random()
}, node);
aContainer.set("class", "accordContainer");
var lyrnames = []
for (i = 0; i < (app.layerJSON[x].layers.length); i++) {
if (app.layerJSON[x].layers[i].parentLayer === null) {
//console.log(app.layerJSON[x].layers[i])
if (!app.layerJSON[x].layers[i].subLayers === null) {
var lyrnames = []
for (j = 0; j < (app.layerJSON[x].layers[i].subLayerIds.length); j++) {
console.log("now");
//lyrnames.items.push(lang.mixin({id: app.layerJSON[x].layers[i].subLayerIds[j]}, lang.mixin({name: "Payments Received from Conservation Reserve, Wetlands Reserve, Farmable Wetlands and Conservation Reserve Enhancement Programs, Average per Farm: 2012"})));
lyrnames.items.push(lang.mixin({
id : app.layerJSON[x].layers[i].subLayerIds[j]
}, lang.mixin({
name : app.layerJSON[x].layers[app.layerJSON[x].layers[i].subLayerIds[j]].name
})
));

}
var layout = [{
'field' : 'name',
'label' : 'Name',
},
];
var lyrnamesStore = new Memory({
data : lyrnames
})
grid = new(declare([OnDemandGrid, Selection, DijitRegistry]))({
id : app.layerJSON[x].mapName + "grid" + i + Math.random(),
store : lyrnamesStore,
columns : layout,
selectionMode : "single",
deselectOnRefresh : false,
keepScrollPosition : true,
allowSelectAll : false,
loadingMessage : "Loading data...",
noDataMessage : "No results found."
}, dojo.create("div"));
grid.set("class", "dgrid");
if (app.layerJSON[x].mapName == app.svcAddress) {
grid.select(app.SelLayerIndex);
}
grid.set("class", "dgrid");
/* this is the important bit from for the DGRID. The new event is dgrid-select (vs just click) */
//************************************************************************************************//
grid.on("dgrid-select", function (event) {
tItem = []
var curId = this.id;
app.SelLayerIndex = "";
dojo.query(".dgrid").forEach(function (node, index, arr) {
console.log(node);
if (node.id != curId) {
dijit.byId(node.id).clearSelection();
}
});

tItem = event.rows;
headerTitle.innerHTML = tItem[0].data.name; // the actual data is in tItem[x].data
app.SelLayerIndex = tItem[0].data.id; // the actual data is in tItem[x].data
//console.log(app.SelLayerIndex);
//NEW LAYER CODE//
app.map.removeLayer(app.map.getLayer("currentLayer"));
app.map.addLayer(app.mlayer);
app.map.reorderLayer(app.ref, 2)
app.mlayer.setVisibleLayers([tItem[0].data.id]);
dijit.byId("tPane").set('open', false); // closes the layer tool after clicking on the desired layer, layer stays selected, when reopening the layer tool
var svc = "" //app.layerJSON[x].copyrightText.substring(4);
getLegend(app.svcAddress, app.SelLayerIndex);
identifyTask = new esri.tasks.IdentifyTask(app.serviceSource + app.svcAddresss + "/MapServer");
});
k = k + 1;
tp.addChild(new ContentPane({
id : "test" + k,
title : " " + app.layerJSON[x].layers[i].name,
style : "height:7em; z-index:15",
content : grid
}));
if (app.MapServices[x] == app.svcAddress) {
}
grid.resize();
tp.resize();
tp.set("open", false);
} else {
//console.log(app.layerJSON[x].layers[i].name)
// for(j=0;j<(response[x].layers.length);j++){
//lyrnames.items.push(lang.mixin({id: app.layerJSON.layers[i].subLayerIds[j]}, lang.mixin({name: "Payments Received from Conservation Reserve, Wetlands Reserve, Farmable Wetlands and Conservation Reserve Enhancement Programs, Average per Farm: 2012"})));
lyrnames.push(lang.mixin({
id : app.layerJSON[x].layers[i].id
}, lang.mixin({
name : app.layerJSON[x].layers[i].name
})
));
if (i == app.layerJSON[x].layers.length - 1) {
//This function creates a button and a click event for that button, setting up some parameters on mouseover that are used in a later click event
var setDesc = function(rowObj){
btn = new Button({
name : 'idBtn',
iconClass: "plusIcon"
})
var cellContent = domConstruct.create("div");
cellContent.id = "buttonD";
btn.placeAt(cellContent);
on(btn, "mouseenter", function (evt) {
//console.log("made it to mouseenter");
//console.log(evt);
//console.log(this);
var $this = $(this.iconNode);
//console.log($this);
$this[0].clientHeight= "16px";
$this[0].clientWidth = "16px";
})
return cellContent;
};
var layout = [{
'field' : 'name',
'label' : 'Name',
},{
'field' : 'desc',
'label' : 'Desc.',
'width' : '10%',
'renderCell' : function (obj) {
return setDesc(obj); // This asks for the setDesc function, passing in the cellObject
}
}];
// switched to Memory from ItemsFileReadStore
var lyrnamesStore = new Memory({
data : lyrnames
})
/* this is the new grid setup */
grid = new(declare([OnDemandGrid, CellSelection, DijitRegistry]))({
id : app.layerJSON[x].mapName + "grid" + i,
store : lyrnamesStore,
columns : layout,
selectionMode : "single",
deselectOnRefresh : false,
keepScrollPosition : true,
allowSelectAll : false,
loadingMessage : "Loading data...",
noDataMessage : "No results found."
}, dojo.create("div"));
grid.set("class", "dgrid");
if (app.layerJSON[x].mapName == app.svcAddress) {
grid.select(app.SelLayerIndex);
}
/* this is the important bit from for the DGRID. The new event is dgrid-select (vs just click) */
//************************************************************************************************//
grid.on("dgrid-select", function (event) {
var descT = "";
//console.log(x);
tItem
var curId = this.id;
//var desc = document.getElementById('description');
//console.log(desc);
app.SelLayerIndex = "";
dojo.query(".dgrid").forEach(function (node, index, arr) {
if (node.id != curId) {
dijit.byId(node.id).clearSelection();
}
});
tItem = event.cells; //this is the selection. for a single selection, this has only one entry
//console.log(tItem[0].row.data.name);
headerTitle.innerHTML = tItem[0].row.data.name; // the actual data is in tItem[x].data
app.SelLayerIndex = tItem[0].row.data.id;// the actual data is in tItem[x].data
//console.log(app.SelLayerIndex);
//NEW LAYER CODE//
if (tItem[0].column.id == "0") {
console.log("this is happening");
app.map.removeLayer(app.map.getLayer("currentLayer"));
app.map.addLayer(app.mlayer);
app.map.reorderLayer(app.ref, 2)
app.mlayer.setVisibleLayers([tItem[0].row.data.id]);
dijit.byId("tPane").set('open', false); // closes the layer tool after clicking on the desired layer, layer stays selected, when reopening the layer tool
var svc = "" //app.layerJSON[x].copyrightText.substring(4);
getLegend(app.svcAddress, app.SelLayerIndex);
identifyTask = new esri.tasks.IdentifyTask(app.serviceSource + app.svcAddresss + "/MapServer");
}
else {
// when second column is clicked, the layer description is put in a popup box
//console.log(app.layerJSON[tpaneIndex].layers[app.SelLayerIndex].description);
//console.log(app.layerJSON[tpaneIndex]);
textDesc = app.layerJSON[tpaneIndex].layers[app.SelLayerIndex].description;
descT= JSON.parse(textDesc);
sourceT = descT["dataSources"];
beginL = "(http:"
endL = ")"
console.log(sourceT);


// the g in the regular expression says to search the whole string
// rather than just find the first occurrence
var count = sourceT.match(new RegExp (escapeRegExp(beginL), 'g')).length;
i = 0;
console.log(count);
while (i < count) {
match = getLinkText(sourceT, beginL, endL );
matchRpl = "<a href = " + match + " target='_blank'>" + match + "</a>";
sourceT = replaceAll(sourceT, match, matchRpl);
i++
}

// find the location of text within parenthesis, to get string length
function getLinkText(str, delim1, delim2) {
var a = str.indexOf(delim1);
if (a == -1){
return '';
}
var b = str.indexOf(delim2, a+1);
if (b == -1){
return '';
}
return str.substr(a+1, b-a-1);
}




console.log(sourceT)
// accounts for special escape characters
function escapeRegExp(string) {
return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
// replace initial link with adjusted, anchor tagged link
function replaceAll(string, find, replace) {
return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

$(".dgrid-cell").click(function(evt) {
//console.log(this);
evt.preventDefault();
var $this = $(this);
//console.log($this);
var offset = $this.offset();
var width = $this.width();
var height = $this.height();
xCoord = offset.left + width/2 + 15; // this sets the position of the resulting div (description) based on the center of the button object
yCoord = offset.top - height/2;
$(".description").css({"left": xCoord + "px", "top": yCoord + "px" })
$(".description").css({"width": "300px", "font-size" : "15px", "height" : "200px", "font-weight": "normal", "overflow-y" : "auto", "overflow-x": "hidden"});
$(".description").scrollTop(0);
$(".description").html('<b> Definition: </b>' + descT["definition"] + '<p>' + '<b>Available years: </b>' + descT["availableYears"] + '<p>' + '<b>Level of geography: </b>' + descT["geographicLevel"] + '<p>' + '<b> Data sources: </b>' + sourceT );
$(".description").show();
//$(".description").css().top = (yCoord) + "px";
//$(this).css({"width":"17px", "height":"17px"});
//$(".description").text("<a>http://www.ers.usda.gov/publications/err-economic-research-report/err143.aspx<a>"); //usually will put in response.description
//window.open($(this).attr('<a href = "http://www.ers.usda.gov/publications/err-economic-research-report/err143.aspx"> For more information, feel free to click here </a>'), "popupWindow", "width=600,height=600,scrollbars=yes");
// $(".description").html('+Geographic level: County +Definition: The number of supermarkets and grocery stores in the county. Grocery stores (defined byNorth American Industry Classification System (NAICS) code 445110) includeestablishments generally known as supermarkets and smaller grocery stores primarilyengaged in retailing a general line of food, such as canned and frozen foods; fresh fruitsand vegetables; and fresh and prepared meats, fish, and poultry. Included in this industryare delicatessen-type establishments primarily engaged in retailing a general line of food.Convenience stores, with or without gasoline sales, are excluded. Large generalmerchandise stores that also retail food, such as supercenters and warehouse club stores,are excluded. +Data sources: Store data are from the U.S. Census Bureau, County Business Patterns(<a href= "http://www.census.gov/econ/cbp/index.html" target="_blank"> link to data source </a>). +Available Year: (s)2007,2011'); //usually will put in response.description
// $(".description").css({"width": "300px", "font-size" : "15px", "height" : "200px", "font-weight": "normal", "overflow-y" : "auto"});
// $(".description").scrollTop(0);
// $(".description").html('+Geographic level: County +Definition: The number of supermarkets and grocery stores in the county. Grocery stores (defined byNorth American Industry Classification System (NAICS) code 445110) includeestablishments generally known as supermarkets and smaller grocery stores primarilyengaged in retailing a general line of food, such as canned and frozen foods; fresh fruitsand vegetables; and fresh and prepared meats, fish, and poultry. Included in this industryare delicatessen-type establishments primarily engaged in retailing a general line of food.Convenience stores, with or without gasoline sales, are excluded. Large generalmerchandise stores that also retail food, such as supercenters and warehouse club stores,are excluded. +Data sources: Store data are from the U.S. Census Bureau, County Business Patterns(<a href= "http://www.census.gov/econ/cbp/index.html" target="_blank"> link to data source </a>). +Available Year: (s)2007,2011'); //usually will put in response.description
});
$(".description").mouseleave(function() {
//console.log("made it to mouseleave");
$(".description").hide();
});
}
});
aspect.after(grid, 'renderRow', function (row, args){
return row;
});
k = k + 1;
tp.addChild(new ContentPane({
id : "test" + k,
title : " " + app.layerJSON[x].layers[i].name,
style : "height:7em; z-index:15",
content : grid
}));
if (app.MapServices[x] == app.svcAddress) {
}
grid.resize();
tp.resize();
tp.set("open", false);
app.count = app.count + 1
}
}
}
}

}
dojo.query(".cPane").forEach(function (node, index, arr) {
//console.log(app.svcAddress);
//console.log(node.id.indexOf(app.svcAddress));
if (node.id.indexOf(app.svcAddress) == 0) {
// console.log(node.id);
dijit.byId(node.id).set('open', true );
}
});
//dijit.byId(app.svcAddress).set('open', true);

}
/************************************************************************************************/
/*END BUILD LAYER LIST */

function doIdentify(evt) {
//console.log(app.mlayer.url);
dijit.byId("tPane").set("class", "tPaneClosed");
dijit.byId("tPane").set('open', false);
dijit.byId("parcelTab").setContent("");
identifyTask = new esri.tasks.IdentifyTask(app.mlayer.url);
identifyParams.tolerance = 2;
identifyParams.returnGeometry = true;
identifyParams.layerIds = [app.SelLayerIndex];
identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
identifyParams.width = app.map.width;
identifyParams.height = app.map.height;
identifyParams.geometry = evt.mapPoint;
identifyParams.mapExtent = app.map.extent;
identifyTask.execute(identifyParams, function (idResults) {
addToMap(idResults, evt);
}, function () {
app.map.graphics.clear()
});
}

function addToMap(idResults, evt) {
if (idResults.length > 0) {
dijit.byId("parcelTab").setContent("");
parcelResults = {
displayFieldName : null,
features : []
};
var idResult = idResults[0];
if (idResult.layerId == app.SelLayerIndex) {
if (!parcelResults.displayFieldName) {
parcelResults.displayFieldName = idResult.displayFieldName
};
parcelResults.features.push(idResult.feature);
} else if (idResult.layerId == app.SelLayerIndex) {
if (!parcelResults.displayFieldName) {
parcelResults.displayFieldName = idResult.displayFieldName
};
parcelResults.features.push(idResult.feature);
}
layerTabContent(parcelResults, "parcelResults");
app.map.infoWindow.show(evt.screenPoint, app.map.getInfoWindowAnchor(evt.screenPoint));
showFeature(idResult.feature);
} else {
infoWindow.hide();
}
}

function numberWithCommas(x) {
var parts = x.toString().split(".");
parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return parts.join(".");
}

function layerTabContent(layerResults, layerName) {
/* this is the variables list tab */
var i = 0;
var featureAttributes = layerResults.features[i].attributes;
app.map.infoWindow.setTitle(layerResults.features[i].attributes["County"] + ", " + layerResults.features[i].attributes["State"] + " " + layerResults.features[i].attributes["FIPS"]);
var content = "";
/* this is the data for the displayed table. which could be slightly different from the downloaded version */
content += "<table border='0' height = '65px' style='overflow:scroll'>";
for (att in featureAttributes) {
if (!(att == "OBJECTID_1") && !(att == "OBJECTID") && !(att == "State") && !(att == "County") && !(att == "Shape_Length") && !(att == "Shape_Area")
&& !(att == "Shape") && !(att == "FIPSTXT") && !(att == "FIPS") && !(att == "FIPSNUM") && !(att == "FIPS_1") && !(att == "NASSFIPSN")) {
if (att == headerTitle.innerHTML.trim()) {
content += "<tr><td class='selected' width='85%'><b>" + att + "</b></td><td class='selected' width='15%' align='right'><b>" + numberWithCommas(featureAttributes[att]) + "</b> </td><td width='0%' /></tr>"; // changed text type, adjusted width
content += "<tr><td colspan=2><HR WIDTH='90%' color='#EEEEEE' ALIGN='center'></td></tr>";
} else {
if (att != "FIPSTXT") {
content += "<tr><td class='unselected' width='85%'>" + att + "</td><td class='unselected' width='15%' align='right'>" + numberWithCommas(featureAttributes[att]) + " </td><td width='0%' /></tr>"; // changed text type, adjusted width
content += "<tr><td colspan=2><HR WIDTH='90%' color='#EEEEEE' ALIGN='center'></td></tr>";
} else {
content += "<tr><td class='unselected' width='85%'>" + att + "</td><td class='unselected' width='15%' align='right'>" + featureAttributes[att] + " </td><td width='0%' /></tr>"; // changed text type, adjusted width
content += "<tr><td colspan=2><HR WIDTH='90%' color='#EEEEEE' ALIGN='center'></td></tr>";
}
}
}
}
content += "</table><br>";
/********************************************************************************************************/

cp1.setContent("<div class='curValue'>Current value: " + numberWithCommas(layerResults.features[i].attributes[headerTitle.innerHTML.trim()]) + " " + unitsName.toLowerCase()); //current value section
//cp1.setContent("<div class='curValue'>Current value </div>" )// <div class='sprtID'><b> Variables for " + app.svcNameC + " : </b></div>"); //current value section
cp2.setContent(content);
var dataString = "";
/*******************************this is the data for the download CSV. May contain extra fields ******************************************************/
for (att in featureAttributes) {
if (!(att == "OBJECTID_1") && !(att == "OBJECTID") && !(att == "State Name") && !(att == "County Name") && !(att == "Shape_Length") && !(att == "Shape_Area")
&& !(att == "Shape") && !(att == "FIPSTXT") && !(att == "FIPS") && !(att == "FIPSNUM") && !(att == "FIPS_1") && !(att == "NASSFIPSN")) {
var key = "\"" + String(att) + "\""
var value = "\"" + String(featureAttributes[att]) + "\t" + "\"";
dataString += key.trim() + "," + value.trim() + "\n"
}
}
/****************************************************************************************************************************************************/
//dataString.replace("undefinedFIPSTEXT","FIPSTEXT");
var csvContentArray = [];
csvContentArray.push(dataString);
//console.log(dataString);
var csvContent = "data:text/csv;charset=utf-8, " + "\n" + csvContentArray;
var encodedUri = encodeURI(csvContent); // sets up the data for download //
if (navigator.appName == "Microsoft Internet Explorer" && !(navigator.msSaveBlob)) {
//window.open('data:text/csv;charset=utf-8,' + escape(str));
cp3.setContent("<div class='sprtID'><b> (D) - Withheld to not disclose data </b></div><label class='ieLink' ><u>download this dataset</u></label></div>");
dojo.query(".ieLink").connect("onclick", function () {
var popup = window.open('', 'csv', '');
popup.document.body.innerHTML = '<pre>' + csvContent + '</pre>';
});
} else if (navigator.msSaveBlob) {
//window.open('data:text/csv;charset=utf-8,' + escape(str));
cp3.setContent("<div class='sprtID'><b> (D) - Withheld to not disclose data </b></div><label class='ieLink' ><u>download this dataset</u></label></div>");
dojo.query(".ieLink").connect("onclick", function () { //
var blob = new Blob([dataString], {
type : 'text/csv'
})
navigator.msSaveBlob(blob, "mydata.csv");
})
} else {
cp3.setContent("<div class='sprtID'><b></b></div><a class='idLink' href=" + encodedUri + " download='mydata.csv'>download this dataset<a/></div>");
}
infoWindow.addChild(cp1);
infoWindow.addChild(cp2);
infoWindow.addChild(cp3);
//return content;
}

function showFeature(feature) {
app.map.graphics.clear();
feature.setSymbol(symbol);
app.map.graphics.add(feature);
}

/*********************************************************************************************/
/* Legend succeeded tool */
function lgdRequestSucceeded(response, io) {

//console.log(response);
var lyrs;
var fieldInfo,pad;
pad = dojoString.pad;
console.log(tItem);
for (i = 0; i < (response.layers.length); i++) {
if (!tItem) { //Not getting tItem to show up here. if (app.SelLayerIndex == 0) {
legendLayerName = app.initialLayerName;
} else {
legendLayerName = tItem[0].row.data.name;
}
if (response.layers[i].layerName == legendLayerName) {
lgndDetail = {
label : "layerName",
items : []
};
var tabBody = document.getElementById("tabBody1");
while (tabBody.hasChildNodes()) {
tabBody.removeChild(tabBody.firstChild);
}
// once layer name matched with json result, the items from legend json are added, row by row
for (j = 0; j < (response.layers[i].legend.length); j++) {
//console.log("creating map legend");
console.log(i)
var LayerName = response.layers[i].layerName;
var imgSource = app.serviceSource + app.svcAddress + "/MapServer/" + response.layers[i].layerId + "/images/" + response.layers[i].legend[j].url;
var valueSource = response.layers[i].legend[j].label;
var imgT = dom.byId("image");
addRow(imgSource, valueSource, tabBody);
lgndDetail.items.push(lang.mixin({
id : response.layers[i].layerId,
layerName : response.layers[i].layerName
}, lang.mixin({
label : response.layers[i].legend[j].label,
img : app.serviceSource + app.svcAddress + "/MapServer/" + response.layers[i].layerId + "/images/" + response.layers[i].legend[j].url
})
));
}
store = new ItemFileReadStore({
data : lgndDetail
});
}
}
}

/*getting units for legend */
function unitRequestSucceeded(response, io) {
// pntLayer = response.parentLayer.id; //getting the parent (group) layer, used in print tool as well
unitsName = response.copyrightText; //getting units
varID = "" //"NASS map ID: " + String(response.description).replace("_","-").substring(1);
var UnitsT = dom.byId("units");
UnitsT.innerHTML = unitsName;
var censusVar = dom.byId("cVar");
censusVar.innerHTML = varID; //used in print tool
}

function requestFailed(error, io) {
domClass.add(dom.byId("content"), "failure");
dojoJson.toJsonIndentStr = " ";
dom.byId("content").value = dojoJson.toJson(error, true);
}

/* Used to populate the legend tool */
function addRow(image, value, tbody) {
if (!document.getElementById) {
return;
}
row = document.createElement("tr");
cell1 = document.createElement("td");
cell2 = document.createElement("td");
imgNode1 = document.createElement("img");
imgNode1.src = image;
textnode2 = document.createTextNode(value);
cell1.appendChild(imgNode1);
cell2.appendChild(textnode2);
row.appendChild(cell1);
row.appendChild(cell2);
tbody.appendChild(row);
//return;
}
/* End Legend succeeded tool */
/***************************************************************************************************/

/* Print tool creation */
// this will need to be changed to add in
function createPrintTask(layout, format, title) { //input parameters set in dropdown print menu
var tpId = pntLayer;
if (layout == "MAP_ONLY") {
var template = new esri.tasks.PrintTemplate();
template.format = format;
template.layout = layout;
template.layoutOptions = {
"showAttribution" : false
}
template.exportOptions = {
width : 988,
height : 670,
dpi : 96
}
} else {
var template = new esri.tasks.PrintTemplate();
var legendLayer1 = new esri.tasks.LegendLayer();
legendLayer1.layerId = "currentLayer";
legendLayer1.subLayerIds = [tpId, app.SelLayerIndex];
template.format = format;
template.layout = layout;
template.layoutOptions = {
"titleText" : title,
"scalebarUnit" : "Miles",
"copyrightText" : "",
"legendLayers" : [legendLayer1],
"customTextElements" : [{
cVar : varID
}
],
"showAttribution" : false
}
template.exportOptions = {
dpi : 300
}
}
template.preserveScale = true;
var params = new esri.tasks.PrintParameters();
params.map = app.map;
params.template = template;
if (layout == "USATriMap") { // This is not being used at the present time (alaska and hawaii insets)
printTask = new esri.tasks.PrintTask(app.lSource + "Printer/Triapp.mapPrint/GPServer/AdvancedHighQualityPrinting");
//printTask = new esri.tasks.PrintTask("http://gis2.ers.usda.gov/arcgis/rest/services/Printer/TriMapPrint2/GPServer/AdvancedHighQualityPrinting");
} else {
//printTask = new esri.tasks.PrintTask("http://gis2.ers.usda.gov/arcgis/rest/services/Printer/ExportWebMap/GPServer/Export%20Web%20Map");
printTask = new esri.tasks.PrintTask(app.lSource + "Printer/ExportWebMap10/GPServer/Export%20Web%20Map");
}
//showLoading(); // took this line out, so that showLoading doesn't run loading text - present situation is a bit redundant, though
showPrinting();
printTask.execute(params, printResult, printTest);
printTask.on('complete', function () {
hideLoading();
hidePrinting();
})
}

function printTest(error) {
alert("There's a problem with the print tool. \nPlease try again later.");
hideLoading();
hidePrinting();
}

function printResult(result) {
//alert (result.url);
if (result.url === "") {
alert("error");
}
var currentTime = new Date();
result.url += "?ts=" + currentTime.getTime();
//count = count + 1
//setTimeout(function(){alert("Hello")},10000);
var a = document.createElement('a');
var linkText = document.createTextNode("Click here to open printable map");
a.appendChild(linkText);
a.id = 'hyperL';
a.href = result.url;
a.target = "_blank";
document.body.appendChild(a);
document.getElementById('hyperL').className = '';
window.addEventListener('blur', function () {
if (a.hasChildNodes()) {
a.removeChild(linkText);
}
});
}

function printError(error) {
alert(error);
}

function showLoading() {
esri.show(loading);
imgVis.className = "loadVisible";
lProg.className = "refreshVisibleL";
}

function hideLoading() {
esri.hide(loading);
imgVis.className = "loadHidden";
lProg.className = "refreshHidden";
}

function showPrinting() {
esri.show(loading);
imgVis.className = "loadVisible";
pProg.className = "refreshVisibleP";
}

function hidePrinting() {
esri.hide(loading);
imgVis.className = "loadHidden";
pProg.className = "refreshHidden";
}

/* New version of the Print Interface for the user */
var menu = new DropDownMenu({
style : "display: none;"
});

var menuItem1 = new MenuItem({
label : "Image (png)",
onClick : function () {
if (!tItem) {
title = app.initialLayerName;
} else {
title = tItem[0].data.name.toString();
}
// This needs to change to map only, at some point
createPrintTask("MAP_ONLY", "png32");
}
});

menu.addChild(menuItem1);

var menuItem2 = new MenuItem({
label : "Landscape (pdf)",
onClick : function () {
if (!tItem) {
title = app.initialLayerName;
} else {
title = tItem[0].data.name.toString();
}
createPrintTask("LandscapeComplex2", "PDF", title);
}
});

menu.addChild(menuItem2);

var menuItem3 = new MenuItem({
label : "Portrait (pdf)",
onClick : function () {
if (!tItem) {
title = app.initialLayerName;
} else {
title = tItem[0].data.name.toString();
}
createPrintTask("PortraitComplex2", "PDF", title);
}
});

menu.addChild(menuItem3);

menu.startup();

var button = new dijit.form.DropDownButton({
id : "printbtn",
label : "Print",
dropDown : menu
});

button.on('mouseout', function () {
menu.hide;
})

button.startup();

dom.byId("print").appendChild(button.domNode);

/*******************************************functions associated with zoom to state*********************************************/

function zoomRow(id) {
app.zoomSt.clearSelection();
var query = new Query();
query.where = "STATE_NAME = '" + id + "'";
//console.log(query);
app.zoomSt.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (features) {
//zoom to the selected feature
var stateExtent = features[0].geometry.getExtent().expand(1.2);
app.map.setExtent(stateExtent);
}, errBack);
}

function setDefinition(id) {
app.zoomCvr.setDefinitionExpression("STATE_NAME <> '" + id + "'");
app.map.addLayer(app.zoomCvr);
app.zoomCvr.refresh();
}

// used 'change' instead of 'click', but IE doesn't fire until checkbox loses 'focus'
on(dom.byId("maskToggle"), "click", function () {
getMask();
if (this.checked) {
getMask();
} else {
app.zoomCvr.setRenderer(renderer);
}
});

function getCheckBox() {
x.className = "visibility";
}

if (typeof maskToggle != "undefined") {
//console.log("maskToggle is real!");
}

function getMask() {
//console.log("made it to click");
app.zoomCvr.setRenderer(renderer2);
app.zoomCvr.refresh();
}

function errBack(error) {
console.log("Error - " + error)
console.log("Error code - " + error.code)
}

/***************************************************************************************************************/

function updateService(service) {
app.layerSource = app.serviceSource + service + "/MapServer";
app.mlayer = new esri.layers.ArcGISDynamicMapServiceLayer(app.layerSource, {
"id" : "currentLayer"
});
}


/*Tool to update the app.map layer (app.mlayer) every time someone clicks on a category
function updateLayer(service) {

app.layerSource = "http://adbgis06:6080/arcgis/rest/services/NASS/" + service + "/MapServer";
app.mlayer= new esri.layers.ArcGISDynamicMapServiceLayer(app.layerSource,{"id":"newLayer"});
app.map.removeLayer(app.map.getLayer("currentLayer"));
// this is where I get stuck, at the moment, I can't get app.map to remove the previous version of app.mlayer
app.mlayers = app.map.layerIds.length; // this finds out how many layers are in app.map at the moment
// app.mlayer="";
//console.log(app.map.layerIds);
// restart app.mlayer
// console.log("this is " + app.mlayer.url);
//app.map
// app.map.addLayer([app.tiled,app.mlayer,app.ref]);
// ; // make sure that the reference layer is on top
//console.log("made it here");
}
*/
});