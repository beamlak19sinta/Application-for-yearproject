import React, { useState } from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Ticket,
    Clock,
    AlertCircle,
    History,
    ChevronRight,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Queue() {
    const { lang } = useLanguage();
    const { activeQueue, queueHistory, sectors, loading, refresh } = useCitizenData();
    const { showToast } = useToast();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCancelTicket = async () => {
        setIsCancelling(true);
        try {
            await api.delete(`/queues/${activeQueue.id}`);
            showToast('Ticket cancelled', 'info');
            setShowCancelDialog(false);
            refresh();
        } catch (err) {
            showToast('Failed to cancel ticket', 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleTakeTicket = async (serviceId) => {
        try {
            await api.post('/queues/take', { serviceId });
            showToast('Ticket taken successfully!', 'success');
            refresh();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to take ticket', 'error');
        }
    };

    if (loading) return <div className="animate-pulse space-y-8"><div className="h-64 bg-muted rounded-[40px]" /></div>;

    const queueAvailableServices = sectors.flatMap(s => s.services.filter(ser => ser.mode === 'QUEUE').map(ser => ({ ...ser, sectorName: s.name })));
    const filteredQuickTake = queueAvailableServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'Digital Queue' : 'ዲጂታል ወረፋ'}</h2>
                <p className="text-muted-foreground font-semibold">Track your position and take new tickets.</p>
            </div>

            {/* Active Ticket Section */}
            {activeQueue ? (
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
                        <Button
                            variant="destructive"
                            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold h-10 mt-4"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            Cancel Ticket
                        </Button>
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
            ) : (
                <Card className="border-dashed border-2 rounded-[40px] p-8 bg-muted/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                <Ticket className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">No Active Ticket</h3>
                                <p className="text-muted-foreground font-semibold">Ready to be served? Take a ticket below.</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search queue services..."
                                className="pl-10 rounded-xl bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {filteredQuickTake.map((service, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                className="h-auto py-4 px-6 rounded-2xl flex flex-col items-center gap-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={() => handleTakeTicket(service.id)}
                            >
                                <span className="font-black text-center">{service.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{service.sectorName}</span>
                            </Button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Queue History */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-black">Recent History</h3>
                </div>
                {queueHistory.length > 0 ? (
                    <div className="grid gap-4">
                        {queueHistory.map((req, i) => (
                            <Card key={i} className="rounded-3xl p-6 border-border bg-card flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                        #{req.ticketNumber}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">{req.service?.name}</h4>
                                        <p className="text-sm text-muted-foreground font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'REJECTED' ? 'destructive' : 'secondary'} className="rounded-lg font-bold">
                                    {req.status}
                                </Badge>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-[32px] p-10 border-border bg-card text-center text-muted-foreground font-bold italic">
                        No previous queue history found.
                    </Card>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-center">Cancel Ticket?</DialogTitle>
                            <DialogDescription className="text-center font-semibold text-muted-foreground">
                                Are you sure you want to release your spot in the queue? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button variant="ghost" className="flex-1 rounded-2xl font-bold h-12" onClick={() => setShowCancelDialog(false)}>Keep Ticket</Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-destructive/20"
                            onClick={handleCancelTicket}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
