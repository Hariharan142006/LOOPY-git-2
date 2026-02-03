'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    currentPrice: number;
    cities: string[];
    onSchedule: (data: ScheduledRateData) => Promise<void>;
}

export interface ScheduledRateData {
    price: number;
    effectiveDate: Date;
    city: string | null;
}

export function ScheduleModal({ isOpen, onClose, itemName, currentPrice, cities, onSchedule }: ScheduleModalProps) {
    const [price, setPrice] = useState<string>(currentPrice.toString());
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('09:00');
    const [city, setCity] = useState<string>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;

        setIsSubmitting(true);
        try {
            const [hours, minutes] = time.split(':').map(Number);
            const effectiveDate = new Date(date);
            effectiveDate.setHours(hours, minutes);

            await onSchedule({
                price: parseFloat(price),
                effectiveDate,
                city: city === 'all' ? null : city
            });
            onClose();
        } catch (error) {
            console.error('Failed to schedule rate', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Schedule Rate Change</DialogTitle>
                    <DialogDescription>
                        Plan a future price update for <strong>{itemName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="s-price">New Price (₹)</Label>
                        <Input
                            id="s-price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            step="0.01"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>City Scope</Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Global (All Cities)</SelectItem>
                                {cities.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            "Global" applies to all cities unless a specific city override exists.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Schedule Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
