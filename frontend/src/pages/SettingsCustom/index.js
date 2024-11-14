import React, { useState, useEffect } from "react";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper/index.js";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";

import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";

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
  tabs: {
    backgroundColor: theme.palette.light.main,
    width: "fit-content",
    ...theme.shape,
  },
  tab: {
    zIndex: 1,
  },
  paper: {
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft,
  },
  container: {
    flex: 1,
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
      async function findData() {
        setLoading(true);
        try {
          const companyId = localStorage.getItem("companyId");
          const company = await find(companyId);
          const settingList = await getAllSettings();
          setCompany(company);
          setSchedules(company.schedules);
          setSettings(settingList);
  
          if (Array.isArray(settingList)) {
            const scheduleType = settingList.find(
              (d) => d.key === "scheduleType"
            );
            if (scheduleType) {
              setSchedulesEnabled(scheduleType.value === "company");
            }
          }
  
          const user = await getCurrentUserInfo();
          setCurrentUser(user);
        } catch (e) {
          toast.error(e);
        }
        setLoading(false);
      }
      findData();
      // eslint-disable-next-line react-hooks/exhaustive-deps

    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>Configurações</Title>
        <MainHeaderButtonsWrapper>
          <Tabs
            value={tab}
            textColor="primary"
            indicatorColor="primary"
            onChange={handleTabChange}
            className={classes.tabs}
            TabIndicatorProps={{
              style: {
                height: "100%",
              }
            }}
          >
            <Tab label="Opções" value={"options"} className={classes.tab} style={{
              color: tab === "options" ? "#fff" : "inherit"
            }}/>
            {schedulesEnabled && <Tab label="Horários" value={"schedules"} className={classes.tab} style={{
              color: tab === "schedules" ? "#fff" : "inherit"
            }}/>}
            {isSuper() ? <Tab label="Empresas" value={"companies"} className={classes.tab} style={{
              color: tab === "companies" ? "#fff" : "inherit"
            }}/> : null}
            {isSuper() ? <Tab label="Ajuda" value={"helps"} className={classes.tab} style={{
              color: tab === "helps" ? "#fff" : "inherit"
            }}/> : null}
          </Tabs>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.paper} elevation={0}>
        <TabPanel
          className={classes.container}
          value={tab}
          name={"schedules"}
        >
          <SchedulesForm
            loading={loading}
            onSubmit={handleSubmitSchedules}
            initialValues={schedules}
          />
        </TabPanel>
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"companies"}
            >
              <CompaniesManager />
            </TabPanel>
          )}
        />
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <TabPanel
              className={classes.container}
              value={tab}
              name={"helps"}
            >
              <HelpsManager />
            </TabPanel>
          )}
        />
        <TabPanel className={classes.container} value={tab} name={"options"}>
          <Options
            settings={settings}
            scheduleTypeChanged={(value) =>
              setSchedulesEnabled(value === "company")
            }
          />
        </TabPanel>
      </Paper>
    </div>
  );
};

export default SettingsCustom;
