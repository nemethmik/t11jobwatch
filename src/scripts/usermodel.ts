
export interface IAPIResponse {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: IUserDetails[];
}

export interface IUserDetails {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string;
}
