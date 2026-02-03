'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ArrowUp, RotateCcw, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RateHistoryItem {
    id: string;
    price: number;
    changedBy: string;
    changedAt: string; // ISO date string
    city: string | null;
    action: 'UPDATE' | 'ROLLBACK' | 'SCHEDULED';
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    currentPrice: number;
    history: RateHistoryItem[];
    onRollback: (price: number) => void;
}

export function HistoryModal({ isOpen, onClose, itemName, currentPrice, history, onRollback }: HistoryModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Rate History: {itemName}</span>
                        <Badge variant="outline" className="text-lg">
                            Current: ₹{currentPrice}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        View past rate changes and rollback if necessary.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Price (₹)</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Changed By</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No history found for this item.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item, index) => {
                                    const isMore = item.price > (history[index + 1]?.price || 0);
                                    const isLess = item.price < (history[index + 1]?.price || 0);

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(item.changedAt), 'PP')}</span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(item.changedAt), 'p')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">₹{item.price}</span>
                                                    {index < history.length - 1 && (
                                                        <>
                                                            {isMore && <ArrowUp className="h-4 w-4 text-green-500" />}
                                                            {isLess && <ArrowDown className="h-4 w-4 text-red-500" />}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                    {item.city || 'Global'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                                        {item.changedBy.charAt(0)}
                                                    </div>
                                                    <span className="text-sm">{item.changedBy}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {index !== 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRollback(item.price)}
                                                        className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                    >
                                                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                                        Rollback
                                                    </Button>
                                                )}
                                                {index === 0 && (
                                                    <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full flex items-center w-fit">
                                                        <Clock className="w-3 h-3 mr-1" /> Current
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
