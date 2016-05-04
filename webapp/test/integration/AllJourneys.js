jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Trainings in the list
// * All 3 Trainings have at least one Attachments

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/trainings/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/trainings/test/integration/pages/App",
	"sap/trainings/test/integration/pages/Browser",
	"sap/trainings/test/integration/pages/Master",
	"sap/trainings/test/integration/pages/Detail",
	"sap/trainings/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.trainings.view."
	});

	sap.ui.require([
		"sap/trainings/test/integration/MasterJourney",
		"sap/trainings/test/integration/NavigationJourney",
		"sap/trainings/test/integration/NotFoundJourney",
		"sap/trainings/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});
