import { useQuery } from "react-query";
import { useToken } from "../../src/token"

import { getMemberList } from "../../src/dashboard/getMembers";
import getNews from "../../src/dashboard/getNews";
import dynamic from "next/dynamic";
import Link from "next/link";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashBoard({ user }: any) {
    const [token]: any = useToken();

    let memberArr: any = [];

    const { data, isError, isLoading } = useQuery('news', async () => await getNews({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false });

    const { data: data2, isError: isError2, isLoading: isLoading2 } = useQuery('memberList', async () => await getMemberList({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });

    const timeArr = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    }).reverse();

    if (data2) {
        memberArr = data2.members.length > 0 ? Array.from({ length: 14 }, (_, i) => {
            if (data2) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return data2.members.filter((member: any) => {
                    const createdAt = new Date(member.createdAt);
                    return createdAt.getDate() === date.getDate() && createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
                }).length;
            }
        }).reverse() : [];
    }

    const apexChart: any = {
        options: {
            chart: {
                id: 'members',
                type: 'area',
                foreColor: '#fff',
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.5
                },
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                colors: ['#4f46e5'],
            },
            legend: {
                horizontalAlign: 'left'
            },
            plotOptions: {
                bar: {
                    columnWidth: '30%',
                    horizontal: false,
                },
            },
            fill: {
                colors: ['#4f46e5'],
            },
            tooltip: {
                theme: 'dark',
                // remove the dot
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: false,
                },
            },
            noData: {
                text: 'No data',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'Roboto',
                    fontWeight: 'bold'
                },
            },
            xaxis: {
                labels: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                categories: timeArr
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
                        return val.toFixed(0);
                    }
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
        },
        series: [
            {
                name: "Verified Members",
                data: memberArr
            }
        ]
    };

    if (!user.username) {
        return (
            <>
                <p>Loading...</p>
            </>
        )
    }

    return (
        <>
            <Container maxWidth="xl">

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #2f2f2f" }}>
                            <CardContent>
                                {isLoading2 ? (
                                    <>
                                        <Skeleton animation="wave" variant="text" width={140} height={42} sx={{ mb: 2 }} />
                                        <Skeleton animation="wave" variant="text" width={320} height={24} />
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                            Statistics
                                        </Typography>
                                        <Typography variant="body1" color={"grey.200"}>
                                            All Members verified within the last 14 days.
                                        </Typography>
                                    </>
                                )}

                                <Chart options={apexChart.options} series={apexChart.series} type="area" height={350} />
                            </CardContent>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #2f2f2f" }}>
                            <CardContent>
                                {isLoading2 ? (
                                    <>
                                        <Skeleton animation="wave" variant="text" width={230} height={42} sx={{ mb: 2 }} />
                                        <Skeleton animation="wave" variant="text" width={180} height={24} />
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                            Recent Activity
                                        </Typography>
                                        <Typography variant="body1" color={"grey.200"}>
                                            Last {data2.members.length > 3 ? 3 : data2.members.length} verified members.
                                        </Typography>
                                    </>
                                )}
                                {/* <Grid container spacing={3}> */}
                                {isLoading2 ? (
                                    <>
                                        {Array.from({ length: 3 }, (_, i) => {
                                            return (
                                                <List key={i} sx={{ width: "100%", maxWidth: 360 }}>
                                                    <ListItem>
                                                        <ListItemAvatar>
                                                            <Skeleton animation="wave" variant="circular" width={40} height={40} />
                                                        </ListItemAvatar>
                                                        <ListItemText primary={<Skeleton animation="wave" variant="text" width={145} height={24} />} secondary={
                                                            <>
                                                                <Skeleton animation="wave" variant="text" width={175} height={20} />
                                                                <Skeleton animation="wave" variant="text" width={80} height={20} />
                                                            </>
                                                        } />
                                                    </ListItem>
                                                </List>
                                            )
                                        })}
                                    </>
                                ) : (
                                    <>
                                        {data2.members.slice(0, 3).map((member: any) => {
                                            if (data2.members.indexOf(member) > 2) {
                                                return null
                                            }

                                            return (
                                                <List key={member.id} sx={{ width: '100%', maxWidth: 360 }}>
                                                    <ListItem sx={{ wordBreak: "break-all" }}>
                                                        <ListItemAvatar>
                                                            {member.avatar.length > 1 ? (
                                                                <Avatar src={`https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}?size=128`} />
                                                            ) : (
                                                                <Avatar src={`https://cdn.discordapp.com/embed/avatars/${member.avatar}.png`} />
                                                            )}
                                                        </ListItemAvatar>
                                                        <ListItemText primary={`${member.username}`} secondary={
                                                            <>
                                                                Id: {`${member.userId}`}
                                                                <br/>Server: {`${member.guildName}`}
                                                            </>
                                                        } />
                                                    </ListItem>
                                                </List>
                                            )
                                        })}
                                    </>
                                )}

                                {isLoading2 ? (
                                    <>
                                        <Skeleton animation="wave" variant="rectangular" width={"100%"} height={36} sx={{ borderRadius: "4px" }} />
                                    </>
                                ) : (
                                    <>
                                        {Array.isArray(data2.members) && data2.members.length > 3 && (
                                            <Link href="/dashboard/members">
                                                <Button variant="contained" color="primary" sx={{ width: '100%' }}>
                                                    View All
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}

                            </CardContent>
                        </Paper>
                    </Grid>
                </Grid>
                
                {/* <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton animation="wave" variant="text" width={85} height={42} sx={{ mb: 2 }} />
                                <Card variant="outlined" sx={{ width: "100%", padding: "1rem", borderRadius: "1rem" }}>
                                    <Skeleton animation="wave" variant="text" width={195} height={32} sx={{ mb: 2 }} />
                                    <Skeleton animation="wave" variant="rectangular" width={"100%"} height={300} />
                                </Card>
                            </>
                        ) : (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    News
                                </Typography>

                                {Array.isArray(data.news) && data.news.map((item: any) => {
                                    let content = item.content.replace(/\[(.*?)\]\((.*?)\)/g, (match: any, p1: any, p2: any) => {
                                        return `<a href="${p2}">${p1}</a>`
                                    });

                                    return (
                                        <Card variant="outlined" key={item.id} sx={{ width: '100%', padding: "1rem", borderRadius: "1rem" }}>
                                            <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body1" color={"grey.200"} sx={{ whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{ __html: content }} />
                                        </Card>
                                    )
                                })}
                            </>
                        )}
                    </CardContent>
                </Paper> */}
            </Container>
        </>
    )
}