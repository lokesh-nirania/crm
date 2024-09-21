import User from "./user";

export default interface LoginResponse {
    token: string;
    message: string;
    error: string;
    user: User;
}

export default interface PingResponse {
    message: string
}