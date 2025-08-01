export interface Result<T> {
    success : boolean;
    value : T;
    errors : string[];
}