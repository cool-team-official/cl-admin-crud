export default {
	name: "cl-add-btn",
	componentName: "ClAddBtn",
	inject: ["crud"],
	props: {
		props: Object
	},
	render() {
		return (
			this.crud.getPermission("add") && (
				<el-button
					{...{
						props: {
							size: "mini",
							type: "primary",
							...this.props
						},
						on: {
							click: this.crud.rowAdd
						}
					}}>
					{this.$slots.default || this.crud.dict.label.add}
				</el-button>
			)
		);
	}
};
