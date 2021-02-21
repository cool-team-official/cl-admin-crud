import * as global from "./global";
import * as components from "./components";

require("./common");

export const CRUD = {
	install(Vue, options) {
		const { crud } = options || {};

		// 设置全局参数
		global.__crud = crud;
		global.__vue = Vue;
		global.__inst = new Vue();

		// 注册组件
		for (let i in components) {
			Vue.component(components[i].name, components[i]);
		}

		// 挂载 $crud
		Vue.prototype.$crud = {
			emit: (name, callback) => {
				global.__inst.$emit(name, callback);
			}
		};

		return {}
	}
};

export default CRUD;
