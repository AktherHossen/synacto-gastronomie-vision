import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable, subscribeToTableChanges, Table, NewTable, TableStatus } from '@/services/tableService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const statusColors = {
    Available: 'bg-green-100 border-green-300 text-green-800',
    Occupied: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    Reserved: 'bg-blue-100 border-blue-300 text-blue-800',
};

const TablesPage = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState<Table | null>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const data = await getTables();
                setTables(data);
            } catch (error: any) {
                toast({ title: t('tables.errors.fetch_title'), description: error.message, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchTables();

        const unsubscribe = subscribeToTableChanges(() => {
            fetchTables();
        });

        return () => unsubscribe();
    }, [t, toast]);

    const handleSaveTable = async (tableData: NewTable) => {
        try {
            if (currentTable) {
                await updateTable(currentTable.id, tableData);
                toast({ title: t('tables.success.update_title') });
            } else {
                await createTable(tableData);
                toast({ title: t('tables.success.create_title') });
            }
            setIsDialogOpen(false);
            setCurrentTable(null);
        } catch (error: any) {
            toast({ title: t('tables.errors.save_title'), description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteTable = async (id: string) => {
        if (window.confirm(t('tables.confirm_delete'))) {
            try {
                await deleteTable(id);
                toast({ title: t('tables.success.delete_title') });
            } catch (error: any) {
                toast({ title: t('tables.errors.delete_title'), description: error.message, variant: 'destructive' });
            }
        }
    };
    
    const handleStatusChange = async (tableId: string, status: TableStatus) => {
        try {
            await updateTable(tableId, { status });
            toast({ title: t('tables.success.status_update_title') });
        } catch (error: any) {
            toast({ title: t('tables.errors.status_update_title'), description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('tables.title', 'Table Management')}</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setCurrentTable(null)}>
                            <Plus className="mr-2 h-4 w-4" /> {t('tables.add_new')}
                        </Button>
                    </DialogTrigger>
                    <TableFormDialog 
                        isOpen={isDialogOpen}
                        setIsOpen={setIsDialogOpen}
                        onSave={handleSaveTable} 
                        table={currentTable} 
                    />
                </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map(table => (
                    <Card key={table.id} className={`border-2 ${statusColors[table.status as TableStatus]}`}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {table.name}
                                <div className="flex gap-2">
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => { setCurrentTable(table); setIsDialogOpen(true); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTable(table.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={table.status} onValueChange={(value: TableStatus) => handleStatusChange(table.id, value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">{t('tables.status.Available')}</SelectItem>
                                    <SelectItem value="Occupied">{t('tables.status.Occupied')}</SelectItem>
                                    <SelectItem value="Reserved">{t('tables.status.Reserved')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};


interface TableFormDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSave: (data: NewTable) => void;
    table: Table | null;
}

const TableFormDialog: React.FC<TableFormDialogProps> = ({ isOpen, setIsOpen, onSave, table }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<TableStatus>('Available');
    const [capacity, setCapacity] = useState(4);
    const [gridX, setGridX] = useState<number | null>(0);
    const [gridY, setGridY] = useState<number | null>(0);
    const [gridW, setGridW] = useState<number | null>(1);
    const [gridH, setGridH] = useState<number | null>(1);
    const { t } = useTranslation();

    useEffect(() => {
        if (table) {
            setName(table.name);
            setStatus(table.status as TableStatus);
            setCapacity(table.capacity);
            setGridX(table.grid_x);
            setGridY(table.grid_y);
            setGridW(table.grid_w);
            setGridH(table.grid_h);
        } else {
            setName('');
            setStatus('Available');
            setCapacity(4);
            setGridX(0);
            setGridY(0);
            setGridW(1);
            setGridH(1);
        }
    }, [table, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            status,
            capacity,
            grid_x: gridX,
            grid_y: gridY,
            grid_w: gridW,
            grid_h: gridH,
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{table ? t('tables.edit_title') : t('tables.add_title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">{t('tables.form.name')}</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">{t('tables.form.status')}</Label>
                        <Select value={status} onValueChange={(value: TableStatus) => setStatus(value)}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Available">{t('tables.status.Available')}</SelectItem>
                                <SelectItem value="Occupied">{t('tables.status.Occupied')}</SelectItem>
                                <SelectItem value="Reserved">{t('tables.status.Reserved')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="text-right">{t('tables.form.capacity', 'Capacity')}</Label>
                        <Input id="capacity" type="number" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grid_x" className="text-right">X</Label>
                        <Input id="grid_x" type="number" value={gridX ?? 0} onChange={e => setGridX(Number(e.target.value))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grid_y" className="text-right">Y</Label>
                        <Input id="grid_y" type="number" value={gridY ?? 0} onChange={e => setGridY(Number(e.target.value))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grid_w" className="text-right">W</Label>
                        <Input id="grid_w" type="number" value={gridW ?? 1} onChange={e => setGridW(Number(e.target.value))} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grid_h" className="text-right">H</Label>
                        <Input id="grid_h" type="number" value={gridH ?? 1} onChange={e => setGridH(Number(e.target.value))} className="col-span-3" required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>{t('tables.form.cancel')}</Button>
                    <Button type="submit">{t('tables.form.save')}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

export default TablesPage; 