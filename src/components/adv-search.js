import { cloneDeep } from "@/utils";
import { renderNode } from "@/utils/vnode";
import Parse from "@/utils/parse";
import { Form, Emitter, Screen } from "@/mixins";

export default {
	name: "cl-adv-search",
	componentName: "ClAdvSearch",
	inject: ["crud"],
	mixins: [Emitter, Screen, Form],
	props: {
		// 表单值
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// 表单项
		items: {
			type: Array,
			default: () => []
		},
		// el-drawer 参数
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// 操作按钮 ['search', 'reset', 'clear', 'close']
		opList: {
			type: Array,
			default: () => ["close", "search"]
		},
		// 打开前钩子 { data, { next } }
		onOpen: Function,
		// 关闭前钩子 { done }
		onClose: Function,
		// 搜索时钩子 { data, { next, close } }
		onSearch: Function
	},
	data() {
		return {
			form: {},
			visible: false
		};
	},
	provide() {
		return {
			form: this.form
		}
	},
	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
			}
		}
	},
	created() {
		this.$on("crud.open", this.open);
		this.$on("crud.close", this.close);
	},
	methods: {
		// 打开
		open() {
			this.items.map((e) => {
				if (this.form[e.prop] === undefined) {
					this.$set(this.form, e.prop, e.value);
				}
			});

			// 打开事件
			const next = (data) => {
				this.visible = true;

				if (data) {
					Object.assign(this.form, data);
				}

				this.$emit("open", this.form);
			};

			if (this.onOpen) {
				this.onOpen(this.form, { next });
			} else {
				next(null);
			}
		},

		// 关闭
		close() {
			// 关闭事件
			const done = () => {
				this.visible = false;
				this.$emit("close");
			};

			if (this.onClose) {
				this.onClose(done);
			} else {
				done();
			}
		},

		// 重置
		reset() {
			this.resetFields()
			this.$emit("reset");
		},

		// 清空
		clear() {
			for (let i in this.form) {
				this.form[i] = undefined
			}
			this.clearValidate()
			this.$emit("clear");
		},

		// 搜索
		search() {
			const params = cloneDeep(this.form);

			// 搜索事件
			const next = (params) => {
				this.crud.refresh({
					...params,
					page: 1
				});

				this.close();
			};

			if (this.onSearch) {
				this.onSearch(params, { next, close: this.close });
			} else {
				next(params);
			}
		},

		// 渲染表单
		renderForm() {
			return (
				<el-form
					ref="form"
					class="cl-form"
					{...{
						props: {
							size: "small",
							"label-width": "100px",
							'label-position': this.isMobile ? 'top' : '',
							disabled: this.saving,
							model: this.form,
							...this.props
						}
					}}>
					<el-row
						v-loading={this.loading}
						{...{
							attrs: {
								...this["v-loading"]
							}
						}}>
						{this.items.map((e, i) => {
							return (
								!Parse("hidden", {
									value: e.hidden,
									scope: this.form
								}) && (
									<el-col
										{...{
											props: {
												key: i,
												span: 24,
												...e
											}
										}}>
										<el-form-item
											{...{
												props: {
													...e
												}
											}}>
											{renderNode(e.component, {
												prop: e.prop,
												scope: this.form,
												$scopedSlots: this.$scopedSlots
											})}
										</el-form-item>
									</el-col>
								)
							);
						})}
					</el-row>
				</el-form>
			);
		}
	},

	render() {
		const ButtonText = {
			search: "搜索",
			reset: "重置",
			clear: "清空",
			close: "取消"
		};

		return (
			<div class="cl-adv-search">
				<el-drawer
					{...{
						props: {
							visible: this.visible,
							title: "高级搜索",
							direction: "rtl",
							size: this.isMobile ? '100%' : "500px",
							...this.props
						},
						on: {
							"update:visible": () => {
								this.close();
							},
							...this.on
						}
					}}>
					<div class="cl-adv-search__container">{this.renderForm()}</div>

					<div class="cl-adv-search__footer">
						{this.opList.map((e) => {
							if (ButtonText[e]) {
								return (
									<el-button
										{...{
											props: {
												size: this.props.size || "small",
												type: e === "search" ? "primary" : ""
											},
											on: {
												click: this[e]
											}
										}}>
										{ButtonText[e]}
									</el-button>
								);
							} else {
								return renderNode(e, {
									scope: this.form,
									$scopedSlots: this.$scopedSlots
								});
							}
						})}
					</div>
				</el-drawer>
			</div>
		);
	}
};
