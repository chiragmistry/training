jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"sap/trainings/test/integration/NavigationJourneyPhone",
		"sap/trainings/test/integration/NotFoundJourneyPhone",
		"sap/trainings/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

