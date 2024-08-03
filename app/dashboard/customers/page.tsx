import Pagination from '@/app/ui/customers/pagination';
import Search from '@/app/ui/search';
import CustomersTable from '@/app/ui/customers/table';
import { fetchCustomers, fetchFilteredCustomers } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import { TableRowSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchCustomersPages } from '@/app/lib/data';
import { Metadata } from 'next';
import { FormattedCustomersTable } from '@/app/lib/definitions';

export const metadata: Metadata = {
  title: 'Customers',
};
 
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    searchString?: string;
    page?: string;
  };
}) {
  const query = searchParams?.searchString || '';
  const currentPage = Number(searchParams?.page || 1);

  const totalPages = await fetchCustomersPages(query);
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      
      <Suspense key={query + currentPage} fallback={<TableRowSkeleton />}>
        <CustomersTable customers={customers} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}