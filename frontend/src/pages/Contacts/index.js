import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { ListItem, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Title from "../../components/Title";

import IconButton from "@material-ui/core/IconButton";
import DeleteForeverRoundedIcon from "@material-ui/icons/DeleteForeverRounded";
import EditRoundedIcon from "@material-ui/icons/EditRounded";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import {CSVLink} from "react-csv";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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
    borderSpacing: "0 1em", // Gap Width
  },
  avatar: {
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
    backgroundColor: theme.palette.light.main,
    height: "4em",
  },
  textField: {
    ...theme.textField,
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  // const handleSaveTicket = async contactId => {
  // 	if (!contactId) return;
  // 	setLoading(true);
  // 	try {
  // 		const { data: ticket } = await api.post("/tickets", {
  // 			contactId: contactId,
  // 			userId: user?.id,
  // 			status: "open",
  // 		});
  // 		history.push(`/tickets/${ticket.id}`);
  // 	} catch (err) {
  // 		toastError(err);
  // 	}
  // 	setLoading(false);
  // };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
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
      {/* HEADER */}
      <MainHeader>
        <Title>Contatos</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            className={classes.textField}
            color="primary"
            variant="outlined"
            margin="dense"
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
            color="primary"
            onClick={handleOpenContactModal}
          >
            Adicionar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => setConfirmOpen(true)}
          >
            Importar
          </Button>
          <Button
          variant="contained"
          color="primary"
          >
            Exportar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <div className={classes.subroot}>
        <NewTicketModal
          modalOpen={newTicketModalOpen}
          initialContact={contactTicket}
          onClose={(ticket) => {
            handleCloseOrOpenTicket(ticket);
          }}
        />
        <ContactModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          aria-labelledby="form-dialog-title"
          contactId={selectedContactId}
        ></ContactModal>
        <ConfirmationModal
          title={
            deletingContact
              ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                  deletingContact.name
                }?`
              : `${i18n.t("contacts.confirmationModal.importTitlte")}`
          }
          open={confirmOpen}
          onClose={setConfirmOpen}
          onConfirm={(e) =>
            deletingContact
              ? handleDeleteContact(deletingContact.id)
              : handleimportContact()
          }
        >
          {deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
            : `${i18n.t("contacts.confirmationModal.importMessage")}`}
        </ConfirmationModal>
      
        {/* MAIN CONTAINER */}
        <Paper
          className={classes.mainPaper}
          elevation={0}
          onScroll={handleScroll}
        >
          <Table size="small" className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.whatsapp")}
                </TableCell>
                <TableCell align="center">
                  {i18n.t("contacts.table.email")}
                </TableCell>
                <TableCell align="right">
                  <Grid container justifyContent="flex-end">
                    <Box textAlign={"center"} width={"90px"}>
                      {i18n.t("contacts.table.actions")}
                    </Box>
                  </Grid>
                </TableCell>
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className={classes.row}>
                    <TableCell className={classes.avatar}>
                      {<Avatar src={contact.profilePicUrl} />}
                    </TableCell>
                    <TableCell className={classes.rowCell}>{contact.name}</TableCell>
                    <TableCell className={classes.rowCell} align="center">{contact.number}</TableCell>
                    <TableCell className={classes.rowCell} align="center">{contact.email}</TableCell>
                    <TableCell className={classes.rowActions} align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setContactTicket(contact);
                          setNewTicketModalOpen(true);
                        }}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => hadleEditContact(contact.id)}
                      >
                        <EditRoundedIcon
                          color="#c3c3c3"
                        />
                      </IconButton>
                      <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setConfirmOpen(true);
                              setDeletingContact(contact);
                            }}
                          >
                            <DeleteForeverRoundedIcon />
                          </IconButton>
                        )}
                      />
                    </TableCell>
                    <TableCell padding="checkbox" />
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={3} />}
              </>
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
};

export default Contacts;
