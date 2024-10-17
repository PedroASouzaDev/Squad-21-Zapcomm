import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.background.main,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
  },
  inputContainer: {
    display: 'flex',
    width: '100%',
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  listContainer: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  list: {
    backgroundColor: theme.palette.light.main,
    marginBottom: theme.spacing(1),
    ...theme.shape
  }
}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskChange = (event) => {
    setTask(event.target.value);
  };

  const handleAddTask = () => {
    if (!task.trim()) {
      // Impede que o usuário crie uma tarefa sem texto
      return;
    }

    const now = new Date();
    if (editIndex >= 0) {
      // Editar tarefa existente
      const newTasks = [...tasks];
      newTasks[editIndex] = {text: task, updatedAt: now, createdAt: newTasks[editIndex].createdAt};
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
    } else {
      // Adicionar nova tarefa
      setTasks([...tasks, {text: task, createdAt: now, updatedAt: now}]);
      setTask('');
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setEditIndex(index);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <div className={classes.root}>
      <Typography
        variant='h4'
        color="primary"
      >
        Tarefas
      </Typography>
      <div>
        <div className={classes.inputContainer}>
          <TextField
            className={classes.input}
            label="Nova tarefa"
            value={task}
            onChange={handleTaskChange}
            variant="outlined"
          />
          <Button variant="contained" color="primary" onClick={handleAddTask}>
            {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
        <div className={classes.listContainer}>
          <List>
            {tasks.map((task, index) => (
              <ListItem key={index} className={classes.list}>
                <ListItemText primary={task.text} secondary={task.updatedAt.toLocaleString()} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditTask(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTask(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
};


export default ToDoList;
