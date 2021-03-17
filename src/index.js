import * as components from "./components";
import * as store from "./store";
import { getInstance } from "./utils";

require("./common");

let Form = null;
let ContextMenu = null;

const install = function (Vue, options = {}) {
	const { crud = {} } = options;

	// 样式
	if (!crud.style) crud.style = {};

	// 缓存配置
	store.__crud = crud;
	store.__vue = Vue;
	store.__inst = new Vue();

	// 注册组件
	for (let i in components) {
		Vue.component(components[i].name, components[i]);
	}

	// 获取组件实例
	Form = getInstance(components.Form);
	ContextMenu = getInstance(components.ContextMenu);

	// 注册右键菜单指令
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

	// 挂载 $crud
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
	version: "1.6.2",
	install
};
