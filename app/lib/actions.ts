'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Amount must be greater than $0' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select a status',
    }),
    date: z.string(),
});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}
/**
 * Creates a new invoice based on the provided form data.
 *
 * @param formData - The form data containing the invoice details.
 * @returns A Promise that resolves when the invoice is created.
 */
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    console.log('validatedFields: ', validatedFields);
    // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = validatedFields.data.amount * 100;
    console.log('amountInCents: ', amountInCents);
    const date = new  Date().toISOString().split('T')[0];

    const rawFormData2 = Object.fromEntries(formData.entries());
    
    // View in console
    console.log('customerId: ', validatedFields.data.customerId);
    console.log('amount: ', validatedFields.data.amount);
    console.log('status: ', validatedFields.data.status);
    console.log('amountInCents: ', amountInCents);
    console.log('date: ', date);
    console.log('Raw form data: ', formData);
    console.log('Type of customerId: ', typeof validatedFields.data.customerId);
    console.log('Type of amount: ', typeof validatedFields.data.amount);
    console.log('Type of status: ', typeof validatedFields.data.status);
    console.log('Raw form data 2: ', rawFormData2);
    try {
    await sql `
        INSERT INTO invoices(customer_id, amount, status, date)
        VALUES(${customerId}, ${amountInCents}, ${status}, ${date})
    `;
        } catch (error) {
        console.error('Database Error: Error creating invoice: ', error);
        return {
            message: 'Database Error: Error creating invoice',
        };
    }

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

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}
        WHERE id = ${id}
    `;
    } catch (error) {
        console.error('Database Error: Error updating invoice: ', error);
        return {
            message: 'Database Error: Error updating invoice',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    try {
        await sql`
        DELETE FROM invoices
        WHERE id = ${id}
    `;
    } catch (error) {
        console.error('Database Error: Failed to delete invoice: ', error);
        return {
            message: 'Database Error: Failed to delete invoice',
        };
    }
    revalidatePath('/dashboard/invoices');
}