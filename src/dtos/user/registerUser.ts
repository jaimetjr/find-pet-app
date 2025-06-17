export interface RegisterUserDTO {
    name : string;
    email : string;
    phone : string;
    password : string;
    confirmPassword : string;
    notifications : boolean;
    avatar? : string;
    location? : string;
    bio? : string;
    
}