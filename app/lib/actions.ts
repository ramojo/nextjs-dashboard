'use server';

export async function createInvoice(formData: FormData) {
    const rawFormData = {
        customerID: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };

    const rawFormData2 = Object.fromEntries(formData.entries());
    
    // View in console
    console.log('Raw form data: ', rawFormData);
    console.log('Raw form data 2: ', rawFormData2);
    
}