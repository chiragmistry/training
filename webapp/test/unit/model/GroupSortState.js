sap.ui.define([
		"sap/trainings/model/GroupSortState",
		"sap/ui/model/json/JSONModel"
	], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("RemSeats").length, 1, "The sorting by RemSeats returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("ShortDesc").length, 1, "The sorting by ShortDesc returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("RemSeats").length, 1, "The group by RemSeats returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});


	QUnit.test("Should set the sorting to RemSeats if the user groupes by RemSeats", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("RemSeats");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "RemSeats", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by ShortDesc and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "RemSeats");

		this.oGroupSortState.sort("ShortDesc");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});
