import React, { useContext, useEffect, useRef, useState } from "react";

import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import ChatModal from "../../components/ChatModal";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

import { has, isObject } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.background.main,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    padding: theme.spacing(2),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  gridContainer: {
    display: "flex",
    gap: theme.spacing(2),
    flex: 1,
    height: "100%",
    backgroundColor: theme.palette.dark,
  },
  sideHeader: {
    padding: theme.spacing(2),
  },
  newBtn: {
    width:  36,
    height: 36,
    borderRadius: "50%",
    minWidth: 0,
    minHeight: 0,
  },
  gridItem: {
    height: "100%",
    width: "400px",
  },
  gridItemTab: {
    height: "92%",
    width: "100%",
  },
  btnContainer: {
    textAlign: "right",
    padding: 10,
  },
}));

const Chat= (props) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat-user-${user.id}`, (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        });
        setChats(changedChats);
      }
    });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    });

    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, (data) => {
        if (data.action === "new-message") {
          setMessages((prev) => [...prev, data.newMessage]);
          const changedChats = chats.map((chat) => {
            if (chat.id === data.newMessage.chatId) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          scrollToBottomRef.current();
        }

        if (data.action === "update") {
          const changedChats = chats.map((chat) => {
            if (chat.id === data.chat.id) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          scrollToBottomRef.current();
        }
      });
    }

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat, socketManager]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) {}
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (err) {}
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {}
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (err) {}
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const renderGrid = () => {
    return (
      <div className={classes.gridContainer} container>
        <Paper elevation={0} className={classes.gridItem}>
          <div className={classes.sideHeader}>
            <MainHeader>
              <Title>Chat Interno</Title>
              <MainHeaderButtonsWrapper>
                <Button
                  className={classes.newBtn}
                  onClick={() => {
                    setDialogType("new");
                    setShowDialog(true);
                  }}
                  color="primary"
                  variant="contained"
                >
                  +
                </Button>
              </MainHeaderButtonsWrapper>
            </MainHeader>
          </div>

          <ChatList
            chats={chats}
            pageInfo={chatsPageInfo}
            loading={loading}
            handleSelectChat={(chat) => selectChat(chat)}
            handleDeleteChat={(chat) => deleteChat(chat)}
            handleEditChat={() => {
              setDialogType("edit");
              setShowDialog(true);
            }}
          />
        </Paper>
        <Paper className={classes.gridItem} elevation={0} style={{ flex: 1}}>
          {isObject(currentChat) && has(currentChat, "id") && (
            <ChatMessages
              chat={currentChat}
              scrollToBottomRef={scrollToBottomRef}
              pageInfo={messagesPageInfo}
              messages={messages}
              loading={loading}
              handleSendMessage={sendMessage}
              handleLoadMore={loadMoreMessages}
            />
          )}
        </Paper>
      </div>
    );
  };

  const renderTab = () => {
    return (
      <Grid className={classes.gridContainer} spacing={5} container>
        <Grid md={12} item>
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, v) => setTab(v)}
            aria-label="disabled tabs example"
          >
            <Tab label="Chats" />
            <Tab label="Mensagens" />
          </Tabs>
        </Grid>
        {tab === 0 && (
          <Grid className={classes.gridItemTab} md={12} item>
            <div className={classes.btnContainer}>
              <Button
                onClick={() => setShowDialog(true)}
                color="primary"
                variant="contained"
              >
                Novo
              </Button>
            </div>
            <ChatList
              chats={chats}
              pageInfo={chatsPageInfo}
              loading={loading}
              handleSelectChat={(chat) => selectChat(chat)}
              handleDeleteChat={(chat) => deleteChat(chat)}
            />
          </Grid>
        )}
        {tab === 1 && (
          <Grid className={classes.gridItemTab} md={12} item>
            {isObject(currentChat) && has(currentChat, "id") && (
              <ChatMessages
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            )}
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div className={classes.root}>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />
      {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
    </div>
  );
}

export default withWidth()(Chat);
