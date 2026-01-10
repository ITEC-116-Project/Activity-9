export declare enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    address: string;
    created_at: Date;
}
