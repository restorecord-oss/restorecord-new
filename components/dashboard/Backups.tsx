import { useToken } from "../../src/token";
import { useRouter } from "next/router";
import { useState } from "react";

import Alert from "@mui/material/Alert";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import theme from "../../src/theme";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Badge from "@mui/material/Badge";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";


export default function DashBackups({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [restoreDialog, setRestoreDialog] = useState(false);
    const [backupId, setBackupId] = useState("0");

    const [restoreOptions, setRestoreOptions] = useState({
        clearGuild: false,
        settings: false,
        channels: false,
        roles: false,
    });
    
    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #2f2f2f" }}>
                    <CardContent>
                        <Badge badgeContent={<>BETA</>} color="primary" sx={{ [`& .MuiBadge-badge`]: { mt: "1.5rem", mr: "-2.5rem", color: "#fff", padding: "0.85rem", fontSize: "0.95rem", fontWeight: "bold" } }}>
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                Backups
                            </Typography>
                        </Badge>

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

                        <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                            <Alert elevation={6} variant="filled" severity="info">
                                {notiTextI}
                            </Alert>
                        </Snackbar>

                        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                            <DialogTitle id="alert-dialog-title">{"Are you sure you?"}
                                <IconButton aria-label="close" onClick={() => setConfirmDelete(false)} sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                        This action cannot be undone.
                                    </Typography><br/>

                                    Deleting this Backup will permanently remove it from the database.<br/>
                                    If you delete this Backup this will remove following data:
                                    <li>Server Settings</li>
                                    <li>Channels</li>
                                    <li>Roles</li>
                                    <li>Member Nicknames/Roles</li>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setConfirmDelete(false);
                                    document.querySelector(`#backup_${backupId}`)?.remove();

                                    // axios.delete(`/api/v1/`, { headers: {
                                    //     "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                    // },
                                    // validateStatus: () => true
                                    // })
                                    //     .then((res: any) => {
                                    //         if (!res.data.success) {
                                    //             setNotiTextE(res.data.message);
                                    //             setOpenE(true);
                                    //         }
                                    //         else {
                                    //             setNotiTextS(res.data.message);
                                    //             setOpenS(true);
                                    //             document.querySelector(`#backup_${backupId}`)?.remove();
                                    //         }
                                    //     })
                                    //     .catch((err: any) => {
                                    //         setNotiTextE(err.message);
                                    //         setOpenE(true);
                                    //         console.error(err);
                                    //     });
                                } } color="error">
                                    Delete
                                </Button>
                                <Button onClick={() => setConfirmDelete(false)} color="primary" autoFocus>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                            <DialogTitle id="alert-dialog-title">{"Are you sure you?"}
                                <IconButton aria-label="close" onClick={() => setRestoreDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                        This action cannot be undone.
                                    </Typography><br/>

                                    <Typography variant="body1">
                                        Options:
                                    </Typography>
                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, clearGuild: e.target.checked })} color={"error"} sx={{ color: theme.palette.error.main }} />} label="Clear Guild before restoring?" /><br/><br/>
                                    
                                    <Typography variant="body1" sx={{ fontWeight: "500" }}>
                                        What do you want to restore?
                                    </Typography>
                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, settings: e.target.checked })} />} label="Server Settings" /><br/>
                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, channels: e.target.checked })} />} label="Channels" /><br/>
                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, roles: e.target.checked })} />} label="Roles" /><br/>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setRestoreDialog(false);
                                    setRestoreOptions({ settings: false, channels: false, roles: false, clearGuild: false });
                                    setNotiTextI("Restoring Backup...");
                                    setOpenI(true);

                                    axios.post(`/api/v1/server/restore/${backupId}`, {
                                        ...restoreOptions
                                    }, {
                                        headers: {
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                        validateStatus: () => true
                                    })
                                        .then((res: any) => {
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
                                        .catch((err: any) => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                            console.error(err);
                                        });
                                } } color="success">
                                    Restore
                                </Button>
                                <Button onClick={() => setRestoreDialog(false)} color="primary" autoFocus>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>


                        {(Array.isArray(user.backups) && user.backups.length >= 1) ? (
                            <>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                    {user.backups.length} Backup{user.backups.length > 1 ? "s" : ""}
                                </Typography>
                                {user.backups.map((backup: any) => (
                                    <Paper key={backup.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`backup_${backup.backupId}`}>
                                        <CardHeader title={backup.name} subheader={new Intl.DateTimeFormat(navigator.language, { dateStyle: "long", timeStyle: "medium" }).format(new Date(backup.createdAt))} />
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                                Guild Id: <code>{backup.guildId}</code>
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                                Channels: <code>{backup.channels}</code>
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                                Roles: <code>{backup.roles}</code>
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                                Guild Members: <code>{backup.guildMembers}</code>
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-start", ml: "0.5rem", mb: "0.75rem" }}>
                                            {/* <Button variant="contained" color="primary" disabled={true}>View Channels</Button> */}
                                            {/* <Button variant="contained" color="primary" disabled={true}>View Roles</Button> */}
                                            <Button variant="contained" sx={{ background: "#43a047", "&:hover": { background: "#388e3c" } }} onClick={(e) => {
                                                setBackupId(backup.backupId);
                                                setRestoreDialog(true);
                                            }}>Restore</Button>
                                            {/* <Button variant="contained" color="error" disabled={true} onClick={(e) => { 
                                                setBackupId(backup.backupId);
                                                setConfirmDelete(true);
                                            }}>Delete</Button> */}
                                        </CardActions>
                                    </Paper>
                                ))}
                            </>
                        ) : (
                            <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                <CardContent>
                                    {user.role === "business" ? (
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                            Please create a backup first, you can do that by clicking the &quot;Backup&quot; button next to your server.
                                        </Typography>
                                    ) : (
                                        <>
                                            <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                                You need to upgrade to the business plan to use this feature.
                                            </Typography>
                                            <Button variant="contained" color="primary" onClick={() => router.push("/dashboard/upgrade")}>Upgrade</Button>
                                        </>
                                    )}
                                </CardContent>
                            </Paper>
                        )}

                    </CardContent>
                </Paper>
            </Container>
        </>
    );
                        
}