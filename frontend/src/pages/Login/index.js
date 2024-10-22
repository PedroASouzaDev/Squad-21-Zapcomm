import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid"; 
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";
import img from "../../assets/login.png";


export const Copyright = () => {
	return (
		<Typography variant="body2" color="primary" align="center">
			{"Copyright "}
 			<Link color="primary" href="#">
 				{ nomeEmpresa } - v { versionSystem }
 			</Link>{" "}
 			{new Date().getFullYear()}
 			{"."}
 		</Typography>
 	);
 };

const useStyles = makeStyles(theme => ({
	root: {
		margin: "0",
		padding: "0",
		width: "100vw",
		height: "100vh",
		//background: "linear-gradient(to right, #682EE3 , #682EE3 , #682EE3)",
		//backgroundImage: "url(https://i.imgur.com/CGby9tN.png)",
		backgroundColor: theme.palette.background.main,
		//backgroundRepeat: "no-repeat",
		//backgroundSize: "100% 100%",
		//backgroundPosition: "center",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
	paper: {
		backgroundColor: theme.palette.login,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-evenly",
		textAlign: "center",
		padding: "2em",
		justifySelf: "left",
		height: "100%",
		width: "30%",
		boxSizing: "border-box",
		paddingTop: "3em",
		paddingBottom: "3em",
	},
	flexFill: {
		display: "flex",
		justifyContent: "center",
		flexGrow: "1",
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	powered: {
		color: "white"
	}
}));

const Login = () => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};

	
	return (
		<div className={classes.root}>
		<CssBaseline/>
		<div className={classes.paper}>
			<div>
				<img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="Whats" />
			</div>
			{/*<Typography component="h1" variant="h5">
				{i18n.t("login.title")}
			</Typography>*/}
			<form className={classes.form} noValidate onSubmit={handlSubmit}>
				<TextField
					variant="outlined"
					margin="normal"
					required
					fullWidth
					id="email"
					label="Email"
					name="email"
					value={user.email}
					onChange={handleChangeInput}
					autoComplete="email"
					autoFocus
				/>
				<TextField
					variant="outlined"
					margin="normal"
					required
					fullWidth
					name="password"
					label="Senha"
					type="password"
					id="password"
					value={user.password}
					onChange={handleChangeInput}
					autoComplete="current-password"
				/>
				
				{/* <Grid container justify="flex-end">
					<Grid item xs={6} style={{ textAlign: "right" }}>
					<Link component={RouterLink} to="/forgetpsw" variant="body2">
						Esqueceu sua senha?
					</Link>
					</Grid>
				</Grid>*/}
				
				<Button
					type="submit"
					fullWidth
					variant="contained"
					color="primary"
					className={classes.submit}
				>
					Entrar
					{/*{i18n.t("login.buttons.submit")}*/}
				</Button>
				{ <Grid container>
					<Grid item>
						Não tem conta ainda?_
						<Link
							href="#"
							variant="body2"
							component={RouterLink}
							to="/signup"
						>
							SignUp
						</Link>
					</Grid>
				</Grid> }
			</form>
			<Box mt={8}><Copyright /></Box>
		</div>
		<div className={classes.flexFill}>
				<img
					src={img}
				
				></img>

			</div>
		</div>
	);
};

export default Login;
