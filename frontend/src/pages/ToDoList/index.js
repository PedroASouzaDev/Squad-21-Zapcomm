import React, { useState, useEffect, useRef } from 'react';
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
import Title from '../../components/Title';
import ConfirmationModal from '../../components/ConfirmationModal';

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
    gap: theme.spacing(2),
    alignItems: "center",
  },
  listContainer: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  listItem: {
    backgroundColor: theme.palette.light.main,
    marginTop: theme.spacing(2),
    ...theme.shape,
  },
  textField: {
    ...theme.textField,
  },
}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  const input = useRef(null);
  
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
    input.current.focus();
  };

  const handleDeleteTask = (index) => {
    console.log("deletando");
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleLabel = (v) => {
    switch (v) {
      case 0:
        if (editIndex >= 0) {
          return 'Editar Tarefa'
        } else {
          return 'Nova Tarefa'
        }
      case 1:
        if (editIndex >= 0) {
          return 'Salvar'
        } else {
          return 'Adicionar'
        }
    }
  }

  // Debugging
  const divRef = useRef(null);

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setEditIndex(-1);
      setTask('');
      console.log("Lost Focus");
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={classes.root}>
      <Title>Tarefas</Title>
      <div>
        <div >
          <form 
            className={classes.inputContainer}
            ref={divRef}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              className={classes.textField}
              inputRef={input}
              fullWidth
              // label={editIndex >= 0 ? 'Editar Tarefa' : 'Nova Tarefa'}
              label={handleLabel(0)}
              value={task}
              onChange={handleTaskChange}
              variant="outlined"
            />
            <Button
              type='submit'
              variant="contained"
              size='medium'
              color="primary"
              onClick={handleAddTask}
            >
              {/* {editIndex >= 0 ? 'Salvar' : 'Adicionar'} */}
              {handleLabel(1)}
            </Button>
          </form>
        </div>
        <div className={classes.listContainer}>
          <List dense>
            {tasks.map((task, index) => (
              <ListItem  key={index} className={classes.listItem}>
                <ListItemText style={{ cursor: "pointer" }} primary={task.text} secondary={task.updatedAt.toLocaleString()} onClick={() => handleEditTask(index)}/>
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditTask(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingTask(task);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
      <ConfirmationModal
        title={deletingTask && `Excluir "${deletingTask.text}"?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteTask(deletingTask)}
      >
        Esta ação é irreversível! Deseja prosseguir?
      </ConfirmationModal>
    </div>
  );
};


export default ToDoList;
