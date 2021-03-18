export default {
	name: "cl-multi-delete-btn",

	componentName: "ClMultiDeleteBtn",

	inject: ["crud"],

	props: {
		props: Object
	},

	render() {
		const { getPermission, dict, style, selection, deleteMulti } = this.crud;

		return (
			getPermission("delete") && (
				<el-button
					{...{
						props: {
							size: "mini",
							type: "danger",
							disabled: selection.length == 0,
							...this.props,
							...style.multiDeleteBtn
						},
						on: {
							click: deleteMulti
						}
					}}>
					{this.$slots.default || dict.label.multiDelete || dict.label.delete}
				</el-button>
			)
		);
	}
};
