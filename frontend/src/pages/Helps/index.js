import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal } from "@material-ui/core";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.background.main,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft
  },
  mainPaper: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: theme.spacing(3),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  helpPaper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: '340px',
    maxWidth: '340px',
    boxShadow: "0 0 4px rgb(0,0,0,.3)",
    cursor: 'pointer',
    padding: theme.spacing(2),
    ...theme.shape,
  },
  paperHover: {
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: `2px 2px 10px ${theme.palette.primary}`,
      color: theme.palette.primary.main,
    },
  },
  videoThumbnail: {
    width: '100%',
    height: 'calc(100% - 56px)',
    objectFit: 'cover',
    borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`,
  },
  videoTitle: {
    marginTop: theme.spacing(1),
    flex: 1,
  },
  videoDescription: {
    maxHeight: '100px',
    overflow: 'hidden',
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
      console.log(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  const renderHelps = () => {
    return (
      <>
        <div className={classes.mainPaper}>
          {records.length ? records.map((record, key) => (
            <Paper key={key} className={`${classes.helpPaper} ${classes.paperHover}`} elevation={0} onClick={() => openVideoModal(record.video)}>
              <img
                src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                alt="Thumbnail"
                className={classes.videoThumbnail}
              />
              <Typography variant="button" className={classes.videoTitle}>
                {record.title}
              </Typography>
              <Typography variant="caption" className={classes.videoDescription}>
                {record.description}
              </Typography>
            </Paper>
          )) : null}
        </div>
      </>
    );
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("helps.title")} ({records.length})</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      <Title className={classes.tabletitle}><h3>{i18n.t("helps.videoTitle")}</h3></Title>
      <Paper className={classes.mainPaper}>
        {renderHelps()}
        {renderVideoModal()}
      </Paper>
    </div>
  );
};

export default Helps;