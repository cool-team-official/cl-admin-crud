export default {
	name: "cl-add-btn",

	componentName: "ClAddBtn",

	inject: ["crud"],

	props: {
		props: Object
	},

	render() {
		const { getPermission, dict, style, rowAdd } = this.crud;

		return (
			getPermission("add") && (
				<el-button
					{...{
						props: {
							size: "mini",
							type: "primary",
							...this.props,
							...style.addBtn
						},
						on: {
							click: () => {
								rowAdd();
							}
						}
					}}>
					{this.$slots.default || dict.label.add}
				</el-button>
			)
		);
	}
};
