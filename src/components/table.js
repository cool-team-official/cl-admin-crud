import { renderNode } from "@/utils/vnode";
import { isNull, isArray, isEmpty } from "@/utils";
import { Emitter } from "@/mixins";
import { isFunction } from "../utils";

export default {
	name: "cl-table",
	componentName: "ClTable",
	inject: ["crud"],
	mixins: [Emitter],
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
		// Auto calc max height
		autoHeight: {
			type: Boolean,
			default: true
		},
		// Enable context-menu
		contextMenu: [Boolean, Array]
	},
	data() {
		return {
			maxHeight: null,
			data: [],
			emit: {}
		};
	},
	created() {
		// Get default sort
		const { order, prop } = this.props["default-sort"] || {};

		if (order && prop) {
			this.crud.params.order = order === "descending" ? "desc" : "asc";
			this.crud.params.prop = prop;
		}

		// Crud event
		this.$on("resize", () => {
			this.calcMaxHeight();
		});

		// Crud refresh
		this.$on("crud.refresh", ({ list }) => {
			this.data = list;
		});
	},
	mounted() {
		this.renderEmpty();
		this.calcMaxHeight();
		this.bindEmit();
		this.bindMethods();
	},
	methods: {
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
							<el-table-column key={`crud-table-column-${index}`} {...params}>
								{childrenEl}
							</el-table-column>
						);
					};

					return deep(item);
				});
		},

		renderOp(item) {
			const { rowEdit, rowDelete, getPermission } = this.crud;

			if (!item) {
				return null;
			}

			const render = (scope) => {
				// Use op button list
				return (item.buttons || ["edit", "delete"]).map((vnode) => {
					if (["edit", "update", "delete"].includes(vnode)) {
						// Get permission
						const perm = getPermission(vnode);

						if (perm) {
							let clickEvent = () => {};
							let buttonText = null;

							switch (vnode) {
								case "edit":
								case "update":
									clickEvent = rowEdit;
									buttonText = this.crud.dict.label.update;
									break;
								case "delete":
									clickEvent = rowDelete;
									buttonText = this.crud.dict.label.delete;
									break;
							}

							return (
								<el-button
									size="mini"
									type="text"
									on-click={() => {
										clickEvent(scope.row);
									}}>
									{buttonText}
								</el-button>
							);
						}
					} else {
						// Use custom render
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
							...item
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

		renderAppend() {
			return this.$slots["append"];
		},

		changeSort(prop, order) {
			if (order === "desc") {
				order = "descending";
			}

			if (order === "asc") {
				order = "ascending";
			}

			this.$refs["table"].sort(prop, order);
		},

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

		onSelectionChange(selection) {
			this.dispatch("cl-crud", "table.selection-change", { selection });
			this.$emit("selection-change", selection);
		},

		onRowContextMenu(row, column, event) {
			const { rowEdit, rowDelete, getPermission, selection, table = {} } = this.crud;

			// context-menu conf
			let cm =
				this.contextMenu || (isEmpty(this.contextMenu) ? false : table["context-menu"]);

			let buttons = ["check", "edit", "delete", "order-desc", "order-asc"];
			let enable = false;

			if (cm) {
				if (isArray(cm)) {
					buttons = cm || [];
					enable = buttons.length > 0;
				} else {
					enable = true;
				}
			}

			if (enable) {
				// Parse buttons
				let list = buttons
					.map((e) => {
						switch (e) {
							case "edit":
							case "update":
								return {
									label: "编辑",
									hidden: !getPermission("update"),
									callback: (e, done) => {
										rowEdit(row);
										done();
									}
								};
							case "delete":
								return {
									label: "删除",
									hidden: !getPermission("delete"),
									callback: (item, done) => {
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
									callback: (item, done) => {
										this.toggleRowSelection(row);
										done();
									}
								};
							case "order-desc":
								return {
									label: `${column.label} - 降序`,
									hidden: !column.sortable,
									callback: (item, done) => {
										this.changeSort(column.property, "desc");
										done();
									}
								};
							case "order-asc":
								return {
									label: `${column.label} - 升序`,
									hidden: !column.sortable,
									callback: (item, done) => {
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
					.filter(Boolean);

				// Open context menu
				this.$crud.openContextMenu(event, {
					list
				});
			}

			if (this.on["row-contextmenu"]) {
				this.on["row-contextmenu"](row, column, event);
			}
		},

		bindEmit() {
			const funcs = [
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

			funcs.forEach((name) => {
				this.emit[name] = (...args) => {
					this.$emit.apply(this, [name, ...args]);
				};
			});
		},

		bindMethods() {
			const list = [
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

			list.forEach((n) => {
				this[n] = this.$refs["table"][n];
			});
		},

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

					let h = 20;

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
							...this.props
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
