export interface AuthResponse {
    success : boolean;
    token : string;
    userId : string;
    name : string;
    email : string;
    role : string;
}