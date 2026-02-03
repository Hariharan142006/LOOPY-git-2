
import { getScrapItemsAction } from '@/app/actions';
import RatesPageClient from './rates-page-client';

export const dynamic = 'force-dynamic';

export default async function RatesPage() {
    const items = await getScrapItemsAction();
    return <RatesPageClient items={items} />;
}
