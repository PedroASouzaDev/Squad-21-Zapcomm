import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";

import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import UpdateRoundedIcon from '@material-ui/icons/UpdateRounded';
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyRoundedIcon from "@material-ui/icons/HourglassEmptyRounded";
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import PriorityHighRoundedIcon from '@material-ui/icons/PriorityHighRounded';
import ForumIcon from "@material-ui/icons/Forum";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerRoundedIcon from '@material-ui/icons/TimerRounded';

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser"

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { collapseClasses } from "@mui/material";

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
  subroot: {
    display: "flex",
    gap: theme.spacing(6),
  },
  filtro: {
    display: "flex",
    gap: theme.spacing(5),
    justifyContent: "flex-end",
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
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

  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },

  //Grafico lateral
  graficoLateral: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    justifyContent: "space-evenly",
    width: "40%",
    maxWidth: "450px",
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
    width: "60%", //Backend Integration
    backgroundColor: "#0C2454",
    borderBottomRightRadius: "20px",
    borderTopRightRadius: "20px",
    borderTopLeftRadius: "5px",
    borderBottomLeftRadius: "5px",
    height: "32px",
  },
  greenRectangle: {
    width: "75%", //Backend Integration
    backgroundColor: "#34D3A3",
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
    if (value === 1) {
      graphType = 1;
    } else {
      graphType = 2;
    }
  }

  return (
    <div className={classes.root}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography
            variant="h4"
            color="primary"
          >
            Dashboard
          </Typography>

          <div className={classes.filtro}>
            {/* FILTROS */}
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
            <Box display={"flex"} alignContent={"center"}>
              <ButtonWithSpinner
                loading={loading}
                onClick={() => fetchData()}
                variant="contained"
                color="primary"
              >
                Filtrar
              </ButtonWithSpinner>
            </Box>
          </div>

        </Grid>
      <div className={classes.subroot}>
        <Container disableGutters="true">
          <Grid container spacing={6}>
            <Grid container item spacing={6}>

              {/* PENDENTE */}
              <Grid item  xs={12} sm={6} md={4}>
                <Paper
                  className={classes.card}
                  //elevation={6}  - "Box Shadow"
                  elevation={0}
                >
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
            </Grid>
            <Grid container item spacing={6}>

              {/* EM ANDAMENTO */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  className={classes.card}
                  //elevation={4} - "Box Shadow"
                  elevation={0}
                >
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
              <Grid item xs={12} sm={5} md={4}>
                <Paper
                  className={classes.card}
                  //elevation={6}  - "Box Shadow"
                  elevation={0}
                >
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
                  <Grid container alignItems="center" justifyContent="flex-start" spacing={8}>
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
                          T.M. de Atendimento
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Gráfico */}
            <Grid item xs={12}>
              <Paper elevation={0} className={classes.fixedHeightPaper2}>
                <Select
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
        </Container >
        
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
          <Grid container direction="column" spacing={2}>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Jan
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Fev
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Mar
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Abr
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Mai
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Jun
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Jul
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Ago
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Set
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Out
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Nov
              </Typography>
              <div className={classes.blueRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                42
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-start" alignItems="center">
              <Typography className={classes.monthName} variant="p" color="primary">
                Dez
              </Typography>
              <div className={classes.greenRectangle}></div>
              <Typography className={classes.monthNumber} variant="p" color="primary">
                52
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </div >
  );
};

export default Dashboard;