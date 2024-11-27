import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	contactsHeader: {
		display: "flex",
		alignItems: "center",
	},
}));

const MainHeader = ({ children, className }) => {
	const classes = useStyles();

	return <div className={`${classes.contactsHeader} ${className}`}>{children}</div>;
};

export default MainHeader;
