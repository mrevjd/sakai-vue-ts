import type { Customer, CustomerFilterField, CustomerParams } from './types';

export const CustomerService = {
    getData(): Customer[] {
        return [
            {
                id: 1000,
                name: 'James Butt',
                country: {
                    name: 'Algeria',
                    code: 'dz'
                },
                company: 'Benton, John B Jr',
                date: '2015-09-13',
                status: 'unqualified',
                verified: true,
                activity: 17,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 70663
            }
            // ... existing code ...
        ];
    },

    getCustomersSmall(): Promise<Customer[]> {
        return Promise.resolve(this.getData().slice(0, 10));
    },

    getCustomersMedium(): Promise<Customer[]> {
        return Promise.resolve(this.getData().slice(0, 50));
    },

    getCustomersLarge(): Promise<Customer[]> {
        return Promise.resolve(this.getData().slice(0, 200));
    },

    getCustomersXLarge(): Promise<Customer[]> {
        return Promise.resolve(this.getData());
    },

    getCustomers(params: CustomerParams): Promise<Customer[]> {
        const queryParams = params || {};
        let customers = [...this.getData()];

        if (queryParams.filters) {
            const filterKeys = Object.keys(queryParams.filters) as CustomerFilterField[];
            const filterKey = filterKeys[0];
            const value = queryParams.filters[filterKey];

            if (value && value.length) {
                customers = customers.filter((customer) => {
                    const field = String(customer[filterKey]).toLowerCase();
                    return field.includes(value.toLowerCase());
                });
            }
        }

        if (queryParams.sortField) {
            customers.sort((a, b) => {
                const value1 = a[queryParams.sortField!];
                const value2 = b[queryParams.sortField!];
                const result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                return queryParams.sortOrder! * result;
            });
        }

        return Promise.resolve(customers);
    }
};
