import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { SocketContext } from "../context/Socket/SocketContext";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import Box from "@material-ui/core/Box";
import BackdropLoading from "../components/BackdropLoading";

import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BoltIcon from "@mui/icons-material/Bolt";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import PermContactCalendarRounded from "@mui/icons-material/PermContactCalendarRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AllInclusiveRoundedIcon from "@mui/icons-material/AllInclusiveRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

// Account Button
import {
  MenuItem,
  IconButton,
  Menu,
} from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import UserModal from "../components/UserModal";
import { useLocation } from "react-router-dom/cjs/react-router-dom";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "-10px",
  },
  listItem: {
    borderRadius: theme.spacing(.4),
    transition: theme.transitions.create(["margin", "padding"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
  },
  activeListItem: {
    "&:not(:first-child)": {
      // paddingTop: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
    "&:not(:last-child)": {
    // paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    transition: theme.transitions.create(["margin", "padding"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    backgroundColor: theme.palette.secondaryLight.main,
    "&:hover": {
      backgroundColor: theme.palette.secondaryLightHover.main,
    },
  },
  activeItem: {
    color: theme.palette.light.main,
  },
}));


const ListItemLink = ({ icon, primary, to, className }) => {
  const classes = useStyles();
  const location = useLocation();
  // console.log(location);
  // console.log(to);
  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <ListItem button dense component={renderLink} className={`${className} ${ to == location.pathname ? classes.activeListItem : null} ${classes.listItem}`}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} className={ to == location.pathname ? classes.activeItem : null} />
    </ListItem>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ drawerClose, collapsed}) => {
  const classes = useStyles();
  // Account buttton
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout, loading } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false); const history = useHistory();
  const [showExternalApi, setShowExternalApi] = useState(false);


  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();
  const location = useLocation();
  
  const [version, setVersion] = useState(false);
  
  
  const { getVersion } = useVersion();

  const socketManager = useContext(SocketContext);

  // Account Button
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleIconColor = (pathname) => {
    if (pathname == location.pathname) {
      return "#fff"
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div onClick={drawerClose}>
      <div>
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <ListItemLink
              to="/"
              primary="Dashboard"
              icon={<GridViewRoundedIcon sx={{ color: handleIconColor("/") }} />}
            />
          )}
        />
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<ForumRoundedIcon sx={{ color: handleIconColor("/tickets") }} />}
        />
        {showKanban && (
          <ListItemLink
            to="/kanban"
            primary={i18n.t("Kanban")}
            icon={<ViewKanbanIcon sx={{ color: handleIconColor("/kanban") }} />}
          />
        )}
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<BoltIcon sx={{ color: handleIconColor("/quick-messages") }} />}
        />
        <ListItemLink
          to="/todolist"
          primary={i18n.t("Tarefas")}
          icon={<DoneAllRoundedIcon sx={{ color: handleIconColor("/todolist") }} />}
        />
        <ListItemLink
          to="/contacts"
          primary="Contatos"
          icon={<PermContactCalendarRounded sx={{ color: handleIconColor("/contacts") }} />}
        />
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<CalendarMonthRoundedIcon sx={{ color: handleIconColor("/schedules") }} />}
        />
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<LocalOfferRoundedIcon sx={{ color: handleIconColor("/tags") }} />}
        />
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={
            <Badge color="secondary" variant="dot" invisible={invisible}>
              <SendRoundedIcon sx={{ color: handleIconColor("/chats") }} />
            </Badge>
          }
        />
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpOutlineRoundedIcon sx={{ color: handleIconColor("/helps") }} />}
        />
      </div>

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader
              hidden={collapsed}
              style={{
                position: "relative",
                fontSize: "17px",
                textAlign: "left",
                paddingLeft: 20
              }}
              inset
              color="inherit">
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {showCampaigns && (
              <>
                <ListItemLink
                  to="/campaigns"
                  primary={i18n.t("mainDrawer.listItems.campaigns")}
                  icon={<EventAvailableRoundedIcon sx={{ color: handleIconColor("/campaigns") }} />}
                />
              </>
            )}
            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<InfoRoundedIcon sx={{ color: handleIconColor("/announcements") }} />}
              />
            )}
            {showOpenAi && (
              <ListItemLink
                to="/prompts"
                primary={i18n.t("mainDrawer.listItems.prompts")}
                icon={<AllInclusiveRoundedIcon sx={{ color: handleIconColor("/prompts") }} />}
              />
            )}

            {showIntegrations && (
              <ListItemLink
                to="/queue-integration"
                primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                icon={<IntegrationInstructionsRoundedIcon sx={{ color: handleIconColor("/queue-integration") }} />}
              />
            )}
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  {!connectionWarning ? (<CloudRoundedIcon sx={{ color: handleIconColor("/connections") }} />) : (<CloudOffRoundedIcon sx={{ color: handleIconColor("/connections") }} />)}
                </Badge>
              }
            />
            <ListItemLink
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<FolderRoundedIcon sx={{ color: handleIconColor("/files") }} />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<ListAltRoundedIcon sx={{ color: handleIconColor("/queues") }} />}
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltRoundedIcon sx={{ color: handleIconColor("/users") }} />}
            />
            {showExternalApi && (
              <>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<CodeRoundedIcon sx={{ color: handleIconColor("/messages-api") }} />}
                />
              </>
            )}
            {/*<ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<LocalAtmIcon />}
            />*/}

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsRoundedIcon sx={{ color: handleIconColor("/settings") }} />}
            />


            {!collapsed && <React.Fragment>
              {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
            </React.Fragment>
            }

          </>
        )}
      />
      <Divider />
      <ListItem button className={classes.listItem}>
        <ListItemIcon>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            edge="start"
          >
            <AccountCircle />
          </IconButton>
        </ListItemIcon>
        <Box onClick={() => setUserModalOpen(true)} flex={1}>
          {user.name}
        </Box>
      </ListItem>

      {/* ACCOUNT MODAL */}
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenUserModal}>
          {i18n.t("mainDrawer.appBar.user.profile")}
        </MenuItem>
        <MenuItem onClick={handleClickLogout}>
          {i18n.t("mainDrawer.appBar.user.logout")}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MainListItems;
