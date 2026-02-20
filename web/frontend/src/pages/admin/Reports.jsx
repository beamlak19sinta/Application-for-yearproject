import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../lib/api';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    Calendar,
    Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
    const { lang } = useLanguage();
    const [dateRange, setDateRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [queueStats, setQueueStats] = useState({
        served: { value: '0', change: '0%' },
        waitTime: { value: '0m', change: '0m' },
        noShows: { value: '0', change: '0%' }
    });
    const [servicePerformance, setServicePerformance] = useState([]);
    const [peakHours, setPeakHours] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [queueRes, serviceRes, peakRes] = await Promise.all([
                    api.get(`/analytics/queue?range=${dateRange}`),
                    api.get('/analytics/services'),
                    api.get('/analytics/peak-hours')
                ]);

                setQueueStats(queueRes.data);
                setServicePerformance(serviceRes.data);
                setPeakHours(peakRes.data || []);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [dateRange]);

    const statsCards = [
        { label: 'Total Served', ...queueStats.served, color: 'text-primary' },
        { label: 'Avg. Wait Time', ...queueStats.waitTime, color: 'text-green-500' },
        { label: 'No Shows', ...queueStats.noShows, color: 'text-red-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">{lang === 'en' ? 'Analytics & Reports' : 'ሪፖርቶች እና ትንታኔዎች'}</h1>
                    <p className="text-muted-foreground font-semibold mt-2">
                        {lang === 'en' ? 'Detailed insights into system performance and service usage.' : 'ስለ ሲስተም አፈጻጸም እና አገልግሎት አጠቃቀም ዝርዝር መረጃዎች።'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40 rounded-xl font-bold bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last quarter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl h-14 bg-muted/50 p-1 mb-8">
                    <TabsTrigger value="queue" className="rounded-xl font-bold h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        Queue Analytics
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-xl font-bold h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        Appointment Stats
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="space-y-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {statsCards.map((stat, i) => (
                                    <Card key={i} className="rounded-[32px] border-border bg-card shadow-sm">
                                        <CardContent className="p-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                                <Badge variant="outline" className={`font-bold border-none bg-muted/30 ${stat.change.includes('+') ? 'text-green-600' : 'text-red-500'}`}>
                                                    {stat.change}
                                                </Badge>
                                            </div>
                                            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Service Performance Table */}
                                <Card className="rounded-[32px] border-border bg-card">
                                    <CardHeader className="px-8 pt-8">
                                        <CardTitle className="font-black text-xl">Service Performance</CardTitle>
                                        <CardDescription className="font-bold">By visual volume and processing efficiency</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="space-y-6">
                                            {servicePerformance.length === 0 ? (
                                                <p className="text-center text-muted-foreground font-bold">No service data available.</p>
                                            ) : servicePerformance.map((service, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{service.name}</p>
                                                            <p className="text-xs font-bold text-muted-foreground">{service.total} tickets processed</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-foreground">{service.avgTime}</p>
                                                        <p className="text-xs font-bold text-muted-foreground">avg. wait</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Peak Hours Chart Placeholder */}
                                <Card className="rounded-[32px] border-border bg-card">
                                    <CardHeader className="px-8 pt-8">
                                        <CardTitle className="font-black text-xl">Peak Hours Traffic</CardTitle>
                                        <CardDescription className="font-bold">Average visitor volume by hour of day</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
                                        <div className="text-center space-y-4 w-full">
                                            {peakHours.length > 0 ? (
                                                <div className="flex items-end gap-2 h-32 justify-center mx-auto mb-4 opacity-70">
                                                    {peakHours.map((height, i) => (
                                                        <div key={i} className="w-8 bg-primary rounded-t-lg transition-all duration-500 hover:opacity-100" style={{ height: `${height}%` }} title={`Hour ${i + 8}:00`}></div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-muted-foreground font-bold">No traffic data available.</p>
                                            )}
                                            <p className="text-muted-foreground font-bold text-sm">Peak traffic is consistently around <span className="text-primary">10:00 AM - 12:00 PM</span></p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="appointments" className="space-y-8">
                    <Card className="rounded-[32px] border-border bg-card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Appointment Data</h3>
                        <p className="text-muted-foreground font-bold max-w-md mx-auto">
                            Detailed appointment analytics will appear here, showing booking trends, cancellation rates, and slot utilization.
                        </p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
