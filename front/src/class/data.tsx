export enum Status {
    Unaccessed,
    Successed,
    Failed,
}

export type Data = {
    id: string
    status: Status
    url: string
}

export async function loadDataList(): Promise<Data[]> {
    const response = await fetch('/api/load/data');

    if (!response.ok) {
        return []
    }

    return await response.json();
}