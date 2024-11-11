import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import { Tab, Tabs } from "@material-ui/core";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Listing from "../Listing";
import ContactLists from "../ContactLists";
import CampaignsConfig from "../CampaignsConfig";

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
  tabs: {
    backgroundColor: theme.palette.light.main,
    width: "fit-content",
    ...theme.shape,
  },
  tab: {
    zIndex: 1,
  },
}));

const Campaigns = () => {
  const classes = useStyles();

  const [content, setContent] = useState(0);

  const handleContent = () => {
    if (content == 0){
      return (
        <Listing/>
      );
    }
    if (content == 1){
      return (
        <ContactLists/>
      );
    }
    if (content == 2){
      return (
        <CampaignsConfig/>
      );
    }
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("campaigns.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Tabs
            value={content}
            textColor="primary"
            indicatorColor="primary"
            onChange={(e, v) => setContent(v)}
            className={classes.tabs}
            TabIndicatorProps={{
              style: {
                height: "100%",
              }
            }}
          >
            <Tab label="Listagem" className={classes.tab} style={{
              color: content === 0 ? "#fff" : "inherit"
            }}/>
            <Tab label="Lista de Contatos" className={classes.tab} style={{
              color: content === 1 ? "#fff" : "inherit"
            }}/>
            <Tab label="Configurações" className={classes.tab} style={{
              color: content === 2 ? "#fff" : "inherit"
            }}/>
          </Tabs>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      {handleContent()}
    </div>
  );
};

export default Campaigns;