import React, { useState, useEffect } from "react";

import api from "../../services/api";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { UsersFilter } from "../UsersFilter";

const ChatModal = ({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) => {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit") {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert("Por favor, preencha o título da conversa.");
        return;
      }

      if (!users || users.length === 0) {
        alert("Por favor, selecione pelo menos um usuário.");
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
        });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {}
  };  

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Conversa</DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: 18 }} item>
            <TextField
              label="Título"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChatModal;