import React, { useState, useEffect } from "react";
import qs from 'query-string'

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans/index.js";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import InputMask from 'react-input-mask';
import {
	MenuItem,
	Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import logo from "../../assets/logo.png";
import img from "../../assets/signin.png";
import { i18n } from "../../translate/i18n";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import { Copyright } from "../Login/index.js";

// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyright © "}
// 			<Link color="inherit" href="#">
// 				PLW
// 			</Link>{" "}
// 		   {new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

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

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();
	let companyId = null

	const params = qs.parse(window.location.search)
	if (params.companyId !== undefined) {
		companyId = params.companyId
	}
	const initialState = { name: "", email: "", phone: "", password: "", planId: 1, };

	const [user] = useState(initialState);
	const dueDate = moment().add(3, "day").format();
	const handleSignUp = async values => {
		Object.assign(values, { recurrence: "MENSAL" });
		Object.assign(values, { dueDate: dueDate });
		Object.assign(values, { status: "t" });
		Object.assign(values, { campaignsEnabled: true });
		try {
			await openApi.post("/companies/cadastro", values);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};


	return (
		<div className={classes.root}>
			<CssBaseline />
			<div className={classes.paper}>
				<div>
					<center><img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="Whats" /></center>
				</div>
				{/*<Typography component="h1" variant="h5">
					{i18n.t("signup.title")}
				</Typography>*/}
				{/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
				<Formik
				 	initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSignUp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form className={classes.form}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										as={TextField}
										autoComplete="name"
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										fullWidth
										id="name"
										label="Nome da Empresa"
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
										required
									/>
								</Grid>
								
							<Grid item xs={12}>
								<Field
									as={InputMask}
									mask="(99) 99999-9999"
									variant="outlined"
									fullWidth
									id="phone"
									name="phone"
									error={touched.phone && Boolean(errors.phone)}
									helperText={touched.phone && errors.phone}
									autoComplete="phone"
									required
								>
									{({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											fullWidth
											label="Telefone com (DDD)"
											inputProps={{ maxLength: 11 }} // Definindo o limite de caracteres
										/>
									)}
								</Field>
							</Grid>
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										label={i18n.t("signup.form.password")}
										type="password"
										id="password"
										autoComplete="current-password"
										required
									/>
								</Grid>
							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submit}
							>
								{i18n.t("signup.buttons.submit")}
							</Button>
							<Grid container>
								<Grid item>
									Já possui uma conta?_
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										Login
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
				<Box mt={5}><Copyright /></Box>
			</div>
			<div className={classes.flexFill}>
				<img
					src={img}
				>
				</img>

			</div>
		</div>	
	);
};

export default SignUp;
