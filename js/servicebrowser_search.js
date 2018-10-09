var tItem;
var app = [];
var printList;
var services = [];
var serviceTxt;
var identifyTask;
var lgdRequestHandle;
var app = [];
var classCnt;
var flags = {};
var title;
var pntLayer;
var lyrTitle;
var unitsName;
var varID;
require([
		"dojo/dom",
		"dojo/query",
		"dojo/on",
		"dojo/dom-construct",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/promise/all",
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
		"dijit/form/TextBox",
		"dijit/form/Button",
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
	function (dom, query, on, domConstruct, lang, arrayUtils, all, on, domClass, dojoJson, array, dojoString, esriRequest, parser, AccordionContainer, TitlePane, CheckBox, TextBox, Button, Menu, LinkPane, MenuItem,
		DropDownButton, DropDownMenu, DataGrid, EnhancedGrid, ContentPane, Memory, ObjectStore, ItemFileReadStore, ItemFileWriteStore, Deferred, request, map, Scalebar, Legend, Extent, Identify, PrintTask, PrintTemplate, Print, InfoWindow, SimpleMarkerSymbol, SimpleLineSymbol, FeatureLayer, InfoTemplate, TabContainer, identify, esriRquest, FloatingPane, ComboBox, xhr) {
		var node
		parser.parse();
		var ext = new esri.geometry.Extent({
			"xmin": -2500000,
			"ymin": 130000,
			"xmax": 2400000,
			"ymax": 3700000,
			"spatialReference": {
				"wkid": 102039
			}
		});
		var myButton = new Button({
			label: "Search",
		}, "sButton")
		//});
		app.map = new esri.Map("map", {
			extent: ext,
			sliderStyle: "small",
			showAttribution: false,
			logo: false,
			navigationMode: "classic"
		});
		var printTemplate = ["png", "landscape", "portrait"];
		app.printTool = "Printer/ExportWebMapDynamic";
		app.printText = "http://www.ers.usda.gov/data-products/food-access-research-atlas/documentation.aspx";
		myButton.on("click", function (evt) {

			var promises2;
			var req2 = [];
			app.count = 0
			console.log(app.Services)
			for (var l = 0, im = app.Services.services.length; l < im; l++) {
				var requestHandle2 = esriRequest({
					"url": "https://gis.ers.usda.gov/arcgis/rest/services/" + app.Services.services[l].name + "/MapServer/layers",
					"content": {
						"f": "json",
						"svc": app.Services.services[l]
					},
					"callbackParamName": "callback"
				});
				req2.push(requestHandle2);
			}
			promises2 = all(req2)
			promises2.then(requestSucceeded, requestFailed)

		});

		myButton.startup();
		var refBox = new CheckBox({
			name: "refSelect",
			value: "yes",
			checked: false,
		}, "refSelect")
		var refLayer = new esri.layers.ArcGISDynamicMapServiceLayer("https://gis.ers.usda.gov/arcgis/rest/services/reference/MapServer", {
			"id": "refLayer"
		});
		refBox.on("change", function (b) {

			if (b) {

				app.map.addLayer(refLayer);
			} else {
				app.map.removeLayer(refLayer);
			}


		});


		refBox.startup();

		app.map.on("click", function () {
			dijit.byId("printbtn").set('open', false);
		});



		function showPrinting() {
			//	esri.show(loading);
			//	imgVis.className = "loadVisible";
			//	pProg.className = "refreshVisibleP";
		}

		function hidePrinting() {
			//	esri.hide(loading);
			//	imgVis.className = "loadHidden";
			//	pProg.className = "refreshHidden";
		}

		/* New version of the Print Interface for the user */
		var menu = new DropDownMenu({
			style: "display: none;"
		});

		var menuItem1 = new MenuItem({
			label: "Image (png)",
			onClick: function () {
				if (!tItem) {
					title = app.initialLayerName;
				} else {
					title = tItem[0].row.data.name.toString();
				}
				// This needs to change to map only, at some point
				createPrintTask("MAP_ONLY", "png32");
			}
		});

		menu.addChild(menuItem1);

		var menuItem2 = new MenuItem({
			label: "Landscape (pdf)",
			onClick: function () {
				if (!tItem) {
					title = app.initialLayerName;
				} else {

					title = tItem[0].row.data.name.toString();

				}
				if (classCnt > 6) {
					//console.log("lots of classes");
					createPrintTask("LandscapeLarge", "PDF", title);
				} else {
					createPrintTask("LandscapeComplex2", "PDF", title);
				}
			}
		});

		menu.addChild(menuItem2);

		var menuItem3 = new MenuItem({
			label: "Portrait (pdf)",
			onClick: function () {
				if (!tItem) {
					title = app.initialLayerName;
				} else {
					title = tItem[0].row.data.name.toString();
				}
				if (classCnt > 6) {
					//console.log("lots of classes");
					createPrintTask("PortraitLarge", "PDF", title);
				} else {
					createPrintTask("PortraitComplex2", "PDF", title);
				}

			}
		});

		menu.addChild(menuItem3);

		menu.startup();

		var button = new dijit.form.DropDownButton({
			id: "printbtn",
			label: "Print",
			dropDown: menu,
			region: "top",
			style: "float: right"
		});

		button.on('mouseout', function () {
			menu.hide;
		})

		button.startup();

		dom.byId("print").appendChild(button.domNode);












		var infoWindow = new esri.dijit.InfoWindow({
			anchor: esri.dijit.InfoWindow.ANCHOR_LOWERRIGHT
		}, dojo.create("div"));

		infoWindow.startup();
		var template = new InfoTemplate();

		//  template.setContent(getTextContent);


		var legendDijit = new Legend({
			map: app.map
		}, "legendDiv");
		legendDijit.startup();

		//var legendDijit
		app.map.on("layer-add", function (evt) {
			console.log("here");
		});



		app.tiled = new esri.layers.ArcGISDynamicMapServiceLayer("https://gis.ers.usda.gov/arcgis/rest/services/background/MapServer", {
			"id": "background"
		});
		app.map.addLayer(app.tiled);


		var lcomboBox = new ComboBox({
			id: "layerSelect",
			name: "layers",
			style: {
				width: "450px"
			}

		}, "layerSelect")


		lcomboBox.on("change", function (event) {
			//console.log(event);
			var id = lcomboBox.item.id;
			app.varName = lcomboBox.value;
			console.log(app.varName)
			console.log(lcomboBox.item.id);
			sName = lcomboBox.item.service //dijit.byId("serviceSelect").item.name;
			var dataLayer = new esri.layers.ArcGISDynamicMapServiceLayer("https://gis.ers.usda.gov/arcgis/rest/services/" + sName + "/MapServer", {
				id: "dataLayer",
				infoTemplates: template
			});
			dataLayer.setVisibleLayers([id]);
			/*  var featureLayer = new FeatureLayer("http://gis.ers.usda.gov/arcgis/rest/services/" + sName + "/MapServer/" + id, {
					id:"flayer",
          mode: FeatureLayer.MODE_SNAPSHOT,
          outFields: ["*"],
          infoTemplate: template
        }); */
			template.setTitle("<b>${County},${State}</b>");
			var valVar = "${description}"



			var descT = JSON.parse(app.serviceJson.layers[id].description)

			console.log(descT);

			var desc = '<p><b>' + descT["name"] + '</b><p>' + '<b> Definition: </b>' + descT["definition"] + '<p>' + '<b>Available years: </b>' + descT["availableYears"] + '<p><b>Level of geography: </b>' + descT["geographicLevel"]
			console.log(valVar);
			// template.setContent(app.varName + ": ${" + app.fields[id] + "}");
			//	console.log(app.map.graphicsLayerIds);
			//	console.log(app.map.layerIds);
			//	console.log(app.map.getGraphicLayer("flayer"));
			if (app.map.layerIds.indexOf("dataLayer") == -1) {
				app.map.addLayer(dataLayer, 1);
				console.log(app.serviceJson.layers[id].description)
				dijit.byId("legendDiv").refresh();
				dijit.byId("layerData").set("content", desc);
			} else {
				app.map.removeLayer(app.map.getLayer("dataLayer"))
				app.map.addLayer(dataLayer, 1);

				console.log(app.serviceJson.layers[id].description) //legendDijit.refresh();
			}
		});
		lcomboBox.startup();




		app.services = {
			items: []
		}
		var serviceRequest = esri.request({
			url: "https://gis.ers.usda.gov/arcgis/rest/services",
			content: {
				f: "json"
			},
			handleAs: "json",
			callbackParamName: "callback"
		});
		serviceRequest.then(
			function (response) {
				app.Services = response;
				console.log(app.Services.services);
				for (var l = 0, im = response.services.length; l < im; l++) {
					// console.log(response.services[l].name);
					//app.services.push(response.services[l].name);
					if (response.services[l].name != "background" && response.services[l].name != "ra_query") {
						app.services.items.push(lang.mixin({
							id: response.services[l].id
						}, lang.mixin({
							name: response.services[l].name
						})));
					}
				}
				var stateStore = new Memory({
					data: app.services
				});

				var comboBox = new ComboBox({
					id: "serviceSelect",
					name: "services",
					value: "select service",
					store: stateStore
				}, "serviceSelect");

				comboBox.on("change", function () {

					app.layers = {
						items: []
					}
					var layersRequest = esri.request({
						url: "https://gis.ers.usda.gov/arcgis/rest/services/" + this.value + "/MapServer/layers",
						content: {
							f: "json"
						},
						handleAs: "json",
						callbackParamName: "callback"
					});
					layersRequest.then(function (response) {
						//		console.log(response);
						app.serviceJson = response;
						app.fields = []

						for (var l = 0, im = response.layers.length; l < im; l++) {
							app.layers.items.push(lang.mixin({
								id: response.layers[l].id
							}, lang.mixin({
								name: response.layers[l].name
							}), lang.mixin({
								service: dijit.byId("serviceSelect").item.name
							})));
							app.fields.push(response.layers[l].description);
						}
						var layerStore = new Memory({
							data: app.layers
						});
						var box = dijit.byId("layerSelect");
						//	box.store.clear
						box.store.close;

						//	box.reset();
						box.store = layerStore;
						box.set("value", "Browse this service");
						//	box.value="select layer"
					}, function (error) {
						console.log("Error: ", error.message);
					});


				});
				comboBox.startup();
				// console.log(response)


			},
			function (error) {
				console.log("Error: ", error.message);
			});

		function requestSucceeded(response) {
			var rslt = {
				items: []
			}
			console.log(app.Services.services)
			for (l = 0; l < response.length; l++) {
				for (r = 0; r < response[l].layers.length; r++) {
					var rm = response[l].layers[r].name.toLowerCase();
					if (rm.indexOf(dijit.byId("search").value.toLowerCase()) != -1) {
						rslt.items.push(lang.mixin({
							service: app.Services.services[l].name
						}, lang.mixin({
							name: response[l].layers[r].name
						}), lang.mixin({
							id: response[l].layers[r].id
						})));
						//rslt.push(response[l].layers[r])
					}
				}

			}

			console.log(rslt)
			var layerStore = new Memory({
				data: rslt
			});
			var box = dijit.byId("layerSelect");
			//	box.store.clear
			//box.store.close;

			box.reset();
			box.set("value", rslt.items.length + " layers match");
			//box.value="search complete"	
			box.store = layerStore;

			//console.log(rslt)
		}

		function requestFailed() {

		}
		/******************************Print Tool********************************************************/

		/* Print tool creation */
		// this will need to be changed to add in
		function createPrintTask(layout, format, title) { //input parameters set in dropdown print menu
			var tpId = pntLayer;
			if (layout == "MAP_ONLY") {
				var template = new esri.tasks.PrintTemplate();
				template.format = format;
				template.layout = layout;
				template.layoutOptions = {
					"showAttribution": false
				}
				template.exportOptions = {
					width: 988,
					height: 670,
					dpi: 96
				}
			} else {
				var txtVar = app.printText //"http://www.ers.usda.gov/data-products/food-access-research-atlas/documentation.aspx"; // THIS CAN BE A VARIABLE FROM THE CONFIG FILE
				var template = new esri.tasks.PrintTemplate();
				var legendLayer1 = new esri.tasks.LegendLayer();
				legendLayer1.layerId = "currentLayer";
				legendLayer1.subLayerIds = [tpId, app.SelLayerIndex];
				template.format = format;
				template.layout = layout;
				template.layoutOptions = {
					"titleText": title,
					"scalebarUnit": "Miles",
					"copyrightText": "",
					"legendLayers": [legendLayer1],
					"customTextElements": [{
						"documentationSrc": txtVar
					}],
					"showAttribution": false
				}
				template.exportOptions = {
					dpi: 300
				}
			}
			template.preserveScale = true;
			var params = new esri.tasks.PrintParameters();
			params.map = app.map;
			params.template = template;
			if (layout == "USATriMap") { // This is not being used at the present time (alaska and hawaii insets)
				printTask = new esri.tasks.PrintTask("http://gis.ers.usda.gov/arcgis/rest/services/Printer/Triapp.mapPrint/GPServer/AdvancedHighQualityPrinting");
				//printTask = new esri.tasks.PrintTask("http://gis2.ers.usda.gov/arcgis/rest/services/Printer/TriMapPrint2/GPServer/AdvancedHighQualityPrinting");
			} else {
				//printTask = new esri.tasks.PrintTask("http://gis2.ers.usda.gov/arcgis/rest/services/Printer/ExportWebMap/GPServer/Export%20Web%20Map");
				//	printTask = new esri.tasks.PrintTask(app.lSource + "Printer/ExportWebMapFoodAtlas/GPServer/Export%20Web%20Map");
				//console.log("lSource: "+ app.lSource);
				//	console.log("print tool: "+ app.printTool )
				//printTask = new esri.tasks.PrintTask("http://arcgis-ersarcgis1031-1410776390.us-east-1.elb.amazonaws.com/arcgis/rest/services/" + app.printTool + "/GPServer/Export%20Web%20Map");
				//printTask = new esri.tasks.PrintTask("http://arcgis-ersarcgis1031-1410776390.us-east-1.elb.amazonaws.com/arcgis/rest/services/" + app.printTool + "/GPServer/Export%20Web%20Map");
				printTask = new esri.tasks.PrintTask("http://gis.ers.usda.gov/arcgis/rest/services/" + app.printTool + "/GPServer/Export%20Web%20Map");
				//printTask = new esri.tasks.PrintTask(app.lSource + app.printTool + "/GPServer/Export%20Web%20Map");
			}
			//showLoading();  // took this line out, so that showLoading doesn't run loading text - present situation is a bit redundant, though
			showPrinting();
			printTask.execute(params, printResult, printTest);
			printTask.on('complete', function () {
				//	hideLoading();
				hidePrinting();
			})
		}

		function printTest(error) {
			alert("There's a problem with the print tool. \nPlease try again later.");
			console.log(error);
			//	hideLoading();
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
			a.style = "float:right";
			//	document.body.appendChild(a);
			dom.byId("layerchooser").appendChild(a);
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






	});