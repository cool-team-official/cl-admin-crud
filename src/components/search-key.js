export default {
	name: "cl-search-key",
	componentName: "ClSearchKey",
	inject: ["crud"],
	props: {
		// 绑定值
		value: [String, Number],
		// 选中字段
		field: {
			type: String,
			default: "keyWord"
		},
		// 字段列表
		fieldList: {
			type: Array,
			default: () => []
		},
		// 搜索时的钩子
		onSearch: Function,
		// 输入框占位内容
		placeholder: {
			type: String,
			default: "请输入关键字"
		}
	},
	data() {
		return {
			field2: null,
			value2: ""
		};
	},
	watch: {
		field: {
			immediate: true,
			handler(val) {
				this.field2 = val;
			}
		},

		value: {
			immediate: true,
			handler(val) {
				this.value2 = val;
			}
		}
	},
	computed: {
		selectList() {
			return this.fieldList.map((e, i) => {
				return <el-option key={i} label={e.label} value={e.value} />;
			});
		}
	},
	methods: {
		onKeyup({ keyCode }) {
			if (keyCode === 13) {
				this.search();
			}
		},

		search() {
			let params = {};

			this.fieldList.forEach((e) => {
				params[e.value] = null;
			});

			const next = (params2) => {
				this.crud.refresh({
					page: 1,
					...params,
					[this.field2]: this.value2,
					...params2
				});
			};

			if (this.onSearch) {
				this.onSearch(params, { next });
			} else {
				next();
			}
		},

		onInput(val) {
			this.$emit("input", val);
			this.$emit("change", val);
		},

		onNameChange() {
			this.$emit("field-change", this.field2);
			this.onInput("");
			this.value2 = "";
		}
	},
	render() {
		return (
			<div class="cl-search-key">
				<el-select
					class="cl-search-key__select"
					filterable
					size="mini"
					v-model={this.field2}
					v-show={this.selectList.length > 0}
					on-change={this.onNameChange}>
					{this.selectList}
				</el-select>

				<el-input
					class="cl-search-key__input"
					v-model={this.value2}
					placeholder={this.placeholder}
					nativeOnKeyup={this.onKeyup}
					on-input={this.onInput}
					clearable
					size="mini"
				/>

				<el-button
					class="cl-search-key__button"
					type="primary"
					size="mini"
					on-click={this.search}>
					搜索
				</el-button>
			</div>
		);
	}
};
