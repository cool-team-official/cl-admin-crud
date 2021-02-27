import * as components from "./components";
import * as store from "./store";
import { getInstance } from "./utils";

require("./common");

let Form = null;
let ContextMenu = null;

const install = function (Vue, options = {}) {
	const { crud = {} } = options;

	// Set options store
	store.__crud = crud;
	store.__vue = Vue;
	store.__inst = new Vue();

	// Register components
	for (let i in components) {
		Vue.component(components[i].name, components[i]);
	}

	// Get instance
	Form = getInstance(components.Form);
	ContextMenu = getInstance(components.ContextMenu);

	// Register directive: contextmenu
	(function () {
		function fn(el, binding) {
			el.oncontextmenu = function (e) {
				ContextMenu.open(e, {
					list: binding.value || []
				});
			};
		}

		Vue.directive("contextmenu", {
			inserted: fn,
			update: fn
		});
	})();

	// Mount $crud
	Vue.prototype.$crud = {
		emit: store.__inst.$emit,
		openForm: Form.open,
		openContextMenu: ContextMenu.open
	};

	return {};
};

export const CRUD = {
	install,
	Form,
	ContextMenu
};

export { Form, ContextMenu };

export default {
	version: "1.3.0",
	install
};
