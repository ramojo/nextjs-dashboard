'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

/**
 * Creates a new invoice based on the provided form data.
 *
 * @param formData - The form data containing the invoice details.
 * @returns A Promise that resolves when the invoice is created.
 */
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new  Date().toISOString().split('T')[0];

    const rawFormData2 = Object.fromEntries(formData.entries());
    
    // View in console
    console.log('customerId: ', customerId);
    console.log('amount: ', amount);
    console.log('status: ', status);
    console.log('amountInCents: ', amountInCents);
    console.log('date: ', date);
    console.log('Raw form data: ', formData);
    console.log('Type of customerId: ', typeof customerId);
    console.log('Type of amount: ', typeof amount);
    console.log('Type of status: ', typeof status);
    console.log('Raw form data 2: ', rawFormData2);
    await sql `
        INSERT INTO invoices(customer_id, amount, status, date)
        VALUES(${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const {customerId, amount, status} = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}
        WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`
        DELETE FROM invoices
        WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');
}