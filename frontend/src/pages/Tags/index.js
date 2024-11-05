import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
  } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip, Collapse } from "@material-ui/core";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { DeleteRounded, EditRounded } from "@material-ui/icons";
  
const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};
  
const useStyles = makeStyles((theme) => ({
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
  Table: {
    borderCollapse:"separate",
    borderSpacing:"0 1em",
  },
  mainPaper: {
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStylesSoft,      
    backgroundColor:"inherit",
    border:"none",
  },
  tableRow: {
    backgroundColor: 'white',
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
  },
  Cell_left: {
    cursor: "pointer",
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    overflow: "hidden",
  },
  cell: {
    cursor: "pointer",
  },
  Cell_right: {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: "hidden",
  },
  textField: {
    ...theme.textField,
  },
}));
  
  const Tags = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTags]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tags });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const tagTextColor = (backgroundColor) => {
    // Helper function to convert hex color to RGB
    const hexToRgb = (hex) => {
      // Remove the "#" if present
      hex = hex.replace(/^#/, "");
      // Convert 3-digit hex to 6-digit hex
      if (hex.length === 3) {
        hex = hex.split("").map(char => char + char).join("");
      }
      // Parse the hex color into RGB values
      const bigint = parseInt(hex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    };
  
    // Convert background color to RGB format
    const rgb = /^#/.test(backgroundColor) ? hexToRgb(backgroundColor) : backgroundColor;
    const { r, g, b } = rgb;
  
    // Calculate luminance based on RGB values
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    console.log(backgroundColor);
    // Return dark text for light backgrounds and light text for dark backgrounds
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
      <div className={classes.root}>
        <MainHeader>
          <Title>{i18n.t("tags.title")}</Title>
          <MainHeaderButtonsWrapper>
            <TextField
              className={classes.textField}
              margin="dense"
              variant="outlined"
              placeholder="Pesquisar"
              type="search"
              value={searchParam}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "grey"}} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenTagModal}
            >
              + Adicionar
            </Button>
          </MainHeaderButtonsWrapper>
        </MainHeader>
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <Table size="fit-content" className={classes.Table}>
            <TableHead>
              <TableRow>
                <TableCell align="center">Tag</TableCell>
                <TableCell align="center">Registros</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {tags.map((tag) => (
                  <TableRow key={tag.id} className={classes.tableRow}>
                    <TableCell className={classes.Cell_left} align="center" onClick={() => handleEditTag(tag)}>
                    <Chip
                        style={{
                          backgroundColor: tag.color,
                          color: tagTextColor(tag.color),
                        }}
                        label={tag.name}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" className={classes.cell} onClick={() => handleEditTag(tag)}>{tag.ticketsCount}</TableCell>
                    <TableCell align="center" className={classes.cell} onClick={() => handleEditTag(tag)}>
                        <Chip
                            style={{
                                backgroundColor: '#2B99431A',
                                color:"green",
                            }}
                            label={"ATIVO"}
                            size="small"
                        />
                    </TableCell>
                    <TableCell className={classes.Cell_right} align="center">
                      <IconButton size="small" onClick={() => handleEditTag(tag)}>
                        <EditRounded />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingTag(tag);
                        }}
                      >
                        <DeleteRounded />
                      </IconButton>
        
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </>
            </TableBody>
          </Table>
        </Paper>
        <ConfirmationModal
          title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteTag(deletingTag.id)}
        >
          {i18n.t("tags.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <TagModal
          open={tagModalOpen}
          onClose={handleCloseTagModal}
          reload={fetchTags}
          aria-labelledby="form-dialog-title"
          tagId={selectedTag && selectedTag.id}
        />
      </div>
  );
};

export default Tags;