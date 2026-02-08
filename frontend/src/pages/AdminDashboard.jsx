import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    ShieldCheck,
    BarChart3,
    Users,
    Settings,
    Activity,
    Plus,
    MoreVertical,
    LogOut,
    Building2,
    RefreshCcw,
    X,
    ChevronRight,
    Search,
    Trash2,
    Edit3,
    Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const [stats, setStats] = useState({ users: 0, queues: 0, sectors: 0 });
    const [sectors, setSectors] = useState([]);
    const [showSectorModal, setShowSectorModal] = useState(false);
    const [sectorForm, setSectorForm] = useState({ name: '', description: '', icon: '' });
    const [editingSector, setEditingSector] = useState(null);

    // Service Management State
    const [showServiceManager, setShowServiceManager] = useState(false);
    const [selectedSectorForServices, setSelectedSectorForServices] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', mode: 'QUEUE', availability: 'Mon-Fri, 8:30am-5:30pm', icon: '', sectorId: ''
    });

    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sectorsRes, statsRes] = await Promise.all([
                api.get('/services/sectors'),
                api.get('/admin/stats')
            ]);
            setSectors(sectorsRes.data);
            setStats(statsRes.data);

            // Update selected sector if manager is open
            if (selectedSectorForServices) {
                const updated = sectorsRes.data.find(s => s.id === selectedSectorForServices.id);
                setSelectedSectorForServices(updated);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveSector = async (e) => {
        e.preventDefault();
        try {
            if (editingSector) {
                await api.patch(`/services/sectors/${editingSector.id}`, sectorForm);
            } else {
                await api.post('/services/sectors', sectorForm);
            }
            setShowSectorModal(false);
            setEditingSector(null);
            setSectorForm({ name: '', description: '', icon: '' });
            fetchData();
        } catch (err) {
            console.error('Failed to save sector', err);
            alert(err.response?.data?.message || 'Failed to save sector');
        }
    };

    const handleDeleteSector = async (id) => {
        if (!confirm('Are you sure you want to delete this sector and all its services?')) return;
        try {
            await api.delete(`/services/sectors/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete sector', err);
            alert('Failed to delete sector');
        }
    };

    // Service Handlers
    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.patch(`/services/services/${editingService.id}`, serviceForm);
            } else {
                await api.post('/services/services', { ...serviceForm, sectorId: selectedSectorForServices.id });
            }
            setShowServiceModal(false);
            setEditingService(null);
            fetchData();
        } catch (err) {
            console.error('Failed to save service', err);
            alert('Failed to save service');
        }
    };

    const handleDeleteService = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/services/services/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete service', err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-80 border-r border-border bg-card hidden lg:flex flex-col p-8 space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="text-primary-foreground w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg uppercase leading-none">Admin Panel</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Dagmawi Menelik</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: 'System Overview', icon: BarChart3, active: !showServiceManager },
                        { label: 'Sectors & Services', icon: Building2, active: showServiceManager },
                        { label: 'User Directory', icon: Users },
                        { label: 'System Logs', icon: Activity },
                        { label: 'Settings', icon: Settings },
                    ].map((item, i) => (
                        <Button
                            key={i}
                            variant={item.active ? 'secondary' : 'ghost'}
                            className={`w-full justify-start gap-4 h-14 rounded-2xl font-bold transition-all ${item.active ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-muted-foreground'}`}
                        >
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : ''}`} />
                            {item.label}
                        </Button>
                    ))}
                </nav>

                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-4 text-destructive font-bold h-12 rounded-xl" onClick={logout}>
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-muted/5">
                <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Badge className="bg-primary/5 text-primary border-none px-4 py-1 font-bold">LIVE SYSTEM</Badge>
                        <h2 className="text-xl font-black">
                            {showServiceManager ? `Manage: ${selectedSectorForServices?.name}` : 'Administrative Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {showServiceManager && (
                            <Button variant="ghost" className="font-bold gap-2" onClick={() => setShowServiceManager(false)}>
                                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Overview
                            </Button>
                        )}
                        <ThemeToggle />
                        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'en' ? 'am' : 'en')} className="rounded-full font-bold border-border">
                            {lang === 'en' ? 'አማርኛ' : 'English'}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold" onClick={fetchData}>
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
                        </Button>
                    </div>
                </header>

                <div className="p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-12">
                        {!showServiceManager ? (
                            <>
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: 'Citizens Enrolled', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                        { label: 'Tickets Issued', value: stats.queues, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
                                        { label: 'Active Sectors', value: stats.sectors, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
                                    ].map((stat, i) => (
                                        <Card key={i} className="rounded-[40px] border-border p-8 bg-card shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-4xl font-black mt-1">{stat.value}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Sector Management */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-3xl font-black">Manage Sectors</h3>
                                            <p className="text-muted-foreground font-bold">Configure service categories</p>
                                        </div>
                                        <Button className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl shadow-primary/20" onClick={() => { setEditingSector(null); setSectorForm({ name: '', description: '', icon: '' }); setShowSectorModal(true); }}>
                                            <Plus className="w-5 h-5" /> ADD NEW SECTOR
                                        </Button>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-6">
                                        {sectors.map((sector) => (
                                            <Card key={sector.id} className="rounded-[40px] p-8 border-border hover:border-primary/50 transition-all bg-card shadow-sm group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-muted rounded-[24px] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <Building2 className="w-8 h-8 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-2xl">{sector.name}</h4>
                                                            <Badge variant="secondary" className="rounded-lg font-bold mt-1">{sector.services?.length || 0} Services</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 hover:bg-primary/10 hover:text-primary border-border" onClick={() => { setEditingSector(sector); setSectorForm({ name: sector.name, description: sector.description, icon: sector.icon }); setShowSectorModal(true); }}>
                                                            <Edit3 className="w-5 h-5" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 hover:bg-destructive/10 hover:text-destructive border-border" onClick={() => handleDeleteSector(sector.id)}>
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                                    <Button variant="ghost" className="rounded-xl gap-2 text-primary font-black group-hover:translate-x-1 transition-transform" onClick={() => { setSelectedSectorForServices(sector); setShowServiceManager(true); }}>
                                                        MANAGE SERVICES <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            </>
                        ) : (
                            /* Service Manager View */
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center">
                                            <Layers className="w-10 h-10 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black">All Services</h3>
                                            <p className="text-muted-foreground font-bold">Configuring available workflows for {selectedSectorForServices?.name}</p>
                                        </div>
                                    </div>
                                    <Button className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl shadow-primary/20" onClick={() => { setEditingService(null); setServiceForm({ name: '', description: '', mode: 'QUEUE', availability: 'Mon-Fri, 8:30am-5:30pm', icon: '', sectorId: selectedSectorForServices.id }); setShowServiceModal(true); }}>
                                        <Plus className="w-5 h-5" /> ADD NEW SERVICE
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {(selectedSectorForServices?.services || []).map((service) => (
                                        <Card key={service.id} className="rounded-[32px] p-6 border-border bg-card flex items-center justify-between hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-black text-primary">
                                                    {service.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-xl flex items-center gap-3">
                                                        {service.name}
                                                        <Badge className="rounded-lg bg-primary/10 text-primary border-none">{service.mode}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-bold">{service.availability}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold border-border" onClick={() => { setEditingService(service); setServiceForm({ name: service.name, description: service.description, mode: service.mode, availability: service.availability, icon: service.icon, sectorId: service.sectorId }); setShowServiceModal(true); }}>Edit</Button>
                                                <Button variant="ghost" size="sm" className="rounded-xl px-4 font-bold text-destructive" onClick={() => handleDeleteService(service.id)}>Delete</Button>
                                            </div>
                                        </Card>
                                    ))}
                                    {(!selectedSectorForServices?.services || selectedSectorForServices.services.length === 0) && (
                                        <div className="py-20 text-center bg-muted/20 rounded-[40px] border-2 border-dashed border-border">
                                            <p className="text-muted-foreground font-bold italic">No services defined for this sector yet.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Sector Modal */}
            {showSectorModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md rounded-[50px] p-10 bg-card border-border shadow-2xl">
                        <CardHeader className="p-0 mb-8"><CardTitle className="text-3xl font-black">{editingSector ? 'Update Sector' : 'New Sector'}</CardTitle></CardHeader>
                        <form onSubmit={handleSaveSector} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase text-muted-foreground">Title</label>
                                <Input className="rounded-2xl h-14 mt-2 font-bold text-lg" value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-muted-foreground">Description</label>
                                <textarea className="w-full rounded-2xl h-32 mt-2 p-4 border border-border bg-muted/20 font-bold outline-none" value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-black" onClick={() => setShowSectorModal(false)}>CANCEL</Button>
                                <Button type="submit" className="flex-1 rounded-2xl font-black bg-primary">SAVE</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md rounded-[50px] p-10 bg-card border-border shadow-2xl">
                        <CardHeader className="p-0 mb-8"><CardTitle className="text-3xl font-black">{editingService ? 'Update Service' : 'New Service'}</CardTitle></CardHeader>
                        <form onSubmit={handleSaveService} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase text-muted-foreground">Service Name</label>
                                <Input className="rounded-2xl h-14 mt-2 font-bold" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground">Mode</label>
                                    <select className="w-full h-14 rounded-2xl border border-border bg-muted/20 mt-2 px-4 font-bold outline-none" value={serviceForm.mode} onChange={e => setServiceForm({ ...serviceForm, mode: e.target.value })}>
                                        <option value="QUEUE">QUEUE</option>
                                        <option value="APPOINTMENT">APPOINTMENT</option>
                                        <option value="ONLINE">ONLINE ONLY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground">Availability</label>
                                    <Input className="rounded-2xl h-14 mt-2 font-bold" value={serviceForm.availability} onChange={e => setServiceForm({ ...serviceForm, availability: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-black" onClick={() => setShowServiceModal(false)}>CANCEL</Button>
                                <Button type="submit" className="flex-1 rounded-2xl font-black bg-primary">SAVE SERVICE</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
