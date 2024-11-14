import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader"
import { Button, CircularProgress, Divider, Grid, TextField, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
// import api from "../../services/api";
import axios from "axios";
import usePlans from "../../hooks/usePlans";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    overflowY: "scroll",
    backgroundColor: theme.palette.background.main,
    ...theme.scrollbarStylesSoft
  },
  mainPaper: {
    backgroundColor: theme.palette.light.main,
    padding: theme.spacing(2),
  },
  mainHeader: {
    marginTop: theme.spacing(1),
  },
  elementMargin: {
    padding: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right"
  },
  textField: {
    ...theme.textField,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    marginBottom: theme.spacing(3),
    alignContent: "center",
  }
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();

  const [formMessageTextData,] = useState({ token: '', number: '', body: '' })
  const [formMessageMediaData,] = useState({ token: '', number: '', medias: '' })
  const [file, setFile] = useState({})

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send'
  }

  const handleSendTextMessage = async (values) => {
    const { number, body } = values;
    const data = { number, body };
    try {
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${values.token}`
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', firstFile.name);
      data.append('medias', firstFile);
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'multipart/form-data',
          'Authorization': `Bearer ${values.token}`
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.token")}
                  name="token"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.number")}
                  name="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
            document.getElementById('medias').files = null
            document.getElementById('medias').value = null
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.token")}
                  name="token"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.number")}
                  name="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input type="file" name="medias" id="medias" required onChange={(e) => setFile(e.target.files)} />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>Como enviar Mensagens:</Title>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        style={{marginLeft: "5px"}}
        // className={classes.elementMargin}
        variant="outlined"
      >
        <Typography className={classes.elementMargin} component="div">
          <Typography variant="h6" color="primary">
            Observações importantes:
          </Typography>
          <ul>
            <li>
              Antes de enviar mensagens, é necessário o cadastro do token vinculado à conexão que enviará as mensagens.
              <br />
              Para realizar o cadastro acesse o menu "Conexões", clique no botão editar da conexão e insira o token no devido campo.
            </li>
              <br />
            <li>
              O número para envio não deve ter mascara ou caracteres especiais e deve ser composto por:
              <ul>
                <li>Código do país</li>
                <li>DDD</li>
                <li>Número</li>
              </ul>
            </li>
          </ul>
        </Typography>

        <Divider/>
        <div className={classes.paper}>
          <Grid container direction="column">
            <Typography variant="h6" color="primary">
              1. Mensagens de Texto
            </Typography>
            <Typography className={classes.elementMargin} component="div">
              <p>Seguem abaixo a lista de informações necessárias para envio das mensagens de texto:</p>
              <b>Endpoint: </b> {getEndpoint()} <br />
              <b>Método: </b> POST <br />
              <b>Headers: </b> Authorization (Bearer token) e Content-Type (application/json) <br />
              <b>Body: </b> {"{ \"number\": \"5599999999999\", \"body\": \"Sua mensagem\" }"}
            </Typography>
          </Grid>
          <Grid>
            <Typography className={classes.elementMargin}>
              <b>Teste de Envio</b>
            </Typography>
            {renderFormMessageText()}
          </Grid>
        </div>

        <Divider/>
        <div className={classes.paper}>
          <Grid container direction="column">
            <Typography variant="h6" color="primary">
              2. Mensagens de Media
            </Typography>
            <Typography className={classes.elementMargin} component="div">
              <p>Seguem abaixo a lista de informações necessárias para envio das mensagens de texto:</p>
              <b>Endpoint: </b> {getEndpoint()} <br />
              <b>Método: </b> POST <br />
              <b>Headers: </b> Authorization (Bearer token) e Content-Type (multipart/form-data) <br />
              <b>FormData: </b> <br />
              <ul>
                <li>
                  <b>number: </b> 5599999999999
                </li>
                <li>
                  <b>medias: </b> arquivo
                </li>
              </ul>
            </Typography>
          </Grid>
          <Grid style={{
            display: "flex",
            alignItems: "center",
          }}>
            <div>
              <Typography className={classes.elementMargin}>
                <b>Teste de Envio</b>
              </Typography>
              {renderFormMessageMedia()}
            </div>
          </Grid>
        </div>
      </Paper>
    </div>
  );
};

export default MessagesAPI;
