import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";

import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Calendar as CalendarSmall } from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SearchIcon from "@material-ui/icons/Search";
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import EditRoundedIcon from "@material-ui/icons/EditRounded";

import "./Schedules.css"; // Importe o arquivo CSS
import { Tabs, Tab } from "@material-ui/core/";
import Typography from "@material-ui/core/Typography";
import { Avatar, Box, Divider, IconButton } from "@mui/material";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@mui/material";
import { BackspaceRounded } from "@material-ui/icons";

// Defina a função getUrlParam antes de usá-la
function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px", // Defina um tamanho de fonte menor
  overflow: "hidden", // Oculte qualquer conteúdo excedente
  whiteSpace: "nowrap", // Evite a quebra de linha do texto
  textOverflow: "ellipsis", // Exiba "..." se o texto for muito longo
};

const localizer = momentLocalizer(moment);
var defaultMessages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Todo",
  week: "Semana",
  work_week: "Agendamentos",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há agendamentos no período.",
  showMore: function showMore(total) {
    return "+" + total + " mais";
  }
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    return [...state, ...action.payload];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;
    return state.filter((s) => s.id !== scheduleId);
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: theme.palette.background.main,
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
    gap: theme.spacing(4),
    flex: 1,
  },
  mainPaper: {
    flex: 1,
    borderRadius: theme.spacing(.5),
    maxHeight: "760px",
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  calendar: {
    ...theme.shape,
    ...theme.scrollbarStylesSoft,
  },
  sidePaper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "20%",
    padding: theme.spacing(2),
    gap: theme.spacing(3),
  },
  textField: {
    ...theme.textField,
  },
  tabs: {
    backgroundColor: theme.palette.light.main,
    width: "fit-content",
    ...theme.shape,
  },
  tab: {
    zIndex: 1,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    backgroundColor: theme.palette.background.main,
    ...theme.shape,
  },
}));

const Schedules = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));
  const [calendarType, setCalendarType] = useState(0);
  const [date, setDate] = useState(new Date());


  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules/", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    handleOpenScheduleModalFromContactId();
    const socket = socketManager.getSocket(user.companyId);

    socket.on(`company${user.companyId}-schedule`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [handleOpenScheduleModalFromContactId, socketManager, user]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const calendarProp = () => {
    switch ( calendarType ){
      case 0:
        return('month')
      case 1:
        return('week')
      case 2:
        return('day')
    }
  }

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("schedules.title")} ({schedules.length})</Title>
        <MainHeaderButtonsWrapper>
          <Tabs
            value={calendarType}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, v) => setCalendarType(v)}
            className={classes.tabs}
            TabIndicatorProps={{
              style: {
                height: "100%",
              }
            }}
          >
            <Tab label="Mês" className={classes.tab} style={{
              color: calendarType === 0 ? "#fff" : "inherit"
            }}/>
            <Tab label="Semana" className={classes.tab} style={{
              color: calendarType === 1 ? "#fff" : "inherit"
            }}/>
            <Tab label="Dia" className={classes.tab} style={{
              color: calendarType === 2 ? "#fff" : "inherit"
            }}/>
          </Tabs>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <div className={classes.subroot}>
        <Paper
          elevation={0}
          className={classes.sidePaper}
        >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleModal}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
          <Box display={"flex"} flexDirection={"column"} alignItems={"flex-end"} style={{ width: "100%" }}>
            <CalendarSmall
              value={date}
              onChange={(v) => setDate(v)}
            />
            <IconButton
              onClick={() => setDate(new Date())}
            >
              <BackspaceRounded 
                color="primary"
              />
            </IconButton>
          </Box>
          <Typography
            color="primary"
            style={{
              width: "100%"
            }}
            variant="h6"
          >
            Agendamentos
          </Typography>
          <TextField
            fullWidth
            className={classes.textField}
            variant="outlined"
            margin="dense"
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <div className={classes.listContainer}>
            <List dense>
              {schedules.map((schedule) => (
                <ListItem key={schedule.id} className={classes.listItem}>
                  <ListItemAvatar>
                    {/* É necessário analizar a origem (GET?) do Objeto Schedules */}
                    <Avatar src={schedule.contact.profilePicUrl} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={schedule.contact.name}
                  />
                  <IconButton
                    onClick={() => {
                      handleEditSchedule(schedule);
                      setScheduleModalOpen(true);
                    }}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </div>
        </Paper>
        <Paper className={classes.mainPaper} elevation={0} onScroll={handleScroll}>
          <Calendar
            date={date}
            className={classes.calendar}
            view={calendarProp()}
            views={[calendarProp()]}
            messages={defaultMessages}
            formats={{
              agendaDateFormat: "DD/MM ddd",
              weekdayFormat: "dddd"
            }}
            localizer={localizer}
            events={schedules.map((schedule) => ({
              title: (
                <div className="event-container">
                  <div style={eventTitleStyle}>{schedule.contact.name}</div>
                  <DeleteRoundedIcon
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="delete-icon"
                  />
                  <EditRoundedIcon
                    onClick={() => {
                      handleEditSchedule(schedule);
                      setScheduleModalOpen(true);
                    }}
                    className="edit-icon"
                  />
                </div>
              ),
              start: new Date(schedule.sendAt),
              end: new Date(schedule.sendAt),
            }))}
            startAccessor="start"
            endAccessor="end"
          />
        </Paper>
      </div>
      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        reload={fetchSchedules}
        aria-labelledby="form-dialog-title"
        scheduleId={selectedSchedule && selectedSchedule.id}
        contactId={contactId}
        cleanContact={cleanContact}
        activeDate={date}
      />
    </div>
  );
};

export default Schedules;