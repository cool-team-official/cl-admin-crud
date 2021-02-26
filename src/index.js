import * as components from './components'
import * as store from "./store";
import { getInstance } from './utils'

require("./common");

let Form = null
let ContextMenu = null

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
	Form = getInstance(components.Form)
	ContextMenu = getInstance(components.ContextMenu)

	// Mount $crud
	Vue.prototype.$crud = {
		emit(name, options) {
			store.__inst.$emit(name, options);
		},
		openForm(options) {
			document.body.appendChild(Form.$el);
			return Form.open(options)
		},
		openContextMenu(e, options) {
			document.body.appendChild(ContextMenu.$el);
			return ContextMenu.open(e, options)
		}
	};

	return {}
}

export const CRUD = {
	install,
	Form,
	ContextMenu
};

export { Form, ContextMenu }

export default {
	version: '1.2.5',
	install
};
