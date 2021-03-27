import { dataset, getParent } from "@/utils";

export default {
	mounted() {
		// 回调父组件方法
		if (this.bindComponentName) {
			const apis = [
				"getForm",
				"setForm",
				"setData",
				"setOptions",
				"toggleItem",
				"hiddenItem",
				"showItem",
				"showLoading",
				"hiddenLoading",
				"resetFields",
				"clearValidate",
				"validateField",
				"validate"
			];

			const parent = getParent.call(this, this.bindComponentName);

			apis.forEach((n) => {
				parent[n] = this[n];
			});
		}
	},

	methods: {
		// 设置值
		_set({ prop, options, hidden, path }, data) {
			let conf = null;

			switch (this.$options._componentTag) {
				case "cl-adv-search":
					conf = this;
					break;
				case "cl-form":
					conf = this.conf;
					break;
				default:
					conf = this.conf;
					break;
			}

			let p = path;

			if (prop) {
				p = `items[prop:${prop}]`;
			}

			if (options) {
				p += `.component.options`;
			}

			if (hidden) {
				p += ".hidden";
			}

			return dataset(conf, p, data);
		},

		// 获取表单值
		getForm(prop) {
			return prop ? this.form[prop] : this.form;
		},

		// 设置表单值
		setForm(prop, value) {
			// Add watch
			this.$set(this.form, prop, value);
		},

		// 设置表单项数据
		setData(path, value) {
			this._set({ path }, value);
		},

		// 设置组件选项
		setOptions(prop, value) {
			this._set({ options: true, prop }, value);
		},

		// 切换表单项的隐藏、显示
		toggleItem(prop, value) {
			if (value === undefined) {
				value = this._set({ prop, hidden: true });
			}

			this._set({ hidden: true, prop }, !value);
		},

		// 隐藏表单项
		hiddenItem(...props) {
			props.forEach((prop) => {
				this._set({ hidden: true, prop }, true);
			});
		},

		// 显示表单项
		showItem(...props) {
			props.forEach((prop) => {
				this._set({ hidden: true, prop }, false);
			});
		},

		// 显示加载中
		showLoading() {
			this.loading = true;
		},

		// 隐藏加载中
		hiddenLoading() {
			this.loading = false;
		},

		// 展开、收起
		collapseItem(item) {
			// 清空表单验证
			this.clearValidate(item.prop);

			if (item.collapse !== undefined) {
				item.collapse = !item.collapse;
			}
		},

		// 重置表单
		resetFields() {
			if (this.$refs["form"]) {
				this.$refs["form"].resetFields();
			}
		},

		// 清除表单验证
		clearValidate(props) {
			if (this.$refs["form"]) {
				return this.$refs["form"].clearValidate(props);
			}
		},

		// 验证表单字段
		validateField(props, callback) {
			if (this.$refs["form"]) {
				this.$refs["form"].validateField(props, callback);
			}
		},

		// 验证表单
		validate(callback) {
			if (this.$refs["form"]) {
				this.$refs["form"].validate(callback);
			}
		}
	}
};
