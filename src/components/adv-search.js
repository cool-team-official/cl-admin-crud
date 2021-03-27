import { cloneDeep } from "@/utils";
import { renderNode } from "@/utils/vnode";
import { Emitter, Screen } from "@/mixins";

export default {
	name: "cl-adv-search",

	componentName: "ClAdvSearch",

	inject: ["crud"],

	mixins: [Emitter, Screen],

	props: {
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
			visible: false,
			form: {},
		};
	},

	created() {
		this.$on("crud.open", this.open);
		this.$on("crud.close", this.close);
	},

	methods: {
		// 打开
		open() {
			// 打开事件
			const next = (data) => {
				this.visible = true;

				if (data) {
					Object.assign(this.form, data)
				}

				this.$nextTick(() => {
					this.$refs['form'].create({
						items: this.items,
						op: {
							hidden: true
						}
					})
				})

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
			this.$refs['form'].resetFields()
			this.$emit("reset");
		},

		// 清空
		clear() {
			for (let i in this.form) {
				this.form[i] = undefined
			}
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
							size: this.isMini ? '100%' : "500px",
							...this.props
						},
						on: {
							"update:visible": () => {
								this.close();
							},
							...this.on
						}
					}}>
					<div class="cl-adv-search__container">
						<cl-form v-model={this.form} ref="form" inner bind-component-name="ClAdvSearch"></cl-form>
					</div>

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
