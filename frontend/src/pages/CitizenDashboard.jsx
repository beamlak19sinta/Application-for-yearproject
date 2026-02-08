import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    LogOut,
    User,
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Settings,
    Bell,
    Search,
    ChevronRight,
    Clock,
    MapPin,
    Building2,
    Ticket
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';

export default function CitizenDashboard() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [activeQueue, setActiveQueue] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [sectorsRes, queueRes] = await Promise.all([
                api.get('/services/sectors'),
                api.get('/queues/my-status')
            ]);
            setSectors(sectorsRes.data);
            setActiveQueue(queueRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get('/queues/my-status');
                setActiveQueue(data);
            } catch (err) {
                console.error('Status poll failed', err);
            }
        }, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleTakeTicket = async (serviceId) => {
        try {
            const { data } = await api.post('/queues/take', { serviceId });
            setActiveQueue(data);
            setSelectedSector(null);
        } catch (err) {
            console.error('Failed to take ticket', err);
            alert(err.response?.data?.message || 'Failed to take ticket');
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card hidden lg:flex flex-col p-8 space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Building2 className="text-primary-foreground w-6 h-6" />
                    </div>
                    <span className="font-black text-lg uppercase tracking-tight">Dagmawi Portal</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: 'Dashboard', icon: LayoutDashboard, active: true },
                        { label: 'My Requests', icon: ClipboardList },
                        { label: 'Appointments', icon: Calendar },
                        { label: 'Profile', icon: User },
                        { label: 'Settings', icon: Settings },
                    ].map((item, i) => (
                        <Button
                            key={i}
                            variant={item.active ? 'secondary' : 'ghost'}
                            className={`w-full justify-start gap-4 h-12 rounded-xl font-bold ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                <Button variant="ghost" className="justify-start gap-4 text-destructive font-bold h-12 rounded-xl" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    Log Out
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search services..." className="pl-10 h-11 rounded-xl border-border bg-muted/20" />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="rounded-full font-bold border-border">
                            {lang === 'en' ? 'አማርኛ' : 'English'}
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-11 h-11 border-border relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                        </Button>
                        <div className="h-10 w-px bg-border mx-2" />
                        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border">
                            <div className="text-right">
                                <div className="text-sm font-black text-foreground">{user?.name}</div>
                                <div className="text-[10px] font-bold text-primary uppercase">Citizen</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
                    <div className="max-w-6xl mx-auto space-y-10">
                        {/* Welcome Section */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight mb-2">Welcome back!</h2>
                                <p className="text-muted-foreground font-semibold flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Bahir Dar City Portal
                                </p>
                            </div>
                            <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 text-right">
                                <div className="text-xs font-black text-primary uppercase mb-1">Queue Status</div>
                                <div className="text-2xl font-black">Live Tracking</div>
                            </div>
                        </div>

                        {/* Active Queue Card */}
                        {activeQueue && (
                            <Card className="bg-primary text-primary-foreground border-none rounded-[40px] shadow-2xl shadow-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <Badge className={`${activeQueue.status === 'CALLING' || activeQueue.status === 'PROCESSING' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'} text-white font-bold px-4 py-1.5 border-none`}>
                                        {activeQueue.status === 'CALLING' ? 'YOUR TURN! GO TO COUNTER' :
                                            activeQueue.status === 'PROCESSING' ? 'CURRENTLY SERVING' : 'Active Ticket'}
                                    </Badge>
                                    <h3 className="text-3xl font-black">{activeQueue.service?.name}</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 opacity-70" />
                                            <span className="font-bold">Est. Wait: {(activeQueue.peopleAhead || 0) * 5} mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-5 h-5 opacity-70" />
                                            <span className="font-bold">Sector: {activeQueue.service?.sector?.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-[10px] font-black uppercase opacity-70 mb-2">Your Number</div>
                                        <div className="text-7xl font-black leading-none">{activeQueue.ticketNumber}</div>
                                    </div>
                                    <div className="w-px h-16 bg-white/20 hidden md:block" />
                                    <div className="text-center">
                                        <div className="text-[10px] font-black uppercase opacity-70 mb-2">People Ahead</div>
                                        <div className="text-7xl font-black leading-none">{activeQueue.peopleAhead || 0}</div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Service Sectors */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black">
                                    {selectedSector ? (
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedSector(null)} className="p-0 h-auto font-black text-muted-foreground hover:text-primary">Sectors</Button>
                                            <ChevronRight className="w-5 h-5" />
                                            <span>{selectedSector.name}</span>
                                        </div>
                                    ) : 'Available Sectors'}
                                </h3>
                                {!selectedSector && <Button variant="link" className="text-primary font-bold">View All Services</Button>}
                            </div>

                            {!selectedSector ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sectors.map((sector, i) => (
                                        <Card key={i} className="group hover:border-primary transition-all duration-300 rounded-[32px] p-6 cursor-pointer bg-card hover:translate-y-[-4px]" onClick={() => setSelectedSector(sector)}>
                                            <CardHeader className="p-0 space-y-4">
                                                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-2">
                                                    <CardTitle className="text-xl font-bold">{sector.name}</CardTitle>
                                                    <CardDescription className="text-muted-foreground font-semibold leading-relaxed">
                                                        {sector.description}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>
                                            <div className="mt-8 flex justify-end">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {selectedSector.services?.map((service, i) => (
                                        <Card key={i} className="rounded-[32px] p-6 bg-card border-border hover:border-primary transition-colors">
                                            <div className="space-y-4">
                                                <Badge variant="secondary" className="rounded-lg">{service.mode}</Badge>
                                                <h4 className="text-xl font-black">{service.name}</h4>
                                                <p className="text-sm text-muted-foreground font-semibold">Available: {service.availability}</p>
                                                <Button
                                                    className="w-full rounded-2xl h-12 font-black mt-4"
                                                    onClick={() => handleTakeTicket(service.id)}
                                                    disabled={activeQueue !== null}
                                                >
                                                    {service.mode === 'QUEUE' ? 'Take Queue Ticket' : 'Book Appointment'}
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
