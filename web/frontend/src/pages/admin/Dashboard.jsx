import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import {
    Users,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
    const { lang } = useLanguage();
    const [stats, setStats] = useState({ users: 0, queues: 0, sectors: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/logs')
                ]);
                setStats(statsRes.data);
                setLogs(logsRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        {
            label: lang === 'en' ? 'Total Citizens' : 'ጠቅላላ ተጠቃሚዎች',
            value: stats.users,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            trend: '+12% from last month'
        },
        {
            label: lang === 'en' ? 'Active Tickets' : 'ንቁ ቲኬቶች',
            value: stats.queues,
            icon: BarChart3,
            color: 'text-primary',
            bg: 'bg-primary/10',
            trend: '+5% from yesterday'
        },
        {
            label: lang === 'en' ? 'Active Sectors' : 'ንቁ ዘርፎች',
            value: stats.sectors,
            icon: Activity,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            trend: 'Stable'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black tracking-tight">
                    {lang === 'en' ? 'System Overview' : 'የሲስተም አጠቃላይ እይታ'}
                </h1>
                <p className="text-muted-foreground font-semibold mt-2">
                    {lang === 'en' ? 'Monitor your system performance and activity.' : 'የሲስተምዎን አፈጻጸም እና እንቅስቃሴ ይቆጣጠሩ።'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="rounded-[32px] border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <Badge variant="secondary" className="font-bold rounded-lg text-xs">
                                    {stat.trend.includes('+') ? <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" /> : <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />}
                                    {stat.trend}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-5xl font-black text-foreground">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System Logs */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black">
                            {lang === 'en' ? 'Recent Activity Logs' : 'የቅርብ ጊዜ እንቅስቃሴ ምዝግብ ማስታወሻዎች'}
                        </h3>
                        <p className="text-muted-foreground font-bold text-sm">
                            {lang === 'en' ? 'Monitor system actions and events.' : 'የሲስተም እርምጃዎችን እና ክስተቶችን ይቆጣጠሩ።'}
                        </p>
                    </div>
                </div>

                <Card className="rounded-[32px] border-border bg-card overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? 'Filter logs...' : 'ምዝግብ ማስታወሻዎችን አጣራ...'}
                                className="pl-10 rounded-xl bg-background border-border"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-muted-foreground pl-6">{lang === 'en' ? 'Action' : 'ተግባር'}</TableHead>
                                <TableHead className="font-bold text-muted-foreground">{lang === 'en' ? 'Details' : 'ዝርዝሮች'}</TableHead>
                                <TableHead className="font-bold text-muted-foreground">{lang === 'en' ? 'User' : 'ተጠቃሚ'}</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-right pr-6">{lang === 'en' ? 'Date' : 'ቀን'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.filter(l =>
                                    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-black pl-6 py-4">
                                            <Badge variant="outline" className="font-bold rounded-lg border-primary/20 text-primary bg-primary/5">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-muted-foreground text-sm py-4">{log.details}</TableCell>
                                        <TableCell className="font-black text-foreground py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                                                        {log.user.name[0]}
                                                    </div>
                                                    {log.user.name}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="rounded-lg">System</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs font-black uppercase text-muted-foreground text-right pr-6 py-4">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center font-bold text-muted-foreground">
                                        {lang === 'en' ? 'No recent logs found.' : 'ምንም የቅርብ ጊዜ ምዝግብ ማስታወሻዎች አልተገኙም።'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
