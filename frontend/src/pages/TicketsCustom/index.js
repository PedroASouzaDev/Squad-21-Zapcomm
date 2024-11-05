import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import logo from "../../assets/logo.png"; //PLW DESIGN LOGO//
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	root: {
		height: "100vh",
		backgroundColor: theme.palette.background.main,
		flex: 1,
	},
	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagesWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		backgroundColor: theme.palette.boxticket, //DARK MODE PLW DESIGN//
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
}));

const TicketsCustom = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
				<div className={classes.root}>
					<Grid container spacing={0}>
						<Grid item xs={4} className={classes.contactsWrapper}>
							<TicketsManager />
						</Grid>
						<Grid item xs={8} className={classes.messagesWrapper}>
							{ticketId ? (
								<>
									<Ticket />
								</>
							) : (
								<Paper square variant="outlined" className={classes.welcomeMsg}>
								{/* PLW DESIGN LOGO */}
								<div>
								<center><img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="logologin" /></center>
								</div>
								{/* PLW DESIGN LOGO */}
								{/*<span>{i18n.t("chat.noTicketMessage")}</span>*/}
								</Paper>
							)}
						</Grid>
					</Grid>
				</div>
	);
};

export default TicketsCustom;
