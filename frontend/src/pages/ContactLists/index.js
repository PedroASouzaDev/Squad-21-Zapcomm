import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
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
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import EditRoundedIcon from "@material-ui/icons/EditRounded";
import PeopleRoundedIcon from "@material-ui/icons/PeopleRounded";
import GetAppRoundedIcon from "@material-ui/icons/GetAppRounded";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  subroot: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    flexGrow: 1,
  },
  table: {
    padding: "8px",
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
    flex: 1,
    ...theme.textField,
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <MainHeaderButtonsWrapper>
          <TextField
            className={classes.textField}
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
            variant="contained"
            margin="dense"
            color="primary"
            onClick={handleOpenContactListModal}
          >
            {i18n.t("contactLists.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              {i18n.t("contactLists.table.name")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("contactLists.table.contacts")}
            </TableCell>
            <TableCell align="center">
              {i18n.t("contactLists.table.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <>
            {contactLists.map((contactList) => (
              <TableRow key={contactList.id}>
                <TableCell align="center"  className={classes.avatar} onClick={() => handleEditContactList(contactList)}>{contactList.name}</TableCell>
                <TableCell align="center" className={classes.rowCell} onClick={() => handleEditContactList(contactList)}>
                  {contactList.contactsCount || 0}
                </TableCell>
                <TableCell align="center" className={classes.rowActions}>
                  <a href={planilhaExemplo} download="planilha.xlsx">
                    <IconButton size="small" title="Baixar Planilha Exemplo">
                      <GetAppRoundedIcon />
                    </IconButton>
                  </a>
                  <IconButton
                    size="small"
                    onClick={() => goToContacts(contactList.id)}
                  >
                    <PeopleRoundedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditContactList(contactList)}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingContactList(contactList);
                    }}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={3} />}
          </>
        </TableBody>
      </Table>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
    </div>
  );
};

export default ContactLists;
