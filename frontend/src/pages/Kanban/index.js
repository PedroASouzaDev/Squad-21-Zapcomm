import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";

import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import "./board.css";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.main,
    gap: theme.spacing(3),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    overflowX: "scroll",
    ...theme.scrollbarStylesSoft
  },
  button: {
    background: theme.palette.primary.main,
    padding: theme.spacing(1),
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
    fontFamily: "Nunito",
  },
  cardtitles: {
    color: "0c2454",
    fontSize: "100px",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);


  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || []; 

      setTags(fetchedTags);

      // Fetch tickets after fetching tags
      await fetchTickets(jsonString);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const [file, setFile] = useState({
    lanes: []
  });


  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile, queues } = user;
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  const fetchTickets = async (jsonString) => {
    try {
      
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };


  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);

    const pendingTickets = filteredTickets.filter(ticket => ticket.status === "pending");
    const openTickets = filteredTickets.filter(ticket => ticket.status === "open");

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("Em Aberto"),
        label: "0",
        style: { 
          backgroundColor: "#FFFFFF", 
          borderRadius: "10px", 
          color: "#0c2454",
        },
        //Para resolver o problema dos cards aparecendo em todas as lanes, é necessário ajustar o backend e a função map em filteredTickets.
        cards: pendingTickets.map(ticket => ({
          style: {
            textAlign: "center",
            border: "2px solid #e7eaee",
          },
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button 
                  className={classes.button} 
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}>
                    Ver Ticket
                </button>
              </div>
            ),
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      {
        id: "lane1",
        title: i18n.t("Em Atendimento"),
        label: "0",
        style: { 
          backgroundColor: "#FFFFFF", 
          borderRadius: "10px", 
          color: "#0c2454" 
        },
        cards: openTickets.map(ticket => ({
          style: {
            textAlign: "center",
            border: "2px solid #e7eaee",
          },
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button 
                  className={classes.button} 
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}>
                    Ver Ticket
                </button>
              </div>
            ),
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: tag.id.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button 
                  className={classes.button} 
                  onClick={() => {
                    
                    handleCardClick(ticket.uuid)
                  }}>
                    Ver Ticket
                </button>
              </div>
            ),
            title: ticket.contact.name,
            draggable: true,
            href: "/tickets/" + ticket.uuid,          
          })),
          style: { backgroundColor: tag.color, color: "white", borderRadius: "10px", color: "#0c2454" }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {  
    //console.log("Clicked on card with UUID:", uuid);
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
}, [tags, tickets, reloadData]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
        
          await api.delete(`/ticket-tags/${targetLaneId}`);
        toast.success('Ticket Tag Removido!');
          await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
        toast.success('Ticket Tag Adicionado com Sucesso!');

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={classes.root}>
        <MainHeader>
          <Title>Kanban</Title>
        </MainHeader>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{
            backgroundColor: 'rgba(252, 252, 252, 0)',
            padding: "0",
            fontFamily: "nunito",
          }}
        />
    </div>
  );
};


export default Kanban;
