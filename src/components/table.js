import { renderNode } from "@/utils/vnode";
import { isNull, isArray, isEmpty } from "@/utils";
import { Emitter, Screen } from "@/mixins";
import { isFunction } from "../utils";

export default {
	name: "cl-table",

	componentName: "ClTable",

	inject: ["crud"],

	mixins: [Emitter, Screen],

	props: {
		columns: {
			type: Array,
			required: true,
			default: () => []
		},
		on: {
			type: Object,
			default: () => {
				return {};
			}
		},
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// 是否自动计算表格高度
		autoHeight: {
			type: Boolean,
			default: true
		},
		// 开启右键菜单
		contextMenu: {
			type: [Boolean, Array],
			default: undefined
		}
	},

	data() {
		return {
			maxHeight: null,
			data: [],
			emit: {}
		};
	},

	created() {
		// 获取默认排序
		const { order, prop } = this.props["default-sort"] || {};

		if (order && prop) {
			this.crud.params.order = order === "descending" ? "desc" : "asc";
			this.crud.params.prop = prop;
		}

		// 事件监听

		this.$on("resize", () => {
			this.calcMaxHeight();
		});

		this.$on("crud.refresh", ({ list }) => {
			this.data = list;
		});
	},

	mounted() {
		this.renderEmpty();
		this.calcMaxHeight();
		this.bindEmits();
		this.bindMethods();
	},

	methods: {
		// 渲染列
		renderColumn() {
			return this.columns
				.filter((e) => !e.hidden)
				.map((item, index) => {
					const deep = (item) => {
						let params = {
							props: item,
							on: item.on
						};

						// If op
						if (item.type === "op") {
							return this.renderOp(item);
						}

						// Default
						if (!item.type || item.type === "expand") {
							params.scopedSlots = {
								default: (scope) => {
									// Column-slot
									let slot = this.$scopedSlots[`column-${item.prop}`];

									let newScope = {
										...scope,
										...item
									};

									let value = scope.row[item.prop];

									if (slot) {
										// Use slot
										return slot({
											scope: newScope
										});
									} else {
										// If component
										if (item.component) {
											return renderNode(item.component, {
												prop: item.prop,
												scope: newScope.row
											});
										}
										// Formatter
										else if (item.formatter) {
											return item.formatter(
												newScope.row,
												newScope.column,
												newScope.row[item.prop],
												newScope.$index
											);
										}
										// Dict tag
										else if (item.dict) {
											let data = item.dict.find((d) => d.value == value);

											if (data) {
												// Use el-tag
												return (
													<el-tag
														{...{
															props: {
																size: "small",
																"disable-transitions": true,
																effect: "dark",
																...data
															}
														}}>
														{data.label}
													</el-tag>
												);
											} else {
												return value;
											}
										}
										// Empty text
										else if (isNull(value)) {
											return scope.emptyText;
										}
										// Value
										else {
											return value;
										}
									}
								},
								header: (scope) => {
									let slot = this.$scopedSlots[`header-${item.prop}`];

									if (slot) {
										return slot({
											scope
										});
									} else {
										return scope.column.label;
									}
								}
							};
						}

						// Children element
						const childrenEl = item.children ? item.children.map(deep) : null;

						return (
							<el-table-column
								key={`crud-table-column-${index}`}
								align="center"
								{...params}>
								{childrenEl}
							</el-table-column>
						);
					};

					return deep(item);
				});
		},

		// 渲染操作列
		renderOp(item) {
			const { rowEdit, rowDelete, permission, dict, style } = this.crud;

			if (!item) {
				return null;
			}

			// 渲染编辑、删除、自定义按钮
			const render = (scope) => {
				return (item.buttons || ["edit", "delete"]).map((vnode) => {
					if (vnode === "update" || vnode === "edit") {
						return (
							permission.update && (
								<el-button
									{...{
										props: {
											size: "mini",
											type: "text",
											...style.editBtn
										},
										on: {
											click: () => {
												rowEdit(scope.row);
											}
										}
									}}>
									{dict.label.update}
								</el-button>
							)
						);
					} else if (vnode === "delete") {
						return (
							permission.delete && (
								<el-button
									{...{
										props: {
											size: "mini",
											type: "text",
											...style.deleteBtn
										},
										on: {
											click: () => {
												rowDelete(scope.row);
											}
										}
									}}>
									{dict.label.delete}
								</el-button>
							)
						);
					} else {
						return renderNode(vnode, { scope, $scopedSlots: this.$scopedSlots });
					}
				});
			};

			return (
				<el-table-column
					{...{
						props: {
							label: "操作",
							width: "160px",
							align: "center",
							fixed: this.isMobile ? null : "right",
							...item,
							...style.tableOp
						},
						scopedSlots: {
							default: (scope) => {
								let el = null;

								// Dropdown op
								if (item.name == "dropdown-menu") {
									const slot = this.$scopedSlots["table-op-dropdown-menu"];
									const { width = "97px", label } = item["dropdown-menu"] || {};
									const items = render(scope).map((e) => {
										return <el-dropdown-item>{e}</el-dropdown-item>;
									});

									el = (
										<el-dropdown trigger="click" placement="bottom">
											{slot ? (
												slot({ scope })
											) : (
												<el-button plain size="mini">
													{label || "更多操作"}
													<i class="el-icon-arrow-down el-icon--right"></i>
												</el-button>
											)}

											<el-dropdown-menu
												style={{ width }}
												class="cl-crud__op-dropdown-menu"
												{...{ slot: "dropdown" }}>
												{items}
											</el-dropdown-menu>
										</el-dropdown>
									);
								} else {
									el = render(scope);
								}

								return <div class="cl-table__op">{el}</div>;
							}
						}
					}}
				/>
			);
		},

		// 渲染空数据
		renderEmpty() {
			const empty = this.$scopedSlots["table-empty"];
			const scope = {
				h: this.$createElement,
				scope: this
			};

			if (empty) {
				this.$scopedSlots.empty = () => {
					return empty(scope)[0];
				};
			}
		},

		// 渲染追加数据
		renderAppend() {
			return this.$slots["append"];
		},

		// 设置列
		setColumn(prop, data) {
			this.columns.forEach((e) => {
				if (e.prop === prop) {
					for (let i in data) {
						this.$set(e, i, data[i]);
					}
				}
			});
		},

		// 显示列
		showColumn(prop) {
			const props = isArray(prop) ? prop : [prop];

			this.columns
				.filter((e) => props.includes(e.prop))
				.forEach((e) => {
					this.$set(e, "hidden", false);
				});
		},

		// 隐藏列
		hiddenColumn(prop) {
			const props = isArray(prop) ? prop : [prop];

			this.columns
				.filter((e) => props.includes(e.prop))
				.forEach((e) => {
					this.$set(e, "hidden", true);
				});
		},

		// 改变排序方式
		changeSort(prop, order) {
			if (order === "desc") {
				order = "descending";
			}

			if (order === "asc") {
				order = "ascending";
			}

			this.$refs["table"].sort(prop, order);
		},

		// 监听排序
		onSortChange({ prop, order }) {
			if (order === "descending") {
				order = "desc";
			}

			if (order === "ascending") {
				order = "asc";
			}

			if (!order) {
				prop = null;
			}

			if (this.crud.test.sortLock) {
				this.crud.refresh({
					prop,
					order,
					page: 1
				});
			}
		},

		// 监听表格选择
		onSelectionChange(selection) {
			this.dispatch("cl-crud", "table.selection-change", { selection });
			this.$emit("selection-change", selection);
		},

		// 右键菜单
		onRowContextMenu(row, column, event) {
			const { refresh, rowEdit, rowDelete, getPermission, selection, table = {} } = this.crud;

			// 配置
			const cm =
				isEmpty(this.contextMenu) && !isArray(this.contextMenu)
					? table["context-menu"]
					: this.contextMenu;

			let buttons = ["refresh", "check", "edit", "delete", "order-asc", "order-desc"];
			let enable = false;

			if (cm) {
				if (isArray(cm)) {
					buttons = cm || [];
					enable = Boolean(buttons.length > 0);
				} else {
					enable = true;
				}
			}

			if (enable) {
				// 解析按钮
				let list = buttons
					.map((e) => {
						switch (e) {
							case "refresh":
								return {
									label: "刷新",
									callback: (_, done) => {
										refresh();
										done();
									}
								};
							case "edit":
							case "update":
								return {
									label: "编辑",
									hidden: !getPermission("update"),
									callback: (_, done) => {
										rowEdit(row);
										done();
									}
								};
							case "delete":
								return {
									label: "删除",
									hidden: !getPermission("delete"),
									callback: (_, done) => {
										rowDelete(row);
										done();
									}
								};
							case "check":
								return {
									label: Boolean(selection.find((e) => e.id == row.id))
										? "取消选择"
										: "选择",
									hidden: !Boolean(
										this.columns.find((e) => e.type === "selection")
									),
									callback: (_, done) => {
										this.toggleRowSelection(row);
										done();
									}
								};
							case "order-desc":
								return {
									label: `${column.label} - 降序`,
									hidden: !column.sortable,
									callback: (_, done) => {
										this.changeSort(column.property, "desc");
										done();
									}
								};
							case "order-asc":
								return {
									label: `${column.label} - 升序`,
									hidden: !column.sortable,
									callback: (_, done) => {
										this.changeSort(column.property, "asc");
										done();
									}
								};
							default:
								if (isFunction(e)) {
									return e(row, column, event);
								} else {
									return e;
								}
						}
					})
					.filter((e) => Boolean(e) && !e.hidden);

				// 打开右键菜单
				if (!isEmpty(list)) {
					this.$crud.openContextMenu(event, {
						list
					});
				}
			}

			if (this.on["row-contextmenu"]) {
				this.on["row-contextmenu"](row, column, event);
			}
		},

		// 绑定 el-table 回调
		bindEmits() {
			const emits = [
				"select",
				"select-all",
				"cell-mouse-enter",
				"cell-mouse-leave",
				"cell-click",
				"cell-dblclick",
				"row-click",
				"row-contextmenu",
				"row-dblclick",
				"header-click",
				"header-contextmenu",
				"filter-change",
				"current-change",
				"header-dragend",
				"expand-change"
			];

			emits.forEach((name) => {
				this.emit[name] = (...args) => {
					this.$emit(name, ...args);
				};
			});
		},

		// 绑定 el-table 事件
		bindMethods() {
			const methods = [
				"clearSelection",
				"toggleRowSelection",
				"toggleAllSelection",
				"toggleRowExpansion",
				"setCurrentRow",
				"clearSort",
				"clearFilter",
				"doLayout",
				"sort"
			];

			methods.forEach((n) => {
				this[n] = this.$refs["table"][n];
			});
		},

		// 计算表格最大高度
		calcMaxHeight() {
			if (!this.autoHeight) {
				return false;
			}

			return this.$nextTick(() => {
				const el = this.crud.$el.parentNode;
				let { height = "" } = this.props || {};

				if (el) {
					let rows = el.querySelectorAll(".cl-crud .el-row");

					if (!rows[0] || !rows[0].isConnected) {
						return false;
					}

					let h = 25;

					for (let i = 0; i < rows.length; i++) {
						let f = true;

						for (let j = 0; j < rows[i].childNodes.length; j++) {
							if (rows[i].childNodes[j].className == "cl-table") {
								f = false;
							}
						}

						if (f) {
							h += rows[i].clientHeight + 5;
						}
					}

					let h1 = Number(String(height).replace("px", ""));
					let h2 = el.clientHeight - h;

					this.maxHeight = h1 > h2 ? h1 : h2;
				}
			});
		}
	},

	render() {
		return (
			<div class="cl-table">
				<el-table
					ref="table"
					data={this.data}
					v-loading={this.crud.loading}
					{...{
						on: {
							"selection-change": this.onSelectionChange,
							"sort-change": this.onSortChange,
							...this.emit,
							...this.on,
							"row-contextmenu": this.onRowContextMenu
						},
						props: {
							"max-height": this.maxHeight + "px",
							border: true,
							size: "mini",
							...this.props,
							...this.crud.style.table
						},
						scopedSlots: {
							...this.$scopedSlots
						},
						slots: {
							...this.$slots
						}
					}}>
					{this.renderColumn()}
				</el-table>
			</div>
		);
	}
};
