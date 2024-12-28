import type { Product } from './types';

export const ProductService = {
    getProductsData(): Product[] {
        return [
            {
                id: '1000',
                code: 'f230fh0g3',
                name: 'Bamboo Watch',
                description: 'Product Description',
                image: 'bamboo-watch.jpg',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                inventoryStatus: 'INSTOCK',
                rating: 5
            }
            // ... existing code ...
        ];
    },

    getProductsWithOrdersData(): Product[] {
        return [
            {
                id: '1000',
                code: 'f230fh0g3',
                name: 'Bamboo Watch',
                description: 'Product Description',
                image: 'bamboo-watch.jpg',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1000-0',
                        productCode: 'f230fh0g3',
                        date: '2020-09-13',
                        amount: 65,
                        quantity: 1,
                        customer: 'David James',
                        status: 'PENDING'
                    }
                ]
            }
            // ... existing code ...
        ];
    },

    getProductsMini(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    },

    getProductsSmall(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    },

    getProducts(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData());
    },

    getProductsWithOrdersSmall(): Promise<Product[]> {
        return Promise.resolve(this.getProductsWithOrdersData().slice(0, 10));
    },

    getProductsWithOrders(): Promise<Product[]> {
        return Promise.resolve(this.getProductsWithOrdersData());
    }
};
