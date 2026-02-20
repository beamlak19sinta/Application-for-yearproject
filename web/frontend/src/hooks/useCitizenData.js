import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export function useCitizenData() {
    const [sectors, setSectors] = useState([]);
    const [activeQueue, setActiveQueue] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [onlineRequests, setOnlineRequests] = useState([]);
    const [queueHistory, setQueueHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            const [sectorsRes, queueRes, appointmentsRes, historyRes, onlineRes] = await Promise.all([
                api.get('/services/sectors'),
                api.get('/queues/my-status'),
                api.get('/appointments/my-appointments'),
                api.get('/queues/my-history'),
                api.get('/requests/my-requests')
            ]);
            setSectors(sectorsRes.data);
            setActiveQueue(queueRes.data);
            setAppointments(appointmentsRes.data);
            setQueueHistory(historyRes.data);
            setOnlineRequests(onlineRes.data);
        } catch (err) {
            console.error('Failed to fetch citizen data', err);
            showToast('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get('/queues/my-status');
                setActiveQueue(data);
            } catch (err) {
                console.error('Status poll failed', err);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return {
        sectors,
        activeQueue,
        appointments,
        onlineRequests,
        queueHistory,
        loading,
        refresh: fetchData,
        setActiveQueue
    };
}
