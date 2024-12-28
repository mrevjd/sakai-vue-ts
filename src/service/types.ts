export interface Product {
    id: string;
    code: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    quantity: number;
    inventoryStatus: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
    rating: number;
    orders?: ProductOrder[];
}

export interface ProductOrder {
    id: string;
    productCode: string;
    date: string;
    amount: number;
    quantity: number;
    customer: string;
    status: 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
}

export interface Photo {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
    title: string;
}

export interface TreeNode {
    key: string;
    label: string;
    data: string;
    icon: string;
    children?: TreeNode[];
}

export interface TreeTableNodeData {
    name: string;
    size: string;
    type: string;
}

export interface TreeTableNode {
    key: string;
    data: TreeTableNodeData;
    children?: TreeTableNode[];
}

export interface Country {
    name: string;
    code: string;
}

export interface Representative {
    name: string;
    image: string;
}

export interface Customer {
    id: number;
    name: string;
    country: Country;
    company: string;
    date: string;
    status: 'unqualified' | 'qualified' | 'new' | 'negotiation' | 'renewal';
    verified: boolean;
    activity: number;
    representative: Representative;
    balance: number;
    [key: string]: any;
}

export type CustomerFilterField = keyof Customer;

export interface CustomerParams {
    first?: number;
    rows?: number;
    sortField?: CustomerFilterField;
    sortOrder?: number;
    filters?: Partial<Record<CustomerFilterField, string>>;
}
