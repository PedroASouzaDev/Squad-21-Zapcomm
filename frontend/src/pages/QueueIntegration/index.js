import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { SocketContext } from "../../context/Socket/SocketContext";
import n8n from "../../assets/n8n.png";
import dialogflow from "../../assets/dialogflow.png";
import webhooks from "../../assets/webhook.png";
import typebot from "../../assets/typebot.jpg";

import { makeStyles } from "@material-ui/core/styles";

import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip
} from "@material-ui/core";

import {
  DeleteForeverRounded,
  DeleteOutline,
  Search,
  EditRounded
} from "@material-ui/icons";

import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;

    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
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
  },
  mainPaper: {
    flex: 1,
    backgroundColor: "inherit",
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 1em",
  },
  avatar: {
    backgroundColor: theme.palette.light.main,
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
    paddingRight: "0",
    width: "140px",
    height: "40px",
  },
  rowActions: {
    backgroundColor: theme.palette.light.main,
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  rowCell: {
    backgroundColor: theme.palette.light.main,
    height: "4em",
  },
  textField: {
    ...theme.textField,
  },
}));

const QueueIntegration = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;
  const history = useHistory();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
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
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
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

  return (
      <div className={classes.root}>
        <MainHeader>
          <Title>{i18n.t("queueIntegration.title")} ({queueIntegration.length})</Title>
          <MainHeaderButtonsWrapper>
            <TextField
              className={classes.textField}
              placeholder={i18n.t("queueIntegration.searchPlaceholder")}
              type="search"
              variant="outlined"
              margin="dense"
              value={searchParam}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenUserModal}
            >
              {i18n.t("queueIntegration.buttons.add")}
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
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell align="center">{i18n.t("queueIntegration.table.id")}</TableCell>
                  <TableCell align="center">{i18n.t("queueIntegration.table.name")}</TableCell>
                  <TableCell align="center">{i18n.t("queueIntegration.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  {queueIntegration.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell className={classes.avatar}>
                        {integration.type === "dialogflow" && (<Avatar
                          src={dialogflow} className={classes.avatar} />)}
                        {integration.type === "n8n" && (<Avatar
                          src={n8n} className={classes.avatar} />)}
                        {integration.type === "webhook" && (<Avatar
                          src={webhooks} className={classes.avatar} />)}
                        {integration.type === "typebot" && (<Avatar
                          src={typebot} className={classes.avatar} />)}
                      </TableCell>
                      <TableCell align="center" className={classes.rowCell}>{integration.id}</TableCell>
                      <TableCell align="center" className={classes.rowCell}>{integration.name}</TableCell>
                      <TableCell align="center" className={classes.rowActions}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditIntegration(integration)}
                        >
                          <EditRounded/>
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingUser(integration);
                          }}
                        >
                          <DeleteForeverRounded/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={7} />}
                </>
              </TableBody>
            </Table>
          </Paper>
        </div>
        <ConfirmationModal
          title={
            deletingUser &&
            `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name
            }?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteIntegration(deletingUser.id)}
        >
          {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <IntegrationModal
          open={userModalOpen}
          onClose={handleCloseIntegrationModal}
          aria-labelledby="form-dialog-title"
          integrationId={selectedIntegration && selectedIntegration.id}
        />
      </div>
  );
};

export default QueueIntegration;