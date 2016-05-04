sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(0);
			},
			
			formatDate: function (sValue) {
				if(!sValue){
					return "";
				}
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd/MM/yyyy HH:mm"}); 
				
				return oDateFormat.format(sValue);
				
			}
				
		};

	}
);