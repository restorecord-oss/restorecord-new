import { stringAvatar } from "../../src/functions";
import { useToken } from "../../src/token";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react'

import axios from "axios";
import Link from "next/link"

import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiLink from "@mui/material/Link";
import theme from "../../src/theme";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default function DashSettings({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [pullWindow, setPullWindow] = useState(false);
    const [giveRoleOnJoin, setGiveRoleOnJoin] = useState(false);

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [customBot, setCustomBot] = useState("");
    const [customBotToken, setCustomBotToken] = useState("");
    const [selectedServer, setSelectedServer] = useState("");

    const [allServers, setAllServers] = useState([]);

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [createNewServer, setCreateNewServer] = useState(false);

    function handleSubmit(e: any, body: any, method: string = "POST") {
        e.preventDefault();

        fetch(`/api/v1/settings/server`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify(body),
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);

                    setTimeout(() => {
                        router.reload();
                    }, 2500);
                }
            })
            .catch(err => {
                console.error(err);
                setNotiTextE(err.message);
                setOpenE(true);
            });
    }

    function getAllGuilds() {
        setAllServers([]);
        axios.get("/api/v1/users/guilds", {
            headers: {
                "Authorization": `Bot ${customBotToken}`,
            },
        })
            .then(res => {
                if (res.data.code) { setAllServers([]); setNotiTextE(res.data.message); setOpenE(true); }
                else setAllServers(res.data);
            })
            .catch(err => {
                setAllServers([]);
                console.error(err);
            });
    }


    useEffect(() => {
        if (customBotToken) getAllGuilds();
    }, [customBotToken]);


    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                            <Alert elevation={6} variant="filled" severity="error">
                                {notiTextE}
                            </Alert>
                        </Snackbar>

                        <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                            <Alert elevation={6} variant="filled" severity="success">
                                {notiTextS}
                            </Alert>
                        </Snackbar>
                        
                        <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                            <Alert elevation={6} variant="filled" severity="info">
                                {notiTextI}
                            </Alert>
                        </Snackbar>

                        <Dialog open={pullWindow} onClose={() => setPullWindow(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                            <DialogTitle id="alert-dialog-title">
                                <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                    Migration
                                </Typography>
                                <IconButton aria-label="close" onClick={() => setPullWindow(false)} sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" sx={{ fontWeight: "400", mb: "1rem" }}>
                                    Select the server you want to pull your members into, make sure you invited the bot to the server.
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: "400", mb: "1rem", color: theme.palette.warning.main }}>
                                    ⚠ Warning: This will only pull members.
                                </Typography>
                                {allServers.length === 0 ? (
                                    <CircularProgress />
                                ) : (
                                    <FormControl fullWidth variant="outlined" required>
                                        <InputLabel id="server-select-label">Select Server</InputLabel>
                                        <Select labelId="server-select-label" label="Select Server" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value as string)} required>
                                            {Array.isArray(allServers) && allServers.map((item: any) => {
                                                if (allServers.filter((i: any) => i.name === item.name).length > 1) return <MenuItem key={item.id} value={item.id}>{item.name} ({item.id})</MenuItem>;
                                                else return <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>;
                                            })}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* small arrow down icon with the text "advanced options" */}
                                <Accordion sx={{ mt: "1rem" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                        <Typography variant="body1" sx={{ fontWeight: "400" }}>Advanced Options</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body1" sx={{ mb: "1rem" }}>Enter Server ID manually</Typography>
                                        <TextField fullWidth label="Server ID" variant="outlined" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)} />
                                    </AccordionDetails>
                                </Accordion>

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => getAllGuilds()} color="primary" variant="contained" sx={{ mr: 1 }}>
                                    Refresh Server List
                                </Button>
                                <Button onClick={() => (
                                    axios.put(`/api/v1/server/${guildId}?server=${selectedServer}`, {}, {
                                        headers: {
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                        validateStatus: () => true
                                    })
                                        .then(res => {
                                            setOpenI(false);
                                            if (!res.data.success) {
                                                if (res.data.pullTimeout) {
                                                    const timeArr = new Date(new Date(res.data.pullTimeout).getTime() - new Date().getTime()).toISOString().substr(11, 8).split(":");
                                                    const hours = parseInt(timeArr[0]);
                                                    const minutes = parseInt(timeArr[1]);
                                                    const seconds = parseInt(timeArr[2]);
                                                    const timeString = `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}${minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""} ` : ""}${seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""} ` : ""}`;
                                                    setNotiTextE(`${res.data.message} ${timeString}`);
                                                }
                                                else {
                                                    setNotiTextE(res.data.message);
                                                }
                                                setOpenE(true);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                            }
                                        })
                                        .catch((err): any => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                            console.error(err);
                                        })
                                )} color="success" variant="contained" sx={{ mr: 1 }}>
                                    Pull Members
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {!createNewServer && (Array.isArray(user.servers) && user.servers.length >= 1) && (
                            <>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                        Servers
                                    </Typography>
                                    <Button variant="contained" sx={{ mb: 2 }} onClick={() => setCreateNewServer(true)}>
                                        + Create New Server
                                    </Button>
                                </Stack>
                                {user.servers.map((item: any) => {
                                    return (
                                        <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`server_${item.guildId}`}>
                                            <CardContent>
                                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            {item.picture === "https://cdn.restorecord.com/logo512.png" ? (
                                                                <Avatar {...stringAvatar(item.name, { sx: { mr: "0.5rem" } })}></Avatar>
                                                            ) : (
                                                                <Avatar src={item.picture} alt={item.serverName} sx={{ mr: "0.5rem" }} />
                                                            )}
                                                            <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-all" }}>
                                                                {item.name}
                                                            </Typography>
                                                        </div>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {item.description}
                                                        </Typography>
                                                        <Typography variant="body2" color="white" sx={{ wordBreak: "break-word" }}>
                                                            Verification URL
                                                            <MuiLink color={theme.palette.primary.light} href={`/verify/${encodeURIComponent(item.name)}`} rel="noopener noreferrer" target="_blank">
                                                                <br/>
                                                                {window.location.origin}/verify/{encodeURIComponent(item.name)}
                                                            </MuiLink>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                                            <Button variant="contained" onClick={() => { router.push(`/dashboard/settings/${item.guildId}`)} }>
                                                                Edit
                                                            </Button>
                                                            <Button variant="contained" color="success" onClick={() => {
                                                                setCustomBotToken(user.bots.find((bot: any) => bot.id === (user.servers.find((server: any) => server.guildId === item.guildId).customBotId)).botToken);
                                                                setGuildId(item.id);
                                                                setPullWindow(true);
                                                                // setNotiTextI("Pulling members please wait...");
                                                                // setOpenI(true);
                                                                // axios.put(`/api/v1/server/${item.guildId}`, {}, { 
                                                                //     headers: {
                                                                //         "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                //     },
                                                                //     validateStatus: () => true
                                                                // })
                                                                //     .then(res => {
                                                                //         setOpenI(false);
                                                                //         if (!res.data.success) {
                                                                //             if (res.data.pullTimeout) {
                                                                //                 const timeArr = new Date(new Date(res.data.pullTimeout).getTime() - new Date().getTime()).toISOString().substr(11, 8).split(":");
                                                                //                 const hours = parseInt(timeArr[0]);
                                                                //                 const minutes = parseInt(timeArr[1]);
                                                                //                 const seconds = parseInt(timeArr[2]);
                                                                //                 const timeString = `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}${minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""} ` : ""}${seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""} ` : ""}`;
                                                                //                 setNotiTextE(`${res.data.message} ${timeString}`);
                                                                //             }
                                                                //             else {
                                                                //                 setNotiTextE(res.data.message);
                                                                //             }
                                                                //             setOpenE(true);
                                                                //         }
                                                                //         else {
                                                                //             setNotiTextS(res.data.message);
                                                                //             setOpenS(true);
                                                                //         }
                                                                //     })
                                                                //     .catch((err): any => {
                                                                //         setNotiTextE(err.message);
                                                                //         setOpenE(true);
                                                                //         console.error(err);
                                                                //     });
                                                            }}>Migrate (Pull)</Button>
                                                            {user.role === "business" && (
                                                                <Button variant="contained" color="yellow" onClick={() => {
                                                                    setNotiTextI("Creating a backup...");
                                                                    setOpenI(true);

                                                                    axios.post(`/api/v1/server/backup/${item.guildId}`, {}, {
                                                                        headers: {
                                                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                        },
                                                                        validateStatus: () => true
                                                                    })
                                                                        .then(res => {
                                                                            setOpenI(false);
                                                                            if (!res.data.success) {
                                                                                setNotiTextE(res.data.message);
                                                                                setOpenE(true);
                                                                            }
                                                                            else {
                                                                                setNotiTextS(res.data.message);
                                                                                setOpenS(true);
                                                                            }
                                                                        })
                                                                        .catch((err): any => {
                                                                            setNotiTextE(err.message);
                                                                            setOpenE(true);
                                                                            console.error(err);
                                                                        });
                                                                }}>Backup</Button>
                                                            )}
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    );
                                })}
                            </>
                        )}

                        {(createNewServer || (Array.isArray(user.servers) && user.servers.length === 0)) && (
                            <>
                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                    <CardContent>
                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                            {user.bots.length === 0 && (
                                                <Alert variant="filled" severity="error">
                                                    You don&apos;t have any bots to add to this server. You can add bots to your account{" "}
                                                    <Link color={theme.palette.primary.light} href="/dashboard/custombots" rel="noopener noreferrer" target="_blank">
                                                        here
                                                    </Link>.
                                                </Alert>
                                            )}
                                            <TextField label="Server Name" variant="outlined" value={serverName} onChange={(e) => setServerName(e.target.value)} required />
                                            <TextField label="Server Id" variant="outlined" value={guildId} onChange={(e) => setGuildId(e.target.value)} required />
                                            <TextField label="Member Role Id" variant="outlined" value={roleId} onChange={(e) => setRoleId(e.target.value)} required />
                                            <FormControl fullWidth variant="outlined" required>
                                                <InputLabel id="bot-select-label">Custom Bot</InputLabel>
                                                <Select labelId="bot-select-label" label="Custom Bot" value={customBot} onChange={(e) => setCustomBot(e.target.value as string)} required>
                                                    {user.bots.map((item: any) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                            <Button variant="contained" onClick={(e: any) => handleSubmit(e, { serverName, guildId, roleId, customBot, })}>Create</Button>
                                        </Stack>
                                    </CardContent>
                                </Paper>
                            </>
                        )}

                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}