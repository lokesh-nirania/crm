export default interface User {
    "ID": number,
    "CreatedAt": string,
    "UpdatedAt": string,
    "Username": string,
    "Email": string,
    "UserType": string,
    "Active": boolean
}

export interface UserResponse {
    status: string;
    users: User[];
}