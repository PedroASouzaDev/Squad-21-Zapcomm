import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";

import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  mainPaper: {
    width: "100%",
    flex: 1,
  },
  fullWidth: {
    width: "100%",
  },
  tableContainer: {
    width: "100%",
    overflowX: "scroll",
    ...theme.scrollbarStylesSoft,
  },
  table: {
    borderCollapse: "separate", 
    borderSpacing: "0 1em", // Gap Width
  },
  rowStart: {
    cursor: "pointer",
    backgroundColor: "#F7F7F8",
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
    paddingRight: "0",
  },
  rowEnd: {
    cursor: "pointer",
    backgroundColor: "#F7F7F8",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  rowCell: {
    cursor: "pointer",
    backgroundColor: "#F7F7F8",
    height: "4em",
  },
  textfield: {
    width: "100%",
  },
  textRight: {
    textAlign: "right",
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  control: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format(
          "YYYY-MM-DD"
        );
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => {
            handleSubmit(values);
            resetForm();
          }, 500)
        }
      >
        {(values, setValues) => (
          <Form className={classes.fullWidth}>
            <Grid spacing={2} justifyContent="flex-end" container>
              <Grid xs={12} sm={6} md={4} item>
                <Field
                  as={TextField}
                  label="Nome"
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="E-mail"
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label="Telefone"
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Status</InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label="Status"
                    labelId="status-selection-label"
                    name="status"
                  >
                    <MenuItem value={true}>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Campanhas</InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label="Campanhas"
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <Field
                    as={TextField}
                    label="Data de Vencimento"
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="recorrencia-selection">
                    Recorrência
                  </InputLabel>
                  <Field
                    as={Select}
                    label="Recorrência"
                    labelId="recorrencia-selection-label"
                    id="recurrence"
                    name="recurrence"
                  >
                    <MenuItem value="MENSAL">Mensal</MenuItem>
                    {/*<MenuItem value="BIMESTRAL">Bimestral</MenuItem>*/}
                    {/*<MenuItem value="TRIMESTRAL">Trimestral</MenuItem>*/}
                    {/*<MenuItem value="SEMESTRAL">Semestral</MenuItem>*/}
                    {/*<MenuItem value="ANUAL">Anual</MenuItem>*/}
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} item>
                <Grid justifyContent="flex-end" spacing={2} container>
                  <Grid xs={4} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      Limpar
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id !== undefined ? (
                    <>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                        >
                          Excluir
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={2} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          + Vencimento
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          color="primary"
                        >
                          Usuário
                        </ButtonWithSpinner>
                      </Grid>
                    </>
                  ) : null}
                  <Grid xs={6} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Salvar
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const { dateToClient } = useDate();

  const renderStatus = (row) => {
    return row.status === false ? "Não" : "Sim";
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan.name : "-";
  };

  const renderCampaignsStatus = (row) => {
    if (
      has(row, "settings") &&
      isArray(row.settings) &&
      row.settings.length > 0
    ) {
      const setting = row.settings.find((s) => s.key === "campaignsEnabled");
      if (setting) {
        return setting.value === "true" ? "Habilitadas" : "Desabilitadas";
      }
    }
    return "Desabilitadas";
  };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff === 5) {
        return { backgroundColor: "#fffead" };
      }
      if (diff >= -3 && diff <= 4) {
        return { backgroundColor: "#f7cc8f" };
      }
      if (diff === -4) {
        return { backgroundColor: "#fa8c8c" };
      }
    }
    return {};
  };

  return (
    <div className={classes.tableContainer}>
      <Table
        className={classes.table}
        size="small"
        aria-label="a dense table"
      >
        <TableHead>
          <TableRow>
            <TableCell align="center">Nome</TableCell>
            <TableCell align="center">E-mail</TableCell>
            <TableCell align="center">Telefone</TableCell>
            <TableCell align="center">Plano</TableCell>
            <TableCell align="center">Campanhas</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Criada Em</TableCell>
            <TableCell align="center">Vencimento</TableCell>
            <TableCell align="center" style={{ width: "1%" }}>
              #
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => (
            <TableRow style={rowStyle(row)} key={key}>
              <TableCell align="center" className={classes.rowStart} onClick={() => onSelect(row)}>{row.name || "-"}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{row.email || "-"}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{row.phone || "-"}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{renderPlan(row)}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{renderCampaignsStatus(row)}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{renderStatus(row)}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>{dateToClient(row.createdAt)}</TableCell>
              <TableCell align="center" className={classes.rowCell} onClick={() => onSelect(row)}>
                {dateToClient(row.dueDate)}
                <br />
                <span>{row.recurrence}</span>
              </TableCell>
              <TableCell align="center" style={{ width: "1%" }} className={classes.rowEnd}>
              <IconButton onClick={() => onSelect(row)} aria-label="delete">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
  });

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      campaignsEnabled: false,
      dueDate: "",
      recurrence: "",
    }));
  };

  const handleSelect = (data) => {
    let campaignsEnabled = false;

    const setting = data.settings.find(
      (s) => s.key.indexOf("campaignsEnabled") > -1
    );
    if (setting) {
      campaignsEnabled =
        setting.value === "true" || setting.value === "enabled";
    }

    setRecord((prev) => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
    }));
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <CompanyForm
        initialValue={record}
        onDelete={handleOpenDeleteDialog}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
      <CompaniesManagerGrid records={records} onSelect={handleSelect} />
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}
