import * as store from "./store";
import Crud from './components/crud'
import AddBtn from './components/add-btn'
import AdvBtn from './components/adv-btn'
import AdvSearch from './components/adv-search'
import Flex from './components/flex1'
import Form from './components/form'
import MultiDeleteBtn from './components/multi-delete-btn'
import Pagination from './components/pagination'
import Query from './components/query'
import RefreshBtn from './components/refresh-btn'
import SearchKey from './components/search-key'
import Table from './components/table'
import Upsert from './components/upsert'
import Dialog from './components/dialog'
import Filter from './components/filter'
import ErrorMessage from './components/error-message'

require("./common");

const components = [
	Crud,
	AddBtn,
	AdvBtn,
	AdvSearch,
	Flex,
	Form,
	MultiDeleteBtn,
	Pagination,
	Query,
	RefreshBtn,
	SearchKey,
	Table,
	Upsert,
	Dialog,
	Filter,
	ErrorMessage
]

const install = function (Vue, options) {
	const { crud } = options || {};

	// 设置缓存数据
	store.__crud = crud;
	store.__vue = Vue;
	store.__inst = new Vue();

	// 注册组件
	components.forEach(e => {
		Vue.component(e.name, e);
	})

	// 挂载 $crud
	Vue.prototype.$crud = {
		emit: (name, options) => {
			store.__inst.$emit(name, options);
		},
		openForm: (options) => {
			const FormConstructor = Vue.extend(Form)
			const instance = new FormConstructor({
				el: document.createElement('div')
			})
			instance.open(options)
			document.body.appendChild(instance.$el);
		}
	};

	return {}
}

export const CRUD = {
	install
};

export default {
	version: '1.0.6',
	install
};
