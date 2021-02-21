export default {
    name: "cl-error-message",

    props: {
        title: String
    },

    render() {
        return () => {
            return <el-alert title={this.title} type="error"></el-alert>;
        };
    }
};
