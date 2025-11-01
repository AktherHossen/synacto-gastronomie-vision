import React, { useState, useEffect } from 'react';
import { getKitchenOrders, updateOrderStatus, subscribeToKitchenOrders, Order } from '@/services/ordersService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const KitchenDisplay = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchOrders = async () => {
        try {
            const kitchenOrders = await getKitchenOrders();
            setOrders(kitchenOrders);
        } catch (error) {
            toast({ title: "Fehler", description: "Bestellungen konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const unsubscribe = subscribeToKitchenOrders((payload) => {
            console.log('Realtime event:', payload);
            fetchOrders(); 
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
        try {
            await updateOrderStatus(orderId, status);
            toast({ title: "Status aktualisiert", description: `Bestellung #${orderId.substring(0,5)} ist jetzt ${status}.` });
        } catch (error) {
            toast({ title: "Fehler", description: "Status konnte nicht aktualisiert werden.", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'in_progress');

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Küchen-Display</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {orders.map(order => (
                    <Card key={order.id} className={`shadow-lg rounded-lg ${order.status === 'pending' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <CardHeader>
                            <CardTitle className="text-2xl flex justify-between">
                                <span>Tisch #{order.table_number || 'N/A'}</span>
                                <span className="text-gray-500 font-normal text-sm">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: de })}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Separator />
                            <ul className="my-4 space-y-3">
                                {order.items.map(item => (
                                    <li key={item.id} className="text-lg flex justify-between">
                                        <span>{item.quantity} x {item.name}</span>
                                    </li>
                                ))}
                            </ul>
                            {order.notes && (
                                <>
                                    <Separator />
                                    <p className="mt-4 text-sm text-gray-700 italic"><strong>Notiz:</strong> {order.notes}</p>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {order.status === 'pending' && (
                                <Button className="w-full text-lg p-6 bg-yellow-500 hover:bg-yellow-600" onClick={() => handleUpdateStatus(order.id, 'in_progress')}>
                                    Zubereiten
                                </Button>
                            )}
                             {order.status === 'in_progress' && (
                                <Button className="w-full text-lg p-6 bg-green-500 hover:bg-green-600" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                    Bereit
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                {orders.length === 0 && (
                    <div className="text-center text-gray-500 col-span-full mt-16">
                        <h2 className="text-2xl">Keine aktiven Bestellungen</h2>
                        <p>Neue Bestellungen werden hier in Echtzeit angezeigt.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenDisplay; 