import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import EditRoundedIcon from "@material-ui/icons/EditRounded";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcement = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcement.id);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
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
    flexDirection: "column",
    gap: theme.spacing(3),
    flexGrow: 1,
  },
  mainPaper: {
    backgroundColor: "inherit",
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft,
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 1em",
  },
  avatar: {
    cursor: "pointer",
    backgroundColor: theme.palette.light.main,
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  rowActions: {
    backgroundColor: theme.palette.light.main,
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  rowCell: {
    cursor: "pointer",
    backgroundColor: theme.palette.light.main,
    height: "4em",
  },
  textField: {
    ...theme.textField,
  },
}));

const Announcements = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  // Barreira de Permissão 
  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-announcement`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.companyId]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const handleCloseAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      if (announcement.mediaName)
      await api.delete(`/announcements/${announcement.id}/media-upload`);

      await api.delete(`/announcements/${announcement.id}`);
      
      toast.success(i18n.t("announcements.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    dispatch({ type: "DELETE_ANNOUNCEMENT", payload: announcement });
    setDeletingAnnouncement(null);
    setSearchParam("");
    setPageNumber(1);
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

  const translatePriority = (val) => {
    if (val === 1) {
      return "Alta";
    }
    if (val === 2) {
      return "Média";
    }
    if (val === 3) {
      return "Baixa";
    }
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("announcements.title")} ({announcements.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            className={classes.textField}
            placeholder={i18n.t("announcements.searchPlaceholder")}
            type="search"
            variant="outlined"
            margin="dense"
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
          <Button
            margin="dense"
            variant="contained"
            onClick={handleOpenAnnouncementModal}
            color="primary"
          >
            {i18n.t("announcements.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <div className={classes.subroot}>
        <Paper
          className={classes.mainPaper}
          onScroll={handleScroll}
          elevation={0}
        >
          <Table size="small" className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  {i18n.t("announcements.table.title")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.priority")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.mediaName")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.status")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("announcements.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell align="center" className={classes.avatar} onClick={() => handleEditAnnouncement(announcement)}>
                      {announcement.title}
                    </TableCell>
                    <TableCell align="center" className={classes.rowCell} onClick={() => handleEditAnnouncement(announcement)}>
                      {translatePriority(announcement.priority)}
                    </TableCell>
                    <TableCell align="center" className={classes.rowCell} onClick={() => handleEditAnnouncement(announcement)}>
                      {announcement.mediaName ?? i18n.t("quickMessages.noAttachment")}
                    </TableCell>
                    <TableCell align="center" className={classes.rowCell} onClick={() => handleEditAnnouncement(announcement)}>
                      {announcement.status ? i18n.t("announcements.active") : i18n.t("announcements.inactive")}
                    </TableCell>
                    <TableCell align="center" className={classes.rowActions}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingAnnouncement(announcement);
                        }}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={5} />}
              </>
            </TableBody>
          </Table>
        </Paper>
      </div>
      <ConfirmationModal
        title={
          deletingAnnouncement &&
          `${i18n.t("announcements.confirmationModal.deleteTitle")} ${deletingAnnouncement.title}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteAnnouncement(deletingAnnouncement)}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <AnnouncementModal
        resetPagination={() => {
          setPageNumber(1);
          fetchAnnouncements();
        }}
        open={announcementModalOpen}
        onClose={handleCloseAnnouncementModal}
        aria-labelledby="form-dialog-title"
        announcementId={selectedAnnouncement && selectedAnnouncement.id}
      />
    </div>
  )
};

export default Announcements;