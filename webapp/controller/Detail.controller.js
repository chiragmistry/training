/*global location */
sap.ui.define([
	"sap/trainings/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/trainings/model/formatter",
	'sap/m/MessageToast'
], function(BaseController, JSONModel, formatter, MessageToast) {
	"use strict";
	return BaseController.extend("sap.trainings.controller.Detail", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");
			sap.m.URLHelper.triggerEmail(null, oViewModel.getProperty("/shareSendEmailSubject"), oViewModel.getProperty(
				"/shareSendEmailMessage"));
		},
		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle, iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");
			// only update the counter if the length is final
			if (this.byId("__table0").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				//	oViewModel.setProperty("/lineItemListTitle", sTitle);
				//	oViewModel.setProperty("/attachmentCount", iTotalItems);
				oViewModel.setProperty("/participantCount", iTotalItems);
			}

			if (this.byId("UploadCollection").getBinding("items").isLengthFinal()) {
				oViewModel.setProperty("/attachmentCount", this.byId("UploadCollection").getBinding("items").iLength);

			}

		},

		onListUpdateFinished2: function(oEvent) {
			var sTitle, iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");
			// only update the counter if the length is final
			if (this.byId("UploadCollection").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
				oViewModel.setProperty("/attachmentCount", iTotalItems);
			}

		},
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Trainings", {
					TrainingId: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					expand: "Trainers"
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.TrainingId,
				sObjectName = oObject.ShortDesc,
				oViewModel = this.getModel("detailView");
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				oUploadCollection = this.byId("UploadCollection"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);
			oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			oUploadCollection.attachEventOnce("updateFinished2", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		onTabSelect: function(oEvent) {
			var oKey = oEvent.getParameters("key").key;
			if (oKey === "3") {
				//var oView = this.getView();
				var oTrainerForm = this.getView().byId("__form1");
				oTrainerForm.bindElement({
					path: 'Trainers'
				});
			}
		},

		_getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.trainings.view.RegisterDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		/**
		 *@memberOf sap.trainings.controller.Detail
		 */
		onRegister: function() {
			//This code was generated by the layout editor.

			this._getDialog().open();

			/*	var oModel = this.getOwnerComponent().getModel();
			var oEntry = {};
			oEntry.TrainingId = "1";
			oEntry.ParticipantID = "7";
			oEntry.FirstName = "update";
			oEntry.LastName = "test";
            
			oModel.create('/Participants', oEntry, null, function() {
				alert("Create successful");
			}, function() {
				alert("Create failed");
			}); */

		},

		onDownloadItem: function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			var aSelectedItems = oUploadCollection.getSelectedItems();
			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					oUploadCollection.downloadItem(aSelectedItems[i], true);
				}
			} else {
				MessageToast.show("Select an item to download");
			}
		},

		onSelectionChange: function(oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");

			// If there's any item selected, sets download button enabled
			if (oUploadCollection.getSelectedItems().length > 0) {
				this.getView().byId("downloadButton").setEnabled(true);
			} else {
				this.getView().byId("downloadButton").setEnabled(false);
			}

		},

		onRegisterSubmit: function() {

			var fname = sap.ui.getCore().byId("__input7").getValue("value");
			var lname = sap.ui.getCore().byId("__input8").getValue("value");
			var email = sap.ui.getCore().byId("__input9").getValue("value");
			var title = sap.ui.getCore().byId("__input10").getValue("value");
			

			var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			
			var sPath = oElementBinding.getPath(),
				oObject = oView.getModel().getObject(sPath);
		
				
			var oEntry = {};
			oEntry.TrainingId = oObject.TrainingId;
			oEntry.ParticipantID = Math.floor((1 + Math.random()) * 0x10000);
			oEntry.FirstName = fname;
			oEntry.LastName = lname;
			oEntry.Email = email;
			oEntry.Title = title;

			oModel.create('/Participants', oEntry, null, function() {
				sap.m.MessageToast.show('Registration successful!');
			}, function() {
				sap.m.MessageToast.show('Registration successful!');
			});
            
            var oTraining = {};
            var RemSeats = oObject.RemSeats;
            oTraining.RemSeats = RemSeats - 1;
     
            oModel.update(sPath, oTraining, null, function() {
				sap.m.MessageToast.show('Registration successful!');
			}, function() {
				sap.m.MessageToast.show('Registration successful!');
			});
			
            fname = lname= email = title = " ";
			this._getDialog().close();
			

		},

		onRegisterCancel: function() {

			this._getDialog().close();
		}

	});
});