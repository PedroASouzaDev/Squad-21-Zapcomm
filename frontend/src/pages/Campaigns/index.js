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
  tab: {
    backgroundColor: theme.palette.light.main,
    width: "fit-content",
    ...theme.shape,
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
            onChange={(e, v) => setContent(v)}
            className={classes.tab}
          >
            <Tab label="Listagem"></Tab>
            <Tab label="Lista de Contatos"></Tab>
            <Tab label="Configurações"></Tab>
          </Tabs>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      {handleContent()}
    </div>
  );
};

export default Campaigns;