export type IBusiness_locationAddress = {
    division?: string;
    district?: string;
    thana?: string;
    zip_code?: string;
    local_address: string;
};

export type Location = {
    latitude: number;
    longitude: number;
};

export type IBusiness_location = {
    _id: string;
    name: string;
    slug: string;
    type: 'OUTLET' | 'WAREHOUSE';
    address: IBusiness_locationAddress;
    location?: Location;
    manager_name?: string;
    contact_numbers?: string[];
};
