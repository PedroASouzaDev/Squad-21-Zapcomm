/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
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
import FlagRoundedIcon from "@material-ui/icons/FlagRounded";
import PlayCircleOutlineRoundedIcon from "@material-ui/icons/PlayCircleFilledRounded";
import PauseCircleOutlineRoundedIcon from "@material-ui/icons/PauseCircleFilledRounded";

import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  table: {
    padding: "8px",
    borderCollapse: "separate", 
    borderSpacing: "0 1em", // Gap Width
  },
  avatar: {
    cursor: "pointer",
    backgroundColor: theme.palette.light.main,
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
    paddingRight: "0",
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

const Listing = () => {
  const classes = useStyles();

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);

  const { datetimeToClient } = useDate();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
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

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <MainHeader>
        <MainHeaderButtonsWrapper>
          <TextField
            className={classes.textField}
            variant="outlined"
            margin="dense"
            placeholder={i18n.t("campaigns.searchPlaceholder")}
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
          <Button
            variant="contained"
            onClick={handleOpenCampaignModal}
            color="primary"
          >
            {i18n.t("campaigns.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              {i18n.t("campaigns.table.name")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.status")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.contactList")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.whatsapp")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.scheduledAt")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.completedAt")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.confirmation")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("campaigns.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell align="center" className={classes.avatar} onClick={() => handleEditCampaign(campaign)}>{campaign.name}</TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {formatStatus(campaign.status)}
                </TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {campaign.contactListId
                    ? campaign.contactList.name
                    : "Não definida"}
                </TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {campaign.whatsappId
                    ? campaign.whatsapp.name
                    : "Não definido"}
                </TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {campaign.scheduledAt
                    ? datetimeToClient(campaign.scheduledAt)
                    : "Sem agendamento"}
                </TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {campaign.completedAt
                    ? datetimeToClient(campaign.completedAt)
                    : "Não concluída"}
                </TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditCampaign(campaign)}>
                  {campaign.confirmation ? "Habilitada" : "Desabilitada"}
                </TableCell>
                <TableCell align="center" className={classes.rowActions}>
                  {campaign.status === "EM_ANDAMENTO" && (
                    <IconButton
                      onClick={() => cancelCampaign(campaign)}
                      title="Parar Campanha"
                      size="small"
                    >
                      <PauseCircleOutlineRoundedIcon />
                    </IconButton>
                  )}
                  {campaign.status === "CANCELADA" && (
                    <IconButton
                      onClick={() => restartCampaign(campaign)}
                      title="Parar Campanha"
                      size="small"
                    >
                      <PlayCircleOutlineRoundedIcon />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() =>
                      history.push(`/campaign/${campaign.id}/report`)
                    }
                    size="small"
                  >
                    <FlagRoundedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingCampaign(campaign);
                    }}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={8} />}
          </>
        </TableBody>
      </Table>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingCampaign.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModal
        resetPagination={() => {
          setPageNumber(1);
          fetchCampaigns();
        }}
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        aria-labelledby="form-dialog-title"
        campaignId={selectedCampaign && selectedCampaign.id}
      />
    </div>
  );
};

export default Listing;