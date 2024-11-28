import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import UpdateRoundedIcon from '@material-ui/icons/UpdateRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import PriorityHighRoundedIcon from '@material-ui/icons/PriorityHighRounded';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerRoundedIcon from '@material-ui/icons/TimerRounded';

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import { ChatsUser } from "./ChartsUser"

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { collapseClasses } from "@mui/material";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.background.main,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft
  },
  header: {
    flexWrap: "wrap",
  },
  subroot: {
    display: "flex",
    gap: theme.spacing(5),
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  filtro: {
    display: "flex",
    gap: theme.spacing(5),
  },
  graphPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  flexRowSpacing: {
    display: "flex",
    gap: theme.spacing(5),
  },
  flexSpacing: {
    display: "flex",
    gap: theme.spacing(3),
    flex: 1,
  },

  // Cards
  card: {
    padding: theme.spacing(2.5),
    //backgroundColor: theme.palette.primary.main,
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.boxticket.main : theme.palette.light.main,
  },
  pendenteIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#efefff",
  },
  novosIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#eff4ff",
  },
  andamentoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#fff7e1",
  },
  esperaIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#f3f4f6",
  },
  atendimentoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#f5fdfa",
  },

  finalizadoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#ebfbf6",
  },
  chamadoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "circle()",
    padding: theme.spacing(3),
    backgroundColor: "#efefff",
  },

  //Grafico lateral
  graficoLateral: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    justifyContent: "space-evenly",
    minWidth: "350px",
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.boxticket.main : theme.palette.light.main,
  },
  byMonth: {
    backgroundColor: "white",
    width: "fit-content",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  monthList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  month: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  monthName: {
    width: "52px",
    textAlign: "center",
  },
  monthNumber: {
    width: "32px",
    textAlign: "right",
  },
  blueRectangle: {
    width: "50%", //Backend Integration
    backgroundColor: theme.palette.primary.main,
    borderBottomRightRadius: "20px",
    borderTopRightRadius: "20px",
    borderTopLeftRadius: "5px",
    borderBottomLeftRadius: "5px",
    height: "32px",
  },
  greenRectangle: {
    width: "65%", //Backend Integration
    backgroundColor: theme.palette.secondary.main,
    borderBottomRightRadius: "20px",
    borderTopRightRadius: "20px",
    borderTopLeftRadius: "5px",
    borderBottomLeftRadius: "5px",
    height: "32px",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [graphType, setGraphType] = useState(2);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
    async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };
  
    const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };
  
  // FALTA IMPLEMENTAÇÃO COM BACKEND
  const sideRectangles = [
    { id: 0, month: "Jan", count: 42},
    { id: 1, month: "Fev", count: 52},
    { id: 2, month: "Mar", count: 42},
    { id: 3, month: "Abr", count: 52},
    { id: 4, month: "Mai", count: 42},
    { id: 5, month: "Jun", count: 52},
    { id: 6, month: "Jul", count: 42},
    { id: 7, month: "Ago", count: 52},
    { id: 8, month: "Set", count: 42},
    { id: 9, month: "Out", count: 52},
    { id: 10, month: "Nov", count: 42},
    { id: 11, month: "Dez", count: 52},
  ];

  console.log(sideRectangles)

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl>
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      );
    }
  }

  function renderGraph(){
    if(graphType === 1) {
      return (
        <ChatsUser />
      );
    }else{
      return (
        <ChartsDate />
      );
    }
  }

  async function handleChangeGraphType(value) {
    setGraphType(value);
  }

  return (
    <div className={classes.root}>
      <MainHeader className={classes.header} >
        <Title>Dashboard</Title>
        <MainHeaderButtonsWrapper>
          {/* FILTROS */}
          <div className={classes.filtro}>
            <FormControl>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
            </FormControl>
            {renderFilters()}
            
            {/* BOTAO FILTRAR */}
              <ButtonWithSpinner
                loading={loading}
                onClick={() => fetchData()}
                variant="contained"
                color="primary"
              >
                Filtrar
              </ButtonWithSpinner>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>

        <Grid container spacing={2}>
          <Grid container item md={8} spacing={2}>
              <Grid container item spacing={2}>

                {/* PENDENTE */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={6}  - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.pendenteIcon}>
                          <PriorityHighRoundedIcon
                            style={{
                              fontSize: 36,
                              color: "#5B93FF",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {counters.supportPending}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            Pendente
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* NOVOS CHAMADOS */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={6}  - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.novosIcon}>
                          <AddBoxRoundedIcon
                            style={{
                              fontSize: 36,
                              color: "#605BFF",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {GetContacts(true)}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            Novos
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* T.M. DE ESPERA */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={6}  - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.esperaIcon}>
                          <TimerRoundedIcon
                            style={{
                              fontSize: 36,
                              color: "#0C2454",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {formatTime(counters.avgWaitTime)}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            T.M. de Espera
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* EM ANDAMENTO */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={4} - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.andamentoIcon}>
                          <UpdateRoundedIcon
                            style={{
                              fontSize: 36,
                              color: "#d9b353",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {counters.supportHappening}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            Andamento
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* FINALIZADOS */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={6}  - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.finalizadoIcon}>
                          <CheckRoundedIcon
                            style={{
                              fontSize: 36,
                              color: "#33d0a1",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {counters.supportFinished}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            Finalizados
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* T.M. DE ATENDIMENTO */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    className={classes.card}
                    //elevation={6}  - "Box Shadow"
                    elevation={0}
                  >
                    <Grid container alignItems="center" spacing={8} wrap="nowrap">
                      <Grid item>
                        <Paper className={classes.atendimentoIcon}>
                          <AccessAlarmIcon
                            style={{
                              fontSize: 36,
                              color: "#33d0a1",
                            }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Grid container direction="column" item spacing={3}>
                          <Typography
                            variant="h5"
                          >
                            {formatTime(counters.avgSupportTime)}
                          </Typography>
                          <Typography
                            variant="body1"
                          >
                            T.M. de Atend.
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
            </Grid>

              {/* Gráfico */}
              <Grid item md={12}>
                <Paper elevation={0} className={classes.graphPaper}>
                  <Select
                    margin="dense"
                    variant="outlined"
                    value={graphType}
                    onChange={(e) => handleChangeGraphType(e.target.value)}
                  >
                    <MenuItem value={1}>Atendimentos</MenuItem>
                    <MenuItem value={2}>Atendimentos por Usuário</MenuItem>
                  </Select>
                  {renderGraph()}
                </Paper>
              </Grid>
          </Grid>

          <Grid item md={4} >
            {/* GRAFICO LATERAL */}
            <Paper elevation={0} className={classes.graficoLateral}>
              <Typography
                variant="h5"
                color="primary"
                style={{
                  textAlign: "center",
                }}
              >
                Chamados Mensal
              </Typography>

                {sideRectangles && sideRectangles.map(rec => (
                  <Grid container direction="column" spacing={2}>
                    <Grid container item justifyContent="flex-start" alignItems="center">
                      <Typography className={classes.monthName} variant="p" color="primary">
                        {rec.month}
                      </Typography>
                      <div className={`${rec.id % 2 ? classes.blueRectangle : classes.greenRectangle}`}></div>
                      <Typography className={classes.monthNumber} variant="p" color="primary">
                        {rec.count}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
            </Paper>
          </Grid>
        </Grid>
    </div >
  );
};

export default Dashboard;