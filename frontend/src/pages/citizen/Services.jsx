import React, { useState } from 'react';
import { useCitizenData } from '../../hooks/useCitizenData';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Fingerprint,
    FileText,
    HardHat,
    Banknote,
    Search,
    ChevronRight,
    Building2
} from 'lucide-react';

export default function Services() {
    const { lang } = useLanguage();
    const { sectors, activeQueue, refresh } = useCitizenData();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({ date: '', timeSlot: '' });
    const [applicationForm, setApplicationForm] = useState({ remarks: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('id')) return Fingerprint;
        if (n.includes('birth')) return FileText;
        if (n.includes('construction')) return HardHat;
        if (n.includes('revenue')) return Banknote;
        return Building2;
    };

    // Filter services based on search and user's focus
    const allServices = sectors.flatMap(s => s.services.map(ser => ({ ...ser, sectorName: s.name })));
    const filteredServices = allServices.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sectorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (service) => {
        setSelectedService(service);
        if (service.mode === 'QUEUE') {
            handleTakeTicket(service.id);
        } else {
            setShowBookingModal(true);
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

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (selectedService.mode === 'APPOINTMENT') {
                await api.post('/appointments/book', {
                    serviceId: selectedService.id,
                    ...bookingForm
                });
            } else {
                await api.post('/requests/submit', {
                    serviceId: selectedService.id,
                    remarks: applicationForm.remarks,
                    data: {}
                });
            }
            showToast('Success!', 'success');
            setShowBookingModal(false);
            refresh();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{lang === 'en' ? 'Available Services' : 'የሚገኙ አገልግሎቶች'}</h2>
                    <p className="text-muted-foreground font-semibold">Select a service to start your journey.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 h-11 rounded-2xl bg-muted/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, i) => {
                    const Icon = getIcon(service.name);
                    return (
                        <Card key={i} className="group hover:border-primary transition-all duration-300 rounded-[32px] p-6 bg-card flex flex-col justify-between hover:translate-y-[-4px]">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <Badge variant="secondary" className="rounded-lg">{service.mode}</Badge>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">{service.sectorName}</p>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {service.description || 'Access municipal services efficiently through our digital portal.'}
                                </p>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{service.availability}</span>
                                <Button
                                    className="rounded-xl font-black gap-2 h-10 px-4"
                                    onClick={() => handleAction(service)}
                                    disabled={service.mode === 'QUEUE' && activeQueue !== null}
                                >
                                    {service.mode === 'QUEUE' ? 'Take Queue' : service.mode === 'APPOINTMENT' ? 'Book' : 'Apply'}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{selectedService?.name}</DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground">
                            {selectedService?.mode === 'APPOINTMENT' ? 'Schedule your visit to the office.' : 'Submit your digital application.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBooking} className="space-y-6 pt-4">
                        {selectedService?.mode === 'APPOINTMENT' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="font-bold">Preferred Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        required
                                        className="h-12 rounded-xl"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingForm.date}
                                        onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="font-bold">Time Slot</Label>
                                    <select
                                        id="time"
                                        className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                                        required
                                        value={bookingForm.timeSlot}
                                        onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                                    >
                                        <option value="">Select a slot</option>
                                        <option value="08:30 - 09:30">08:30 - 09:30</option>
                                        <option value="09:30 - 10:30">09:30 - 10:30</option>
                                        <option value="10:30 - 11:30">10:30 - 11:30</option>
                                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                                        <option value="15:00 - 16:30">15:00 - 16:30</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="remarks" className="font-bold">Remarks / Details</Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Describe your request..."
                                    className="min-h-[120px] rounded-xl"
                                    value={applicationForm.remarks}
                                    onChange={e => setApplicationForm({ ...applicationForm, remarks: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2">Your profile data will be attached automatically.</p>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm submission'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
