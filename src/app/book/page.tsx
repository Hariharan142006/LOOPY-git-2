import { getScrapItemsAction } from '@/app/actions';
import DashboardLayout from '@/app/dashboard/layout';
import BookingForm from './booking-form';

export default async function BookPickupPage() {
    const items = await getScrapItemsAction();

    return (
        <DashboardLayout>
            <BookingForm items={items} />
        </DashboardLayout>
    );
}
